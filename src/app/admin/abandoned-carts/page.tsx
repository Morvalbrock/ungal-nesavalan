import { abandonedCartRepo, addressRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { AbandonedCartCard } from "@/components/admin/AbandonedCartCard";
import type { Address } from "@/types/address";

export const dynamic = "force-dynamic";
export const metadata = { title: "Abandoned carts" };

function appBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return "";
}

export default async function AdminAbandonedCartsPage() {
  const carts = await abandonedCartRepo.listActive();
  const now = Date.now();
  const base = appBaseUrl();

  const enriched = await Promise.all(
    carts.map(async (c) => {
      const [user, addresses] = await Promise.all([
        userRepo.findById(c.userId),
        addressRepo.listByUser(c.userId)
      ]);
      const defaultAddress: Address | undefined =
        addresses.find((a) => a.isDefault) ?? addresses[0];
      return { cart: c, user, defaultAddress };
    })
  );

  const totalValue = carts.reduce((n, c) => n + c.subtotalPaise, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Recovery</p>
        <h1 className="mt-2 font-display text-3xl">Abandoned carts</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Logged-in shoppers who added items but didn&apos;t complete checkout. Copy a one-click
          checkout URL and send it to the customer over WhatsApp or email.
        </p>
      </div>

      {carts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-border bg-white px-5 py-4">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Active carts</p>
            <p className="mt-1 font-display text-3xl">{carts.length}</p>
          </div>
          <div className="rounded-card border border-border bg-white px-5 py-4">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Potential revenue</p>
            <p className="mt-1 font-display text-3xl text-maroon">{formatINR(totalValue)}</p>
          </div>
          <div className="rounded-card border border-border bg-white px-5 py-4">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Notified</p>
            <p className="mt-1 font-display text-3xl">
              {carts.filter((c) => c.notifiedAt).length}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {enriched.length === 0 ? (
          <div className="rounded-card border border-border bg-white px-6 py-16 text-center">
            <p className="text-sm text-ink-muted">No active abandoned carts right now.</p>
          </div>
        ) : (
          enriched.map(({ cart, user, defaultAddress }) => {
            const ageHours = Math.round(
              (now - new Date(cart.updatedAt).getTime()) / (1000 * 60 * 60)
            );
            const checkoutUrl = `${base}/cart?restore=${cart.id}`;
            return (
              <AbandonedCartCard
                key={cart.id}
                cartId={cart.id}
                checkoutUrl={checkoutUrl}
                customer={{
                  name: user?.name ?? "",
                  email: user?.email ?? cart.email,
                  phone: user?.phone,
                  createdAt: user?.createdAt
                }}
                address={defaultAddress}
                items={cart.items}
                subtotalPaise={cart.subtotalPaise}
                ageHours={ageHours}
                updatedAt={cart.updatedAt}
                notifiedAt={cart.notifiedAt}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
