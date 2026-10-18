import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay credentials are not configured" },
      { status: 401 }
    );
  }

  let body: { amount?: number; currency?: string; receipt?: string; notes?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const { amount, currency = "INR", receipt, notes } = body;

  if (amount === undefined || typeof amount !== "number" || isNaN(amount)) {
    return NextResponse.json({ error: "Amount in paise is required" }, { status: 400 });
  }

  if (amount < 100) {
    return NextResponse.json(
      { error: "Minimum order amount is 100 paise (₹1.00)" },
      { status: 400 }
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err: unknown) {
    console.error("[api/create-order] Razorpay error:", err);
    const message = (err as { error?: { description?: string }; message?: string })?.error?.description ||
      (err as { message?: string })?.message ||
      "Failed to create order with Razorpay";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
