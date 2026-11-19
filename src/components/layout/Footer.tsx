import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";
import { Container } from "./Container";
import { NewsletterForm } from "./NewsletterForm";
import { catalogRepo } from "@/server/repositories";

export async function Footer() {
  const catalogs = await catalogRepo.list();
  const catalogLinks = catalogs
    .filter((c) => !c.legacy)
    .slice(0, 6)
    .map((c) => ({ label: c.name, href: `/products?weave=${c.slug}` }));

  const defaultWeaveLinks = [
    { label: "Kalyani Silk Cotton", href: "/products?weave=kalyani-silk-cotton" },
    { label: "Maheshwari Handlooms", href: "/products?weave=maheshwari-cotton" },
    { label: "Aarani Soft Silk", href: "/category/silk-sarees" },
    { label: "Pure Summer Cottons", href: "/category/cotton-sarees" },
    { label: "Traditional Temple Border", href: "/products" },
    { label: "Wedding & Bridal Sets", href: "/category/bridal-sarees" }
  ];

  const weaveItems = catalogLinks.length > 0 ? catalogLinks : defaultWeaveLinks;

  return (
    <footer className="bg-[#1f0525] text-purple-200 pt-14 pb-8 mt-auto text-xs border-t border-[#400e4c]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-purple-900/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center bg-white/95 rounded-xl px-3 py-1.5 shadow-sm group">
              <Image
                src="/images/logo.png"
                alt="Ungal Nesavalan"
                width={180}
                height={60}
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <p className="text-purple-300/80 leading-relaxed text-xs max-w-sm">
              Ungal Nesavalan brings the celebrated weaving traditions of Elampillai directly into your
              wardrobe. No retail commissions. Pure art, authentic zari, and direct weaver livelihood.
            </p>

            <div className="space-y-2 text-xs text-purple-300">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Nesavalar Street, Elampillai, Salem District, Tamil Nadu - 637502</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <span>+91 88258 10897 / 0427-248900</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a href="mailto:ungalnesavalan01@gmail.com" className="hover:text-white transition-colors">
                  ungalnesavalan01@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links: Weave Collections */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-amber-300">
              Weave Collections
            </h4>
            <ul className="space-y-2 text-purple-300/90">
              {weaveItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links: Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-amber-300">
              Customer Care
            </h4>
            <ul className="space-y-2 text-purple-300/90">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-white transition-colors">
                  Shipping &amp; Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-white transition-colors">
                  7-Day Easy Return Policy
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="hover:text-white transition-colors">
                  Handloom Care Instructions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Bulk &amp; Reseller Orders
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-amber-300">
              Stay in the Loom
            </h4>
            <p className="text-purple-300/80 mb-3 text-[11px]">
              Subscribe to get early access to festival collections and weekly loom releases.
            </p>
            <NewsletterForm />

            <div className="mt-4 flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.611.209-2.025.597-.417.387-.528 1.012-.528 2.072v1.312h4.526l-.609 3.667h-3.917v7.98c5.445-.989 9.574-5.748 9.574-11.47 0-6.44-5.22-11.66-11.66-11.66S.54 6.78.54 13.22c0 5.722 4.129 10.481 9.561 11.471Z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="YouTube"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://wa.me/918825810897"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-purple-400 text-[11px]">
          <p>© {new Date().getFullYear()} Ungal Nesavalan Handloom Silks. All Rights Reserved. Crafted with pride in Elampillai.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Security Guarantee
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
