import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, setSessionCookie } from "@/features/auth/session";
import { signForUser } from "@/features/auth/jwt-auth.provider";
import { normalizePhone } from "@/features/auth/otp.service";
import {
  abandonedCartRepo,
  categoryRepo,
  couponRepo,
  orderRepo,
  paymentRepo,
  userRepo
} from "@/server/repositories";
import { addressSchema } from "@/features/checkout/checkout.schema";
import { buildOrderFromCart, OrderBuildError } from "@/features/checkout/build-order";
import { computeCodDepositForCart } from "@/features/checkout/cod";
import { getPaymentProvider } from "@/features/payments";
import { couponErrorMessage, evaluateCoupon } from "@/features/coupons/evaluate";
import type { User } from "@/types/user";

const bodySchema = z.object({
  address: addressSchema,
  couponCode: z.string().trim().min(1).max(64).optional(),
  preferredCourier: z.string().trim().min(1).max(50).optional(),
  paymentMode: z.enum(["prepaid", "cod"]).optional(),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(30),
        size: z.string().trim().min(1).max(20).optional()
      })
    )
    .min(1)
});

function isTamilNaduPincode(pincode: string | undefined): boolean {
  const p = (pincode ?? "").trim();
  if (!/^\d{6}$/.test(p)) return false;
  const n = parseInt(p, 10);
  if (n < 600001 || n > 643999) return false;
  const prefix = p.slice(0, 3);
  if (prefix === "605" || prefix === "607" || prefix === "609") return false;
  return true;
}

function isTamilNaduState(state: string | undefined): boolean {
  const s = (state ?? "").trim().toLowerCase();
  return s === "tamil nadu" || s === "tamilnadu" || s === "tn";
}

function isTamilNaduAddress(address: { state?: string; pincode?: string }): boolean {
  return isTamilNaduPincode(address.pincode) || isTamilNaduState(address.state);
}

export async function POST(req: Request) {
  const session = await getSession();

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { address, items, couponCode, preferredCourier, paymentMode: requestedMode, idempotencyKey } = parsed.data;

  // Idempotency: if the browser retries (double-click, flaky network) with the same
  // key, replay the original response instead of creating a second order+payment.
  if (idempotencyKey) {
    const prior = await orderRepo.findByIdempotencyKey(idempotencyKey);
    if (prior && prior.status !== "cancelled" && prior.status !== "refunded") {
      const priorPayment = prior.paymentId ? await paymentRepo.findById(prior.paymentId) : null;
      if (priorPayment) {
        return NextResponse.json({
          orderId: prior.id,
          orderNumber: prior.orderNumber,
          razorpayOrderId: priorPayment.providerOrderId,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "sim_key",
          amountPaise: priorPayment.amountPaise,
          currency: priorPayment.currency,
          mode: (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? "razorpay" : "simulate") as "razorpay" | "simulate",
          customer: {
            name: prior.addressSnapshot.fullName,
            email: "",
            phone: prior.addressSnapshot.phone
          },
          replayed: true
        });
      }
    }
  }

  let user: User | null = session ? await userRepo.findById(session.userId) : null;
  let isGuestCheckout = false;

  if (!user) {
    // Guest checkout: always create a fresh user record (never look up by phone/email —
    // that would let a guest effectively "sign in" as an existing shopper without OTP).
    isGuestCheckout = true;
    const normalizedPhone = normalizePhone(address.phone);
    const trimmedEmail = address.email?.trim().toLowerCase();
    const guestEmail =
      trimmedEmail && trimmedEmail.length > 0
        ? trimmedEmail
        : `guest_${normalizedPhone.replace(/\D/g, "")}_${Date.now()}@phone.local`;
    user = await userRepo.create({
      email: guestEmail,
      name: address.fullName.trim(),
      phone: normalizedPhone,
      role: "customer"
    });
  } else {
    // Progressive profile update: backfill user profile with missing fields if available
    const userPatch: { name?: string; phone?: string; email?: string } = {};
    if ((!user.phone || user.phone.trim() === "") && address.phone) {
      userPatch.phone = address.phone.trim();
    }
    if ((!user.name || user.name.startsWith("+") || /^\d+$/.test(user.name)) && address.fullName) {
      userPatch.name = address.fullName.trim();
    }
    if (
      (!user.email || user.email.endsWith("@phone.local") || user.email.endsWith("@firebase.local")) &&
      address.email
    ) {
      userPatch.email = address.email.trim().toLowerCase();
    }
    if (Object.keys(userPatch).length > 0) {
      await userRepo.update(user.id, userPatch).catch(() => null);
    }
  }

  let built;
  try {
    built = await buildOrderFromCart(items, {
      pincode: address.pincode,
      state: address.state
    });
  } catch (err) {
    if (err instanceof OrderBuildError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  let discountPaise = 0;
  let couponSnapshot;
  let couponForRedemption;
  if (couponCode) {
    const evalResult = await evaluateCoupon({
      code: couponCode,
      subtotalPaise: built.subtotalPaise,
      userId: user.id
    });
    if (!evalResult.ok) {
      return NextResponse.json(
        { error: evalResult.error, message: couponErrorMessage(evalResult.error) },
        { status: 400 }
      );
    }
    discountPaise = evalResult.discountPaise;
    couponSnapshot = {
      code: evalResult.coupon.code,
      kind: evalResult.coupon.kind,
      value: evalResult.coupon.value
    };
    couponForRedemption = evalResult.coupon;
  }

  const totalPaise = Math.max(0, built.subtotalPaise - discountPaise + built.shippingPaise);

  const uniqueCategoryIds = Array.from(new Set(built.codLines.map((l) => l.categoryId)));
  const categoryList = await Promise.all(
    uniqueCategoryIds.map((id) => categoryRepo.findById(id))
  );
  const categoryById = new Map(
    categoryList.filter((c): c is NonNullable<typeof c> => Boolean(c)).map((c) => [c.id, c])
  );
  const codQuote = computeCodDepositForCart(built.codLines, categoryById, totalPaise);

  const paymentMode: "prepaid" | "cod" =
    requestedMode === "cod" &&
    codQuote.eligible &&
    isTamilNaduAddress({ state: address.state, pincode: address.pincode })
      ? "cod"
      : "prepaid";
  const chargeNowPaise = paymentMode === "cod" ? codQuote.depositPaise : totalPaise;
  const amountDuePaise = paymentMode === "cod" ? totalPaise - chargeNowPaise : 0;

  const order = await orderRepo.create({
    userId: user.id,
    items: built.items,
    addressSnapshot: {
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country ?? "India",
      phone: address.phone
    },
    status: "pending",
    subtotalPaise: built.subtotalPaise,
    shippingPaise: built.shippingPaise,
    taxPaise: 0,
    discountPaise,
    couponSnapshot,
    totalPaise,
    currency: "INR",
    notes: address.notes,
    preferredCourier,
    paymentMode,
    amountPaidPaise: 0,
    amountDuePaise,
    codDepositPaise: paymentMode === "cod" ? chargeNowPaise : undefined,
    isGuestOrder: isGuestCheckout,
    idempotencyKey
  });

  if (couponForRedemption && discountPaise > 0) {
    await couponRepo.recordRedemption({
      couponId: couponForRedemption.id,
      userId: user.id,
      orderId: order.id,
      amountAppliedPaise: discountPaise
    });
  }

  if (chargeNowPaise < 100) {
    return NextResponse.json(
      { error: "invalid_amount", message: "Order amount must be at least 100 paise (₹1.00)" },
      { status: 400 }
    );
  }

  const provider = getPaymentProvider();
  let providerOrder;
  try {
    providerOrder = await provider.createOrder({
      amountPaise: chargeNowPaise,
      receipt: order.orderNumber,
      notes: { orderId: order.id, userId: user.id, paymentMode }
    });
  } catch (err: unknown) {
    console.error("[create-order] Payment order creation failed:", err);
    await orderRepo.updateStatus(order.id, "cancelled");
    const msg = (err as { message?: string })?.message || "Failed to initialize payment with Razorpay";
    return NextResponse.json({ error: "payment_failed", message: msg }, { status: 500 });
  }

  await abandonedCartRepo.markRecovered(user.id, order.id);

  const payment = await paymentRepo.create({
    orderId: order.id,
    provider: "razorpay",
    providerOrderId: providerOrder.providerOrderId,
    amountPaise: providerOrder.amountPaise,
    currency: "INR",
    status: "created"
  });
  await orderRepo.attachPayment(order.id, payment.id);

  // Silent sign-in for guest checkout so the subsequent confirm-payment call
  // and the order success page can authenticate the shopper without OTP/login.
  if (isGuestCheckout) {
    const token = await signForUser(user);
    await setSessionCookie(token);
  }

  const isPlaceholderEmail =
    user.email.endsWith("@phone.local") || user.email.endsWith("@firebase.local");

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: providerOrder.providerOrderId,
    keyId: providerOrder.keyId,
    amountPaise: providerOrder.amountPaise,
    currency: providerOrder.currency,
    mode: providerOrder.mode,
    customer: {
      name: user.name,
      email: isPlaceholderEmail ? address.email ?? "" : user.email,
      phone: address.phone
    }
  });
}
