import { TrendingUp, PieChart, CalendarRange } from "lucide-react";

const reportCards = [
  {
    title: "Resumo mensal",
    description: "Compare receitas e despesas no periodo.",
    icon: TrendingUp,
  },
  {
    title: "Categorias em destaque",
    description: "Veja onde voce mais gastou.",
    icon: PieChart,
  },
  {
    title: "Historico",
    description: "Filtre e exporte seus dados.",
    icon: CalendarRange,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
        <p className="text-sm text-foreground-muted">
          Visualize tendencias e acompanhe sua evolucao financeira.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="h-10 w-10 rounded-lg bg-surface-2 flex items-center justify-center text-primary">
                <Icon size={18} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-foreground-muted">
                {card.description}
              </p>
              <div className="mt-4 text-xs font-semibold text-primary">
                Em desenvolvimento
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Proxima etapa
        </h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Conectaremos esta area aos dados reais para gerar relatorios e
          insights personalizados.
        </p>
      </div>
    </div>
  );
}
