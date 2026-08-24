const APP_VERSION = "10.0";
const DATA_PATH = "./data/questions.json";
const STORAGE_KEY = "pilotQuestionBankProgressV2";

const SUBJECTS = [
  "ATP Gleim",
  "항공기상",
  "공중항법",
  "비행이론",
  "항공법규",
  "항공교통통신정보업무",
];

const els = {
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
  start: document.querySelector("#startBtn"),
  bankInfo: document.querySelector("#bankInfo"),
  resetProgress: document.querySelector("#resetProgressBtn"),
  quizCard: document.querySelector("#quizCard"),
  resultCard: document.querySelector("#resultCard"),
  statsCard: document.querySelector("#statsCard"),
  statsBtn: document.querySelector("#statsBtn"),
  closeStats: document.querySelector("#closeStatsBtn"),
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
let progressStore = loadProgress();

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressStore));
}

function getRecord(id) {
  const defaults = {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    lastResult: null,
    lastAnswer: null,
    lastAttempted: null,
    favorite: false,
    examExcluded: false,
  };

  progressStore[id] = { ...defaults, ...(progressStore[id] || {}) };
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
    const res = await fetch(DATA_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    bank = Array.isArray(data) ? data : (data.questions || []);
    els.bankInfo.textContent = `총 ${bank.length.toLocaleString()}문제`;
    populateSubjects();
  } catch (err) {
    els.bankInfo.textContent = "문제 데이터를 불러오지 못했습니다. GitHub Pages 또는 로컬 HTTP 서버에서 실행하세요.";
    console.error(err);
  }
}

function populateSubjects() {
  els.subject.innerHTML = `<option value="">전체 과목</option>` +
    SUBJECTS.map(s => {
      const count = bank.filter(q => (q.subject || "미분류") === s).length;
      const suffix = count ? ` (${count})` : "";
      return `<option value="${escapeHtml(s)}">${escapeHtml(s + suffix)}</option>`;
    }).join("");
  populateStudyUnits();
}

function populateStudyUnits() {
  const subject = els.subject.value;
  let filtered = bank;
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
  const rec = progressStore[q.id] ? getRecord(q.id) : {};
  switch (els.scope.value) {
    case "wrong": return (rec.incorrect || 0) > 0;
    case "favorite": return !!rec.favorite;
    case "examExcluded": return !!rec.examExcluded;
    case "unseen": return !rec.attempts;
    default: return true;
  }
}

function getFilteredBank() {
  const subject = els.subject.value;
  const unit = els.studyUnit.value;
  const selectedSubunits = getSelectedSubunits();

  return bank.filter(q => {
    if (subject && (q.subject || "미분류") !== subject) return false;
    if (unit && studyUnitOf(q) !== unit) return false;

    if (selectedSubunits.length) {
      const key = `${subunitCode(q)}||${subunitTitle(q)}`;
      if (!selectedSubunits.includes(key)) return false;
    }

    if (!matchesScope(q)) return false;
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

function startSession(source = null) {
  let pool = source || getFilteredBank();

  // "!"로 표시한 문제는 학습모드에는 남아 있지만 시험모드에서는 출제하지 않습니다.
  if (els.mode.value === "exam") {
    pool = pool.filter(q => !getRecord(q.id).examExcluded);
  }

  if (!pool.length) {
    alert(els.mode.value === "exam"
      ? "시험모드에서 출제할 문제가 없습니다. ! 표시된 제외 문제를 확인해 주세요."
      : "출제할 문제가 없습니다.");
    return;
  }

  let requested;
  if (els.countMode.value === "all") {
    requested = pool.length;
  } else if (els.countMode.value === "custom") {
    requested = Math.max(1, Number(els.count.value) || 20);
  } else {
    requested = Math.max(1, Number(els.countMode.value) || 20);
  }

  session = shuffle(pool).slice(0, Math.min(requested, pool.length));
  index = 0;
  correctCount = 0;
  wrongQuestions = [];
  examAnswers = {};

  els.resultCard.classList.add("hidden");
  els.statsCard.classList.add("hidden");
  els.quizCard.classList.remove("hidden");

  renderQuestion();
  els.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderQuestion() {
  answered = false;
  const q = session[index];

  els.progress.textContent = `${index + 1} / ${session.length}`;
  els.score.textContent = els.mode.value === "exam" ? "시험모드" : `정답 ${correctCount}`;
  els.question.textContent = q.question || "(문제 없음)";
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";

  const pills = [q.id, q.subject, studyUnitOf(q) ? `SU ${studyUnitOf(q)}` : "", [subunitCode(q), subunitTitle(q)].filter(Boolean).join(" ")].filter(Boolean);
  els.meta.innerHTML = pills.map(p => `<span class="pill">${escapeHtml(p)}</span>`).join("");

  const rec = getRecord(q.id);
  els.favorite.textContent = rec.favorite ? "★" : "☆";
  els.favorite.classList.toggle("active", rec.favorite);

  els.examExclude.textContent = "!";
  els.examExclude.classList.toggle("exclude-active", !!rec.examExcluded);
  els.examExclude.title = rec.examExcluded
    ? "시험모드 출제 제외됨 · 클릭하면 해제"
    : "시험모드 출제 제외 · 학습모드에는 계속 표시";
  els.examExclude.setAttribute("aria-pressed", rec.examExcluded ? "true" : "false");

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

    if (els.mode.value === "exam" && existing === choice.id) btn.classList.add("selected");

    btn.addEventListener("click", () => {
      if (els.mode.value === "exam") selectExamAnswer(choice.id);
      else answerStudy(choice.id, btn);
    });

    els.choices.appendChild(btn);
  });

  if (els.mode.value === "exam") {
    els.next.textContent = index === session.length - 1 ? "시험 제출" : "다음 문제";
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
}

function nextQuestion() {
  if (els.mode.value === "study" && !answered) return;

  if (els.mode.value === "exam" && index === session.length - 1) {
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
  els.resultText.textContent = `${session.length}문제 중 ${correctCount}문제 정답 · ${pct}% · 오답 ${wrongQuestions.length}문제`;

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
        </div>
      `;
    }).join("");
  }

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
  els.examExclude.setAttribute("aria-pressed", rec.examExcluded ? "true" : "false");

  updateAvailableCount();
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
    const rec = progressStore[q.id] ? getRecord(q.id) : {};
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

  const records = bank.map(q => ({ q, rec: progressStore[q.id] ? getRecord(q.id) : null }))
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
  const ok = confirm("오답노트, 정답률, 즐겨찾기, 시험모드 제외 표시를 포함한 모든 학습기록을 초기화할까요?");
  if (!ok) return;
  progressStore = {};
  localStorage.removeItem(STORAGE_KEY);
  updateAvailableCount();
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

function bindEvents() {
  els.subject?.addEventListener("change", populateStudyUnits);
  els.studyUnit?.addEventListener("change", populateSubunits);
  els.selectAllSubunits?.addEventListener("click", selectAllSubunits);
  els.clearSubunits?.addEventListener("click", clearSubunits);
  els.scope?.addEventListener("change", updateAvailableCount);
  els.mode?.addEventListener("change", updateAvailableCount);
  els.countMode?.addEventListener("change", () => {
    els.customCountWrap?.classList.toggle("hidden", els.countMode.value !== "custom");
    updateAvailableCount();
  });
  els.start?.addEventListener("click", () => startSession());
  els.next?.addEventListener("click", nextQuestion);
  els.favorite?.addEventListener("click", toggleFavorite);
  els.examExclude?.addEventListener("click", toggleExamExcluded);

  els.retryWrong?.addEventListener("click", () => {
    const wrong = [...wrongQuestions];
    els.countMode.value = "all";
    els.customCountWrap.classList.add("hidden");
    startSession(wrong);
  });

  els.restart?.addEventListener("click", () => {
    els.resultCard.classList.add("hidden");
    window.scrollTo({top:0, behavior:"smooth"});
  });

  els.statsBtn?.addEventListener("click", showStats);
  els.closeStats?.addEventListener("click", () => els.statsCard.classList.add("hidden"));
  els.resetProgress?.addEventListener("click", resetProgress);
}

bindEvents();
loadBank();
