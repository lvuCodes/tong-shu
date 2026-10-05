// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import {
  calendarYears,
  MAX_CALENDAR_YEARS,
  monthLabel,
  monthOf,
  nextMonth,
  pastMonths,
} from "./format";

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
    <div className="monthyear" role="group" aria-label={label}>
      <span>{label}</span>
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
    </div>
  );
}

interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  today?: Date;
}

export function RangePicker({ start, end, onChange, today = new Date() }: Props) {
  const thisYear = today.getFullYear();
  const past = pastMonths(start, end, monthOf(today));
  const first = Math.min(thisYear - 10, Number(start.slice(0, 4)));
  const last = Math.max(thisYear + 20, Number(end.slice(0, 4)));
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const span = calendarYears(start, end);
  return (
    <div className="range" role="group" aria-label="Date range">
      <MonthYear
        label="Start"
        value={start}
        years={years}
        onChange={(v) => onChange(v, nextMonth(v))}
      />
      <MonthYear label="End" value={end} years={years} onChange={(v) => onChange(start, v)} />
      {past.length ? (
        <p className="rangenote" role="status">
          {past.map((ym) => monthLabel(ym)).join(" and ")} {past.length > 1 ? "are" : "is"} in the
          past.
        </p>
      ) : null}
      {span > MAX_CALENDAR_YEARS ? (
        <p className="rangenote" role="status">
          This range spans {span} calendar years. Staying within {MAX_CALENDAR_YEARS} is
          recommended.
        </p>
      ) : null}
    </div>
  );
}
