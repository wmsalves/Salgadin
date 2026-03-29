import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";

function adjustHex(hex: string, amount: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const chartData = [
  { name: "Seg", gasto: 15.5 },
  { name: "Ter", gasto: 27.0 },
  { name: "Qua", gasto: 45.8 },
  { name: "Qui", gasto: 22.3 },
  { name: "Sex", gasto: 89.1 },
  { name: "Sab", gasto: 60.0 },
  { name: "Dom", gasto: 35.0 },
];
const colors = [
  "#f28b5b",
  "#f5b36b",
  "#f28b5b",
  "#f5b36b",
  "#f28b5b",
  "#f5b36b",
  "#f28b5b",
];

const buttonStyles = {
  primary:
    "rounded-lg bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] soft-press ui-pressable",
  secondary:
    "rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground-muted hover:bg-surface-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] soft-press ui-pressable",
};

export function HeroSection() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated
    ? "Acessar minha conta"
    : "Comecar Gratuitamente";

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-20">
      <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
        <span className="bg-gradient-to-r from-[var(--brand-from-strong)] to-[var(--brand-to-strong)] bg-clip-text text-transparent">
          Entenda seus gastos,
        </span>
        <br className="hidden sm:block" />
        <span className="text-foreground"> sem complicacao.</span>
      </h1>
      <p className="mt-6 text-center max-w-2xl mx-auto text-foreground-muted text-lg">
        O Salgadin transforma seus "pequenos gastos" diarios em graficos simples
        e inteligentes. Assuma o controle financeiro de forma visual e
        intuitiva.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <Link to={primaryHref} className={buttonStyles.primary}>
          {primaryLabel}
        </Link>
        <a href="#how" className={buttonStyles.secondary}>
          Ver como funciona
        </a>
      </div>

      <div className="relative mt-16">
        <div className="mx-auto h-[360px] w-full max-w-5xl rounded-2xl border border-border bg-surface p-6 shadow-xl ">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--chart-muted)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
                tick={{ fill: "var(--chart-muted)" }}
              />
              <Tooltip
                cursor={{
                  fill:
                    theme === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.05)",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
                itemStyle={{ color: "var(--color-text)" }}
                labelStyle={{ color: "var(--color-text-muted)" }}
              />
              <Bar dataKey="gasto" radius={[8, 8, 0, 0]}>
                {chartData.map((_entry, index) => {
                  const base = colors[index % colors.length];
                  const fill = theme === "dark" ? adjustHex(base, 18) : base;
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute -right-2 -top-4 animate-float">
          <div className="rounded-xl border border-border bg-surface shadow-lg px-3 py-1.5 text-xs">
            <div className="font-semibold text-accent">Economia do mes</div>
            <div className="font-bold text-foreground">R$ 1.250,00</div>
          </div>
        </div>
        <div className="absolute -left-2 -bottom-5 animate-float [animation-delay:-1.5s]">
          <div className="rounded-xl border border-border bg-surface shadow-lg px-3 py-1.5 text-xs">
            <div className="font-semibold text-primary">Metas do mes</div>
            <div className="font-bold text-foreground">3 de 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
