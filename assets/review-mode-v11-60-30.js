/* PilotBank v11.60.30 · 관리자/부관리자 검수 모드 + 2-role approval deployment */
(() => {
  const VERSION = "11.60.30";
  const REF_QUESTION_PATHS = [
    "./data/questions-jeppesen-glossary-v1.json",
    "./data/questions-jeppesen-symbols-v1.json",
    "./data/questions-jeppesen-enroute-v1.json",
    "./data/questions-jeppesen-sidstar-v1.json",
    "./data/questions-jeppesen-airport-v1.json",
    "./data/questions-jeppesen-approach-v1.json",
    "./data/questions-jeppesen-airline-approach-v1.json",
    "./data/questions-jeppesen-us-airport-signs-v1.json",
    "./data/questions-jeppesen-icao-airport-signs-markings-v1.json",
    "./data/questions-jeppesen-vdgs-v1.json",
    "./data/questions-jeppesen-oceanic-long-range-v1.json",
    "./data/questions-jeppesen-ats-route-designators-v1.json",
    "./data/questions-jeppesen-radio-general-v1.json",
    "./data/questions-jeppesen-navigation-aids-v1.json"
  ];

  const state = {
    role: { userId: null, isAdmin: false, isSubadmin: false, canReview: false },
    refsLoaded: false,
    activeTab: "questions",
    questionRows: [],
    questionIndex: 0,
    theoryCache: new Map(),
    activeTheorySubject: "",
    activeTheoryStageIndex: 0,
    proposals: [],
    members: []
  };

  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];
  const esc = value => typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const supabase = () => window.supabaseClient || null;
  const profile = () => window.PilotBankAuth?.getCurrentProfile?.() || null;
  const currentUserId = () => profile()?.id || window.PilotBankAuth?.getCurrentUser?.()?.id || null;
  const roleLabel = () => state.role.isAdmin ? "관리자" : (state.role.isSubadmin ? "부관리자" : "");

  function ensureUi() {
    if (qs("#reviewModeBtn")) return;
    const nav = qs(".nav-row");
    if (nav) {
      const memberBtn = qs("#memberManagementBtn");
      const reviewBtn = document.createElement("button");
      reviewBtn.id = "reviewModeBtn";
      reviewBtn.type = "button";
      reviewBtn.className = "button secondary hidden nav-action";
      reviewBtn.title = "검수 모드";
      reviewBtn.innerHTML = '<span class="nav-icon">✓</span><span class="nav-label">검수 모드</span>';
      const deployBtn = document.createElement("button");
      deployBtn.id = "reviewDeployBtn";
      deployBtn.type = "button";
      deployBtn.className = "button secondary hidden nav-action";
      deployBtn.title = "배포 확인";
      deployBtn.innerHTML = '<span class="nav-icon">⇧</span><span class="nav-label">배포 확인</span><span id="reviewPendingBadge" class="nav-pending-badge hidden">0</span>';
      if (memberBtn) {
        nav.insertBefore(reviewBtn, memberBtn);
        nav.insertBefore(deployBtn, memberBtn);
      } else {
        nav.append(reviewBtn, deployBtn);
      }
    }

    const main = qs("main.container") || qs("main");
    if (main) {
      const card = document.createElement("section");
      card.id = "reviewModeCard";
      card.className = "card review-card hidden";
      card.innerHTML = `
        <div class="section-head">
          <div>
            <span class="eyebrow">REVIEW · NO SCORING</span>
            <h2>검수 모드 <span id="reviewRoleChip" class="review-role-chip"></span></h2>
            <p class="muted">모든 교재의 문제·이론을 점수, 오답, 진도, 학습시간 기록 없이 자유롭게 조회합니다. 수정은 배포안으로만 제출됩니다.</p>
          </div>
          <div class="review-head-actions"><button id="reviewRefreshBtn" class="button secondary" type="button">새로고침</button><button id="reviewCloseBtn" class="button secondary" type="button">닫기</button></div>
        </div>
        <div class="review-tabs">
          <button class="review-tab active" data-review-tab="questions" type="button">문제 검수</button>
          <button class="review-tab" data-review-tab="theory" type="button">이론 검수</button>
          <button class="review-tab" data-review-tab="deploy" type="button">배포 확인</button>
        </div>
        <div id="reviewQuestionsPane"></div>
        <div id="reviewTheoryPane" class="hidden"></div>
        <div id="reviewDeployPane" class="hidden"></div>`;
      main.appendChild(card);
    }

    if (!qs("#reviewEditModal")) {
      const modal = document.createElement("div");
      modal.id = "reviewEditModal";
      modal.className = "review-modal-backdrop hidden";
      modal.innerHTML = '<section class="review-modal"><div class="review-modal-head"><div><span class="eyebrow">REVIEW CHANGE PROPOSAL</span><h2 id="reviewEditTitle">수정안 작성</h2><p id="reviewEditMeta" class="muted"></p></div><button id="reviewEditCloseBtn" class="button secondary" type="button">닫기</button></div><div id="reviewEditBody"></div></section>';
      document.body.appendChild(modal);
    }

    ensureSubadminPanel();
    bindUi();
  }

  function ensureSubadminPanel() {
    const host = qs("#memberManagementCard");
    if (!host || qs("#subadminManagementPanel")) return;
    const panel = document.createElement("section");
    panel.id = "subadminManagementPanel";
    panel.className = "subadmin-panel hidden";
    panel.innerHTML = `
      <div class="section-head"><div><span class="eyebrow">ADMIN · REVIEW ROLE</span><h3>부관리자 설정</h3><p class="muted">승인 회원을 부관리자로 지정하면 검수 모드와 배포 확인 페이지에 접근할 수 있습니다. 일반 관리자 권한은 부여되지 않습니다.</p></div><button id="refreshSubadminsBtn" class="button secondary" type="button">새로고침</button></div>
      <div id="subadminStatus" class="muted"></div><div id="subadminList" class="subadmin-list"></div>`;
    host.appendChild(panel);
  }

  function bindUi() {
    qs("#reviewModeBtn")?.addEventListener("click", () => openReview("questions"));
    qs("#reviewDeployBtn")?.addEventListener("click", () => openReview("deploy"));
    qs("#reviewCloseBtn")?.addEventListener("click", closeReview);
    qs("#reviewRefreshBtn")?.addEventListener("click", refreshCurrentTab);
    qsa("[data-review-tab]").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.reviewTab)));
    qs("#reviewEditCloseBtn")?.addEventListener("click", closeEditModal);
    qs("#reviewEditModal")?.addEventListener("click", event => { if (event.target === qs("#reviewEditModal")) closeEditModal(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !qs("#reviewEditModal")?.classList.contains("hidden")) closeEditModal(); });
    qs("#refreshSubadminsBtn")?.addEventListener("click", loadSubadminMembers);
    qs("#memberManagementBtn")?.addEventListener("click", () => { if (state.role.isAdmin) window.setTimeout(loadSubadminMembers, 100); });
  }

  async function refreshRole() {
    const sb = supabase();
    if (!sb) return false;
    try {
      const { data, error } = await sb.rpc("pilotbank_review_current_role");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      state.role = {
        userId: row?.user_id || currentUserId(),
        isAdmin: !!row?.is_admin,
        isSubadmin: !!row?.is_subadmin,
        canReview: !!row?.can_review
      };
      updateRoleUi();
      return state.role.canReview;
    } catch (err) {
      console.warn("[Review Mode] 역할 조회 실패. v11.60.30 SQL 적용 여부를 확인하세요.", err);
      const p = profile();
      state.role = { userId: currentUserId(), isAdmin: !!p?.is_admin, isSubadmin: false, canReview: false };
      updateRoleUi();
      return false;
    }
  }

  function updateRoleUi() {
    const allowed = !!state.role.canReview;
    qs("#reviewModeBtn")?.classList.toggle("hidden", !allowed);
    qs("#reviewDeployBtn")?.classList.toggle("hidden", !allowed);
    const chip = qs("#reviewRoleChip");
    if (chip) chip.textContent = roleLabel();
    qs("#subadminManagementPanel")?.classList.toggle("hidden", !state.role.isAdmin);
  }

  function hideEverythingForReview() {
    try { setQuizFocus(false); } catch {}
    try { hideStudySurfaces(); } catch {}
    try { hideAllHubs(); } catch {}
    document.body.classList.add("review-mode-active");
    qsa("main > .card").forEach(el => el.classList.add("hidden"));
    qs("#homeHero")?.classList.add("hidden");
    qs("#topProgressCard")?.classList.add("hidden");
  }

  async function openReview(tab = "questions") {
    await refreshRole();
    if (!state.role.canReview) {
      alert("관리자 또는 부관리자 계정에서만 검수 모드를 사용할 수 있습니다. v11.60.30 Supabase SQL 적용 여부도 확인해 주세요.");
      return;
    }
    hideEverythingForReview();
    qs("#reviewModeCard")?.classList.remove("hidden");
    await switchTab(tab);
    qs("#reviewModeCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeReview() {
    qs("#reviewModeCard")?.classList.add("hidden");
    document.body.classList.remove("review-mode-active");
    try { showMainModeHub(); } catch { window.location.hash = ""; window.scrollTo({ top: 0 }); }
  }

  async function switchTab(tab) {
    state.activeTab = ["questions", "theory", "deploy"].includes(tab) ? tab : "questions";
    qsa("[data-review-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.reviewTab === state.activeTab));
    qs("#reviewQuestionsPane")?.classList.toggle("hidden", state.activeTab !== "questions");
    qs("#reviewTheoryPane")?.classList.toggle("hidden", state.activeTab !== "theory");
    qs("#reviewDeployPane")?.classList.toggle("hidden", state.activeTab !== "deploy");
    if (state.activeTab === "questions") await renderQuestionReviewHome();
    if (state.activeTab === "theory") await renderTheoryReviewHome();
    if (state.activeTab === "deploy") await renderDeployHome();
  }

  async function refreshCurrentTab() {
    if (state.activeTab === "questions") { state.refsLoaded = false; await renderQuestionReviewHome(true); }
    if (state.activeTab === "theory") { state.theoryCache.clear(); await renderTheoryReviewHome(true); }
    if (state.activeTab === "deploy") await renderDeployHome();
  }

  async function ensureAllReferenceQuestions(force = false) {
    if (state.refsLoaded && !force) return;
    const ids = new Set((Array.isArray(bank) ? bank : []).map(q => q.id));
    for (const path of REF_QUESTION_PATHS) {
      try {
        const res = await fetch(`${path}?v=${VERSION}&t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) continue;
        const raw = await res.json();
        const rows = Array.isArray(raw) ? raw : (raw.questions || []);
        rows.forEach(q => {
          if (!q?.id || ids.has(q.id)) return;
          try {
            const override = typeof adminQuestionOverrides !== "undefined" ? adminQuestionOverrides.get(q.id) : null;
            if (override && typeof applyQuestionOverrideToQuestion === "function") applyQuestionOverrideToQuestion(q, override);
          } catch {}
          bank.push(q); ids.add(q.id);
        });
      } catch (err) { console.warn("[Review Mode] 참고문항 로드 건너뜀", path, err); }
    }
    state.refsLoaded = true;
  }

  function sortedSubjects() {
    return [...new Set((Array.isArray(bank) ? bank : []).map(q => q.subject || "미분류"))].sort((a,b) => a.localeCompare(b,"ko"));
  }

  async function renderQuestionReviewHome(force = false) {
    const host = qs("#reviewQuestionsPane");
    if (!host) return;
    host.innerHTML = '<div class="notice">모든 교재 문제를 불러오는 중...</div>';
    await ensureAllReferenceQuestions(force);
    const previousSubject = qs("#reviewQuestionSubject")?.value || "all";
    host.innerHTML = `
      <div class="review-toolbar">
        <label>교재<select id="reviewQuestionSubject"><option value="all">전체 교재</option>${sortedSubjects().map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select></label>
        <label>문제 검색<input id="reviewQuestionSearch" type="search" placeholder="문제 ID · 지문 · 해설 검색"></label>
        <div id="reviewQuestionCount" class="review-toolbar-status"></div>
      </div>
      <div class="review-question-shell">
        <label class="admin-edit-field">문항 바로가기<select id="reviewQuestionSelect"></select></label>
        <div id="reviewQuestionViewer"></div>
      </div>`;
    if ([...qs("#reviewQuestionSubject").options].some(o => o.value === previousSubject)) qs("#reviewQuestionSubject").value = previousSubject;
    qs("#reviewQuestionSubject")?.addEventListener("change", filterReviewQuestions);
    let timer = null;
    qs("#reviewQuestionSearch")?.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(filterReviewQuestions, 160); });
    qs("#reviewQuestionSelect")?.addEventListener("change", event => { state.questionIndex = Math.max(0, Number(event.target.value) || 0); renderReviewQuestion(); });
    filterReviewQuestions();
  }

  function filterReviewQuestions() {
    const subject = qs("#reviewQuestionSubject")?.value || "all";
    const term = String(qs("#reviewQuestionSearch")?.value || "").trim().toLowerCase();
    state.questionRows = (Array.isArray(bank) ? bank : []).filter(q => {
      if (subject !== "all" && (q.subject || "미분류") !== subject) return false;
      if (!term) return true;
      const hay = [q.id,q.question,q.explanation,q.subject,q.study_unit_title,q.subunit?.title].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(term);
    });
    state.questionIndex = Math.min(state.questionIndex, Math.max(0, state.questionRows.length - 1));
    const sel = qs("#reviewQuestionSelect");
    if (sel) {
      sel.innerHTML = state.questionRows.map((q,i) => `<option value="${i}">${esc(q.id)} · ${esc(String(q.question || "").slice(0,95))}</option>`).join("");
      sel.value = String(state.questionIndex);
    }
    if (qs("#reviewQuestionCount")) qs("#reviewQuestionCount").textContent = `${state.questionRows.length.toLocaleString()}문항 · 채점 없음`;
    renderReviewQuestion();
  }

  function questionImages(q) {
    const list = [];
    if (Array.isArray(q?.images)) list.push(...q.images);
    if (q?.image) list.push(q.image);
    return [...new Set(list.filter(Boolean))];
  }

  function renderReviewQuestion() {
    const host = qs("#reviewQuestionViewer");
    if (!host) return;
    const q = state.questionRows[state.questionIndex];
    if (!q) { host.innerHTML = '<div class="notice">조건에 맞는 문항이 없습니다.</div>'; return; }
    const choices = typeof normalizeChoices === "function" ? normalizeChoices(q) : (q.choices || []);
    const images = questionImages(q);
    host.innerHTML = `<article class="review-item-card">
      <div class="review-item-meta"><span class="review-pill">${esc(q.subject || "미분류")}</span><span class="review-pill">${esc(q.id || "")}</span>${q.study_unit_title ? `<span class="review-pill">${esc(q.study_unit_title)}</span>` : ""}${q.admin_override ? '<span class="review-pill">배포 수정본 적용</span>' : ""}</div>
      <div class="review-question-text">${esc(q.question || "")}</div>
      ${images.length ? `<div class="review-figure-grid">${images.map(src => `<img src="${esc(src)}" alt="${esc(q.id || "문제")} 그림" loading="lazy">`).join("")}</div>` : ""}
      <div class="review-choice-list">${choices.map(c => `<div class="review-choice ${String(c.id).toUpperCase() === String(q.answer || "").toUpperCase() ? "correct" : ""}"><span class="review-choice-id">${esc(c.id)}</span><span>${esc(c.text)}</span></div>`).join("")}</div>
      <div class="review-answer-box"><strong>정답 ${esc(String(q.answer || "-").toUpperCase())}</strong></div>
      <div class="review-explanation-box"><strong>해설</strong><br>${esc(q.explanation || "(해설 없음)")}</div>
      <div class="review-nav-row"><button id="reviewQuestionPrev" class="button secondary" type="button" ${state.questionIndex <= 0 ? "disabled" : ""}>← 이전</button><div class="review-nav-middle"><span class="muted">${state.questionIndex + 1} / ${state.questionRows.length}</span><button id="reviewQuestionEdit" class="button" type="button">✎ 수정안 작성</button></div><button id="reviewQuestionNext" class="button secondary" type="button" ${state.questionIndex >= state.questionRows.length - 1 ? "disabled" : ""}>다음 →</button></div>
    </article>`;
    qs("#reviewQuestionPrev")?.addEventListener("click", () => moveReviewQuestion(-1));
    qs("#reviewQuestionNext")?.addEventListener("click", () => moveReviewQuestion(1));
    qs("#reviewQuestionEdit")?.addEventListener("click", () => openQuestionProposal(q));
  }

  function moveReviewQuestion(delta) {
    const next = Math.max(0, Math.min(state.questionRows.length - 1, state.questionIndex + delta));
    if (next === state.questionIndex) return;
    state.questionIndex = next;
    if (qs("#reviewQuestionSelect")) qs("#reviewQuestionSelect").value = String(next);
    renderReviewQuestion();
    qs("#reviewQuestionViewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function theorySubjects() {
    try { return Object.keys(THEORY_CONFIG || {}).sort((a,b) => a.localeCompare(b,"ko")); } catch { return []; }
  }

  async function fetchTheoryRaw(subject, force = false) {
    if (!force && state.theoryCache.has(subject)) return state.theoryCache.get(subject);
    const cfg = THEORY_CONFIG?.[subject];
    if (!cfg) throw new Error("이론 설정을 찾을 수 없습니다.");
    let data = null, last = null;
    for (const path of cfg.paths || []) {
      try {
        const res = await fetch(`${path}?v=${VERSION}&t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json(); break;
      } catch (err) { last = err; }
    }
    if (!data) throw last || new Error("이론 JSON 로드 실패");
    await applyPublishedTheoryOverrides(subject, data);
    state.theoryCache.set(subject, data);
    return data;
  }

  async function applyPublishedTheoryOverrides(subject, data) {
    const sb = supabase();
    if (!sb || !Array.isArray(data?.stages)) return data;
    try {
      const { data: rows, error } = await sb.from("theory_overrides").select("stage_id,stage_payload,updated_at").eq("subject", subject);
      if (error) throw error;
      const map = new Map((rows || []).map(r => [String(r.stage_id), r]));
      data.stages = data.stages.map(stage => {
        const row = map.get(String(stage.id));
        if (!row?.stage_payload) return stage;
        return { ...stage, ...row.stage_payload, id: stage.id, review_override: true, review_override_updated_at: row.updated_at };
      });
    } catch (err) { console.warn("[Review Mode] theory_overrides 로드 실패", err); }
    return data;
  }

  async function renderTheoryReviewHome(force = false) {
    const host = qs("#reviewTheoryPane");
    if (!host) return;
    const subjects = theorySubjects();
    if (!subjects.length) { host.innerHTML = '<div class="notice">등록된 이론 과정이 없습니다.</div>'; return; }
    const previous = state.activeTheorySubject && subjects.includes(state.activeTheorySubject) ? state.activeTheorySubject : subjects[0];
    state.activeTheorySubject = previous;
    host.innerHTML = `<div class="review-toolbar"><label>교재 이론<select id="reviewTheorySubject">${subjects.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select></label><label>학습 단계<select id="reviewTheoryStage"></select></label><div id="reviewTheoryStatus" class="review-toolbar-status">모든 단계 잠금 해제 · 진도 기록 없음</div></div><div id="reviewTheoryViewer" class="review-theory-shell"></div>`;
    qs("#reviewTheorySubject").value = previous;
    qs("#reviewTheorySubject")?.addEventListener("change", async event => { state.activeTheorySubject = event.target.value; state.activeTheoryStageIndex = 0; await loadAndRenderTheorySubject(force); });
    qs("#reviewTheoryStage")?.addEventListener("change", event => { state.activeTheoryStageIndex = Math.max(0, Number(event.target.value) || 0); renderReviewTheoryStage(); });
    await loadAndRenderTheorySubject(force);
  }

  async function loadAndRenderTheorySubject(force = false) {
    const status = qs("#reviewTheoryStatus");
    if (status) status.textContent = "이론 데이터를 불러오는 중...";
    try {
      const data = await fetchTheoryRaw(state.activeTheorySubject, force);
      const sel = qs("#reviewTheoryStage");
      if (sel) {
        sel.innerHTML = (data.stages || []).map((s,i) => `<option value="${i}">${i+1}. ${esc(s.title || s.id)}</option>`).join("");
        state.activeTheoryStageIndex = Math.min(state.activeTheoryStageIndex, Math.max(0,(data.stages || []).length-1));
        sel.value = String(state.activeTheoryStageIndex);
      }
      if (status) status.textContent = `${(data.stages || []).length}단계 · 자유 조회 · 채점 없음`;
      renderReviewTheoryStage();
    } catch (err) {
      if (status) status.textContent = `로드 실패: ${err?.message || err}`;
      if (qs("#reviewTheoryViewer")) qs("#reviewTheoryViewer").innerHTML = '<div class="notice">이론 데이터를 불러오지 못했습니다.</div>';
    }
  }

  function theorySectionMarkup(section) {
    let html = `<section class="review-theory-section"><h3>${esc(section?.heading || "")}</h3>`;
    (section?.paragraphs || []).forEach(p => { html += `<p>${esc(p)}</p>`; });
    if (section?.bullets?.length) html += `<ul>${section.bullets.map(v => `<li>${esc(v)}</li>`).join("")}</ul>`;
    if (section?.table?.rows?.length) html += `<div class="review-theory-table-wrap"><table class="review-theory-table"><thead><tr>${(section.table.headers || []).map(v => `<th>${esc(v)}</th>`).join("")}</tr></thead><tbody>${section.table.rows.map(row => `<tr>${row.map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    if (section?.figure?.src) html += `<figure class="review-theory-figure"><img src="${esc(section.figure.src)}" alt="${esc(section.figure.caption || section.heading || "교재 그림")}" loading="lazy"><figcaption>${esc(section.figure.caption || "")}</figcaption></figure>`;
    return html + "</section>";
  }

  function renderReviewTheoryStage() {
    const host = qs("#reviewTheoryViewer");
    const data = state.theoryCache.get(state.activeTheorySubject);
    const stage = data?.stages?.[state.activeTheoryStageIndex];
    if (!host || !stage) { if (host) host.innerHTML = '<div class="notice">선택한 단계가 없습니다.</div>'; return; }
    host.innerHTML = `<article class="review-item-card review-theory-stage">
      <div class="review-item-meta"><span class="review-pill">${esc(state.activeTheorySubject)}</span><span class="review-pill">${esc(stage.id || "")}</span>${stage.review_override ? '<span class="review-pill">배포 수정본 적용</span>' : ""}</div>
      <div><h2>${esc(stage.title || "")}</h2>${stage.unit_title ? `<p class="muted">${esc(stage.unit_title)}</p>` : ""}</div>
      ${(stage.sections || []).map(theorySectionMarkup).join("")}
      ${stage.summary_points?.length ? `<section class="review-summary"><h3>시험 직전 핵심</h3><ul>${stage.summary_points.map(v => `<li>${esc(v)}</li>`).join("")}</ul></section>` : ""}
      <div class="review-nav-row"><button id="reviewTheoryPrev" class="button secondary" type="button" ${state.activeTheoryStageIndex <= 0 ? "disabled" : ""}>← 이전 단계</button><div class="review-nav-middle"><span class="muted">${state.activeTheoryStageIndex+1} / ${(data.stages || []).length}</span><button id="reviewTheoryEdit" class="button" type="button">✎ 이론 수정안 작성</button></div><button id="reviewTheoryNext" class="button secondary" type="button" ${state.activeTheoryStageIndex >= (data.stages || []).length-1 ? "disabled" : ""}>다음 단계 →</button></div>
    </article>`;
    qs("#reviewTheoryPrev")?.addEventListener("click", () => moveTheoryStage(-1));
    qs("#reviewTheoryNext")?.addEventListener("click", () => moveTheoryStage(1));
    qs("#reviewTheoryEdit")?.addEventListener("click", () => openTheoryProposal(state.activeTheorySubject, stage));
  }

  function moveTheoryStage(delta) {
    const data = state.theoryCache.get(state.activeTheorySubject);
    const max = Math.max(0,(data?.stages || []).length-1);
    state.activeTheoryStageIndex = Math.max(0,Math.min(max,state.activeTheoryStageIndex+delta));
    if (qs("#reviewTheoryStage")) qs("#reviewTheoryStage").value = String(state.activeTheoryStageIndex);
    renderReviewTheoryStage();
    qs("#reviewTheoryViewer")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function openEditModal(title, meta, bodyHtml) {
    qs("#reviewEditTitle").textContent = title;
    qs("#reviewEditMeta").textContent = meta;
    qs("#reviewEditBody").innerHTML = bodyHtml;
    qs("#reviewEditModal")?.classList.remove("hidden");
  }
  function closeEditModal() { qs("#reviewEditModal")?.classList.add("hidden"); if (qs("#reviewEditBody")) qs("#reviewEditBody").innerHTML = ""; }

  function openQuestionProposal(q) {
    const choices = typeof normalizeChoices === "function" ? normalizeChoices(q) : (q.choices || []);
    openEditModal("문제 수정안 작성", `${q.subject || ""} · ${q.id || ""}`, `<div class="review-editor">
      <label>변경 요약<input id="reviewProposalSummary" placeholder="예: 선택지 B 오탈자 수정 / 해설 보강"></label>
      <label>문제 지문<textarea id="reviewProposalQuestion" rows="5"></textarea></label>
      <div id="reviewProposalChoices">${choices.map(c => `<label class="review-choice-editor"><strong>${esc(c.id)}</strong><textarea rows="2" data-review-choice="${esc(c.id)}"></textarea></label>`).join("")}</div>
      <label>정답<select id="reviewProposalAnswer">${choices.map(c => `<option value="${esc(c.id)}">${esc(c.id)}</option>`).join("")}</select></label>
      <label>해설<textarea id="reviewProposalExplanation" rows="8"></textarea></label>
      <div class="review-modal-actions"><button id="reviewProposalSubmit" class="button" type="button">배포안 제출</button><button id="reviewProposalCancel" class="button secondary" type="button">취소</button><span id="reviewProposalStatus" class="review-modal-status"></span></div>
    </div>`);
    qs("#reviewProposalQuestion").value = q.question || "";
    choices.forEach(c => { const el = qs(`[data-review-choice="${CSS.escape(String(c.id))}"]`); if (el) el.value = c.text || ""; });
    qs("#reviewProposalAnswer").value = String(q.answer || "").toUpperCase();
    qs("#reviewProposalExplanation").value = q.explanation || "";
    qs("#reviewProposalCancel")?.addEventListener("click", closeEditModal);
    qs("#reviewProposalSubmit")?.addEventListener("click", async () => {
      const payloadChoices = qsa("[data-review-choice]").map(el => ({ id: String(el.dataset.reviewChoice || "").toUpperCase(), text: String(el.value || "").trim() }));
      const payload = {
        question_text: String(qs("#reviewProposalQuestion")?.value || "").trim(),
        choices: payloadChoices,
        answer: String(qs("#reviewProposalAnswer")?.value || "").toUpperCase(),
        explanation: String(qs("#reviewProposalExplanation")?.value || "").trim()
      };
      if (!payload.question_text || payloadChoices.some(c => !c.text) || !payloadChoices.some(c => c.id === payload.answer)) { qs("#reviewProposalStatus").textContent = "지문·선택지·정답을 확인해 주세요."; return; }
      const base = { question_text:q.question || "", choices, answer:String(q.answer||"").toUpperCase(), explanation:q.explanation || "" };
      await submitProposal({ contentType:"question", contentKey:q.id, subject:q.subject || "미분류", stageId:null, payload, baseSnapshot:base, summary:qs("#reviewProposalSummary")?.value || "" });
    });
  }

  function openTheoryProposal(subject, stage) {
    const safeStage = JSON.parse(JSON.stringify(stage));
    delete safeStage.review_override; delete safeStage.review_override_updated_at;
    openEditModal("이론 수정안 작성", `${subject} · ${stage.id || ""}`, `<div class="review-editor">
      <label>변경 요약<input id="reviewProposalSummary" placeholder="예: FIG 설명 보강 / 핵심 수치 정정"></label>
      <label>단계 제목<input id="reviewTheoryEditStageTitle"></label>
      <label>단원 제목<input id="reviewTheoryEditUnitTitle"></label>
      <label>본문 sections JSON<textarea id="reviewTheoryEditSections" rows="18" spellcheck="false"></textarea></label>
      <label>시험 직전 핵심 (한 줄에 한 항목)<textarea id="reviewTheoryEditSummary" rows="7"></textarea></label>
      <p class="muted">본문은 현재 단계의 구조를 그대로 편집합니다. heading / paragraphs / bullets / table / figure 항목을 유지할 수 있습니다.</p>
      <div class="review-modal-actions"><button id="reviewProposalSubmit" class="button" type="button">배포안 제출</button><button id="reviewProposalCancel" class="button secondary" type="button">취소</button><span id="reviewProposalStatus" class="review-modal-status"></span></div>
    </div>`);
    qs("#reviewTheoryEditStageTitle").value = stage.title || "";
    qs("#reviewTheoryEditUnitTitle").value = stage.unit_title || "";
    qs("#reviewTheoryEditSections").value = JSON.stringify(stage.sections || [], null, 2);
    qs("#reviewTheoryEditSummary").value = (stage.summary_points || []).join("\n");
    qs("#reviewProposalCancel")?.addEventListener("click", closeEditModal);
    qs("#reviewProposalSubmit")?.addEventListener("click", async () => {
      let sections;
      try { sections = JSON.parse(qs("#reviewTheoryEditSections")?.value || "[]"); if (!Array.isArray(sections)) throw new Error("sections는 배열이어야 합니다."); }
      catch (err) { qs("#reviewProposalStatus").textContent = `본문 JSON 오류: ${err.message}`; return; }
      const payload = {
        ...safeStage,
        title: String(qs("#reviewTheoryEditStageTitle")?.value || "").trim(),
        unit_title: String(qs("#reviewTheoryEditUnitTitle")?.value || "").trim(),
        sections,
        summary_points: String(qs("#reviewTheoryEditSummary")?.value || "").split(/\r?\n/).map(v => v.trim()).filter(Boolean)
      };
      if (!payload.title) { qs("#reviewProposalStatus").textContent = "단계 제목을 입력해 주세요."; return; }
      await submitProposal({ contentType:"theory", contentKey:`${subject}::${stage.id}`, subject, stageId:stage.id, payload, baseSnapshot:safeStage, summary:qs("#reviewProposalSummary")?.value || "" });
    });
  }

  async function submitProposal({contentType,contentKey,subject,stageId,payload,baseSnapshot,summary}) {
    const sb = supabase();
    const status = qs("#reviewProposalStatus");
    const btn = qs("#reviewProposalSubmit");
    if (!sb) { if (status) status.textContent = "Supabase 연결이 필요합니다."; return; }
    if (btn) btn.disabled = true;
    if (status) status.textContent = "수정안을 제출하는 중...";
    try {
      const { data, error } = await sb.rpc("pilotbank_review_submit_proposal", {
        p_content_type: contentType, p_content_key: contentKey, p_subject: subject,
        p_stage_id: stageId, p_payload: payload, p_base_snapshot: baseSnapshot,
        p_summary: String(summary || "").trim()
      });
      if (error) throw error;
      if (status) status.textContent = `제출 완료 · 배포안 ${String(data || "").slice(0,8)}`;
      await loadProposals();
      window.setTimeout(() => { closeEditModal(); switchTab("deploy"); }, 550);
    } catch (err) {
      if (status) status.textContent = `제출 실패: ${err?.message || err}`;
    } finally { if (btn) btn.disabled = false; }
  }

  async function loadProposals() {
    const sb = supabase();
    if (!sb) return [];
    const { data, error } = await sb.rpc("pilotbank_review_list_proposals");
    if (error) throw error;
    state.proposals = Array.isArray(data) ? data : [];
    updatePendingBadge();
    return state.proposals;
  }

  function updatePendingBadge() {
    const count = state.proposals.filter(p => p.status === "pending").length;
    const badge = qs("#reviewPendingBadge");
    if (!badge) return;
    badge.textContent = String(count);
    badge.classList.toggle("hidden", count <= 0);
  }

  async function renderDeployHome() {
    const host = qs("#reviewDeployPane");
    if (!host) return;
    host.innerHTML = '<div class="notice">배포안을 불러오는 중...</div>';
    try {
      const rows = await loadProposals();
      host.innerHTML = `<div class="section-head"><div><h3>배포 확인</h3><p class="muted">문제·이론 수정안은 관리자 승인 1회와 부관리자 승인 1회가 모두 모인 순간 서버 배포본으로 전환됩니다. 한쪽이 반려하면 배포되지 않습니다.</p></div><button id="reviewDeployRefresh" class="button secondary" type="button">새로고침</button></div><div class="review-deploy-list">${rows.length ? rows.map(proposalMarkup).join("") : '<div class="notice">제출된 수정안이 없습니다.</div>'}</div>`;
      qs("#reviewDeployRefresh")?.addEventListener("click", renderDeployHome);
      qsa("[data-review-approve]").forEach(btn => btn.addEventListener("click", () => decideProposal(btn.dataset.reviewApprove,"approve")));
      qsa("[data-review-reject]").forEach(btn => btn.addEventListener("click", () => decideProposal(btn.dataset.reviewReject,"reject")));
    } catch (err) { host.innerHTML = `<div class="notice">배포안 조회 실패: ${esc(err?.message || err)}</div>`; }
  }

  function proposalMarkup(p) {
    const statusClass = p.status === "published" ? "review-status-published" : (p.status === "rejected" ? "review-status-rejected" : "review-status-pending");
    const statusText = p.status === "published" ? "배포 완료" : (p.status === "rejected" ? "반려" : "승인 대기");
    const mine = p.my_decision || "";
    const pending = p.status === "pending";
    return `<article class="review-proposal">
      <div class="review-proposal-head"><div><div class="review-proposal-title">${esc(p.content_type === "question" ? "문제" : "이론")} · ${esc(p.content_key)}</div><div class="muted">${esc(p.subject || "")} · 제안자 ${esc(p.created_by_name || p.created_by || "")}</div></div><strong class="${statusClass}">${statusText}</strong></div>
      <p>${esc(p.summary || "변경 요약 없음")}</p>
      <div class="review-approval-grid"><span class="review-approval ${p.admin_approved ? "ok" : ""}">관리자 ${p.admin_approved ? "동의 ✓" : "대기"}</span><span class="review-approval ${p.subadmin_approved ? "ok" : ""}">부관리자 ${p.subadmin_approved ? "동의 ✓" : "대기"}</span>${mine ? `<span class="review-approval">내 결정: ${esc(mine === "approve" ? "동의" : "반려")}</span>` : ""}</div>
      <details><summary>수정 내용 보기</summary><pre>${esc(JSON.stringify(p.payload || {}, null, 2))}</pre></details>
      ${pending ? `<div class="review-proposal-actions"><button class="button" data-review-approve="${esc(p.id)}" type="button" ${mine === "approve" ? "disabled" : ""}>동의</button><button class="button danger-outline" data-review-reject="${esc(p.id)}" type="button">반려</button></div>` : ""}
    </article>`;
  }

  async function decideProposal(id, decision) {
    if (!id || !["approve","reject"].includes(decision)) return;
    if (decision === "reject" && !window.confirm("이 수정안을 반려하시겠습니까?")) return;
    const sb = supabase();
    try {
      const { data, error } = await sb.rpc("pilotbank_review_decide_proposal", { p_proposal_id:id, p_decision:decision });
      if (error) throw error;
      const result = String(data || "pending");
      if (result === "published") await refreshPublishedRuntime(id);
      await renderDeployHome();
    } catch (err) { alert(`처리 실패: ${err?.message || err}`); }
  }

  async function refreshPublishedRuntime(proposalId) {
    const proposal = state.proposals.find(p => String(p.id) === String(proposalId));
    if (!proposal) return;
    if (proposal.content_type === "question") {
      try {
        const { data, error } = await supabase().from("question_overrides").select("question_id,subject,question_text,choices,answer,explanation,updated_at,updated_by").eq("question_id", proposal.content_key).single();
        if (error) throw error;
        if (typeof adminQuestionOverrides !== "undefined") adminQuestionOverrides.set(data.question_id, data);
        (bank || []).filter(q => q.id === data.question_id).forEach(q => { try { applyQuestionOverrideToQuestion(q,data); } catch {} });
      } catch (err) { console.warn("[Review Mode] 배포 문항 즉시 동기화 실패",err); }
    } else if (proposal.content_type === "theory") {
      state.theoryCache.delete(proposal.subject);
      try { if (typeof activeTheorySubject !== "undefined" && activeTheorySubject === proposal.subject) theoryData = null; } catch {}
    }
  }

  async function loadSubadminMembers() {
    if (!state.role.isAdmin) return;
    const list = qs("#subadminList"), status = qs("#subadminStatus");
    if (!list) return;
    status.textContent = "회원 역할을 불러오는 중...";
    list.innerHTML = "";
    try {
      const { data, error } = await supabase().rpc("pilotbank_review_members_admin");
      if (error) throw error;
      state.members = Array.isArray(data) ? data : [];
      list.innerHTML = state.members.map(m => `<div class="subadmin-row"><div><strong>${esc(m.username || m.email || m.user_id)}</strong>${m.is_admin ? '<span class="subadmin-role admin">관리자</span>' : (m.is_subadmin ? '<span class="subadmin-role subadmin">부관리자</span>' : "")}<small>${esc(m.email || "")}</small></div>${m.is_admin ? '<span class="muted">관리자 계정</span>' : `<button class="button ${m.is_subadmin ? "secondary" : ""}" data-subadmin-user="${esc(m.user_id)}" data-subadmin-enabled="${m.is_subadmin ? "1" : "0"}" type="button">${m.is_subadmin ? "부관리자 해제" : "부관리자 지정"}</button>`}</div>`).join("") || '<div class="notice">승인 회원이 없습니다.</div>';
      qsa("[data-subadmin-user]").forEach(btn => btn.addEventListener("click", () => setSubadmin(btn.dataset.subadminUser, btn.dataset.subadminEnabled !== "1")));
      status.textContent = `승인 회원 ${state.members.length}명`;
    } catch (err) { status.textContent = `부관리자 목록 조회 실패: ${err?.message || err}`; }
  }

  async function setSubadmin(userId, enabled) {
    if (!state.role.isAdmin) return;
    const action = enabled ? "부관리자로 지정" : "부관리자에서 해제";
    if (!window.confirm(`${action}하시겠습니까?`)) return;
    const status = qs("#subadminStatus");
    try {
      status.textContent = "저장 중...";
      const { error } = await supabase().rpc("pilotbank_set_subadmin", { p_user_id:userId, p_enabled:!!enabled });
      if (error) throw error;
      status.textContent = `${action}했습니다.`;
      await loadSubadminMembers();
    } catch (err) { status.textContent = `저장 실패: ${err?.message || err}`; }
  }

  function installTheoryOverrideHook() {
    try {
      if (window.__pilotbankReviewTheoryHookInstalled || typeof loadTheoryData !== "function") return;
      const original = loadTheoryData;
      loadTheoryData = async function(subject = (typeof activeTheorySubject !== "undefined" ? activeTheorySubject : null) || "항공기상") {
        const data = await original(subject);
        await applyPublishedTheoryOverrides(subject, data);
        return data;
      };
      window.__pilotbankReviewTheoryHookInstalled = true;
    } catch (err) { console.warn("[Review Mode] 이론 배포본 후크 설치 실패", err); }
  }

  async function backgroundInit() {
    ensureUi();
    installTheoryOverrideHook();
    for (let i=0;i<40;i+=1) {
      if (supabase() && (profile() || currentUserId())) { await refreshRole(); break; }
      await new Promise(r => setTimeout(r,250));
    }
    if (state.role.canReview) {
      try { await loadProposals(); } catch {}
      if (state.role.isAdmin && !qs("#memberManagementCard")?.classList.contains("hidden")) loadSubadminMembers();
    }
  }

  window.addEventListener("pilotbank:bank-loaded", () => { state.refsLoaded = false; if (state.activeTab === "questions" && !qs("#reviewModeCard")?.classList.contains("hidden")) renderQuestionReviewHome(); });
  window.addEventListener("focus", () => { if (supabase()) refreshRole(); });
  window.addEventListener("load", backgroundInit, { once:true });
  if (document.readyState === "complete") backgroundInit();
})();
