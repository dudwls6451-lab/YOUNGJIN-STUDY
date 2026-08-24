const DATA_PATH = "./data/questions.json";

const els = {
  files: document.querySelector("#jsonFiles"),
  duplicateMode: document.querySelector("#duplicateMode"),
  strict: document.querySelector("#strictValidation"),
  merge: document.querySelector("#mergeBtn"),
  status: document.querySelector("#status"),
  previewCard: document.querySelector("#previewCard"),
  summary: document.querySelector("#summary"),
  previewBody: document.querySelector("#previewBody"),
  download: document.querySelector("#downloadBtn"),
};

let baseDocument = null;
let mergedDocument = null;

async function loadBase() {
  const res = await fetch(DATA_PATH, { cache: "no-store" });
  if (!res.ok) throw new Error(`기존 문제은행 로드 실패: HTTP ${res.status}`);
  const raw = await res.json();
  baseDocument = normalizeDocument(raw);
  setStatus(`기존 문제은행: ${baseDocument.questions.length.toLocaleString()}문제`);
}

function normalizeDocument(raw) {
  if (Array.isArray(raw)) {
    return {
      metadata: { name: "Question Bank", version: "1.0", app_format: "github-question-bank-v2" },
      questions: raw,
    };
  }
  if (!raw || typeof raw !== "object") throw new Error("JSON 최상위는 객체 또는 배열이어야 합니다.");
  return { ...raw, metadata: { ...(raw.metadata || {}) }, questions: Array.isArray(raw.questions) ? raw.questions : [] };
}

function normalizeChoices(q) {
  if (Array.isArray(q.choices)) {
    return q.choices.map((c, i) => ({
      id: String(c.id ?? String.fromCharCode(65 + i)).toUpperCase(),
      text: String(c.text ?? c),
    }));
  }
  if (q.choices && typeof q.choices === "object") {
    return Object.entries(q.choices).map(([id, text]) => ({ id: String(id).toUpperCase(), text: String(text) }));
  }
  return [];
}

function validateQuestion(q, indexLabel) {
  const errors = [];
  if (!q || typeof q !== "object") return [`${indexLabel}: 문제 객체가 아닙니다.`];
  if (!q.id) errors.push(`${indexLabel}: id 없음`);
  if (!q.question) errors.push(`${indexLabel}: question 없음`);
  if (!q.answer) errors.push(`${indexLabel}: answer 없음`);
  const choices = normalizeChoices(q);
  if (choices.length < 2) errors.push(`${indexLabel}: choices가 2개 미만`);
  if (q.answer && choices.length) {
    const ids = choices.map(c => c.id);
    if (!ids.includes(String(q.answer).toUpperCase())) errors.push(`${indexLabel}: answer(${q.answer})가 choices에 없음`);
  }
  return errors;
}

function normalizeQuestion(q) {
  return { ...q, id: String(q.id).trim(), answer: String(q.answer || "").trim().toUpperCase(), choices: normalizeChoices(q) };
}

async function readUploadedFiles() {
  const files = [...els.files.files];
  if (!files.length) throw new Error("추가할 JSON 파일을 선택하세요.");
  const docs = [];
  for (const file of files) {
    const text = await file.text();
    let raw;
    try { raw = JSON.parse(text); } catch { throw new Error(`${file.name}: 올바른 JSON이 아닙니다.`); }
    docs.push({ name: file.name, document: normalizeDocument(raw) });
  }
  return docs;
}

async function mergeFiles() {
  try {
    els.merge.disabled = true;
    setStatus("병합 중...");
    if (!baseDocument) await loadBase();

    const uploads = await readUploadedFiles();
    const strict = els.strict.checked;
    const duplicateMode = els.duplicateMode.value;

    const map = new Map();
    const baseQuestions = baseDocument.questions.map(normalizeQuestion);
    baseQuestions.forEach(q => map.set(q.id, q));

    let added = 0, replaced = 0, skipped = 0, incoming = 0;
    const validationErrors = [];

    for (const upload of uploads) {
      upload.document.questions.forEach((rawQ, i) => {
        incoming++;
        const label = `${upload.name} #${i + 1}`;
        const errors = validateQuestion(rawQ, label);
        if (errors.length) {
          validationErrors.push(...errors);
          if (strict) return;
        }
        if (!rawQ?.id) return;
        const q = normalizeQuestion(rawQ);
        if (map.has(q.id)) {
          if (duplicateMode === "replace") { map.set(q.id, q); replaced++; }
          else skipped++;
        } else {
          map.set(q.id, q); added++;
        }
      });
    }

    if (strict && validationErrors.length) {
      throw new Error(`필수 항목 검사에서 ${validationErrors.length}개 오류가 발견되었습니다.\n\n` +
        validationErrors.slice(0,20).join("\n") +
        (validationErrors.length > 20 ? `\n... 외 ${validationErrors.length - 20}개` : ""));
    }

    const questions = [...map.values()];
    mergedDocument = {
      ...baseDocument,
      metadata: {
        ...(baseDocument.metadata || {}),
        app_format: "github-question-bank-v2",
        total_questions: questions.length,
        updated_at: new Date().toISOString(),
      },
      questions,
    };

    renderSummary({base:baseQuestions.length,incoming,added,replaced,skipped,total:questions.length});
    renderPreview(questions);
    els.previewCard.classList.remove("hidden");
    setStatus(`완료: +${added} 추가${replaced ? ` · ${replaced} 교체` : ""}${skipped ? ` · ${skipped} 중복 건너뜀` : ""}`);
    els.previewCard.scrollIntoView({behavior:"smooth",block:"start"});
  } catch (err) {
    console.error(err);
    setStatus(err.message || String(err), true);
  } finally {
    els.merge.disabled = false;
  }
}

function renderSummary(s) {
  const items = [["기존",s.base],["업로드",s.incoming],["신규 추가",s.added],["최종",s.total]];
  els.summary.innerHTML = items.map(([label,value]) => `<div class="summary-box"><span class="muted">${label}</span><strong>${Number(value).toLocaleString()}</strong></div>`).join("");
}

function studyUnitOf(q) {
  return q.study_unit ?? q.studyUnit ?? q.unit ?? (typeof q.subunit?.code === "string" ? q.subunit.code.split(".")[0] : "");
}

function renderPreview(questions) {
  els.previewBody.innerHTML = questions.slice(0,50).map(q => {
    const sub = typeof q.subunit === "string" ? q.subunit : [q.subunit?.code,q.subunit?.title].filter(Boolean).join(" ");
    return `<tr>
      <td>${escapeHtml(q.id)}</td>
      <td>${escapeHtml(q.subject || "")}</td>
      <td>${escapeHtml(studyUnitOf(q) || "")}</td>
      <td>${escapeHtml(sub || q.category || "")}</td>
      <td>${escapeHtml(q.question || "").slice(0,180)}</td>
      <td>${escapeHtml(q.answer || "")}</td>
    </tr>`;
  }).join("");
}

function downloadMerged() {
  if (!mergedDocument) return;
  const blob = new Blob([JSON.stringify(mergedDocument,null,2)], {type:"application/json;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "questions.json";
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function setStatus(message,isError=false) {
  els.status.textContent = message;
  els.status.style.color = isError ? "#c9362b" : "";
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

els.merge.addEventListener("click", mergeFiles);
els.download.addEventListener("click", downloadMerged);
loadBase().catch(err => setStatus(`${err.message}\nGitHub Pages 또는 로컬 HTTP 서버에서 admin.html을 실행하세요.`, true));
