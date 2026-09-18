import crypto from "node:crypto";
import Razorpay from "razorpay";
import type { PaymentProvider } from "./payment.provider";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function createRazorpayProvider(): PaymentProvider {
  const keyId = required("RAZORPAY_KEY_ID");
  const keySecret = required("RAZORPAY_KEY_SECRET");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const client = new Razorpay({ key_id: keyId, key_secret: keySecret });

  return {
    mode: "razorpay",
    async createOrder({ amountPaise, receipt, notes }) {
      const order = await client.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes
      });
      return {
        providerOrderId: order.id,
        keyId,
        amountPaise: Number(order.amount),
        currency: "INR",
        mode: "razorpay"
      };
    },
    verifyPaymentSignature({ providerOrderId, providerPaymentId, signature }) {
      const expected = crypto
        .createHmac("sha256", keySecret)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest("hex");
      return timingSafeEqualHex(expected, signature);
    },
    verifyWebhook(rawBody, signature) {
      if (!webhookSecret) return false;
      const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
      return timingSafeEqualHex(expected, signature);
    }
  };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
