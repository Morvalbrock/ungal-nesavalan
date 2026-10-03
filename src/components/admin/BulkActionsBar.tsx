"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { useBulkSelect } from "./BulkSelect";
import { ConfirmModal } from "./ConfirmModal";

export interface BulkAction {
  key: string;
  label: string;
  danger?: boolean;
  requiresConfirm?: boolean;
  confirmTitle?: string;
  confirmBody?: (count: number) => string;
  run: (ids: string[]) => Promise<{ ok: boolean; error?: string }>;
}

export interface BulkActionsBarProps {
  actions: BulkAction[];
  entityLabel?: string;
}

export function BulkActionsBar({ actions, entityLabel = "item" }: BulkActionsBarProps) {
  const router = useRouter();
  const selected = useBulkSelect((s) => s.selected);
  const clear = useBulkSelect((s) => s.clear);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const count = selected.size;
  if (count === 0) return null;

  const ids = Array.from(selected);
  const noun = count === 1 ? entityLabel : `${entityLabel}s`;

  function execute(action: BulkAction) {
    setError(null);
    startTransition(async () => {
      const res = await action.run(ids);
      if (!res.ok) {
        setError(res.error ?? "failed");
        return;
      }
      clear();
      setPendingAction(null);
      router.refresh();
    });
  }

  function handleClick(action: BulkAction) {
    if (action.requiresConfirm) {
      setPendingAction(action);
    } else {
      execute(action);
    }
  }

  return (
    <>
      <div className="sticky bottom-4 z-30 mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-card border border-ink/20 bg-ink p-3 text-cream shadow-elev">
        <span className="pl-2 text-sm">
          <strong>{count}</strong> {noun} selected
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              disabled={pending}
              onClick={() => handleClick(a)}
              className={`rounded-card px-3 py-1.5 text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
                a.danger
                  ? "bg-maroon text-cream hover:bg-maroon-deep"
                  : "bg-cream/10 text-cream hover:bg-cream/20"
              }`}
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            onClick={clear}
            disabled={pending}
            className="ml-1 rounded-card p-1.5 text-cream/70 hover:bg-cream/10 hover:text-cream disabled:opacity-50"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="w-full text-right text-xs text-maroon-soft">{error}</p>
        )}
      </div>

      {pendingAction && (
        <ConfirmModal
          open
          title={pendingAction.confirmTitle ?? `${pendingAction.label}?`}
          body={
            pendingAction.confirmBody
              ? pendingAction.confirmBody(count)
              : `This will ${pendingAction.label.toLowerCase()} ${count} ${noun}.`
          }
          confirmLabel={pendingAction.label}
          danger={pendingAction.danger}
          busy={pending}
          onConfirm={() => execute(pendingAction)}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}
