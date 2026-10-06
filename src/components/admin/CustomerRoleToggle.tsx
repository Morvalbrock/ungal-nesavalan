"use client";

import { useState, useTransition } from "react";
import { setUserRole } from "@/features/admin/actions";
import { ConfirmModal } from "./ConfirmModal";

export interface CustomerRoleToggleProps {
  userId: string;
  userName: string;
  currentRole: "customer" | "admin" | "super_admin";
  isSelf: boolean;
  canManage: boolean; // false → viewer is not super_admin, hide controls
}

const ERROR_LABEL: Record<string, string> = {
  cannot_change_own_role: "Can't change your own role",
  cannot_demote_last_admin: "Last admin — can't demote",
  cannot_demote_last_super_admin: "Last super admin — can't demote",
  not_found: "User not found",
  failed: "Failed"
};

const ROLE_LABEL: Record<string, string> = {
  customer: "Customer",
  admin: "Admin"
};

export function CustomerRoleToggle({
  userId,
  userName,
  currentRole,
  isSelf,
  canManage
}: CustomerRoleToggleProps) {
  const [pendingRole, setPendingRole] = useState<"customer" | "admin" | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) {
    return <span className="text-[11px] text-ink-muted">(you)</span>;
  }
  if (!canManage) {
    return null;
  }
  if (currentRole === "super_admin") {
    return <span className="text-[11px] text-ink-muted">(super admin)</span>;
  }

  function doChange() {
    if (!pendingRole) return;
    const target = pendingRole;
    setError(null);
    startTransition(async () => {
      const res = await setUserRole(userId, target);
      if (!res.ok) {
        setError(ERROR_LABEL[res.error ?? "failed"] ?? "Failed");
        return;
      }
      setPendingRole(null);
    });
  }

  return (
    <>
      <select
        value={currentRole}
        onChange={(e) => {
          const target = e.target.value as "customer" | "admin";
          if (target !== currentRole) setPendingRole(target);
        }}
        disabled={pending}
        className="rounded-card border border-border bg-white px-2 py-1 text-xs text-ink focus:border-ink focus:outline-none disabled:opacity-50"
        aria-label={`Change role for ${userName}`}
      >
        <option value="customer">Customer</option>
        <option value="admin">Admin</option>
      </select>
      {error && <p className="mt-1 text-[10px] text-maroon">{error}</p>}
      <ConfirmModal
        open={pendingRole !== null}
        title={pendingRole ? `Change ${userName} to ${ROLE_LABEL[pendingRole]}?` : ""}
        body={
          pendingRole === "customer"
            ? `${userName} will lose admin access immediately.`
            : `${userName} will gain admin access to orders, products, customers.`
        }
        confirmLabel="Change role"
        danger={pendingRole === "customer"}
        busy={pending}
        onConfirm={doChange}
        onCancel={() => setPendingRole(null)}
      />
    </>
  );
}
