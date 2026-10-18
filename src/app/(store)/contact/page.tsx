import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ContactForm } from "@/components/common/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Ungal Nesavalan care team — for orders, weaving queries, and press.",
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Contact</p>
        <h1 className="mt-2 font-display text-4xl">Write to us</h1>
        <p className="mt-4 text-ink-muted">
          Real people at real looms. If you're weighing a saree for a wedding, we're happy to answer over WhatsApp too.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ContactForm />
        <aside className="space-y-6 text-sm text-ink-soft">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Care team</p>
            <p className="mt-2">
              <a className="link-underline" href="mailto:ungalnesavalan01@gmail.com">
                ungalnesavalan01@gmail.com
              </a>
            </p>
            <p>Mon–Sat, 10:00–19:00 IST</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">WhatsApp / Phone</p>
            <p className="mt-2">
              <a className="link-underline" href="tel:+918825810897">
                +91 88258 10897
              </a>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Studio & Dispatch Hub</p>
            <p className="mt-2 leading-relaxed">
              GRT parcel service, Elampillai,
              <br />
              Main Road, near Salem,
              <br />
              Edaganasalai, Tamil Nadu 637502
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Support & Queries</p>
            <p className="mt-2">
              <a className="link-underline" href="mailto:ungalnesavalan01@gmail.com">ungalnesavalan01@gmail.com</a>
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
