import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

const chartData = [
  { name: "Seg", gasto: 15.5, detalhe: "café e transporte", level: "regular" },
  { name: "Ter", gasto: 27.0, detalhe: "lanche", level: "regular" },
  { name: "Qua", gasto: 45.8, detalhe: "mercado", level: "attention" },
  { name: "Qui", gasto: 22.3, detalhe: "transporte", level: "regular" },
  {
    name: "Sex",
    gasto: 89.1,
    detalhe: "delivery e mercado",
    level: "attention",
  },
  { name: "Sab", gasto: 60.0, detalhe: "lazer", level: "attention" },
  { name: "Dom", gasto: 35.0, detalhe: "padaria", level: "regular" },
];

const trustCues = [
  "Sem cartão de crédito",
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
    : "Começar gratuitamente";
  const chartColors =
    theme === "dark"
      ? { regular: "#ff9d6c", attention: "#f6bf73" }
      : { regular: "#d96536", attention: "#a9651e" };

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 pb-16 pt-12 sm:pb-20 sm:pt-16"
    >
      <h1
        id="hero-heading"
        className="mx-auto max-w-xs text-center text-4xl font-extrabold leading-[1.08] sm:max-w-none sm:text-5xl md:text-6xl"
      >
        <span className="bg-gradient-to-r from-[var(--brand-from-strong)] to-[var(--brand-to-strong)] bg-clip-text text-transparent">
          Entenda seus <br className="sm:hidden" />
          gastos,
        </span>
        <br />
        <span className="text-foreground"> sem complicação.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xs text-center text-base leading-8 text-foreground-muted sm:max-w-2xl sm:text-lg">
        O Salgadin ajuda você a enxergar cafés, lanches, delivery, mercado e
        transporte em gráficos simples, para decidir melhor sem planilhas
        complicadas.
      </p>

      <div className="mx-auto mt-9 flex max-w-xs flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
        <Link to={primaryHref} className={`${buttonStyles.primary} w-full sm:w-auto`}>
          {primaryLabel}
        </Link>
        <a href="#how" className={`${buttonStyles.secondary} w-full sm:w-auto`}>
          Ver como funciona
        </a>
      </div>

      <ul className="mx-auto mt-5 flex max-w-xs flex-col items-stretch justify-center gap-2 px-1 text-sm text-foreground-muted sm:max-w-3xl sm:flex-row sm:flex-wrap sm:items-center">
        {trustCues.map((cue) => (
          <li
            key={cue}
            className="inline-flex min-h-9 max-w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-surface/70 px-3 py-1.5 shadow-[0_8px_20px_rgba(60,42,32,0.06)]"
          >
            <CheckCircle2 size={16} className="text-success" aria-hidden />
            <span>{cue}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-16">
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
                café, lanche, delivery, mercado e transporte.
              </p>
            </div>
            <ul
              aria-label="Legenda do gráfico"
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
                Dia que pede atenção
              </li>
            </ul>
          </div>

          <p id="weekly-chart-summary" className="sr-only">
            O gráfico mostra gastos de segunda a domingo: segunda R$ 15,50,
            terça R$ 27,00, quarta R$ 45,80, quinta R$ 22,30, sexta R$ 89,10,
            sábado R$ 60,00 e domingo R$ 35,00. Sexta-feira foi o maior gasto,
            principalmente com delivery e mercado.
          </p>

          <div
            className="mt-6 max-w-full overflow-x-auto overflow-y-hidden pb-2 sm:overflow-visible"
            aria-hidden="true"
          >
            <div className="h-[280px] w-[560px] max-w-none sm:w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 18, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--chart-muted)", fontSize: 13 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(value) => `R$ ${value}`}
                    tick={{ fill: "var(--chart-muted)", fontSize: 13 }}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="var(--chart-reference)"
                    strokeDasharray="5 5"
                    label={{
                      value: "ritmo do dia",
                      position: "insideTopRight",
                      fill: "var(--color-text-muted)",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    animationDuration={0}
                    allowEscapeViewBox={{ x: false, y: false }}
                    cursor={{ fill: "var(--color-surface-2)" }}
                    formatter={(value, _name, item) => [
                      `${formatCurrency(Number(value))} em ${
                        item.payload.detalhe
                      }`,
                      "Gasto registrado",
                    ]}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      boxShadow: "var(--shadow-card)",
                    }}
                    itemStyle={{ color: "var(--color-text)" }}
                    labelStyle={{
                      color: "var(--color-text-muted)",
                      fontWeight: 700,
                    }}
                    wrapperStyle={{
                      outline: "none",
                      pointerEvents: "none",
                      transition: "none",
                    }}
                  />
                  <Bar
                    dataKey="gasto"
                    fill={chartColors.regular}
                    maxBarSize={48}
                    radius={[10, 10, 4, 4]}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.level === "attention"
                            ? chartColors.attention
                            : chartColors.regular
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <figcaption className="mt-3 flex flex-col gap-2 rounded-2xl border border-border/70 bg-surface-2/60 px-4 py-3 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              Pico da semana: sexta-feira, {formatCurrency(89.1)} em delivery e
              mercado.
            </span>
            <span className="font-semibold text-primary">
              Total do exemplo: {formatCurrency(294.7)}
            </span>
          </figcaption>
        </figure>

        <div className="absolute -right-2 -top-4 hidden animate-float sm:block">
          <div className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs shadow-[0_14px_32px_rgba(60,42,32,0.16)]">
            <div className="font-semibold text-accent">Economia do mês</div>
            <div className="font-bold text-foreground">R$ 1.250,00</div>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-2 hidden animate-float [animation-delay:-1.5s] sm:block">
          <div className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs shadow-[0_14px_32px_rgba(60,42,32,0.16)]">
            <div className="font-semibold text-primary">Metas do mês</div>
            <div className="font-bold text-foreground">3 de 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
