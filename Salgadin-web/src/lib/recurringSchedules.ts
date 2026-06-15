import type {
  RecurringSchedule,
  RecurringScheduleType,
} from "./types";

export const normalizeTextForMatch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const isSimilarDescription = (left: string, right: string) => {
  const first = normalizeTextForMatch(left);
  const second = normalizeTextForMatch(right);

  if (!first || !second) {
    return false;
  }

  return first.includes(second) || second.includes(first);
};

export const getRecurringPeriod = (date: string) => {
  const [year, month] = date.split("-").map(Number);
  return {
    year,
    month,
  };
};

export const getDueRecurringSchedules = (
  schedules: RecurringSchedule[],
  referenceDate = new Date(),
) => {
  const today = new Date(
    Date.UTC(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
    ),
  );

  return schedules.filter((schedule) => {
    if (schedule.status !== "Active") {
      return false;
    }

    const nextOccurrenceDate = new Date(schedule.nextOccurrenceDate);
    return nextOccurrenceDate <= today;
  });
};

export const getUpcomingRecurringSchedules = (
  schedules: RecurringSchedule[],
  limit = 3,
) =>
  schedules
    .filter((schedule) => schedule.status === "Active")
    .slice()
    .sort(
      (a, b) =>
        new Date(a.nextOccurrenceDate).getTime() -
        new Date(b.nextOccurrenceDate).getTime(),
    )
    .slice(0, limit);

export const findMatchingRecurringSchedule = ({
  schedules,
  type,
  description,
  amount,
  categoryId,
  date,
}: {
  schedules: RecurringSchedule[];
  type: RecurringScheduleType;
  description: string;
  amount: number;
  categoryId?: number | null;
  date: string;
}) => {
  const period = getRecurringPeriod(date);

  return schedules.find((schedule) => {
    if (schedule.type !== type || schedule.status !== "Active") {
      return false;
    }

    if (Math.abs(schedule.amount - amount) > 0.009) {
      return false;
    }

    if (!isSimilarDescription(description, schedule.description)) {
      return false;
    }

    if (type === "Expense" && schedule.categoryId !== categoryId) {
      return false;
    }

    if (
      schedule.lastGeneratedOccurrenceDate &&
      new Date(schedule.lastGeneratedOccurrenceDate).getUTCFullYear() ===
        period.year &&
      new Date(schedule.lastGeneratedOccurrenceDate).getUTCMonth() + 1 ===
        period.month
    ) {
      return false;
    }

    return true;
  });
};
