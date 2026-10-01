import { Button } from '@/components/ui/Button';

const links = [
  { label: 'Components', href: '#components' },
  { label: 'Principles', href: '#principles' },
  { label: 'Code', href: '#code' },
  { label: 'lab', href: './lab' },
];

export function Navbar() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-medium">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" className="text-accent" />
            <path d="M9 3v3M9 12v3M3 9h3M12 9h3" stroke="currentColor" className="text-accent" />
          </svg>
          uikit
        </a>

        <nav className="hidden items-center gap-8 font-body text-sm text-muted md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            className="hidden font-body text-sm text-muted transition-colors hover:text-fg sm:inline">
            GitHub
          </a>
          <Button size="sm" variant="outline" className="border-fg/25 text-fg hover:border-fg">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
