import { couponRepo } from "@/server/repositories";
import { CouponsClient } from "./CouponsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await couponRepo.list();
  return <CouponsClient initialCoupons={coupons} />;
}
