import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/account/profile");

  return (
    <div className="bg-[#faf7fd] py-10 sm:py-16 min-h-[85vh] flex items-center">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-950/10 md:grid-cols-[1.1fr_1fr]">
          {/* Left — heritage panel */}
          <div className="relative hidden min-h-[580px] md:block">
            <Image
              src="/images/login.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#4a0e4e]/70 via-[#3e0c47]/40 to-[#1f0525]/90" />

            {/* Top pill */}
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-purple-950/60 border border-purple-400/30 px-3 py-1.5 text-xs uppercase tracking-wider text-amber-300 backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Direct Loom Heritage
            </div>

            {/* Bottom overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                Authentic Elampillai Weaves
              </p>
              <p className="mt-3 font-heritage text-2xl sm:text-3xl italic leading-snug text-white/95">
                &ldquo;Every thread carries the sacred prayers and dedication of our master weaver&apos;s loom.&rdquo;
              </p>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-purple-200/90">
                Direct from the weavers of Salem — pure soft silks, Kalyani cottons, and bridal drapes crafted with Handloom Mark certification.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Handcrafted in Salem · 100% Genuine Handloom
              </div>
            </div>
          </div>

          {/* Right — auth panel */}
          <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
            <Link
              href="/"
              className="absolute right-6 top-6 text-xs font-semibold text-purple-900/60 hover:text-brand-purple transition sm:right-10 sm:top-8"
            >
              ← Back to Store
            </Link>

            <div className="mx-auto w-full max-w-md">
              {/* Brand logo */}
              <div className="mb-6">
                <Link href="/" className="inline-block group">
                  <Image
                    src="/images/logo.jpeg"
                    alt="Ungal Nesavalan"
                    width={220}
                    height={70}
                    priority
                    className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </Link>
              </div>

              <h1 className="font-heritage text-3xl sm:text-4xl font-bold text-brand-plum leading-tight">Welcome Back</h1>
              <p className="mt-1.5 text-xs sm:text-sm text-purple-900/70">
                Sign in to view your orders, track shipments, and access your saved drapes.
              </p>

              <div className="mt-6">
                <LoginForm />
              </div>

              <div className="mt-8 border-t border-purple-100 pt-5 text-xs text-purple-900/70">
                Planning a wedding trousseau or bespoke bulk order?{" "}
                <Link
                  href="/contact"
                  className="mt-1 block font-semibold text-brand-purple hover:underline"
                >
                  Speak with our master weaver styling desk →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
