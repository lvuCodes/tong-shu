// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";

const M = ({ children }: { children: ReactNode }) => (
  <math>
    <mrow>{children}</mrow>
  </math>
);

const Sub = ({ b, s }: { b: string; s: string }) => (
  <msub>
    <mi>{b}</mi>
    <mi>{s}</mi>
  </msub>
);

const v = (name: string) => (
  <M>
    <mi>{name}</mi>
  </M>
);

const Sp = <Sub b="S" s="p" />;
const Vp = <Sub b="V" s="p" />;
const Vprime = (
  <msup>
    <mi>V</mi>
    <mo>′</mo>
  </msup>
);

const is = (lhs: ReactNode, rhs: ReactNode) => (
  <M>
    {lhs}
    <mo>=</mo>
    {rhs}
  </M>
);

const word = (w: string) => <mtext>{w}</mtext>;

const clamp = (fn: string, bound: string) => (
  <>
    <mi>{fn}</mi>
    <mo stretchy="false">(</mo>
    <mi>V</mi>
    <mo>+</mo>
    <mi>k</mi>
    <mo>,</mo>
    <mtext>{bound}</mtext>
    <mo stretchy="false">)</mo>
  </>
);

const vPrimeIs = (op: string, rhs: string) => (
  <M>
    {Vprime}
    <mo>{op}</mo>
    <mtext>{rhs}</mtext>
  </M>
);

const ROWS: [string, ReactNode, ReactNode][] = [
  [
    "Personal score",
    is(
      Sp,
      <>
        <mi>P</mi>
        <mo>−</mo>
        <mn>3</mn>
        <mi>M</mi>
        <mo>−</mo>
        <mi>m</mi>
      </>,
    ),
    <ul key="s" className="plain">
      <li>
        {v("P")}: +2 for each 六合 with the year or day pillar, +1 for each 六合 with the month or
        hour pillar, +1 for each 三合, +1 if the day stem combines with the day master, +1 if the
        day stem is the spouse star
      </li>
      <li>
        {v("M")}: each 冲 with the month or hour pillar, each 刑, 自刑 or 害 with the year or day
        pillar, and a stem clash with the day master
      </li>
      <li>
        {v("m")}: each 刑, 自刑 or 害 with the month or hour pillar, each 破, a rival star 比肩 or
        劫财, and a stem clash softened by a protecting star
      </li>
      <li>{v("F")}: each 冲 with the year or day pillar</li>
    </ul>,
  ],
  [
    "Personal rating",
    is(Vp, word("Avoid")),
    <>
      when{" "}
      <M>
        <mi>F</mi>
        <mo>≥</mo>
        <mn>1</mn>
        <mtext>&#160;or&#160;</mtext>
        <mi>M</mi>
        <mo>≥</mo>
        <mn>2</mn>
      </M>
    </>,
  ],
  [
    "Personal rating",
    is(Vp, word("Caution")),
    <>
      when{" "}
      <M>
        <mi>M</mi>
        <mo>=</mo>
        <mn>1</mn>
      </M>
    </>,
  ],
  [
    "Personal rating",
    is(Vp, word("Excellent")),
    <>
      when{" "}
      <M>
        {Sp}
        <mo>≥</mo>
        <mn>4</mn>
      </M>
    </>,
  ],
  [
    "Personal rating",
    is(Vp, word("Good")),
    <>
      when{" "}
      <M>
        <mn>1</mn>
        <mo>≤</mo>
        {Sp}
        <mo>≤</mo>
        <mn>3</mn>
      </M>
    </>,
  ],
  [
    "Personal rating",
    is(Vp, word("Neutral")),
    <>
      when{" "}
      <M>
        {Sp}
        <mo>≤</mo>
        <mn>0</mn>
      </M>
      . Ratings rank Avoid &lt; Caution &lt; Neutral &lt; Good &lt; Excellent. When the birth hour
      is uncertain, each possible hour is scored and the lowest rating is kept.
    </>,
  ],
  [
    "Overall rating",
    is(
      <mi>V</mi>,
      <>
        <munder>
          <mo>min</mo>
          <mi>p</mi>
        </munder>
        {Vp}
      </>,
    ),
    "The lower of the two personal ratings",
  ],
  [
    "Total",
    is(
      <mi>T</mi>,
      <>
        <munder>
          <mo>∑</mo>
          <mi>p</mi>
        </munder>
        {Sp}
        <mo>+</mo>
        <mi>v</mi>
      </>,
    ),
    <>{v("v")}: the number of virtue stars on the day</>,
  ],
  [
    "Net flags",
    is(
      <mi>N</mi>,
      <>
        <Sub b="f" s="+" />
        <mo>−</mo>
        <Sub b="f" s="−" />
      </>,
    ),
    "Green flags minus amber flags",
  ],
  [
    "Rating steps",
    is(
      <mi>k</mi>,
      <>
        <mi>sgn</mi>
        <mo stretchy="false">(</mo>
        <mi>N</mi>
        <mo stretchy="false">)</mo>
        <mo stretchy="false">⌊</mo>
        <mo stretchy="false">|</mo>
        <mi>N</mi>
        <mo stretchy="false">|</mo>
        <mo>/</mo>
        <mn>2</mn>
        <mo stretchy="false">⌋</mo>
      </>,
    ),
    "Every 2 net flags move the rating one step",
  ],
  [
    "Adjusted score",
    is(
      <mi>A</mi>,
      <>
        <mi>T</mi>
        <mo>+</mo>
        <mi>N</mi>
      </>,
    ),
    "The total after flags",
  ],
  [
    "Adjusted rating",
    is(Vprime, clamp("max", "Caution")),
    <>
      when{" "}
      <M>
        <mi>k</mi>
        <mo>&lt;</mo>
        <mn>0</mn>
        <mtext>&#160;and&#160;</mtext>
        <mi>V</mi>
        <mo>&gt;</mo>
        <mtext>Caution</mtext>
      </M>
    </>,
  ],
  [
    "Adjusted rating",
    is(Vprime, clamp("min", "Excellent")),
    <>
      when{" "}
      <M>
        <mi>k</mi>
        <mo>&gt;</mo>
        <mn>0</mn>
        <mtext>&#160;and&#160;</mtext>
        <mi>V</mi>
        <mo>≥</mo>
        <mtext>Neutral</mtext>
      </M>
    </>,
  ],
  ["Adjusted rating", is(Vprime, <mi>V</mi>), "otherwise"],
  [
    "Rating group",
    is(<mi key="g">Group</mi>, word("Poor")),
    <>when a wedding taboo applies, or {vPrimeIs("=", "Avoid")}</>,
  ],
  [
    "Rating group",
    is(<mi key="g">Group</mi>, word("Caution")),
    <>when {vPrimeIs("=", "Caution")}</>,
  ],
  [
    "Rating group",
    is(<mi key="g">Group</mi>, word("Great")),
    <>when our almanac lists the day and {vPrimeIs("≥", "Good")}</>,
  ],
  ["Rating group", is(<mi key="g">Group</mi>, word("Good")), "otherwise"],
  [
    "Ranking",
    is(
      <mi>R</mi>,
      <>
        <mi>A</mi>
        <mo>+</mo>
        <mn>2</mn>
        <mi>L</mi>
        <mo>+</mo>
        <mi>n</mi>
        <mo>+</mo>
        <mi>Y</mi>
      </>,
    ),
    <ul key="r" className="plain">
      <li>{v("L")}: 1 when our almanac lists the day</li>
      <li>{v("n")}: the number of almanacs that list the day</li>
      <li>{v("Y")}: 1 on a 黄道 Yellow Belt day</li>
      <li>Great and Good days are listed from highest {v("R")} to lowest, then by date</li>
    </ul>,
  ],
  [
    "True solar time",
    is(
      <Sub b="t" s="s" />,
      <>
        <Sub b="t" s="c" />
        <mo>+</mo>
        <mn>4</mn>
        <mi>λ</mi>
        <mo>−</mo>
        <mi>z</mi>
        <mo>+</mo>
        <mi>E</mi>
        <mo stretchy="false">(</mo>
        <mi>d</mi>
        <mo stretchy="false">)</mo>
      </>,
    ),
    <ul key="ts" className="plain">
      <li>All times in minutes</li>
      <li>
        <M>
          <Sub b="t" s="s" />
        </M>
        : sun time, and{" "}
        <M>
          <Sub b="t" s="c" />
        </M>
        : clock time
      </li>
      <li>{v("λ")}: longitude in degrees, east positive</li>
      <li>{v("z")}: the time zone&apos;s offset from UTC, including daylight time</li>
    </ul>,
  ],
  [
    "Equation of time",
    is(
      <>
        <mi>E</mi>
        <mo stretchy="false">(</mo>
        <mi>d</mi>
        <mo stretchy="false">)</mo>
      </>,
      <>
        <mn>9.87</mn>
        <mi>sin</mi>
        <mo>&#x2061;</mo>
        <mn>2</mn>
        <mi>B</mi>
        <mo>−</mo>
        <mn>7.53</mn>
        <mi>cos</mi>
        <mo>&#x2061;</mo>
        <mi>B</mi>
        <mo>−</mo>
        <mn>1.5</mn>
        <mi>sin</mi>
        <mo>&#x2061;</mo>
        <mi>B</mi>
      </>,
    ),
    <>
      <M>
        <mi>B</mi>
        <mo>=</mo>
        <mn>2</mn>
        <mi>π</mi>
        <mo stretchy="false">(</mo>
        <mi>d</mi>
        <mo>−</mo>
        <mn>81</mn>
        <mo stretchy="false">)</mo>
        <mo>/</mo>
        <mn>364</mn>
      </M>
      , where {v("d")} is the day of the year. It corrects for the earth&apos;s tilted, oval orbit.
    </>,
  ],
  [
    "Clash",
    <M key="c">
      <mo stretchy="false">(</mo>
      <mi>i</mi>
      <mo>−</mo>
      <mi>j</mi>
      <mo stretchy="false">)</mo>
      <mo lspace="0.3em" rspace="0.3em">
        mod
      </mo>
      <mn>12</mn>
      <mo>=</mo>
      <mn>6</mn>
    </M>,
    <>
      Branches {v("i")} and {v("j")}, numbered 0 to 11 from 子 Rat, clash when they sit across the
      zodiac wheel
    </>,
  ],
];

export function Formulas() {
  return (
    <table className="formulas">
      <thead>
        <tr>
          <th>Item</th>
          <th>Formula</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([item, formula, meaning], i) => (
          <tr key={i}>
            {i === 0 || ROWS[i - 1][0] !== item ? (
              <td className="nowrap" rowSpan={ROWS.filter((r) => r[0] === item).length}>
                {item}
              </td>
            ) : null}
            <td className="nowrap">{formula}</td>
            <td>{meaning}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
