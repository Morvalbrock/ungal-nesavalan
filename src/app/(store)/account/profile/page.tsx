import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const metadata: Metadata = { title: "Profile" };

export default function AccountProfilePage() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Profile & Security</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your personal contact details and login security.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Contact Details
          </h3>
          <ProfileForm />
        </div>

        <div className="pt-4 border-t border-border/60">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Security & Password
          </h3>
          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}
