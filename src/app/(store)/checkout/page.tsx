import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getSession } from "@/features/auth/session";
import { shippingChargesRepo, userRepo } from "@/server/repositories";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");
  const user = await userRepo.findById(session.userId);
  if (!user) redirect("/login?next=/checkout");

  const isDummyEmail = user.email.endsWith("@phone.local") || user.email.endsWith("@firebase.local");
  const isPhoneAsName = user.name.startsWith("+") || /^\d+$/.test(user.name);

  const [shippingCharges, shippingDefaults] = await Promise.all([
    shippingChargesRepo.list(),
    shippingChargesRepo.getDefaults()
  ]);

  return (
    <CheckoutFlow
      prefill={{
        name: isPhoneAsName ? "" : user.name,
        email: isDummyEmail ? "" : user.email,
        phone: user.phone ?? ""
      }}
      shippingCharges={shippingCharges}
      shippingDefaults={shippingDefaults}
    />
  );
}
