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
    <div className="bg-[#faf7fd] min-h-[75vh]">
      {bannerImage ? (
        <section className="relative overflow-hidden bg-[#1f0525] text-white">
          <div className="absolute inset-0">
            <Image
              src={bannerImage}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/80 via-[#2f0837]/75 to-[#1f0525]" />
          </div>
          <Container className="relative flex min-h-[300px] flex-col justify-end py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-900/60 border border-purple-400/30 px-3 py-1 text-xs font-semibold text-amber-300 tracking-wide uppercase w-fit">
              {kicker}
            </span>
            <h1 className="mt-3 font-heritage text-4xl md:text-5xl text-white font-bold">{title}</h1>
            {lede && <p className="mt-3 max-w-2xl text-base leading-relaxed text-purple-100/90">{lede}</p>}
          </Container>
        </section>
      ) : (
        <section className="bg-lavender-mist border-b border-purple-100 py-12">
          <Container>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
                {kicker}
              </span>
              <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum font-bold">{title}</h1>
              {lede && <p className="mt-2 text-sm text-purple-900/70">{lede}</p>}
            </div>
          </Container>
        </section>
      )}
      <Container className="py-12">
        <article className="prose-content max-w-3xl space-y-6 text-slate-700 bg-white p-6 sm:p-10 rounded-2xl border border-purple-100 shadow-xs">
          {children}
        </article>
      </Container>
    </div>
  );
}
