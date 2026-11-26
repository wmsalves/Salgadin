import { Link } from "react-router-dom";
import type { Goal, GoalAlert } from "../../lib/types";
import { SMALL_EXPENSE_LIMIT, type MonthSummary } from "../../lib/monthSummary";

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const wholeCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

interface MonthOverviewProps {
  summary: MonthSummary;
  monthName: string;
  goals: Goal[];
  alerts: GoalAlert[];
  onAddIncome: () => void;
}

function Headline({ summary, monthName, onAddIncome }: Omit<MonthOverviewProps, "goals" | "alerts">) {
  const { timing, free, perDay, daysLeft, lastDay, incomeTotal, fixedPending } = summary;

  if (incomeTotal === 0) {
    return (
      <div>
        <p className="text-sm text-foreground-muted">Gastos de {monthName}</p>
        <p className="mt-1 text-4xl font-medium text-foreground tabular-nums sm:text-5xl">
          {currency(summary.expenseRegistered)}
        </p>
        <p className="mt-3 max-w-md text-sm text-foreground-muted">
          Registre sua renda do mês para o Salgadin calcular quanto você ainda pode gastar por dia.
        </p>
        <button
          type="button"
          onClick={onAddIncome}
          className="mt-4 inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-primary px-4 text-ui font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong"
        >
          Adicionar renda
        </button>
      </div>
    );
  }

  if (free <= 0) {
    return (
      <div>
        <p className="text-sm text-foreground-muted">
          {timing === "past" ? `${monthName} fechou acima do que entrou` : "Os gastos do mês já passaram do que entra"}
        </p>
        <p className="mt-1 text-4xl font-medium text-danger tabular-nums sm:text-5xl">
          −{currency(Math.abs(free))}
        </p>
        <p className="mt-3 max-w-md text-sm text-foreground-muted">
          {fixedPending > 0
            ? `Isso já conta ${currency(fixedPending)} de contas fixas que ainda vão entrar no mês.`
            : "Vale olhar quais categorias pesaram mais para ajustar o próximo mês."}
        </p>
      </div>
    );
  }

  if (timing === "past") {
    return (
      <div>
        <p className="text-sm text-foreground-muted">Sobrou em {monthName}</p>
        <p className="mt-1 text-4xl font-medium text-foreground tabular-nums sm:text-5xl">
          {currency(free)}
        </p>
        <p className="mt-3 text-sm text-foreground-muted">
          Receitas menos despesas do mês inteiro.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground-muted">
        {timing === "future" ? `Previsto para ${monthName}` : "Você ainda pode gastar"}
      </p>
      <p className="mt-1 flex items-baseline gap-2 text-foreground">
        <span className="text-4xl font-medium tabular-nums sm:text-5xl">
          {wholeCurrency(perDay ?? 0)}
        </span>
        <span className="text-base text-foreground-muted">por dia</span>
      </p>
      <p className="mt-3 max-w-lg text-sm text-foreground-muted">
        Sobram <span className="font-medium text-foreground tabular-nums">{currency(free)}</span>{" "}
        {timing === "future" ? `para os ${lastDay} dias do mês` : daysLeft === 1 ? "até hoje à noite" : `até o dia ${lastDay}`}
        {fixedPending > 0 ? (
          <>
            , já descontando{" "}
            <span className="tabular-nums">{currency(fixedPending)}</span> de contas fixas
            previstas.
          </>
        ) : (
          "."
        )}
      </p>
    </div>
  );
}

function CompositionBar({ summary }: { summary: MonthSummary }) {
  const fixed = summary.fixedRegistered + summary.fixedPending;
  const free = Math.max(summary.free, 0);
  const base = Math.max(summary.incomeTotal, summary.expenseTotal, 1);
  const segments = [
    { key: "small", label: "Pequenos gastos", value: summary.smallExpenses, className: "bg-primary" },
    { key: "other", label: "Outros gastos", value: summary.otherExpenses, className: "bg-[var(--chart-high-expense)]" },
    { key: "fixed", label: "Contas fixas", value: fixed, className: "bg-foreground-subtle" },
    { key: "free", label: "Livre", value: free, className: "bg-surface-3 ring-1 ring-inset ring-border" },
  ].filter((segment) => segment.value > 0);

  if (segments.length === 0) return null;

  return (
    <div>
      <div
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${currency(s.value)}`).join(", ")}
      >
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={`block h-full ${segment.className}`}
            style={{ width: `${(segment.value / base) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-foreground-muted">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-[3px] ${segment.className}`} aria-hidden />
            {segment.label}
            <span className="font-medium text-foreground tabular-nums">{currency(segment.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthOverview({ summary, monthName, goals, alerts, onAddIncome }: MonthOverviewProps) {
  const activeGoals = goals.filter((goal) => goal.isActive);
  const goalsAtRisk = alerts.filter(
    (alert) => alert.thresholdReached || alert.spent >= alert.monthlyLimit,
  ).length;

  return (
    <section
      aria-label="Resumo do mês"
      className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
    >
      <Headline summary={summary} monthName={monthName} onAddIncome={onAddIncome} />

      <div className="mt-6">
        <CompositionBar summary={summary} />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-3 sm:gap-0">
        <div className="sm:pr-5">
          <dt className="text-xs text-foreground-subtle">
            Pequenos gastos <span className="sr-only">(até {currency(SMALL_EXPENSE_LIMIT)})</span>
          </dt>
          <dd className="mt-1 text-lg font-medium text-foreground tabular-nums">
            {currency(summary.smallExpenses)}
          </dd>
          <dd className="text-xs text-foreground-muted">
            {summary.smallExpensesCount === 0
              ? `Nenhum gasto de até ${wholeCurrency(SMALL_EXPENSE_LIMIT)}`
              : `${summary.smallExpensesCount} ${summary.smallExpensesCount === 1 ? "lançamento" : "lançamentos"} de até ${wholeCurrency(SMALL_EXPENSE_LIMIT)}`}
          </dd>
        </div>
        <div className="sm:border-l sm:border-border sm:px-5">
          <dt className="text-xs text-foreground-subtle">Maior categoria</dt>
          <dd className="mt-1 truncate text-lg font-medium text-foreground">
            {summary.topCategory?.name ?? "—"}
          </dd>
          <dd className="text-xs text-foreground-muted tabular-nums">
            {summary.topCategory ? currency(summary.topCategory.total) : "Sem despesas no mês"}
          </dd>
        </div>
        <div className="sm:border-l sm:border-border sm:pl-5">
          <dt className="text-xs text-foreground-subtle">Metas</dt>
          {activeGoals.length === 0 ? (
            <>
              <dd className="mt-1 text-lg font-medium text-foreground">Nenhuma ativa</dd>
              <dd className="text-xs">
                <Link to="/metas" className="text-primary hover:text-primary-strong">
                  Criar um limite por categoria
                </Link>
              </dd>
            </>
          ) : (
            <>
              <dd
                className={`mt-1 text-lg font-medium tabular-nums ${goalsAtRisk > 0 ? "text-danger" : "text-success"}`}
              >
                {goalsAtRisk > 0
                  ? `${goalsAtRisk} ${goalsAtRisk === 1 ? "pede" : "pedem"} atenção`
                  : "Dentro do limite"}
              </dd>
              <dd className="text-xs text-foreground-muted">
                {activeGoals.length} {activeGoals.length === 1 ? "meta ativa" : "metas ativas"}
              </dd>
            </>
          )}
        </div>
      </dl>
    </section>
  );
}
