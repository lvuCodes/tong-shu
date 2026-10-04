// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthYearProps {
  label: string;
  value: string;
  years: number[];
  onChange: (ym: string) => void;
}

function MonthYear({ label, value, years, onChange }: MonthYearProps) {
  const [y, m] = value.split("-");
  return (
    <fieldset className="monthyear">
      <legend>{label}</legend>
      <select
        aria-label={`${label} month`}
        value={m}
        onChange={(e) => onChange(`${y}-${e.target.value}`)}
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={`${label} year`}
        value={y}
        onChange={(e) => onChange(`${e.target.value}-${m}`)}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </fieldset>
  );
}

interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  thisYear?: number;
}

export function RangePicker({ start, end, onChange, thisYear = new Date().getFullYear() }: Props) {
  const first = Math.min(thisYear - 10, Number(start.slice(0, 4)));
  const last = Math.max(thisYear + 20, Number(end.slice(0, 4)));
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const presets = [thisYear, thisYear + 1, thisYear + 2];
  return (
    <div className="range" role="group" aria-label="Date range">
      <MonthYear label="From" value={start} years={years} onChange={(v) => onChange(v, end)} />
      <MonthYear label="To" value={end} years={years} onChange={(v) => onChange(start, v)} />
      <span className="presets">
        {presets.map((y) => (
          <button
            key={y}
            type="button"
            className="ghost"
            aria-label={`Show all of ${y}`}
            onClick={() => onChange(`${y}-01`, `${y}-12`)}
          >
            {y}
          </button>
        ))}
        <button
          type="button"
          className="ghost"
          onClick={() => onChange(`${presets[1]}-01`, `${presets[2]}-12`)}
        >
          {presets[1]} to {presets[2]}
        </button>
      </span>
    </div>
  );
}
