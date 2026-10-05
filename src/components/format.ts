// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { Day } from "../engine/almanac";
import type { Tier } from "../engine/rules";

export const TIER_ORDER: Tier[] = ["Recommended", "Acceptable", "Caution", "Excluded"];

export const TIER_LABELS: Record<Tier, string> = {
  Recommended: "Great",
  Acceptable: "Good",
  Caution: "Caution",
  Excluded: "Poor",
};

export const TIER_TIPS: Record<Tier, string> = {
  Recommended:
    "Our almanac lists the day for 嫁娶 weddings, no wedding taboo rules it out, and the adjusted rating is Good or Excellent.",
  Acceptable:
    "At least one almanac lists the day for weddings and no wedding taboo rules it out, but our almanac does not list it or the adjusted rating is only Neutral.",
  Caution:
    "Listed for weddings, but the adjusted rating is Caution because of a serious conflict with a birth chart or several warning flags.",
  Excluded:
    "Listed for weddings by some almanac, but a wedding taboo rules it out or a clash with a birth chart rates it Avoid.",
};

export const SOURCE_TIPS: Record<string, string> = {
  lunar_python:
    "Our almanac, calculated with the rules of the Qing imperial manual 协纪辨方书, lists this day for 嫁娶 weddings.",
  chinesecalendaronline:
    "The chinesecalendaronline.com almanac page for this day lists it for 嫁娶 weddings.",
  tongshutoday:
    "The tongshutoday.com wedding list includes this day. That list screens out days by their day officer and unlucky stars.",
  yourchineseastrology:
    "The yourchineseastrology.com list of auspicious wedding dates includes this day.",
  chinesefortunecalendar:
    "The chinesefortunecalendar.com Chinese Farmer's Almanac, calculated for US Central time, includes this day.",
  regenthotels:
    "The Regent Hong Kong hotel's published wedding-date list for 2026 to 2027 includes this day.",
  baibai:
    "The baibai.app wedding-date list, calculated with the lunar-javascript library, includes this day.",
};

export const signed = (n: number) => `${n >= 0 ? "+" : ""}${n}`;

export function picks(day: Day): string[] {
  return day.hours.filter((h) => h.pick).map((h) => `${h.branch} ${h.local}`);
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const monthLabel = (ym: string) =>
  `${MONTH_NAMES[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;

export const MAX_CALENDAR_YEARS = 3;

export function calendarYears(start: string, end: string): number {
  return Number(end.slice(0, 4)) - Number(start.slice(0, 4)) + 1;
}

export function monthOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function pastMonths(start: string, end: string, current: string): string[] {
  return [...new Set([start, end])].filter((ym) => ym < current);
}
