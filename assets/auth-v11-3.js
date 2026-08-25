(() => {
  const SESSION_KEY = "pilotQuestionBankSessionUserV1";

  // GitHub Pages용 간단한 클라이언트 로그인입니다.
  // 비밀번호 원문은 저장하지 않고 사용자명+비밀번호의 SHA-256 값만 비교합니다.
  // 단, 정적 사이트 특성상 서버 인증을 대체하는 보안 기능은 아닙니다.
  const USERS = {
    "김영진_시험용": "39eca08aeb432326189e95cd27b5ac80d99c4c3ae9519efa3a3c4bd80dd1c8f0",
    "김덕재_시험용": "a8c0570cf7429c7a2922048240ffd05bc7ce335b1bc29d60aa79a1ab4e021b18",
  };

  let currentUser = null;
  let pendingPromise = null;

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
      .auth-user-chip {
        display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px;
        border: 1px solid #d9e0ec; border-radius: 999px; font-size: .88rem;
        background: rgba(255,255,255,.78);
      }
      .auth-logout-button {
        border: 1px solid #d9e0ec; border-radius: 9px; padding: 7px 10px;
        background: transparent; cursor: pointer; font: inherit;
      }
    `;
    document.head.appendChild(style);
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
    logout.addEventListener("click", () => {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      location.reload();
    });

    nav.appendChild(chip);
    nav.appendChild(logout);
  }

  function renderLogin(resolve) {
    injectStyles();
    const overlay = document.createElement("div");
    overlay.id = "authOverlay";
    overlay.className = "auth-overlay";
    overlay.innerHTML = `
      <form class="auth-panel" id="authForm" autocomplete="off">
        <h2>항공 문제은행 로그인</h2>
        <p>시험용 계정으로 로그인하세요.</p>
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
        overlay.remove();
        addUserControls(user);
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

  function progressStorageKey(baseKey = "pilotQuestionBankProgressV2") {
    const user = getCurrentUser();
    if (!user) return baseKey;
    return `${baseKey}::${encodeURIComponent(user)}`;
  }

  window.PilotBankAuth = {
    requireLogin,
    getCurrentUser,
    progressStorageKey,
  };
})();
