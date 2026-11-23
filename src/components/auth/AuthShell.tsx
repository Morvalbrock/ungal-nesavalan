import Link from "next/link";
import Image from "next/image";

export function AuthShell({
  title,
  tagline,
  heroBadge = "Direct From Elampillai Looms",
  heroSeries = "Authentic Salem Weaves",
  heroQuote = "Every thread carries the sacred prayers and dedication of our master weaver’s loom.",
  heroSubtext = "Handwoven directly in Tamil Nadu — crafted with heirloom soft silks, Kalyani organic cottons, and bridal drapes straight from authentic pit-looms.",
  heroImage = "/images/login_image.png",
  footer,
  children
}: {
  title: string;
  tagline?: string;
  heroBadge?: string;
  heroSeries?: string;
  heroQuote?: string;
  heroSubtext?: string;
  heroImage?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#22072e] font-sans antialiased text-slate-800 flex items-center justify-center p-3 sm:p-5 lg:p-8 selection:bg-[#3c124d] selection:text-white">
      {/* Master 2-Column Auth Wrapper */}
      <main className="w-full max-w-7xl mx-auto rounded-3xl bg-white shadow-2xl overflow-hidden border border-[#3c124d]/20 grid grid-cols-1 lg:grid-cols-12 min-h-[750px]">
        {/* Left Heritage Banner */}
        <section
          aria-label="Brand Heritage and Story"
          className="lg:col-span-5 relative flex flex-col justify-between overflow-hidden bg-[#290c37] text-white p-8 lg:p-12 min-h-[580px] lg:min-h-full hidden md:flex"
        >
          {/* Saree Artisan Ambient Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage}
              alt="Graceful South Indian bride dressed in authentic royal purple and magenta Elampillai pure silk saree"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center scale-105 transition-transform duration-1000 ease-out hover:scale-100"
            />
            {/* Gradient Wash & Royal Dark Veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#290c37]/85 via-[#290c37]/35 to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-loom-overlay mix-blend-soft-light pointer-events-none" />
          </div>

          {/* Top Header Elements / Badges */}
          <div className="relative z-10 space-y-4">
            {/* Loom Origin Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4e1a61]/70 border border-[#c9933b]/40 text-[#f4dfaa] text-xs tracking-wider uppercase font-semibold backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>✦ {heroBadge}</span>
            </div>

            {/* Global Trust Tagline */}
            <div className="flex items-center gap-2 text-xs text-[#e8dbf2]/80 font-medium">
              <span className="text-amber-400">★★★★★</span>
              <span>Over 50,000+ Patrons across India &amp; Global</span>
            </div>
          </div>

          {/* Middle Story / Quote Block */}
          <div className="relative z-10 my-auto py-10 space-y-6">
            <div className="inline-block border-l-2 border-[#c9933b] pl-4 text-xs font-cinzel tracking-widest text-[#f4dfaa] uppercase">
              {heroSeries}
            </div>

            <blockquote className="font-heritage italic text-2xl lg:text-3xl text-[#faf7fc] leading-snug drop-shadow-sm">
              &ldquo;{heroQuote}&rdquo;
            </blockquote>

            <p className="text-[#e8dbf2]/90 text-sm leading-relaxed max-w-md font-light">
              {heroSubtext}
            </p>

            {/* Guarantee Checklist */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                </svg>
                100% Pure Handloom
              </span>
              <span className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                </svg>
                Zero Middlemen
              </span>
              <span className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                </svg>
                Salem Pure Zari
              </span>
            </div>
          </div>

          {/* Bottom Weaver Community Pill */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#e8dbf2]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span>Handcrafted in Salem · 100% Genuine Handloom</span>
            </div>
            <span className="hidden sm:inline font-cinzel text-[#f4dfaa] tracking-wider">ESTD. 1984</span>
          </div>
        </section>

        {/* Right Auth Interface */}
        <section
          aria-label="Customer Authentication Form"
          className="lg:col-span-7 bg-[#faf8fc] flex flex-col justify-between p-6 sm:p-10 lg:p-12"
        >
          {/* Top Action Navigation Bar */}
          <div className="flex items-center justify-between border-b border-[#f3ecf8] pb-4 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#3c124d] hover:text-[#4e1a61] transition-colors group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back to Store</span>
            </Link>
          </div>

          {/* Centered Auth Container */}
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Brand Identity Logo Display */}
            <header className="text-center space-y-3">
              <div className="flex justify-center">
                <Link href="/" className="inline-block group">
                  <Image
                    src="/images/logo.png"
                    alt="Ungal Nesavalan Traditional Handloom Silk Logo"
                    width={220}
                    height={70}
                    priority
                    className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                  />
                </Link>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-heritage font-bold text-[#3c124d] tracking-tight">
                  {title}
                </h1>
                {tagline && <p className="text-xs sm:text-sm text-slate-600">{tagline}</p>}
              </div>
            </header>

            {/* Form Children */}
            <div>{children}</div>

            {/* Optional Additional Footer Content */}
            {footer && <div className="mt-4">{footer}</div>}

            {/* Wedding Trousseau / Master Weaver Styling Help Card */}
            <div className="mt-6 p-3.5 rounded-xl bg-gradient-to-r from-[#f3ecf8] via-[#fcf7ff] to-amber-50/60 border border-[#e8dbf2] text-left flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white shadow-xs text-[#3c124d] text-base">🪡</div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-800">
                  Planning a wedding trousseau or bespoke bulk order?
                </p>
                <Link
                  href="/contact"
                  className="text-[#3c124d] font-semibold hover:text-amber-800 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Speak with our Master Weaver Styling Desk</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Footer Stamp */}
          <footer className="mt-8 pt-4 border-t border-[#f3ecf8] text-center text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1.5 flex-wrap">
              <span>🔒 256-bit Secure Handloom Direct Portal</span>
              <span>•</span>
              <span>Direct from Salem Looms</span>
            </p>
            <p className="text-[10px] text-slate-400">Salem Weaver Looms Cluster, Tamil Nadu, India</p>
          </footer>
        </section>
      </main>
    </div>
  );
}

export function AuthField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-left">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600 font-medium">{error}</span>}
    </label>
  );
}

export const authInputCls =
  "w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3c124d] focus:ring-2 focus:ring-[#3c124d]/20 bg-white transition outline-none";


