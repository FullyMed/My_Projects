import { getISOWeek, getISOWeekYear, setISOWeek, startOfISOWeek } from 'date-fns';

/** ISO week key for a date, e.g. "2026-W43". */
export const dateToWeekKey = (date: Date): string =>
  `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;

/**
 * The Monday of an ISO week key (YYYY-Www).
 * Uses date-fns calendar arithmetic rather than adding 86 400 000 ms per day,
 * which lands on Sunday 23:00 across a daylight-saving change.
 */
export const weekKeyToMonday = (weekKey: string): Date => {
  const [yearStr, weekStr] = weekKey.split('-W');
  // ISO week 1 always contains Jan 4th, so Jan 4th is in the right ISO year.
  const jan4 = new Date(parseInt(yearStr, 10), 0, 4);
  return startOfISOWeek(setISOWeek(jan4, parseInt(weekStr, 10)));
};
