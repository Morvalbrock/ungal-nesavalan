import { NextResponse } from "next/server";
import { z } from "zod";
import { estimatedDeliveryLabel, shippingEta } from "@/features/shipping/calculate";
import { lookupPincode } from "@/features/shipping/serviceability";

const querySchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    pincode: url.searchParams.get("pincode") ?? ""
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_pincode" }, { status: 400 });
  }
  const eta = shippingEta({ pincode: parsed.data.pincode });
  const pincodeInfo = await lookupPincode(parsed.data.pincode);
  return NextResponse.json({
    zone: eta.zone,
    zoneLabel: eta.zoneLabel,
    etaMinDays: eta.etaMinDays,
    etaMaxDays: eta.etaMaxDays,
    etaLabel: estimatedDeliveryLabel(eta),
    serviceable: pincodeInfo.serviceable,
    locationLabel: pincodeInfo.locationLabel ?? null
  });
}
