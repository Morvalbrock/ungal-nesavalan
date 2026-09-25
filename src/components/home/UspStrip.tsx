import { Container } from "@/components/layout/Container";

const USPS = [
  {
    title: "Direct from the loom",
    body: "No middlemen. Every purchase pays a weaver, not a reseller.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 10h24M4 22h24" strokeLinecap="round" />
        <path d="M8 6l4 20M14 6l4 20M20 6l4 20" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: "Handloom Mark certified",
    body: "Every drape carries the Govt. of India Handloom Mark.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M16 3 l3 6 6 1 -4.5 4.5 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4.5 6 -1 z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Free shipping ₹5,000+",
    body: "Insured delivery across India · COD available.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 20V8h14v12M17 12h6l4 4v4H17M8 25a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM22 25a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "7-day easy returns",
    body: "Reverse pickup in metros. Full refund on unworn drapes.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M28 16A12 12 0 1 0 6.5 23" strokeLinecap="round" />
        <path d="M4 22l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

export function UspStrip() {
  return (
    <section className="border-b border-border/60 bg-cream-warm/60">
      <Container>
        <div className="grid divide-y divide-border/60 md:grid-cols-4 md:divide-x md:divide-y-0">
          {USPS.map((u) => (
            <div key={u.title} className="flex items-start gap-4 px-2 py-6 md:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-maroon ring-1 ring-border">
                {u.icon}
              </div>
              <div>
                <p className="text-[13px] font-medium tracking-tight text-ink">{u.title}</p>
                <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-muted">{u.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
