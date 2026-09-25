import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ungal Nesavalan collects, stores, and uses personal information.",
  alternates: { canonical: "/privacy" }
};

const EFFECTIVE = "1 April 2025";

export default function PrivacyPage() {
  return (
    <LegalShell
      kicker="Legal"
      title="Privacy Policy"
      lede={`Effective ${EFFECTIVE}. We collect the least information necessary to sell you a saree and to keep the site secure.`}
    >
      <section>
        <h2 className="font-display text-2xl text-ink">What we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Account:</strong> name, email, phone (optional), hashed password.</li>
          <li><strong>Shipping:</strong> addresses you save at checkout.</li>
          <li><strong>Orders:</strong> what you bought, from which device, at what time.</li>
          <li><strong>Payment:</strong> processed by Razorpay — we never see or store your card / UPI credentials.</li>
          <li><strong>Analytics:</strong> aggregated page views via Plausible (no cookies, no personal identifiers).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">How we use it</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Fulfilling and shipping orders you placed.</li>
          <li>Sending transactional email — order confirmation, dispatch, delivery, return decisions.</li>
          <li>Fraud prevention and abuse detection on the site.</li>
          <li>Improving the product with aggregated, non-identifiable analytics.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Who we share it with</h2>
        <p className="mt-3">
          Only sub-processors necessary to run the business: Razorpay (payments), Resend (email), our courier partner
          (DHL / Bluedart / India Post), and our hosting provider. We do not sell your data. We do not run
          ad-retargeting.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Retention</h2>
        <p className="mt-3">
          Account and order records are retained for <strong>7 years</strong> to meet Indian tax and consumer-protection
          obligations. On written request we anonymise your record after that window.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Your rights</h2>
        <p className="mt-3">
          You can access, correct, or export your data from the Account section, or by writing to
          <a className="underline" href="mailto:privacy@ungal-nesavalan.in"> privacy@ungal-nesavalan.in</a>. Deletion
          requests are honoured within 30 days, subject to the retention notice above.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Contact</h2>
        <p className="mt-3">
          Ungal Nesavalan · 47 Silk Weavers Street · Kanchipuram 631502 · Tamil Nadu · India.
        </p>
      </section>
    </LegalShell>
  );
}
