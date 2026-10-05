// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import type { SortDir } from "./sorting";
import type { Day } from "../engine/almanac";
import { lunarDateEn } from "../engine/dictionary";
import {
  AdjustedPill,
  Bi,
  Gz,
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
  first?: SortDir;
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
    first: "descending",
    cell: (d) => (d.group.persons[label] ? <VerdictPill a={d.group.persons[label]} /> : "-"),
    className: "nowrap",
    desc: `${label}'s own rating for the day. The day's pillar is compared with each pillar of ${label}'s birth chart. Harmonies add points, while clashes, punishments, harms and breaks take points away. Hover over the rating to see the reasons.`,
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
      desc: "The everyday calendar date. Click it to open the day in Calendar View with its full almanac entry and hour-by-hour table.",
    },
    {
      key: "day",
      label: "Day",
      sort: (d) => WEEKDAY_ORDER.indexOf(d.weekday),
      cell: (d) => d.weekday,
      desc: "Day of the week.",
    },
    {
      key: "hours",
      label: "Best local hours",
      className: "mono nowrap",
      cell: (d) => {
        const hours = picks(d);
        return hours.length ? hours.map((h) => <div key={h}>{h}</div>) : "-";
      },
      desc: `The 时辰 two-hour periods that are auspicious (Yellow Belt) and do not clash with either birth chart, shown in local clock time for ${place}. The times are adjusted for the sun's actual position.`,
    },
    {
      key: "lunar",
      label: "Lunar date",
      className: "nowrap",
      cell: (d) => <Bi zh={d.lunar} english={lunarDateEn(d.lunar, d.lunarMonth, d.lunarDay)} />,
      desc: "The date in the Chinese lunar calendar, which follows both the moon and the sun. Several taboos, such as 三娘煞 Three Maidens and the monthly taboo days, fall on fixed lunar dates.",
    },
    {
      key: "pillar",
      label: "日柱 Day pillar",
      className: "nowrap",
      cell: (d) => <Gz gz={d.pillars.day} />,
      desc: "The day's stem and branch in the repeating 60-day cycle. The branch, an animal sign, is compared with each birth chart. The stem is compared with each person's day master, the stem that stands for that person.",
    },
    {
      key: "officer",
      label: "建除 Day officer",
      cell: (d) => <Bi zh={d.officer} english={d.officerEn} />,
      desc: "One of the twelve 建除十二神 day officers, which rotate through each month. Each one favors some activities and forbids others.",
    },
    {
      key: "god",
      label: "天神 Day god",
      className: "nowrap",
      cell: (d) => (
        <Bi
          zh={`${d.tianShen} ${d.belt}`}
          english={`${d.tianShenEn}, ${d.belt === "黄道" ? "Yellow Belt" : "Black Belt"}`}
        />
      ),
      desc: "The spirit in charge of the day. Six of these spirits are 黄道 Yellow Belt, which is auspicious, and six are 黑道 Black Belt, which is inauspicious. A Yellow Belt day ranks slightly higher.",
    },
    ...labels.map(person),
    {
      key: "overall",
      label: "Overall score",
      sort: (d) => d.group.score,
      first: "descending",
      className: "nowrap",
      cell: (d) => <OverallPill day={d} />,
      desc: "The lower of the two personal ratings, so one bad conflict is never hidden by an average. The total beneath it adds up both personal scores plus any virtue stars, which add +1 each.",
    },
    {
      key: "clash",
      label: "Clashing birth year",
      className: "nowrap",
      cell: (d) => (
        <Bi zh={`${d.chongAnimal} ${d.clash.gz}`} english={`born ${d.clash.years.join(", ")}`} />
      ),
      desc: "The day clashes with one zodiac animal. By tradition, guests born in those years skip the ceremony itself.",
    },
    {
      key: "donggong",
      label: "董公 Dǒng Gōng",
      sort: (d) => d.dongGong.rating,
      first: "descending",
      className: "nowrap",
      cell: (d) => <DongGongPill day={d} />,
      desc: "The rating from the classic date-selection manual 董公选择日要览 for this month and day pillar, from very bad (xx) to very good (***). Its wedding rating counts as one flag.",
    },
    {
      key: "flags",
      label: "Flags",
      sort: (d) => d.group.flagPoints,
      first: "descending",
      cell: (d) => <FlagPills day={d} />,
      desc: "Folk and almanac signs that are milder than taboos. Green flags count +1 and amber flags count -1. Virtue stars appear here too, but they count toward the total instead.",
    },
    {
      key: "adjusted",
      label: "Adjusted score",
      sort: (d) => d.group.adjustedScore,
      first: "descending",
      className: "nowrap",
      cell: (d) => <AdjustedPill day={d} />,
      desc: "The overall rating after the flags are counted. Every 2 net flag points move the rating one level. Flags never push a day down to Avoid, and never raise a Caution or Avoid day. This rating decides the day's group.",
    },
    {
      key: "sources",
      label: "Sources and notes",
      sort: (d) => d.listed.length,
      first: "descending",
      cell: (d) => (
        <div className="cellstack">
          <SourceList day={d} />
          <NotePills day={d} place={place} />
        </div>
      ),
      desc: "The other almanacs that list the day for 嫁娶 weddings. Notes below them mark public holidays at the event location, Friday the 13th, days whose rating depends on an unknown birth hour, and days our almanac does not list.",
    },
  ];
}

export const TABOO_COLUMN: Column = {
  key: "taboos",
  label: "Taboos",
  sort: (d) => d.taboos.length,
  first: "descending",
  cell: (d) => <TabooPills day={d} />,
  desc: "Wedding taboos that rule a day out no matter how good it is otherwise, such as 三娘煞 Three Maidens, 月厌, 岁破 Year Breaker and 月破 Month Breaker. Shown only in the Poor table.",
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
