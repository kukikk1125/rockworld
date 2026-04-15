import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/70 bg-card/88 text-card-foreground shadow-panel backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
