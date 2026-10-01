import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

type Variant = "solid" | "outline" | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  solid: "bg-ink text-paper",
  outline: "border border-ink/30 text-ink",
  success: "bg-success/10 text-success border border-success/30",
};

export function Badge({ className, variant = "solid", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium font-body",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
