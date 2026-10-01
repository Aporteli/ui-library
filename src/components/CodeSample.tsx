const CODE = `import { Button, Input, Badge } from "@giorgi/uikit";

export function SignupForm() {
  return (
    <form className="space-y-3">
      <Input placeholder="you@example.com" />
      <Button size="lg">Create account</Button>
      <Badge variant="success">No credit card</Badge>
    </form>
  );
}`;

export function CodeSample() {
  const lines = CODE.split("\n");

  return (
    <section id="code" className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight">
            Import it. Use it. Done.
          </h2>
          <p className="mt-4 max-w-[42ch] font-body text-muted">
            No config step, no theme provider to wire up first. Parts are
            styled the moment they render, and every prop is typed —
            autocomplete does the rest.
          </p>
        </div>

        <div className="border border-line bg-paper/[0.03]">
          <div className="border-b border-line px-4 py-2 font-mono text-[11px] text-muted">
            SignupForm.tsx
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-4 w-4 shrink-0 select-none text-line-paper/60">
                  {i + 1}
                </span>
                <span className="text-fg/90">{line || " "}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </section>
  );
}
