import type { Order } from "@/types/order";

const BRAND = "Ungal Nesavalan";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function shell(content: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${BRAND}</title></head>
<body style="margin:0;background:#f5eddc;font-family:Georgia,serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">
<div style="font-size:22px;font-weight:700;letter-spacing:2px;color:#7a1f2b;">${BRAND}</div>
<hr style="border:0;border-top:1px solid #d9c9a9;margin:24px 0;" />
${content}
<hr style="border:0;border-top:1px solid #d9c9a9;margin:32px 0;" />
<p style="font-size:12px;color:#8a7a5c;margin:4px 0;">Support: <a href="mailto:ungalnesavalan01@gmail.com" style="color:#7a1f2b;text-decoration:none;">ungalnesavalan01@gmail.com</a> · WhatsApp/Phone: <a href="tel:+918825810897" style="color:#7a1f2b;text-decoration:none;">+91 88258 10897</a></p>
<p style="font-size:12px;color:#8a7a5c;margin:4px 0;">You're receiving this from ${SITE_URL}.</p>
</div></body></html>`;
}

function inr(paise: number) {
  return `INR ${(paise / 100).toLocaleString("en-IN")}`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) => `<tr>
<td style="padding:8px 0;">${i.productNameSnapshot}<br><span style="color:#888;font-size:12px;">${i.variantLabelSnapshot}</span></td>
<td style="padding:8px 0;text-align:right;">Qty ${i.quantity}</td>
<td style="padding:8px 0;text-align:right;">${inr(i.unitPricePaise * i.quantity)}</td>
</tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}
<tr><td colspan="3"><hr style="border:0;border-top:1px solid #d9c9a9;margin:12px 0;"/></td></tr>
${order.discountPaise > 0 ? `<tr><td colspan="2" style="text-align:right;color:#7a1f2b;">Coupon ${order.couponSnapshot?.code ?? ""}</td><td style="text-align:right;color:#7a1f2b;">−${inr(order.discountPaise)}</td></tr>` : ""}
<tr><td colspan="2" style="text-align:right;">Subtotal</td><td style="text-align:right;">${inr(order.subtotalPaise)}</td></tr>
<tr><td colspan="2" style="text-align:right;">Shipping</td><td style="text-align:right;">${order.shippingPaise === 0 ? "Free" : inr(order.shippingPaise)}</td></tr>
<tr><td colspan="2" style="text-align:right;font-weight:700;">Total</td><td style="text-align:right;font-weight:700;">${inr(order.totalPaise)}</td></tr>
</table>`;
}

export function orderConfirmationEmail(order: Order, customerName: string) {
  const addr = order.addressSnapshot;
  const addressText = `${escapeHtml(addr.fullName)}, ${escapeHtml(addr.line1)}${addr.line2 ? `, ${escapeHtml(addr.line2)}` : ""}, ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} - ${escapeHtml(addr.pincode)}`;

  const html = shell(`
<p style="font-size:20px;">Thank you for your order, ${escapeHtml(customerName)}.</p>
<p>Order <strong>${order.orderNumber}</strong> has been received — we will carefully inspect and package your saree, and write to you again as soon as it ships.</p>

<div style="background:#fdfcf9;border:1px solid #d9c9a9;border-radius:8px;padding:14px;margin:20px 0;font-size:13px;line-height:1.6;">
  <p style="margin:0 0 4px 0;font-weight:bold;color:#7a1f2b;">Delivery Address:</p>
  <p style="margin:0;color:#444;">${addressText}</p>
  <p style="margin:4px 0 0 0;color:#666;">Phone: ${escapeHtml(addr.phone)}</p>
</div>

${itemsTable(order)}

<p style="margin-top:24px;">
<a href="${SITE_URL}/account/orders/${order.id}" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">View order</a>
</p>

<div style="margin-top:24px;padding:14px;background:#e8dcc0;border-radius:8px;font-size:13px;">
  <strong>Need help or have questions?</strong><br />
  Reach us at <a href="mailto:ungalnesavalan01@gmail.com" style="color:#7a1f2b;font-weight:bold;">ungalnesavalan01@gmail.com</a> or WhatsApp/Call <a href="tel:+918825810897" style="color:#7a1f2b;font-weight:bold;">+91 88258 10897</a>.
</div>`);
  return { subject: `Order confirmed — ${order.orderNumber}`, html };
}

export function adminNewOrderEmail(
  order: Order,
  customer: { name?: string; email?: string; phone?: string }
) {
  const customerName = escapeHtml(customer.name || order.addressSnapshot.fullName || "Customer");
  const customerEmail = escapeHtml(customer.email || "—");
  const customerPhone = escapeHtml(customer.phone || order.addressSnapshot.phone || "—");
  const addr = order.addressSnapshot;
  const addressHtml = `
    <strong>${escapeHtml(addr.fullName)}</strong><br />
    ${escapeHtml(addr.line1)}${addr.line2 ? `, ${escapeHtml(addr.line2)}` : ""}<br />
    ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} - ${escapeHtml(addr.pincode)}<br />
    ${escapeHtml(addr.country ?? "India")}<br />
    <strong>Phone:</strong> ${escapeHtml(addr.phone)}
  `;

  const html = shell(`
<div style="background:#7a1f2b;color:#f5eddc;padding:12px 16px;border-radius:6px;font-size:14px;font-weight:bold;margin-bottom:20px;text-align:center;letter-spacing:1px;">
  ★ NEW ORDER RECEIVED ★
</div>

<p style="font-size:18px;margin-bottom:8px;">A new order <strong>#${order.orderNumber}</strong> has been placed!</p>
<p style="color:#666;font-size:13px;margin-top:0;">Payment Mode: <strong>${(order.paymentMode ?? "prepaid").toUpperCase()}</strong> · Status: <strong>${order.status.toUpperCase()}</strong></p>

<div style="background:#fff;border:1px solid #d9c9a9;border-radius:8px;padding:16px;margin:20px 0;font-size:13px;line-height:1.6;">
  <p style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#7a1f2b;text-transform:uppercase;letter-spacing:0.5px;">Customer Details</p>
  <table style="width:100%;font-size:13px;">
    <tr><td style="color:#666;width:120px;padding:3px 0;">Name:</td><td><strong>${customerName}</strong></td></tr>
    <tr><td style="color:#666;padding:3px 0;">Email:</td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
    <tr><td style="color:#666;padding:3px 0;">Phone:</td><td><a href="tel:${customerPhone}">${customerPhone}</a></td></tr>
  </table>
  <hr style="border:0;border-top:1px solid #eee;margin:12px 0;" />
  <p style="margin:0 0 6px 0;font-size:14px;font-weight:bold;color:#7a1f2b;text-transform:uppercase;letter-spacing:0.5px;">Shipping Address</p>
  <div style="color:#333;">${addressHtml}</div>
  ${order.notes ? `<p style="margin:10px 0 0 0;color:#555;"><strong>Delivery notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}
  ${order.preferredCourier ? `<p style="margin:4px 0 0 0;color:#555;"><strong>Preferred courier:</strong> ${escapeHtml(order.preferredCourier)}</p>` : ""}
</div>

<p style="font-size:15px;font-weight:bold;margin-top:24px;margin-bottom:8px;">Items Ordered</p>
${itemsTable(order)}

<div style="margin-top:28px;text-align:center;">
  <a href="${SITE_URL}/admin/orders/${order.id}" style="display:inline-block;background:#7a1f2b;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">View Order in Admin Panel</a>
</div>`);

  return {
    subject: `New Order #${order.orderNumber} placed by ${customerName} (₹${(order.totalPaise / 100).toLocaleString("en-IN")})`,
    html
  };
}

export function shippedEmail(
  order: Order,
  tracking?: { trackingId?: string; courier?: string }
) {
  const trackingId = tracking?.trackingId?.trim();
  const courier = tracking?.courier?.trim();
  const trackingLine =
    trackingId || courier
      ? `<p>Tracking: <strong>${escapeHtml(trackingId ?? "—")}</strong>${courier ? ` via ${escapeHtml(courier)}` : ""}</p>`
      : "";
  const codLine =
    order.paymentMode === "cod" && (order.amountDuePaise ?? 0) > 0
      ? `<p style="padding:10px 12px;background:#e8dcc0;border-radius:8px;">Please have <strong>${inr(order.amountDuePaise ?? 0)}</strong> ready in cash for the delivery agent.</p>`
      : "";
  const html = shell(`
<p style="font-size:20px;">Your saree is on the way</p>
<p>Order <strong>${order.orderNumber}</strong> has shipped.</p>
${trackingLine}
${codLine}
<p style="margin-top:24px;">
<a href="${SITE_URL}/account/orders/${order.id}" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">Track order</a>
</p>`);
  return { subject: `Shipped — ${order.orderNumber}`, html };
}

export function deliveredEmail(order: Order) {
  const html = shell(`
<p style="font-size:20px;">Your saree has arrived</p>
<p>We hope order <strong>${order.orderNumber}</strong> feels every bit as good as it looked.</p>
<p>If you have a minute, we'd love your review:</p>
<p><a href="${SITE_URL}/account/orders/${order.id}" style="display:inline-block;background:#7a1f2b;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">Write a review</a></p>`);
  return { subject: `Delivered — ${order.orderNumber}`, html };
}

export function abandonedCartEmail({
  customerName,
  items,
  couponCode
}: {
  customerName: string;
  items: { name: string; variantLabel: string; quantity: number; unitPricePaise: number }[];
  couponCode?: string;
}) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;">${escapeHtml(i.name)}<br><span style="color:#888;font-size:12px;">${escapeHtml(i.variantLabel)} · Qty ${i.quantity}</span></td><td style="padding:8px 0;text-align:right;">${inr(i.unitPricePaise * i.quantity)}</td></tr>`
    )
    .join("");
  const html = shell(`
<p style="font-size:20px;">${escapeHtml(customerName)}, your bag is waiting</p>
<p>The sarees you were looking at are still available.</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
${couponCode ? `<p style="margin-top:20px;padding:12px;background:#e8dcc0;border-radius:8px;">Here's <strong>${couponCode}</strong> — 10% off if you complete your order.</p>` : ""}
<p style="margin-top:24px;">
<a href="${SITE_URL}/cart" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">Return to bag</a>
</p>`);
  return { subject: "Your bag is still waiting at Ungal Nesavalan", html };
}

export function newsletterWelcomeEmail() {
  const html = shell(`
<p style="font-size:20px;">Welcome to the loom notes</p>
<p>Thank you for signing up. Once a fortnight we send:</p>
<ul>
<li>New weaves, before they land on the site.</li>
<li>Care tips for the season.</li>
<li>Stories from the weaving clusters we buy from.</li>
</ul>
<p>No spam. Unsubscribe anytime with the link at the foot of every letter.</p>
<p style="margin-top:24px;">
<a href="${SITE_URL}/products" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">Browse sarees</a>
</p>`);
  return { subject: "Welcome to Ungal Nesavalan", html };
}

export function returnDecisionEmail({
  customerName,
  orderNumber,
  decision,
  note,
  refundId
}: {
  customerName: string;
  orderNumber: string;
  decision: "approved" | "rejected";
  note?: string;
  refundId?: string;
}) {
  const title = decision === "approved" ? "Your return is approved" : "Your return request";
  const body = decision === "approved"
    ? `<p>We've approved the return on order <strong>${orderNumber}</strong>. Your refund is being processed${refundId ? ` (Ref: ${refundId})` : ""}.</p>`
    : `<p>We couldn't approve the return on order <strong>${orderNumber}</strong> at this time.</p>`;
  const html = shell(`
<p style="font-size:20px;">${title}</p>
<p>Hi ${escapeHtml(customerName)},</p>
${body}
${note ? `<p style="color:#666;">Note from our team: ${escapeHtml(note)}</p>` : ""}`);
  return { subject: `${title} — ${orderNumber}`, html };
}

export function passwordResetEmail({
  customerName,
  resetUrl,
  expiresInMinutes
}: {
  customerName: string;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  const html = shell(`
<p style="font-size:20px;">Reset your ${BRAND} password</p>
<p>Hi ${escapeHtml(customerName)},</p>
<p>We received a request to reset your password. Click the button below to choose a new one. This link expires in ${expiresInMinutes} minutes.</p>
<p style="margin:24px 0;">
<a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:12px 22px;text-decoration:none;border-radius:8px;">Reset password</a>
</p>
<p style="font-size:12px;color:#8a7a5c;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
<p style="font-size:12px;color:#8a7a5c;">Or paste this link into your browser:<br><span style="word-break:break-all;">${resetUrl}</span></p>`);
  return { subject: `Reset your ${BRAND} password`, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
