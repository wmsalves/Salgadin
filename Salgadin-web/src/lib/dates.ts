export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatApiDate(date: Date): string {
  return formatDateForInput(date);
}

export function toDateInputValue(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (match) {
    return match[1];
  }

  return formatDateForInput(new Date(value));
}

export function formatDisplayDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return date.toLocaleDateString("pt-BR", {
      timeZone: "UTC",
      ...options,
    });
  }

  const fallback = new Date(value);
  return fallback.toLocaleDateString("pt-BR", options);
}
