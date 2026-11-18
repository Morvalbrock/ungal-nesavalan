import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";

export function AuthShell({
  title,
  tagline,
  footer,
  children
}: {
  title: string;
  tagline?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#faf7fd] min-h-[85vh] py-12 sm:py-16 flex items-center">
      <Container>
        <div className="mx-auto max-w-md">
          {/* Logo Brand Header */}
          <div className="mb-6 text-center">
            <Link href="/" className="inline-block group">
              <div className="h-12 w-auto flex items-center justify-center">
                <Image
                  src="/images/logo.jpeg"
                  alt="Ungal Nesavalan"
                  width={240}
                  height={80}
                  priority
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xl shadow-purple-950/5">
            <Link href="/" className="inline-block text-xs font-semibold text-purple-900/60 hover:text-brand-purple transition">
              ← Return to Storefront
            </Link>
            <h1 className="mt-3 font-heritage text-2xl sm:text-3xl font-bold text-brand-plum">{title}</h1>
            {tagline && <p className="mt-1.5 text-xs text-purple-900/70">{tagline}</p>}
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 border-t border-purple-100 pt-4 text-center text-xs text-purple-900/60">{footer}</div>}
          </div>
        </div>
      </Container>
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
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600 font-medium">{error}</span>}
    </label>
  );
}

export const authInputCls =
  "w-full rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20";
