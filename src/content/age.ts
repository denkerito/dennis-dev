import type { CalendarDate } from "./sections";

const HOUR = 3_600_000;

/** Weekday (0 = Sunday) of a date in the proleptic Gregorian calendar. */
function weekday(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/**
 * The instant of midnight in Milan on the given date. Milan is UTC+1, and UTC+2
 * from 01:00 UTC on the last Sunday of March to 01:00 UTC on the last Sunday of
 * October (EU rule).
 */
export function milanMidnight(year: number, month: number, day: number): number {
  const utcMidnight = Date.UTC(year, month - 1, day);
  const lastSunday = (m: number) => {
    const last = new Date(Date.UTC(year, m, 0)).getUTCDate();
    return last - weekday(year, m, last);
  };
  const summerStart = Date.UTC(year, 2, lastSunday(3), 1);
  const summerEnd = Date.UTC(year, 9, lastSunday(10), 1);
  // Try summer time first: midnight local is 22:00 UTC the day before.
  const asSummer = utcMidnight - 2 * HOUR;
  if (asSummer >= summerStart && asSummer < summerEnd) return asSummer;
  return utcMidnight - HOUR;
}

/**
 * Age in years at `now` (milliseconds since the epoch): the number of birthdays
 * passed, plus the share of the current year of life that has gone by.
 */
export function ageAt(now: number, birth: CalendarDate): number {
  const birthday = (year: number) => milanMidnight(year, birth.month, birth.day);
  let year = new Date(now).getUTCFullYear() + 1;
  while (birthday(year) > now) year -= 1;
  const last = birthday(year);
  const next = birthday(year + 1);
  return year - birth.year + (now - last) / (next - last);
}

/** The age with a fixed number of decimals, truncated rather than rounded. */
export function formatAge(age: number, decimals = 8): string {
  const factor = 10 ** decimals;
  return (Math.floor(age * factor) / factor).toFixed(decimals);
}
