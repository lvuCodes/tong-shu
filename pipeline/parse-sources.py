import datetime
import html
import json
import re
import sys
from pathlib import Path

RAW = Path(sys.argv[1])
SAVED = Path(sys.argv[2])
OUT = Path(__file__).parent / "data" / "sources"
START, END = datetime.date(2026, 10, 1), datetime.date(2027, 12, 31)
MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}


def text(path, sep="|"):
    s = path.read_text(encoding="utf-8", errors="ignore")
    s = re.sub(r"<(script|style|svg)[^>]*>.*?</\1>", "", s, flags=re.S | re.I)
    t = html.unescape(re.sub(r"<[^>]+>", sep, s))
    return re.sub(r"\s*\|[\s|]*", "|", t) if sep == "|" else t


def in_range(d):
    return START <= d <= END


def iso(y, m, d):
    return datetime.date(int(y), int(m), int(d)).isoformat()


def parse_cco_day(path):
    s = path.read_text(encoding="utf-8")
    lis = lambda block: re.findall(r'<li class="bold col-4">([^<]+)</li>', block)
    spans = lambda block: re.findall(r'<span class="p05">([^<]+)</span>', block)
    yi_i, ji_i = s.find(">宜</div>"), s.find(">忌</div>")
    good_i, bad_i = s.find(">吉時</div>"), s.find(">兇時</div>")
    end_i = s.find('class="flex py1 link-box"')
    holiday = re.search(r'h-title">Holiday</div>([^<]+)</div>', s)
    pillars = re.search(r'cal-lunar-box p1 mb1">\s*(\S+)年\s+(\S+)月\s+(\S+)日', s)
    lunar = re.search(r'農歷<br />\s*<span[^>]*>\s*(\d+)年\s*(\S+)\s+(\S+)\s*</span>', s)
    gods = dict(re.findall(r'(喜神|福神|財神):<span class="bold red">([^<]+)</span>', s))
    return {
        "lunar": f"{lunar.group(2)}{lunar.group(3)}",
        "pillars": [pillars.group(1), pillars.group(2), pillars.group(3)],
        "clash": re.search(r'相沖: <span class="bold color-red">([^<]+)</span>', s).group(1),
        "sha": re.search(r'歲煞: <span class="bold color-red">([^<]+)</span>', s).group(1),
        "gods": gods,
        "holiday": holiday.group(1).strip() if holiday else None,
        "yi": lis(s[yi_i:good_i]),
        "ji": lis(s[ji_i:bad_i]),
        "good_hours": spans(s[good_i:ji_i]),
        "bad_hours": spans(s[bad_i:end_i]),
    }


def parse_tst_officers(path):
    s = path.read_text(encoding="utf-8", errors="ignore")
    cells = re.findall(r'<time dateTime="(\d{4}-\d{2}-\d{2})"[^>]*>\d+</time><div[^>]*>[^<]+</div><div[^>]*>(\S)', s)
    return dict(cells)


def parse_tst_wedding(path):
    t = text(path)
    seg = t[t.find("Every qualifying"):t.find("Why these days did not make the list")]
    out = []
    for d, mon, y in re.findall(r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d+) (\w+) (\d{4})", seg):
        out.append(iso(y, MONTHS[mon.lower()], d))
    return out


def parse_yca_both(path):
    t = text(path)
    out, year = [], 2026
    for tok in t.split("|"):
        if tok == "2027":
            year = 2027
        m = re.fullmatch(r"([A-Z][a-z]{2})\.(\d{2})", tok)
        if m:
            mon = next(i for k, i in MONTHS.items() if k.startswith(m.group(1).lower()))
            out.append(iso(year, mon, m.group(2)))
    return out


def parse_cfc(path):
    return [iso(y, m, d) for m, d, y in re.findall(r"(\d{2})/(\d{2})/(\d{4})\s+(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day", text(path, "\n"))]


def parse_regent(path):
    lines = text(path, "\n").splitlines()
    out, year = [], None
    for line in lines:
        line = line.strip()
        if "Year of the Horse: 2026" in line:
            year = 2026
        elif "Year of the Goat: 2027" in line:
            year = 2027
        elif year and line.startswith("This October, Hong Kong"):
            break
        m = re.fullmatch(r"([A-Z][a-z]{2}) (\d{1,2})", line)
        if m and year:
            mon = next(i for k, i in MONTHS.items() if k.startswith(m.group(1).lower()))
            out.append(iso(year, mon, m.group(2)))
    return out


def parse_baibai(path):
    t = text(path)
    return sorted({iso(y, MONTHS[mon.lower()], d) for mon, d, y in re.findall(r"\|(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})\|[^|]*月", t)})


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cco = {}
    d = START
    while d <= END:
        cco[d.isoformat()] = parse_cco_day(RAW / "cco" / f"{d.isoformat()}.html")
        d += datetime.timedelta(1)
    officers = {}
    for p in sorted((RAW / "tst").glob("*.html")):
        officers.update(parse_tst_officers(p))
    weddings = {
        "tongshutoday": sorted(x for p in (RAW / "tstw").glob("*.html") for x in parse_tst_wedding(p)),
        "yourchineseastrology": parse_yca_both(RAW / "yca-wedding.html"),
        "chinesefortunecalendar": parse_cfc(RAW / "cfc-2026.html") + parse_cfc(SAVED / "2026 - 2027 Auspicious Dates, Event Lucky Days from Chinese Farmer's Almanac.html"),
        "regenthotels": parse_regent(SAVED / "Auspicious Wedding Dates 2026–2027 _ Chinese Almanac Guide Hong Kong.html"),
        "baibai": parse_baibai(RAW / "baibai-2026.html") + parse_baibai(SAVED / "Chinese Auspicious Wedding Dates 2027_ Full Calendar _ Bai Bai.html"),
    }
    weddings = {k: sorted({x for x in v if in_range(datetime.date.fromisoformat(x))}) for k, v in weddings.items()}
    (OUT / "chinesecalendaronline-daily.json").write_text(json.dumps(cco, ensure_ascii=False, indent=1))
    (OUT / "tongshutoday-officers.json").write_text(json.dumps({k: v for k, v in sorted(officers.items()) if in_range(datetime.date.fromisoformat(k))}, ensure_ascii=False, indent=1))
    (OUT / "wedding-lists.json").write_text(json.dumps(weddings, ensure_ascii=False, indent=1))
    print(len(cco), "cco days;", len(officers), "officers;", {k: len(v) for k, v in weddings.items()})


if __name__ == "__main__":
    main()
