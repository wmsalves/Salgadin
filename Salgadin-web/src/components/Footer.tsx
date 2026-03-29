import { Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[var(--bg-via)] to-[var(--bg-to)] border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3 rounded-full bg-surface-2 px-4 py-2 shadow-[0_12px_30px_rgba(60,42,32,0.08)]">
            <a
              href="#"
              aria-label="Twitter"
              className="h-9 w-9 rounded-full bg-surface text-foreground-subtle hover:text-foreground hover:bg-surface-2 grid place-items-center transition"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="h-9 w-9 rounded-full bg-surface text-foreground-subtle hover:text-foreground hover:bg-surface-2 grid place-items-center transition"
            >
              <Instagram size={18} />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-foreground-muted">
            <Link to="/termos" className="hover:text-primary transition-colors">
              Termos
            </Link>
            <Link
              to="/privacidade"
              className="hover:text-primary transition-colors"
            >
              Privacidade
            </Link>
            <Link
              to="/contato"
              className="hover:text-primary transition-colors"
            >
              Contato
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6 text-center text-xs text-foreground-subtle">
          © {new Date().getFullYear()} Salgadin. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
