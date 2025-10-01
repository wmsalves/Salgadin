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

// Dados de exemplo para o gráfico
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

// Estilos consistentes para os botões
const buttonStyles = {
  primary:
    "rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 transition-opacity",
  secondary:
    "rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition-colors",
};

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-16">
      <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
        <span className="text-emerald-600">Entenda seus gastos,</span>
        <br className="hidden sm:block" />
        <span className="text-amber-600">sem complicação.</span>
      </h1>
      <p className="mt-4 text-center max-w-2xl mx-auto text-gray-600">
        O Salgadin transforma seus "pequenos gastos" diários em gráficos simples
        e inteligentes. Assuma o controle financeiro de forma visual e
        intuitiva.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/signup" className={buttonStyles.primary}>
          Começar Gratuitamente
        </Link>
        <a href="#how" className={buttonStyles.secondary}>
          Ver como funciona
        </a>
      </div>

      <div className="relative mt-12">
        {/* Gráfico real com Recharts */}
        <div className="mx-auto h-[360px] w-full max-w-5xl rounded-2xl border border-black/10 bg-white p-4 shadow-inner">
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
                {chartData.map((entry, index) => (
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
