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
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";
import clsx from "clsx";

const cashflowData = [
  { name: "Seg", value: 220 },
  { name: "Ter", value: 340 },
  { name: "Qua", value: 260 },
  { name: "Qui", value: 420 },
  { name: "Sex", value: 310 },
  { name: "Sab", value: 480 },
  { name: "Dom", value: 360 },
];

// const categoryData = [
//   { name: "Alim.", value: 450 },
//   { name: "Transp.", value: 220 },
//   { name: "Compras", value: 180 },
//   { name: "Outros", value: 130 },
// ];
const BAR_COLORS = ["#f28b5b", "#f5b36b", "#f2c96d", "#5bbe9d"];

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

function MockupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[600px] bg-surface-2 p-3 rounded-2xl">
      <div className="w-full h-full bg-surface border border-border rounded-2xl shadow-lg p-4 flex flex-col">
        {children}
      </div>
    </div>
  );
}

export const DashboardMockup = () => {
  return (
    <MockupShell>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Resumo do painel</h3>
        <span className="text-[10px] text-foreground-subtle bg-surface-2 px-2 py-0.5 rounded-full">
          Agosto
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-surface-2 p-2 rounded-xl border border-border/60">
          <div className="flex items-center text-xs text-foreground-subtle">
            <ArrowUpRight size={12} className="mr-1 text-success" />
            Receita Total
          </div>
          <p className="font-bold text-base text-primary">R$ 3.500,00</p>
        </div>
        <div className="bg-surface-2 p-2 rounded-xl border border-border/60">
          <div className="flex items-center text-xs text-foreground-subtle">
            <ArrowDownLeft size={12} className="mr-1 text-danger" />
            Despesa Total
          </div>
          <p className="font-bold text-base text-danger">- R$ 980,00</p>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[var(--bg-via)] to-[var(--bg-to)]/60 p-3 rounded-2xl shadow-sm flex flex-col mt-3 border border-border/70 h-[200px]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground-muted">
            Fluxo de caixa
          </p>
          <span className="text-[10px] text-foreground-subtle bg-surface-2 px-2 py-0.5 rounded-full">
            7 dias
          </span>
        </div>
        <div className="w-full h-[170px] -mx-2 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ left: -10, right: 10 }}>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  fontSize: "12px",
                  padding: "4px 8px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
              />
              <defs>
                <linearGradient id="mock-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={false}
                fill="url(#mock-gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground-muted">
        {[
          { label: "Saldo", value: "R$ 2.520" },
          { label: "Metas", value: "3 ativas" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2 soft-hover-sm"
          >
            <p className="text-[10px]">{item.label}</p>
            <p className="text-sm font-semibold text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex-1 rounded-2xl border border-border bg-surface-2 px-3 py-2">
        <p className="text-[10px] text-foreground-subtle">Ultimas despesas</p>
        <div className="mt-2 space-y-2">
          {[
            { title: "Mercado", value: "- R$ 86,40" },
            { title: "Uber", value: "- R$ 22,50" },
            { title: "Assinaturas", value: "- R$ 39,90" },
            { title: "Padaria", value: "- R$ 18,70" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-lg bg-surface px-2 py-1 text-xs soft-hover-sm"
            >
              <span className="text-foreground">{item.title}</span>
              <span className="text-danger">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
};

const mockExpenses = [
  {
    icon: Pizza,
    iconColor: "text-danger",
    bgColor: "bg-surface-2",
    title: "iFood",
    category: "Alimentacao",
    date: "29 Set",
    amount: "- R$ 45,90",
  },
  {
    icon: ShoppingCart,
    iconColor: "text-primary",
    bgColor: "bg-surface-2",
    title: "Supermercado",
    category: "Compras",
    date: "28 Set",
    amount: "- R$ 215,70",
  },
  {
    icon: Bus,
    iconColor: "text-accent",
    bgColor: "bg-surface-2",
    title: "Uber",
    category: "Transporte",
    date: "28 Set",
    amount: "- R$ 22,50",
  },
  {
    icon: Laptop,
    iconColor: "text-success",
    bgColor: "bg-surface-2",
    title: "Curso de React",
    category: "Educacao",
    date: "27 Set",
    amount: "- R$ 79,90",
  },
  {
    icon: Fuel,
    iconColor: "text-accent",
    bgColor: "bg-surface-2",
    title: "Gasolina",
    category: "Transporte",
    date: "28 Set",
    amount: "- R$ 102,50",
  },
];

const expensesTrendData = [
  { name: "Seg", value: 120 },
  { name: "Ter", value: 180 },
  { name: "Qua", value: 90 },
  { name: "Qui", value: 240 },
  { name: "Sex", value: 200 },
];

export const ExpensesMockup = () => (
  <MockupShell>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold text-foreground">Despesas do Mes</h3>
        <p className="text-xs text-foreground-subtle">
          Controle rapido das saidas
        </p>
      </div>
      <MoreHorizontal size={16} className="text-foreground-subtle" />
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className="bg-surface-2 rounded-xl p-2 border border-border/60">
        <p className="text-[11px] text-foreground-subtle">Total</p>
        <p className="text-sm font-semibold text-danger">- R$ 1.980,00</p>
      </div>
      <div className="bg-surface-2 rounded-xl p-2 border border-border/60">
        <p className="text-[11px] text-foreground-subtle">Maior categoria</p>
        <p className="text-sm font-semibold text-primary">Alimentacao</p>
      </div>
    </div>

    <div className="bg-gradient-to-b from-[var(--bg-via)] to-[var(--bg-to)]/60 rounded-2xl border border-border/70 p-3 mt-3 h-[140px]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground-muted">
          Tendencia semanal
        </p>
        <span className="text-[10px] text-foreground-subtle bg-surface-2 px-2 py-0.5 rounded-full">
          Ultimos 5 dias
        </span>
      </div>
      <div className="h-[90px] -mx-2 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={expensesTrendData} barSize={10}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
                padding: "4px 8px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              fill="var(--color-danger)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="space-y-2 flex-1 min-h-0 mt-3">
      {mockExpenses.slice(0, 4).map((item) => (
        <div
          key={item.title}
          className="bg-surface p-2 rounded-xl shadow-sm flex items-center gap-3 transition-colors hover:bg-surface-2 soft-hover-sm"
        >
          <div
            className={clsx(
              "h-8 w-8 rounded-full grid place-items-center flex-shrink-0",
              item.bgColor,
            )}
          >
            <item.icon size={16} className={item.iconColor} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            <div className="flex items-center gap-2 text-xs text-foreground-subtle">
              <span>{item.category}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{item.date}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-danger">{item.amount}</p>
          </div>
        </div>
      ))}
    </div>
    <button className="text-center text-sm font-semibold text-primary mt-auto pt-2 hover:underline">
      Ver todas
    </button>
  </MockupShell>
);

const mockGoals = [
  {
    icon: Target,
    iconColor: "text-accent",
    title: "Viagem para a Praia",
    progress: "75%",
    current: "R$ 1.500",
    total: "R$ 2.000",
    barColor: "bg-accent",
  },
  {
    icon: Laptop,
    iconColor: "text-primary",
    title: "Notebook Novo",
    progress: "40%",
    current: "R$ 2.000",
    total: "R$ 5.000",
    barColor: "bg-primary",
  },
  {
    icon: PiggyBank,
    iconColor: "text-success",
    title: "Reserva de Emergencia",
    progress: "20%",
    current: "R$ 1.200",
    total: "R$ 6.000",
    barColor: "bg-success",
  },
  {
    icon: PiggyBank,
    iconColor: "text-primary",
    title: "Curso de Especializacao",
    progress: "55%",
    current: "R$ 2.750",
    total: "R$ 5.000",
    barColor: "bg-primary",
  },
];

const goalsBarData = [
  { name: "Praia", value: 75 },
  { name: "Notebook", value: 40 },
  { name: "Reserva", value: 20 },
  { name: "Curso", value: 55 },
];

export const GoalsMockup = () => {
  const { theme } = useTheme();

  return (
    <MockupShell>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Minhas Metas</h3>
        <span className="text-[10px] text-foreground-subtle bg-surface-2 px-2 py-0.5 rounded-full">
          3 ativas
        </span>
      </div>
      <div className="mt-3 h-[140px] rounded-2xl border border-border bg-surface-2/70 p-3 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={goalsBarData} margin={{ left: -30, right: 6 }}>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
                padding: "6px 10px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                boxShadow: "0 16px 32px rgba(0,0,0,0.18)",
              }}
              itemStyle={{ color: "var(--color-text)" }}
              labelStyle={{ color: "var(--color-text-muted)" }}
              formatter={(value: number) => [`${value}%`, "Progresso"]}
              cursor={{
                fill: "rgba(0,0,0,0.06)",
              }}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-muted)", fontSize: 10 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {goalsBarData.map((_entry, index) => {
                const base = BAR_COLORS[index % BAR_COLORS.length];
                const fill = theme === "dark" ? adjustHex(base, 20) : base;
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3 flex-1">
        {mockGoals.map((goal) => (
          <div
            key={goal.title}
            className="bg-surface p-3 rounded-xl shadow-sm transition-colors hover:bg-surface-2 soft-hover-sm"
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <goal.icon size={16} className={goal.iconColor} />
                <span>{goal.title}</span>
              </div>
              <span className="text-xs text-foreground-subtle">
                {goal.progress}
              </span>
            </div>
            <div className="w-full bg-surface-3 rounded-full h-2 mt-2">
              <div
                className={clsx("h-2 rounded-full", goal.barColor)}
                style={{ width: goal.progress }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-foreground-subtle">
              <span>{goal.current}</span>
              <span>{goal.total}</span>
            </div>
          </div>
        ))}
      </div>
    </MockupShell>
  );
};
