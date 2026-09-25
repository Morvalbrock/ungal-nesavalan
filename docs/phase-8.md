# Phase 8 — Customer-facing features

Deferred storefront items from the original plan. Each is a self-contained deliverable; ship them in order because later items compose on earlier ones (coupons feed abandoned-cart recovery, PDF invoices need discount lines to already exist, returns depend on the order status machine).

## Success criteria (across the whole phase)
- Logged-in customer can save a saree to a wishlist, review a delivered order, apply a coupon at checkout, download an invoice PDF, and request a return.
- Guest cart survives login and merges with any existing server cart.
- Repos + routes stay behind the same interfaces so the backend swap (Supabase/etc.) still costs a single file per entity.

## Explicitly still deferred
Multi-currency, gift wrap, product Q&A, wishlist sharing, shipping-rate calculator (uses a flat rate today), returns pickup scheduling. Bring them back when a real logistics partner is chosen.

---

## 8.1 Wishlist

**Data**
- `Wishlist` type: `{ id, userId, productId, variantId?, createdAt }`.
- `data/wishlists.json` + `wishlists.repository.ts` (`add`, `remove`, `list(userId)`).

**Routes**
- `GET /api/wishlist` — list current user's items.
- `POST /api/wishlist` — `{ productId, variantId? }` add.
- `DELETE /api/wishlist/[id]` — remove.

**UI**
- Heart icon on `ProductCard` + PDP. Toggling calls the API optimistically.
- Guest users get a localStorage-backed wishlist that merges on login (same handoff pattern as 8.5).
- `/account/wishlist` — grid of saved products with "move to cart" and "remove".

**Verify:** Add-to-wishlist as guest → login → item persists server-side → visible in `/account/wishlist` → remove → gone across devices.

---

## 8.2 Reviews + ratings

**Data**
- `Review` type: `{ id, productId, userId, orderId, rating (1–5), title, body, verified: true, createdAt }`.
- `verified` is always `true` in v1 because we only let users review products they've received (see gating).
- `reviews.repository.ts` (`create`, `list({ productId, page })`, `avgFor(productId)`).

**Gating**
- User can only POST a review for a product if `orderRepo.findByUserAndProduct(userId, productId)` returns an order with status `paid | shipped | delivered`. Enforce server-side; UI hides the form otherwise.

**Routes**
- `GET /api/products/[slug]/reviews?page=1` — paginated.
- `POST /api/products/[slug]/reviews` — rating + title + body.

**UI**
- Rating summary (avg + count) on `ProductCard` and PDP header.
- Review section on PDP: distribution histogram, list, "Write a review" (only if eligible), "Sort by helpful | newest".
- `[[wishlist]]` cross-reference: reviewed items can be re-added to wishlist from the review card.

**Verify:** Buy → order marked `delivered` → PDP shows "Write a review" → submit → visible + avg updates → non-buyer sees no form.

---

## 8.3 Coupons / discounts

**Data**
- `Coupon` type: `{ id, code (uppercase, unique), kind: 'percent' | 'fixed', value, minSubtotal, maxRedemptions, perUserLimit, expiresAt, active, createdAt }`.
- `CouponRedemption` type: `{ id, couponId, userId, orderId, amountAppliedPaise, createdAt }`.
- Repos: `coupons.repository.ts` + `coupon-redemptions.repository.ts`.

**Routes**
- `POST /api/checkout/apply-coupon` — `{ code, subtotalPaise, userId? }` → returns `{ discountPaise, reason? }`. Validates active, not expired, subtotal ≥ min, per-user + global caps.
- Admin CRUD under `/admin/coupons` (list, create, edit, deactivate — never hard-delete, redemptions reference it).

**Order model changes**
- Add `discountPaise: number` and `couponSnapshot?: { code, kind, value }` to `Order`.
- Snapshot protects history — same principle as `productNameSnapshot`.

**UI**
- Coupon input on `ReviewStep` — apply/remove, shows discount inline.
- Applied discount line in summary + PDF invoice (8.4).

**Verify:** Create `WEAVE10` (10% off, min ₹2,000, expires in 30d) in admin → apply on checkout → discount shows → place order → order detail shows coupon → try again with same user → per-user cap blocks it.

---

## 8.4 Invoice PDF

**Package:** `@react-pdf/renderer` (JSX, matches our React stack; skip `pdfkit`).

**Route**
- `GET /api/orders/[id]/invoice` — auth-gated (owner or admin only). Streams PDF with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="UN-<orderNumber>.pdf"`.

**Layout**
- Header: logo, "Tax Invoice", order number, date.
- Bill-to: `addressSnapshot`.
- Line items: `productNameSnapshot`, variant, qty, unit, line total.
- Totals: subtotal, discount (if any — from 8.3), shipping, tax, grand total.
- Footer: "Payment via Razorpay · Transaction <paymentId>".

**UI**
- "Download invoice" button on `/account/orders/[id]` (customer) and `/admin/orders/[id]` (admin).
- Only enabled for orders in `paid | packed | shipped | delivered | refunded` states.

**Verify:** Place paid order → download invoice → PDF renders totals correctly, shows discount if a coupon was used.

---

## 8.5 Guest → user cart merge

**Route**
- `POST /api/cart/merge` — `{ items: CartItem[] }`. Server-side cart repo is introduced here (`carts.repository.ts` → one cart per user, upserted).
- Merge rule: for each incoming item, if a matching `(productId, variantId)` exists, sum quantities capped at variant stock; else append.

**Client**
- On successful login/register, read `un-cart` from localStorage, POST it to `/api/cart/merge`, then clear localStorage and rehydrate the Zustand store from the server response.

**Verify:** Add 2 items as guest → login → server merges with any pre-existing user cart → localStorage cleared → cart shows merged items → open in a second browser signed into same account → same items appear.

---

## 8.6 Abandoned-cart snapshots

Phase 8 only writes snapshots and exposes them to admin. The recovery email itself is Phase 9 (needs the mail pipeline).

**Data**
- `AbandonedCart` type: `{ id, userId, email, items: CartItem[], subtotalPaise, createdAt, recoveredOrderId?, notifiedAt? }`.
- `abandoned-carts.repository.ts`.

**Trigger**
- When `/checkout` loads with a non-empty cart for a logged-in user AND no order is placed within N minutes (client fires POST on unload / after 10 min idle), snapshot the cart.
- Deduplicate: if an unrecovered snapshot exists for the user, update it instead of appending.

**Admin UI**
- `/admin/abandoned-carts` — list with user, email, subtotal, age. Bulk "mark recovered" (manual until 9.3 wires email).

**Verify:** Log in → add items → open `/checkout` → close tab → snapshot appears in admin.

---

## 8.7 Order tracking + returns

**Status machine addition**
- Add `return_requested` between `delivered` and `refunded`.
- Add `ReturnRequest` type: `{ id, orderId, userId, reason, note, requestedAt, decidedAt?, decision?: 'approved' | 'rejected', adminNote? }`.
- `return-requests.repository.ts`.

**Return window**
- Configurable in `/admin/settings` → `returnWindowDays` (default 7). Enforced server-side when creating a return.

**Routes**
- `POST /api/orders/[id]/return` — customer opens a request.
- `POST /api/admin/returns/[id]/decide` — admin approves (order → `refunded`, trigger Razorpay refund via `PaymentProvider.refund()` — add this method to the interface + implement in `razorpay.provider.ts`) or rejects.

**UI**
- "Request return" button on `/account/orders/[id]` if `delivered` and within window.
- `/admin/returns` — list, filter by status, decide.

**Verify:** Order marked `delivered` → customer requests return → admin approves → Razorpay refund fires (test mode) → order → `refunded` → customer order detail reflects it.

---

## Dependencies to install
`@react-pdf/renderer` (only — everything else is in-repo).

## Repo interfaces changed
- `PaymentProvider` gains `refund({ providerPaymentId, amountPaise, notes? })`.
- `OrderRepo` gains `findByUserAndProduct(userId, productId)` and `updateDiscount(orderId, patch)`.

## Migration risk
The `Order` model gains `discountPaise` + `couponSnapshot`. Read paths must default missing fields (existing orders have neither). Add a one-shot migration in `scripts/migrate-orders.mjs` that back-fills `discountPaise: 0`.
