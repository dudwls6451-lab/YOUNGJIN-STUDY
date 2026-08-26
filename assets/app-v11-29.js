
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
        <button class="book-choice-card" data-book-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong></button><button class="book-choice-card" data-book-subject="항공교통통신" type="button"><img src="./assets/covers/atc_comm.svg" alt="항공교통통신 표지"><strong>항공교통통신</strong><span>출제예상·모의고사 938문항</span></button><button class="book-choice-card" data-book-subject="K-AIM" type="button"><img src="./assets/kaim-cover.svg" alt="K-AIM 표지"><strong>K-AIM</strong><span>세화 문제집 · 300문항</span></button>
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
    section.innerHTML = `<div class="section-head"><div><h2>문제 풀이 교재를 선택하십시오.</h2><p class="muted">기존 문제 풀이 기능은 그대로 유지됩니다.</p></div><button id="bookProblemBackBtn" class="button secondary" type="button">이전</button></div><div class="book-choice-grid"><button class="book-choice-card" data-book-subject="ATP Gleim" type="button"><img src="./assets/covers/atp_gleim.jpg" alt="ATP Gleim 표지"><strong>ATP Gleim</strong></button><button class="book-choice-card" data-book-subject="검댕이 항공법규" type="button"><img src="./assets/covers/airlaw.jpg" alt="검댕이 항공법규 표지"><strong>검댕이 항공법규</strong></button><button class="book-choice-card" data-book-subject="항공기상" type="button"><img src="./assets/covers/weather.jpg" alt="항공기상 표지"><strong>항공기상</strong></button><button class="book-choice-card" data-book-subject="항공교통통신" type="button"><img src="./assets/covers/atc_comm.svg" alt="항공교통통신 표지"><strong>항공교통통신</strong><span>출제예상·모의고사 938문항</span></button><button class="book-choice-card" data-book-subject="K-AIM" type="button"><img src="./assets/kaim-cover.svg" alt="K-AIM 표지"><strong>K-AIM</strong><span>세화 문제집 · 300문항</span></button><button id="freeStudyBtn" class="book-choice-card free-study" type="button"><img src="./assets/covers/all_books.jpg" alt="전체 교재"><strong>자유학습모드</strong><span>기존 문제은행의 모든 기능 사용</span></button></div>`;
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

function ensureV1152KaimCards() {
  const problemGrid = document.querySelector("#bookProblemHubCard .book-choice-grid");
  if (problemGrid && !problemGrid.querySelector('[data-book-subject="K-AIM"]')) {
    const freeStudy = problemGrid.querySelector("#freeStudyBtn");
    const btn = document.createElement("button");
    btn.className = "book-choice-card";
    btn.type = "button";
    btn.dataset.bookSubject = "K-AIM";
    btn.innerHTML = '<img src="./assets/kaim-cover.svg" alt="K-AIM 표지"><strong>K-AIM</strong><span>세화 문제집 · 300문항</span>';
    problemGrid.insertBefore(btn, freeStudy || null);
  }
  const wrongGrid = document.querySelector("#wrongReviewHubCard .wrong-review-book-grid");
  if (wrongGrid && !wrongGrid.querySelector('[data-wrong-review-subject="K-AIM"]')) {
    const btn = document.createElement("button");
    btn.className = "book-choice-card";
    btn.type = "button";
    btn.dataset.wrongReviewSubject = "K-AIM";
    btn.innerHTML = '<img src="./assets/kaim-cover.svg" alt="K-AIM 표지"><strong>K-AIM</strong><span class="wrong-review-count">오답 기록 확인</span>';
    wrongGrid.appendChild(btn);
  }
}
ensureV1152KaimCards();

const DATA_PATH = "./data/questions-v11-2.json";
const EMBEDDED_KAIM_QUESTIONS = [{"id":"K-AIM-001","number":1,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":15,"source_question_number":1,"question":"무지향표지시설(41108)의 운용 주파수대는?","choices":[{"id":"A","text":"108~117 kHz"},{"id":"B","text":"108~250 kHz"},{"id":"C","text":"190~459 kHz"},{"id":"D","text":"190~535 kHz"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-002","number":2,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":15,"source_question_number":2,"question":"다음 중 가장 낮은 주파수대에서 운용되는 시설은?","choices":[{"id":"A","text":"VOR"},{"id":"B","text":"NDB"},{"id":"C","text":""},{"id":"D","text":"ME @ 200 [2A3. 다음 중 가장 낮은 주파수대를 사용하는 항법시설은? @ NDB @ TACAN 해 DME ® VOR 7] ㅠ 주요 항행안전시설 주파수대『「604600/ band) os 주파수대『「004600/ band) 비고 | po 무지향표지시설0408) | 190~535 kHz Bon 190~1,750 kHz (ICAO Annex 10) aa 2 | 전방향표지시설(/083) |"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-003","number":3,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":15,"source_question_number":3,"question":"다음 중 가장 낮은 주 파 수","choices":[{"id":"A","text":"를 사 용 하는 항 법 시 설 은?"},{"id":"B","text":"NDB"},{"id":"C","text":"TACAN"},{"id":"D","text":"DME @® VOR | ㆍ 주요 항 행 안 전 시설 주 파 수 더 (Frequency band) oo 주 파 수 대 (Frequency band) 비고 ] ~~~ 무 지 향 표 지 시 설 (N08) ㅣ 190~535 kHz aox 190~1,750 kHz (ICAO Annex 10) gaa 2 | 전 방 향 표 지 시 설 (08) |108.0~117.95 MHz TIN"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-004","number":4,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":15,"source_question_number":4,"question":"조종사가 ADF= 비행 시 NDB] 식별부호 수신음을 AS monitoring","choices":[{"id":"A","text":"야 하는 이유는?"},{"id":"B","text":"ADF 수신기에는 70106 alarme] 없으므로"},{"id":"C","text":"ADF 수신기에는 138 alarme] 없으므로"},{"id":"D","text":"ADF 수신기에는 31817 818081이 없으므로 @ ADF 수신기에는 60060 audio 31810이 없으므로"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-005","number":5,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":15,"source_question_number":5,"question":"Nondirectional Radio 868000(씨102)에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"360° 전방위로 무지향성 전파를 발사하여 항공기에 방향정보를 제공하는 항법보조 장비이다. 일반적으로 사용하는 주파수 범위는"},{"id":"C","text":"항로상의 fixe 사용할 수 있다."},{"id":"D","text":"ILS Marker& 사용할 수 있다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-006","number":6,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":16,"source_question_number":6,"question":"410\"“의 오차를 유발할 수 있는 효과가 아닌 것은?","choices":[{"id":"A","text":""},{"id":"B","text":"안선효과(6088631 effect)"},{"id":"C","text":"일출효과(64701186 effect)"},{"id":"D","text":"Ato}#7}(mountain effect) @ |2H7}(thunderstorms effect)"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-007","number":7,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":16,"source_question_number":7,"question":"ADF 신호에 영향을 미치는 것이 아닌 것은?","choices":[{"id":"A","text":""},{"id":"B","text":"간효과"},{"id":"C","text":"산악효과"},{"id":"D","text":"해안효과 @ 해상효과"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-008","number":8,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":16,"source_question_number":8,"question":"전방향표지시설(40 )의 주파수","choices":[{"id":"A","text":"는? ："},{"id":"B","text":"108.0~117.95 MHz"},{"id":"C","text":"108.0~135.95 MHz"},{"id":"D","text":"118.0~117.95 MHz @"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-009","number":9,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":16,"source_question_number":9,"question":"VOR] frequency YAY?","choices":[{"id":"A","text":"90.0~110.975 MHz"},{"id":"B","text":"102.0~112.975 MHz"},{"id":"C","text":"108.0~117.975 MHz"},{"id":"D","text":"112.0~124.975 MHz"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-010","number":10,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":16,"source_question_number":10,"question":"VORWaIA} “W\"7} 의미하는 것은?","choices":[{"id":"A","text":"VOR with voice"},{"id":"B","text":"VOR without voice"},{"id":"C","text":"VOR with identification"},{"id":"D","text":"VOR without identification"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-011","number":11,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":16,"source_question_number":11,"question":"VOR]","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"Identifying a VOR is by its Morse Code identification or by the recorded automatic voice identification word “VOR” following the 18086 6 name."},{"id":"C","text":""},{"id":"D","text":"uring periods of maintenance, the facility may radiate a T-E-S~—T code (- © @e@ —) or the code may be removed. © Reliance on determining the identification of an omnirange should be placed on listening to voice transmissions by the FSS involved. 해 VORs without voice capability are indicated by the letter “W” included in the class designator."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-012","number":12,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":17,"source_question_number":12,"question":"de]Be] 또는 프로펠러 항공기의 (00786","choices":[{"id":"A","text":"eviation Indicator(CDI)7} 흔들릴"},{"id":"B","text":"조종 사의 조치로 적합한 것은?"},{"id":"C","text":"엔진 powerS 조절한다."},{"id":"D","text":"Fuel/air mixtures 조절한다. @ RPMS 조절한다. @® 항공기 60660를 조절한다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-013","number":13,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":17,"source_question_number":13,"question":"동일한 주파수를 사용하는 VORS 최소 몇 마일의 간격을 두고 설치하여야 하는가?","choices":[{"id":"A","text":"400 NM"},{"id":"B","text":"600 NM"},{"id":"C","text":"800 NM"},{"id":"D","text":"1,000 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-014","number":14,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":17,"source_question_number":14,"question":"동일한 부호명칭을 사용하는 VOR 간의 최소 분리간격은?","choices":[{"id":"A","text":"100 NM"},{"id":"B","text":"200 NM"},{"id":"C","text":"400 NM"},{"id":"D","text":"600 NM"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-015","number":15,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":17,"source_question_number":15,"question":"VOR 수신기 지상점검 시, 다음 중 허용오차 이내인 것은?","choices":[{"id":"A","text":"005° FROM, 182° TO"},{"id":"B","text":"180° FROM, 360° TO"},{"id":"C","text":"003° FROM, 178° TO"},{"id":"D","text":"354° FROM, 182° TO"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-016","number":16,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":17,"source_question_number":16,"question":"VOR 점검 시 다음 중 정상범위에 있는 것은?","choices":[{"id":"A","text":"360° TO, 180° FROM"},{"id":"B","text":"180° TO, 178° FROM"},{"id":"C","text":"003° TO, 005° FROM"},{"id":"D","text":"182° TO, 003° FROM 12..@"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-017","number":17,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":17,"question":"조종사가 공항표면의 지정된 점검지점에서 VOR 수신기를 BAS 때. 수신기의 오차는 얼 마 이내이어야 하는가?","choices":[{"id":"A","text":"AWE radial] +8°"},{"id":"B","text":"AV radial2] +6°"},{"id":"C","text":"AAS radial2] +4°"},{"id":"D","text":"선정된 780181의 +2°"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-018","number":18,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":18,"question":"Ground check point] VOR 수신기를 점검할","choices":[{"id":"A","text":"0121의 허용오차는?"},{"id":"B","text":"33도"},{"id":"C","text":"45"},{"id":"D","text":"+6= @ +6="}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-019","number":19,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":19,"question":"VOR 수신기 공중점검의 허용 오차범위는 얼마인가?","choices":[{"id":"A","text":"±4°"},{"id":"B","text":"±5°"},{"id":"C","text":"±6°"},{"id":"D","text":"±7°"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-020","number":20,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":20,"question":"VORS 몇 도 오차 범위","choices":[{"id":"A","text":"인 경우 항로에서 사용 가능한가?"},{"id":"B","text":"+4°"},{"id":"C","text":"26°"},{"id":"D","text":"+8° @ +10°"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-021","number":21,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":21,"question":"","choices":[{"id":"A","text":"ual system VOR 점검 시 두 지시방위 간의 최대 허용편차는?"},{"id":"B","text":"2°"},{"id":"C","text":"a ae"},{"id":"D","text":"8"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-022","number":22,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":22,"question":"VOR 수신기 점검시 허용 오차범위가 맞는 것은?","choices":[{"id":"A","text":"지상점검시 44“"},{"id":"B","text":"G 공중점검시 +4"},{"id":"C","text":""},{"id":"D","text":"ual VOR 점검시 46“ @ VOT 점검시 36“"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-023","number":23,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":23,"question":"VOT 수신기 점검에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"주파수"},{"id":"C","text":"BSS 0“로 맞추면 CD17} 중앙에 들어오고, TO-FROM 지시계는 FROME 나타내어야 한다."},{"id":"D","text":"지정된 공항 점검지역에서 점검 시 허용오차는 +4“ 이다. © 인가된 공중 점검지역이나 항로상에서 점검 시 허용오차는 46\" 이다. @ Dual system VORS| 두 지시방위 간의 최대 허용오차는 6° 이다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-024","number":24,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":18,"source_question_number":24,"question":"항공기가 비행을 할","choices":[{"id":"A","text":"송신소로부터의 거리와 방위각을 제공하는 시설은?"},{"id":"B","text":"무지향표지시설(41128)"},{"id":"C","text":"전방향표지시설(4ㅠ0)"},{"id":"D","text":"거리측정시설(01408) 대 전술항행표지시설(7&0쓰티)"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-025","number":25,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":25,"question":"거리측정장비(2148)의 최대 수신거리와 허용 오차범위는?","choices":[{"id":"A","text":"수신거리: 무한대, 오차: 1/2마일 또는 3% 중 큰 것 이내"},{"id":"B","text":"수신거리: 100 NM, 오차: 1/2마일 또는 5% 중 큰 것 이내"},{"id":"C","text":"수신거리: 199 NM, 오차: 1/2마일 또는 3% 중 큰 것 이내"},{"id":"D","text":"수신거리: 299 NM, 오차: 1/2마일 또는 5% 중 큰 것 이내"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-026","number":26,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":26,"question":"거리측정장비(12548 )로 신호 수신시 정확도는?","choices":[{"id":"A","text":"1NM 또는 거리의 6 중 큰 것보다 작아야 한다."},{"id":"B","text":"INM 또는 거리의 3% 중 큰 것보다 작아야 한다."},{"id":"C","text":"0.5 NM 또는 거리의 6 중 큰 것보다 작아야 한다."},{"id":"D","text":"0.5 NM 또는 거리의 3% 중 큰 것보다 작아야 한다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-027","number":27,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":27,"question":"일반적으로","choices":[{"id":"A","text":"ME 계기가 지시하는 거리는?"},{"id":"B","text":"경사거리를 NMB 지시한다."},{"id":"C","text":"경사거리를 SMB 지시한다."},{"id":"D","text":"수평거리를 NMB 지시한다. @ 수평거리를 SMS 지시한다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-028","number":28,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":28,"question":"","choices":[{"id":"A","text":"ME 지시계가 지시하는 거리는?"},{"id":"B","text":"NM& 표시한 지상학적거리"},{"id":"C","text":"NMS 표시한 사선거리"},{"id":"D","text":"SME 표시한 사선거리 @ 항공기로부터 VORTAC2|3 NME 표시한 가시 직선거리"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-029","number":29,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":29,"question":"","choices":[{"id":"A","text":"MES} GPS의 거리 표시는?"},{"id":"B","text":""},{"id":"C","text":"ME, GPS 모두 사선거리"},{"id":"D","text":"DME, GPS 모두 수평거리 @ 201008는 수평거리, GPSE 사선거리 @ DME= 사선거리, GPSE 수평거리"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-030","number":30,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":30,"question":"210088의 주파수 범위는?","choices":[{"id":"A","text":"190~535 MHz"},{"id":"B","text":"210~345 MHz"},{"id":"C","text":"960~1,215 MHz"},{"id":"D","text":"980~1,575 MHz LE시 31. UHF 주파수 범위 내에서 운용되는 시설은? 해 VOR @ DME @ RMI 해 ADF"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-031","number":31,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":19,"source_question_number":31,"question":"UHF 주파수 범위","choices":[{"id":"A","text":""},{"id":"B","text":"서 운 용 되는 시 설 은?"},{"id":"C","text":"VOR"},{"id":"D","text":"DME & RMI & ADF"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-032","number":32,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":20,"source_question_number":32,"question":"","choices":[{"id":"A","text":"ME] 경사거리 오차(6180 range 67701)는 매 1,000 [의 고도 당 7|4|4(station) 2 로부터 몇 마일 정도 떨어져 있다면 차이가 심하지 않다고 간주할 수 있는가?"},{"id":"B","text":"0.3마일"},{"id":"C","text":"0.5마일"},{"id":"D","text":"1마일 @ 2마일"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-033","number":33,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":20,"source_question_number":33,"question":"10,000 ft MSLE","choices":[{"id":"A","text":"ME 통과시 8&681107으로부터 거리가 최소 얼마 이상이어야 81806 range errorS 무시할 수 있는가?"},{"id":"B","text":"5NM"},{"id":"C","text":"10 NM"},{"id":"D","text":"15 NM @ 20 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-034","number":34,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":20,"source_question_number":34,"question":"VORTAC 식별부호를 매 30초마다 한 번씩만 수신하였다면 FAS 의미하는가?","choices":[{"id":"A","text":""},{"id":"B","text":"ME 시설 부분만 작동한다."},{"id":"C","text":"VOR 시설 부분만 작동한다."},{"id":"D","text":"VOR 및 DME 시설 모두 정상 작동하지 않는다. @ VOR 및 DME 시설 모두 정상 작동한다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-035","number":35,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":20,"source_question_number":35,"question":"VORTAC coded identifier 신호가 30초에 1회 송신되는 경우 VORTAC] 운용상태는?","choices":[{"id":"A","text":"VOR,"},{"id":"B","text":"ME 모두 정상"},{"id":"C","text":"VOR 정상,"},{"id":"D","text":"ME 고장 @ VOR 고장, DME 정상 @ VOR. DME 모두 점검중"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-036","number":36,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":20,"source_question_number":36,"question":"VOR/DME 두 시설이 한 쌍으로 구성되어 있는 경우, VOR 부분이 운용되고 있지 않을","choices":[{"id":"A","text":"이를 ABS 수 있는 ASE?"},{"id":"B","text":"1,020Hz2] 20초 간격 식별부호"},{"id":"C","text":"1.350112의 30초 간격 식별부호"},{"id":"D","text":"1,020Hz2] 30초 간격 식별부호 @"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-037","number":37,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":20,"source_question_number":37,"question":"동시에","choices":[{"id":"A","text":"ME 정보를 이용할 수 있는 항공기"},{"id":"B","text":"수는?"},{"id":"C","text":"75대"},{"id":"D","text":"100대 대 120대 @ 150대"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-038","number":38,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":38,"question":"Flight management system(FMS) 2] 구성요소가 아닌 것은?","choices":[{"id":"A","text":"Flight management computer(FMC)"},{"id":"B","text":"Auto throttle(A/T)"},{"id":"C","text":"Autopilot/flight director system(AFDS)"},{"id":"D","text":"Distance Measuring Equipment(DME)"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-039","number":39,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":39,"question":"Terminal VOR 12,000 ft AGL 이하의 고도에서 공항주변 반경 몇 마일까지 유효한가?","choices":[{"id":"A","text":"25 NM"},{"id":"B","text":"35 NM"},{"id":"C","text":"40 NM"},{"id":"D","text":"50 NM"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-040","number":40,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":40,"question":"Terminal VOR의 운용 범위는 얼마인가?","choices":[{"id":"A","text":"고도 12000 ft 이하, 거리 15 NM 이내 ="},{"id":"B","text":"고도 12000 ft 이하, 거리 25 NM 이내"},{"id":"C","text":"고도 14000 ft 이하, 거리 15 NM 이내"},{"id":"D","text":"고도 14000 ft 이하, 거리 25 NM 이내"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-041","number":41,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":41,"question":"T-VOR의 운용 범위는?","choices":[{"id":"A","text":"반경 25 NM, 높이 11000 ft~18,000 ft"},{"id":"B","text":"반경 30 NM, 4°] 1,000 ft~18,000 ft"},{"id":"C","text":"반경 25 NM, 높이 11000 ft~12,000 ft"},{"id":"D","text":"반경 30 NM, 높이 1000 ft~12,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-042","number":42,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":42,"question":"Ｌ등급 VOR] Service 014106은?","choices":[{"id":"A","text":"1,000 ft~12,000 ft"},{"id":"B","text":"1,000 ft~14,500 ft"},{"id":"C","text":"1,000 ft~16,000 ft"},{"id":"D","text":"1,000 ft~18,000 ft"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-043","number":43,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":43,"question":"VOR (Ｌ)등급의 1,000","choices":[{"id":"A","text":"서 18,000 ft 까지의 반경 범위는?"},{"id":"B","text":"25 NM"},{"id":"C","text":"40 NM"},{"id":"D","text":"100 NM ® 130 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-044","number":44,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":44,"question":"VOR L $의 service volume 반경은?","choices":[{"id":"A","text":"20 NM"},{"id":"B","text":"25 NM"},{"id":"C","text":"40 NM"},{"id":"D","text":"100 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-045","number":45,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":21,"source_question_number":45,"question":"45,000ft 이상에서 VOR(H) 2] 통달거리는 반경 얼마인가?","choices":[{"id":"A","text":"25 NM"},{"id":"B","text":"40 NM"},{"id":"C","text":"100 NM"},{"id":"D","text":"130 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-046","number":46,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":46,"question":"H-VOR의 SSV HAS 잘못된 것은?","choices":[{"id":"A","text":"1,000~ 12,000 ft AGL, 25 NM"},{"id":"B","text":"1,000~14,500 ft AGL, 40 NM"},{"id":"C","text":"14,500~60,000 ft AGL, 100 NM"},{"id":"D","text":"18,000~45,000 ft AGL, 130 NM"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-047","number":47,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":47,"question":"VOR “^ $32] Service volume®@ 맞는 AL?","choices":[{"id":"A","text":"1,000~1,2003|=, 40 NM"},{"id":"B","text":"12,000~60,0003]=, 100 NM"},{"id":"C","text":"12,000~14,5003]=, 25 NM"},{"id":"D","text":"18,000~45,0003]=, 130 NM"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-048","number":48,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":48,"question":"HVOR 통달범위 최고고도는?","choices":[{"id":"A","text":"40,000 ft"},{"id":"B","text":"50,000 ft"},{"id":"C","text":"60,000 ft"},{"id":"D","text":"70,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-049","number":49,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":49,"question":"HH 등급 NDB] 통달거리는 반경 얼마인가?","choices":[{"id":"A","text":"25 NM"},{"id":"B","text":"50 NM"},{"id":"C","text":"75 NM"},{"id":"D","text":"100 NM"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-050","number":50,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":50,"question":"각 등급별 NDB service volume’] 반경으로 맞지 않는 AL?","choices":[{"id":"A","text":"Compass Locator: 20 NM"},{"id":"B","text":"MH: 25 NM"},{"id":"C","text":"H: 50 NM"},{"id":"D","text":"HH: 75 NM"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-051","number":51,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":51,"question":"11.8가 제공해 주는 정보가 아닌 것은?","choices":[{"id":"A","text":"유도정보(64108006 information)"},{"id":"B","text":"거리정보(『3086@ information)"},{"id":"C","text":"고도정보(3106[406 information)"},{"id":"D","text":"시각정보(16081 information)"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-052","number":52,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":22,"source_question_number":52,"question":"ILS2] localizer2} glide slopee7} 항공기에 제공해 주는 정보는?","choices":[{"id":"A","text":"유도정보"},{"id":"B","text":"유도정보 및 거리정보"},{"id":"C","text":"고도정보"},{"id":"D","text":"거리정보 및 고도정보"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-053","number":53,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":53,"question":"ILS 구성요소 중 거리정보를 제공하는 시설은?","choices":[{"id":"A","text":"Localizer, Glide slopee"},{"id":"B","text":"Localizer,"},{"id":"C","text":"ME"},{"id":"D","text":"Marker beacon, Glider slope @ Marker beacon, DME"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-054","number":54,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":54,"question":"Instrument Landing System] 기본 74247} 아닌 것은?","choices":[{"id":"A","text":"Localizer"},{"id":"B","text":"Marker beacon"},{"id":"C","text":"Glide slopee"},{"id":"D","text":"Compass locator"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-055","number":55,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":55,"question":"","choices":[{"id":"A","text":"uter marker 4 middle marker2] marker beacon"},{"id":"B","text":"체할 수 있는 AL?"},{"id":"C","text":"Compass locator"},{"id":"D","text":"VOR fix 때 DME fix @ NDB fix"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-056","number":56,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":56,"question":"Middle marker","choices":[{"id":"A","text":"신 사용할 수 있는 시설은?"},{"id":"B","text":"ASR"},{"id":"C","text":"NDB"},{"id":"D","text":"VOR 해 Compass locator"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-057","number":57,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":57,"question":"Marker beacon& 사용할 없는 경우, 이를","choices":[{"id":"A","text":"체할 수 있는 AML?"},{"id":"B","text":"NDB"},{"id":"C","text":"MLS"},{"id":"D","text":"VOR @ DME"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-058","number":58,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":58,"question":"Localizer2] 운용 주파수 범위는?","choices":[{"id":"A","text":"108.0~117.95 MHz"},{"id":"B","text":"108.10~111.95 MHz"},{"id":"C","text":"190~535 kHz"},{"id":"D","text":"329.15~335.0 MHz"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-059","number":59,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":59,"question":"Localizer 412] runway thresholdo4]2] 폭은?","choices":[{"id":"A","text":"400 ft"},{"id":"B","text":"500 ft"},{"id":"C","text":"600 ft"},{"id":"D","text":"700 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-060","number":60,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":60,"question":"Runway threshold4j4} localizer beam2] 폭은?","choices":[{"id":"A","text":"500 ft"},{"id":"B","text":"700 ft"},{"id":"C","text":"1,000 ft"},{"id":"D","text":"1,200 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-061","number":61,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":23,"source_question_number":61,"question":"VOR receiver] reverse sensing®] 발생되는 경우는?","choices":[{"id":"A","text":"비행하고 있는 1680108과 VOR indicator] (088로 선택한 bearingo] 반대 방향일"},{"id":"B","text":""},{"id":"C","text":"비행하고 있는 1680108과 VOR indicator2]"},{"id":"D","text":"BS2 Ast bearing?) 90° 일 때 @ 비행하고 있는 1680108과 VOR indicator2] (088로 선택한 bearingo] 같은 방향일 때 @ VORS reverse 8608108이 발생되지 않는다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-062","number":62,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":24,"source_question_number":62,"question":"ILS Localizer 안테나로부터 반경 10마일 이내에서 100811267 신호의 유효각도는?","choices":[{"id":"A","text":"10°"},{"id":"B","text":"25°"},{"id":"C","text":"35°"},{"id":"D","text":"40°"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-063","number":63,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":24,"source_question_number":63,"question":"ILS Localizer 안테나로부터 18NM 이내에서 10081126: 신호의 투사각은?","choices":[{"id":"A","text":"10°"},{"id":"B","text":"15°"},{"id":"C","text":"20°"},{"id":"D","text":"30°"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-064","number":64,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":24,"source_question_number":64,"question":"ILS 로컬라이저 41S] normal coverage# BE AL?","choices":[{"id":"A","text":"안테나로부터 반경 10NM"},{"id":"B","text":"에서는 중심선으로부터 양쪽으로 30도까지 이다."},{"id":"C","text":"안테나로부터 반경 10NM"},{"id":"D","text":"에서는 중심선으로부터 양쪽으로 35도까지 이다. 안테나로부터 반경 18344 내에서는 중심선으로부터 양쪽으로 15도까지 이다. @ 안테나로부터 반경 18NM HAS 중심선으로부터 양쪽으로 20도까지 이다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-065","number":65,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":24,"source_question_number":65,"question":"ILS 1.003112@7의 최대 유효거리는?","choices":[{"id":"A","text":"10 NM"},{"id":"B","text":"18 NM"},{"id":"C","text":"26 NM"},{"id":"D","text":"35 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-066","number":66,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":24,"source_question_number":66,"question":"ILS localizero]","choices":[{"id":"A","text":"한 AY 중 틀린 AL?"},{"id":"B","text":"운용 주파수 범위는"},{"id":"C","text":"Localizer ASE 활주로 끝에서 700ㅁ의 진로 폭이 되도록 조절된다."},{"id":"D","text":"Reverse sensing 기능이 없는 항공기는 680 course 상에서 00-000786로 비행할 때에는 | course TBS 반대로 하여야 한다. @ 식별신호는 로컬라이저 주파수로 송신되는 문자 Ｌ다음에 3자리의 식별문자로 구성된다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-067","number":67,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":24,"source_question_number":67,"question":"ILS glide slopee transmitter2] 위치는?","choices":[{"id":"A","text":"접근 활주로 끝에서 800~1,120 ft JS, 활주로 중심선에서 옆으로 300~500 ft 사이"},{"id":"B","text":"접근 활주로 끝에서 800~1.120 ft WS, 활주로 중심선에서 옆으로 300~500 ft 사이"},{"id":"C","text":"접근 활주로 끝에서 750~1,250 ft 외측, 활주로 중심선에서 옆으로 2560~650【[ 사이"},{"id":"D","text":"접근 활주로 끝에서 750~1,250 ft 내측, 활주로 중심선에서 옆으로 2560~650 ft 사이"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-068","number":68,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":68,"question":"ILS Glide slopee beam2] 상하 폭은 얼마인가?","choices":[{"id":"A","text":"1.2°"},{"id":"B","text":"1.4"},{"id":"C","text":"1.6"},{"id":"D","text":"1.8°"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-069","number":69,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":69,"question":"Glide slopee signal2] 수직 범위는?","choices":[{"id":"A","text":"0.8°"},{"id":"B","text":"1.0°"},{"id":"C","text":"1.4"},{"id":"D","text":"2.0°"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-070","number":70,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":70,"question":"Glide slopee?] 활공로 투사각은 얼마인가?","choices":[{"id":"A","text":"2"},{"id":"B","text":"3"},{"id":"C","text":"a"},{"id":"D","text":"5° (2A 71. 다음 중 활주로 중심선의 연장선 상에 설치되지 않는 시설은? ® Localizer @ Compass locator © Marker beacon @ Glide path"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-071","number":71,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":71,"question":"다음 중 활주로 중 심 선 의 연장선 상","choices":[{"id":"A","text":"설 치 되지 않는 시 설 은?"},{"id":"B","text":"Localizer"},{"id":"C","text":"Compass locator"},{"id":"D","text":"Marker beacon @ Glide path"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-072","number":72,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":72,"question":"Glide path2} 교차되는 middle marker 43-2] 높이는?","choices":[{"id":"A","text":"100 ft"},{"id":"B","text":"150 ft"},{"id":"C","text":"200 ft"},{"id":"D","text":"250 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-073","number":73,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":73,"question":"Middle marker2] 통상적인 61106 slope intercept 높이는?","choices":[{"id":"A","text":"100 ft"},{"id":"B","text":"200 ft"},{"id":"C","text":"300 ft"},{"id":"D","text":"400 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-074","number":74,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":74,"question":"","choices":[{"id":"A","text":"uter marker 상공에서 glide patho] 높이는?"},{"id":"B","text":"1,000 ft"},{"id":"C","text":"1,400 ft ©& 2,000 ft"},{"id":"D","text":"2,300 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-075","number":75,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":75,"question":"ILS glide slopee 413의 유효거리는?","choices":[{"id":"A","text":"10 NM"},{"id":"B","text":"12NM"},{"id":"C","text":"15 NM"},{"id":"D","text":"18 NM"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-076","number":76,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":76,"question":"ILS coverages","choices":[{"id":"A","text":"한 설명으로 2] 않은 AL?"},{"id":"B","text":"Localizer= 안테나로부터 10414까지 중심선에서 양쪽으로 35도의 ASS 제공한다."},{"id":"C","text":"1.0081126+는 안테나로부터 184414[까지 중심선에서 양쪽으로 10도의 ASS 제공한다."},{"id":"D","text":"1008112@『는 antenna site 표고 상공 4,500【(까지 ASS 제공한다. @ Glide slopee 12NM7}4] ASS 제공한다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-077","number":77,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":25,"source_question_number":77,"question":"TCH 49 [에서 “TCH\"S] 의미는?","choices":[{"id":"A","text":"ILS glide slopee7} thresholdS 지나는 고도"},{"id":"B","text":"Glide slopee antenna7} thresholdS 지나는 고도"},{"id":"C","text":"항공기의 12ㅁ0108 gear7} thresholdS 지나는 고도"},{"id":"D","text":"조종석의 AFA} thresholds 지나는 고도"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-078","number":78,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":78,"question":"","choices":[{"id":"A","text":"uter Marker2] BBA BSE?"},{"id":"B","text":"초당 2회의 dot"},{"id":"C","text":"초당 2회의 dash"},{"id":"D","text":"초당 6회의 dot @ 초당 6회의 dash"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-079","number":79,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":79,"question":"ILS","choices":[{"id":"A","text":"uter Marker2] 식별 신호 및 색깔은? @----, Blue"},{"id":"B","text":"* ㅇㅇ *, Blue"},{"id":"C","text":"----, White"},{"id":"D","text":"e ㅇㅇ ©, White"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-080","number":80,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":80,"question":"ILS MM2] light 색깔과 신호음은?","choices":[{"id":"A","text":"White, * ㅇㅇ"},{"id":"B","text":"Blue, ----"},{"id":"C","text":"Amber, * —"},{"id":"D","text":"— @ Blue, *- ¢ -"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-081","number":81,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":81,"question":"ILS front course 42 경로선상에 44] < inner markeroA| 조종사가 수신할 수 WE 신 호음과 등화색은?","choices":[{"id":"A","text":"초당 6회의 dot 음, 백색"},{"id":"B","text":"초당 2회의 dot 음, 황색"},{"id":"C","text":"초당 6회의 dash 음, 청색"},{"id":"D","text":"초당 2회의 dash 음, 백색"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-082","number":82,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":82,"question":"ILS back course7} 있는 공항에 back 000786로 접근시 light 색깔과 신호음은?","choices":[{"id":"A","text":"back 608@ 로 HZA light AAF 신 호 음 은?"},{"id":"B","text":"White, * - * -"},{"id":"C","text":"Blue, * = * —"},{"id":"D","text":"White, e e eè è @ Blue, * * o o"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-083","number":83,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":83,"question":"활주로 끝단으로부터 middle marker7}4|2] 거리는?","choices":[{"id":"A","text":"2,500 ft"},{"id":"B","text":"3,200 ft"},{"id":"C","text":"3,500 ft"},{"id":"D","text":"4,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-084","number":84,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":84,"question":"활주로 끝단으로부터 04[6【 marker7}4|2] 거리는?","choices":[{"id":"A","text":"2~5 NM"},{"id":"B","text":"4~7NM"},{"id":"C","text":"5~8 NM"},{"id":"D","text":"8~10 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-085","number":85,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":26,"source_question_number":85,"question":"마커비컨의 기능에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"외부마커(010)는"},{"id":"C","text":"중간마커(\\1\\{)는 1900108 threshold@#e} 약 3,500 {의 위치를 나타낸다,"},{"id":"D","text":"Ween} (IM) MM3} landing threshold 사이의 설정된 결심고도에 있을 때의 위치를 나 타낸다. @ 후방진로 마커(680 course marker) 후방진로 1116181 final approach fixS 나타낸다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-086","number":86,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":27,"source_question_number":86,"question":"Compass locator 신호의 최소 통달범위는?","choices":[{"id":"A","text":"10 NM(18.5km)"},{"id":"B","text":"15 NM(28.0km)"},{"id":"C","text":"18 NM(33.35km)"},{"id":"D","text":"20 NM(37.0km) {24i]] 87. Compass Locator2] 출력과 유효거리는? ® 2OW 이하, 최소 10마일 @ 20W 이하, 최소 18마일 @ 25W 이하, 최소 10마일 @ 25W 이하, 최소 15마일"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-087","number":87,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":27,"source_question_number":87,"question":"Compass Locator 의 출 력 과 유 효 거리는?","choices":[{"id":"A","text":"20W 이하, 최소 10 마 일"},{"id":"B","text":"20W 이하, 최소 15 마 일"},{"id":"C","text":"25W 이하, 최소 10 마 일"},{"id":"D","text":"25W 이하, 최소 15 마 일"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-088","number":88,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":27,"source_question_number":88,"question":"Compass Locator2] 유효범위 및 출력은?","choices":[{"id":"A","text":"At least 15NM, at least 25watts"},{"id":"B","text":"At least 15NM, less than 25watts"},{"id":"C","text":"Less than 15NM, less than 25watts"},{"id":"D","text":"Less than 15NM, at least 25watts"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-089","number":89,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":27,"source_question_number":89,"question":"ILS2] localizer signal 중 4 2자리 문자의 signalS 송신하고, marker beaconS","choices":[{"id":"A","text":"신 할 수 있는 것은?"},{"id":"B","text":"Middle Marker"},{"id":"C","text":""},{"id":"D","text":"uter Marker 때 Middle Compass Locator @ Outer Compass Locator"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-090","number":90,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":27,"source_question_number":90,"question":"ILS 구성요소 중 두 개의 BAS 식별되고, 거리 정보를 제공하는 요소는?","choices":[{"id":"A","text":"Compass locator"},{"id":"B","text":"Glide slope"},{"id":"C","text":"Middle marker"},{"id":"D","text":"Outer marker"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-091","number":91,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":91,"question":"ILS 식별부호가 \"1881\" 일 때, \"I\" 다음의 첫 두 자리 문자가 의미하는 시설은?","choices":[{"id":"A","text":"Compass locator"},{"id":"B","text":"Inner locator"},{"id":"C","text":"Middle locator"},{"id":"D","text":"Outer locator"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-092","number":92,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":92,"question":"1\" 뒤 식별부호 중 마지막 두 개의 문자를 통해 구별할 수 있는 시설은?","choices":[{"id":"A","text":""},{"id":"B","text":"ME"},{"id":"C","text":""},{"id":"D","text":"M @ MM @ IM"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-093","number":93,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":93,"question":"04 1 정밀접근 활주로의 결심고도(1011) 및 활주로가시거리(50) 최저치는?","choices":[{"id":"A","text":"100ft, 550m"},{"id":"B","text":"100ft, 650m"},{"id":"C","text":"200ft, 550m"},{"id":"D","text":"200ft, 650m"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-094","number":94,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":94,"question":"CAT 1 정밀접근 활주로의 RVR 최저치는?","choices":[{"id":"A","text":"2,000ft"},{"id":"B","text":"1,800ft"},{"id":"C","text":"1,600ft"},{"id":"D","text":"1,400ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-095","number":95,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":95,"question":"Touchdown zone} centerline lighting 갖춘 ILS CAT 1 의 minimum RVR2?","choices":[{"id":"A","text":"2,400ft"},{"id":"B","text":"2,200ft"},{"id":"C","text":"2,000ft"},{"id":"D","text":"1,800ft"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-096","number":96,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":96,"question":"ALSo] 설치되어 있는 활주로에서 ILS CAT I 2] RVRE?","choices":[{"id":"A","text":"2,200ft 이상"},{"id":"B","text":"2,000ft 이상"},{"id":"C","text":"1,800ft 이상"},{"id":"D","text":"1.6008 이상"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-097","number":97,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":97,"question":"CAT I ILS2]","choices":[{"id":"A","text":"H 및 RVR WHE?"},{"id":"B","text":""},{"id":"C","text":"H: 30m 이상 50m 미만, RVR: 350m 이상 500m 미만"},{"id":"D","text":"DH: 30m 의상 50m 미만, RVR: 300m 이상 550m 미만 @ DH: 30m 의상 60m 미만, RVR: 350m 이상 500m 미만 @ DH: 30m 이상 60m 미만, RVR: 300m 이상 550m 미만"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-098","number":98,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":98,"question":"Category 4UaAt 활주로의 RVR 최소치는?","choices":[{"id":"A","text":"800 ft"},{"id":"B","text":"1,000 ft"},{"id":"C","text":"1,300 ft"},{"id":"D","text":"1,500 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-099","number":99,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":28,"source_question_number":99,"question":"A= categoryol 따른 RVR 최저치가 잘못 ABS 것은?","choices":[{"id":"A","text":"CAT I - 1,800 ft"},{"id":"B","text":"CAT II - 1,000 ft"},{"id":"C","text":"CAT Ma - 650 ft"},{"id":"D","text":"CAT Ib - 150 ft <at> ICAO Annex 14,"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-100","number":100,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":29,"source_question_number":100,"question":"다음 중 CAT-I ILS ZAI critical 8768의 안전을 보장하지 못하는 기상상황은? 얄 운고 600 이상, RVR 2,000ft 이상","choices":[{"id":"A","text":"운 고 600t 이상, RVR 2,000t 이상"},{"id":"B","text":"운 고 600ft 이하, RVR 2,000ft 이하"},{"id":"C","text":"운 고 800ft 이상, VIS 2 마 일 이상"},{"id":"D","text":"운 고 800t 이하, VIS 2 마 일 이하"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-101","number":101,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":29,"source_question_number":101,"question":"조종연습을 위해 CAT","choices":[{"id":"A","text":"ILS"},{"id":"B","text":"ZA\\ critical 8168 를 고려하지 않아도 되는 기상상태는?"},{"id":"C","text":"운고 800 이하, 시정 2814 이하"},{"id":"D","text":"운고 800《[ 이상, 시정 2814 이상 때 ST 800ft 이하, 시정 381 이하 @ 운고 800《[ 이상, 시정 3814 이상"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-102","number":102,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":29,"source_question_number":102,"question":"계기비행 훈련 중 047 11 ILS 접근시 01ㅁ1081 area protection®] 되지 않는 기상은?","choices":[{"id":"A","text":"£7 1,200ft, VIS 3814 미만"},{"id":"B","text":"23 1,200ft, VIS 38M 이상"},{"id":"C","text":"운고 8006, VIS 2SM 미만"},{"id":"D","text":"운고 8006, VIS 2SM 이상"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-103","number":103,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":29,"source_question_number":103,"question":"활주로 방향으로 정대되지 않고 100811267보다 넓은 방위각을 가지며 ILSS 일부","choices":[{"id":"A","text":"체할 수 있는 장비는?"},{"id":"B","text":"VOR"},{"id":"C","text":"SDF"},{"id":"D","text":"DME @ Compass locator [2] 104, ILS Localizer9} 유사하나 활주로 중앙으로 정대되지 않고 방위각이 더 넓은 장치는? @ SDF @ LDA 때 MLS @ DME"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-104","number":104,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":29,"source_question_number":104,"question":"ILS Localizerg} 유 사 하나 활주로 중 앙 으로 정","choices":[{"id":"A","text":"되지 않고 방 위 각 이 더 넓은 장 치 는?"},{"id":"B","text":"SDF"},{"id":"C","text":"LDA"},{"id":"D","text":"MLS @® DME"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-105","number":105,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":29,"source_question_number":105,"question":"다음 중 11.8보다 정확성이 떨어지는 항행안전시설은?","choices":[{"id":"A","text":"MLS"},{"id":"B","text":"GLS"},{"id":"C","text":"LDA"},{"id":"D","text":"SDF"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-106","number":106,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":106,"question":"Simplified directional facility(SDF) 신호가 제공하는 진로의 SL?","choices":[{"id":"A","text":"3° 또는 6“"},{"id":"B","text":"T 또는 10?"},{"id":"C","text":"6 또는 12“"},{"id":"D","text":"12° 또는 15°"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-107","number":107,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":107,"question":"Microwave Landing System(MLS)2] 접근 방위각 유도정보가 제공되는 최소고도는?","choices":[{"id":"A","text":"8,000 ft"},{"id":"B","text":"10,000 ft"},{"id":"C","text":"20,000 ft"},{"id":"D","text":"22,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-108","number":108,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":108,"question":"Microwave Landing System(MLS)°] 제공하는 BRE?","choices":[{"id":"A","text":"Azimuth, elevation, distance"},{"id":"B","text":"Azimuth, elevation, three-letter identification"},{"id":"C","text":"Azimuth, elevation,"},{"id":"D","text":"ata communication @ Range, elevation, MLS readout"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-109","number":109,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":109,"question":"Microwave Landing System(MLS) 식별에 사용되는 Morse Code 식별부호는?","choices":[{"id":"A","text":"문자 [40786 Code 다음에 두 문자의 Morse Code 식별부호"},{"id":"B","text":"문자 \"4\" Morse Code 다음에 세 문자의 Morse Code 식별부호"},{"id":"C","text":"문자 IM\" Morse Code 다음에 두 문자의 Morse 0006 식별부호"},{"id":"D","text":"문자 IM” Morse Code 다음에 세 문자의 Morse Code 식별부호"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-110","number":110,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":110,"question":"Microwave landing system(MLS) 2] 좌우 서비스 범위는?","choices":[{"id":"A","text":"활주로중심선의 430“"},{"id":"B","text":"활주로중심선의 340“"},{"id":"C","text":"활주로중심선의 460“"},{"id":"D","text":"활주로중심선의 260“"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-111","number":111,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":111,"question":"MLS azimuth 유도정보가 제공되는 전방 및 후방의 거리 범위는?","choices":[{"id":"A","text":"전방 10 NM, 후방 10 NM"},{"id":"B","text":"전방 15 NM, 후방 10 NM"},{"id":"C","text":"전방 20 NM, 후방 7 NM"},{"id":"D","text":"전방 20 NM, 후방 15 NM"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-112","number":112,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":30,"source_question_number":112,"question":"Microwave Landing System(MLS) 2] 방위각 통달범위는?","choices":[{"id":"A","text":"활주로중심선의 420? 범위"},{"id":"B","text":"에서 12 NM 까지"},{"id":"C","text":"활주로중심선의 420° 범위"},{"id":"D","text":"에서 20 NM 까지 @ 활주로중심선의 340\" 범위 내에서 12 NM 까지 @ 활주로중심선의 340\" 범위 내에서 20 NM 까지"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-113","number":113,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":31,"source_question_number":113,"question":"VOR 시설 고장 수리중 식별부호의 송신 방법으로 맞는 것은?","choices":[{"id":"A","text":"식별부호를 제거하거나, TEST 식별신호를 송신한다."},{"id":"B","text":"TEST 식별신호를 송신한다."},{"id":"C","text":"음성 식별신호를 제거한다."},{"id":"D","text":"VOR 시설이 정비중이라는 것을 녹음한 자동음성 식별신호를 송신한다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-114","number":114,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":31,"source_question_number":114,"question":"VORTAC AAS 정비중일 때, 이를 어떻게 알 수 있는가?","choices":[{"id":"A","text":"TACAN 음성 식별신호의 제거"},{"id":"B","text":"식별부호의 제거"},{"id":"C","text":"식별부호 다음의 연속되는 dash 음"},{"id":"D","text":"문자 으로 시작되는 식별부호"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-115","number":115,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":31,"source_question_number":115,"question":"LORAN 항법을 하기 위해서는 하나의 chain","choices":[{"id":"A","text":"에 최소 몇 72] statione] 필요한가?"},{"id":"B","text":"1개"},{"id":"C","text":"2개"},{"id":"D","text":"3개 @ 4개"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-116","number":116,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":31,"source_question_number":116,"question":"1.02씨 수신기로 조종사에게 항법정보를 제공하기 위해서는 최소 몇 개의 국으로부터 Al 호를 수신하여야 하는가?","choices":[{"id":"A","text":"2개"},{"id":"B","text":"3개"},{"id":"C","text":"4개"},{"id":"D","text":"5개"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-117","number":117,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":31,"source_question_number":117,"question":"다음 중 관성항법장치(1418)의 구성요소가 아닌 것은?","choices":[{"id":"A","text":"가속도계"},{"id":"B","text":"항법 컴퓨터"},{"id":"C","text":"신호 수신기"},{"id":"D","text":"자이로"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-118","number":118,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":31,"source_question_number":118,"question":"지상의 항공보안무선시설","choices":[{"id":"A","text":"신에 NAVSTAR 인공위성을 이용하는 항법은?"},{"id":"B","text":"GPS"},{"id":"C","text":"INS"},{"id":"D","text":"MLS @ ILS"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-119","number":119,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":119,"question":"항 법 위성 이용 시 오 차 발생 요 인 은?","choices":[{"id":"A","text":"전리층 굴절"},{"id":"B","text":"성층권 온도 체감"},{"id":"C","text":"aa"},{"id":"D","text":"너지 @ 이 온 층 에너지 전도"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-120","number":120,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":120,"question":"위성항법장치(328) 오차의 주요인은?","choices":[{"id":"A","text":"위성 기준 시간과의 차이에 의한 오차"},{"id":"B","text":"위성의 위치에 의한 오차"},{"id":"C","text":"전리충에 의한 오차"},{"id":"D","text":"수신기 잡음에 의한 오차"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-121","number":121,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":121,"question":"0ㅠ8를 이용한 항법을 할","choices":[{"id":"A","text":"3차원 정보(위도, 경도, 고도)와 시간을 얻기 위해 필요한 최 소 위성수는?"},{"id":"B","text":"3개"},{"id":"C","text":"4개"},{"id":"D","text":"5개 @ 6개"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-122","number":122,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":122,"question":"078가 정상 작동하기 위해 필요한 위성의 수는?","choices":[{"id":"A","text":"2개"},{"id":"B","text":"3개"},{"id":"C","text":"4개"},{"id":"D","text":"5개"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-123","number":123,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":123,"question":"민간용 GPS2] 일반적인 수평 정확도는?","choices":[{"id":"A","text":"10m"},{"id":"B","text":"50m"},{"id":"C","text":"100m"},{"id":"D","text":"120m"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-124","number":124,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":124,"question":"위성항법 AAA(GPS)o]","choices":[{"id":"A","text":"한 설명으로 틀린 것은?"},{"id":"B","text":"기상의 영향을 받지 않는다."},{"id":"C","text":""},{"id":"D","text":"recise positioning service(PPS) 2] 오차는 100m 이다. @ 전리충에 의한 지연 또는 위성의 원자시계와 GPS 기준시간과의 불일치로 오차가 발생한다. @ 위치정보를 얻기 위해서는 3개의 위성, 3차원 정보와 AS 얻기 위해서는 4개의 위성을 필 요로 한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-125","number":125,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":32,"source_question_number":125,"question":"GPS (global positioning system)2] 위성부분은 몇 개의 가용 위성으로 구성되는가?","choices":[{"id":"A","text":"18개"},{"id":"B","text":"2274"},{"id":"C","text":"24개"},{"id":"D","text":"26개"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-126","number":126,"subject":"K-AIM","study_unit":1,"study_unit_title":"항행안전시설","subunit":{"code":"KAIM-1","title":"항행안전시설"},"source_pdf_page":33,"source_question_number":126,"question":"비정밀 계기접근 시, GPS approach overlay program] 의해 GPS 장비를 사용할 수 있는 절차는?","choices":[{"id":"A","text":"VOR 절차"},{"id":"B","text":"LOC 절차"},{"id":"C","text":"SDF 절차"},{"id":"D","text":"LDA 절차"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","항행안전시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-127","number":127,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":33,"source_question_number":1,"question":"Area Navigation(RNAV) 의 특성이 아닌 것은?","choices":[{"id":"A","text":"복잡한 항로 및 공항을 피해 비행할 수 있다."},{"id":"B","text":"항로와 평행하게 비행할 수 있다."},{"id":"C","text":"회피해야 하는 AAS 피하기 위해 arc turnd 할 수 있다."},{"id":"D","text":"희망 공항으로 바로 비행할 수 있다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-128","number":128,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":33,"source_question_number":2,"question":"Area Navigation(RNAV)o]","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"곡선구간은 운항거리 및 시간을 단축할 수 없다."},{"id":"C","text":"혼잡 항로 및 공항 ASS 피할 수 있다."},{"id":"D","text":"공항 간에 직선비행이 가능하다. 대 공역 수용량을 증대시킬 수 있다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-129","number":129,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":33,"source_question_number":3,"question":"RNAV 비행로에서 운항중인 항공기가 위치보고를","choices":[{"id":"A","text":"야 하는 TL?"},{"id":"B","text":"VOR"},{"id":"C","text":"TACAN"},{"id":"D","text":"Waypoint 라 DME <해설〉 항공교통관제절차 4-1-5. Fix Use 아래 #(note) 2] 경우를 제외하고, 항공기 위치보고는 비행고도의 이용을 위한 항공로지도에 명시된 fix 상에서만 요구하여야 한다. ¢ %(note) - 임의 RNAV 비행로에 표시된 waypoint: 항공교통관제기관에서 별도로 요구하지 않 는 한. 자동으로 필수 보고저점이 된다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-130","number":130,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":34,"source_question_number":4,"question":"RNAV 비행로 운항 시 사용 장비가 아닌 것은?","choices":[{"id":"A","text":"VOR"},{"id":"B","text":"ADF"},{"id":"C","text":""},{"id":"D","text":"ME @ GPS ."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-131","number":131,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":34,"source_question_number":5,"question":"RNAV 비행로에서 비행하는 RNAV 항법 항공기의 경우 항로와 어느 정도의","choices":[{"id":"A","text":"AS 허용하"},{"id":"B","text":"가? 1~2NM"},{"id":"C","text":"2~3NM"},{"id":"D","text":"3~4NM 해 4~5NM"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-132","number":132,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":34,"source_question_number":6,"question":"RNAV","choices":[{"id":"A","text":"eparture procedure®] 요구되는 RNPE?"},{"id":"B","text":"RNP"},{"id":"C","text":"RNP 2"},{"id":"D","text":"RNP 3"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-133","number":133,"subject":"K-AIM","study_unit":2,"study_unit_title":"성능기반항행 및 지역항법(PBN/RNAV)","subunit":{"code":"KAIM-2","title":"성능기반항행 및 지역항법(PBN/RNAV)"},"source_pdf_page":34,"source_question_number":7,"question":"약어 RNP2] 의미는?","choices":[{"id":"A","text":"Required Navigation"},{"id":"B","text":"recision"},{"id":"C","text":"Requested Navigation"},{"id":"D","text":"osition © Required Navigation Performance @& Required Navigation Point <해설〉 AIM, 조종사/관제사 용어사전. Required Navigation Performance(RNP) 지정된 공역 내에서 운항시 필요한 항행 성능의 정도를 나타내는 용어 3@ 40"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","성능기반항행 및 지역항법(PBN/RNAV)"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-134","number":134,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":1,"question":"다음 중 Approach light7} 아닌 것은?","choices":[{"id":"A","text":"HIRL"},{"id":"B","text":"SSALF"},{"id":"C","text":"RAIL"},{"id":"D","text":"MALSR"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-135","number":135,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":2,"question":"다음 중 Approach light system] 속하지 않는 AL?","choices":[{"id":"A","text":"ALSF-I"},{"id":"B","text":"MALSF"},{"id":"C","text":"VASI"},{"id":"D","text":"LDIN"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-136","number":136,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":3,"question":"다음 중 Approach light 만으로 짝지어진 AL?","choices":[{"id":"A","text":"RAIL,"},{"id":"B","text":"DALS, LDIN, SSALR, VASI"},{"id":"C","text":""},{"id":"D","text":"DALS, LDIN, SSALR, SSALF, VASI 해 RAIL, LDIN, SSALR, SSALF, VASI @ RAIL, ODALS, LDIN, SSALR, SSALF"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-137","number":137,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":4,"question":"Red side row light7} {= approach light system?","choices":[{"id":"A","text":"ALSF- I"},{"id":"B","text":"ALSF-I"},{"id":"C","text":"MALSR"},{"id":"D","text":"SSALR"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-138","number":138,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":5,"question":"MALSR, SSALRoAq \"이 의미하는 것은?","choices":[{"id":"A","text":"Runway Approach Lighting System"},{"id":"B","text":"Runway Alignment Indicator Lights"},{"id":"C","text":"Runway Lead-in Light System"},{"id":"D","text":"Runway Sequenced Flashing Lights"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-139","number":139,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":6,"question":"주간 시정이 양호할","choices":[{"id":"A","text":"SSALRE 전환이 7458t approach light system?"},{"id":"B","text":"MALSR"},{"id":"C","text":"SALSF"},{"id":"D","text":"ALSF-1 해 ALSF-2"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-140","number":140,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":7,"question":"","choices":[{"id":"A","text":"recision instrument runway2] approach light system 설치 길이는?"},{"id":"B","text":"1,500~3,500 ft"},{"id":"C","text":"1,400~2,500 ft"},{"id":"D","text":"2,000~3,000 ft ® 2,400~3,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-141","number":141,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":47,"source_question_number":8,"question":"비정밀접근 활주로의 경우, 진입등 시스템의 설치 길이는?","choices":[{"id":"A","text":"400~500 ft"},{"id":"B","text":"900~1,000 ft"},{"id":"C","text":"1,400~1,500 ft"},{"id":"D","text":"2,400~3,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-142","number":142,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":48,"source_question_number":9,"question":"Approach light systemo|] 활주로 끝에 설치되는","choices":[{"id":"A","text":"604600680 flashing light2] 작동조 건은?"},{"id":"B","text":"시정이 3마일 미만인 경우"},{"id":"C","text":"시정이 5마일 미만인 경우"},{"id":"D","text":"운고가"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-143","number":143,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":48,"source_question_number":10,"question":"2-bar VASI7} 제공하는 접근각은?","choices":[{"id":"A","text":"2“"},{"id":"B","text":"3°"},{"id":"C","text":"4°"},{"id":"D","text":"5°"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-144","number":144,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":48,"source_question_number":11,"question":"2-bar VASI 시설은 일반적으로 B 개의 시각 활공통로(81106 path)S 제공하는가?","choices":[{"id":"A","text":"1개"},{"id":"B","text":"27H"},{"id":"C","text":"344"},{"id":"D","text":"양쪽으로 274 【문제】]12.74&81의 야간 식별 가능거리는? @ 10 NM 이상 @ 15 NM 이상 @ 20 NM 이상 @ 25 NM 이상"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-145","number":145,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":48,"source_question_number":12,"question":"v\"A81 의","choices":[{"id":"A","text":"간 식별 가 능 거리는?"},{"id":"B","text":"10 NM 이상"},{"id":"C","text":"15 NM 이상"},{"id":"D","text":"20 NM 이상 @ 25 NM 이상"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-146","number":146,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":48,"source_question_number":13,"question":"Visual Approach Slope Indicator의 식별 가능거리는?","choices":[{"id":"A","text":"주간 2~4NM,"},{"id":"B","text":"간 10804 이상"},{"id":"C","text":"주간 2~4NM,"},{"id":"D","text":"간 20NM 이상 & 주간 3~5NM, 야간 10NM 이상 래 주간 3~5NM, 야간 20NM 이상 [2H] 14, VASI7} 보장하는 유효범위와 길이는? 애 좌우 8“, 3마일 대 좌우 9“, 4마일 PAP 10° are Sap 12°, 5마일"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-147","number":147,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":48,"source_question_number":14,"question":"VASI가 보장하는 유효범위와 길이는?","choices":[{"id":"A","text":"좌우 8°, 3마일"},{"id":"B","text":"좌우 9°, 4마일"},{"id":"C","text":"좌우 10°, 4마일"},{"id":"D","text":"좌우 12°, 5마일"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-148","number":148,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":49,"source_question_number":15,"question":"VASIS] 장애물 안전고도 보장 범위는?","choices":[{"id":"A","text":"활주로 연 장 선 으로부터 좌우 10°, 활주로 끝 으로부터 4NM"},{"id":"B","text":"활주로 연 장 선 으로부터 좌우 10°, 활주로 끝 으로부터 7INM"},{"id":"C","text":"활주로 연 장 선 으로부터 좌우 5°, 활주로 끝 으로부터 4NM"},{"id":"D","text":"활주로 연 장 선 으로부터 좌우 5°, 활주로 끝 으로부터 7NM"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-149","number":149,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":49,"source_question_number":16,"question":"44 glide path@l 경우 2-bar ㅠ481의 색은?","choices":[{"id":"A","text":"전면-적색, 후면-적색"},{"id":"B","text":"전면-백색, 후면-백색"},{"id":"C","text":"전면-적색, 후면-백색"},{"id":"D","text":"전면-백색, 후면-적색"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-150","number":150,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":49,"source_question_number":17,"question":"3-bar VASI7} 설치된 활주로에 접근중인 비행기가 MDA 도달했을","choices":[{"id":"A","text":"BE VASI 라이 트가 적색으로 나타났다. 조종사는 어떠한 조치를 취해야 하는가?"},{"id":"B","text":"적절한 접근경로에 진입하기 위해서 상승한다."},{"id":"C","text":"적절한 접근경로에 진입하기 위해서 강하한다."},{"id":"D","text":"적절한 접근경로에 진입하기 위해서 잠시 수평비행을 한다. @ 활주로가 보이면 동일한 강하올로 계속 접근한다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-151","number":151,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":49,"source_question_number":18,"question":"VASI7} 설치된 활주로에 접근 시, MDA 도달하기 이전에 HE VAS light 들이 빨간색 으로 보였을","choices":[{"id":"A","text":"의 행동으로 적절한 것은?"},{"id":"B","text":""},{"id":"C","text":"n 81106를 위해 상승한다."},{"id":"D","text":"On glideS 위해 잠시 16061 off 한다. @ B42 insights 위해 강하한다. @ Missed approachS 한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-152","number":152,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":49,"source_question_number":19,"question":"강하각이 정상보다 낮을","choices":[{"id":"A","text":"24&11의 색깔은? (ㅇ White,"},{"id":"B","text":"Red)"},{"id":"C","text":"0000 0000"},{"id":"D","text":"0ooe & ecece"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-153","number":153,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":20,"question":"","choices":[{"id":"A","text":"API] 식별 가능거리는?"},{"id":"B","text":"주간 3NM,"},{"id":"C","text":"간 1ONM"},{"id":"D","text":"주간 3NM, 야간 20NM 대 주간 5NM, 야간 1ONM @ 주간 54144, 야간 20NM"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-154","number":154,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":21,"question":"","choices":[{"id":"A","text":"API 등화장치의 색상이 1개는 white, 3개는 760일"},{"id":"B","text":"glide ㅁ801는?"},{"id":"C","text":"약간 낮음(61100617 low)"},{"id":"D","text":"낮음(10\\) 댄 약간 높음(61104417 high) @ 높음(0180)"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-155","number":155,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":22,"question":"정상보다 약간 높은 진입각인 경우,","choices":[{"id":"A","text":"API 등화의 지시는?"},{"id":"B","text":"4개 White"},{"id":"C","text":"47} Red"},{"id":"D","text":"37 White, 17] Red @ 17H White, 37H Red"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-156","number":156,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":23,"question":"","choices":[{"id":"A","text":"간에 344 (tri-color) VASI2] 정상유효거리(ㅁ070081 range) =?"},{"id":"B","text":"3마일"},{"id":"C","text":"5마일"},{"id":"D","text":"10마일 래 20마일 ES = 진입등시스템(600「08아 light system) 식별가능거리 ㆍ I 식별가능거리 잠@깐 dia 주간 | 야간 | 알고 시각진입각지시등(7948! Approach Slope Indicator: VASI) 3~5마일 Hise BWAZIALS (Precision Approach Path indicator: PAPI)| Sor | 2001] 5 BAH A|AEM(Tri-color System) 1/2~1마일 5마일 기: 점멸식 시스템(『4168409 System) 4마일 10마일 구조물배치 시스템(1000167! of Elements System) ="}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-157","number":157,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":24,"question":"항공기가 정상적인 81106 0810보다 낮은 곳에 있을","choices":[{"id":"A","text":"tri-color VASIS] 색깔은?"},{"id":"B","text":"White"},{"id":"C","text":"Green"},{"id":"D","text":"Red © Amber"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-158","number":158,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":25,"question":"Tri-color VASI에서 glide path가 정상보다 높을 때 보이는 색은?","choices":[{"id":"A","text":"백색"},{"id":"B","text":"적색"},{"id":"C","text":"황색"},{"id":"D","text":"녹색"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-159","number":159,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":50,"source_question_number":26,"question":"Above glide path 시 tri-color 481의 지시 색깔은?","choices":[{"id":"A","text":"Red"},{"id":"B","text":"Amber"},{"id":"C","text":"Green"},{"id":"D","text":"White 20.€)"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-160","number":160,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":51,"source_question_number":27,"question":"정상 강하각에서 below glide path=","choices":[{"id":"A","text":"려갈"},{"id":"B","text":"3색({21-00107) ㅠ&891에서 볼 수 있는 색 의 순서는?"},{"id":"C","text":"녹색-황색-적색"},{"id":"D","text":"녹색-적색-황색 @ 녹색-백색-적색 @ 녹색-적색-백색"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-161","number":161,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":51,"source_question_number":28,"question":"Tri-color VASI 접근 시 0ㅁ glide pathol]4] below glide path7} 될 때, 보게 되는 색상의 순서는?","choices":[{"id":"A","text":"White-Amber—Red"},{"id":"B","text":"White—Red—Green"},{"id":"C","text":"Green—Amber~Red"},{"id":"D","text":"Green—Red—-Amber"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-162","number":162,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":51,"source_question_number":29,"question":"","choices":[{"id":"A","text":"n glide slopee] below glide slopee= 전환하는 동안 Tri-color VASIOA| 볼 수 있는 색은?"},{"id":"B","text":""},{"id":"C","text":"ark amber—Amber"},{"id":"D","text":"Dark amber~Red 해 Dark Red—Red @ Dark Red—amber"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-163","number":163,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":51,"source_question_number":30,"question":"조종사가 VASIE 갖춘 활주로에 ILS 접근 중","choices":[{"id":"A","text":"MS 통과한 = glide slopee out 인지하 였다. VASIS 확인한 경우 조종사의 조치사항으로 올바른 것은?"},{"id":"B","text":"ATCO 통보하고 즉시 로컬라이저 접근을 실시하여 로컬라이저 12까지 강하한다."},{"id":"C","text":"Glide slopee"},{"id":"D","text":"신에 VASIS 보고 계속 접근한다. @ LOC 접근을 요청하고, 조종사의 판단에 따라 491 아래로 강하할 수 있다. @ 해당 공항의 발간된 실패접근절차에 따른다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-164","number":164,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":51,"source_question_number":31,"question":"다음 중 진입각 지시등이 아닌 것은?","choices":[{"id":"A","text":"3-bar VASI"},{"id":"B","text":"Tri-color VASI"},{"id":"C","text":""},{"id":"D","text":"API @ REIL"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-165","number":165,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":51,"source_question_number":32,"question":"REILS| 주 S42?","choices":[{"id":"A","text":"감소된 시정 중에 진입방향 활주로 끝의 신속하고 확실한 식별"},{"id":"B","text":"감소된 시정 중에 주 활주로의 신속하고 확실한 식별"},{"id":"C","text":"ABA 시정장애가 있을"},{"id":"D","text":"활주로 가장자리의 식별 @ HBA 시정장애가 있을 때 활주로 진입로의 식별"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-166","number":166,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":33,"question":"특정 활주로의 접근로 끝단을 신속하고 정확하게 식별하기 위하여 설치되는 등화는?","choices":[{"id":"A","text":"REIL"},{"id":"B","text":"RCLS"},{"id":"C","text":"HIRL"},{"id":"D","text":"TDZL"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-167","number":167,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":34,"question":"Runway End Identifier Light(REIL)o] 관한 설명 중 맞는 것은?","choices":[{"id":"A","text":"Fixed lights showing red toward the runway and showing green outward from the runway."},{"id":"B","text":"Synchronized flashing lights showing white."},{"id":"C","text":"Flashing lights showing yellow until the last 2,000 feet of the runway."},{"id":"D","text":"Fixed unidirectional lights showing red in the direction of the runway."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-168","number":168,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":35,"question":"","choices":[{"id":"A","text":"간 또는 저 시정 시 활 주 로 의 윤 곽 을 식 별 할 수 있도록 설 치 하는 등 화 는?"},{"id":"B","text":"Runway Edge Light"},{"id":"C","text":"Runway End Light"},{"id":"D","text":"Runway Centerline Light € Approach Light"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-169","number":169,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":36,"question":"항공기가 활주로에 접근 시 접근하는 방향에서 B 수 있는 BES AS (runway threshold light) 의 색깔은?","choices":[{"id":"A","text":"백색"},{"id":"B","text":"청색"},{"id":"C","text":"적색 eh 녹색 <at> AIM 2-1-4, 활주로등 시스템(ㅁＬㅁ0\\8 Edge Light Systems) 1. BRS (runway edge light)-2 어두울"},{"id":"D","text":"나 시정이 제한된 상태에서 활주로의 가장자리를 나타 내기 위해 사용된다. 2. 활주로종단(040\\8” 600)을 표시하는 등화는 출발항공기에게 활주로종단을 나타내기 위하여 활주 로 쪽으로 적색불빛을 비추고, 착륙항공기에게는 AA(threshold) & 나타내기 위하여 활주로종단 바 깥쪽으로 녹색을 비춘다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-170","number":170,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":37,"question":"착륙활주 중 활주로 중심선등이 모두 적색으로 보이기 시작하면 남은 활주로 거리는?","choices":[{"id":"A","text":"1,000 ft"},{"id":"B","text":"2,000 ft"},{"id":"C","text":"3,000 ft"},{"id":"D","text":"4,000 ft"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-171","number":171,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":38,"question":"Runway centerline light2] 활주로 마지막 1,000ft 구간의 색깔은?","choices":[{"id":"A","text":"Red"},{"id":"B","text":"White"},{"id":"C","text":"Green"},{"id":"D","text":"Red, White"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-172","number":172,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":52,"source_question_number":39,"question":"Runway centerline light7} 적색과 백색이 교대로 보인다면, 이것은 무엇을 의미하는가?","choices":[{"id":"A","text":"활주로가"},{"id":"B","text":"활주로가"},{"id":"C","text":"활주로가 1,000 ft 남았다."},{"id":"D","text":"활주로의 절반이 남았다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-173","number":173,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":53,"source_question_number":40,"question":"백색이었던 활주로 중심선등이 백색과 적색으로 교차되면 남은 활주로 길이는?","choices":[{"id":"A","text":"1,000 ft"},{"id":"B","text":"2,000 ft"},{"id":"C","text":"3,000 ft"},{"id":"D","text":"b 4,000 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-174","number":174,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":53,"source_question_number":41,"question":"활주로 종단으로부터 3,000《[에서 1.000{\\까지의 활주로 중심선등의 MAL? 양 백색","choices":[{"id":"A","text":"적색"},{"id":"B","text":"백색, 적색"},{"id":"C","text":"황색 <ol> AIM 2-1-5, 8. 활주로중심선등 AAA (Runway Centerline Lighting System: RCLS) 착륙활주로시단(180ㅁ0108 threshold) 4] 보았을"},{"id":"D","text":"활주로 마지막 3,000 ft 까지의 활주로중심선 등은 백색이다. 다음 2,000 ft 구간에서 백색등은 적색등과 교대로 설치되고, 활주로의 마지막 1,000 ft Pz] 경우 모든 중심선등은 적색이다. 활주로등(백) (적백 교대등) 활주로 중심선등(적 활주로등 버벌 ~ | rd / / / / / = i se ! ado ecg oooog0 7 Z OE Sf 제재 uy | | | \\ \\ \\ | 3000 횡선표시등 중심선표시등 \\ 나 -| Fae 활주로 시단등 \\ os See Ace 활주로 중심선등(백) 그 00 항공기 진임 방향"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-175","number":175,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":53,"source_question_number":42,"question":"접지구역등(''1)21_)에 관한 설명 중 틀린 것은?","choices":[{"id":"A","text":"GAAS category 또는 피의 접지구역에 설치하여야 한다."},{"id":"B","text":"활주로 길이가 1,800m 이하인 곳에서는 활주로 중간지점에 설치한다."},{"id":"C","text":"등간 간격은 30m 혹은 60ㅁ로 한다."},{"id":"D","text":"불빛은 가변백색의 고정된 단방향등으로 한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-176","number":176,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":53,"source_question_number":43,"question":"활주로 상의 잠시대기 AAS 나타내기 위하여 사용되는 1&1180 light2] 색깔은?","choices":[{"id":"A","text":"White"},{"id":"B","text":"Yellow"},{"id":"C","text":"Red"},{"id":"D","text":"Green"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-177","number":177,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":54,"source_question_number":44,"question":"201.(010 controlled 186078)이 운용되는 시간은 가장 최근 작동시간부터 얼마 동안인가?","choices":[{"id":"A","text":"10분"},{"id":"B","text":"15분"},{"id":"C","text":"20분"},{"id":"D","text":"25분"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-178","number":178,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":54,"source_question_number":45,"question":"","choices":[{"id":"A","text":"ilot controlled lighting(PCL)o]"},{"id":"B","text":"한 설명 중 틀린 것은?"},{"id":"C","text":"실용적, 경제적 이유로 작동시키면 18분 후에 자동으로 AAC."},{"id":"D","text":"저광도로 설정하기 위해서는 마이크 키를 7H 눌러 먼저 고광도 등화로 만들어야 한다. © 마이크 키를 2번 누르면 저광도, 5번 누르면 중광도로 설정된다. @ 시각진입각지시등(4ㅠ481)과 활주로말단식별등(1011.)의 등화를 PLCE 조절할 수 WES 항도 있다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-179","number":179,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":54,"source_question_number":46,"question":"비행장등화의 점등에 관한 설명 중 옮지 않은 것은?","choices":[{"id":"A","text":""},{"id":"B","text":"간에 항공기가 이륙한 후 최소한 SBT ASS 계속한다."},{"id":"C","text":""},{"id":"D","text":"간에 항공기가 착륙한 후 최소한 10분간 ASS 계속한다. @IFR 기상상태에서 항공기가 이착륙하는 경우 점등한다. @ 야간에 항공기가 이착륙하는 경우 점등한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-180","number":180,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":54,"source_question_number":47,"question":"민간 SPH BAS 의미하는 비행장등대의 색은?","choices":[{"id":"A","text":"White and Green"},{"id":"B","text":"White and Yellow"},{"id":"C","text":"White and Red"},{"id":"D","text":"Green and Red"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-181","number":181,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":54,"source_question_number":48,"question":"비행장등대의 색으로 틀린 것은?","choices":[{"id":"A","text":"육상비행장 : 백색 1개, 녹색 1개"},{"id":"B","text":"수상비행장 : 백색 1개, 황색 1개"},{"id":"C","text":"군비행장 : 백색 2개, 녹색 1개"},{"id":"D","text":"헬기비행장 : 백색 1, 녹색 1, 적색 1"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-182","number":182,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":54,"source_question_number":49,"question":"민간 비행장등대의 색깔로 맞는 것은?","choices":[{"id":"A","text":"녹색 - 육상비행장"},{"id":"B","text":"황색 - 수상비행장"},{"id":"C","text":"백색, 녹색 - 육상비행장"},{"id":"D","text":"황색 - 육상비행장"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-183","number":183,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":55,"source_question_number":50,"question":"주간에 비행장등대(31700 beacon)7} 작동하고 있을","choices":[{"id":"A","text":"예상되는 기상은?"},{"id":"B","text":"지상시정 3마일 미만, 운고(661108) 1,.000피트 미만"},{"id":"C","text":"지상시정 5마일 미만, 운고(601108)"},{"id":"D","text":"지상시정 3마일 미만, 운고(661108)"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-184","number":184,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":55,"source_question_number":51,"question":"공항에 접근 중 주간임에도 불구하고 공항등대가 작동되고 있는 것을 보았다. 이는 무엇을 의미하는가? 앵 등급 공역에서 비행시정이 3마일 미만, 실링 1.500피트 미만임","choices":[{"id":"A","text":"B, 0등급 공역에서 지상시정이 3마일 미만, 실링"},{"id":"B","text":"공항 관제지역"},{"id":"C","text":"에서 운항을 위한 IFR 인가가 요구됨"},{"id":"D","text":"등급 공역에서 시정 제한으로 10 인가가 요구됨"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-185","number":185,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":55,"source_question_number":52,"question":"비행장등대(3670070206 668007)에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"지상시정 3마일 미만, 운고(061108)"},{"id":"C","text":"점등된다."},{"id":"D","text":"G 비행장등대의 운영여부로 IFR 기상상태인지 VFR 기상상태인지를 구별할 수 있다. O Bed, (등급, DEF LESH SAN 주간에 지상시정 및 STS 나타내기 위하여 활용 된다. 앤 비행장에 비행장등대가 점등된 경우 IFRS 접근을 해야 한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-186","number":186,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":55,"source_question_number":53,"question":"비행장등대에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"모든 비행장에 설치하여야 한다."},{"id":"C","text":"1분간의 섬광 횟수는 30~40회로 한다."},{"id":"D","text":"비행장 내 또는 비행장 인근의 어두운 지역에 설치한다. @ 불빛은 녹색과 백색의 섬교광 또는 백색의 섬광으로 한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-187","number":187,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":56,"source_question_number":54,"question":"비행장 등대(70[8\\108 008007)의 운용에","choices":[{"id":"A","text":"한 설명 중 맞는 것은?"},{"id":"B","text":"24시간 운용한다."},{"id":"C","text":"일몰시부터 일출시까지 또는 주간에 운고 또는 시정치가 계기비행 최저치 미만일"},{"id":"D","text":"운용한다. @ 일출시부터 일몰시까지의 기간 중 보고된 운고 및 시정치가 계기비행 최저치 미만일 때 운용 한다. @ 관제업무가 ASS 때 일몰시부터 일출시까지 운용한다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-188","number":188,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":56,"source_question_number":55,"question":"유도로등(taxiway edge light)의 색은?","choices":[{"id":"A","text":"청색"},{"id":"B","text":"적색"},{"id":"C","text":"황색"},{"id":"D","text":"녹색"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-189","number":189,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":56,"source_question_number":56,"question":"FES 가장자리에 설치된 항공등화의 색깔은?","choices":[{"id":"A","text":"흰색"},{"id":"B","text":"빨간색"},{"id":"C","text":"녹색"},{"id":"D","text":"파란색"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-190","number":190,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":56,"source_question_number":57,"question":"유도로 600[611100@ light2] 불빛 색은?","choices":[{"id":"A","text":"Blue"},{"id":"B","text":"Yellow"},{"id":"C","text":"Green"},{"id":"D","text":"White"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-191","number":191,"subject":"K-AIM","study_unit":3,"study_unit_title":"공항등화 및 기타 공항 시각보조시설","subunit":{"code":"KAIM-3","title":"공항등화 및 기타 공항 시각보조시설"},"source_pdf_page":56,"source_question_number":58,"question":"계기비행 활주로 및 유도로의 등화 색상으로 틀린 것은?","choices":[{"id":"A","text":"활주로등(40ㅁ\\8” edge light) : 백색"},{"id":"B","text":"활주로중심선등(ㅁ\\040\\8＊ Centerline Light) : 백색, 적색"},{"id":"C","text":"¢=25(Taxiway Edge Light) : 청색"},{"id":"D","text":"정지선등(8602 Bar Light) : 적색 54.€"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공항등화 및 기타 공항 시각보조시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-192","number":192,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":1,"question":"활주로 표지(000\\8*＊10811008)의 색은?","choices":[{"id":"A","text":"White"},{"id":"B","text":"Black"},{"id":"C","text":"Yellow"},{"id":"D","text":"Red"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-193","number":193,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":2,"question":"유도로 34](taxiway markings) 2] 색은?","choices":[{"id":"A","text":"White"},{"id":"B","text":"Grey"},{"id":"C","text":"Yellow"},{"id":"D","text":"Red"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-194","number":194,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":3,"question":"유도로 %%|(taxiway marking) 및 항공기 주기장 3£4| (aircraft stand marking) 2] 색깔 은?","choices":[{"id":"A","text":"적색"},{"id":"B","text":"백색"},{"id":"C","text":"청색"},{"id":"D","text":"황색 <ol> AIM 2-3-2. 공항포장면표지(41700 Pavement Marking) 활주로표지(270ㅁ\\87 marking) 백색이다. 백색 열십자기호에 적색 \"HS 사용하는 병원헬기장 (heliport) 제외한 헬기장의 착륙구역을 나타내는 표지 또한 백색이다. HES, 항공기가 사용하지 않는 지역(폐쇄지역 및 위험지역) 및 정지위치(활주로 상에 있다 하더라도)의 표지는 황색이다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-195","number":195,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":4,"question":"Runway heading] 147“인 경우, runway 718110786은?","choices":[{"id":"A","text":"14"},{"id":"B","text":"15"},{"id":"C","text":"147"},{"id":"D","text":"150"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-196","number":196,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":5,"question":"Heading 053“인 활주로의 활주로 번호는?","choices":[{"id":"A","text":"05"},{"id":"B","text":"06"},{"id":"C","text":"50"},{"id":"D","text":"53"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-197","number":197,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":6,"question":"활주로 %|(runway marking) 숫자의 기준은?","choices":[{"id":"A","text":"True bearing"},{"id":"B","text":"Magnetic bearing"},{"id":"C","text":"Compass bearing"},{"id":"D","text":"Compass heading"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-198","number":198,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":57,"source_question_number":7,"question":"활주로의 양 끝에 숫자 \"09\"와 \"27\"이 표시되어 있는 경우, 이 활주로 번호의 의미는?","choices":[{"id":"A","text":"009°와 027°의 진방위(true direction)"},{"id":"B","text":"090°와 270°의 진방위(true direction)"},{"id":"C","text":"090°와 027°의 자방위(magnetic direction)"},{"id":"D","text":"090°와 270°의 자방위(magnetic direction)"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-199","number":199,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":58,"source_question_number":8,"question":"Non-precision instrument runway 없는 활주로표지(200\\85 marking)=?","choices":[{"id":"A","text":"Runway"},{"id":"B","text":"esignator"},{"id":"C","text":"Centerline marking"},{"id":"D","text":"Side stripe marking @ Aiming point marking"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-200","number":200,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":58,"source_question_number":9,"question":"비정밀 계기활주로 상에 없는 runway marking2?","choices":[{"id":"A","text":"Aiming point, touchdown zone"},{"id":"B","text":"Touchdown zone, threshold marking"},{"id":"C","text":"Side stripe, aiming point"},{"id":"D","text":"Side stripe, touchdown zone"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-201","number":201,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":58,"source_question_number":10,"question":"정밀 계기활주로에만 있는 표지 요소는?","choices":[{"id":"A","text":"Centerline marking"},{"id":"B","text":"Side stripe marking"},{"id":"C","text":"Threshold marking"},{"id":"D","text":"Aiming point marking"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-202","number":202,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":58,"source_question_number":11,"question":"활주로 노견 #A\\(shoulder marking)","choices":[{"id":"A","text":"한 설명 중 맞는 것은?"},{"id":"B","text":"줄무늬는 활주로 중심선에"},{"id":"C","text":"하여 55도 기울어져 설치되어 있다."},{"id":"D","text":"백색이다. @ 폭"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-203","number":203,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":59,"source_question_number":12,"question":"활주로 시단 #%|(threshold marking) =?","choices":[{"id":"A","text":"활주로 SAA"},{"id":"B","text":"칭하여 He 세로줄"},{"id":"C","text":"활주로 중심선에 수직으로 가로줄"},{"id":"D","text":"활주로 중심선에 대칭하여 빗금 @ 활주로 중심선에 대칭하여 격자무늬"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-204","number":204,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":59,"source_question_number":13,"question":"활주로 폭과 활주로 시단 표지의 threshold 81166 수가 잘못 연결된 것은?","choices":[{"id":"A","text":"75 ft - 67H"},{"id":"B","text":"10"},{"id":"C","text":"ft - 874"},{"id":"D","text":"150 ft- 1074 — @ 200 ft - 1674"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-205","number":205,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":59,"source_question_number":14,"question":"Threshold marking의 stripe 수와 활주로 폭으로 틀린 AL?","choices":[{"id":"A","text":"4B - 60 ft"},{"id":"B","text":"6B - 75 ft"},{"id":"C","text":"8% - 100 ft"},{"id":"D","text":"148 - 200 ft"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-206","number":206,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":59,"source_question_number":15,"question":"","choices":[{"id":"A","text":"isplaced threshold= 어떻게 나타내는가?"},{"id":"B","text":"Yellow chevrons pointing towards the threshold point."},{"id":"C","text":"White arrows pointing towards the threshold along the runway."},{"id":"D","text":"A white X on the unusable part of the threshold. @ A longitudinal yellow stripe added to the threshold marking. [EAI 16. 항공기가 242 3A) (demarcation bar) 2} 활주로 개시지점/종료지점(0418018060 threshold) 사이에서 할 수 없는 것은? @ 이륙 @ 활주 @ 착륙활주 @ 착륙"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-207","number":207,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":59,"source_question_number":16,"question":"항 공 기 가 활 주 로 경 계 선 (4e081at10 bar) 과 활주로 개 시 지 점 / 종 료 지 점 (displaced threshold) 사 이","choices":[{"id":"A","text":"서 할 수 없는 것은?"},{"id":"B","text":"이륙"},{"id":"C","text":"활주 6 착 륙 활주"},{"id":"D","text":"착륙"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-208","number":208,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":59,"source_question_number":17,"question":"이설시단(0168018060 threshold)o]","choices":[{"id":"A","text":"한 설명 중 맞는 것은?"},{"id":"B","text":"이륙에 이용할 수 있다."},{"id":"C","text":"착륙에 이용할 수 있다."},{"id":"D","text":"이륙 및 착륙에 이용할 수 있다. @ 착륙 및 지상활주에 이용할 수 있다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-209","number":209,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":60,"source_question_number":18,"question":"이설시단(018018060 threshold) o]","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"Al] (threshold marking) ol] 추가하여 세로방향의 백색 줄무늬(8[2106)로 표시된다."},{"id":"C","text":"이착륙이 가능하다."},{"id":"D","text":"이륙, 지상활주 또는 착륙활주에 이용할 수 있다. @ 착륙은 반대방향으로만 할 수 있다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-210","number":210,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":60,"source_question_number":19,"question":"Aiming point2] 위치는?","choices":[{"id":"A","text":"착륙활주로 시단으로부터 500"},{"id":"B","text":"착륙활주로 시단으로부터"},{"id":"C","text":"착륙활주로 시단으로부터 11500"},{"id":"D","text":"착륙활주로 시단으로부터"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-211","number":211,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":60,"source_question_number":20,"question":"Runway] yellow chevron marking®] 의미하는 것은?","choices":[{"id":"A","text":"Blast"},{"id":"B","text":"ad/Stopway"},{"id":"C","text":""},{"id":"D","text":"isplaced threshold 때 Runway turn pad 해 Runway strips"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-212","number":212,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":60,"source_question_number":21,"question":"Runway marking 중 노란색 갈매기 모양으로 표시되고 지상활주나 이륙, 착륙을 위해서 사용할 수 없으나, 이륙을 단념해야 할 경우에 항공기를 감속시키거나 정지시키기 위하여 추가적 인 정지로로 이용할 수 있는 지역은?","choices":[{"id":"A","text":""},{"id":"B","text":"isplaced threshold"},{"id":"C","text":"Taxi, takeoff and takeoff roll-out area"},{"id":"D","text":"Blast pad/Stopway @ Taxiway hold area"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-213","number":213,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":60,"source_question_number":22,"question":"활주로 끝단 부분에 노란색의 갈매기 문양이 그려진 지역이 있다. 이 지역의 SEE 무엇인 가?","choices":[{"id":"A","text":"착륙은 불가능하지만 FS 위해 지상활주를 할 수 있는 지역이다."},{"id":"B","text":""},{"id":"C","text":"형기는 사용할 수 없지만 소형기는 이착륙이 가능한 지역이다."},{"id":"D","text":"비상시를 제외하고 어떠한 경우라도 항공기는 이곳을 사용할 수 없다. @ 활주로에서 방향전환을 하고 이륙을 위해 대기하는 곳이다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-214","number":214,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":61,"source_question_number":23,"question":"Runway threshold 전에 표시된 갈매기 2°(chevron) marking) 2] 의미는?","choices":[{"id":"A","text":"항공기가 이륙하여 일정고도까지 초기 상승하는데 지장이 없도록 하기 위하여 활주로 종단 이 후에 설정된 장방형의 구역을 나타낸다."},{"id":"B","text":"시단이 이설된 활주로를 활주로 앞쪽에 있는 제트분사대, 정지로, 유도로와 구별해 주기 위해 설치된다."},{"id":"C","text":"이륙 시에는 양방향에서, 착륙 시에는 반대방향에서만 사용할 수 있다."},{"id":"D","text":"착륙, 이륙 및 지상활주에 사용할 수 없는 활주로와 정대된 포장지역을 나타낸다. <a> AIM 2-3-3. i. B시 (Demarcation Bar) 1. ZAlal(Demarcation Bar) : 경계선은 이설시단이 있는 활주로를 활주로 앞쪽에 있는 제트분사대 (blast pad), @2|2(stopway) 또는 유도로와 구분한다. 경계선의 폭은 3 ft(1 mole] 활주로 상 에 위치하고 있지 않기 때문에 황색이다. 2. 갈매기형(0116\\ㅠ707) 표지. 이 표지는 착륙, 이륙과 지상활주에 사용할 수 없는 활주로와 일직선인 포장구역을 나타내기 위하여 사용된다. 갈매기형 표지는 황색이다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-215","number":215,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":61,"source_question_number":24,"question":"유도로 마킹(20ㅠ8110ㅁ78) 중 유도로 중심선의 색은?","choices":[{"id":"A","text":"White"},{"id":"B","text":"Yellow"},{"id":"C","text":"Red"},{"id":"D","text":"Black"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-216","number":216,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":61,"source_question_number":25,"question":"Taxiway centerline2] 모양과 색깔은?","choices":[{"id":"A","text":"1줄의 백색 실선"},{"id":"B","text":"1줄의 황색 실선"},{"id":"C","text":"2줄의 백색 점선"},{"id":"D","text":"2줄의 황색 점선"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-217","number":217,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":61,"source_question_number":26,"question":"활주로","choices":[{"id":"A","text":"기지점(ㅁ000\\83*” holding position) 표지의 색깔은?"},{"id":"B","text":"한 줄의 백색 실선과 한 줄의 백색 점선 ＊ 한 줄의 황색 실선과 한 So] 황색 점선"},{"id":"C","text":"두 줄의 백색 실선과 두 줄의 백색 점선"},{"id":"D","text":"F 줄의 황색 실선과 두 줄의 황색 점선"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-218","number":218,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":62,"source_question_number":27,"question":"활주로 정지선(740\\8 hold 1106)의 색깔과 모양을 바르게 설명한 것은?","choices":[{"id":"A","text":"노란색으로 한 줄의 점선과 한 줄의 AMOS 되어 있다."},{"id":"B","text":"노란색으로 두 줄의 실선으로 되어 있다."},{"id":"C","text":"노란색으로 두 줄의 실선과 두 줄의 점선으로 되어 있다."},{"id":"D","text":"두 줄의 흰색 실선으로 되어 있다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-219","number":219,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":62,"source_question_number":28,"question":"Runway holding position markingo]","choices":[{"id":"A","text":"한 설명 중 잘못된 것은? B® 항공기가 정지해야 하는 지점을 나타낸다. 낸 두 줄의 실선과 점선으로 된 네 줄의 황색선이다."},{"id":"B","text":"ANS 항상 항공기가 정지해야 쪽에 위치한다."},{"id":"C","text":"Hold Short of Runway XX 지시를 받은 경우, main gear7}"},{"id":"D","text":"기지점을 넘지 않도록 정지 하여야 한다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-220","number":220,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":62,"source_question_number":29,"question":"Hold Short of Runway2} 의미는?","choices":[{"id":"A","text":"항공기의 nose gear7} 활주로 정지위치 표지를 넘어서는 안된다."},{"id":"B","text":"항공기의 main gear7} 활주로 정지위치 표지를 넘어서는 안된다."},{"id":"C","text":"항공기의 (311 860[100이 활주로 정지위치 표지를 넘어서는 안된다."},{"id":"D","text":"항공기의 어느 부분도 활주로 정지위치 BAS 넘어서는 안된다. <해설〉 AIM 2-3-5. a. 3422.4) 2]의2]3£2](Runway Holding Position Markings) 1. 활주로에서 이 표지는 항공기가 활주로로 접근할 때 정지해야 하는 지점을 나타낸다. 활주로정지위 치표지는 6 in 또는 12 in 간격의 두 줄의 실선과 두 줄의 점선으로 된 네 줄의 황색선으로 이루어지 며. FER 또는 활주로를 가로질러 설치된다. AMS 항상 항공기가 정지해야 하는 쪽에 위치한다. 2. &00가 \"11010 short 0} (활주로 xx 접근구역)^의 특정한 AAS 하였다면, 조종사는 항공기의 어느 BEE 정지위치표지를 넘지 않도록 정지하여야 한다."}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-221","number":221,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":62,"source_question_number":30,"question":"VOR Receiver Checkpoint 표지판 글자의 색은?","choices":[{"id":"A","text":"적색바탕에 백색글자"},{"id":"B","text":"백색바탕에 적색글자"},{"id":"C","text":"황색바탕에 흑색글자"},{"id":"D","text":"흑색바탕에 황색글자 <at> ICAO Annex 14,"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-222","number":222,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":62,"source_question_number":31,"question":"활주로 끝단에 황색의 \"※ 자가 표시되어 있는 것을 보았다. 이는 무엇을 의미하는가?","choices":[{"id":"A","text":"임시 say 활주로"},{"id":"B","text":"영구 페쇄 활주로"},{"id":"C","text":"착륙 금지구역"},{"id":"D","text":"이륙 금지구역 <at> AIM 2-3-6,-e. 임시폐쇄 활주로와 유도로(''60100181117 Closed Runways and Taxiway) 조종사에게 활주로가 임시로 폐쇄되었다는 시각적인 지시를 제공하기 위하여 활주로 각 끝 부분에만 활주로에 십자형기호가 표시된다. 27.)"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-223","number":223,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":63,"source_question_number":32,"question":"공항 표지판 중 mandatory instruction sign2] 색깔은?","choices":[{"id":"A","text":"황색 바탕에 흑색 글자"},{"id":"B","text":"흑색 바탕에 황색 글자"},{"id":"C","text":"적색 바탕에 백색 글자"},{"id":"D","text":"백색 바탕에 적색 글자"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-224","number":224,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":63,"source_question_number":33,"question":"Holding position sign2] 색은?","choices":[{"id":"A","text":"황색 바탕에 흑색 문자"},{"id":"B","text":"흑색 바탕에 황색 문자"},{"id":"C","text":"적색 바탕에 백색 문자"},{"id":"D","text":"백색 바탕에 적색 문자"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-225","number":225,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":63,"source_question_number":34,"question":"명령지시 표지판(0ㅁ280ㅁ08[01*” instruction sign)o]","choices":[{"id":"A","text":"한 설명 중 맞는 것은?"},{"id":"B","text":"항공기가 활주로를 빠져나가는 출구 및 유도로로 진입하기 위한 입구의 위치 표시"},{"id":"C","text":"항공기나 차량이 관제사 허가가 있어야 AMS 수 있는 구역의 위치 표시"},{"id":"D","text":"활주로를 이탈하는 교차지점에 설치 @ 특정 위치 또는 경로를 나타내는 것이 운항상 필요한 곳에 설치 [문제] 85. 공항 표지 중 BFS, critical area EE 항공기 진입 금지구역의 입구에 적색바탕에 흰색 문자나 숫자로 표기하는 공항 표지는? @ Mandatory instruction sign @ Location sign © Direction sign @ Information sign"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-226","number":226,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":63,"source_question_number":35,"question":"공항 표지 중 활주로, critical area 또는 항공기 진입 금 지 구 역 의 YTA 적 색 바 탕","choices":[{"id":"A","text":"흰색 문 자 나 숫 자 로 표 기 하는 공항 표 지 는?"},{"id":"B","text":"b Mandatory instruction sign"},{"id":"C","text":"Location sign"},{"id":"D","text":"Direction sign @ Information sign"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-227","number":227,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":63,"source_question_number":36,"question":"비행장 HA|(airport sign) 2] 색깔에","choices":[{"id":"A","text":"한 설명 틀린 것은?"},{"id":"B","text":"활주로"},{"id":"C","text":"기지점 표시(ㅁ10\\8” holding position 8187)는 백색 바탕에 적색 글자이다."},{"id":"D","text":"위치 표시(100860100 signs)= 검정 바탕에 황색 글자이다. 대 목적지 표시(0686108110ㅁ 8187)는 황색 바탕에 검정 글자이다. @ 방향 표시(011760[10ㅁ sign) 황색 바탕에 검정 글자이다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-228","number":228,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":63,"source_question_number":37,"question":"아래 그림과 같은 공항 표지판의 Ste?","choices":[{"id":"A","text":"Location sign"},{"id":"B","text":"Mandatory instruction sign T"},{"id":"C","text":""},{"id":"D","text":"irection sign @® Destination sign"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-229","number":229,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":64,"source_question_number":38,"question":"위치 표시 부판(10086ㅁ07 8187)의 색깔은?","choices":[{"id":"A","text":"검은색 바탕에 백색 글자"},{"id":"B","text":"백색 바탕에 검은색 글자"},{"id":"C","text":"검은색 바탕에 황색 글자"},{"id":"D","text":"황색 바탕에 검은색 글자"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-230","number":230,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":64,"source_question_number":39,"question":"Location sign] 표지판 색깔은?","choices":[{"id":"A","text":"황색 바탕, 흑색"},{"id":"B","text":"용, 흑색 테두리"},{"id":"C","text":"황색 바탕, 흑색"},{"id":"D","text":"용, 황색 테두리 @ 흑색 바탕, 황색 내용. 백색 테두리 @ 흑색 바탕, 황색 내용, 황색 테두리"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-231","number":231,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":64,"source_question_number":40,"question":"비행장에 설치하는 표지판(3171610 sign)o]","choices":[{"id":"A","text":"한 설명 중 잘못된 것은?"},{"id":"B","text":"진입금지 표지판(20 entry sign)S 유도로의 양쪽에 위치한다."},{"id":"C","text":"명령지시 #2]¥(mandatory instruction sign) 백색바탕에 적색문자로 구성한다."},{"id":"D","text":"위치 표지판(10081107ㅁ sign) = 일시정지 위치에 설치한다. @® 위치 표지판(1008110ㅁ sign)-& 흑색바탕에 황색문자로 구성한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-232","number":232,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":64,"source_question_number":41,"question":"황색바탕에 흑색문자로 되어있으며, 선회방향을 나타내는 화살표가 함께 표시되어 있는 표 지판은?","choices":[{"id":"A","text":"Location sign"},{"id":"B","text":"Information sign"},{"id":"C","text":""},{"id":"D","text":"estination sign @ Direction sign"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-233","number":233,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":64,"source_question_number":42,"question":"관제탑에서 보이지 않는 지역, 적용 가능한 무선주파수 그리고 소음경감 절차 등과 같은 정 보를 조종사에게 제공하기 위하여 설치하는 표지는?","choices":[{"id":"A","text":"위치 표지(100810100ㅁ sign)"},{"id":"B","text":"목적지 표지(0686108110ㅁ sign)"},{"id":"C","text":"방향 표지(011760[10ㅁ sign)"},{"id":"D","text":"정보 #2\\(information sign)"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-234","number":234,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":65,"source_question_number":43,"question":"소음감소 절차 등에 관한 정보가 나타나 eh runway signe?","choices":[{"id":"A","text":""},{"id":"B","text":"estination sign"},{"id":"C","text":"Location sign"},{"id":"D","text":"Information sign @ Mandatory instruction sign"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-235","number":235,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":65,"source_question_number":44,"question":"활주로 잔여거리 표지판의 색깔은?","choices":[{"id":"A","text":"황색 바탕에 검은색 숫자"},{"id":"B","text":"검은색 바탕에 황색 숫자"},{"id":"C","text":"흰색 바탕에 검은색 숫자"},{"id":"D","text":"검은색 바탕에 흰색 숫자"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-236","number":236,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":65,"source_question_number":45,"question":"공항에 착륙하여 활주 중에 검정색 배경에 백색의 숫자 ^2^의 BAS 보았다면, 이는 무엇을 의미하는가?","choices":[{"id":"A","text":"ZEAE touchdown 0010[에서"},{"id":"B","text":"활주로의 잔여거리가 2,000피트 남았다."},{"id":"C","text":"활주로를 이탈하기 위한 FES ASS 의미한다."},{"id":"D","text":"활주로의 ASS 의미한다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-237","number":237,"subject":"K-AIM","study_unit":4,"study_unit_title":"비행장 표지시설","subunit":{"code":"KAIM-4","title":"비행장 표지시설"},"source_pdf_page":65,"source_question_number":46,"question":"활주로 상에서 볼 수 있는 다음 그림과 SS sign] 의미는?","choices":[{"id":"A","text":"활주로의 잔여거리가 3,000 ft 남았다는 것을 의미한다."},{"id":"B","text":"Touchdown point] 3,000 ft 지상 활주했다는 것을 의미한다."},{"id":"C","text":"활주로의 WSS 의미한다."},{"id":"D","text":"활주로를 이탈하기 위한 유도로의 ASS 의미한다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","비행장 표지시설"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-238","number":238,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":74,"source_question_number":1,"question":"(등급 공역에서 VFR 비행을 위한 구름으로부터의 거리는?","choices":[{"id":"A","text":"아래 11000, 위 1,000ft, +3 2,000ft"},{"id":"B","text":"아래 5006, 2"},{"id":"C","text":"아래 500, 위"},{"id":"D","text":"아래 1,000ft, 위 500, 수평 22000"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-239","number":239,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":74,"source_question_number":2,"question":"10,000 [이상의 등급 공역에서 VFR 비행시 최저비행시정은?","choices":[{"id":"A","text":"3SM"},{"id":"B","text":"4SM"},{"id":"C","text":"5SM"},{"id":"D","text":"6SM"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-240","number":240,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":74,"source_question_number":3,"question":"등급 S49 10,000f MSL 이상 고도에서 VFR 비행 시 구름으로부터의 거리는?","choices":[{"id":"A","text":"아래 500ft, 위 1,000ft, 수평 2,000ft"},{"id":"B","text":"아래 1,000ft, 위 500ft, == 2,000ft"},{"id":"C","text":"아래 500ft, 위 1,000ft, 수평 1SM"},{"id":"D","text":"아래 1,000ft, 위"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-241","number":241,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":74,"source_question_number":4,"question":"VFR 순 항 고 도 가 적 용 되는 최 저 고 도 는?","choices":[{"id":"A","text":"1,000 ft"},{"id":"B","text":"2,000 ft"},{"id":"C","text":"3,000 ft"},{"id":"D","text":"4,000 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-242","number":242,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":75,"source_question_number":5,"question":"비행고도 29,000 ft 이상에서 자방위 160°R VFR 비행시 어느 WES 선정하여 비행하여","choices":[{"id":"A","text":"하는가?"},{"id":"B","text":"FL290"},{"id":"C","text":"FL300"},{"id":"D","text":"FL310 ® FL320"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-243","number":243,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":75,"source_question_number":6,"question":"시계비행방식으로 비행방향 180°] 시 359°7}4| 비행시 순항고도로 적당한 것은?","choices":[{"id":"A","text":"25,000 ft"},{"id":"B","text":"26,000 ft"},{"id":"C","text":"26,500 ft"},{"id":"D","text":"27,500 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-244","number":244,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":75,"source_question_number":7,"question":"Magnetic course 240°S VFR 비행시 순항고도로 적합한 것은?","choices":[{"id":"A","text":"3,000 ft"},{"id":"B","text":"3,500 ft"},{"id":"C","text":"4,000 ft"},{"id":"D","text":"4,500 ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-245","number":245,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":75,"source_question_number":8,"question":"4,500 ft2]","choices":[{"id":"A","text":"ES 비행하고 있는 VFR 항공기의 방향으로 맞는 것은?"},{"id":"B","text":"010°"},{"id":"C","text":"090°"},{"id":"D","text":"150° ® 180°"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-246","number":246,"subject":"K-AIM","study_unit":5,"study_unit_title":"공역 일반사항","subunit":{"code":"KAIM-5","title":"공역 일반사항"},"source_pdf_page":75,"source_question_number":9,"question":"다음 중 시계비행 시 고도 8,500 tS 유지할 수 있는 방향은? (단, 자북을 기준으로 한다)","choices":[{"id":"A","text":"0°"},{"id":"B","text":"10°"},{"id":"C","text":"179°"},{"id":"D","text":"180°"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","공역 일반사항"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-247","number":247,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":75,"source_question_number":1,"question":"미국 class A airspace] 고도 범위는?","choices":[{"id":"A","text":"14,500ft MSL~FL600"},{"id":"B","text":"14,500ft MSL~FL800"},{"id":"C","text":"18,000ft MSL~FL600"},{"id":"D","text":"18,000ft MSL~FL800"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-248","number":248,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":75,"source_question_number":2,"question":"우리나라 ASE 공역의 하단","choices":[{"id":"A","text":"EE 얼마인가?"},{"id":"B","text":"14,000ft AGL"},{"id":"C","text":"14,500ft MSL ="},{"id":"D","text":"18,000ft AGL ® 20,000ft MSL"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-249","number":249,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":75,"source_question_number":3,"question":"우리나라 ASH 공역의 고도범위는?","choices":[{"id":"A","text":"평균해면 18,000 초과 40,000 ft 이하의 항로"},{"id":"B","text":"평균해면 18,000 ft 초과 60,000 ft 이하의 항로"},{"id":"C","text":"평균해면 20,000 ft 초과 40,000 ft 이하의 항로"},{"id":"D","text":"평균해면 20,000 ft 초과 60,000 ft 이하의 항로"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-250","number":250,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":76,"source_question_number":4,"question":"다음 중 VFRE 비행할 수 없는 SAL?","choices":[{"id":"A","text":"Class A"},{"id":"B","text":"Class 8"},{"id":"C","text":"Class C"},{"id":"D","text":"Class D"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-251","number":251,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":76,"source_question_number":5,"question":"모든 조종사가 IFRE 비행해야 하는 SAL?","choices":[{"id":"A","text":"ASE 공역"},{"id":"B","text":"BESE 공역"},{"id":"C","text":"(등급 공역"},{"id":"D","text":"등급 공역"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-252","number":252,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":76,"source_question_number":6,"question":"비행을 하기 위해서 계기비행증명을 소지하여야 하는 SAL?","choices":[{"id":"A","text":"ASH 공역"},{"id":"B","text":"등급 공역"},{"id":"C","text":"(등급 공역"},{"id":"D","text":"등급 공역 <at> AIM 3-2-2. ASG $4 (Class A Airspace)"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-253","number":253,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":76,"source_question_number":7,"question":"반드시 계기비행방식에 따라 비행해야 하는 경우가 아닌 것은?","choices":[{"id":"A","text":"천음속으로 비행하는 경우"},{"id":"B","text":"초음속으로 비행하는 경우"},{"id":"C","text":"비행시정이 1,500m 미만인 기상상태에서 비행하는 경우"},{"id":"D","text":"6,100mS 초과하는 고도로 비행하는 경우"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-254","number":254,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":76,"source_question_number":8,"question":"8등급 공역의 입출항 절차에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"계기비행면허를 소지하여야 한다."},{"id":"C","text":"진입 전에 관할 ATC 기관과 무선교신이 이루어져야 한다."},{"id":"D","text":"출항하는 VER 항공기는 등급 SAS 출항하기 위한 인가를 받아야 한다. @ 관할 ATC 기관의 허가가 없는 한, 송수신무선통신기 및 자동고도 보고장치를 갖춘 트랜스폰 더를 구비해야 한다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-255","number":255,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":76,"source_question_number":9,"question":"B등급 공역에서 IFR 비행 시 ATC에 의하여 다른 인가가 없는 한 장착이 요구되는 장비가 아닌 것은?","choices":[{"id":"A","text":"송수신 무선통신기"},{"id":"B","text":"기상 레이더"},{"id":"C","text":"VOR 또는 TACAN 수신기"},{"id":"D","text":"Mode C, 4096 Transponder"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-256","number":256,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":77,"source_question_number":10,"question":"BS 공역에서 19,000 Ibs 이하의 모든 항공기와 VFR 항공기 간의 수직분리 거리는?","choices":[{"id":"A","text":"300 ft"},{"id":"B","text":"500 ft"},{"id":"C","text":"1,000 ft"},{"id":"D","text":"1,200 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-257","number":257,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":77,"source_question_number":11,"question":"Boa 공역에서 VFR 항공기와 무게 19,000 pounds 초과하는 다른 항공기 간의 최저 횡 적분리 간격은?","choices":[{"id":"A","text":"1NM"},{"id":"B","text":"1.5 NM"},{"id":"C","text":"2NM"},{"id":"D","text":"2.5 NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-258","number":258,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":77,"source_question_number":12,"question":"인천 FIR","choices":[{"id":"A","text":"의 등급 공역에서 운항하는 항공기의 10,000ft 이하 고도에서 최대속도는?"},{"id":"B","text":"150KTS"},{"id":"C","text":"200KTS"},{"id":"D","text":"250KTS 해 300KTS [2A 13. 등급 공역 내에서 항공기 운항 시 최대 허용속도는? @ 200KTS 내 230KTS 때 250KTS 해 270KTS"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-259","number":259,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":77,"source_question_number":13,"question":"8 등 급 공역","choices":[{"id":"A","text":""},{"id":"B","text":"서 항공기 운항 시 최대 허 용 속 도 는?"},{"id":"C","text":"200KTS"},{"id":"D","text":"230KTS & 250KTS @ 270KTS"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-260","number":260,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":78,"source_question_number":14,"question":"일반적인 (:등급 공역의 최고 제한고도는?","choices":[{"id":"A","text":"2,500ft"},{"id":"B","text":"4,000ft"},{"id":"C","text":"6,000ft"},{"id":"D","text":"8,000ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-261","number":261,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":78,"source_question_number":15,"question":"공항 반경 5NM 이내 1888 C airspace2] 상부한계는?","choices":[{"id":"A","text":"2,500ft"},{"id":"B","text":"3,000ft"},{"id":"C","text":"4,000ft"},{"id":"D","text":"4,500ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-262","number":262,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":78,"source_question_number":16,"question":"(등급 공역의","choices":[{"id":"A","text":"부 원(1006 circle) 2] 반경은?"},{"id":"B","text":"3NM"},{"id":"C","text":"5NM"},{"id":"D","text":"7NM @ 10NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-263","number":263,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":78,"source_question_number":17,"question":"(등급 공역의 JSF (outer area) 2} 반경은 얼마인가?","choices":[{"id":"A","text":"5NM"},{"id":"B","text":"10NM"},{"id":"C","text":"15NM"},{"id":"D","text":"20NM"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-264","number":264,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":78,"source_question_number":18,"question":"Class 공역에서 항공기를 운항하기 위하여 갖추어야 할 최소 장비는?","choices":[{"id":"A","text":"Two-way communications"},{"id":"B","text":"Two-way communications, Mode C transponder"},{"id":"C","text":"Two-way communications, Mode C transponder, VOR"},{"id":"D","text":"Mode C transponder, DME | <at> AIM 3-2-4. CSF 공역(01888 C Airspace) 1. 정의(0607ㅁ11107). 일반적으로 공항주변의 지표면으로부터 공항표고(차트에는 MSLE 표기) 4,000 ft 상공까지의 공역이다. 각 (등급 SATAY 형태는 서로 다르지만, 일반적으로 공역은 지표면으로부 터 SYED 4,000 ft 상공까지 이어지는 반경 5 NMS] 공항교통구역 중심부(6076 surface area) 2} 공항표고 11200 [에서부터 4,000 ft 상공까지 이어지는 반경 10 341\\의 선반모양의 지역(8}161[ area) 으로 구성된다. 2. 장비(0041000606) 가. SPALGALS-A17] (two-way radio) 나. ATC} 의해 달리 허가되지 않는 한, 자동고도보고장치를 갖춘 사용가능한 레이더비컨 SUAS t\\(radar beacon transponder)"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-265","number":265,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":78,"source_question_number":19,"question":"(등급 공역에서 제공하는 항공교통업무에","choices":[{"id":"A","text":"한 설명으로 맞지 않는 것은?"},{"id":"B","text":"주공항(0ㅁ10481” 8112011)의 모든 항공기 순서 배정"},{"id":"C","text":"계기비행 항공기에"},{"id":"D","text":"한 표준 계기비행 업무 © 계기비행 항공기와 시계비행 항공기 간의 분리. 교통정보 조언 및 안전경고 업무 @ 시계비행 항공기 간의 분리, 교통정보 조언 및 안전경고 업무"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-266","number":266,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":79,"source_question_number":20,"question":"IFR, VFR 운항이 모두 가능하며, VFR 항공기 간을 제외한 모든 항공기 간에 분리업무가 제공되는 공역은?","choices":[{"id":"A","text":"등급 공역"},{"id":"B","text":"0등급 공역"},{"id":"C","text":"등급 공역"},{"id":"D","text":"ESE 공역"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-267","number":267,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":79,"source_question_number":21,"question":"(등급 공역에서 항공기 간의 분리업무에","choices":[{"id":"A","text":"해서 올바르게 설명한 것은?"},{"id":"B","text":"항공기 간의 분리업무는 무선교신과 레이더식별이 이루어진 후에 제공된다."},{"id":"C","text":"VFR 항공기는 VFR, IFR 항공기로부터 분리업무를 제공받는다."},{"id":"D","text":"IFR 항공기는 VFR 항공기로부터 분리업무를 제공받지 못한다. @ 1097 항공기는 다른 IFR 항공기로부터만 분리업무를 제공받는다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-268","number":268,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":79,"source_question_number":22,"question":"(등급 공역에서 제공되는 분리업무가 아닌 것은?","choices":[{"id":"A","text":"1808 항공기 간의 분리업무"},{"id":"B","text":"1808 항공기에게 VFR 항공기 간의 분리업무"},{"id":"C","text":"VFR 항공기 간의 분리업무"},{"id":"D","text":"VFR 항공기에게 IFR 항공기 간의 분리업무"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-269","number":269,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":79,"source_question_number":23,"question":"(:등급 SAA IFR 비행시 항적 분리","choices":[{"id":"A","text":"용으로 맞는 것은?"},{"id":"B","text":"모든 항공기 간 분리"},{"id":"C","text":"다른 1008 항공기로부터 분리"},{"id":"D","text":"다른 188 항공기, VFR 항공기 간 분리 @ 다른 VFR 항공기로부터 분리"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-270","number":270,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":79,"source_question_number":24,"question":"(등급 공역","choices":[{"id":"A","text":"에서의 비행절차로 잘못된 것은?"},{"id":"B","text":"공역 AMA 관할 ATC 반드시 교신을 하여야 한다."},{"id":"C","text":"Radar serviceS 받으면서 비행하는 동안에는 무선교신을 유지할 필요가 없다."},{"id":"D","text":"10,000피트 미만의 고도에서는 지시대기속도 250 knot 이하로 비행하여야 한다. @ 인접공항을 이륙한 항공기는 CSF 공역 BS ATC 기관과 무선교신 및 레이더식별이 이루어 진 후 (등급 업무를 제공받는다."}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-271","number":271,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":80,"source_question_number":25,"question":"일반적인 등급 공역의 상부한계는?","choices":[{"id":"A","text":"E 공 역 의 상 부 한 계 는?"},{"id":"B","text":"1.200ft"},{"id":"C","text":"2,500ft"},{"id":"D","text":"4,000ft @ 5,000ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-272","number":272,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":80,"source_question_number":26,"question":"ㅁ 등 급 공 역 의 목 적 지 로부터 10NM 떨어진 JAAA IFR 비 행 계 획 을 취 소 했다면 언제 관 제 탑 과 교 신 하여야 하는가?","choices":[{"id":"A","text":"SH 공역의 목적지로부터 10NM 떨어진 지점에서 IFR 비행계획을 취소했다면 언제 관 제탑과 교신하여야 하는가?"},{"id":"B","text":"비행계획을 취소한 후 즉시"},{"id":"C","text":"ARTCC7} 조언할"},{"id":"D","text":"@ 등급 공역에 진입하기 5분 전에 @ 등급 공역에 진입하기 전에"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-273","number":273,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":80,"source_question_number":27,"question":"(등급 및","choices":[{"id":"A","text":"SF 공역의 주요 공항으로부터 ANM 이내의"},{"id":"B","text":"100 knot"},{"id":"C","text":"120 knot"},{"id":"D","text":"150 knot @® 200 knot"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-274","number":274,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":80,"source_question_number":28,"question":"Class","choices":[{"id":"A","text":"controlled airspace Wo) 항공기 운항 시 최대 허용속도는?"},{"id":"B","text":"150KTS"},{"id":"C","text":"200KTS"},{"id":"D","text":"230KTS @ 250KTS"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-275","number":275,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":80,"source_question_number":29,"question":"항로지역 등급 공역 Federal airway2] 고도 한계는 얼마인가?","choices":[{"id":"A","text":"700~ 14,000ft"},{"id":"B","text":"1,200~14,000ft"},{"id":"C","text":"700~ 18, 000ft"},{"id":"D","text":"1,200~18,000ft"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-276","number":276,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":81,"source_question_number":30,"question":"미국의 airway 중 고도 14,500부터 18,000 ft 미만인 airway2] airspace classe?","choices":[{"id":"A","text":"Class 8"},{"id":"B","text":"Class C"},{"id":"C","text":"Class"},{"id":"D","text":"@ Class E"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-277","number":277,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":81,"source_question_number":31,"question":"다음 공역에","choices":[{"id":"A","text":"한 설명 중 맞는 것은?"},{"id":"B","text":"우리나라 ASF 공역의 고도는 #ㅁ200~1600 이다"},{"id":"C","text":"BSE SAS 시계비행방식에 의한 비행이 불가능하다"},{"id":"D","text":"(등급 공역에서 운항하는 모든 항공기는 계기비행방식에 따라 운항하여야 한다. @ (등급 공역에 진입하려는 항공기는 항공교통관제기관의 허가를 받은 후에 진입하여야 한다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-278","number":278,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":81,"source_question_number":32,"question":"각 공역 등급별 항공기 간의 분리업무에","choices":[{"id":"A","text":"해 올바르게 설명한 것은? BASH 공역에서는 항공기 간에 분리업무가 제공되지는 않는다."},{"id":"B","text":"등급 공역에서는 1808 항공기만 항공기 간의 분리업무가 제공된다."},{"id":"C","text":"(등급 공역에서는 IFR 항공기에게 VFR 및 다른 IFR 항공기로부터 분리업무가 제공된다."},{"id":"D","text":"등급 공역에서는 VER 항공기에게도 분리업무가 제공된다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-279","number":279,"subject":"K-AIM","study_unit":6,"study_unit_title":"관제공역","subunit":{"code":"KAIM-6","title":"관제공역"},"source_pdf_page":81,"source_question_number":33,"question":"각 공역 등급별로 ASHE 분리업무에","choices":[{"id":"A","text":"한 설명 중 틀린 것은?"},{"id":"B","text":"스등급 : IFR 항공기에만 분리업무가 제공된다."},{"id":"C","text":"BSd : IFR 및 VFR 항공기에게 분리업무가 제공된다."},{"id":"D","text":"Cea: IFR 및 VFR 항공기에게 분리업무가 제공된다. @ 등급 : VFR 항공기에게는 분리업무가 제공되지 않는다."}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","관제공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-280","number":280,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":82,"source_question_number":1,"question":"(등급 공역이란?","choices":[{"id":"A","text":"All controlled airspace"},{"id":"B","text":"All uncontrolled airspace"},{"id":"C","text":"Special use airspace"},{"id":"D","text":"Airport advisory airspace"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-281","number":281,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":82,"source_question_number":2,"question":"다음 중 관제공역에","choices":[{"id":"A","text":"당되지 않는 AL?"},{"id":"B","text":"스등급 공역"},{"id":"C","text":"등급 공역"},{"id":"D","text":"Cea 공역 @ 등급 공역"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-282","number":282,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":82,"source_question_number":3,"question":"Uncontrolled airspace 인 G class airspace","choices":[{"id":"A","text":"서는?"},{"id":"B","text":"VFR flight 만 허용된다."},{"id":"C","text":"IFR flight 만 허용된다."},{"id":"D","text":"VFR/IFR flight 모두 허용된다. 앤 비관제공역이므로 비행이 금지된다."}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-283","number":283,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":82,"source_question_number":4,"question":"등급 공역을 계기비행 시 비행경로로부터 수평거리 4 3044","choices":[{"id":"A","text":"에 있는 가장 높은 장애물로부 터 최소한 얼마"},{"id":"B","text":"VS 유지하여야 하는가?"},{"id":"C","text":"600 ft"},{"id":"D","text":"1,000 ft ® 1,800 ft @ 2,000 ft [2AIS.IFR 비행시 항공로상의 비행고도는 해당지역 내에 위치한 가장 높은 장애물로부터 얼마 이상 을 유지하여야 하는가? @ 150m 내 300m 때 500m 해 1,000m"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-284","number":284,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":82,"source_question_number":5,"question":"IFR 비 행 시 항 공 로 상의 비 행 고 도","choices":[{"id":"A","text":""},{"id":"B","text":"당 지역"},{"id":"C","text":"에 위치한 가장 높은 장"},{"id":"D","text":"물 로부터 얼마 이상 을 유 지 하여야 하는가? @® 150m ® 300m & 500m & 1,000m [ 문 제 16. 비 산 악 지 역 을 FRE 비 행 하는 경우 최 저 비 행 고 도 는? @ 300ft @ 500ft &® 1,000ft &® 1,200ft 10 26 36"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-285","number":285,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":82,"source_question_number":6,"question":"비산악지역을 IFRS 비행하는 경우 최저비행고도는?","choices":[{"id":"A","text":"300ft"},{"id":"B","text":"500ft"},{"id":"C","text":"1,000ft"},{"id":"D","text":"1,200ft"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-286","number":286,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":83,"source_question_number":7,"question":"IFRS 최저고도가 지정되어 있지 않은 산악지역을 비행할","choices":[{"id":"A","text":"장애물을 안전하게 통과할 수 있는 최저고도는?"},{"id":"B","text":"가장 높은 장애물로부터 11000 ft"},{"id":"C","text":"가장 높은 장애물로부터 11500 ft"},{"id":"D","text":"가장 높은 장애물로부터"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-287","number":287,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":83,"source_question_number":8,"question":"비행고도 29,000피트 이상에서 방위 180“에서 359°H 계기 비행하는 항공기의 BADE 는?","choices":[{"id":"A","text":"30.000피트"},{"id":"B","text":"31.000피트"},{"id":"C","text":"32.000피트"},{"id":"D","text":"33,000피트"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-288","number":288,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":83,"source_question_number":9,"question":"1.180~11.240의 고도에서 magnetic heading 090『로 계기 비행하는 항공기가 가장 낮 게 유지할 수 있는 고도는?","choices":[{"id":"A","text":"FLI180"},{"id":"B","text":"FLI185"},{"id":"C","text":"FL190"},{"id":"D","text":"FL195"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-289","number":289,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":83,"source_question_number":10,"question":"FL290 이상의 고도에서 서쪽으로 계기 비행하는 항공기의 순항고도는?","choices":[{"id":"A","text":"FL290"},{"id":"B","text":"FL300"},{"id":"C","text":"FL310"},{"id":"D","text":"FL320"}],"answer":"C","explanation":"교재 페이지 하단 정답표 기준 정답은 C(다)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-290","number":290,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":83,"source_question_number":11,"question":"Magnetic course 240° 방향으로 계기 비행하는 항공기의 WEE?","choices":[{"id":"A","text":"FL300"},{"id":"B","text":"FL320"},{"id":"C","text":"FL330"},{"id":"D","text":"FL350"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-291","number":291,"subject":"K-AIM","study_unit":7,"study_unit_title":"G등급 공역","subunit":{"code":"KAIM-7","title":"G등급 공역"},"source_pdf_page":83,"source_question_number":12,"question":"FL290 미만의 동일항로에서 IFR 비행 시 고도 분리는?","choices":[{"id":"A","text":"500 ft"},{"id":"B","text":"1,000 ft"},{"id":"C","text":"2,000 ft"},{"id":"D","text":"4,000 ft"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","G등급 공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-292","number":292,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":83,"source_question_number":1,"question":"지도상의 \"P-510\" 지역은 FAS 의미하는가?","choices":[{"id":"A","text":"비행금지구역"},{"id":"B","text":"비행제한구역"},{"id":"C","text":"경고구역"},{"id":"D","text":"경계구역"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-293","number":293,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":2,"question":"지도상에 표시된 “R-74\" 공역의 의미는?","choices":[{"id":"A","text":"비행금지구역"},{"id":"B","text":"비행제한구역"},{"id":"C","text":"군작전구역"},{"id":"D","text":"경계구역"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-294","number":294,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":3,"question":"항공사격,","choices":[{"id":"A","text":"공사격 등으로 인한 위험으로부터 항공기의 안전을 보호하거나 그 밖의 이유로 비행허가를 받지 않은 항공기의 비행을 제한하는 공역은?"},{"id":"B","text":"Restricted Area"},{"id":"C","text":""},{"id":"D","text":"rohibited Area 때 Warning Area @ Alert Area"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-295","number":295,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":4,"question":"군 훈련 항공기와 IFR 항공기를 분리시키기 위한 SAL?","choices":[{"id":"A","text":"경고구역"},{"id":"B","text":"경계구역"},{"id":"C","text":"군작전구역(4104)"},{"id":"D","text":"군훈련경로(41101)"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-296","number":296,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":5,"question":"다음 중 군작전공역은?","choices":[{"id":"A","text":"MOA"},{"id":"B","text":"Restricted Area"},{"id":"C","text":"Warning Area"},{"id":"D","text":"Prohibited Area"}],"answer":"A","explanation":"교재 페이지 하단 정답표 기준 정답은 A(가)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":false,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-297","number":297,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":6,"question":"특수사용공역(6060181 use airspace)°] 아닌 것은?","choices":[{"id":"A","text":"경고구역"},{"id":"B","text":"제한구역"},{"id":"C","text":"통제사격구역"},{"id":"D","text":"비행조언구역"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-298","number":298,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":7,"question":"다음 중 특별사용공역이 아닌 것은?","choices":[{"id":"A","text":""},{"id":"B","text":"rohibited area"},{"id":"C","text":"Alert area"},{"id":"D","text":"Warning area ® Controlled area"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-299","number":299,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":8,"question":"사용목적에 따른 공역의 구분에","choices":[{"id":"A","text":"한 다음 설명 중 틀린 것은?"},{"id":"B","text":"비행금지공역: 안전, 국방상 그 밖의 이유로 항공기의 비행을 금지하는 공역"},{"id":"C","text":"비행제한공역: BAA,"},{"id":"D","text":"공사격 등으로 인한 위험으로부터 항공기의 안전을 보호하거나 그 밖의 이유로 비행허가를 받지 아니한 항공기의 비행을 제한하는 공역 댄 군작전공역: BAS 위하여 설정된 공역으로서 계기비행 항공기로부터 BIS 유지할 필 요가 있는 공역 @ 위험공역: 대규모의 조종사의 훈련이나 비정상 형태의 항공활동이 수행되는 공역"}],"answer":"D","explanation":"교재 페이지 하단 정답표 기준 정답은 D(라)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"},{"id":"K-AIM-300","number":300,"subject":"K-AIM","study_unit":8,"study_unit_title":"특수사용공역","subunit":{"code":"KAIM-8","title":"특수사용공역"},"source_pdf_page":84,"source_question_number":9,"question":"사용목적에 따른 공역의 구분에","choices":[{"id":"A","text":"한 다음 설명 중 틀린 것은?"},{"id":"B","text":"비행금지공역: 안전, 국방상 그 밖의 이유로 항공기의 비행을 금지하는 공역"},{"id":"C","text":"G 비행제한구역: 비참여항공기에게 위험할 수 있는 BES 포함하고 있는 공역"},{"id":"D","text":"군작전공역: 군사작전을 위하여 설정된 공역으로서 계기비행 항공기로부터 분리를 유지할 필 요가 있는 공역 @ 경계공역: 대규모의 조종사의 훈련이나 비정상 형태의 항공활동이 수행되는 공역"}],"answer":"B","explanation":"교재 페이지 하단 정답표 기준 정답은 B(나)입니다.","explanation_language":"ko","reference":"11. 세화 문제집.pdf · 예상문제","requires_figure":false,"figure_refs":[],"images":[],"difficulty":null,"tags":["K-AIM","세화 문제집","특수사용공역"],"extraction_review_required":true,"answer_pending_review":false,"review_status":"initial_300_source_extracted_v11.51_compatible"}];
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
  "K-AIM",
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

const BOOK_SUBJECTS = ["ATP Gleim", "검댕이 항공법규", "항공기상", "항공교통통신", "K-AIM"];
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

    // v11.53 hotfix: K-AIM 300문항을 앱 번들에 직접 포함합니다.
    // 별도 data 파일 fetch에 실패해 K-AIM이 0문항으로 보이던 배포 환경을 우회합니다.
    const existingIds = new Set(bank.map(q => q.id));
    EMBEDDED_KAIM_QUESTIONS.forEach(q => {
      if (!q?.id || existingIds.has(q.id)) return;
      bank.push(q);
      existingIds.add(q.id);
    });

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
      const label = (subject === JEJU_RECALL_SUBJECT || subject === TRINITY_SUBJECT || subject === "K-AIM") ? (unitLabels.get(u) || u) : `SU ${u}`;
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
