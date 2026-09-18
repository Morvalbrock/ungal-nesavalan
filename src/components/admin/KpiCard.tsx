import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default"
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warn" | "success";
}) {
  const toneCls =
    tone === "warn"
      ? "bg-maroon/5 border-maroon/20"
      : tone === "success"
      ? "bg-gold/10 border-gold/20"
      : "bg-cream border-border";
  return (
    <div className={cn("rounded-card border p-5", toneCls)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.25em] text-ink-muted">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-ink-muted" />}
      </div>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
