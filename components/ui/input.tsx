import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground placeholder:font-normal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:border-muted-foreground/30",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
