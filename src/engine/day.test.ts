import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Solar, LunarUtil } from "lunar-javascript";
import { dayRecord, HOUR_SLOTS, monthDays, type DayRecord } from "./day";
import { normalizeTerms, SYNONYMS } from "./terms";
import parity from "./fixtures/lunar-python-parity.json";

interface ParityDay {
  pillars: { year: string; month: string; day: string };
  officer: string;
  nayin: string;
  mansion: string;
  tian_shen: string;
  belt: string;
  chong: string;
  sha: string;
  yi: string[];
  ji: string[];
  ji_shen: string[];
  xiong_sha: string[];
}

interface CcoDay {
  pillars: [string, string, string];
  yi?: string[];
  ji?: string[];
  good_hours?: string[];
}

interface Manifest {
  cco_reliability: Record<string, { reliable: boolean }>;
}

const DATA = new URL("../../public/data/", import.meta.url);
const read = <T>(name: string): T => JSON.parse(readFileSync(new URL(name, DATA), "utf8")) as T;
const manifest = read<Manifest>("manifest.json");
const ccoYears = readdirSync(DATA)
  .filter((f) => /^cco-\d{4}\.json$/.test(f))
  .map((f) => [f.slice(4, 8), read<Record<string, CcoDay>>(f)] as const);
const records = new Map<string, DayRecord>();
const cached = (date: string) => {
  if (!records.has(date)) records.set(date, dayRecord(date));
  return records.get(date)!;
};

describe("dayRecord", () => {
  it("matches lunar-python on every reference date from 2026-10 to 2027-12", () => {
    const mismatches: string[] = [];
    for (const [date, p] of Object.entries(parity as Record<string, ParityDay>)) {
      const r = dayRecord(date);
      const checks: [string, unknown, unknown][] = [
        ["pillars", r.pillars, p.pillars],
        ["officer", r.officer, p.officer],
        ["nayin", r.nayin, p.nayin],
        ["mansion", r.mansion.name, p.mansion],
        ["tianShen", r.tianShen.name, p.tian_shen],
        ["belt", r.tianShen.belt, p.belt],
        ["chong", r.chong, p.chong],
        ["sha", r.sha, p.sha],
        ["yi", r.yi, normalizeTerms(p.yi)],
        ["ji", r.ji, normalizeTerms(p.ji)],
        ["jiShen", r.jiShen, p.ji_shen],
        ["xiongSha", r.xiongSha, p.xiong_sha],
      ];
      for (const [field, ours, theirs] of checks)
        if (JSON.stringify(ours) !== JSON.stringify(theirs)) mismatches.push(`${date} ${field}`);
    }
    expect(mismatches).toEqual([]);
  });

  it("labels leap months and lists twelve two-hour slots", () => {
    const leap = dayRecord("2028-06-30");
    expect(leap.lunar.leap).toBe(true);
    expect(leap.lunar.label.startsWith("闰")).toBe(true);
    expect(leap.hours.map((h) => h.slot)).toEqual(HOUR_SLOTS);
    expect(HOUR_SLOTS[0]).toBe("23:00-00:59");
    expect(HOUR_SLOTS[11]).toBe("21:00-22:59");
  });

  it("builds one record per calendar day", () => {
    expect(monthDays(2028, 2)).toHaveLength(29);
    expect(monthDays(2027, 2)).toHaveLength(28);
    expect(monthDays(2026, 10)[0].weekday).toBe(4);
  });
});

describe("history snapshot parity, 2020 to 2035", { timeout: 60_000 }, () => {
  it("matches every chinesecalendaronline.com pillar except the 2020-12-06 month pillar", () => {
    const mismatches: string[] = [];
    for (const [, days] of ccoYears)
      for (const [date, c] of Object.entries(days)) {
        const r = cached(date);
        const [y, m, d] = [r.lunar.ganzhi, r.pillars.month, r.pillars.day];
        if (c.pillars[0] !== y || c.pillars[1] !== m || c.pillars[2] !== d) mismatches.push(date);
      }
    expect(mismatches).toEqual(["2020-12-06"]);
  });

  it("matches 宜 on at least 97% of days and hour luck on at least 98.5% of hours in reliable years", () => {
    for (const [year, days] of ccoYears) {
      if (!manifest.cco_reliability[year].reliable) continue;
      let yiSame = 0;
      let hourSame = 0;
      const entries = Object.entries(days);
      for (const [date, c] of entries) {
        const r = cached(date);
        const theirs = normalizeTerms(c.yi ?? []).sort();
        if (JSON.stringify([...r.yi].sort()) === JSON.stringify(theirs)) yiSame++;
        const good = new Set(c.good_hours ?? []);
        hourSame += r.hours.filter((h) => (h.luck === "吉") === good.has(h.slot)).length;
      }
      expect(yiSame / entries.length, `宜 ${year}`).toBeGreaterThanOrEqual(0.97);
      expect(hourSame / (entries.length * 12), `hours ${year}`).toBeGreaterThanOrEqual(0.985);
    }
  });

  it("flags 2021, 2028 and 2032 to 2035 as unreliable", () => {
    const unreliable = Object.entries(manifest.cco_reliability)
      .filter(([, v]) => !v.reliable)
      .map(([y]) => y);
    expect(unreliable).toEqual(["2021", "2028", "2032", "2033", "2034", "2035"]);
  });
});

describe("normalizeTerms", () => {
  it("maps every variant spelling to its standard form", () => {
    for (const [variant, standard] of Object.entries(SYNONYMS))
      expect(normalizeTerms([variant])).toEqual([standard]);
  });

  it("treats a list holding only 无 as empty", () => {
    expect(normalizeTerms(["无"])).toEqual([]);
  });

  it("reproduces the lookup table through LunarUtil", () => {
    const l = Solar.fromYmd(2026, 10, 1).getLunar();
    expect(LunarUtil.getDayYi(l.getMonthInGanZhi(), l.getDayInGanZhi())).toEqual(l.getDayYi());
  });
});
