import {
  Pizza,
  Bus,
  ShoppingCart,
  Laptop,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Target,
  Fuel,
  House,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import clsx from "clsx";

// --- Dados para o Gráfico de Pizza ---
const pieData = [
  { name: "Alimentação", value: 450 },
  { name: "Transporte", value: 220 },
  { name: "Compras", value: 180 },
  { name: "Outros", value: 130 },
];
const PIE_COLORS = ["#10b981", "#f59e0b", "#8b5cf6", "#3b82f6"];

// --- Mockup do Dashboard ---
export const DashboardMockup = () => (
  <div className="w-full h-full bg-slate-100 p-3 rounded-lg shadow-inner overflow-hidden flex flex-col gap-2">
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white p-2 rounded-lg shadow-sm">
        <div className="flex items-center text-xs text-slate-500">
          <ArrowUpRight size={12} className="mr-1 text-emerald-500" />
          Receita Total
        </div>
        <p className="font-bold text-base text-emerald-600">R$ 3.500,00</p>
      </div>
      <div className="bg-white p-2 rounded-lg shadow-sm">
        <div className="flex items-center text-xs text-slate-500">
          <ArrowDownLeft size={12} className="mr-1 text-red-500" />
          Despesa Total
        </div>
        <p className="font-bold text-base text-red-500">- R$ 980,00</p>
      </div>
    </div>
    <div className="bg-white p-2 rounded-lg shadow-sm flex-1 flex flex-col">
      <p className="text-xs font-semibold text-slate-600">
        Gastos por Categoria
      </p>
      <div className="w-full flex-1 -mx-2">
        <ResponsiveContainer>
          <PieChart>
            {/* 1. Adicionado Tooltip para interatividade no gráfico */}
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
                fontSize: "12px",
                padding: "4px 8px",
              }}
            />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* 2. Legenda para o gráfico */}
      <div className="flex justify-center gap-2 flex-wrap">
        {pieData.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center gap-1 text-[10px] text-slate-500"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: PIE_COLORS[index] }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Dados para o Mockup de Despesas ---
const mockExpenses = [
  {
    icon: Pizza,
    iconColor: "text-red-500",
    bgColor: "bg-red-100",
    title: "iFood",
    category: "Alimentação",
    date: "29 Set",
    amount: "- R$ 45,90",
  },
  {
    icon: ShoppingCart,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
    title: "Supermercado",
    category: "Compras",
    date: "28 Set",
    amount: "- R$ 215,70",
  },
  {
    icon: Bus,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-100",
    title: "Uber",
    category: "Transporte",
    date: "28 Set",
    amount: "- R$ 22,50",
  },
  {
    icon: Laptop,
    iconColor: "text-green-500",
    bgColor: "bg-green-100",
    title: "Curso de React",
    category: "Educação",
    date: "27 Set",
    amount: "- R$ 79,90",
  },
  {
    icon: Fuel,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-100",
    title: "Gasolina",
    category: "Transporte",
    date: "28 Set",
    amount: "- R$ 102,50",
  },
];

// --- Mockup de Despesas ---
export const ExpensesMockup = () => (
  <div className="w-full h-full bg-slate-100 p-3 rounded-lg flex flex-col shadow-inner">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold text-slate-700">Despesas de Setembro</h3>
      <MoreHorizontal size={16} className="text-slate-500" />
    </div>
    {/* 3. Garantia de que a rolagem funcione corretamente com flex-1 e min-h-0 */}
    <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
      {mockExpenses.map((item) => (
        <div
          key={item.title}
          className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-3 transition-colors hover:bg-slate-50"
        >
          <div
            // 4. Uso de clsx para consistência de código
            className={clsx(
              "h-8 w-8 rounded-full grid place-items-center flex-shrink-0",
              item.bgColor
            )}
          >
            <item.icon size={16} className={item.iconColor} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-slate-500">{item.category}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">{item.amount}</p>
            <p className="text-xs text-slate-500">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
    <button className="text-center text-sm font-semibold text-emerald-600 mt-auto pt-2 hover:underline">
      Ver mais
    </button>
  </div>
);

// --- Dados para o Mockup de Metas ---
const mockGoals = [
  {
    icon: Target,
    iconColor: "text-amber-600",
    title: "Viagem para a Praia",
    progress: "75%",
    current: "R$ 1.500",
    total: "R$ 2.000",
    barColor: "bg-amber-500",
  },
  {
    icon: Laptop,
    iconColor: "text-emerald-600",
    title: "Notebook Novo",
    progress: "40%",
    current: "R$ 2.000",
    total: "R$ 5.000",
    barColor: "bg-emerald-500",
  },
  {
    icon: PiggyBank,
    iconColor: "text-blue-600",
    title: "Reserva de Emergência",
    progress: "20%",
    current: "R$ 1.200",
    total: "R$ 6.000",
    barColor: "bg-blue-500",
  },
  {
    icon: House,
    iconColor: "text-red-600",
    title: "Móveis para Casa",
    progress: "60%",
    current: "R$ 7.200",
    total: "R$ 12.000",
    barColor: "bg-red-500",
  },
];

// --- Mockup de Metas ---
export const GoalsMockup = () => (
  <div className="w-full h-full bg-slate-100 p-3 rounded-lg flex flex-col gap-2 shadow-inner">
    <h3 className="font-bold text-slate-700">Minhas Metas</h3>
    {mockGoals.map((goal) => (
      <div
        key={goal.title}
        className="bg-white p-3 rounded-lg shadow-sm transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <goal.icon size={16} className={goal.iconColor} />
          <span>{goal.title}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
          <div
            // 4. Uso de clsx para consistência
            className={clsx("h-2 rounded-full", goal.barColor)}
            style={{ width: goal.progress }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-right">
          {goal.current} / {goal.total}
        </p>
      </div>
    ))}
  </div>
);
