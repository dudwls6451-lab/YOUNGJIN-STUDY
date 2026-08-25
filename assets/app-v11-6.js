
function ensureV1115UiShell() {
  const main = document.querySelector("main.container") || document.querySelector("main");
  if (!main) return;

  let controls = document.querySelector("#controlsCard") || document.querySelector("section.card.controls");
  if (controls) {
    controls.id = "controlsCard";
    controls.classList.add("hidden");
  }

  if (!document.querySelector("#topProgressCard")) {
    const section = document.createElement("section");
    section.id = "topProgressCard";
    section.className = "progress-overview";
    section.innerHTML = '<div id="topProgressGrid" class="top-progress-grid"></div>';
    main.insertBefore(section, main.firstChild);
  }

  if (!document.querySelector("#modeHubCard")) {
    const hub = document.createElement("section");
    hub.id = "modeHubCard";
    hub.className = "card mode-hub";
    hub.innerHTML = `
      <div class="hub-title">
        <h2>학습 모드를 선택하십시오.</h2>
        <p class="muted">목적에 맞는 학습 과정을 선택하면 해당 문제만 사용할 수 있습니다.</p>
      </div>
      <div class="mode-choice-grid">
        <button id="kotsaModeBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">✈️</span><strong>교통안전공단 면허시험 대비</strong>
          <span>항공기상 + 검댕이 항공법규</span>
        </button>
        <button id="textbookModeBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">📚</span><strong>각 교재 학습</strong>
          <span>교재별 집중 학습 또는 자유학습</span>
        </button>
        <button id="airlineModeBtn" class="mode-choice-card" type="button">
          <span class="mode-icon">🛫</span><strong>항공사 필기전형 대비</strong>
          <span>항공사별 맞춤 출제 과정</span>
        </button>
      </div>`;
    if (controls) main.insertBefore(hub, controls);
    else main.insertBefore(hub, main.firstChild?.nextSibling || null);
  }

  if (!document.querySelector("#textbookHubCard")) {
    const section = document.createElement("section");
    section.id = "textbookHubCard";
    section.className = "card hidden";
    section.innerHTML = `
      <div class="section-head">
        <div><h2>학습할 교재를 선택하십시오.</h2><p class="muted">교재를 선택하면 해당 교재 문제만 출제됩니다.</p></div>
        <button id="textbookHubBackBtn" class="button secondary" type="button">이전</button>
      </div>
      <div class="book-choice-grid">
        <button class="book-choice-card" data-book-subject="ATP Gleim" type="button"><img src="./assets/covers/atp_gleim.jpg" alt="ATP Gleim 표지"><strong>ATP Gleim</strong></button>
        <button class="book-choice-card" data-book-subject="검댕이 항공법규" type="button"><img src="./assets/covers/airlaw.jpg" alt="검댕이 항공법규 표지"><strong>검댕이 항공법규</strong></button>
        <button class="book-choice-card" data-book-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong></button>
        <button id="freeStudyBtn" class="book-choice-card free-study" type="button"><img src="./assets/covers/all_books.jpg" alt="전체 교재"><strong>자유학습모드</strong><span>기존 문제은행의 모든 기능 사용</span></button>
      </div>`;
    if (controls) main.insertBefore(section, controls);
    else main.appendChild(section);
  }

  if (!document.querySelector("#airlineHubCard")) {
    const section = document.createElement("section");
    section.id = "airlineHubCard";
    section.className = "card hidden";
    section.innerHTML = `
      <div class="section-head">
        <div><h2>원하는 항공사 전형 대비 과정을 선택하십시오.</h2><p class="muted">항공사별 출제 교재와 시험 구성을 적용합니다.</p></div>
        <button id="airlineHubBackBtn" class="button secondary" type="button">이전</button>
      </div>
      <div class="airline-choice-grid">
        <button id="parataCourseBtn" class="airline-choice-card" type="button">
          <img src="./assets/covers/parata_air.svg" alt="PARATA AIR 로고">
          <strong>파라타항공 대비 과정</strong>
          <span>ATP Gleim + 검댕이 항공법규</span>
        </button>
      </div>`;
    if (controls) main.insertBefore(section, controls);
    else main.appendChild(section);
  }

  if (controls && !document.querySelector("#contextTitle")) {
    const bar = document.createElement("div");
    bar.className = "context-bar";
    bar.innerHTML = `
      <div><span class="muted">현재 학습 과정</span><strong id="contextTitle">자유학습모드</strong><span id="contextNote" class="muted"></span></div>
      <button id="backToModeBtn" class="button secondary" type="button">학습 모드 선택</button>`;
    controls.insertBefore(bar, controls.firstChild);
  }

  const countSelect = document.querySelector("#questionCountMode");
  if (countSelect && !countSelect.querySelector('option[value="25"]')) {
    const opt = document.createElement("option");
    opt.value = "25";
    opt.textContent = "25문제";
    const thirty = countSelect.querySelector('option[value="30"]');
    countSelect.insertBefore(opt, thirty || null);
  }

  const modeSelect = document.querySelector("#modeSelect");
  if (modeSelect && !modeSelect.querySelector('option[value="mock"]')) {
    const opt = document.createElement("option");
    opt.value = "mock";
    opt.textContent = "모의시험 · 25문제 · 70점 합격";
    modeSelect.appendChild(opt);
  }
}
ensureV1115UiShell();

function ensureV1117DirectTheoryShortcut() {
  const grid = document.querySelector("#modeHubCard .mode-choice-grid");
  if (!grid || document.querySelector("#directTheoryBtn")) return;
  const btn = document.createElement("button");
  btn.id = "directTheoryBtn";
  btn.className = "mode-choice-card theory-direct-card";
  btn.type = "button";
  btn.innerHTML = '<span class="mode-icon">📖</span><strong>교재 이론 학습 <em class="new-badge">NEW</em></strong><span>항공기상 · 검댕이 항공법규 → 쪽지시험 10문항 → 8개 이상 합격</span>';
  grid.appendChild(btn);
}
ensureV1117DirectTheoryShortcut();

function ensureV1116TheoryShell() {
  const main = document.querySelector("main.container") || document.querySelector("main");
  if (!main) return;
  const textbook = document.querySelector("#textbookHubCard");
  const airline = document.querySelector("#airlineHubCard");
  if (textbook && !document.querySelector("#textbookProblemBtn")) {
    textbook.innerHTML = `
      <div class="section-head">
        <div><h2>교재 학습 방식을 선택하십시오.</h2><p class="muted">문제를 바로 풀거나, 교재 이론을 순서대로 학습할 수 있습니다.</p></div>
        <button id="textbookHubBackBtn" class="button secondary" type="button">이전</button>
      </div>
      <div class="study-type-grid">
        <button id="textbookProblemBtn" class="mode-choice-card" type="button"><span class="mode-icon">✍️</span><strong>문제 풀이</strong><span>기존 문제은행 방식으로 교재별 문제를 풉니다.</span></button>
        <button id="textbookTheoryBtn" class="mode-choice-card" type="button"><span class="mode-icon">📖</span><strong>이론 학습</strong><span>이론을 읽고 10문항 쪽지시험을 통과하며 다음 단계로 진행합니다.</span></button>
      </div>`;
  }
  const insertBefore = airline || document.querySelector("#controlsCard");
  if (!document.querySelector("#bookProblemHubCard")) {
    const section = document.createElement("section");
    section.id = "bookProblemHubCard"; section.className = "card hidden";
    section.innerHTML = `<div class="section-head"><div><h2>문제 풀이 교재를 선택하십시오.</h2><p class="muted">기존 문제 풀이 기능은 그대로 유지됩니다.</p></div><button id="bookProblemBackBtn" class="button secondary" type="button">이전</button></div><div class="book-choice-grid"><button class="book-choice-card" data-book-subject="ATP Gleim" type="button"><img src="./assets/covers/atp_gleim.jpg" alt="ATP Gleim 표지"><strong>ATP Gleim</strong></button><button class="book-choice-card" data-book-subject="검댕이 항공법규" type="button"><img src="./assets/covers/airlaw.jpg" alt="검댕이 항공법규 표지"><strong>검댕이 항공법규</strong></button><button class="book-choice-card" data-book-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong></button><button id="freeStudyBtn" class="book-choice-card free-study" type="button"><img src="./assets/covers/all_books.jpg" alt="전체 교재"><strong>자유학습모드</strong><span>기존 문제은행의 모든 기능 사용</span></button></div>`;
    main.insertBefore(section, insertBefore);
  }
  if (!document.querySelector("#bookTheoryHubCard")) {
    const section = document.createElement("section"); section.id="bookTheoryHubCard"; section.className="card hidden";
    section.innerHTML = `<div class="section-head"><div><h2>이론 학습 교재를 선택하십시오.</h2><p class="muted">교재 본문을 순서대로 학습하고 각 단계의 쪽지시험을 통과합니다.</p></div><button id="bookTheoryBackBtn" class="button secondary" type="button">이전</button></div><div class="book-choice-grid theory-book-grid"><button id="weatherTheoryBtn" class="book-choice-card theory-ready" data-theory-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong><span>전체 이론 과정 · 40단계</span></button><button id="airlawTheoryBtn" class="book-choice-card theory-ready" data-theory-subject="검댕이 항공법규" type="button"><img src="./assets/covers/airlaw.jpg" alt="검댕이 항공법규 표지"><strong>검댕이 항공법규</strong><span>국제 항공법 + 항공안전법 · 15단계</span></button><div class="theory-coming-soon"><strong>ATP Gleim</strong><span>이론 학습 확장 예정</span></div></div>`;
    main.insertBefore(section, insertBefore);
  }
  if (!document.querySelector("#theoryCard")) {
    const section = document.createElement("section"); section.id="theoryCard"; section.className="card theory-card hidden";
    section.innerHTML = `<div class="section-head theory-main-head"><div><span id="theoryEyebrow" class="eyebrow">교재 이론 학습</span><h2 id="theoryUnitTitle">이론 학습</h2><p id="theoryUnitProgress" class="muted"></p></div><button id="theoryExitBtn" class="button secondary" type="button">교재 선택</button></div><div class="theory-layout"><aside class="theory-sidebar"><div class="theory-sidebar-title">학습 단계</div><div id="theoryStageList" class="theory-stage-list"></div></aside><article class="theory-reader"><div class="theory-stage-head"><span id="theoryStageNumber" class="pill"></span><span id="theoryStageStatus" class="theory-status-badge"></span></div><h2 id="theoryStageTitle"></h2><div id="theoryContent" class="theory-content"></div><div id="theoryReadSentinel" class="theory-read-sentinel" aria-hidden="true"></div><div class="theory-test-panel"><div><strong>쪽지시험</strong><p id="theoryTestGuide" class="muted">이론을 끝까지 읽으면 응시할 수 있습니다. 기존 문제은행에서 10문항이 무작위 출제되며 8문항 이상 맞아야 합격입니다.</p></div><button id="theoryTestBtn" class="button" type="button" disabled>끝까지 읽으면 응시 가능</button></div></article></div>`;
    main.insertBefore(section, insertBefore);
  }
}
ensureV1116TheoryShell();

const DATA_PATH = "./data/questions-v11-2.json";
const BASE_STORAGE_KEY = "pilotQuestionBankProgressV2";
const LEGACY_STORAGE_KEY = BASE_STORAGE_KEY;
let STORAGE_KEY = BASE_STORAGE_KEY;
let currentUser = null;

const SUBJECTS = [
  "ATP Gleim",
  "항공기상",
  "공중항법",
  "비행이론",
  "항공법규",
  "검댕이 항공법규",
  "항공교통통신정보업무",
];

const els = {
  topProgressGrid: document.querySelector("#topProgressGrid"),
  modeHubCard: document.querySelector("#modeHubCard"),
  textbookHubCard: document.querySelector("#textbookHubCard"),
  bookProblemHubCard: document.querySelector("#bookProblemHubCard"),
  bookTheoryHubCard: document.querySelector("#bookTheoryHubCard"),
  theoryCard: document.querySelector("#theoryCard"),
  airlineHubCard: document.querySelector("#airlineHubCard"),
  controlsCard: document.querySelector("#controlsCard"),
  kotsaModeBtn: document.querySelector("#kotsaModeBtn"),
  textbookModeBtn: document.querySelector("#textbookModeBtn"),
  airlineModeBtn: document.querySelector("#airlineModeBtn"),
  textbookHubBackBtn: document.querySelector("#textbookHubBackBtn"),
  textbookProblemBtn: document.querySelector("#textbookProblemBtn"),
  textbookTheoryBtn: document.querySelector("#textbookTheoryBtn"),
  directTheoryBtn: document.querySelector("#directTheoryBtn"),
  bookProblemBackBtn: document.querySelector("#bookProblemBackBtn"),
  bookTheoryBackBtn: document.querySelector("#bookTheoryBackBtn"),
  weatherTheoryBtn: document.querySelector("#weatherTheoryBtn"),
  airlawTheoryBtn: document.querySelector("#airlawTheoryBtn"),
  theoryEyebrow: document.querySelector("#theoryEyebrow"),
  theoryExitBtn: document.querySelector("#theoryExitBtn"),
  theoryStageList: document.querySelector("#theoryStageList"),
  theoryUnitProgress: document.querySelector("#theoryUnitProgress"),
  theoryStageNumber: document.querySelector("#theoryStageNumber"),
  theoryStageStatus: document.querySelector("#theoryStageStatus"),
  theoryStageTitle: document.querySelector("#theoryStageTitle"),
  theoryContent: document.querySelector("#theoryContent"),
  theoryReadSentinel: document.querySelector("#theoryReadSentinel"),
  theoryTestGuide: document.querySelector("#theoryTestGuide"),
  theoryTestBtn: document.querySelector("#theoryTestBtn"),
  airlineHubBackBtn: document.querySelector("#airlineHubBackBtn"),
  freeStudyBtn: document.querySelector("#freeStudyBtn"),
  parataCourseBtn: document.querySelector("#parataCourseBtn"),
  backToModeBtn: document.querySelector("#backToModeBtn"),
  contextTitle: document.querySelector("#contextTitle"),
  contextNote: document.querySelector("#contextNote"),
  subject: document.querySelector("#subjectFilter"),
  studyUnit: document.querySelector("#studyUnitFilter"),
  subunit: document.querySelector("#subunitFilter"),
  selectAllSubunits: document.querySelector("#selectAllSubunitsBtn"),
  clearSubunits: document.querySelector("#clearSubunitsBtn"),
  subunitSelectionInfo: document.querySelector("#subunitSelectionInfo"),
  scope: document.querySelector("#scopeFilter"),
  countMode: document.querySelector("#questionCountMode"),
  count: document.querySelector("#questionCount"),
  customCountWrap: document.querySelector("#customCountWrap"),
  mode: document.querySelector("#modeSelect"),
  shuffleChoices: document.querySelector("#shuffleChoices"),
  noFigureOnly: document.querySelector("#noFigureOnly"),
  start: document.querySelector("#startBtn"),
  bankInfo: document.querySelector("#bankInfo"),
  resetProgress: document.querySelector("#resetProgressBtn"),
  quizCard: document.querySelector("#quizCard"),
  resultCard: document.querySelector("#resultCard"),
  statsCard: document.querySelector("#statsCard"),
  statsBtn: document.querySelector("#statsBtn"),
  closeStats: document.querySelector("#closeStatsBtn"),
  errorsCard: document.querySelector("#errorsCard"),
  errorsBtn: document.querySelector("#errorsBtn"),
  closeErrors: document.querySelector("#closeErrorsBtn"),
  errorCountBadge: document.querySelector("#errorCountBadge"),
  errorsList: document.querySelector("#errorsList"),
  errorsEmpty: document.querySelector("#errorsEmpty"),
  copyErrors: document.querySelector("#copyErrorsBtn"),
  copyErrorsStatus: document.querySelector("#copyErrorsStatus"),
  resetErrors: document.querySelector("#resetErrorsBtn"),
  statsSummary: document.querySelector("#statsSummary"),
  weakestSu: document.querySelector("#weakestSu"),
  subjectStatsBody: document.querySelector("#subjectStatsBody"),
  suStatsBody: document.querySelector("#suStatsBody"),
  statsBody: document.querySelector("#statsBody"),
  progress: document.querySelector("#progress"),
  score: document.querySelector("#score"),
  meta: document.querySelector("#questionMeta"),
  question: document.querySelector("#questionText"),
  favorite: document.querySelector("#favoriteBtn"),
  examExclude: document.querySelector("#examExcludeBtn"),
  errorBtn: document.querySelector("#errorBtn"),
  figureArea: document.querySelector("#figureArea"),
  figureGallery: document.querySelector("#figureGallery"),
  figureNotice: document.querySelector("#figureNotice"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  next: document.querySelector("#nextBtn"),
  resultText: document.querySelector("#resultText"),
  examReview: document.querySelector("#examReview"),
  retryWrong: document.querySelector("#retryWrongBtn"),
  restart: document.querySelector("#restartBtn"),
};

let bank = [];
let session = [];
let index = 0;
let correctCount = 0;
let wrongQuestions = [];
let answered = false;
let examAnswers = {};
let progressStore = {};
let learningContext = {
  kind: "hub",
  label: "",
  allowedSubjects: null,
  lockedSubject: null,
  airline: null,
  baseNote: "",
};
let sessionMeta = {};
let theoryData = null;
let activeTheorySubject = null;
let currentTheoryStageIndex = 0;
let theoryReadObserver = null;

const BOOK_SUBJECTS = ["ATP Gleim", "검댕이 항공법규", "항공기상"];
const KOTSA_SUBJECTS = ["항공기상", "검댕이 항공법규"];
const PARATA_SUBJECTS = ["ATP Gleim", "검댕이 항공법규"];

function isExamLike() {
  return sessionMeta.type === "theoryTest" || els.mode.value === "exam" || els.mode.value === "mock";
}

function getAllowedSubjectSet() {
  return learningContext.allowedSubjects ? new Set(learningContext.allowedSubjects) : null;
}

function hideStudySurfaces() {
  [els.controlsCard, els.quizCard, els.resultCard, els.statsCard, els.errorsCard, els.theoryCard].forEach(el => el?.classList.add("hidden"));
}

function renderTopProgress() {
  if (!els.topProgressGrid || !bank.length) return;
  els.topProgressGrid.innerHTML = BOOK_SUBJECTS.map(subject => {
    const stats = aggregateStats(bank.filter(q => (q.subject || "미분류") === subject));
    const accuracy = stats.accuracyPct === null ? "-" : `${stats.accuracyPct}%`;
    return `
      <div class="top-progress-item">
        <div class="progress-name">${escapeHtml(subject)}</div>
        <div class="progress-numbers"><span>진행률 ${stats.progressPct}% (${stats.solved}/${stats.total})</span><span>정답률 ${accuracy}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${stats.progressPct}%"></div></div>
      </div>`;
  }).join("");
}

function showMainModeHub() {
  learningContext = { kind:"hub", label:"", allowedSubjects:null, lockedSubject:null, airline:null, baseNote:"" };
  hideStudySurfaces();
  els.textbookHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.modeHubCard?.classList.remove("hidden");
  renderTopProgress();
  window.scrollTo({top:0, behavior:"smooth"});
}

function showTextbookHub() {
  hideStudySurfaces();
  els.modeHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.textbookHubCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function showBookProblemHub() {
  hideStudySurfaces();
  els.modeHubCard?.classList.add("hidden");
  els.textbookHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function showBookTheoryHub() {
  hideStudySurfaces();
  els.modeHubCard?.classList.add("hidden");
  els.textbookHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function showAirlineHub() {
  hideStudySurfaces();
  els.modeHubCard?.classList.add("hidden");
  els.textbookHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.airlineHubCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function activateLearningContext({kind, label, allowedSubjects, lockedSubject=null, airline=null, note=""}) {
  learningContext = { kind, label, allowedSubjects, lockedSubject, airline, baseNote: note };
  els.modeHubCard?.classList.add("hidden");
  els.textbookHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.theoryCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.controlsCard?.classList.remove("hidden");
  els.quizCard?.classList.add("hidden");
  els.resultCard?.classList.add("hidden");
  els.contextTitle.textContent = label;
  els.contextNote.textContent = note;
  populateSubjects();
  applyModeUIState();
  updateAvailableCount();
  window.scrollTo({top:0, behavior:"smooth"});
}

function applyModeUIState() {
  const parataExam = learningContext.airline === "parata" && els.mode.value === "exam";
  const mock = els.mode.value === "mock";
  els.controlsCard?.classList.toggle("parata-exam-lock", parataExam);

  if (parataExam) {
    els.subject.value = "";
    els.scope.value = "all";
    els.countMode.value = "50";
    els.subject.disabled = true;
    els.studyUnit.disabled = true;
    els.scope.disabled = true;
    els.countMode.disabled = true;
    els.selectAllSubunits.disabled = true;
    els.clearSubunits.disabled = true;
    els.contextNote.textContent = "시험모드: 50문항 · ATP Gleim 70~80% + 검댕이 항공법규 20~30%";
  } else {
    els.subject.disabled = !!learningContext.lockedSubject;
    els.studyUnit.disabled = false;
    els.scope.disabled = false;
    els.countMode.disabled = mock;
    els.selectAllSubunits.disabled = false;
    els.clearSubunits.disabled = false;
    if (mock) {
      els.countMode.value = "25";
      els.contextNote.textContent = `${learningContext.label} · 모의시험 25문항 · 70점 이상 합격`;
    } else {
      els.contextNote.textContent = learningContext.baseNote || "";
    }
  }
  els.customCountWrap.classList.toggle("hidden", els.countMode.value !== "custom" || mock || parataExam);
  populateStudyUnits();
}



const THEORY_CONFIG = {
  "항공기상": {
    storageKey: "weatherAll",
    paths: ["./data/theory-weather-all.json", "./data/theory-weather-su3.json"],
    label: "항공기상 이론 학습",
    loadError: "항공기상 이론 학습 데이터를 불러오지 못했습니다."
  },
  "검댕이 항공법규": {
    storageKey: "airlawAll",
    paths: ["./data/theory-airlaw-all.json"],
    label: "검댕이 항공법규 이론 학습",
    loadError: "검댕이 항공법규 이론 학습 데이터를 불러오지 못했습니다."
  }
};

function getTheoryConfig() {
  return THEORY_CONFIG[activeTheorySubject] || THEORY_CONFIG["항공기상"];
}

function getTheoryRoot() {
  if (!progressStore.__theory || typeof progressStore.__theory !== "object") progressStore.__theory = {};
  const cfg = getTheoryConfig();
  if (cfg.storageKey === "weatherAll" && !progressStore.__theory.weatherAll) {
    const legacy = progressStore.__theory.weatherSu3;
    progressStore.__theory.weatherAll = legacy && typeof legacy === "object" ? legacy : { stages: {} };
  }
  if (!progressStore.__theory[cfg.storageKey] || typeof progressStore.__theory[cfg.storageKey] !== "object") {
    progressStore.__theory[cfg.storageKey] = { stages: {} };
  }
  if (!progressStore.__theory[cfg.storageKey].stages) progressStore.__theory[cfg.storageKey].stages = {};
  return progressStore.__theory[cfg.storageKey];
}

function getTheoryStageProgress(stageId) {
  const root = getTheoryRoot();
  if (!root.stages[stageId]) root.stages[stageId] = { read:false, passed:false, attempts:0, bestScore:0, lastScore:null, lastTakenAt:null };
  return root.stages[stageId];
}

function theoryStageUnlocked(stageIndex) {
  if (stageIndex <= 0) return true;
  if (!theoryData?.stages?.[stageIndex - 1]) return false;
  return !!getTheoryStageProgress(theoryData.stages[stageIndex - 1].id).passed;
}

async function loadTheoryData(subject = activeTheorySubject || "항공기상") {
  if (theoryData && activeTheorySubject === subject) return theoryData;
  activeTheorySubject = subject;
  theoryData = null;
  const cfg = getTheoryConfig();
  let lastError = null;
  for (const path of cfg.paths) {
    try {
      const res = await fetch(`${path}?v=${Date.now()}`, {cache:"no-store"});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      theoryData = await res.json();
      return theoryData;
    } catch (err) { lastError = err; }
  }
  throw lastError || new Error(cfg.loadError);
}

function renderTheoryStageList() {
  if (!theoryData || !els.theoryStageList) return;
  const completed = theoryData.stages.filter(s => getTheoryStageProgress(s.id).passed).length;
  els.theoryUnitProgress.textContent = `${completed} / ${theoryData.stages.length}단계 합격 · 쪽지시험 10문항 중 8문항 이상 정답 시 다음 단계 해제`;
  let previousUnit = null;
  let html = "";
  theoryData.stages.forEach((stage, i) => {
    if (stage.unit_title && stage.unit_title !== previousUnit) {
      html += `<div class="theory-unit-label">${escapeHtml(stage.unit_title)}</div>`;
      previousUnit = stage.unit_title;
    }
    const rec = getTheoryStageProgress(stage.id);
    const unlocked = theoryStageUnlocked(i);
    const active = i === currentTheoryStageIndex;
    const status = rec.passed ? `합격 · 최고 ${rec.bestScore}/10` : (unlocked ? (rec.lastScore === null ? "학습 가능" : `최근 ${rec.lastScore}/10`) : "잠김");
    html += `<button class="theory-stage-button ${active ? "active" : ""} ${rec.passed ? "passed" : ""}" data-theory-stage-index="${i}" type="button" ${unlocked ? "" : "disabled"}><span class="theory-stage-order">${i + 1}</span><span><strong>${escapeHtml(stage.title)}</strong><small>${escapeHtml(status)}</small></span><span class="theory-lock">${rec.passed ? "✓" : (unlocked ? "→" : "🔒")}</span></button>`;
  });
  els.theoryStageList.innerHTML = html;
}

function renderTheorySection(section) {
  let html = `<section class="theory-section"><h3>${escapeHtml(section.heading || "")}</h3>`;
  (section.paragraphs || []).forEach(p => { html += `<p>${escapeHtml(p)}</p>`; });
  if (section.bullets?.length) html += `<ul>${section.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (section.table?.rows?.length) {
    html += `<div class="theory-table-wrap"><table class="theory-table"><thead><tr>${(section.table.headers || []).map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${section.table.rows.map(row => `<tr>${row.map(v => `<td>${escapeHtml(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  if (section.figure?.src) html += `<figure class="theory-figure"><img src="${escapeHtml(section.figure.src)}" alt="${escapeHtml(section.figure.caption || section.heading || "교재 그림")}" loading="lazy"><figcaption>${escapeHtml(section.figure.caption || "")}</figcaption></figure>`;
  html += `</section>`;
  return html;
}

function markTheoryRead(stage) {
  const rec = getTheoryStageProgress(stage.id);
  if (!rec.read) { rec.read = true; saveProgress(); }
  els.theoryTestBtn.disabled = false;
  els.theoryTestBtn.textContent = rec.passed ? "쪽지시험 재응시" : "쪽지시험 응시";
  els.theoryTestGuide.textContent = rec.passed ? `이미 합격한 단계입니다. 최고 ${rec.bestScore}/10 · 원하면 다시 응시할 수 있습니다.` : "기존 문제은행의 이 단계 관련 문항에서 10문항을 무작위 출제합니다. 8문항 이상 정답이면 합격입니다.";
}

function setupTheoryReadGate(stage) {
  if (theoryReadObserver) { theoryReadObserver.disconnect(); theoryReadObserver = null; }
  const rec = getTheoryStageProgress(stage.id);
  if (rec.read || rec.passed) { markTheoryRead(stage); return; }
  els.theoryTestBtn.disabled = true;
  els.theoryTestBtn.textContent = "끝까지 읽으면 응시 가능";
  els.theoryTestGuide.textContent = "이론을 끝까지 읽으면 버튼이 활성화됩니다. 기존 문제은행에서 10문항이 무작위 출제되며 8문항 이상 맞아야 합격입니다.";
  if (!els.theoryReadSentinel || !window.IntersectionObserver) return;
  theoryReadObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      markTheoryRead(stage);
      theoryReadObserver?.disconnect();
      theoryReadObserver = null;
    }
  }, {threshold:0.5});
  theoryReadObserver.observe(els.theoryReadSentinel);
}

function renderTheoryStage(stageIndex) {
  if (!theoryData?.stages?.length) return;
  if (!theoryStageUnlocked(stageIndex)) return;
  currentTheoryStageIndex = stageIndex;
  const stage = theoryData.stages[stageIndex];
  const rec = getTheoryStageProgress(stage.id);
  if (els.theoryEyebrow) els.theoryEyebrow.textContent = `${theoryData?.metadata?.subject || activeTheorySubject || "교재"} 이론 학습`;
  if (els.theoryUnitTitle) els.theoryUnitTitle.textContent = stage.unit_title || theoryData?.metadata?.name || "이론 학습";
  els.theoryStageNumber.textContent = `${stageIndex + 1} / ${theoryData.stages.length}`;
  els.theoryStageStatus.textContent = rec.passed ? `합격 · 최고 ${rec.bestScore}/10` : (rec.lastScore === null ? "미응시" : `최근 ${rec.lastScore}/10`);
  els.theoryStageStatus.className = `theory-status-badge ${rec.passed ? "passed" : ""}`;
  els.theoryStageTitle.textContent = stage.title;
  const sourceName = theoryData?.metadata?.source_file || "교재";
  const printed = (stage.source_printed_pages || []).join("–");
  const pdfPages = (stage.source_pdf_pages || []).join("–");
  els.theoryContent.innerHTML = (stage.sections || []).map(renderTheorySection).join("") + `<section class="theory-summary"><h3>시험 직전 핵심</h3><ul>${(stage.summary_points || []).map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul><p class="theory-source">교재 범위: ${escapeHtml(sourceName)}${printed ? ` 인쇄 p.${escapeHtml(printed)}` : ""}${pdfPages ? ` · PDF p.${escapeHtml(pdfPages)}` : ""}</p></section>`;
  renderTheoryStageList();
  setupTheoryReadGate(stage);
  els.theoryCard.scrollIntoView({behavior:"smooth", block:"start"});
}


async function openTheory(subject) {
  try {
    await loadTheoryData(subject);
    hideStudySurfaces();
    els.modeHubCard?.classList.add("hidden");
    els.textbookHubCard?.classList.add("hidden");
    els.bookProblemHubCard?.classList.add("hidden");
    els.bookTheoryHubCard?.classList.add("hidden");
    els.airlineHubCard?.classList.add("hidden");
    els.theoryCard?.classList.remove("hidden");
    const firstNotPassed = theoryData.stages.findIndex((s, i) => theoryStageUnlocked(i) && !getTheoryStageProgress(s.id).passed);
    renderTheoryStage(firstNotPassed >= 0 ? firstNotPassed : theoryData.stages.length - 1);
  } catch (err) {
    console.error(err);
    const cfg = THEORY_CONFIG[subject] || {};
    alert(`${cfg.loadError || "이론 학습 데이터를 불러오지 못했습니다."}\n관련 data JSON 파일을 확인해 주세요.`);
  }
}

function openWeatherTheory() { return openTheory("항공기상"); }
function openAirlawTheory() { return openTheory("검댕이 항공법규"); }

function getCurrentTheoryStage() {
  return theoryData?.stages?.[currentTheoryStageIndex] || null;
}

function getTheoryQuestionPool(stage) {
  const wanted = new Set(stage?.question_ids || []);
  return bank.filter(q => wanted.has(q.id))
    .filter(q => !progressStore[q.id]?.errorReported)
    .filter(q => !progressStore[q.id]?.examExcluded);
}

function startTheoryTest(stage = getCurrentTheoryStage()) {
  if (!stage) return;
  const rec = getTheoryStageProgress(stage.id);
  if (!rec.read && !rec.passed) { alert("이론을 끝까지 읽은 뒤 쪽지시험에 응시해 주세요."); return; }
  const pool = getTheoryQuestionPool(stage);
  if (pool.length < 10) { alert(`쪽지시험에 필요한 문제는 10문항이지만 현재 사용 가능한 문제는 ${pool.length}문항입니다. 오류/시험 제외 표시를 확인해 주세요.`); return; }
  session = shuffle(pool).slice(0, 10);
  sessionMeta = {type:"theoryTest", theorySubject:activeTheorySubject, theoryStageId:stage.id, theoryStageIndex:currentTheoryStageIndex, theoryStageTitle:stage.title};
  index = 0; correctCount = 0; wrongQuestions = []; examAnswers = {};
  els.theoryCard.classList.add("hidden");
  els.resultCard.classList.add("hidden");
  els.statsCard.classList.add("hidden");
  els.errorsCard.classList.add("hidden");
  els.quizCard.classList.remove("hidden");
  renderQuestion();
  els.quizCard.scrollIntoView({behavior:"smooth", block:"start"});
}

function recordTheoryTestResult() {
  if (sessionMeta.type !== "theoryTest") return false;
  const stage = theoryData?.stages?.find(s => s.id === sessionMeta.theoryStageId);
  if (!stage) return false;
  const rec = getTheoryStageProgress(stage.id);
  rec.attempts = (rec.attempts || 0) + 1;
  rec.lastScore = correctCount;
  rec.bestScore = Math.max(rec.bestScore || 0, correctCount);
  rec.lastTakenAt = new Date().toISOString();
  if (correctCount >= 8) rec.passed = true;
  saveProgress();
  renderTheoryStageList();
  return !!rec.passed;
}

function returnFromTheoryResult({advance=false} = {}) {
  els.resultCard.classList.add("hidden");
  els.quizCard.classList.add("hidden");
  els.theoryCard.classList.remove("hidden");
  const idx = Math.max(0, Number(sessionMeta.theoryStageIndex ?? currentTheoryStageIndex));
  const next = advance && idx < (theoryData?.stages?.length || 0) - 1 ? idx + 1 : idx;
  sessionMeta = {};
  renderTheoryStage(next);
}

function configureUserStorage(user) {
  currentUser = user || null;
  STORAGE_KEY = window.PilotBankAuth?.progressStorageKey(BASE_STORAGE_KEY) || BASE_STORAGE_KEY;
}

function maybeImportLegacyProgress() {
  if (STORAGE_KEY === LEGACY_STORAGE_KEY) return;
  try {
    if (localStorage.getItem(STORAGE_KEY) !== null) return;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return;

    const ok = confirm(`기존 v11.2 브라우저 학습기록이 있습니다.\n\n이 기록을 ${currentUser || "현재"} 계정으로 가져올까요?\n(원본 기록은 삭제하지 않습니다.)`);
    if (ok) localStorage.setItem(STORAGE_KEY, legacy);
  } catch (err) {
    console.warn("기존 학습기록 가져오기 확인 실패", err);
  }
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressStore));
    return true;
  } catch (err) {
    // 저장소가 차단되거나 용량 제한에 걸려도 현재 세션 기능은 계속 동작시킵니다.
    console.warn("학습기록을 LocalStorage에 저장하지 못했습니다.", err);
    return false;
  }
}

function getRecord(id) {
  if (!progressStore[id]) {
    progressStore[id] = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      lastResult: null,
      lastAnswer: null,
      lastAttempted: null,
      favorite: false,
      examExcluded: false,
      errorReported: false,
      errorReportedAt: null,
      errorNote: "",
      errorQuestionSnapshot: "",
      errorChoicesSnapshot: [],
      errorSubjectSnapshot: "",
      errorUnitSnapshot: "",
      errorSubunitSnapshot: "",
    };
  }
  return progressStore[id];
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function studyUnitOf(q) {
  return String(
    q.study_unit ??
    q.studyUnit ??
    q.unit ??
    (typeof q.subunit?.code === "string" ? q.subunit.code.split(".")[0] : "") ??
    ""
  );
}

function subunitCode(q) {
  if (typeof q.subunit === "string") return q.subunit;
  return q.subunit?.code || q.category_code || "";
}

function subunitTitle(q) {
  if (typeof q.subunit === "string") return q.subunit;
  return q.subunit?.title || q.category || "";
}

function normalizeChoices(q) {
  if (Array.isArray(q.choices)) {
    return q.choices.map((c, i) => ({
      id: String(c.id ?? String.fromCharCode(65 + i)).toUpperCase(),
      text: String(c.text ?? c),
    }));
  }
  if (q.choices && typeof q.choices === "object") {
    return Object.entries(q.choices).map(([id, text]) => ({
      id: String(id).toUpperCase(),
      text: String(text),
    }));
  }
  return [];
}

async function loadBank() {
  try {
    let data = null;
    let lastError = null;
    for (const path of [DATA_PATH, "./data/questions.json"]) {
      try {
        const dataUrl = `${path}?v=${Date.now()}`;
        const res = await fetch(dataUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!data) throw lastError || new Error("문제 데이터 로드 실패");
    bank = Array.isArray(data) ? data : (data.questions || []);

    const subjectCounts = new Map();
    bank.forEach(q => {
      const subject = q.subject || "미분류";
      subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
    });
    const breakdown = [...subjectCounts.entries()]
      .map(([subject, count]) => `${subject} ${count.toLocaleString()}`)
      .join(" · ");

    const dataRevision = (!Array.isArray(data) && data?.metadata?.data_revision) ? data.metadata.data_revision : "";
    els.bankInfo.textContent = `총 ${bank.length.toLocaleString()}문제${breakdown ? ` · ${breakdown}` : ""}${dataRevision ? ` · 데이터 ${dataRevision}` : ""}`;
    updateErrorCount();
    populateSubjects();
  } catch (err) {
    els.bankInfo.textContent = "문제 데이터를 불러오지 못했습니다. GitHub Pages 또는 로컬 HTTP 서버에서 실행하세요.";
    console.error(err);
  }
}

function populateSubjects() {
  const counts = new Map();
  bank.forEach(q => {
    const subject = q.subject || "미분류";
    counts.set(subject, (counts.get(subject) || 0) + 1);
  });

  const allowed = getAllowedSubjectSet();
  const preferred = SUBJECTS.filter(subject => (counts.get(subject) || 0) > 0 && (!allowed || allowed.has(subject)));
  const extras = [...counts.keys()]
    .filter(subject => !SUBJECTS.includes(subject) && (!allowed || allowed.has(subject)))
    .sort((a, b) => a.localeCompare(b, "ko"));
  const visibleSubjects = [...preferred, ...extras];
  const visibleTotal = bank.filter(q => !allowed || allowed.has(q.subject || "미분류")).length;

  if (learningContext.lockedSubject) {
    const s = learningContext.lockedSubject;
    els.subject.innerHTML = `<option value="${escapeHtml(s)}">${escapeHtml(s)} (${(counts.get(s)||0).toLocaleString()})</option>`;
    els.subject.value = s;
  } else {
    els.subject.innerHTML = `<option value="">전체 허용 교재 (${visibleTotal.toLocaleString()})</option>` +
      visibleSubjects.map(subject => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)} (${(counts.get(subject)||0).toLocaleString()})</option>`).join("");
  }
  populateStudyUnits();
}

function populateStudyUnits() {
  const subject = els.subject.value;
  let filtered = bank;
  const allowed = getAllowedSubjectSet();
  if (allowed) filtered = filtered.filter(q => allowed.has(q.subject || "미분류"));
  if (subject) filtered = filtered.filter(q => (q.subject || "미분류") === subject);

  const units = [...new Set(filtered.map(studyUnitOf).filter(Boolean))]
    .sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));

  els.studyUnit.innerHTML = `<option value="">전체</option>` +
    units.map(u => `<option value="${escapeHtml(u)}">SU ${escapeHtml(u)}</option>`).join("");

  populateSubunits();
}

function populateSubunits() {
  const subject = els.subject.value;
  const unit = els.studyUnit.value;
  let filtered = bank;
  const allowed = getAllowedSubjectSet();
  if (allowed) filtered = filtered.filter(q => allowed.has(q.subject || "미분류"));

  if (subject) filtered = filtered.filter(q => (q.subject || "미분류") === subject);
  if (unit) filtered = filtered.filter(q => studyUnitOf(q) === unit);

  const subunits = new Map();
  filtered.forEach(q => {
    const code = subunitCode(q);
    const title = subunitTitle(q);
    if (code || title) subunits.set(`${code}||${title}`, {code, title});
  });

  const sorted = [...subunits.values()]
    .sort((a,b) => a.code.localeCompare(b.code, undefined, {numeric:true}));

  els.subunit.innerHTML = sorted.map((s, i) => {
    const value = `${s.code}||${s.title}`;
    const label = [s.code, s.title].filter(Boolean).join(" ");
    return `
      <label class="subunit-option">
        <input type="checkbox" name="subunitFilter" value="${escapeHtml(value)}" />
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }).join("");

  els.subunit.querySelectorAll('input[name="subunitFilter"]').forEach(input => {
    input.addEventListener("change", () => {
      updateSubunitSelectionInfo();
      updateAvailableCount();
    });
  });

  updateSubunitSelectionInfo();
  updateAvailableCount();
}

function getSelectedSubunits() {
  return [...els.subunit.querySelectorAll('input[name="subunitFilter"]:checked')]
    .map(input => input.value);
}

function updateSubunitSelectionInfo() {
  const all = [...els.subunit.querySelectorAll('input[name="subunitFilter"]')];
  const selected = getSelectedSubunits();

  if (!all.length) {
    els.subunitSelectionInfo.textContent = "소단원 없음";
  } else if (!selected.length || selected.length === all.length) {
    els.subunitSelectionInfo.textContent = `전체 ${all.length}개 소단원`;
  } else {
    els.subunitSelectionInfo.textContent = `${selected.length} / ${all.length}개 선택`;
  }
}

function selectAllSubunits() {
  els.subunit.querySelectorAll('input[name="subunitFilter"]').forEach(input => {
    input.checked = true;
  });
  updateSubunitSelectionInfo();
  updateAvailableCount();
}

function clearSubunits() {
  els.subunit.querySelectorAll('input[name="subunitFilter"]').forEach(input => {
    input.checked = false;
  });
  updateSubunitSelectionInfo();
  updateAvailableCount();
}

function matchesScope(q) {
  const rec = progressStore[q.id] || {};
  switch (els.scope.value) {
    case "wrong": return (rec.incorrect || 0) > 0;
    case "favorite": return !!rec.favorite;
    case "examExcluded": return !!rec.examExcluded;
    case "unseen": return !rec.attempts;
    default: return true;
  }
}

function hasFigure(q) {
  if (q.requires_figure) return true;
  if (Array.isArray(q.figure_refs) && q.figure_refs.length) return true;
  if (Array.isArray(q.images) && q.images.length) return true;
  if (q.image || q.image_path) return true;

  // OCR/구형 데이터에서 Figure 메타데이터가 빠졌어도,
  // 문제 자체가 그림·도표·일기도 참조를 명시하면 그림 문제로 취급합니다.
  const text = String(q.question || "");
  const figureCue = /(?:\bfigure\b|그림\s*\d*|다음\s*(?:그림|도표|일기도|기상도)|(?:그림|도표|일기도|기상도)\s*(?:을|를|의|에서|참조)|참조\s*(?:그림|도표|일기도|기상도))/i;
  return figureCue.test(text);
}

function getFilteredBank() {
  const subject = els.subject.value;
  const unit = els.studyUnit.value;
  const selectedSubunits = getSelectedSubunits();

  const allowed = getAllowedSubjectSet();

  return bank.filter(q => {
    if (progressStore[q.id]?.errorReported) return false;
    if (allowed && !allowed.has(q.subject || "미분류")) return false;
    if (subject && (q.subject || "미분류") !== subject) return false;
    if (unit && studyUnitOf(q) !== unit) return false;

    if (selectedSubunits.length) {
      const key = `${subunitCode(q)}||${subunitTitle(q)}`;
      if (!selectedSubunits.includes(key)) return false;
    }

    if (!matchesScope(q)) return false;
    if (els.noFigureOnly.checked && hasFigure(q)) return false;
    return true;
  });
}

function updateAvailableCount() {
  const filtered = getFilteredBank();
  els.bankInfo.textContent = `선택 범위 ${filtered.length.toLocaleString()}문제 / 전체 ${bank.length.toLocaleString()}문제`;
  els.count.max = Math.max(1, filtered.length);

  if (els.countMode.value === "custom" && filtered.length && Number(els.count.value) > filtered.length) {
    els.count.value = filtered.length;
  }
}

function buildParataExamSession() {
  const base = bank.filter(q => PARATA_SUBJECTS.includes(q.subject || "미분류"))
    .filter(q => !(progressStore[q.id]?.errorReported))
    .filter(q => !(progressStore[q.id]?.examExcluded))
    .filter(q => !els.noFigureOnly.checked || !hasFigure(q));
  const gleim = base.filter(q => q.subject === "ATP Gleim");
  const law = base.filter(q => q.subject === "검댕이 항공법규");
  const gleimCount = 35 + Math.floor(Math.random() * 6); // 35~40 = 70~80%
  const lawCount = 50 - gleimCount; // 10~15 = 20~30%
  if (gleim.length < gleimCount || law.length < lawCount) {
    alert(`파라타항공 시험모드에 필요한 문제가 부족합니다.\nATP Gleim ${gleim.length}/${gleimCount}, 검댕이 항공법규 ${law.length}/${lawCount}`);
    return null;
  }
  const picked = [...shuffle(gleim).slice(0, gleimCount), ...shuffle(law).slice(0, lawCount)];
  return {questions: shuffle(picked), gleimCount, lawCount};
}

function startSession(source = null) {
  sessionMeta = {};

  if (!source && learningContext.airline === "parata" && els.mode.value === "exam") {
    const built = buildParataExamSession();
    if (!built) return;
    session = built.questions;
    sessionMeta = {type:"parataExam", gleimCount:built.gleimCount, lawCount:built.lawCount};
  } else {
    let pool = source || getFilteredBank();
    pool = pool.filter(q => !(progressStore[q.id]?.errorReported));
    if (els.noFigureOnly.checked) pool = pool.filter(q => !hasFigure(q));
    if (isExamLike()) pool = pool.filter(q => !(progressStore[q.id]?.examExcluded));

    if (!pool.length) {
      alert(isExamLike() ? "시험에서 출제할 문제가 없습니다. 제외/오류 표시를 확인해 주세요." : "출제할 문제가 없습니다.");
      return;
    }

    let requested;
    if (source) requested = pool.length;
    else if (els.mode.value === "mock") requested = 25;
    else if (els.countMode.value === "all") requested = pool.length;
    else if (els.countMode.value === "custom") requested = Math.max(1, Number(els.count.value) || 20);
    else requested = Math.max(1, Number(els.countMode.value) || 20);

    if (!source && els.mode.value === "mock" && pool.length < 25) {
      alert(`모의시험은 25문항이 필요하지만 현재 출제 가능 문제는 ${pool.length}문항입니다.`);
      return;
    }
    session = shuffle(pool).slice(0, Math.min(requested, pool.length));
    sessionMeta = {type: els.mode.value === "mock" ? "mock" : els.mode.value};
  }

  index = 0;
  correctCount = 0;
  wrongQuestions = [];
  examAnswers = {};

  els.resultCard.classList.add("hidden");
  els.statsCard.classList.add("hidden");
  els.errorsCard.classList.add("hidden");
  els.quizCard.classList.remove("hidden");

  renderQuestion();
  els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderQuestion() {
  answered = false;
  const q = session[index];

  els.progress.textContent = `${index + 1} / ${session.length}`;
  els.score.textContent = sessionMeta.type === "theoryTest" ? "쪽지시험 · 10문항" : (isExamLike() ? (els.mode.value === "mock" ? "모의시험" : "시험모드") : `정답 ${correctCount}`);
  els.question.textContent = q.question || "(문제 없음)";
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";

  const pills = [q.id, q.subject, studyUnitOf(q) ? `SU ${studyUnitOf(q)}` : "", [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ")].filter(Boolean);
  els.meta.innerHTML = pills.map(p => `<span class="pill">${escapeHtml(p)}</span>`).join("");

  const rec = getRecord(q.id);

  els.errorBtn.classList.toggle("reported", !!rec.errorReported);
  els.errorBtn.textContent = rec.errorReported ? "REPORTED" : "ERROR";
  els.errorBtn.title = rec.errorReported
    ? "이미 오류 신고된 문제"
    : "문제 오류 신고 · 신고 후 자동 건너뛰기";

  els.favorite.textContent = rec.favorite ? "★" : "☆";
  els.favorite.classList.toggle("active", rec.favorite);

  els.examExclude.textContent = "!";
  els.examExclude.classList.toggle("exclude-active", !!rec.examExcluded);
  els.examExclude.title = rec.examExcluded
    ? "시험모드 출제 제외됨 · 클릭하면 해제"
    : "시험모드 출제 제외 · 학습모드에는 계속 표시";

  renderFigure(q);

  let choices = normalizeChoices(q);
  if (els.shuffleChoices.checked) choices = shuffle(choices);

  els.choices.innerHTML = "";
  const existing = examAnswers[q.id];

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.dataset.choiceId = choice.id;
    btn.innerHTML = `<strong>${escapeHtml(choice.id)}.</strong> ${escapeHtml(choice.text)}`;

    if (isExamLike() && existing === choice.id) btn.classList.add("selected");

    btn.addEventListener("click", () => {
      if (isExamLike()) selectExamAnswer(choice.id);
      else answerStudy(choice.id, btn);
    });

    els.choices.appendChild(btn);
  });

  if (isExamLike()) {
    els.next.textContent = index === session.length - 1 ? (els.mode.value === "mock" ? "모의시험 제출" : "시험 제출") : "다음 문제";
    els.next.classList.remove("hidden");
  } else {
    els.next.classList.add("hidden");
  }
}

function renderFigure(q) {
  els.figureArea.classList.add("hidden");
  els.figureNotice.classList.add("hidden");
  els.figureGallery.innerHTML = "";

  const refs = Array.isArray(q.figure_refs) ? q.figure_refs.map(String) : [];

  let paths = [];
  if (Array.isArray(q.images) && q.images.length) {
    paths = q.images;
  } else if (q.image || q.image_path) {
    paths = [q.image || q.image_path];
  } else if (refs.length) {
    paths = refs.map(ref => {
      const clean = String(ref).replace(/^FIGURE[_ -]*/i, "");
      return `./figures/FIGURE_${clean}.png`;
    });
  }

  if (!paths.length) {
    if (q.requires_figure || refs.length) {
      els.figureNotice.textContent = `그림/도표 참조 문제${refs.length ? ` · Figure ${refs.join(", ")}` : ""}`;
      els.figureNotice.classList.remove("hidden");
    }
    return;
  }

  let loaded = 0;
  let failed = 0;

  paths.forEach((path, i) => {
    const item = document.createElement("figure");
    item.className = "figure-item";

    const img = document.createElement("img");
    img.alt = refs[i] ? `Figure ${refs[i]}` : `문제 Figure ${i + 1}`;
    img.loading = "eager";

    const caption = document.createElement("figcaption");
    caption.className = "muted";
    caption.textContent = refs[i] ? `Figure ${refs[i]}` : "";

    img.addEventListener("load", () => {
      loaded++;
      item.classList.remove("hidden");
      els.figureArea.classList.remove("hidden");
      els.figureNotice.classList.add("hidden");
    });

    img.addEventListener("error", () => {
      failed++;
      item.remove();

      if (failed === paths.length && loaded === 0) {
        els.figureArea.classList.add("hidden");
        els.figureNotice.textContent =
          `Figure 이미지 파일을 찾지 못했습니다.${refs.length ? ` 참조: ${refs.join(", ")}` : ""}`;
        els.figureNotice.classList.remove("hidden");
      }
    });

    item.appendChild(img);
    if (caption.textContent) item.appendChild(caption);
    els.figureGallery.appendChild(item);

    img.src = path.startsWith("./") ? path : `./${path.replace(/^\/+/, "")}`;
  });
}

function selectExamAnswer(choiceId) {
  const q = session[index];
  examAnswers[q.id] = choiceId;

  [...els.choices.querySelectorAll(".choice")].forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.choiceId === choiceId);
  });
}

function answerStudy(selected, clickedButton) {
  if (answered) return;
  answered = true;

  const q = session[index];
  const correct = String(q.answer || "").toUpperCase();
  const isCorrect = selected.toUpperCase() === correct;

  recordAttempt(q, selected, isCorrect);

  if (isCorrect) correctCount++;
  else wrongQuestions.push(q);

  [...els.choices.querySelectorAll(".choice")].forEach(btn => {
    btn.disabled = true;
    const id = btn.dataset.choiceId.toUpperCase();
    if (id === correct) btn.classList.add("correct");
    if (btn === clickedButton && !isCorrect) btn.classList.add("incorrect");
  });

  const explanation = q.explanation ? `\n\n${q.explanation}` : "";
  const reference = q.reference ? `\n\n출처: ${q.reference}` : "";

  els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  els.feedback.textContent = `${isCorrect ? "정답입니다." : `오답입니다. 정답: ${correct}`}${explanation}${reference}`;

  els.score.textContent = `정답 ${correctCount}`;
  els.next.textContent = index === session.length - 1 ? "결과 보기" : "다음 문제";
  els.next.classList.remove("hidden");
}

function recordAttempt(q, selected, isCorrect) {
  const rec = getRecord(q.id);
  rec.attempts++;
  if (isCorrect) rec.correct++;
  else rec.incorrect++;
  rec.lastResult = isCorrect ? "correct" : "incorrect";
  rec.lastAnswer = selected;
  rec.lastAttempted = new Date().toISOString();
  saveProgress();
  renderTopProgress();
}

function nextQuestion() {
  if (!isExamLike() && !answered) return;

  if (isExamLike() && index === session.length - 1) {
    gradeExam();
    return;
  }

  if (index < session.length - 1) {
    index++;
    renderQuestion();
    els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    showResult();
  }
}

function gradeExam() {
  correctCount = 0;
  wrongQuestions = [];

  session.forEach(q => {
    const selected = examAnswers[q.id] || null;
    const correct = String(q.answer || "").toUpperCase();
    const isCorrect = selected === correct;

    recordAttempt(q, selected, isCorrect);

    if (isCorrect) correctCount++;
    else wrongQuestions.push(q);
  });

  showResult(true);
}

function showResult(showReview = false) {
  els.quizCard.classList.add("hidden");
  els.resultCard.classList.remove("hidden");

  const pct = Math.round((correctCount / session.length) * 100);
  els.resultText.classList.remove("mock-result", "mock-pass", "mock-fail");
  if (sessionMeta.type === "theoryTest") {
    const passed = recordTheoryTestResult();
    els.resultText.textContent = `쪽지시험 · 10문항 중 ${correctCount}문항 정답 · ${passed ? "합격" : "불합격"} · ${passed ? "다음 이론 단계가 해제되었습니다." : "8문항 이상 맞아야 다음 단계로 넘어갈 수 있습니다."}`;
    els.resultText.classList.add("mock-result", passed ? "mock-pass" : "mock-fail");
    els.retryWrong.disabled = false;
    els.retryWrong.classList.remove("hidden");
    els.retryWrong.textContent = passed ? "쪽지시험 다시 보기" : "쪽지시험 재응시";
    const isLast = Number(sessionMeta.theoryStageIndex) >= (theoryData?.stages?.length || 1) - 1;
    els.restart.textContent = passed ? (isLast ? "이론 학습 완료" : "다음 이론으로") : "이론 다시 보기";
  } else if (els.mode.value === "mock") {
    const passed = pct >= 70;
    els.resultText.textContent = `100점 만점 ${pct}점 · ${passed ? "합격" : "불합격"} · ${session.length}문제 중 ${correctCount}문제 정답`;
    els.resultText.classList.add("mock-result", passed ? "mock-pass" : "mock-fail");
  } else if (sessionMeta.type === "parataExam") {
    els.resultText.textContent = `파라타항공 대비 시험 · ${session.length}문제 중 ${correctCount}문제 정답 · ${pct}% · ATP Gleim ${sessionMeta.gleimCount} / 검댕이 항공법규 ${sessionMeta.lawCount}`;
  } else {
    els.resultText.textContent = `${session.length}문제 중 ${correctCount}문제 정답 · ${pct}% · 오답 ${wrongQuestions.length}문제`;
  }

  els.retryWrong.disabled = wrongQuestions.length === 0;
  els.examReview.innerHTML = "";

  if (showReview) {
    els.examReview.innerHTML = session.map(q => {
      const selected = examAnswers[q.id] || "미응답";
      const correct = String(q.answer || "").toUpperCase();
      const ok = selected === correct;
      return `
        <div class="review-item ${ok ? "good" : "bad"}">
          <p><strong>${escapeHtml(q.id)}</strong> · ${ok ? "정답" : "오답"}</p>
          <p>${escapeHtml(q.question)}</p>
          <p>선택: <strong>${escapeHtml(selected)}</strong> / 정답: <strong>${escapeHtml(correct)}</strong></p>
          ${q.explanation ? `<p class="muted">${escapeHtml(q.explanation)}</p>` : ""}
        </div>`;
    }).join("");
  }

  if (sessionMeta.type !== "theoryTest") {
    els.retryWrong.classList.remove("hidden");
    els.retryWrong.textContent = "오답만 다시";
    els.restart.textContent = "처음으로";
  }
  renderTopProgress();
  els.resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleFavorite() {
  const q = session[index];
  const rec = getRecord(q.id);
  rec.favorite = !rec.favorite;
  saveProgress();
  els.favorite.textContent = rec.favorite ? "★" : "☆";
  els.favorite.classList.toggle("active", rec.favorite);
  updateAvailableCount();
}

function toggleExamExcluded() {
  const q = session[index];
  const rec = getRecord(q.id);
  rec.examExcluded = !rec.examExcluded;
  saveProgress();

  els.examExclude.classList.toggle("exclude-active", !!rec.examExcluded);
  els.examExclude.title = rec.examExcluded
    ? "시험모드 출제 제외됨 · 클릭하면 해제"
    : "시험모드 출제 제외 · 학습모드에는 계속 표시";

  updateAvailableCount();
}


function getReportedRecords() {
  return Object.entries(progressStore)
    .filter(([, rec]) => rec?.errorReported)
    .map(([id, rec]) => {
      const q = bank.find(item => item.id === id);
      return { id, rec, q };
    })
    .sort((a, b) => (b.rec.errorReportedAt || "").localeCompare(a.rec.errorReportedAt || ""));
}

function updateErrorCount() {
  const count = Object.values(progressStore).filter(rec => rec?.errorReported).length;
  els.errorCountBadge.textContent = count.toLocaleString();
  els.errorsBtn.title = `오류 신고 ${count}문제`;
}

function errorChoicesFor(q, rec) {
  if (q) return normalizeChoices(q).map(c => `${c.id}. ${c.text}`);
  if (Array.isArray(rec.errorChoicesSnapshot)) return rec.errorChoicesSnapshot;
  return [];
}

function reportCurrentError() {
  const q = session[index];
  if (!q) return;

  const rec = getRecord(q.id);
  if (!rec.errorReported) {
    rec.errorReported = true;
    rec.errorReportedAt = new Date().toISOString();
    rec.errorNote = rec.errorNote || "";
    rec.errorQuestionSnapshot = q.question || "";
    rec.errorChoicesSnapshot = normalizeChoices(q).map(c => `${c.id}. ${c.text}`);
    rec.errorSubjectSnapshot = q.subject || "미분류";
    rec.errorUnitSnapshot = studyUnitOf(q);
    rec.errorSubunitSnapshot = [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ");
  }

  // 학습모드에서 이미 이 문제를 채점한 뒤 ERROR를 누른 경우,
  // 현재 세션 점수/오답목록에서는 해당 문제를 제외합니다.
  if (els.mode.value === "study" && answered) {
    const lastResult = rec.lastResult;
    if (lastResult === "correct" && correctCount > 0) {
      correctCount--;
    } else if (lastResult === "incorrect") {
      const pos = wrongQuestions.findIndex(item => item.id === q.id);
      if (pos >= 0) wrongQuestions.splice(pos, 1);
    }
  }

  delete examAnswers[q.id];
  saveProgress();
  updateErrorCount();

  // 현재 세션 자체에서 제거하여 즉시 다음 문제로 건너뜁니다.
  session.splice(index, 1);
  if (sessionMeta.type === "theoryTest") {
    const stage = theoryData?.stages?.find(s => s.id === sessionMeta.theoryStageId);
    const used = new Set(session.map(item => item.id));
    const replacement = shuffle(getTheoryQuestionPool(stage).filter(item => !used.has(item.id)))[0];
    if (replacement) session.push(replacement);
  }
  updateAvailableCount();

  if (!session.length) {
    els.quizCard.classList.add("hidden");
    els.resultCard.classList.remove("hidden");
    els.resultText.textContent = "현재 세션의 모든 문제가 오류 신고되어 자동 제외되었습니다.";
    els.examReview.innerHTML = "";
    els.retryWrong.disabled = true;
    els.resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  // 신고한 문제가 세션의 마지막 문제였으면 바로 결과로 이동합니다.
  if (index >= session.length) {
    if (isExamLike()) {
      gradeExam();
    } else {
      showResult(false);
    }
    return;
  }

  // 같은 index에는 splice 후 다음 문제가 들어와 있으므로 즉시 렌더링합니다.
  renderQuestion();
  els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function restoreErrorReport(id) {
  const rec = progressStore[id];
  if (!rec) return;

  rec.errorReported = false;
  rec.errorReportedAt = null;
  saveProgress();
  updateErrorCount();
  updateAvailableCount();
  renderErrorReports();
}

function updateErrorNote(id, note) {
  const rec = progressStore[id];
  if (!rec) return;
  rec.errorNote = note;
  saveProgress();
}

function renderErrorReports() {
  const reports = getReportedRecords();
  els.errorsEmpty.classList.toggle("hidden", reports.length > 0);
  els.errorsList.innerHTML = "";

  reports.forEach(({ id, rec, q }) => {
    const subject = q?.subject || rec.errorSubjectSnapshot || "미분류";
    const unit = q ? studyUnitOf(q) : (rec.errorUnitSnapshot || "");
    const subunit = q
      ? [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ")
      : (rec.errorSubunitSnapshot || "");
    const question = q?.question || rec.errorQuestionSnapshot || "(지문 없음)";
    const choices = errorChoicesFor(q, rec);

    const item = document.createElement("article");
    item.className = "error-report-item";
    item.innerHTML = `
      <div class="error-report-head">
        <div>
          <strong>${escapeHtml(id)}</strong>
          <div class="muted">${escapeHtml(subject)}${unit ? ` · SU ${escapeHtml(unit)}` : ""}${subunit ? ` · ${escapeHtml(subunit)}` : ""}</div>
        </div>
        <button type="button" class="mini-button secondary restore-error-button">오류 해제</button>
      </div>

      <p class="error-question">${escapeHtml(question)}</p>

      ${choices.length ? `
        <div class="error-choice-list">
          ${choices.map(choice => `<div>${escapeHtml(choice)}</div>`).join("")}
        </div>
      ` : ""}

      <label class="error-note-label">
        오류 내용 메모
        <textarea class="error-note" rows="2" placeholder="예: B 선택지 OCR 오류">${escapeHtml(rec.errorNote || "")}</textarea>
      </label>
    `;

    item.querySelector(".restore-error-button").addEventListener("click", () => restoreErrorReport(id));
    item.querySelector(".error-note").addEventListener("input", event => {
      updateErrorNote(id, event.target.value);
    });

    els.errorsList.appendChild(item);
  });
}

function showErrorReports() {
  renderErrorReports();
  els.statsCard.classList.add("hidden");
  els.errorsCard.classList.remove("hidden");
  els.errorsCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatErrorReportsForCopy() {
  const reports = getReportedRecords();
  if (!reports.length) return "";

  const lines = [
    "문제은행 오류 보고 목록",
    `총 ${reports.length}문항`,
    ""
  ];

  reports.forEach(({ id, rec, q }, i) => {
    const subject = q?.subject || rec.errorSubjectSnapshot || "미분류";
    const unit = q ? studyUnitOf(q) : (rec.errorUnitSnapshot || "");
    const subunit = q
      ? [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ")
      : (rec.errorSubunitSnapshot || "");
    const question = q?.question || rec.errorQuestionSnapshot || "(지문 없음)";
    const choices = errorChoicesFor(q, rec);

    lines.push(`${i + 1}. ${id}`);
    lines.push(`과목: ${subject}${unit ? ` / SU ${unit}` : ""}${subunit ? ` / ${subunit}` : ""}`);
    lines.push(`문제: ${question}`);
    if (choices.length) {
      lines.push("선택지:");
      choices.forEach(choice => lines.push(choice));
    }
    lines.push(`오류 내용: ${String(rec.errorNote || "").trim() || "(미입력)"}`);
    lines.push("");
  });

  return lines.join("\n");
}

async function copyAllErrorReports() {
  const text = formatErrorReportsForCopy();
  if (!text) {
    els.copyErrorsStatus.textContent = "복사할 오류가 없습니다.";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    els.copyErrorsStatus.textContent = "복사 완료 · ChatGPT에 그대로 붙여넣으면 됩니다.";
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    els.copyErrorsStatus.textContent = "복사 완료 · ChatGPT에 그대로 붙여넣으면 됩니다.";
  }
}

function resetErrorReports() {
  const reports = getReportedRecords();
  if (!reports.length) {
    alert("초기화할 오류 신고가 없습니다.");
    return;
  }

  const ok = confirm(`${reports.length}개의 오류 신고 목록을 초기화할까요?\n\n학습 횟수, 정답률, 즐겨찾기, 시험모드 제외 기록은 유지되고 오류 신고 기록만 삭제됩니다.`);
  if (!ok) return;

  reports.forEach(({ id }) => {
    const rec = progressStore[id];
    if (!rec) return;
    rec.errorReported = false;
    rec.errorReportedAt = null;
    rec.errorNote = "";
    rec.errorQuestionSnapshot = "";
    rec.errorChoicesSnapshot = [];
    rec.errorSubjectSnapshot = "";
    rec.errorUnitSnapshot = "";
    rec.errorSubunitSnapshot = "";
  });

  saveProgress();
  updateErrorCount();
  updateAvailableCount();
  renderErrorReports();
  els.copyErrorsStatus.textContent = "오류 목록을 초기화했습니다.";
}

function aggregateStats(questions) {
  const total = questions.length;
  let solved = 0;
  let attempts = 0;
  let correct = 0;
  let incorrect = 0;
  let favorites = 0;
  let excluded = 0;

  questions.forEach(q => {
    const rec = progressStore[q.id] || {};
    if ((rec.attempts || 0) > 0) solved++;
    attempts += rec.attempts || 0;
    correct += rec.correct || 0;
    incorrect += rec.incorrect || 0;
    if (rec.favorite) favorites++;
    if (rec.examExcluded) excluded++;
  });

  return {
    total,
    solved,
    attempts,
    correct,
    incorrect,
    favorites,
    excluded,
    progressPct: total ? Math.round(solved / total * 100) : 0,
    accuracyPct: attempts ? Math.round(correct / attempts * 100) : null,
  };
}

function buildGroupStats(keyFn, filterFn = () => true) {
  const groups = new Map();

  bank.filter(filterFn).forEach(q => {
    const keyData = keyFn(q);
    if (!keyData) return;
    const key = JSON.stringify(keyData);
    if (!groups.has(key)) groups.set(key, { keyData, questions: [] });
    groups.get(key).questions.push(q);
  });

  return [...groups.values()].map(group => ({
    ...group.keyData,
    ...aggregateStats(group.questions),
  }));
}

function pctText(value) {
  return value === null ? "-" : `${value}%`;
}

function showStats() {
  const overall = aggregateStats(bank);

  const summary = [
    ["전체 문제", overall.total.toLocaleString()],
    ["푼 문제", `${overall.solved.toLocaleString()} / ${overall.total.toLocaleString()}`],
    ["전체 진도", `${overall.progressPct}%`],
    ["누적 정답률", pctText(overall.accuracyPct)],
    ["누적 풀이", overall.attempts.toLocaleString()],
    ["시험 제외", overall.excluded.toLocaleString()],
  ];

  els.statsSummary.innerHTML = summary.map(([label,value]) => `
    <div class="summary-box"><span class="muted">${label}</span><strong>${value}</strong></div>
  `).join("");

  const subjectStats = buildGroupStats(q => ({
    subject: q.subject || "미분류",
  })).sort((a,b) => a.subject.localeCompare(b.subject, "ko"));

  els.subjectStatsBody.innerHTML = subjectStats.map(row => `
    <tr>
      <td><strong>${escapeHtml(row.subject)}</strong></td>
      <td>${row.total.toLocaleString()}</td>
      <td>${row.solved.toLocaleString()}</td>
      <td>${row.progressPct}%</td>
      <td>${row.attempts.toLocaleString()}</td>
      <td>${pctText(row.accuracyPct)}</td>
      <td>${row.excluded.toLocaleString()}</td>
    </tr>
  `).join("");

  const suStats = buildGroupStats(q => {
    const unit = studyUnitOf(q);
    if (!unit) return null;
    return {
      subject: q.subject || "미분류",
      unit,
    };
  }).sort((a,b) =>
    a.subject.localeCompare(b.subject, "ko") ||
    String(a.unit).localeCompare(String(b.unit), undefined, {numeric:true})
  );

  els.suStatsBody.innerHTML = suStats.map(row => `
    <tr>
      <td>${escapeHtml(row.subject)}</td>
      <td><strong>SU ${escapeHtml(row.unit)}</strong></td>
      <td>${row.total.toLocaleString()}</td>
      <td>${row.solved.toLocaleString()}</td>
      <td>${row.progressPct}%</td>
      <td>${row.attempts.toLocaleString()}</td>
      <td>${pctText(row.accuracyPct)}</td>
      <td>${row.excluded.toLocaleString()}</td>
    </tr>
  `).join("");

  const attemptedSus = suStats.filter(row => row.attempts > 0 && row.accuracyPct !== null);
  attemptedSus.sort((a,b) =>
    a.accuracyPct - b.accuracyPct ||
    b.attempts - a.attempts ||
    a.subject.localeCompare(b.subject, "ko") ||
    String(a.unit).localeCompare(String(b.unit), undefined, {numeric:true})
  );

  if (attemptedSus.length) {
    const weakest = attemptedSus[0];
    els.weakestSu.innerHTML = `
      <strong>${escapeHtml(weakest.subject)} · SU ${escapeHtml(weakest.unit)}</strong>
      <span>${weakest.accuracyPct}% · ${weakest.solved}/${weakest.total}문제 풀이 · 누적 ${weakest.attempts}회</span>
    `;
  } else {
    els.weakestSu.textContent = "아직 풀이 기록이 없습니다.";
  }

  const records = bank.map(q => ({ q, rec: progressStore[q.id] || null }))
    .filter(x => x.rec && (x.rec.attempts || x.rec.favorite || x.rec.examExcluded))
    .sort((a,b) => (b.rec?.lastAttempted || "").localeCompare(a.rec?.lastAttempted || ""));

  els.statsBody.innerHTML = records.slice(0, 500).map(({q, rec}) => {
    const pct = rec.attempts ? Math.round(rec.correct / rec.attempts * 100) : null;
    return `
      <tr>
        <td>${escapeHtml(q.id)}</td>
        <td>${rec.attempts || 0}</td>
        <td>${rec.correct || 0}</td>
        <td>${rec.incorrect || 0}</td>
        <td>${pctText(pct)}</td>
        <td>${escapeHtml(rec.lastResult || "-")}</td>
        <td>${rec.favorite ? "★" : ""}</td>
        <td>${rec.examExcluded ? "!" : ""}</td>
      </tr>
    `;
  }).join("");

  els.statsCard.classList.remove("hidden");
  els.statsCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetProgress() {
  const ok = confirm(`${currentUser ? currentUser + " 계정의 " : ""}오답노트, 정답률, 즐겨찾기, 시험모드 제외 표시, 오류 신고 목록을 포함한 모든 학습기록을 초기화할까요?`);
  if (!ok) return;
  progressStore = {};
  try { localStorage.removeItem(STORAGE_KEY); } catch (err) { console.warn("LocalStorage 초기화 실패", err); }
  updateErrorCount();
  updateAvailableCount();
  renderErrorReports();
  renderTopProgress();
  alert("학습기록을 초기화했습니다.");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

els.subject.addEventListener("change", populateStudyUnits);
els.studyUnit.addEventListener("change", populateSubunits);
els.selectAllSubunits.addEventListener("click", selectAllSubunits);
els.clearSubunits.addEventListener("click", clearSubunits);
els.scope.addEventListener("change", updateAvailableCount);
els.mode.addEventListener("change", () => {
  applyModeUIState();
  updateAvailableCount();
});
els.noFigureOnly.addEventListener("change", updateAvailableCount);
els.countMode.addEventListener("change", () => {
  els.customCountWrap.classList.toggle("hidden", els.countMode.value !== "custom");
  updateAvailableCount();
});
els.start.addEventListener("click", () => startSession());
els.next.addEventListener("click", nextQuestion);
els.favorite.addEventListener("click", toggleFavorite);
els.examExclude.addEventListener("click", toggleExamExcluded);
els.retryWrong.addEventListener("click", () => {
  if (sessionMeta.type === "theoryTest") {
    const stage = theoryData?.stages?.find(s => s.id === sessionMeta.theoryStageId) || getCurrentTheoryStage();
    startTheoryTest(stage);
    return;
  }
  const wrong = [...wrongQuestions];
  els.countMode.value = "all";
  els.customCountWrap.classList.add("hidden");
  startSession(wrong);
});
els.restart.addEventListener("click", () => {
  if (sessionMeta.type === "theoryTest") {
    const passed = correctCount >= 8;
    const isLast = Number(sessionMeta.theoryStageIndex) >= (theoryData?.stages?.length || 1) - 1;
    if (passed && isLast) { sessionMeta = {}; showBookTheoryHub(); }
    else returnFromTheoryResult({advance: passed});
    return;
  }
  els.resultCard.classList.add("hidden");
  els.controlsCard.classList.remove("hidden");
  els.controlsCard.scrollIntoView({behavior:"smooth", block:"start"});
});
els.statsBtn.addEventListener("click", showStats);
els.closeStats.addEventListener("click", () => els.statsCard.classList.add("hidden"));
els.resetProgress.addEventListener("click", resetProgress);
els.resetErrors?.addEventListener("click", resetErrorReports);

// v11.1: 오류 신고 UI는 이벤트 위임으로 연결합니다.
// 모바일 브라우저/정적 페이지 캐시 갱신 상황에서도 버튼 교체 여부와 무관하게 동작합니다.
document.addEventListener("click", event => {
  const errorButton = event.target.closest("#errorBtn");
  if (errorButton) {
    event.preventDefault();
    reportCurrentError();
    return;
  }

  const errorsButton = event.target.closest("#errorsBtn");
  if (errorsButton) {
    event.preventDefault();
    showErrorReports();
    return;
  }

  const closeErrorsButton = event.target.closest("#closeErrorsBtn");
  if (closeErrorsButton) {
    event.preventDefault();
    els.errorsCard.classList.add("hidden");
    return;
  }

  const copyErrorsButton = event.target.closest("#copyErrorsBtn");
  if (copyErrorsButton) {
    event.preventDefault();
    copyAllErrorReports();
  }
});


// v11.17: 학습 허브 네비게이션은 이벤트 위임으로도 연결하여 캐시/동적 DOM 교체 상황에 대비합니다.
document.addEventListener("click", event => {
  const directTheory = event.target.closest("#directTheoryBtn");
  if (directTheory) { event.preventDefault(); showBookTheoryHub(); return; }
  const textbook = event.target.closest("#textbookModeBtn");
  if (textbook) { event.preventDefault(); showTextbookHub(); return; }
  const theoryChoice = event.target.closest("#textbookTheoryBtn");
  if (theoryChoice) { event.preventDefault(); showBookTheoryHub(); return; }
  const problemChoice = event.target.closest("#textbookProblemBtn");
  if (problemChoice) { event.preventDefault(); showBookProblemHub(); return; }
  const weatherTheory = event.target.closest("#weatherTheoryBtn");
  if (weatherTheory) { event.preventDefault(); openWeatherTheory(); return; }
  const airlawTheory = event.target.closest("#airlawTheoryBtn");
  if (airlawTheory) { event.preventDefault(); openAirlawTheory(); return; }
});

els.kotsaModeBtn?.addEventListener("click", () => activateLearningContext({
  kind:"kotsa", label:"교통안전공단 면허시험 대비", allowedSubjects:KOTSA_SUBJECTS,
  note:"ATP Gleim은 이 과정에서 제외됩니다."
}));
els.textbookModeBtn?.addEventListener("click", showTextbookHub);
els.airlineModeBtn?.addEventListener("click", showAirlineHub);
els.textbookHubBackBtn?.addEventListener("click", showMainModeHub);
els.textbookProblemBtn?.addEventListener("click", showBookProblemHub);
els.textbookTheoryBtn?.addEventListener("click", showBookTheoryHub);
els.directTheoryBtn?.addEventListener("click", showBookTheoryHub);
els.bookProblemBackBtn?.addEventListener("click", showTextbookHub);
els.bookTheoryBackBtn?.addEventListener("click", showTextbookHub);
els.weatherTheoryBtn?.addEventListener("click", openWeatherTheory);
els.airlawTheoryBtn?.addEventListener("click", openAirlawTheory);
els.theoryExitBtn?.addEventListener("click", showBookTheoryHub);
els.theoryTestBtn?.addEventListener("click", () => startTheoryTest());
els.theoryStageList?.addEventListener("click", event => {
  const btn = event.target.closest("[data-theory-stage-index]");
  if (!btn || btn.disabled) return;
  renderTheoryStage(Number(btn.dataset.theoryStageIndex));
});
els.airlineHubBackBtn?.addEventListener("click", showMainModeHub);
els.backToModeBtn?.addEventListener("click", showMainModeHub);
els.freeStudyBtn?.addEventListener("click", () => activateLearningContext({
  kind:"free", label:"자유학습모드", allowedSubjects:null,
  note:"모든 교재와 기존 문제은행 기능을 사용할 수 있습니다."
}));
document.querySelectorAll("[data-book-subject]").forEach(btn => {
  btn.addEventListener("click", () => {
    const subject = btn.dataset.bookSubject;
    activateLearningContext({kind:"book", label:`${subject} 교재 학습`, allowedSubjects:[subject], lockedSubject:subject, note:"선택한 교재만 출제됩니다."});
  });
});
els.parataCourseBtn?.addEventListener("click", () => activateLearningContext({
  kind:"airline", label:"파라타항공 대비 과정", allowedSubjects:PARATA_SUBJECTS, airline:"parata",
  note:"사용 교재: ATP Gleim + 검댕이 항공법규"
}));

async function bootstrap() {
  if (window.PilotBankAuth?.requireLogin) {
    const user = await window.PilotBankAuth.requireLogin();
    configureUserStorage(user);
  } else {
    configureUserStorage(null);
  }
  maybeImportLegacyProgress();
  progressStore = loadProgress();
  await loadBank();
  renderTopProgress();
  showMainModeHub();
}

bootstrap();
