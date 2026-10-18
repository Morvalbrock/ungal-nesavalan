import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(req: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay secret is not configured" },
      { status: 500 }
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const orderId = body.razorpay_order_id || body.order_id;
  const paymentId = body.razorpay_payment_id || body.payment_id;
  const signature = body.razorpay_signature || body.signature;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        required: ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"],
      },
      { status: 400 }
    );
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isMatch = timingSafeEqual(generatedSignature, signature);

  if (!isMatch) {
    return NextResponse.json(
      { success: false, error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Payment verified successfully",
    order_id: orderId,
    payment_id: paymentId,
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
