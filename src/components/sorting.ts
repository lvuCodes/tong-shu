// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { Day } from "../engine/almanac";

export type SortDir = "ascending" | "descending";

export type Sort = { key: string; dir: SortDir } | null;

export function nextSort(cur: Sort, key: string, first: SortDir = "ascending"): Sort {
  if (!cur || cur.key !== key) return { key, dir: first };
  if (cur.dir !== first) return null;
  return { key, dir: first === "ascending" ? "descending" : "ascending" };
}

export interface Sortable<T> {
  key: string;
  sort?: (row: T) => number | string;
  first?: SortDir;
}

export function sortRows<T = Day>(days: T[], cols: Sortable<T>[], sort: Sort): T[] {
  const col = sort && cols.find((c) => c.key === sort.key);
  if (!sort || !col?.sort) return days;
  const sign = sort.dir === "ascending" ? 1 : -1;
  return days
    .map((d, i) => ({ d, i, v: col.sort!(d) }))
    .sort((a, b) => (a.v < b.v ? -1 : a.v > b.v ? 1 : 0) * sign || a.i - b.i)
    .map((r) => r.d);
}
