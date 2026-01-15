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
  { name: "Sáb", gasto: 60.0 },
  { name: "Dom", gasto: 35.0 },
];
const colors = [
  "#f59e0b",
  "#10b981",
  "#f59e0b",
  "#10b981",
  "#f59e0b",
  "#10b981",
  "#f59e0b",
];

const buttonStyles = {
  primary:
    "rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105",
  secondary:
    "rounded-lg border border-slate-300 dark:border-slate-600 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all",
};

export function HeroSection() {
  const { theme } = useTheme();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-20">
      <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
        <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
          Entenda seus gastos,
        </span>
        <br className="hidden sm:block" />
        <span className="text-slate-800 dark:text-white">sem complicação.</span>
      </h1>
      <p className="mt-6 text-center max-w-2xl mx-auto text-slate-600 dark:text-slate-300 text-lg">
        O Salgadin transforma seus "pequenos gastos" diários em gráficos simples
        e inteligentes. Assuma o controle financeiro de forma visual e
        intuitiva.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/signup" className={buttonStyles.primary}>
          Começar Gratuitamente
        </Link>
        <a href="#how" className={buttonStyles.secondary}>
          Ver como funciona
        </a>
      </div>

      <div className="relative mt-16">
        {/* Gráfico real com Recharts */}
        <div className="mx-auto h-[360px] w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl dark:shadow-slate-950/50">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
                tick={{ fill: "#94a3b8" }}
              />
              <Tooltip
                cursor={{
                  fill:
                    theme === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.05)",
                }}
                contentStyle={
                  theme === "dark"
                    ? {
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        backgroundColor: "#0f1720",
                        color: "#e6eef8",
                      }
                    : {
                        borderRadius: "12px",
                        border: "1px solid rgba(0,0,0,0.1)",
                        backgroundColor: "#ffffff",
                        color: "#1e293b",
                      }
                }
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

        {/* Badges animados */}
        <div className="absolute -right-2 -top-4 animate-float">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-950/50 px-3 py-1.5 text-xs">
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              Economia do mês
            </div>
            <div className="font-bold text-slate-900 dark:text-white">
              R$ 1.250,00
            </div>
          </div>
        </div>
        <div className="absolute -left-2 -bottom-5 animate-float [animation-delay:-1.5s]">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-950/50 px-3 py-1.5 text-xs">
            <div className="font-semibold text-amber-600 dark:text-amber-400">
              Metas do mês
            </div>
            <div className="font-bold text-slate-900 dark:text-white">
              3 de 5
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
