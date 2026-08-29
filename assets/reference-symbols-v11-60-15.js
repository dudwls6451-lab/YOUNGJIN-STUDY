(() => {
  const SYMBOL_SUBJECT = "Jeppesen Airway Manual · Symbols";
  const SYMBOL_QUESTION_PATH = "./data/questions-jeppesen-symbols-v1.json";
  const SYMBOL_THEORY_PATH = "./data/theory-jeppesen-symbols-v1.json";
  let loaded = false;
  let loadPromise = null;

  const qs = sel => document.querySelector(sel);

  function ensureUi() {
    const card = qs("#referenceJeppesenCard");
    if (!card || qs("#referenceJeppesenSymbolsSection")) return;

    const bookMeta = qs("#referenceJeppesenBookBtn span");
    if (bookMeta) bookMeta.textContent = "Glossary p.54–101 + Symbols p.126–135 · 총 1,054문항";

    const headTitle = card.querySelector(".reference-study-title-wrap h2");
    const headDesc = card.querySelector(".reference-study-title-wrap .muted");
    if (headTitle) headTitle.textContent = "Jeppesen Airway Manual 학습";
    if (headDesc) headDesc.textContent = "Glossary와 Symbols · Charting Symbols Legend를 각각 문제 풀이와 이론 학습으로 공부합니다.";

    const summary = card.querySelector(".reference-study-summary");
    if (summary) {
      summary.innerHTML = '<span><b>443</b> Glossary 용어</span><span><b>886</b> Glossary 문항</span><span><b>168</b> Charting Symbols</span><span><b>168</b> 심볼 문항</span>';
    }

    const glossaryGrid = card.querySelector(".study-type-grid");
    if (glossaryGrid && !qs("#referenceGlossaryHeading")) {
      const heading = document.createElement("div");
      heading.id = "referenceGlossaryHeading";
      heading.className = "reference-module-heading";
      heading.innerHTML = '<span class="eyebrow">DEFINITIONS & ABBREVIATIONS</span><h3>Glossary</h3><p class="muted">p.54–101 · 한국어 설명 번역본 기반</p>';
      glossaryGrid.before(heading);
    }

    const section = document.createElement("div");
    section.id = "referenceJeppesenSymbolsSection";
    section.className = "reference-module-section";
    section.innerHTML = `
      <div class="reference-module-heading">
        <span class="eyebrow">SYMBOLS</span>
        <h3>Charting Symbols Legend</h3>
        <p class="muted">p.126–135 · 168개 심볼을 원본 이미지로 학습합니다.</p>
      </div>
      <div class="study-type-grid">
        <button id="referenceJeppesenSymbolProblemBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🧭</span><strong>심볼 문제 풀이</strong>
          <span>심볼 이미지를 보고 해당 Jeppesen 명칭을 고르는 168문항을 풉니다.</span>
        </button>
        <button id="referenceJeppesenSymbolTheoryBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🗺️</span><strong>심볼 이론 학습</strong>
          <span>Charting Symbols Legend를 카테고리별 14단계로 보고 단계별 쪽지시험을 풉니다.</span>
        </button>
      </div>`;
    card.appendChild(section);
  }

  async function ensureLoaded() {
    if (loaded && Array.isArray(bank) && bank.some(q => q.subject === SYMBOL_SUBJECT)) return true;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      const response = await fetch(`${SYMBOL_QUESTION_PATH}?v=11.60.15`, {cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : (data.questions || []);
      if (!rows.length) throw new Error("Jeppesen Symbols 문항이 없습니다.");
      const ids = new Set((bank || []).map(q => q.id));
      rows.forEach(q => {
        if (!q?.id || ids.has(q.id)) return;
        const override = typeof adminQuestionOverrides !== "undefined" ? adminQuestionOverrides.get(q.id) : null;
        if (override && typeof applyQuestionOverrideToQuestion === "function") applyQuestionOverrideToQuestion(q, override);
        bank.push(q);
        ids.add(q.id);
      });
      loaded = true;
      try { AIRLINE_ONLY_SUBJECTS.add(SYMBOL_SUBJECT); } catch {}
      try { updateErrorCount(); } catch {}
      return true;
    })().catch(err => {
      loadPromise = null;
      console.error("[Reference Symbols] 데이터 로드 실패", err);
      throw err;
    });
    return loadPromise;
  }

  function prepareTheoryConfig() {
    THEORY_CONFIG[SYMBOL_SUBJECT] = {
      storageKey: "jeppesenSymbols14",
      paths: [SYMBOL_THEORY_PATH],
      label: "Jeppesen Airway Manual · Symbols 이론 학습",
      loadError: "Jeppesen Airway Manual Symbols 데이터를 불러오지 못했습니다."
    };
  }

  function hideReferenceCards() {
    qs("#referenceStudyHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.add("hidden");
  }

  async function openSymbolProblems() {
    try {
      await ensureLoaded();
      hideReferenceCards();
      activateLearningContext({
        kind:"reference",
        label:"Jeppesen Airway Manual · Symbols 문제 풀이",
        allowedSubjects:[SYMBOL_SUBJECT],
        lockedSubject:SYMBOL_SUBJECT,
        note:"Symbols · Charting Symbols Legend p.126–135 · 168개 심볼 · 이미지 식별 168문항"
      });
      if (els.mode) els.mode.value = "study";
      if (els.scope) els.scope.value = "all";
      if (els.countMode && [...els.countMode.options].some(o => o.value === "20")) els.countMode.value = "20";
      if (els.noFigureOnly) els.noFigureOnly.checked = false;
      applyModeUIState();
      updateAvailableCount();
    } catch (err) {
      alert(`Jeppesen Symbols 문제 데이터를 불러오지 못했습니다.\n${err?.message || err}`);
    }
  }

  async function openSymbolTheory() {
    try {
      await ensureLoaded();
      await openTheory(SYMBOL_SUBJECT);
    } catch (err) {
      console.error(err);
      alert(`Jeppesen Symbols 이론 학습을 시작하지 못했습니다.\n${err?.message || err}`);
    }
  }

  function returnToJeppesen() {
    setQuizFocus(false);
    hideStudySurfaces();
    hideAllHubs();
    qs("#homeHero")?.classList.add("hidden");
    qs("#topProgressCard")?.classList.add("hidden");
    qs("#modeHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.remove("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function bind() {
    qs("#referenceJeppesenSymbolProblemBtn")?.addEventListener("click", openSymbolProblems);
    qs("#referenceJeppesenSymbolTheoryBtn")?.addEventListener("click", openSymbolTheory);
    qs("#theoryExitBtn")?.addEventListener("click", event => {
      if (activeTheorySubject !== SYMBOL_SUBJECT) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      returnToJeppesen();
    }, true);
    try {
      QUIZ_EXIT_TARGETS.set("#referenceJeppesenSymbolProblemBtn", "Jeppesen Symbols 문제 풀이");
      QUIZ_EXIT_TARGETS.set("#referenceJeppesenSymbolTheoryBtn", "Jeppesen Symbols 이론 학습");
    } catch {}
  }

  function boot() {
    ensureUi();
    prepareTheoryConfig();
    bind();
  }

  boot();
})();
