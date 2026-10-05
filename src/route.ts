// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

export type Tab = "selection" | "calendar" | "about";

export const TABS: [Tab, string][] = [
  ["selection", "Date View"],
  ["calendar", "Calendar View"],
  ["about", "About"],
];

export interface Route {
  tab: Tab;
  month: string;
  selected: string;
}

const MONTH = /^\d{4}-\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseRoute(hash: string, fallbackMonth: string): Route {
  const [tab, month, selected] = hash.replace(/^#/, "").split("/");
  const known = TABS.some(([id]) => id === tab);
  if (!known || tab !== "calendar")
    return { tab: known ? (tab as Tab) : "selection", month: fallbackMonth, selected: "" };
  return {
    tab,
    month: MONTH.test(month ?? "") ? month : fallbackMonth,
    selected: DATE.test(selected ?? "") ? selected : "",
  };
}

export function formatRoute({ tab, month, selected }: Route): string {
  if (tab !== "calendar") return `#${tab}`;
  return selected ? `#calendar/${month}/${selected}` : `#calendar/${month}`;
}
