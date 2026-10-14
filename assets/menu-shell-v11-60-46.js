/* PilotBank v11.60.46 · refined AWOS-inspired menu shell
   Reorganizes existing controls without changing feature logic.
   Adds wordmark branding, clearer menu hierarchy, and spring-like button feedback. */
(() => {
  const VERSION = "11.60.46";
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const GROUP_STATE_KEY = "pilotbank-menu-groups-v116045";
  const MOBILE_BP = 1024;
  let groupObserver = null;
  let headerObserver = null;
  let surfaceObserver = null;
  let syncQueued = false;

  const GROUPS = [
    {
      key: "study",
      label: "문제 학습",
      icon: "✎",
      ids: [
        "studyNavBtn",
        "kotsaQuickMenuBtn",
        "textbookQuickNavBtn",
        "textbookProblemQuickMenuBtn",
        "freeStudyQuickMenuBtn",
        "airlineQuickNavBtn",
        "wrongReviewQuickNavBtn",
      ],
    },
    {
      key: "theory",
      label: "이론 · 참고서",
      icon: "▤",
      ids: [
        "textbookTheoryQuickMenuBtn",
        "aviwikiNavBtn",
        "referenceQuickNavBtn",
        "jeppesenQuickMenuBtn",
        "fsrQuickMenuBtn",
        "icao8168QuickMenuBtn",
        "quickResourceNavBtn",
      ],
    },
    {
      key: "community",
      label: "함께 공부",
      icon: "◎",
      ids: ["studyGroupNavBtn", "rankingNavBtn", "announcementNavBtn"],
    },
    {
      key: "records",
      label: "나의 기록",
      icon: "◉",
      ids: ["statsBtn", "errorsBtn"],
    },
    {
      key: "admin",
      label: "관리",
      icon: "⚙",
      ids: ["memberManagementBtn", "adminErrorReportsBtn", "problemAdminLink"],
    },
  ];

  const SURFACE_ACTIVE_MAP = [
    ["#memberManagementCard", "memberManagementBtn"],
    ["#adminErrorReportsCard", "adminErrorReportsBtn"],
    ["#statsCard", "statsBtn"],
    ["#errorsCard", "errorsBtn"],
    ["#announcementCard", "announcementNavBtn"],
    ["#weeklyRankingCard", "rankingNavBtn"],
    ["#studyGroupCard", "studyGroupNavBtn"],
    ["#resourceViewerCard", "quickResourceNavBtn"],
    ["#resourceLibraryCard", "quickResourceNavBtn"],
    ["#referenceIcao8168Card", "icao8168QuickMenuBtn"],
    ["#referenceFsrCard", "fsrQuickMenuBtn"],
    ["#referenceJeppesenCard", "jeppesenQuickMenuBtn"],
    ["#referenceStudyHubCard", "referenceQuickNavBtn"],
    ["#aviwikiReaderCard", "aviwikiNavBtn"],
    ["#aviwikiHomeCard", "aviwikiNavBtn"],
    ["#wrongReviewFilterCard", "wrongReviewQuickNavBtn"],
    ["#wrongReviewBookHubCard", "wrongReviewQuickNavBtn"],
    ["#wrongReviewHubCard", "wrongReviewQuickNavBtn"],
    ["#airlineHubCard", "airlineQuickNavBtn"],
    ["#theoryCard", "textbookTheoryQuickMenuBtn"],
    ["#bookTheoryHubCard", "textbookTheoryQuickMenuBtn"],
    ["#bookProblemHubCard", "textbookProblemQuickMenuBtn"],
    ["#textbookHubCard", "textbookQuickNavBtn"],
    ["#homeHero", "homeNavBtn"],
    ["#modeHubCard", "studyNavBtn"],
  ];

  function isMobile() {
    return window.innerWidth < MOBILE_BP;
  }

  function currentGroupState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(GROUP_STATE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveGroupState() {
    const state = {};
    GROUPS.forEach(({ key }) => {
      const group = q(`[data-pb-nav-group="${key}"]`);
      if (group) state[key] = !group.classList.contains("is-collapsed");
    });
    try { localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(state)); } catch {}
  }

  function updateBranding() {
    const titleBtn = q("#homeTitleBtn");
    if (titleBtn && (titleBtn.textContent.trim() !== "Aviquestionbank" || !q(".pilotbank-brand-logo", titleBtn))) {
      titleBtn.innerHTML = `<span class="pilotbank-brand-logo">Aviquestionbank</span>`;
      titleBtn.setAttribute("aria-label", "Aviquestionbank 홈으로 이동");
      titleBtn.title = "Aviquestionbank 홈";
    }
    const subtitle = q(".pilotbank-brand-copy .muted");
    if (subtitle) subtitle.remove();
  }

  function makeProxy({ id, icon, label, target, title = label, feature = null }) {
    if (q(`#${id}`)) return q(`#${id}`);
    const nav = q("#primaryFeatureNav");
    if (!nav) return null;
    const btn = document.createElement("button");
    btn.id = id;
    btn.type = "button";
    btn.className = "button secondary nav-action pb-menu-proxy";
    btn.title = title;
    if (feature) btn.dataset.pbFeature = feature;
    btn.dataset.pbSubmenu = "1";
    btn.innerHTML = `<span class="nav-icon" aria-hidden="true">${icon}</span><span class="nav-label">${label}</span>`;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const auth = window.PilotBankAuth;
      if (feature && auth?.getCurrentUser?.() && auth?.canAccessFeature?.(feature) === false) {
        alert("이 계정에는 해당 기능 사용 권한이 없습니다.");
        return;
      }
      const targetEl = q(target);
      if (!targetEl) {
        alert("기능을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setActive(id);
      targetEl.click();
    });
    nav.appendChild(btn);
    return btn;
  }

  function ensureProxyButtons() {
    makeProxy({ id: "kotsaQuickMenuBtn", icon: "✓", label: "면허시험 대비", target: "#kotsaModeBtn", title: "교통안전공단 면허시험 대비", feature: "problem_bank" });
    makeProxy({ id: "textbookProblemQuickMenuBtn", icon: "?", label: "교재 문제 풀이", target: "#textbookProblemBtn", title: "교재별 문제 풀이", feature: "problem_bank" });
    makeProxy({ id: "freeStudyQuickMenuBtn", icon: "∞", label: "자유학습모드", target: "#freeStudyBtn", title: "전체 교재 자유학습", feature: "problem_bank" });
    makeProxy({ id: "textbookTheoryQuickMenuBtn", icon: "▥", label: "교재 이론 학습", target: "#textbookTheoryBtn", title: "교재별 이론 학습", feature: "theory_learning" });
    makeProxy({ id: "jeppesenQuickMenuBtn", icon: "J", label: "Jeppesen Airway Manual", target: "#referenceJeppesenBookBtn", title: "Jeppesen Airway Manual 참고서" });
    makeProxy({ id: "fsrQuickMenuBtn", icon: "F", label: "운항기술기준 · FSR", target: "#referenceFsrBookBtn", title: "고정익항공기를 위한 운항기술기준" });
    makeProxy({ id: "icao8168QuickMenuBtn", icon: "8", label: "ICAO Doc 8168 Vol. I", target: "#referenceIcao8168BookBtn", title: "ICAO Doc 8168 Vol. I · PANS-OPS" });

    try {
      QUIZ_EXIT_TARGETS.set("#kotsaQuickMenuBtn", "면허시험 대비");
      QUIZ_EXIT_TARGETS.set("#textbookProblemQuickMenuBtn", "교재 문제 풀이");
      QUIZ_EXIT_TARGETS.set("#freeStudyQuickMenuBtn", "자유학습모드");
      QUIZ_EXIT_TARGETS.set("#textbookTheoryQuickMenuBtn", "교재 이론 학습");
      QUIZ_EXIT_TARGETS.set("#jeppesenQuickMenuBtn", "Jeppesen Airway Manual");
      QUIZ_EXIT_TARGETS.set("#fsrQuickMenuBtn", "운항기술기준");
      QUIZ_EXIT_TARGETS.set("#icao8168QuickMenuBtn", "ICAO Doc 8168 Vol. I");
    } catch {}
  }

  function setNavLabel(id, label, title = null) {
    const el = q(`#${id}`);
    if (!el) return;
    const labelEl = q(".nav-label", el);
    if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
    if (title && el.title !== title) el.title = title;
  }

  function normalizeLabels() {
    setNavLabel("homeNavBtn", "홈", "홈");
    setNavLabel("studyNavBtn", "학습 허브", "학습 모드 선택");
    setNavLabel("textbookQuickNavBtn", "교재 학습 홈", "각 교재 학습");
    setNavLabel("aviwikiNavBtn", "Aviwiki", "이론 백과사전 · Aviwiki");
    setNavLabel("referenceQuickNavBtn", "참고서 홈", "참고서 학습");
    setNavLabel("airlineQuickNavBtn", "항공사 필기전형", "항공사 필기전형 대비");
    setNavLabel("wrongReviewQuickNavBtn", "오답 복습", "오답 복습");
    setNavLabel("quickResourceNavBtn", "자료실", "자료실");
    setNavLabel("studyGroupNavBtn", "스터디그룹", "스터디그룹");
    setNavLabel("rankingNavBtn", "주간랭킹전", "주간랭킹전");
    setNavLabel("announcementNavBtn", "공지사항", "공지사항");
    setNavLabel("statsBtn", "마이페이지", "마이페이지");
    setNavLabel("errorsBtn", "오류 목록", "오류 목록");
    setNavLabel("memberManagementBtn", "회원 관리", "회원 관리");
    setNavLabel("adminErrorReportsBtn", "보고된 오류", "보고된 오류");
    setNavLabel("problemAdminLink", "문제 추가", "문제 추가");
  }

  function createMenuScaffold() {
    const nav = q("#primaryFeatureNav");
    if (!nav || q("#pilotbankMenuCaption")) return;

    const caption = document.createElement("div");
    caption.id = "pilotbankMenuCaption";
    caption.className = "pb-nav-menu-caption";
    caption.textContent = "Functions";
    nav.prepend(caption);

    const homeSlot = document.createElement("div");
    homeSlot.className = "pb-nav-home-slot";
    homeSlot.dataset.pbNavHome = "1";
    nav.appendChild(homeSlot);

    const stored = currentGroupState();
    GROUPS.forEach(({ key, label, icon }) => {
      const group = document.createElement("section");
      group.className = "pb-nav-group";
      group.dataset.pbNavGroup = key;
      const shouldOpen = stored[key] !== false;
      if (!shouldOpen) group.classList.add("is-collapsed");
      group.innerHTML = `
        <button class="pb-nav-group-toggle" type="button" aria-expanded="${shouldOpen ? "true" : "false"}" data-pb-mainmenu="1">
          <span class="pb-nav-group-icon" aria-hidden="true">${icon}</span>
          <span class="pb-nav-group-title-label">${label}</span>
          <span class="pb-nav-group-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="pb-nav-group-body"><div class="pb-nav-group-body-inner"></div></div>`;
      nav.appendChild(group);
    });
  }

  function markSubmenuItems() {
    qa("#primaryFeatureNav .nav-action, #primaryFeatureNav .pb-menu-proxy").forEach((el) => {
      if (el.id === "homeNavBtn") {
        el.dataset.pbHome = "1";
        delete el.dataset.pbSubmenu;
        return;
      }
      if (!el.closest(".pb-nav-group-body-inner")) return;
      el.dataset.pbSubmenu = "1";
    });
  }

  function moveIntoGroups() {
    const nav = q("#primaryFeatureNav");
    if (!nav) return;
    const homeSlot = q("[data-pb-nav-home]", nav);
    const home = q("#homeNavBtn");
    if (homeSlot && home && home.parentNode !== homeSlot) homeSlot.appendChild(home);

    GROUPS.forEach(({ key, ids }) => {
      const inner = q(`[data-pb-nav-group="${key}"] .pb-nav-group-body-inner`, nav);
      if (!inner) return;
      ids.forEach((id) => {
        const el = q(`#${id}`);
        if (el && el.parentNode !== inner) inner.appendChild(el);
      });
    });
    markSubmenuItems();
  }

  function moveHeaderControls() {
    const slot = q("#pilotbankHeaderMenuSlot");
    const actions = q("#pilotbankHeaderActions");
    const toggle = q("#menuToggleBtn");
    if (slot && toggle && toggle.parentNode !== slot) slot.appendChild(toggle);
    if (!actions) return;
    ["authSessionTimer", "authUserChip", "authLogoutBtn"].forEach((id) => {
      const el = q(`#${id}`);
      if (el && el.parentNode !== actions) actions.appendChild(el);
    });
  }

  function elementMenuVisible(el) {
    if (!el || el.classList.contains("hidden") || el.hidden) return false;
    return el.style.display !== "none";
  }

  function syncGroupVisibility() {
    GROUPS.forEach(({ key, ids }) => {
      const group = q(`[data-pb-nav-group="${key}"]`);
      if (!group) return;
      const hasVisible = ids.some((id) => elementMenuVisible(q(`#${id}`)));
      group.classList.toggle("hidden", !hasVisible);
    });
  }

  function applyProxyFeatureAccess() {
    const auth = window.PilotBankAuth;
    if (!auth?.getCurrentUser?.()) return;
    qa("[data-pb-feature]").forEach((el) => {
      const allowed = auth.canAccessFeature?.(el.dataset.pbFeature) !== false;
      el.classList.toggle("hidden", !allowed);
    });
    syncGroupVisibility();
  }

  function setActive(id) {
    const nav = q("#primaryFeatureNav");
    if (!nav || !id) return;
    qa(".nav-action,.pb-menu-proxy", nav).forEach((el) => {
      if (el.id === id) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    const active = q(`#${id}`, nav);
    const group = active?.closest?.(".pb-nav-group");
    if (group?.classList.contains("is-collapsed") && !document.body.classList.contains("sidebar-collapsed")) {
      group.classList.remove("is-collapsed");
      q(".pb-nav-group-toggle", group)?.setAttribute("aria-expanded", "true");
      saveGroupState();
    }
  }

  function surfaceVisible(selector) {
    const el = q(selector);
    return !!el && !el.classList.contains("hidden") && !el.hidden;
  }

  function syncActiveFromSurfaces() {
    for (const [selector, id] of SURFACE_ACTIVE_MAP) {
      if (surfaceVisible(selector) && q(`#${id}`)) {
        setActive(id);
        return;
      }
    }
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      updateBranding();
      normalizeLabels();
      moveHeaderControls();
      moveIntoGroups();
      applyProxyFeatureAccess();
      syncGroupVisibility();
      syncActiveFromSurfaces();
      if (isMobile()) updateMobileToggleVisual(document.body.classList.contains("pb-mobile-menu-open"));
    });
  }

  function closeMobileMenu() {
    if (!document.body.classList.contains("pb-mobile-menu-open")) return;
    document.body.classList.remove("pb-mobile-menu-open");
    updateMobileToggleVisual(false);
  }

  function updateMobileToggleVisual(open) {
    const btn = q("#menuToggleBtn");
    if (!btn || !isMobile()) return;
    btn.setAttribute("aria-expanded", String(!!open));
    btn.title = open ? "메뉴 닫기" : "메뉴 열기";
    const icon = q(".nav-icon", btn);
    const label = q(".nav-label", btn);
    if (icon && icon.textContent !== (open ? "×" : "☰")) icon.textContent = open ? "×" : "☰";
    if (label && label.textContent !== (open ? "메뉴 닫기" : "메뉴 열기")) label.textContent = open ? "메뉴 닫기" : "메뉴 열기";
  }

  function pulseButton(el) {
    if (!el) return;
    el.classList.remove("is-jelly");
    // force reflow to restart animation
    void el.offsetWidth;
    el.classList.add("is-jelly");
    window.setTimeout(() => el.classList.remove("is-jelly"), 560);
  }

  function installGroupToggleCapture() {
    if (document.documentElement.dataset.pbGroupToggleCapture === "1") return;
    document.documentElement.dataset.pbGroupToggleCapture = "1";
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest?.(".pb-nav-group-toggle");
      if (!toggle) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const group = toggle.closest(".pb-nav-group");
      if (!group) return;
      pulseButton(toggle);
      const collapsed = group.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
      saveGroupState();
    }, true);
  }

  function installMobileDrawer() {
    const toggle = q("#menuToggleBtn");
    const backdrop = q("#pilotbankMenuBackdrop");
    if (!toggle || toggle.dataset.pbDrawerBound === "1") return;
    toggle.dataset.pbDrawerBound = "1";
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!isMobile()) {
        const collapsed = document.body.classList.toggle("sidebar-collapsed");
        toggle.setAttribute("aria-expanded", String(!collapsed));
        try { localStorage.setItem("pilotbank-sidebar-collapsed", collapsed ? "1" : "0"); } catch {}
        return;
      }
      document.body.classList.remove("mobile-nav-collapsed");
      pulseButton(toggle);
      const open = !document.body.classList.contains("pb-mobile-menu-open");
      document.body.classList.toggle("pb-mobile-menu-open", open);
      updateMobileToggleVisual(open);
    }, true);
    backdrop?.addEventListener("click", closeMobileMenu);

    const nav = q("#primaryFeatureNav");
    nav?.addEventListener("click", (event) => {
      if (!isMobile()) return;
      if (event.target.closest(".pb-nav-group-toggle")) return;
      if (event.target.closest(".nav-action,.pb-menu-proxy")) {
        setTimeout(closeMobileMenu, 0);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMobile()) closeMobileMenu();
    });

    window.addEventListener("resize", () => {
      if (!isMobile()) {
        document.body.classList.remove("pb-mobile-menu-open");
      } else {
        updateMobileToggleVisual(document.body.classList.contains("pb-mobile-menu-open"));
      }
    }, { passive: true });
    if (isMobile()) updateMobileToggleVisual(false);
  }

  function installObservers() {
    const nav = q("#primaryFeatureNav");
    if (nav && !groupObserver) {
      groupObserver = new MutationObserver(queueSync);
      groupObserver.observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
    const header = q(".pilotbank-app-header");
    if (header && !headerObserver) {
      headerObserver = new MutationObserver(() => moveHeaderControls());
      headerObserver.observe(header, { childList: true, subtree: true });
    }
    const main = q("main.pilotbank-main");
    if (main && !surfaceObserver) {
      surfaceObserver = new MutationObserver((records) => {
        if (records.some((r) => r.type === "attributes" && r.attributeName === "class")) queueSync();
      });
      surfaceObserver.observe(main, { subtree: true, attributes: true, attributeFilter: ["class"] });
    }
  }

  function installMenuClickTracking() {
    const nav = q("#primaryFeatureNav");
    if (!nav || nav.dataset.pbClickTracking === "1") return;
    nav.dataset.pbClickTracking = "1";
    nav.addEventListener("click", (event) => {
      const item = event.target.closest(".nav-action,.pb-menu-proxy");
      if (item?.id) {
        pulseButton(item);
        setActive(item.id);
      }
    });
  }

  function boot() {
    const nav = q("#primaryFeatureNav");
    if (!nav) return;
    document.documentElement.dataset.pilotbankMenuShell = VERSION;
    document.body.classList.remove("mobile-nav-collapsed");
    updateBranding();
    ensureProxyButtons();
    createMenuScaffold();
    normalizeLabels();
    moveIntoGroups();
    moveHeaderControls();
    installGroupToggleCapture();
    installMobileDrawer();
    installMenuClickTracking();
    installObservers();
    syncGroupVisibility();
    syncActiveFromSurfaces();

    [80, 400, 1200, 2500].forEach((delay) => setTimeout(queueSync, delay));
    window.addEventListener("focus", queueSync, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
