import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import logo from "../../assets/logo.svg";

const HeroChartPreview = lazy(() =>
  import("./HeroChartPreview").then((module) => ({
    default: module.HeroChartPreview,
  })),
);

const trustCues = [
  "Sem cartao de credito para comecar",
  "Comece em poucos minutos",
  "Controle simples, sem planilhas",
];

const buttonStyles = {
  primary:
    "inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-[0_14px_30px_rgba(60,42,32,0.18)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)] hover:shadow-[0_18px_38px_rgba(60,42,32,0.22)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press ui-pressable",
  secondary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-primary/35 bg-surface px-6 py-3 text-sm font-semibold text-primary-strong shadow-[0_10px_24px_rgba(60,42,32,0.08)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary hover:bg-surface-2 hover:text-primary-strong active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 soft-press ui-pressable",
};

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated
    ? "Acessar minha conta"
    : "Comecar gratuitamente";
  const chartColors =
    theme === "dark"
      ? { regular: "#ff9d6c", attention: "#f6bf73" }
      : { regular: "#d96536", attention: "#a9651e" };

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24"
    >
      <div className="mx-auto mb-8 flex max-w-xs items-center justify-center gap-3 rounded-full border border-border/70 bg-surface/80 px-4 py-2 shadow-[0_10px_24px_rgba(60,42,32,0.08)] sm:max-w-fit">
        <img
          src={logo}
          alt=""
          width="34"
          height="34"
          decoding="async"
          className="h-8 w-auto object-contain"
          aria-hidden="true"
        />
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
            Salgadin
          </span>
        </span>
      </div>
      <h1
        id="hero-heading"
        className="mx-auto max-w-sm text-center text-[2.6rem] font-extrabold leading-[1.04] sm:max-w-4xl sm:text-5xl md:text-6xl"
      >
        <span className="bg-gradient-to-r from-[var(--brand-from-strong)] to-[var(--brand-to-strong)] bg-clip-text text-transparent">
          Controle seus pequenos gastos
        </span>
        <br />
        <span className="text-foreground">antes que eles crescam.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xs text-center text-base leading-8 text-foreground-muted sm:max-w-3xl sm:text-lg">
        Visualize, categorize e acompanhe os gastos que se repetem no dia a dia.
        O Salgadin foi feito para transformar lancamentos simples em clareza
        real sobre seus habitos financeiros.
      </p>

      <div className="mx-auto mt-7 grid max-w-5xl gap-3 text-left md:grid-cols-3">
        <div className="ui-card rounded-2xl border border-border/70 bg-surface/80 px-4 py-4 shadow-[0_10px_24px_rgba(60,42,32,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Registro rapido
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            Lance cafe, lanche, delivery, mercado ou transporte sem depender de planilhas.
          </p>
        </div>
        <div className="ui-card rounded-2xl border border-border/70 bg-surface/80 px-4 py-4 shadow-[0_10px_24px_rgba(60,42,32,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
            Leitura clara
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            Veja o que pesa no mes com categorias, graficos e resumos feitos para decisoes praticas.
          </p>
        </div>
        <div className="ui-card rounded-2xl border border-border/70 bg-surface/80 px-4 py-4 shadow-[0_10px_24px_rgba(60,42,32,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Evolucao do produto
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            WhatsApp e recursos Pro estao em preparacao, sem promessas artificiais na experiencia atual.
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
            className="ui-surface-interactive inline-flex min-h-9 max-w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-surface/70 px-3 py-1.5 shadow-[0_8px_20px_rgba(60,42,32,0.06)]"
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
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                Exemplo visual
              </p>
              <h2
                id="weekly-chart-title"
                className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl"
              >
                Pequenos gastos da semana
              </h2>
              <p
                id="weekly-chart-description"
                className="mt-2 max-w-xl text-sm leading-6 text-foreground-muted"
              >
                Cada barra mostra despesas registradas manualmente no dia, como
                cafe, lanche, delivery, mercado e transporte.
              </p>
            </div>
            <ul
              aria-label="Legenda do grafico"
              className="grid min-w-0 gap-2 text-sm text-foreground-muted sm:grid-cols-2 md:min-w-[310px]"
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
                Dia que pede atencao
              </li>
            </ul>
          </div>

          <p id="weekly-chart-summary" className="sr-only">
            O grafico mostra gastos de segunda a domingo com composicao por
            categoria. Na terca-feira, por exemplo, foram R$ 20,00 com
            alimentacao e R$ 50,00 com transporte. Sexta-feira foi o maior
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

          <figcaption className="mt-3 flex flex-col gap-2 rounded-2xl border border-border/70 bg-surface-2/60 px-4 py-3 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
            <span>Terça: alimentação e transporte. Sexta: delivery e mercado no pico da semana.</span>
            <span className="font-semibold text-primary">
              Total do exemplo: R$ 337,70
            </span>
          </figcaption>
        </figure>

        <div className="absolute -right-2 -top-4 hidden animate-float sm:block">
          <div className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs shadow-[0_14px_32px_rgba(60,42,32,0.16)]">
            <div className="font-semibold text-accent">Economia do mes</div>
            <div className="font-bold text-foreground">R$ 1.250,00</div>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-2 hidden animate-float [animation-delay:-1.5s] sm:block">
          <div className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs shadow-[0_14px_32px_rgba(60,42,32,0.16)]">
            <div className="font-semibold text-primary">Metas do mes</div>
            <div className="font-bold text-foreground">3 de 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
