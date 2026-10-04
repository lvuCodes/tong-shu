// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import "./App.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackLink, FooterCredits, ThemeSwitcher, useTheme } from "@lvucodes/ui";
import { loadSnapshots } from "./data/snapshots";
import { buildRange, type Snapshots } from "./engine/almanac";
import { derivePerson, type Person } from "./engine/rules";
import { hasHolidayTable } from "./engine/holidays";
import {
  clearSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
  type Settings,
} from "./settings";
import { Calendar } from "./components/Calendar";
import { DateSelection } from "./components/DateSelection";
import { monthLabel } from "./components/format";
import { PeoplePanel } from "./components/PeoplePanel";
import { RangePicker } from "./components/RangePicker";
import { Sources } from "./components/Sources";

type Tab = "selection" | "calendar" | "sources" | "settings";
const TABS: [Tab, string][] = [
  ["selection", "Date selection"],
  ["calendar", "Calendar"],
  ["sources", "Sources"],
  ["settings", "Settings"],
];

const EMPTY_SNAPSHOTS: Snapshots = { cco: {}, reliability: {}, weddings: {} };

function lastDay(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
}

function safeDerive(p: Settings["people"][number]): Person | Error {
  try {
    return derivePerson(p);
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

function App() {
  const [theme, setTheme] = useTheme();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tab, setTab] = useState<Tab>("selection");
  const [snap, setSnap] = useState<Snapshots | null>(null);
  const [month, setMonth] = useState(settings.start);
  const [selected, setSelected] = useState("");

  const patch = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);
  useEffect(() => saveSettings(settings), [settings]);
  const setRange = (from: string, to: string) => {
    const [startMonth, endMonth] = from <= to ? [from, to] : [to, from];
    const inRange = (y: string) => y >= startMonth.slice(0, 4) && y <= endMonth.slice(0, 4);
    patch({
      start: startMonth,
      end: endMonth,
      year: settings.year === "all" || inRange(settings.year) ? settings.year : "all",
    });
  };

  const start = `${settings.start}-01`;
  const end = lastDay(settings.end);
  const years = useMemo(() => {
    const out = [];
    for (let y = Number(settings.start.slice(0, 4)); y <= Number(settings.end.slice(0, 4)); y++)
      out.push(y);
    return out;
  }, [settings.start, settings.end]);

  useEffect(() => {
    let live = true;
    loadSnapshots(years)
      .then((s) => live && setSnap(s))
      .catch(() => live && setSnap(EMPTY_SNAPSHOTS));
    return () => {
      live = false;
    };
  }, [years]);

  const derived = useMemo(() => settings.people.map(safeDerive), [settings.people]);
  const people = useMemo(
    () => derived.filter((d): d is Person => !(d instanceof Error)),
    [derived],
  );
  const days = useMemo(
    () =>
      snap && people.length && start <= end
        ? buildRange(start, end, people, settings.event, snap)
        : [],
    [snap, people, start, end, settings.event],
  );
  const shown =
    settings.year === "all" ? days : days.filter((d) => d.date.startsWith(settings.year));
  const shownMonth = shown.some((d) => d.date.startsWith(month))
    ? month
    : (shown[0]?.date.slice(0, 7) ?? month);

  const openDay = useCallback(
    (date: string) => {
      setMonth(date.slice(0, 7));
      setSelected(date);
      setTab("calendar");
      window.scrollTo(0, 0);
    },
    [setMonth],
  );
  const openMonth = (ym: string) => {
    setMonth(ym);
    setSelected("");
    setTab("calendar");
  };

  const peoplePanel = (
    <PeoplePanel
      people={settings.people}
      derived={derived}
      event={settings.event}
      onPeople={(p) => patch({ people: p })}
      onEvent={(e) => patch({ event: e })}
    />
  );

  return (
    <main className="page">
      <BackLink />
      <header className="masthead">
        <h1>Tong Shu 通书</h1>
        <span className="sub">
          {monthLabel(settings.start)} to {monthLabel(settings.end)} · {settings.event.place}
        </span>
      </header>
      <ThemeSwitcher theme={theme} onChange={setTheme} />
      <nav className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
        <span className="years" role="group" aria-label="Year">
          {["all", ...years.map(String)].map((y) => (
            <button
              key={y}
              type="button"
              aria-pressed={settings.year === y}
              onClick={() => patch({ year: y })}
            >
              {y === "all" ? "All" : y}
            </button>
          ))}
        </span>
      </nav>
      <RangePicker start={settings.start} end={settings.end} onChange={setRange} />

      {!snap ? <p className="status">Loading almanac snapshots…</p> : null}
      {snap && !people.length ? (
        <p className="error">Every birth chart has an error. Fix the People inputs to see dates.</p>
      ) : null}

      {tab === "selection" ? (
        <DateSelection
          days={shown}
          people={people}
          place={settings.event.place}
          hiddenCols={settings.hiddenCols}
          onHiddenCols={(c) => patch({ hiddenCols: c })}
          openDay={openDay}
          openMonth={openMonth}
          peoplePanel={peoplePanel}
        />
      ) : null}
      {tab === "calendar" && shown.length ? (
        <Calendar
          days={shown}
          snap={snap ?? EMPTY_SNAPSHOTS}
          month={shownMonth}
          selected={selected}
          place={settings.event.place}
          onMonth={openMonth}
          onSelect={setSelected}
        />
      ) : null}
      {tab === "sources" ? (
        <Sources
          note={
            hasHolidayTable(settings.event.country)
              ? undefined
              : "No public holiday table exists yet for the event location, so holiday notes are blank."
          }
        />
      ) : null}
      {tab === "settings" ? (
        <section className="settings" aria-label="Settings">
          <button
            type="button"
            className="ghost"
            onClick={() => {
              clearSettings();
              setSettings(defaultSettings());
            }}
          >
            Reset to defaults
          </button>
        </section>
      ) : null}

      <FooterCredits
        licenseHref="https://github.com/lvuCodes/tong-shu/blob/main/LICENSE"
        year={2026}
      />
    </main>
  );
}

export default App;
