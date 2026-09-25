import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Ornament } from "./Ornament";

export function NewsletterCta() {
  return (
    <section className="border-t border-border/60 bg-cream">
      <Container className="py-24">
        <div className="grid overflow-hidden rounded-card border border-border/70 bg-cream-warm/60 shadow-card md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto">
            <Image
              src="https://picsum.photos/seed/newsletter-loom/900/800"
              alt="Weaver at work"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-10 md:p-14">
            <p className="eyebrow">Loom notes</p>
            <h2 className="mt-3 font-display text-[30px] leading-tight md:text-[38px]">
              Once a fortnight,
              <span className="block italic text-maroon">a letter from the loom.</span>
            </h2>
            <Ornament className="mt-4 h-4 w-32" tone="gold" />
            <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-ink-soft">
              New drops, weaver stories, and quiet craft essays. No hard sells,
              no daily emails — just work worth reading.
            </p>
            <NewsletterForm />
            <p className="mt-4 text-[11.5px] text-ink-muted">
              By subscribing you agree to our privacy policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
