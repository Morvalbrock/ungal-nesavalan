# Ungal Nesavalan Base

Starter frontend for an e-commerce website with ~500+ products.

## Stack
- Next.js App Router
- TypeScript
- Zustand
- React Hook Form
- Zod
- API service layer

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Backend strategy

The frontend is intentionally decoupled from the backend. You can connect:

1. WooCommerce REST API
2. Custom Node.js/NestJS API + PostgreSQL/MySQL

Set `NEXT_PUBLIC_API_URL` in `.env.local`.

## Suggested next modules

- Authentication
- Product search/filter/sort
- Categories
- Persistent cart
- Wishlist
- Address management
- Checkout
- Razorpay/PayU integration
- Orders
- Admin dashboard
- SEO metadata and sitemap
