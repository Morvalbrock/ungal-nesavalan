import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "./Container";

interface Props {
  kicker: string;
  title: string;
  lede?: string;
  bannerImage?: string;
  children: ReactNode;
}

export function LegalShell({ kicker, title, lede, bannerImage, children }: Props) {
  return (
    <>
      {bannerImage ? (
        <section className="relative overflow-hidden bg-ink text-cream">
          <div className="absolute inset-0">
            <Image
              src={bannerImage}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/80" />
          </div>
          <Container className="relative flex min-h-[300px] flex-col justify-end py-16">
            <p className="eyebrow-cream">{kicker}</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{title}</h1>
            {lede && <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-cream/80">{lede}</p>}
          </Container>
        </section>
      ) : (
        <Container className="py-12">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">{kicker}</p>
            <h1 className="mt-2 font-display text-4xl">{title}</h1>
            {lede && <p className="mt-4 text-ink-muted">{lede}</p>}
          </div>
        </Container>
      )}
      <Container className="py-12">
        <article className="prose-content max-w-3xl space-y-6 text-ink-soft">{children}</article>
      </Container>
    </>
  );
}
