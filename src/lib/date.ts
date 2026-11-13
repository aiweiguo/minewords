/** Local calendar date YYYY-MM-DD (not UTC). */
export function formatLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatLocalDateString(new Date());
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatLocalDateString(yesterday);
}

/** Monday of the local week containing `date` (YYYY-MM-DD). */
export function getWeekStartDateString(date: Date = new Date()): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = local.getDay(); // 0 = Sunday
  const offset = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + offset);
  return formatLocalDateString(local);
}
