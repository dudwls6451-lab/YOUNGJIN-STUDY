/* PilotBank v11.60.46 — Study Group Question Lab mount hotfix */
(() => {
  "use strict";

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const SUBJECTS=["항공기상","검댕이 항공법규","항공교통통신","K-AIM","비행이론","공중항법"];
  const STAGE_MAX={"K-AIM":30,"비행이론":23,"공중항법":31};
  const state={
    groups:[], activeGroupId:null, dashboardDate:localDateKey(), goals:[],
    eligible:[], selectedIds:new Set(), inviteMode:"create", setupError:null,
    refreshTimer:null, editingGoalId:null, boardPosts:[], expandedPostId:null,
    boardComments:new Map(), boardLoading:false,
    groupQuestions:[], questionMode:"solve", activeQuestionId:null, questionComments:new Map(), questionLoading:false
  };

  const QUESTION_LAB_HTML=`              <section class="study-group-question-section">
                <div class="study-group-section-title"><div><span class="eyebrow">GROUP QUESTION LAB</span><h3>그룹 문제은행</h3><p class="muted">그룹원이 직접 객관식 문제를 만들고, 서로 풀고, 문제별 댓글로 토론할 수 있습니다.</p></div><button id="studyGroupQuestionRefreshBtn" class="button secondary" type="button">문제 새로고침</button></div>
                <div class="study-group-question-tabs" role="tablist">
                  <button id="studyGroupQuestionSolveTab" class="study-group-question-tab active" type="button" data-question-mode="solve">문제 풀기</button>
                  <button id="studyGroupQuestionCreateTab" class="study-group-question-tab" type="button" data-question-mode="create">문제 만들기</button>
                  <button id="studyGroupQuestionListTab" class="study-group-question-tab" type="button" data-question-mode="list">문제 목록</button>
                </div>
                <div id="studyGroupQuestionSolvePanel" class="study-group-question-panel">
                  <div id="studyGroupQuestionPlayer" class="study-group-question-player"><div class="notice">그룹 문제를 불러오는 중입니다.</div></div>
                </div>
                <div id="studyGroupQuestionCreatePanel" class="study-group-question-panel hidden">
                  <form id="studyGroupQuestionForm" class="study-group-question-form" novalidate>
                    <label><span>문제</span><textarea id="studyGroupQuestionText" rows="3" maxlength="2000" placeholder="객관식 문제를 입력하세요."></textarea></label>
                    <div class="study-group-question-choice-grid">
                      <label><span>A</span><input id="studyGroupChoiceA" maxlength="1000" placeholder="선택지 A"></label>
                      <label><span>B</span><input id="studyGroupChoiceB" maxlength="1000" placeholder="선택지 B"></label>
                      <label><span>C</span><input id="studyGroupChoiceC" maxlength="1000" placeholder="선택지 C"></label>
                      <label><span>D</span><input id="studyGroupChoiceD" maxlength="1000" placeholder="선택지 D"></label>
                    </div>
                    <div class="study-group-question-meta-grid">
                      <label><span>정답</span><select id="studyGroupCorrectChoice"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label>
                      <label><span>과목/태그</span><input id="studyGroupQuestionTag" maxlength="80" placeholder="예: 공중항법, RVSM"></label>
                    </div>
                    <label><span>해설 (선택)</span><textarea id="studyGroupQuestionExplanation" rows="3" maxlength="4000" placeholder="정답 근거나 해설을 적어두면 풀이 후 공개됩니다."></textarea></label>
                    <div class="study-group-form-actions"><button class="button" type="submit">문제 등록</button><button id="studyGroupQuestionFormReset" class="button secondary" type="button">초기화</button></div>
                  </form>
                </div>
                <div id="studyGroupQuestionListPanel" class="study-group-question-panel hidden"><div id="studyGroupQuestionList" class="study-group-question-list"><div class="notice">문제 목록을 불러오는 중입니다.</div></div></div>
              </section>`;


  function ensureQuestionLabUI(){
    const detail=$("#studyGroupDetail");
    if(!detail)return false;

    const goalType=$("#studyGoalType");
    if(goalType&&!goalType.querySelector('option[value="question_create"]')){
      const opt=document.createElement("option");
      opt.value="question_create";opt.textContent="문제 만들기";goalType.append(opt);
    }
    const qWrap=$("#studyGoalQuestionsWrap");
    if(qWrap){const label=qWrap.querySelector("span");if(label&&!label.id)label.id="studyGoalQuestionsLabel";}

    const existingLab=$(".study-group-question-section",detail);
    if(existingLab&&!$("#studyGroupQuestionCreateTab",existingLab))existingLab.remove();
    if(!$("#studyGroupQuestionCreateTab",detail)){
      const holder=document.createElement("div");
      holder.innerHTML=QUESTION_LAB_HTML.trim();
      const section=holder.firstElementChild;
      const goal=$("#studyGroupGoalCard",detail);
      if(goal)goal.insertAdjacentElement("beforebegin",section);else detail.append(section);
    }

    const datebar=$(".study-group-datebar",detail);
    if(datebar&&!$("#studyGroupQuestionSolveQuickBtn",datebar)){
      const solve=document.createElement("button");
      solve.id="studyGroupQuestionSolveQuickBtn";solve.className="button secondary study-group-question-quick";solve.type="button";solve.textContent="문제 풀기";
      const create=document.createElement("button");
      create.id="studyGroupQuestionCreateQuickBtn";create.className="button study-group-question-quick";create.type="button";create.textContent="＋ 문제 만들기";
      datebar.append(solve,create);
    }
    return !!$("#studyGroupQuestionCreateTab");
  }

  function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
  function profile(){return window.PilotBankAuth?.getCurrentProfile?.()||null;}
  function userId(){return profile()?.id||null;}
  function hasAccess(){return !!userId()&&window.PilotBankAuth?.canAccessFeature?.("airline_course")!==false;}
  function sb(){return window.supabaseClient||null;}
  function localDateKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`;}
  function fmtDate(v){try{return new Date(`${v}T00:00:00`).toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"short"});}catch{return v||"";}}
  function fmtDateTime(v){try{return new Date(v).toLocaleString("ko-KR",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});}catch{return v||"";}}
  function fmtDuration(seconds){const mins=Math.max(0,Math.floor(Number(seconds||0)/60)),h=Math.floor(mins/60),m=mins%60;return h?`${h}시간 ${m}분`:`${m}분`;}
  function jsonArray(v){if(Array.isArray(v))return v;if(!v)return[];try{return JSON.parse(v);}catch{return[];}}
  function errText(error){
    const msg=error?.message||String(error||"알 수 없는 오류");
    if(/study_group_dashboard_v2|study_group_goals|study_group_board_|study_group_question_|study_group_questions|function .* does not exist|schema cache|PGRST202/i.test(msg)) return "스터디그룹 문제은행 DB가 아직 준비되지 않았습니다. Supabase SQL Editor에서 V11.60.45_STUDY_GROUP_QUESTION_LAB.sql을 실행해 주세요.";
    if(/study_group_|function .* does not exist/i.test(msg)) return "스터디그룹 DB가 아직 준비되지 않았습니다. V11.59_STUDY_GROUP.sql과 v11.59.1 추가 SQL 적용 여부를 확인해 주세요.";
    if(/Airline-course access/i.test(msg)) return "항공사 대비 과정 접근 권한이 있는 회원만 스터디그룹을 이용할 수 있습니다.";
    return msg;
  }
  async function rpc(name,args={}){if(!sb())throw new Error("Supabase 연결을 확인할 수 없습니다.");const {data,error}=await sb().rpc(name,args);if(error)throw error;return data;}

  function injectUI(){
    if(!$("#studyGroupNavBtn")){
      const btn=document.createElement("button");btn.id="studyGroupNavBtn";btn.type="button";btn.className="button secondary nav-action";btn.title="스터디그룹";
      btn.innerHTML='<span class="nav-icon">◫</span><span class="nav-label">스터디그룹</span><span id="studyGroupInviteBadge" class="nav-pending-badge hidden">0</span>';
      const stats=$("#statsBtn");stats?.parentNode?.insertBefore(btn,stats);
    }

    if(!$("#studyGroupCard")){
      const section=document.createElement("section");section.id="studyGroupCard";section.className="card study-group-page hidden";
      section.innerHTML=`
        <div class="section-head study-group-page-head">
          <div><span class="eyebrow">STUDY GROUP</span><h2>스터디그룹</h2><p class="muted">여러 개의 일일 목표를 함께 달성하고 게시판에서 소통하세요.</p></div>
          <div class="study-group-head-actions"><button id="studyGroupCreateBtn" class="button" type="button">＋ 스터디그룹 만들기</button><button id="studyGroupRefreshBtn" class="button secondary" type="button">새로고침</button><button id="studyGroupCloseBtn" class="button secondary" type="button">닫기</button></div>
        </div>
        <div id="studyGroupSetupError" class="study-group-setup-error hidden"></div>
        <div class="study-group-layout">
          <aside class="study-group-sidebar"><div class="study-group-sidebar-title"><strong>내 그룹</strong><span id="studyGroupCount" class="muted"></span></div><div id="studyGroupList" class="study-group-list"><div class="notice">그룹을 불러오는 중입니다.</div></div></aside>
          <div class="study-group-main">
            <div id="studyGroupEmpty" class="study-group-empty"><div class="study-group-empty-icon">◫</div><h3>함께 공부할 그룹을 만들어 보세요.</h3><p class="muted">항공사 대비 과정 접근 권한이 있는 회원만 초대할 수 있습니다.</p></div>
            <div id="studyGroupDetail" class="hidden">
              <div class="study-group-detail-head">
                <div><span id="studyGroupRoleBadge" class="study-group-role-badge">MEMBER</span><h3 id="studyGroupName">스터디그룹</h3><p id="studyGroupMemberMeta" class="muted"></p></div>
                <div id="studyGroupLeaderActions" class="study-group-detail-actions hidden"><button id="studyGroupInviteMoreBtn" class="button secondary" type="button">회원 추가 초대</button><button id="studyGroupRenameBtn" class="button secondary" type="button">그룹명 변경</button><button id="studyGroupDeleteBtn" class="button danger-outline" type="button">그룹 삭제</button></div>
                <div id="studyGroupMemberActions" class="study-group-detail-actions hidden"><button id="studyGroupLeaveBtn" class="button danger-outline" type="button">그룹 탈퇴</button></div>
              </div>
              <div class="study-group-datebar"><label><span>조회 날짜</span><input id="studyGroupDate" type="date"></label><button id="studyGroupTodayBtn" class="button secondary" type="button">오늘</button><button id="studyGroupDashboardRefreshBtn" class="button secondary" type="button">현황 갱신</button></div>

              <section id="studyGroupGoalCard" class="study-group-goal-card">
                <div class="study-group-goal-head"><div><span class="eyebrow">DAILY GOALS</span><h3 id="studyGroupGoalTitle">오늘의 목표</h3></div><div class="study-group-goal-head-actions"><span id="studyGroupGoalState" class="study-group-goal-state">0개</span><button id="studyGroupGoalAddBtn" class="button mini hidden" type="button">＋ 목표 추가</button></div></div>
                <div id="studyGroupGoalSummary" class="study-group-goal-summary"><div class="notice">목표를 불러오는 중입니다.</div></div>
                <form id="studyGroupGoalEditor" class="study-group-goal-form study-group-goal-editor hidden" novalidate>
                  <input id="studyGoalId" type="hidden">
                  <div class="study-group-goal-editor-head"><strong id="studyGoalEditorTitle">새 목표 추가</strong><button id="studyGoalEditorCloseBtn" class="study-group-inline-x" type="button" aria-label="닫기">×</button></div>
                  <div class="study-group-form-grid">
                    <label><span>목표 종류</span><select id="studyGoalType"><option value="study_time">공부시간</option><option value="theory_stage">이론 학습진도</option><option value="questions">문제 풀이</option><option value="question_create">문제 만들기</option></select></label>
                    <label><span>목표 이름</span><input id="studyGoalCustomTitle" type="text" maxlength="120" placeholder="예: 오전 집중공부"></label>
                    <label id="studyGoalMinutesWrap"><span>공부시간</span><div class="study-group-input-with-unit"><input id="studyGoalMinutes" type="number" min="1" max="1440" step="1" value="120"><span>분</span></div></label>
                    <label id="studyGoalQuestionsWrap" class="hidden"><span id="studyGoalQuestionsLabel">문제 풀이</span><div class="study-group-input-with-unit"><input id="studyGoalQuestions" type="number" min="1" max="10000" step="1" value="30"><span>문항</span></div></label>
                    <label id="studyGoalSubjectWrap" class="hidden"><span>이론 교재</span><select id="studyGoalSubject">${SUBJECTS.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select></label>
                    <label id="studyGoalStageWrap" class="hidden"><span>목표 단계</span><div class="study-group-input-with-unit"><input id="studyGoalStage" type="number" min="1" step="1" value="1"><span>단계</span></div><small id="studyGoalStageHint" class="muted"></small></label>
                  </div>
                  <label class="study-group-note-label"><span>메모</span><textarea id="studyGoalNote" maxlength="500" rows="2" placeholder="그룹원에게 전달할 목표 설명"></textarea></label>
                  <div class="study-group-form-actions"><button class="button" type="submit">저장</button><button id="studyGoalCancelBtn" class="button secondary" type="button">취소</button></div>
                </form>
              </section>

              <section class="study-group-question-section">
                <div class="study-group-section-title"><div><span class="eyebrow">GROUP QUESTION LAB</span><h3>그룹 문제은행</h3><p class="muted">그룹원이 직접 객관식 문제를 만들고, 서로 풀고, 문제별 댓글로 토론할 수 있습니다.</p></div><button id="studyGroupQuestionRefreshBtn" class="button secondary" type="button">문제 새로고침</button></div>
                <div class="study-group-question-tabs" role="tablist">
                  <button id="studyGroupQuestionSolveTab" class="study-group-question-tab active" type="button" data-question-mode="solve">문제 풀기</button>
                  <button id="studyGroupQuestionCreateTab" class="study-group-question-tab" type="button" data-question-mode="create">문제 만들기</button>
                  <button id="studyGroupQuestionListTab" class="study-group-question-tab" type="button" data-question-mode="list">문제 목록</button>
                </div>
                <div id="studyGroupQuestionSolvePanel" class="study-group-question-panel">
                  <div id="studyGroupQuestionPlayer" class="study-group-question-player"><div class="notice">그룹 문제를 불러오는 중입니다.</div></div>
                </div>
                <div id="studyGroupQuestionCreatePanel" class="study-group-question-panel hidden">
                  <form id="studyGroupQuestionForm" class="study-group-question-form" novalidate>
                    <label><span>문제</span><textarea id="studyGroupQuestionText" rows="3" maxlength="2000" placeholder="객관식 문제를 입력하세요."></textarea></label>
                    <div class="study-group-question-choice-grid">
                      <label><span>A</span><input id="studyGroupChoiceA" maxlength="1000" placeholder="선택지 A"></label>
                      <label><span>B</span><input id="studyGroupChoiceB" maxlength="1000" placeholder="선택지 B"></label>
                      <label><span>C</span><input id="studyGroupChoiceC" maxlength="1000" placeholder="선택지 C"></label>
                      <label><span>D</span><input id="studyGroupChoiceD" maxlength="1000" placeholder="선택지 D"></label>
                    </div>
                    <div class="study-group-question-meta-grid">
                      <label><span>정답</span><select id="studyGroupCorrectChoice"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label>
                      <label><span>과목/태그</span><input id="studyGroupQuestionTag" maxlength="80" placeholder="예: 공중항법, RVSM"></label>
                    </div>
                    <label><span>해설 (선택)</span><textarea id="studyGroupQuestionExplanation" rows="3" maxlength="4000" placeholder="정답 근거나 해설을 적어두면 풀이 후 공개됩니다."></textarea></label>
                    <div class="study-group-form-actions"><button class="button" type="submit">문제 등록</button><button id="studyGroupQuestionFormReset" class="button secondary" type="button">초기화</button></div>
                  </form>
                </div>
                <div id="studyGroupQuestionListPanel" class="study-group-question-panel hidden"><div id="studyGroupQuestionList" class="study-group-question-list"><div class="notice">문제 목록을 불러오는 중입니다.</div></div></div>
              </section>

              <section class="study-group-members-section"><div class="study-group-section-title"><div><span class="eyebrow">MEMBERS</span><h3>그룹원 달성 현황</h3></div><span class="muted">각 목표별 달성 여부가 표시됩니다.</span></div><div id="studyGroupDashboard" class="study-group-dashboard"><div class="notice">현황을 불러오는 중입니다.</div></div></section>

              <section class="study-group-board-section">
                <div class="study-group-section-title"><div><span class="eyebrow">GROUP BOARD</span><h3>스터디그룹 게시판</h3></div><button id="studyGroupNewPostBtn" class="button secondary" type="button">＋ 글쓰기</button></div>
                <form id="studyGroupPostForm" class="study-group-post-form hidden"><label><span>제목</span><input id="studyGroupPostTitle" type="text" maxlength="120" placeholder="공지, 질문, 공부 인증 등"></label><label><span>내용</span><textarea id="studyGroupPostContent" maxlength="5000" rows="4" placeholder="그룹원들과 공유할 내용을 작성하세요."></textarea></label><div class="study-group-form-actions"><button class="button" type="submit">게시</button><button id="studyGroupPostCancelBtn" class="button secondary" type="button">취소</button></div></form>
                <div id="studyGroupBoardList" class="study-group-board-list"><div class="notice">게시글을 불러오는 중입니다.</div></div>
              </section>
            </div>
          </div>
        </div>`;
      $("main.container")?.append(section);
    }

    ensureQuestionLabUI();

    if(!$("#studyGroupModal")){
      const modal=document.createElement("div");modal.id="studyGroupModal";modal.className="study-group-modal hidden";
      modal.innerHTML=`<div class="study-group-modal-backdrop" data-study-group-close-modal></div><div class="study-group-modal-panel" role="dialog" aria-modal="true" aria-labelledby="studyGroupModalTitle"><div class="study-group-modal-head"><div><span class="eyebrow">STUDY GROUP</span><h2 id="studyGroupModalTitle">스터디그룹 만들기</h2></div><button class="study-group-modal-x" type="button" data-study-group-close-modal aria-label="닫기">×</button></div><div id="studyGroupCreateNameWrap"><label class="study-group-modal-label"><span>스터디그룹 이름</span><input id="studyGroupCreateName" type="text" maxlength="60" placeholder="예: 파라타 필기 스터디"></label></div><label class="study-group-modal-label"><span>초대할 회원 검색</span><input id="studyGroupMemberSearch" type="search" placeholder="회원 이름 검색"></label><p class="muted study-group-modal-help">항공사 대비 과정 접근 권한이 부여된 승인 회원만 표시됩니다.</p><div id="studyGroupEligibleList" class="study-group-eligible-list"><div class="notice">회원 목록을 불러오는 중입니다.</div></div><div class="study-group-modal-footer"><span id="studyGroupSelectedCount" class="muted">0명 선택</span><div><button class="button secondary" type="button" data-study-group-close-modal>취소</button><button id="studyGroupModalSubmit" class="button" type="button">그룹 만들기</button></div></div></div>`;
      document.body.append(modal);
    }

    if(!$("#studyGroupInvitesSection")){
      const stats=$("#statsCard"),summary=$("#statsSummary",stats),wrap=document.createElement("section");
      wrap.id="studyGroupInvitesSection";wrap.className="mypage-section study-group-invites-section";
      wrap.innerHTML=`<div class="mypage-section-title"><div><span class="eyebrow">STUDY GROUP INVITES</span><h3>스터디그룹 초대</h3></div><button id="studyGroupInviteRefreshBtn" class="mini-button secondary" type="button">새로고침</button></div><div id="studyGroupInviteList" class="study-group-invite-list"><div class="notice">초대를 확인하는 중입니다.</div></div>`;
      if(summary)summary.insertAdjacentElement("afterend",wrap);else stats?.append(wrap);
    }
  }

  function hideOtherViews(){$$("main.container > section").forEach(el=>{if(el.id!=="studyGroupCard")el.classList.add("hidden");});$("#memberManagementCard")?.classList.add("hidden");}
  function openView(){if(!hasAccess())return;hideOtherViews();$("#studyGroupCard")?.classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});loadGroups(true);startRefreshTimer();}
  function closeView(){$("#studyGroupCard")?.classList.add("hidden");stopRefreshTimer();}
  function startRefreshTimer(){stopRefreshTimer();state.refreshTimer=setInterval(()=>{if(!$("#studyGroupCard")?.classList.contains("hidden")&&state.activeGroupId)refreshActive(false);},60000);}
  function stopRefreshTimer(){if(state.refreshTimer){clearInterval(state.refreshTimer);state.refreshTimer=null;}}
  function showSetupError(error){state.setupError=errText(error);const box=$("#studyGroupSetupError");if(box){box.textContent=state.setupError;box.classList.remove("hidden");}}
  function clearSetupError(){state.setupError=null;$("#studyGroupSetupError")?.classList.add("hidden");}

  async function loadInvites(){
    if(!hasAccess()||!sb())return[];
    try{const rows=await rpc("study_group_my_invites");renderInvites(rows||[]);updateBadge((rows||[]).length);return rows||[];}
    catch(e){console.warn("[StudyGroup] invites",e);updateBadge(0);const list=$("#studyGroupInviteList");if(list)list.innerHTML=`<div class="notice">${esc(errText(e))}</div>`;return[];}
  }
  function updateBadge(n){const b=$("#studyGroupInviteBadge");if(!b)return;b.textContent=n;b.classList.toggle("hidden",!n);}
  function renderInvites(rows){const list=$("#studyGroupInviteList");if(!list)return;if(!rows.length){list.innerHTML='<div class="study-group-invite-empty">새로운 스터디그룹 초대가 없습니다.</div>';return;}list.innerHTML=rows.map(r=>`<article class="study-group-invite-card" data-invite-id="${esc(r.invite_id)}"><div><strong>${esc(r.group_name)}</strong><p><b>${esc(r.inviter_username||"그룹장")}</b>님이 스터디그룹에 초대했습니다.</p><small>${esc(fmtDateTime(r.created_at))}</small></div><div class="study-group-invite-actions"><button class="button" type="button" data-invite-response="accept">수락</button><button class="button secondary" type="button" data-invite-response="decline">거절</button></div></article>`).join("");}
  async function respondInvite(id,accept,btn){if(!id)return;btn.disabled=true;try{await rpc("study_group_respond_invite",{p_invite_id:id,p_accept:!!accept});await Promise.all([loadInvites(),loadGroups(false)]);if(accept)openView();}catch(e){alert(errText(e));}finally{btn.disabled=false;}}

  async function loadGroups(preserve=true){
    if(!hasAccess()||!sb())return;const list=$("#studyGroupList");if(list&&!preserve)list.innerHTML='<div class="notice">그룹을 불러오는 중입니다.</div>';
    try{const rows=await rpc("study_group_my_groups");state.groups=rows||[];clearSetupError();if(!state.groups.some(g=>g.group_id===state.activeGroupId))state.activeGroupId=state.groups[0]?.group_id||null;renderGroupList();if(state.activeGroupId)await refreshActive(false);else renderNoGroup();}
    catch(e){console.warn("[StudyGroup] groups",e);if(list)list.innerHTML=`<div class="notice">${esc(errText(e))}</div>`;showSetupError(e);}
  }
  function renderGroupList(){const list=$("#studyGroupList"),count=$("#studyGroupCount");if(count)count.textContent=`${state.groups.length}개`;if(!list)return;if(!state.groups.length){list.innerHTML='<div class="study-group-sidebar-empty">가입한 그룹이 없습니다.</div>';return;}list.innerHTML=state.groups.map(g=>`<button class="study-group-list-item ${g.group_id===state.activeGroupId?"active":""}" type="button" data-group-id="${esc(g.group_id)}"><span><strong>${esc(g.group_name)}</strong><small>${g.is_leader?"그룹장":"그룹원"} · ${Number(g.member_count||0)}명</small></span><span>›</span></button>`).join("");}
  function renderNoGroup(){$("#studyGroupEmpty")?.classList.remove("hidden");$("#studyGroupDetail")?.classList.add("hidden");}
  function activeGroup(){return state.groups.find(g=>g.group_id===state.activeGroupId)||null;}

  async function refreshActive(showLoading=true){
    const g=activeGroup();if(!g){renderNoGroup();return;}
    $("#studyGroupEmpty")?.classList.add("hidden");$("#studyGroupDetail")?.classList.remove("hidden");
    $("#studyGroupName").textContent=g.group_name;$("#studyGroupMemberMeta").textContent=`그룹원 ${Number(g.member_count||0)}명 · ${g.is_leader?"내가 그룹장입니다.":"그룹원 모두 같은 목표와 게시판을 공유합니다."}`;
    $("#studyGroupRoleBadge").textContent=g.is_leader?"LEADER":"MEMBER";$("#studyGroupRoleBadge").classList.toggle("leader",!!g.is_leader);
    $("#studyGroupLeaderActions")?.classList.toggle("hidden",!g.is_leader);$("#studyGroupMemberActions")?.classList.toggle("hidden",!!g.is_leader);$("#studyGroupGoalAddBtn")?.classList.toggle("hidden",!g.is_leader);
    const date=$("#studyGroupDate");if(date)date.value=state.dashboardDate;$("#studyGroupGoalTitle").textContent=`${fmtDate(state.dashboardDate)} 목표`;
    if(showLoading){$("#studyGroupDashboard").innerHTML='<div class="notice">그룹원 현황을 불러오는 중입니다.</div>';$("#studyGroupGoalSummary").innerHTML='<div class="notice">목표를 불러오는 중입니다.</div>';}
    try{
      const [goals,rows]=await Promise.all([
        rpc("study_group_goals",{p_group_id:g.group_id,p_goal_date:state.dashboardDate}),
        rpc("study_group_dashboard_v2",{p_group_id:g.group_id,p_goal_date:state.dashboardDate})
      ]);
      state.goals=goals||[];clearSetupError();renderGoals(g);renderDashboard(rows||[],g);
      await Promise.all([loadBoard(false), loadGroupQuestions(false)]);
    }catch(e){console.warn("[StudyGroup] active",e);$("#studyGroupDashboard").innerHTML=`<div class="notice">${esc(errText(e))}</div>`;showSetupError(e);}
  }

  function goalTargetText(g){
    if(g.goal_type==="study_time")return `${Number(g.target_study_minutes||0)}분`;
    if(g.goal_type==="theory_stage")return `${g.target_subject||"이론"} ${Number(g.target_stage_order||0)}단계`;
    if(g.goal_type==="questions")return `${Number(g.target_questions||0)}문항`;
    if(g.goal_type==="question_create")return `${Number(g.target_questions||0)}문항 만들기`;
    return "";
  }
  function goalTypeLabel(t){return t==="study_time"?"공부시간":t==="theory_stage"?"이론 진도":t==="questions"?"문제 풀이":t==="question_create"?"문제 만들기":"목표";}
  function renderGoals(g){
    const sum=$("#studyGroupGoalSummary"),stateEl=$("#studyGroupGoalState");if(stateEl){stateEl.textContent=`${state.goals.length}개`;stateEl.classList.toggle("set",state.goals.length>0);}if(!sum)return;
    if(!state.goals.length){sum.innerHTML=`<div class="study-group-no-goal">이 날짜에는 아직 목표가 없습니다.${g.is_leader?' “목표 추가”를 눌러 여러 개의 목표를 설정할 수 있습니다.':''}</div>`;closeGoalEditor();return;}
    sum.innerHTML=`<div class="study-group-goal-list">${state.goals.map((x,i)=>`<article class="study-group-goal-list-item" data-goal-id="${esc(x.goal_id)}"><div class="study-group-goal-index">${i+1}</div><div class="study-group-goal-list-main"><span class="study-group-goal-kind">${esc(goalTypeLabel(x.goal_type))}</span><strong>${esc(x.title||goalTypeLabel(x.goal_type))}</strong><b>${esc(goalTargetText(x))}</b>${x.note?`<p>${esc(x.note)}</p>`:""}</div>${g.is_leader?`<div class="study-group-goal-actions"><button type="button" class="mini-button secondary" data-edit-goal>수정</button><button type="button" class="mini-button danger-outline" data-delete-goal>삭제</button></div>`:""}</article>`).join("")}</div>`;
  }

  function renderDashboard(rows,g){
    const box=$("#studyGroupDashboard");if(!box)return;if(!rows.length){box.innerHTML='<div class="notice">그룹원이 없습니다.</div>';return;}
    box.innerHTML=rows.map(r=>{
      const results=jsonArray(r.goal_results),total=Number(r.goals_total||results.length||0),done=Number(r.goals_done||0);
      const pct=total?Math.round(done/total*100):0;
      const goalHtml=results.length?results.map(x=>{
        let current="",target="";
        if(x.goal_type==="study_time"){current=fmtDuration(x.current_value);target=`${Number(x.target_study_minutes||0)}분`;}
        else if(x.goal_type==="theory_stage"){current=`${Number(x.current_value||0)}단계`;target=`${x.target_subject||"이론"} ${Number(x.target_stage_order||0)}단계`;}
        else if(x.goal_type==="question_create"){current=`${Number(x.current_value||0)}문항 작성`;target=`${Number(x.target_questions||0)}문항 작성`;}
        else{current=`${Number(x.current_value||0)}문항`;target=`${Number(x.target_questions||0)}문항`;}
        return `<div class="study-group-member-goal ${x.done?"ok":""}"><span>${x.done?"✓":"○"}</span><div><strong>${esc(x.title||goalTypeLabel(x.goal_type))}</strong><small>${esc(current)} / ${esc(target)}</small></div></div>`;
      }).join(""):'<div class="study-group-member-no-goal">설정된 목표가 없습니다.</div>';
      return `<article class="study-group-member-card ${r.all_done?"done":""}" data-member-user-id="${esc(r.user_id)}"><div class="study-group-member-head"><div><strong>${esc(r.username)}${r.is_leader?' <span class="study-group-mini-leader">그룹장</span>':''}</strong><span class="study-group-member-status ${r.all_done?"done":total?"pending":"none"}">${r.all_done?"✓ 전체 달성":total?`${done}/${total} 달성 · ${pct}%`:"목표 미설정"}</span></div>${g.is_leader&&!r.is_leader?'<button class="study-group-member-remove" type="button" data-remove-member>내보내기</button>':''}</div><div class="study-group-member-goals">${goalHtml}</div><div class="study-group-member-quick"><span>오늘 공부 ${esc(fmtDuration(r.study_seconds))}</span><span>오늘 풀이 ${Number(r.question_count||0)}문항</span></div></article>`;
    }).join("");
  }

  function openGoalEditor(goal=null){
    const g=activeGroup();if(!g?.is_leader)return;state.editingGoalId=goal?.goal_id||null;$("#studyGoalId").value=state.editingGoalId||"";$("#studyGoalEditorTitle").textContent=goal?"목표 수정":"새 목표 추가";
    $("#studyGoalType").value=goal?.goal_type||"study_time";$("#studyGoalCustomTitle").value=goal?.title||"";$("#studyGoalMinutes").value=goal?.target_study_minutes||120;$("#studyGoalQuestions").value=goal?.target_questions||30;$("#studyGoalSubject").value=goal?.target_subject||"K-AIM";$("#studyGoalStage").value=goal?.target_stage_order||1;$("#studyGoalNote").value=goal?.note||"";updateGoalEditorFields();$("#studyGroupGoalEditor").classList.remove("hidden");$("#studyGroupGoalEditor").scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  function closeGoalEditor(){state.editingGoalId=null;$("#studyGroupGoalEditor")?.classList.add("hidden");}
  function updateGoalEditorFields(){
    const type=$("#studyGoalType")?.value;
    const isTime=type==="study_time", isQuestions=type==="questions"||type==="question_create", isTheory=type==="theory_stage";
    $("#studyGoalMinutesWrap")?.classList.toggle("hidden",!isTime);
    $("#studyGoalQuestionsWrap")?.classList.toggle("hidden",!isQuestions);
    $("#studyGoalSubjectWrap")?.classList.toggle("hidden",!isTheory);
    $("#studyGoalStageWrap")?.classList.toggle("hidden",!isTheory);
    // Hidden number/select fields must be disabled. CSS-hidden controls still participate in
    // native form validation and were blocking submit before the JS save handler could run.
    const minuteInput=$("#studyGoalMinutes"), questionInput=$("#studyGoalQuestions"), subjectInput=$("#studyGoalSubject"), stageInput=$("#studyGoalStage");
    if(minuteInput)minuteInput.disabled=!isTime;
    if(questionInput)questionInput.disabled=!isQuestions;
    if(subjectInput)subjectInput.disabled=!isTheory;
    if(stageInput)stageInput.disabled=!isTheory;
    const qLabel=$("#studyGoalQuestionsLabel");if(qLabel)qLabel.textContent=type==="question_create"?"문제 만들기":"문제 풀이";
    const form=$("#studyGroupGoalEditor");if(form)form.noValidate=true;
    updateStageHint();
  }
  function updateStageHint(){const s=$("#studyGoalSubject")?.value||"",hint=$("#studyGoalStageHint"),input=$("#studyGoalStage"),max=STAGE_MAX[s];if(hint)hint.textContent=max?`현재 ${s} 학습과정은 총 ${max}단계입니다.`:"완료한 이론 단계 수를 기준으로 집계합니다.";if(input)input.max=max||"";}
  function goalDbError(error){
    const parts=[];
    if(error?.code)parts.push(`code: ${error.code}`);
    if(error?.message)parts.push(`message: ${error.message}`);
    if(error?.details)parts.push(`details: ${error.details}`);
    if(error?.hint)parts.push(`hint: ${error.hint}`);
    return parts.join("\n")||String(error||"알 수 없는 오류");
  }
  async function saveGoal(e){
    e.preventDefault();
    const g=activeGroup();if(!g?.is_leader)return;
    const client=sb();if(!client){alert("Supabase 연결을 확인할 수 없습니다.");return;}
    const form=$("#studyGroupGoalEditor"),saveBtn=form?.querySelector('button[type="submit"]');
    const type=$("#studyGoalType").value,title=$("#studyGoalCustomTitle").value.trim(),minutes=type==="study_time"?Number($("#studyGoalMinutes").value||0):0,questions=(type==="questions"||type==="question_create")?Number($("#studyGoalQuestions").value||0):0,subject=type==="theory_stage"?$("#studyGoalSubject").value:null,stage=type==="theory_stage"?Number($("#studyGoalStage").value||0):null,note=$("#studyGoalNote").value||"";
    if(type==="study_time"&&(!Number.isFinite(minutes)||minutes<1||minutes>1440)){alert("공부시간 목표를 1~1440분 사이로 입력해 주세요.");return;}
    if((type==="questions"||type==="question_create")&&(!Number.isFinite(questions)||questions<1||questions>10000)){alert(`${type==="question_create"?"문제 만들기":"문제 풀이"} 목표를 1~10000문항 사이로 입력해 주세요.`);return;}
    if(type==="theory_stage"&&(!subject||!Number.isFinite(stage)||stage<1)){alert("이론 교재와 목표 단계를 입력해 주세요.");return;}
    const maxStage=STAGE_MAX[subject];if(type==="theory_stage"&&maxStage&&stage>maxStage){alert(`${subject} 학습과정은 ${maxStage}단계까지입니다.`);return;}
    const sortOrder=state.editingGoalId?(state.goals.findIndex(x=>x.goal_id===state.editingGoalId)+1)*10:(state.goals.length+1)*10;
    const resolvedTitle=title||(type==="study_time"?"공부시간":type==="questions"?"문제 풀이":type==="question_create"?"문제 만들기":`${subject} 진도`);
    const row={group_id:g.group_id,goal_date:state.dashboardDate,goal_type:type,title:resolvedTitle,target_study_minutes:minutes,target_subject:subject,target_stage_order:stage,target_questions:questions,note,sort_order:sortOrder,updated_at:new Date().toISOString()};
    if(saveBtn){saveBtn.disabled=true;saveBtn.textContent="저장 중…";}
    try{
      let goalId=state.editingGoalId||null;
      if(state.editingGoalId){
        const {data,error}=await client.from("study_group_goals").update(row).eq("id",state.editingGoalId).eq("group_id",g.group_id).select("id").single();
        if(error)throw error;if(!data?.id)throw new Error("수정된 목표 ID를 확인할 수 없습니다.");goalId=data.id;
      }else{
        const {data,error}=await client.from("study_group_goals").insert(row).select("id").single();
        if(error)throw error;if(!data?.id)throw new Error("생성된 목표 ID를 확인할 수 없습니다.");goalId=data.id;
      }
      const rows=await rpc("study_group_goals",{p_group_id:g.group_id,p_goal_date:state.dashboardDate})||[];
      if(goalId&&!rows.some(x=>String(x.goal_id)===String(goalId)))throw new Error("DB에는 저장됐지만 목록 재조회에서 목표를 찾지 못했습니다. 현황 갱신을 눌러 주세요.");
      state.goals=rows;closeGoalEditor();renderGoals(g);
      const dash=await rpc("study_group_dashboard_v2",{p_group_id:g.group_id,p_goal_date:state.dashboardDate})||[];renderDashboard(dash,g);
    }catch(e2){
      console.error("[StudyGroup] direct goal save",e2);
      const raw=goalDbError(e2);
      if(/42501|permission denied|row-level security|violates row-level security/i.test(raw)){
        alert(`목표 저장 권한이 아직 적용되지 않았습니다.\nV11.59.3_STUDY_GROUP_DIRECT_GOAL_WRITE.sql을 실행해 주세요.\n\n${raw}`);
      }else if(/study_group_goals|column .* does not exist|42P01|42703/i.test(raw)){
        alert(`스터디그룹 목표 테이블 구조를 복구해야 합니다.\nV11.59.3_STUDY_GROUP_DIRECT_GOAL_WRITE.sql을 실행해 주세요.\n\n${raw}`);
      }else{
        alert(`목표 저장에 실패했습니다.\n\n${raw}`);
      }
    }finally{if(saveBtn){saveBtn.disabled=false;saveBtn.textContent="저장";}}
  }
  async function deleteGoal(id){const g=activeGroup(),goal=state.goals.find(x=>x.goal_id===id);if(!g?.is_leader||!goal||!confirm(`“${goal.title||goalTypeLabel(goal.goal_type)}” 목표를 삭제할까요?`))return;try{await rpc("study_group_delete_goal",{p_goal_id:id});if(state.editingGoalId===id)closeGoalEditor();await refreshActive(false);}catch(e){alert(errText(e));}}

  async function openMemberModal(mode="create"){
    state.inviteMode=mode;const g=activeGroup();$("#studyGroupModalTitle").textContent=mode==="create"?"스터디그룹 만들기":"회원 추가 초대";$("#studyGroupCreateNameWrap")?.classList.toggle("hidden",mode!=="create");$("#studyGroupModalSubmit").textContent=mode==="create"?"그룹 만들기":"초대 보내기";$("#studyGroupCreateName").value="";$("#studyGroupMemberSearch").value="";state.selectedIds=new Set();$("#studyGroupEligibleList").innerHTML='<div class="notice">초대 가능한 회원을 불러오는 중입니다.</div>';$("#studyGroupModal").classList.remove("hidden");document.body.classList.add("study-group-modal-open");
    try{state.eligible=await rpc("study_group_eligible_members",{p_group_id:mode==="invite"?g?.group_id:null});renderEligible();}catch(e){state.eligible=[];$("#studyGroupEligibleList").innerHTML=`<div class="notice">${esc(errText(e))}</div>`;}
  }
  function closeModal(){$("#studyGroupModal")?.classList.add("hidden");document.body.classList.remove("study-group-modal-open");}
  function renderEligible(){const q=($("#studyGroupMemberSearch")?.value||"").trim().toLowerCase(),rows=state.eligible.filter(r=>(r.username||"").toLowerCase().includes(q)),list=$("#studyGroupEligibleList");if(!list)return;if(!rows.length){list.innerHTML='<div class="study-group-invite-empty">조건에 맞는 초대 가능 회원이 없습니다.</div>';updateSelectedCount();return;}list.innerHTML=rows.map(r=>`<label class="study-group-eligible-member"><input type="checkbox" value="${esc(r.user_id)}" ${state.selectedIds.has(r.user_id)?"checked":""}><span class="study-group-avatar">${esc((r.username||"회").slice(0,1).toUpperCase())}</span><span><strong>${esc(r.username||"회원")}</strong><small>항공사 대비 과정 접근 가능</small></span></label>`).join("");updateSelectedCount();}
  function updateSelectedCount(){const el=$("#studyGroupSelectedCount");if(el)el.textContent=`${state.selectedIds.size}명 선택`;}
  async function submitMemberModal(){const ids=Array.from(state.selectedIds),btn=$("#studyGroupModalSubmit");btn.disabled=true;try{if(state.inviteMode==="create"){const name=$("#studyGroupCreateName").value.trim();if(name.length<2){alert("스터디그룹 이름을 2자 이상 입력해 주세요.");return;}const groupId=await rpc("study_group_create",{p_name:name,p_invitee_ids:ids});closeModal();await loadGroups(false);state.activeGroupId=groupId;renderGroupList();await refreshActive(false);}else{const g=activeGroup();if(!g)return;if(!ids.length){alert("초대할 회원을 선택해 주세요.");return;}const count=await rpc("study_group_invite_members",{p_group_id:g.group_id,p_invitee_ids:ids});closeModal();alert(`${Number(count||ids.length)}명에게 스터디그룹 초대를 보냈습니다.`);}}catch(e){alert(`처리하지 못했습니다.\n${errText(e)}`);}finally{btn.disabled=false;}}

  async function renameGroup(){const g=activeGroup();if(!g?.is_leader)return;const name=prompt("새 스터디그룹 이름을 입력하세요.",g.group_name);if(!name||name.trim()===g.group_name)return;try{await rpc("study_group_rename",{p_group_id:g.group_id,p_name:name.trim()});await loadGroups(false);}catch(e){alert(errText(e));}}
  async function deleteGroup(){const g=activeGroup();if(!g?.is_leader||!confirm(`“${g.group_name}” 스터디그룹을 삭제할까요?\n그룹원·초대·목표·게시글·댓글이 함께 삭제됩니다.`))return;try{await rpc("study_group_delete",{p_group_id:g.group_id});state.activeGroupId=null;await loadGroups(false);}catch(e){alert(errText(e));}}
  async function leaveGroup(){const g=activeGroup();if(!g||g.is_leader||!confirm(`“${g.group_name}” 스터디그룹에서 탈퇴할까요?`))return;try{await rpc("study_group_leave",{p_group_id:g.group_id});state.activeGroupId=null;await loadGroups(false);}catch(e){alert(errText(e));}}
  async function removeMember(card){const g=activeGroup(),id=card?.dataset.memberUserId,name=card?.querySelector("strong")?.textContent||"이 회원";if(!g?.is_leader||!id||!confirm(`${name}을(를) 스터디그룹에서 내보낼까요?`))return;try{await rpc("study_group_remove_member",{p_group_id:g.group_id,p_user_id:id});await loadGroups(false);}catch(e){alert(errText(e));}}


  function resetQuestionForm(){["#studyGroupQuestionText","#studyGroupChoiceA","#studyGroupChoiceB","#studyGroupChoiceC","#studyGroupChoiceD","#studyGroupQuestionTag","#studyGroupQuestionExplanation"].forEach(s=>{const el=$(s);if(el)el.value="";});const c=$("#studyGroupCorrectChoice");if(c)c.value="A";}
  function setQuestionMode(mode){state.questionMode=["solve","create","list"].includes(mode)?mode:"solve";$$('[data-question-mode]').forEach(b=>b.classList.toggle("active",b.dataset.questionMode===state.questionMode));$("#studyGroupQuestionSolvePanel")?.classList.toggle("hidden",state.questionMode!=="solve");$("#studyGroupQuestionCreatePanel")?.classList.toggle("hidden",state.questionMode!=="create");$("#studyGroupQuestionListPanel")?.classList.toggle("hidden",state.questionMode!=="list");if(state.questionMode==="solve")renderQuestionPlayer();if(state.questionMode==="list")renderQuestionList();}
  async function loadGroupQuestions(showLoading=true){const g=activeGroup();if(!g)return;state.questionLoading=true;if(showLoading){if($("#studyGroupQuestionPlayer"))$("#studyGroupQuestionPlayer").innerHTML='<div class="notice">그룹 문제를 불러오는 중입니다.</div>';if($("#studyGroupQuestionList"))$("#studyGroupQuestionList").innerHTML='<div class="notice">그룹 문제를 불러오는 중입니다.</div>';}try{state.groupQuestions=await rpc("study_group_questions",{p_group_id:g.group_id,p_limit:200,p_offset:0})||[];if(!state.groupQuestions.some(q=>String(q.question_id)===String(state.activeQuestionId)))state.activeQuestionId=state.groupQuestions[0]?.question_id||null;renderQuestionPlayer();renderQuestionList();}catch(e){const msg=esc(errText(e));if($("#studyGroupQuestionPlayer"))$("#studyGroupQuestionPlayer").innerHTML=`<div class="notice">${msg}</div>`;if($("#studyGroupQuestionList"))$("#studyGroupQuestionList").innerHTML=`<div class="notice">${msg}</div>`;}finally{state.questionLoading=false;}}
  function currentGroupQuestion(){return state.groupQuestions.find(q=>String(q.question_id)===String(state.activeQuestionId))||state.groupQuestions[0]||null;}
  async function createGroupQuestion(e){e.preventDefault();const g=activeGroup();if(!g)return;const question=$("#studyGroupQuestionText")?.value.trim(),a=$("#studyGroupChoiceA")?.value.trim(),b=$("#studyGroupChoiceB")?.value.trim(),c=$("#studyGroupChoiceC")?.value.trim(),d=$("#studyGroupChoiceD")?.value.trim(),correct=$("#studyGroupCorrectChoice")?.value,tag=$("#studyGroupQuestionTag")?.value.trim(),explanation=$("#studyGroupQuestionExplanation")?.value.trim();if(!question||!a||!b||!c||!d){alert("문제와 A~D 선택지를 모두 입력해 주세요.");return;}const btn=e.currentTarget.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent="등록 중…";}try{const id=await rpc("study_group_question_create",{p_group_id:g.group_id,p_question:question,p_choice_a:a,p_choice_b:b,p_choice_c:c,p_choice_d:d,p_correct_choice:correct,p_explanation:explanation||"",p_tag:tag||""});resetQuestionForm();await loadGroupQuestions(false);state.activeQuestionId=id||state.groupQuestions[0]?.question_id||null;setQuestionMode("solve");await refreshDashboardOnly();}catch(e2){alert(`문제 등록에 실패했습니다.\n${errText(e2)}`);}finally{if(btn){btn.disabled=false;btn.textContent="문제 등록";}}}
  async function refreshDashboardOnly(){const g=activeGroup();if(!g)return;try{const rows=await rpc("study_group_dashboard_v2",{p_group_id:g.group_id,p_goal_date:state.dashboardDate})||[];renderDashboard(rows,g);}catch(e){console.warn("[StudyGroup] dashboard refresh",e);}}
  async function answerGroupQuestion(questionId,choice,btn){if(!questionId||!choice)return;const card=btn?.closest("[data-group-question-player]");if(card)$$('button[data-answer-choice]',card).forEach(b=>b.disabled=true);try{const result=await rpc("study_group_question_answer",{p_question_id:questionId,p_selected_choice:choice});await loadGroupQuestions(false);state.activeQuestionId=questionId;renderQuestionPlayer(result||null);}catch(e){alert(errText(e));if(card)$$('button[data-answer-choice]',card).forEach(b=>b.disabled=false);}}
  function renderQuestionPlayer(freshResult=null){const box=$("#studyGroupQuestionPlayer");if(!box)return;if(!state.groupQuestions.length){box.innerHTML='<div class="study-group-board-empty">아직 그룹 문제가 없습니다. “문제 만들기”에서 첫 문제를 등록해 보세요.</div>';return;}const q=currentGroupQuestion();if(!q)return;const idx=Math.max(0,state.groupQuestions.findIndex(x=>String(x.question_id)===String(q.question_id)));const attempted=!!q.my_attempted||!!freshResult;const correct=freshResult?.correct_choice||q.my_correct_choice||null;const selected=freshResult?.selected_choice||q.my_selected_choice||null;const isCorrect=freshResult?.is_correct??q.my_is_correct;const explanation=freshResult?.explanation??q.my_explanation??"";const choices=[["A",q.choice_a],["B",q.choice_b],["C",q.choice_c],["D",q.choice_d]];box.innerHTML=`<article class="study-group-question-player-card" data-group-question-player data-question-id="${esc(q.question_id)}"><div class="study-group-question-player-head"><div><span class="study-group-goal-kind">${esc(q.tag||"그룹 문제")}</span><small>${esc(q.author_username||"회원")} · ${esc(fmtDateTime(q.created_at))}</small></div><span>${idx+1} / ${state.groupQuestions.length}</span></div><h4>${esc(q.question).replace(/\n/g,"<br>")}</h4><div class="study-group-question-answers">${choices.map(([id,text])=>`<button class="study-group-question-answer ${attempted&&id===correct?"correct":""} ${attempted&&id===selected&&id!==correct?"incorrect":""}" type="button" data-answer-choice="${id}" ${attempted?"disabled":""}><b>${id}</b><span>${esc(text)}</span></button>`).join("")}</div>${attempted?`<div class="study-group-question-result ${isCorrect?"good":"bad"}"><strong>${isCorrect?"✓ 정답입니다.":`✕ 오답입니다. 정답 ${esc(correct||"")}`}</strong>${explanation?`<p>${esc(explanation).replace(/\n/g,"<br>")}</p>`:""}</div>`:""}<div class="study-group-question-player-actions"><button class="button secondary mini" type="button" data-question-prev ${idx<=0?"disabled":""}>이전</button><button class="button secondary mini" type="button" data-question-next ${idx>=state.groupQuestions.length-1?"disabled":""}>다음</button><button class="button secondary mini" type="button" data-question-comments>댓글 ${Number(q.comment_count||0)}개</button></div><div id="studyGroupQuestionComments" class="study-group-question-comments ${state.questionComments.has(q.question_id)?"":"hidden"}">${state.questionComments.has(q.question_id)?renderQuestionCommentsHtml(q.question_id):""}</div></article>`;}
  function renderQuestionList(){const list=$("#studyGroupQuestionList");if(!list)return;if(!state.groupQuestions.length){list.innerHTML='<div class="study-group-board-empty">등록된 문제가 없습니다.</div>';return;}list.innerHTML=state.groupQuestions.map((q,i)=>`<article class="study-group-question-list-card" data-question-id="${esc(q.question_id)}"><div><span class="study-group-goal-kind">${esc(q.tag||"그룹 문제")}</span><strong>${i+1}. ${esc(q.question)}</strong><small>${esc(q.author_username||"회원")} · 풀이 ${Number(q.attempt_count||0)}회 · 댓글 ${Number(q.comment_count||0)}개</small></div><div class="study-group-question-list-actions"><button class="button secondary mini" type="button" data-open-question>풀기</button>${q.can_delete?'<button class="button danger-outline mini" type="button" data-delete-question>삭제</button>':''}</div></article>`).join("");}
  async function deleteGroupQuestion(id){if(!id||!confirm("이 문제를 삭제할까요? 풀이 기록과 댓글도 함께 삭제됩니다."))return;try{await rpc("study_group_question_delete",{p_question_id:id});state.questionComments.delete(id);if(String(state.activeQuestionId)===String(id))state.activeQuestionId=null;await loadGroupQuestions(false);await refreshDashboardOnly();}catch(e){alert(errText(e));}}
  async function toggleQuestionComments(id){const wrap=$("#studyGroupQuestionComments");if(!id||!wrap)return;if(state.questionComments.has(id)){state.questionComments.delete(id);renderQuestionPlayer();return;}try{const rows=await rpc("study_group_question_comments",{p_question_id:id});state.questionComments.set(id,rows||[]);renderQuestionPlayer();}catch(e){alert(errText(e));}}
  function renderQuestionCommentsHtml(id){const rows=state.questionComments.get(id)||[];return `<div class="study-group-comments-list">${rows.length?rows.map(c=>`<div class="study-group-comment" data-question-comment-id="${esc(c.comment_id)}"><div><strong>${esc(c.author_username||"회원")}</strong><small>${esc(fmtDateTime(c.created_at))}</small></div><p>${esc(c.content).replace(/\n/g,"<br>")}</p>${c.can_delete?'<button type="button" data-delete-question-comment>삭제</button>':''}</div>`).join(""):'<div class="study-group-comment-empty">이 문제에 대한 첫 댓글을 남겨보세요.</div>'}</div><form class="study-group-comment-form" data-question-comment-form><textarea rows="2" maxlength="2000" placeholder="문제에 대한 질문, 정정 의견, 풀이 팁을 남겨보세요."></textarea><button class="button mini" type="submit">댓글 등록</button></form>`;}
  async function createQuestionComment(id,form){const ta=$("textarea",form),content=ta?.value.trim();if(!content)return;const btn=$("button",form);if(btn)btn.disabled=true;try{await rpc("study_group_question_comment_create",{p_question_id:id,p_content:content});const rows=await rpc("study_group_question_comments",{p_question_id:id});state.questionComments.set(id,rows||[]);const q=state.groupQuestions.find(x=>String(x.question_id)===String(id));if(q)q.comment_count=rows.length;renderQuestionPlayer();renderQuestionList();}catch(e){alert(errText(e));}finally{if(btn)btn.disabled=false;}}
  async function deleteQuestionComment(id,commentId){if(!commentId||!confirm("이 댓글을 삭제할까요?"))return;try{await rpc("study_group_question_comment_delete",{p_comment_id:commentId});const rows=await rpc("study_group_question_comments",{p_question_id:id});state.questionComments.set(id,rows||[]);const q=state.groupQuestions.find(x=>String(x.question_id)===String(id));if(q)q.comment_count=rows.length;renderQuestionPlayer();renderQuestionList();}catch(e){alert(errText(e));}}

  function togglePostForm(show){const f=$("#studyGroupPostForm");if(!f)return;f.classList.toggle("hidden",!show);if(show)setTimeout(()=>$("#studyGroupPostTitle")?.focus(),0);else{$("#studyGroupPostTitle").value="";$("#studyGroupPostContent").value="";}}
  async function loadBoard(showLoading=true){
    const g=activeGroup(),list=$("#studyGroupBoardList");if(!g||!list)return;if(showLoading)list.innerHTML='<div class="notice">게시글을 불러오는 중입니다.</div>';state.boardLoading=true;
    try{state.boardPosts=await rpc("study_group_board_posts",{p_group_id:g.group_id,p_limit:50,p_offset:0})||[];if(state.expandedPostId&&state.boardPosts.some(p=>p.post_id===state.expandedPostId)){const comments=await rpc("study_group_board_comments",{p_post_id:state.expandedPostId});state.boardComments.set(state.expandedPostId,comments||[]);}else if(state.expandedPostId){state.expandedPostId=null;}renderBoard();}catch(e){list.innerHTML=`<div class="notice">${esc(errText(e))}</div>`;}finally{state.boardLoading=false;}
  }
  function renderBoard(){const list=$("#studyGroupBoardList");if(!list)return;if(!state.boardPosts.length){list.innerHTML='<div class="study-group-board-empty">아직 게시글이 없습니다. 첫 글을 남겨보세요.</div>';return;}list.innerHTML=state.boardPosts.map(p=>`<article class="study-group-post-card" data-post-id="${esc(p.post_id)}"><div class="study-group-post-head"><div><strong>${esc(p.title)}</strong><small>${esc(p.author_username||"회원")} · ${esc(fmtDateTime(p.created_at))}</small></div>${p.can_delete?'<button class="study-group-post-delete" type="button" data-delete-post>삭제</button>':''}</div><div class="study-group-post-content">${esc(p.content).replace(/\n/g,"<br>")}</div><div class="study-group-post-footer"><button class="study-group-comment-toggle" type="button" data-toggle-comments>댓글 ${Number(p.comment_count||0)}개</button></div><div class="study-group-comments-wrap ${state.expandedPostId===p.post_id?"":"hidden"}" data-comments-wrap>${state.expandedPostId===p.post_id?renderCommentsHtml(p.post_id):""}</div></article>`).join("");}
  function renderCommentsHtml(postId){const rows=state.boardComments.get(postId)||[];return `<div class="study-group-comments-list">${rows.length?rows.map(c=>`<div class="study-group-comment" data-comment-id="${esc(c.comment_id)}"><div><strong>${esc(c.author_username||"회원")}</strong><small>${esc(fmtDateTime(c.created_at))}</small></div><p>${esc(c.content).replace(/\n/g,"<br>")}</p>${c.can_delete?'<button type="button" data-delete-comment>삭제</button>':''}</div>`).join(""):'<div class="study-group-comment-empty">첫 댓글을 남겨보세요.</div>'}</div><form class="study-group-comment-form" data-comment-form><textarea rows="2" maxlength="2000" placeholder="댓글을 입력하세요."></textarea><button class="button mini" type="submit">댓글 등록</button></form>`;}
  async function toggleComments(postId){if(state.expandedPostId===postId){state.expandedPostId=null;renderBoard();return;}state.expandedPostId=postId;try{const rows=await rpc("study_group_board_comments",{p_post_id:postId});state.boardComments.set(postId,rows||[]);renderBoard();}catch(e){alert(errText(e));}}
  async function createPost(e){e.preventDefault();const g=activeGroup(),title=$("#studyGroupPostTitle").value.trim(),content=$("#studyGroupPostContent").value.trim();if(!g)return;if(!title||!content){alert("제목과 내용을 모두 입력해 주세요.");return;}try{await rpc("study_group_board_create_post",{p_group_id:g.group_id,p_title:title,p_content:content});togglePostForm(false);await loadBoard(false);}catch(e2){alert(errText(e2));}}
  async function deletePost(postId){if(!postId||!confirm("이 게시글을 삭제할까요? 댓글도 함께 삭제됩니다."))return;try{await rpc("study_group_board_delete_post",{p_post_id:postId});if(state.expandedPostId===postId)state.expandedPostId=null;state.boardComments.delete(postId);await loadBoard(false);}catch(e){alert(errText(e));}}
  async function createComment(postId,form){const ta=$("textarea",form),content=ta?.value.trim();if(!content)return;const btn=$("button",form);btn.disabled=true;try{await rpc("study_group_board_create_comment",{p_post_id:postId,p_content:content});const rows=await rpc("study_group_board_comments",{p_post_id:postId});state.boardComments.set(postId,rows||[]);const p=state.boardPosts.find(x=>x.post_id===postId);if(p)p.comment_count=(rows||[]).length;renderBoard();}catch(e){alert(errText(e));}finally{btn.disabled=false;}}
  async function deleteComment(postId,commentId){if(!commentId||!confirm("이 댓글을 삭제할까요?"))return;try{await rpc("study_group_board_delete_comment",{p_comment_id:commentId});const rows=await rpc("study_group_board_comments",{p_post_id:postId});state.boardComments.set(postId,rows||[]);const p=state.boardPosts.find(x=>x.post_id===postId);if(p)p.comment_count=rows.length;renderBoard();}catch(e){alert(errText(e));}}

  function wireEvents(){
    $("#studyGroupNavBtn")?.addEventListener("click",openView);$("#studyGroupCloseBtn")?.addEventListener("click",()=>{$("#homeNavBtn")?.click();});$("#studyGroupCreateBtn")?.addEventListener("click",()=>openMemberModal("create"));$("#studyGroupRefreshBtn")?.addEventListener("click",()=>Promise.all([loadGroups(false),loadInvites()]));$("#studyGroupDashboardRefreshBtn")?.addEventListener("click",()=>refreshActive(true));
    $("#studyGroupTodayBtn")?.addEventListener("click",()=>{state.dashboardDate=localDateKey();$("#studyGroupDate").value=state.dashboardDate;closeGoalEditor();refreshActive(true);});$("#studyGroupDate")?.addEventListener("change",e=>{state.dashboardDate=e.target.value||localDateKey();closeGoalEditor();refreshActive(true);});$("#studyGroupList")?.addEventListener("click",e=>{const b=e.target.closest("[data-group-id]");if(!b)return;state.activeGroupId=b.dataset.groupId;state.expandedPostId=null;state.boardComments.clear();state.activeQuestionId=null;state.questionComments.clear();closeGoalEditor();renderGroupList();refreshActive(true);});
    $("#studyGroupGoalAddBtn")?.addEventListener("click",()=>openGoalEditor());$("#studyGroupGoalEditor")?.addEventListener("submit",saveGoal);$("#studyGoalCancelBtn")?.addEventListener("click",closeGoalEditor);$("#studyGoalEditorCloseBtn")?.addEventListener("click",closeGoalEditor);$("#studyGoalType")?.addEventListener("change",updateGoalEditorFields);$("#studyGoalSubject")?.addEventListener("change",updateStageHint);
    $("#studyGroupGoalSummary")?.addEventListener("click",e=>{const card=e.target.closest("[data-goal-id]");if(!card)return;const id=card.dataset.goalId;if(e.target.closest("[data-edit-goal]"))openGoalEditor(state.goals.find(x=>x.goal_id===id));else if(e.target.closest("[data-delete-goal]"))deleteGoal(id);});
    $("#studyGroupInviteMoreBtn")?.addEventListener("click",()=>openMemberModal("invite"));$("#studyGroupRenameBtn")?.addEventListener("click",renameGroup);$("#studyGroupDeleteBtn")?.addEventListener("click",deleteGroup);$("#studyGroupLeaveBtn")?.addEventListener("click",leaveGroup);$("#studyGroupDashboard")?.addEventListener("click",e=>{const b=e.target.closest("[data-remove-member]");if(b)removeMember(b.closest("[data-member-user-id]"));});
    $("#studyGroupMemberSearch")?.addEventListener("input",renderEligible);$("#studyGroupEligibleList")?.addEventListener("change",e=>{const input=e.target.closest("input[type=checkbox]");if(!input)return;if(input.checked)state.selectedIds.add(input.value);else state.selectedIds.delete(input.value);updateSelectedCount();});$("#studyGroupModalSubmit")?.addEventListener("click",submitMemberModal);$("#studyGroupModal")?.addEventListener("click",e=>{if(e.target.closest("[data-study-group-close-modal]"))closeModal();});$("#studyGroupInviteRefreshBtn")?.addEventListener("click",loadInvites);$("#studyGroupInviteList")?.addEventListener("click",e=>{const b=e.target.closest("[data-invite-response]");if(!b)return;const card=b.closest("[data-invite-id]");respondInvite(card?.dataset.inviteId,b.dataset.inviteResponse==="accept",b);});
    $("#studyGroupQuestionSolveQuickBtn")?.addEventListener("click",()=>{setQuestionMode("solve");$(".study-group-question-section")?.scrollIntoView({behavior:"smooth",block:"start"});});$("#studyGroupQuestionCreateQuickBtn")?.addEventListener("click",()=>{setQuestionMode("create");$(".study-group-question-section")?.scrollIntoView({behavior:"smooth",block:"start"});});
    $(".study-group-question-tabs")?.addEventListener("click",e=>{const b=e.target.closest("[data-question-mode]");if(b)setQuestionMode(b.dataset.questionMode);});$("#studyGroupQuestionRefreshBtn")?.addEventListener("click",()=>loadGroupQuestions(true));$("#studyGroupQuestionForm")?.addEventListener("submit",createGroupQuestion);$("#studyGroupQuestionFormReset")?.addEventListener("click",resetQuestionForm);$("#studyGroupQuestionPlayer")?.addEventListener("click",e=>{const card=e.target.closest("[data-group-question-player]");if(!card)return;const id=card.dataset.questionId;if(e.target.closest("[data-answer-choice]"))answerGroupQuestion(id,e.target.closest("[data-answer-choice]").dataset.answerChoice,e.target.closest("[data-answer-choice]"));else if(e.target.closest("[data-question-prev]")){const i=state.groupQuestions.findIndex(q=>String(q.question_id)===String(id));if(i>0){state.activeQuestionId=state.groupQuestions[i-1].question_id;renderQuestionPlayer();}}else if(e.target.closest("[data-question-next]")){const i=state.groupQuestions.findIndex(q=>String(q.question_id)===String(id));if(i>=0&&i<state.groupQuestions.length-1){state.activeQuestionId=state.groupQuestions[i+1].question_id;renderQuestionPlayer();}}else if(e.target.closest("[data-question-comments]"))toggleQuestionComments(id);else{const c=e.target.closest("[data-delete-question-comment]");if(c)deleteQuestionComment(id,c.closest("[data-question-comment-id]")?.dataset.questionCommentId);}});$("#studyGroupQuestionPlayer")?.addEventListener("submit",e=>{const form=e.target.closest("[data-question-comment-form]");if(!form)return;e.preventDefault();const id=form.closest("[data-group-question-player]")?.dataset.questionId;if(id)createQuestionComment(id,form);});$("#studyGroupQuestionList")?.addEventListener("click",e=>{const card=e.target.closest("[data-question-id]");if(!card)return;const id=card.dataset.questionId;if(e.target.closest("[data-open-question]")){state.activeQuestionId=id;setQuestionMode("solve");}else if(e.target.closest("[data-delete-question]"))deleteGroupQuestion(id);});
        $("#studyGroupNewPostBtn")?.addEventListener("click",()=>togglePostForm($("#studyGroupPostForm")?.classList.contains("hidden")));$("#studyGroupPostCancelBtn")?.addEventListener("click",()=>togglePostForm(false));$("#studyGroupPostForm")?.addEventListener("submit",createPost);$("#studyGroupBoardList")?.addEventListener("click",e=>{const card=e.target.closest("[data-post-id]");if(!card)return;const postId=card.dataset.postId;if(e.target.closest("[data-toggle-comments]"))toggleComments(postId);else if(e.target.closest("[data-delete-post]"))deletePost(postId);else{const c=e.target.closest("[data-delete-comment]");if(c)deleteComment(postId,c.closest("[data-comment-id]")?.dataset.commentId);}});$("#studyGroupBoardList")?.addEventListener("submit",e=>{const form=e.target.closest("[data-comment-form]");if(!form)return;e.preventDefault();const postId=form.closest("[data-post-id]")?.dataset.postId;if(postId)createComment(postId,form);});
    document.addEventListener("click",e=>{const nav=e.target.closest("header nav button,header nav a,#homeMyPageBtn");if(nav&&nav.id!=="studyGroupNavBtn")closeView();if(e.target.closest("#statsBtn,#homeMyPageBtn"))setTimeout(loadInvites,50);},true);document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#studyGroupModal")?.classList.contains("hidden"))closeModal();else closeGoalEditor();}});
  }

  async function init(){injectUI();ensureQuestionLabUI();setQuestionMode("solve");const goalForm=$("#studyGroupGoalEditor");if(goalForm)goalForm.noValidate=true;updateGoalEditorFields();try{await window.PilotBankAuth?.requireLogin?.();}catch{}const nav=$("#studyGroupNavBtn");nav?.classList.toggle("hidden",!hasAccess());if(!hasAccess()){$("#studyGroupInvitesSection")?.classList.add("hidden");return;}wireEvents();await Promise.all([loadInvites(),loadGroups(true)]);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0));else setTimeout(init,0);
})();
