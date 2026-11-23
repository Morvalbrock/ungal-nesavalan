import Link from "next/link";
import { notFound } from "next/navigation";
import { policyRepo } from "@/server/repositories";
import { PolicyForm } from "@/components/admin/PolicyForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = await policyRepo.findById(id);
  return { title: policy ? `${policy.title} — Admin` : "Edit Policy" };
}

export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = await policyRepo.findById(id);
  if (!policy) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/policies" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Legal &amp; Policies
        </Link>
        <h1 className="mt-2 font-display text-3xl">Edit: {policy.title}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Modify policy terms, effective date, and publish updates to the live storefront.
        </p>
      </header>
      <PolicyForm initialPolicy={policy} />
    </div>
  );
}
