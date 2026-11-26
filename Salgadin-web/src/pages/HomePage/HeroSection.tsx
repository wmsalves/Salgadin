import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ProductPreview } from "./ProductPreview";

const trustCues = [
  "Grátis para começar",
  "Sem conectar sua conta do banco",
  "Funciona no celular e no computador",
];

const buttonStyles = {
  primary:
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-primary px-6 py-3 text-sm font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press",
  secondary:
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press",
};

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated ? "Acessar minha conta" : "Começar grátis";

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-7xl min-w-0 px-4 pb-20 pt-14 sm:pb-24 sm:pt-20"
    >
      <h1
        id="hero-heading"
        className="mx-auto max-w-sm text-center text-4xl font-medium text-foreground sm:max-w-4xl sm:text-5xl md:text-6xl"
      >
        Controle seus pequenos gastos{" "}
        <span className="text-primary">antes que eles cresçam.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xs text-center text-base text-foreground-muted sm:max-w-2xl sm:text-lg">
        Registre um café em dois segundos e saiba, todo dia, quanto ainda dá para gastar até o
        fim do mês.
      </p>

      <div className="mx-auto mt-9 flex max-w-xs flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
        <Link to={primaryHref} className={`${buttonStyles.primary} w-full sm:w-auto`}>
          {primaryLabel}
        </Link>
        <a href="#efeito" className={`${buttonStyles.secondary} w-full sm:w-auto`}>
          Fazer o teste do efeito coxinha
        </a>
      </div>

      <ul className="mx-auto mt-5 flex max-w-sm flex-col items-center justify-center gap-x-5 gap-y-1 text-ui text-foreground-muted sm:max-w-3xl sm:flex-row sm:flex-wrap">
        {trustCues.map((cue) => (
          <li key={cue} className="inline-flex min-h-8 items-center gap-1.5">
            <CheckCircle2 size={15} className="text-success" aria-hidden />
            <span>{cue}</span>
          </li>
        ))}
      </ul>

      <div className="mt-14 sm:mt-16">
        <ProductPreview />
      </div>
    </section>
  );
}
