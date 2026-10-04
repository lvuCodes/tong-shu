import datetime
import json
from collections import defaultdict
from pathlib import Path

from lunar_python import Solar
from opencc import OpenCC

ROOT = Path(__file__).parent
SOURCES = ROOT / "data" / "sources"
HIST = SOURCES / "history"
SITE = ROOT.parent
PARITY_START, PARITY_END = datetime.date(2026, 10, 1), datetime.date(2027, 12, 31)
OUT = SITE / "public" / "data"
CAPTURED = "2026-10-02"
T2S = OpenCC("t2s").convert
CCO_FIELDS = ("pillars", "clash", "sha", "yi", "ji", "good_hours", "holiday")


def reliability(shift_counts):
    out = {}
    for year, counts in sorted(shift_counts.items()):
        days = {k.split(" ", 1)[1]: n for k, n in counts.items() if k.startswith("day ") and k != "day None"}
        months = {k.split(" ", 1)[1]: n for k, n in counts.items() if k.startswith("month ") and k != "month None"}
        day_shift = int(max(days, key=days.get))
        month_branch = max(months, key=months.get)
        out[year] = {"day_shift": day_shift, "month_branch": month_branch, "reliable": day_shift == 0 and month_branch == "actual"}
    return out


def simplify(value):
    if isinstance(value, str):
        return T2S(value)
    if isinstance(value, list):
        return [simplify(v) for v in value]
    return value


def parity_days():
    out, d = {}, PARITY_START
    while d <= PARITY_END:
        l = Solar.fromYmd(d.year, d.month, d.day).getLunar()
        out[d.isoformat()] = {
            "pillars": {"year": l.getYearInGanZhiByLiChun(), "month": l.getMonthInGanZhi(), "day": l.getDayInGanZhi()},
            "officer": l.getZhiXing(), "nayin": l.getDayNaYin(), "mansion": l.getXiu(), "tian_shen": l.getDayTianShen(), "belt": l.getDayTianShenType(),
            "chong": l.getDayChongDesc(), "sha": l.getDaySha(), "yi": l.getDayYi(), "ji": l.getDayJi(), "ji_shen": l.getDayJiShen(), "xiong_sha": l.getDayXiongSha(),
        }
        d += datetime.timedelta(1)
    return out


def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cco = json.loads((HIST / "chinesecalendaronline-daily.json").read_text())
    by_year = defaultdict(dict)
    for day, rec in cco.items():
        by_year[day[:4]][day] = {k: simplify(rec[k]) for k in CCO_FIELDS if rec.get(k)}
    for year, days in by_year.items():
        write(f"cco-{year}.json", days)

    weddings = {k: set(v) for k, v in json.loads((HIST / "wedding-lists.json").read_text()).items()}
    for k, v in json.loads((SOURCES / "wedding-lists.json").read_text()).items():
        weddings.setdefault(k, set()).update(v)
    officers = {**json.loads((SOURCES / "tongshutoday-officers.json").read_text()), **json.loads((HIST / "tongshutoday-officers.json").read_text())}
    write("weddings.json", {k: sorted(v) for k, v in sorted(weddings.items())})
    write("officers.json", {k: simplify(v) for k, v in sorted(officers.items())})

    comparison = json.loads((HIST / "calculation-comparison.json").read_text())
    years = sorted(by_year)
    write("manifest.json", {
        "captured": CAPTURED,
        "years": years,
        "cco_reliability": reliability(comparison["cco_yiji_shift"]),
        "wedding_sources": {k: sorted({d[:4] for d in v}) for k, v in sorted(weddings.items())},
    })
    fixtures = SITE / "src" / "engine" / "fixtures"
    fixtures.mkdir(parents=True, exist_ok=True)
    (fixtures / "lunar-python-parity.json").write_text(json.dumps(parity_days(), ensure_ascii=False, separators=(",", ":")))
    sizes = sum(p.stat().st_size for p in OUT.glob("*.json"))
    print(f"{len(years)} years, {len(list(OUT.glob('*.json')))} files, {sizes // 1024} KB -> {OUT}")


if __name__ == "__main__":
    main()
