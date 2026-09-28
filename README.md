# 字園 Zìyuán

Taiwan Mandarin character garden. Traditional only. Zhuyin first. Not HSK.

Live: https://julianlee314-hue.github.io/ziyuan/

## Files

- `index.html` — garden shell (園 / 苗圃 / 字檔 / 澆水 / 課床)
- `styles.css` — ink / paper UI
- `app.js` — search, lookup, local SRS garden, quiz watering, lesson tray
- `i18n.js` — EN ↔ 中文 UI chrome (localStorage `ziyuan-lang`: `en` | `zh`)
- `catalog.js` — Pages seed (10 市井 characters); schema ready for full plot
- `first-plot.html` — public note

Plot one (1,200) ships with a frozen ledger (job, habitat, color, register, hook). Garden SRS / mems stay in the browser (`localStorage`, `ziyuan-` keys).

UI language defaults to Traditional Chinese (`zh`); bottom-right toggle switches chrome to English and persists the choice.

Enable Pages if the URL 404s: Settings → Pages → Deploy from branch `main` / root. Workflow `.github/workflows/pages.yml` deploys on each push to main.
