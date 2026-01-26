import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-sm",
        outline:
          "border border-primary/80 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-lg shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg shadow-sm",
        ghost: "hover:bg-muted hover:text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        // MainStreetIRL specific variants
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-semibold tracking-wide shadow-[0_4px_14px_0_hsl(var(--accent)/0.35)] hover:shadow-[0_6px_20px_0_hsl(var(--accent)/0.45)]",
        "accent-outline":
          "border border-accent/80 bg-transparent text-accent hover:bg-accent hover:text-accent-foreground rounded-lg font-semibold tracking-wide shadow-sm",
        nav: "text-primary hover:text-accent font-medium bg-transparent",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-10 text-base",
        icon: "h-10 w-10",
        nav: "h-auto px-0 py-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
