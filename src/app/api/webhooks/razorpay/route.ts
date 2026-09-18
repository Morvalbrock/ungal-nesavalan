import { NextResponse } from "next/server";
import { orderRepo, paymentRepo, productRepo } from "@/server/repositories";
import { getPaymentProvider } from "@/features/payments";

export async function POST(req: Request) {
  // CRITICAL: read raw body BEFORE any JSON parse so the HMAC matches Razorpay's signing.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const provider = getPaymentProvider();
  if (!provider.verifyWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { order_id?: string; id?: string; status?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const providerOrderId = payment?.order_id;
  const providerPaymentId = payment?.id;
  if (!providerOrderId || !providerPaymentId) {
    return NextResponse.json({ ok: true, ignored: "no_payment_entity" });
  }

  const record = await paymentRepo.findByProviderOrderId(providerOrderId);
  if (!record) return NextResponse.json({ ok: true, ignored: "unknown_order" });

  const order = await orderRepo.findById(record.orderId);
  if (!order) return NextResponse.json({ ok: true, ignored: "unknown_order" });

  const captured = event.event === "payment.captured" || payment?.status === "captured";
  const failed = event.event === "payment.failed" || payment?.status === "failed";

  if (captured && order.status !== "paid") {
    await paymentRepo.updateStatus(record.id, {
      status: "captured",
      providerPaymentId,
      rawWebhookLog: rawBody
    });
    await orderRepo.updateStatus(order.id, "paid");
    await productRepo.adjustStock(
      order.items.map((i) => ({ productId: i.productId, variantId: i.variantId, delta: -i.quantity }))
    );
  } else if (failed) {
    await paymentRepo.updateStatus(record.id, {
      status: "failed",
      providerPaymentId,
      rawWebhookLog: rawBody
    });
  }

  return NextResponse.json({ ok: true });
}
