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
    "rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all",
};

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-20">
      <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
        <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
          Entenda seus gastos,
        </span>
        <br className="hidden sm:block" />
        <span className="text-slate-800">sem complicação.</span>
      </h1>
      <p className="mt-6 text-center max-w-2xl mx-auto text-slate-600 text-lg">
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
        <div className="mx-auto h-[360px] w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="gasto" radius={[8, 8, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Badges animados */}
        <div className="absolute -right-2 -top-4 animate-float">
          <div className="rounded-xl border bg-white shadow-lg px-3 py-1.5 text-xs">
            <div className="font-semibold text-emerald-600">
              Economia do mês
            </div>
            <div className="font-bold">R$ 1.250,00</div>
          </div>
        </div>
        <div className="absolute -left-2 -bottom-5 animate-float [animation-delay:-1.5s]">
          <div className="rounded-xl border bg-white shadow-lg px-3 py-1.5 text-xs">
            <div className="font-semibold text-amber-600">Metas do mês</div>
            <div className="font-bold">3 de 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
