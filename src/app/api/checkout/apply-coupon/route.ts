import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { couponErrorMessage, evaluateCoupon } from "@/features/coupons/evaluate";

const schema = z.object({
  code: z.string().trim().min(1).max(64),
  subtotalPaise: z.number().int().min(0)
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const session = await getSession();
  const result = await evaluateCoupon({
    code: parsed.data.code,
    subtotalPaise: parsed.data.subtotalPaise,
    userId: session?.userId ?? null
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, message: couponErrorMessage(result.error) },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code: result.coupon.code,
    kind: result.coupon.kind,
    value: result.coupon.value,
    discountPaise: result.discountPaise
  });
}
