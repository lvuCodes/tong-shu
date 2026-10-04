import { describe, expect, it } from "vitest";
import { countryOf, defaultSettings, loadSettings, saveSettings, STORAGE_KEY } from "./settings";

const TODAY = new Date(2026, 9, 4);

describe("defaultSettings", () => {
  it("falls back to synthetic people when no local defaults exist", () => {
    const s = defaultSettings(null, TODAY);
    expect(s.people.map((p) => p.label)).toEqual(["Partner A", "Partner B"]);
    expect([s.start, s.end]).toEqual(["2026-10", "2028-12"]);
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
