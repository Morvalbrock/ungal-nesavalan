import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getSession } from "@/features/auth/session";
import { shippingChargesRepo, userRepo } from "@/server/repositories";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  const user = session ? await userRepo.findById(session.userId) : null;

  const isDummyEmail = user
    ? user.email.endsWith("@phone.local") || user.email.endsWith("@firebase.local")
    : false;
  const isPhoneAsName = user
    ? user.name.startsWith("+") || /^\d+$/.test(user.name)
    : false;

  const [shippingCharges, shippingDefaults] = await Promise.all([
    shippingChargesRepo.list(),
    shippingChargesRepo.getDefaults()
  ]);

  return (
    <CheckoutFlow
      prefill={
        user
          ? {
              name: isPhoneAsName ? "" : user.name,
              email: isDummyEmail ? "" : user.email,
              phone: user.phone ?? ""
            }
          : { name: "", email: "", phone: "" }
      }
      shippingCharges={shippingCharges}
      shippingDefaults={shippingDefaults}
    />
  );
}
