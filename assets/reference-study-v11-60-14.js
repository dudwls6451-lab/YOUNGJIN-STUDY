(() => {
  const REF_SUBJECT = "Jeppesen Airway Manual";
  const REF_QUESTION_PATH = "./data/questions-jeppesen-glossary-v1.json";
  const REF_THEORY_PATH = "./data/theory-jeppesen-glossary-v1.json";
  const REF_COVER = "./assets/covers/jeppesen_airway_manual.svg";
  let referenceQuestionsLoaded = false;
  let referenceLoadPromise = null;

  function qs(sel) { return document.querySelector(sel); }

  function hideReferenceHubs() {
    qs("#referenceStudyHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.add("hidden");
  }

  function ensureUi() {
    const modeGrid = qs("#modeHubCard .mode-choice-grid");
    if (modeGrid && !qs("#referenceStudyModeBtn")) {
      const button = document.createElement("button");
      button.id = "referenceStudyModeBtn";
      button.className = "mode-choice-card reference-study-entry";
      button.type = "button";
      button.innerHTML = '<span class="mode-icon">📘</span><strong>참고서 학습</strong><span>Jeppesen Airway Manual · 문제 풀이 / 이론 학습</span>';
      const anchor = qs("#aviwikiModeBtn") || qs("#airlineModeBtn") || qs("#wrongReviewModeBtn");
      if (anchor) modeGrid.insertBefore(button, anchor);
      else modeGrid.appendChild(button);
    }

    const quickNav = qs("#textbookQuickNavBtn");
    if (quickNav && !qs("#referenceQuickNavBtn")) {
      const button = document.createElement("button");
      button.id = "referenceQuickNavBtn";
      button.className = "button secondary nav-action";
      button.type = "button";
      button.title = "참고서 학습";
      button.innerHTML = '<span class="nav-icon">▥</span><span class="nav-label">참고서</span>';
      quickNav.after(button);
    }

    const main = qs("main.container") || qs("main");
    if (!main) return;

    if (!qs("#referenceStudyHubCard")) {
      const section = document.createElement("section");
      section.id = "referenceStudyHubCard";
      section.className = "card hidden reference-study-hub";
      section.innerHTML = `
        <div class="section-head">
          <div>
            <span class="eyebrow">REFERENCE STUDY</span>
            <h2>참고서 학습</h2>
            <p class="muted">문제은행 교재와 별도로 참고서를 선택해 문제 풀이 또는 이론 학습을 진행합니다.</p>
          </div>
          <button id="referenceStudyBackBtn" class="button secondary" type="button">이전</button>
        </div>
        <div class="book-choice-grid reference-book-grid">
          <button id="referenceJeppesenBookBtn" class="book-choice-card reference-book-card" type="button">
            <img src="${REF_COVER}" alt="Jeppesen Airway Manual 표지">
            <strong>Jeppesen Airway Manual</strong>
            <span>Glossary p.54–101 · 443개 용어 · 886문항</span>
          </button>
        </div>`;
      main.appendChild(section);
    }

    if (!qs("#referenceJeppesenCard")) {
      const section = document.createElement("section");
      section.id = "referenceJeppesenCard";
      section.className = "card hidden reference-study-detail";
      section.innerHTML = `
        <div class="section-head reference-study-detail-head">
          <div class="reference-study-title-wrap">
            <img src="${REF_COVER}" alt="" aria-hidden="true">
            <div>
              <span class="eyebrow">JEPPESEN AIRWAY MANUAL</span>
              <h2>Glossary 학습</h2>
              <p class="muted">영어 용어명은 원문 그대로, 설명과 해설은 한국어 번역본을 기준으로 학습합니다.</p>
            </div>
          </div>
          <button id="referenceJeppesenBackBtn" class="button secondary" type="button">참고서 선택</button>
        </div>
        <div class="reference-study-summary">
          <span><b>443</b> 고유 용어</span><span><b>886</b> 4지선다 문항</span><span><b>33</b> 이론 학습 단계</span>
        </div>
        <div class="study-type-grid">
          <button id="referenceJeppesenProblemBtn" class="mode-choice-card" type="button">
            <span class="mode-icon">✍️</span><strong>문제 풀이</strong>
            <span>설명 → 용어 / 용어 → 설명 문제를 Glossary 전 범위에서 풉니다.</span>
          </button>
          <button id="referenceJeppesenTheoryBtn" class="mode-choice-card" type="button">
            <span class="mode-icon">📖</span><strong>이론 학습</strong>
            <span>443개 용어의 한국어 설명을 순서대로 읽고 단계별 쪽지시험을 풉니다.</span>
          </button>
        </div>`;
      main.appendChild(section);
    }
  }

  async function ensureReferenceQuestionsLoaded() {
    if (referenceQuestionsLoaded && Array.isArray(bank) && bank.some(q => q.subject === REF_SUBJECT)) return true;
    if (referenceLoadPromise) return referenceLoadPromise;
    referenceLoadPromise = (async () => {
      const response = await fetch(`${REF_QUESTION_PATH}?v=11.60.14`, {cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : (data.questions || []);
      if (!rows.length) throw new Error("Jeppesen Glossary 문항이 없습니다.");
      const ids = new Set((bank || []).map(q => q.id));
      rows.forEach(q => {
        if (!q?.id || ids.has(q.id)) return;
        const override = typeof adminQuestionOverrides !== "undefined" ? adminQuestionOverrides.get(q.id) : null;
        if (override && typeof applyQuestionOverrideToQuestion === "function") applyQuestionOverrideToQuestion(q, override);
        bank.push(q);
        ids.add(q.id);
      });
      referenceQuestionsLoaded = true;
      try { AIRLINE_ONLY_SUBJECTS.add(REF_SUBJECT); } catch {}
      try { populateSubjects(); } catch {}
      try { updateErrorCount(); } catch {}
      window.PilotBankReferenceStudy = {
        subject: REF_SUBJECT,
        terms: Number(data?.metadata?.glossary_terms || 443),
        questions: rows.length,
        loaded: true
      };
      window.dispatchEvent(new CustomEvent("pilotbank:reference-loaded", {detail:window.PilotBankReferenceStudy}));
      return true;
    })().catch(err => {
      referenceLoadPromise = null;
      console.error("[Reference Study] Jeppesen 데이터 로드 실패", err);
      throw err;
    });
    return referenceLoadPromise;
  }

  function prepareTheoryConfig() {
    THEORY_CONFIG[REF_SUBJECT] = {
      storageKey: "jeppesenGlossary33",
      paths: [REF_THEORY_PATH],
      label: "Jeppesen Airway Manual · Glossary 이론 학습",
      loadError: "Jeppesen Airway Manual Glossary 이론 데이터를 불러오지 못했습니다."
    };
  }

  function showReferenceStudyHub() {
    setQuizFocus(false);
    hideStudySurfaces();
    hideAllHubs();
    qs("#homeHero")?.classList.add("hidden");
    qs("#topProgressCard")?.classList.add("hidden");
    qs("#modeHubCard")?.classList.add("hidden");
    qs("#referenceStudyHubCard")?.classList.remove("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function showJeppesenHub() {
    setQuizFocus(false);
    hideStudySurfaces();
    hideAllHubs();
    qs("#homeHero")?.classList.add("hidden");
    qs("#topProgressCard")?.classList.add("hidden");
    qs("#modeHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.remove("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  async function openReferenceProblems() {
    try {
      await ensureReferenceQuestionsLoaded();
      hideReferenceHubs();
      activateLearningContext({
        kind:"reference",
        label:"Jeppesen Airway Manual · Glossary 문제 풀이",
        allowedSubjects:[REF_SUBJECT],
        lockedSubject:REF_SUBJECT,
        note:"Glossary p.54–101 · 443개 용어 · 886문항 · 설명→용어 / 용어→설명"
      });
      if (els.mode) els.mode.value = "study";
      if (els.scope) els.scope.value = "all";
      if (els.countMode && [...els.countMode.options].some(o => o.value === "20")) els.countMode.value = "20";
      if (els.noFigureOnly) els.noFigureOnly.checked = false;
      applyModeUIState();
      updateAvailableCount();
    } catch (err) {
      alert(`Jeppesen Airway Manual 문제 데이터를 불러오지 못했습니다.\n${err?.message || err}`);
    }
  }

  async function openReferenceTheory() {
    try {
      await ensureReferenceQuestionsLoaded();
      await openTheory(REF_SUBJECT);
    } catch (err) {
      console.error(err);
      alert(`Jeppesen Airway Manual 이론 학습을 시작하지 못했습니다.\n${err?.message || err}`);
    }
  }

  function installNavigationGuards() {
    try {
      QUIZ_EXIT_TARGETS.set("#referenceStudyModeBtn", "참고서 학습");
      QUIZ_EXIT_TARGETS.set("#referenceQuickNavBtn", "참고서 학습");
      QUIZ_EXIT_TARGETS.set("#referenceStudyBackBtn", "학습 모드 선택");
      QUIZ_EXIT_TARGETS.set("#referenceJeppesenBackBtn", "참고서 선택");
      QUIZ_EXIT_TARGETS.set("#referenceJeppesenBookBtn", "Jeppesen Airway Manual");
    } catch {}

    const originalHideStudySurfaces = hideStudySurfaces;
    hideStudySurfaces = function(...args) {
      const result = originalHideStudySurfaces.apply(this, args);
      hideReferenceHubs();
      return result;
    };
    const originalHideAllHubs = hideAllHubs;
    hideAllHubs = function(...args) {
      const result = originalHideAllHubs.apply(this, args);
      hideReferenceHubs();
      return result;
    };
  }

  function bind() {
    qs("#referenceStudyModeBtn")?.addEventListener("click", showReferenceStudyHub);
    qs("#referenceQuickNavBtn")?.addEventListener("click", showReferenceStudyHub);
    qs("#referenceStudyBackBtn")?.addEventListener("click", () => showLearningModeHubOnly());
    qs("#referenceJeppesenBookBtn")?.addEventListener("click", showJeppesenHub);
    qs("#referenceJeppesenBackBtn")?.addEventListener("click", showReferenceStudyHub);
    qs("#referenceJeppesenProblemBtn")?.addEventListener("click", openReferenceProblems);
    qs("#referenceJeppesenTheoryBtn")?.addEventListener("click", openReferenceTheory);

    // 기존 theoryExitBtn의 일반 교재 복귀 핸들러보다 먼저 가로채 참고서 상세 화면으로 돌아갑니다.
    qs("#theoryExitBtn")?.addEventListener("click", event => {
      if (activeTheorySubject !== REF_SUBJECT) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showJeppesenHub();
    }, true);
  }

  function boot() {
    ensureUi();
    prepareTheoryConfig();
    installNavigationGuards();
    bind();
    if (window.PilotBankRuntime?.totalQuestionCount) {
      ensureReferenceQuestionsLoaded().catch(() => {});
    } else {
      window.addEventListener("pilotbank:bank-loaded", () => ensureReferenceQuestionsLoaded().catch(() => {}), {once:true});
    }
  }

  boot();
})();
