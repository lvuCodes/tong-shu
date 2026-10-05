// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useId, useRef, useState } from "react";
import {
  placeLabel,
  resolvePlace,
  searchPlaces,
  type PlaceHit,
  type ResolvedPlace,
} from "../engine/geocode";

interface Props {
  label: string;
  value: string;
  tz: string;
  onResolve: (place: ResolvedPlace) => void;
}

export function PlaceInput({ label, value, tz, onResolve }: Props) {
  const listId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const apply = (hit: PlaceHit) => {
    window.clearTimeout(timer.current);
    seq.current++;
    setDraft(null);
    setHits([]);
    onResolve(resolvePlace(hit));
  };

  const onInput = (text: string) => {
    setDraft(text);
    setFailed(false);
    const picked = hits.find((h) => placeLabel(h) === text);
    if (picked) return apply(picked);
    window.clearTimeout(timer.current);
    const n = ++seq.current;
    timer.current = window.setTimeout(() => {
      searchPlaces(text).then(
        (found) => {
          if (n !== seq.current) return;
          setHits(found);
          setFailed(!found.length);
        },
        () => n === seq.current && setFailed(true),
      );
    }, 300);
  };

  const pending = draft !== null && draft !== value;
  return (
    <label className="place">
      {label}
      <span className="placefield">
        <input
          list={listId}
          value={draft ?? value}
          onChange={(e) => onInput(e.target.value)}
          onBlur={() => (pending && hits[0] ? apply(hits[0]) : undefined)}
        />
        <small className="en">
          {pending ? (failed ? "No matching place found" : "Looking up place…") : tz}
        </small>
      </span>
      <datalist id={listId}>
        {hits.map((h) => (
          <option key={h.id} value={placeLabel(h)} />
        ))}
      </datalist>
    </label>
  );
}
