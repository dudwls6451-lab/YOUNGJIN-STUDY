(() => {
  const SUBJECT = "Jeppesen Airway Manual · SID/DP and STAR Legend";
  const QUESTION_PATH = "./data/questions-jeppesen-sidstar-v1.json";
  const THEORY_PATH = "./data/theory-jeppesen-sidstar-v1.json";
  let loaded = false;
  let loadPromise = null;
  const qs = sel => document.querySelector(sel);

  function ensureUi() {
    const card = qs("#referenceJeppesenCard");
    if (!card || qs("#referenceJeppesenSidStarSection")) return;
    const bookMeta = qs("#referenceJeppesenBookBtn span");
    if (bookMeta) bookMeta.textContent = "Glossary p.54–101 + Symbols p.126–135 + Enroute p.136–144 + SID/DP & STAR p.145–152 · 총 1,179문항";
    const headDesc = card.querySelector(".reference-study-title-wrap .muted");
    if (headDesc) headDesc.textContent = "Glossary와 Jeppesen Chart Legend 파트를 각각 문제 풀이와 이론 학습으로 공부합니다.";
    const summary = card.querySelector(".reference-study-summary");
    if (summary) summary.innerHTML = '<span><b>443</b> Glossary 용어</span><span><b>886</b> Glossary 문항</span><span><b>168</b> Symbols</span><span><b>54</b> Enroute</span><span><b>71</b> SID/DP & STAR</span>';
    const section = document.createElement("div");
    section.id = "referenceJeppesenSidStarSection";
    section.className = "reference-module-section";
    section.innerHTML = `
      <div class="reference-module-heading">
        <span class="eyebrow">SID / DP / STAR</span>
        <h3>SID/DP and STAR Legend</h3>
        <p class="muted">p.145–152 · Heading, Briefing/MSA, Graphic 및 To-Scale 범례 71개 항목을 실제 Jeppesen 이미지로 학습합니다.</p>
      </div>
      <div class="study-type-grid">
        <button id="referenceJeppesenSidStarProblemBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🛫</span><strong>SID/DP & STAR Legend 문제 풀이</strong>
          <span>이미지의 번호/표시를 보고 의미를 고르는 총 71문항을 풉니다.</span>
        </button>
        <button id="referenceJeppesenSidStarTheoryBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🗺️</span><strong>SID/DP & STAR Legend 이론 학습</strong>
          <span>Heading부터 To-Scale Graphic까지 8단계로 학습하고 단계별 쪽지시험을 풉니다.</span>
        </button>
      </div>`;
    card.appendChild(section);
  }

  async function ensureLoaded() {
    if (loaded && Array.isArray(bank) && bank.some(q => q.subject === SUBJECT)) return true;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      const response = await fetch(`${QUESTION_PATH}?v=11.60.17`, {cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : (data.questions || []);
      if (!rows.length) throw new Error("Jeppesen SID/DP and STAR Legend 문항이 없습니다.");
      const ids = new Set((bank || []).map(q => q.id));
      rows.forEach(q => {
        if (!q?.id || ids.has(q.id)) return;
        const override = typeof adminQuestionOverrides !== "undefined" ? adminQuestionOverrides.get(q.id) : null;
        if (override && typeof applyQuestionOverrideToQuestion === "function") applyQuestionOverrideToQuestion(q, override);
        bank.push(q); ids.add(q.id);
      });
      loaded = true;
      try { AIRLINE_ONLY_SUBJECTS.add(SUBJECT); } catch {}
      try { updateErrorCount(); } catch {}
      return true;
    })().catch(err => { loadPromise = null; console.error("[Reference SIDSTAR] 데이터 로드 실패", err); throw err; });
    return loadPromise;
  }

  function prepareTheoryConfig() {
    THEORY_CONFIG[SUBJECT] = {storageKey:"jeppesenSidStarLegend8", paths:[THEORY_PATH], label:"Jeppesen Airway Manual · SID/DP and STAR Legend 이론 학습", loadError:"Jeppesen SID/DP and STAR Legend 데이터를 불러오지 못했습니다."};
  }
  function hideReferenceCards() { qs("#referenceStudyHubCard")?.classList.add("hidden"); qs("#referenceJeppesenCard")?.classList.add("hidden"); }
  async function openProblems() {
    try {
      await ensureLoaded(); hideReferenceCards();
      activateLearningContext({kind:"reference",label:"Jeppesen Airway Manual · SID/DP and STAR Legend 문제 풀이",allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:"SID/DP and STAR Legend p.145–152 · 이미지 식별 71문항"});
      if (els.mode) els.mode.value="study"; if (els.scope) els.scope.value="all";
      if (els.countMode && [...els.countMode.options].some(o=>o.value==="20")) els.countMode.value="20";
      if (els.noFigureOnly) els.noFigureOnly.checked=false;
      applyModeUIState(); updateAvailableCount();
    } catch(err) { alert(`Jeppesen SID/DP & STAR Legend 문제 데이터를 불러오지 못했습니다.\n${err?.message||err}`); }
  }
  async function openTheoryMode() {
    try { await ensureLoaded(); await openTheory(SUBJECT); }
    catch(err) { console.error(err); alert(`Jeppesen SID/DP & STAR Legend 이론 학습을 시작하지 못했습니다.\n${err?.message||err}`); }
  }
  function returnToJeppesen() {
    setQuizFocus(false); hideStudySurfaces(); hideAllHubs();
    qs("#homeHero")?.classList.add("hidden"); qs("#topProgressCard")?.classList.add("hidden"); qs("#modeHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"});
  }
  function bind() {
    qs("#referenceJeppesenSidStarProblemBtn")?.addEventListener("click",openProblems);
    qs("#referenceJeppesenSidStarTheoryBtn")?.addEventListener("click",openTheoryMode);
    qs("#theoryExitBtn")?.addEventListener("click",event=>{if(activeTheorySubject!==SUBJECT)return;event.preventDefault();event.stopImmediatePropagation();returnToJeppesen();},true);
    try { QUIZ_EXIT_TARGETS.set("#referenceJeppesenSidStarProblemBtn","Jeppesen SID/DP & STAR Legend 문제 풀이"); QUIZ_EXIT_TARGETS.set("#referenceJeppesenSidStarTheoryBtn","Jeppesen SID/DP & STAR Legend 이론 학습"); } catch {}
  }
  function boot(){ensureUi();prepareTheoryConfig();bind();}
  boot();
})();
