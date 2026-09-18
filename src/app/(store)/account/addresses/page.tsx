import type { Metadata } from "next";
import { AddressBook } from "@/components/account/AddressBook";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <section>
      <h2 className="font-display text-2xl">Addresses</h2>
      <p className="mt-1 text-sm text-ink-muted">Save the places we deliver to for a faster checkout.</p>
      <div className="mt-6">
        <AddressBook />
      </div>
    </section>
  );
}
