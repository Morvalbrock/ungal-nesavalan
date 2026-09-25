import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { orderRepo, userRepo, couponRepo } from "@/server/repositories";
import { getOrCreateReferralCoupon } from "@/features/referrals/generate";
import { ReferralShareBar } from "@/components/account/ReferralShareBar";

export const metadata: Metadata = { title: "Referrals" };
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function paidStatuses(status: string): boolean {
  return ["paid", "packed", "shipped", "delivered", "refunded", "return_requested"].includes(status);
}

export default async function ReferralsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/referrals");

  const [user, orders] = await Promise.all([
    userRepo.findById(session.userId),
    orderRepo.listByUser(session.userId)
  ]);

  const paidOrder = orders.find((o) => paidStatuses(o.status));
  const referral = paidOrder && user ? await getOrCreateReferralCoupon({ user, order: paidOrder }) : null;
  const redemptions = referral
    ? await (async () => {
        const coupon = await couponRepo.findByCode(referral.code);
        return coupon ? couponRepo.countRedemptions(coupon.id) : 0;
      })()
    : 0;

  const shareUrl = referral ? `${SITE_URL}/?ref=${referral.code}` : SITE_URL;

  return (
    <section>
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl">Refer a friend</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Share your personal code — a friend gets a discount on their first order, and we send you a thank-you note
          when they check out.
        </p>
      </div>

      {!referral ? (
        <div className="mt-8 rounded-card border border-border/70 bg-cream-warm/60 p-8">
          <p className="font-display text-xl text-ink">Your code unlocks after your first paid order.</p>
          <p className="mt-2 text-sm text-ink-muted">
            Once a purchase is confirmed we'll mint a code carrying your name — you'll see it here.
          </p>
          <Link href="/products" className="btn-primary mt-5 inline-flex">Browse sarees</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="rounded-card border border-border bg-cream-warm p-6">
            <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Your code</p>
            <p className="mt-2 font-mono text-3xl tracking-wide text-ink">{referral.code}</p>
            <p className="mt-2 text-sm text-ink-muted">
              {referral.valueLabel} for your friend on their first order over ₹2,000.
            </p>
            <ReferralShareBar code={referral.code} shareUrl={shareUrl} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Times redeemed" value={String(redemptions)} />
            <Stat label="Redemptions remaining" value={String(Math.max(0, 100 - redemptions))} />
          </div>

          <div className="rounded-card border border-border/70 bg-cream-warm/40 p-6 text-sm text-ink-soft">
            <p className="font-medium text-ink">How it works</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5">
              <li>Share your code — via WhatsApp, over dinner, on a card.</li>
              <li>Your friend enters it at checkout for the discount.</li>
              <li>We drop you a note when they receive their saree.</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border/70 p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
