import { describe, expect, it } from "vitest";
import type { Day } from "../engine/almanac";
import type { Column } from "./columns";
import { nextSort, sortRows } from "./sorting";

const days = [{ date: "2027-01-02" }, { date: "2027-01-01" }, { date: "2027-01-03" }] as Day[];
const cols = [
  { key: "date", label: "Date", desc: "", sort: (d: Day) => d.date, cell: () => null },
] as Column[];

describe("sorting", () => {
  it("cycles ascending, descending, then default order", () => {
    const asc = nextSort(null, "date");
    const desc = nextSort(asc, "date");
    expect(asc).toEqual({ key: "date", dir: "ascending" });
    expect(desc).toEqual({ key: "date", dir: "descending" });
    expect(nextSort(desc, "date")).toBeNull();
  });

  it("starts from the column's first direction", () => {
    const desc = nextSort(null, "score", "descending");
    expect(desc).toEqual({ key: "score", dir: "descending" });
    expect(nextSort(desc, "score", "descending")).toEqual({ key: "score", dir: "ascending" });
    expect(nextSort({ key: "score", dir: "ascending" }, "score", "descending")).toBeNull();
  });

  it("orders rows both ways and restores the default", () => {
    expect(sortRows(days, cols, { key: "date", dir: "ascending" }).map((d) => d.date)).toEqual([
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
    ]);
    expect(sortRows(days, cols, { key: "date", dir: "descending" }).map((d) => d.date)).toEqual([
      "2027-01-03",
      "2027-01-02",
      "2027-01-01",
    ]);
    expect(sortRows(days, cols, null)).toBe(days);
  });
});
