import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = { title: "Referrals" };
export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/referrals");

  return (
    <section>
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl">Refer a friend</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Share your personal code — a friend gets a discount on their first order, and we send you a thank-you note
          when they check out.
        </p>
      </div>

      <div className="mt-8 rounded-card border border-border/70 bg-cream-warm/60 p-8">
        <p className="font-display text-xl text-ink">Your code unlocks after your first paid order.</p>
        <p className="mt-2 text-sm text-ink-muted">
          Once a purchase is confirmed we'll mint a code carrying your name — you'll see it here.
        </p>
        <Link href="/products" className="btn-primary mt-5 inline-flex">Browse sarees</Link>
      </div>
    </section>
  );
}
