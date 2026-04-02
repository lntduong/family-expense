import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
      <div
        className={cn("h-2 rounded-full bg-[hsl(var(--primary))] transition-all", value > 100 && "bg-[hsl(var(--destructive))]")}
        style={{ width: `${Math.min(value, 120)}%` }}
      />
    </div>
  );
}
