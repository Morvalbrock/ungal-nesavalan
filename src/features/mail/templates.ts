import type { Order } from "@/types/order";

const BRAND = "Ungal Nesavalan";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function shell(content: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${BRAND}</title></head>
<body style="margin:0;background:#f5eddc;font-family:Georgia,serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">
<div style="font-size:22px;font-weight:700;letter-spacing:2px;">${BRAND}</div>
<hr style="border:0;border-top:1px solid #d9c9a9;margin:24px 0;" />
${content}
<hr style="border:0;border-top:1px solid #d9c9a9;margin:32px 0;" />
<p style="font-size:12px;color:#8a7a5c;">You're receiving this because you have an account at ${SITE_URL}.</p>
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
  const html = shell(`
<p style="font-size:20px;">Thank you for your order, ${escapeHtml(customerName)}.</p>
<p>Order <strong>${order.orderNumber}</strong> — we'll write again when it ships.</p>
${itemsTable(order)}
<p style="margin-top:24px;">
<a href="${SITE_URL}/account/orders/${order.id}" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">View order</a>
</p>`);
  return { subject: `Order confirmed — ${order.orderNumber}`, html };
}

export function shippedEmail(order: Order, tracking?: string) {
  const html = shell(`
<p style="font-size:20px;">Your saree is on the way</p>
<p>Order <strong>${order.orderNumber}</strong> has shipped.</p>
${tracking ? `<p>Tracking: <a href="${tracking}">${tracking}</a></p>` : ""}
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

export function passwordResetEmail({ customerName, resetUrl }: { customerName: string; resetUrl: string }) {
  const html = shell(`
<p style="font-size:20px;">Reset your password</p>
<p>Hi ${escapeHtml(customerName)}, click the button below to reset your password. The link expires in 60 minutes.</p>
<p><a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#f5eddc;padding:10px 18px;text-decoration:none;border-radius:8px;">Reset password</a></p>
<p style="color:#888;font-size:12px;">If you didn't ask for this, you can ignore the email.</p>`);
  return { subject: "Reset your Ungal Nesavalan password", html };
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
