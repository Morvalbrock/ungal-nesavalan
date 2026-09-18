import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)} {...rest} />;
}
