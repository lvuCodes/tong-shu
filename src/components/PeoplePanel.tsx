// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useId, type ReactNode } from "react";
import type { EventPlace } from "../engine/almanac";
import type { BirthInput, Person, SpouseBasis } from "../engine/rules";
import { PlaceInput } from "./PlaceInput";

interface Props {
  people: BirthInput[];
  derived: (Person | Error)[];
  event: EventPlace;
  onPeople: (people: BirthInput[]) => void;
  onEvent: (event: EventPlace) => void;
  range: ReactNode;
  onClear: () => void;
}

const GENDERS: [SpouseBasis, string][] = [
  ["officer", "Female"],
  ["wealth", "Male"],
];

function Box({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="personcol">
      <h3 id={id}>{title}</h3>
      <fieldset className="person" aria-labelledby={id}>
        {children}
      </fieldset>
    </div>
  );
}

export function PeoplePanel({ people, derived, event, onPeople, onEvent, range, onClear }: Props) {
  const update = (i: number, patch: Partial<BirthInput>) =>
    onPeople(people.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const ranged = (p: BirthInput) => Boolean(p.timeRange);
  return (
    <section className="peoplegrid" aria-label="People">
      <div className="spouses">
        <Box title="Event details">
          <label>
            Event type
            <select defaultValue="wedding">
              <option value="wedding">嫁娶 Wedding</option>
            </select>
          </label>
          <PlaceInput
            label="Place"
            value={event.place}
            tz={event.tz}
            onResolve={(r) => onEvent({ ...event, ...r })}
          />
          {range}
        </Box>
        {people.map((p, i) => {
          const d = derived[i];
          return (
            <Box key={i} title={p.label || `Person ${i + 1}`}>
              <label>
                Label
                <input value={p.label} onChange={(e) => update(i, { label: e.target.value })} />
              </label>
              <label>
                Gender
                <select
                  value={p.basis}
                  onChange={(e) => update(i, { basis: e.target.value as SpouseBasis })}
                >
                  {GENDERS.map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Birth date
                <input
                  type="date"
                  value={p.date}
                  onChange={(e) => update(i, { date: e.target.value })}
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={ranged(p)}
                  onChange={(e) =>
                    update(
                      i,
                      e.target.checked
                        ? { timeRange: [p.time ?? "12:00", p.time ?? "12:00"], time: undefined }
                        : { time: p.timeRange?.[0] ?? "12:00", timeRange: undefined },
                    )
                  }
                />
                Birth time is a range
              </label>
              {ranged(p) ? (
                <span className="timerange">
                  <label>
                    Start
                    <input
                      type="time"
                      value={p.timeRange![0]}
                      onChange={(e) => update(i, { timeRange: [e.target.value, p.timeRange![1]] })}
                    />
                  </label>
                  <label>
                    End
                    <input
                      type="time"
                      value={p.timeRange![1]}
                      onChange={(e) => update(i, { timeRange: [p.timeRange![0], e.target.value] })}
                    />
                  </label>
                </span>
              ) : (
                <label>
                  Birth time
                  <input
                    type="time"
                    value={p.time ?? ""}
                    onChange={(e) => update(i, { time: e.target.value })}
                  />
                </label>
              )}
              <PlaceInput
                label="Birth place"
                value={p.place}
                tz={p.tz}
                onResolve={({ place, tz, lon }) => update(i, { place, tz, lon })}
              />
              {d instanceof Error ? <p className="error">{d.message}</p> : null}
            </Box>
          );
        })}
        <button type="button" className="ghost" onClick={onClear}>
          Clear all data
        </button>
      </div>
    </section>
  );
}
