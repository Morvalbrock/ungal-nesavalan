import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { orderRepo, paymentRepo, productRepo } from "@/server/repositories";
import { getPaymentProvider } from "@/features/payments";

const bodySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await orderRepo.findById(orderId);
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const payment = order.paymentId ? await paymentRepo.findById(order.paymentId) : null;
  if (!payment || payment.providerOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: "payment_mismatch" }, { status: 400 });
  }

  if (order.status === "paid" && payment.status === "captured") {
    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
  }

  const provider = getPaymentProvider();
  const ok = provider.verifyPaymentSignature({
    providerOrderId: razorpayOrderId,
    providerPaymentId: razorpayPaymentId,
    signature: razorpaySignature
  });
  if (!ok) {
    await paymentRepo.updateStatus(payment.id, { status: "failed", signature: razorpaySignature });
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (order.status !== "paid") {
    await paymentRepo.updateStatus(payment.id, {
      status: "captured",
      providerPaymentId: razorpayPaymentId,
      signature: razorpaySignature
    });
    await orderRepo.updateStatus(order.id, "paid");
    await productRepo.adjustStock(
      order.items.map((i) => ({ productId: i.productId, variantId: i.variantId, delta: -i.quantity }))
    );
  }

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
}
