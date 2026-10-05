// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import { OFFICERS, TIAN_SHEN } from "../engine/dictionary";
import type { Tier } from "../engine/rules";
import { TIER_LABELS, TIER_ORDER } from "./format";
import { Formulas } from "./Formulas";
import { Ext, List, Sources } from "./Sources";

const TIER_PLAIN: Record<Tier, string> = {
  Recommended:
    "Our almanac lists the day for weddings, no taboo rules it out, and it suits both birth charts.",
  Acceptable:
    "At least one almanac lists the day for weddings and no taboo rules it out, but it falls short of the top group.",
  Caution: "Almanacs list it for weddings, but it conflicts with one of the birth charts.",
  Excluded: "A wedding taboo rules the day out, or it conflicts badly with the birth charts.",
};

const OVERVIEW: [string, ReactNode][] = [
  [
    "Tōng Shū 通书",
    "The traditional Chinese almanac, published every year for centuries. For each day, it lists which activities are auspicious and which to avoid.",
  ],
  [
    "Date selection 择日",
    "Many families choose an auspicious day for major events such as weddings. An auspicious day is one the almanac recommends, that breaks no traditional taboos, and that suits the birth charts of the people involved.",
  ],
  [
    "Purpose",
    "Enter both birth dates and a date range, and the site rates each day in that range for a wedding. Hover over any rating to see how it was worked out.",
  ],
];

const PROCESS: [string, ReactNode][] = [
  [
    "Calendar",
    "The site calculates the almanac for each day directly in your browser, using the same rules as the classic texts.",
  ],
  [
    "Birth charts",
    "A birth date, time and place produce a birth chart called the 八字 Four Pillars. The four pillars stand for the year, month, day and hour of birth. If you only know a range of birth times, the site checks every hour in that range.",
  ],
  [
    "Day ratings",
    "Each day has its own pillar as well. When the day's pillar harmonizes with a birth chart, the day gains points. When it conflicts with a chart, the day loses points.",
  ],
  [
    "Wedding taboos",
    "Certain days are never used for weddings, such as 三娘煞 Three Maidens days. These days drop straight to Poor.",
  ],
  [
    "Flags",
    "Smaller folk signs, called flags, such as the 天喜 Heavenly Joy star, raise or lower a day's rating slightly.",
  ],
  [
    "Rating groups",
    <ul key="tiers" className="plain">
      {TIER_ORDER.map((t) => (
        <li key={t}>
          <b>{TIER_LABELS[t]}</b>: {TIER_PLAIN[t]}
        </li>
      ))}
    </ul>,
  ],
  [
    "Comparison",
    "Each day also shows which wedding-date websites list it, so you can compare the ratings with other almanacs.",
  ],
  [
    "Calendar View",
    "Shows the same ratings as a monthly calendar. Selecting a day opens everything the almanac says about it, hour by hour.",
  ],
];

const OFFICER_USES: Record<string, string> = {
  建: "starting new plans and meeting people, but not digging or building",
  除: "cleaning, clearing away the old and seeking medical care",
  满: "celebrations, gatherings and filling storehouses",
  平: "ordinary work and repairs, with little special luck",
  定: "weddings, contracts and other lasting agreements",
  执: "taking hold of things, such as hiring or building",
  破: "only demolition and breaking things down, and avoided for weddings",
  危: "careful, low-risk tasks, though the classic verse still counts it as a usable day",
  成: "almost everything, including weddings and openings",
  收: "collecting debts, harvests and payments",
  开: "openings, starting a business and beginning travel",
  闭: "closing things up and burials, but not openings or weddings",
};

const YELLOW_BELT = ["青龙", "明堂", "金匮", "天德", "玉堂", "司命"];
const BLACK_BELT = ["天刑", "朱雀", "白虎", "天牢", "玄武", "勾陈"];

const FOUR_SYMBOLS: Record<string, string> = {
  青龙: "https://en.wikipedia.org/wiki/Azure_Dragon",
  朱雀: "https://en.wikipedia.org/wiki/Vermilion_Bird",
  白虎: "https://en.wikipedia.org/wiki/White_Tiger_(China)",
  玄武: "https://en.wikipedia.org/wiki/Black_Turtle-Snake",
};

const names = (zh: string[], map: Readonly<Record<string, string>>) =>
  zh.map((z, i) => (
    <span key={z}>
      {i ? ", " : ""}
      {FOUR_SYMBOLS[z] ? (
        <Ext href={FOUR_SYMBOLS[z]}>
          {z} {map[z]}
        </Ext>
      ) : (
        `${z} ${map[z]}`
      )}
    </span>
  ));

const TERMS: [string, ReactNode][] = [
  [
    "Stems and branches 干支",
    <>
      Chinese calendars count years, months, days and hours with pairs of characters. There are 10{" "}
      <Ext href="https://en.wikipedia.org/wiki/Heavenly_Stems">heavenly stems</Ext>, each tied to an{" "}
      <Ext href="https://en.wikipedia.org/wiki/Wuxing_(Chinese_philosophy)">element</Ext> (wood,
      fire, earth, metal or water), and 12{" "}
      <Ext href="https://en.wikipedia.org/wiki/Earthly_Branches">earthly branches</Ext>, each tied
      to a zodiac animal. Together they form a repeating cycle of 60 pairs.
    </>,
  ],
  [
    "Pillar 柱",
    "One stem and branch pair. A birth chart has four pillars, for the year, month, day and hour of birth. Each day of the calendar also has its own day pillar.",
  ],
  [
    "Day master 日主",
    "The stem of a person's day pillar. It stands for the person in their own chart.",
  ],
  [
    "Spouse star",
    "The stems in a chart that stand for a husband or wife. Tradition reads the officer stems 正官 and 七杀 for a woman and the wealth stems 正财 and 偏财 for a man.",
  ],
  [
    "Harmonies and conflicts",
    "Branches that combine are harmonies, either as a 六合 pair or as a 三合 group of three. Branches six places apart on the zodiac wheel 冲 clash. 刑 Punishments, 害 harms and 破 breaks are milder conflicts.",
  ],
  [
    "Day officer 建除十二神",
    <>
      Twelve officers take turns ruling the days of each month. Each one suits certain activities.
      <ul className="plain">
        {Object.entries(OFFICERS).map(([zh, en]) => (
          <li key={zh}>
            <b>
              {zh} {en}
            </b>
            : {OFFICER_USES[zh]}
          </li>
        ))}
      </ul>
    </>,
  ],
  [
    "Day god 天神",
    <>
      Twelve spirits also take turns ruling the days. Six belong to the auspicious 黄道 Yellow Belt
      and six to the inauspicious 黑道 Black Belt.
      <ul className="plain">
        <li>
          <b>Yellow Belt</b>: {names(YELLOW_BELT, TIAN_SHEN)}
        </li>
        <li>
          <b>Black Belt</b>: {names(BLACK_BELT, TIAN_SHEN)}
        </li>
      </ul>
    </>,
  ],
  [
    "Suitable and avoid 宜 忌",
    "The almanac's two lists for each day. 宜 names the activities the day suits, and 忌 names the ones to avoid. A wedding day should list 嫁娶 under 宜.",
  ],
  [
    "Lunar date 农历",
    "The date in the Chinese calendar, where each month starts on a new moon. A year has 12 or 13 months.",
  ],
  [
    "Leap month 闰月",
    "An extra month added about every three years to keep the lunar calendar in step with the seasons. Some families avoid weddings during it.",
  ],
  [
    "Solar terms 节气",
    "Twenty-four points in the sun's yearly path, about 15 days apart. The almanac's months begin at every other solar term, so they can differ from the lunar months.",
  ],
  [
    "Start of Spring 立春",
    "The solar term, around February 4, that begins the zodiac year. A lunar year with no Start of Spring is called a 无春 widow year, and one with two is a 双春 double spring year.",
  ],
  [
    "Clashing animal 冲",
    "Each day clashes with one zodiac animal. Guests born in that animal's years traditionally skip the ceremony.",
  ],
  ["Shà direction 煞", "The compass direction considered unlucky on that day."],
  [
    "Lunar mansion 宿",
    "One of 28 star groups along the moon's path. Each day falls under one mansion, and each mansion has a lucky or unlucky reputation.",
  ],
  [
    "Sound element 纳音",
    "An extra element given to each of the 60 stem and branch pairs, with names like 海中金 Sea Metal or 炉中火 Furnace Fire.",
  ],
  [
    "Two-hour periods 时辰",
    "The day is split into 12 periods of two hours, each named for a branch. The first, 子, runs from 11 pm to 1 am.",
  ],
  [
    "Virtue stars",
    "Protective stars set by the month, such as 天德 Heavenly Virtue and 月德 Monthly Virtue. Each one adds a point to a day's total.",
  ],
  [
    "Dǒng Gōng 董公",
    "A classic manual that rates each day pillar in each month for weddings and other events, from very bad (xx) to very good (***).",
  ],
];

const LIMITS: [string, ReactNode][] = [
  [
    "Tradition",
    "Date selection is a cultural tradition, not a science, and different schools follow different rules. Treat these ratings as a well-documented starting point.",
  ],
  [
    "Practitioners",
    "If your family follows a particular master or temple, confirm your shortlist with them.",
  ],
];

const PRIVACY: [string, ReactNode][] = [
  ["Birth details", "Birth details stay in your browser and are never sent to a server."],
  [
    "Place names",
    <>
      Place names are sent to the{" "}
      <Ext href="https://open-meteo.com/en/docs/geocoding-api">Open-Meteo place search</Ext> only to
      look up their time zone and longitude.
    </>,
  ],
  [
    "Source code",
    <>
      This site is free, open-source software. Its code is available on{" "}
      <Ext href="https://github.com/lvuCodes/tong-shu">GitHub</Ext>.
    </>,
  ],
];

export function About({ note }: { note?: string }) {
  return (
    <section className="sources" aria-label="About">
      <h2>Overview</h2>
      <List items={OVERVIEW} />
      <h2>Process</h2>
      <List items={PROCESS} />
      <details className="info">
        <summary>Formulas</summary>
        <Formulas />
      </details>
      <h2>Terms</h2>
      <List items={TERMS} />
      <h2>Limitations</h2>
      <List items={LIMITS} />
      <h2>Privacy</h2>
      <List items={PRIVACY} />
      <h2>Sources</h2>
      <Sources note={note} />
    </section>
  );
}
