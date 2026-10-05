// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import localDefaults from "virtual:local-defaults";
import { monthOf } from "./components/format";
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

export const STORAGE_KEY = "tong-shu:v2";

export const NARROW_SCREEN = 768;

export const STATIC_COLS = [
  "date",
  "day",
  "hours",
  "lunar",
  "pillar",
  "officer",
  "god",
  "overall",
  "clash",
  "donggong",
  "flags",
  "adjusted",
  "sources",
];

const NARROW_SHOWN = ["date", "overall", "adjusted"];

export function narrowHiddenCols(labels: string[]): string[] {
  return [
    ...STATIC_COLS.filter((k) => !NARROW_SHOWN.includes(k)),
    ...labels.map((l) => `person-${l}`),
    "taboos",
  ];
}

export const DEFAULT_HIDDEN_COLS = ["lunar", "officer", "god", "clash", "hours", "sources"];

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

export function defaultSettings(
  local: LocalDefaults | null = localDefaults as LocalDefaults | null,
  today = new Date(),
  width = typeof window === "undefined" ? Infinity : window.innerWidth,
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
    end: local?.couple
      ? `${today.getFullYear() + 2}-12`
      : monthOf(new Date(today.getFullYear(), today.getMonth() + 11, 1)),
    year: "all",
    hiddenCols:
      width <= NARROW_SCREEN ? narrowHiddenCols(people.map((p) => p.label)) : DEFAULT_HIDDEN_COLS,
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
