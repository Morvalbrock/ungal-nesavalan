import type { Metadata } from "next";
import { Suspense } from "react";
import { CartView } from "@/components/cart/CartView";
import { CartRestoreHandler } from "./CartRestoreHandler";

export const metadata: Metadata = { title: "Your Bag" };

export default function CartPage() {
  return (
    <>
      <Suspense fallback={null}>
        <CartRestoreHandler />
      </Suspense>
      <CartView />
    </>
  );
}
