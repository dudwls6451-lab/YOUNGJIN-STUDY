/* PilotBank v11.60.34 · 교재별 오답 복습 파트/세부 파트 필터 */
(() => {
  const VERSION = "11.60.34";
  const state = {
    subject: null,
    partKey: "all",
    subpartKey: "all",
  };

  const qs = (s) => document.querySelector(s);
  const esc = (value) => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function ensureUi() {
    const panel = qs("#wrongReviewFilterCard .wrong-review-filter-panel");
    const minSelect = qs("#wrongReviewMinCount");
    if (!panel || !minSelect || qs("#wrongReviewPartSelect")) return;

    const partWrap = document.createElement("label");
    partWrap.className = "wrong-review-part-field";
    partWrap.innerHTML = `
      파트
      <select id="wrongReviewPartSelect" aria-label="오답 복습 파트 선택">
        <option value="all">전체 파트</option>
      </select>`;

    const subpartWrap = document.createElement("label");
    subpartWrap.id = "wrongReviewSubpartField";
    subpartWrap.className = "wrong-review-part-field hidden";
    subpartWrap.innerHTML = `
      세부 파트
      <select id="wrongReviewSubpartSelect" aria-label="오답 복습 세부 파트 선택">
        <option value="all">전체 세부 파트</option>
      </select>`;

    panel.insertBefore(partWrap, minSelect.closest("label") || panel.firstChild);
    panel.insertBefore(subpartWrap, minSelect.closest("label") || panel.firstChild);

    qs("#wrongReviewPartSelect")?.addEventListener("change", () => {
      state.partKey = qs("#wrongReviewPartSelect")?.value || "all";
      state.subpartKey = "all";
      populateSubparts();
      updateWrongReviewCountInfo();
    });
    qs("#wrongReviewSubpartSelect")?.addEventListener("change", () => {
      state.subpartKey = qs("#wrongReviewSubpartSelect")?.value || "all";
      updateWrongReviewCountInfo();
    });
  }

  function majorPartDescriptor(q) {
    const su = q?.study_unit;
    const suText = su === 0 || su ? String(su).trim() : "";
    const suTitle = String(q?.study_unit_title || "").trim();
    if (suText) {
      const prefix = /^\d+(?:\.\d+)?$/.test(suText) ? `Study Unit ${suText}` : suText;
      return { key: `su:${suText}`, label: suTitle ? `${prefix} · ${suTitle}` : prefix };
    }

    const bookSection = String(q?.book_section || "").trim();
    if (bookSection) return { key: `section:${bookSection}`, label: bookSection };

    const subCode = String(q?.subunit?.code || "").trim();
    const subTitle = String(q?.subunit?.title || "").trim();
    if (subCode || subTitle) {
      const label = [subCode, subTitle].filter(Boolean).join(" · ");
      return { key: `sub-as-major:${subCode}|${subTitle}`, label };
    }

    return { key: "other", label: "기타 / 파트 미지정" };
  }

  function subpartDescriptor(q) {
    const code = String(q?.subunit?.code || "").trim();
    const title = String(q?.subunit?.title || "").trim();
    if (!code && !title) return null;
    const label = [code, title].filter(Boolean).join(" · ");
    return { key: `sub:${code}|${title}`, label };
  }

  function rowsForSubject(subject, minimum = 1) {
    if (!subject || typeof wrongReviewPool !== "function") return [];
    return wrongReviewPool(subject, minimum);
  }

  function rowsForCurrentFilter(subject = state.subject, minimum = 1) {
    let rows = rowsForSubject(subject, minimum);
    if (state.partKey !== "all") {
      rows = rows.filter(q => majorPartDescriptor(q).key === state.partKey);
    }
    if (state.subpartKey !== "all") {
      rows = rows.filter(q => subpartDescriptor(q)?.key === state.subpartKey);
    }
    return rows;
  }

  function populateParts(subject) {
    ensureUi();
    const select = qs("#wrongReviewPartSelect");
    if (!select) return;
    const rows = rowsForSubject(subject, 1);
    const parts = new Map();
    rows.forEach(q => {
      const d = majorPartDescriptor(q);
      const entry = parts.get(d.key) || { ...d, count: 0 };
      entry.count += 1;
      parts.set(d.key, entry);
    });

    select.innerHTML = `<option value="all">전체 파트 · ${rows.length.toLocaleString()}문제</option>` +
      [...parts.values()].map(p => `<option value="${esc(p.key)}">${esc(p.label)} · ${p.count.toLocaleString()}문제</option>`).join("");
    select.value = "all";
    state.partKey = "all";
    state.subpartKey = "all";
    populateSubparts();
  }

  function populateSubparts() {
    const wrap = qs("#wrongReviewSubpartField");
    const select = qs("#wrongReviewSubpartSelect");
    if (!wrap || !select) return;

    if (state.partKey === "all") {
      wrap.classList.add("hidden");
      select.innerHTML = '<option value="all">전체 세부 파트</option>';
      state.subpartKey = "all";
      return;
    }

    const rows = rowsForSubject(state.subject, 1).filter(q => majorPartDescriptor(q).key === state.partKey);
    const subs = new Map();
    rows.forEach(q => {
      const d = subpartDescriptor(q);
      if (!d) return;
      const entry = subs.get(d.key) || { ...d, count: 0 };
      entry.count += 1;
      subs.set(d.key, entry);
    });

    const values = [...subs.values()];
    if (values.length <= 1) {
      wrap.classList.add("hidden");
      select.innerHTML = '<option value="all">전체 세부 파트</option>';
      state.subpartKey = "all";
      return;
    }

    wrap.classList.remove("hidden");
    select.innerHTML = `<option value="all">전체 세부 파트 · ${rows.length.toLocaleString()}문제</option>` +
      values.map(p => `<option value="${esc(p.key)}">${esc(p.label)} · ${p.count.toLocaleString()}문제</option>`).join("");
    select.value = "all";
    state.subpartKey = "all";
  }

  function selectedPartLabel() {
    const part = qs("#wrongReviewPartSelect");
    const sub = qs("#wrongReviewSubpartSelect");
    const partLabel = state.partKey === "all" ? "전체 파트" : (part?.selectedOptions?.[0]?.textContent || "선택 파트").replace(/\s*·\s*\d[\d,]*문제\s*$/, "");
    const subLabel = state.subpartKey === "all" ? "" : (sub?.selectedOptions?.[0]?.textContent || "선택 세부 파트").replace(/\s*·\s*\d[\d,]*문제\s*$/, "");
    return subLabel ? `${partLabel} › ${subLabel}` : partLabel;
  }

  const originalUpdate = typeof updateWrongReviewCountInfo === "function" ? updateWrongReviewCountInfo : null;
  const originalShow = typeof showWrongReviewFilter === "function" ? showWrongReviewFilter : null;

  function enhancedUpdateWrongReviewCountInfo() {
    if (!wrongReviewSubject || !els?.wrongReviewMinCount) {
      originalUpdate?.();
      return;
    }
    const minimum = Math.max(1, Number(els.wrongReviewMinCount.value) || 1);
    const rows = rowsForCurrentFilter(wrongReviewSubject, minimum);
    const label = selectedPartLabel();
    if (els.wrongReviewCountInfo) {
      els.wrongReviewCountInfo.innerHTML = `<span class="wrong-review-current-part">${esc(label)}</span><span>${rows.length.toLocaleString()}문제</span>`;
    }
    if (els.wrongReviewStartBtn) {
      els.wrongReviewStartBtn.disabled = rows.length === 0;
      els.wrongReviewStartBtn.textContent = rows.length ? `${rows.length.toLocaleString()}문제 복습 시작` : "복습할 오답 없음";
    }
  }

  function enhancedShowWrongReviewFilter(subject) {
    state.subject = subject;
    state.partKey = "all";
    state.subpartKey = "all";
    if (originalShow) originalShow(subject);
    ensureUi();
    populateParts(subject);
    enhancedUpdateWrongReviewCountInfo();
  }

  function enhancedStartWrongReviewSession(subject = wrongReviewSubject, minIncorrect = null) {
    if (!subject) return;
    state.subject = subject;
    const minimum = Math.max(1, Number(minIncorrect ?? els?.wrongReviewMinCount?.value) || 1);
    const pool = rowsForCurrentFilter(subject, minimum);
    const partLabel = selectedPartLabel();

    if (!pool.length) {
      alert(`${subject} · ${partLabel}에서 누적 오답 ${minimum}회 이상인 문제가 없습니다.`);
      enhancedUpdateWrongReviewCountInfo();
      return;
    }

    learningContext = {
      kind: "wrongReview",
      label: `${subject} · ${partLabel} 오답 복습`,
      allowedSubjects: [subject],
      lockedSubject: subject,
      airline: null,
      baseNote: `${partLabel} · 누적 오답 ${minimum}회 이상 · ${pool.length}문제 반복 복습`,
    };
    els.mode.value = "study";
    els.scope.value = "all";
    els.countMode.value = "all";
    els.noFigureOnly.checked = false;
    hideStudySurfaces();
    hideAllHubs();
    startSession(pool, {
      type: "wrongReview",
      reviewMode: "book",
      wrongReviewSubject: subject,
      minIncorrect: minimum,
      wrongReviewPartKey: state.partKey,
      wrongReviewSubpartKey: state.subpartKey,
      wrongReviewPartLabel: partLabel,
    });
  }

  ensureUi();

  // 기존 버튼 이벤트는 함수 이름을 실행 시점에 참조하므로 이 바인딩만 교체하면
  // 기존 흐름/결과 화면/다시 풀기 동작을 유지하면서 파트 필터가 적용됩니다.
  if (typeof updateWrongReviewCountInfo === "function") updateWrongReviewCountInfo = enhancedUpdateWrongReviewCountInfo;
  if (typeof showWrongReviewFilter === "function") showWrongReviewFilter = enhancedShowWrongReviewFilter;
  if (typeof startWrongReviewSession === "function") startWrongReviewSession = enhancedStartWrongReviewSession;

  // 구버전 브라우저 캐시나 동적 교재 버튼에서도 필터 UI를 다시 맞춥니다.
  document.addEventListener("click", (event) => {
    const btn = event.target.closest?.("[data-wrong-review-subject]");
    if (!btn) return;
    queueMicrotask(() => {
      if (wrongReviewSubject === btn.dataset.wrongReviewSubject) {
        state.subject = wrongReviewSubject;
        populateParts(wrongReviewSubject);
        enhancedUpdateWrongReviewCountInfo();
      }
    });
  });

  console.info(`[PilotBank] wrong-review part filter v${VERSION} ready`);
})();
