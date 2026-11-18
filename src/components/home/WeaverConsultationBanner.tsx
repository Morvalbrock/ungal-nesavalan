import { MessageCircle, Video, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/Container";

export function WeaverConsultationBanner() {
  return (
    <section className="w-full bg-cream py-10 sm:py-14">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-maroon/20 bg-gradient-to-r from-cream-warm via-cream to-cream-warm p-6 shadow-card sm:p-8 md:p-10">
          {/* Decorative subtle ambient pattern */}
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-maroon/5 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-maroon/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-widest text-maroon">
                <Video className="h-3.5 w-3.5" />
                Live Studio Experience
              </div>
              <h3 className="mt-3 font-display text-2xl font-medium text-ink sm:text-3xl">
                Need Help Selecting Your Drape?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                Connect with our Elampillai master weavers over WhatsApp. We offer live video viewings,
                blouse pairing recommendations, and shade verification under natural lighting.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-maroon" /> Live Video Showing
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-maroon" /> Real-time Zari Inspection
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-maroon" /> Direct Artisan Advice
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href="https://wa.me/918825810897?text=Hi%20Ungal%20Nesavalan,%20I%20would%20like%20a%20personal%20drape%20consultation%20and%20video%20call."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !gap-2 !px-6 !py-3.5 !text-xs !tracking-widest"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Our Weavers
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
