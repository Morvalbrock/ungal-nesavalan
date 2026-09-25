import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  avg: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5"
};

export function RatingStars({ avg, count, size = "md", showCount = true, className }: Props) {
  const rounded = Math.round(avg * 2) / 2;
  return (
    <div className={cn("inline-flex items-center gap-1 text-ink-muted", className)}>
      <div className="inline-flex" aria-label={`${avg.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.floor(rounded);
          const half = !filled && i - 0.5 === rounded;
          return (
            <Star
              key={i}
              className={cn(
                SIZES[size],
                filled ? "fill-amber-500 text-amber-500" : half ? "fill-amber-500/50 text-amber-500" : "text-ink-muted/40"
              )}
            />
          );
        })}
      </div>
      {showCount && typeof count === "number" && count > 0 && (
        <span className={cn("text-xs text-ink-muted", size === "lg" && "text-sm")}>
          {avg.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
