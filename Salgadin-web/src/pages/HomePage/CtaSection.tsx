import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const buttonStyles = {
  primary:
    "rounded-full bg-primary hover:bg-primary-strong text-white px-5 py-2.5 shadow font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] soft-press ui-pressable",
  secondary:
    "rounded-full border border-border px-5 py-2.5 hover:bg-surface-2 font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-foreground-muted soft-press ui-pressable",
};

export function CtaSection() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated
    ? "Ir para minha conta"
    : "Criar minha conta gratis";

  return (
    <section className="mt-6 bg-gradient-to-tr from-[var(--brand-from)]/20 via-[var(--bg-via)] to-[var(--brand-to)]/20">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h3 className="text-3xl font-extrabold text-foreground">
          Pronto para assumir o controle?
        </h3>
        <p className="mt-3 text-foreground-muted max-w-2xl mx-auto">
          Diga adeus as planilhas complicadas e ola para a clareza financeira.
          Comece a usar o Salgadin gratuitamente e veja seu dinheiro render
          mais.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={primaryHref} className={buttonStyles.primary}>
            {primaryLabel}
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className={buttonStyles.secondary}>
              Ja tenho uma conta
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
