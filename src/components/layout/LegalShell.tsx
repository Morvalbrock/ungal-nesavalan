import type { ReactNode } from "react";
import { Container } from "./Container";

interface Props {
  kicker: string;
  title: string;
  lede?: string;
  children: ReactNode;
}

export function LegalShell({ kicker, title, lede, children }: Props) {
  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">{kicker}</p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        {lede && <p className="mt-4 text-ink-muted">{lede}</p>}
      </div>
      <article className="prose-content mt-10 max-w-3xl space-y-6 text-ink-soft">{children}</article>
    </Container>
  );
}
