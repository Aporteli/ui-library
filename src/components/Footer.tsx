export function Footer() {
  return (
    <footer>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 font-body text-sm text-muted sm:flex-row sm:items-center">
        <span>uikit — built by Giorgi</span>
        <div className="flex gap-6">
          <a href="#components" className="hover:text-fg">
            Components
          </a>
          <a href="#code" className="hover:text-fg">
            Docs
          </a>
          <a href="https://github.com" className="hover:text-fg">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
