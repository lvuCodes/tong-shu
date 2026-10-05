// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useMemo, useState, type ReactNode } from "react";
import { byRank, yearInfo, type Day } from "../engine/almanac";
import {
  branchRows,
  natalBranches,
  wheelLines,
  yearRelations,
  type BranchRow,
} from "../engine/reference";
import { STEM_ELEMENTS, type LunarYearInfo, type Person, type Tier } from "../engine/rules";
import { excludedColumns, weddingColumns } from "./columns";
import { TIER_LABELS, TIER_ORDER, TIER_TIPS, monthLabel } from "./format";
import { Gz, Pill, SpringPill, VerdictPill } from "./pills";
import { SortableTable } from "./SortableTable";
import { nextSort, sortRows, type Sort, type Sortable } from "./sorting";

interface Props {
  days: Day[];
  people: Person[];
  place: string;
  hiddenCols: string[];
  onHiddenCols: (cols: string[]) => void;
  openDay: (date: string) => void;
  openMonth: (ym: string) => void;
  peoplePanel: ReactNode;
  years: number[];
  year: string;
  onYear: (year: string) => void;
}

const FIXED_COL = "date";

function Info({
  id,
  title,
  open = false,
  children,
}: {
  id: string;
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="info" data-info={id} open={open}>
      <summary>{title}</summary>
      {children}
    </details>
  );
}

function Wheel({ rows, natal }: { rows: BranchRow[]; natal: Record<string, string[]> }) {
  const C = 320;
  const R = 220;
  const pos = (b: string): [number, number] => {
    const a = ((-90 + 30 * rows.findIndex((r) => r.branch === b)) * Math.PI) / 180;
    return [C + R * Math.cos(a), C + R * Math.sin(a)];
  };
  const lines = wheelLines(rows, natal);
  return (
    <div className="wheelbox">
      <svg
        className="wheel"
        viewBox="0 0 640 640"
        role="img"
        aria-label="Zodiac wheel rating each day animal against the birth charts"
      >
        {lines.map((l) => {
          const [x1, y1] = pos(l.from);
          const [x2, y2] = pos(l.to);
          return (
            <line
              key={`${l.from}${l.to}${l.rel}`}
              className={l.rel === "六合" ? "ln-six" : "ln-trio"}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          );
        })}
        {rows.map((r) => {
          const [x, y] = pos(r.branch);
          return (
            <g key={r.branch}>
              <title>{`${r.branch} ${r.animal}: ${r.verdict}${natal[r.branch] ? `. In charts: ${natal[r.branch].join(", ")}` : ""}`}</title>
              {natal[r.branch] ? <circle className="ring" cx={x} cy={y} r={52} /> : null}
              <circle className={`disc n-${r.verdict.toLowerCase()}`} cx={x} cy={y} r={44} />
              <text className="zh" x={x} y={y + 4}>
                {r.branch}
              </text>
              <text className="an" x={x} y={y + 20}>
                {r.animal}
              </text>
              <text className={`vd v-${r.verdict.toLowerCase()}`} x={x} y={y + 34}>
                {r.verdict}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="wheelkey">
        <div>
          <svg viewBox="0 0 48 12">
            <line className="ln-six" x1="4" y1="6" x2="44" y2="6" />
          </svg>
          六合 Six harmony, a pair bond
        </div>
        <div>
          <svg viewBox="0 0 48 12">
            <line className="ln-trio" x1="4" y1="6" x2="44" y2="6" />
          </svg>
          三合 Three harmony, a group bond
        </div>
        <table>
          <thead>
            <tr>
              <th>Chart animal</th>
              <th>Where it appears</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(natal).map(([b, w]) => (
              <tr key={b}>
                <td>
                  <span className="gz">{b}</span> {rows.find((r) => r.branch === b)?.animal}
                </td>
                <td>{w.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FourPillars({ people }: { people: Person[] }) {
  const rows: [string, (p: Person) => ReactNode][] = [
    ["Year", (p) => <Gz gz={p.pillars.year} />],
    ["Month", (p) => <Gz gz={p.pillars.month} />],
    ["Day", (p) => <Gz gz={p.pillars.day} />],
    ["Hour", (p) => <Gz gz={p.hourOptions} />],
    [
      "Day master",
      (p) => (
        <>
          <span className="gz">{p.pillars.day[0]}</span> {STEM_ELEMENTS[p.pillars.day[0]]}
        </>
      ),
    ],
  ];
  return (
    <table className="pillars">
      <thead>
        <tr>
          <th>Pillar</th>
          {people.map((p) => (
            <th key={p.label}>{p.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, cell]) => (
          <tr key={name}>
            <td>{name}</td>
            {people.map((p) => (
              <td key={p.label}>{cell(p)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LunarYears({ years, people }: { years: LunarYearInfo[]; people: Person[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Lunar year</th>
          <th>干支 Year pillar</th>
          <th>Dates</th>
          <th>立春 Start of Spring</th>
          <th>Spring count</th>
          <th>Leap month</th>
          <th>Year branch vs people</th>
        </tr>
      </thead>
      <tbody>
        {years.map((y) => (
          <tr key={y.lunarYear}>
            <td>{y.lunarYear}</td>
            <td>
              <span className="gz">{y.ganzhi}</span>
            </td>
            <td className="mono">
              {y.start} to {y.end}
            </td>
            <td className="mono">{y.liChun.join(", ") || "none"}</td>
            <td>
              <SpringPill y={y} />
            </td>
            <td>{y.leapMonth ?? "-"}</td>
            <td>
              {Object.entries(yearRelations(y.ganzhi, people)).map(([who, n]) => (
                <div key={who}>
                  {who}: {n.join(", ") || "none"}
                </div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface MonthRow {
  ym: string;
  count: number;
  tiers: Record<Tier, number>;
}

const MONTH_COLS: (Sortable<MonthRow> & { label: string; tip?: string })[] = [
  { key: "month", label: "Month", sort: (r) => r.ym },
  {
    key: "count",
    label: "Count",
    tip: "Days that any almanac lists for the event.",
    sort: (r) => r.count,
  },
  ...TIER_ORDER.map((t) => ({
    key: t,
    label: TIER_LABELS[t],
    tip: TIER_TIPS[t],
    sort: (r: MonthRow) => r.tiers[t],
  })),
];

function MonthTable({ rows, openMonth }: { rows: MonthRow[]; openMonth: (ym: string) => void }) {
  const [sort, setSort] = useState<Sort>(null);
  return (
    <table>
      <thead>
        <tr>
          {MONTH_COLS.map((c) => (
            <th
              key={c.key}
              className={c.tip ? "coltip" : undefined}
              data-tip={c.tip}
              aria-sort={sort?.key === c.key ? sort.dir : "none"}
            >
              <button
                type="button"
                className="sorter"
                onClick={() => setSort(nextSort(sort, c.key))}
              >
                {c.label}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortRows(rows, MONTH_COLS, sort).map((r) => (
          <tr key={r.ym}>
            <td>
              <button
                type="button"
                className="datelink"
                aria-label={monthLabel(r.ym)}
                onClick={() => openMonth(r.ym)}
              >
                {monthLabel(r.ym).split(" ")[0]}
              </button>
            </td>
            <td className="num">{r.count}</td>
            {TIER_ORDER.map((t) => (
              <td key={t} className="num">
                {r.tiers[t]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DateSelection({
  days,
  people,
  place,
  hiddenCols,
  onHiddenCols,
  openDay,
  openMonth,
  peoplePanel,
  years: yearOptions,
  year,
  onYear,
}: Props) {
  const [hiddenTiers, setHiddenTiers] = useState<string[]>([]);
  const [weekendOnly, setWeekendOnly] = useState(false);
  const pool = weekendOnly ? days.filter((d) => d.weekend) : days;
  const showing = (t: string) => !hiddenTiers.includes(t);
  const toggleTier = (t: string) =>
    setHiddenTiers((h) => (h.includes(t) ? h.filter((k) => k !== t) : [...h, t]));
  const labelsKey = people.map((p) => p.label).join("|");
  const labels = useMemo(() => labelsKey.split("|"), [labelsKey]);
  const allCols = useMemo(() => weddingColumns(labels, place, openDay), [labels, place, openDay]);
  const shown = (key: string) => key === FIXED_COL || !hiddenCols.includes(key);
  const visible = allCols.filter((c) => shown(c.key));
  const excluded = excludedColumns(allCols, labels).filter((c) => shown(c.key));
  const rows = useMemo(() => branchRows(people), [people]);
  const natal = useMemo(() => natalBranches(people), [people]);

  const tiers = Object.fromEntries(
    TIER_ORDER.map((t) => [t, pool.filter((d) => d.tier === t)]),
  ) as Record<Tier, Day[]>;
  const ordered = (t: Tier) =>
    t === "Recommended" || t === "Acceptable" ? [...tiers[t]].sort(byRank) : tiers[t];
  const years = [...new Set(days.map((d) => d.lunarYear))].map(yearInfo);
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
  const toggleCol = (key: string) => {
    onHiddenCols(
      hiddenCols.includes(key) ? hiddenCols.filter((k) => k !== key) : [...hiddenCols, key],
    );
  };

  const monthYears = [...new Set(months.map((ym) => ym.slice(0, 4)))];
  const monthRows = months.map((ym) => {
    const ds = pool.filter((d) => d.date.startsWith(ym));
    return {
      ym,
      count: ds.filter((d) => d.listed.length).length,
      tiers: Object.fromEntries(
        TIER_ORDER.map((t) => [t, ds.filter((d) => d.tier === t).length]),
      ) as Record<Tier, number>,
    };
  });
  const monthly = (
    <div className="yeartables">
      {monthYears.map((y) => (
        <section key={y} aria-label={`Monthly counts ${y}`}>
          {monthYears.length > 1 ? <h3>{y}</h3> : null}
          <MonthTable rows={monthRows.filter((r) => r.ym.startsWith(y))} openMonth={openMonth} />
        </section>
      ))}
    </div>
  );

  return (
    <>
      <div className="toprow">
        {peoplePanel}
        <div className="side">
          <Info id="years" title="Lunar years" open>
            <LunarYears years={years} people={people} />
          </Info>
          <Info id="pillars" title="八字 Four Pillars">
            <FourPillars people={people} />
          </Info>
          <Info id="wheel" title="Day animals">
            <Wheel rows={rows} natal={natal} />
          </Info>
          <Info id="branches" title="Day branch effects">
            <table>
              <thead>
                <tr>
                  <th>Day branch</th>
                  {rows[0]?.cells.map((c) => (
                    <th key={c.column}>{c.column}</th>
                  ))}
                  <th>Overall</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.branch}>
                    <td>
                      <span className="gz">{r.branch}</span> {r.animal}
                    </td>
                    {r.cells.map((c) => (
                      <td key={c.column}>
                        <VerdictPill a={c.assessment} /> {c.assessment.notes.join(", ") || "none"}
                      </td>
                    ))}
                    <td>
                      <Pill
                        cls={`v-${r.verdict.toLowerCase()}`}
                        tip="The lower of the two personal ratings for this day animal."
                      >
                        {r.verdict}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Info>
          <Info id="months" title="Monthly counts" open>
            {monthly}
          </Info>
        </div>
      </div>
      <div className="filterbar">
        <div className="counts" role="group" aria-label="Show tiers">
          <span>Show</span>
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              className={`badge tip t-${t.toLowerCase()}`}
              aria-pressed={showing(t)}
              data-tip={`${TIER_TIPS[t]}\n\nClick to show or hide the list.`}
              onClick={() => toggleTier(t)}
            >
              {TIER_LABELS[t]} {tiers[t].length}
            </button>
          ))}
        </div>
        <div className="years" role="group" aria-label="Year">
          <span>Year</span>
          <button
            type="button"
            className="weekendbtn"
            aria-pressed={weekendOnly}
            onClick={() => setWeekendOnly((w) => !w)}
          >
            Weekends only
          </button>
          {["all", ...yearOptions.map(String)].map((y) => (
            <button key={y} type="button" aria-pressed={year === y} onClick={() => onYear(y)}>
              {y === "all" ? "All" : y}
            </button>
          ))}
        </div>
        <div className="colpicker" role="group" aria-label="Columns">
          <span>Columns</span>
          {allCols
            .filter((c) => c.key !== FIXED_COL)
            .map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={!hiddenCols.includes(c.key)}
                onClick={() => toggleCol(c.key)}
              >
                {c.label}
              </button>
            ))}
          <button
            type="button"
            className="showall"
            disabled={!hiddenCols.length}
            onClick={() => onHiddenCols([])}
          >
            Show all
          </button>
        </div>
      </div>
      {TIER_ORDER.filter(showing).map((t) => (
        <details key={t} className="tiersec" open>
          <summary>
            <h2 id={`sec-${t}`}>{TIER_LABELS[t]}</h2>
          </summary>
          <SortableTable
            label={TIER_LABELS[t]}
            cols={t === "Excluded" ? excluded : visible}
            days={ordered(t)}
          />
        </details>
      ))}
    </>
  );
}
