/* 字園 Zìyuán — garden app */
(function () {
  "use strict";

  const Z = window.ZIYUAN;
  if (!Z || !Array.isArray(Z.chars)) {
    console.error("字園: catalog.js missing or invalid");
    return;
  }

  const LS = {
    garden: "ziyuan-garden",
    tray: "ziyuan-tray",
    settings: "ziyuan-settings",
  };

  function t(key, vars) {
    const I = window.ZIYUAN_I18N;
    return I && I.t ? I.t(key, vars) : key;
  }

  const STAGES = ["seed", "sprout", "leaf", "bloom"];
  function stageLabel(stage) {
    return t("stage." + stage);
  }
  // Hours until next watering after a successful water at this stage
  const INTERVAL_H = { seed: 6, sprout: 24, leaf: 72, bloom: 168 };
  const WILT_AFTER_H = 48; // overdue → wilt
  const DEAD_AFTER_H = 120; // wilt overdue → dead
  const PAGE_SIZE = 12;

  const charByZ = new Map(Z.chars.map((c) => [c.z, c]));

  // ——— time / demo clock ———
  let virtualOffsetMs = 0;
  let demoTimer = null;

  function now() {
    return Date.now() + virtualOffsetMs;
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /** @type {Record<string, {stage:string, lastWatered:number, nextDue:number, notes:string, mems:Array}>} */
  let garden = loadJSON(LS.garden, {});
  /** @type {string[]} */
  let tray = loadJSON(LS.tray, []);
  let settings = loadJSON(LS.settings, {
    adult: false,
    pinyin: false,
    rich: false,
    demoOn: true,
    demoRate: 2,
  });

  let currentView = "nursery";
  let nurseryLv = 1;
  let nurseryPage = 1;
  let selectedZ = Z.chars[0] ? Z.chars[0].z : null;
  let searchQ = "";
  let flipped = false;
  let quizAnswered = false;

  // ——— DOM ———
  const $ = (id) => document.getElementById(id);
  const toastEl = $("toast");
  let toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function effectiveStage(plant) {
    if (!plant) return null;
    const t = now();
    if (plant.stage === "dead") return "dead";
    if (t > plant.nextDue + DEAD_AFTER_H * 3600e3) return "dead";
    if (t > plant.nextDue + WILT_AFTER_H * 3600e3) return "wilt";
    if (t > plant.nextDue) {
      // overdue but not yet wilt threshold — still show as wilt-ish for due
      return plant.stage === "bloom" || plant.stage === "leaf" ? plant.stage : plant.stage;
    }
    return plant.stage;
  }

  function isDue(plant) {
    if (!plant || plant.stage === "dead") return false;
    return now() >= plant.nextDue;
  }

  function isWilted(plant) {
    const s = effectiveStage(plant);
    return s === "wilt" || s === "dead";
  }

  function plantStats() {
    const keys = Object.keys(garden);
    let due = 0, bloom = 0, wilt = 0;
    for (const z of keys) {
      const p = garden[z];
      const s = effectiveStage(p);
      if (s === "bloom" && !isDue(p)) bloom++;
      if (s === "wilt" || s === "dead") wilt++;
      if (isDue(p) || s === "wilt") due++;
    }
    return { planted: keys.length, due, bloom, wilt };
  }

  function ensurePlant(z) {
    if (!garden[z]) {
      const t = now();
      garden[z] = {
        stage: "seed",
        lastWatered: t,
        nextDue: t + INTERVAL_H.seed * 3600e3,
        notes: "",
        mems: [],
      };
    }
    return garden[z];
  }

  function persistGarden() {
    saveJSON(LS.garden, garden);
  }

  function persistTray() {
    saveJSON(LS.tray, tray);
  }

  function persistSettings() {
    saveJSON(LS.settings, settings);
  }

  // ——— search ———
  function matchesQuery(c, q) {
    if (!q) return true;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const bag = [
      c.z,
      c.zy,
      c.py,
      c.en,
      c.tw || "",
      ...(c.rd || []).flatMap((r) => [r.zy, r.py, r.tag]),
      ...(c.w || []).flatMap((w) => [w.w, w.zy, w.en, w.cn || "", w.tw ? "台灣" : ""]),
      ...(c.lk || []),
      ...(c.tag || []),
      c.stone?.hook || "",
      c.stone?.job || "",
      ...(c.stone?.habitat || []),
    ]
      .join(" ")
      .toLowerCase();
    return bag.includes(s) || c.z.includes(q.trim()) || (c.zy && c.zy.includes(q.trim()));
  }

  function filteredChars() {
    return Z.chars.filter((c) => matchesQuery(c, searchQ));
  }

  // ——— views ———
  function setView(name) {
    currentView = name;
    document.querySelectorAll(".nav [data-view]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === name);
    });
    document.querySelectorAll("main .view").forEach((sec) => {
      sec.classList.toggle("on", sec.getAttribute("data-view") === name);
    });
    render();
  }

  function render() {
    updateDemoFlag();
    if (currentView === "garden") renderGarden();
    else if (currentView === "nursery") renderNursery();
    else if (currentView === "profile") renderProfile();
    else if (currentView === "water") renderWater();
    else if (currentView === "lesson") renderLesson();
  }

  function updateDemoFlag() {
    const flag = $("demo-flag");
    if (!flag) return;
    if (settings.demoOn) {
      flag.textContent = t("demo.flag.on", { offset: formatOffset(virtualOffsetMs) });
      flag.classList.remove("off");
    } else {
      flag.textContent = t("demo.flag.off");
      flag.classList.add("off");
    }
  }

  function formatOffset(ms) {
    const h = Math.floor(ms / 3600e3);
    const uh = t("demo.unit.h");
    const ud = t("demo.unit.d");
    if (h < 24) return h + uh;
    const d = Math.floor(h / 24);
    return d + ud + (h % 24 ? (h % 24) + uh : "");
  }

  // ——— garden ———
  function renderGarden() {
    const st = plantStats();
    $("g-planted").textContent = st.planted;
    $("g-due").textContent = st.due;
    $("g-bloom").textContent = st.bloom;
    $("g-wilt").textContent = st.wilt;

    const pots = $("garden-pots");
    pots.innerHTML = "";
    const zs = Object.keys(garden);
    if (!zs.length) {
      pots.innerHTML = '<div class="empty">' + esc(t("empty.garden")) + "</div>";
      return;
    }
    zs.sort((a, b) => (garden[a].lastWatered || 0) - (garden[b].lastWatered || 0));
    for (const z of zs) {
      const c = charByZ.get(z);
      const p = garden[z];
      const stage = effectiveStage(p);
      const due = isDue(p) || stage === "wilt";
      const el = document.createElement("div");
      el.className = "pot" +
        (c?.stone?.color === "gold" ? " gold" : "") +
        (due ? " due" : "") +
        (stage === "wilt" ? " wilt" : "") +
        (stage === "dead" ? " dead" : "") +
        (stage === "bloom" && !due ? " bloom" : "");
      el.innerHTML =
        '<div class="glyph">' + esc(z) + "</div>" +
        '<div class="zy">' + esc(c?.zy || "") + "</div>" +
        (settings.pinyin ? '<div class="py">' + esc(c?.py || "") + "</div>" : "") +
        '<div class="stage-label"><span class="stage-dot ' + stage + '"></span>' +
        stageLabel(stage) +
        (due && stage !== "dead" ? " · " + t("stage.due") : "") +
        "</div>";
      el.addEventListener("click", () => {
        selectedZ = z;
        setView("profile");
      });
      pots.appendChild(el);
    }
  }

  // ——— nursery ———
  function renderNursery() {
    let list = filteredChars();
    if (nurseryLv > 0) list = list.filter((c) => c.lv === nurseryLv);
    $("n-count").textContent = String(list.length);

    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (nurseryPage > pages) nurseryPage = pages;
    if (nurseryPage < 1) nurseryPage = 1;
    $("n-page").textContent = String(nurseryPage);
    $("prev-page").disabled = nurseryPage <= 1;
    $("next-page").disabled = nurseryPage >= pages;

    const slice = list.slice((nurseryPage - 1) * PAGE_SIZE, nurseryPage * PAGE_SIZE);
    const grid = $("catalog-grid");
    grid.innerHTML = "";
    if (!slice.length) {
      grid.innerHTML = '<div class="empty">' + esc(t("empty.nursery")) + "</div>";
      return;
    }
    for (const c of slice) {
      const el = document.createElement("div");
      el.className = "seed-card" + (c.stone?.color === "gold" ? " gold" : "");
      el.innerHTML =
        '<div class="glyph">' + esc(c.z) + "</div>" +
        '<div class="zy">' + esc(c.zy) + "</div>" +
        (settings.pinyin ? '<div class="py">' + esc(c.py) + "</div>" : "") +
        (garden[c.z] ? '<div class="stage-label">' + esc(t("inGarden")) + "</div>" : "");
      el.addEventListener("click", () => {
        selectedZ = c.z;
        setView("profile");
      });
      grid.appendChild(el);
    }
  }

  // ——— profile ———
  function renderProfile() {
    const c = charByZ.get(selectedZ) || Z.chars[0];
    if (!c) return;
    selectedZ = c.z;
    const plant = garden[c.z];
    const stage = plant ? effectiveStage(plant) : null;

    $("p-glyph").textContent = c.z;
    $("p-zy").textContent = c.zy || "—";
    $("p-en-short").textContent = c.en || "—";

    const flipCard = $("flip-card");
    flipCard.classList.toggle("flipped", flipped);

    const rich = $("rich-panel");
    rich.hidden = !settings.rich;
    $("rich-toggle").checked = !!settings.rich;

    if (!settings.rich) return;

    $("p-rank").textContent = t("chip.plot", { i: c.i, lv: c.lv });
    $("p-stk").textContent = t("chip.strokes", { n: c.stk || "?" });
    $("p-stage").textContent = stage ? stageLabel(stage) : t("stage.unplanted");

    $("p-hook").textContent = c.stone?.hook || "";
    const chips = $("p-stone-chips");
    chips.innerHTML = "";
    const chipBits = [];
    if (c.stone?.job) chipBits.push(["job", c.stone.job]);
    if (c.stone?.color) chipBits.push(["color", c.stone.color]);
    if (c.stone?.register != null) chipBits.push(["register", t("chip.register", { n: c.stone.register })]);
    (c.stone?.habitat || []).forEach((h) => chipBits.push(["habitat", h]));
    if (c.stone?.pair) chipBits.push(["pair", t("chip.pair", { z: c.stone.pair })]);
    if (c.stone?.frozen) chipBits.push(["frozen", "frozen"]);
    for (const [k, v] of chipBits) {
      const span = document.createElement("span");
      span.className = "chip" + (k === "color" && v === "gold" ? " gold" : "");
      span.textContent = v;
      chips.appendChild(span);
    }
    $("p-weather").textContent = c.stone?.weather ? t("chip.weather", { w: c.stone.weather }) : "";

    $("p-en").textContent = c.en || "";
    const tw = $("p-tw");
    if (c.tw) {
      tw.style.display = "";
      tw.textContent = t("chip.tw", { t: c.tw });
    } else {
      tw.style.display = "none";
      tw.textContent = "";
    }

    const rd = $("p-readings");
    rd.innerHTML = "";
    (c.rd || []).forEach((r) => {
      const span = document.createElement("span");
      span.className = "chip";
      span.textContent = r.zy + (settings.pinyin ? " · " + r.py : "") + (r.tag && r.tag !== "default" ? " (" + r.tag + ")" : "");
      rd.appendChild(span);
    });
    $("p-py").textContent = settings.pinyin ? t("chip.pinyin", { py: c.py || "" }) : "";

    const words = $("p-words");
    words.innerHTML = "";
    if (!(c.w || []).length) {
      words.innerHTML = '<div class="empty" style="padding:12px">' + esc(t("empty.words")) + "</div>";
    } else {
      for (const w of c.w) {
        const div = document.createElement("div");
        div.className = "word";
        div.innerHTML =
          '<div class="w">' + esc(w.w) + "</div>" +
          (w.tw ? '<span class="twtag">' + esc(t("chip.twTag")) + "</span>" : "<span></span>") +
          '<div class="meta">' + esc(w.zy || "") +
          (settings.pinyin && w.en ? " · " : w.en ? " · " : "") +
          esc(w.en || "") +
          (w.cn ? esc(t("chip.cn", { cn: w.cn })) : "") +
          "</div>";
        words.appendChild(div);
      }
    }

    const look = $("p-look");
    look.innerHTML = "";
    if (!(c.lk || []).length) {
      look.innerHTML = '<span class="chip">—</span>';
    } else {
      for (const lz of c.lk) {
        const span = document.createElement("span");
        span.className = "chip clickable";
        span.textContent = lz;
        span.addEventListener("click", () => {
          if (charByZ.has(lz)) {
            selectedZ = lz;
            flipped = false;
            renderProfile();
          }
        });
        look.appendChild(span);
      }
    }

    renderMems(c);
    $("p-notes").value = plant?.notes || "";
  }

  function allMemsFor(c) {
    const seed = (Z.seedMems && Z.seedMems[c.z]) || [];
    const custom = (garden[c.z] && garden[c.z].mems) || [];
    return [...seed, ...custom];
  }

  function renderMems(c) {
    const box = $("p-mems");
    box.innerHTML = "";
    let mems = allMemsFor(c);
    if (!settings.adult) mems = mems.filter((m) => !m.adult);
    if (!mems.length) {
      box.innerHTML = '<div class="empty" style="padding:12px">' + esc(t("empty.mem")) + "</div>";
      return;
    }
    for (const m of mems) {
      const div = document.createElement("div");
      div.className = "mem" + (m.adult ? " adult" : "");
      div.innerHTML =
        "<div>" + esc(m.text) + "</div>" +
        '<div class="votes">' +
        (m.adult ? t("mem.adultPrefix") : "") +
        (m.votes != null ? t("mem.votes", { n: m.votes }) : t("mem.custom")) +
        "</div>";
      box.appendChild(div);
    }
  }

  // ——— water / quiz ———
  function dueList() {
    return Object.keys(garden)
      .filter((z) => {
        const p = garden[z];
        const s = effectiveStage(p);
        return s !== "dead" && (isDue(p) || s === "wilt");
      })
      .sort((a, b) => garden[a].nextDue - garden[b].nextDue);
  }

  function waterPlant(z, success) {
    const p = ensurePlant(z);
    const cur = effectiveStage(p);
    if (cur === "dead") {
      // revive to seed on successful recall
      if (success) {
        p.stage = "seed";
        p.lastWatered = now();
        p.nextDue = now() + INTERVAL_H.seed * 3600e3;
      }
      persistGarden();
      return;
    }
    if (success) {
      let idx = STAGES.indexOf(p.stage);
      if (idx < 0) idx = 0;
      if (cur === "wilt") {
        // recover one stage down, min seed
        idx = Math.max(0, idx - 1);
      } else if (idx < STAGES.length - 1) {
        idx += 1;
      }
      p.stage = STAGES[idx];
      p.lastWatered = now();
      p.nextDue = now() + INTERVAL_H[p.stage] * 3600e3;
    } else {
      // miss → push due soon, maybe wilt
      p.nextDue = now() - WILT_AFTER_H * 3600e3 - 1;
    }
    persistGarden();
  }

  function renderWater() {
    const list = dueList();
    $("w-due").textContent = String(list.length);
    const wrap = $("quiz-wrap");
    wrap.innerHTML = "";
    if (!list.length) {
      wrap.innerHTML = '<div class="quiz-empty">' + esc(t("empty.quiz")) + "</div>";
      return;
    }
    const z = list[0];
    const c = charByZ.get(z);
    if (!c) return;
    quizAnswered = false;

    // Alternate prompt: meaning vs zhuyin
    const askZy = Math.random() < 0.5;
    const card = document.createElement("div");
    card.className = "quiz-card";

    let prompt, correct, options;
    if (askZy) {
      prompt = c.z;
      correct = c.zy;
      options = uniqueOptions(
        c.zy,
        Z.chars.map((x) => x.zy).filter(Boolean),
        3
      );
      card.innerHTML =
        '<div class="hint">' + esc(t("quiz.hint.zy")) + "</div>" +
        '<div class="prompt">' + esc(prompt) + "</div>" +
        '<div class="quiz-options"></div>';
    } else {
      prompt = c.z;
      correct = c.en;
      options = uniqueOptions(
        c.en,
        Z.chars.map((x) => x.en).filter(Boolean),
        3
      );
      card.innerHTML =
        '<div class="hint">' + esc(t("quiz.hint.en")) + "</div>" +
        '<div class="prompt">' + esc(prompt) + "</div>" +
        '<div class="quiz-options"></div>';
    }
    wrap.appendChild(card);
    const optBox = card.querySelector(".quiz-options");
    shuffle(options).forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (quizAnswered) return;
        quizAnswered = true;
        const ok = opt === correct;
        btn.classList.add(ok ? "correct" : "wrong");
        optBox.querySelectorAll("button").forEach((b) => {
          if (b.textContent === correct) b.classList.add("correct");
          b.disabled = true;
        });
        waterPlant(z, ok);
        toast(ok ? t("toast.water.ok", { stage: stageLabel(effectiveStage(garden[z])) }) : t("toast.water.miss"));
        setTimeout(() => {
          render();
          if (currentView === "garden") renderGarden();
        }, 700);
      });
      optBox.appendChild(btn);
    });
  }

  function uniqueOptions(correct, pool, nDistractors) {
    const set = new Set([correct]);
    const shuffled = shuffle(pool.filter((x) => x && x !== correct));
    for (const x of shuffled) {
      if (set.size > nDistractors) break;
      set.add(x);
    }
    return [...set];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ——— lesson tray ———
  function renderLesson() {
    tray = tray.filter((z) => charByZ.has(z));
    $("tray-count").textContent = String(tray.length);
    const box = $("tray");
    box.innerHTML = "";
    if (!tray.length) {
      box.innerHTML = '<div class="empty">' + esc(t("empty.tray")) + "</div>";
      $("lesson-note").textContent = t("lesson.note.empty");
      return;
    }
    for (const z of tray) {
      const c = charByZ.get(z);
      const el = document.createElement("div");
      el.className = "tray-card" + (c?.stone?.color === "gold" ? " gold" : "");
      el.innerHTML =
        '<div class="glyph">' + esc(z) + "</div>" +
        '<div class="zy">' + esc(c?.zy || "") + "</div>";
      el.title = t("tray.title");
      el.addEventListener("click", () => {
        selectedZ = z;
        setView("profile");
      });
      el.addEventListener("dblclick", (e) => {
        e.preventDefault();
        tray = tray.filter((x) => x !== z);
        persistTray();
        toast(t("toast.tray.out"));
        renderLesson();
      });
      box.appendChild(el);
    }
    $("lesson-note").textContent = t("lesson.note.full");
  }

  // ——— speech ———
  function speak(z, gender) {
    const c = charByZ.get(z);
    if (!c || !window.speechSynthesis) {
      toast(t("toast.noSpeech"));
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(c.z);
    u.lang = "zh-TW";
    const voices = window.speechSynthesis.getVoices();
    const tw = voices.filter((v) => /zh(-|_)?TW|Hant|Taiwan|國語|中文/i.test(v.lang + v.name));
    const pool = tw.length ? tw : voices.filter((v) => /zh/i.test(v.lang));
    if (pool.length) {
      let pick = pool[0];
      if (gender === "f") {
        pick = pool.find((v) => /female|女|woman|ting|yating|hanhan/i.test(v.name)) || pick;
      } else {
        pick = pool.find((v) => /male|男|man|yun|zhi/i.test(v.name)) || pool[pool.length - 1] || pick;
      }
      u.voice = pick;
    }
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function replayGlyph() {
    const tian = $("tian");
    if (!tian) return;
    tian.classList.remove("replaying");
    void tian.offsetWidth;
    tian.classList.add("replaying");
    setTimeout(() => tian.classList.remove("replaying"), 950);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ——— demo clock ———
  function syncDemoControls() {
    $("demo-toggle").checked = !!settings.demoOn;
    $("demo-rate").value = String(settings.demoRate);
    restartDemoTimer();
  }

  function restartDemoTimer() {
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = null;
    }
    if (!settings.demoOn) {
      updateDemoFlag();
      return;
    }
    demoTimer = setInterval(() => {
      const rate = Number(settings.demoRate) || 2; // hours per real second
      virtualOffsetMs += rate * 3600e3;
      updateDemoFlag();
      // lightly refresh due counts when on garden/water
      if (currentView === "garden" || currentView === "water") {
        if (currentView === "garden") {
          const st = plantStats();
          $("g-due").textContent = st.due;
          $("g-bloom").textContent = st.bloom;
          $("g-wilt").textContent = st.wilt;
          // restyle pots without full rebuild if possible — full render is fine
          renderGarden();
        } else {
          $("w-due").textContent = String(dueList().length);
        }
      }
    }, 1000);
  }

  // ——— wire events ———
  function bind() {
    document.querySelectorAll(".nav [data-view]").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.getAttribute("data-view")));
    });

    $("q").addEventListener("input", (e) => {
      searchQ = e.target.value || "";
      nurseryPage = 1;
      if (searchQ.trim()) {
        // jump to nursery when searching, and show matching profile if exact glyph
        const exact = Z.chars.find((c) => c.z === searchQ.trim());
        if (exact) {
          selectedZ = exact.z;
          setView("profile");
        } else {
          if (currentView !== "nursery") setView("nursery");
          else renderNursery();
        }
      } else if (currentView === "nursery") {
        renderNursery();
      }
    });

    document.querySelectorAll(".beds [data-lv]").forEach((btn) => {
      btn.addEventListener("click", () => {
        nurseryLv = Number(btn.getAttribute("data-lv"));
        nurseryPage = 1;
        document.querySelectorAll(".beds [data-lv]").forEach((b) => {
          b.classList.toggle("on", Number(b.getAttribute("data-lv")) === nurseryLv);
        });
        renderNursery();
      });
    });

    $("adult-toggle").checked = !!settings.adult;
    $("pinyin-toggle").checked = !!settings.pinyin;
    $("adult-toggle").addEventListener("change", (e) => {
      settings.adult = e.target.checked;
      persistSettings();
      render();
    });
    $("pinyin-toggle").addEventListener("change", (e) => {
      settings.pinyin = e.target.checked;
      persistSettings();
      render();
    });
    $("prev-page").addEventListener("click", () => {
      nurseryPage--;
      renderNursery();
    });
    $("next-page").addEventListener("click", () => {
      nurseryPage++;
      renderNursery();
    });

    $("rich-toggle").addEventListener("change", (e) => {
      settings.rich = e.target.checked;
      persistSettings();
      renderProfile();
    });

    $("btn-flip").addEventListener("click", () => {
      flipped = !flipped;
      $("flip-card").classList.toggle("flipped", flipped);
      $("btn-flip").textContent = flipped ? t("btn.flip.zh") : t("btn.flip.en");
    });
    $("btn-speak-f").addEventListener("click", () => speak(selectedZ, "f"));
    $("btn-speak-m").addEventListener("click", () => speak(selectedZ, "m"));
    $("btn-replay").addEventListener("click", replayGlyph);

    $("btn-seed").addEventListener("click", () => {
      if (!selectedZ) return;
      ensurePlant(selectedZ);
      persistGarden();
      toast(t("toast.seeded", { z: selectedZ }));
      renderProfile();
    });
    $("btn-tray").addEventListener("click", () => {
      if (!selectedZ) return;
      if (!tray.includes(selectedZ)) {
        tray.push(selectedZ);
        persistTray();
        toast(t("toast.tray.add", { z: selectedZ }));
      } else {
        toast(t("toast.tray.has", { z: selectedZ }));
      }
      if (currentView === "lesson") renderLesson();
    });

    $("btn-add-mem").addEventListener("click", () => {
      const text = ($("new-mem").value || "").trim();
      if (!text || !selectedZ) return;
      const p = ensurePlant(selectedZ);
      p.mems = p.mems || [];
      p.mems.push({ text, adult: !!$("mem-adult").checked, votes: 0 });
      persistGarden();
      $("new-mem").value = "";
      $("mem-adult").checked = false;
      toast(t("toast.mem"));
      renderMems(charByZ.get(selectedZ));
    });

    $("p-notes").addEventListener("change", () => {
      if (!selectedZ) return;
      const p = ensurePlant(selectedZ);
      p.notes = $("p-notes").value || "";
      persistGarden();
    });

    $("water-all").addEventListener("click", () => {
      const list = dueList();
      if (!list.length) {
        toast(t("toast.noDue"));
        return;
      }
      setView("water");
    });

    $("clear-garden").addEventListener("click", () => {
      if (!Object.keys(garden).length) {
        toast(t("toast.gardenEmpty"));
        return;
      }
      if (!confirm(t("confirm.clear"))) return;
      garden = {};
      persistGarden();
      toast(t("toast.cleared"));
      render();
    });

    $("demo-toggle").addEventListener("change", (e) => {
      settings.demoOn = e.target.checked;
      if (!settings.demoOn) {
        // keep offset so plants stay consistent during session; user can refresh for real
      }
      persistSettings();
      restartDemoTimer();
      render();
    });
    $("demo-rate").addEventListener("change", (e) => {
      settings.demoRate = Number(e.target.value) || 2;
      persistSettings();
      restartDemoTimer();
    });

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }

  // boot
  bind();
  syncDemoControls();
  // default rich panel off; show first char ready
  if (!selectedZ && Z.chars[0]) selectedZ = Z.chars[0].z;
  setView("garden");

  if (window.ZIYUAN_I18N && window.ZIYUAN_I18N.onChange) {
    window.ZIYUAN_I18N.onChange(function () {
      // chrome already updated by i18n.apply; refresh dynamic views + flip label
      const flipBtn = $("btn-flip");
      if (flipBtn) flipBtn.textContent = flipped ? t("btn.flip.zh") : t("btn.flip.en");
      render();
    });
  }
})();
