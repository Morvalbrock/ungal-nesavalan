import Link from "next/link";
import { Container } from "./Container";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "All Sarees", href: "/products" },
      { label: "Silk", href: "/category/silk-sarees" },
      { label: "Bridal", href: "/category/bridal-sarees" },
      { label: "Cotton", href: "/category/cotton-sarees" },
      { label: "Designer", href: "/category/designer-sarees" }
    ]
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & Returns", href: "#" },
      { label: "Care Guide", href: "#" },
      { label: "Size & Length Guide", href: "#" },
      { label: "Contact", href: "#" }
    ]
  },
  {
    heading: "Company",
    links: [
      { label: "Our Weavers", href: "#" },
      { label: "Journal", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-cream-warm">
      <Container className="grid gap-12 py-16 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold text-ink">Ungal Nesavalan</p>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Handcrafted sarees from India's finest weaving clusters — direct from the loom to your drape.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">{col.heading}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="link-underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-border/70">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Ungal Nesavalan. All rights reserved.</span>
          <span>Made in India · Handloom Mark</span>
        </Container>
      </div>
    </footer>
  );
}
