"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const COMMAND = "npm install @giorgi/uikit";

export function InstallBar() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — fail silently, command is still selectable.
    }
  }

  return (
    <div className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-sm text-fg">
          <span className="text-muted">$ </span>
          {COMMAND}
        </code>
        <button
          onClick={handleCopy}
          className={cn(
            "shrink-0 border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-fg",
            copied && "border-accent text-accent"
          )}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
    </div>
  );
}
