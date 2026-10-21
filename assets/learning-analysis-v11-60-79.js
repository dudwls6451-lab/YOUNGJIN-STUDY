/* Lifetime analysis uses question counters once, never adds dated attempts again. */
(()=>{
 'use strict';
 const PRIVATE_SUBJECT='항공기상서비스 사용자 안내서';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=n=>Number.isFinite(Number(n))?Math.max(0,Math.floor(Number(n))):0;
 const fmt=n=>Number(n).toLocaleString('ko-KR');
 const percent=n=>n===null?'기록 없음':n.toFixed(1)+'%';
 const compare=(a,b)=>a.label.localeCompare(b.label,'ko',{numeric:true});
 let api,host,account='',blocked=false,subject='',level='subject',sort='priority',rowLimit=20,rows=[],actionRows=[],timer;

 function targetFor(subject,plan){
  const chosen=Array.isArray(plan?.subjects)?plan.subjects:Object.keys(plan?.goals||{});
  const goal=Number(chosen.includes(subject)?plan?.goals?.[subject]?.accuracy:NaN);
  return Number.isFinite(goal)&&goal>=1&&goal<=100?goal:80;
 }
 function groupOf(q,level){
  const subject=String(q.subject||'미분류'),unit=String(q.study_unit??q.studyUnit??q.unit??q.subunit?.code?.split?.('.')[0]??'').trim();
  const round=q.source_round??q.round;
  const unitKey=unit?'unit:'+unit:round!=null?'round:'+round:'other';
  const unitLabel=round!=null?round+'회차':unit==='criteria'?'기준 퀴즈':unit==='symbols'?'기상도 심볼':unit?(/회차|단계|장$/.test(unit)?unit:'SU '+unit):'단원 미지정';
  const unitTitle=String(q.study_unit_title||'').trim();
  const topic=typeof q.topic==='string'?q.topic.trim():'';
  const part=topic?'topic:'+topic:typeof q.subunit==='object'&&q.subunit?String(q.subunit.code||''):String(q.subunit||q.category_code||'');
  const title=topic||q.symbol_category||(typeof q.subunit==='object'&&q.subunit?String(q.subunit.title||q.category||''):String(q.category||''));
  if(level==='subject')return {key:JSON.stringify([subject]),subject,label:subject,context:'교재 / 과목'};
  if(level==='unit')return {key:JSON.stringify([subject,unitKey]),subject,label:[unitLabel,unitTitle].filter(Boolean).join(' · '),context:subject};
  const label=topic?topic:[part,title&&title!==part?title:''].filter(Boolean).join(' · ');
  return {key:JSON.stringify([subject,unitKey,part||title||'other']),subject,label:label||[unitLabel,unitTitle].filter(Boolean).join(' · '),context:[subject,label?unitLabel:''].filter(Boolean).join(' · ')};
 }
 function finish(row){
  row.accuracy=row.attempts?row.correct/row.attempts*100:null;
  row.coverage=row.total?row.solved/row.total*100:0;
  row.enough=row.solved>=5&&row.attempts>=10;
  row.gap=row.accuracy===null?0:Math.max(0,row.target-row.accuracy);
  row.state=!row.attempts?'unseen':!row.enough?'sample':row.gap>0?'weak':'good';
  return row;
 }
 function analyze(snapshot,level='subunit',selected=''){
  const groups=new Map(),seen=new Set();let excluded=0;
  for(const q of snapshot.questions||[]){
   if(!q?.id||seen.has(String(q.id)))continue;
   seen.add(String(q.id));
   const rec=snapshot.records?.[q.id]||{},book=String(q.subject||'미분류');
   if(selected&&book!==selected)continue;
   if(q.gradable===false||q.answer_pending_review===true||rec.errorReported){excluded++;continue;}
   const meta=groupOf(q,level);
   if(!groups.has(meta.key))groups.set(meta.key,{...meta,total:0,solved:0,attempts:0,correct:0,wrong:0,target:targetFor(book,snapshot.plan),ids:[],wrongIds:[],practiceIds:[]});
   const row=groups.get(meta.key),attempts=Math.max(number(rec.attempts),number(rec.correct)+number(rec.incorrect)),correct=Math.min(attempts,number(rec.correct));
   row.total++;row.ids.push(String(q.id));row.attempts+=attempts;row.correct+=correct;
   if(attempts)row.solved++;
   if(rec.lastResult==='incorrect')row.wrongIds.push(String(q.id));
   if(!api?.canPractice||api.canPractice(q))row.practiceIds.push(String(q.id));
  }
  const rows=[...groups.values()].map(row=>finish({...row,wrong:row.attempts-row.correct}));
  const total=rows.reduce((a,r)=>{for(const key of ['total','solved','attempts','correct','wrong'])a[key]+=r[key];return a},{total:0,solved:0,attempts:0,correct:0,wrong:0});
  total.accuracy=total.attempts?total.correct/total.attempts*100:null;
  return {rows,total,excluded};
 }
 const priority=(a,b)=>{
  const rank=r=>r.state==='weak'?0:r.gap>0?1:r.state==='unseen'?3:r.state==='sample'?2:4;
  return rank(a)-rank(b)||b.gap-a.gap||b.attempts-a.attempts||compare(a,b);
 };
 const stateText=r=>({weak:'목표 미달',sample:'표본 부족',unseen:'미학습',good:'목표 달성'}[r.state]);
 const scoreText=r=>r.accuracy!==null&&r.gap>0&&r.gap<.1?r.target+'% 미만':percent(r.accuracy);
 const ready=()=>host&&!document.querySelector('#statsCard')?.classList.contains('hidden');
 function getSnapshot(){
  const snapshot=api?.snapshot();
  if(!snapshot||blocked||!snapshot.ready||String(snapshot.account)!==String(api.user()))return null;
  // A stale bank must never expose protected course names after a profile change.
  return {...snapshot,questions:snapshot.questions.filter(q=>q.subject!==PRIVATE_SUBJECT||api.canReadPrivate?.())};
 }
 function clear(){
  clearTimeout(timer);rows=[];actionRows=[];account='';subject='';level='subject';rowLimit=20;
  if(host)host.innerHTML='<h3 id="learningAnalysis79Title">누적 학습 분석</h3><p class="la79-muted" role="status">현재 계정의 학습기록을 불러온 뒤 분석을 표시합니다.</p>';
 }
 function ensure(){
  host=document.querySelector('#learningAnalysis79');
  if(!host)return false;
  if(!host.dataset.bound){
   host.dataset.bound='1';
   host.addEventListener('change',e=>{
    if(e.target.id==='la79Subject'){subject=e.target.value;level=subject?'unit':'subject';}
    if(e.target.id==='la79Level')level=e.target.value;
    if(e.target.id==='la79Sort')sort=e.target.value;
    rowLimit=20;render();host.querySelector('#'+e.target.id)?.focus({preventScroll:true});
   });
   host.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-la79-more')){rowLimit+=20;drawRows();host.querySelector('[data-la79-more]')?.focus({preventScroll:true});return;}
    if(button.hasAttribute('data-la79-book')){subject=button.dataset.la79Book;level='unit';rowLimit=20;render();host.querySelector('#la79Level')?.focus({preventScroll:true});return;}
    if(button.hasAttribute('data-la79-practice')){
     const snap=getSnapshot();if(!snap||String(snap.account)!==account){clear();return;}
     const row=actionRows[Number(button.dataset.la79Practice)];if(!row)return;
     const wrong=button.dataset.la79Wrong==='true';
     const allowed=new Set(snap.questions.filter(q=>String(q.subject||'미분류')===row.subject&&q.gradable!==false&&!q.answer_pending_review&&!snap.records?.[q.id]?.errorReported&&(!api.canPractice||api.canPractice(q))).map(q=>String(q.id)));
     const ids=row.practiceIds.filter(id=>allowed.has(id)&&(!wrong||snap.records?.[id]?.lastResult==='incorrect'));
     if(!ids.length){host.querySelector('#la79Status').textContent='현재 선택한 범위에 풀 수 있는 문제가 없습니다.';return;}
     api.practice({subject:row.subject,questionIds:ids,label:row.subject+' · '+row.label+(wrong?' · 오답 복습':' · 영역 학습')});
    }
   });
  }
  return true;
 }
 function actions(row,index,analysisLevel=level){
  if(analysisLevel==='subject')return `<button type="button" class="la79-button" data-la79-book="${esc(row.subject)}">영역 분석 보기</button>`;
  const available=new Set(row.practiceIds),wrong=row.wrongIds.filter(id=>available.has(id)).length;
  return `<button type="button" class="la79-button" data-la79-practice="${index}" ${row.practiceIds.length?'':'disabled'} aria-label="${esc(row.label)} 영역 문제 풀기">영역 문제 풀기</button><button type="button" class="la79-button" data-la79-practice="${index}" data-la79-wrong="true" ${wrong?'':'disabled'} aria-label="${esc(row.label)} 오답 ${wrong}문제 풀기">오답만 ${fmt(wrong)}문제</button>`;
 }
 function bar(row){
  const value=row.accuracy??0;
  return `<div class="la79-track" role="img" aria-label="정답률 ${percent(row.accuracy)}, 목표 ${row.target}%, 학습한 고유 문항 ${row.solved}개, 누적 풀이 ${row.attempts}회"><span class="la79-fill ${row.state==='weak'?'la79-fill-weak':''}" style="--la79-value:${value.toFixed(2)}%"></span><span class="la79-target" style="left:${row.target}%" aria-hidden="true"></span></div>`;
 }
 function chart(row){
  return `<div class="la79-chart-row"><div class="la79-row-top"><div><small>${esc(row.context)}</small><strong>${esc(row.label)}</strong></div><span class="la79-score ${row.state==='weak'?'la79-danger':''}">${scoreText(row)}</span></div>${bar(row)}<div class="la79-row-meta"><span class="la79-badge la79-${row.state}">${stateText(row)}</span><span>목표 ${row.target}% · ${fmt(row.solved)}/${fmt(row.total)}문항 · ${fmt(row.attempts)}회 풀이</span></div></div>`;
 }
 function explanation(row){
  const name=row.context+' · '+row.label,stats=`${fmt(row.solved)}개 문항을 ${fmt(row.attempts)}회 풀어 정답률은 ${scoreText(row)}`;
  if(row.state==='weak')return `<strong>${esc(name)}</strong><p>${stats}로, 목표 ${row.target}%보다 ${row.gap<.1?'0.1%p 미만':row.gap.toFixed(1)+'%p'} 낮습니다. 이 영역의 개념과 해설을 먼저 복습하고, 최근 틀린 문제 ${fmt(row.wrongIds.length)}개를 다시 풀어 보세요.${row.coverage<50?' 학습 범위도 '+row.coverage.toFixed(1)+'%이므로 아직 안 푼 문제까지 넓혀서 확인하세요.':''}</p>`;
  if(row.state==='sample')return `<strong>${esc(name)}</strong><p>${stats}입니다.${row.gap>0?' 목표 '+row.target+'%보다 낮지만,':''} 표본이 적어 취약 여부를 단정하기 어렵습니다. 서로 다른 문항을 더 풀어 확인하세요. 확정 분석 기준은 고유 5문항 이상·누적 10회 이상입니다.</p>`;
  if(row.state==='unseen')return `<strong>${esc(name)}</strong><p>아직 푼 기록이 없어 실력을 판단할 수 없습니다. ${fmt(row.total)}문항 중 먼저 5~10문항을 풀어 학습 수준을 확인해 보세요.</p>`;
  return `<strong>${esc(name)}</strong><p>${stats}로 목표 ${row.target}%를 충족합니다. ${row.coverage<100?'미학습 문항을 풀어 범위를 넓히고,':'간격을 두고 다시 풀어 유지하고,'} 최근 틀린 문제는 해설을 확인하세요.</p>`;
 }
 function drawRows(){
  const list=host.querySelector('#la79AllRows');if(!list)return;
  list.innerHTML=rows.slice(0,rowLimit).map((row,i)=>`<article class="la79-detail-row">${chart(row)}<div class="la79-actions">${actions(row,i)}</div></article>`).join('')+(rows.length>rowLimit?`<button type="button" class="la79-button la79-more" data-la79-more>영역 20개 더 보기 (${Math.min(rowLimit,rows.length)} / ${rows.length})</button>`:'');
 }
 function render(){
  if(!api||!ensure())return;
  const detailsOpen=host.querySelector('.la79-all')?.open;
  const snapshot=getSnapshot();
  if(!snapshot){
   clear();
   const current=api.snapshot();
   if(!blocked&&current?.error&&String(current.account)===String(api.user()))host.querySelector('[role="status"]').textContent='학습기록을 불러오지 못해 분석을 표시할 수 없습니다. 연결을 확인한 뒤 페이지를 새로고침해 주세요.';
   return;
  }
  if(account&&account!==String(snapshot.account))clear();
  account=String(snapshot.account);
  const books=analyze(snapshot,'subject').rows.sort(compare);
  if(subject&&!books.some(b=>b.subject===subject)){subject='';level='subject';}
  const model=analyze(snapshot,level,subject),fine=analyze(snapshot,'subunit',subject),total=model.total;
  const comparator=sort==='name'?compare:sort==='accuracy'?(a,b)=>(a.accuracy??101)-(b.accuracy??101)||compare(a,b):priority;
  rows=model.rows.sort(comparator);
  const weak=fine.rows.filter(r=>r.state==='weak').sort(priority);
  const candidates=fine.rows.filter(r=>r.attempts&&r.gap>0).sort(priority);
  const recommendations=(candidates.length?candidates:fine.rows.filter(r=>r.state==='unseen').sort(compare)).slice(0,3);
  if(!recommendations.length)recommendations.push(...fine.rows.filter(r=>r.attempts).sort((a,b)=>(a.accuracy??100)-(b.accuracy??100)).slice(0,3));
  actionRows=rows.concat(recommendations);
  const shown=rows.slice(0,8),sample=fine.rows.filter(r=>r.state==='sample').length;
  host.innerHTML=`<header class="la79-header"><div><span class="la79-eyebrow">LIFETIME ANALYSIS</span><h3 id="learningAnalysis79Title">누적 학습 분석</h3><p class="la79-muted">지금까지의 전체 풀이 기록으로 보는 나의 학습 지도</p></div><span class="la79-period">전체 기간</span></header>
   <div class="la79-summary"><div><span>누적 정답률</span><strong>${percent(total.accuracy)}</strong><small>정답 ${fmt(total.correct)} / 전체 풀이 ${fmt(total.attempts)}회</small></div><div><span>학습한 문항</span><strong>${fmt(total.solved)}<small> / ${fmt(total.total)}</small></strong><small>반복 풀이를 뺀 고유 문항 수</small></div><div><span>복습이 필요한 세부 영역</span><strong>${fmt(weak.length)}<small>개</small></strong><small>목표 미달 · 표본 부족 ${sample}개는 별도 판단</small></div></div>
   <div class="la79-controls"><label>교재 / 과목<select id="la79Subject"><option value="">전체 교재</option>${books.map(b=>`<option value="${esc(b.subject)}" ${subject===b.subject?'selected':''}>${esc(b.subject)}</option>`).join('')}</select></label><label>분석 범위<select id="la79Level">${[['subject','교재별'],['unit','Study Unit / 회차별'],['subunit','세부 영역별']].map(([v,l])=>`<option value="${v}" ${level===v?'selected':''}>${l}</option>`).join('')}</select></label><label>정렬<select id="la79Sort">${[['priority','학습 우선순위'],['accuracy','정답률 낮은 순'],['name','교재 / 영역 순서']].map(([v,l])=>`<option value="${v}" ${sort===v?'selected':''}>${l}</option>`).join('')}</select></label></div>
   ${!total.attempts?'<p class="la79-empty">'+(total.total?'아직 이 범위의 풀이 기록이 없습니다. 문제를 풀면 정답률 그래프와 취약 영역 분석이 자동으로 표시됩니다.':'분석 가능한 문항을 불러오지 못했습니다. 교재가 로드되었는지 확인해 주세요.')+'</p>':''}
   <div class="la79-layout"><section class="la79-chart-panel" aria-labelledby="la79ChartTitle"><div class="la79-panel-head"><h4 id="la79ChartTitle">영역별 정답률</h4><span class="la79-muted">0–100%</span></div><p class="la79-chart-key"><i aria-hidden="true"></i> 세로선: 교재별 목표 정답률</p><div class="la79-chart">${shown.map(chart).join('')||'<p class="la79-muted">표시할 영역이 없습니다.</p>'}</div>${rows.length>8?`<p class="la79-muted">현재 정렬 기준 상위 8개 영역입니다. 전체 ${fmt(rows.length)}개 영역은 아래에서 확인하세요.</p>`:''}</section>
   <section class="la79-recommendations" aria-labelledby="la79AdviceTitle"><h4 id="la79AdviceTitle">지금 무엇을 공부하면 좋을까?</h4><p class="la79-muted">${weak.length?'목표에 미달한 영역부터 복습을 권합니다.':candidates.length?'표본이 적은 영역은 추가 풀이로 먼저 확인하세요.':!total.attempts?'풀이 기록이 쌓이면 구체적인 복습 순서를 안내합니다.':'목표를 유지하면서 미학습 영역도 확인하세요.'}</p>${recommendations.map((row,i)=>{
    const index=rows.length+i,buttons=actions(row,index,'subunit');
    return `<article class="la79-advice"><div class="la79-advice-heading"><span class="la79-rank">${i+1}</span><span class="la79-badge la79-${row.state}">${stateText(row)}</span></div>${explanation(row)}<div class="la79-actions">${buttons}</div></article>`;
   }).join('')}</section></div>
   <details class="la79-all"><summary>전체 영역과 학습 버튼 보기 (${fmt(model.rows.length)}개)</summary><div id="la79AllRows"></div></details>
   <p id="la79Status" class="la79-muted" role="status"></p><details class="la79-method"><summary>분석 기준</summary><p>공부 기간·홈 집중학습 선택과 무관하게, 현재 문제은행에 등록되어 있고 접근 권한이 있는 문항의 계정별 누적 기록을 한 번씩 합산합니다. 정답률 = 누적 정답 횟수 ÷ 누적 풀이 횟수 × 100이며 반복 풀이도 포함합니다. 날짜별 이력을 다시 더하지 않습니다. 다른 기기에서 푼 기록은 페이지를 새로고침해 불러온 뒤 분석에 반영됩니다.</p><p>교재별로 저장한 목표 정답률을 사용하며 목표가 없으면 80%를 기준으로 합니다. 고유 5문항 이상·누적 10회 이상인 영역만 ‘목표 미달 / 목표 달성’으로 판단합니다. 그보다 적으면 ‘표본 부족’, 풀이가 없으면 ‘미학습’입니다. 경고 여부는 반올림 전 정답률로 판단합니다.</p><p>교재에 등록된 Study Unit·회차·소단원 구분을 사용합니다. 소단원이 없으면 상위 단원을 사용하며, 회차만 등록된 모의고사는 회차별로 분석합니다. 정답 미확정·채점 제외·오류 신고 문항 ${fmt(model.excluded)}개는 분석에서 제외했습니다. 오답 풀기는 ‘최근 풀이가 오답인 문항’만 포함합니다. 이론 읽기 진도와 별도 스터디그룹 퀴즈는 문제은행 정답률에 합산하지 않습니다.</p></details>`;
  drawRows();
  host.querySelector('.la79-all').open=!!detailsOpen;
  host.dataset.count=String(model.rows.length);
 }
 function refresh(){if(ready()){clearTimeout(timer);timer=setTimeout(render,80);}}
 function init(bridge){
  api=bridge;ensure();
  window.addEventListener('pilotbank:bank-loaded',refresh);
  window.addEventListener('pilotbank:ir-gleim-loaded',refresh);
  window.addEventListener('pilotbank:analysis-updated',refresh);
  window.addEventListener('storage',refresh);
  try{window.supabaseClient?.auth?.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'||(session?.user?.id&&account&&session.user.id!==account)){blocked=true;clear();}
  });}catch{}
 }
 window.PilotBankLearningAnalysis79={init,render,refresh,clear,analyze};
})();
