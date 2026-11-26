import type { Expense, Income, RecurringSchedule } from "./types";

/** Gastos ate este valor, fora de recorrencias, contam como "pequenos gastos". */
export const SMALL_EXPENSE_LIMIT = 50;

export type MonthTiming = "past" | "current" | "future";

export interface PendingRecurring {
  schedule: RecurringSchedule;
  date: string; // AAAA-MM-DD
}

export interface MonthSummary {
  timing: MonthTiming;
  /** Dias restantes contando hoje (mes atual), todos os dias (futuro) ou 0 (passado). */
  daysLeft: number;
  lastDay: number;

  incomeRegistered: number;
  incomePending: number;
  incomeTotal: number;

  smallExpenses: number;
  smallExpensesCount: number;
  otherExpenses: number;
  fixedRegistered: number;
  fixedPending: number;
  expenseRegistered: number;
  expenseTotal: number;

  /** Receitas (lancadas + previstas) menos despesas (lancadas + fixas previstas). */
  free: number;
  /** free / daysLeft, so faz sentido no mes atual ou futuro com free > 0. */
  perDay: number | null;

  pendingExpenses: PendingRecurring[];
  pendingIncomes: PendingRecurring[];
  topCategory: { name: string; total: number } | null;
}

const pad = (value: number) => String(value).padStart(2, "0");
const ymd = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

/**
 * Ocorrencia de uma recorrencia mensal dentro do mes (ano, mes 1-12),
 * ou null se ela nao vale para esse mes.
 */
export function occurrenceInMonth(
  schedule: RecurringSchedule,
  year: number,
  month: number,
): string | null {
  if (schedule.status !== "Active") return null;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const date = ymd(year, month, Math.min(schedule.dayOfMonth, lastDay));
  if (schedule.startDate.slice(0, 10) > date) return null;
  if (schedule.endDate && schedule.endDate.slice(0, 10) < date) return null;
  return date;
}

function isRegistered(
  schedule: RecurringSchedule,
  date: string,
  year: number,
  month: number,
  linked: { recurringScheduleId?: number | null; recurringPeriodYear?: number | null; recurringPeriodMonth?: number | null }[],
) {
  const byLink = linked.some(
    (entry) =>
      entry.recurringScheduleId === schedule.id &&
      entry.recurringPeriodYear === year &&
      entry.recurringPeriodMonth === month,
  );
  if (byLink) return true;
  const last = schedule.lastGeneratedOccurrenceDate?.slice(0, 10);
  return Boolean(last && last >= date);
}

export function buildMonthSummary(input: {
  /** Primeiro dia do mes exibido (data local). */
  month: Date;
  expenses: Expense[];
  incomes: Income[];
  recurringSchedules: RecurringSchedule[];
  today?: Date;
}): MonthSummary {
  const { month, expenses, incomes, recurringSchedules } = input;
  const today = input.today ?? new Date();
  const year = month.getFullYear();
  const monthNumber = month.getMonth() + 1;
  const lastDay = new Date(year, monthNumber, 0).getDate();

  const monthKey = year * 12 + monthNumber;
  const todayKey = today.getFullYear() * 12 + today.getMonth() + 1;
  const timing: MonthTiming =
    monthKey < todayKey ? "past" : monthKey > todayKey ? "future" : "current";
  const daysLeft =
    timing === "past" ? 0 : timing === "future" ? lastDay : lastDay - today.getDate() + 1;

  let smallExpenses = 0;
  let smallExpensesCount = 0;
  let otherExpenses = 0;
  let fixedRegistered = 0;
  const byCategory = new Map<string, number>();

  for (const expense of expenses) {
    const amount = Math.abs(expense.amount);
    if (expense.recurringScheduleId) {
      fixedRegistered += amount;
    } else if (amount <= SMALL_EXPENSE_LIMIT) {
      smallExpenses += amount;
      smallExpensesCount += 1;
    } else {
      otherExpenses += amount;
    }
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + amount);
  }

  const incomeRegistered = incomes.reduce((sum, income) => sum + Math.abs(income.amount), 0);

  // Recorrencias do mes que ainda nao viraram lancamento. Em meses passados
  // nada mais esta "previsto".
  const pendingExpenses: PendingRecurring[] = [];
  const pendingIncomes: PendingRecurring[] = [];
  if (timing !== "past") {
    for (const schedule of recurringSchedules) {
      const date = occurrenceInMonth(schedule, year, monthNumber);
      if (!date) continue;
      if (schedule.type === "Expense") {
        if (!isRegistered(schedule, date, year, monthNumber, expenses)) {
          pendingExpenses.push({ schedule, date });
        }
      } else if (!isRegistered(schedule, date, year, monthNumber, incomes)) {
        pendingIncomes.push({ schedule, date });
      }
    }
  }

  const fixedPending = pendingExpenses.reduce((sum, p) => sum + Math.abs(p.schedule.amount), 0);
  const incomePending = pendingIncomes.reduce((sum, p) => sum + Math.abs(p.schedule.amount), 0);

  const expenseRegistered = smallExpenses + otherExpenses + fixedRegistered;
  const expenseTotal = expenseRegistered + fixedPending;
  const incomeTotal = incomeRegistered + incomePending;
  const free = incomeTotal - expenseTotal;
  const perDay = timing !== "past" && daysLeft > 0 && free > 0 ? free / daysLeft : null;

  let topCategory: MonthSummary["topCategory"] = null;
  for (const [name, total] of byCategory) {
    if (!topCategory || total > topCategory.total) topCategory = { name, total };
  }

  return {
    timing,
    daysLeft,
    lastDay,
    incomeRegistered,
    incomePending,
    incomeTotal,
    smallExpenses,
    smallExpensesCount,
    otherExpenses,
    fixedRegistered,
    fixedPending,
    expenseRegistered,
    expenseTotal,
    free,
    perDay,
    pendingExpenses: pendingExpenses.sort((a, b) => a.date.localeCompare(b.date)),
    pendingIncomes: pendingIncomes.sort((a, b) => a.date.localeCompare(b.date)),
    topCategory,
  };
}
