import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getSession } from "@/features/auth/session";

const NAV = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" }
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <Container className="py-12">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Account</p>
        <h1 className="mt-2 font-display text-4xl">Hello, {session?.name?.split(" ")[0] ?? "there"}</h1>
      </div>
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex flex-col gap-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-card px-3 py-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
            <form action="/api/auth/logout" method="post" className="mt-4">
              <button type="submit" className="w-full rounded-card px-3 py-2 text-left text-sm text-maroon hover:bg-maroon/5">
                Sign out
              </button>
            </form>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </Container>
  );
}
