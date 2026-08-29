(() => {
  const SUBJECT = "Jeppesen Airway Manual · Airport Chart Legend";
  const QUESTION_PATH = "./data/questions-jeppesen-airport-v1.json";
  const THEORY_PATH = "./data/theory-jeppesen-airport-v1.json";
  let loaded = false;
  let loadPromise = null;
  const qs = sel => document.querySelector(sel);

  function ensureUi() {
    const card = qs("#referenceJeppesenCard");
    if (!card || qs("#referenceJeppesenAirportSection")) return;
    const bookMeta = qs("#referenceJeppesenBookBtn span");
    if (bookMeta) bookMeta.textContent = "Glossary p.54–101 + Symbols p.126–135 + Enroute p.136–144 + SID/DP & STAR p.145–152 + Airport p.153–158 · 총 1,260문항";
    const headDesc = card.querySelector(".reference-study-title-wrap .muted");
    if (headDesc) headDesc.textContent = "Glossary와 Jeppesen Chart Legend 파트를 각각 문제 풀이와 이론 학습으로 공부합니다.";
    const summary = card.querySelector(".reference-study-summary");
    if (summary) summary.innerHTML = '<span><b>443</b> Glossary 용어</span><span><b>886</b> Glossary 문항</span><span><b>168</b> Symbols</span><span><b>54</b> Enroute</span><span><b>71</b> SID/DP & STAR</span><span><b>81</b> Airport</span>';
    const section = document.createElement("div");
    section.id = "referenceJeppesenAirportSection";
    section.className = "reference-module-section";
    section.innerHTML = `
      <div class="reference-module-heading">
        <span class="eyebrow">AIRPORT</span>
        <h3>Airport Chart Legend</h3>
        <p class="muted">p.153–158 · Heading, Airport Planview, Additional Runway Information, Take-off/Alternate Minimums와 Chart Boundary 81개 항목을 실제 Jeppesen 이미지로 학습합니다.</p>
      </div>
      <div class="study-type-grid">
        <button id="referenceJeppesenAirportProblemBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🛬</span><strong>Airport Chart Legend 문제 풀이</strong>
          <span>이미지의 번호/표시를 보고 의미를 고르는 총 81문항을 풉니다.</span>
        </button>
        <button id="referenceJeppesenAirportTheoryBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🗺️</span><strong>Airport Chart Legend 이론 학습</strong>
          <span>Airport Chart Format부터 Alternate Minimums까지 6단계로 학습하고 단계별 쪽지시험을 풉니다.</span>
        </button>
      </div>`;
    card.appendChild(section);
  }

  async function ensureLoaded() {
    if (loaded && Array.isArray(bank) && bank.some(q => q.subject === SUBJECT)) return true;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      const response = await fetch(`${QUESTION_PATH}?v=11.60.18`, {cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rows = Array.isArray(data) ? data : (data.questions || []);
      if (!rows.length) throw new Error("Jeppesen Airport Chart Legend 문항이 없습니다.");
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
    })().catch(err => { loadPromise = null; console.error("[Reference Airport] 데이터 로드 실패", err); throw err; });
    return loadPromise;
  }

  function prepareTheoryConfig() {
    THEORY_CONFIG[SUBJECT] = {storageKey:"jeppesenAirportLegend6", paths:[THEORY_PATH], label:"Jeppesen Airway Manual · Airport Chart Legend 이론 학습", loadError:"Jeppesen Airport Chart Legend 데이터를 불러오지 못했습니다."};
  }
  function hideReferenceCards() { qs("#referenceStudyHubCard")?.classList.add("hidden"); qs("#referenceJeppesenCard")?.classList.add("hidden"); }
  async function openProblems() {
    try {
      await ensureLoaded(); hideReferenceCards();
      activateLearningContext({kind:"reference",label:"Jeppesen Airway Manual · Airport Chart Legend 문제 풀이",allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:"Airport Chart Legend p.153–158 · 이미지 식별 81문항"});
      if (els.mode) els.mode.value="study"; if (els.scope) els.scope.value="all";
      if (els.countMode && [...els.countMode.options].some(o=>o.value==="20")) els.countMode.value="20";
      if (els.noFigureOnly) els.noFigureOnly.checked=false;
      applyModeUIState(); updateAvailableCount();
    } catch(err) { alert(`Jeppesen Airport Chart Legend 문제 데이터를 불러오지 못했습니다.\n${err?.message||err}`); }
  }
  async function openTheoryMode() {
    try { await ensureLoaded(); await openTheory(SUBJECT); }
    catch(err) { console.error(err); alert(`Jeppesen Airport Chart Legend 이론 학습을 시작하지 못했습니다.\n${err?.message||err}`); }
  }
  function returnToJeppesen() {
    setQuizFocus(false); hideStudySurfaces(); hideAllHubs();
    qs("#homeHero")?.classList.add("hidden"); qs("#topProgressCard")?.classList.add("hidden"); qs("#modeHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"});
  }
  function bind() {
    qs("#referenceJeppesenAirportProblemBtn")?.addEventListener("click",openProblems);
    qs("#referenceJeppesenAirportTheoryBtn")?.addEventListener("click",openTheoryMode);
    qs("#theoryExitBtn")?.addEventListener("click",event=>{if(activeTheorySubject!==SUBJECT)return;event.preventDefault();event.stopImmediatePropagation();returnToJeppesen();},true);
    try { QUIZ_EXIT_TARGETS.set("#referenceJeppesenAirportProblemBtn","Jeppesen Airport Chart Legend 문제 풀이"); QUIZ_EXIT_TARGETS.set("#referenceJeppesenAirportTheoryBtn","Jeppesen Airport Chart Legend 이론 학습"); } catch {}
  }
  function boot(){ensureUi();prepareTheoryConfig();bind();}
  boot();
})();
