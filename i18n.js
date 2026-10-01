/* 字園 Zìyuán — UI language (en | zh) */
(function () {
  "use strict";

  var KEY = "ziyuan-lang";
  var listeners = [];

  var STR = {
    zh: {
      "doc.title": "字園 Zìyuán — 台灣華語字圃",
      "doc.title.preface": "前言 · 字園 Zìyuán",
      "brand.sub": "ZÌYUÁN / 字圃",
      "nav.garden": "園",
      "nav.nursery": "苗圃",
      "nav.profile": "字檔",
      "nav.water": "澆水",
      "nav.lesson": "課床",
      "nav.preface": "前言",
      "nav.back": "回園",
      "search.ph": "搜 字 / 注音 / 拼音 / English / 台灣",
      "demo.accel": "加速",
      "demo.rate.0.5": "0.5 時/秒",
      "demo.rate.2": "2 時/秒",
      "demo.rate.12": "12 時/秒",
      "demo.rate.72": "3 日/秒",
      "demo.flag.on": "示範鐘 · +{offset}",
      "demo.flag.off": "真實時間",
      "demo.unit.h": "時",
      "demo.unit.d": "日",
      "garden.h1": "園",
      "garden.lead": "每一個字是一株植物。澆水是提取練習，不是重讀。",
      "stat.planted": "已播",
      "stat.due": "待澆",
      "stat.bloom": "盛開",
      "stat.wilt": "萎／枯",
      "btn.waterAll": "澆所有到期",
      "btn.clearGarden": "清空本機園",
      "nursery.h1": "苗圃",
      "nursery.lead": "5 × 1200＝6000 個不重複的字。一圃 市井 已上架 1200 字；二～五圃尚空。",
      "stat.seeds": "可見種子",
      "bed.1": "一圃 市井",
      "bed.2": "二圃",
      "bed.3": "三圃",
      "bed.4": "四圃",
      "bed.5": "五圃",
      "bed.all": "全開",
      "set.adult": "成人 mem",
      "set.pinyin": "顯示拼音",
      "btn.prev": "上一頁",
      "btn.next": "下一頁",
      "lookup.kicker": "字典",
      "lookup.title": "Lookup",
      "set.rich": "Full pot",
      "btn.flip.en": "Flip · English",
      "btn.flip.zh": "Flip · 漢字",
      "btn.speak.f": "女聲",
      "btn.speak.m": "男聲",
      "btn.replay": "重播筆勢",
      "btn.seed": "播進園裡",
      "btn.tray": "加入課床",
      "h2.ledger": "Ledger",
      "h2.dossier": "字檔",
      "h2.words": "台灣詞束",
      "h2.look": "形近",
      "h2.mem": "Mem",
      "h2.notes": "筆記",
      "mem.ph": "發明一則",
      "mem.adult": "成人",
      "btn.addMem": "選用",
      "water.h1": "澆水",
      "water.lead": "只澆到期與枯萎的株。",
      "stat.thirsty": "渴株",
      "lesson.h1": "課床",
      "lesson.lead": "現在只是托盤。",
      "stat.onTray": "床上的字",
      "stage.seed": "種子",
      "stage.sprout": "芽",
      "stage.leaf": "葉",
      "stage.bloom": "盛開",
      "stage.wilt": "萎",
      "stage.dead": "枯",
      "stage.due": "待澆",
      "stage.unplanted": "未播",
      "inGarden": "已在園",
      "empty.garden": "園裡還沒有字。去苗圃播幾顆種子。",
      "empty.nursery": "這一圃還沒有種子。",
      "empty.words": "尚無詞束",
      "empty.mem": "尚無 mem",
      "empty.quiz": "沒有渴株。去園裡看看，或播新種子。",
      "empty.tray": "課床是空的。在字檔按「加入課床」。",
      "lesson.note.empty": "課床只是托盤；之後可做成小課。",
      "lesson.note.full": "雙擊卡片可移出課床。資料存在本機瀏覽器。",
      "tray.title": "點一下打開字檔；長按或雙擊移出",
      "quiz.hint.zy": "注音是？",
      "quiz.hint.en": "意思是？",
      "toast.water.ok": "澆到了 · {stage}",
      "toast.water.miss": "還沒長好 · 再試",
      "toast.seeded": "已播進園裡：{z}",
      "toast.tray.add": "已加入課床：{z}",
      "toast.tray.has": "課床裡已有 {z}",
      "toast.tray.out": "已移出課床",
      "toast.mem": "mem 已選用",
      "toast.noDue": "沒有到期的株",
      "toast.gardenEmpty": "園已是空的",
      "toast.cleared": "本機園已清空",
      "toast.noSpeech": "此瀏覽器沒有語音合成",
      "confirm.clear": "清空本機園？（目錄與 seed mem 不受影響）",
      "chip.strokes": "{n} 畫",
      "chip.plot": "#{i} · 圃{lv}",
      "chip.register": "語域 {n}",
      "chip.pair": "對 {z}",
      "chip.weather": "天氣：{w}",
      "chip.tw": "台灣：{t}",
      "chip.pinyin": "拼音 {py}",
      "chip.twTag": "台灣",
      "chip.cn": "（陸：{cn}）",
      "mem.votes": "{n} 票",
      "mem.custom": "自訂",
      "mem.adultPrefix": "成人 · ",
      "lang.aria": "介面語言",
      "preface.enter": "進入字園",
      "preface.h1": "前言",
      "preface.sub": "台灣華語字圃 · Traditional · 注音優先 · 不是 HSK",
      "preface.seal": "字圃 · 一"
    },
    en: {
      "doc.title": "Zìyuán — Taiwan Mandarin Character Garden",
      "doc.title.preface": "Preface · Zìyuán",
      "brand.sub": "ZÌYUÁN / Character garden",
      "nav.garden": "Garden",
      "nav.nursery": "Nursery",
      "nav.profile": "Dossier",
      "nav.water": "Water",
      "nav.lesson": "Lesson",
      "nav.preface": "Preface",
      "nav.back": "Garden",
      "search.ph": "Search glyph / Zhuyin / pinyin / English / TW",
      "demo.accel": "Fast",
      "demo.rate.0.5": "0.5 h/s",
      "demo.rate.2": "2 h/s",
      "demo.rate.12": "12 h/s",
      "demo.rate.72": "3 d/s",
      "demo.flag.on": "Demo clock · +{offset}",
      "demo.flag.off": "Real time",
      "demo.unit.h": "h",
      "demo.unit.d": "d",
      "garden.h1": "Garden",
      "garden.lead": "Each character is a plant. Watering is retrieval practice, not re-reading.",
      "stat.planted": "Planted",
      "stat.due": "Due",
      "stat.bloom": "Bloom",
      "stat.wilt": "Wilt / dead",
      "btn.waterAll": "Water all due",
      "btn.clearGarden": "Clear local garden",
      "nursery.h1": "Nursery",
      "nursery.lead": "5 × 1200 = 6000 unique characters. Plot one · Street ships 1200; plots 2–5 are still empty.",
      "stat.seeds": "Visible seeds",
      "bed.1": "Plot 1 · Street",
      "bed.2": "Plot 2",
      "bed.3": "Plot 3",
      "bed.4": "Plot 4",
      "bed.5": "Plot 5",
      "bed.all": "All",
      "set.adult": "Adult mem",
      "set.pinyin": "Show pinyin",
      "btn.prev": "Prev",
      "btn.next": "Next",
      "lookup.kicker": "Dictionary",
      "lookup.title": "Lookup",
      "set.rich": "Full pot",
      "btn.flip.en": "Flip · English",
      "btn.flip.zh": "Flip · Character",
      "btn.speak.f": "Female",
      "btn.speak.m": "Male",
      "btn.replay": "Replay strokes",
      "btn.seed": "Plant in garden",
      "btn.tray": "Add to lesson",
      "h2.ledger": "Ledger",
      "h2.dossier": "Dossier",
      "h2.words": "Taiwan word bundle",
      "h2.look": "Look-alikes",
      "h2.mem": "Mem",
      "h2.notes": "Notes",
      "mem.ph": "Invent one",
      "mem.adult": "Adult",
      "btn.addMem": "Adopt",
      "water.h1": "Water",
      "water.lead": "Only water due and wilted plants.",
      "stat.thirsty": "Thirsty",
      "lesson.h1": "Lesson tray",
      "lesson.lead": "Just a tray for now.",
      "stat.onTray": "On tray",
      "stage.seed": "Seed",
      "stage.sprout": "Sprout",
      "stage.leaf": "Leaf",
      "stage.bloom": "Bloom",
      "stage.wilt": "Wilt",
      "stage.dead": "Dead",
      "stage.due": "Due",
      "stage.unplanted": "Unplanted",
      "inGarden": "In garden",
      "empty.garden": "No characters yet. Plant a few seeds from the nursery.",
      "empty.nursery": "No seeds in this plot yet.",
      "empty.words": "No word bundle yet",
      "empty.mem": "No mem yet",
      "empty.quiz": "Nothing thirsty. Check the garden, or plant new seeds.",
      "empty.tray": "Tray is empty. Use “Add to lesson” in the dossier.",
      "lesson.note.empty": "The lesson tray is just a tray; mini-lessons come later.",
      "lesson.note.full": "Double-click a card to remove it. Data stays in this browser.",
      "tray.title": "Click to open dossier; double-click to remove",
      "quiz.hint.zy": "Zhuyin?",
      "quiz.hint.en": "Meaning?",
      "toast.water.ok": "Watered · {stage}",
      "toast.water.miss": "Not yet · try again",
      "toast.seeded": "Planted: {z}",
      "toast.tray.add": "Added to lesson: {z}",
      "toast.tray.has": "Already on tray: {z}",
      "toast.tray.out": "Removed from tray",
      "toast.mem": "Mem adopted",
      "toast.noDue": "Nothing due",
      "toast.gardenEmpty": "Garden already empty",
      "toast.cleared": "Local garden cleared",
      "toast.noSpeech": "No speech synthesis in this browser",
      "confirm.clear": "Clear local garden? (Catalog and seed mems stay.)",
      "chip.strokes": "{n} strokes",
      "chip.plot": "#{i} · plot {lv}",
      "chip.register": "register {n}",
      "chip.pair": "pair {z}",
      "chip.weather": "Weather: {w}",
      "chip.tw": "TW: {t}",
      "chip.pinyin": "Pinyin {py}",
      "chip.twTag": "TW",
      "chip.cn": "(CN: {cn})",
      "mem.votes": "{n} votes",
      "mem.custom": "Custom",
      "mem.adultPrefix": "Adult · ",
      "lang.aria": "UI language",
      "preface.enter": "Enter the garden",
      "preface.h1": "Preface",
      "preface.sub": "Taiwan Mandarin garden · Traditional · Zhuyin first · Not HSK",
      "preface.seal": "Plot · one"
    }
  };

  function getLang() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "en" ? "en" : "zh";
    } catch (e) {
      return "zh";
    }
  }

  function setLang(lang) {
    lang = lang === "en" ? "en" : "zh";
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
    apply();
  }

  function t(key, vars) {
    var lang = getLang();
    var bag = STR[lang] || STR.zh;
    var s = bag[key];
    if (s == null) s = (STR.zh && STR.zh[key]) || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = String(s).split("{" + k + "}").join(String(vars[k]));
      });
    }
    return s;
  }

  function apply() {
    var lang = getLang();
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant-TW";
    document.documentElement.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (k) el.textContent = t(k);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-placeholder");
      if (k) el.setAttribute("placeholder", t(k));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-title");
      if (k) el.setAttribute("title", t(k));
    });
    document.querySelectorAll("[data-lang-only]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang-only") !== lang;
    });

    updateToggle();
    listeners.slice().forEach(function (fn) {
      try {
        fn(lang);
      } catch (e) {
        console.error(e);
      }
    });
  }

  function updateToggle() {
    var root = document.getElementById("lang-toggle");
    if (!root) return;
    var lang = getLang();
    root.setAttribute("aria-label", t("lang.aria"));
    root.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function mountToggle() {
    if (document.getElementById("lang-toggle")) {
      wireToggle();
      return;
    }
    var el = document.createElement("div");
    el.id = "lang-toggle";
    el.className = "lang-toggle";
    el.setAttribute("role", "group");
    el.innerHTML =
      '<button type="button" data-set-lang="en" aria-pressed="false">EN</button>' +
      '<span class="lang-sep" aria-hidden="true">|</span>' +
      '<button type="button" data-set-lang="zh" aria-pressed="true">中文</button>';
    document.body.appendChild(el);
    wireToggle();
  }

  function wireToggle() {
    var root = document.getElementById("lang-toggle");
    if (!root || root._ziyuanLangWired) return;
    root._ziyuanLangWired = true;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-set-lang]");
      if (!btn) return;
      setLang(btn.getAttribute("data-set-lang"));
    });
    updateToggle();
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  window.ZIYUAN_I18N = {
    KEY: KEY,
    getLang: getLang,
    setLang: setLang,
    t: t,
    apply: apply,
    mountToggle: mountToggle,
    onChange: onChange,
  };

  function boot() {
    mountToggle();
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
