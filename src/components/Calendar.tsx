// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import type { ReactNode } from "react";
import { SOURCE_LABELS, dayDetail, yearInfo, type Day, type Snapshots } from "../engine/almanac";
import {
  ACTIVITIES,
  BRANCH_EN,
  MANSIONS,
  en,
  ganzhiEn,
  lunarDateEn,
  nineStarEn,
} from "../engine/dictionary";
import { monthLabel } from "./format";
import {
  Bi,
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

function Fact({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <div>
      <dt>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Terms({
  list,
  cls,
  gloss,
}: {
  list: string[];
  cls: string;
  gloss: (t: string) => string;
}) {
  if (!list.length) return <div className={`terms ${cls}`}>-</div>;
  return (
    <div className={`terms ${cls}`}>
      {list.map((t) => (
        <span key={t} className={`term${KEY_TERMS.has(t) ? " key" : ""}`}>
          {t}
          {gloss(t) ? <small>{gloss(t)}</small> : null}
        </span>
      ))}
    </div>
  );
}

function Ledger({ d, place, snap }: { d: Day; place: string; snap: Snapshots }) {
  const y = yearInfo(d.lunarYear);
  const x = dayDetail(d.date, snap);
  const fest = [...x.festivals, d.holiday].filter(Boolean).join(", ");
  const enList = (l: string[]) => l.map((x) => (en(x) ? `${x} (${en(x)})` : x)).join(", ");
  return (
    <article className="day" aria-label={`Almanac for ${d.date}`}>
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
        <TierPill day={d} tier={d.tier} />
        {Object.entries(d.group.persons).map(([who, a]) => (
          <span key={who}>
            {who} <VerdictPill a={a} />
          </span>
        ))}
        <span>
          Overall <OverallPill day={d} compact />
        </span>
        <span>
          Adjusted <AdjustedPill day={d} compact />
        </span>
      </div>
      <dl className="facts">
        <Fact k={<Bi zh="建除" english="Day officer" />}>
          <Bi zh={d.officer} english={d.officerEn} />
        </Fact>
        <Fact k={<Bi zh="天神" english="Day god" />}>
          <Bi
            zh={`${d.tianShen}, ${d.belt} ${d.beltLuck}`}
            english={`${d.tianShenEn}, ${en(d.belt)}, ${en(d.beltLuck)}`}
          />
        </Fact>
        <Fact k={<Bi zh="日柱" english="Day pillar" />}>
          <Bi zh={d.pillars.day} english={ganzhiEn(d.pillars.day)} />
        </Fact>
        <Fact k={<Bi zh="宿" english="Lunar mansion" />}>
          <Bi
            zh={`${x.mansion}${x.mansionElement}${x.mansionAnimal} ${x.mansionLuck}`}
            english={`${MANSIONS[x.mansion] ?? ""}, ${en(x.mansionLuck)}`}
          />
        </Fact>
        <Fact k={<Bi zh="纳音" english="Sound element" />}>
          <Bi zh={d.nayin} english={en(d.nayin)} />
        </Fact>
        <Fact k={<Bi zh="冲" english="Clashing birth year" />}>
          <Bi zh={`${d.chongAnimal} ${d.clash.gz}`} english={`born ${d.clash.years.join(", ")}`} />
        </Fact>
        <Fact k={<Bi zh="煞" english="Sha direction" />}>
          <Bi zh={d.sha} english={en(d.sha)} />
        </Fact>
        <Fact k={<Bi zh="节气" english="Solar term" />}>
          <Bi
            zh={`${x.currentTerm}${d.jieqi ? " starts today" : ""}`}
            english={en(x.currentTerm)}
          />
        </Fact>
        <Fact k={<Bi zh="九星" english="Nine star" />}>
          <Bi zh={x.nineStar} english={nineStarEn(x.nineStar)} />
        </Fact>
        <Fact k={<Bi zh="六曜" english="Six-day cycle" />}>
          <Bi zh={x.liuyao} english={en(x.liuyao)} />
        </Fact>
        <Fact k={<Bi zh="物候" english="Seasonal sign" />}>{x.wuhou}</Fact>
        <Fact k={<Bi zh="胎神" english="Fetus god position" />}>{x.taiShen}</Fact>
        <Fact k={<Bi zh="彭祖百忌" english="Peng Zu taboos" />}>{d.pengzu.join(" · ")}</Fact>
        <Fact k="Directions">
          {Object.entries(x.directions).map(([k, v]) => (
            <div key={k}>
              {k} {en(k)}: {v} {en(v)}
            </div>
          ))}
        </Fact>
        <Fact k="Lunar year">
          {y.ganzhi} <SpringPill y={y} />
        </Fact>
        {fest ? <Fact k="Festivals">{fest}</Fact> : null}
      </dl>
      <h3>宜 Suitable</h3>
      <Terms list={d.yi} cls="yi" gloss={(t) => ACTIVITIES[t] ?? ""} />
      <h3>忌 Avoid</h3>
      <Terms list={d.ji} cls="ji" gloss={(t) => ACTIVITIES[t] ?? ""} />
      <dl className="facts wide">
        <Fact k={<Bi zh="吉神宜趋" english="Lucky stars" />}>
          <Terms list={d.jiShen} cls="yi" gloss={en} />
        </Fact>
        <Fact k={<Bi zh="凶煞宜忌" english="Unlucky stars" />}>
          <Terms list={d.xiongSha} cls="ji" gloss={en} />
        </Fact>
        <Fact k="嫁娶 sources">
          <div className="terms">
            {Object.entries(d.sources).map(([k, v]) => (
              <span key={k} className={`term${v ? " key" : ""}`}>
                {SOURCE_LABELS[k]}{" "}
                <span className={v ? "check-yes" : "check-no"}>{v ? "✓" : "·"}</span>
              </span>
            ))}
          </div>
          {d.cco.captured && !d.cco.reliable ? (
            <small className="en">
              CCO is unreliable this year: its 宜忌 lookup uses a shifted day pillar, so its wedding
              vote is not counted.
            </small>
          ) : null}
        </Fact>
        <Fact k="Taboos">
          <TabooPills day={d} />
        </Fact>
        <Fact k="People">
          {Object.entries(d.group.persons).map(([who, a]) => (
            <div key={who}>
              {who} <VerdictPill a={a} />
              <ul>
                {(a.notes.length ? a.notes : ["none"]).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </Fact>
        <Fact k="Flags">
          <FlagPills day={d} />
        </Fact>
        <Fact k={<Bi zh="董公" english="Dong Gong" />}>
          <DongGongPill day={d} />
          <small className="en">{d.dongGong.summaryEn}</small>
        </Fact>
        <Fact k={<Bi zh="卦" english="Hexagram" />}>
          <span className="badgerow">
            {d.hexagrams.map((h) => (
              <Pill
                key={h.king_wen}
                cls="t-none"
                tip={`King Wen hexagram ${h.king_wen}\n\nXuan Kong Da Gua:\n• gua ${h.gua}, star ${h.star}\n• Luo Pan ${h.luo_pan}, sector ${h.location}\n• ${h.degrees}${d.hexagrams.length > 1 ? "\n\nThis pillar spans two hexagrams on the Luo Pan, so both are shown." : ""}`}
              >
                {h.name_zh} {h.name_en}
              </Pill>
            ))}
          </span>
        </Fact>
      </dl>
      <h3>Hours</h3>
      <table aria-label="Hours">
        <thead>
          <tr>
            <th>Hour 时辰</th>
            <th>China slot</th>
            <th>{place} clock</th>
            <th>Stem branch 干支</th>
            <th>Hour god 天神</th>
            <th>Luck 吉凶</th>
            <th>CCO luck</th>
            <th>Clash 冲</th>
            <th>Everyone safe</th>
            <th>Suitable 宜</th>
            <th>Avoid 忌</th>
          </tr>
        </thead>
        <tbody>
          {d.hours.map((h, i) => (
            <tr key={h.slot} className={h.pick ? "pick" : undefined}>
              <td>
                <Bi zh={h.branch} english={BRANCH_EN[h.branch]} />
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
              <td>{enList(x.hours[i].yi)}</td>
              <td>{enList(x.hours[i].ji)}</td>
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
  place: string;
  onMonth: (ym: string) => void;
  onSelect: (date: string) => void;
}

export function Calendar({ days, snap, month, selected, place, onMonth, onSelect }: Props) {
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
          <b>Recommended</b> {ds.filter((d) => d.tier === "Recommended").length}
        </span>
      </div>
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
            {d.tier ? <span className={`badge t-${d.tier.toLowerCase()}`}>{d.tier}</span> : null}
          </button>
        ))}
      </div>
      <Ledger d={day} place={place} snap={snap} />
    </section>
  );
}
