/**
 * Returns the Monday (week start) for a given YYYY-MM-DD date string.
 */
export function getWeekStart(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const day = date.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().split("T")[0];
}

/**
 * Returns the Sunday (week end) for a given Monday date string.
 */
export function getWeekEnd(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().split("T")[0];
}
