"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { setUserRole } from "@/features/admin/actions";
import { ConfirmModal } from "./ConfirmModal";

export interface CustomerRoleToggleProps {
  userId: string;
  userName: string;
  currentRole: "customer" | "admin";
  isSelf: boolean;
}

const ERROR_LABEL: Record<string, string> = {
  cannot_change_own_role: "Can't change your own role",
  cannot_demote_last_admin: "Last admin — can't demote",
  not_found: "User not found",
  failed: "Failed"
};

export function CustomerRoleToggle({
  userId,
  userName,
  currentRole,
  isSelf
}: CustomerRoleToggleProps) {
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) {
    return <span className="text-[11px] text-ink-muted">(you)</span>;
  }

  const nextRole = currentRole === "admin" ? "customer" : "admin";
  const action = currentRole === "admin" ? "Demote" : "Promote";

  function doChange() {
    setError(null);
    startTransition(async () => {
      const res = await setUserRole(userId, nextRole);
      if (!res.ok) {
        setError(ERROR_LABEL[res.error ?? "failed"] ?? "Failed");
        return;
      }
      setConfirm(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink disabled:opacity-50"
      >
        {currentRole === "admin" ? (
          <>
            <ShieldOff className="h-3 w-3" /> Demote
          </>
        ) : (
          <>
            <ShieldCheck className="h-3 w-3" /> Promote
          </>
        )}
      </button>
      {error && <p className="mt-1 text-[10px] text-maroon">{error}</p>}
      <ConfirmModal
        open={confirm}
        title={`${action} ${userName}?`}
        body={
          currentRole === "admin"
            ? `${userName} will lose admin access immediately.`
            : `${userName} will gain full admin access to orders, products, customers, and settings.`
        }
        confirmLabel={action}
        danger={currentRole === "admin"}
        busy={pending}
        onConfirm={doChange}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
