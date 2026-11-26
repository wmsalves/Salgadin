import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const buttonStyles = {
  primary:
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-primary px-6 py-3 text-sm font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press",
  secondary:
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press",
};


export function CtaSection() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated
    ? "Ir para minha conta"
    : "Criar minha conta grátis";

  return (
    <section aria-labelledby="final-cta-title" className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <h2
          id="final-cta-title"
          className="text-3xl font-medium text-foreground sm:text-4xl"
        >
          Pronto para enxergar seus pequenos gastos?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-foreground-muted">
          Comece com lançamentos simples e veja cafés, lanches, delivery,
          mercado e transporte virarem uma visão clara do mês.
        </p>

        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link to={primaryHref} className={buttonStyles.primary}>
            {primaryLabel}
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className={buttonStyles.secondary}>
              Já tenho uma conta
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
