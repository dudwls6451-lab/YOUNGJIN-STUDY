(() => {
  const LEGACY_SESSION_KEY = "pilotQuestionBankSessionUserV1";
  const AUTH_MODE_KEY = "pilotQuestionBankAuthModeV2";
  const LOGOUT_REASON_KEY = "pilotQuestionBankLogoutReasonV1";
  const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  const WELCOME_MS = 1200;

  // v11.38: 기존 시험용 계정은 김영진_시험용만 유지합니다.
  // 신규 사용자는 이름+이메일+비밀번호로 가입 신청하고, 관리자 승인 후 이용합니다. 이메일 인증은 사용하지 않습니다.
  const LEGACY_USERS = {
    "김영진_시험용": "39eca08aeb432326189e95cd27b5ac80d99c4c3ae9519efa3a3c4bd80dd1c8f0",
  };

  // v11.49: 자료실은 기존 김영진_시험용 계정과 관리자 승인(approved)을 받은 Supabase 사용자에게 허용합니다.
  // Supabase 사용자는 가입 승인 상태를 그대로 접근 권한으로 사용합니다.
  const LEGACY_RESOURCE_LIBRARY_USERS = new Set(["김영진_시험용"]);

  // v11.50: 기능별 접근 권한. 별도 설정이 없으면 승인 사용자는 기본 허용합니다.
  const FEATURE_KEYS = ["problem_bank", "theory_learning", "aviwiki", "airline_course", "wrong_review", "resource_library"];
  const DEFAULT_FEATURE_ACCESS = Object.fromEntries(FEATURE_KEYS.map(key => [key, true]));

  let currentIdentity = null;
  let pendingPromise = null;
  let idleTimer = null;
  let idleListenersInstalled = false;

  function client() {
    return window.supabaseClient || null;
  }

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

  function legacyDisplayName(user) {
    return String(user || "").replace(/_시험용.*$/, "").trim() || String(user || "");
  }

  function identityLabel(identity = currentIdentity) {
    if (!identity) return "";
    if (identity.kind === "legacy") return identity.username;
    return identity.profile?.username || identity.user?.email || "사용자";
  }

  function identityDisplayName(identity = currentIdentity) {
    if (!identity) return "";
    if (identity.kind === "legacy") return legacyDisplayName(identity.username);
    return identity.profile?.username || identity.user?.email?.split("@")[0] || "사용자";
  }

  function getLegacySessionUser() {
    try {
      const user = sessionStorage.getItem(LEGACY_SESSION_KEY) || "";
      return Object.prototype.hasOwnProperty.call(LEGACY_USERS, user) ? user : null;
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
        background: rgba(15, 23, 42, .76); backdrop-filter: blur(8px);
        overflow-y: auto;
      }
      .auth-panel {
        width: min(440px, 100%); background: #fff; color: #172033;
        border-radius: 18px; padding: 26px; box-shadow: 0 28px 80px rgba(0,0,0,.28);
      }
      .auth-panel h2 { margin: 0 0 8px; }
      .auth-panel p { margin: 0 0 18px; color: #657089; line-height: 1.55; }
      .auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0 8px; }
      .auth-tab {
        border: 1px solid #d9e0ec; border-radius: 10px; padding: 10px;
        background: #f7f9fc; color: #4c5870; cursor: pointer; font: inherit; font-weight: 800;
      }
      .auth-tab.active { background: #2463eb; color: #fff; border-color: #2463eb; }
      .auth-field { display: grid; gap: 6px; margin-top: 12px; font-weight: 700; }
      .auth-field input {
        width: 100%; box-sizing: border-box; border: 1px solid #cfd7e6;
        border-radius: 10px; padding: 12px 13px; font: inherit;
      }
      .auth-field input:focus { outline: 2px solid rgba(36,99,235,.18); border-color: #2463eb; }
      .auth-submit {
        width: 100%; margin-top: 18px; border: 0; border-radius: 10px;
        padding: 12px 14px; font: inherit; font-weight: 800; cursor: pointer;
        background: #2463eb; color: #fff;
      }
      .auth-submit.secondary { background: #eef3ff; color: #2253b8; border: 1px solid #cbd9ff; }
      .auth-submit.ghost { background: transparent; color: #4c5870; border: 1px solid #d9e0ec; }
      .auth-submit:disabled { opacity: .65; cursor: wait; }
      .auth-error { min-height: 1.4em; margin-top: 10px; color: #c9362b; font-size: .92rem; }
      .auth-success { margin-top: 12px; color: #11723b; font-size: .92rem; line-height: 1.5; }
      .auth-notice {
        margin: 0 0 14px; border-radius: 10px; padding: 10px 12px;
        background: #fff7e6; color: #7a4b00; font-size: .92rem; line-height: 1.5;
      }
      .auth-status-box {
        margin-top: 14px; border-radius: 12px; padding: 16px;
        background: #f7f9fc; border: 1px solid #e1e7f0; text-align: center;
      }
      .auth-status-box strong { display: block; font-size: 1.05rem; margin-bottom: 6px; }
      .auth-status-box p { margin: 0; font-size: .93rem; }
      .auth-legacy-toggle {
        display: block; margin: 18px auto 0; border: 0; background: transparent;
        color: #738099; text-decoration: underline; cursor: pointer; font: inherit; font-size: .86rem;
      }
      .auth-welcome { text-align: center; padding: 36px 28px; animation: authWelcomeIn .28s ease-out; }
      .auth-welcome-mark { font-size: 2.3rem; margin-bottom: 10px; }
      .auth-welcome h2 { margin: 0; font-size: clamp(1.45rem, 5vw, 2rem); }
      .auth-welcome p { margin: 10px 0 0; color: #657089; }
      .auth-user-chip {
        display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px;
        border: 1px solid #d9e0ec; border-radius: 999px; font-size: .88rem;
        background: rgba(255,255,255,.78);
      }
      .auth-admin-badge { font-size: .72rem; font-weight: 900; color: #2253b8; }
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

  async function performLogout(reason = "manual") {
    clearIdleTimer();
    try {
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
      sessionStorage.removeItem(AUTH_MODE_KEY);
      if (reason === "idle") sessionStorage.setItem(LOGOUT_REASON_KEY, "idle");
      else sessionStorage.removeItem(LOGOUT_REASON_KEY);
    } catch {}

    if (currentIdentity?.kind === "supabase" && client()) {
      try { await client().auth.signOut(); } catch (err) { console.warn("[Auth] Supabase signOut failed", err); }
    }

    currentIdentity = null;
    location.reload();
  }

  function resetIdleTimer() {
    if (!currentIdentity) return;
    clearIdleTimer();
    idleTimer = window.setTimeout(() => performLogout("idle"), IDLE_TIMEOUT_MS);
  }

  function installIdleLogout() {
    if (!idleListenersInstalled) {
      ["click", "keydown", "pointerdown", "touchstart", "scroll"].forEach(type => {
        window.addEventListener(type, resetIdleTimer, { passive: true, capture: true });
      });
      idleListenersInstalled = true;
    }
    resetIdleTimer();
  }

  function addUserControls(identity) {
    if (document.querySelector("#authUserChip")) return;
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const chip = document.createElement("span");
    chip.id = "authUserChip";
    chip.className = "auth-user-chip";
    const adminMark = identity?.kind === "supabase" && identity.profile?.is_admin
      ? '<span class="auth-admin-badge">ADMIN</span>'
      : "";
    chip.innerHTML = `${escapeHtml(identityLabel(identity))}${adminMark}`;

    const logout = document.createElement("button");
    logout.id = "authLogoutBtn";
    logout.type = "button";
    logout.className = "auth-logout-button";
    logout.textContent = "로그아웃";
    logout.addEventListener("click", () => performLogout("manual"));

    nav.appendChild(chip);
    nav.appendChild(logout);
  }

  function showWelcome(overlay, identity) {
    return new Promise(resolve => {
      const name = identityDisplayName(identity);
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

  async function fetchOwnProfile(userId, retry = true) {
    const supabase = client();
    if (!supabase || !userId) return null;

    const attempts = retry ? 3 : 1;
    for (let i = 0; i < attempts; i += 1) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,username,approval_status,is_admin,created_at")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) return data;
      if (error && error.code !== "PGRST116") console.warn("[Auth] profile fetch", error);
      if (i < attempts - 1) await new Promise(resolve => setTimeout(resolve, 350));
    }
    return null;
  }

  async function fetchOwnFeatureAccess(userId) {
    const supabase = client();
    if (!supabase || !userId) return { ...DEFAULT_FEATURE_ACCESS };
    try {
      const { data, error } = await supabase
        .from("user_feature_access")
        .select("feature_key,enabled")
        .eq("user_id", userId);
      if (error) {
        // 테이블 적용 전/일시 오류 시 기존 기능을 막지 않습니다.
        console.warn("[Auth] feature access fetch", error);
        return { ...DEFAULT_FEATURE_ACCESS };
      }
      const access = { ...DEFAULT_FEATURE_ACCESS };
      (data || []).forEach(row => {
        if (FEATURE_KEYS.includes(row.feature_key)) access[row.feature_key] = row.enabled !== false;
      });
      return access;
    } catch (err) {
      console.warn("[Auth] feature access fetch", err);
      return { ...DEFAULT_FEATURE_ACCESS };
    }
  }

  async function getSupabaseIdentity() {
    const supabase = client();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.user) return null;
    const user = data.session.user;
    const profile = await fetchOwnProfile(user.id);
    const featureAccess = profile?.is_admin ? { ...DEFAULT_FEATURE_ACCESS } : await fetchOwnFeatureAccess(user.id);
    return { kind: "supabase", user, profile, featureAccess };
  }

  function approvalState(identity) {
    if (identity?.kind !== "supabase") return "approved";
    return identity.profile?.approval_status || "pending";
  }

  function renderApprovalStatus(overlay, identity, resolve) {
    const state = approvalState(identity);
    const name = identityDisplayName(identity);
    const isRejected = state === "rejected";

    overlay.innerHTML = `
      <div class="auth-panel">
        <h2>${isRejected ? "계정 승인 불가" : "관리자 승인 대기"}</h2>
        <p>${escapeHtml(name)}님의 가입 신청 상태입니다.</p>
        <div class="auth-status-box">
          <strong>${isRejected ? "승인되지 않은 계정입니다." : "가입 신청이 접수되었습니다."}</strong>
          <p>${isRejected ? "관리자에게 문의해 주세요." : "관리자가 승인하면 문제은행을 이용할 수 있습니다."}</p>
        </div>
        ${!isRejected ? '<button class="auth-submit secondary" id="authRecheckBtn" type="button">승인 상태 다시 확인</button>' : ''}
        <button class="auth-submit ghost" id="authPendingLogoutBtn" type="button">로그아웃</button>
        <div class="auth-error" id="authPendingError" role="alert"></div>
      </div>
    `;

    const logoutBtn = overlay.querySelector("#authPendingLogoutBtn");
    logoutBtn?.addEventListener("click", () => performLogout("manual"));

    const recheck = overlay.querySelector("#authRecheckBtn");
    recheck?.addEventListener("click", async () => {
      recheck.disabled = true;
      const errorBox = overlay.querySelector("#authPendingError");
      if (errorBox) errorBox.textContent = "";
      try {
        const updated = await fetchOwnProfile(identity.user.id, false);
        if (updated) identity.profile = updated;
        if (approvalState(identity) === "approved") {
          identity.featureAccess = identity.profile?.is_admin ? { ...DEFAULT_FEATURE_ACCESS } : await fetchOwnFeatureAccess(identity.user.id);
          currentIdentity = identity;
          await showWelcome(overlay, identity);
          overlay.remove();
          addUserControls(identity);
          installIdleLogout();
          resolve(identityLabel(identity));
          return;
        }
        renderApprovalStatus(overlay, identity, resolve);
      } catch (err) {
        console.error(err);
        if (errorBox) errorBox.textContent = "승인 상태 확인 중 오류가 발생했습니다.";
      } finally {
        if (recheck?.isConnected) recheck.disabled = false;
      }
    });
  }

  async function finishSupabaseLogin(overlay, resolve) {
    const identity = await getSupabaseIdentity();
    if (!identity) throw new Error("로그인 세션을 확인할 수 없습니다.");

    currentIdentity = identity;
    try { sessionStorage.setItem(AUTH_MODE_KEY, "supabase"); } catch {}

    if (approvalState(identity) !== "approved") {
      renderApprovalStatus(overlay, identity, resolve);
      return;
    }

    await showWelcome(overlay, identity);
    overlay.remove();
    addUserControls(identity);
    installIdleLogout();
    resolve(identityLabel(identity));
  }

  function renderLegacyLogin(overlay, resolve, returnToMain) {
    overlay.innerHTML = `
      <form class="auth-panel" id="legacyAuthForm" autocomplete="off">
        <h2>기존 관리자 계정</h2>
        <p>기존 계정 중 김영진_시험용만 유지됩니다.</p>
        <label class="auth-field">
          아이디
          <input id="legacyAuthUser" name="username" type="text" autocomplete="username" required />
        </label>
        <label class="auth-field">
          비밀번호
          <input id="legacyAuthPassword" name="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="auth-submit" id="legacyAuthSubmit" type="submit">로그인</button>
        <button class="auth-submit ghost" id="legacyBackBtn" type="button">이메일 로그인으로 돌아가기</button>
        <div class="auth-error" id="legacyAuthError" role="alert"></div>
      </form>
    `;

    const form = overlay.querySelector("#legacyAuthForm");
    const userInput = overlay.querySelector("#legacyAuthUser");
    const passwordInput = overlay.querySelector("#legacyAuthPassword");
    const submit = overlay.querySelector("#legacyAuthSubmit");
    const error = overlay.querySelector("#legacyAuthError");

    overlay.querySelector("#legacyBackBtn")?.addEventListener("click", returnToMain);
    setTimeout(() => userInput?.focus(), 0);

    form?.addEventListener("submit", async event => {
      event.preventDefault();
      const user = userInput.value.trim();
      const password = passwordInput.value;

      if (!Object.prototype.hasOwnProperty.call(LEGACY_USERS, user)) {
        error.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
        return;
      }

      submit.disabled = true;
      error.textContent = "";
      try {
        const digest = await sha256(`${user}:${password}`);
        if (digest !== LEGACY_USERS[user]) {
          error.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
          passwordInput.select();
          return;
        }

        currentIdentity = { kind: "legacy", username: user };
        try {
          sessionStorage.setItem(LEGACY_SESSION_KEY, user);
          sessionStorage.setItem(AUTH_MODE_KEY, "legacy");
        } catch {}
        await showWelcome(overlay, currentIdentity);
        overlay.remove();
        addUserControls(currentIdentity);
        installIdleLogout();
        resolve(user);
      } catch (err) {
        console.error(err);
        error.textContent = "로그인 처리 중 오류가 발생했습니다.";
      } finally {
        if (submit?.isConnected) submit.disabled = false;
      }
    });
  }

  function renderEmailAuth(resolve) {
    injectStyles();
    const overlay = document.createElement("div");
    overlay.id = "authOverlay";
    overlay.className = "auth-overlay";
    document.body.appendChild(overlay);

    let mode = "login";
    let pendingEmail = "";
    let pendingName = "";

    let idleNotice = false;
    try {
      idleNotice = sessionStorage.getItem(LOGOUT_REASON_KEY) === "idle";
      sessionStorage.removeItem(LOGOUT_REASON_KEY);
    } catch {}

    const draw = () => {
      if (!client()) {
        overlay.innerHTML = `
          <div class="auth-panel">
            <h2>연결 오류</h2>
            <p>Supabase 연결을 확인할 수 없습니다.</p>
            <div class="auth-error">supabase-config.js와 supabase-js 로딩 상태를 확인해 주세요.</div>
          </div>
        `;
        return;
      }

      const signup = mode === "signup";
      overlay.innerHTML = `
        <form class="auth-panel" id="emailAuthForm" autocomplete="on">
          <h2>항공 문제은행</h2>
          <p>${signup
            ? "이름·이메일·비밀번호를 입력하면 가입 신청이 접수됩니다."
            : "가입한 이메일과 비밀번호로 로그인합니다."}</p>
          ${idleNotice ? '<div class="auth-notice">30분 동안 활동이 없어 자동 로그아웃되었습니다.</div>' : ''}
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab ${!signup ? "active" : ""}" id="authLoginTab" type="button">로그인</button>
            <button class="auth-tab ${signup ? "active" : ""}" id="authSignupTab" type="button">회원가입</button>
          </div>
          ${signup ? `
            <label class="auth-field">
              이름
              <input id="authName" name="name" type="text" autocomplete="name" maxlength="40" required value="${escapeHtml(pendingName)}" />
            </label>
          ` : ""}
          <label class="auth-field">
            이메일
            <input id="authEmail" name="email" type="email" autocomplete="email" required value="${escapeHtml(pendingEmail)}" />
          </label>
          <label class="auth-field">
            비밀번호
            <input id="authPassword" name="password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" minlength="8" required />
          </label>
          ${signup ? `
            <label class="auth-field">
              비밀번호 확인
              <input id="authPasswordConfirm" name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" required />
            </label>
          ` : ""}
          <button class="auth-submit" id="authSubmit" type="submit">${signup ? "회원가입 신청" : "로그인"}</button>
          <div class="auth-error" id="authError" role="alert"></div>
          <div class="auth-success" id="authSuccess" role="status"></div>
        </form>
      `;

      const form = overlay.querySelector("#emailAuthForm");
      const emailInput = overlay.querySelector("#authEmail");
      const nameInput = overlay.querySelector("#authName");
      const passwordInput = overlay.querySelector("#authPassword");
      const passwordConfirmInput = overlay.querySelector("#authPasswordConfirm");
      const submitBtn = overlay.querySelector("#authSubmit");
      const errorBox = overlay.querySelector("#authError");
      const successBox = overlay.querySelector("#authSuccess");

      overlay.querySelector("#authLoginTab")?.addEventListener("click", () => {
        pendingEmail = emailInput?.value.trim() || pendingEmail;
        pendingName = nameInput?.value.trim() || pendingName;
        mode = "login";
        draw();
      });
      overlay.querySelector("#authSignupTab")?.addEventListener("click", () => {
        pendingEmail = emailInput?.value.trim() || pendingEmail;
        mode = "signup";
        draw();
      });

      setTimeout(() => (signup ? nameInput : emailInput)?.focus(), 0);

      form?.addEventListener("submit", async event => {
        event.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const name = signup ? nameInput.value.trim() : "";

        if (signup && !name) {
          errorBox.textContent = "이름을 입력해 주세요.";
          return;
        }
        if (password.length < 8) {
          errorBox.textContent = "비밀번호는 8자 이상으로 입력해 주세요.";
          return;
        }
        if (signup && password !== passwordConfirmInput.value) {
          errorBox.textContent = "비밀번호 확인이 일치하지 않습니다.";
          passwordConfirmInput.focus();
          return;
        }

        pendingEmail = email;
        pendingName = name;
        submitBtn.disabled = true;
        errorBox.textContent = "";
        successBox.textContent = "";

        try {
          if (!signup) {
            const { error } = await client().auth.signInWithPassword({ email, password });
            if (error) throw error;
            await finishSupabaseLogin(overlay, resolve);
            return;
          }

          const { data, error } = await client().auth.signUp({
            email,
            password,
            options: {
              data: { username: name },
            },
          });
          if (error) throw error;

          // 이메일 인증을 사용하지 않는 구성에서는 회원가입 직후 세션이 발급됩니다.
          // 세션이 없다면 Supabase의 Confirm Email 설정이 아직 켜져 있는 것입니다.
          if (!data?.session) {
            throw new Error("Supabase Authentication 설정에서 Confirm Email을 OFF로 변경해 주세요.");
          }

          successBox.textContent = "회원가입 신청이 접수되었습니다. 관리자 승인 후 이용할 수 있습니다.";
          await finishSupabaseLogin(overlay, resolve);
          return;
        } catch (err) {
          console.error("[Auth] email auth", err);
          const message = String(err?.message || "");
          if (!signup && /email not confirmed/i.test(message)) {
            errorBox.textContent = "이 계정은 이전 이메일 인증 방식으로 생성된 미인증 계정입니다. 관리자에게 문의해 주세요.";
          } else if (!signup && /invalid login credentials/i.test(message)) {
            errorBox.textContent = "이메일 또는 비밀번호가 올바르지 않습니다.";
          } else if (signup && /already registered|already been registered|user already/i.test(message)) {
            errorBox.textContent = "이미 가입된 이메일입니다. 로그인 탭을 이용해 주세요.";
          } else if (/password/i.test(message) && /weak|least|characters|length/i.test(message)) {
            errorBox.textContent = "비밀번호가 보안 기준을 충족하지 않습니다. 더 긴 비밀번호를 사용해 주세요.";
          } else if (/rate|seconds|email rate/i.test(message)) {
            errorBox.textContent = "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
          } else {
            errorBox.textContent = message || (signup ? "회원가입 처리 중 오류가 발생했습니다." : "로그인 처리 중 오류가 발생했습니다.");
          }
        } finally {
          if (submitBtn?.isConnected) submitBtn.disabled = false;
        }
      });
    };

    draw();
  }


  function requireLogin() {
    if (pendingPromise) return pendingPromise;

    pendingPromise = new Promise(async resolve => {
      injectStyles();

      const legacy = getLegacySessionUser();
      if (legacy) {
        currentIdentity = { kind: "legacy", username: legacy };
        addUserControls(currentIdentity);
        installIdleLogout();
        resolve(legacy);
        return;
      }

      try {
        const identity = await getSupabaseIdentity();
        if (identity) {
          currentIdentity = identity;
          if (approvalState(identity) === "approved") {
            addUserControls(identity);
            installIdleLogout();
            resolve(identityLabel(identity));
            return;
          }

          const overlay = document.createElement("div");
          overlay.id = "authOverlay";
          overlay.className = "auth-overlay";
          document.body.appendChild(overlay);
          renderApprovalStatus(overlay, identity, resolve);
          return;
        }
      } catch (err) {
        console.warn("[Auth] existing Supabase session check failed", err);
      }

      renderEmailAuth(resolve);
    });

    return pendingPromise;
  }

  function getCurrentUser() {
    return identityLabel(currentIdentity) || getLegacySessionUser();
  }

  function canAccessFeature(featureKey) {
    if (!FEATURE_KEYS.includes(featureKey)) return false;
    if (!currentIdentity) {
      const legacy = getLegacySessionUser();
      if (legacy) return true;
      return false;
    }
    if (currentIdentity.kind === "legacy") return true;
    if (currentIdentity.kind === "supabase") {
      if (approvalState(currentIdentity) !== "approved") return false;
      if (currentIdentity.profile?.is_admin) return true;
      return currentIdentity.featureAccess?.[featureKey] !== false;
    }
    return false;
  }

  function canAccessResourceLibrary() {
    if (currentIdentity?.kind === "legacy") {
      return LEGACY_RESOURCE_LIBRARY_USERS.has(currentIdentity.username);
    }
    return canAccessFeature("resource_library");
  }

  async function refreshFeatureAccess() {
    if (currentIdentity?.kind !== "supabase" || !currentIdentity.user?.id) return { ...DEFAULT_FEATURE_ACCESS };
    currentIdentity.featureAccess = currentIdentity.profile?.is_admin
      ? { ...DEFAULT_FEATURE_ACCESS }
      : await fetchOwnFeatureAccess(currentIdentity.user.id);
    return { ...currentIdentity.featureAccess };
  }

  function getCurrentFeatureAccess() {
    if (currentIdentity?.kind === "legacy" || currentIdentity?.profile?.is_admin) return { ...DEFAULT_FEATURE_ACCESS };
    return { ...DEFAULT_FEATURE_ACCESS, ...(currentIdentity?.featureAccess || {}) };
  }

  function progressStorageKey(baseKey = "pilotQuestionBankProgressV2") {
    if (currentIdentity?.kind === "supabase" && currentIdentity.user?.id) {
      return `${baseKey}::supabase::${encodeURIComponent(currentIdentity.user.id)}`;
    }
    const legacy = currentIdentity?.kind === "legacy" ? currentIdentity.username : getLegacySessionUser();
    if (legacy) return `${baseKey}::${encodeURIComponent(legacy)}`;
    return baseKey;
  }

  function getCurrentProfile() {
    return currentIdentity?.kind === "supabase" ? currentIdentity.profile : null;
  }

  window.PilotBankAuth = {
    requireLogin,
    getCurrentUser,
    getCurrentProfile,
    progressStorageKey,
    canAccessResourceLibrary,
    canAccessFeature,
    getCurrentFeatureAccess,
    refreshFeatureAccess,
  };
})();
