// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import { SOURCE_LABELS, type Day } from "../engine/almanac";
import { en } from "../engine/dictionary";
import {
  VIRTUE_TIP,
  tabooTip,
  type Assessment,
  type LunarYearInfo,
  type Tier,
} from "../engine/rules";
import { SOURCE_TIPS, TIER_TIPS, signed } from "./format";

const VERDICT_TIPS: Record<string, string> = {
  Excellent: "Score of +4 or more with no serious conflicts.",
  Good: "Score of +1 to +3 with no serious conflicts.",
  Neutral: "Score of 0 or below with no serious conflicts.",
  Caution: "One serious conflict, such as a punishment or harm with a year or day pillar.",
  Avoid: "A clash with a year or day pillar, or two serious conflicts.",
};

const VIRTUE_MEANING: Record<string, string> = {
  天德: "The strongest protective star, placed by the month. Said to dissolve harm on the day.",
  月德: "A protective star placed by the element of the month. Said to dissolve harm on the day.",
  天德合: "The stem that combines with Heavenly Virtue. A gentler form of the same protection.",
  月德合: "The stem that combines with Monthly Virtue. A gentler form of the same protection.",
};

export function Pill({ cls, tip, children }: { cls: string; tip?: string; children: ReactNode }) {
  return tip ? (
    <span className={`badge tip ${cls}`} tabIndex={0} data-tip={tip}>
      {children}
    </span>
  ) : (
    <span className={`badge ${cls}`}>{children}</span>
  );
}

export function Bi({ zh, english }: { zh: ReactNode; english?: string }) {
  return (
    <>
      {zh}
      {english ? <small className="en">{english}</small> : null}
    </>
  );
}

export function TierPill({ day, tier }: { day?: Day; tier: Tier | null }) {
  const tip = day
    ? day.tierReason
    : tier
      ? TIER_TIPS[tier]
      : "No source lists this day for weddings.";
  return (
    <Pill cls={`t-${(tier ?? "none").toLowerCase()}`} tip={tip}>
      {tier ?? "Not listed"}
    </Pill>
  );
}

export function VerdictPill({ a }: { a: Pick<Assessment, "verdict" | "score" | "notes"> }) {
  const reasons = a.notes.length ? a.notes.map((n) => `• ${n}`).join("\n") : "• no relations";
  return (
    <Pill
      cls={`v-${a.verdict.toLowerCase()}`}
      tip={`${VERDICT_TIPS[a.verdict]}\n\nReasons:\n${reasons}`}
    >
      {a.verdict} {signed(a.score)}
    </Pill>
  );
}

function overallTip(day: Day): string {
  const g = day.group;
  const persons = Object.entries(g.persons)
    .map(([w, a]) => `• ${w} ${signed(a.score)}`)
    .join("\n");
  const virtue = g.virtueStars.length
    ? `\n• virtue +${g.virtueStars.length} (${g.virtueStars.join(" ")})`
    : "";
  return `Overall is the lowest personal rating.\n\nTotal ${signed(g.score)}:\n${persons}${virtue}\n\n${VIRTUE_TIP}`;
}

export function OverallPill({ day, compact }: { day: Day; compact?: boolean }) {
  const g = day.group;
  return (
    <>
      <Pill cls={`v-${g.verdict.toLowerCase()}`} tip={overallTip(day)}>
        {g.verdict}
      </Pill>
      {compact ? null : (
        <small className="en">
          total {signed(g.score)}
          {g.virtueStars.length ? `, virtue +${g.virtueStars.length}` : ""}
        </small>
      )}
    </>
  );
}

function adjustedTip(day: Day): string {
  const g = day.group;
  const flags = day.flags
    .map((f) => `\n    ${f.zh} ${f.kind === "positive" ? "+1" : "-1"}`)
    .join("");
  return `Adjusted total ${signed(g.adjustedScore)}:\n• total ${signed(g.score)}\n• flags ${signed(g.flagPoints)}${flags}\n\nEvery 2 net flag points move the overall rating one level.\nFlags never push a day to Avoid or lift a Caution or Avoid day.`;
}

export function AdjustedPill({ day, compact }: { day: Day; compact?: boolean }) {
  const g = day.group;
  return (
    <>
      <Pill cls={`v-${g.adjustedVerdict.toLowerCase()}`} tip={adjustedTip(day)}>
        {g.adjustedVerdict}
        {compact ? ` ${signed(g.adjustedScore)}` : ""}
      </Pill>
      {compact ? null : (
        <small className="en">
          adjusted {signed(g.adjustedScore)}, flags {signed(g.flagPoints)}
        </small>
      )}
    </>
  );
}

export function FlagPills({ day }: { day: Day }) {
  if (!day.group.virtueStars.length && !day.flags.length) return <>-</>;
  return (
    <>
      {day.group.virtueStars.map((v) => (
        <div className="flagitem" key={v}>
          <Pill
            cls="v-virtue"
            tip={`${VIRTUE_MEANING[v]} Adds +1 to the total score but is not counted as a flag point.`}
          >
            {v}
          </Pill>
          <small className="en">{en(v)}, virtue star +1</small>
        </div>
      ))}
      {day.flags.map((f) => (
        <div className="flagitem" key={f.zh + f.en}>
          <Pill cls={f.kind === "positive" ? "v-good" : "v-caution"} tip={f.tip}>
            {f.zh}
          </Pill>
          <small className="en">{f.en}</small>
        </div>
      ))}
    </>
  );
}

export function TabooPills({ day }: { day: Day }) {
  if (!day.taboos.length) return <>-</>;
  return (
    <span className="badgerow">
      {day.taboos.map((t) => (
        <Pill key={t} cls="v-avoid" tip={tabooTip(t)}>
          {t}
        </Pill>
      ))}
    </span>
  );
}

const dgClass = (r: number) => (r > 0 ? "v-good" : r === 0 ? "v-neutral" : "v-caution");

export function DongGongPill({ day }: { day: Day }) {
  const t = day.dongGong;
  const scope = t.pillarSpecific
    ? "a verdict for this exact pillar"
    : "the verdict for this branch in this month";
  return (
    <Pill
      cls={dgClass(t.rating)}
      tip={`From the classical manual 董公选择日要览, ${scope}.\n\n${t.summaryEn}\n\nMarriage: ${t.marriage}\n\nOriginal:\n${t.text}\n\nNot scored, but the marriage verdict counts as a flag.`}
    >
      {t.symbol} {t.label}
    </Pill>
  );
}

export function SourceList({ day }: { day: Day }) {
  return (
    <span className="badgerow">
      {day.listed.length}
      {day.listed.map((k) => (
        <Pill key={k} cls="t-none" tip={SOURCE_TIPS[k]}>
          {SOURCE_LABELS[k]}
        </Pill>
      ))}
    </span>
  );
}

export function NotePills({ day, place }: { day: Day; place: string }) {
  const notes = [
    day.holiday && (
      <Pill
        key="h"
        cls="t-none"
        tip={`Public holiday where the event is held, ${place}. Venues, travel and guest availability may be affected.`}
      >
        {day.holiday}
      </Pill>
    ),
    day.group.hourSensitive && (
      <Pill
        key="b"
        cls="t-none"
        tip="One partner's exact birth hour is unknown and the possible hours rate this day differently. The lower rating is used."
      >
        Depends on birth hour
      </Pill>
    ),
    !day.sources.lunar_python && (
      <Pill
        key="m"
        cls="t-none"
        tip="The main almanac calculation, following 协纪辨方书, does not list 嫁娶 (wedding) as suitable on this day. Only other websites list it, so the day cannot be Recommended."
      >
        Not in main almanac
      </Pill>
    ),
  ].filter(Boolean);
  return notes.length ? <span className="badgerow">{notes}</span> : <>-</>;
}

export function SpringPill({ y }: { y: LunarYearInfo }) {
  const tip = y.widow
    ? "Folk belief calls it a blind year and says a marriage begun in it lacks vitality. Counted as a caution flag."
    : y.liChun.length === 2
      ? "Folk belief treats it as lucky for marriage. Counted as a good flag."
      : "The ordinary case, with no folk significance.";
  return (
    <Pill cls={y.widow ? "v-caution" : "v-good"} tip={tip}>
      {y.spring} {y.springEn}
    </Pill>
  );
}
