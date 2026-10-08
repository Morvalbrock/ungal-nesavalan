import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import {
  abandonedCartRepo,
  couponRepo,
  orderRepo,
  paymentRepo,
  userRepo
} from "@/server/repositories";
import { addressSchema } from "@/features/checkout/checkout.schema";
import { buildOrderFromCart, OrderBuildError } from "@/features/checkout/build-order";
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
        quantity: z.number().int().min(1).max(10)
      })
    )
    .min(1)
});

const COD_MIN_TOTAL_PAISE = 100000; // ₹1,000
const COD_MIN_DEPOSIT_PAISE = 9900; // ₹99
const COD_DEPOSIT_PCT = 0.10;

function computeCodDeposit(totalPaise: number): number {
  const tenPct = Math.ceil(totalPaise * COD_DEPOSIT_PCT);
  const deposit = Math.max(tenPct, COD_MIN_DEPOSIT_PAISE);
  return Math.min(deposit, totalPaise);
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

  const paymentMode: "prepaid" | "cod" =
    requestedMode === "cod" && totalPaise >= COD_MIN_TOTAL_PAISE ? "cod" : "prepaid";
  const chargeNowPaise = paymentMode === "cod" ? computeCodDeposit(totalPaise) : totalPaise;
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
    amountDuePaise
  });

  if (couponForRedemption && discountPaise > 0) {
    await couponRepo.recordRedemption({
      couponId: couponForRedemption.id,
      userId: user.id,
      orderId: order.id,
      amountAppliedPaise: discountPaise
    });
  }

  await abandonedCartRepo.markRecovered(user.id, order.id);

  const provider = getPaymentProvider();
  const providerOrder = await provider.createOrder({
    amountPaise: chargeNowPaise,
    receipt: order.orderNumber,
    notes: { orderId: order.id, userId: user.id, paymentMode }
  });

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
