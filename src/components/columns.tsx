// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import type { Day } from "../engine/almanac";
import { ganzhiEn, lunarDateEn } from "../engine/dictionary";
import {
  AdjustedPill,
  Bi,
  DongGongPill,
  FlagPills,
  NotePills,
  OverallPill,
  SourceList,
  TabooPills,
  VerdictPill,
} from "./pills";
import { picks } from "./format";

export interface Column {
  key: string;
  label: string;
  desc: string;
  sort?: (d: Day) => number | string;
  cell: (d: Day) => ReactNode;
  className?: string;
}

const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weddingColumns(
  labels: string[],
  place: string,
  openDay: (date: string) => void,
): Column[] {
  const person = (label: string): Column => ({
    key: `person-${label}`,
    label,
    sort: (d) => d.group.persons[label]?.score ?? 0,
    cell: (d) => (d.group.persons[label] ? <VerdictPill a={d.group.persons[label]} /> : "-"),
    className: "nowrap",
    desc: `${label}'s own rating for the day: the day pillar compared with each pillar of ${label}'s birth chart. Harmonies add points, clashes, punishments, harms and breaks subtract them. Hover the pill for the scored reasons.`,
  });
  return [
    {
      key: "date",
      label: "Date",
      sort: (d) => d.date,
      className: "nowrap",
      cell: (d) => (
        <button type="button" className="datelink" onClick={() => openDay(d.date)}>
          {d.date}
        </button>
      ),
      desc: "Gregorian date. Click it to open the day in the Calendar tab with its full almanac entry and hour table.",
    },
    {
      key: "day",
      label: "Day",
      sort: (d) => WEEKDAY_ORDER.indexOf(d.weekday),
      cell: (d) => d.weekday,
      desc: "Day of the week.",
    },
    {
      key: "lunar",
      label: "Lunar date",
      className: "nowrap",
      cell: (d) => <Bi zh={d.lunar} english={lunarDateEn(d.lunar, d.lunarMonth, d.lunarDay)} />,
      desc: "Date in the Chinese lunisolar calendar. Several taboos, such as 三娘煞 Three Maidens and the monthly taboo days, fall on fixed lunar days.",
    },
    {
      key: "pillar",
      label: "Day pillar 日柱",
      className: "nowrap",
      cell: (d) => (
        <Bi zh={<span className="gz">{d.pillars.day}</span>} english={ganzhiEn(d.pillars.day)} />
      ),
      desc: "The stem and branch of the day in the 60-day cycle. The branch (animal) is compared with each birth chart, and the stem sets the ten-god relation to each person's day master.",
    },
    {
      key: "officer",
      label: "Day officer 建除",
      cell: (d) => <Bi zh={d.officer} english={d.officerEn} />,
      desc: "One of the twelve day officers 建除十二神, which cycle through the month. Each favors or forbids certain activities.",
    },
    {
      key: "god",
      label: "Day god 天神",
      className: "nowrap",
      cell: (d) => (
        <Bi
          zh={`${d.tianShen} ${d.belt}`}
          english={`${d.tianShenEn}, ${d.belt === "黄道" ? "Yellow Belt" : "Black Belt"}`}
        />
      ),
      desc: "The ruling spirit of the day. Six are Yellow Belt 黄道, auspicious, and six are Black Belt 黑道, inauspicious. A Yellow Belt day ranks slightly higher.",
    },
    ...labels.map(person),
    {
      key: "overall",
      label: "Overall",
      sort: (d) => d.group.score,
      className: "nowrap",
      cell: (d) => <OverallPill day={d} />,
      desc: "The lowest personal rating, so one bad conflict is never averaged away. The total beneath it adds every personal score and any virtue stars, which add +1 each.",
    },
    {
      key: "clash",
      label: "Clashing birth year",
      className: "nowrap",
      cell: (d) => (
        <Bi zh={`${d.chongAnimal} ${d.clash.gz}`} english={`born ${d.clash.years.join(", ")}`} />
      ),
      desc: "The day's branch clashes one zodiac animal. Guests born in those years are traditionally advised to avoid the ceremony itself.",
    },
    {
      key: "hours",
      label: "Best hours, local clock",
      className: "mono",
      cell: (d) => picks(d),
      desc: `The two-hour periods 时辰 that are Yellow Belt and do not clash anyone's chart, converted to the local clock in ${place} using true solar time.`,
    },
    {
      key: "donggong",
      label: "董公 Dong Gong",
      sort: (d) => d.dongGong.rating,
      className: "nowrap",
      cell: (d) => <DongGongPill day={d} />,
      desc: "The verdict of the classical date-selection manual 董公选择日要览 for this month and day pillar, from very bad xx to very good ***. Its marriage verdict counts as one flag.",
    },
    {
      key: "flags",
      label: "Flags",
      sort: (d) => d.group.flagPoints,
      cell: (d) => <FlagPills day={d} />,
      desc: "Folk and almanac signs that are not hard taboos: green ones count +1, amber ones count -1. Virtue stars are listed here too but are scored in the total, not as flags.",
    },
    {
      key: "adjusted",
      label: "Adjusted with flags",
      sort: (d) => d.group.adjustedScore,
      className: "nowrap",
      cell: (d) => <AdjustedPill day={d} />,
      desc: "The overall rating after the flags. Every 2 net flag points move the rating one level, but flags never push a day to Avoid or lift a Caution or Avoid day. This rating decides the tier.",
    },
    {
      key: "sources",
      label: "Listed for weddings by",
      sort: (d) => d.listed.length,
      cell: (d) => <SourceList day={d} />,
      desc: "How many almanac sources list the day as suitable for 嫁娶 (wedding), followed by which ones. A day must be listed by lunar-python to be Recommended.",
    },
    {
      key: "notes",
      label: "Notes",
      cell: (d) => <NotePills day={d} place={place} />,
      desc: "Public holidays at the event location, days whose rating depends on an unknown birth hour, and days the main almanac does not list.",
    },
  ];
}

export const TABOO_COLUMN: Column = {
  key: "taboos",
  label: "Taboos",
  sort: (d) => d.taboos.length,
  cell: (d) => <TabooPills day={d} />,
  desc: "Hard taboos that rule a day out for weddings whatever else it has going for it, such as 三娘煞 Three Maidens, 月厌, 岁破 Year Breaker and 月破 Month Breaker. Shown only in the Excluded table.",
};

export function excludedColumns(cols: Column[], labels: string[]): Column[] {
  const pick = (k: string) => cols.find((c) => c.key === k)!;
  return [
    pick("date"),
    pick("day"),
    pick("pillar"),
    TABOO_COLUMN,
    ...labels.map((l) => pick(`person-${l}`)),
    ...["overall", "flags", "adjusted", "sources"].map(pick),
  ];
}
