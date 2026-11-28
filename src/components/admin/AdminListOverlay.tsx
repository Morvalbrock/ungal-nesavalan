"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAdminListLoadingStore } from "@/features/admin/list-loading.store";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function AdminListOverlay({ children, label = "Loading…", className }: Props) {
  const isLoading = useAdminListLoadingStore((s) => s.isLoading);

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-16 bg-white/60 backdrop-blur-[2px] rounded-card transition-all duration-200"
        >
          <div className="sticky top-24 flex items-center gap-3 px-4 py-2.5 rounded-full bg-ink text-cream shadow-xl border border-ink/30 animate-in fade-in zoom-in-95 duration-200">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            <span className="text-xs font-semibold tracking-wide">{label}</span>
          </div>
        </div>
      )}
      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading && "opacity-40 pointer-events-none select-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}
