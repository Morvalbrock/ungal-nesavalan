import Link from "next/link";
import { Ornament } from "./Ornament";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  align?: "left" | "center";
  tone?: "ink" | "cream";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  cta,
  align = "center",
  tone = "ink"
}: Props) {
  const eyebrowClass = tone === "cream" ? "eyebrow-cream" : "eyebrow";
  const titleClass = tone === "cream" ? "text-cream" : "text-ink";
  const subtitleClass = tone === "cream" ? "text-cream/75" : "text-ink-muted";

  if (align === "center") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <h2 className={`mt-3 font-display text-[30px] leading-tight md:text-[38px] ${titleClass}`}>
          {title}
        </h2>
        <Ornament className="mx-auto mt-4 h-4 w-40" tone={tone === "cream" ? "gold" : "gold"} />
        {subtitle && <p className={`mx-auto mt-4 max-w-xl text-[15px] leading-[1.7] ${subtitleClass}`}>{subtitle}</p>}
        {cta && (
          <Link href={cta.href} className="link-underline mt-6 inline-block text-[13px] uppercase tracking-widest2">
            {cta.label} →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <h2 className={`mt-2 font-display text-[28px] leading-tight md:text-[36px] ${titleClass}`}>
          {title}
        </h2>
        {subtitle && <p className={`mt-3 max-w-lg text-[14.5px] leading-[1.6] ${subtitleClass}`}>{subtitle}</p>}
      </div>
      {cta && (
        <Link href={cta.href} className="link-underline text-[13px] uppercase tracking-widest2">
          {cta.label} →
        </Link>
      )}
    </div>
  );
}
