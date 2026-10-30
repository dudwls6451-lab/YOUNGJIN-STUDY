/* A public stage catalog; personal statistics always come from the active account. */
(()=>{
 const SUBJECTS=['검댕이 항공법규','비행이론','항공기상','항공교통통신','비행정보 및 관제절차','K-AIM'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let api,panel,catalog,pending,loadError=false,subject='',view='stages',owner='',epoch=0,periodIndex=null;
 function prepareStats(){periodIndex=api?.period()?.plan()?api.period().attemptIndex():null;}
 function ensure(){
  if(panel)return panel;panel=document.createElement('section');panel.id='stagePractice91Card';panel.className='card hidden';panel.setAttribute('aria-labelledby','stagePractice91Title');
  document.querySelector('#controlsCard').before(panel);
  panel.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button||button.disabled)return;
   if(button.hasAttribute('data-stage91-back')){api.back();return;}
   if(button.hasAttribute('data-stage91-custom')){api.custom(subject);return;}
   if(button.hasAttribute('data-stage91-retry')){fetchCatalog(true).then(()=>render());return;}
   if(button.hasAttribute('data-stage91-refresh')){api.period()?.refresh(true);render();return;}
   if(button.dataset.stage91View){view=button.dataset.stage91View;render();return;}
   if(button.dataset.stage91Action){prepareStats();const groups=getGroups(),group=groups.find(g=>g.id===button.dataset.stage91Group);if(!group)return;
    const rows=selection(group,button.dataset.stage91Action),label=subject+' · '+group.label+(button.dataset.stage91Action==='wrong'?' · 오답':'');
    if(!rows.length)return;
    api.start({subject,questionIds:rows.map(q=>q.id),label,stageId:group.id,view,mode:button.dataset.stage91Action==='exam'?'exam':'study'});
   }
  });return panel;
 }
 async function fetchCatalog(force=false){
  if(catalog&&!force)return catalog;if(pending)return pending;loadError=false;
  pending=(async()=>{try{const response=await fetch('./data/stage-practice-catalog-v11-60-91.json?v=11.60.91',{cache:'no-store'});if(!response.ok)throw Error('catalog');const data=await response.json();for(const s of SUBJECTS)if(!Array.isArray(data.books?.[s]?.stages))throw Error('stages');catalog=data;return data;}catch{loadError=true;return null;}finally{pending=null;}})();return pending;
 }
 async function open(s,options={}){
  if(!api||!SUBJECTS.includes(s)||!api.enter(s))return false;ensure();const token=++epoch;subject=s;owner=String(api.user());view=options.view==='mocks'&&s==='검댕이 항공법규'?'mocks':'stages';panel.classList.remove('hidden');render();window.scrollTo({top:0,behavior:'instant'});await fetchCatalog();if(token!==epoch||owner!==String(api.user())||panel.classList.contains('hidden'))return false;render();if(options.stageId){const card=[...panel.querySelectorAll('[data-stage91-card]')].find(c=>c.dataset.stage91Card===options.stageId);card?.scrollIntoView({block:'start',behavior:'instant'});}api.period()?.refresh();return true;
 }
 function getGroups(){
  const qs=api.questions(subject);
  if(view==='mocks'&&subject==='검댕이 항공법규')return Array.from({length:28},(_,i)=>{const rows=qs.filter(q=>Number(q.mock_round)===i+1);return {id:'mock-'+(i+1),label:'제'+(i+1)+'회',title:'항공법규 모의고사',ids:rows.map(q=>String(q.id)),questions:rows,missing:0,mock:true};});
  const stages=catalog?.books?.[subject]?.stages||[],lookup=new Map(qs.map(q=>[String(q.id),q])),covered=new Set();
  const groups=stages.map(st=>{const ids=[...new Set(st.question_ids.map(String))],known=new Set(ids);
   // Future questions with explicit stage tags can join their existing stage without renumbering it.
   for(const q of qs)if(!known.has(String(q.id))&&(q.theory_stage_id===st.id||q.topic_id===st.id)){ids.push(String(q.id));known.add(String(q.id));}
   ids.forEach(id=>covered.add(id));return {id:st.id,label:st.order+'단계',title:st.title,ids,questions:ids.filter(id=>lookup.has(id)).map(id=>lookup.get(id)),missing:ids.filter(id=>!lookup.has(id)).length};
  });
  const rest=qs.filter(q=>!covered.has(String(q.id)));if(rest.length)groups.push({id:'additional',label:'추가 문항',title:'새로 추가된 문제',ids:rest.map(q=>String(q.id)),questions:rest,missing:0});return groups;
 }
 function itemStats(group){
  const period=api.period(),questions=group.ids.map(id=>({id})),p=period?.plan();
  if(p)return period.stats(subject,questions,periodIndex);
  const store=api.records(),counts=new Map();for(const id of group.ids){const r=store[id];if(Number(r?.attempts)>0)counts.set(id,{attempts:Number(r.attempts)||0,correct:Number(r.correct)||0});}
  // Use the same completed-round definition as My Page even when no study period is set.
  let solved=0,attempts=0,correct=0,rounds=group.ids.length?Infinity:0;
  for(const id of group.ids){const c=counts.get(id);rounds=Math.min(rounds,c?.attempts||0);if(c){solved++;attempts+=c.attempts;correct+=c.correct;}}
  return {total:group.ids.length,solved,attempts,correct,incorrect:attempts-correct,rounds,nextRoundSolved:group.ids.filter(id=>(counts.get(id)?.attempts||0)>rounds).length,progressPct:group.ids.length?Math.round(solved/group.ids.length*100):0,accuracyPct:attempts?Math.round(correct/attempts*100):null};
 }
 function selection(group,action){
  const available=group.questions.filter(q=>api.canPractice(q));if(action==='all')return available;if(action==='exam')return available.filter(q=>!api.records()[q.id]?.examExcluded);
  const period=api.period();if(period?.plan())return available.filter(q=>{const c=periodIndex?.get(String(q.id));return c&&c.attempts>c.correct;});return available.filter(q=>Number(api.records()[q.id]?.incorrect)>0);
 }
 function gauge(s,label){
  const current=s.nextRoundSolved>0?s.rounds+1:Math.max(1,s.rounds),layers=Array.from({length:Math.min(10,current)},(_,i)=>i<s.rounds?s.total:s.nextRoundSolved);
  return `<div class="sp-round-gauge sp-round-layered stage91-gauge" role="progressbar" aria-label="${esc(label)} 진도율" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progressPct}">${layers.map((n,i)=>`<span class="sp-round-fill" style="--sp-round:${i+1};width:${s.total?n/s.total*100:0}%"></span>`).join('')}</div>`;
 }
 function render(){
  if(!panel||panel.classList.contains('hidden')||!api)return;if(owner!==String(api.user())){panel.replaceChildren();panel.classList.add('hidden');subject='';return;}
  prepareStats();const p=api.period()?.plan(),status=api.period()?.status(),groups=getGroups(),all=api.questions(subject),title=subject==='검댕이 항공법규'?'항공법규':subject;
  panel.innerHTML=`<div class="stage91-heading"><div><p class="stage91-eyebrow">교재 문제풀이</p><h2 id="stagePractice91Title">${esc(title)} · ${view==='mocks'?'모의고사':'단계별 풀이'}</h2><p class="stage91-subtitle">${view==='mocks'?'28개 회차':(catalog?.books?.[subject]?.stage_count||'—')+'개 단계'} · ${all.length.toLocaleString()}문항</p></div><button type="button" data-stage91-back>교재 선택</button></div><div class="stage91-toolbar"><p>${p?esc(p.start)+' ~ '+esc(p.end)+' · 공부 기간 기준':'누적 학습 기록 기준'}</p><div><button type="button" data-stage91-refresh>이력 새로고침</button><button type="button" data-stage91-custom>직접 범위 선택</button></div></div>${subject==='검댕이 항공법규'?`<div class="stage91-tabs" role="group" aria-label="항공법규 풀이 구분"><button type="button" data-stage91-view="stages" aria-pressed="${view==='stages'}">단계별 풀이</button><button type="button" data-stage91-view="mocks" aria-pressed="${view==='mocks'}">모의고사</button></div>`:''}<p class="stage91-note">${p?'기간 중':'누적'} 한 번이라도 틀린 문제를 ‘오답만 풀기’로 복습할 수 있어요.</p>${status?.loading?'<p class="stage91-state" role="status">서버 풀이 이력을 확인하는 중입니다.</p>':''}${status?.error?'<p class="stage91-state" role="status">서버 이력을 확인하지 못해 현재 기기 기록 기준입니다.</p>':''}<div class="stage91-list">${!catalog?loadError?'<div class="stage91-state" role="status">단계 목록을 불러오지 못했습니다. <button type="button" data-stage91-retry>다시 불러오기</button></div>':'<p class="stage91-state" role="status">단계 목록을 불러오는 중입니다.</p>':groups.map(g=>{
   const s=itemStats(g),available=selection(g,'all'),wrong=selection(g,'wrong'),exam=g.mock?selection(g,'exam'):[],goal=p?.goals?.[subject],target=(!p?.subjects||p.subjects.includes(subject))&&Number.isFinite(goal?.accuracy)?goal.accuracy:null,below=s.attempts>0&&target!==null&&s.correct*100<s.attempts*target;
   return `<article class="stage91-card${below?' stage91-warning':''}" data-stage91-card="${esc(g.id)}"><div class="stage91-card-head"><div><h3>${esc(g.label)}</h3><p>${esc(g.title)}</p></div><strong>${s.progressPct}%</strong></div>${gauge(s,g.label)}<div class="stage91-counts"><span>${s.solved} / ${s.total}문항</span><span>정답률 ${s.attempts?(Math.floor(s.correct/s.attempts*10000)/100)+'%':'—'}</span></div><p class="stage91-rounds">${g.missing?'일부 문항 미로딩 · 회독 집계 확인 필요':`완료 ${s.rounds}회독 · ${s.rounds+1}회독 ${s.nextRoundSolved} / ${s.total}문항`}</p><p class="stage91-attempts">${s.attempts}회 풀이 · 정답 ${s.correct}회 · 오답 ${s.incorrect}회</p>${below?`<p class="stage91-accuracy-warning">정답률 목표 ${target}% 미달 · 복습이 필요합니다.</p>`:''}${g.missing?`<p class="stage91-note">${g.missing}문항을 불러오지 못했습니다.</p>`:''}${g.questions.length>available.length?`<p class="stage91-note">오류 신고·미채점 등으로 ${g.questions.length-available.length}문항 출제 제외</p>`:''}<div class="stage91-actions"><button type="button" data-stage91-action="all" data-stage91-group="${esc(g.id)}" ${available.length?'':'disabled'}>${g.mock?'학습':'이 단계 풀기'} (${available.length})</button><button type="button" data-stage91-action="wrong" data-stage91-group="${esc(g.id)}" ${wrong.length&&!status?.loading?'':'disabled'}>오답만 풀기 (${wrong.length})</button>${g.mock?`<button type="button" data-stage91-action="exam" data-stage91-group="${esc(g.id)}" ${exam.length?'':'disabled'}>시험 (${exam.length})</button>`:''}</div></article>`;
  }).join('')}</div>`;
 }
 function syncSession(meta){
  for(const id of ['quizCard','resultCard']){
   const host=document.getElementById(id);if(!host)continue;let bar=host.querySelector('.stage91-session-return');
   if(!bar){bar=document.createElement('div');bar.className='stage91-session-return hidden';bar.innerHTML='<button type="button">단계 목록으로</button>';bar.querySelector('button').onclick=()=>open(meta.returnSubject91,{view:meta.returnView91,stageId:meta.returnStage91});host.prepend(bar);}
   const visible=SUBJECTS.includes(meta?.returnSubject91)&&String(meta?.returnAccount91)===String(api?.user());bar.classList.toggle('hidden',!visible);
   bar.querySelector('button').onclick=()=>open(meta.returnSubject91,{view:meta.returnView91,stageId:meta.returnStage91});
  }
 }
 function init(x){api=x;window.addEventListener('pilotbank:bank-loaded',()=>render());}
 window.PilotBankStagePractice91={init,open,refreshStats:render,syncSession,supports:s=>SUBJECTS.includes(s),snapshot:()=>{if(owner!==String(api?.user()))return {subject:'',view:'stages',owner:'',groups:[]};prepareStats();return {subject,view,owner,groups:catalog?getGroups().map(g=>({id:g.id,ids:g.ids,available:selection(g,'all').map(q=>q.id),wrong:selection(g,'wrong').map(q=>q.id),stats:itemStats(g)})):[]};}};
})();
