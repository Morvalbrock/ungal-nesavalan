import { orderRepo, returnRepo, userRepo } from "@/server/repositories";
import { ReturnsClient } from "./ReturnsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Returns" };

export default async function AdminReturnsPage() {
  const rows = await returnRepo.listAll();
  const enriched = await Promise.all(
    rows.map(async (r) => {
      const [order, user] = await Promise.all([orderRepo.findById(r.orderId), userRepo.findById(r.userId)]);
      return {
        request: r,
        orderNumber: order?.orderNumber ?? "—",
        totalPaise: order?.totalPaise ?? 0,
        customerName: user?.name ?? "—",
        customerEmail: user?.email ?? ""
      };
    })
  );
  return <ReturnsClient rows={enriched} />;
}
