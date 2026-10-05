// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import type { Manifest } from "../data/snapshots";
import { useManifest } from "../data/useManifest";

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

const SITES: Record<string, { name: string; href: string }> = {
  chinesecalendaronline: {
    name: "chinesecalendaronline.com",
    href: "https://www.chinesecalendaronline.com/zh/",
  },
  tongshutoday: {
    name: "tongshutoday.com",
    href: "https://tongshutoday.com/auspicious-days/wedding/",
  },
  yourchineseastrology: {
    name: "yourchineseastrology.com",
    href: "https://www.yourchineseastrology.com/calendar/auspicious-wedding-date.htm",
  },
  chinesefortunecalendar: {
    name: "chinesefortunecalendar.com",
    href: "https://www.chinesefortunecalendar.com/TDB/LuckyEvents.asp",
  },
  baibai: { name: "baibai.app", href: "https://baibai.app/auspicious-dates/wedding/" },
  regenthotels: {
    name: "Regent Hong Kong",
    href: "https://hongkong.regenthotels.com/auspicious-wedding-dates-2026-2027-plan-your-perfect-hong-kong-celebration/",
  },
};

function Site({ id }: { id: string }) {
  const site = SITES[id];
  return site ? <Ext href={site.href}>{site.name}</Ext> : <>{id}</>;
}

const EN_WIKI = "https://en.wikipedia.org/wiki/";
const ZH_WIKI = "https://zh.wikipedia.org/wiki/";

const WIKI: Record<string, string> = {
  "Tōng Shū 通书": `${EN_WIKI}Tung_Shing`,
  "Date selection 择日": `${ZH_WIKI}擇日學`,
  "Stems and branches 干支": `${EN_WIKI}Sexagenary_cycle`,
  "Pillar 柱": `${EN_WIKI}Four_Pillars_of_Destiny`,
  "Birth charts": `${EN_WIKI}Four_Pillars_of_Destiny`,
  "Day officer 建除十二神": `${ZH_WIKI}建除十二神`,
  "Lunar date 农历": `${EN_WIKI}Chinese_calendar`,
  "Leap month 闰月": `${EN_WIKI}Intercalation_(timekeeping)`,
  "Solar terms 节气": `${EN_WIKI}Solar_term`,
  "Start of Spring 立春": `${EN_WIKI}Lichun`,
  "Clashing animal 冲": `${EN_WIKI}Chinese_zodiac`,
  "Lunar mansion 宿": `${EN_WIKI}Twenty-Eight_Mansions`,
  "Sound element 纳音": `${ZH_WIKI}納音`,
  "Two-hour periods 时辰": `${EN_WIKI}Traditional_Chinese_timekeeping`,
};

const CJK_TAIL = /^(.*?)\s*([\u3400-\u9fff][\u3400-\u9fff\s]*)$/;

function splitTerm(term: ReactNode): [ReactNode, ReactNode] {
  const m = typeof term === "string" ? CJK_TAIL.exec(term) : null;
  return m ? [m[2], m[1]] : ["", term];
}

function List({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="guide">
      {items.map(([term, text], i) => {
        const [zh, en] = splitTerm(term);
        const href = typeof term === "string" ? WIKI[term] : undefined;
        return (
          <div key={i}>
            <dt className="zh">{zh}</dt>
            <dt>{href ? <Ext href={href}>{en}</Ext> : en}</dt>
            <dd>{text}</dd>
          </div>
        );
      })}
    </dl>
  );
}

const SOURCES: [ReactNode, ReactNode][] = [
  [
    "Calendar calculation",
    <>
      <Ext href="https://github.com/6tail/lunar-javascript">lunar-javascript</Ext> calculates the
      calendar for any date, past or future. It follows{" "}
      <Ext href={`${ZH_WIKI}協紀辨方書`}>协纪辨方书</Ext>, the official date-selection manual
      compiled for the Qing emperor in 1741.
    </>,
  ],
  [
    "Harmonies and clashes",
    <>
      The rules for which signs work together (合) or conflict (冲, 刑, 害, 破) come from two
      classic fortune-telling texts, <Ext href={`${ZH_WIKI}三命通會`}>三命通会</Ext> and{" "}
      <Ext href={`${EN_WIKI}Yuanhai_Ziping`}>渊海子平</Ext>.
    </>,
  ],
  [
    "Wedding taboos",
    "三娘煞, 杨公忌, 四离, 四绝 and 月厌 come from 协纪辨方书 and long-standing almanac tradition.",
  ],
  [
    "Folk flags",
    "红沙日, 月忌日, 孤辰, 寡宿, 红鸾, 天喜 and 无春 come from long-standing almanac tradition.",
  ],
  [
    "Dǒng Gōng verdicts",
    <>
      董公选择日要览 is a classic manual that rates each day of each month for weddings. Its
      verdicts match the{" "}
      <Ext href="https://www.chinesemetasoft.com/TongShu/Monthly">Chinese Metasoft Tong Shu</Ext>.
    </>,
  ],
  [
    "Place lookup",
    <>
      <Ext href="https://open-meteo.com/en/docs/geocoding-api">Open-Meteo</Ext> converts a place
      name into its time zone and longitude.
    </>,
  ],
];

function years(list: string[]): string {
  const sorted = [...list].sort();
  return sorted.length > 1 ? `${sorted[0]} to ${sorted[sorted.length - 1]}` : (sorted[0] ?? "none");
}

function coverage(manifest: Manifest | null | undefined): [ReactNode, ReactNode][] {
  if (!manifest) {
    const status =
      manifest === undefined ? "Loading saved lists…" : "Saved lists are unavailable right now.";
    return Object.keys(SITES).map((id) => [<Site key={id} id={id} />, status]);
  }
  return [
    [
      <Site key="cco" id="chinesecalendaronline" />,
      `Daily almanac pages, ${years(manifest.years)}`,
    ],
    ...Object.entries(manifest.wedding_sources).map(([id, ys]): [ReactNode, ReactNode] => [
      <Site key={id} id={id} />,
      `Wedding-date list, ${years(ys)}`,
    ]),
  ];
}

export function Sources({ note }: { note?: string }) {
  const manifest = useManifest();
  return (
    <>
      <List items={[...SOURCES, ...coverage(manifest)]} />
      {note ? <p>{note}</p> : null}
    </>
  );
}

export { List };
