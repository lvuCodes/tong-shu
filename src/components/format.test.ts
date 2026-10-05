import { describe, expect, it } from "vitest";
import { calendarYears, hourAfter, monthOf, nextMonth, pastMonths } from "./format";

describe("calendarYears", () => {
  it("counts every calendar year the range touches", () => {
    expect(calendarYears("2026-10", "2028-12")).toBe(3);
    expect(calendarYears("2026-10", "2029-02")).toBe(4);
    expect(calendarYears("2027-01", "2027-12")).toBe(1);
  });
});

describe("pastMonths", () => {
  it("lists the range ends that fall before the current month", () => {
    expect(pastMonths("2026-10", "2028-12", "2026-10")).toEqual([]);
    expect(pastMonths("2026-09", "2028-12", "2026-10")).toEqual(["2026-09"]);
    expect(pastMonths("2025-01", "2026-03", "2026-10")).toEqual(["2025-01", "2026-03"]);
    expect(pastMonths("2025-01", "2025-01", "2026-10")).toEqual(["2025-01"]);
  });

  it("formats the current month", () => {
    expect(monthOf(new Date(2026, 9, 5))).toBe("2026-10");
  });
});

describe("range end defaults", () => {
  it("steps a month forward across the year end", () => {
    expect(nextMonth("2027-05")).toBe("2027-06");
    expect(nextMonth("2027-12")).toBe("2028-01");
  });

  it("steps an hour forward and caps at 23:59", () => {
    expect(hourAfter("09:30")).toBe("10:30");
    expect(hourAfter("22:15")).toBe("23:15");
    expect(hourAfter("23:10")).toBe("23:59");
  });
});
