import { describe, expect, it } from "vitest";
import { weddingColumns } from "./components/columns";
import {
  countryOf,
  NARROW_SCREEN,
  STATIC_COLS,
  DEFAULT_HIDDEN_COLS,
  defaultSettings,
  loadSettings,
  saveSettings,
  STORAGE_KEY,
} from "./settings";

const TODAY = new Date(2026, 9, 4);

describe("defaultSettings", () => {
  it("falls back to synthetic people when no local defaults exist", () => {
    const s = defaultSettings(null, TODAY);
    expect(s.people.map((p) => p.label)).toEqual(["Partner A", "Partner B"]);
    expect([s.start, s.end]).toEqual(["2026-10", "2027-09"]);
    expect(defaultSettings(null, new Date(2026, 0, 15)).end).toBe("2026-12");
    expect(s.hiddenCols).toEqual(DEFAULT_HIDDEN_COLS);
  });

  it("uses local people and lets the app event override the couple event", () => {
    const s = defaultSettings(
      {
        couple: {
          event: { place: "Houston", tz: "America/Chicago", lon: -95.37 },
          people: {
            x: {
              label: "X",
              date: "1990-01-01",
              time_range: ["21:00", "23:00"],
              place: "P",
              tz: "America/New_York",
              lon: -81,
              sex: "M",
            },
          },
        },
        app: { event: { place: "Sapporo", tz: "Asia/Tokyo", lon: 141.35 } },
      },
      TODAY,
    );
    expect(s.people[0]).toMatchObject({
      label: "X",
      timeRange: ["21:00", "23:00"],
      basis: "wealth",
    });
    expect(s.event).toEqual({ place: "Sapporo", tz: "Asia/Tokyo", lon: 141.35, country: "JP" });
    expect(s.end).toBe("2028-12");
  });

  it("infers the holiday country from the time zone", () => {
    expect(countryOf("America/Chicago")).toBe("US");
    expect(countryOf("Asia/Tokyo")).toBe("JP");
    expect(countryOf("Europe/Paris")).toBe("");
  });
});

describe("persistence", () => {
  it("round-trips settings through localStorage", () => {
    const s = { ...defaultSettings(null, TODAY), year: "2028" };
    saveSettings(s);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).year).toBe("2028");
    expect(loadSettings().year).toBe("2028");
  });
});

describe("narrow screens", () => {
  it("starts with only the date, overall and adjusted columns", () => {
    const s = defaultSettings(null, TODAY, 375);
    const shown = weddingColumns(["Partner A", "Partner B"], "X", () => {})
      .map((c) => c.key)
      .filter((k) => !s.hiddenCols.includes(k));
    expect(shown).toEqual(["date", "overall", "adjusted"]);
    expect(s.hiddenCols).toContain("taboos");
  });

  it("keeps the wide defaults above the breakpoint", () => {
    expect(defaultSettings(null, TODAY, NARROW_SCREEN + 1).hiddenCols).toEqual(DEFAULT_HIDDEN_COLS);
  });

  it("lists every fixed column key", () => {
    const keys = weddingColumns([], "X", () => {}).map((c) => c.key);
    expect([...keys].sort()).toEqual([...STATIC_COLS].sort());
  });
});
