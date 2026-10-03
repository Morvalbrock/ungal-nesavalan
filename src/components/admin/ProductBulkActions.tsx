"use client";

import {
  bulkDeleteProducts,
  bulkSetProductFeatured,
  bulkSetProductPublished
} from "@/features/admin/actions";
import { BulkActionsBar, type BulkAction } from "./BulkActionsBar";

export function ProductBulkActions({ canDelete }: { canDelete: boolean }) {
  const actions: BulkAction[] = [
    {
      key: "live",
      label: "Set Live",
      run: (ids) => bulkSetProductPublished(ids, true)
    },
    {
      key: "draft",
      label: "Set Draft",
      run: (ids) => bulkSetProductPublished(ids, false)
    },
    {
      key: "feature",
      label: "Feature",
      run: (ids) => bulkSetProductFeatured(ids, true)
    },
    {
      key: "unfeature",
      label: "Unfeature",
      run: (ids) => bulkSetProductFeatured(ids, false)
    }
  ];

  if (canDelete) {
    actions.push({
      key: "delete",
      label: "Delete",
      danger: true,
      requiresConfirm: true,
      confirmTitle: "Delete products?",
      confirmBody: (n) => `${n} product${n === 1 ? "" : "s"} will be permanently removed.`,
      run: (ids) => bulkDeleteProducts(ids)
    });
  }

  return <BulkActionsBar actions={actions} entityLabel="product" />;
}
