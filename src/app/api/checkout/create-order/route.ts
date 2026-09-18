import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { orderRepo, paymentRepo, userRepo } from "@/server/repositories";
import { addressSchema } from "@/features/checkout/checkout.schema";
import { buildOrderFromCart, OrderBuildError } from "@/features/checkout/build-order";
import { getPaymentProvider } from "@/features/payments";

const bodySchema = z.object({
  address: addressSchema,
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

  const { address, items } = parsed.data;

  let built;
  try {
    built = await buildOrderFromCart(items);
  } catch (err) {
    if (err instanceof OrderBuildError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

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
      country: address.country,
      phone: address.phone
    },
    status: "pending",
    subtotalPaise: built.subtotalPaise,
    shippingPaise: built.shippingPaise,
    taxPaise: 0,
    totalPaise: built.totalPaise,
    currency: "INR",
    notes: address.notes
  });

  const provider = getPaymentProvider();
  const providerOrder = await provider.createOrder({
    amountPaise: order.totalPaise,
    receipt: order.orderNumber,
    notes: { orderId: order.id, userId: user.id }
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
