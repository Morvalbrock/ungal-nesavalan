# Deployment Guide

The app is a Next.js 15 App Router build. It ships with a JSON-file backend that works locally out of the box. **For production you must swap in a real database** — the JSON files live under `data/` and won't survive a serverless deploy.

## Required environment variables

Set these in your hosting platform's env config (Vercel, Railway, etc.) or in `.env.local` for self-hosted:

| Name | Required | Notes |
|---|---|---|
| `AUTH_SECRET` | yes | Long random string (48+ bytes). Generate: `[Convert]::ToBase64String((1..48 \| %{ Get-Random -Maximum 256 }))` in PowerShell, or `openssl rand -base64 48` |
| `NEXT_PUBLIC_SITE_URL` | yes | Public origin, e.g. `https://ungalnesavalan.com`. Used for OG tags + sitemap. |
| `NEXT_PUBLIC_API_URL` | no | Leave blank for same-origin API. Set if your API is on a different host. |
| `RAZORPAY_KEY_ID` | for payments | `rzp_test_*` in dev, `rzp_live_*` in production |
| `RAZORPAY_KEY_SECRET` | for payments | Never expose client-side |
| `RAZORPAY_WEBHOOK_SECRET` | for payments | Only needs to match what you set in the Razorpay dashboard |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | for payments | Same as `RAZORPAY_KEY_ID`; needed on the client to open the checkout modal |

When `RAZORPAY_KEY_ID` is unset, checkout runs in **simulate mode** — it creates real orders in your DB but skips the payment gateway. Useful for demos; unsafe for production.

## Swapping the backend for production

The JSON-file repositories under `src/server/repositories/` implement typed interfaces. Swap any one by writing a new implementation and re-exporting it from `src/server/repositories/index.ts`.

Suggested swap paths, ordered by effort:

- **Supabase** — replace `readCollection`/`mutateCollection` calls with `supabase.from('table').select()`/`.upsert()`/`.delete()`. Auth can move to Supabase Auth (swap `jwt-auth.provider.ts` for a Supabase impl and keep the same `AuthProvider` interface). Middleware needs to swap `jose` verify for Supabase session verify, but the matcher stays the same.
- **Custom Node API** — build a separate service, then keep this app but replace repo impls with `fetch()` to that API. `src/services/api/client.ts` already handles `NEXT_PUBLIC_API_URL`.
- **Headless WooCommerce** — replace product/category/order repos with Woo REST calls. Keep user auth local via JWT.

The UI code does not need to change for any of the above — that's the whole point of the repository abstraction.

## Deployment target: Vercel (recommended)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set env vars above.
4. Deploy. First deploy on Vercel runs `npm run build`.

**Vercel caveats**:
- File system is read-only at runtime. The JSON-file repos will **fail on any write**. You must swap to a hosted DB before going live.
- Serverless functions are stateless. Session cookies (JWT) work; the in-memory mutex in `json-store.ts` doesn't survive between requests. Use a real DB with transactions.
- `next/image` optimizer uses Vercel's image CDN automatically. Ensure `next.config.ts` `remotePatterns` covers your image hosts.

## Deployment target: Self-hosted (VPS + Docker)

Sample `Dockerfile` (not committed — copy to project root when needed):

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

Put behind nginx/caddy for TLS and rate-limiting. Mount a persistent volume at `/app/data` if you plan to keep using JSON-file repos.

## Post-deploy checklist

- `curl -I https://<domain>/` returns 200
- `https://<domain>/sitemap.xml` lists all published products
- `https://<domain>/robots.txt` disallows `/admin`, `/api`, `/account`
- Register a test account → `/api/auth/me` returns the user
- Buy a real product with Razorpay test keys → order appears in `/account/orders` and `/admin/orders`
- Webhook endpoint reachable at `https://<domain>/api/webhooks/razorpay` (register it in the Razorpay dashboard)

## SEO + performance

- `metadataBase` is set from `NEXT_PUBLIC_SITE_URL` — verify that env var before any launch.
- `next/image` serves AVIF/WebP automatically; keep source images ≥ 900x1200 for retina.
- Fonts use `next/font` (Fraunces + Inter) → self-hosted, no CLS.
- Lighthouse target: 90+ mobile on the PDP. Run with `npx unlighthouse --site https://<domain>` for the whole catalog.
