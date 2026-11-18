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
    <div className="bg-[#faf7fd] min-h-[75vh]">
      <section className="bg-lavender-mist border-b border-purple-100 py-12">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
              Direct Contact
            </span>
            <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum font-bold">Write to Our Weavers &amp; Stylists</h1>
            <p className="mt-2 text-sm text-purple-900/70">
              Direct from Salem &amp; Elampillai looms. Whether planning a bridal trousseau or asking about weave care, we are here to help.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] items-start">
          <ContactForm />
          <aside className="rounded-2xl border border-purple-100 bg-white p-6 sm:p-7 shadow-xs space-y-6 text-sm text-slate-700">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-plum">Weaver Care Team</p>
              <p className="mt-1.5">
                <a className="text-brand-purple font-medium hover:underline" href="mailto:ungalnesavalan01@gmail.com">
                  ungalnesavalan01@gmail.com
                </a>
              </p>
              <p className="text-xs text-purple-900/60 mt-0.5">Mon–Sat, 10:00 AM – 7:00 PM IST</p>
            </div>

            <div className="border-t border-purple-50 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-plum">WhatsApp / Phone Hotline</p>
              <p className="mt-1.5">
                <a className="text-brand-purple font-bold text-base hover:underline" href="tel:+918825810897">
                  +91 88258 10897
                </a>
              </p>
              <p className="text-xs text-purple-900/60 mt-0.5">Live video drape consultations available on request</p>
            </div>

            <div className="border-t border-purple-50 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-plum">Studio &amp; Dispatch Hub</p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700">
                <strong>Nandhakumar</strong>, 3/364,<br />
                KK Nagar West, Edanganasalai,<br />
                Salem - 637502, Tamil Nadu, India
              </p>
            </div>

            <div className="border-t border-purple-50 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-plum">Wholesale &amp; Bulk Trousseaus</p>
              <p className="mt-1 text-xs text-purple-900/70">
                Direct loom batches available for wedding celebrations and family functions.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
