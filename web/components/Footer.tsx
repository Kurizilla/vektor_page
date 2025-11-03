export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-3 text-sm text-muted">
          <img src="/lyr-logo-horizontal.svg" alt="LYR.io" className="h-6 w-auto" />
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <a href="mailto:contacto@lyr.io" className="hover:text-foreground">Email</a>
          <a href="#" className="hover:text-foreground">LinkedIn</a>
          <a href="#" className="hover:text-foreground">Privacidad</a>
        </nav>
      </div>
    </footer>
  );
}


