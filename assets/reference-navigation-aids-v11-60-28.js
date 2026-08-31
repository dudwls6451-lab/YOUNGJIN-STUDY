(() => {
  const SUBJECT = "Jeppesen Airway Manual · Radio Data - General · Section 1. Navigation Aids";
  const QUESTION_PATH = "./data/questions-jeppesen-navigation-aids-v1.json";
  const THEORY_PATH = "./data/theory-jeppesen-navigation-aids-v1.json";
  let loaded = false, loadPromise = null;
  const qs = s => document.querySelector(s);

  function ensureUi(){
    const card = qs("#referenceJeppesenCard");
    if(!card || qs("#referenceJeppesenNavigationAidsSection")) return;

    const bookMeta = qs("#referenceJeppesenBookBtn span");
    if(bookMeta) bookMeta.textContent = "Glossary + Chart Legends + Signs/Markings + VDGS + Enroute/Radio Data · 총 1,727문항";

    const summary = card.querySelector(".reference-study-summary");
    if(summary) summary.innerHTML = '<span><b>443</b> Glossary 용어</span><span><b>886</b> Glossary 문항</span><span><b>168</b> Symbols</span><span><b>54</b> Enroute Legend</span><span><b>71</b> SID/DP & STAR</span><span><b>81</b> Airport</span><span><b>146</b> Approach</span><span><b>11</b> Airline Format Approach</span><span><b>22</b> US Airport Signs</span><span><b>28</b> ICAO Signs/Markings</span><span><b>76</b> VDGS</span><span><b>32</b> Oceanic Long-Range</span><span><b>16</b> ATS Route Designators</span><span><b>40</b> Radio General</span><span><b>96</b> Navigation Aids</span>';

    const section = document.createElement("div");
    section.id = "referenceJeppesenNavigationAidsSection";
    section.className = "reference-module-section";
    section.innerHTML = `<div class="reference-module-heading"><span class="eyebrow">RADIO DATA - GENERAL · SECTION 1</span><h3>Navigation Aids</h3><p class="muted">p.336–392 · NDB/VOR/DME/ILS부터 GPS·RAIM·WAAS·GBAS/GLS까지 항행안전무선시설의 핵심 운용정보를 학습합니다.</p></div><div class="study-type-grid"><button id="referenceJeppesenNavigationAidsProblemBtn" class="mode-choice-card" type="button"><span class="mode-icon">🧭</span><strong>Navigation Aids 문제 풀이</strong><span>Jeppesen p.336–392 원문 핵심사항 96문항을 풉니다.</span></button><button id="referenceJeppesenNavigationAidsTheoryBtn" class="mode-choice-card" type="button"><span class="mode-icon">📡</span><strong>Navigation Aids 이론 학습</strong><span>Section 1. Navigation Aids를 12단계로 학습합니다.</span></button></div>`;
    card.appendChild(section);
  }

  async function ensureLoaded(){
    if(loaded && Array.isArray(bank) && bank.some(q => q.subject === SUBJECT)) return true;
    if(loadPromise) return loadPromise;
    loadPromise = (async() => {
      const r = await fetch(`${QUESTION_PATH}?v=11.60.28`, {cache:"no-store"});
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      const rows = Array.isArray(d) ? d : (d.questions || []);
      if(!rows.length) throw new Error("Jeppesen Navigation Aids 문항이 없습니다.");
      const ids = new Set((bank || []).map(q => q.id));
      rows.forEach(q => {
        if(!q?.id || ids.has(q.id)) return;
        const o = typeof adminQuestionOverrides !== "undefined" ? adminQuestionOverrides.get(q.id) : null;
        if(o && typeof applyQuestionOverrideToQuestion === "function") applyQuestionOverrideToQuestion(q, o);
        bank.push(q); ids.add(q.id);
      });
      loaded = true;
      try { AIRLINE_ONLY_SUBJECTS.add(SUBJECT); } catch {}
      try { updateErrorCount(); } catch {}
      return true;
    })().catch(e => {
      loadPromise = null;
      console.error("[Reference Navigation Aids] 데이터 로드 실패", e);
      throw e;
    });
    return loadPromise;
  }

  function prepareTheoryConfig(){
    THEORY_CONFIG[SUBJECT] = {
      storageKey: "jeppesenNavigationAids12",
      paths: [THEORY_PATH],
      label: "Jeppesen Airway Manual · Radio Data - General · Section 1. Navigation Aids 이론 학습",
      loadError: "Jeppesen Navigation Aids 이론 데이터를 불러오지 못했습니다."
    };
  }

  function hideReferenceCards(){
    qs("#referenceStudyHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.add("hidden");
  }

  async function openProblems(){
    try {
      await ensureLoaded();
      hideReferenceCards();
      activateLearningContext({
        kind:"reference",
        label:"Jeppesen Airway Manual · Navigation Aids 문제 풀이",
        allowedSubjects:[SUBJECT],
        lockedSubject:SUBJECT,
        note:"Radio Data - General · Section 1 p.336–392 · 96문항"
      });
      if(els.mode) els.mode.value = "study";
      if(els.scope) els.scope.value = "all";
      if(els.countMode && [...els.countMode.options].some(o => o.value === "all")) els.countMode.value = "all";
      if(els.noFigureOnly) els.noFigureOnly.checked = false;
      applyModeUIState();
      updateAvailableCount();
    } catch(e){
      alert(`Jeppesen Navigation Aids 문제 데이터를 불러오지 못했습니다.
${e?.message || e}`);
    }
  }

  async function openTheoryMode(){
    try {
      await ensureLoaded();
      await openTheory(SUBJECT);
    } catch(e){
      console.error(e);
      alert(`Jeppesen Navigation Aids 이론 학습을 시작하지 못했습니다.
${e?.message || e}`);
    }
  }

  function returnToJeppesen(){
    setQuizFocus(false);
    hideStudySurfaces();
    hideAllHubs();
    qs("#homeHero")?.classList.add("hidden");
    qs("#topProgressCard")?.classList.add("hidden");
    qs("#modeHubCard")?.classList.add("hidden");
    qs("#referenceJeppesenCard")?.classList.remove("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function bind(){
    qs("#referenceJeppesenNavigationAidsProblemBtn")?.addEventListener("click", openProblems);
    qs("#referenceJeppesenNavigationAidsTheoryBtn")?.addEventListener("click", openTheoryMode);
    qs("#theoryExitBtn")?.addEventListener("click", event => {
      if(activeTheorySubject !== SUBJECT) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      returnToJeppesen();
    }, true);
    try {
      QUIZ_EXIT_TARGETS.set("#referenceJeppesenNavigationAidsProblemBtn", "Jeppesen Navigation Aids 문제 풀이");
      QUIZ_EXIT_TARGETS.set("#referenceJeppesenNavigationAidsTheoryBtn", "Jeppesen Navigation Aids 이론 학습");
    } catch {}
  }

  ensureUi();
  prepareTheoryConfig();
  bind();
})();
