import { NextResponse } from "next/server";
import { z } from "zod";
import { estimatedDeliveryLabel, shippingQuote } from "@/features/shipping/calculate";
import { lookupPincode } from "@/features/shipping/serviceability";

const querySchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/),
  subtotalPaise: z.coerce.number().int().min(0),
  freeShipping: z.preprocess((val) => val === "true" || val === "1" || val === true, z.boolean()).optional()
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    pincode: url.searchParams.get("pincode") ?? "",
    subtotalPaise: url.searchParams.get("subtotalPaise") ?? "0",
    freeShipping: url.searchParams.get("freeShipping") ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_pincode" }, { status: 400 });
  }
  const quote = shippingQuote({
    pincode: parsed.data.pincode,
    subtotalPaise: parsed.data.subtotalPaise
  });
  if (parsed.data.freeShipping) {
    quote.ratePaise = 0;
    quote.qualifiesForFreeShipping = true;
    quote.freeShippingRemainingPaise = 0;
  }
  const pincodeInfo = await lookupPincode(parsed.data.pincode);
  return NextResponse.json({
    ...quote,
    etaLabel: estimatedDeliveryLabel(quote),
    serviceable: pincodeInfo.serviceable,
    locationLabel: pincodeInfo.locationLabel ?? null
  });
}
