(() => {
  "use strict";

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const SUBJECTS = ["항공기상","검댕이 항공법규","항공교통통신","K-AIM","비행이론","공중항법"];
  const STAGE_MAX = {"K-AIM":30,"비행이론":23,"공중항법":31};
  const state = {
    groups: [],
    activeGroupId: null,
    dashboardDate: localDateKey(),
    eligible: [],
    selectedIds: new Set(),
    inviteMode: "create",
    setupError: null,
    refreshTimer: null,
  };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  }
  function profile(){ return window.PilotBankAuth?.getCurrentProfile?.() || null; }
  function userId(){ return profile()?.id || null; }
  function hasAccess(){ return !!userId() && window.PilotBankAuth?.canAccessFeature?.("airline_course") !== false; }
  function sb(){ return window.supabaseClient || null; }
  function localDateKey(d=new Date()) {
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }
  function fmtDate(v){
    try { return new Date(`${v}T00:00:00`).toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"short"}); }
    catch { return v || ""; }
  }
  function fmtDuration(seconds){
    const mins=Math.max(0,Math.floor(Number(seconds||0)/60));
    const h=Math.floor(mins/60), m=mins%60;
    return h ? `${h}시간 ${m}분` : `${m}분`;
  }
  function errText(error){
    const msg=error?.message || String(error || "알 수 없는 오류");
    if (/study_group_|function .* does not exist|schema cache|PGRST202/i.test(msg)) {
      return "스터디그룹 DB가 아직 준비되지 않았습니다. Supabase SQL Editor에서 V11.59_STUDY_GROUP.sql을 먼저 실행해 주세요.";
    }
    if (/Airline-course access/i.test(msg)) return "항공사 대비 과정 접근 권한이 있는 회원만 스터디그룹을 이용할 수 있습니다.";
    return msg;
  }
  async function rpc(name,args={}){
    if(!sb()) throw new Error("Supabase 연결을 확인할 수 없습니다.");
    const {data,error}=await sb().rpc(name,args);
    if(error) throw error;
    return data;
  }

  function injectUI(){
    if(!$("#studyGroupNavBtn")){
      const btn=document.createElement("button");
      btn.id="studyGroupNavBtn"; btn.type="button"; btn.className="button secondary nav-action"; btn.title="스터디그룹";
      btn.innerHTML='<span class="nav-icon">◫</span><span class="nav-label">스터디그룹</span><span id="studyGroupInviteBadge" class="nav-pending-badge hidden">0</span>';
      const stats=$("#statsBtn"); stats?.parentNode?.insertBefore(btn,stats);
    }

    if(!$("#studyGroupCard")){
      const section=document.createElement("section");
      section.id="studyGroupCard"; section.className="card study-group-page hidden";
      section.innerHTML=`
        <div class="section-head study-group-page-head">
          <div><span class="eyebrow">STUDY GROUP</span><h2>스터디그룹</h2><p class="muted">그룹장이 정한 오늘의 공부시간·학습진도·문제 목표를 함께 달성하세요.</p></div>
          <div class="study-group-head-actions">
            <button id="studyGroupCreateBtn" class="button" type="button">＋ 스터디그룹 만들기</button>
            <button id="studyGroupRefreshBtn" class="button secondary" type="button">새로고침</button>
            <button id="studyGroupCloseBtn" class="button secondary" type="button">닫기</button>
          </div>
        </div>
        <div id="studyGroupSetupError" class="study-group-setup-error hidden"></div>
        <div class="study-group-layout">
          <aside class="study-group-sidebar">
            <div class="study-group-sidebar-title"><strong>내 그룹</strong><span id="studyGroupCount" class="muted"></span></div>
            <div id="studyGroupList" class="study-group-list"><div class="notice">그룹을 불러오는 중입니다.</div></div>
          </aside>
          <div class="study-group-main">
            <div id="studyGroupEmpty" class="study-group-empty">
              <div class="study-group-empty-icon">◫</div><h3>함께 공부할 그룹을 만들어 보세요.</h3>
              <p class="muted">항공사 대비 과정 접근 권한이 있는 회원만 초대할 수 있습니다.</p>
            </div>
            <div id="studyGroupDetail" class="hidden">
              <div class="study-group-detail-head">
                <div><span id="studyGroupRoleBadge" class="study-group-role-badge">MEMBER</span><h3 id="studyGroupName">스터디그룹</h3><p id="studyGroupMemberMeta" class="muted"></p></div>
                <div id="studyGroupLeaderActions" class="study-group-detail-actions hidden">
                  <button id="studyGroupInviteMoreBtn" class="button secondary" type="button">회원 추가 초대</button>
                  <button id="studyGroupRenameBtn" class="button secondary" type="button">그룹명 변경</button>
                  <button id="studyGroupDeleteBtn" class="button danger-outline" type="button">그룹 삭제</button>
                </div>
                <div id="studyGroupMemberActions" class="study-group-detail-actions hidden">
                  <button id="studyGroupLeaveBtn" class="button danger-outline" type="button">그룹 탈퇴</button>
                </div>
              </div>
              <div class="study-group-datebar">
                <label><span>조회 날짜</span><input id="studyGroupDate" type="date"></label>
                <button id="studyGroupTodayBtn" class="button secondary" type="button">오늘</button>
                <button id="studyGroupDashboardRefreshBtn" class="button secondary" type="button">현황 갱신</button>
              </div>
              <section id="studyGroupGoalCard" class="study-group-goal-card">
                <div class="study-group-goal-head"><div><span class="eyebrow">DAILY GOAL</span><h3 id="studyGroupGoalTitle">오늘의 목표</h3></div><span id="studyGroupGoalState" class="study-group-goal-state">목표 미설정</span></div>
                <div id="studyGroupGoalSummary" class="study-group-goal-summary"><div class="notice">목표를 불러오는 중입니다.</div></div>
                <form id="studyGroupGoalForm" class="study-group-goal-form hidden">
                  <div class="study-group-form-grid">
                    <label><span>공부시간 목표</span><div class="study-group-input-with-unit"><input id="studyGoalMinutes" type="number" min="0" max="1440" step="10" value="120"><span>분</span></div></label>
                    <label><span>이론 교재</span><select id="studyGoalSubject"><option value="">진도 목표 없음</option>${SUBJECTS.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select></label>
                    <label><span>목표 단계</span><div class="study-group-input-with-unit"><input id="studyGoalStage" type="number" min="1" step="1" placeholder="예: 10"><span>단계</span></div><small id="studyGoalStageHint" class="muted"></small></label>
                    <label><span>문제 풀이 목표</span><div class="study-group-input-with-unit"><input id="studyGoalQuestions" type="number" min="0" max="10000" step="5" value="0"><span>문항</span></div></label>
                  </div>
                  <label class="study-group-note-label"><span>그룹장 메모</span><textarea id="studyGoalNote" maxlength="500" rows="2" placeholder="예: 오늘은 공중항법 8단계까지 끝내고 오답 1회 복습"></textarea></label>
                  <div class="study-group-form-actions"><button class="button" type="submit">목표 저장</button><button id="studyGroupGoalClearBtn" class="button secondary" type="button">이 날짜 목표 삭제</button></div>
                </form>
              </section>
              <section class="study-group-members-section">
                <div class="study-group-section-title"><div><span class="eyebrow">MEMBERS</span><h3>그룹원 달성 현황</h3></div><span class="muted">학습시간은 서버 반영까지 약간 지연될 수 있습니다.</span></div>
                <div id="studyGroupDashboard" class="study-group-dashboard"><div class="notice">현황을 불러오는 중입니다.</div></div>
              </section>
            </div>
          </div>
        </div>`;
      $("main.container")?.append(section);
    }

    if(!$("#studyGroupModal")){
      const modal=document.createElement("div");
      modal.id="studyGroupModal"; modal.className="study-group-modal hidden";
      modal.innerHTML=`<div class="study-group-modal-backdrop" data-study-group-close-modal></div><div class="study-group-modal-panel" role="dialog" aria-modal="true" aria-labelledby="studyGroupModalTitle">
        <div class="study-group-modal-head"><div><span class="eyebrow">STUDY GROUP</span><h2 id="studyGroupModalTitle">스터디그룹 만들기</h2></div><button class="study-group-modal-x" type="button" data-study-group-close-modal aria-label="닫기">×</button></div>
        <div id="studyGroupCreateNameWrap"><label class="study-group-modal-label"><span>스터디그룹 이름</span><input id="studyGroupCreateName" type="text" maxlength="60" placeholder="예: 파라타 필기 스터디"></label></div>
        <label class="study-group-modal-label"><span>초대할 회원 검색</span><input id="studyGroupMemberSearch" type="search" placeholder="회원 이름 검색"></label>
        <p class="muted study-group-modal-help">항공사 대비 과정 접근 권한이 부여된 승인 회원만 표시됩니다.</p>
        <div id="studyGroupEligibleList" class="study-group-eligible-list"><div class="notice">회원 목록을 불러오는 중입니다.</div></div>
        <div class="study-group-modal-footer"><span id="studyGroupSelectedCount" class="muted">0명 선택</span><div><button class="button secondary" type="button" data-study-group-close-modal>취소</button><button id="studyGroupModalSubmit" class="button" type="button">그룹 만들기</button></div></div>
      </div>`;
      document.body.append(modal);
    }

    if(!$("#studyGroupInvitesSection")){
      const stats=$("#statsCard");
      const summary=$("#statsSummary",stats);
      const wrap=document.createElement("section");
      wrap.id="studyGroupInvitesSection"; wrap.className="mypage-section study-group-invites-section";
      wrap.innerHTML=`<div class="mypage-section-title"><div><span class="eyebrow">STUDY GROUP INVITES</span><h3>스터디그룹 초대</h3></div><button id="studyGroupInviteRefreshBtn" class="mini-button secondary" type="button">새로고침</button></div><div id="studyGroupInviteList" class="study-group-invite-list"><div class="notice">초대를 확인하는 중입니다.</div></div>`;
      if(summary) summary.insertAdjacentElement("afterend",wrap); else stats?.append(wrap);
    }
  }

  function hideOtherViews(){
    $$("main.container > section").forEach(el=>{ if(el.id!=="studyGroupCard") el.classList.add("hidden"); });
    $("#memberManagementCard")?.classList.add("hidden");
  }
  function openView(){
    if(!hasAccess()) return;
    hideOtherViews(); $("#studyGroupCard")?.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"});
    loadGroups(true);
    startRefreshTimer();
  }
  function closeView(){ $("#studyGroupCard")?.classList.add("hidden"); stopRefreshTimer(); }
  function startRefreshTimer(){ stopRefreshTimer(); state.refreshTimer=setInterval(()=>{ if(!$("#studyGroupCard")?.classList.contains("hidden") && state.activeGroupId) loadDashboard(false); },60000); }
  function stopRefreshTimer(){ if(state.refreshTimer){clearInterval(state.refreshTimer);state.refreshTimer=null;} }
  function showSetupError(error){
    state.setupError=errText(error); const box=$("#studyGroupSetupError"); if(box){box.textContent=state.setupError;box.classList.remove("hidden");}
  }
  function clearSetupError(){ state.setupError=null; $("#studyGroupSetupError")?.classList.add("hidden"); }

  async function loadInvites(){
    if(!hasAccess() || !sb()) return [];
    try{
      const rows=await rpc("study_group_my_invites");
      clearSetupError(); renderInvites(rows||[]); updateBadge((rows||[]).length); return rows||[];
    }catch(e){ console.warn("[StudyGroup] invites",e); updateBadge(0); const list=$("#studyGroupInviteList"); if(list)list.innerHTML=`<div class="notice">${esc(errText(e))}</div>`; return []; }
  }
  function updateBadge(n){ const b=$("#studyGroupInviteBadge"); if(!b)return; b.textContent=n; b.classList.toggle("hidden",!n); }
  function renderInvites(rows){
    const list=$("#studyGroupInviteList"); if(!list)return;
    if(!rows.length){list.innerHTML='<div class="study-group-invite-empty">새로운 스터디그룹 초대가 없습니다.</div>';return;}
    list.innerHTML=rows.map(r=>`<article class="study-group-invite-card" data-invite-id="${esc(r.invite_id)}"><div><strong>${esc(r.group_name)}</strong><p><b>${esc(r.inviter_username||"그룹장")}</b>님이 스터디그룹에 초대했습니다.</p><small>${esc(new Date(r.created_at).toLocaleString("ko-KR"))}</small></div><div class="study-group-invite-actions"><button class="button" type="button" data-invite-response="accept">수락</button><button class="button secondary" type="button" data-invite-response="decline">거절</button></div></article>`).join("");
  }
  async function respondInvite(id,accept,button){
    if(button){button.disabled=true;button.textContent=accept?"수락 중...":"처리 중...";}
    try{ await rpc("study_group_respond_invite",{p_invite_id:id,p_accept:!!accept}); await Promise.all([loadInvites(),loadGroups(false)]); if(accept) openView(); }
    catch(e){ alert(`초대 처리에 실패했습니다.\n${errText(e)}`); }
    finally{if(button?.isConnected){button.disabled=false;button.textContent=accept?"수락":"거절";}}
  }

  async function loadGroups(preserve=true){
    if(!hasAccess() || !sb()) return;
    const list=$("#studyGroupList"); if(list && !preserve) list.innerHTML='<div class="notice">그룹을 불러오는 중입니다.</div>';
    try{
      const rows=await rpc("study_group_my_groups"); state.groups=rows||[]; clearSetupError();
      if(!state.groups.some(g=>g.group_id===state.activeGroupId)) state.activeGroupId=state.groups[0]?.group_id||null;
      renderGroupList();
      if(state.activeGroupId) await loadDashboard(false); else renderNoGroup();
    }catch(e){ console.warn("[StudyGroup] groups",e); showSetupError(e); if(list)list.innerHTML=`<div class="notice">${esc(errText(e))}</div>`; renderNoGroup(); }
  }
  function renderGroupList(){
    const list=$("#studyGroupList"), count=$("#studyGroupCount"); if(count)count.textContent=`${state.groups.length}개`;
    if(!list)return;
    if(!state.groups.length){list.innerHTML='<div class="study-group-sidebar-empty">가입한 그룹이 없습니다.</div>';return;}
    list.innerHTML=state.groups.map(g=>`<button class="study-group-list-item ${g.group_id===state.activeGroupId?"active":""}" type="button" data-group-id="${esc(g.group_id)}"><span><strong>${esc(g.group_name)}</strong><small>${g.is_leader?"그룹장":"그룹원"} · ${Number(g.member_count||0)}명</small></span><span>›</span></button>`).join("");
  }
  function renderNoGroup(){ $("#studyGroupEmpty")?.classList.remove("hidden"); $("#studyGroupDetail")?.classList.add("hidden"); }
  function activeGroup(){ return state.groups.find(g=>g.group_id===state.activeGroupId)||null; }

  async function loadDashboard(showLoading=true){
    const g=activeGroup(); if(!g){renderNoGroup();return;}
    $("#studyGroupEmpty")?.classList.add("hidden"); $("#studyGroupDetail")?.classList.remove("hidden");
    $("#studyGroupName").textContent=g.group_name; $("#studyGroupMemberMeta").textContent=`그룹원 ${Number(g.member_count||0)}명 · ${g.is_leader?"내가 그룹장입니다.":"그룹장이 설정한 목표를 함께 달성합니다."}`;
    $("#studyGroupRoleBadge").textContent=g.is_leader?"LEADER":"MEMBER"; $("#studyGroupRoleBadge").classList.toggle("leader",!!g.is_leader);
    $("#studyGroupLeaderActions")?.classList.toggle("hidden",!g.is_leader); $("#studyGroupMemberActions")?.classList.toggle("hidden",!!g.is_leader); $("#studyGroupGoalForm")?.classList.toggle("hidden",!g.is_leader);
    const dateInput=$("#studyGroupDate"); if(dateInput)dateInput.value=state.dashboardDate;
    $("#studyGroupGoalTitle").textContent=`${fmtDate(state.dashboardDate)} 목표`;
    if(showLoading) $("#studyGroupDashboard").innerHTML='<div class="notice">그룹원 현황을 불러오는 중입니다.</div>';
    try{
      const rows=await rpc("study_group_dashboard",{p_group_id:g.group_id,p_goal_date:state.dashboardDate}); clearSetupError(); renderDashboard(rows||[],g);
    }catch(e){ console.warn("[StudyGroup] dashboard",e); $("#studyGroupDashboard").innerHTML=`<div class="notice">${esc(errText(e))}</div>`; showSetupError(e); }
  }

  function goalFromRows(rows){ return rows[0]||null; }
  function renderDashboard(rows,g){
    const goal=goalFromRows(rows); renderGoal(goal,g);
    const box=$("#studyGroupDashboard"); if(!box)return;
    if(!rows.length){box.innerHTML='<div class="notice">그룹원이 없습니다.</div>';return;}
    box.innerHTML=rows.map(r=>{
      const targetMin=Number(r.target_study_minutes||0), targetQ=Number(r.target_questions||0), stage=r.target_stage_order==null?null:Number(r.target_stage_order);
      const timeText=targetMin>0?`${fmtDuration(r.study_seconds)} / ${targetMin>=60?`${Math.floor(targetMin/60)}시간 ${targetMin%60}분`:`${targetMin}분`}`:fmtDuration(r.study_seconds);
      const progressText=stage?`${esc(r.target_subject)} ${Number(r.passed_stage_count||0)} / ${stage}단계`:`완료 단계 ${Number(r.passed_stage_count||0)}`;
      const qText=targetQ>0?`${Number(r.question_count||0)} / ${targetQ}문항`:`오늘 ${Number(r.question_count||0)}문항`;
      const noGoal=!r.has_goal;
      return `<article class="study-group-member-card ${r.all_done?"done":""}" data-member-user-id="${esc(r.user_id)}">
        <div class="study-group-member-head"><div><strong>${esc(r.username)}${r.is_leader?' <span class="study-group-mini-leader">그룹장</span>':''}</strong><span class="study-group-member-status ${r.all_done?"done":noGoal?"none":"pending"}">${r.all_done?"✓ 목표 달성":noGoal?"목표 미설정":"진행 중"}</span></div>${g.is_leader&&!r.is_leader?'<button class="study-group-member-remove" type="button" data-remove-member>내보내기</button>':''}</div>
        <div class="study-group-metric-grid">
          <div class="study-group-metric ${r.study_time_done?"ok":""}"><span>공부시간</span><strong>${esc(timeText)}</strong>${targetMin?`<small>${r.study_time_done?"✓ 달성":"목표까지 진행 중"}</small>`:"<small>시간 목표 없음</small>"}</div>
          <div class="study-group-metric ${r.progress_done?"ok":""}"><span>학습 진도</span><strong>${esc(progressText)}</strong>${stage?`<small>${r.progress_done?"✓ 달성":"목표까지 진행 중"}</small>`:"<small>진도 목표 없음</small>"}</div>
          <div class="study-group-metric ${r.questions_done?"ok":""}"><span>문제 풀이</span><strong>${esc(qText)}</strong>${targetQ?`<small>${r.questions_done?"✓ 달성":"목표까지 진행 중"}</small>`:"<small>문항 목표 없음</small>"}</div>
        </div>
      </article>`;
    }).join("");
  }

  function renderGoal(goal,g){
    const stateEl=$("#studyGroupGoalState"), sum=$("#studyGroupGoalSummary");
    const has=!!goal?.has_goal;
    if(stateEl){stateEl.textContent=has?"목표 설정됨":"목표 미설정";stateEl.classList.toggle("set",has);}
    if(!sum)return;
    if(!has){sum.innerHTML='<div class="study-group-no-goal">이 날짜에는 아직 그룹 목표가 없습니다.'+(g.is_leader?' 아래에서 목표를 설정해 주세요.':' 그룹장이 목표를 설정하면 여기에 표시됩니다.')+'</div>'; if(g.is_leader) fillGoalForm(null); return;}
    const items=[];
    if(Number(goal.target_study_minutes||0)>0) items.push(`<div><span>공부시간</span><strong>${Number(goal.target_study_minutes)}분</strong></div>`);
    if(goal.target_stage_order) items.push(`<div><span>학습 진도</span><strong>${esc(goal.target_subject)} ${Number(goal.target_stage_order)}단계</strong></div>`);
    if(Number(goal.target_questions||0)>0) items.push(`<div><span>문제 풀이</span><strong>${Number(goal.target_questions)}문항</strong></div>`);
    sum.innerHTML=`<div class="study-group-goal-items">${items.join("")}</div>${goal.goal_note?`<div class="study-group-goal-note">“${esc(goal.goal_note)}”</div>`:""}`;
    if(g.is_leader) fillGoalForm(goal);
  }
  function fillGoalForm(goal){
    $("#studyGoalMinutes").value=goal?Number(goal.target_study_minutes||0):120;
    $("#studyGoalSubject").value=goal?.target_subject||"";
    $("#studyGoalStage").value=goal?.target_stage_order||"";
    $("#studyGoalQuestions").value=goal?Number(goal.target_questions||0):0;
    $("#studyGoalNote").value=goal?.goal_note||"";
    updateStageHint();
  }
  function updateStageHint(){
    const s=$("#studyGoalSubject")?.value||"", hint=$("#studyGoalStageHint"), input=$("#studyGoalStage");
    const max=STAGE_MAX[s]; if(hint) hint.textContent=max?`현재 ${s} 학습과정은 총 ${max}단계입니다.`:(s?"완료한 이론 단계 수를 기준으로 집계합니다.":"교재를 선택하면 단계 목표를 설정할 수 있습니다.");
    if(input){input.disabled=!s; input.max=max||""; if(!s)input.value="";}
  }
  async function saveGoal(e){
    e.preventDefault(); const g=activeGroup(); if(!g?.is_leader)return;
    const minutes=Number($("#studyGoalMinutes").value||0), subject=$("#studyGoalSubject").value||null, stage=$("#studyGoalStage").value?Number($("#studyGoalStage").value):null, questions=Number($("#studyGoalQuestions").value||0), note=$("#studyGoalNote").value||"";
    if(minutes<=0 && !stage && questions<=0){alert("공부시간, 학습단계, 문제 수 중 하나 이상의 목표를 설정해 주세요.");return;}
    try{await rpc("study_group_set_daily_goal",{p_group_id:g.group_id,p_goal_date:state.dashboardDate,p_target_study_minutes:minutes,p_target_subject:subject,p_target_stage_order:stage,p_target_questions:questions,p_note:note}); await loadDashboard(false);}
    catch(e2){alert(`목표 저장에 실패했습니다.\n${errText(e2)}`);}
  }
  async function clearGoal(){const g=activeGroup();if(!g?.is_leader||!confirm(`${fmtDate(state.dashboardDate)} 목표를 삭제할까요?`))return;try{await rpc("study_group_clear_daily_goal",{p_group_id:g.group_id,p_goal_date:state.dashboardDate});await loadDashboard(false);}catch(e){alert(errText(e));}}

  async function openMemberModal(mode="create"){
    state.inviteMode=mode; const g=activeGroup();
    $("#studyGroupModalTitle").textContent=mode==="create"?"스터디그룹 만들기":"회원 추가 초대";
    $("#studyGroupCreateNameWrap")?.classList.toggle("hidden",mode!=="create");
    $("#studyGroupModalSubmit").textContent=mode==="create"?"그룹 만들기":"초대 보내기";
    $("#studyGroupCreateName").value=""; $("#studyGroupMemberSearch").value=""; state.selectedIds=new Set();
    $("#studyGroupEligibleList").innerHTML='<div class="notice">초대 가능한 회원을 불러오는 중입니다.</div>';
    $("#studyGroupModal").classList.remove("hidden"); document.body.classList.add("study-group-modal-open");
    try{state.eligible=await rpc("study_group_eligible_members",{p_group_id:mode==="invite"?g?.group_id:null});renderEligible();}
    catch(e){state.eligible=[];$("#studyGroupEligibleList").innerHTML=`<div class="notice">${esc(errText(e))}</div>`;}
  }
  function closeModal(){ $("#studyGroupModal")?.classList.add("hidden"); document.body.classList.remove("study-group-modal-open"); }
  function renderEligible(){
    const q=($("#studyGroupMemberSearch")?.value||"").trim().toLowerCase(); const rows=state.eligible.filter(r=>(r.username||"").toLowerCase().includes(q)); const list=$("#studyGroupEligibleList"); if(!list)return;
    if(!rows.length){list.innerHTML='<div class="study-group-invite-empty">조건에 맞는 초대 가능 회원이 없습니다.</div>';updateSelectedCount();return;}
    list.innerHTML=rows.map(r=>`<label class="study-group-eligible-member"><input type="checkbox" value="${esc(r.user_id)}" ${state.selectedIds.has(r.user_id)?"checked":""}><span class="study-group-avatar">${esc((r.username||"회").slice(0,1).toUpperCase())}</span><span><strong>${esc(r.username||"회원")}</strong><small>항공사 대비 과정 접근 가능</small></span></label>`).join("");updateSelectedCount();
  }
  function updateSelectedCount(){const el=$("#studyGroupSelectedCount");if(el)el.textContent=`${state.selectedIds.size}명 선택`; }
  async function submitMemberModal(){
    const ids=Array.from(state.selectedIds), btn=$("#studyGroupModalSubmit"); btn.disabled=true;
    try{
      if(state.inviteMode==="create"){
        const name=$("#studyGroupCreateName").value.trim(); if(name.length<2){alert("스터디그룹 이름을 2자 이상 입력해 주세요.");return;}
        const groupId=await rpc("study_group_create",{p_name:name,p_invitee_ids:ids}); closeModal(); await loadGroups(false); state.activeGroupId=groupId; renderGroupList(); await loadDashboard(false);
      }else{
        const g=activeGroup(); if(!g)return; if(!ids.length){alert("초대할 회원을 선택해 주세요.");return;}
        const count=await rpc("study_group_invite_members",{p_group_id:g.group_id,p_invitee_ids:ids}); closeModal(); alert(`${Number(count||ids.length)}명에게 스터디그룹 초대를 보냈습니다.`);
      }
    }catch(e){alert(`처리하지 못했습니다.\n${errText(e)}`);}finally{btn.disabled=false;}
  }

  async function renameGroup(){const g=activeGroup();if(!g?.is_leader)return;const name=prompt("새 스터디그룹 이름을 입력하세요.",g.group_name);if(!name||name.trim()===g.group_name)return;try{await rpc("study_group_rename",{p_group_id:g.group_id,p_name:name.trim()});await loadGroups(false);}catch(e){alert(errText(e));}}
  async function deleteGroup(){const g=activeGroup();if(!g?.is_leader||!confirm(`“${g.group_name}” 스터디그룹을 삭제할까요?\n그룹원·초대·일일목표가 함께 삭제됩니다.`))return;try{await rpc("study_group_delete",{p_group_id:g.group_id});state.activeGroupId=null;await loadGroups(false);}catch(e){alert(errText(e));}}
  async function leaveGroup(){const g=activeGroup();if(!g||g.is_leader||!confirm(`“${g.group_name}” 스터디그룹에서 탈퇴할까요?`))return;try{await rpc("study_group_leave",{p_group_id:g.group_id});state.activeGroupId=null;await loadGroups(false);}catch(e){alert(errText(e));}}
  async function removeMember(card){const g=activeGroup(),id=card?.dataset.memberUserId,name=card?.querySelector("strong")?.textContent||"이 회원";if(!g?.is_leader||!id||!confirm(`${name}을(를) 스터디그룹에서 내보낼까요?`))return;try{await rpc("study_group_remove_member",{p_group_id:g.group_id,p_user_id:id});await loadGroups(false);}catch(e){alert(errText(e));}}

  function wireEvents(){
    $("#studyGroupNavBtn")?.addEventListener("click",openView);
    $("#studyGroupCloseBtn")?.addEventListener("click",()=>{$("#homeNavBtn")?.click();});
    $("#studyGroupCreateBtn")?.addEventListener("click",()=>openMemberModal("create"));
    $("#studyGroupRefreshBtn")?.addEventListener("click",()=>Promise.all([loadGroups(false),loadInvites()]));
    $("#studyGroupDashboardRefreshBtn")?.addEventListener("click",()=>loadDashboard(true));
    $("#studyGroupTodayBtn")?.addEventListener("click",()=>{state.dashboardDate=localDateKey();$("#studyGroupDate").value=state.dashboardDate;loadDashboard(true);});
    $("#studyGroupDate")?.addEventListener("change",e=>{state.dashboardDate=e.target.value||localDateKey();loadDashboard(true);});
    $("#studyGroupList")?.addEventListener("click",e=>{const b=e.target.closest("[data-group-id]");if(!b)return;state.activeGroupId=b.dataset.groupId;renderGroupList();loadDashboard(true);});
    $("#studyGroupGoalForm")?.addEventListener("submit",saveGoal);
    $("#studyGroupGoalClearBtn")?.addEventListener("click",clearGoal);
    $("#studyGoalSubject")?.addEventListener("change",updateStageHint);
    $("#studyGroupInviteMoreBtn")?.addEventListener("click",()=>openMemberModal("invite"));
    $("#studyGroupRenameBtn")?.addEventListener("click",renameGroup);
    $("#studyGroupDeleteBtn")?.addEventListener("click",deleteGroup);
    $("#studyGroupLeaveBtn")?.addEventListener("click",leaveGroup);
    $("#studyGroupDashboard")?.addEventListener("click",e=>{const b=e.target.closest("[data-remove-member]");if(b)removeMember(b.closest("[data-member-user-id]"));});
    $("#studyGroupMemberSearch")?.addEventListener("input",renderEligible);
    $("#studyGroupEligibleList")?.addEventListener("change",e=>{const input=e.target.closest("input[type=checkbox]");if(!input)return;if(input.checked)state.selectedIds.add(input.value);else state.selectedIds.delete(input.value);updateSelectedCount();});
    $("#studyGroupModalSubmit")?.addEventListener("click",submitMemberModal);
    $("#studyGroupModal")?.addEventListener("click",e=>{if(e.target.closest("[data-study-group-close-modal]"))closeModal();});
    $("#studyGroupInviteRefreshBtn")?.addEventListener("click",loadInvites);
    $("#studyGroupInviteList")?.addEventListener("click",e=>{const b=e.target.closest("[data-invite-response]");if(!b)return;const card=b.closest("[data-invite-id]");respondInvite(card?.dataset.inviteId,b.dataset.inviteResponse==="accept",b);});

    document.addEventListener("click",e=>{
      const nav=e.target.closest("header nav button,header nav a,#homeMyPageBtn");
      if(nav && nav.id!=="studyGroupNavBtn") closeView();
      if(e.target.closest("#statsBtn,#homeMyPageBtn")) setTimeout(loadInvites,50);
    },true);
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#studyGroupModal")?.classList.contains("hidden"))closeModal();});
  }

  async function init(){
    injectUI();
    try{await window.PilotBankAuth?.requireLogin?.();}catch{}
    const nav=$("#studyGroupNavBtn"); nav?.classList.toggle("hidden",!hasAccess());
    if(!hasAccess()){ $("#studyGroupInvitesSection")?.classList.add("hidden"); return; }
    wireEvents();
    await Promise.all([loadInvites(),loadGroups(true)]);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0)); else setTimeout(init,0);
})();
