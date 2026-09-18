import { AdminSidebar } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/features/admin/guard";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen bg-cream-warm/40">
      <AdminSidebar />
      <div className="flex-1">
        <div className="min-h-screen px-6 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
