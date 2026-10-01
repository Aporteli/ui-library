import { cn } from "@/lib/cn";
import { ReactNode } from "react";

function CornerTicks() {
  const base = "absolute h-2 w-2 border-accent/70";
  return (
    <>
      <span className={cn(base, "left-0 top-0 border-l border-t")} />
      <span className={cn(base, "right-0 top-0 border-r border-t")} />
      <span className={cn(base, "left-0 bottom-0 border-l border-b")} />
      <span className={cn(base, "right-0 bottom-0 border-r border-b")} />
    </>
  );
}

export function SpecFrame({
  id,
  name,
  children,
  className,
}: {
  id: string;
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative border border-line-paper bg-paper p-6",
        className
      )}
    >
      <CornerTicks />
      <div className="mb-5 flex items-baseline justify-between font-mono text-[11px] tracking-wide text-ink/50">
        <span>{id}</span>
        <span>{name}</span>
      </div>
      {children}
    </div>
  );
}
