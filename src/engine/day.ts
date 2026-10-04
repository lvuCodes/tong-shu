import { Solar } from "lunar-javascript";
import { normalizeTerms } from "./terms";

export const HOUR_SLOTS = [
  "23:00-00:59",
  ...Array.from({ length: 11 }, (_, i) => {
    const h = 2 * i + 1;
    return `${String(h).padStart(2, "0")}:00-${String(h + 1).padStart(2, "0")}:59`;
  }),
];

export interface HourRecord {
  slot: string;
  branch: string;
  ganzhi: string;
  tianShen: string;
  luck: string;
}

export interface DayRecord {
  date: string;
  weekday: number;
  lunar: { year: number; ganzhi: string; month: number; day: number; label: string; leap: boolean };
  pillars: { year: string; month: string; day: string };
  monthBranch: string;
  nayin: string;
  jieqi: string | null;
  currentTerm: string;
  officer: string;
  mansion: { name: string; luck: string };
  tianShen: { name: string; belt: string; luck: string };
  chong: string;
  sha: string;
  yi: string[];
  ji: string[];
  jiShen: string[];
  xiongSha: string[];
  hours: HourRecord[];
}

export function parseIso(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

export function dayRecord(date: string): DayRecord {
  const [y, m, d] = parseIso(date);
  const l = Solar.fromYmd(y, m, d).getLunar();
  const leap = l.getMonth() < 0;
  return {
    date,
    weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
    lunar: {
      year: l.getYear(),
      ganzhi: l.getYearInGanZhi(),
      month: Math.abs(l.getMonth()),
      day: l.getDay(),
      label: `${leap ? "闰" : ""}${l.getMonthInChinese()}月${l.getDayInChinese()}`,
      leap,
    },
    pillars: {
      year: l.getYearInGanZhiByLiChun(),
      month: l.getMonthInGanZhi(),
      day: l.getDayInGanZhi(),
    },
    monthBranch: l.getMonthZhi(),
    nayin: l.getDayNaYin(),
    jieqi: l.getJieQi() || null,
    currentTerm: l.getPrevJieQi(true).getName(),
    officer: l.getZhiXing(),
    mansion: { name: l.getXiu(), luck: l.getXiuLuck() },
    tianShen: {
      name: l.getDayTianShen(),
      belt: l.getDayTianShenType(),
      luck: l.getDayTianShenLuck(),
    },
    chong: l.getDayChongDesc(),
    sha: l.getDaySha(),
    yi: normalizeTerms(l.getDayYi()),
    ji: normalizeTerms(l.getDayJi()),
    jiShen: l.getDayJiShen(),
    xiongSha: l.getDayXiongSha(),
    hours: l
      .getTimes()
      .slice(0, 12)
      .map((t, i) => ({
        slot: HOUR_SLOTS[i],
        branch: t.getZhi(),
        ganzhi: t.getGanZhi(),
        tianShen: t.getTianShen(),
        luck: t.getTianShenLuck(),
      })),
  };
}

export function monthDays(year: number, month: number): DayRecord[] {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) =>
    dayRecord(`${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`),
  );
}
