import datetime
import json
from collections import Counter, defaultdict
from pathlib import Path

from lunar_python import Solar
from lunar_python.util import LunarUtil
from opencc import OpenCC

ROOT = Path(__file__).parent
HIST = ROOT / "data" / "sources" / "history"
T2S = OpenCC("t2s").convert
HOUR_SLOTS = ["23:00-00:59"] + [f"{h:02d}:00-{h + 1:02d}:59" for h in range(1, 23, 2)]
CYCLE = [s + b for s, b in zip("甲乙丙丁戊己庚辛壬癸" * 6, "子丑寅卯辰巳午未申酉戌亥" * 5)]
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
SYNONYMS = {"馀事勿取": "余事勿取", "启钻": "启攒", "盖屋": "造屋", "造畜稠": "造畜椆栖", "安碓磑": "安碓硙", "开厕": "作厕"}


def lunar(key):
    d = datetime.date.fromisoformat(key)
    return Solar.fromYmd(d.year, d.month, d.day).getLunar()


def norm(terms):
    return {SYNONYMS.get(t, t) for t in terms} - {"无"}


def cco_shift(l, yi, ji):
    month_start, day_start = CYCLE.index(l.getMonthInGanZhi()), CYCLE.index(l.getDayInGanZhi())
    for month_shift in sorted(range(12), key=lambda m: min(m, 12 - m)):
        month = CYCLE[(month_start + month_shift) % 60]
        for day_shift in range(60):
            day = CYCLE[(day_start + day_shift) % 60]
            if norm(LunarUtil.getDayYi(month, day)) == yi and norm(LunarUtil.getDayJi(month, day)) == ji:
                return month_shift, day_shift
    return None


def rate(c):
    n = c["agree"] + c["disagree"]
    return f"{100 * c['agree'] / n:.1f}%" if n else "—"


def main():
    cco = json.loads((HIST / "chinesecalendaronline-daily.json").read_text())
    officers = json.loads((HIST / "tongshutoday-officers.json").read_text())
    weddings = {k: set(v) for k, v in json.loads((HIST / "wedding-lists.json").read_text()).items()}
    years = defaultdict(lambda: defaultdict(Counter))
    term_miss = Counter()
    term_extra = Counter()
    mismatches = defaultdict(list)
    shifts = defaultdict(Counter)

    for key in sorted(cco):
        c, l, y = cco[key], lunar(key), key[:4]
        s = years[y]
        ours = {"year": l.getYearInGanZhi(), "month": l.getMonthInGanZhi(), "day": l.getDayInGanZhi()}
        for i, part in enumerate(["year", "month", "day"]):
            ok = c["pillars"][i] == ours[part]
            s[f"pillar_{part}"]["agree" if ok else "disagree"] += 1
            if not ok:
                mismatches[f"pillar_{part}"].append([key, c["pillars"][i], ours[part]])
        clash = T2S(c["clash"])
        ok = clash in l.getDayChongDesc()
        s["clash"]["agree" if ok else "disagree"] += 1
        ok = T2S(c["sha"]) == l.getDaySha()
        s["sha"]["agree" if ok else "disagree"] += 1
        if not ok:
            mismatches["sha"].append([key, c["sha"], l.getDaySha()])
        for side, theirs, mine in (("yi", c["yi"], l.getDayYi()), ("ji", c["ji"], l.getDayJi())):
            theirs = {T2S(t) for t in theirs}
            mine = norm(mine)
            s[f"{side}_exact"]["agree" if theirs == mine else "disagree"] += 1
            for t in theirs - mine:
                term_miss[(side, t)] += 1
            for t in mine - theirs:
                term_extra[(side, t)] += 1
        shift = cco_shift(l, {T2S(t) for t in c["yi"]}, {T2S(t) for t in c["ji"]})
        shifts[y]["day", shift and shift[1]] += 1
        shifts[y]["month", shift and ("actual" if shift[0] == 0 else BRANCHES[(BRANCHES.index(l.getMonthZhi()) + shift[0]) % 12])] += 1
        for i, t in enumerate(l.getTimes()[:12]):
            ok = (t.getTianShenLuck() == "吉") == (HOUR_SLOTS[i] in c["good_hours"])
            s["hour_luck"]["agree" if ok else "disagree"] += 1
        mine_wed = "嫁娶" in l.getDayYi() and "嫁娶" not in l.getDayJi()
        cco_wed = "嫁娶" in c["yi"]
        s["wedding_cco"]["agree" if mine_wed == cco_wed else "disagree"] += 1
        for src, dates in weddings.items():
            if dates and any(x[:4] == y for x in dates):
                s[f"wedding_{src}"]["agree" if mine_wed == (key in dates) else "disagree"] += 1
                s[f"wedding_{src}_listed"]["agree" if mine_wed or key not in dates else "disagree"] += 1
        if key in officers:
            tst = T2S(officers[key])
            ok = tst == l.getZhiXing()
            s["officer_tst"]["agree" if ok else "disagree"] += 1
            if not ok:
                mismatches["officer_tst"].append([key, officers[key], l.getZhiXing()])

    metrics = sorted({m for s in years.values() for m in s})
    report = {
        "by_year": {y: {m: dict(s[m]) for m in metrics if m in s} for y, s in sorted(years.items())},
        "terms_cco_has_lunar_python_lacks": [[side, t, n] for (side, t), n in term_miss.most_common(40)],
        "terms_lunar_python_has_cco_lacks": [[side, t, n] for (side, t), n in term_extra.most_common(40)],
        "mismatch_samples": {k: v[:30] for k, v in mismatches.items()},
        "mismatch_counts": {k: len(v) for k, v in mismatches.items()},
        "cco_yiji_shift": {y: {f"{kind} {k}": n for (kind, k), n in v.most_common()} for y, v in sorted(shifts.items())},
    }
    (HIST / "calculation-comparison.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))

    labels = {
        "pillar_year": "Year pillar vs CCO", "pillar_month": "Month pillar vs CCO", "pillar_day": "Day pillar vs CCO",
        "clash": "Clash animal vs CCO", "sha": "歲煞 direction vs CCO", "yi_exact": "宜 list exact vs CCO", "ji_exact": "忌 list exact vs CCO",
        "hour_luck": "Hour 吉/凶 vs CCO", "wedding_cco": "嫁娶 vs CCO", "officer_tst": "建除 officer vs TST",
        "wedding_chinesefortunecalendar": "嫁娶 vs CFC list", "wedding_tongshutoday": "嫁娶 vs TST list", "wedding_baibai": "嫁娶 vs BaiBai list",
        "wedding_chinesefortunecalendar_listed": "CFC dates also 嫁娶 in lunar-python", "wedding_tongshutoday_listed": "TST dates also 嫁娶 in lunar-python",
        "wedding_baibai_listed": "BaiBai dates also 嫁娶 in lunar-python",
    }
    ys = sorted(years)
    lines = [f"# History Comparison {min(years)}-{max(years)}", "", "## Agreement by Year", "", "| Check | " + " | ".join(ys) + " |", "|---|" + "---|" * len(ys)]
    for m in [m for m in labels if m in metrics]:
        lines.append(f"| **{labels[m]}** | " + " | ".join(rate(years[y][m]) if m in years[y] else "—" for y in ys) + " |")
    for kind, label in (("day", "CCO 宜忌 day-pillar shift"), ("month", "CCO 宜忌 month branch")):
        mode = {y: max(((k, n) for (t, k), n in shifts[y].items() if t == kind and k is not None), key=lambda x: x[1]) for y in ys}
        lines.append(f"| **{label}** | " + " | ".join(f"{mode[y][0]} ({100 * mode[y][1] / sum(years[y]['clash'].values()):.0f}%)" for y in ys) + " |")
    lines += ["", "## 宜忌 Terms CCO Lists That lunar-python Omits", "", "| Side | Term | Days |", "|---|---|---|"]
    lines += [f"| {side} | {t} | {n} |" for (side, t), n in term_miss.most_common(20)]
    lines += ["", "## 宜忌 Terms lunar-python Lists That CCO Omits", "", "| Side | Term | Days |", "|---|---|---|"]
    lines += [f"| {side} | {t} | {n} |" for (side, t), n in term_extra.most_common(20)]
    lines += ["", "## Mismatch Counts", "", "| Check | Days | First dates (source, lunar-python) |", "|---|---|---|"]
    for k, v in mismatches.items():
        lines.append(f"| {labels.get(k, k)} | {len(v)} | " + ", ".join(f"{d} ({a}, {b})" for d, a, b in v[:4]) + " |")
    (ROOT.parent / "docs" / "history-comparison.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
