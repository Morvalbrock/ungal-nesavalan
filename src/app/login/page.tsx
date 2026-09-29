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
    <div className="bg-cream py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-card bg-white shadow-elev md:grid-cols-[1.15fr_1fr]">
          {/* Left — heritage panel */}
          <div className="relative hidden min-h-[560px] md:block">
            <Image
              src="/images/login.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

            {/* Top pill */}
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta" />
              Heritage weave
            </div>

            {/* Bottom overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold-soft/90">
                Woven heirlooms · Curated
              </p>
              <p className="mt-3 font-display text-2xl italic leading-snug text-white/95 sm:text-[26px]">
                &ldquo;Every thread carries the sacred prayers of our master weaver&apos;s loom.&rdquo;
              </p>
              <p className="mt-4 max-w-md text-xs leading-relaxed text-white/70">
                An open atelier practice binding heirloom weaving, hand-loom archiving,
                certification, care partnership and community stewardship.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.32em] text-white/80 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                Made in South India · Live atelier
              </div>
            </div>
          </div>

          {/* Right — auth panel */}
          <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
            <Link
              href="/"
              className="absolute right-6 top-6 text-[11px] uppercase tracking-[0.3em] text-ink-muted hover:text-ink sm:right-10 sm:top-8"
            >
              ← Continue browsing
            </Link>

            <div className="mx-auto w-full max-w-md">
              <h1 className="font-display text-4xl leading-tight text-ink">Welcome back</h1>
              <p className="mt-2 text-sm text-ink-muted">
                Sign in to view your bespoke orders, bridal wardrobes and artisan wishlist.
              </p>

              <div className="mt-8">
                <LoginForm />
              </div>

              <div className="mt-8 border-t border-border pt-5 text-xs text-ink-muted">
                Need bespoke bridal weaving or wedding trousseau curation?{" "}
                <Link
                  href="/contact"
                  className="mt-1 block font-medium uppercase tracking-[0.24em] text-maroon underline decoration-maroon/40 underline-offset-4 hover:decoration-maroon"
                >
                  Speak with our atelier styling specialist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
