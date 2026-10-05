import { describe, expect, it } from "vitest";
import { Solar } from "lunar-javascript";
import {
  adjustForFlags,
  assessGroup,
  branchRelations,
  derivePerson,
  localWindow,
  lunarYearInfo,
  tenGod,
  weddingTier,
  type BirthInput,
  type Flag,
} from "./rules";

const A: BirthInput = {
  label: "Partner A",
  date: "1990-03-15",
  time: "09:30",
  place: "New York",
  tz: "America/New_York",
  lon: -74.006,
  basis: "officer",
};
const B: BirthInput = {
  label: "Partner B",
  date: "1991-08-02",
  timeRange: ["13:00", "15:30"],
  place: "New York",
  tz: "America/New_York",
  lon: -74.006,
  basis: "wealth",
};
const flags = (kind: Flag["kind"], n: number): Flag[] =>
  Array.from({ length: n }, () => ({ kind, zh: "x", en: "x", tip: "" }));

function group(date: string, people = [derivePerson(A), derivePerson(B)]) {
  const [y, m, d] = date.split("-").map(Number);
  const l = Solar.fromYmd(y, m, d).getLunar();
  return assessGroup(l.getDayInGanZhi(), people, false, l.getDayJiShen());
}

describe("derivePerson", () => {
  it("derives pillars through true solar time", () => {
    expect(derivePerson(A)).toEqual({
      label: "Partner A",
      basis: "officer",
      pillars: { year: "庚午", month: "己卯", day: "己卯" },
      hourOptions: ["己巳"],
    });
  });

  it("lists every hour pillar a birth-time range covers", () => {
    expect(derivePerson(B).hourOptions).toEqual(["庚午", "辛未"]);
  });

  it("rejects a range that crosses midnight into another day pillar", () => {
    expect(() => derivePerson({ ...A, timeRange: ["00:00", "12:00"], time: undefined })).toThrow(
      /spans a day/,
    );
  });
});

describe("relations", () => {
  it("matches the reference branch relations and ten gods", () => {
    expect(branchRelations("寅", "亥")).toEqual(["六合"]);
    expect(branchRelations("子", "午")).toEqual(["冲"]);
    expect(branchRelations("辰", "辰")).toEqual(["自刑"]);
    expect(tenGod("甲", "庚")).toBe("七杀");
    expect(tenGod("甲", "己")).toBe("正财");
  });
});

describe("assessGroup", () => {
  it("rates a clash day Avoid with the reference scores", () => {
    const g = group("2027-05-01");
    expect([g.verdict, g.score]).toEqual(["Avoid", -10]);
    expect(g.persons["Partner A"].notes).toEqual(["害 month 卯", "害 day 卯"]);
    expect(g.persons["Partner B"].notes).toEqual(["自刑 day 辰", "stem 冲 day master 甲"]);
  });

  it("credits the spouse star from each person's own basis", () => {
    const g = group("2028-02-14");
    expect([g.verdict, g.score]).toEqual(["Neutral", 1]);
    expect(g.persons["Partner B"].notes).toContain("stem 正财 spouse star");
  });

  it("supports both partners on the same basis", () => {
    const wealth = group("2028-02-14", [derivePerson({ ...A, basis: "wealth" }), derivePerson(B)]);
    const officer = group("2028-02-14", [
      derivePerson(A),
      derivePerson({ ...B, basis: "officer" }),
    ]);
    expect(wealth.persons["Partner B"].notes).toContain("stem 正财 spouse star");
    expect(officer.persons["Partner B"].notes.some((n) => n.includes("spouse star"))).toBe(false);
  });
});

describe("localWindow", () => {
  it("converts Houston hours in standard and daylight time", () => {
    expect(localWindow("2027-01-15", 23, "America/Chicago", -95.3698)).toBe("23:30-01:30");
    expect(localWindow("2027-07-15", 23, "America/Chicago", -95.3698)).toBe("00:27-02:27");
  });

  it("converts a location east of UTC", () => {
    expect(localWindow("2027-07-15", 11, "Asia/Tokyo", 141.3545)).toBe("10:40-12:40");
  });
});

describe("lunarYearInfo", () => {
  it("finds the double spring and leap month of 2028", () => {
    expect(lunarYearInfo(2028)).toEqual({
      lunarYear: 2028,
      ganzhi: "戊申",
      start: "2028-01-26",
      end: "2029-02-12",
      liChun: ["2028-02-04", "2029-02-03"],
      spring: "双春",
      springEn: "Double spring, two 立春",
      widow: false,
      leapMonth: 5,
    });
  });
});

describe("flags and tiers", () => {
  it("moves the rating one level per two net flag points within bounds", () => {
    expect(adjustForFlags({ verdict: "Good", score: 2 }, flags("caution", 3))).toEqual({
      flagPoints: -3,
      adjustedScore: -1,
      adjustedVerdict: "Neutral",
    });
    expect(adjustForFlags({ verdict: "Neutral", score: 0 }, flags("positive", 4))).toEqual({
      flagPoints: 4,
      adjustedScore: 4,
      adjustedVerdict: "Excellent",
    });
    expect(
      adjustForFlags({ verdict: "Caution", score: -3 }, flags("caution", 6)).adjustedVerdict,
    ).toBe("Caution");
  });

  it("assigns tiers from sources, taboos and the adjusted rating", () => {
    expect(weddingTier({ lunar_python: false }, [], "Good")).toBeNull();
    expect(weddingTier({ lunar_python: true }, ["月破 Month Breaker"], "Excellent")).toBe(
      "Excluded",
    );
    expect(weddingTier({ lunar_python: true }, [], "Caution")).toBe("Caution");
    expect(weddingTier({ lunar_python: true }, [], "Good")).toBe("Recommended");
    expect(weddingTier({ lunar_python: false, baibai: true }, [], "Good")).toBe("Acceptable");
  });
});
