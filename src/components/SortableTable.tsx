// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useState } from "react";
import type { Day } from "../engine/almanac";
import type { Column } from "./columns";
import { nextSort, sortRows, type Sort } from "./sorting";

export function SortableTable({
  cols,
  days,
  label,
}: {
  cols: Column[];
  days: Day[];
  label: string;
}) {
  const [sort, setSort] = useState<Sort>(null);
  if (!days.length) return <p className="empty">No dates.</p>;
  return (
    <table className="tiertable" aria-label={label}>
      <thead>
        <tr>
          {cols.map((c) =>
            c.sort ? (
              <th
                key={c.key}
                className={`coltip col-${c.key}`}
                data-tip={c.desc}
                aria-sort={sort?.key === c.key ? sort.dir : "none"}
              >
                <button
                  type="button"
                  className="sorter"
                  onClick={() => setSort(nextSort(sort, c.key, c.first))}
                >
                  {c.label}
                </button>
              </th>
            ) : (
              <th key={c.key} className={`coltip col-${c.key}`} data-tip={c.desc}>
                {c.label}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {sortRows(days, cols, sort).map((d) => (
          <tr key={d.date}>
            {cols.map((c) => (
              <td key={c.key} className={`col-${c.key} ${c.className ?? ""}`}>
                {c.cell(d)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
