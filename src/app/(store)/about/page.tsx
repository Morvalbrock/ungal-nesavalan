import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";
import { pageBannerRepo } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Our Weavers",
  description:
    "Ungal Nesavalan works directly with weaving clusters across Kanchipuram, Varanasi, Chanderi, and beyond.",
  alternates: { canonical: "/about" }
};

export default async function AboutPage() {
  const banner = await pageBannerRepo.findByPage("/about");

  return (
    <LegalShell
      kicker="Company"
      title={banner?.title || "Our Weavers"}
      lede={
        banner?.subtitle ||
        "Ungal Nesavalan means 'your weaver'. Every saree on this site is bought directly from the loom that made it — no middlemen, fair wages, on-time payment."
      }
      bannerImage={banner?.imageUrl}
    >
      <section>
        <h2 className="font-display text-2xl text-ink">Where we buy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Elampillai, Salem, Tamil Nadu</strong> — Our foundational weaving heartland, famed for generational jacquard handloom mastery, soft silk drapes, and intricate zari artistry.</li>
          <li><strong>Kanchipuram, Tamil Nadu</strong> — Silk mark Kanjivaram in temple borders and korvai palus.</li>
          <li><strong>Varanasi, Uttar Pradesh</strong> — Katan silk Banarasi with kadhwa and jamdani weaves.</li>
          <li><strong>Chanderi, Madhya Pradesh</strong> — Silk-cotton with the transparent sheen and buti motifs.</li>
          <li><strong>Patan, Gujarat</strong> — Double ikat Patola, one loom, one saree, months of work.</li>
          <li><strong>Bhagalpur, Bihar</strong> — Tussar silk in natural undyed cream.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">How we pay</h2>
        <p className="mt-3">
          Weavers are paid <strong>60% at loom-loading</strong> and the balance the day the saree arrives at our studio.
          No delayed cheques, no "will pay after it sells". Prices on our site include a weaver premium above the local
          co-operative rate — you'll see this printed on the tag inside every parcel.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Provenance</h2>
        <p className="mt-3">
          Every silk saree carries the <strong>Silk Mark</strong> and, where the region designates one, the
          <strong> Handloom Mark</strong>. The weaver's name and cluster is stitched inside the fall — we think you
          should know who made your saree.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Studio & Dispatch Hub</h2>
        <p className="mt-3">
          Our studio and dispatch hub is located at Nandhakumar, 3/364, KK Nagar West, Edanganasalai, Salem - 637502, Tamil Nadu. Inspection, hand folding, and express dispatch happen here. If you&rsquo;re in town, write ahead and drop by — chai is on us.
        </p>
      </section>
    </LegalShell>
  );
}
