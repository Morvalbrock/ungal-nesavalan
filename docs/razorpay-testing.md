# Razorpay integration + testing

The app ships with a `PaymentProvider` abstraction (`src/features/payments/`). Two implementations exist:

- `razorpay.provider.ts` — the real gateway. Activates when both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set.
- `simulate.provider.ts` — dev fallback. Activates automatically when Razorpay keys are missing. Auto-confirms payments so you can build/test checkout without a Razorpay account.

## Get test keys

1. Sign up at https://dashboard.razorpay.com/
2. Toggle to **Test Mode** (top-right).
3. **Settings → API Keys → Generate Test Key**.
4. Copy Key ID and Key Secret.

## Configure `.env.local`

```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
RAZORPAY_WEBHOOK_SECRET=set-any-string-here-and-mirror-in-dashboard
```

Restart `npm run dev` after editing `.env.local`.

## End-to-end test with real Razorpay (test mode)

1. Sign in → add a saree to cart → `/checkout`
2. Fill the shipping form → Continue → Review
3. Click **Pay ₹X** → real Razorpay modal opens
4. Pick **Card** and use one of these test cards:
   - Success: `4111 1111 1111 1111`
   - International Success: `5104 0600 0000 0008`
   - Failure: `4000 0000 0000 0002`
   - CVV: any 3 digits, Expiry: any future date, Name: anything
5. Or pick **UPI** and use `success@razorpay` (auto-succeeds) or `failure@razorpay`
6. On success → app redirects to `/checkout/success/[orderId]`
7. The order shows in `/account/orders` and `/admin/orders`

Full test card list: https://razorpay.com/docs/payments/payments/test-card-details/

## Webhook testing

Razorpay webhooks send `POST` to `/api/webhooks/razorpay` with an `x-razorpay-signature` header. The signature is `HMAC-SHA256(rawBody, webhook_secret)`.

### Local testing with ngrok

```powershell
# in a separate terminal
ngrok http 3000
# note the https URL, e.g. https://abcd1234.ngrok-free.app
```

Then in the Razorpay dashboard:

1. **Settings → Webhooks → Add New Webhook**
2. URL: `https://abcd1234.ngrok-free.app/api/webhooks/razorpay`
3. Secret: paste the same value you set as `RAZORPAY_WEBHOOK_SECRET`
4. Events to subscribe: `payment.captured`, `payment.failed`
5. **Save**

Send a test event from the dashboard: Settings → Webhooks → the webhook → **Test Webhook**. Your server should return `200 {ok:true}` on a valid event or `400 invalid_signature` if the secret is off.

### Verifying webhook signature manually

```powershell
$body = '{"event":"payment.captured","payload":{"payment":{"entity":{"order_id":"order_test","id":"pay_test","status":"captured"}}}}'
$secret = "your-webhook-secret"
$hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($secret))
$sig = [BitConverter]::ToString($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))).Replace("-","").ToLower()
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/webhooks/razorpay -Body $body -ContentType application/json -Headers @{ "x-razorpay-signature" = $sig }
```

## Simulate mode notes

When Razorpay keys are absent, the app runs in simulate mode. Behavior:

- `POST /api/checkout/create-order` returns `mode: "simulate"` and a fake `providerOrderId`.
- The `PayButton` component detects this and calls `confirm-payment` directly with signature `"simulated"`.
- Stock decrements, order flips to `paid`, redirect to success page — same UX as real Razorpay, no gateway calls.
- Webhook signature verification always **fails** in simulate mode — the endpoint returns 400 on any request. This is intentional; there's no real gateway to send webhooks.

Simulate mode is dev-only. Never ship simulate mode to production — it will accept any signed-in user's "payment" without money changing hands.
