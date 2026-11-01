/* Reference worksheet · Aviation Safety Act penalties · v11.60.96 */
(()=>{
 'use strict';if(window.PilotBankPenalties96)return;
 const SUBJECT='항공안전법 시행규칙 벌칙',PATH='./data/questions-aviation-safety-penalties-v1.json?v=11.60.96';
 const $=(s,r=document)=>r.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let data=null,pending=null,panel=null,epoch=0,loading=false;
 const state={category:'',round:'all',scope:'all',mode:'study',count:'20',search:''};
 const owner=()=>{const u=window.PilotBankAuth?.getCurrentUser?.();return typeof u==='string'?u:String(u?.id||u?.username||'guest');};
 const shuffle=rows=>{const a=[...rows];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function hide(){epoch++;panel?.classList.add('hidden');}
 function validate(d){
  if(d?.metadata?.question_count!==200||d.metadata.fact_count!==120||d.metadata.legal_as_of!=='2026-11-01'||d.categories?.length!==5||d.facts?.length!==120||d.questions?.length!==200)throw Error('법규 학습지의 버전·문항 수가 올바르지 않습니다.');
  const facts=new Map(d.facts.map(f=>[f.id,f])),ids=new Set();if(facts.size!==120)throw Error('중복 학습 기준이 있습니다.');
  for(const q of d.questions){if(!q?.id||ids.has(q.id)||q.subject!==SUBJECT||!facts.has(q.fact_id)||![0,1,2,3].includes(q.violation_round)||q.choices?.length!==4||new Set(q.choices.map(c=>c.id)).size!==4||new Set(q.choices.map(c=>c.text)).size!==4||!q.choices.some(c=>c.id===q.answer)||!q.legal_basis||q.legal_as_of!=='2026-11-01')throw Error('법규 문항 구성이 올바르지 않습니다.');ids.add(q.id);}
 }
 function importQuestions(){
  const known=new Set(bank.map(q=>q.id));for(const row of data.questions){if(known.has(row.id))continue;const q=JSON.parse(JSON.stringify(row)),override=adminQuestionOverrides.get(q.id);if(override)applyQuestionOverrideToQuestion(q,override);bank.push(q);known.add(q.id);}
  AIRLINE_ONLY_SUBJECTS.add(SUBJECT);populateSubjects();updateErrorCount();window.PilotBankRuntime=window.PilotBankRuntime||{};window.PilotBankRuntime.totalQuestionCount=bank.length;
  window.dispatchEvent(new CustomEvent('pilotbank:reference-loaded',{detail:{subject:SUBJECT,questions:200,loaded:true,legalAsOf:'2026-11-01'}}));
 }
 async function load(){
  if(data){importQuestions();return data;}if(pending)return pending;
  pending=(async()=>{const r=await fetch(PATH,{cache:'no-store'});if(!r.ok)throw Error('법규 학습지 파일을 불러오지 못했습니다.');const d=await r.json();validate(d);data=d;importQuestions();return d;})().finally(()=>{pending=null;});return pending;
 }
 function rows(){
  if(!data)return[];const wanted=new Set(data.questions.map(q=>q.id));
  return bank.filter(q=>wanted.has(q.id)&&(!state.category||q.topic_id==='PEN-'+state.category.toUpperCase())&&(state.round==='all'||q.violation_round===Number(state.round))&&q.gradable!==false&&!progressStore[q.id]?.errorReported&&(state.mode!=='exam'||!progressStore[q.id]?.examExcluded)&&(
   state.scope==='all'||state.scope==='unseen'&&!(progressStore[q.id]?.attempts>0)||state.scope==='wrong'&&progressStore[q.id]?.incorrect>0||state.scope==='favorite'&&progressStore[q.id]?.favorite));
 }
 function selectPool(){const p=shuffle(rows());return p.slice(0,state.count==='all'?p.length:Number(state.count));}
 function status(message,error=false){const e=$('[data-pen96-status]',panel);e.textContent=message;e.classList.toggle('pen96-error',error);}
 function updateSummary(){
  if(!data)return;const p=rows(),all=bank.filter(q=>q.subject===SUBJECT);
  $('[data-pen96-available]',panel).textContent=`선택 범위 ${p.length}문항 · 같은 문항 중복 없이 출제`;
  $('[data-pen96-progress]',panel).textContent=`풀이 완료 ${all.filter(q=>progressStore[q.id]?.attempts>0).length} / 200문항 · 오답 ${all.filter(q=>progressStore[q.id]?.incorrect>0).length}문항`;
  $('[data-pen96-start]',panel).disabled=loading||!p.length;
  status(p.length?'학습은 즉시 해설을 확인하고, 시험은 마지막에 채점합니다.':state.scope==='wrong'?'선택 범위에 기록된 오답이 없습니다.':state.scope==='favorite'?'선택 범위에 즐겨찾기한 문제가 없습니다.':'선택 범위에 출제할 문제가 없습니다. 차수·분야 조건을 확인하세요.');
 }
 function renderTable(){
  if(!data)return;const needle=state.search.trim().toLocaleLowerCase();
  const facts=data.facts.filter(f=>(!state.category||f.category_id===state.category)&&(!needle||[f.title,f.basis,f.single,...f.rounds,f.note].join(' ').toLocaleLowerCase().includes(needle)));
  $('[data-pen96-fact-count]',panel).textContent=`${facts.length}개 기준`;
  $('[data-pen96-facts]',panel).innerHTML=facts.length?facts.map(f=>`<tr><th scope="row">${esc(f.category_title)}<small>${esc(f.basis)}</small></th><td>${esc(f.title)}</td><td>${f.rounds.length?f.rounds.map((v,i)=>`<p><b>${['1차','2차',esc(f.third_label)][i]}</b> ${esc(v)}</p>`).join(''):`<strong>${esc(f.single)}</strong>`}<small>${esc(f.note)}</small></td></tr>`).join(''):'<tr><td colspan="3">검색 결과가 없습니다.</td></tr>';
 }
 function ensure(){
  if(panel)return;panel=document.createElement('section');panel.id='aviationPenalties96Card';panel.className='card hidden pen96-panel';panel.setAttribute('aria-labelledby','pen96Title');
  panel.innerHTML=`<div class="section-head"><div><span class="eyebrow">AVIATION SAFETY · PENALTIES</span><h2 id="pen96Title">항공안전법 시행규칙 벌칙</h2><p class="muted">벌금·과태료·자격 정지·취소를 구분하고, 위반차수별 기준을 익히세요.</p></div><button type="button" class="button secondary" data-pen96-back>참고서 선택</button></div>
   <div class="pen96-summary"><span><b>200</b> 객관식 문항</span><span><b>5</b> 학습 영역</span><span><b>2026.11.01</b> 확인 기준</span></div>
   <div class="pen96-basis">형사벌칙·벌금: <b>항공안전법 본문</b> · 항공종사자 행정처분: <b>시행규칙 별표 10</b> · 과태료: <b>시행령 별표 5</b><p>법정형·법정 상한과 개별 부과기준을 구분합니다. 차수별 문제는 감경·가중 전 개별기준을 묻습니다.</p></div>
   <p class="muted" data-pen96-progress></p><div class="pen96-controls">
   <label>학습 영역<select data-pen96-setting="category"><option value="">전체 영역</option></select></label>
   <label>출제 차수<select data-pen96-setting="round"><option value="all">모든 기준</option><option value="1">1차 위반</option><option value="2">2차 위반</option><option value="3">3차·3차 이상 위반</option><option value="0">차수 구분 없는 기준</option></select></label>
   <label>복습 범위<select data-pen96-setting="scope"><option value="all">전체 문제</option><option value="unseen">미풀이 문제</option><option value="wrong">오답만</option><option value="favorite">즐겨찾기만</option></select></label>
   <label>풀이 방식<select data-pen96-setting="mode"><option value="study">학습 · 즉시 해설</option><option value="exam">시험 · 마지막 채점</option></select></label>
   <label>문제 수<select data-pen96-setting="count"><option value="10">10문항</option><option value="20" selected>20문항</option><option value="50">50문항</option><option value="all">선택 범위 전체</option></select></label></div>
   <div class="pen96-launch"><div><p data-pen96-available></p><p data-pen96-status role="status" aria-live="polite">법규 학습지를 불러오는 중입니다.</p></div><button type="button" class="button" data-pen96-start disabled>문제 풀기</button><button type="button" class="button secondary hidden" data-pen96-retry>다시 불러오기</button></div>
   <details class="pen96-sheet"><summary>벌칙·처분 비교표 보기 <small data-pen96-fact-count></small></summary><label class="pen96-search">위반행위·조문·금액·기간 검색<input type="search" data-pen96-search placeholder="예: 흡연, 150일, 200만원" autocomplete="off"></label><div class="pen96-table-wrap"><table><caption class="pen96-sr-only">벌칙·행정처분·과태료 비교표</caption><thead><tr><th scope="col">구분·근거</th><th scope="col">위반행위·요건</th><th scope="col">기본기준</th></tr></thead><tbody data-pen96-facts></tbody></table></div></details>
   <details class="pen96-sources"><summary>법령 기준·출처 안내</summary><p>2026년 11월 1일 시행 기준의 핵심 범위를 선별했습니다. 2026년 11월 13일 시행 예정 내용은 출제하지 않았습니다. 과태료 가중기간의 개정 전 처분에는 부칙상 경과기준이 별도로 있습니다. 비교표 검색은 표를 검색하는 기능이며, 출제 범위는 위 영역·차수 설정을 따릅니다.</p><ul data-pen96-sources></ul></details>`;
  (document.querySelector('main.container')||document.querySelector('main')).append(panel);
  panel.addEventListener('change',e=>{const key=e.target.dataset.pen96Setting;if(!Object.hasOwn(state,key))return;state[key]=e.target.value;updateSummary();if(key==='category')renderTable();});
  $('[data-pen96-search]',panel).addEventListener('input',e=>{state.search=e.target.value;renderTable();});
  $('[data-pen96-back]',panel).onclick=()=>$('#referenceQuickNavBtn')?.click();$('[data-pen96-start]',panel).onclick=launch;$('[data-pen96-retry]',panel).onclick=show;
 }
 function render(){
  const select=$('[data-pen96-setting="category"]',panel);select.replaceChildren(new Option('전체 영역',''),...data.categories.map(c=>new Option(`${c.title} (${c.question_count})`,c.id)));
  for(const e of panel.querySelectorAll('[data-pen96-setting]'))e.value=state[e.dataset.pen96Setting];$('[data-pen96-search]',panel).value=state.search;
  $('[data-pen96-sources]',panel).innerHTML=Object.values(data.sources).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('');renderTable();updateSummary();
 }
 async function show(){
  ensure();setQuizFocus(false);hideStudySurfaces();hideAllHubs();panel.classList.remove('hidden');const token=epoch;loading=true;$('[data-pen96-start]',panel).disabled=true;$('[data-pen96-retry]',panel).classList.add('hidden');status('법규 학습지를 불러오는 중입니다.');window.scrollTo({top:0,behavior:'smooth'});
  try{await load();if(token!==epoch)return;loading=false;render();}catch(err){if(token!==epoch)return;loading=false;status(String(err.message||err),true);$('[data-pen96-retry]',panel).classList.remove('hidden');}
 }
 async function launch(){
  const account=owner(),token=epoch;loading=true;$('[data-pen96-start]',panel).disabled=true;
  try{await load();if(account!==owner()||token!==epoch)return;const p=selectPool();if(!p.length){loading=false;updateSummary();return;}
   activateLearningContext({kind:'reference',label:SUBJECT,allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:'200문항 · 형사벌칙·행정처분·과태료 · 2026-11-01 시행 기준'});
   els.mode.value=state.mode;els.noFigureOnly.checked=false;els.scope.value='all';applyModeUIState();hide();startSession(p,{type:state.mode,from:'penalties96',contextLabel:SUBJECT,keepOrder:true});
  }catch(err){status(String(err.message||err),true);}finally{loading=false;if(panel&&!panel.classList.contains('hidden'))updateSummary();}
 }
 function syncReturn(){
  const visible=Array.isArray(session)&&session.length>0&&session.every(q=>q.subject===SUBJECT);
  for(const id of ['quizCard','resultCard']){const host=document.getElementById(id);if(!host)continue;let bar=host.querySelector('.pen96-return');if(!bar){bar=document.createElement('div');bar.className='pen96-return';const b=document.createElement('button');b.type='button';b.className='button secondary';b.id=id==='quizCard'?'pen96QuizReturn':'pen96ResultReturn';b.textContent='벌칙 학습지로';b.onclick=show;bar.append(b);host.prepend(bar);}bar.classList.toggle('hidden',!visible);}
 }
 function boot(){
  ensure();const grid=$('#referenceStudyHubCard .reference-book-grid');if(!grid){console.error('[벌칙 학습지] 참고서 메뉴를 찾지 못했습니다.');return;}
  const b=document.createElement('button');b.id='referencePenalties96Btn';b.type='button';b.className='book-choice-card reference-book-card pen96-entry';b.innerHTML='<span class="pen96-cover" aria-hidden="true"><span>LAW</span><small>PENALTIES</small></span><strong>항공안전법 시행규칙 벌칙</strong><span>200문항 · 벌금·과태료·차수별 행정처분</span>';b.onclick=show;grid.append(b);
  const originalHide=hideStudySurfaces;hideStudySurfaces=function(...args){const r=originalHide.apply(this,args);hide();return r;};const originalHubs=hideAllHubs;hideAllHubs=function(...args){const r=originalHubs.apply(this,args);hide();return r;};
  const originalStart=startSession;startSession=function(source=null,meta=null){if(!source&&learningContext?.lockedSubject===SUBJECT&&data){source=selectPool();if(!source.length){show();return;}meta={type:els.mode.value,from:'penalties96',contextLabel:SUBJECT,keepOrder:true,...meta};}const r=originalStart.call(this,source,meta);syncReturn();return r;};
  QUIZ_EXIT_TARGETS.set('#referencePenalties96Btn',SUBJECT);QUIZ_EXIT_TARGETS.set('#pen96QuizReturn',SUBJECT);QUIZ_EXIT_TARGETS.set('#pen96ResultReturn',SUBJECT);
  els.restart?.addEventListener('click',e=>{if(!session?.length||!session.every(q=>q.subject===SUBJECT))return;e.preventDefault();e.stopImmediatePropagation();show();},true);
  window.addEventListener('pilotbank:bank-loaded',()=>load().catch(()=>{}));if(window.PilotBankRuntime?.totalQuestionCount)load().catch(()=>{});
 }
 window.PilotBankPenalties96={version:'11.60.96',subject:SUBJECT,open:show,load,selectPool,snapshot:()=>({loaded:!!data,state:{...state},questions:data?.questions.length||0,facts:data?.facts.length||0,available:rows().length})};boot();
})();
