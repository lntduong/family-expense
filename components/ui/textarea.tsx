import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground placeholder:font-normal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:border-muted-foreground/30 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
