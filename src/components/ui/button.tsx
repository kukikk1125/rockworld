import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

const variants = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-panel",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/95",
  outline: "border border-border/80 bg-white/85 hover:bg-white",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "hover:bg-white/70",
};

const sizes = {
  default: "h-11 px-4 py-2",
  sm: "h-9 rounded-xl px-3",
  lg: "h-12 rounded-2xl px-5 text-base",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
