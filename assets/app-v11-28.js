
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
        <button class="book-choice-card" data-book-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong></button><button class="book-choice-card" data-book-subject="항공교통통신" type="button"><img src="./assets/covers/atc_comm.svg" alt="항공교통통신 표지"><strong>항공교통통신</strong><span>출제예상·모의고사 938문항</span></button>
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
        <button id="jejuCourseBtn" class="airline-choice-card jeju-air-card" type="button">
          <img src="./assets/covers/jeju_air.svg" alt="JEJUair 로고">
          <strong>제주항공 대비 과정</strong>
          <span>2024·2025 상/하반기 필기 복기 200문항</span>
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

// v11.22: 이전 버전의 airlineHubCard가 이미 존재하는 경우에도
// 제주항공 대비 과정 카드를 보강합니다. (v11.21 패치 적용 시 누락 방지)
function ensureV1122JejuCourseCard() {
  const hub = document.querySelector("#airlineHubCard");
  if (!hub || hub.querySelector("#jejuCourseBtn")) return;

  let grid = hub.querySelector(".airline-choice-grid");
  if (!grid) {
    grid = document.createElement("div");
    grid.className = "airline-choice-grid";
    hub.appendChild(grid);
  }

  const button = document.createElement("button");
  button.id = "jejuCourseBtn";
  button.className = "airline-choice-card jeju-air-card";
  button.type = "button";
  button.innerHTML = `
    <img src="./assets/covers/jeju_air.svg" alt="JEJUair 로고">
    <strong>제주항공 대비 과정</strong>
    <span>2024·2025 상/하반기 필기 복기 200문항</span>`;
  grid.appendChild(button);
}
ensureV1122JejuCourseCard();

function ensureV1124TrinityCourseCard() {
  const hub = document.querySelector("#airlineHubCard");
  if (!hub || hub.querySelector("#trinityCourseBtn")) return;
  let grid = hub.querySelector(".airline-choice-grid");
  if (!grid) {
    grid = document.createElement("div");
    grid.className = "airline-choice-grid";
    hub.appendChild(grid);
  }
  const button = document.createElement("button");
  button.id = "trinityCourseBtn";
  button.className = "airline-choice-card trinity-air-card";
  button.type = "button";
  button.innerHTML = `
    <img src="./assets/covers/trinity_air.svg" alt="TRINITY AIR 로고">
    <strong>트리니티항공 대비 과정</strong>
    <span>사용자 풀이 기록 · 고유 307문항 · 과목별 분류</span>`;
  grid.appendChild(button);
}
ensureV1124TrinityCourseCard();


function removeV1124DirectTheoryShortcut() {
  document.querySelector("#directTheoryBtn")?.remove();
}
removeV1124DirectTheoryShortcut();

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
    section.innerHTML = `<div class="section-head"><div><h2>문제 풀이 교재를 선택하십시오.</h2><p class="muted">기존 문제 풀이 기능은 그대로 유지됩니다.</p></div><button id="bookProblemBackBtn" class="button secondary" type="button">이전</button></div><div class="book-choice-grid"><button class="book-choice-card" data-book-subject="ATP Gleim" type="button"><img src="./assets/covers/atp_gleim.jpg" alt="ATP Gleim 표지"><strong>ATP Gleim</strong></button><button class="book-choice-card" data-book-subject="검댕이 항공법규" type="button"><img src="./assets/covers/airlaw.jpg" alt="검댕이 항공법규 표지"><strong>검댕이 항공법규</strong></button><button class="book-choice-card" data-book-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong></button><button class="book-choice-card" data-book-subject="항공교통통신" type="button"><img src="./assets/covers/atc_comm.svg" alt="항공교통통신 표지"><strong>항공교통통신</strong><span>출제예상·모의고사 938문항</span></button><button id="freeStudyBtn" class="book-choice-card free-study" type="button"><img src="./assets/covers/all_books.jpg" alt="전체 교재"><strong>자유학습모드</strong><span>기존 문제은행의 모든 기능 사용</span></button></div>`;
    main.insertBefore(section, insertBefore);
  }
  if (!document.querySelector("#bookTheoryHubCard")) {
    const section = document.createElement("section"); section.id="bookTheoryHubCard"; section.className="card hidden";
    section.innerHTML = `<div class="section-head"><div><h2>이론 학습 교재를 선택하십시오.</h2><p class="muted">교재 본문을 순서대로 학습하고 각 단계의 쪽지시험을 통과합니다.</p></div><button id="bookTheoryBackBtn" class="button secondary" type="button">이전</button></div><div class="book-choice-grid theory-book-grid"><button id="weatherTheoryBtn" class="book-choice-card theory-ready" data-theory-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong><span>전체 이론 과정 · 40단계</span></button><button id="airlawTheoryBtn" class="book-choice-card theory-ready" data-theory-subject="검댕이 항공법규" type="button"><img src="./assets/covers/airlaw.jpg" alt="검댕이 항공법규 표지"><strong>검댕이 항공법규</strong><span>국제 항공법 + 항공안전법 · 15단계</span></button><button id="atcTheoryBtn" class="book-choice-card theory-ready" data-theory-subject="항공교통통신" type="button"><img src="./assets/covers/atc_comm.svg" alt="항공교통통신 표지"><strong>항공교통통신</strong><span>전체 이론 과정 · 25단계</span></button><div class="theory-coming-soon"><strong>ATP Gleim</strong><span>이론 학습 확장 예정</span></div></div>`;
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
  "항공교통통신",
  "트리니티항공 대비",
];


// v11.42: backward-compatible ERROR report UI repair.
// If an older cached index.html still has #copyErrorsBtn / "전체 복사",
// normalize it to the server-backed error-report workflow before element binding.
function ensureV1142CentralErrorReportUi() {
  const errorsCard = document.querySelector("#errorsCard");
  const oldCopyButton = document.querySelector("#copyErrorsBtn");
  if (oldCopyButton) {
    oldCopyButton.id = "sendErrorsBtn";
    oldCopyButton.textContent = "오류 보고";
    oldCopyButton.removeAttribute("title");
  }

  const sendButton = document.querySelector("#sendErrorsBtn");
  if (sendButton) sendButton.textContent = "오류 보고";

  const errorIntro = errorsCard?.querySelector(".section-head .muted");
  if (errorIntro) {
    errorIntro.textContent = "ERROR로 표시한 문제는 학습·시험 출제에서 자동 제외됩니다. 메모를 작성한 뒤 오류 보고를 누르면 서버로 전송되어 관리자에게 보고됩니다.";
  }

  // Older index.html versions do not contain the admin inbox button/card.
  // Inject them so deploying the new JS is sufficient to recover the feature.
  if (!document.querySelector("#adminErrorReportsBtn")) {
    const nav = document.querySelector(".nav-row");
    if (nav) {
      const btn = document.createElement("button");
      btn.id = "adminErrorReportsBtn";
      btn.type = "button";
      btn.className = "button secondary hidden";
      btn.textContent = "보고된 오류";
      const adminLink = nav.querySelector('a[href="./admin.html"]');
      nav.insertBefore(btn, adminLink || null);
    }
  }

  if (!document.querySelector("#adminErrorReportsCard")) {
    const statsCard = document.querySelector("#statsCard");
    const card = document.createElement("section");
    card.id = "adminErrorReportsCard";
    card.className = "card hidden";
    card.innerHTML = `
      <div class="section-head">
        <div>
          <h2>보고된 오류 총목록</h2>
          <p class="muted">관리자 계정에서만 서버에 제출된 오류 보고를 조회할 수 있습니다.</p>
        </div>
        <button id="closeAdminErrorReportsBtn" class="button secondary">닫기</button>
      </div>
      <div class="row error-toolbar">
        <button id="refreshAdminErrorReportsBtn" class="button secondary">새로고침</button>
        <button id="copyAdminErrorReportsBtn" class="button">전체 복사</button>
        <strong id="adminErrorReportSummary">불러오는 중...</strong>
        <span id="adminErrorReportStatus" class="muted"></span>
      </div>
      <div id="adminErrorReportsEmpty" class="notice hidden">전송된 오류 보고가 없습니다.</div>
      <div id="adminErrorReportsList" class="error-report-list"></div>
    `;
    if (statsCard?.parentNode) statsCard.parentNode.insertBefore(card, statsCard);
    else document.querySelector("main")?.appendChild(card);
  }
}

ensureV1142CentralErrorReportUi();

const els = {
  topProgressCard: document.querySelector("#topProgressCard"),
  topProgressGrid: document.querySelector("#topProgressGrid"),
  homeHero: document.querySelector("#homeHero"),
  homeGreeting: document.querySelector("#homeGreeting"),
  homeNavBtn: document.querySelector("#homeNavBtn"),
  menuToggleBtn: document.querySelector("#menuToggleBtn"),
  studyNavBtn: document.querySelector("#studyNavBtn"),
  textbookQuickNavBtn: document.querySelector("#textbookQuickNavBtn"),
  aviwikiNavBtn: document.querySelector("#aviwikiNavBtn"),
  airlineQuickNavBtn: document.querySelector("#airlineQuickNavBtn"),
  wrongReviewQuickNavBtn: document.querySelector("#wrongReviewQuickNavBtn"),
  quickResourceNavBtn: document.querySelector("#quickResourceNavBtn"),
  homeTodayStudyTime: document.querySelector("#homeTodayStudyTime"),
  homeTotalStudyTime: document.querySelector("#homeTotalStudyTime"),
  homeMyPageBtn: document.querySelector("#homeMyPageBtn"),
  problemAdminLink: document.querySelector("#problemAdminLink"),
  modeHubCard: document.querySelector("#modeHubCard"),
  aviwikiModeBtn: document.querySelector("#aviwikiModeBtn"),
  aviwikiHomeCard: document.querySelector("#aviwikiHomeCard"),
  aviwikiReaderCard: document.querySelector("#aviwikiReaderCard"),
  aviwikiHomeMeta: document.querySelector("#aviwikiHomeMeta"),
  aviwikiGlobalSearch: document.querySelector("#aviwikiGlobalSearch"),
  aviwikiSearchResults: document.querySelector("#aviwikiSearchResults"),
  aviwikiResumeBtn: document.querySelector("#aviwikiResumeBtn"),
  aviwikiResumeTitle: document.querySelector("#aviwikiResumeTitle"),
  aviwikiStartBtn: document.querySelector("#aviwikiStartBtn"),
  aviwikiSubjectGrid: document.querySelector("#aviwikiSubjectGrid"),
  aviwikiHomeBtn: document.querySelector("#aviwikiHomeBtn"),
  aviwikiReaderProgress: document.querySelector("#aviwikiReaderProgress"),
  aviwikiTocSearch: document.querySelector("#aviwikiTocSearch"),
  aviwikiBookmarkOnlyBtn: document.querySelector("#aviwikiBookmarkOnlyBtn"),
  aviwikiTocList: document.querySelector("#aviwikiTocList"),
  aviwikiArticleEyebrow: document.querySelector("#aviwikiArticleEyebrow"),
  aviwikiArticleTitle: document.querySelector("#aviwikiArticleTitle"),
  aviwikiArticleTags: document.querySelector("#aviwikiArticleTags"),
  aviwikiBookmarkBtn: document.querySelector("#aviwikiBookmarkBtn"),
  aviwikiArticleBody: document.querySelector("#aviwikiArticleBody"),
  aviwikiPrevBtn: document.querySelector("#aviwikiPrevBtn"),
  aviwikiNextBtn: document.querySelector("#aviwikiNextBtn"),
  textbookHubCard: document.querySelector("#textbookHubCard"),
  bookProblemHubCard: document.querySelector("#bookProblemHubCard"),
  bookTheoryHubCard: document.querySelector("#bookTheoryHubCard"),
  theoryCard: document.querySelector("#theoryCard"),
  airlineHubCard: document.querySelector("#airlineHubCard"),
  resourceLibraryCard: document.querySelector("#resourceLibraryCard"),
  resourceViewerCard: document.querySelector("#resourceViewerCard"),
  resourceLibraryModeBtn: document.querySelector("#resourceLibraryModeBtn"),
  resourceLibraryCloseBtn: document.querySelector("#resourceLibraryCloseBtn"),
  resourceLibraryGrid: document.querySelector("#resourceLibraryGrid"),
  resourceViewerBackBtn: document.querySelector("#resourceViewerBackBtn"),
  resourceViewerTitle: document.querySelector("#resourceViewerTitle"),
  resourceViewerMeta: document.querySelector("#resourceViewerMeta"),
  resourceViewerPages: document.querySelector("#resourceViewerPages"),
  wrongReviewModeBtn: document.querySelector("#wrongReviewModeBtn"),
  wrongReviewHubCard: document.querySelector("#wrongReviewHubCard"),
  wrongReviewHubBackBtn: document.querySelector("#wrongReviewHubBackBtn"),
  wrongReviewFilterCard: document.querySelector("#wrongReviewFilterCard"),
  wrongReviewFilterBackBtn: document.querySelector("#wrongReviewFilterBackBtn"),
  wrongReviewBookTitle: document.querySelector("#wrongReviewBookTitle"),
  wrongReviewMinCount: document.querySelector("#wrongReviewMinCount"),
  wrongReviewCountInfo: document.querySelector("#wrongReviewCountInfo"),
  wrongReviewStartBtn: document.querySelector("#wrongReviewStartBtn"),
  homeTitleBtn: document.querySelector("#homeTitleBtn"),
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
  atcTheoryBtn: document.querySelector("#atcTheoryBtn"),
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
  jejuCourseBtn: document.querySelector("#jejuCourseBtn"),
  trinityCourseBtn: document.querySelector("#trinityCourseBtn"),
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
  sendErrors: document.querySelector("#sendErrorsBtn") || document.querySelector("#copyErrorsBtn"),
  copyErrorsStatus: document.querySelector("#copyErrorsStatus"),
  resetErrors: document.querySelector("#resetErrorsBtn"),
  adminErrorReportsBtn: document.querySelector("#adminErrorReportsBtn"),
  adminErrorReportsCard: document.querySelector("#adminErrorReportsCard"),
  closeAdminErrorReports: document.querySelector("#closeAdminErrorReportsBtn"),
  refreshAdminErrorReports: document.querySelector("#refreshAdminErrorReportsBtn"),
  copyAdminErrorReports: document.querySelector("#copyAdminErrorReportsBtn"),
  adminErrorReportSummary: document.querySelector("#adminErrorReportSummary"),
  adminErrorReportStatus: document.querySelector("#adminErrorReportStatus"),
  adminErrorReportsEmpty: document.querySelector("#adminErrorReportsEmpty"),
  adminErrorReportsList: document.querySelector("#adminErrorReportsList"),
  myPageUserMeta: document.querySelector("#myPageUserMeta"),
  myPageBookGrid: document.querySelector("#myPageBookGrid"),
  statsSummary: document.querySelector("#statsSummary"),
  weakestSu: document.querySelector("#weakestSu"),
  weakestSuList: document.querySelector("#weakestSuList"),
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
  prev: document.querySelector("#prevBtn"),
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
let studyAnswers = {};
let sessionChoiceOrder = {};
let adminErrorReportsCache = [];
let progressStore = {};
// v11.43: 서버에 이미 전송된 오류 보고는 사용자의 오류 목록에서 숨기되,
// 해당 문제의 ERROR 제외 상태 자체는 유지합니다.
let submittedErrorReportIds = new Set();
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
let wrongReviewSubject = null;

// v11.48 Aviwiki · Aerodynamics + Weather
const AVIWIKI_DATA_PATHS = {
  Aerodynamics: "./data/aviwiki-aerodynamics-v1.json",
  Weather: "./data/aviwiki-weather-v1.json",
};
const AVIWIKI_LOCAL_STATE_KEY = "pilotbank-aviwiki-state-v1";
let aviwikiData = null;
let aviwikiCurrentSectionId = null;
let aviwikiBookmarks = new Set();
let aviwikiBookmarkOnly = false;
let aviwikiStateLoaded = false;
let aviwikiCloudStateAvailable = true;

const BOOK_SUBJECTS = ["ATP Gleim", "검댕이 항공법규", "항공기상", "항공교통통신"];
const KOTSA_SUBJECTS = ["항공기상", "검댕이 항공법규"];
const PARATA_SUBJECTS = ["ATP Gleim", "검댕이 항공법규"];
const JEJU_RECALL_SUBJECT = "제주항공 복기";
const JEJU_SUBJECTS = [JEJU_RECALL_SUBJECT];
const TRINITY_SUBJECT = "트리니티항공 대비";
const TRINITY_SUBJECTS = [TRINITY_SUBJECT];
const AIRLINE_ONLY_SUBJECTS = new Set([JEJU_RECALL_SUBJECT, TRINITY_SUBJECT]);

// v11.29 제한 자료실: 업로드된 PDF 10종을 서버에 PDF 원본 없이 이미지로 내장합니다.
// 각 카드에는 PDF 1페이지 썸네일을 표시하고, 열람 시 렌더링된 PNG만 Canvas에 표시합니다.
const RESOURCE_LIBRARY_ITEMS = [
  {id:"v-speeds", title:"V속도 한 장 카드", tag:"성능·속도", thumbnail:"./assets/v-speeds-thumb.jpg", pages:["./assets/v-speeds-page-1.png","./assets/v-speeds-page-2.png"]},
  {id:"metar-taf", title:"METAR·TAF 해독 카드", tag:"기상", thumbnail:"./assets/metar-taf-thumb.jpg", pages:["./assets/metar-taf-page-1.png","./assets/metar-taf-page-2.png"]},
  {id:"holding", title:"홀딩 한 장 카드", tag:"IFR", thumbnail:"./assets/holding-thumb.jpg", pages:["./assets/holding-page-1.png","./assets/holding-page-2.png"]},
  {id:"ifr", title:"IFR 최저고도 카드", tag:"IFR", thumbnail:"./assets/ifr-thumb.jpg", pages:["./assets/ifr-page-1.png","./assets/ifr-page-2.png"]},
  {id:"atc-emergency", title:"관제 신호·비상코드 카드", tag:"관제·비상", thumbnail:"./assets/atc-emergency-thumb.jpg", pages:["./assets/atc-emergency-page-1.png","./assets/atc-emergency-page-2.png"]},
  {id:"weather-hazards", title:"기상 위험 카드", tag:"기상", thumbnail:"./assets/weather-hazards-thumb.jpg", pages:["./assets/weather-hazards-page-1.png","./assets/weather-hazards-page-2.png"]},
  {id:"aerodynamics", title:"공기역학 핵심 카드", tag:"공기역학", thumbnail:"./assets/aerodynamics-thumb.jpg", pages:["./assets/aerodynamics-page-1.png","./assets/aerodynamics-page-2.png"]},
  {id:"notam", title:"NOTAM 해독 카드", tag:"운항정보", thumbnail:"./assets/notam-thumb.jpg", pages:["./assets/notam-page-1.png","./assets/notam-page-2.png"]},
  {id:"snowtam", title:"SNOWTAM 판독 카드", tag:"운항정보", thumbnail:"./assets/snowtam-thumb.jpg", pages:["./assets/snowtam-page-1.png","./assets/snowtam-page-2.png"]},
  {id:"fuel-policy", title:"연료 정책 한 장 카드", tag:"운항절차", thumbnail:"./assets/fuel-policy-thumb.jpg", pages:["./assets/fuel-policy-page-1.png","./assets/fuel-policy-page-2.png"]},
];

function hasResourceLibraryAccess() {
  return !!window.PilotBankAuth?.canAccessResourceLibrary?.();
}

function configureResourceLibraryAccess() {
  const allowed = hasResourceLibraryAccess();
  els.resourceLibraryModeBtn?.classList.toggle("hidden", !allowed);
  els.quickResourceNavBtn?.classList.toggle("hidden", !allowed);
  if (!allowed) {
    els.resourceLibraryCard?.classList.add("hidden");
    els.resourceViewerCard?.classList.add("hidden");
  }
  return allowed;
}

function hideAllHubs() {
  [els.modeHubCard, els.textbookHubCard, els.bookProblemHubCard, els.bookTheoryHubCard, els.airlineHubCard, els.wrongReviewHubCard, els.wrongReviewFilterCard].forEach(el => el?.classList.add("hidden"));
}

function renderResourceLibrary() {
  if (!els.resourceLibraryGrid) return;
  els.resourceLibraryGrid.innerHTML = RESOURCE_LIBRARY_ITEMS.map(item => `
    <button class="resource-item-card" type="button" data-resource-id="${escapeHtml(item.id)}">
      <span class="resource-item-thumb-wrap" aria-hidden="true">
        <img class="resource-item-thumb" src="${escapeHtml(item.thumbnail || item.pages[0])}" alt="" loading="lazy" draggable="false" />
      </span>
      <span class="resource-item-body">
        <span class="resource-item-tag">${escapeHtml(item.tag)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="resource-item-meta">열람 전용 · ${item.pages.length}페이지</span>
      </span>
    </button>`).join("");
}

function showResourceLibrary() {
  if (!configureResourceLibraryAccess()) {
    alert("이 계정은 자료실 접근 권한이 없습니다.");
    showMainModeHub();
    return;
  }
  hideStudySurfaces();
  hideAllHubs();
  els.resourceViewerCard?.classList.add("hidden");
  renderResourceLibrary();
  els.resourceLibraryCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

async function drawProtectedResourcePage(src, host, pageNumber, pageCount) {
  const wrap = document.createElement("figure");
  wrap.className = "resource-page-wrap";
  const canvas = document.createElement("canvas");
  canvas.className = "resource-page-canvas";
  canvas.setAttribute("aria-label", `자료 페이지 ${pageNumber}/${pageCount}`);
  const caption = document.createElement("figcaption");
  caption.textContent = `${pageNumber} / ${pageCount}`;
  wrap.append(canvas, caption);
  host.appendChild(wrap);

  try {
    const response = await fetch(src, {cache:"no-store", credentials:"same-origin"});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", {alpha:false});
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("자료 페이지 표시 실패", err);
    wrap.classList.add("resource-page-error");
    wrap.innerHTML = `<div class="notice">페이지를 불러오지 못했습니다.</div>`;
  }
}

async function openResourceItem(resourceId) {
  if (!configureResourceLibraryAccess()) {
    alert("이 계정은 자료실 접근 권한이 없습니다.");
    showMainModeHub();
    return;
  }
  const item = RESOURCE_LIBRARY_ITEMS.find(entry => entry.id === resourceId);
  if (!item || !els.resourceViewerPages) return;
  hideStudySurfaces();
  hideAllHubs();
  els.resourceLibraryCard?.classList.add("hidden");
  els.resourceViewerCard?.classList.remove("hidden");
  els.resourceViewerTitle.textContent = item.title;
  els.resourceViewerMeta.textContent = `${item.tag} · ${item.pages.length}페이지 · 열람 전용`;
  els.resourceViewerPages.innerHTML = '<div class="resource-loading">자료를 불러오는 중입니다.</div>';
  const host = document.createElement("div");
  host.className = "resource-page-stack";
  els.resourceViewerPages.innerHTML = "";
  els.resourceViewerPages.appendChild(host);
  for (let i = 0; i < item.pages.length; i += 1) {
    await drawProtectedResourcePage(item.pages[i], host, i + 1, item.pages.length);
  }
  els.resourceViewerCard.scrollIntoView({behavior:"smooth", block:"start"});
}

function isExamLike() {
  return sessionMeta.type === "theoryTest" || els.mode.value === "exam" || els.mode.value === "mock";
}

function getAllowedSubjectSet() {
  if (learningContext.allowedSubjects) return new Set(learningContext.allowedSubjects);
  if (learningContext.kind === "free") {
    return new Set([...new Set(bank.map(q => q.subject || "미분류"))].filter(s => !AIRLINE_ONLY_SUBJECTS.has(s)));
  }
  return null;
}

function hideStudySurfaces() {
  [els.homeHero, els.topProgressCard, els.controlsCard, els.quizCard, els.resultCard, els.statsCard, els.errorsCard, els.adminErrorReportsCard, els.theoryCard, els.resourceLibraryCard, els.resourceViewerCard, els.wrongReviewHubCard, els.wrongReviewFilterCard, els.aviwikiHomeCard, els.aviwikiReaderCard].forEach(el => el?.classList.add("hidden"));
}

function setQuizFocus(active) {
  accrueStudyTime();
  document.body.classList.toggle("quiz-active", !!active);
  studyTimeLastTickAt = Date.now();
  if (active) studyTimeLastInteractionAt = Date.now();
  else flushStudyTime();
}

const SIDEBAR_COLLAPSE_KEY = "pilotbank-ui-sidebar-collapsed-v1146";

function setSidebarCollapsed(collapsed) {
  const isWide = window.matchMedia("(min-width: 1024px)").matches;
  const next = !!collapsed;
  document.body.classList.toggle("sidebar-collapsed", next && isWide);
  document.body.classList.toggle("mobile-nav-collapsed", next && !isWide);
  if (els.menuToggleBtn) {
    els.menuToggleBtn.setAttribute("aria-expanded", String(!next));
    els.menuToggleBtn.title = next ? "메뉴 펼치기" : "메뉴 접기";
    const label = els.menuToggleBtn.querySelector(".nav-label");
    if (label) label.textContent = next ? "메뉴 펼치기" : "메뉴 접기";
    const icon = els.menuToggleBtn.querySelector(".nav-icon");
    if (icon) icon.textContent = next ? "☰" : (isWide ? "‹" : "×");
  }
  try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0"); } catch {}
}

function restoreSidebarCollapsed() {
  let collapsed = false;
  try { collapsed = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1"; } catch {}
  setSidebarCollapsed(collapsed);
}

function toggleSidebarCollapsed() {
  const collapsed = document.body.classList.contains("sidebar-collapsed") || document.body.classList.contains("mobile-nav-collapsed");
  setSidebarCollapsed(!collapsed);
}

function quizSessionIsInProgress() {
  return !!(document.body.classList.contains("quiz-active") && els.quizCard && !els.quizCard.classList.contains("hidden") && session?.length);
}

function confirmLeavingQuiz(destinationLabel = "다른 화면") {
  if (!quizSessionIsInProgress()) return true;
  return window.confirm(
    `현재 문제풀이를 종료하고 ${destinationLabel}(으)로 이동하시겠습니까?\n\n` +
    `이동하면 현재 회차의 점수와 진행 상태는 무효화됩니다. ` +
    `다만 이미 채점되어 서버에 반영된 개별 문제의 학습 기록은 유지됩니다.`
  );
}

function abandonCurrentQuizSession() {
  if (!quizSessionIsInProgress()) return;
  sessionMeta = {...sessionMeta, abandoned:true};
  setQuizFocus(false);
  answered = false;
}

const QUIZ_EXIT_TARGETS = new Map([
  ["#homeTitleBtn", "홈"], ["#homeNavBtn", "홈"], ["#studyNavBtn", "학습 모드 선택"],
  ["#textbookQuickNavBtn", "각 교재 학습"], ["#aviwikiNavBtn", "이론 백과사전"], ["#airlineQuickNavBtn", "항공사 대비과정"],
  ["#wrongReviewQuickNavBtn", "오답 복습"], ["#statsBtn", "마이페이지"], ["#errorsBtn", "오류 목록"],
  ["#quickResourceNavBtn", "자료실"], ["#adminErrorReportsBtn", "보고된 오류"], ["#problemAdminLink", "문제 추가"],
  ["#backToModeBtn", "학습 모드 선택"], ["#textbookHubBackBtn", "홈"], ["#bookProblemBackBtn", "교재 선택"],
  ["#bookTheoryBackBtn", "교재 선택"], ["#airlineHubBackBtn", "홈"], ["#wrongReviewHubBackBtn", "홈"],
  ["#wrongReviewFilterBackBtn", "오답 복습"], ["#resourceLibraryCloseBtn", "학습 모드"],
  ["#resourceViewerBackBtn", "자료실"], ["#theoryExitBtn", "이론 학습"], [".auth-logout-button", "로그아웃"]
]);

document.addEventListener("click", event => {
  if (!quizSessionIsInProgress()) return;
  let matched = null;
  let destination = "다른 화면";
  for (const [selector, label] of QUIZ_EXIT_TARGETS) {
    const candidate = event.target.closest?.(selector);
    if (candidate) { matched = candidate; destination = label; break; }
  }
  if (!matched) return;
  if (!confirmLeavingQuiz(destination)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  abandonCurrentQuizSession();
}, true);

function showLearningModeHubOnly() {
  learningContext = { kind:"hub", label:"", allowedSubjects:null, lockedSubject:null, airline:null, baseNote:"" };
  wrongReviewSubject = null;
  setQuizFocus(false);
  hideStudySurfaces();
  hideAllHubs();
  els.homeHero?.classList.add("hidden");
  els.topProgressCard?.classList.add("hidden");
  els.modeHubCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}


function aviwikiSubjectDefinitions() {
  const subjectMeta = aviwikiData?.subject_meta || {};
  const readyMeta = key => subjectMeta[key] || null;
  const item = (key, title) => {
    const meta = readyMeta(key);
    return {
      key, title, ready: !!meta,
      meta: meta ? `${meta.chapter_count || 0}챕터 · ${meta.section_count || 0}섹션` : "자료 준비 중"
    };
  };
  return [
    item("Aerodynamics", "Aerodynamics"),
    item("Weather", "Weather"),
    item("Navigation", "Navigation"),
    item("IFR Procedures", "IFR Procedures"),
    item("Systems", "Systems"),
    item("Performance & Weight Balance", "Performance & Weight Balance"),
    item("Emergency & Aeromedical", "Emergency & Aeromedical"),
    item("항공법규", "항공법규"),
  ];
}

function normalizeAviwikiSearch(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("ko").trim();
}

function aviwikiSectionSearchText(section) {
  return normalizeAviwikiSearch([
    section.subject, section.chapter, section.title,
    ...(Array.isArray(section.tags) ? section.tags : []),
    section.content
  ].filter(Boolean).join(" "));
}

async function ensureAviwikiData() {
  if (aviwikiData?.sections?.length) return aviwikiData;
  const loaded = [];
  for (const [subject, path] of Object.entries(AVIWIKI_DATA_PATHS)) {
    const response = await fetch(`${path}?v=11.48.0`, {cache:"no-store"});
    if (!response.ok) throw new Error(`Aviwiki ${subject} data HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data?.sections)) throw new Error(`Aviwiki ${subject} sections missing`);
    loaded.push(data);
  }
  const subjectMeta = {};
  const chapters = [];
  const sections = [];
  loaded.forEach(data => {
    const subject = data.metadata?.subject || data.metadata?.display_name;
    if (!subject) return;
    subjectMeta[subject] = data.metadata;
    (data.chapters || []).forEach(chapter => chapters.push({...chapter, subject}));
    (data.sections || []).forEach(section => sections.push(section));
  });
  aviwikiData = {
    metadata: {
      version: "aviwiki-multi-v2",
      subject_count: Object.keys(subjectMeta).length,
      chapter_count: chapters.length,
      section_count: sections.length
    },
    subject_meta: subjectMeta,
    chapters,
    sections
  };
  await loadAviwikiState();
  if (aviwikiCurrentSectionId && !aviwikiData.sections.some(s => s.id === aviwikiCurrentSectionId)) {
    aviwikiCurrentSectionId = null;
  }
  renderAviwikiSubjectGrid();
  renderAviwikiResume();
  return aviwikiData;
}

function readLocalAviwikiState() {
  try {
    const raw = localStorage.getItem(AVIWIKI_LOCAL_STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      last_section_id: parsed?.last_section_id || null,
      bookmarks: Array.isArray(parsed?.bookmarks) ? parsed.bookmarks : []
    };
  } catch {
    return {last_section_id:null, bookmarks:[]};
  }
}

function writeLocalAviwikiState() {
  try {
    localStorage.setItem(AVIWIKI_LOCAL_STATE_KEY, JSON.stringify({
      last_section_id: aviwikiCurrentSectionId || null,
      bookmarks: [...aviwikiBookmarks]
    }));
  } catch {}
}

async function loadAviwikiState() {
  if (aviwikiStateLoaded) return;
  const local = readLocalAviwikiState();
  aviwikiCurrentSectionId = local.last_section_id;
  aviwikiBookmarks = new Set(local.bookmarks);
  aviwikiStateLoaded = true;

  const userId = getSupabaseLearningUserId();
  if (!userId || !window.supabaseClient) return;
  try {
    const {data, error} = await window.supabaseClient
      .from("aviwiki_user_state")
      .select("last_section_id,bookmarks")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      aviwikiCurrentSectionId = data.last_section_id || aviwikiCurrentSectionId;
      aviwikiBookmarks = new Set(Array.isArray(data.bookmarks) ? data.bookmarks : [...aviwikiBookmarks]);
      writeLocalAviwikiState();
    }
  } catch (err) {
    aviwikiCloudStateAvailable = false;
    console.warn("Aviwiki 서버 상태 불러오기 실패 · 로컬 상태 사용", err);
  }
}

async function saveAviwikiState() {
  writeLocalAviwikiState();
  const userId = getSupabaseLearningUserId();
  if (!userId || !window.supabaseClient || !aviwikiCloudStateAvailable) return;
  try {
    const {error} = await window.supabaseClient
      .from("aviwiki_user_state")
      .upsert({
        user_id: userId,
        last_section_id: aviwikiCurrentSectionId || null,
        bookmarks: [...aviwikiBookmarks],
        updated_at: new Date().toISOString()
      }, {onConflict:"user_id"});
    if (error) throw error;
  } catch (err) {
    aviwikiCloudStateAvailable = false;
    console.warn("Aviwiki 서버 상태 저장 실패 · 로컬 상태는 유지", err);
  }
}

function renderAviwikiSubjectGrid() {
  if (!els.aviwikiSubjectGrid) return;
  els.aviwikiSubjectGrid.innerHTML = aviwikiSubjectDefinitions().map(item => `
    <button class="aviwiki-subject-card ${item.ready ? "ready" : "coming"}" type="button" data-aviwiki-subject="${escapeHtml(item.key)}" ${item.ready ? "" : "disabled"}>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.meta)}</span>
    </button>
  `).join("");
}

function renderAviwikiResume() {
  if (!aviwikiData?.sections?.length) return;
  const target = aviwikiData.sections.find(s => s.id === aviwikiCurrentSectionId) || aviwikiData.sections[0];
  if (els.aviwikiResumeTitle) els.aviwikiResumeTitle.textContent = target.title;
  if (els.aviwikiHomeMeta) {
    els.aviwikiHomeMeta.textContent = `${aviwikiData.metadata?.subject_count || 0}과목 · ${aviwikiData.metadata?.chapter_count || 0}챕터 · ${aviwikiData.metadata?.section_count || 0}개 섹션. 궁금한 용어·개념을 통합 검색하거나 과목을 골라 공부할 수 있어요.`;
  }
}

function aviwikiSectionsForSubject(subject) {
  if (!aviwikiData?.sections?.length) return [];
  return aviwikiData.sections.filter(section => section.subject === subject);
}

function aviwikiCurrentSubject() {
  const current = aviwikiData?.sections?.find(section => section.id === aviwikiCurrentSectionId);
  return current?.subject || "Aerodynamics";
}

function aviwikiSearch(query) {
  if (!aviwikiData?.sections?.length) return [];
  const q = normalizeAviwikiSearch(query);
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return aviwikiData.sections
    .map((section, order) => {
      const haystack = aviwikiSectionSearchText(section);
      const matched = terms.every(term => haystack.includes(term));
      if (!matched) return null;
      const titleText = normalizeAviwikiSearch(section.title);
      const chapterText = normalizeAviwikiSearch(section.chapter);
      let score = 0;
      terms.forEach(term => {
        if (titleText.includes(term)) score += 8;
        if (chapterText.includes(term)) score += 4;
        if ((section.tags || []).some(tag => normalizeAviwikiSearch(tag).includes(term))) score += 3;
        if (haystack.includes(term)) score += 1;
      });
      return {section, score, order};
    })
    .filter(Boolean)
    .sort((a,b) => b.score - a.score || a.order - b.order)
    .map(x => x.section);
}

function renderAviwikiGlobalSearch() {
  if (!els.aviwikiSearchResults || !els.aviwikiGlobalSearch) return;
  const query = els.aviwikiGlobalSearch.value;
  const results = aviwikiSearch(query).slice(0, 14);
  if (!normalizeAviwikiSearch(query)) {
    els.aviwikiSearchResults.classList.add("hidden");
    els.aviwikiSearchResults.innerHTML = "";
    return;
  }
  els.aviwikiSearchResults.classList.remove("hidden");
  if (!results.length) {
    els.aviwikiSearchResults.innerHTML = '<div class="aviwiki-search-empty">일치하는 이론을 찾지 못했습니다.</div>';
    return;
  }
  els.aviwikiSearchResults.innerHTML = results.map(section => `
    <button class="aviwiki-search-result" type="button" data-aviwiki-section="${escapeHtml(section.id)}">
      <span>${escapeHtml(section.subject)} · ${escapeHtml(section.chapter)}</span>
      <strong>${escapeHtml(section.title)}</strong>
    </button>
  `).join("");
}

function aviwikiFormatInline(text) {
  let safe = escapeHtml(String(text || ""));
  safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
  return safe;
}

function aviwikiLooksLikeHeading(line, prevBlank, nextBlank) {
  const value = String(line || "").trim();
  if (!value || value.length > 78 || !prevBlank || !nextBlank) return false;
  if (/^(figureHint:|\[그림|출처:)/i.test(value)) return false;
  if (/[\t=]/.test(value)) return false;
  if (/[.!?。]$/.test(value)) return false;
  if (/(습니다|입니다|됩니다|합니다|입니다|됩니다)\.?$/.test(value)) return false;
  return true;
}

function renderAviwikiArticleBody(rawText) {
  const lines = String(rawText || "").split(/\r?\n/);
  const blocks = [];
  let i = 0;
  const isBlank = idx => idx < 0 || idx >= lines.length || !String(lines[idx]).trim();

  while (i < lines.length) {
    let line = String(lines[i] || "").trim();
    if (!line) { i += 1; continue; }

    if (/^figureHint:/i.test(line)) {
      blocks.push(`<aside class="aviwiki-figure-hint"><strong>그림 메모</strong><span>${aviwikiFormatInline(line.replace(/^figureHint:\s*/i,""))}</span></aside>`);
      i += 1; continue;
    }

    if (/^\[그림/.test(line) || /^출처:/.test(line)) {
      blocks.push(`<div class="aviwiki-source-line">${aviwikiFormatInline(line)}</div>`);
      i += 1; continue;
    }

    if (line === "·" && i + 1 < lines.length) {
      let items = [];
      while (i < lines.length) {
        if (String(lines[i] || "").trim() === "·") {
          i += 1;
          while (i < lines.length && !String(lines[i] || "").trim()) i += 1;
          if (i < lines.length) items.push(String(lines[i] || "").trim());
          i += 1;
          while (i < lines.length && !String(lines[i] || "").trim()) i += 1;
        } else break;
      }
      blocks.push(`<ul class="aviwiki-bullet-list">${items.map(x => `<li>${aviwikiFormatInline(x)}</li>`).join("")}</ul>`);
      continue;
    }

    if (line.includes("\t")) {
      const rows = [];
      while (i < lines.length && String(lines[i] || "").includes("\t")) {
        rows.push(String(lines[i]).split("\t").map(cell => cell.trim()));
        i += 1;
      }
      if (rows.length) {
        const head = rows[0];
        const body = rows.slice(1);
        blocks.push(`<div class="aviwiki-table-wrap"><table class="aviwiki-table"><thead><tr>${head.map(c => `<th>${aviwikiFormatInline(c)}</th>`).join("")}</tr></thead><tbody>${body.map(row => `<tr>${row.map(c => `<td>${aviwikiFormatInline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      }
      continue;
    }

    const prevBlank = isBlank(i - 1);
    const nextBlank = isBlank(i + 1);
    if (aviwikiLooksLikeHeading(line, prevBlank, nextBlank)) {
      blocks.push(`<h2>${aviwikiFormatInline(line)}</h2>`);
      i += 1; continue;
    }

    if (line.length <= 100 && /[=≈√]/.test(line) && !/[.!?]$/.test(line)) {
      blocks.push(`<div class="aviwiki-formula">${aviwikiFormatInline(line)}</div>`);
      i += 1; continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && String(lines[i] || "").trim()) {
      const candidate = String(lines[i] || "").trim();
      if (/^figureHint:/i.test(candidate) || /^\[그림/.test(candidate) || /^출처:/.test(candidate) || candidate.includes("\t") || candidate === "·") break;
      if (aviwikiLooksLikeHeading(candidate, isBlank(i-1), isBlank(i+1))) break;
      paragraph.push(candidate);
      i += 1;
    }
    blocks.push(`<p>${paragraph.map(aviwikiFormatInline).join("<br>")}</p>`);
  }
  return blocks.join("");
}

function renderAviwikiToc() {
  if (!els.aviwikiTocList || !aviwikiData?.sections?.length) return;
  const subject = aviwikiCurrentSubject();
  const query = normalizeAviwikiSearch(els.aviwikiTocSearch?.value);
  const filteredIds = query ? new Set(aviwikiSearch(query).filter(s => s.subject === subject).map(s => s.id)) : null;
  const chapters = (aviwikiData.chapters || []).filter(chapter => chapter.subject === subject);
  let html = "";
  chapters.forEach(chapter => {
    const items = aviwikiData.sections.filter(section =>
      section.subject === subject &&
      section.chapter === chapter.title &&
      (!filteredIds || filteredIds.has(section.id)) &&
      (!aviwikiBookmarkOnly || aviwikiBookmarks.has(section.id))
    );
    if (!items.length) return;
    html += `<section class="aviwiki-toc-group"><div class="aviwiki-toc-group-title">${escapeHtml(subject.toUpperCase())} · ${escapeHtml(chapter.title)}</div>`;
    html += items.map(section => `
      <button class="aviwiki-toc-item ${section.id === aviwikiCurrentSectionId ? "active" : ""}" type="button" data-aviwiki-section="${escapeHtml(section.id)}">
        <span>${aviwikiBookmarks.has(section.id) ? "♡" : ""}</span><strong>${escapeHtml(section.title)}</strong>
      </button>
    `).join("");
    html += "</section>";
  });
  els.aviwikiTocList.innerHTML = html || '<div class="aviwiki-search-empty">표시할 이론이 없습니다.</div>';
}

async function showAviwikiHome() {
  try {
    await ensureAviwikiData();
  } catch (err) {
    console.error("Aviwiki 로드 실패", err);
    alert("이론 백과사전 데이터를 불러오지 못했습니다.");
    return;
  }
  setQuizFocus(false);
  hideStudySurfaces();
  hideAllHubs();
  els.aviwikiReaderCard?.classList.add("hidden");
  els.aviwikiHomeCard?.classList.remove("hidden");
  renderAviwikiSubjectGrid();
  renderAviwikiResume();
  renderAviwikiGlobalSearch();
  window.scrollTo({top:0, behavior:"smooth"});
}

async function openAviwikiSection(sectionId) {
  try {
    await ensureAviwikiData();
  } catch (err) {
    console.error("Aviwiki 로드 실패", err);
    alert("이론 백과사전 데이터를 불러오지 못했습니다.");
    return;
  }
  const section = aviwikiData.sections.find(item => item.id === sectionId) || aviwikiData.sections[0];
  if (!section) return;

  aviwikiCurrentSectionId = section.id;
  hideStudySurfaces();
  hideAllHubs();
  els.aviwikiHomeCard?.classList.add("hidden");
  els.aviwikiReaderCard?.classList.remove("hidden");

  const subjectSections = aviwikiSectionsForSubject(section.subject);
  const sectionIndex = subjectSections.findIndex(item => item.id === section.id);
  if (els.aviwikiReaderProgress) els.aviwikiReaderProgress.textContent = `${section.subject} · ${sectionIndex + 1} / ${subjectSections.length}`;
  if (els.aviwikiArticleEyebrow) els.aviwikiArticleEyebrow.textContent = `${section.subject} · ${section.chapter}`;
  if (els.aviwikiArticleTitle) els.aviwikiArticleTitle.textContent = section.title;
  if (els.aviwikiArticleTags) {
    els.aviwikiArticleTags.innerHTML = (section.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
  }
  if (els.aviwikiArticleBody) els.aviwikiArticleBody.innerHTML = renderAviwikiArticleBody(section.content);
  if (els.aviwikiBookmarkBtn) {
    const marked = aviwikiBookmarks.has(section.id);
    els.aviwikiBookmarkBtn.textContent = marked ? "♥" : "♡";
    els.aviwikiBookmarkBtn.classList.toggle("active", marked);
    els.aviwikiBookmarkBtn.title = marked ? "북마크 해제" : "북마크";
  }
  if (els.aviwikiPrevBtn) els.aviwikiPrevBtn.disabled = sectionIndex <= 0;
  if (els.aviwikiNextBtn) {
    els.aviwikiNextBtn.disabled = sectionIndex >= subjectSections.length - 1;
    els.aviwikiNextBtn.textContent = sectionIndex >= subjectSections.length - 1 ? "마지막 이론" : "다음 이론 →";
  }
  renderAviwikiToc();
  renderAviwikiResume();
  saveAviwikiState();

  const article = els.aviwikiArticleBody?.closest(".aviwiki-article");
  if (article) article.scrollTop = 0;
  window.scrollTo({top:0, behavior:"smooth"});
}

function toggleAviwikiBookmark() {
  if (!aviwikiCurrentSectionId) return;
  if (aviwikiBookmarks.has(aviwikiCurrentSectionId)) aviwikiBookmarks.delete(aviwikiCurrentSectionId);
  else aviwikiBookmarks.add(aviwikiCurrentSectionId);
  renderAviwikiToc();
  const marked = aviwikiBookmarks.has(aviwikiCurrentSectionId);
  if (els.aviwikiBookmarkBtn) {
    els.aviwikiBookmarkBtn.textContent = marked ? "♥" : "♡";
    els.aviwikiBookmarkBtn.classList.toggle("active", marked);
  }
  saveAviwikiState();
}

function navigateAviwiki(delta) {
  if (!aviwikiData?.sections?.length || !aviwikiCurrentSectionId) return;
  const subject = aviwikiCurrentSubject();
  const rows = aviwikiSectionsForSubject(subject);
  const current = rows.findIndex(section => section.id === aviwikiCurrentSectionId);
  const next = Math.max(0, Math.min(rows.length - 1, current + delta));
  if (next === current || next < 0) return;
  openAviwikiSection(rows[next].id);
}

function renderHomeIdentity() {
  if (!els.homeGreeting) return;
  const profile = window.PilotBankAuth?.getCurrentProfile?.();
  const label = profile?.username || window.PilotBankAuth?.getCurrentUser?.() || "";
  els.homeGreeting.textContent = label ? `${label}님, 오늘의 학습을 시작하세요.` : "오늘의 학습을 시작하세요.";
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
  wrongReviewSubject = null;
  setQuizFocus(false);
  hideStudySurfaces();
  els.textbookHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.homeHero?.classList.remove("hidden");
  els.topProgressCard?.classList.remove("hidden");
  els.modeHubCard?.classList.remove("hidden");
  renderHomeIdentity();
  renderHomeStudyTime();
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

function wrongReviewPool(subject, minIncorrect = 1) {
  const minimum = Math.max(1, Number(minIncorrect) || 1);
  return bank.filter(q => {
    if ((q.subject || "미분류") !== subject) return false;
    const rec = progressStore[q.id] || {};
    if (rec.errorReported) return false;
    return Number(rec.incorrect || 0) >= minimum;
  });
}

function renderWrongReviewBookCounts() {
  document.querySelectorAll("[data-wrong-review-subject]").forEach(btn => {
    const subject = btn.dataset.wrongReviewSubject;
    const rows = wrongReviewPool(subject, 1);
    const maxWrong = rows.reduce((max, q) => Math.max(max, Number(progressStore[q.id]?.incorrect || 0)), 0);
    const label = btn.querySelector(".wrong-review-count");
    if (label) label.textContent = rows.length ? `누적 오답 ${rows.length.toLocaleString()}문제 · 최대 ${maxWrong}회` : "누적 오답 없음";
  });
}

function showWrongReviewHub() {
  wrongReviewSubject = null;
  hideStudySurfaces();
  hideAllHubs();
  renderWrongReviewBookCounts();
  els.wrongReviewHubCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function updateWrongReviewCountInfo() {
  if (!wrongReviewSubject || !els.wrongReviewMinCount) return;
  const minimum = Math.max(1, Number(els.wrongReviewMinCount.value) || 1);
  const rows = wrongReviewPool(wrongReviewSubject, minimum);
  if (els.wrongReviewCountInfo) els.wrongReviewCountInfo.textContent = `${rows.length.toLocaleString()}문제`;
  if (els.wrongReviewStartBtn) {
    els.wrongReviewStartBtn.disabled = rows.length === 0;
    els.wrongReviewStartBtn.textContent = rows.length ? `${rows.length.toLocaleString()}문제 복습 시작` : "복습할 오답 없음";
  }
}

function showWrongReviewFilter(subject) {
  if (!BOOK_SUBJECTS.includes(subject)) return;
  wrongReviewSubject = subject;
  hideStudySurfaces();
  hideAllHubs();
  if (els.wrongReviewBookTitle) els.wrongReviewBookTitle.textContent = `${subject} 오답 복습`;

  const rows = wrongReviewPool(subject, 1);
  const maxWrong = rows.reduce((max, q) => Math.max(max, Number(progressStore[q.id]?.incorrect || 0)), 0);
  if (els.wrongReviewMinCount) {
    const optionMax = Math.max(1, maxWrong);
    els.wrongReviewMinCount.innerHTML = Array.from({length:optionMax}, (_, i) => {
      const n = i + 1;
      return `<option value="${n}">누적 오답 ${n}회 이상</option>`;
    }).join("");
    els.wrongReviewMinCount.value = "1";
  }
  updateWrongReviewCountInfo();
  els.wrongReviewFilterCard?.classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
}

function startWrongReviewSession(subject = wrongReviewSubject, minIncorrect = null) {
  if (!subject) return;
  const minimum = Math.max(1, Number(minIncorrect ?? els.wrongReviewMinCount?.value) || 1);
  const pool = wrongReviewPool(subject, minimum);
  if (!pool.length) {
    alert(`${subject}에서 누적 오답 ${minimum}회 이상인 문제가 없습니다.`);
    updateWrongReviewCountInfo();
    return;
  }

  learningContext = {
    kind:"wrongReview",
    label:`${subject} 오답 복습`,
    allowedSubjects:[subject],
    lockedSubject:subject,
    airline:null,
    baseNote:`누적 오답 ${minimum}회 이상 · ${pool.length}문제 반복 복습`,
  };
  els.mode.value = "study";
  els.scope.value = "all";
  els.countMode.value = "all";
  els.noFigureOnly.checked = false;
  hideStudySurfaces();
  hideAllHubs();
  els.wrongReviewFilterCard?.classList.add("hidden");
  startSession(pool, {
    type:"wrongReview",
    wrongReviewSubject:subject,
    minIncorrect:minimum,
  });
}

function activateLearningContext({kind, label, allowedSubjects, lockedSubject=null, airline=null, note=""}) {
  learningContext = { kind, label, allowedSubjects, lockedSubject, airline, baseNote: note };
  setQuizFocus(false);
  els.homeHero?.classList.add("hidden");
  els.topProgressCard?.classList.add("hidden");
  els.modeHubCard?.classList.add("hidden");
  els.textbookHubCard?.classList.add("hidden");
  els.bookProblemHubCard?.classList.add("hidden");
  els.bookTheoryHubCard?.classList.add("hidden");
  els.theoryCard?.classList.add("hidden");
  els.airlineHubCard?.classList.add("hidden");
  els.wrongReviewHubCard?.classList.add("hidden");
  els.wrongReviewFilterCard?.classList.add("hidden");
  els.resourceLibraryCard?.classList.add("hidden");
  els.resourceViewerCard?.classList.add("hidden");
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
  },
  "항공교통통신": {
    storageKey: "atccomm300",
    paths: ["./data/theory-atccomm-all.json"],
    label: "항공교통통신 이론 학습",
    loadError: "항공교통통신 이론 학습 데이터를 불러오지 못했습니다."
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
function openAtcTheory() { return openTheory("항공교통통신"); }

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
  setQuizFocus(true);
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

// v11.43: Supabase 학습기록 + 중앙 오류보고. 전송 완료된 오류는 사용자 오류 목록에서 숨기고 관리자 서버 목록에는 유지합니다.
// 기존 LocalStorage 기록은 가져오지 않으며, legacy 계정만 기존 브라우저 저장을 유지합니다.
let cloudSyncRequested = false;
let cloudSyncRunning = false;
let cloudQuestionBaseline = new Map();
let cloudFlagBaseline = new Map();
let cloudTheoryBaseline = new Map();

// v11.45: active problem-solving time is stored in Supabase by local calendar day.
const STUDY_TIME_FLUSH_INTERVAL_MS = 15000;
const STUDY_TIME_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
let studyTimeTodaySeconds = 0;
let studyTimeTotalSeconds = 0;
let studyTimePendingSeconds = 0;
let studyTimeLastTickAt = Date.now();
let studyTimeLastFlushAt = Date.now();
let studyTimeLastInteractionAt = Date.now();
let studyTimeFlushRunning = false;
let studyTimeLoaded = false;

function localStudyDate(value = new Date()) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatStudyDuration(seconds) {
  const totalMinutes = Math.max(0, Math.floor(Number(seconds || 0) / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes}분`;
}

function renderHomeStudyTime() {
  if (!els.homeTodayStudyTime || !els.homeTotalStudyTime) return;
  if (!usesSupabaseLearningData()) {
    els.homeTodayStudyTime.textContent = "오늘 학습시간은 Supabase 계정에서 기록됩니다.";
    els.homeTotalStudyTime.textContent = "";
    return;
  }
  const visiblePending = Math.floor(studyTimePendingSeconds);
  els.homeTodayStudyTime.textContent = `오늘은 ${formatStudyDuration(studyTimeTodaySeconds + visiblePending)} 공부했습니다.`;
  els.homeTotalStudyTime.textContent = `지금까지 ${formatStudyDuration(studyTimeTotalSeconds + visiblePending)} 공부했습니다.`;
}

async function loadStudyTimeSummary() {
  if (!usesSupabaseLearningData() || !window.supabaseClient) {
    studyTimeTodaySeconds = 0;
    studyTimeTotalSeconds = 0;
    studyTimeLoaded = true;
    renderHomeStudyTime();
    return;
  }
  try {
    const { data, error } = await window.supabaseClient
      .from("user_study_time_daily")
      .select("study_date,active_seconds");
    if (error) throw error;
    const today = localStudyDate();
    studyTimeTodaySeconds = 0;
    studyTimeTotalSeconds = 0;
    (data || []).forEach(row => {
      const seconds = Number(row.active_seconds || 0);
      studyTimeTotalSeconds += seconds;
      if (row.study_date === today) studyTimeTodaySeconds += seconds;
    });
    studyTimeLoaded = true;
  } catch (err) {
    console.error("[Supabase] 학습시간 로드 실패", err);
    studyTimeLoaded = false;
  }
  renderHomeStudyTime();
}

function studyTimerShouldCount() {
  return usesSupabaseLearningData()
    && document.body.classList.contains("quiz-active")
    && !!els.quizCard
    && !els.quizCard.classList.contains("hidden")
    && document.visibilityState === "visible"
    && (Date.now() - studyTimeLastInteractionAt) < STUDY_TIME_IDLE_TIMEOUT_MS;
}

function accrueStudyTime() {
  const now = Date.now();
  const elapsed = Math.max(0, Math.min(5, (now - studyTimeLastTickAt) / 1000));
  studyTimeLastTickAt = now;
  if (studyTimerShouldCount()) {
    studyTimePendingSeconds += elapsed;
  }
}

async function flushStudyTime() {
  if (!usesSupabaseLearningData() || !window.supabaseClient || studyTimeFlushRunning) return;
  accrueStudyTime();
  let amount = Math.floor(studyTimePendingSeconds);
  if (amount < 1) return;
  amount = Math.min(amount, 120);
  studyTimePendingSeconds -= amount;
  studyTimeFlushRunning = true;
  try {
    const { error } = await window.supabaseClient.rpc("add_my_study_seconds", {
      p_study_date: localStudyDate(),
      p_seconds: amount,
    });
    if (error) throw error;
    studyTimeTodaySeconds += amount;
    studyTimeTotalSeconds += amount;
    studyTimeLastFlushAt = Date.now();
  } catch (err) {
    studyTimePendingSeconds += amount;
    console.error("[Supabase] 학습시간 저장 실패", err);
  } finally {
    studyTimeFlushRunning = false;
    renderHomeStudyTime();
  }
}

function updateStudyTimerState() {
  accrueStudyTime();
  studyTimeLastTickAt = Date.now();
  if (document.body.classList.contains("quiz-active")) {
    studyTimeLastInteractionAt = Date.now();
  } else {
    flushStudyTime();
  }
}

function markStudyInteraction() {
  if (!document.body.classList.contains("quiz-active")) return;
  studyTimeLastInteractionAt = Date.now();
}

window.setInterval(() => {
  accrueStudyTime();
  if (Date.now() - studyTimeLastFlushAt >= STUDY_TIME_FLUSH_INTERVAL_MS) flushStudyTime();
}, 1000);

document.addEventListener("pointerdown", markStudyInteraction, {passive:true});
document.addEventListener("keydown", markStudyInteraction, {passive:true});
document.addEventListener("touchstart", markStudyInteraction, {passive:true});
document.addEventListener("visibilitychange", () => {
  accrueStudyTime();
  if (document.visibilityState === "hidden") flushStudyTime();
  else studyTimeLastTickAt = Date.now();
});
window.addEventListener("pagehide", () => { accrueStudyTime(); flushStudyTime(); });

function getSupabaseLearningUserId() {
  return window.PilotBankAuth?.getCurrentProfile?.()?.id || null;
}

function usesSupabaseLearningData() {
  return !!(window.supabaseClient && getSupabaseLearningUserId());
}

function configureUserStorage(user) {
  currentUser = user || null;
  STORAGE_KEY = window.PilotBankAuth?.progressStorageKey(BASE_STORAGE_KEY) || BASE_STORAGE_KEY;
  if (usesSupabaseLearningData()) {
    // v11.39부터 Supabase 계정은 브라우저 기록을 원본으로 사용하지 않습니다.
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}

function maybeImportLegacyProgress() {
  if (usesSupabaseLearningData()) return;
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

async function fetchAllUserRows(table, columns, orderColumn) {
  const supabase = window.supabaseClient;
  const userId = getSupabaseLearningUserId();
  if (!supabase || !userId) return [];

  const pageSize = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    let query = supabase
      .from(table)
      .select(columns)
      .eq("user_id", userId)
      .range(from, from + pageSize - 1);
    if (orderColumn) query = query.order(orderColumn, { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    const chunk = data || [];
    rows.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function emptyQuestionRecord() {
  return {
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

function questionComparable(rec = {}) {
  return {
    attempts: Number(rec.attempts || 0),
    correct: Number(rec.correct || 0),
    incorrect: Number(rec.incorrect || 0),
    lastResult: rec.lastResult || null,
    lastAnswer: rec.lastAnswer ?? null,
    lastAttempted: rec.lastAttempted || null,
    errorReported: !!rec.errorReported,
    errorReportedAt: rec.errorReportedAt || null,
    errorNote: rec.errorNote || "",
    errorQuestionSnapshot: rec.errorQuestionSnapshot || "",
    errorChoicesSnapshot: Array.isArray(rec.errorChoicesSnapshot) ? rec.errorChoicesSnapshot : [],
    errorSubjectSnapshot: rec.errorSubjectSnapshot || "",
    errorUnitSnapshot: rec.errorUnitSnapshot || "",
    errorSubunitSnapshot: rec.errorSubunitSnapshot || "",
  };
}

function flagComparable(rec = {}) {
  return { favorite: !!rec.favorite, examExcluded: !!rec.examExcluded };
}

function theoryComparable(rec = {}) {
  return {
    read: !!rec.read,
    passed: !!rec.passed,
    attempts: Number(rec.attempts || 0),
    bestScore: Number(rec.bestScore || 0),
    lastScore: rec.lastScore === null || rec.lastScore === undefined ? null : Number(rec.lastScore),
    lastTakenAt: rec.lastTakenAt || null,
  };
}

function captureCloudBaselines(store = progressStore) {
  cloudQuestionBaseline = new Map();
  cloudFlagBaseline = new Map();
  cloudTheoryBaseline = new Map();

  Object.entries(store || {}).forEach(([id, rec]) => {
    if (id === "__theory" || !rec || typeof rec !== "object") return;
    cloudQuestionBaseline.set(id, JSON.stringify(questionComparable(rec)));
    cloudFlagBaseline.set(id, JSON.stringify(flagComparable(rec)));
  });

  const theoryRoot = store?.__theory || {};
  Object.entries(theoryRoot).forEach(([storageKey, root]) => {
    Object.entries(root?.stages || {}).forEach(([stageId, rec]) => {
      cloudTheoryBaseline.set(`${storageKey}::${stageId}`, JSON.stringify(theoryComparable(rec)));
    });
  });
}

async function loadCloudProgress() {
  const [questionRows, flagRows, theoryRows] = await Promise.all([
    fetchAllUserRows(
      "user_question_progress",
      "question_id,attempts,correct,incorrect,last_result,last_answer,last_attempted,error_reported,error_reported_at,error_note,error_question_snapshot,error_choices_snapshot,error_subject_snapshot,error_unit_snapshot,error_subunit_snapshot",
      "question_id"
    ),
    fetchAllUserRows("user_question_flags", "question_id,favorite,exam_excluded", "question_id"),
    fetchAllUserRows("user_theory_progress", "storage_key,stage_id,read,passed,attempts,best_score,last_score,last_taken_at", "stage_id"),
  ]);

  const store = {};
  questionRows.forEach(row => {
    store[row.question_id] = {
      ...emptyQuestionRecord(),
      attempts: Number(row.attempts || 0),
      correct: Number(row.correct || 0),
      incorrect: Number(row.incorrect || 0),
      lastResult: row.last_result || null,
      lastAnswer: row.last_answer ?? null,
      lastAttempted: row.last_attempted || null,
      errorReported: !!row.error_reported,
      errorReportedAt: row.error_reported_at || null,
      errorNote: row.error_note || "",
      errorQuestionSnapshot: row.error_question_snapshot || "",
      errorChoicesSnapshot: Array.isArray(row.error_choices_snapshot) ? row.error_choices_snapshot : [],
      errorSubjectSnapshot: row.error_subject_snapshot || "",
      errorUnitSnapshot: row.error_unit_snapshot || "",
      errorSubunitSnapshot: row.error_subunit_snapshot || "",
    };
  });

  flagRows.forEach(row => {
    const rec = store[row.question_id] || (store[row.question_id] = emptyQuestionRecord());
    rec.favorite = !!row.favorite;
    rec.examExcluded = !!row.exam_excluded;
  });

  theoryRows.forEach(row => {
    if (!store.__theory) store.__theory = {};
    if (!store.__theory[row.storage_key]) store.__theory[row.storage_key] = { stages: {} };
    store.__theory[row.storage_key].stages[row.stage_id] = {
      read: !!row.read,
      passed: !!row.passed,
      attempts: Number(row.attempts || 0),
      bestScore: Number(row.best_score || 0),
      lastScore: row.last_score === null || row.last_score === undefined ? null : Number(row.last_score),
      lastTakenAt: row.last_taken_at || null,
    };
  });

  captureCloudBaselines(store);
  return store;
}

async function loadProgress() {
  if (usesSupabaseLearningData()) {
    try {
      return await loadCloudProgress();
    } catch (err) {
      console.error("[Supabase] 학습기록 로드 실패", err);
      alert("Supabase 학습기록을 불러오지 못했습니다. 데이터베이스 SQL 설정을 확인해 주세요.");
      return {};
    }
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function questionMetadataFor(id) {
  const q = bank.find(item => item.id === id);
  if (!q) return { subject: null, study_unit: null, subunit: null };
  return {
    subject: q.subject || null,
    study_unit: studyUnitOf(q) || null,
    subunit: [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ") || null,
  };
}

async function upsertInBatches(table, rows, onConflict) {
  const supabase = window.supabaseClient;
  if (!supabase || !rows.length) return;
  const size = 250;
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw error;
  }
}

async function syncProgressToSupabase() {
  if (!usesSupabaseLearningData()) return;
  const userId = getSupabaseLearningUserId();
  const now = new Date().toISOString();
  const questionRows = [];
  const questionBaselineUpdates = [];
  const flagRows = [];
  const flagBaselineUpdates = [];
  const theoryRows = [];
  const theoryBaselineUpdates = [];

  Object.entries(progressStore || {}).forEach(([id, rec]) => {
    if (id === "__theory" || !rec || typeof rec !== "object") return;

    const qComparable = questionComparable(rec);
    const qSerialized = JSON.stringify(qComparable);
    if (cloudQuestionBaseline.get(id) !== qSerialized) {
      const meta = questionMetadataFor(id);
      questionRows.push({
        user_id: userId,
        question_id: id,
        ...meta,
        attempts: qComparable.attempts,
        correct: qComparable.correct,
        incorrect: qComparable.incorrect,
        last_result: qComparable.lastResult,
        last_answer: qComparable.lastAnswer,
        last_attempted: qComparable.lastAttempted,
        error_reported: qComparable.errorReported,
        error_reported_at: qComparable.errorReportedAt,
        error_note: qComparable.errorNote,
        error_question_snapshot: qComparable.errorQuestionSnapshot,
        error_choices_snapshot: qComparable.errorChoicesSnapshot,
        error_subject_snapshot: qComparable.errorSubjectSnapshot,
        error_unit_snapshot: qComparable.errorUnitSnapshot,
        error_subunit_snapshot: qComparable.errorSubunitSnapshot,
        updated_at: now,
      });
      questionBaselineUpdates.push([id, qSerialized]);
    }

    const fComparable = flagComparable(rec);
    const fSerialized = JSON.stringify(fComparable);
    const hadFlagRow = cloudFlagBaseline.has(id);
    if (cloudFlagBaseline.get(id) !== fSerialized && (hadFlagRow || fComparable.favorite || fComparable.examExcluded)) {
      flagRows.push({
        user_id: userId,
        question_id: id,
        favorite: fComparable.favorite,
        exam_excluded: fComparable.examExcluded,
        updated_at: now,
      });
      flagBaselineUpdates.push([id, fSerialized]);
    } else if (!hadFlagRow) {
      // 기본 false/false 상태는 DB 행을 만들 필요가 없지만 현재 세션의 기준값으로는 기억합니다.
      cloudFlagBaseline.set(id, fSerialized);
    }
  });

  const theoryRoot = progressStore?.__theory || {};
  Object.entries(theoryRoot).forEach(([storageKey, root]) => {
    Object.entries(root?.stages || {}).forEach(([stageId, rec]) => {
      const comparable = theoryComparable(rec);
      const serialized = JSON.stringify(comparable);
      const key = `${storageKey}::${stageId}`;
      if (cloudTheoryBaseline.get(key) === serialized) return;
      theoryRows.push({
        user_id: userId,
        storage_key: storageKey,
        stage_id: stageId,
        read: comparable.read,
        passed: comparable.passed,
        attempts: comparable.attempts,
        best_score: comparable.bestScore,
        last_score: comparable.lastScore,
        last_taken_at: comparable.lastTakenAt,
        updated_at: now,
      });
      theoryBaselineUpdates.push([key, serialized]);
    });
  });

  try {
    if (questionRows.length) {
      await upsertInBatches("user_question_progress", questionRows, "user_id,question_id");
      questionBaselineUpdates.forEach(([key, value]) => cloudQuestionBaseline.set(key, value));
    }
    if (flagRows.length) {
      await upsertInBatches("user_question_flags", flagRows, "user_id,question_id");
      flagBaselineUpdates.forEach(([key, value]) => cloudFlagBaseline.set(key, value));
    }
    if (theoryRows.length) {
      await upsertInBatches("user_theory_progress", theoryRows, "user_id,storage_key,stage_id");
      theoryBaselineUpdates.forEach(([key, value]) => cloudTheoryBaseline.set(key, value));
    }
  } catch (err) {
    console.error("[Supabase] 학습기록 저장 실패", err);
  }
}

function queueCloudProgressSync() {
  if (!usesSupabaseLearningData()) return;
  cloudSyncRequested = true;
  if (cloudSyncRunning) return;
  cloudSyncRunning = true;
  (async () => {
    try {
      while (cloudSyncRequested) {
        cloudSyncRequested = false;
        await syncProgressToSupabase();
      }
    } finally {
      cloudSyncRunning = false;
      if (cloudSyncRequested) queueCloudProgressSync();
    }
  })();
}

function saveProgress() {
  if (usesSupabaseLearningData()) {
    queueCloudProgressSync();
    return true;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressStore));
    return true;
  } catch (err) {
    console.warn("학습기록을 LocalStorage에 저장하지 못했습니다.", err);
    return false;
  }
}

function recordAttemptToCloud(q, selected, isCorrect) {
  if (!usesSupabaseLearningData() || !q) return;
  const userId = getSupabaseLearningUserId();
  const row = {
    user_id: userId,
    question_id: q.id,
    selected_answer: selected ?? null,
    is_correct: !!isCorrect,
    mode: els.mode?.value || null,
    session_type: sessionMeta?.type || null,
    subject: q.subject || null,
    study_unit: studyUnitOf(q) || null,
    subunit: [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ") || null,
    answered_at: new Date().toISOString(),
  };
  window.supabaseClient.from("user_attempts").insert(row).then(({ error }) => {
    if (error) console.error("[Supabase] 상세 풀이 이력 저장 실패", error);
  });
}

function recordSessionToCloud(scorePct) {
  if (!usesSupabaseLearningData() || sessionMeta?.__cloudLogged) return;
  sessionMeta.__cloudLogged = true;
  const userId = getSupabaseLearningUserId();
  const cleanMeta = { ...sessionMeta };
  delete cleanMeta.__cloudLogged;
  const row = {
    user_id: userId,
    session_type: cleanMeta.type || els.mode?.value || "study",
    mode: els.mode?.value || null,
    context_label: learningContext?.label || null,
    question_count: session.length,
    correct_count: correctCount,
    score_pct: Number.isFinite(scorePct) ? scorePct : null,
    question_ids: session.map(q => q.id),
    wrong_question_ids: wrongQuestions.map(q => q.id),
    metadata: cleanMeta,
    completed_at: new Date().toISOString(),
  };
  window.supabaseClient.from("user_exam_sessions").insert(row).then(({ error }) => {
    if (error) console.error("[Supabase] 세션 결과 저장 실패", error);
  });
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

    // v11.51: 관리자 회원관리 화면이 마이페이지와 동일한 전체 문제 수를
    // 사용해 회원별 진도를 계산할 수 있도록 현재 문제은행 규모를 공개합니다.
    window.PilotBankRuntime = window.PilotBankRuntime || {};
    window.PilotBankRuntime.totalQuestionCount = bank.length;
    window.dispatchEvent(new CustomEvent("pilotbank:bank-loaded", {
      detail: { totalQuestionCount: bank.length }
    }));

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

  const unitLabels = new Map();
  filtered.forEach(q => {
    const u = studyUnitOf(q);
    if (u && !unitLabels.has(u)) unitLabels.set(u, q.study_unit_title || u);
  });
  els.studyUnit.innerHTML = `<option value="">전체</option>` +
    units.map(u => {
      const label = (subject === JEJU_RECALL_SUBJECT || subject === TRINITY_SUBJECT) ? (unitLabels.get(u) || u) : `SU ${u}`;
      return `<option value="${escapeHtml(u)}">${escapeHtml(label)}</option>`;
    }).join("");

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

function startSession(source = null, metaOverride = null) {
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

  if (metaOverride && typeof metaOverride === "object") {
    sessionMeta = {...metaOverride};
    delete sessionMeta.__cloudLogged;
  }

  index = 0;
  correctCount = 0;
  wrongQuestions = [];
  examAnswers = {};
  studyAnswers = {};
  sessionChoiceOrder = {};

  els.resultCard.classList.add("hidden");
  els.statsCard.classList.add("hidden");
  els.errorsCard.classList.add("hidden");
  els.controlsCard?.classList.add("hidden");
  els.homeHero?.classList.add("hidden");
  els.topProgressCard?.classList.add("hidden");
  els.quizCard.classList.remove("hidden");
  setQuizFocus(true);

  renderQuestion();
  els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function sessionChoicesFor(q) {
  const raw = normalizeChoices(q);
  if (!sessionChoiceOrder[q.id]) {
    const ordered = els.shuffleChoices.checked ? shuffle([...raw]) : [...raw];
    sessionChoiceOrder[q.id] = ordered.map(choice => String(choice.id));
  }
  const byId = new Map(raw.map(choice => [String(choice.id), choice]));
  return sessionChoiceOrder[q.id].map(id => byId.get(String(id))).filter(Boolean);
}

function studyFeedbackFor(q, state) {
  if (!state) return "";
  const correct = String(q.answer || "").toUpperCase();
  const explanation = q.explanation ? `\n\n${q.explanation}` : "";
  const reference = q.reference ? `\n\n출처: ${q.reference}` : "";
  return `${state.isCorrect ? "정답입니다." : `오답입니다. 정답: ${correct}`}${explanation}${reference}`;
}

function renderQuestion() {
  const q = session[index];
  if (!q) return;
  const studyState = !isExamLike() ? studyAnswers[q.id] : null;
  answered = !!studyState;

  els.progress.textContent = `${index + 1} / ${session.length}`;
  els.score.textContent = sessionMeta.type === "theoryTest"
    ? "쪽지시험 · 10문항"
    : (sessionMeta.type === "wrongReview"
      ? `오답 복습 · 정답 ${correctCount}`
      : (isExamLike() ? (els.mode.value === "mock" ? "모의시험" : "시험모드") : `정답 ${correctCount}`));
  els.question.textContent = q.question || "(문제 없음)";
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";

  const unitPill = studyUnitOf(q) ? (q.subject === JEJU_RECALL_SUBJECT ? studyUnitOf(q) : `SU ${studyUnitOf(q)}`) : "";
  const pills = [q.id, q.subject, unitPill, [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ")].filter(Boolean);
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

  const choices = sessionChoicesFor(q);
  els.choices.innerHTML = "";
  const examExisting = examAnswers[q.id];
  const correct = String(q.answer || "").toUpperCase();

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.dataset.choiceId = choice.id;
    btn.innerHTML = `<strong>${escapeHtml(choice.id)}.</strong> ${escapeHtml(choice.text)}`;

    if (isExamLike() && examExisting === choice.id) btn.classList.add("selected");

    if (!isExamLike() && studyState) {
      btn.disabled = true;
      const id = String(choice.id).toUpperCase();
      if (id === correct) btn.classList.add("correct");
      if (String(studyState.selected).toUpperCase() === id && !studyState.isCorrect) btn.classList.add("incorrect");
    }

    btn.addEventListener("click", () => {
      if (isExamLike()) selectExamAnswer(choice.id);
      else answerStudy(choice.id, btn);
    });

    els.choices.appendChild(btn);
  });

  if (!isExamLike() && studyState) {
    els.feedback.className = `feedback ${studyState.isCorrect ? "good" : "bad"}`;
    els.feedback.textContent = studyFeedbackFor(q, studyState);
  }

  if (els.prev) {
    els.prev.disabled = index === 0;
    els.prev.classList.toggle("is-disabled", index === 0);
  }

  if (isExamLike()) {
    els.next.textContent = index === session.length - 1 ? (els.mode.value === "mock" ? "모의시험 제출" : "시험 제출") : "다음 문제 →";
    els.next.classList.remove("hidden");
  } else if (studyState) {
    els.next.textContent = index === session.length - 1 ? "결과 보기" : "다음 문제 →";
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
  const q = session[index];
  if (!q || studyAnswers[q.id]) return;

  const correct = String(q.answer || "").toUpperCase();
  const isCorrect = selected.toUpperCase() === correct;
  answered = true;
  studyAnswers[q.id] = { selected, isCorrect };

  recordAttempt(q, selected, isCorrect);

  if (isCorrect) correctCount++;
  else wrongQuestions.push(q);

  [...els.choices.querySelectorAll(".choice")].forEach(btn => {
    btn.disabled = true;
    const id = btn.dataset.choiceId.toUpperCase();
    if (id === correct) btn.classList.add("correct");
    if (btn === clickedButton && !isCorrect) btn.classList.add("incorrect");
  });

  els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  els.feedback.textContent = studyFeedbackFor(q, studyAnswers[q.id]);

  els.score.textContent = sessionMeta.type === "wrongReview" ? `오답 복습 · 정답 ${correctCount}` : `정답 ${correctCount}`;
  els.next.textContent = index === session.length - 1 ? "결과 보기" : "다음 문제 →";
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
  recordAttemptToCloud(q, selected, isCorrect);
  renderTopProgress();
}

function previousQuestion() {
  if (index <= 0) return;
  index--;
  renderQuestion();
  els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
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
  setQuizFocus(false);
  els.quizCard.classList.add("hidden");
  els.resultCard.classList.remove("hidden");

  const pct = Math.round((correctCount / session.length) * 100);
  recordSessionToCloud(pct);
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
  } else if (sessionMeta.type === "wrongReview") {
    const subject = sessionMeta.wrongReviewSubject || wrongReviewSubject || "교재";
    const minimum = Number(sessionMeta.minIncorrect || 1);
    els.resultText.textContent = `오답 복습 · ${subject} · 누적 오답 ${minimum}회 이상 · ${session.length}문제 중 ${correctCount}문제 정답 · ${pct}% · 이번 회차 오답 ${wrongQuestions.length}문제`;
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

  if (sessionMeta.type === "wrongReview") {
    els.retryWrong.classList.remove("hidden");
    els.retryWrong.textContent = "이번 회차 오답만 다시";
    els.restart.textContent = "같은 조건으로 다시 복습";
  } else if (sessionMeta.type !== "theoryTest") {
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
    .filter(([id, rec]) => rec?.errorReported && !submittedErrorReportIds.has(id))
    .map(([id, rec]) => {
      const q = bank.find(item => item.id === id);
      return { id, rec, q };
    })
    .sort((a, b) => (b.rec.errorReportedAt || "").localeCompare(a.rec.errorReportedAt || ""));
}

function updateErrorCount() {
  const count = getReportedRecords().length;
  els.errorCountBadge.textContent = count.toLocaleString();
  els.errorsBtn.title = `전송 대기 오류 ${count}문제`;
}

async function loadSubmittedErrorReportIds() {
  submittedErrorReportIds = new Set();
  if (!usesSupabaseLearningData() || !window.supabaseClient) return;
  try {
    const userId = getSupabaseLearningUserId();
    const { data, error } = await window.supabaseClient
      .from("error_reports")
      .select("question_id")
      .eq("user_id", userId);
    if (error) throw error;
    submittedErrorReportIds = new Set((data || []).map(row => row.question_id).filter(Boolean));
  } catch (err) {
    console.error("[Supabase] 제출된 오류 보고 목록 확인 실패", err);
  }
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
  // 과거에 서버로 제출했던 문제를 사용자가 다시 ERROR 처리하면 새 보고 대기 건으로 취급합니다.
  if (submittedErrorReportIds.has(q.id)) submittedErrorReportIds.delete(q.id);
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
  delete studyAnswers[q.id];
  delete sessionChoiceOrder[q.id];
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
  setQuizFocus(false);
  hideStudySurfaces();
  hideAllHubs();
  renderErrorReports();
  els.errorsCard.classList.remove("hidden");
  els.errorsCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function sendAllErrorReports() {
  const reports = getReportedRecords();
  if (!reports.length) {
    els.copyErrorsStatus.textContent = "전송할 오류가 없습니다.";
    return;
  }

  if (!usesSupabaseLearningData()) {
    els.copyErrorsStatus.textContent = "서버 오류 보고는 Supabase 회원 계정에서 사용할 수 있습니다.";
    return;
  }

  const supabase = window.supabaseClient;
  const userId = getSupabaseLearningUserId();
  const button = els.sendErrors;
  if (button) button.disabled = true;
  els.copyErrorsStatus.textContent = "오류 보고를 전송하고 있습니다...";

  const rows = reports.map(({ id, rec, q }) => ({
    user_id: userId,
    question_id: id,
    subject: q?.subject || rec.errorSubjectSnapshot || "미분류",
    study_unit: q ? String(studyUnitOf(q) || "") : String(rec.errorUnitSnapshot || ""),
    subunit: q
      ? [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ")
      : String(rec.errorSubunitSnapshot || ""),
    question_snapshot: q?.question || rec.errorQuestionSnapshot || "",
    choices_snapshot: errorChoicesFor(q, rec),
    error_note: String(rec.errorNote || "").trim(),
    reported_at: rec.errorReportedAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  try {
    const { error } = await supabase
      .from("error_reports")
      .upsert(rows, { onConflict: "user_id,question_id" });
    if (error) throw error;

    // 서버 전송이 완료된 항목은 사용자의 "오류 목록"에서 즉시 제거합니다.
    // rec.errorReported는 true로 유지하므로 해당 문제는 계속 출제 제외 상태입니다.
    reports.forEach(({ id }) => submittedErrorReportIds.add(id));
    updateErrorCount();
    renderErrorReports();
    els.copyErrorsStatus.textContent = "감사합니다. 빠른 시일 내에 반영하겠습니다.";
  } catch (err) {
    console.error("[Supabase] 오류 보고 전송 실패", err);
    els.copyErrorsStatus.textContent = `전송 실패: ${err?.message || "알 수 없는 오류"}`;
  } finally {
    if (button) button.disabled = false;
  }
}

function configureAdminErrorAccess() {
  const profile = window.PilotBankAuth?.getCurrentProfile?.();
  const isAdmin = !!profile?.is_admin;
  els.adminErrorReportsBtn?.classList.toggle("hidden", !isAdmin);
  els.problemAdminLink?.classList.toggle("hidden", !isAdmin);
}

function formatAdminReportTime(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

async function loadAdminErrorReports() {
  const profile = window.PilotBankAuth?.getCurrentProfile?.();
  if (!profile?.is_admin || !window.supabaseClient) return;

  els.adminErrorReportStatus.textContent = "불러오는 중...";
  els.adminErrorReportsList.innerHTML = "";
  try {
    const { data, error } = await window.supabaseClient
      .from("error_reports")
      .select("id,user_id,question_id,subject,study_unit,subunit,question_snapshot,choices_snapshot,error_note,reported_at,updated_at,profiles(username,email)")
      .order("reported_at", { ascending: false });
    if (error) throw error;

    const reports = Array.isArray(data) ? data : [];
    adminErrorReportsCache = reports;
    const uniqueQuestions = new Set(reports.map(row => row.question_id)).size;
    els.adminErrorReportSummary.textContent = `총 ${reports.length}건 · 고유 문제 ${uniqueQuestions}개`;
    els.adminErrorReportsEmpty.classList.toggle("hidden", reports.length > 0);
    els.adminErrorReportsList.innerHTML = "";

    reports.forEach(row => {
      const reporter = row.profiles?.username || row.profiles?.email || row.user_id;
      const choices = Array.isArray(row.choices_snapshot) ? row.choices_snapshot : [];
      const item = document.createElement("article");
      item.className = "error-report-item";
      item.innerHTML = `
        <div class="error-report-head">
          <div>
            <strong>${escapeHtml(row.question_id || "")}</strong>
            <div class="muted">${escapeHtml(row.subject || "미분류")}${row.study_unit ? ` · SU ${escapeHtml(row.study_unit)}` : ""}${row.subunit ? ` · ${escapeHtml(row.subunit)}` : ""}</div>
          </div>
          <div class="muted">${escapeHtml(formatAdminReportTime(row.reported_at))}</div>
        </div>
        <div class="muted">보고자: ${escapeHtml(reporter)}</div>
        <p class="error-question">${escapeHtml(row.question_snapshot || "(지문 없음)")}</p>
        ${choices.length ? `<div class="error-choice-list">${choices.map(choice => `<div>${escapeHtml(choice)}</div>`).join("")}</div>` : ""}
        <div class="error-note-label"><strong>오류 내용</strong><div>${escapeHtml(row.error_note || "(메모 없음)")}</div></div>
      `;
      els.adminErrorReportsList.appendChild(item);
    });
    els.adminErrorReportStatus.textContent = "";
  } catch (err) {
    console.error("[Supabase] 관리자 오류 목록 조회 실패", err);
    els.adminErrorReportSummary.textContent = "조회 실패";
    els.adminErrorReportStatus.textContent = err?.message || "오류 목록을 불러오지 못했습니다.";
  }
}

function adminErrorReportsAsText() {
  const reports = adminErrorReportsCache || [];
  const header = `보고된 오류 총목록 · ${reports.length}건`;
  const body = reports.map((row, i) => {
    const reporter = row.profiles?.username || row.profiles?.email || row.user_id || "";
    const choices = Array.isArray(row.choices_snapshot) ? row.choices_snapshot : [];
    return [
      `[${i + 1}] ${row.question_id || ""}`,
      `${row.subject || "미분류"}${row.study_unit ? ` · SU ${row.study_unit}` : ""}${row.subunit ? ` · ${row.subunit}` : ""}`,
      `보고자: ${reporter}`,
      `보고시각: ${formatAdminReportTime(row.reported_at)}`,
      `문제: ${row.question_snapshot || "(지문 없음)"}`,
      ...choices,
      `오류 내용: ${row.error_note || "(메모 없음)"}`,
    ].join("\n");
  }).join("\n\n------------------------------\n\n");
  return `${header}\n\n${body}`;
}

async function copyAdminErrorReportsToClipboard() {
  const profile = window.PilotBankAuth?.getCurrentProfile?.();
  if (!profile?.is_admin) return;
  if (!adminErrorReportsCache.length) {
    els.adminErrorReportStatus.textContent = "복사할 오류 보고가 없습니다.";
    return;
  }
  const text = adminErrorReportsAsText();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    els.adminErrorReportStatus.textContent = `전체 ${adminErrorReportsCache.length}건을 복사했습니다.`;
  } catch (err) {
    console.error("관리자 오류 목록 복사 실패", err);
    els.adminErrorReportStatus.textContent = "복사에 실패했습니다. 브라우저의 클립보드 권한을 확인해 주세요.";
  }
}

async function showAdminErrorReports() {
  const profile = window.PilotBankAuth?.getCurrentProfile?.();
  if (!profile?.is_admin) {
    alert("관리자 계정에서만 확인할 수 있습니다.");
    return;
  }
  setQuizFocus(false);
  hideStudySurfaces();
  hideAllHubs();
  els.adminErrorReportsCard?.classList.remove("hidden");
  await loadAdminErrorReports();
  els.adminErrorReportsCard?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  els.copyErrorsStatus.textContent = "개인 오류 목록을 초기화했습니다. 이미 서버로 전송한 보고는 관리자 목록에 유지됩니다.";
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
  setQuizFocus(false);
  hideStudySurfaces();
  hideAllHubs();

  const overall = aggregateStats(bank);
  const profile = window.PilotBankAuth?.getCurrentProfile?.();
  const displayName = profile?.username || window.PilotBankAuth?.getCurrentUser?.() || "사용자";
  const email = profile?.email || "";

  if (els.myPageUserMeta) {
    els.myPageUserMeta.innerHTML = `
      <div class="mypage-avatar">${escapeHtml(String(displayName).slice(0, 1).toUpperCase())}</div>
      <div><strong>${escapeHtml(displayName)}</strong>${email ? `<span>${escapeHtml(email)}</span>` : ""}</div>
    `;
  }

  const summary = [
    ["전체 진도", `${overall.progressPct}%`, `${overall.solved.toLocaleString()} / ${overall.total.toLocaleString()}문제`],
    ["누적 정답률", pctText(overall.accuracyPct), `${overall.correct.toLocaleString()} 정답 · ${overall.incorrect.toLocaleString()} 오답`],
    ["누적 풀이", overall.attempts.toLocaleString(), "전체 시도 횟수"],
    ["시험 제외", overall.excluded.toLocaleString(), "! 표시 문제"],
  ];

  els.statsSummary.innerHTML = summary.map(([label,value,sub]) => `
    <div class="summary-box"><span class="muted">${label}</span><strong>${value}</strong><small>${sub}</small></div>
  `).join("");

  const subjectStats = buildGroupStats(q => ({
    subject: q.subject || "미분류",
  })).sort((a,b) => a.subject.localeCompare(b.subject, "ko"));

  if (els.myPageBookGrid) {
    const bySubject = new Map(subjectStats.map(row => [row.subject, row]));
    els.myPageBookGrid.innerHTML = BOOK_SUBJECTS.map(subject => {
      const row = bySubject.get(subject) || {total:0,solved:0,progressPct:0,accuracyPct:null,attempts:0};
      return `
        <article class="mypage-book-card">
          <div class="mypage-book-head"><strong>${escapeHtml(subject)}</strong><span>${row.solved.toLocaleString()} / ${row.total.toLocaleString()}</span></div>
          <div class="mypage-book-metrics"><span>학습률 <b>${row.progressPct}%</b></span><span>정답률 <b>${pctText(row.accuracyPct)}</b></span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${row.progressPct}%"></div></div>
        </article>`;
    }).join("");
  }

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

  if (els.weakestSuList) {
    els.weakestSuList.innerHTML = attemptedSus.length
      ? attemptedSus.slice(0, 5).map((row, i) => `
        <article class="weak-part-item">
          <span class="weak-rank">${i + 1}</span>
          <div class="weak-part-main"><strong>${escapeHtml(row.subject)} · SU ${escapeHtml(row.unit)}</strong><span>누적 ${row.attempts}회 · ${row.solved}/${row.total}문제 학습</span></div>
          <div class="weak-part-score">${row.accuracyPct}%</div>
        </article>`).join("")
      : '<div class="notice">문제를 풀면 정답률이 낮은 Study Unit을 최대 5개까지 보여줍니다.</div>';
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
els.prev?.addEventListener("click", previousQuestion);
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
  if (sessionMeta.type === "wrongReview") {
    const meta = {...sessionMeta};
    if (!wrong.length) return;
    startSession(wrong, meta);
    return;
  }
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
  if (sessionMeta.type === "wrongReview") {
    startWrongReviewSession(sessionMeta.wrongReviewSubject, sessionMeta.minIncorrect);
    return;
  }
  setQuizFocus(false);
  els.resultCard.classList.add("hidden");
  els.controlsCard.classList.remove("hidden");
  els.controlsCard.scrollIntoView({behavior:"smooth", block:"start"});
});
els.statsBtn.addEventListener("click", showStats);
els.homeMyPageBtn?.addEventListener("click", showStats);
els.closeStats.addEventListener("click", showMainModeHub);
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
    showMainModeHub();
    return;
  }

  const sendErrorsButton = event.target.closest("#sendErrorsBtn, #copyErrorsBtn");
  if (sendErrorsButton) {
    event.preventDefault();
    sendAllErrorReports();
    return;
  }

  const adminErrorsButton = event.target.closest("#adminErrorReportsBtn");
  if (adminErrorsButton) {
    event.preventDefault();
    showAdminErrorReports();
    return;
  }

  const closeAdminErrorsButton = event.target.closest("#closeAdminErrorReportsBtn");
  if (closeAdminErrorsButton) {
    event.preventDefault();
    showMainModeHub();
    return;
  }

  const copyAdminErrorsButton = event.target.closest("#copyAdminErrorReportsBtn");
  if (copyAdminErrorsButton) {
    event.preventDefault();
    copyAdminErrorReportsToClipboard();
    return;
  }

  const refreshAdminErrorsButton = event.target.closest("#refreshAdminErrorReportsBtn");
  if (refreshAdminErrorsButton) {
    event.preventDefault();
    loadAdminErrorReports();
  }
});


// v11.17: 학습 허브 네비게이션은 이벤트 위임으로도 연결하여 캐시/동적 DOM 교체 상황에 대비합니다.
document.addEventListener("click", event => {
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
  const atcTheory = event.target.closest("#atcTheoryBtn");
  if (atcTheory) { event.preventDefault(); openAtcTheory(); return; }
});

els.resourceLibraryModeBtn?.addEventListener("click", showResourceLibrary);
els.resourceLibraryCloseBtn?.addEventListener("click", showMainModeHub);
els.resourceViewerBackBtn?.addEventListener("click", showResourceLibrary);
els.resourceLibraryGrid?.addEventListener("click", event => {
  const card = event.target.closest("[data-resource-id]");
  if (!card) return;
  openResourceItem(card.dataset.resourceId);
});
els.resourceViewerCard?.addEventListener("contextmenu", event => event.preventDefault());
els.resourceViewerCard?.addEventListener("dragstart", event => event.preventDefault());
document.addEventListener("keydown", event => {
  const viewerOpen = els.resourceViewerCard && !els.resourceViewerCard.classList.contains("hidden");
  if (!viewerOpen || !(event.ctrlKey || event.metaKey)) return;
  const key = String(event.key || "").toLowerCase();
  if (["s", "p", "u"].includes(key)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

els.kotsaModeBtn?.addEventListener("click", () => activateLearningContext({
  kind:"kotsa", label:"교통안전공단 면허시험 대비", allowedSubjects:KOTSA_SUBJECTS,
  note:"ATP Gleim은 이 과정에서 제외됩니다."
}));
els.textbookModeBtn?.addEventListener("click", showTextbookHub);
els.airlineModeBtn?.addEventListener("click", showAirlineHub);
els.wrongReviewModeBtn?.addEventListener("click", showWrongReviewHub);
els.homeTitleBtn?.addEventListener("click", showMainModeHub);
els.homeNavBtn?.addEventListener("click", showMainModeHub);
els.menuToggleBtn?.addEventListener("click", toggleSidebarCollapsed);
els.studyNavBtn?.addEventListener("click", showLearningModeHubOnly);
els.textbookQuickNavBtn?.addEventListener("click", showTextbookHub);
els.aviwikiNavBtn?.addEventListener("click", showAviwikiHome);
els.aviwikiModeBtn?.addEventListener("click", showAviwikiHome);
els.airlineQuickNavBtn?.addEventListener("click", showAirlineHub);
els.wrongReviewQuickNavBtn?.addEventListener("click", showWrongReviewHub);
els.quickResourceNavBtn?.addEventListener("click", showResourceLibrary);

els.aviwikiHomeBtn?.addEventListener("click", showAviwikiHome);
els.aviwikiResumeBtn?.addEventListener("click", async () => {
  await ensureAviwikiData();
  const target = aviwikiData.sections.find(s => s.id === aviwikiCurrentSectionId) || aviwikiData.sections[0];
  if (target) openAviwikiSection(target.id);
});
els.aviwikiStartBtn?.addEventListener("click", async () => {
  await ensureAviwikiData();
  if (aviwikiData.sections[0]) openAviwikiSection(aviwikiData.sections[0].id);
});
els.aviwikiGlobalSearch?.addEventListener("input", renderAviwikiGlobalSearch);
els.aviwikiSearchResults?.addEventListener("click", event => {
  const item = event.target.closest("[data-aviwiki-section]");
  if (item) openAviwikiSection(item.dataset.aviwikiSection);
});
els.aviwikiSubjectGrid?.addEventListener("click", async event => {
  const item = event.target.closest("[data-aviwiki-subject]");
  if (!item || item.disabled) return;
  await ensureAviwikiData();
  const rows = aviwikiSectionsForSubject(item.dataset.aviwikiSubject);
  if (rows[0]) openAviwikiSection(rows[0].id);
});
els.aviwikiTocSearch?.addEventListener("input", renderAviwikiToc);
els.aviwikiBookmarkOnlyBtn?.addEventListener("click", () => {
  aviwikiBookmarkOnly = !aviwikiBookmarkOnly;
  els.aviwikiBookmarkOnlyBtn.classList.toggle("active", aviwikiBookmarkOnly);
  els.aviwikiBookmarkOnlyBtn.textContent = aviwikiBookmarkOnly ? "♥ 북마크만" : "♡ 북마크만";
  renderAviwikiToc();
});
els.aviwikiTocList?.addEventListener("click", event => {
  const item = event.target.closest("[data-aviwiki-section]");
  if (item) openAviwikiSection(item.dataset.aviwikiSection);
});
els.aviwikiBookmarkBtn?.addEventListener("click", toggleAviwikiBookmark);
els.aviwikiPrevBtn?.addEventListener("click", () => navigateAviwiki(-1));
els.aviwikiNextBtn?.addEventListener("click", () => navigateAviwiki(1));

window.addEventListener("resize", () => {
  document.body.classList.remove("sidebar-collapsed", "mobile-nav-collapsed");
  restoreSidebarCollapsed();
});
els.wrongReviewHubBackBtn?.addEventListener("click", showMainModeHub);
els.wrongReviewFilterBackBtn?.addEventListener("click", showWrongReviewHub);
els.wrongReviewMinCount?.addEventListener("change", updateWrongReviewCountInfo);
els.wrongReviewStartBtn?.addEventListener("click", () => startWrongReviewSession());
document.querySelectorAll("[data-wrong-review-subject]").forEach(btn => {
  btn.addEventListener("click", () => showWrongReviewFilter(btn.dataset.wrongReviewSubject));
});
els.textbookHubBackBtn?.addEventListener("click", showMainModeHub);
els.textbookProblemBtn?.addEventListener("click", showBookProblemHub);
els.textbookTheoryBtn?.addEventListener("click", showBookTheoryHub);
els.bookProblemBackBtn?.addEventListener("click", showTextbookHub);
els.bookTheoryBackBtn?.addEventListener("click", showTextbookHub);
els.weatherTheoryBtn?.addEventListener("click", openWeatherTheory);
els.airlawTheoryBtn?.addEventListener("click", openAirlawTheory);
els.atcTheoryBtn?.addEventListener("click", openAtcTheory);
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
els.jejuCourseBtn?.addEventListener("click", () => activateLearningContext({
  kind:"airline", label:"제주항공 대비 과정", allowedSubjects:JEJU_SUBJECTS, lockedSubject:JEJU_RECALL_SUBJECT, airline:"jeju",
  note:"복기 재구성 200문항 · 2024/2025 상·하반기 · 불완전 복기는 객관식으로 추론 재구성"
}));
els.trinityCourseBtn?.addEventListener("click", () => activateLearningContext({
  kind:"airline", label:"트리니티항공 대비 과정", allowedSubjects:TRINITY_SUBJECTS, lockedSubject:TRINITY_SUBJECT, airline:"trinity",
  note:"사용자 풀이 기록 350문항에서 중복 43문항을 통합한 고유 307문항 · 문제/보기/정답/핵심 해설만 보존"
}));

async function bootstrap() {
  if (window.PilotBankAuth?.requireLogin) {
    const user = await window.PilotBankAuth.requireLogin();
    configureUserStorage(user);
    configureResourceLibraryAccess();
    configureAdminErrorAccess();
  } else {
    configureUserStorage(null);
    configureResourceLibraryAccess();
    configureAdminErrorAccess();
  }
  maybeImportLegacyProgress();
  progressStore = await loadProgress();
  await loadSubmittedErrorReportIds();
  await loadBank();
  await loadStudyTimeSummary();
  updateErrorCount();
  restoreSidebarCollapsed();
  renderHomeIdentity();
  renderHomeStudyTime();
  renderTopProgress();
  showMainModeHub();
}

bootstrap();
