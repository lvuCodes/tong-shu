# Tong Shu App Specification

## Scope

- Fully dynamic almanac and date-selection app: every value is computed in the browser from user inputs, with no pre-built dataset.
- Replaces the static pipeline (`build.py`, `render-html.py`, scraped JSON) while keeping its rules as the reference implementation.
- Platform: standalone public repository `lvuCodes/tong-shu`, created from `site-template` (Vite, React 19, TypeScript, `@lvucodes/ui`) and deployed to GitHub Pages at `https://lvucodes.github.io/tong-shu/`, themed through the `@lvucodes/ui` theme switcher like the other lvucodes.github.io sites.

## Base

- **App shell:** masthead, tabs (Date selection, Calendar, Sources, Settings), `@lvucodes/ui` theme tokens and theme switcher, project fonts (Atkinson Hyperlegible Next, Hepta Slab, Atkinson Hyperlegible Mono).
- **Calendar engine:** `lunar-javascript` as a pinned npm dependency, the same 6tail rules as `lunar_python`, for pillars, solar terms, 建除, 天神, 宿, 纳音, 神煞, 宜忌 and hour data.
- **Rules module:** JavaScript port of `zeri.py` with identical function names and outputs:
  - `branchRelations`, `tenGod`, `assessPillars`, `assessPerson`, `assessGroup`
  - `hourSafe`, `localWindow`, `trueSolarTime`, `derivePerson`
  - `lunarYearInfo`, `softFlags`, `adjustForFlags`, `tier`, `tierReason`
- **Data contract:** one day record per date, same shape as `data/tong-shu.json` plus `hidden` and `sources` fields.
- **Render pipeline:** day records feed the date-selection tables, the month grid, the day ledger and the zodiac wheel.

## Features

Each feature depends only on the base and touches one state field, one clause at the filter or scoring seam, and one control.

### People and Roles

- 1 to 2 people for couple activities, 1 person for single-person activities.
- Per person: label (free text, default "Partner A" and "Partner B"), birth date, birth time or time range, birth place.
- Per person **spouse-star basis** selector, set independently of the other person:
  - **Officer stars 正官/七杀**: the traditional basis for a woman.
  - **Wealth stars 正财/偏财**: the traditional basis for a man.
  - Default follows the person's stated gender. Same-sex couples choose per person, for example both Officer or both Wealth.
- Role-neutral wording everywhere: "partner", never "bride" or "groom" unless the user sets those labels.
- Bride-specific traditions (往亡 bride departure, 归忌 bride entry) state their traditional target in the tooltip and apply to whichever partner the user marks as **departing household**, an optional per-person toggle.

### Activity Selector

- Dropdown of activity types, each mapped to its almanac terms, hard taboos, flags and person count:

| Activity | Almanac terms | People | Extra hard taboos |
|---|---|---|---|
| Wedding | 嫁娶 | 2 | 三娘煞, 杨公忌, 四离, 四绝, 鬼月, 月厌, 岁破, 月破 |
| Engagement | 订盟, 纳采 | 2 | 月破, 岁破, 鬼月 |
| Moving house | 移徙, 入宅 | 1 or 2 | 月破, 岁破, 归忌 |
| Business opening | 开市, 交易 | 1 | 月破, 岁破 |
| Contract signing | 立券, 交易 | 1 | 月破 |
| Travel | 出行 | 1 | 往亡, 月破 |
| Groundbreaking | 动土, 修造 | 1 | 月破, 土府, 土符 |
| Burial | 安葬, 破土 | 1 | 月破, 重日 |
| Planned birth (scheduled C-section) | none, scored on the child's BaZi | 2 parents plus the child | 月破, clash with either parent |
| Conception prayers | 求嗣 | 2 | 月破 |
| Baby's first haircut (full month) | 理发 | 1 | 月破 |
| Coming of age | 冠笄 | 1 | 月破 |
| Starting school | 入学 | 1 | 月破 |
| Wedding preparation (bridal bed, tailoring) | 安床, 合帐, 裁衣 | 2 | 月破, 岁破 |
| Bride's return visit | 归宁 | 2 | 月破 |
| Taking up a post or new job | 赴任 | 1 | 月破 |
| Hiring or adding to the household | 雇佣, 进人口 | 1 | 月破 |
| Buying property | 置产, 立券 | 1 | 月破 |
| Collecting money or opening stock | 纳财, 开仓, 出货财 | 1 | 月破 |
| Installing machinery | 安机械 | 1 | 月破 |
| Hanging a business sign | 挂匾 | 1 | 月破 |
| Medical treatment or surgery | 求医, 治病, 针灸 | 1 | 月破 |
| Lawsuit filing | 词讼 | 1 | 月破 |
| Installing a stove | 作灶 | 1 | 月破 |
| Installing a door | 安门, 修门 | 1 | 月破 |
| Installing an altar or incense | 安香 | 1 | 月破 |
| Year-end house cleaning | 扫舍 | 1 | 月破 |
| Construction milestones (foundation, pillars, beam raising) | 起基, 定磉, 竖柱, 上梁 | 1 | 月破, 土府, 土符 |
| Demolition | 拆卸, 破屋, 坏垣 | 1 | 月破 |
| Digging a well | 掘井 | 1 | 月破, 土府, 土符 |
| Worship and blessings | 祭祀, 祈福 | 1 | 月破 |
| Consecrating a statue or shrine | 开光, 塑绘 | 1 | 月破 |
| Encoffining and moving the coffin | 入殓, 移柩 | 1 | 月破, 重日 |
| Mourning start and end | 成服, 除服 | 1 | 月破, 重日 |
| Erecting a headstone or repairing a grave | 立碑, 修坟 | 1 | 月破, 重日 |
| Exhumation and reburial | 启攒 | 1 | 月破, 重日 |
| Preparing a grave or coffin in life | 开生坟, 合寿木 | 1 | 月破 |

- Activity mapping lives in one config object, so adding an activity is a data change.
- Planned birth is the one activity not driven by 宜忌. It ranks each candidate date and hour by the child's resulting BaZi (day-master strength and element balance), then removes hours that clash with either parent. Medical constraints on the delivery window come from the user, and the app states that the doctor's schedule takes precedence.
- Every almanac term in the table appears in the `lunar-javascript` 宜忌 vocabulary, after the variant-spelling normalization (启钻 to 启攒).
- Extra hard taboos beyond 月破 are listed only where the tradition names them. Other activities rely on the day's own 忌 list.

### Date Range and Filters

- Range picker: start and end month, any year supported by `lunar-javascript`.
- Cross-check snapshots cover 2020 to 2035. Dates outside that range show computed values only, with the Cross-check panel stating that no snapshot exists.
- Year filter and month filter (multi-select chips), applied to every table and the calendar.
- Weekday filter (weekends only, specific weekdays).
- Tier filter (Recommended, Acceptable, Caution, Excluded).

### Hidden Dates

- Hide control on every date row and day ledger: hides the date from all tables, counts and rankings.
- Hidden list in Settings with unhide per date and **unhide all**.
- Optional rule: hide past dates automatically.
- **Show hidden** toggle renders hidden dates greyed out with an unhide control.

### Language

- Settings toggle with three modes: **Chinese and English** (default), Chinese only, English only.
- Every Chinese term carries an English translation in the dictionary, with pinyin as the fallback.
- Translations come from one dictionary module (port of `translate.py` and `glossary.py`), so the toggle switches presentation only.
- The dictionary maps `lunar-javascript` variant spellings to the standard term before display or comparison: 馀事勿取 to 余事勿取, 启钻 to 启攒, 盖屋 to 造屋, 造畜稠 to 造畜椆栖, 安碓磑 to 安碓硙, 开厕 to 作厕. A 宜 or 忌 list holding only 无 is treated as empty.
- Traditional-character source text is converted to simplified before comparison with engine output.

### Location

- Event location and each birth location take a city search from a bundled city list (name, latitude, longitude, IANA time zone), with manual latitude, longitude and time-zone entry as the fallback.
- Local clock windows for each 时辰 use true solar time (longitude correction, equation of time, daylight saving through `Intl` time-zone data).
- Holiday notes follow the event country: US federal holidays for the US, with a pluggable holiday table per country.

### Sources and Citations

- Sources tab lists every rule family with its citation:
  - Calendar computation: `lunar-javascript` by 6tail, following 协纪辨方书 (Qing imperial almanac manual, 1741).
  - Branch relations (冲, 合, 刑, 害, 破) and ten gods (十神): 三命通会 and 渊海子平.
  - Wedding taboos (三娘煞, 杨公忌, 四离, 四绝, 月厌): 协纪辨方书 and folk almanac practice.
  - Folk flags (红沙日, 月忌日, 孤辰, 寡宿, 红鸾, 天喜, 无春): 通书 folk tradition.
  - Cross-check sources: chinesecalendaronline.com, tongshutoday.com, yourchineseastrology.com, chinesefortunecalendar.com, baibai.app, Regent Hong Kong.
- Every tooltip ends with its citation key, for example "Source: 协纪辨方书".
- Cross-check panel per day shows which external lists agree. These are static JSON snapshots bundled with the site, each with a capture date, since the source sites do not allow cross-origin fetching.
- Snapshot coverage per source:

| Source | Years | Data used |
|---|---|---|
| chinesecalendaronline.com | 2020-2035 | pillars, clash, 歲煞, hour 吉/凶, 宜忌, 嫁娶 |
| chinesefortunecalendar.com | 2020-2035 | 嫁娶 dates, US Central time |
| tongshutoday.com | 2026-2028 | 建除 officer, 嫁娶 dates |
| baibai.app | 2026-2028 | 嫁娶 dates |
| yourchineseastrology.com, Regent Hong Kong | 2026-2027 | 嫁娶 dates |

- **Source reliability by year:** chinesecalendaronline.com looks up 宜忌 with a shifted day pillar in some years. Those years drop its 宜忌 and 嫁娶 vote from the Cross-check panel, the Listed for weddings by count and the rank key, while its pillars, clash, 歲煞 and hour luck stay in use:

| Year | Day-pillar shift | Month branch used |
|---|---|---|
| 2021 | 40 | actual |
| 2028 | 24 | actual |
| 2032 | 33 | 子 all year |
| 2033 | 25 | 子 all year |
| 2034 | 15 | 子 all year |
| 2035 | 1 | 子 all year |

- The reliability table is generated by `compare-history.py`, which finds the month-branch and day-pillar shift that reproduces each snapshot day's 宜忌. A year is unreliable when its most common day shift is not 0. Newly captured years are classified the same way before the app uses them.
- The Cross-check panel marks an excluded source as "unreliable this year" with the detected shift in the tooltip, rather than hiding it.
- The day's 忌 list is the engine's alone. 忌 terms that chinesecalendaronline.com lists beyond the engine's, such as 余事勿取, 诸事不宜, 入宅, 动土 and 嫁娶, appear as a cross-check note in the day ledger and do not change tiers, taboos or scores. In reliable years 2020 to 2035 this affects 296 of 3,652 days.
- Chinese Metasoft per-date 董公 ratings need a paid login and are not captured. The 董公 verdict comes from the 董公选择日要览 table only.

### Carried-Over Features

- Column visibility chips, remembered per browser.
- Tooltip with reasoning on every pill.
- Virtue stars (天德, 月德, 天德合, 月德合) shown as violet pills with a tooltip in the Flags column only but scored in the total rather than as flag points.
- Per-person ratings, overall (lower of the two), total with virtue stars, adjusted score with flags.
- Zodiac wheel showing only bonds from good-rated animals to the people's own animals.
- Lunar-year table with spring count (无春, 单春, 双春), leap month and year-branch relations.
- Hour table per day with local clock window, hour god, luck and people-safe flag.
- Clashing birth years per day.
- Dong Gong 董公选择日要览 verdict per day, with original text and translation in the tooltip, its marriage verdict counted as a flag.
- Hexagram per day pillar with Xuan Kong Da Gua details in the tooltip.

## Page Layout

### Date Selection Tab

Top to bottom:

1. Range heading with one count pill per tier plus a weekend-options pill. Each pill jumps to its table, and its tooltip gives the tier definition.
2. **People:** always visible, never collapsible. Holds the People and Roles inputs, with each person's derived pillars, hour options and day master shown beside them.
3. Collapsible reference sections, closed by default, each keeping its open state across re-renders:
    1. Day animals (zodiac wheel)
    2. Day branch effects
    3. Lunar years
    4. Column guide
4. Column picker, sticky at the top of the viewport.
5. Tier tables: Recommended, Weekend options, Acceptable, Caution, Excluded.
6. Monthly counts.

### Date Tables

- Column order: Date, Day, Lunar date, Day pillar 日柱, Day officer 建除, Day god 天神, one rating column per person, Overall, Clashing birth year, Best hours, Dong Gong, Flags, Adjusted with flags, Listed for weddings by, Notes.
- Excluded table columns: Date, Day, Day pillar, Taboos, one rating column per person, Overall, Flags, Adjusted with flags, Listed for weddings by.
- No rank column. Default row order for Recommended and Acceptable is the rank key: adjusted score, main-almanac listing, source count, Yellow Belt day god, then date. Weekend, Caution and Excluded default to date order.
- Sortable columns:

| Column | Sort value |
|---|---|
| Date | ISO date |
| Day | Monday to Sunday |
| Person rating | person score |
| Overall | total score |
| Dong Gong | manual rating, xx to *** |
| Flags | net flag points |
| Adjusted with flags | adjusted score |
| Listed for weddings by | source count |
| Taboos | taboo count |

- A header click cycles ascending, descending, then default order. The header carries `aria-sort` and an arrow. Sort state is held per table, and ties keep default order.
- Each column definition carries its label, cell renderer, optional sort value and a description. The column guide and column picker render from that one list, so neither can drift from the tables.

### Calendar Tab

- Month buttons show the month name only, grouped under a year label.
- Day ledger, top to bottom: header with tier and rating pills, facts grid, 宜 Suitable and 忌 Avoid chips, then a single-column block:
    - Lucky stars 吉神宜趋 and unlucky stars 凶煞宜忌 as chips with English names
    - Source checklist as chips, listed sources highlighted
    - Taboos
    - Per-person notes as a bulleted list under each person's rating pill
    - Flags, Dong Gong, Hexagram
- Hour table per day.

### Tooltips

- Line breaks are preserved, with a 360px maximum width.
- Structure: a definition line, a blank line, then reasons or a score breakdown as bullets, then any closing note after another blank line.

## Repository

- Location: `~/dev/public/tong-shu`, created on GitHub with "Use this template" from `lvuCodes/site-template`.
- Branch flow: work lands on `dev`, and a pull request from `dev` to `main` promotes it. A merge to `main` triggers the Pages deploy.
- CI: the template's reusable workflow runs `npm run verify` and the iPhone SE Playwright smoke suite on every push and pull request.
- License: GPL-3.0-or-later, as `@lvucodes/ui` requires.
- Vite `base` stays the template's relative `./`, so assets and `public/data/` resolve under the `/tong-shu/` Pages path.
- Privacy: nothing personal is committed. `local/` is gitignored and holds `couple.json`, the personal report build (`build.py`, `render-html.py`, `page-template.html`), its tests (`test_zeri.py`), the generated reports (`months/`, `wedding-dates.md`, `data/tong-shu.json`), saved third-party pages and HAR captures. Tests and examples in committed code use synthetic fixture people.
- Layout:

| Path | Contents | Committed |
|---|---|---|
| `src/` | the site | yes |
| `public/data/` | trimmed snapshot JSON and the reliability manifest | yes |
| `docs/` | this spec, the recapture notes, the history comparison and the glossary | yes |
| `pipeline/` | Python rules reference (`zeri.py`, `glossary.py`, `translate.py`), fetch, parse, compare and export scripts, source JSON, `tests/test_history.py`, `requirements.txt` | yes |
| `pipeline/data/raw/`, `pipeline/.venv/` | gzipped page cache, Python environment | no |
| `local/` | personal data and personal reports | no |

- Data pipeline: `pipeline/export-site-data.py` writes trimmed snapshot JSON (one file per source, holding only the fields the app reads) plus the source reliability table into `public/data/`, and the lunar-python parity fixture into `src/engine/fixtures/`. The site loads a year's snapshot on demand.
- Reference rules: `pipeline/zeri.py` is the reference implementation for the TypeScript port. `local/build.py` imports it from `pipeline/` to build the personal reports.

## State and Persistence

- All inputs, settings, hidden dates and column choices are stored in `localStorage` under one versioned key, wrapped in try/catch.
- An export and import of the settings JSON in Settings, for moving between browsers.
- Table sort state and open reference sections last for the page session only.

## Testing

- Port `tests/test_zeri.py` to TypeScript and run it with Vitest through `npm test`. These tests pin the derived pillars of synthetic fixture people, the relation tables, taboos, flags, flag adjustment and the widow-year cases.
- Parity test: for every date from 2026-10-01 to 2027-12-31, the TypeScript engine output matches the lunar-python fixture in `src/engine/fixtures/` (officer, pillars, 宜忌, 神煞). Tier and score parity is added once the rules module is ported.
- History parity test over 2020 to 2035 against the chinesecalendaronline.com snapshot:
    - Year, month and day pillars, clash animal and 歲煞 match on every day, except the month pillar on 2020-12-06, which is a known site error.
    - In reliable years, 宜 lists match exactly on at least 97% of days and hour 吉/凶 on at least 98.5% of hours.
    - Shift detection returns the table above for every year, and returns no shift for an engine-generated day.
- Term normalization cases: every variant spelling in the dictionary maps to its standard form, and 无 yields an empty list.
- Same-sex couple cases: both Officer basis and both Wealth basis produce the expected spouse-star notes.
- Location cases: Houston in standard and daylight time, plus a location east of UTC.
- Language toggle cases: no Chinese-only string is missing a translation in the dictionary.
- Tooltip cases: every pill has a non-empty tooltip, and no tooltip shares a two-word phrase with the caption or label shown beside its pill, checked across every rendered pill.
- Sort cases: each sortable column orders rows correctly in both directions, and a third click restores the default order.
- Layout cases: every count pill's jump target exists, and the column guide lists every column definition.

## Open Decisions

- **City list size: about 1,000 major cities bundled (recommended)**, or manual coordinates only.

## Planned Work

- **Layout revamp:** redesign of the Date selection and Calendar tabs, including placement of the People panel, range picker and tier tables.
- **Auto calculations:**
    - Birth and event latitude, longitude and time zone filled from the place name through the bundled city list, with manual entry kept as the override.
    - Spouse-star basis derived from each person's stated gender, still adjustable per person.
- **Info pages:** reference pages explaining the almanac terms, rating method, taboos, flags and sources in more depth than the tooltips and column guide.
