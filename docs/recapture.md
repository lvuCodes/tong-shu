# Recapture

## Captured Sources

| Source | URL pattern | Data kept | Stored in |
|---|---|---|---|
| chinesecalendaronline.com | `https://www.chinesecalendaronline.com/zh/{YYYY}/{M}/{D}.htm` | 宜, 忌, 吉時, 兇時, 相沖, 歲煞, 喜神 福神 財神 | [chinesecalendaronline-daily.json](../pipeline/data/sources/chinesecalendaronline-daily.json) |
| tongshutoday.com officers | `https://tongshutoday.com/almanac/{YYYY}/{month}` | 建除 per day | [tongshutoday-officers.json](../pipeline/data/sources/tongshutoday-officers.json) |
| tongshutoday.com weddings | `https://tongshutoday.com/auspicious-days/wedding/{month}-{YYYY}` | qualifying 嫁娶 dates | [wedding-lists.json](../pipeline/data/sources/wedding-lists.json) |
| yourchineseastrology.com | `https://www.yourchineseastrology.com/calendar/auspicious-wedding-date.htm` | 2026 and 2027 嫁娶 dates | [wedding-lists.json](../pipeline/data/sources/wedding-lists.json) |
| chinesefortunecalendar.com | `https://www.chinesefortunecalendar.com/TDB/LuckyEvents.asp?SunYear={YYYY}&SunMonth=+All&TimeZone=CST&Events=Wedding&LuckyDays=V1&B1=Submit` | 嫁娶 dates in US Central time | [wedding-lists.json](../pipeline/data/sources/wedding-lists.json) |
| hongkong.regenthotels.com | saved page, 2026 to 2027 wedding article | 嫁娶 dates | [wedding-lists.json](../pipeline/data/sources/wedding-lists.json) |
| baibai.app | `https://baibai.app/auspicious-dates/wedding/{YYYY}` | 2026 and 2027 嫁娶 dates | [wedding-lists.json](../pipeline/data/sources/wedding-lists.json) |
| 董公選擇日要覽 text | `https://www.wenxuecity.com/blog/201706/67063/12758.html` | 144 month and day-branch verdicts with pillar exceptions | [donggong-table.json](../pipeline/data/sources/donggong-table.json) |
| Chinese Metasoft 64 Hexagrams | saved page in [local/data](../local/data) | stem-branch to hexagram lookup | [chinesemetasoft-hexagrams.json](../pipeline/data/sources/chinesemetasoft-hexagrams.json) |

## Historical Range 2020-2035

| Source | Years available | Stored in |
|---|---|---|
| chinesecalendaronline.com daily | 2020-2035 | [chinesecalendaronline-daily.json](../pipeline/data/sources/history/chinesecalendaronline-daily.json) |
| tongshutoday.com officers | 2026-2028 | [tongshutoday-officers.json](../pipeline/data/sources/history/tongshutoday-officers.json) |
| tongshutoday.com weddings | 2026-2028 | [wedding-lists.json](../pipeline/data/sources/history/wedding-lists.json) |
| chinesefortunecalendar.com weddings | 2020-2035 | [wedding-lists.json](../pipeline/data/sources/history/wedding-lists.json) |
| baibai.app weddings | 2026-2028 | [wedding-lists.json](../pipeline/data/sources/history/wedding-lists.json) |

- Fetch and parse: `cd pipeline && .venv/bin/python fetch-history.py`. Raw pages are cached gzipped in [raw](../pipeline/data/raw), which is not committed, so `--parse-only` re-parses without refetching.
- Compare against lunar-python: `cd pipeline && .venv/bin/python compare-history.py`, which writes [[history-comparison]] and [calculation-comparison.json](../pipeline/data/sources/history/calculation-comparison.json).
- Chinese Metasoft `/TongShu/Date?Date=` redirects to login for every date, including with the Chrome session cookies.
- chinesecalendaronline.com 宜忌 is unreliable in 2021, 2028 and 2032-2035: those years look up 宜忌 with a shifted day pillar, and 2032-2035 also use the 子 month branch all year. Its pillars, clash and 歲煞 stay correct in every year.

## Sources Not Captured for the Range

| Source | URL | Missing data | Status |
|---|---|---|---|
| Chinese Metasoft | `https://www.chinesemetasoft.com/TongShu/Monthly?Type=Professional` | 董公 Dong Gong rating for months after 2026-10 | The free monthly view shows only the current month and ignores Year and Month parameters. 2026-10 is captured in [chinesemetasoft-dong-gong.json](../pipeline/data/sources/chinesemetasoft-dong-gong.json). Each later month can be captured once it becomes the current month. Single dates beyond today ±1 day need the paid Bronze package. |
| Skillon | `https://www.skillon.com/almanac.cfm` | 宜忌 for future dates | Paywalled. Officers and pillars are already covered. |
| mingli.info | `https://www.mingli.info/calendar` | 奇门遁甲 charts | Saved page covered 2026-09 only. |

## Manual Downloads

- 🫵🏼 With a Bronze or higher Chinese Metasoft account logged in to Chrome, the Recommended dates in [[local/wedding-dates|wedding-dates]] can be fetched by URL to add 董公 ratings.
