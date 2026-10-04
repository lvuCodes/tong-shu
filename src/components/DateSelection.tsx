// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useMemo, type ReactNode } from "react";
import { byRank, yearInfo, type Day } from "../engine/almanac";
import {
  branchRows,
  natalBranches,
  wheelLines,
  yearRelations,
  type BranchRow,
} from "../engine/reference";
import type { Person, Tier } from "../engine/rules";
import { excludedColumns, TABOO_COLUMN, weddingColumns } from "./columns";
import { TIER_ORDER, TIER_TIPS, monthLabel } from "./format";
import { Pill, SpringPill, VerdictPill } from "./pills";
import { SortableTable } from "./SortableTable";

interface Props {
  days: Day[];
  people: Person[];
  place: string;
  hiddenCols: string[];
  onHiddenCols: (cols: string[]) => void;
  openDay: (date: string) => void;
  openMonth: (ym: string) => void;
  peoplePanel: ReactNode;
}

function Info({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <details className="info" data-info={id}>
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
          Six harmony 六合, a pair bond
        </div>
        <div>
          <svg viewBox="0 0 48 12">
            <line className="ln-trio" x1="4" y1="6" x2="44" y2="6" />
          </svg>
          Three harmony 三合, a group bond
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

export function DateSelection({
  days,
  people,
  place,
  hiddenCols,
  onHiddenCols,
  openDay,
  openMonth,
  peoplePanel,
}: Props) {
  const labelsKey = people.map((p) => p.label).join("|");
  const labels = useMemo(() => labelsKey.split("|"), [labelsKey]);
  const allCols = useMemo(() => weddingColumns(labels, place, openDay), [labels, place, openDay]);
  const visible = allCols.filter((c) => !hiddenCols.includes(c.key));
  const excluded = excludedColumns(allCols, labels).filter((c) => !hiddenCols.includes(c.key));
  const rows = useMemo(() => branchRows(people), [people]);
  const natal = useMemo(() => natalBranches(people), [people]);

  const tiers = Object.fromEntries(
    TIER_ORDER.map((t) => [t, days.filter((d) => d.tier === t)]),
  ) as Record<Tier, Day[]>;
  const ranked = (t: Tier) => [...tiers[t]].sort(byRank);
  const weekend = [...tiers.Recommended, ...tiers.Acceptable]
    .filter((d) => d.weekend)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const years = [...new Set(days.map((d) => d.lunarYear))].map(yearInfo);
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ block: "start" });
  const toggleCol = (key: string) => {
    onHiddenCols(
      hiddenCols.includes(key) ? hiddenCols.filter((k) => k !== key) : [...hiddenCols, key],
    );
  };

  return (
    <>
      <div className="counts">
        {TIER_ORDER.map((t) => (
          <button
            key={t}
            type="button"
            className={`badge tip t-${t.toLowerCase()}`}
            data-tip={`${TIER_TIPS[t]}\n\nClick to jump to the list.`}
            onClick={() => jump(`sec-${t}`)}
          >
            {t} {tiers[t].length}
          </button>
        ))}
        <button
          type="button"
          className="badge tip t-none"
          data-tip="Saturdays and Sundays in the Recommended and Acceptable tiers.\n\nClick to jump to the list."
          onClick={() => jump("sec-Weekend")}
        >
          Weekend options {weekend.length}
        </button>
      </div>
      {peoplePanel}
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
                    tip="The lowest personal rating for this day animal."
                  >
                    {r.verdict}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Info>
      <Info id="years" title="Lunar years">
        <table>
          <thead>
            <tr>
              <th>Lunar year</th>
              <th>Year pillar 干支</th>
              <th>Dates</th>
              <th>Start of Spring 立春</th>
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
      </Info>
      <Info id="guide" title="Column guide">
        <dl className="guide">
          {[...allCols, TABOO_COLUMN].map((c) => (
            <div key={c.key}>
              <dt>{c.label}</dt>
              <dd>{c.desc}</dd>
            </div>
          ))}
        </dl>
      </Info>
      <div className="colpicker">
        <span>Columns</span>
        {allCols.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={!hiddenCols.includes(c.key)}
            onClick={() => toggleCol(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <h2 id="sec-Recommended">Recommended</h2>
      <SortableTable label="Recommended" cols={visible} days={ranked("Recommended")} />
      <h2 id="sec-Weekend">Weekend options</h2>
      <SortableTable label="Weekend options" cols={visible} days={weekend} />
      <h2 id="sec-Acceptable">Acceptable</h2>
      <SortableTable label="Acceptable" cols={visible} days={ranked("Acceptable")} />
      <h2 id="sec-Caution">Caution</h2>
      <SortableTable label="Caution" cols={visible} days={tiers.Caution} />
      <h2 id="sec-Excluded">Excluded listed dates</h2>
      <SortableTable label="Excluded" cols={excluded} days={tiers.Excluded} />
      <h2>Monthly counts</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Listed by any source</th>
            {TIER_ORDER.map((t) => (
              <th key={t}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((ym) => {
            const ds = days.filter((d) => d.date.startsWith(ym));
            return (
              <tr key={ym}>
                <td>
                  <button type="button" className="datelink" onClick={() => openMonth(ym)}>
                    {monthLabel(ym)}
                  </button>
                </td>
                <td className="num">{ds.filter((d) => d.listed.length).length}</td>
                {TIER_ORDER.map((t) => (
                  <td key={t} className="num">
                    {ds.filter((d) => d.tier === t).length}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
