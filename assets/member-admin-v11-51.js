(() => {
  const FEATURES = [
    { key: "problem_bank", label: "문제은행", desc: "교통안전공단·교재 문제풀이·자유학습" },
    { key: "theory_learning", label: "이론 학습", desc: "각 교재의 단계별 이론학습" },
    { key: "aviwiki", label: "Aviwiki", desc: "이론 백과사전" },
    { key: "airline_course", label: "항공사 대비", desc: "항공사별 필기전형 대비 과정" },
    { key: "wrong_review", label: "오답 복습", desc: "누적 오답 반복학습" },
    { key: "resource_library", label: "자료실", desc: "열람 전용 학습자료" },
  ];
  const DEFAULT_ACCESS = Object.fromEntries(FEATURES.map(f => [f.key, true]));
  let members = [];
  let featureRows = [];
  let learningStats = new Map();
  let activeStatus = "pending";

  const $ = sel => document.querySelector(sel);
  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function injectStyles() {
    if ($("#memberAdminV1150Styles")) return;
    const style = document.createElement("style");
    style.id = "memberAdminV1150Styles";
    style.textContent = `
      .member-admin-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.member-admin-tab{border:1px solid rgba(148,163,184,.28);background:rgba(15,23,42,.68);color:#cbd5e1;border-radius:999px;padding:9px 14px;font:inherit;font-weight:800;cursor:pointer}.member-admin-tab.active{background:#1f8a82;color:white;border-color:#2dd4bf}.member-admin-count{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;margin-left:5px;border-radius:999px;background:rgba(45,212,191,.16);font-size:.78rem}.member-admin-list{display:grid;gap:14px}.member-admin-card{border:1px solid rgba(148,163,184,.22);border-radius:18px;background:rgba(15,23,42,.72);padding:18px}.member-admin-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.member-admin-name{font-size:1.08rem;font-weight:900;color:#f8fafc}.member-admin-email,.member-admin-meta{color:#94a3b8;font-size:.88rem;margin-top:4px}.member-status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:.78rem;font-weight:900}.member-status.pending{background:#5f451b;color:#fde68a}.member-status.approved{background:#123f3b;color:#99f6e4}.member-status.rejected{background:#51252c;color:#fecdd3}.member-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.member-admin-features{margin-top:16px;padding-top:14px;border-top:1px solid rgba(148,163,184,.18);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.member-feature-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(148,163,184,.18);border-radius:12px;padding:11px 12px;background:rgba(2,6,23,.3)}.member-feature-toggle strong{display:block;color:#e2e8f0;font-size:.92rem}.member-feature-toggle small{display:block;color:#64748b;margin-top:2px}.member-feature-toggle input{width:20px;height:20px;accent-color:#14b8a6}.member-feature-toggle.admin-disabled{opacity:.55}.member-admin-save-row{display:flex;justify-content:flex-end;margin-top:12px}.member-admin-learning{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:15px 0 2px}.member-learning-stat{border:1px solid rgba(45,212,191,.16);background:rgba(2,6,23,.34);border-radius:14px;padding:12px}.member-learning-stat span{display:block;color:#94a3b8;font-size:.78rem;font-weight:800}.member-learning-stat strong{display:block;color:#f8fafc;font-size:1.08rem;margin-top:5px}.member-learning-stat small{display:block;color:#64748b;font-size:.72rem;margin-top:3px}.member-admin-empty{padding:34px;text-align:center;color:#94a3b8;border:1px dashed rgba(148,163,184,.25);border-radius:16px}.feature-denied-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:999999;background:#111827;color:#fff;border:1px solid rgba(45,212,191,.35);padding:11px 16px;border-radius:999px;box-shadow:0 14px 40px rgba(0,0,0,.35);font-weight:800}.nav-pending-badge{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#dc2626;color:white;font-size:.72rem;font-weight:900}@media(max-width:980px){.member-admin-learning{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.member-admin-features,.member-admin-learning{grid-template-columns:1fr}.member-admin-head{display:block}.member-status{margin-top:8px}}`;
    document.head.appendChild(style);
  }

  function currentProfile() { return window.PilotBankAuth?.getCurrentProfile?.() || null; }
  function isAdmin() { return !!currentProfile()?.is_admin; }
  function can(key) { return window.PilotBankAuth?.canAccessFeature?.(key) !== false; }

  function showDenied(label) {
    const old = $(".feature-denied-toast"); if (old) old.remove();
    const toast = document.createElement("div"); toast.className = "feature-denied-toast";
    toast.textContent = `${label} 기능에 대한 접근 권한이 없습니다.`;
    document.body.appendChild(toast); setTimeout(() => toast.remove(), 2400);
  }

  function applyFeatureVisibility() {
    const rules = {
      aviwiki: ["#aviwikiNavBtn", "#aviwikiModeBtn"],
      airline_course: ["#airlineQuickNavBtn", "#airlineModeBtn"],
      wrong_review: ["#wrongReviewQuickNavBtn", "#wrongReviewModeBtn"],
      resource_library: ["#quickResourceNavBtn", "#resourceLibraryModeBtn"],
      theory_learning: ["#textbookTheoryBtn", "#bookTheoryHubCard"],
      problem_bank: ["#kotsaModeBtn", "#textbookProblemBtn", "#bookProblemHubCard"],
    };
    Object.entries(rules).forEach(([key, selectors]) => selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.toggle("feature-access-hidden", !can(key)));
    }));
    let gateStyle = $("#featureAccessGateStyle");
    if (!gateStyle) { gateStyle=document.createElement("style"); gateStyle.id="featureAccessGateStyle"; gateStyle.textContent=".feature-access-hidden{display:none!important}"; document.head.appendChild(gateStyle); }
    // 각 교재 메뉴는 문제풀이와 이론 중 하나라도 허용되면 유지
    const textbookAllowed = can("problem_bank") || can("theory_learning");
    ["#textbookModeBtn", "#textbookQuickNavBtn"].forEach(sel => document.querySelectorAll(sel).forEach(el => el.classList.toggle("feature-access-hidden", !textbookAllowed)));
  }

  const clickFeatureRules = [
    ["#aviwikiNavBtn,#aviwikiModeBtn,[data-aviwiki-subject]", "aviwiki", "Aviwiki"],
    ["#airlineQuickNavBtn,#airlineModeBtn,#parataCourseBtn,#jejuCourseBtn,#trinityCourseBtn", "airline_course", "항공사 대비"],
    ["#wrongReviewQuickNavBtn,#wrongReviewModeBtn,[data-wrong-review-subject]", "wrong_review", "오답 복습"],
    ["#quickResourceNavBtn,#resourceLibraryModeBtn,[data-resource-id]", "resource_library", "자료실"],
    ["#textbookTheoryBtn,[data-theory-subject],#theoryTestBtn", "theory_learning", "이론 학습"],
    ["#kotsaModeBtn,#textbookProblemBtn,[data-book-subject],#freeStudyBtn", "problem_bank", "문제은행"],
  ];
  document.addEventListener("click", e => {
    for (const [selector,key,label] of clickFeatureRules) {
      if (e.target.closest(selector) && !can(key)) { e.preventDefault(); e.stopImmediatePropagation(); showDenied(label); return; }
    }
  }, true);

  function hideAppViews() {
    const selectors = ["#homeHero","#topProgressCard","#modeHubCard","#textbookHubCard","#bookProblemHubCard","#bookTheoryHubCard","#airlineHubCard","#wrongReviewHubCard","#wrongReviewFilterCard","#aviwikiHomeCard","#aviwikiReaderCard","#theoryCard","#resourceLibraryCard","#resourceViewerCard","#controlsCard","#quizCard","#resultCard","#statsCard","#errorsCard","#adminErrorReportsCard"];
    selectors.forEach(sel => $(sel)?.classList.add("hidden"));
  }
  function closeMemberManagement() { $("#memberManagementCard")?.classList.add("hidden"); }
  document.addEventListener("click", e => {
    if (!e.target.closest("#memberManagementCard,#memberManagementBtn")) {
      const navish=e.target.closest("header nav button,header nav a,#modeHubCard button,#aviwikiHomeCard button");
      if (navish) closeMemberManagement();
    }
  }, true);

  function featureMapFor(userId) {
    const map={...DEFAULT_ACCESS};
    featureRows.filter(r=>r.user_id===userId).forEach(r=>{ if(r.feature_key in map) map[r.feature_key]=r.enabled!==false; });
    return map;
  }
  function statusLabel(status){ return status==="approved"?"승인 완료":status==="rejected"?"거절":"승인 대기"; }
  function dateLabel(value){ if(!value)return ""; try{return new Date(value).toLocaleString("ko-KR",{dateStyle:"medium",timeStyle:"short"});}catch{return value;} }
  function localDateKey(){ const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; }
  function totalQuestionCount(){ return Math.max(0, Number(window.PilotBankRuntime?.totalQuestionCount || 0)); }
  function formatDuration(seconds){
    const total=Math.max(0,Number(seconds||0)); const h=Math.floor(total/3600); const m=Math.floor((total%3600)/60);
    if(h>0) return `${h.toLocaleString()}시간 ${m}분`;
    return `${m}분`;
  }
  function statsFor(userId){ return learningStats.get(userId) || null; }
  function learningStatsHtml(userId){
    const st=statsFor(userId);
    if(!st) return `<div class="member-admin-learning"><div class="member-learning-stat"><span>오늘 학습</span><strong>-</strong><small>통계 불러오는 중</small></div><div class="member-learning-stat"><span>총 학습</span><strong>-</strong><small>서버 누적</small></div><div class="member-learning-stat"><span>진도</span><strong>-</strong><small>고유 문제 기준</small></div><div class="member-learning-stat"><span>정답률</span><strong>-</strong><small>누적 풀이 기준</small></div></div>`;
    const total=Number(st.total_questions||totalQuestionCount()||0);
    const solved=Number(st.solved_questions||0);
    const progress=st.progress_pct==null?0:Number(st.progress_pct);
    const accuracy=st.accuracy_pct==null?"-":`${Number(st.accuracy_pct)}%`;
    const attempts=Number(st.attempt_count||0);
    return `<div class="member-admin-learning">
      <div class="member-learning-stat"><span>오늘 학습</span><strong>${escapeHtml(formatDuration(st.today_seconds))}</strong><small>${escapeHtml(localDateKey())}</small></div>
      <div class="member-learning-stat"><span>총 학습</span><strong>${escapeHtml(formatDuration(st.total_seconds))}</strong><small>서버 누적 학습시간</small></div>
      <div class="member-learning-stat"><span>진도</span><strong>${progress}%</strong><small>${solved.toLocaleString()} / ${total.toLocaleString()}문제</small></div>
      <div class="member-learning-stat"><span>정답률</span><strong>${accuracy}</strong><small>누적 ${attempts.toLocaleString()}회 풀이</small></div>
    </div>`;
  }

  function renderTabs() {
    const counts={pending:0,approved:0,rejected:0}; members.forEach(m=>counts[m.approval_status]=(counts[m.approval_status]||0)+1);
    const tabs=$("#memberManagementTabs"); if(!tabs)return;
    tabs.innerHTML=["pending","approved","rejected"].map(s=>`<button class="member-admin-tab ${activeStatus===s?"active":""}" data-member-status="${s}" type="button">${statusLabel(s)} <span class="member-admin-count">${counts[s]||0}</span></button>`).join("");
    const badge=$("#memberPendingBadge"); if(badge){badge.textContent=counts.pending||0; badge.classList.toggle("hidden",!(counts.pending>0));}
  }
  function renderMembers() {
    renderTabs(); const list=$("#memberManagementList"); if(!list)return;
    const rows=members.filter(m=>m.approval_status===activeStatus).sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
    if(!rows.length){list.innerHTML='<div class="member-admin-empty">해당 상태의 회원이 없습니다.</div>';return;}
    list.innerHTML=rows.map(m=>{
      const access=featureMapFor(m.id), admin=!!m.is_admin;
      return `<article class="member-admin-card" data-member-id="${m.id}">
        <div class="member-admin-head"><div><div class="member-admin-name">${escapeHtml(m.username||"이름 없음")}${admin?' <span class="auth-admin-badge">ADMIN</span>':''}</div><div class="member-admin-email">${escapeHtml(m.email||"")}</div><div class="member-admin-meta">가입 ${escapeHtml(dateLabel(m.created_at))}</div></div><span class="member-status ${escapeHtml(m.approval_status)}">${statusLabel(m.approval_status)}</span></div>
        ${learningStatsHtml(m.id)}
        <div class="member-admin-actions">
          ${m.approval_status!=="approved"?'<button class="button" type="button" data-member-action="approve">승인</button>':''}
          ${m.approval_status!=="rejected"&&!admin?'<button class="button danger-outline" type="button" data-member-action="reject">거절</button>':''}
        </div>
        <div class="member-admin-features">${FEATURES.map(f=>`<label class="member-feature-toggle ${admin?'admin-disabled':''}"><span><strong>${f.label}</strong><small>${f.desc}</small></span><input type="checkbox" data-feature-key="${f.key}" ${access[f.key]?'checked':''} ${admin?'disabled':''}></label>`).join("")}</div>
        ${admin?'<div class="member-admin-meta">관리자 계정은 모든 일반 기능에 항상 접근할 수 있습니다.</div>':'<div class="member-admin-save-row"><button class="button secondary" type="button" data-member-action="save-features">권한 저장</button></div>'}
      </article>`;
    }).join("");
  }

  async function loadLearningStats() {
    if (!isAdmin() || !window.supabaseClient) return;
    const total=totalQuestionCount();
    const {data,error}=await window.supabaseClient.rpc("admin_member_learning_overview", {
      p_study_date: localDateKey(),
      p_total_questions: total
    });
    if(error){
      console.warn("[MemberAdmin] learning overview",error);
      return false;
    }
    learningStats=new Map((data||[]).map(row=>[row.user_id,row]));
    return true;
  }

  async function loadMembers() {
    if (!isAdmin() || !window.supabaseClient) return;
    const status=$("#memberManagementStatus"); if(status)status.textContent="회원 정보와 학습 현황을 불러오는 중...";
    const [pRes,fRes]=await Promise.all([
      window.supabaseClient.from("profiles").select("id,email,username,approval_status,is_admin,created_at").order("created_at",{ascending:false}),
      window.supabaseClient.from("user_feature_access").select("user_id,feature_key,enabled,updated_at")
    ]);
    if(pRes.error){ if(status)status.textContent=`불러오기 실패: ${pRes.error.message}`; return; }
    members=pRes.data||[]; featureRows=fRes.error?[]:(fRes.data||[]);
    if(fRes.error) console.warn("[MemberAdmin] feature rows",fRes.error);
    const statsOk=await loadLearningStats();
    if(status)status.textContent=`전체 ${members.length}명${statsOk===false?" · 학습 통계는 SQL 업데이트 후 표시됩니다.":" · 학습 현황 포함"}`;
    renderMembers();
  }

  async function setApproval(userId,statusValue) {
    const {error}=await window.supabaseClient.from("profiles").update({approval_status:statusValue}).eq("id",userId);
    if(error){alert(`상태 변경에 실패했습니다.\n${error.message}`);return;}
    const member=members.find(m=>m.id===userId); if(member)member.approval_status=statusValue;
    renderMembers();
  }
  async function saveFeatures(card,userId) {
    const rows=FEATURES.map(f=>({user_id:userId,feature_key:f.key,enabled:!!card.querySelector(`[data-feature-key="${f.key}"]`)?.checked,updated_at:new Date().toISOString()}));
    const btn=card.querySelector('[data-member-action="save-features"]'); if(btn){btn.disabled=true;btn.textContent="저장 중...";}
    const {error}=await window.supabaseClient.from("user_feature_access").upsert(rows,{onConflict:"user_id,feature_key"});
    if(btn){btn.disabled=false;btn.textContent="권한 저장";}
    if(error){alert(`권한 저장에 실패했습니다.\n${error.message}`);return;}
    featureRows=featureRows.filter(r=>r.user_id!==userId).concat(rows);
    alert("기능 접근 권한을 저장했습니다. 해당 사용자는 다음 로그인/새로고침부터 변경된 권한이 적용됩니다.");
  }

  async function showMemberManagement() {
    if(!isAdmin()) return;
    hideAppViews(); $("#memberManagementCard")?.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); await loadMembers();
  }

  function wireAdminUI() {
    const btn=$("#memberManagementBtn"); if(btn)btn.classList.toggle("hidden",!isAdmin());
    btn?.addEventListener("click",showMemberManagement);
    $("#closeMemberManagementBtn")?.addEventListener("click",()=>{closeMemberManagement(); $("#homeNavBtn")?.click();});
    $("#refreshMembersBtn")?.addEventListener("click",loadMembers);
    $("#memberManagementTabs")?.addEventListener("click",e=>{const b=e.target.closest("[data-member-status]");if(!b)return;activeStatus=b.dataset.memberStatus;renderMembers();});
    $("#memberManagementList")?.addEventListener("click",async e=>{const b=e.target.closest("[data-member-action]");if(!b)return;const card=b.closest("[data-member-id]");if(!card)return;const id=card.dataset.memberId; if(b.dataset.memberAction==="approve")await setApproval(id,"approved");if(b.dataset.memberAction==="reject"&&confirm("이 회원의 이용 승인을 거절하시겠습니까?"))await setApproval(id,"rejected");if(b.dataset.memberAction==="save-features")await saveFeatures(card,id);});
  }

  window.addEventListener("pilotbank:bank-loaded", async () => {
    if(!isAdmin()) return;
    const ok=await loadLearningStats();
    if(ok && !$("#memberManagementCard")?.classList.contains("hidden")) renderMembers();
  });

  async function init() {
    injectStyles();
    try { await window.PilotBankAuth?.requireLogin?.(); } catch {}
    applyFeatureVisibility(); wireAdminUI();
    if(isAdmin()) loadMembers();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0)); else setTimeout(init,0);
})();
