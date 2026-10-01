const principles = [
  {
    name: "Accessible by default",
    detail:
      "Keyboard focus, ARIA roles, and reduced-motion handling are built into every part — not an opt-in prop you have to remember.",
  },
  {
    name: "Themeable at the root",
    detail:
      "Every color and spacing value traces back to one token file. Change the palette once and the whole kit follows.",
  },
  {
    name: "Composable, not configurable",
    detail:
      "Parts are small and combine like primitives. You reach for props rarely, and for children and composition often.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {principles.map((p) => (
            <div key={p.name} className="border-t border-line pt-5">
              <h3 className="font-display text-lg font-medium text-fg">
                {p.name}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted">
                {p.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
