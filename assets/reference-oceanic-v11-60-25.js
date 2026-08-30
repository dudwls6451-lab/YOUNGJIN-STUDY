(() => {
  const SUBJECT = "Jeppesen Airway Manual · Oceanic Long-Range Navigation Information";
  const QUESTION_PATH = "./data/questions-jeppesen-oceanic-long-range-v1.json";
  const THEORY_PATH = "./data/theory-jeppesen-oceanic-long-range-v1.json";
  let loaded=false, loadPromise=null; const qs=s=>document.querySelector(s);
  function ensureUi(){
    const card=qs("#referenceJeppesenCard"); if(!card||qs("#referenceJeppesenOceanicSection")) return;
    const bookMeta=qs("#referenceJeppesenBookBtn span"); if(bookMeta) bookMeta.textContent="Glossary + Chart Legends + Signs/Markings + VDGS + Enroute Data · 총 1,575문항";
    const summary=card.querySelector(".reference-study-summary"); if(summary) summary.innerHTML='<span><b>443</b> Glossary 용어</span><span><b>886</b> Glossary 문항</span><span><b>168</b> Symbols</span><span><b>54</b> Enroute Legend</span><span><b>71</b> SID/DP & STAR</span><span><b>81</b> Airport</span><span><b>146</b> Approach</span><span><b>11</b> Airline Format Approach</span><span><b>22</b> US Airport Signs</span><span><b>28</b> ICAO Signs/Markings</span><span><b>76</b> VDGS</span><span><b>32</b> Oceanic Long-Range</span>';
    const section=document.createElement("div"); section.id="referenceJeppesenOceanicSection"; section.className="reference-module-section";
    section.innerHTML=`<div class="reference-module-heading"><span class="eyebrow">ENROUTE DATA - GENERAL</span><h3>Oceanic Long-Range Navigation Information</h3><p class="muted">p.305–308 · Oceanic long-range requirements, HF/VHF communications, 121.5 MHz guard, NDB limitations, air piracy 및 Code 7500 절차를 학습합니다.</p></div><div class="study-type-grid"><button id="referenceJeppesenOceanicProblemBtn" class="mode-choice-card" type="button"><span class="mode-icon">🌊</span><strong>Oceanic 문제 풀이</strong><span>Jeppesen p.305–308 원문 핵심사항을 묻는 32문항을 풉니다.</span></button><button id="referenceJeppesenOceanicTheoryBtn" class="mode-choice-card" type="button"><span class="mode-icon">🧭</span><strong>Oceanic 이론 학습</strong><span>Oceanic Long-Range Navigation Information을 4단계로 학습합니다.</span></button></div>`; card.appendChild(section);
  }
  async function ensureLoaded(){
    if(loaded&&Array.isArray(bank)&&bank.some(q=>q.subject===SUBJECT)) return true; if(loadPromise) return loadPromise;
    loadPromise=(async()=>{const r=await fetch(`${QUESTION_PATH}?v=11.60.25`,{cache:"no-store"}); if(!r.ok) throw new Error(`HTTP ${r.status}`); const d=await r.json(); const rows=Array.isArray(d)?d:(d.questions||[]); if(!rows.length) throw new Error("Jeppesen Oceanic 문항이 없습니다."); const ids=new Set((bank||[]).map(q=>q.id)); rows.forEach(q=>{if(!q?.id||ids.has(q.id))return; const o=typeof adminQuestionOverrides!=="undefined"?adminQuestionOverrides.get(q.id):null; if(o&&typeof applyQuestionOverrideToQuestion==="function") applyQuestionOverrideToQuestion(q,o); bank.push(q);ids.add(q.id);}); loaded=true; try{AIRLINE_ONLY_SUBJECTS.add(SUBJECT)}catch{} try{updateErrorCount()}catch{} return true;})().catch(e=>{loadPromise=null;console.error("[Reference Oceanic] 데이터 로드 실패",e);throw e;}); return loadPromise;
  }
  function prepareTheoryConfig(){THEORY_CONFIG[SUBJECT]={storageKey:"jeppesenOceanic4",paths:[THEORY_PATH],label:"Jeppesen Airway Manual · Oceanic Long-Range 이론 학습",loadError:"Jeppesen Oceanic Long-Range 데이터를 불러오지 못했습니다."};}
  function hideReferenceCards(){qs("#referenceStudyHubCard")?.classList.add("hidden");qs("#referenceJeppesenCard")?.classList.add("hidden");}
  async function openProblems(){try{await ensureLoaded();hideReferenceCards();activateLearningContext({kind:"reference",label:"Jeppesen Airway Manual · Oceanic Long-Range 문제 풀이",allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:"Enroute Data - General p.305–308 · 32문항"});if(els.mode)els.mode.value="study";if(els.scope)els.scope.value="all";if(els.countMode&&[...els.countMode.options].some(o=>o.value==="all"))els.countMode.value="all";if(els.noFigureOnly)els.noFigureOnly.checked=false;applyModeUIState();updateAvailableCount();}catch(e){alert(`Jeppesen Oceanic 문제 데이터를 불러오지 못했습니다.
${e?.message||e}`);}}
  async function openTheoryMode(){try{await ensureLoaded();await openTheory(SUBJECT);}catch(e){console.error(e);alert(`Jeppesen Oceanic 이론 학습을 시작하지 못했습니다.
${e?.message||e}`);}}
  function returnToJeppesen(){setQuizFocus(false);hideStudySurfaces();hideAllHubs();qs("#homeHero")?.classList.add("hidden");qs("#topProgressCard")?.classList.add("hidden");qs("#modeHubCard")?.classList.add("hidden");qs("#referenceJeppesenCard")?.classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
  function bind(){qs("#referenceJeppesenOceanicProblemBtn")?.addEventListener("click",openProblems);qs("#referenceJeppesenOceanicTheoryBtn")?.addEventListener("click",openTheoryMode);qs("#theoryExitBtn")?.addEventListener("click",event=>{if(activeTheorySubject!==SUBJECT)return;event.preventDefault();event.stopImmediatePropagation();returnToJeppesen();},true);try{QUIZ_EXIT_TARGETS.set("#referenceJeppesenOceanicProblemBtn","Jeppesen Oceanic Long-Range 문제 풀이");QUIZ_EXIT_TARGETS.set("#referenceJeppesenOceanicTheoryBtn","Jeppesen Oceanic Long-Range 이론 학습");}catch{}}
  ensureUi();prepareTheoryConfig();bind();
})();
