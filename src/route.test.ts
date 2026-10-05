import { describe, expect, it } from "vitest";
import { formatRoute, parseRoute, type Route } from "./route";

describe("parseRoute", () => {
  it("defaults to the Date View when the hash is empty or unknown", () => {
    const fallback: Route = { tab: "selection", month: "2026-10", selected: "" };
    expect(parseRoute("", "2026-10")).toEqual(fallback);
    expect(parseRoute("#nowhere", "2026-10")).toEqual(fallback);
  });

  it("reads the calendar month and selected day", () => {
    expect(parseRoute("#calendar/2027-05/2027-05-14", "2026-10")).toEqual({
      tab: "calendar",
      month: "2027-05",
      selected: "2027-05-14",
    });
  });

  it("drops malformed calendar parts", () => {
    expect(parseRoute("#calendar/May/14", "2026-10")).toEqual({
      tab: "calendar",
      month: "2026-10",
      selected: "",
    });
  });
});

describe("formatRoute", () => {
  it("round-trips every tab", () => {
    const routes: Route[] = [
      { tab: "selection", month: "2026-10", selected: "" },
      { tab: "about", month: "2026-10", selected: "" },
      { tab: "calendar", month: "2027-05", selected: "" },
      { tab: "calendar", month: "2027-05", selected: "2027-05-14" },
    ];
    for (const r of routes) expect(parseRoute(formatRoute(r), "2026-10")).toEqual(r);
  });
});
