import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
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

const bodySchema = z.object({
  address: addressSchema,
  couponCode: z.string().trim().min(1).max(64).optional(),
  preferredCourier: z.string().trim().min(1).max(50).optional(),
  paymentMode: z.enum(["prepaid", "cod"]).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(30)
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
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await userRepo.findById(session.userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { address, items, couponCode, preferredCourier, paymentMode: requestedMode } = parsed.data;

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

  let built;
  try {
    built = await buildOrderFromCart(items, { pincode: address.pincode });
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
    codDepositPaise: paymentMode === "cod" ? chargeNowPaise : undefined
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

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: providerOrder.providerOrderId,
    keyId: providerOrder.keyId,
    amountPaise: providerOrder.amountPaise,
    currency: providerOrder.currency,
    mode: providerOrder.mode,
    customer: { name: user.name, email: user.email, phone: address.phone }
  });
}
