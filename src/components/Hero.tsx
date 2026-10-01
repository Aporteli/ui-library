import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <section id="top" className="bg-blueprint border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-[1.1fr_1fr] md:items-center">
        {/* Left: copy */}
        <div>
          <h1 className="max-w-[14ch] font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            Build interfaces from measured parts.
          </h1>
          <p className="mt-6 max-w-[42ch] font-body text-lg leading-relaxed text-muted">
            A React component kit with fixed spacing, typed props, and
            accessible defaults out of the box. Every part ships with its
            own spec, so nothing in your interface is a guess.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button size="lg">Get started</Button>
            <a
              href="#components"
              className="font-body text-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-accent"
            >
              Browse components
            </a>
          </div>
        </div>

        {/* Right: annotated spec panel */}
        <div className="relative">
          <div className="relative border border-line-paper bg-paper p-10">
            <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-accent/70" />
            <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-accent/70" />
            <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-accent/70" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-accent/70" />

            <div className="font-mono text-[11px] text-ink/50">FIG. 01 — BUTTON</div>

            {/* Button with dimension callouts */}
            <div className="relative mx-auto mt-8 w-fit">
              <Button size="lg">Save changes</Button>

              {/* height line, left side */}
              <div className="absolute -left-7 top-0 bottom-0 border-l border-dashed border-accent/50" />
              <span className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap font-mono text-[10px] text-accent">
                44px
              </span>

              {/* width line, below */}
              <div className="absolute -bottom-6 left-0 right-0 border-t border-dashed border-accent/50" />
              <span className="absolute -bottom-[2.9rem] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-accent">
                168px
              </span>
            </div>

            <div className="mt-16 space-y-4">
              <Input placeholder="you@example.com" aria-label="Email" />
              <div className="flex items-center gap-2">
                <Badge>v2.4</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="success">a11y ready</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
