import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const HeroChartPreview = lazy(() =>
  import("./HeroChartPreview").then((module) => ({
    default: module.HeroChartPreview,
  })),
);

const trustCues = [
  "Sem cartão de crédito para começar",
  "Comece em poucos minutos",
  "Controle simples, sem planilhas",
];

const buttonStyles = {
  primary:
    "inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-6 py-3 text-sm font-medium text-[var(--color-on-primary)] shadow-[0_14px_30px_rgba(60,42,32,0.18)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)] hover:shadow-[0_18px_38px_rgba(60,42,32,0.22)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press ui-pressable",
  secondary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-primary/35 bg-surface px-6 py-3 text-sm font-medium text-primary-strong shadow-[0_10px_24px_rgba(60,42,32,0.08)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary hover:bg-surface-2 hover:text-primary-strong active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press ui-pressable",
};

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated
    ? "Acessar minha conta"
    : "Começar gratuitamente";
  const chartColors =
    theme === "dark"
      ? { regular: "#ff9d6c", attention: "#f6bf73" }
      : { regular: "#d96536", attention: "#a9651e" };

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 pb-20 pt-14 sm:pb-24 sm:pt-20 lg:pb-28"
    >
      <h1
        id="hero-heading"
        className="mx-auto max-w-sm text-center text-4xl font-medium text-foreground sm:max-w-4xl sm:text-5xl md:text-6xl"
      >
        Controle seus pequenos gastos{" "}
        <span className="text-primary">antes que eles cresçam.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xs text-center text-base text-foreground-muted sm:max-w-2xl sm:text-lg">
        Visualize, categorize e acompanhe os gastos que se repetem no dia a dia.
        O Salgadin foi feito para transformar lançamentos simples em clareza
        real sobre seus hábitos financeiros.
      </p>

      <div className="mx-auto mt-7 grid max-w-5xl gap-3 text-left md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-surface/80 px-4 py-4">
          <h2 className="text-sm font-medium text-foreground">Registro rápido</h2>
          <p className="mt-1.5 text-ui text-foreground-muted">
            Lance café, lanche, delivery, mercado ou transporte sem depender de planilhas.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/80 px-4 py-4">
          <h2 className="text-sm font-medium text-foreground">Leitura clara</h2>
          <p className="mt-1.5 text-ui text-foreground-muted">
            Veja o que pesa no mês com categorias, gráficos e resumos feitos para decisões práticas.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/80 px-4 py-4">
          <h2 className="text-sm font-medium text-foreground">Metas que avisam</h2>
          <p className="mt-1.5 text-ui text-foreground-muted">
            Defina um limite por categoria e receba um aviso antes de estourar o mês.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-xs flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
        <Link
          to={primaryHref}
          className={`${buttonStyles.primary} w-full sm:w-auto`}
        >
          {primaryLabel}
        </Link>
        <a href="#how" className={`${buttonStyles.secondary} w-full sm:w-auto`}>
          Ver como funciona
        </a>
      </div>

      <ul className="mx-auto mt-6 flex max-w-sm flex-col items-stretch justify-center gap-2 px-1 text-sm text-foreground-muted sm:max-w-3xl sm:flex-row sm:flex-wrap sm:items-center">
        {trustCues.map((cue) => (
          <li
            key={cue}
            className="inline-flex min-h-9 max-w-full items-center justify-center gap-2 px-2"
          >
            <CheckCircle2 size={16} className="text-success" aria-hidden />
            <span>{cue}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-14 sm:mt-16">
        <figure
          className="mx-auto w-full max-w-[22rem] min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface/95 p-4 shadow-[var(--shadow-card)] sm:max-w-5xl sm:p-6"
          aria-labelledby="weekly-chart-title"
          aria-describedby="weekly-chart-description weekly-chart-summary"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2
                id="weekly-chart-title"
                className="text-lg font-medium text-foreground sm:text-xl"
              >
                Pequenos gastos da semana
              </h2>
              <p
                id="weekly-chart-description"
                className="mt-1.5 max-w-xl text-ui text-foreground-muted"
              >
                Cada barra mostra despesas registradas manualmente no dia, como
                café, lanche, delivery, mercado e transporte.
              </p>
            </div>
            <ul
              aria-label="Legenda do gráfico"
              className="grid min-w-0 gap-2 text-ui text-foreground-muted sm:grid-cols-2 md:min-w-[310px]"
            >
              <li className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface-2/70 px-3 py-2">
                <span
                  className="h-3 w-3 rounded-full bg-[var(--chart-small-expense)]"
                  aria-hidden
                />
                Gasto dentro do ritmo
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface-2/70 px-3 py-2">
                <span
                  className="h-3 w-3 rounded-full bg-[var(--chart-high-expense)]"
                  aria-hidden
                />
                Dia que pede atenção
              </li>
            </ul>
          </div>

          <p id="weekly-chart-summary" className="sr-only">
            O gráfico mostra gastos de segunda a domingo com composição por
            categoria. Na terça-feira, por exemplo, foram R$ 20,00 com
            alimentação e R$ 50,00 com transporte. Sexta-feira foi o maior
            gasto, principalmente com delivery e mercado.
          </p>

          <div
            className="mt-6 max-w-full overflow-x-auto overflow-y-hidden pb-2 sm:overflow-visible"
            aria-hidden="true"
          >
            <div className="h-[340px] w-[640px] max-w-none sm:h-[360px] sm:w-full">
              <Suspense
                fallback={
                  <div className="h-full w-full rounded-2xl bg-surface-2/70 animate-pulse" />
                }
              >
                <HeroChartPreview chartColors={chartColors} />
              </Suspense>
            </div>
          </div>

          <figcaption className="mt-3 flex flex-col gap-2 rounded-2xl border border-border/70 bg-surface-2/60 px-4 py-3 text-ui text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
            <span>Terça: alimentação e transporte. Sexta: delivery e mercado no pico da semana.</span>
            <span className="font-medium text-primary">
              Total do exemplo: R$ 337,70
            </span>
          </figcaption>
        </figure>

      </div>
    </section>
  );
}
