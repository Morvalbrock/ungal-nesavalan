import { NextResponse } from "next/server";
import { z } from "zod";
import { estimatedDeliveryLabel, shippingQuote } from "@/features/shipping/calculate";

const querySchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/),
  subtotalPaise: z.coerce.number().int().min(0)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    pincode: url.searchParams.get("pincode") ?? "",
    subtotalPaise: url.searchParams.get("subtotalPaise") ?? "0"
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_pincode" }, { status: 400 });
  }
  const quote = shippingQuote({
    pincode: parsed.data.pincode,
    subtotalPaise: parsed.data.subtotalPaise
  });
  return NextResponse.json({
    ...quote,
    etaLabel: estimatedDeliveryLabel(quote)
  });
}
