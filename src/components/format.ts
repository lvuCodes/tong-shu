// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { Day } from "../engine/almanac";
import type { Tier } from "../engine/rules";

export const TIER_ORDER: Tier[] = ["Recommended", "Acceptable", "Caution", "Excluded"];

export const TIER_TIPS: Record<Tier, string> = {
  Recommended:
    "lunar-python lists 嫁娶 (wedding), no hard taboo applies, and the adjusted overall rating is Good or Excellent.",
  Acceptable:
    "At least one source lists the day for weddings and no hard taboo applies, but lunar-python does not list it or the adjusted rating is Neutral.",
  Caution:
    "Listed for weddings, but the adjusted overall rating is Caution because of a serious chart conflict or heavy flags.",
  Excluded:
    "Listed for weddings by some source, but a hard taboo applies or a chart clash rates the pair Avoid.",
};

export const SOURCE_TIPS: Record<string, string> = {
  lunar_python:
    "Main almanac calculation, following the Qing imperial manual 协纪辨方书. Lists 嫁娶 (wedding) as suitable on this day.",
  chinesecalendaronline:
    "chinesecalendaronline.com daily almanac page lists 嫁娶 (wedding) as suitable.",
  tongshutoday:
    "tongshutoday.com wedding list, which filters by day officer and star vetoes, includes this day.",
  yourchineseastrology: "yourchineseastrology.com auspicious wedding date list includes this day.",
  chinesefortunecalendar:
    "chinesefortunecalendar.com Chinese Farmer's Almanac, computed for US Central time, includes this day.",
  regenthotels:
    "Regent Hong Kong hotel's published 2026 to 2027 wedding date list includes this day.",
  baibai:
    "baibai.app wedding date list, computed with the lunar-javascript library, includes this day.",
};

export const signed = (n: number) => `${n >= 0 ? "+" : ""}${n}`;

export function picks(day: Day): string {
  return (
    day.hours
      .filter((h) => h.pick)
      .map((h) => `${h.branch} ${h.local}`)
      .join(", ") || "-"
  );
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
