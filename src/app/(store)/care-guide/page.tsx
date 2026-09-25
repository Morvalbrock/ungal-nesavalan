import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Care Guide",
  description:
    "How to store, wash, and preserve your handloom saree so it stays luminous for decades.",
  alternates: { canonical: "/care-guide" }
};

export default function CareGuidePage() {
  return (
    <LegalShell
      kicker="Support"
      title="Care Guide"
      lede="Handloom silk and cotton are living fabrics. A little attention keeps them at their best for a very long time."
    >
      <section>
        <h2 className="font-display text-2xl text-ink">First unwrap</h2>
        <p className="mt-3">
          Open your parcel on a clean cotton bedsheet. Unfold the saree gently along its existing creases, admire it,
          then air it in the shade for an hour before the first wear.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Washing</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Silk (Kanjivaram, Banarasi, Patola):</strong> dry-clean only for the first three washes.</li>
          <li><strong>Cotton & linen:</strong> hand-wash in cool water with a mild pH-neutral soap. No wringing.</li>
          <li>Wash dark colours separately for the first two washes — natural dyes can bleed a little.</li>
          <li>Never use bleach, hot water, or a washing machine on a handloom saree.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Drying</h2>
        <p className="mt-3">
          Dry flat in the shade, pallu-side down. Direct sunlight fades vegetable dyes and dulls zari. If you must hang,
          use a padded hanger and rotate weekly to prevent shoulder marks.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Ironing</h2>
        <p className="mt-3">
          Iron on the reverse side while still slightly damp. Silk: low setting. Cotton: medium with a muslin cloth over
          the zari. Do not iron directly on embroidery or hand-painted motifs.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Storing</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Wrap in the cotton muslin bag that shipped with your saree — never plastic.</li>
          <li>Refold along a new axis every 3 months to prevent zari cracks along the seam.</li>
          <li>Tuck a few cloves or dried neem leaves into the fold — silverfish hate both.</li>
          <li>Air out your saree cupboard once a season on a dry, bright day.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Small snags</h2>
        <p className="mt-3">
          A pulled thread is not a defect — that's the loom telling you it's real. Gently pull the thread through to the
          reverse using a needle; do not cut it. If a zari edge lifts, take it to a local <em>rafoo</em> (invisible mend)
          specialist rather than glueing it.
        </p>
      </section>
    </LegalShell>
  );
}
