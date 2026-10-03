"use client";

import { bulkUpdateOrderStatus } from "@/features/admin/actions";
import { BulkActionsBar, type BulkAction } from "./BulkActionsBar";

export function OrderBulkActions() {
  const actions: BulkAction[] = [
    {
      key: "pack",
      label: "Mark Packed",
      run: (ids) => bulkUpdateOrderStatus(ids, "packed")
    },
    {
      key: "ship",
      label: "Mark Shipped",
      run: (ids) => bulkUpdateOrderStatus(ids, "shipped")
    },
    {
      key: "deliver",
      label: "Mark Delivered",
      run: (ids) => bulkUpdateOrderStatus(ids, "delivered")
    }
  ];
  return <BulkActionsBar actions={actions} entityLabel="order" />;
}
