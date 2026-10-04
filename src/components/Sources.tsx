// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { Fragment } from "react";

type Ref = string | { text: string; href: string };

const SOURCES: { label: string; refs: Ref[] }[] = [
  {
    label: "Calendar computation",
    refs: [
      { text: "lunar-javascript by 6tail", href: "https://github.com/6tail/lunar-javascript" },
      "following 协纪辨方书 (Qing imperial almanac manual, 1741)",
    ],
  },
  {
    label: "Branch relations and ten gods",
    refs: ["冲, 合, 刑, 害, 破 and 十神 from 三命通会 and 渊海子平"],
  },
  {
    label: "Wedding taboos",
    refs: ["三娘煞, 杨公忌, 四离, 四绝, 月厌 from 协纪辨方书 and folk almanac practice"],
  },
  {
    label: "Folk flags",
    refs: ["红沙日, 月忌日, 孤辰, 寡宿, 红鸾, 天喜, 无春 from 通书 folk tradition"],
  },
  {
    label: "Dong Gong and hexagrams",
    refs: [
      "董公选择日要览, verdict per month branch and day pillar",
      {
        text: "Chinese Metasoft Tong Shu",
        href: "https://www.chinesemetasoft.com/TongShu/Monthly",
      },
    ],
  },
  {
    label: "Cross-check lists",
    refs: [
      { text: "chinesecalendaronline.com", href: "https://www.chinesecalendaronline.com/zh/" },
      { text: "tongshutoday.com", href: "https://tongshutoday.com/auspicious-days/wedding/" },
      {
        text: "yourchineseastrology.com",
        href: "https://www.yourchineseastrology.com/calendar/auspicious-wedding-date.htm",
      },
      {
        text: "chinesefortunecalendar.com",
        href: "https://www.chinesefortunecalendar.com/TDB/LuckyEvents.asp",
      },
      { text: "baibai.app", href: "https://baibai.app/auspicious-dates/wedding/" },
      {
        text: "Regent Hong Kong",
        href: "https://hongkong.regenthotels.com/auspicious-wedding-dates-2026-2027-plan-your-perfect-hong-kong-celebration/",
      },
    ],
  },
];

export function Sources({ note }: { note?: string }) {
  return (
    <section className="sources" aria-label="Sources">
      <dl className="guide">
        {SOURCES.map(({ label, refs }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {refs.map((r, i) => (
                <Fragment key={i}>
                  {i ? ", " : ""}
                  {typeof r === "string" ? (
                    r
                  ) : (
                    <a href={r.href} target="_blank" rel="noreferrer">
                      {r.text}
                    </a>
                  )}
                </Fragment>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      {note ? <p>{note}</p> : null}
    </section>
  );
}
