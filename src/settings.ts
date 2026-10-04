// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import localDefaults from "virtual:local-defaults";
import type { EventPlace } from "./engine/almanac";
import type { BirthInput } from "./engine/rules";

export interface Settings {
  people: BirthInput[];
  event: EventPlace;
  start: string;
  end: string;
  year: string;
  hiddenCols: string[];
}

export const STORAGE_KEY = "tong-shu:v1";

interface CouplePerson {
  label: string;
  date: string;
  time?: string;
  time_range?: [string, string];
  place: string;
  tz: string;
  lon: number;
  sex?: string;
}

export interface LocalDefaults {
  couple: { event?: Partial<EventPlace>; people: Record<string, CouplePerson> } | null;
  app: { event?: Partial<EventPlace> } | null;
}

const SYNTHETIC_PEOPLE: BirthInput[] = [
  {
    label: "Partner A",
    date: "1990-03-15",
    time: "09:30",
    place: "New York, New York",
    tz: "America/New_York",
    lon: -74.006,
    basis: "officer",
  },
  {
    label: "Partner B",
    date: "1991-08-02",
    time: "14:10",
    place: "New York, New York",
    tz: "America/New_York",
    lon: -74.006,
    basis: "wealth",
  },
];

const SYNTHETIC_EVENT: EventPlace = {
  place: "New York, New York",
  tz: "America/New_York",
  lon: -74.006,
  country: "US",
};

export function countryOf(tz: string): string {
  if (
    tz.startsWith("America/") &&
    !/Mexico|Toronto|Vancouver|Sao_Paulo|Argentina|Bogota|Lima/.test(tz)
  )
    return "US";
  if (tz === "Asia/Tokyo") return "JP";
  return "";
}

function fromCouple(p: CouplePerson): BirthInput {
  return {
    label: p.label,
    date: p.date,
    time: p.time,
    timeRange: p.time_range,
    place: p.place,
    tz: p.tz,
    lon: p.lon,
    basis: p.sex === "M" ? "wealth" : "officer",
  };
}

function monthOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function defaultSettings(
  local: LocalDefaults | null = localDefaults as LocalDefaults | null,
  today = new Date(),
): Settings {
  const people = local?.couple
    ? Object.values(local.couple.people).map(fromCouple)
    : SYNTHETIC_PEOPLE;
  const ev = { ...local?.couple?.event, ...local?.app?.event };
  const event: EventPlace =
    ev.tz && ev.lon !== undefined
      ? {
          place: ev.place ?? ev.tz,
          tz: ev.tz,
          lon: ev.lon,
          country: ev.country ?? countryOf(ev.tz),
        }
      : SYNTHETIC_EVENT;
  return {
    people,
    event,
    start: monthOf(today),
    end: `${today.getFullYear() + 2}-12`,
    year: "all",
    hiddenCols: [],
  };
}

export function loadSettings(): Settings {
  const base = defaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...base, ...JSON.parse(raw) } : base;
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Storage blocked: settings last for this page session only.
  }
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: nothing to clear.
  }
}
