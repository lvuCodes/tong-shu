import datetime
import math
from zoneinfo import ZoneInfo

from lunar_python import Lunar, LunarYear, Solar

STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
STEM_ELEMENTS = {"甲": "Yang Wood", "乙": "Yin Wood", "丙": "Yang Fire", "丁": "Yin Fire", "戊": "Yang Earth", "己": "Yin Earth", "庚": "Yang Metal", "辛": "Yin Metal", "壬": "Yang Water", "癸": "Yin Water"}
LIU_HE = {frozenset(p) for p in ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"]}
HAI = {frozenset(p) for p in ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"]}
PO = {frozenset(p) for p in ["子酉", "卯午", "辰丑", "未戌", "寅亥", "巳申"]}
XING = {("寅", "巳"), ("巳", "申"), ("申", "寅"), ("丑", "戌"), ("戌", "未"), ("未", "丑"), ("子", "卯"), ("卯", "子")}
SELF_XING = set("辰午酉亥")
SAN_HE = ["申子辰", "亥卯未", "寅午戌", "巳酉丑"]
STEM_CLASH = {frozenset(p) for p in ["甲庚", "乙辛", "丙壬", "丁癸"]}
STEM_HE = {frozenset(p) for p in ["甲己", "乙庚", "丙辛", "丁壬", "戊癸"]}

SAN_NIANG = {3, 7, 13, 18, 22, 27}
YANG_GONG = {(1, 13), (2, 11), (3, 9), (4, 7), (5, 5), (6, 3), (7, 1), (7, 29), (8, 27), (9, 25), (10, 23), (11, 21), (12, 19)}
SI_LI_TERMS = {"春分", "夏至", "秋分", "冬至"}
SI_JUE_TERMS = {"立春", "立夏", "立秋", "立冬"}
HARD_STARS = {"月厌"}
MITIGATING_STARS = {"天德", "月德"}

SPRING_LABELS = {0: ("无春", "Widow year, no 立春"), 1: ("单春", "Single spring, one 立春"), 2: ("双春", "Double spring, two 立春")}

STEM_ELEMENT = dict(zip(STEMS, "木木火火土土金金水水"))
GENERATES = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
CONTROLS = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}
SPOUSE_STARS = {"F": {"正官", "七杀"}, "M": {"正财", "偏财"}}
SPOUSE_LABEL = {"F": "husband star", "M": "wife star"}
RIVAL_STARS = {"比肩", "劫财"}
VIRTUE_STARS = {"天德", "月德", "天德合", "月德合"}

VERDICT_ORDER = ["Avoid", "Caution", "Neutral", "Good", "Excellent"]
CORE_PILLARS = ("year", "day")
HOUR_BAD_RELATIONS = {"冲", "刑", "自刑", "害"}


def ten_god(day_master, stem):
    same = STEMS.index(day_master) % 2 == STEMS.index(stem) % 2
    a, b = STEM_ELEMENT[day_master], STEM_ELEMENT[stem]
    if a == b:
        return "比肩" if same else "劫财"
    if GENERATES[a] == b:
        return "食神" if same else "伤官"
    if CONTROLS[a] == b:
        return "偏财" if same else "正财"
    if CONTROLS[b] == a:
        return "七杀" if same else "正官"
    return "偏印" if same else "正印"


def is_clash(a, b):
    return (BRANCHES.index(a) - BRANCHES.index(b)) % 12 == 6


def clash_branch(b):
    return BRANCHES[(BRANCHES.index(b) + 6) % 12]


def branch_relations(day_branch, natal_branch):
    pair = frozenset((day_branch, natal_branch))
    rel = []
    if is_clash(day_branch, natal_branch):
        rel.append("冲")
    if pair in LIU_HE:
        rel.append("六合")
    if day_branch != natal_branch and any(day_branch in f and natal_branch in f for f in SAN_HE):
        rel.append("三合")
    if pair in HAI:
        rel.append("害")
    if (day_branch, natal_branch) in XING or (natal_branch, day_branch) in XING:
        rel.append("刑")
    if day_branch == natal_branch and day_branch in SELF_XING:
        rel.append("自刑")
    if pair in PO and "六合" not in rel:
        rel.append("破")
    return rel


def verdict_for(fatal, major, score):
    if fatal or major >= 2:
        return "Avoid"
    if major == 1:
        return "Caution"
    if score >= 4:
        return "Excellent"
    if score >= 1:
        return "Good"
    return "Neutral"


def assess_pillars(day_gz, pillars, mitigated_stem, sex=None):
    db, ds = day_gz[1], day_gz[0]
    fatal, major, minor, plus, notes = 0, 0, 0, 0, []
    for pos, gz in pillars.items():
        core = pos in CORE_PILLARS
        for r in branch_relations(db, gz[1]):
            notes.append(f"{r} {pos} {gz[1]}")
            if r == "冲":
                fatal += core
                major += not core
            elif r in ("刑", "自刑", "害"):
                major += core
                minor += not core
            elif r == "破":
                minor += 1
            elif r == "六合":
                plus += 2 if core else 1
            elif r == "三合":
                plus += 1
    dm = pillars["day"][0]
    if frozenset((ds, dm)) in STEM_CLASH:
        notes.append(f"stem 冲 day master {dm}")
        minor += mitigated_stem
        major += not mitigated_stem
    if frozenset((ds, dm)) in STEM_HE:
        notes.append(f"stem 合 day master {dm}")
        plus += 1
    god = ten_god(dm, ds)
    if sex in SPOUSE_STARS and god in SPOUSE_STARS[sex]:
        notes.append(f"stem {god} {SPOUSE_LABEL[sex]}")
        plus += 1
    if god in RIVAL_STARS:
        notes.append(f"stem {god} rival star")
        minor += 1
    score = plus - 3 * major - minor
    return {"verdict": verdict_for(fatal, major, score), "score": score, "fatal": fatal, "major": major, "minor": minor, "positive": plus, "notes": notes}


def worst(*verdicts):
    return min(verdicts, key=VERDICT_ORDER.index)


def assess_person(day_gz, person, mitigated_stem):
    by_hour = {h: assess_pillars(day_gz, {**person["pillars"], "hour": h}, mitigated_stem, person.get("sex")) for h in person["hour_options"]}
    low = min(by_hour.values(), key=lambda a: (VERDICT_ORDER.index(a["verdict"]), a["score"]))
    return {**low, "by_hour": by_hour, "hour_sensitive": len({a["verdict"] for a in by_hour.values()}) > 1}


def assess_couple(day_gz, people, mitigated_stem, day_stars=()):
    persons = {k: assess_person(day_gz, p, mitigated_stem) for k, p in people.items()}
    virtues = sorted(VIRTUE_STARS & set(day_stars))
    return {
        "verdict": worst(*(a["verdict"] for a in persons.values())),
        "score": sum(a["score"] for a in persons.values()) + len(virtues),
        "virtue_stars": virtues,
        "hour_sensitive": any(a["hour_sensitive"] for a in persons.values()),
        "persons": persons,
    }


def hour_safe(hour_branch, people):
    core = {p["pillars"][pos][1] for p in people.values() for pos in CORE_PILLARS}
    return not any(HOUR_BAD_RELATIONS & set(branch_relations(hour_branch, b)) for b in core)


def equation_of_time(d):
    b = 2 * math.pi * (d.timetuple().tm_yday - 81) / 364
    return 9.87 * math.sin(2 * b) - 7.53 * math.cos(b) - 1.5 * math.sin(b)


def clock_offset_minutes(d, tz, lon):
    offset = datetime.datetime(d.year, d.month, d.day, 12, tzinfo=ZoneInfo(tz)).utcoffset().total_seconds() / 60
    return -lon * 4 + offset - equation_of_time(d)


def local_window(d, solar_start_hour, tz, lon):
    start = (solar_start_hour * 60 + clock_offset_minutes(d, tz, lon)) % 1440
    end = (start + 120) % 1440
    fmt = lambda m: f"{int(m // 60):02d}:{int(m % 60):02d}"
    return f"{fmt(start)}-{fmt(end)}"


def true_solar_time(local_dt, tz, lon):
    return local_dt - datetime.timedelta(minutes=clock_offset_minutes(local_dt.date(), tz, lon))


def eight_char(solar_dt):
    ec = Solar.fromYmdHms(solar_dt.year, solar_dt.month, solar_dt.day, solar_dt.hour, solar_dt.minute, 0).getLunar().getEightChar()
    return {"year": ec.getYear(), "month": ec.getMonth(), "day": ec.getDay(), "hour": ec.getTime()}


def derive_person(birth):
    day = datetime.date.fromisoformat(birth["date"])
    window = birth.get("time_range") or [birth["time"], birth["time"]]
    start, end = (datetime.datetime.combine(day, datetime.time.fromisoformat(t)) for t in window)
    charts, t = [], start
    while t <= end:
        charts.append(eight_char(true_solar_time(t, birth["tz"], birth["lon"])))
        t += datetime.timedelta(minutes=1)
    base = {k: charts[0][k] for k in ("year", "month", "day")}
    if any({k: c[k] for k in base} != base for c in charts):
        raise ValueError(f"birth window {window} spans a day or month boundary")
    return {"label": birth["label"], "sex": birth.get("sex"), "pillars": base, "hour_options": list(dict.fromkeys(c["hour"] for c in charts))}


def wedding_taboos(lunar, next_lunar):
    day_gz, year_gz = lunar.getDayInGanZhi(), lunar.getYearInGanZhiByLiChun()
    checks = [
        (lunar.getZhiXing() == "破", "月破 Month Breaker"),
        (is_clash(day_gz[1], year_gz[1]), "岁破 Year Breaker"),
        (lunar.getDay() in SAN_NIANG, "三娘煞 Three Maidens"),
        ((abs(lunar.getMonth()), lunar.getDay()) in YANG_GONG, "杨公忌 Yang Gong Taboo"),
        (next_lunar.getJieQi() in SI_LI_TERMS, "四离 Four Separations"),
        (next_lunar.getJieQi() in SI_JUE_TERMS, "四绝 Four Extinctions"),
        (lunar.getMonth() == 7, "鬼月 Ghost Month"),
    ]
    return [label for hit, label in checks if hit] + [f"{s} star" for s in lunar.getDayXiongSha() if s in HARD_STARS]


def wedding_tier(sources, taboos, verdict):
    if not any(sources.values()):
        return None
    if taboos or verdict == "Avoid":
        return "Excluded"
    if verdict == "Caution":
        return "Caution"
    if sources.get("lunar_python") and verdict in ("Good", "Excellent"):
        return "Recommended"
    return "Acceptable"


def lunar_year_info(year):
    start = datetime.date.fromisoformat(Lunar.fromYmd(year, 1, 1).getSolar().toYmd())
    end = datetime.date.fromisoformat(Lunar.fromYmd(year + 1, 1, 1).getSolar().toYmd()) - datetime.timedelta(1)
    li_chun, d = [], start
    while d <= end:
        if Solar.fromYmd(d.year, d.month, d.day).getLunar().getJieQi() == "立春":
            li_chun.append(d.isoformat())
        d += datetime.timedelta(1)
    spring, spring_en = SPRING_LABELS[len(li_chun)]
    leap = LunarYear.fromYear(year).getLeapMonth()
    return {
        "lunar_year": year, "ganzhi": Lunar.fromYmd(year, 1, 1).getYearInGanZhi(), "start": start.isoformat(), "end": end.isoformat(),
        "li_chun": li_chun, "spring": spring, "spring_en": spring_en, "widow": not li_chun, "leap_month": leap or None,
    }


SOFT_CAUTION_STARS = {"四废": "Four Wastes", "五离": "Five Separations", "往亡": "Going to Ruin", "归忌": "Return Taboo", "天狗": "Heavenly Dog", "阴错": "Yin Error", "阳错": "Yang Error", "厌对": "Opposed Loathing", "天罡": "Heavenly Ladle", "河魁": "River Chief"}
SOFT_POSITIVE_STARS = {"不将": "No Generals, a classic wedding", "天喜": "Heavenly Joy", "天赦": "Heavenly Pardon"}
MONTH_TABOO_DAYS = {5, 14, 23}
RED_SAND = {**dict.fromkeys("寅申巳亥", "酉"), **dict.fromkeys("子午卯酉", "巳"), **dict.fromkeys("辰戌丑未", "丑")}
GU_GUA = {**dict.fromkeys("寅卯辰", ("巳", "丑")), **dict.fromkeys("巳午未", ("申", "辰")), **dict.fromkeys("申酉戌", ("亥", "未")), **dict.fromkeys("亥子丑", ("寅", "戌"))}


FLAG_TIPS = {
    "无春": "Folk belief calls it a blind year and says a marriage begun in it lacks vitality. Many families ignore it.",
    "双春": "The lunar year holds two 立春 dates. Folk belief treats it as lucky for marriage.",
    "闰月": "An extra month inserted to keep the lunar calendar aligned with the seasons. Some families avoid weddings in it.",
    "红沙日": "Falls on 酉 days in the first month of each season, 巳 days in the second and 丑 days in the third. Avoided for weddings and moving.",
    "月忌日": "A folk saying holds these three days of every lunar month unlucky for starting important affairs.",
    "彭祖忌嫁娶": "A traditional verse of daily prohibitions. On 亥 days it reads 亥不嫁娶不利新郎, meaning a wedding is unlucky for the groom.",
    "清明": "A day set aside for honoring the dead. Families avoid celebrations on it.",
    "四废": "The day's stem and branch are at their weakest for the season. Almanacs advise against starting anything.",
    "五离": "Associated with partings. Avoided for weddings and contracts.",
    "往亡": "Avoid setting out, including the bride leaving her family home.",
    "归忌": "Avoid returning home, including bringing the bride into the new home.",
    "天狗": "Folk belief says it harms newlyweds and children.",
    "阴错": "A day of mismatched yin and yang. Traditionally unlucky for weddings.",
    "阳错": "A day of mismatched yin and yang. Traditionally unlucky for weddings.",
    "厌对": "Falls opposite the Monthly Loathing day (月厌). Older almanacs treat it as a wedding taboo.",
    "天罡": "A harsh star that older wedding manuals avoid.",
    "河魁": "A harsh star that older wedding manuals avoid.",
    "不将": "Marks days free of the obstructing generals. Long favored for marriage.",
    "天喜": "A star of celebrations and happy events.",
    "天赦": "One of the most auspicious stars. Said to forgive faults and clear obstacles.",
    "孤辰日": "Computed from the birth-year animal. Folk belief links it to loneliness in marriage.",
    "寡宿日": "Computed from the birth-year animal. Folk belief links it to separation in marriage.",
    "红鸾日": "The romance star of the birth-year animal. A good sign for a wedding.",
    "天喜日": "Falls opposite the Red Phoenix of the birth-year animal. A good sign for a wedding.",
    "董公宜婚": "The classical date-selection manual 董公选择日要览 names marriage as suitable for this month and day pillar.",
    "董公忌婚": "The classical date-selection manual 董公选择日要览 warns against marriage for this month and day pillar.",
    "本命年": "Folk belief calls the year of one's own animal turbulent. Some avoid marrying in it.",
}

TABOO_TIPS = {
    "月破": "The day's branch clashes the month's branch. Almanacs rule it out for every major event.",
    "岁破": "The day's branch clashes the year's branch. Ruled out for weddings.",
    "三娘煞": "Falls on the lunar 3rd, 7th, 13th, 18th, 22nd and 27th. Legend says weddings on these days fail.",
    "杨公忌": "Thirteen fixed lunar dates said to bring misfortune to any undertaking.",
    "四离": "The day before an equinox or solstice. Avoided for weddings.",
    "四绝": "The day before the start of a season. Avoided for weddings.",
    "鬼月": "The 7th lunar month, when spirits are believed to roam. Weddings are avoided.",
    "月厌": "A classic wedding taboo that can override good stars.",
}


def hong_luan(year_branch):
    return BRANCHES[(3 - BRANCHES.index(year_branch)) % 12]


def flag(kind, zh, en, tip_key=None):
    return {"kind": kind, "zh": zh, "en": en, "tip": FLAG_TIPS.get(tip_key or zh, "")}


def soft_flags(lunar, date, people, year):
    day_branch, month_branch, year_branch = lunar.getDayZhi(), lunar.getMonthInGanZhi()[1], lunar.getYearInGanZhiByLiChun()[1]
    out = []
    if year["widow"]:
        out.append(flag("caution", "无春", "Widow year, no Start of Spring in the lunar year"))
    if len(year["li_chun"]) == 2:
        out.append(flag("positive", "双春", "Double spring year"))
    if lunar.getMonth() < 0:
        out.append(flag("caution", "闰月", "Leap lunar month"))
    if RED_SAND[month_branch] == day_branch:
        out.append(flag("caution", "红沙日", "Red Sand day, folk wedding taboo"))
    if lunar.getDay() in MONTH_TABOO_DAYS:
        out.append(flag("caution", "月忌日", "Monthly taboo day, lunar 5th, 14th or 23rd"))
    if "嫁娶" in lunar.getPengZuZhi() or "嫁娶" in lunar.getPengZuGan():
        out.append(flag("caution", "彭祖忌嫁娶", "Peng Zu taboo names weddings on this day"))
    if lunar.getJieQi() == "清明":
        out.append(flag("caution", "清明", "Tomb Sweeping Day"))
    for star in lunar.getDayXiongSha():
        if star in SOFT_CAUTION_STARS:
            out.append(flag("caution", star, f"{SOFT_CAUTION_STARS[star]} star"))
    for star in lunar.getDayJiShen():
        if star in SOFT_POSITIVE_STARS:
            out.append(flag("positive", star, f"{SOFT_POSITIVE_STARS[star]} star"))
    personal = {}
    for p in people.values():
        yb = p["pillars"]["year"][1]
        gu, gua = GU_GUA[yb]
        checks = [
            (day_branch == gu, "caution", "孤辰", "Lonely Star day"), (day_branch == gua, "caution", "寡宿", "Widow Star day"),
            (day_branch == hong_luan(yb), "positive", "红鸾", "Red Phoenix romance day"), (day_branch == clash_branch(hong_luan(yb)), "positive", "天喜", "Heavenly Joy day"),
            (year_branch == yb, "caution", "本命年", "Zodiac birth year"),
        ]
        for hit, kind, zh, en in checks:
            if hit:
                personal.setdefault((kind, zh, en), []).append(p["label"].lower())
    for (kind, zh, en), who in personal.items():
        out.append(flag(kind, zh, f"{en} for the {' and '.join(who)}", zh if zh == "本命年" else f"{zh}日"))
    seen, unique = set(), []
    for f in out:
        if (f["zh"], f["en"]) not in seen:
            seen.add((f["zh"], f["en"]))
            unique.append(f)
    return unique


def taboo_tip(label):
    return next((tip for key, tip in TABOO_TIPS.items() if label.startswith(key)), "")


VIRTUE_TIP = "Virtue stars 天德 Heavenly Virtue, 月德 Monthly Virtue, 天德合 and 月德合 are protective stars placed by the month branch. The almanac says they dissolve harm, so each one adds +1."


def flag_points(f):
    return 1 if f["kind"] == "positive" else -1


def adjust_for_flags(couple, flags):
    net = sum(flag_points(f) for f in flags)
    base = VERDICT_ORDER.index(couple["verdict"])
    steps = int(net / 2)
    if steps < 0 and base > VERDICT_ORDER.index("Caution"):
        idx = max(base + steps, VERDICT_ORDER.index("Caution"))
    elif steps > 0 and base >= VERDICT_ORDER.index("Neutral"):
        idx = min(base + steps, len(VERDICT_ORDER) - 1)
    else:
        idx = base
    return {"flag_points": net, "adjusted_score": couple["score"] + net, "adjusted_verdict": VERDICT_ORDER[idx]}


def tier_reason(tier, sources, taboos, verdict):
    if tier is None:
        return "No source lists this day for weddings."
    if tier == "Excluded":
        return f"Excluded by {', '.join(taboos)}." if taboos else "Excluded because a chart clash rates the couple Avoid."
    if tier == "Caution":
        return f"Listed for weddings, but the adjusted overall rating is {verdict}, so one partner has a serious chart conflict or the flags weigh it down."
    if tier == "Recommended":
        return f"lunar-python lists 嫁娶, no hard taboos apply, and the adjusted overall rating is {verdict}."
    reason = "lunar-python does not list 嫁娶" if not sources.get("lunar_python") else f"the adjusted overall rating is only {verdict}"
    return f"Listed by at least one source with no hard taboos, but {reason}."


DONG_GONG_SYMBOLS = {2: "***", 1: "**", 0: "*", -1: "x", -2: "xx"}
DONG_GONG_WORDS = {2: "Very good", 1: "Good", 0: "Fair", -1: "Bad", -2: "Very bad"}


def dong_gong_lookup(table, month_branch, day_gz):
    entry = next(r for r in table if r["month_branch"] == month_branch and r["branch"] == day_gz[1])
    special = next((e for e in entry["exceptions"] if e["pillar"] == day_gz), None)
    rating = (special or entry)["rating"]
    return {
        "rating": rating, "symbol": DONG_GONG_SYMBOLS[rating], "label": DONG_GONG_WORDS[rating],
        "marriage": (special or entry)["marriage"], "pillar_specific": special is not None,
        "officer": entry["officer"], "summary_en": entry["summary_en"], "text": entry["text"],
    }


def dong_gong_flags(dg):
    if dg["marriage"] == "good":
        return [flag("positive", "董公宜婚", "Dong Gong favors weddings")]
    if dg["marriage"] == "bad":
        return [flag("caution", "董公忌婚", "Dong Gong advises against weddings")]
    return []
