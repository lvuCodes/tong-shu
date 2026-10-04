import { describe, expect, it } from "vitest";
import { birthYears, buildDay, buildRange, byRank, rankKey } from "./almanac";
import { derivePerson, type BirthInput } from "./rules";

const A: BirthInput = {
  label: "Partner A",
  date: "1990-03-15",
  time: "09:30",
  place: "New York",
  tz: "America/New_York",
  lon: -74.006,
  basis: "officer",
};
const people = [derivePerson(A)];
const NONE = { cco: {}, reliability: {}, weddings: {} };
const US = { place: "Houston", tz: "America/Chicago", lon: -95.3698, country: "US" };
const JP = { place: "Sapporo", tz: "Asia/Tokyo", lon: 141.3545, country: "JP" };

describe("buildDay", () => {
  it("notes US holidays only for a US event", () => {
    expect(buildDay("2027-07-04", people, US, NONE).holiday).toBe("Independence Day");
    expect(buildDay("2027-07-04", people, JP, NONE).holiday).toBeNull();
  });

  it("drops the CCO wedding vote in an unreliable year", () => {
    const cco = {
      "2028-03-01": { pillars: ["", "", ""] as [string, string, string], yi: ["嫁娶"] },
    };
    const reliable = buildDay("2028-03-01", people, US, {
      ...NONE,
      cco,
      reliability: { 2028: { day_shift: 0, month_branch: "actual", reliable: true } },
    });
    const shifted = buildDay("2028-03-01", people, US, {
      ...NONE,
      cco,
      reliability: { 2028: { day_shift: 24, month_branch: "actual", reliable: false } },
    });
    expect(reliable.sources.chinesecalendaronline).toBe(true);
    expect(shifted.sources.chinesecalendaronline).toBe(false);
  });

  it("converts every hour to the event clock", () => {
    const d = buildDay("2027-07-15", people, JP, NONE);
    expect(d.hours).toHaveLength(12);
    expect(d.hours[6].local).toBe("10:40-12:40");
  });
});

describe("buildRange", () => {
  it("covers every date in 2027 and 2028", () => {
    const days = buildRange("2027-01-01", "2028-12-31", people, US, NONE);
    expect(days).toHaveLength(731);
    expect(days.at(-1)!.date).toBe("2028-12-31");
  });

  it("ranks by adjusted score, then main-almanac listing, then date", () => {
    const days = buildRange("2027-05-01", "2027-05-31", people, US, NONE).sort(byRank);
    const keys = days.map(rankKey);
    for (let i = 1; i < keys.length; i++)
      expect(
        keys[i - 1][0] < keys[i][0] ||
          (keys[i - 1][0] === keys[i][0] && keys[i - 1][1] < keys[i][1]),
      ).toBe(true);
  });
});

describe("birthYears", () => {
  it("lists the clashing birth years of a pillar", () => {
    expect(birthYears("甲子", 2027)).toEqual([1924, 1984]);
  });
});
