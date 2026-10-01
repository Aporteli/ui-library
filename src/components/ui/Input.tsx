import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded border border-ink/25 bg-paper px-3 text-sm text-ink placeholder:text-ink/40 font-body outline-none focus-visible:border-accent",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
