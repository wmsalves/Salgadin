import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 text-center">

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-foreground-muted">
            <Link
              to="/terms"
              className="inline-flex min-h-11 items-center rounded-xl px-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Termos
            </Link>
            <Link
              to="/privacy"
              className="inline-flex min-h-11 items-center rounded-xl px-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Privacidade
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-foreground-subtle">
          © {new Date().getFullYear()} Salgadin. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
