import calendar
import datetime
import gzip
import importlib.util
import json
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "sources" / "history"
START, END = datetime.date(2020, 1, 1), datetime.date(2035, 12, 31)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
MONTH_NAMES = [m.lower() for m in calendar.month_name[1:]]

spec = importlib.util.spec_from_file_location("parse_sources", ROOT / "parse-sources.py")
ps = importlib.util.module_from_spec(spec)
ARGV, sys.argv = sys.argv, [sys.argv[0], ".", "."]
spec.loader.exec_module(ps)
sys.argv = ARGV


class Gz:
    def __init__(self, path):
        self.path = path

    def read_text(self, **_):
        return gzip.decompress(self.path.read_bytes()).decode("utf-8", errors="ignore")


def years():
    return range(START.year, END.year + 1)


def days():
    d = START
    while d <= END:
        yield d
        d += datetime.timedelta(1)


def jobs():
    for d in days():
        yield RAW / "cco" / f"{d.isoformat()}.html.gz", f"https://www.chinesecalendaronline.com/zh/{d.year}/{d.month}/{d.day}.htm"
    for y in years():
        yield RAW / "cfc" / f"{y}.html.gz", f"https://www.chinesefortunecalendar.com/TDB/LuckyEvents.asp?SunYear={y}&SunMonth=+All&TimeZone=CST&Events=Wedding&LuckyDays=V1&B1=Submit"
        yield RAW / "baibai" / f"{y}.html.gz", f"https://baibai.app/auspicious-dates/wedding/{y}"
        for m, name in enumerate(MONTH_NAMES, 1):
            yield RAW / "tst" / f"{y}-{m:02d}.html.gz", f"https://tongshutoday.com/almanac/{y}/{name}"
            yield RAW / "tstw" / f"{y}-{m:02d}.html.gz", f"https://tongshutoday.com/auspicious-days/wedding/{name}-{y}"


def fetch(job):
    path, url = job
    missing = path.with_suffix(".404")
    if path.exists() or missing.exists():
        return "cached"
    path.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
                path.write_bytes(gzip.compress(r.read()))
            time.sleep(0.25)
            return "ok"
        except urllib.error.HTTPError as e:
            if e.code == 404:
                missing.touch()
                return "404"
            time.sleep(2 ** attempt)
        except (urllib.error.URLError, TimeoutError):
            time.sleep(2 ** attempt)
    return f"failed {url}"


def download():
    results = {}
    with ThreadPoolExecutor(4) as pool:
        for i, res in enumerate(pool.map(fetch, jobs()), 1):
            key = res if not res.startswith("failed") else "failed"
            results[key] = results.get(key, 0) + 1
            if res.startswith("failed"):
                print(res, flush=True)
            if i % 500 == 0:
                print(i, results, flush=True)
    print("download", results)


def present(folder):
    return sorted(p for p in (RAW / folder).glob("*.html.gz"))


def parse():
    OUT.mkdir(parents=True, exist_ok=True)
    cco, failures = {}, []
    for p in present("cco"):
        try:
            cco[p.name[:10]] = ps.parse_cco_day(Gz(p))
        except AttributeError:
            failures.append(p.name[:10])
    officers = {}
    for p in present("tst"):
        officers.update(ps.parse_tst_officers(Gz(p)))
    in_range = lambda xs: sorted({x for x in xs if START <= datetime.date.fromisoformat(x) <= END})
    weddings = {
        "tongshutoday": in_range(x for p in present("tstw") for x in ps.parse_tst_wedding(Gz(p))),
        "chinesefortunecalendar": in_range(x for p in present("cfc") for x in ps.parse_cfc(Gz(p))),
        "baibai": in_range(x for p in present("baibai") for x in ps.parse_baibai(Gz(p))),
    }
    (OUT / "chinesecalendaronline-daily.json").write_text(json.dumps(cco, ensure_ascii=False, indent=1))
    (OUT / "tongshutoday-officers.json").write_text(json.dumps({k: v for k, v in sorted(officers.items()) if START.isoformat() <= k <= END.isoformat()}, ensure_ascii=False, indent=1))
    (OUT / "wedding-lists.json").write_text(json.dumps(weddings, ensure_ascii=False, indent=1))
    print(len(cco), "cco days;", len(officers), "officers;", {k: len(v) for k, v in weddings.items()}, "; unparsed cco:", failures[:20], len(failures))


if __name__ == "__main__":
    if "--parse-only" not in sys.argv:
        download()
    parse()
