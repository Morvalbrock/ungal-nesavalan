import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "How Ungal Nesavalan ships handloom sarees across India and abroad, and how returns work within our 7-day window.",
  alternates: { canonical: "/shipping-returns" }
};

export default function ShippingReturnsPage() {
  return (
    <LegalShell
      kicker="Support"
      title="Shipping & Returns"
      lede="Every saree is inspected, folded in cotton muslin, and dispatched from our Kanchipuram studio. Here's what to expect."
    >
      <section>
        <h2 className="font-display text-2xl text-ink">Shipping timelines</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>India (metro):</strong> 2–4 business days after dispatch.</li>
          <li><strong>India (non-metro):</strong> 4–7 business days after dispatch.</li>
          <li><strong>International:</strong> 7–14 business days with tracked courier (DHL / FedEx).</li>
          <li>We dispatch within 24 hours of a paid order (Monday–Saturday).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Shipping charges</h2>
        <p className="mt-3">
          Shipping within India is <strong>free on orders above ₹5,000</strong>. Below that, a flat ₹99 applies.
          International rates are calculated at checkout by destination weight and zone.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Returns window</h2>
        <p className="mt-3">
          You have <strong>7 days from delivery</strong> to request a return. Sarees must be unworn, unwashed, and
          returned with all original tags and packaging. Reach us from your order page — the "Request return" button
          appears when eligible.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Non-returnable items</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Blouses that have been stitched to custom measurements.</li>
          <li>Sarees marked <em>final sale</em> on the product page.</li>
          <li>Items showing signs of use, alteration, or laundering.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Refunds</h2>
        <p className="mt-3">
          Once your return is received and inspected, we refund to the original payment method within
          <strong> 5–7 business days</strong>. Razorpay refunds show in your statement with the reference we email you.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Damaged in transit?</h2>
        <p className="mt-3">
          Write to <a className="underline" href="mailto:care@ungal-nesavalan.in">care@ungal-nesavalan.in</a> within 48
          hours of delivery with photos of the parcel and the saree. We'll organise a replacement or full refund at our
          cost.
        </p>
      </section>
    </LegalShell>
  );
}
