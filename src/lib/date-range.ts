// Shared time-range resolution. No React, no "use client" — safe to import from
// both server components (dashboard page) and client components (DashboardFilters).

export const RANGES: { value: string; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" }
];

export function resolveRange(raw: string | undefined): { from: Date | null; label: string } {
  const now = new Date();
  switch (raw) {
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      return { from, label: "Last 7 days" };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      return { from, label: "Last 30 days" };
    }
    case "all":
      return { from: null, label: "All time" };
    case "today":
    default: {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      return { from, label: "Today" };
    }
  }
}
