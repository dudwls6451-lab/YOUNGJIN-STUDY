(() => {
  const SESSION_KEY = "pilotQuestionBankSessionUserV1";
  const LOGOUT_REASON_KEY = "pilotQuestionBankLogoutReasonV1";
  const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  const WELCOME_MS = 1600;

  // GitHub Pages용 간단한 클라이언트 로그인입니다.
  // 비밀번호 원문은 저장하지 않고 사용자명+비밀번호의 SHA-256 값만 비교합니다.
  // 단, 정적 사이트 특성상 서버 인증을 대체하는 보안 기능은 아닙니다.
  const USERS = {
    "김영진_시험용": "39eca08aeb432326189e95cd27b5ac80d99c4c3ae9519efa3a3c4bd80dd1c8f0",
  };

  // v11.25 자료실 접근 허용 계정.
  // GitHub Pages 정적 배포이므로 이는 앱 수준의 접근 제어이며 서버측 ACL을 대체하지 않습니다.
  const RESOURCE_LIBRARY_USERS = new Set([
    "김영진_시험용",
  ]);

  let currentUser = null;
  let pendingPromise = null;
  let idleTimer = null;
  let idleListenersInstalled = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)]
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function displayName(user) {
    return String(user || "").replace(/_시험용.*$/, "").trim() || String(user || "");
  }

  function getSessionUser() {
    try {
      const user = sessionStorage.getItem(SESSION_KEY) || "";
      return Object.prototype.hasOwnProperty.call(USERS, user) ? user : null;
    } catch {
      return null;
    }
  }

  function injectStyles() {
    if (document.querySelector("#pilotBankAuthStyles")) return;
    const style = document.createElement("style");
    style.id = "pilotBankAuthStyles";
    style.textContent = `
      .auth-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: grid; place-items: center; padding: 20px;
        background: rgba(15, 23, 42, .72); backdrop-filter: blur(8px);
      }
      .auth-panel {
        width: min(420px, 100%); background: #fff; color: #172033;
        border-radius: 18px; padding: 26px; box-shadow: 0 28px 80px rgba(0,0,0,.28);
      }
      .auth-panel h2 { margin: 0 0 8px; }
      .auth-panel p { margin: 0 0 18px; color: #657089; }
      .auth-field { display: grid; gap: 6px; margin-top: 12px; font-weight: 700; }
      .auth-field input {
        width: 100%; box-sizing: border-box; border: 1px solid #cfd7e6;
        border-radius: 10px; padding: 12px 13px; font: inherit;
      }
      .auth-submit {
        width: 100%; margin-top: 18px; border: 0; border-radius: 10px;
        padding: 12px 14px; font: inherit; font-weight: 800; cursor: pointer;
        background: #2463eb; color: #fff;
      }
      .auth-submit:disabled { opacity: .65; cursor: wait; }
      .auth-error { min-height: 1.4em; margin-top: 10px; color: #c9362b; font-size: .92rem; }
      .auth-notice {
        margin: 0 0 14px; border-radius: 10px; padding: 10px 12px;
        background: #fff7e6; color: #7a4b00; font-size: .92rem;
      }
      .auth-welcome {
        text-align: center; padding: 36px 28px;
        animation: authWelcomeIn .28s ease-out;
      }
      .auth-welcome-mark { font-size: 2.3rem; margin-bottom: 10px; }
      .auth-welcome h2 { margin: 0; font-size: clamp(1.45rem, 5vw, 2rem); }
      .auth-welcome p { margin: 10px 0 0; color: #657089; }
      .auth-user-chip {
        display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px;
        border: 1px solid #d9e0ec; border-radius: 999px; font-size: .88rem;
        background: rgba(255,255,255,.78);
      }
      .auth-logout-button {
        border: 1px solid #d9e0ec; border-radius: 9px; padding: 7px 10px;
        background: transparent; cursor: pointer; font: inherit;
      }
      @keyframes authWelcomeIn {
        from { opacity: 0; transform: translateY(8px) scale(.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  function clearIdleTimer() {
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function performLogout(reason = "manual") {
    clearIdleTimer();
    try {
      sessionStorage.removeItem(SESSION_KEY);
      if (reason === "idle") sessionStorage.setItem(LOGOUT_REASON_KEY, "idle");
      else sessionStorage.removeItem(LOGOUT_REASON_KEY);
    } catch {}
    currentUser = null;
    location.reload();
  }

  function resetIdleTimer() {
    if (!getSessionUser()) return;
    clearIdleTimer();
    idleTimer = window.setTimeout(() => performLogout("idle"), IDLE_TIMEOUT_MS);
  }

  function installIdleLogout() {
    if (!idleListenersInstalled) {
      // 마우스 이동만으로 세션이 연장되지는 않도록 실제 사용자 조작만 활동으로 봅니다.
      ["click", "keydown", "pointerdown", "touchstart", "scroll"].forEach(type => {
        window.addEventListener(type, resetIdleTimer, { passive: true, capture: true });
      });
      idleListenersInstalled = true;
    }
    resetIdleTimer();
  }

  function addUserControls(user) {
    if (document.querySelector("#authUserChip")) return;
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const chip = document.createElement("span");
    chip.id = "authUserChip";
    chip.className = "auth-user-chip";
    chip.textContent = user;

    const logout = document.createElement("button");
    logout.id = "authLogoutBtn";
    logout.type = "button";
    logout.className = "auth-logout-button";
    logout.textContent = "로그아웃";
    logout.addEventListener("click", () => performLogout("manual"));

    nav.appendChild(chip);
    nav.appendChild(logout);
  }

  function showWelcome(overlay, user) {
    return new Promise(resolve => {
      const name = displayName(user);
      overlay.innerHTML = `
        <div class="auth-panel auth-welcome" role="status" aria-live="polite">
          <div class="auth-welcome-mark">✈️</div>
          <h2>${escapeHtml(name)}님, 환영합니다</h2>
          <p>문제은행을 불러오고 있습니다.</p>
        </div>
      `;
      window.setTimeout(resolve, WELCOME_MS);
    });
  }

  function renderLogin(resolve) {
    injectStyles();
    const overlay = document.createElement("div");
    overlay.id = "authOverlay";
    overlay.className = "auth-overlay";

    let idleNotice = false;
    try {
      idleNotice = sessionStorage.getItem(LOGOUT_REASON_KEY) === "idle";
      sessionStorage.removeItem(LOGOUT_REASON_KEY);
    } catch {}

    overlay.innerHTML = `
      <form class="auth-panel" id="authForm" autocomplete="off">
        <h2>항공 문제은행 로그인</h2>
        <p>시험용 계정으로 로그인하세요.</p>
        ${idleNotice ? '<div class="auth-notice">30분 동안 활동이 없어 자동 로그아웃되었습니다.</div>' : ''}
        <label class="auth-field">
          아이디
          <input id="authUser" name="username" type="text" autocomplete="username" required />
        </label>
        <label class="auth-field">
          비밀번호
          <input id="authPassword" name="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="auth-submit" id="authSubmit" type="submit">로그인</button>
        <div class="auth-error" id="authError" role="alert"></div>
      </form>
    `;
    document.body.appendChild(overlay);

    const form = overlay.querySelector("#authForm");
    const userInput = overlay.querySelector("#authUser");
    const passwordInput = overlay.querySelector("#authPassword");
    const submit = overlay.querySelector("#authSubmit");
    const error = overlay.querySelector("#authError");

    setTimeout(() => userInput.focus(), 0);

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const user = userInput.value.trim();
      const password = passwordInput.value;

      if (!Object.prototype.hasOwnProperty.call(USERS, user)) {
        error.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
        return;
      }

      submit.disabled = true;
      error.textContent = "";
      try {
        const digest = await sha256(`${user}:${password}`);
        if (digest !== USERS[user]) {
          error.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
          passwordInput.select();
          return;
        }

        currentUser = user;
        try { sessionStorage.setItem(SESSION_KEY, user); } catch {}
        await showWelcome(overlay, user);
        overlay.remove();
        addUserControls(user);
        installIdleLogout();
        resolve(user);
      } catch (err) {
        console.error(err);
        error.textContent = "로그인 처리 중 오류가 발생했습니다.";
      } finally {
        submit.disabled = false;
      }
    });
  }

  function requireLogin() {
    if (pendingPromise) return pendingPromise;

    pendingPromise = new Promise(resolve => {
      const existing = getSessionUser();
      if (existing) {
        currentUser = existing;
        injectStyles();
        addUserControls(existing);
        installIdleLogout();
        resolve(existing);
        return;
      }
      renderLogin(resolve);
    });

    return pendingPromise;
  }

  function getCurrentUser() {
    return currentUser || getSessionUser();
  }

  function canAccessResourceLibrary(user = getCurrentUser()) {
    return !!user && RESOURCE_LIBRARY_USERS.has(user);
  }

  function progressStorageKey(baseKey = "pilotQuestionBankProgressV2") {
    const user = getCurrentUser();
    if (!user) return baseKey;
    return `${baseKey}::${encodeURIComponent(user)}`;
  }

  window.PilotBankAuth = {
    requireLogin,
    getCurrentUser,
    progressStorageKey,
    canAccessResourceLibrary,
  };
})();
