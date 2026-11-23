import { Container } from "@/components/layout/Container";
import { Sparkles, Award, Truck, ShieldCheck } from "lucide-react";

const USPS = [
  {
    title: "Direct from Elampillai Looms",
    body: "No middlemen. Every purchase directly supports the master weaver families at the loom.",
    icon: Sparkles
  },
  {
    title: "100% Authentic Handloom",
    body: "Pure traditional craftsmanship on authentic hand-woven silks and heritage zari weaves.",
    icon: Award
  },
  {
    title: "Complimentary Insured Delivery",
    body: "Free shipping across Tamil Nadu. Safe, fully insured doorstep transit across all India.",
    icon: Truck
  },
  {
    title: "Artisan Care & Exchange",
    body: "Personal weaver guidance via WhatsApp: +91 88258 10897. Unboxing video assisted support.",
    icon: ShieldCheck
  }
];

export function UspStrip() {
  return (
    <section className="border-b border-border/70 bg-cream-warm/70">
      <Container>
        <div className="grid divide-y divide-border/60 sm:grid-cols-2 md:grid-cols-4 md:divide-x md:divide-y-0">
          {USPS.map((u) => {
            const Icon = u.icon;
            return (
              <div
                key={u.title}
                className="group flex items-start gap-3.5 px-3 py-5 transition-colors hover:bg-cream/60 md:px-5 md:py-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon ring-1 ring-maroon/20 transition-all duration-300 group-hover:bg-maroon group-hover:text-cream group-hover:shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-medium tracking-tight text-ink">{u.title}</p>
                  <p className="mt-1 text-[12px] leading-[1.55] text-ink-muted">{u.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
