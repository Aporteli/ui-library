"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";

interface SwitchProps {
  defaultChecked?: boolean;
  label?: string;
}

export function Switch({ defaultChecked, label }: SwitchProps) {
  const [checked, setChecked] = useState(!!defaultChecked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => setChecked((c) => !c)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-accent" : "bg-ink/20"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-paper transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
