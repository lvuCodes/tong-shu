// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";

export const COMMIT_DELAY = 400;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onCommit: (value: string) => void;
};

export function DraftInput({ value, onCommit, onBlur, ...rest }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [seen, setSeen] = useState(value);
  const pending = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const commit = useRef(onCommit);

  if (value !== seen) {
    setSeen(value);
    setDraft(null);
  }

  useEffect(() => {
    commit.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    pending.current = null;
    window.clearTimeout(timer.current);
  }, [value]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flush = () => {
    window.clearTimeout(timer.current);
    const next = pending.current;
    if (next === null) return;
    pending.current = null;
    setDraft(null);
    commit.current(next);
  };

  return (
    <input
      {...rest}
      value={draft ?? value}
      onChange={(e) => {
        pending.current = e.target.value;
        setDraft(e.target.value);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(flush, COMMIT_DELAY);
      }}
      onBlur={(e) => {
        flush();
        onBlur?.(e);
      }}
    />
  );
}
