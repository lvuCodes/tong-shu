// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { ANIMALS } from "./dictionary";
import {
  BRANCHES,
  assessGroup,
  branchRelations,
  type Assessment,
  type Person,
  type Verdict,
} from "./rules";

export interface BranchRow {
  branch: string;
  animal: string;
  verdict: Verdict;
  cells: { column: string; assessment: Assessment }[];
}

export function branchRows(people: Person[]): BranchRow[] {
  return [...BRANCHES].map((b) => {
    const probe = assessGroup(`戊${b}`, people, false);
    return {
      branch: b,
      animal: ANIMALS[b],
      verdict: probe.verdict,
      cells: people.flatMap((p) =>
        p.hourOptions.map((h) => {
          const a = probe.persons[p.label].byHour[h];
          return {
            column: `${p.label} (${h[1]} hour)`,
            assessment: { ...a, notes: a.notes.filter((n) => !n.startsWith("stem")) },
          };
        }),
      ),
    };
  });
}

export function natalBranches(people: Person[]): Record<string, string[]> {
  const natal: Record<string, string[]> = {};
  const add = (b: string, where: string) => (natal[b] ??= []).push(where);
  for (const p of people) {
    for (const [pos, gz] of Object.entries(p.pillars)) add(gz[1], `${p.label} ${pos}`);
    for (const h of p.hourOptions)
      add(h[1], `${p.label} hour${p.hourOptions.length > 1 ? " option" : ""}`);
  }
  return natal;
}

export interface WheelLine {
  from: string;
  to: string;
  rel: string;
}

export function wheelLines(rows: BranchRow[], natal: Record<string, string[]>): WheelLine[] {
  const good = rows
    .filter((r) => r.verdict === "Excellent" || r.verdict === "Good")
    .map((r) => r.branch);
  return good.flatMap((g) =>
    Object.keys(natal).flatMap((n) =>
      branchRelations(g, n)
        .filter((r) => r === "六合" || r === "三合")
        .map((rel) => ({ from: g, to: n, rel })),
    ),
  );
}

export function yearRelations(ganzhi: string, people: Person[]): Record<string, string[]> {
  const probe = assessGroup(ganzhi, people, false);
  return Object.fromEntries(
    Object.entries(probe.persons).map(([k, a]) => [
      k,
      a.notes.filter((n) => !n.startsWith("stem")),
    ]),
  );
}
