// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import "./App.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackLink, FooterCredits, ThemeSwitcher } from "@lvucodes/ui";
import { loadSnapshots } from "./data/snapshots";
import { buildRange, type Snapshots } from "./engine/almanac";
import { derivePerson, type Person } from "./engine/rules";
import { hasHolidayTable } from "./engine/holidays";
import { defaultSettings, loadSettings, saveSettings, type Settings } from "./settings";
import { Calendar } from "./components/Calendar";
import { DateSelection } from "./components/DateSelection";
import { PeoplePanel } from "./components/PeoplePanel";
import { RangePicker } from "./components/RangePicker";
import { About } from "./components/About";
import { formatRoute, parseRoute, TABS, type Route } from "./route";
import { useSiteTheme } from "./useSiteTheme";
import { useManifest } from "./data/useManifest";

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
  const [theme, setTheme] = useSiteTheme();
  const manifest = useManifest();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash, settings.start));
  const { tab, month, selected } = route;
  const [snap, setSnap] = useState<Snapshots | null>(null);

  const navigate = useCallback((next: Route) => {
    history.pushState(null, "", formatRoute(next));
    setRoute(next);
  }, []);
  useEffect(() => {
    const onPop = () => setRoute(parseRoute(location.hash, loadSettings().start));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
  const shownMonth = days.some((d) => d.date.startsWith(month))
    ? month
    : (days[0]?.date.slice(0, 7) ?? month);

  const selectDay = (date: string) =>
    navigate({ tab: "calendar", month: date.slice(0, 7), selected: date });
  const openDay = useCallback(
    (date: string) => {
      navigate({ tab: "calendar", month: date.slice(0, 7), selected: date });
      window.scrollTo(0, 0);
    },
    [navigate],
  );
  const openMonth = (ym: string) => navigate({ tab: "calendar", month: ym, selected: "" });

  const peoplePanel = (
    <PeoplePanel
      people={settings.people}
      derived={derived}
      event={settings.event}
      onPeople={(p) => patch({ people: p })}
      onEvent={(e) => patch({ event: e })}
      onClearEvent={() => {
        const { event, start, end } = defaultSettings(null);
        patch({ event, start, end, year: "all" });
      }}
      onClearPerson={(i) => {
        const fresh = defaultSettings(null).people[i];
        patch({ people: settings.people.map((p, j) => (j === i ? fresh : p)) });
      }}
      onClear={() => {
        if (window.confirm("Clear all entered data and reset to the sample couple?"))
          setSettings(defaultSettings(null));
      }}
      range={<RangePicker start={settings.start} end={settings.end} onChange={setRange} />}
    />
  );

  return (
    <main className="page">
      <BackLink />
      <header className="masthead">
        <h1>通书 Tōng Shū</h1>
        <span className="sub">The Chinese almanac for choosing auspicious days</span>
      </header>
      <ThemeSwitcher theme={theme} onChange={setTheme} />
      <nav className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => navigate({ ...route, tab: id })}
          >
            {label}
          </button>
        ))}
      </nav>

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
          years={years}
          year={settings.year}
          onYear={(y) => patch({ year: y })}
        />
      ) : null}
      {tab === "calendar" && days.length ? (
        <Calendar
          days={days}
          snap={snap ?? EMPTY_SNAPSHOTS}
          month={shownMonth}
          selected={selected}
          tz={settings.event.tz}
          onMonth={openMonth}
          onSelect={selectDay}
        />
      ) : null}
      {tab === "about" ? (
        <About
          note={
            hasHolidayTable(settings.event.country)
              ? undefined
              : "There is no holiday list yet for the event's country, so holiday notes are blank."
          }
        />
      ) : null}

      <FooterCredits
        licenseHref="https://github.com/lvuCodes/tong-shu/blob/main/LICENSE"
        year={2026}
      />
      {manifest ? <p className="updated">Data last updated {manifest.captured}</p> : null}
    </main>
  );
}

export default App;
