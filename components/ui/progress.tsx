import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-[hsl(var(--muted))]", className)} {...props}>
      <div
        className={cn("h-full rounded-full bg-[hsl(var(--primary))] transition-all", value > 100 && "bg-[hsl(var(--destructive))]")}
        style={{ width: `${Math.min(value, 120)}%` }}
      />
    </div>
  );
}
