// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import { SOURCE_LABELS, dayDetail, yearInfo, type Day, type Snapshots } from "../engine/almanac";
import {
  ACTIVITIES,
  MANSIONS,
  en,
  ganzhiEn,
  ganzhiPinyin,
  lunarDateEn,
  nineStarEn,
} from "../engine/dictionary";
import { TIER_LABELS, monthLabel } from "./format";
import {
  Bi,
  Gz,
  DongGongPill,
  FlagPills,
  Pill,
  SpringPill,
  TabooPills,
  TierPill,
  VerdictPill,
  AdjustedPill,
  OverallPill,
} from "./pills";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KEY_TERMS = new Set(["嫁娶", "纳采", "订盟"]);
const ANIMAL_EN: Record<string, string> = {
  鼠: "Rat",
  牛: "Ox",
  虎: "Tiger",
  兔: "Rabbit",
  龙: "Dragon",
  蛇: "Snake",
  马: "Horse",
  羊: "Goat",
  猴: "Monkey",
  鸡: "Rooster",
  狗: "Dog",
  猪: "Pig",
};

function chongEn(s: string): string {
  const m = /\((..)\)(.)/.exec(s);
  return m ? `${ANIMAL_EN[m[2]]} ${m[1]}` : s;
}

const HOUR_COLS: [string, string][] = [
  [
    "时辰 Hour",
    "One of the 12 two-hour periods of the day, each named for a branch and its animal. Highlighted rows are the best hours: auspicious, and safe for everyone.",
  ],
  ["China slot", "The period's clock time in China, where the almanac's hours are set."],
  [
    "Local time",
    "The same period in clock time at the event location, adjusted for the sun's actual position there.",
  ],
  ["干支 Stem branch", "The hour's stem and branch in the repeating 60-pair cycle."],
  [
    "天神 Hour god",
    "The spirit in charge of the hour. 黄道 Yellow Belt spirits are auspicious and 黑道 Black Belt spirits are inauspicious.",
  ],
  ["吉凶 Luck", "Our almanac's verdict for the hour: 吉 lucky or 凶 unlucky."],
  ["CCO luck", "The chinesecalendaronline.com verdict for the same hour, for comparison."],
  ["冲 Clash", "The zodiac animal the hour clashes with."],
  [
    "Everyone safe",
    "✓ when the hour does not clash with, punish or harm the birth year or birth day of either person.",
  ],
  ["宜 Suitable", "Activities the almanac says the hour suits."],
  ["忌 Avoid", "Activities the almanac says to avoid during the hour."],
];

function zoneLabel(tz: string, date: string): string {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  return name ? `${tz.replace(/_/g, " ")} (${name})` : tz;
}

function FactRow({
  zh,
  label,
  value,
  meaning,
}: {
  zh: string;
  label: string;
  value: ReactNode;
  meaning?: ReactNode;
}) {
  return (
    <tr>
      <td className="zh">{zh}</td>
      <td>{label}</td>
      <td>{value}</td>
      <td>{meaning || "-"}</td>
    </tr>
  );
}

function Cols({ widths }: { widths: number[] }) {
  return (
    <colgroup>
      {widths.map((w, i) => (
        <col key={i} className={`w${w}`} />
      ))}
    </colgroup>
  );
}

function HourTerms({ list }: { list: string[] }) {
  if (!list.length) return <>-</>;
  return (
    <ul className="plain hourterms">
      {list.map((t) => (
        <li key={t}>
          <span className="zh">{t}</span> {ACTIVITIES[t] ?? en(t)}
        </li>
      ))}
    </ul>
  );
}

function TermTable({
  zh,
  title,
  list,
  gloss,
  cls,
}: {
  zh: string;
  title: string;
  list: string[];
  gloss: (t: string) => string;
  cls: string;
}) {
  return (
    <table className={`termtable ${cls}`} aria-label={title}>
      <Cols widths={[35, 65]} />
      <thead>
        <tr>
          <th>{zh}</th>
          <th>{title}</th>
        </tr>
      </thead>
      <tbody>
        {list.length ? (
          list.map((t) => {
            const key = KEY_TERMS.has(t) ? "keyterm" : undefined;
            return (
              <tr key={t}>
                <td className={key ? "zh keyterm" : "zh"}>{t}</td>
                <td className={key}>{gloss(t) || "-"}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={2}>-</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function Ledger({ d, snap, grid, tz }: { d: Day; snap: Snapshots; grid: ReactNode; tz: string }) {
  const y = yearInfo(d.lunarYear);
  const x = dayDetail(d.date, snap);
  const fest = [...x.festivals, d.holiday].filter(Boolean).join(", ");
  return (
    <article className="day" aria-label={`Almanac for ${d.date}`}>
      <div className="calrow">
        <div>{grid}</div>
        <div>
          <div className="dayhead">
            <h3>
              {d.date} {d.weekday}
            </h3>
            <span className="gz">
              {d.pillars.year}年 {d.pillars.month}月 {d.pillars.day}日
            </span>
            <span>
              {d.lunar} <span className="en">{lunarDateEn(d.lunar, d.lunarMonth, d.lunarDay)}</span>
            </span>
            <span className="en">Local time: {zoneLabel(tz, d.date)}</span>
          </div>
          <div className="dayhead">
            <TierPill day={d} tier={d.tier} />
            {Object.entries(d.group.persons).map(([who, a]) => (
              <span key={who}>
                {who} <VerdictPill a={a} />
              </span>
            ))}
            <span>
              Overall score <OverallPill day={d} compact />
            </span>
            <span>
              Adjusted score <AdjustedPill day={d} compact />
            </span>
          </div>
          <table aria-label="People">
            <Cols widths={[20, 20, 60]} />
            <thead>
              <tr>
                <th>Person</th>
                <th>Rating</th>
                <th>Reasons</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.group.persons).map(([who, a]) => (
                <tr key={who}>
                  <td>{who}</td>
                  <td>
                    <VerdictPill a={a} />
                  </td>
                  <td>
                    {a.notes.length ? (
                      <ul className="plain">
                        {a.notes.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    ) : (
                      "none"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="facttable" aria-label="Day facts">
            <Cols widths={[16, 22, 28, 34]} />
            <thead>
              <tr>
                <th colSpan={2}>Item</th>
                <th>Value</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <FactRow zh="建除" label="Day officer" value={d.officer} meaning={d.officerEn} />
              <FactRow
                zh="天神"
                label="Day god"
                value={`${d.tianShen}, ${d.belt} ${d.beltLuck}`}
                meaning={`${d.tianShenEn}, ${en(d.belt)}, ${en(d.beltLuck)}`}
              />
              <FactRow
                zh="日柱"
                label="Day pillar"
                value={<span className="gz">{d.pillars.day}</span>}
                meaning={
                  <>
                    {ganzhiPinyin(d.pillars.day)}
                    <br />
                    {ganzhiEn(d.pillars.day)}
                  </>
                }
              />
              <FactRow
                zh="宿"
                label="Lunar mansion"
                value={`${x.mansion}${x.mansionElement}${x.mansionAnimal} ${x.mansionLuck}`}
                meaning={`${MANSIONS[x.mansion] ?? ""}, ${en(x.mansionLuck)}`}
              />
              <FactRow zh="纳音" label="Sound element" value={d.nayin} meaning={en(d.nayin)} />
              <FactRow
                zh="冲"
                label="Clashing birth year"
                value={`${d.chongAnimal} ${d.clash.gz}`}
                meaning={`born ${d.clash.years.join(", ")}`}
              />
              <FactRow zh="煞" label="Shà direction" value={d.sha} meaning={en(d.sha)} />
              <FactRow
                zh="节气"
                label="Solar term"
                value={`${x.currentTerm}${d.jieqi ? " starts today" : ""}`}
                meaning={en(x.currentTerm)}
              />
              <FactRow
                zh="九星"
                label="Nine star"
                value={x.nineStar}
                meaning={nineStarEn(x.nineStar)}
              />
              <FactRow zh="六曜" label="Six-day cycle" value={x.liuyao} meaning={en(x.liuyao)} />
              <FactRow zh="物候" label="Seasonal sign" value={x.wuhou} />
              <FactRow zh="胎神" label="Fetus god position" value={x.taiShen} />
              <FactRow zh="彭祖百忌" label="Péng Zǔ taboos" value={d.pengzu.join(" · ")} />
              <FactRow zh="年" label="Lunar year" value={y.ganzhi} meaning={<SpringPill y={y} />} />
              {fest ? <FactRow zh="节日" label="Festivals" value={fest} /> : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pairtables">
        <div className="stack">
          <TermTable
            zh="宜"
            title="Suitable"
            list={d.yi}
            cls="yi"
            gloss={(t) => ACTIVITIES[t] ?? en(t)}
          />
          <TermTable
            zh="忌"
            title="Avoid"
            list={d.ji}
            cls="ji"
            gloss={(t) => ACTIVITIES[t] ?? en(t)}
          />
        </div>
        <div className="stack">
          <TermTable zh="吉神宜趋" title="Lucky stars" list={d.jiShen} cls="yi" gloss={en} />
          <TermTable zh="凶煞宜忌" title="Unlucky stars" list={d.xiongSha} cls="ji" gloss={en} />
          <table aria-label="Directions">
            <thead>
              <tr>
                <th>方位 Lucky directions today</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(x.directions).map(([k, v]) => (
                <tr key={k}>
                  <td>
                    <span className="zh">{k}</span> {en(k)} → <span className="zh">{v}</span>{" "}
                    {en(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <table aria-label="Wedding check">
          <Cols widths={[18, 30, 52]} />
          <thead>
            <tr>
              <th colSpan={2}>Check</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="zh">嫁娶</td>
              <td>Almanacs listing weddings</td>
              <td>
                {d.listed.length ? (
                  <span className="badgerow">
                    {d.listed.map((k) => (
                      <span key={k} className="term key">
                        {SOURCE_LABELS[k]}
                      </span>
                    ))}
                  </span>
                ) : (
                  "Not listed by any almanac"
                )}
                {d.cco.captured && !d.cco.reliable ? (
                  <small className="en">
                    CCO is unreliable this year: its 宜忌 lookup uses a shifted day pillar, so its
                    wedding vote is not counted.
                  </small>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className="zh">忌</td>
              <td>Taboos</td>
              <td>
                <TabooPills day={d} />
              </td>
            </tr>
            <tr>
              <td className="zh">神煞</td>
              <td>Flags</td>
              <td>
                <FlagPills day={d} />
              </td>
            </tr>
            <tr>
              <td className="zh">董公</td>
              <td>Dǒng Gōng</td>
              <td>
                <DongGongPill day={d} />
                <small className="en">{d.dongGong.summaryEn}</small>
              </td>
            </tr>
            <tr>
              <td className="zh">卦</td>
              <td>Hexagram</td>
              <td>
                <span className="badgerow">
                  {d.hexagrams.map((h) => (
                    <Pill
                      key={h.king_wen}
                      cls="t-none"
                      tip={`King Wén hexagram ${h.king_wen}\n\nXuán Kōng Dà Guà:\n• guà ${h.gua}, star ${h.star}\n• Luó Pán ${h.luo_pan}, sector ${h.location}\n• ${h.degrees}${d.hexagrams.length > 1 ? "\n\nThis pillar spans two hexagrams on the Luo Pan, so both are shown." : ""}`}
                    >
                      {h.name_zh} {h.name_en}
                    </Pill>
                  ))}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Hours</h3>
      <table aria-label="Hours">
        <Cols widths={[8, 9, 9, 7, 10, 6, 6, 8, 7, 18, 12]} />
        <thead>
          <tr>
            {HOUR_COLS.map(([label, tip]) => (
              <th key={label} className="coltip" data-tip={tip}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.hours.map((h, i) => (
            <tr key={h.slot} className={h.pick ? "pick" : undefined}>
              <td>
                <Gz gz={h.branch} plain />
              </td>
              <td className="mono">{h.slot}</td>
              <td className="mono">{h.local}</td>
              <td className="gz">{h.ganzhi}</td>
              <td>
                <Bi zh={`${h.tianShen} ${h.belt}`} english={en(h.tianShen)} />
              </td>
              <td>
                <Bi zh={h.luck} english={en(h.luck)} />
              </td>
              <td>{h.cco ? <Bi zh={h.cco} english={en(h.cco)} /> : "-"}</td>
              <td>
                <Bi zh={x.hours[i].chong} english={chongEn(x.hours[i].chong)} />
              </td>
              <td className={h.safe ? "check-yes" : "check-no"}>{h.safe ? "✓" : "·"}</td>
              <td>
                <HourTerms list={x.hours[i].yi} />
              </td>
              <td>
                <HourTerms list={x.hours[i].ji} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

interface Props {
  days: Day[];
  snap: Snapshots;
  month: string;
  selected: string;
  tz: string;
  onMonth: (ym: string) => void;
  onSelect: (date: string) => void;
}

export function Calendar({ days, snap, month, selected, tz, onMonth, onSelect }: Props) {
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
  const ds = days.filter((d) => d.date.startsWith(month));
  if (!ds.length) return <p className="empty">No days in range.</p>;
  const day =
    ds.find((d) => d.date === selected) ?? ds.find((d) => d.tier === "Recommended") ?? ds[0];
  const monthPillars: [string, string][] = [];
  for (const d of ds)
    if (monthPillars.at(-1)?.[0] !== d.pillars.month)
      monthPillars.push([d.pillars.month, d.date.slice(5)]);
  const terms = ds
    .filter((d) => d.jieqi)
    .map((d) => `${d.jieqi} ${en(d.jieqi!)} ${d.date.slice(5)}`);
  const lead = new Date(`${ds[0].date}T12:00:00Z`).getUTCDay();
  return (
    <section aria-label="Calendar">
      <div className="months">
        {months.map((ym, i) => (
          <span key={ym} className="monthbtn">
            {i === 0 || months[i - 1].slice(0, 4) !== ym.slice(0, 4) ? (
              <span className="myear">{ym.slice(0, 4)}</span>
            ) : null}
            <button
              type="button"
              aria-selected={ym === month}
              aria-label={monthLabel(ym)}
              onClick={() => onMonth(ym)}
            >
              {monthLabel(ym).slice(0, 3)}
            </button>
          </span>
        ))}
      </div>
      <h2>{monthLabel(month)}</h2>
      <div className="monthmeta">
        <span>
          <b>Year</b> {[...new Set(ds.map((d) => d.pillars.year))].join(", ")}
        </span>
        <span>
          <b>Month</b> {monthPillars.map(([m, s]) => `${m} from ${s}`).join(", ")}
        </span>
        <span>
          <b>Solar terms</b> {terms.join(", ") || "-"}
        </span>
        <span>
          <b>{TIER_LABELS.Recommended}</b> {ds.filter((d) => d.tier === "Recommended").length}
        </span>
      </div>
      <Ledger
        d={day}
        snap={snap}
        tz={tz}
        grid={
          <div className="grid">
            {DOW.map((w) => (
              <div key={w} className="dow">
                {w}
              </div>
            ))}
            {Array.from({ length: lead }, (_, i) => (
              <div key={`lead${i}`} />
            ))}
            {ds.map((d) => (
              <button
                key={d.date}
                type="button"
                className={`cell t-${(d.tier ?? "none").toLowerCase()}${d.weekend ? " wknd" : ""}`}
                aria-selected={d.date === day.date}
                onClick={() => onSelect(d.date)}
              >
                <span className="dnum">{Number(d.date.slice(8))}</span>
                <span className="lun">
                  {d.lunar.slice(-2)}
                  {d.jieqi ? ` · ${d.jieqi}` : ""}
                </span>
                <span className="gz">{d.pillars.day}</span>
                <span className="off">
                  {d.officer} {d.officerEn}
                </span>
                {d.tier ? (
                  <span className={`badge t-${d.tier.toLowerCase()}`}>{TIER_LABELS[d.tier]}</span>
                ) : null}
              </button>
            ))}
          </div>
        }
      />
    </section>
  );
}
