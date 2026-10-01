# 字園 Zìyuán

Taiwan Mandarin character garden. Traditional only. Zhuyin first. Not HSK.

Live: https://julianlee314-hue.github.io/ziyuan/

## Plot one · 一圃 市井

`catalog.js` ships **1,200** unique Traditional Chinese singles (lv=1), frequency-ordered for Taiwan-relevant “street” coverage, with exhaustive Zhuyin (破音 included). Levels 2–5 are empty for later plots. No per-character HTML pages yet.

## Data sources & license

| Source | Used for | License |
| --- | --- | --- |
| [CNS11643 全字庫](https://www.cns11643.gov.tw/) Properties (注音、筆畫) + Unicode maps | Zhuyin readings, strokes | [政府資料開放授權條款第1版 (OGDL-Taiwan-1.0)](https://data.gov.tw/license) — 數位發展部，CNS11643 |
| MOE 《字頻總表》 BIAU1 (via [leonsilicon/biau1](https://github.com/leonsilicon/biau1)) | Frequency rank / 市井 ordering | Taiwan MOE frequency table (redistributed JSON packaging) |
| 《國語一字多音審訂表》 reading order (via [ButTaiwan/bpmfvs](https://github.com/ButTaiwan/bpmfvs) `phonic_table_Z.txt`) | Preferred primary + ordered multi-readings | Derived from MOE 審訂表; project code Apache-2.0 |
| [Unicode Unihan](https://www.unicode.org/charts/unihan.html) `kDefinition` | Short English glosses | [Unicode License](https://www.unicode.org/license.txt) |

Attribution: 數位發展部 CNS11643 全字庫；教育部字頻／一字多音資料；Unicode Consortium Unihan.

## Files

- `index.html` — garden shell (園 / 苗圃 / 字檔 / 澆水 / 課床)
- `styles.css` — ink / paper UI
- `app.js` — search, lookup, local SRS garden, quiz watering, lesson tray
- `i18n.js` — EN ↔ 中文 UI chrome (localStorage `ziyuan-lang`: `en` | `zh`)
- `catalog.js` — plot-one catalog (1200 市井 characters)
- `first-plot.html` — public note

Garden SRS / mems stay in the browser (`localStorage`, `ziyuan-` keys). Planted seed glyphs keep working after the catalog expansion.

UI language defaults to Traditional Chinese (`zh`); bottom-right toggle switches chrome to English and persists the choice.

Enable Pages if the URL 404s: Settings → Pages → Deploy from branch `main` / root. Workflow `.github/workflows/pages.yml` deploys on each push to main.
