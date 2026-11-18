import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getSession } from "@/features/auth/session";

import { SignOutButton } from "@/components/account/SignOutButton";

const NAV = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/referrals", label: "Referrals" }
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="bg-[#faf7fd] min-h-[80vh]">
      <section className="bg-lavender-mist border-b border-purple-100 py-10">
        <Container>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
            Customer Dashboard
          </span>
          <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum font-bold">
            Namaskaram, {session?.name?.split(" ")[0] ?? "Saree Connoisseur"}
          </h1>
          <p className="mt-1 text-xs text-purple-900/60">Manage your handloom orders, saved addresses, and bridal wishlist.</p>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] items-start">
          <aside className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs">
            <nav className="flex flex-col gap-1 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-xl px-3.5 py-2.5 text-slate-700 font-medium transition hover:bg-purple-50 hover:text-brand-plum"
                >
                  {n.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-purple-100 mt-1">
                <SignOutButton />
              </div>
            </nav>
          </aside>
          <div className="rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xs">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
