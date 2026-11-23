import Link from "next/link";
import { PolicyForm } from "@/components/admin/PolicyForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Policy Page — Admin" };

export default function NewPolicyPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/policies" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Legal &amp; Policies
        </Link>
        <h1 className="mt-2 font-display text-3xl">New Policy Page</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Create a new policy, terms, or customer care compliance document.
        </p>
      </header>
      <PolicyForm />
    </div>
  );
}
