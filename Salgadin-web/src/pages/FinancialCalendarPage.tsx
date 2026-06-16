import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Repeat,
} from "lucide-react";
import clsx from "clsx";
import { getFinancialCalendar } from "../services/calendarService";
import type {
  CalendarDay,
  CalendarEntry,
  CalendarMonth,
  CalendarRecurringItem,
} from "../lib/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: "UTC",
});

const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export default function FinancialCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  });
  const [calendar, setCalendar] = useState<CalendarMonth | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = currentMonth.getUTCFullYear();
  const month = currentMonth.getUTCMonth() + 1;

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getFinancialCalendar(year, month);
      setCalendar(data);

      const todayKey = toDateKey(new Date());
      const fallbackKey = toDateKey(data.days[0]?.date);
      const hasTodayInMonth = data.days.some(
        (item) => toDateKey(item.date) === todayKey,
      );

      setSelectedDateKey(hasTodayInMonth ? todayKey : fallbackKey);
    } catch {
      setError("Nao foi possivel carregar o calendario financeiro.");
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const selectedDay = useMemo(() => {
    if (!calendar || !selectedDateKey) {
      return null;
    }

    return (
      calendar.days.find((item) => toDateKey(item.date) === selectedDateKey) ??
      null
    );
  }, [calendar, selectedDateKey]);

  const leadingBlankDays = useMemo(() => {
    if (!calendar?.days.length) {
      return 0;
    }

    const firstDate = parseApiDate(calendar.days[0].date);
    return (firstDate.getUTCDay() + 6) % 7;
  }, [calendar]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) =>
      new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) =>
      new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)),
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-border/70 bg-surface/90 p-5 shadow-[0_18px_42px_rgba(60,42,32,0.08)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              <CalendarDays size={14} />
              Calendario
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Calendario financeiro
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
              Veja o que entra, o que sai e quais recorrencias estao previstas
              nos proximos dias.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <div className="inline-flex items-center rounded-full border border-border bg-surface-2 p-1">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="grid h-9 w-9 place-items-center rounded-full text-foreground-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="rounded-full px-4 py-2 text-sm font-semibold text-foreground-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="grid h-9 w-9 place-items-center rounded-full text-foreground-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Proximo mes"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold capitalize text-primary">
              {monthFormatter.format(currentMonth)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Entradas previstas"
            value={calendar?.predictedIncome ?? 0}
            tone="positive"
            isLoading={isLoading}
          />
          <SummaryCard
            label="Saidas previstas"
            value={calendar?.predictedExpense ?? 0}
            tone="negative"
            isLoading={isLoading}
          />
          <SummaryCard
            label="Saldo previsto"
            value={calendar?.predictedBalance ?? 0}
            tone={(calendar?.predictedBalance ?? 0) >= 0 ? "positive" : "negative"}
            isLoading={isLoading}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <CalendarSkeleton />
      ) : calendar ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="rounded-3xl border border-border/70 bg-surface/90 p-4 shadow-[0_18px_42px_rgba(60,42,32,0.08)] md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Visao do mes
                </h2>
                <p className="text-sm text-foreground-muted">
                  Clique em um dia para ver entradas, saidas e recorrencias.
                </p>
              </div>
              <Link
                to="/recorrencias"
                className="hidden rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground-muted transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:inline-flex"
              >
                Ver recorrencias
              </Link>
            </div>

            <DesktopCalendarGrid
              days={calendar.days}
              leadingBlankDays={leadingBlankDays}
              selectedDateKey={selectedDateKey}
              onSelectDay={setSelectedDateKey}
            />
            <MobileCalendarTimeline
              days={calendar.days}
              selectedDateKey={selectedDateKey}
              onSelectDay={setSelectedDateKey}
            />
          </div>

          <DayDetailsPanel day={selectedDay} />
        </section>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  isLoading,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative";
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/80 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
        {label}
      </p>
      {isLoading ? (
        <div className="mt-2 h-7 w-28 animate-pulse rounded-full bg-surface-3/60" />
      ) : (
        <p
          className={clsx(
            "mt-2 text-xl font-bold",
            tone === "positive" ? "text-success" : "text-danger",
          )}
        >
          {formatCurrency(value)}
        </p>
      )}
    </div>
  );
}

function DesktopCalendarGrid({
  days,
  leadingBlankDays,
  selectedDateKey,
  onSelectDay,
}: {
  days: CalendarDay[];
  leadingBlankDays: number;
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <div className="hidden lg:block">
      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground-subtle"
          >
            {label}
          </div>
        ))}

        {Array.from({ length: leadingBlankDays }).map((_, index) => (
          <div
            key={`blank-${index}`}
            className="min-h-32 rounded-2xl border border-dashed border-border/40 bg-surface-2/20"
          />
        ))}

        {days.map((day) => (
          <CalendarDayCell
            key={day.date}
            day={day}
            isSelected={toDateKey(day.date) === selectedDateKey}
            onSelect={() => onSelectDay(toDateKey(day.date))}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarDayCell({
  day,
  isSelected,
  onSelect,
}: {
  day: CalendarDay;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const hasMovement = hasDayMovement(day);
  const predictedCount = day.recurrences.filter(
    (item) => item.status === "Predicted",
  ).length;
  const registeredCount = day.recurrences.filter(
    (item) => item.status === "Registered",
  ).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "min-h-32 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isSelected
          ? "border-primary/45 bg-primary/10 shadow-[0_12px_28px_rgba(198,125,63,0.14)]"
          : "border-border/70 bg-surface-2/55",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-surface text-sm font-bold text-foreground">
          {parseApiDate(day.date).getUTCDate()}
        </span>
        {day.recurrences.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
            <Repeat size={12} />
            {day.recurrences.length}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        {day.incomeTotal > 0 && (
          <CompactAmount tone="positive" label="Entradas" value={day.incomeTotal} />
        )}
        {day.expenseTotal > 0 && (
          <CompactAmount tone="negative" label="Saidas" value={day.expenseTotal} />
        )}
        {!hasMovement && (
          <div className="mt-6 flex items-center gap-2 text-xs text-foreground-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            Sem movimento
          </div>
        )}
      </div>

      {(predictedCount > 0 || registeredCount > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold">
          {predictedCount > 0 && (
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-warning">
              {predictedCount} prevista{predictedCount > 1 ? "s" : ""}
            </span>
          )}
          {registeredCount > 0 && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
              {registeredCount} registrada{registeredCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function MobileCalendarTimeline({
  days,
  selectedDateKey,
  onSelectDay,
}: {
  days: CalendarDay[];
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <div className="space-y-3 lg:hidden">
      {days.map((day) => {
        const dateKey = toDateKey(day.date);
        const isSelected = dateKey === selectedDateKey;

        return (
          <button
            type="button"
            key={day.date}
            onClick={() => onSelectDay(dateKey)}
            className={clsx(
              "w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isSelected
                ? "border-primary/45 bg-primary/10"
                : "border-border/70 bg-surface-2/55",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold capitalize text-foreground">
                  {shortDateFormatter.format(parseApiDate(day.date))}
                </p>
                <p className="mt-0.5 text-xs capitalize text-foreground-muted">
                  {longDateFormatter.format(parseApiDate(day.date))}
                </p>
              </div>
              {day.recurrences.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  <Repeat size={13} />
                  {day.recurrences.length}
                </span>
              )}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <MobileAmount label="Entradas" value={day.incomeTotal} tone="positive" />
              <MobileAmount label="Saidas" value={day.expenseTotal} tone="negative" />
              <MobileAmount
                label="Saldo"
                value={day.balance}
                tone={day.balance >= 0 ? "positive" : "negative"}
              />
            </div>

            {!hasDayMovement(day) && (
              <p className="mt-3 text-xs text-foreground-subtle">
                Sem movimento previsto neste dia.
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DayDetailsPanel({ day }: { day: CalendarDay | null }) {
  if (!day) {
    return (
      <aside className="rounded-3xl border border-border/70 bg-surface/90 p-5 text-sm text-foreground-muted shadow-[0_18px_42px_rgba(60,42,32,0.08)]">
        Selecione um dia para ver os detalhes.
      </aside>
    );
  }

  return (
    <aside className="h-fit rounded-3xl border border-border/70 bg-surface/90 p-5 shadow-[0_18px_42px_rgba(60,42,32,0.08)] xl:sticky xl:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-muted">
            Detalhes do dia
          </p>
          <h2 className="mt-1 text-xl font-bold capitalize text-foreground">
            {longDateFormatter.format(parseApiDate(day.date))}
          </h2>
        </div>
        <div
          className={clsx(
            "rounded-2xl px-3 py-2 text-right",
            day.balance >= 0 ? "bg-success/10" : "bg-danger/10",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-muted">
            Saldo do dia
          </p>
          <p
            className={clsx(
              "text-sm font-bold",
              day.balance >= 0 ? "text-success" : "text-danger",
            )}
          >
            {formatCurrency(day.balance)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <EntrySection
          title="Entradas"
          emptyText="Nenhuma entrada neste dia."
          icon={<ArrowUpRight size={16} />}
          tone="positive"
          items={day.incomes}
        />
        <EntrySection
          title="Saidas"
          emptyText="Nenhuma saida neste dia."
          icon={<ArrowDownLeft size={16} />}
          tone="negative"
          items={day.expenses}
        />
        <RecurringSection items={day.recurrences} />
      </div>
    </aside>
  );
}

function EntrySection({
  title,
  emptyText,
  icon,
  tone,
  items,
}: {
  title: string;
  emptyText: string;
  icon: ReactNode;
  tone: "positive" | "negative";
  items: CalendarEntry[];
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={clsx(
            "grid h-8 w-8 place-items-center rounded-full",
            tone === "positive"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger",
          )}
        >
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-3 text-sm text-foreground-subtle">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="rounded-2xl border border-border/70 bg-surface-2/55 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.description}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {buildEntryMeta(item)}
                  </p>
                </div>
                <p
                  className={clsx(
                    "text-sm font-bold",
                    tone === "positive" ? "text-success" : "text-danger",
                  )}
                >
                  {tone === "positive" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RecurringSection({ items }: { items: CalendarRecurringItem[] }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
          <Repeat size={16} />
        </span>
        <h3 className="text-sm font-semibold text-foreground">Recorrencias</h3>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-3 text-sm text-foreground-subtle">
          Nenhuma recorrencia prevista para este dia.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="rounded-2xl border border-border/70 bg-surface-2/55 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.description}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {item.type === "Income" ? "Receita" : "Despesa"}
                    {item.category ? ` · ${item.category}` : ""}
                    {item.subcategory ? ` / ${item.subcategory}` : ""}
                  </p>
                </div>
                <p
                  className={clsx(
                    "text-sm font-bold",
                    item.type === "Income" ? "text-success" : "text-danger",
                  )}
                >
                  {item.type === "Income" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/recorrencias"
        className="mt-3 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Gerenciar recorrencias
        <ChevronRight size={15} />
      </Link>
    </section>
  );
}

function CompactAmount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative";
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-xs",
        tone === "positive"
          ? "bg-success/10 text-success"
          : "bg-danger/10 text-danger",
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="font-bold">{formatCurrency(value)}</span>
    </div>
  );
}

function MobileAmount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-foreground-subtle">
        {label}
      </p>
      <p
        className={clsx(
          "mt-1 text-sm font-bold",
          tone === "positive" ? "text-success" : "text-danger",
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: CalendarRecurringItem["status"] }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "Registered"
          ? "bg-success/10 text-success"
          : "bg-warning/10 text-warning",
      )}
    >
      {status === "Registered" ? <Clock3 size={11} /> : <Repeat size={11} />}
      {status === "Registered" ? "Registrada" : "Prevista"}
    </span>
  );
}

function CalendarSkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="rounded-3xl border border-border/70 bg-surface/90 p-5">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="min-h-32 animate-pulse rounded-2xl bg-surface-2/70"
            />
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-surface/90 p-5">
        <div className="h-6 w-40 animate-pulse rounded-full bg-surface-2/80" />
        <div className="mt-5 space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-surface-2/80" />
          <div className="h-20 animate-pulse rounded-2xl bg-surface-2/80" />
          <div className="h-20 animate-pulse rounded-2xl bg-surface-2/80" />
        </div>
      </div>
    </section>
  );
}

function buildEntryMeta(item: CalendarEntry) {
  const parts = [];

  if (item.category) {
    parts.push(item.category);
  }

  if (item.subcategory) {
    parts.push(item.subcategory);
  }

  if (item.isRecurring) {
    parts.push("Recorrente");
  }

  return parts.length > 0 ? parts.join(" · ") : "Lancamento manual";
}

function hasDayMovement(day: CalendarDay) {
  return (
    day.incomeTotal > 0 ||
    day.expenseTotal > 0 ||
    day.incomes.length > 0 ||
    day.expenses.length > 0 ||
    day.recurrences.length > 0
  );
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function toDateKey(value?: string | Date) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function parseApiDate(value: string) {
  return new Date(`${toDateKey(value)}T00:00:00.000Z`);
}
