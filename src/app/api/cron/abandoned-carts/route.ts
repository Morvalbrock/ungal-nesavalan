import { NextResponse } from "next/server";
import { abandonedCartRepo, userRepo } from "@/server/repositories";
import { mutateCollection, nowIso } from "@/server/db/json-store";
import type { AbandonedCart } from "@/types/abandoned-cart";
import { getMailProvider } from "@/features/mail";
import { abandonedCartEmail } from "@/features/mail/templates";

export const runtime = "nodejs";

const HOURS_BEFORE_SEND = Number(process.env.ABANDONED_CART_HOURS ?? "24");

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = Date.now() - HOURS_BEFORE_SEND * 60 * 60 * 1000;
  const carts = await abandonedCartRepo.listActive();
  const candidates = carts.filter(
    (c) => !c.notifiedAt && new Date(c.updatedAt).getTime() <= cutoff && c.items.length > 0
  );

  let sent = 0;
  const failures: string[] = [];
  const mail = getMailProvider();

  for (const c of candidates) {
    try {
      const user = await userRepo.findById(c.userId);
      if (!user) continue;
      const { subject, html } = abandonedCartEmail({
        customerName: user.name,
        items: c.items.map((i) => ({
          name: i.name,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPricePaise: i.unitPricePaise
        })),
        couponCode: process.env.ABANDONED_CART_COUPON
      });
      await mail.send({
        to: user.email,
        subject,
        html,
        tags: { snapshotId: c.id, kind: "abandoned-cart" }
      });
      await markNotified(c.id);
      sent += 1;
    } catch (err) {
      failures.push(`${c.id}:${(err as Error).message}`);
    }
  }

  return NextResponse.json({ candidates: candidates.length, sent, failures });
}

async function markNotified(id: string) {
  await mutateCollection<AbandonedCart>("abandoned-carts", [], (rows) =>
    rows.map((c) => (c.id === id ? { ...c, notifiedAt: nowIso() } : c))
  );
}
