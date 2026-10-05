// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useId, useRef, useState, type KeyboardEvent } from "react";
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

function PinIcon() {
  return (
    <svg className="pin" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

function region(h: PlaceHit): string {
  return [...new Set([h.admin1, h.country])].filter((p) => p && p !== h.name).join(", ");
}

export function PlaceInput({ label, value, tz, onResolve }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const [draft, setDraft] = useState<string | null>(null);
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const apply = (hit: PlaceHit) => {
    window.clearTimeout(timer.current);
    seq.current++;
    setDraft(null);
    setHits([]);
    setOpen(false);
    onResolve(resolvePlace(hit));
  };

  const onInput = (text: string) => {
    setDraft(text);
    setFailed(false);
    window.clearTimeout(timer.current);
    const n = ++seq.current;
    timer.current = window.setTimeout(() => {
      searchPlaces(text).then(
        (found) => {
          if (n !== seq.current) return;
          setHits(found);
          setActive(0);
          setOpen(found.length > 0);
          setFailed(!found.length);
        },
        () => n === seq.current && setFailed(true),
      );
    }, 300);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || !hits.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      apply(hits[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const pending = draft !== null && draft !== value;
  const expanded = open && hits.length > 0;
  return (
    <div className="place">
      <label htmlFor={id}>{label}</label>
      <span className="placefield">
        <input
          id={id}
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={expanded}
          aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
          value={draft ?? value}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => hits.length && setOpen(true)}
          onBlur={() => {
            setOpen(false);
            if (pending && hits[0]) apply(hits[0]);
          }}
        />
        {expanded ? (
          <ul id={listId} role="listbox" aria-label={`${label} suggestions`} className="placelist">
            {hits.map((h, i) => (
              <li
                key={h.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                title={placeLabel(h)}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => apply(h)}
              >
                <PinIcon />
                <span className="placetext">
                  <strong>{h.name}</strong> <span className="placeregion">{region(h)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <small className="en">
          {pending ? (failed ? "No matching place found" : "Looking up place…") : tz}
        </small>
      </span>
    </div>
  );
}
