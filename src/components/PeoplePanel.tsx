// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { EventPlace } from "../engine/almanac";
import { ganzhiEn } from "../engine/dictionary";
import { STEM_ELEMENTS, type BirthInput, type Person, type SpouseBasis } from "../engine/rules";
import { countryOf } from "../settings";

interface Props {
  people: BirthInput[];
  derived: (Person | Error)[];
  event: EventPlace;
  onPeople: (people: BirthInput[]) => void;
  onEvent: (event: EventPlace) => void;
}

const BASIS_LABELS: Record<SpouseBasis, string> = {
  officer: "Officer stars 正官/七杀",
  wealth: "Wealth stars 正财/偏财",
};

function Gz({ gz }: { gz: string }) {
  return (
    <>
      <span className="gz">{gz}</span>
      <small className="en">{ganzhiEn(gz)}</small>
    </>
  );
}

export function PeoplePanel({ people, derived, event, onPeople, onEvent }: Props) {
  const update = (i: number, patch: Partial<BirthInput>) =>
    onPeople(people.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const ranged = (p: BirthInput) => Boolean(p.timeRange);
  return (
    <section className="people" aria-label="People">
      <h2>People</h2>
      <div className="peoplegrid">
        {people.map((p, i) => {
          const d = derived[i];
          return (
            <fieldset key={i} className="person">
              <legend>{p.label || `Person ${i + 1}`}</legend>
              <label>
                Label
                <input value={p.label} onChange={(e) => update(i, { label: e.target.value })} />
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
                    From
                    <input
                      type="time"
                      value={p.timeRange![0]}
                      onChange={(e) => update(i, { timeRange: [e.target.value, p.timeRange![1]] })}
                    />
                  </label>
                  <label>
                    To
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
              <label>
                Birth place
                <input value={p.place} onChange={(e) => update(i, { place: e.target.value })} />
              </label>
              <label>
                Time zone
                <input
                  className="tz"
                  value={p.tz}
                  onChange={(e) => update(i, { tz: e.target.value })}
                />
              </label>
              <label>
                Longitude
                <input
                  className="num"
                  type="number"
                  step="0.0001"
                  value={p.lon}
                  onChange={(e) => update(i, { lon: Number(e.target.value) })}
                />
              </label>
              <label>
                Spouse-star basis
                <select
                  value={p.basis}
                  onChange={(e) => update(i, { basis: e.target.value as SpouseBasis })}
                >
                  {Object.entries(BASIS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              {d instanceof Error ? (
                <p className="error">{d.message}</p>
              ) : (
                <dl className="chart">
                  <div>
                    <dt>Year</dt>
                    <dd>
                      <Gz gz={d.pillars.year} />
                    </dd>
                  </div>
                  <div>
                    <dt>Month</dt>
                    <dd>
                      <Gz gz={d.pillars.month} />
                    </dd>
                  </div>
                  <div>
                    <dt>Day</dt>
                    <dd>
                      <Gz gz={d.pillars.day} />
                    </dd>
                  </div>
                  <div>
                    <dt>Hour</dt>
                    <dd>
                      <span className="gz">{d.hourOptions.join(" or ")}</span>
                      <small className="en">{d.hourOptions.map(ganzhiEn).join(" or ")}</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Day master</dt>
                    <dd>
                      {d.pillars.day[0]} {STEM_ELEMENTS[d.pillars.day[0]]}
                    </dd>
                  </div>
                </dl>
              )}
              {people.length > 1 ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onPeople(people.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              ) : null}
            </fieldset>
          );
        })}
        <fieldset className="person">
          <legend>Event location</legend>
          <label>
            Place
            <input
              value={event.place}
              onChange={(e) => onEvent({ ...event, place: e.target.value })}
            />
          </label>
          <label>
            Time zone
            <input
              className="tz"
              value={event.tz}
              onChange={(e) =>
                onEvent({ ...event, tz: e.target.value, country: countryOf(e.target.value) })
              }
            />
          </label>
          <label>
            Longitude
            <input
              className="num"
              type="number"
              step="0.0001"
              value={event.lon}
              onChange={(e) => onEvent({ ...event, lon: Number(e.target.value) })}
            />
          </label>
          {people.length < 2 ? (
            <button
              type="button"
              className="ghost"
              onClick={() =>
                onPeople([
                  ...people,
                  {
                    label: "Partner B",
                    date: "1990-01-01",
                    time: "12:00",
                    place: "",
                    tz: event.tz,
                    lon: event.lon,
                    basis: "wealth",
                  },
                ])
              }
            >
              Add a second person
            </button>
          ) : null}
        </fieldset>
      </div>
    </section>
  );
}
