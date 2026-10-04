// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { Day } from "../engine/almanac";
import type { Column } from "./columns";

export type Sort = { key: string; dir: "ascending" | "descending" } | null;

export function nextSort(cur: Sort, key: string): Sort {
  if (!cur || cur.key !== key) return { key, dir: "ascending" };
  return cur.dir === "ascending" ? { key, dir: "descending" } : null;
}

export function sortRows(days: Day[], cols: Column[], sort: Sort): Day[] {
  const col = sort && cols.find((c) => c.key === sort.key);
  if (!sort || !col?.sort) return days;
  const sign = sort.dir === "ascending" ? 1 : -1;
  return days
    .map((d, i) => ({ d, i, v: col.sort!(d) }))
    .sort((a, b) => (a.v < b.v ? -1 : a.v > b.v ? 1 : 0) * sign || a.i - b.i)
    .map((r) => r.d);
}
