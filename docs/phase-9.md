# Phase 9 — Growth / marketing

Assumes Phase 8 is shipped (needs coupons for referrals and abandoned-cart trigger for the recovery email). Focus shifts from feature parity to acquisition, retention, and conversion.

## Success criteria (across the whole phase)
- PDPs have valid `Product` + `BreadcrumbList` JSON-LD and per-product OG images.
- Every business event (view → add → checkout → purchase) shows up in Plausible with product/coupon breakdowns.
- Order confirmation, shipping, delivery, password reset, and abandoned-cart emails all land in inbox (test provider + real).
- Blog is live under `/journal` with at least one MDX post; posts can cross-link to products.
- App installable as PWA on Android/iOS with an offline-browsable last-visited PDP.
- Tamil translation covers the checkout + nav paths.

## Explicitly still deferred
Auto-translation of product copy (author enters per language), push notifications, affiliate program, price-drop alerts.

---

## 9.1 SEO deep-dive

**Structured data**
- Add `JsonLd` component that stringifies to a `<script type="application/ld+json">`. Server-render only.
- `Product` schema on PDP: `name`, `image`, `description`, `brand: 'Ungal Nesavalan'`, `offers` (price, availability, itemCondition), aggregateRating (once 8.2 reviews exist).
- `BreadcrumbList` schema on category + PDP.
- `Organization` schema in `src/app/layout.tsx`.

**Per-product OG images**
- Route `/api/og/products/[slug]/route.ts` using `next/og`'s `ImageResponse`. Layout: primary image left, product name + price right on a cream background with the brand logo.
- Update PDP `generateMetadata` to point `openGraph.images` at this URL.

**Canonical + hreflang**
- Add `alternates.canonical` to every route (many already missing).
- `alternates.languages: { 'en-IN': ..., 'ta-IN': ... }` on all routes (works with 9.6 i18n).

**Verify:** Google Rich Results Test passes for a PDP URL. Facebook debugger renders the per-product OG card. `next build` prints `<Route> ... static` for cacheable pages.

---

## 9.2 Analytics

**Provider:** Plausible self-hosted or hosted (`plausible.io/js/script.tagged-events.js`). Cookie-free — no banner needed for GDPR/DPDPA.

**Wiring**
- `<PlausibleScript>` client component in `src/app/layout.tsx`, gated behind `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- Typed helpers in `src/features/analytics/track.ts`:
  - `trackAddToCart({ productId, variantId, priceInr })`
  - `trackBeginCheckout({ subtotalInr, itemCount })`
  - `trackApplyCoupon({ code, discountInr })`
  - `trackPurchase({ orderId, revenueInr, couponCode? })`
- Call sites: `PurchasePanel` (add-to-cart), `CheckoutFlow` (begin-checkout), coupon `apply` action (8.3), success page (purchase).

**Verify:** Plausible dashboard shows funnel (view → add → checkout → purchase) with sane numbers after clicking through a test purchase.

---

## 9.3 Email pipeline

**Provider:** Resend (simplest DX; Postmark is fine too). Behind a `MailProvider` interface so the swap mirrors `PaymentProvider`.

**Interface**
```ts
interface MailProvider {
  send(input: { to: string; subject: string; react: React.ReactElement; tags?: Record<string, string> }): Promise<{ id: string }>;
}
```

**Templates** — React Email (`@react-email/components`), rendered server-side:
- `OrderConfirmationEmail` — triggered from the Razorpay webhook after status flips to `paid`.
- `ShippingNotificationEmail` — triggered when admin sets order to `shipped` (attach tracking number field to `Order`).
- `DeliveredEmail` — triggered on `delivered`, includes review CTA (deep link to PDP).
- `AbandonedCartRecoveryEmail` — nightly cron reads snapshots from 8.6 older than 24h with `notifiedAt = null`, sends, sets `notifiedAt`. Include a coupon code (from 8.3) for 10% off.
- `PasswordResetEmail` — currently 4-digit forgot-password is a stub; wire it here.
- `ReturnDecisionEmail` — from 8.7 admin decision.

**Cron**
- Vercel Cron (or `node-cron` if self-hosted) hits `/api/cron/abandoned-carts` daily at 10:00 IST. Route is gated by `CRON_SECRET` header.

**Verify:** Complete a paid order → confirmation lands in inbox with correct totals and items. Trigger a manual abandoned-cart snapshot → cron run sends recovery email with a working coupon.

---

## 9.4 Blog / MDX

**Setup:** Plain MDX via `next-mdx-remote` or Next's built-in `.mdx` route support; no external CMS. Posts live in `content/journal/*.mdx` with frontmatter (`title`, `slug`, `excerpt`, `heroImage`, `publishedAt`, `tags`, `relatedProductSlugs?`).

**Routes**
- `/journal` — index (paginated by 10, newest first, filter by tag).
- `/journal/[slug]` — post.
- `sitemap.ts` already exists (Phase 7) — extend to include posts.

**Cross-linking**
- In MDX, `<ProductCard slug="..." />` renders inline — imports the storefront card component. Reuses styling.
- On each PDP, if any published post has this product's slug in `relatedProductSlugs`, show a "Read the story" strip.

**Extras**
- RSS feed at `/journal/rss.xml`.
- Draft mode via a `preview` cookie (Next's built-in) — admins see unpublished posts.

**Verify:** Ship one launch post ("Why Kanjivaram silks are woven on pit looms") → visible at `/journal` → SEO metadata + `Article` JSON-LD → RSS validates in a feed reader.

---

## 9.5 PWA

**Package:** `@ducanh2912/next-pwa` (actively maintained; `next-pwa` is stale for App Router).

**Wiring**
- `manifest.json` at `public/manifest.json` — name, short_name, icons (192, 512, maskable), theme_color = cream, background_color = cream, `display: 'standalone'`.
- Configure `next-pwa` runtime caching:
  - `NetworkFirst` for `/api/*` (fresh product data preferred).
  - `CacheFirst` with 30d expiry for `/_next/image` and `/products/*` (static images).
  - `StaleWhileRevalidate` for storefront HTML routes.
- Add `viewport` + `themeColor` metadata in `src/app/layout.tsx`.

**Install prompt**
- Custom install button in the header (`beforeinstallprompt` event) — dismissible, remembered in localStorage.

**Verify:** Chrome DevTools → Application → Manifest is valid. Lighthouse PWA audit ≥ 90. Kill network → last-visited PDP still renders from cache.

---

## 9.6 i18n (Tamil + English)

**Package:** `next-intl` (best App Router support today).

**Setup**
- `src/i18n/messages/{en,ta}.json` — nav, buttons, checkout labels, order-status names, error messages, email templates.
- Middleware detects locale from `Accept-Language` (default `en-IN`) or explicit URL segment (`/ta/products/...`).
- Language switcher in header — persists choice in `NEXT_LOCALE` cookie.
- Product name/description stay author-provided — extend `Product` with `nameTa?` and `descriptionTa?`, admin form shows both fields, PDP falls back to English if Tamil is empty.

**Verify:** `/ta` shows Tamil nav + checkout. Product with `nameTa` set shows Tamil on `/ta/products/[slug]`. Falls back to English otherwise. Google indexes both locales.

---

## 9.7 Referral / share

**WhatsApp share (no backend needed)**
- "Share on WhatsApp" button on PDP → `https://wa.me/?text=<pre-filled with product name + URL>`.
- On PDP metadata add explicit OG for WhatsApp preview (uses the same 9.1 OG image).

**Post-purchase referral**
- On `/checkout/success/[orderId]`, generate a coupon (reuses 8.3 `Coupon` model) with the user's own code (e.g. `PRIYA-8FQ2`, 10% off, single-use).
- Show a "Share ₹500 off with friends" card with a WhatsApp share button pre-filled with the code + storefront URL.
- Track redemptions to attribute (add `referrerUserId?` to `CouponRedemption` — set when the coupon was generated as a referral).

**Verify:** Complete a purchase → referral card appears → tap share → WhatsApp opens with pre-filled message → friend uses code → discount applied → admin can see attribution in coupon detail.

---

## Dependencies to install
`@react-email/components`, `resend` (or `postmark`), `next-intl`, `@ducanh2912/next-pwa`, `next-mdx-remote`.

## Env vars added
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `RESEND_API_KEY` (or `POSTMARK_TOKEN`)
- `MAIL_FROM` (e.g. `orders@ungalnesavalan.com`)
- `CRON_SECRET`

## Success benchmarks
- Lighthouse: SEO ≥ 95, PWA ≥ 90, Performance ≥ 90 mobile on PDP.
- Emails delivered: ≥ 98% (Resend/Postmark dashboard).
- Analytics funnel: view→add ≥ 8%, add→checkout ≥ 40%, checkout→purchase ≥ 60% (industry benchmark, adjust after 30d of real data).

## Ordering caveat
9.1 and 9.2 are independent and cheap — ship them first as a "SEO + measurement" mini-release. 9.3 unlocks 8.6 (abandoned-cart email), so land it before shouting about growth features. 9.4–9.7 can be done in any order once 9.3 is live.
