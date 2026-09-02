(() => {
  "use strict";

  const VERSION = "11.60.49";
  const TABLE = "personal_theory_notes";
  const DEFAULT_SUBJECTS = [
    "ATP Gleim", "K-AIM", "검댕이 항공법규", "비행이론", "공중항법", "항공기상", "항공교통통신",
    "Jeppesen", "운항기술기준", "기타"
  ];

  const state = {
    notes: [],
    activeId: null,
    draftNew: false,
    dirty: false,
    loading: false,
    query: "",
    subject: "all",
    category: "all",
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const el = (id) => document.getElementById(id);
  const client = () => window.supabaseClient || null;

  async function currentUserId() {
    const profileId = window.PilotBankAuth?.getCurrentProfile?.()?.id;
    if (profileId) return profileId;
    const sb = client();
    if (!sb?.auth) return null;
    try {
      const { data } = await sb.auth.getUser();
      return data?.user?.id || null;
    } catch (_) {
      return null;
    }
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
      }).format(new Date(value));
    } catch (_) {
      return "";
    }
  }

  function normalizeTags(input) {
    const values = Array.isArray(input) ? input : String(input || "").split(/[,#]/g);
    return [...new Set(values.map(v => String(v).trim()).filter(Boolean))].slice(0, 20);
  }

  function mount() {
    const statsCard = el("statsCard");
    if (!statsCard || el("personalTheoryNotesSection")) return;

    const anchor = statsCard.querySelector("#statsSummary")?.parentElement || statsCard.querySelector(".mypage-section");
    const section = document.createElement("section");
    section.id = "personalTheoryNotesSection";
    section.className = "mypage-section personal-theory-notes-section";
    section.innerHTML = `
      <div class="personal-notes-head">
        <div>
          <span class="eyebrow">PERSONAL THEORY NOTES</span>
          <h3>나만의 이론정리</h3>
          <p class="muted">내 계정에만 저장되는 개인 필기노트입니다. 과목·분류·태그로 정리하고 필요한 내용을 빠르게 검색할 수 있습니다.</p>
        </div>
        <div class="row personal-notes-head-actions">
          <button id="personalNoteNewBtn" type="button" class="button">＋ 새 필기노트</button>
          <button id="personalNoteRefreshBtn" type="button" class="button secondary">새로고침</button>
        </div>
      </div>

      <div class="personal-notes-toolbar">
        <label class="personal-notes-search"><span>검색</span><input id="personalNoteSearch" type="search" placeholder="제목, 본문, 태그 검색" autocomplete="off" /></label>
        <label><span>과목</span><select id="personalNoteSubjectFilter"><option value="all">전체 과목</option></select></label>
        <label><span>분류</span><select id="personalNoteCategoryFilter"><option value="all">전체 분류</option></select></label>
      </div>

      <div id="personalNoteStatus" class="personal-note-status muted" aria-live="polite"></div>

      <div class="personal-notes-layout">
        <aside class="personal-notes-sidebar" aria-label="나의 필기노트 목록">
          <div id="personalNoteList" class="personal-note-list"><div class="notice">필기노트를 불러오는 중입니다.</div></div>
        </aside>

        <div class="personal-note-editor-wrap">
          <div id="personalNoteEmpty" class="personal-note-empty">
            <strong>나만의 필기노트를 만들어 보세요.</strong>
            <p>암기 숫자, 법규 조문, 계산 공식, 자주 틀리는 포인트 등을 자유롭게 정리할 수 있습니다.</p>
            <button id="personalNoteEmptyNewBtn" type="button" class="button">첫 노트 만들기</button>
          </div>

          <form id="personalNoteEditor" class="personal-note-editor hidden">
            <div class="personal-note-editor-top">
              <label class="personal-note-title-field"><span>제목</span><input id="personalNoteTitle" maxlength="140" required placeholder="예: RVSM 시험 직전 핵심정리" /></label>
              <label class="personal-note-pin"><input id="personalNotePinned" type="checkbox" /> 상단 고정</label>
            </div>

            <div class="personal-note-meta-grid">
              <label><span>과목</span><input id="personalNoteSubject" list="personalNoteSubjectList" maxlength="80" placeholder="과목을 선택하거나 직접 입력" /></label>
              <label><span>나만의 분류</span><input id="personalNoteCategory" maxlength="80" placeholder="예: 숫자 암기 / 계산 공식" /></label>
              <label class="personal-note-tags-field"><span>태그</span><input id="personalNoteTags" maxlength="240" placeholder="쉼표로 구분 · 예: RVSM, 고도계, 함정" /></label>
            </div>
            <datalist id="personalNoteSubjectList">${DEFAULT_SUBJECTS.map(s => `<option value="${esc(s)}"></option>`).join("")}</datalist>

            <div class="personal-note-formatbar" aria-label="필기 입력 도우미">
              <button type="button" data-note-insert="\n## ">소제목</button>
              <button type="button" data-note-insert="\n• ">목록</button>
              <button type="button" data-note-insert="\n★ 암기: ">★ 암기</button>
              <button type="button" data-note-insert="\n⚠ 함정: ">⚠ 함정</button>
              <button type="button" data-note-insert="\n공식: ">공식</button>
            </div>

            <label class="personal-note-content-field">
              <span>필기 내용</span>
              <textarea id="personalNoteContent" rows="18" maxlength="60000" placeholder="여기에 나만의 이론정리를 작성하세요.\n\n예) 14,000 ft 이상 holding outbound = 1분 30초"></textarea>
            </label>

            <div class="personal-note-editor-actions">
              <span id="personalNoteDirtyState" class="muted">저장됨</span>
              <div class="row">
                <button id="personalNoteCancelBtn" type="button" class="button secondary">취소</button>
                <button id="personalNoteDeleteBtn" type="button" class="button danger-outline hidden">삭제</button>
                <button id="personalNoteSaveBtn" type="submit" class="button">저장</button>
              </div>
            </div>
          </form>
        </div>
      </div>`;

    if (anchor?.nextSibling) anchor.parentNode.insertBefore(section, anchor.nextSibling);
    else statsCard.appendChild(section);

    wireEvents();
    window.PilotBankPersonalTheoryNotes = Object.freeze({
      version: VERSION,
      reload: loadNotes,
      newNote,
      open: openNote,
    });
  }

  function wireEvents() {
    el("personalNoteNewBtn")?.addEventListener("click", newNote);
    el("personalNoteEmptyNewBtn")?.addEventListener("click", newNote);
    el("personalNoteRefreshBtn")?.addEventListener("click", loadNotes);
    el("personalNoteEditor")?.addEventListener("submit", saveActiveNote);
    el("personalNoteCancelBtn")?.addEventListener("click", cancelEdit);
    el("personalNoteDeleteBtn")?.addEventListener("click", deleteActiveNote);
    el("personalNoteSearch")?.addEventListener("input", (event) => { state.query = event.target.value.trim().toLowerCase(); renderList(); });
    el("personalNoteSubjectFilter")?.addEventListener("change", (event) => { state.subject = event.target.value; renderList(); });
    el("personalNoteCategoryFilter")?.addEventListener("change", (event) => { state.category = event.target.value; renderList(); });

    ["personalNoteTitle", "personalNoteSubject", "personalNoteCategory", "personalNoteTags", "personalNoteContent", "personalNotePinned"]
      .forEach(id => el(id)?.addEventListener("input", markDirty));
    el("personalNotePinned")?.addEventListener("change", markDirty);

    document.querySelectorAll("[data-note-insert]").forEach(button => {
      button.addEventListener("click", () => insertAtCursor(button.dataset.noteInsert || ""));
    });

    document.addEventListener("click", (event) => {
      const item = event.target.closest("[data-personal-note-id]");
      if (item) openNote(item.dataset.personalNoteId);
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && !el("personalNoteEditor")?.classList.contains("hidden")) {
        event.preventDefault();
        saveActiveNote(event);
      }
    });

    // 마이페이지를 열 때 최신 노트를 동기화합니다.
    [el("statsBtn"), el("homeMyPageBtn")].filter(Boolean).forEach(button => {
      button.addEventListener("click", () => setTimeout(loadNotes, 0));
    });
  }

  function markDirty() {
    state.dirty = true;
    const target = el("personalNoteDirtyState");
    if (target) target.textContent = "저장되지 않은 변경사항";
  }

  function clearDirty() {
    state.dirty = false;
    const target = el("personalNoteDirtyState");
    if (target) target.textContent = "저장됨";
  }

  function status(message = "", kind = "") {
    const target = el("personalNoteStatus");
    if (!target) return;
    target.textContent = message;
    target.dataset.kind = kind;
  }

  async function loadNotes() {
    if (state.loading) return;
    const sb = client();
    const userId = await currentUserId();
    if (!sb || !userId) {
      state.notes = [];
      renderFilters();
      renderList("로그인 후 나만의 이론정리를 사용할 수 있습니다.");
      status("로그인된 계정이 필요합니다.", "warn");
      return;
    }

    state.loading = true;
    status("필기노트를 불러오는 중…");
    try {
      const { data, error } = await sb
        .from(TABLE)
        .select("id,user_id,title,subject,category,tags,content,is_pinned,created_at,updated_at")
        .eq("user_id", userId)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      state.notes = Array.isArray(data) ? data : [];
      renderFilters();
      renderList();
      status(`${state.notes.length.toLocaleString()}개의 개인 노트를 불러왔습니다.`, "ok");
      if (state.activeId) {
        const current = state.notes.find(note => note.id === state.activeId);
        if (current && !state.dirty) fillEditor(current);
      }
    } catch (error) {
      console.error("[PersonalTheoryNotes] load failed", error);
      const raw = String(error?.message || error || "");
      const hint = /does not exist|schema cache|relation/i.test(raw)
        ? "Supabase SQL을 먼저 실행해 주세요."
        : "잠시 후 다시 시도해 주세요.";
      renderList(`필기노트를 불러오지 못했습니다. ${hint}`);
      status(`불러오기 실패: ${hint}`, "error");
    } finally {
      state.loading = false;
    }
  }

  function filteredNotes() {
    return state.notes.filter(note => {
      if (state.subject !== "all" && (note.subject || "") !== state.subject) return false;
      const cat = note.category || "";
      if (state.category === "uncategorized" && cat) return false;
      if (state.category !== "all" && state.category !== "uncategorized" && cat !== state.category) return false;
      if (!state.query) return true;
      const haystack = [note.title, note.subject, note.category, ...(note.tags || []), note.content].join(" ").toLowerCase();
      return haystack.includes(state.query);
    });
  }

  function renderFilters() {
    const subjects = [...new Set(state.notes.map(n => (n.subject || "").trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b, "ko"));
    const categories = [...new Set(state.notes.map(n => (n.category || "").trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b, "ko"));
    const subjectSelect = el("personalNoteSubjectFilter");
    const categorySelect = el("personalNoteCategoryFilter");
    if (subjectSelect) {
      subjectSelect.innerHTML = `<option value="all">전체 과목</option>${subjects.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}`;
      subjectSelect.value = subjects.includes(state.subject) ? state.subject : "all";
      state.subject = subjectSelect.value;
    }
    if (categorySelect) {
      categorySelect.innerHTML = `<option value="all">전체 분류</option><option value="uncategorized">미분류</option>${categories.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}`;
      categorySelect.value = categories.includes(state.category) || ["all","uncategorized"].includes(state.category) ? state.category : "all";
      state.category = categorySelect.value;
    }
  }

  function renderList(emptyMessage = "") {
    const list = el("personalNoteList");
    if (!list) return;
    if (emptyMessage) {
      list.innerHTML = `<div class="notice">${esc(emptyMessage)}</div>`;
      return;
    }
    const notes = filteredNotes();
    if (!notes.length) {
      list.innerHTML = `<div class="personal-note-list-empty">${state.notes.length ? "조건에 맞는 노트가 없습니다." : "아직 만든 필기노트가 없습니다."}</div>`;
      return;
    }
    list.innerHTML = notes.map(note => {
      const preview = String(note.content || "").replace(/\s+/g, " ").trim().slice(0, 105);
      const tags = (note.tags || []).slice(0, 3);
      return `<button type="button" class="personal-note-item ${note.id === state.activeId ? "active" : ""}" data-personal-note-id="${esc(note.id)}">
        <div class="personal-note-item-title">${note.is_pinned ? `<span title="상단 고정">★</span>` : ""}<strong>${esc(note.title || "제목 없는 노트")}</strong></div>
        <div class="personal-note-item-meta">${note.subject ? `<span>${esc(note.subject)}</span>` : ""}${note.category ? `<span>${esc(note.category)}</span>` : ""}<time>${esc(formatDate(note.updated_at))}</time></div>
        ${preview ? `<p>${esc(preview)}</p>` : `<p class="muted">내용 없음</p>`}
        ${tags.length ? `<div class="personal-note-tag-row">${tags.map(tag => `<span>#${esc(tag)}</span>`).join("")}</div>` : ""}
      </button>`;
    }).join("");
  }

  function confirmDiscard() {
    return !state.dirty || window.confirm("저장하지 않은 변경사항이 있습니다. 변경사항을 버릴까요?");
  }

  function newNote() {
    if (!confirmDiscard()) return;
    state.activeId = null;
    state.draftNew = true;
    showEditor();
    fillEditor({ title: "", subject: "", category: "", tags: [], content: "", is_pinned: false });
    state.dirty = false;
    el("personalNoteDeleteBtn")?.classList.add("hidden");
    const title = el("personalNoteTitle");
    setTimeout(() => title?.focus(), 0);
    renderList();
  }

  function openNote(id) {
    if (!id || id === state.activeId) return;
    if (!confirmDiscard()) return;
    const note = state.notes.find(item => item.id === id);
    if (!note) return;
    state.activeId = id;
    state.draftNew = false;
    showEditor();
    fillEditor(note);
    el("personalNoteDeleteBtn")?.classList.remove("hidden");
    renderList();
  }

  function showEditor() {
    el("personalNoteEmpty")?.classList.add("hidden");
    el("personalNoteEditor")?.classList.remove("hidden");
  }

  function hideEditor() {
    el("personalNoteEditor")?.classList.add("hidden");
    el("personalNoteEmpty")?.classList.remove("hidden");
  }

  function fillEditor(note) {
    el("personalNoteTitle").value = note.title || "";
    el("personalNoteSubject").value = note.subject || "";
    el("personalNoteCategory").value = note.category || "";
    el("personalNoteTags").value = (note.tags || []).join(", ");
    el("personalNoteContent").value = note.content || "";
    el("personalNotePinned").checked = !!note.is_pinned;
    clearDirty();
  }

  function readEditor() {
    return {
      title: el("personalNoteTitle")?.value.trim() || "",
      subject: el("personalNoteSubject")?.value.trim() || "",
      category: el("personalNoteCategory")?.value.trim() || "",
      tags: normalizeTags(el("personalNoteTags")?.value || ""),
      content: el("personalNoteContent")?.value || "",
      is_pinned: !!el("personalNotePinned")?.checked,
    };
  }

  async function saveActiveNote(event) {
    event?.preventDefault?.();
    const sb = client();
    const userId = await currentUserId();
    if (!sb || !userId) {
      status("로그인 후 저장할 수 있습니다.", "error");
      return;
    }
    const payload = readEditor();
    if (!payload.title) {
      status("노트 제목을 입력해 주세요.", "warn");
      el("personalNoteTitle")?.focus();
      return;
    }

    const saveBtn = el("personalNoteSaveBtn");
    saveBtn && (saveBtn.disabled = true);
    status("저장 중…");
    try {
      let saved;
      if (state.activeId && !state.draftNew) {
        const { data, error } = await sb
          .from(TABLE)
          .update(payload)
          .eq("id", state.activeId)
          .eq("user_id", userId)
          .select("id,user_id,title,subject,category,tags,content,is_pinned,created_at,updated_at")
          .single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await sb
          .from(TABLE)
          .insert({ ...payload, user_id: userId })
          .select("id,user_id,title,subject,category,tags,content,is_pinned,created_at,updated_at")
          .single();
        if (error) throw error;
        saved = data;
      }
      state.activeId = saved.id;
      state.draftNew = false;
      const idx = state.notes.findIndex(note => note.id === saved.id);
      if (idx >= 0) state.notes[idx] = saved;
      else state.notes.push(saved);
      state.notes.sort((a,b) => Number(!!b.is_pinned) - Number(!!a.is_pinned) || new Date(b.updated_at) - new Date(a.updated_at));
      clearDirty();
      el("personalNoteDeleteBtn")?.classList.remove("hidden");
      renderFilters();
      renderList();
      status("필기노트를 저장했습니다.", "ok");
    } catch (error) {
      console.error("[PersonalTheoryNotes] save failed", error);
      const raw = String(error?.message || error || "");
      status(/does not exist|schema cache|relation/i.test(raw) ? "저장 실패: v11.60.49 Supabase SQL을 먼저 실행해 주세요." : `저장 실패: ${raw}`, "error");
    } finally {
      saveBtn && (saveBtn.disabled = false);
    }
  }

  async function deleteActiveNote() {
    if (!state.activeId) return;
    const current = state.notes.find(note => note.id === state.activeId);
    if (!window.confirm(`「${current?.title || "이 노트"}」를 삭제할까요? 삭제 후 복구할 수 없습니다.`)) return;
    const sb = client();
    const userId = await currentUserId();
    if (!sb || !userId) return;
    status("삭제 중…");
    try {
      const { error } = await sb.from(TABLE).delete().eq("id", state.activeId).eq("user_id", userId);
      if (error) throw error;
      state.notes = state.notes.filter(note => note.id !== state.activeId);
      state.activeId = null;
      state.draftNew = false;
      state.dirty = false;
      hideEditor();
      renderFilters();
      renderList();
      status("필기노트를 삭제했습니다.", "ok");
    } catch (error) {
      console.error("[PersonalTheoryNotes] delete failed", error);
      status(`삭제 실패: ${String(error?.message || error)}`, "error");
    }
  }

  function cancelEdit() {
    if (!confirmDiscard()) return;
    state.dirty = false;
    state.draftNew = false;
    if (state.activeId) {
      const note = state.notes.find(item => item.id === state.activeId);
      if (note) fillEditor(note);
    } else {
      hideEditor();
    }
    renderList();
    status("");
  }

  function insertAtCursor(text) {
    const area = el("personalNoteContent");
    if (!area) return;
    const start = area.selectionStart ?? area.value.length;
    const end = area.selectionEnd ?? area.value.length;
    area.setRangeText(text, start, end, "end");
    area.focus();
    markDirty();
  }

  const boot = () => {
    mount();
    // 로그인 초기화가 비동기일 수 있으므로 첫 마이페이지 진입 전에도 가볍게 시도합니다.
    setTimeout(() => {
      if (!el("statsCard")?.classList.contains("hidden")) loadNotes();
    }, 300);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
