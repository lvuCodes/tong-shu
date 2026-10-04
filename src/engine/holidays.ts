// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

const iso = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);

function nthWeekday(y: number, m: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  return iso(y, m, 1 + ((weekday - first + 7) % 7) + 7 * (n - 1));
}

function lastWeekday(y: number, m: number, weekday: number): string {
  const last = new Date(Date.UTC(y, m, 0));
  return iso(y, m, last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7));
}

function usHolidays(y: number): [string, string][] {
  return [
    [iso(y, 1, 1), "New Year's Day"],
    [nthWeekday(y, 1, 1, 3), "Martin Luther King Jr. Day"],
    [iso(y, 2, 14), "Valentine's Day"],
    [nthWeekday(y, 2, 1, 3), "Presidents' Day"],
    [nthWeekday(y, 5, 0, 2), "Mother's Day"],
    [lastWeekday(y, 5, 1), "Memorial Day"],
    [nthWeekday(y, 6, 0, 3), "Father's Day"],
    [iso(y, 6, 19), "Juneteenth"],
    [iso(y, 7, 4), "Independence Day"],
    [nthWeekday(y, 9, 1, 1), "Labor Day"],
    [iso(y, 10, 31), "Halloween"],
    [iso(y, 11, 11), "Veterans Day"],
    [nthWeekday(y, 11, 4, 4), "Thanksgiving"],
    [iso(y, 12, 24), "Christmas Eve"],
    [iso(y, 12, 25), "Christmas Day"],
    [iso(y, 12, 31), "New Year's Eve"],
  ];
}

const TABLES: Readonly<Record<string, (y: number) => [string, string][]>> = { US: usHolidays };

const cache = new Map<string, Map<string, string>>();

export function holidaysFor(country: string, year: number): Map<string, string> {
  const key = `${country}-${year}`;
  if (!cache.has(key)) cache.set(key, new Map(TABLES[country]?.(year) ?? []));
  return cache.get(key)!;
}

export function hasHolidayTable(country: string): boolean {
  return country in TABLES;
}
