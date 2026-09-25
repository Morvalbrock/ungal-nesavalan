import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms under which Ungal Nesavalan sells and ships sarees.",
  alternates: { canonical: "/terms" }
};

const EFFECTIVE = "1 April 2025";

export default function TermsPage() {
  return (
    <LegalShell
      kicker="Legal"
      title="Terms of Service"
      lede={`Effective ${EFFECTIVE}. By using this site you agree to the following. It's short — please read it.`}
    >
      <section>
        <h2 className="font-display text-2xl text-ink">1. Who we are</h2>
        <p className="mt-3">
          This site is operated by Ungal Nesavalan, a proprietary firm registered in Tamil Nadu, India (GSTIN on
          request). "We", "us", "our" means the firm. "You" means the person using the site.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">2. Product accuracy</h2>
        <p className="mt-3">
          Handloom sarees vary in weave density, dye lot, and zari sheen. Photographs are shot in natural daylight and
          are as faithful as we can make them, but small variations are the mark of a real handloom and are not defects.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">3. Prices and taxes</h2>
        <p className="mt-3">
          Prices displayed include GST as applicable. We reserve the right to correct a pricing error before dispatching
          an order — if we do, you'll be notified and offered a full refund.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">4. Order acceptance</h2>
        <p className="mt-3">
          An order is a proposal to buy. We accept it when we ship it. We may refuse or cancel an order (with a refund)
          for stock, fraud, or non-serviceable shipping addresses.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">5. Payments</h2>
        <p className="mt-3">
          Payments are processed by Razorpay. Their terms and refund timelines apply to the payment leg of the
          transaction. Refunds land in the same instrument used to pay.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">6. Returns</h2>
        <p className="mt-3">
          Governed by our <a className="underline" href="/shipping-returns">Shipping &amp; Returns</a> policy.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">7. Intellectual property</h2>
        <p className="mt-3">
          Photographs, editorial copy, and the site design are ours. Motifs and weave traditions belong to the weaving
          communities that made them.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">8. Liability</h2>
        <p className="mt-3">
          Our liability for any claim arising from a purchase is limited to the amount you paid for the affected order.
          Nothing in these terms limits the rights you have under the Indian Consumer Protection Act, 2019.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">9. Governing law</h2>
        <p className="mt-3">
          These terms are governed by the laws of India. Courts in Chennai have exclusive jurisdiction over any dispute
          that cannot be settled by conversation first — and we prefer conversation first.
        </p>
      </section>
    </LegalShell>
  );
}
