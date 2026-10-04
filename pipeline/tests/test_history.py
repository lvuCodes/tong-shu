import gzip
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

from lunar_python import Solar
from lunar_python.util import LunarUtil

ROOT = Path(__file__).parent.parent


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


argv = sys.argv
fetch = load("fetch_history", "fetch-history.py")
sys.argv = argv
compare = load("compare_history", "compare-history.py")


class HistoryTests(unittest.TestCase):
    def test_baibai_parses_any_year(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "b.html.gz"
            path.write_bytes(gzip.compress("<td>March 5, 2028</td><td>二月初十</td>".encode()))
            self.assertEqual(fetch.ps.parse_baibai(fetch.Gz(path)), ["2028-03-05"])

    def test_jobs_cover_range(self):
        jobs = list(fetch.jobs())
        cco = [j for j in jobs if "/cco/" in str(j[0])]
        self.assertEqual(len(cco), 5844)
        self.assertTrue(cco[0][1].endswith("/zh/2020/1/1.htm"))
        self.assertTrue(cco[-1][1].endswith("/zh/2035/12/31.htm"))
        self.assertEqual(sum("/tst/" in str(j[0]) for j in jobs), 192)

    def test_synonyms_map_lunar_python_variants(self):
        self.assertEqual(compare.SYNONYMS["馀事勿取"], "余事勿取")
        self.assertEqual(compare.SYNONYMS["启钻"], "启攒")

    def test_cco_shift_finds_offset_day_pillar(self):
        l = Solar.fromYmd(2021, 1, 1).getLunar()
        shifted = compare.CYCLE[(compare.CYCLE.index(l.getDayInGanZhi()) + 40) % 60]
        yi = compare.norm(LunarUtil.getDayYi(l.getMonthInGanZhi(), shifted))
        ji = compare.norm(LunarUtil.getDayJi(l.getMonthInGanZhi(), shifted))
        self.assertEqual(compare.cco_shift(l, yi, ji)[0], 0)
        self.assertEqual(compare.cco_shift(l, compare.norm(l.getDayYi()), compare.norm(l.getDayJi())), (0, 0))

    def test_rate_formats_agreement(self):
        self.assertEqual(compare.rate({"agree": 3, "disagree": 1}), "75.0%")
        self.assertEqual(compare.rate({"agree": 0, "disagree": 0}), "—")


if __name__ == "__main__":
    unittest.main()
