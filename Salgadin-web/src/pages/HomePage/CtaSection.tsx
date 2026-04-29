import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const buttonStyles = {
  primary:
    "inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-6 py-3 font-semibold text-[var(--color-on-primary)] shadow-[0_14px_30px_rgba(60,42,32,0.18)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)] hover:shadow-[0_18px_38px_rgba(60,42,32,0.22)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press ui-pressable",
  secondary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-primary/35 bg-surface px-6 py-3 font-semibold text-primary-strong shadow-[0_10px_24px_rgba(60,42,32,0.08)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary hover:bg-surface-2 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press ui-pressable",
};

const trustItems = [
  "Feito para visualizar gastos do dia a dia",
  "Sem cartão de crédito para começar",
  "Organize tudo sem planilhas complicadas",
];

export function CtaSection() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated
    ? "Ir para minha conta"
    : "Criar minha conta grátis";

  return (
    <section aria-labelledby="final-cta-title" className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2
          id="final-cta-title"
          className="text-3xl font-extrabold text-foreground"
        >
          Pronto para enxergar seus pequenos gastos?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-foreground-muted">
          Comece com lançamentos simples e veja cafés, lanches, delivery,
          mercado e transporte virarem uma visão clara do mês.
        </p>

        <ul className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2 text-sm text-foreground-muted">
          {trustItems.map((item) => (
            <li
              key={item}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border/80 bg-surface/80 px-3 py-1.5"
            >
              <CheckCircle2 size={16} className="text-success" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

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
