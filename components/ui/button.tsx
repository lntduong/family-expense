import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-primary to-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:from-primary/95 hover:to-primary/85 active:from-primary/90 active:to-primary/80",
        outline:
          "border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-muted hover:border-muted-foreground/30 active:bg-muted/80",
        secondary:
          "bg-gradient-to-b from-secondary to-secondary/90 text-secondary-foreground shadow-md hover:shadow-lg hover:from-secondary/95 hover:to-secondary/85",
        ghost:
          "hover:bg-muted/80 hover:backdrop-blur-sm active:bg-muted",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/90 text-white shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:from-destructive/95 hover:to-destructive/85",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 text-sm",
        xs: "h-7 px-3 text-xs rounded-lg",
        sm: "h-8 px-4 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
