import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = {
  title: "Size & Length Guide",
  description:
    "Standard saree and blouse measurements at Ungal Nesavalan, plus how to measure yourself for a custom stitched blouse.",
  alternates: { canonical: "/size-guide" }
};

export default function SizeGuidePage() {
  return (
    <LegalShell
      kicker="Support"
      title="Size & Length Guide"
      lede="Every saree we ship is 5.5 metres of drape plus an 0.8-metre blouse piece. Here's how that maps to your fit."
    >
      <section>
        <h2 className="font-display text-2xl text-ink">Standard saree length</h2>
        <p className="mt-3">
          Our sarees ship at <strong>6.3 metres total</strong> — 5.5 m of drape, 0.8 m of matching blouse piece from the
          same warp. That's enough for a full <em>nivi</em> drape with two shoulder pallu pleats on wearers up to 5'9".
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Blouse sizing (unstitched piece)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-ink-muted">
                <th className="py-2 pr-4">Size</th>
                <th className="py-2 pr-4">Bust (in)</th>
                <th className="py-2 pr-4">Waist (in)</th>
                <th className="py-2 pr-4">Shoulder (in)</th>
                <th className="py-2">Sleeve length (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60"><td className="py-2 pr-4">XS</td><td className="py-2 pr-4">32</td><td className="py-2 pr-4">26</td><td className="py-2 pr-4">13.5</td><td className="py-2">5</td></tr>
              <tr className="border-b border-border/60"><td className="py-2 pr-4">S</td><td className="py-2 pr-4">34</td><td className="py-2 pr-4">28</td><td className="py-2 pr-4">14</td><td className="py-2">5.5</td></tr>
              <tr className="border-b border-border/60"><td className="py-2 pr-4">M</td><td className="py-2 pr-4">36</td><td className="py-2 pr-4">30</td><td className="py-2 pr-4">14.5</td><td className="py-2">6</td></tr>
              <tr className="border-b border-border/60"><td className="py-2 pr-4">L</td><td className="py-2 pr-4">38</td><td className="py-2 pr-4">32</td><td className="py-2 pr-4">15</td><td className="py-2">6</td></tr>
              <tr className="border-b border-border/60"><td className="py-2 pr-4">XL</td><td className="py-2 pr-4">40</td><td className="py-2 pr-4">34</td><td className="py-2 pr-4">15.5</td><td className="py-2">6.5</td></tr>
              <tr><td className="py-2 pr-4">XXL</td><td className="py-2 pr-4">42</td><td className="py-2 pr-4">36</td><td className="py-2 pr-4">16</td><td className="py-2">6.5</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          The unstitched piece can be tailored up to bust 44". Your local tailor can add 1–1.5" seam allowance per side.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">How to measure yourself</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li><strong>Bust:</strong> around the fullest part, tape parallel to the floor.</li>
          <li><strong>Waist:</strong> the natural crease when you bend sideways.</li>
          <li><strong>Shoulder:</strong> from shoulder bone to shoulder bone, across the back.</li>
          <li><strong>Sleeve length:</strong> from shoulder bone to where you want the sleeve to end.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Custom stitching</h2>
        <p className="mt-3">
          We don't currently stitch blouses in-house. Every trusted tailor in India can work from the unstitched piece
          in a week. If you'd like a recommendation in your city, write to us at
          <a className="underline" href="mailto:care@ungal-nesavalan.in"> care@ungal-nesavalan.in</a>.
        </p>
      </section>
    </LegalShell>
  );
}
