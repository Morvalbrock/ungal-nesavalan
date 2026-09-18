import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default function AccountProfilePage() {
  return (
    <section>
      <h2 className="font-display text-2xl">Profile</h2>
      <p className="mt-1 text-sm text-ink-muted">Keep your contact details up to date for smooth deliveries.</p>
      <div className="mt-6">
        <ProfileForm />
      </div>
    </section>
  );
}
