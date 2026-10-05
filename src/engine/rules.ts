// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.
// Port of pipeline/zeri.py, the reference date-selection rules.

import { Lunar, LunarYear, Solar, type Lunar as LunarDay } from "lunar-javascript";

export const FLAG_TIPS: Readonly<Record<string, string>> = {
  无春: "Folk belief calls it a blind year and says a marriage begun in it lacks vitality. Many families ignore it.",
  双春: "The lunar year holds two 立春 dates. Folk belief treats it as lucky for marriage.",
  闰月: "An extra month inserted to keep the lunar calendar aligned with the seasons. Some families avoid weddings in it.",
  红沙日:
    "Falls on 酉 days in the first month of each season, 巳 days in the second and 丑 days in the third. Avoided for weddings and moving.",
  月忌日:
    "A folk saying holds these three days of every lunar month unlucky for starting important affairs.",
  彭祖忌嫁娶:
    "A traditional verse of daily prohibitions. On 亥 days it reads 亥不嫁娶不利新郎, meaning a wedding is unlucky for the groom.",
  清明: "A day set aside for honoring the dead. Families avoid celebrations on it.",
  四废: "The day's stem and branch are at their weakest for the season. Almanacs advise against starting anything.",
  五离: "Associated with partings. Avoided for weddings and contracts.",
  往亡: "Avoid setting out, including the bride leaving her family home.",
  归忌: "Avoid returning home, including bringing the bride into the new home.",
  天狗: "Folk belief says it harms newlyweds and children.",
  阴错: "A day of mismatched yin and yang. Traditionally unlucky for weddings.",
  阳错: "A day of mismatched yin and yang. Traditionally unlucky for weddings.",
  厌对: "Falls opposite the Monthly Loathing day (月厌). Older almanacs treat it as a wedding taboo.",
  天罡: "A harsh star that older wedding manuals avoid.",
  河魁: "A harsh star that older wedding manuals avoid.",
  不将: "Marks days free of the blocking generals. Long favored for weddings.",
  天喜: "A star of celebrations and happy events.",
  天赦: "One of the most auspicious stars. Said to forgive faults and clear obstacles.",
  孤辰日: "Computed from the birth-year animal. Folk belief links it to loneliness in marriage.",
  寡宿日: "Computed from the birth-year animal. Folk belief links it to separation in marriage.",
  红鸾日: "The romance star of the birth-year animal. A good sign for a wedding.",
  天喜日: "Falls opposite the Red Phoenix of the birth-year animal. A good sign for a wedding.",
  董公宜婚:
    "The classical date-selection manual 董公选择日要览 names marriage as suitable for this month and day pillar.",
  董公忌婚:
    "The classical date-selection manual 董公选择日要览 warns against marriage for this month and day pillar.",
  本命年: "Folk belief calls the year of one's own animal turbulent. Some avoid marrying in it.",
};

export const TABOO_TIPS: Readonly<Record<string, string>> = {
  月破: "The day's branch clashes the month's branch. Almanacs rule it out for every major event.",
  岁破: "The day's branch clashes the year's branch. Ruled out for weddings.",
  三娘煞:
    "Falls on the lunar 3rd, 7th, 13th, 18th, 22nd and 27th. Legend says weddings on these days fail.",
  杨公忌: "Thirteen fixed lunar dates said to bring misfortune to any undertaking.",
  四离: "The day before an equinox or solstice. Avoided for weddings.",
  四绝: "The day before the start of a season. Avoided for weddings.",
  鬼月: "The 7th lunar month, when spirits are believed to roam. Weddings are avoided.",
  月厌: "A classic wedding taboo that can override good stars.",
};

export const SOFT_CAUTION_STARS: Readonly<Record<string, string>> = {
  四废: "Four Wastes",
  五离: "Five Separations",
  往亡: "Going to Ruin",
  归忌: "Return Taboo",
  天狗: "Heavenly Dog",
  阴错: "Yin Error",
  阳错: "Yang Error",
  厌对: "Opposed Loathing",
  天罡: "Heavenly Ladle",
  河魁: "River Chief",
};

export const SOFT_POSITIVE_STARS: Readonly<Record<string, string>> = {
  不将: "No Generals, a classic wedding",
  天喜: "Heavenly Joy",
  天赦: "Heavenly Pardon",
};

export const VIRTUE_TIP =
  "Virtue stars 天德 Heavenly Virtue, 月德 Monthly Virtue, 天德合 and 月德合 are protective stars set by the month. The almanac says they cancel out harm, so each one adds +1.";
export const STEMS = "甲乙丙丁戊己庚辛壬癸";
export const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
export const STEM_ELEMENTS: Readonly<Record<string, string>> = {
  甲: "Yang Wood",
  乙: "Yin Wood",
  丙: "Yang Fire",
  丁: "Yin Fire",
  戊: "Yang Earth",
  己: "Yin Earth",
  庚: "Yang Metal",
  辛: "Yin Metal",
  壬: "Yang Water",
  癸: "Yin Water",
};

const pairSet = (pairs: string[]) => new Set(pairs.flatMap((p) => [p, p[1] + p[0]]));
const LIU_HE = pairSet(["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"]);
const HAI = pairSet(["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"]);
const PO = pairSet(["子酉", "卯午", "辰丑", "未戌", "寅亥", "巳申"]);
const XING = pairSet(["寅巳", "巳申", "申寅", "丑戌", "戌未", "未丑", "子卯"]);
const SELF_XING = new Set("辰午酉亥");
const SAN_HE = ["申子辰", "亥卯未", "寅午戌", "巳酉丑"];
const STEM_CLASH = pairSet(["甲庚", "乙辛", "丙壬", "丁癸"]);
const STEM_HE = pairSet(["甲己", "乙庚", "丙辛", "丁壬", "戊癸"]);

const SAN_NIANG = new Set([3, 7, 13, 18, 22, 27]);
const YANG_GONG = new Set([
  "1-13",
  "2-11",
  "3-9",
  "4-7",
  "5-5",
  "6-3",
  "7-1",
  "7-29",
  "8-27",
  "9-25",
  "10-23",
  "11-21",
  "12-19",
]);
const SI_LI_TERMS = new Set(["春分", "夏至", "秋分", "冬至"]);
const SI_JUE_TERMS = new Set(["立春", "立夏", "立秋", "立冬"]);
const HARD_STARS = new Set(["月厌"]);
export const MITIGATING_STARS = new Set(["天德", "月德"]);

const SPRING_LABELS: Record<number, [string, string]> = {
  0: ["无春", "Widow year, no 立春"],
  1: ["单春", "Single spring, one 立春"],
  2: ["双春", "Double spring, two 立春"],
};

const STEM_ELEMENT: Record<string, string> = Object.fromEntries(
  [...STEMS].map((s, i) => [s, "木木火火土土金金水水"[i]]),
);
const GENERATES: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLS: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
export type SpouseBasis = "officer" | "wealth";
const SPOUSE_STARS: Record<SpouseBasis, Set<string>> = {
  officer: new Set(["正官", "七杀"]),
  wealth: new Set(["正财", "偏财"]),
};
const RIVAL_STARS = new Set(["比肩", "劫财"]);
const VIRTUE_STARS = ["天德", "天德合", "月德", "月德合"];

export const VERDICT_ORDER = ["Avoid", "Caution", "Neutral", "Good", "Excellent"] as const;
export type Verdict = (typeof VERDICT_ORDER)[number];
const CORE_PILLARS = ["year", "day"] as const;
const HOUR_BAD_RELATIONS = new Set(["冲", "刑", "自刑", "害"]);

export type Pillars = { year: string; month: string; day: string };

export interface BirthInput {
  label: string;
  date: string;
  time?: string;
  timeRange?: [string, string];
  place: string;
  tz: string;
  lon: number;
  basis: SpouseBasis;
}

export interface Person {
  label: string;
  basis: SpouseBasis;
  pillars: Pillars;
  hourOptions: string[];
}

export interface Assessment {
  verdict: Verdict;
  score: number;
  fatal: number;
  major: number;
  minor: number;
  positive: number;
  notes: string[];
}

export interface PersonAssessment extends Assessment {
  byHour: Record<string, Assessment>;
  hourSensitive: boolean;
}

export interface GroupAssessment {
  verdict: Verdict;
  score: number;
  virtueStars: string[];
  hourSensitive: boolean;
  persons: Record<string, PersonAssessment>;
}

export interface Flag {
  kind: "positive" | "caution";
  zh: string;
  en: string;
  tip: string;
}

export type Tier = "Recommended" | "Acceptable" | "Caution" | "Excluded";

const mod = (a: number, n: number) => ((a % n) + n) % n;
const verdictIndex = (v: Verdict) => VERDICT_ORDER.indexOf(v);

export function tenGod(dayMaster: string, stem: string): string {
  const same = STEMS.indexOf(dayMaster) % 2 === STEMS.indexOf(stem) % 2;
  const a = STEM_ELEMENT[dayMaster];
  const b = STEM_ELEMENT[stem];
  if (a === b) return same ? "比肩" : "劫财";
  if (GENERATES[a] === b) return same ? "食神" : "伤官";
  if (CONTROLS[a] === b) return same ? "偏财" : "正财";
  if (CONTROLS[b] === a) return same ? "七杀" : "正官";
  return same ? "偏印" : "正印";
}

export function isClash(a: string, b: string): boolean {
  return mod(BRANCHES.indexOf(a) - BRANCHES.indexOf(b), 12) === 6;
}

export function clashBranch(b: string): string {
  return BRANCHES[(BRANCHES.indexOf(b) + 6) % 12];
}

export function branchRelations(dayBranch: string, natalBranch: string): string[] {
  const pair = dayBranch + natalBranch;
  const rel: string[] = [];
  if (isClash(dayBranch, natalBranch)) rel.push("冲");
  if (LIU_HE.has(pair)) rel.push("六合");
  if (
    dayBranch !== natalBranch &&
    SAN_HE.some((f) => f.includes(dayBranch) && f.includes(natalBranch))
  )
    rel.push("三合");
  if (HAI.has(pair)) rel.push("害");
  if (XING.has(pair)) rel.push("刑");
  if (dayBranch === natalBranch && SELF_XING.has(dayBranch)) rel.push("自刑");
  if (PO.has(pair) && !rel.includes("六合")) rel.push("破");
  return rel;
}

function verdictFor(fatal: number, major: number, score: number): Verdict {
  if (fatal || major >= 2) return "Avoid";
  if (major === 1) return "Caution";
  if (score >= 4) return "Excellent";
  if (score >= 1) return "Good";
  return "Neutral";
}

export function assessPillars(
  dayGz: string,
  pillars: Record<string, string>,
  mitigatedStem: boolean,
  basis?: SpouseBasis,
): Assessment {
  const [ds, db] = [dayGz[0], dayGz[1]];
  let fatal = 0;
  let major = 0;
  let minor = 0;
  let plus = 0;
  const notes: string[] = [];
  for (const [pos, gz] of Object.entries(pillars)) {
    const core = (CORE_PILLARS as readonly string[]).includes(pos);
    for (const r of branchRelations(db, gz[1])) {
      notes.push(`${r} ${pos} ${gz[1]}`);
      if (r === "冲") {
        if (core) fatal++;
        else major++;
      } else if (r === "刑" || r === "自刑" || r === "害") {
        if (core) major++;
        else minor++;
      } else if (r === "破") minor++;
      else if (r === "六合") plus += core ? 2 : 1;
      else if (r === "三合") plus++;
    }
  }
  const dm = pillars.day[0];
  if (STEM_CLASH.has(ds + dm)) {
    notes.push(`stem 冲 day master ${dm}`);
    if (mitigatedStem) minor++;
    else major++;
  }
  if (STEM_HE.has(ds + dm)) {
    notes.push(`stem 合 day master ${dm}`);
    plus++;
  }
  const god = tenGod(dm, ds);
  if (basis && SPOUSE_STARS[basis].has(god)) {
    notes.push(`stem ${god} spouse star`);
    plus++;
  }
  if (RIVAL_STARS.has(god)) {
    notes.push(`stem ${god} rival star`);
    minor++;
  }
  const score = plus - 3 * major - minor;
  return {
    verdict: verdictFor(fatal, major, score),
    score,
    fatal,
    major,
    minor,
    positive: plus,
    notes,
  };
}

export function worst(...verdicts: Verdict[]): Verdict {
  return verdicts.reduce((a, b) => (verdictIndex(b) < verdictIndex(a) ? b : a));
}

export function assessPerson(
  dayGz: string,
  person: Person,
  mitigatedStem: boolean,
): PersonAssessment {
  const byHour = Object.fromEntries(
    person.hourOptions.map((h) => [
      h,
      assessPillars(dayGz, { ...person.pillars, hour: h }, mitigatedStem, person.basis),
    ]),
  );
  const low = Object.values(byHour).reduce((a, b) =>
    verdictIndex(b.verdict) < verdictIndex(a.verdict) ||
    (b.verdict === a.verdict && b.score < a.score)
      ? b
      : a,
  );
  return {
    ...low,
    byHour,
    hourSensitive: new Set(Object.values(byHour).map((a) => a.verdict)).size > 1,
  };
}

export function assessGroup(
  dayGz: string,
  people: Person[],
  mitigatedStem: boolean,
  dayStars: readonly string[] = [],
): GroupAssessment {
  const persons = Object.fromEntries(
    people.map((p) => [p.label, assessPerson(dayGz, p, mitigatedStem)]),
  );
  const all = Object.values(persons);
  const virtueStars = VIRTUE_STARS.filter((s) => dayStars.includes(s));
  return {
    verdict: worst(...all.map((a) => a.verdict)),
    score: all.reduce((n, a) => n + a.score, 0) + virtueStars.length,
    virtueStars,
    hourSensitive: all.some((a) => a.hourSensitive),
    persons,
  };
}

export function hourSafe(hourBranch: string, people: Person[]): boolean {
  const core = new Set(people.flatMap((p) => CORE_PILLARS.map((pos) => p.pillars[pos][1])));
  return ![...core].some((b) =>
    branchRelations(hourBranch, b).some((r) => HOUR_BAD_RELATIONS.has(r)),
  );
}

function dayOfYear(y: number, m: number, d: number): number {
  return (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000 + 1;
}

export function equationOfTime(y: number, m: number, d: number): number {
  const b = (2 * Math.PI * (dayOfYear(y, m, d) - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat {
  if (!formatters.has(tz))
    formatters.set(
      tz,
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    );
  return formatters.get(tz)!;
}

function zoneOffsetAt(tz: string, instant: number): number {
  const parts = Object.fromEntries(
    formatter(tz)
      .formatToParts(new Date(instant))
      .map((p) => [p.type, Number(p.value)]),
  );
  return (
    (Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) -
      Math.floor(instant / 60000) * 60000) /
    60000
  );
}

const offsets = new Map<string, number>();

export function utcOffsetMinutes(tz: string, y: number, m: number, d: number): number {
  const key = `${tz}|${y}-${m}-${d}`;
  if (!offsets.has(key)) {
    const noon = Date.UTC(y, m - 1, d, 12);
    offsets.set(key, zoneOffsetAt(tz, noon - zoneOffsetAt(tz, noon) * 60000));
  }
  return offsets.get(key)!;
}

export function clockOffsetMinutes(
  y: number,
  m: number,
  d: number,
  tz: string,
  lon: number,
): number {
  return -lon * 4 + utcOffsetMinutes(tz, y, m, d) - equationOfTime(y, m, d);
}

export function localWindow(date: string, solarStartHour: number, tz: string, lon: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const start = mod(solarStartHour * 60 + clockOffsetMinutes(y, m, d, tz, lon), 1440);
  const end = mod(start + 120, 1440);
  const fmt = (x: number) =>
    `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
  return `${fmt(start)}-${fmt(end)}`;
}

export function trueSolarTime(
  date: string,
  time: string,
  tz: string,
  lon: number,
): [number, number, number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, h, mi) - clockOffsetMinutes(y, m, d, tz, lon) * 60000);
  return [
    t.getUTCFullYear(),
    t.getUTCMonth() + 1,
    t.getUTCDate(),
    t.getUTCHours(),
    t.getUTCMinutes(),
  ];
}

function eightChar([y, m, d, h, mi]: [number, number, number, number, number]) {
  const ec = Solar.fromYmdHms(y, m, d, h, mi, 0).getLunar().getEightChar();
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() };
}

export function derivePerson(birth: BirthInput): Person {
  const [start, end] = birth.timeRange ?? [birth.time ?? "12:00", birth.time ?? "12:00"];
  const toMin = (t: string) =>
    t
      .split(":")
      .map(Number)
      .reduce((h, m) => h * 60 + m);
  const charts = [];
  for (let t = toMin(start); t <= toMin(end); t++) {
    const hhmm = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    charts.push(eightChar(trueSolarTime(birth.date, hhmm, birth.tz, birth.lon)));
  }
  const base = { year: charts[0].year, month: charts[0].month, day: charts[0].day };
  if (charts.some((c) => c.year !== base.year || c.month !== base.month || c.day !== base.day))
    throw new Error(`Birth window ${start} to ${end} spans a day or month boundary`);
  return {
    label: birth.label,
    basis: birth.basis,
    pillars: base,
    hourOptions: [...new Set(charts.map((c) => c.hour))],
  };
}

export function weddingTaboos(lunar: LunarDay, next: LunarDay): string[] {
  const dayGz = lunar.getDayInGanZhi();
  const yearGz = lunar.getYearInGanZhiByLiChun();
  const checks: [boolean, string][] = [
    [lunar.getZhiXing() === "破", "月破 Month Breaker"],
    [isClash(dayGz[1], yearGz[1]), "岁破 Year Breaker"],
    [SAN_NIANG.has(lunar.getDay()), "三娘煞 Three Maidens"],
    [YANG_GONG.has(`${Math.abs(lunar.getMonth())}-${lunar.getDay()}`), "杨公忌 Yang Gong Taboo"],
    [SI_LI_TERMS.has(next.getJieQi()), "四离 Four Separations"],
    [SI_JUE_TERMS.has(next.getJieQi()), "四绝 Four Extinctions"],
    [lunar.getMonth() === 7, "鬼月 Ghost Month"],
  ];
  return [
    ...checks.filter(([hit]) => hit).map(([, label]) => label),
    ...lunar
      .getDayXiongSha()
      .filter((s) => HARD_STARS.has(s))
      .map((s) => `${s} star`),
  ];
}

export function weddingTier(
  sources: Record<string, boolean>,
  taboos: string[],
  verdict: Verdict,
): Tier | null {
  if (!Object.values(sources).some(Boolean)) return null;
  if (taboos.length || verdict === "Avoid") return "Excluded";
  if (verdict === "Caution") return "Caution";
  if (sources.lunar_python && (verdict === "Good" || verdict === "Excellent")) return "Recommended";
  return "Acceptable";
}

export interface LunarYearInfo {
  lunarYear: number;
  ganzhi: string;
  start: string;
  end: string;
  liChun: string[];
  spring: string;
  springEn: string;
  widow: boolean;
  leapMonth: number | null;
}

const isoOf = (s: { toYmd(): string }) => s.toYmd();

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function lunarYearInfo(year: number): LunarYearInfo {
  const start = isoOf(Lunar.fromYmd(year, 1, 1).getSolar());
  const end = addDays(isoOf(Lunar.fromYmd(year + 1, 1, 1).getSolar()), -1);
  const liChun: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const [y, m, day] = d.split("-").map(Number);
    if (Solar.fromYmd(y, m, day).getLunar().getJieQi() === "立春") liChun.push(d);
  }
  const [spring, springEn] = SPRING_LABELS[liChun.length];
  const leap = LunarYear.fromYear(year).getLeapMonth();
  return {
    lunarYear: year,
    ganzhi: Lunar.fromYmd(year, 1, 1).getYearInGanZhi(),
    start,
    end,
    liChun,
    spring,
    springEn,
    widow: !liChun.length,
    leapMonth: leap || null,
  };
}

const MONTH_TABOO_DAYS = new Set([5, 14, 23]);
const RED_SAND: Record<string, string> = Object.fromEntries([
  ...[..."寅申巳亥"].map((b) => [b, "酉"]),
  ...[..."子午卯酉"].map((b) => [b, "巳"]),
  ...[..."辰戌丑未"].map((b) => [b, "丑"]),
]);
const GU_GUA: Record<string, [string, string]> = Object.fromEntries([
  ...[..."寅卯辰"].map((b) => [b, ["巳", "丑"]]),
  ...[..."巳午未"].map((b) => [b, ["申", "辰"]]),
  ...[..."申酉戌"].map((b) => [b, ["亥", "未"]]),
  ...[..."亥子丑"].map((b) => [b, ["寅", "戌"]]),
]);

export function hongLuan(yearBranch: string): string {
  return BRANCHES[mod(3 - BRANCHES.indexOf(yearBranch), 12)];
}

function flag(kind: Flag["kind"], zh: string, en: string, tipKey?: string): Flag {
  return { kind, zh, en, tip: FLAG_TIPS[tipKey ?? zh] ?? "" };
}

export function softFlags(lunar: LunarDay, people: Person[], year: LunarYearInfo): Flag[] {
  const dayBranch = lunar.getDayZhi();
  const monthBranch = lunar.getMonthInGanZhi()[1];
  const yearBranch = lunar.getYearInGanZhiByLiChun()[1];
  const out: Flag[] = [];
  if (year.widow)
    out.push(flag("caution", "无春", "Widow year, no Start of Spring in the lunar year"));
  if (year.liChun.length === 2) out.push(flag("positive", "双春", "Double spring year"));
  if (lunar.getMonth() < 0) out.push(flag("caution", "闰月", "Leap lunar month"));
  if (RED_SAND[monthBranch] === dayBranch)
    out.push(flag("caution", "红沙日", "Red Sand day, folk wedding taboo"));
  if (MONTH_TABOO_DAYS.has(lunar.getDay()))
    out.push(flag("caution", "月忌日", "Monthly taboo day, lunar 5th, 14th or 23rd"));
  if (lunar.getPengZuZhi().includes("嫁娶") || lunar.getPengZuGan().includes("嫁娶"))
    out.push(flag("caution", "彭祖忌嫁娶", "Péng Zǔ taboo names weddings on this day"));
  if (lunar.getJieQi() === "清明") out.push(flag("caution", "清明", "Tomb Sweeping Day"));
  for (const star of lunar.getDayXiongSha())
    if (star in SOFT_CAUTION_STARS)
      out.push(flag("caution", star, `${SOFT_CAUTION_STARS[star]} star`));
  for (const star of lunar.getDayJiShen())
    if (star in SOFT_POSITIVE_STARS)
      out.push(flag("positive", star, `${SOFT_POSITIVE_STARS[star]} star`));
  const personal = new Map<string, { kind: Flag["kind"]; zh: string; en: string; who: string[] }>();
  for (const p of people) {
    const yb = p.pillars.year[1];
    const [gu, gua] = GU_GUA[yb];
    const checks: [boolean, Flag["kind"], string, string][] = [
      [dayBranch === gu, "caution", "孤辰", "Lonely Star day"],
      [dayBranch === gua, "caution", "寡宿", "Widow Star day"],
      [dayBranch === hongLuan(yb), "positive", "红鸾", "Red Phoenix romance day"],
      [dayBranch === clashBranch(hongLuan(yb)), "positive", "天喜", "Heavenly Joy day"],
      [yearBranch === yb, "caution", "本命年", "Zodiac birth year"],
    ];
    for (const [hit, kind, zh, en] of checks) {
      if (!hit) continue;
      const key = `${kind}|${zh}|${en}`;
      if (!personal.has(key)) personal.set(key, { kind, zh, en, who: [] });
      personal.get(key)!.who.push(p.label.toLowerCase());
    }
  }
  for (const { kind, zh, en, who } of personal.values())
    out.push(
      flag(kind, zh, `${en} for the ${who.join(" and ")}`, zh === "本命年" ? zh : `${zh}日`),
    );
  const seen = new Set<string>();
  return out.filter((f) => {
    const key = `${f.zh}|${f.en}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function tabooTip(label: string): string {
  return Object.entries(TABOO_TIPS).find(([key]) => label.startsWith(key))?.[1] ?? "";
}

export function adjustForFlags(group: { verdict: Verdict; score: number }, flags: Flag[]) {
  const net = flags.reduce((n, f) => n + (f.kind === "positive" ? 1 : -1), 0);
  const base = verdictIndex(group.verdict);
  const steps = Math.trunc(net / 2);
  const caution = verdictIndex("Caution");
  let idx = base;
  if (steps < 0 && base > caution) idx = Math.max(base + steps, caution);
  else if (steps > 0 && base >= verdictIndex("Neutral"))
    idx = Math.min(base + steps, VERDICT_ORDER.length - 1);
  return { flagPoints: net, adjustedScore: group.score + net, adjustedVerdict: VERDICT_ORDER[idx] };
}

export function tierReason(
  tier: Tier | null,
  sources: Record<string, boolean>,
  taboos: string[],
  verdict: Verdict,
): string {
  if (tier === null) return "No source lists this day for weddings.";
  if (tier === "Excluded")
    return taboos.length
      ? `Ruled out by ${taboos.join(", ")}.`
      : "Ruled out because a clash with a birth chart rates it Avoid.";
  if (tier === "Caution")
    return `Listed for weddings, but the adjusted rating is ${verdict}. One partner has a serious conflict with the day, or warning flags pull it down.`;
  if (tier === "Recommended")
    return `Our almanac lists the day for 嫁娶 weddings, no wedding taboo rules it out, and the adjusted rating is ${verdict}.`;
  const reason = !sources.lunar_python
    ? "our almanac does not list it for weddings"
    : `the adjusted rating is only ${verdict}`;
  return `Listed by at least one almanac with no wedding taboo, but ${reason}.`;
}

const DONG_GONG_SYMBOLS: Record<number, string> = {
  2: "***",
  1: "**",
  0: "*",
  [-1]: "x",
  [-2]: "xx",
};
const DONG_GONG_WORDS: Record<number, string> = {
  2: "Very good",
  1: "Good",
  0: "Fair",
  [-1]: "Bad",
  [-2]: "Very bad",
};

export interface DongGongRow {
  month_branch: string;
  branch: string;
  officer: string;
  rating: number;
  marriage: string;
  text: string;
  summary_en: string;
  exceptions: { pillar: string; rating: number; marriage: string }[];
}

export interface DongGong {
  rating: number;
  symbol: string;
  label: string;
  marriage: string;
  pillarSpecific: boolean;
  officer: string;
  summaryEn: string;
  text: string;
}

export function dongGongLookup(
  table: readonly DongGongRow[],
  monthBranch: string,
  dayGz: string,
): DongGong {
  const entry = table.find((r) => r.month_branch === monthBranch && r.branch === dayGz[1])!;
  const special = entry.exceptions.find((e) => e.pillar === dayGz);
  const src = special ?? entry;
  return {
    rating: src.rating,
    symbol: DONG_GONG_SYMBOLS[src.rating],
    label: DONG_GONG_WORDS[src.rating],
    marriage: src.marriage,
    pillarSpecific: Boolean(special),
    officer: entry.officer,
    summaryEn: entry.summary_en,
    text: entry.text,
  };
}

export function dongGongFlags(dg: DongGong): Flag[] {
  if (dg.marriage === "good") return [flag("positive", "董公宜婚", "Dǒng Gōng favors weddings")];
  if (dg.marriage === "bad")
    return [flag("caution", "董公忌婚", "Dǒng Gōng advises against weddings")];
  return [];
}
