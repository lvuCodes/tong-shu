// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useId, type ReactNode } from "react";
import type { EventPlace } from "../engine/almanac";
import type { BirthInput, Person, SpouseBasis } from "../engine/rules";
import { DraftInput } from "./DraftInput";
import { hourAfter } from "./format";
import { PlaceInput } from "./PlaceInput";

interface Props {
  people: BirthInput[];
  derived: (Person | Error)[];
  event: EventPlace;
  onPeople: (people: BirthInput[]) => void;
  onEvent: (event: EventPlace) => void;
  range: ReactNode;
  onClear: () => void;
  onClearEvent: () => void;
  onClearPerson: (i: number) => void;
}

const GENDERS: [SpouseBasis, string][] = [
  ["officer", "Female"],
  ["wealth", "Male"],
];

function Box({
  title,
  onClear,
  children,
}: {
  title: string;
  onClear: () => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="personcol">
      <div className="boxhead">
        <h3 id={id}>{title}</h3>
        <button type="button" className="ghost" aria-label={`Clear ${title}`} onClick={onClear}>
          Clear
        </button>
      </div>
      <fieldset className="person" aria-labelledby={id}>
        {children}
      </fieldset>
    </div>
  );
}

export function PeoplePanel({
  people,
  derived,
  event,
  onPeople,
  onEvent,
  range,
  onClear,
  onClearEvent,
  onClearPerson,
}: Props) {
  const update = (i: number, patch: Partial<BirthInput>) =>
    onPeople(people.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const ranged = (p: BirthInput) => Boolean(p.timeRange);
  return (
    <section className="peoplegrid" aria-label="People">
      <div className="spouses">
        <Box title="Event details" onClear={onClearEvent}>
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
            <Box key={i} title={p.label || `Person ${i + 1}`} onClear={() => onClearPerson(i)}>
              <label>
                Label
                <DraftInput value={p.label} onCommit={(v) => update(i, { label: v })} />
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
                <DraftInput type="date" value={p.date} onCommit={(v) => update(i, { date: v })} />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={ranged(p)}
                  onChange={(e) =>
                    update(
                      i,
                      e.target.checked
                        ? {
                            timeRange: [p.time ?? "12:00", hourAfter(p.time ?? "12:00")],
                            time: undefined,
                          }
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
                    <DraftInput
                      type="time"
                      value={p.timeRange![0]}
                      onCommit={(v) => update(i, { timeRange: [v, hourAfter(v)] })}
                    />
                  </label>
                  <label>
                    End
                    <DraftInput
                      type="time"
                      value={p.timeRange![1]}
                      onCommit={(v) => update(i, { timeRange: [p.timeRange![0], v] })}
                    />
                  </label>
                </span>
              ) : (
                <label>
                  Birth time
                  <DraftInput
                    type="time"
                    value={p.time ?? ""}
                    onCommit={(v) => update(i, { time: v })}
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
