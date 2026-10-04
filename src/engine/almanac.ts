// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.
// Port of the personal report's build_day: one wedding-selection record per date.

import { LunarUtil, Solar, type Lunar } from "lunar-javascript";
import dongGongTable from "../../pipeline/data/sources/donggong-table.json";
import hexagramTable from "../../pipeline/data/sources/chinesemetasoft-hexagrams.json";
import type { CcoDay, CcoReliability } from "../data/snapshots";
import { HOUR_SLOTS, parseIso } from "./day";
import { ANIMALS, OFFICERS, TIAN_SHEN } from "./dictionary";
import { holidaysFor } from "./holidays";
import {
  MITIGATING_STARS,
  adjustForFlags,
  assessGroup,
  clashBranch,
  dongGongFlags,
  dongGongLookup,
  hourSafe,
  localWindow,
  lunarYearInfo,
  softFlags,
  tierReason,
  weddingTaboos,
  weddingTier,
  type DongGong,
  type DongGongRow,
  type Flag,
  type GroupAssessment,
  type LunarYearInfo,
  type Person,
  type Tier,
  type Verdict,
} from "./rules";
import { normalizeTerms } from "./terms";

export interface EventPlace {
  place: string;
  tz: string;
  lon: number;
  country: string;
}

export interface Snapshots {
  cco: Record<string, CcoDay>;
  reliability: Record<string, CcoReliability>;
  weddings: Record<string, readonly string[]>;
}

export interface Hexagram {
  king_wen: number;
  gua: number;
  star: number;
  name_en: string;
  name_zh: string;
  luo_pan: number;
  location: string;
  degrees: string;
}

export interface Hour {
  branch: string;
  slot: string;
  local: string;
  ganzhi: string;
  tianShen: string;
  belt: string;
  luck: string;
  cco: "吉" | "凶" | null;
  safe: boolean;
  pick: boolean;
}

export interface DayDetail {
  currentTerm: string;
  wuhou: string;
  liuyao: string;
  mansion: string;
  mansionLuck: string;
  mansionAnimal: string;
  mansionElement: string;
  taiShen: string;
  nineStar: string;
  directions: Record<string, string>;
  festivals: string[];
  hours: { chong: string; yi: string[]; ji: string[] }[];
}

export interface Day {
  date: string;
  weekday: string;
  weekend: boolean;
  lunarYear: number;
  lunar: string;
  lunarMonth: number;
  lunarDay: number;
  pillars: { year: string; month: string; day: string };
  nayin: string;
  jieqi: string | null;
  officer: string;
  officerEn: string;
  tianShen: string;
  tianShenEn: string;
  belt: string;
  beltLuck: string;
  chong: string;
  chongAnimal: string;
  clash: { gz: string; years: number[] };
  sha: string;
  pengzu: [string, string];
  yi: string[];
  ji: string[];
  jiShen: string[];
  xiongSha: string[];
  holiday: string | null;
  sources: Record<string, boolean>;
  listed: string[];
  taboos: string[];
  tier: Tier | null;
  tierReason: string;
  group: GroupAssessment & { flagPoints: number; adjustedScore: number; adjustedVerdict: Verdict };
  flags: Flag[];
  hours: Hour[];
  dongGong: DongGong;
  hexagrams: Hexagram[];
  cco: { reliable: boolean; captured: boolean };
}

export const SOURCE_LABELS: Readonly<Record<string, string>> = {
  lunar_python: "lunar-python",
  chinesecalendaronline: "CCO",
  tongshutoday: "TST",
  yourchineseastrology: "YCA",
  chinesefortunecalendar: "CFC",
  regenthotels: "Regent",
  baibai: "BaiBai",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const HEXAGRAMS = hexagramTable as Record<string, Hexagram[]>;
const DONG_GONG = dongGongTable as DongGongRow[];

export function addDays(iso: string, n: number): string {
  const [y, m, d] = parseIso(iso);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function birthYears(gz: string, until: number): number[] {
  const idx = Array.from({ length: 60 }, (_, i) => i).find(
    (i) => STEMS[i % 10] === gz[0] && BRANCHES[i % 12] === gz[1],
  )!;
  const out: number[] = [];
  for (let y = 1920; y < until; y++) if ((((y - 4) % 60) + 60) % 60 === idx) out.push(y);
  return out;
}

const yearCache = new Map<number, LunarYearInfo>();
export function yearInfo(lunarYear: number): LunarYearInfo {
  if (!yearCache.has(lunarYear)) yearCache.set(lunarYear, lunarYearInfo(lunarYear));
  return yearCache.get(lunarYear)!;
}

const lunarCache = new Map<string, Lunar>();

function lunarOf(date: string): Lunar {
  if (!lunarCache.has(date)) lunarCache.set(date, Solar.fromYmd(...parseIso(date)).getLunar());
  return lunarCache.get(date)!;
}

function hourCore(l: Lunar, i: number) {
  const gan = (((l.getDayGanIndexExact() % 5) * 2 + i) % 10) + 1;
  const tianShen =
    LunarUtil.TIAN_SHEN[((i + LunarUtil.ZHI_TIAN_SHEN_OFFSET[l.getDayZhiExact()]) % 12) + 1];
  const belt = LunarUtil.TIAN_SHEN_TYPE[tianShen];
  return {
    branch: LunarUtil.ZHI[i + 1],
    ganzhi: LunarUtil.GAN[gan] + LunarUtil.ZHI[i + 1],
    tianShen,
    belt,
    luck: LunarUtil.TIAN_SHEN_TYPE_LUCK[belt],
  };
}

export function dayDetail(date: string, snap: Snapshots): DayDetail {
  const l = lunarOf(date);
  const festivals = [...l.getFestivals(), ...l.getOtherFestivals(), ...l.getSolar().getFestivals()];
  const holiday = snap.cco[date]?.holiday;
  if (holiday && !festivals.includes(holiday)) festivals.push(holiday);
  return {
    currentTerm: l.getPrevJieQi(true).getName(),
    wuhou: l.getWuHou(),
    liuyao: l.getLiuYao(),
    mansion: l.getXiu(),
    mansionLuck: l.getXiuLuck(),
    mansionAnimal: l.getAnimal(),
    mansionElement: l.getZheng(),
    taiShen: l.getDayPositionTai(),
    nineStar: l.getDayNineStar().toString(),
    directions: {
      喜神: l.getDayPositionXiDesc(),
      福神: l.getDayPositionFuDesc(),
      财神: l.getDayPositionCaiDesc(),
      阳贵: l.getDayPositionYangGuiDesc(),
      阴贵: l.getDayPositionYinGuiDesc(),
    },
    festivals,
    hours: l
      .getTimes()
      .slice(0, 12)
      .map((t) => ({
        chong: t.getChongDesc(),
        yi: normalizeTerms(t.getYi()),
        ji: normalizeTerms(t.getJi()),
      })),
  };
}

export function buildDay(date: string, people: Person[], event: EventPlace, snap: Snapshots): Day {
  const [y, m, d] = parseIso(date);
  const l = lunarOf(date);
  const nxt = lunarOf(addDays(date, 1));
  const dayGz = l.getDayInGanZhi();
  const yi = normalizeTerms(l.getDayYi());
  const ji = normalizeTerms(l.getDayJi());
  const jiShen = l.getDayJiShen();
  const taboos = weddingTaboos(l, nxt);
  const c = snap.cco[date];
  const reliable = snap.reliability[String(y)]?.reliable ?? false;

  const sources: Record<string, boolean> = {
    lunar_python: yi.includes("嫁娶") && !ji.includes("嫁娶"),
    chinesecalendaronline: Boolean(c?.yi?.includes("嫁娶")) && reliable,
    ...Object.fromEntries(Object.entries(snap.weddings).map(([k, v]) => [k, v.includes(date)])),
  };
  const mitigated = jiShen.some((s) => MITIGATING_STARS.has(s));
  const base = assessGroup(dayGz, people, mitigated, jiShen);
  const dongGong = dongGongLookup(DONG_GONG, l.getMonthInGanZhi()[1], dayGz);
  const flags = [...softFlags(l, people, yearInfo(l.getYear())), ...dongGongFlags(dongGong)];
  const group = { ...base, ...adjustForFlags(base, flags) };
  const tier = weddingTier(sources, taboos, group.adjustedVerdict);
  const goodHours = c?.good_hours;

  const hours: Hour[] = HOUR_SLOTS.map((slot, i) => {
    const core = hourCore(l, i);
    const safe = hourSafe(core.branch, people);
    const cco = goodHours ? (goodHours.includes(slot) ? "吉" : "凶") : null;
    return {
      ...core,
      slot,
      local: localWindow(date, (23 + 2 * i) % 24, event.tz, event.lon),
      cco,
      safe,
      pick: safe && core.luck === "吉" && cco !== "凶",
    };
  });

  const chongGz = l.getDayChongDesc().slice(1, 3);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const leap = l.getMonth() < 0;

  return {
    date,
    weekday: WEEKDAYS[weekday],
    weekend: weekday === 0 || weekday === 6,
    lunarYear: l.getYear(),
    lunar: `${leap ? "闰" : ""}${l.getMonthInChinese()}月${l.getDayInChinese()}`,
    lunarMonth: l.getMonth(),
    lunarDay: l.getDay(),
    pillars: { year: l.getYearInGanZhiByLiChun(), month: l.getMonthInGanZhi(), day: dayGz },
    nayin: l.getDayNaYin(),
    jieqi: l.getJieQi() || null,
    officer: l.getZhiXing(),
    officerEn: OFFICERS[l.getZhiXing()],
    tianShen: l.getDayTianShen(),
    tianShenEn: TIAN_SHEN[l.getDayTianShen()],
    belt: l.getDayTianShenType(),
    beltLuck: l.getDayTianShenLuck(),
    chong: l.getDayChongDesc(),
    chongAnimal: ANIMALS[clashBranch(dayGz[1])],
    clash: { gz: chongGz, years: birthYears(chongGz, y) },
    sha: l.getDaySha(),
    pengzu: [l.getPengZuGan(), l.getPengZuZhi()],
    yi,
    ji,
    jiShen,
    xiongSha: l.getDayXiongSha(),
    holiday: holidaysFor(event.country, y).get(date) ?? null,
    sources,
    listed: Object.keys(sources).filter((k) => sources[k]),
    taboos,
    tier,
    tierReason: tierReason(tier, sources, taboos, group.adjustedVerdict),
    group,
    flags,
    hours,
    dongGong,
    hexagrams: HEXAGRAMS[dayGz] ?? [],
    cco: { reliable, captured: Boolean(c) },
  };
}

export function buildRange(
  start: string,
  end: string,
  people: Person[],
  event: EventPlace,
  snap: Snapshots,
): Day[] {
  const days: Day[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(buildDay(d, people, event, snap));
  return days;
}

export function rankKey(day: Day): [number, string] {
  return [
    -day.group.adjustedScore -
      2 * Number(day.sources.lunar_python) -
      day.listed.length -
      Number(day.belt === "黄道"),
    day.date,
  ];
}

export function byRank(a: Day, b: Day): number {
  const [x, xd] = rankKey(a);
  const [y, yd] = rankKey(b);
  return x - y || (xd < yd ? -1 : xd > yd ? 1 : 0);
}
