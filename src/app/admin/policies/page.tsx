import { policyRepo } from "@/server/repositories";
import { PoliciesClient } from "@/components/admin/PoliciesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Legal & Policies — Admin" };

export default async function AdminPoliciesPage() {
  const policies = await policyRepo.list();
  return <PoliciesClient initialPolicies={policies} />;
}
