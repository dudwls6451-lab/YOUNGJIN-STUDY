/* Aviation abbreviation worksheet · v11.60.95 */
(()=>{
 'use strict';
 if(window.PilotBankAbbreviations95)return;
 const SUBJECT='항공약어 학습지',PATH='./data/questions-aviation-abbreviations-v1.json?v=11.60.95';
 const $=(s,r=document)=>r.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let data=null,pending=null,panel=null,epoch=0,loading=false;
 const state={category:'',direction:'mixed',scope:'all',mode:'study',count:'20',search:''};
 const owner=()=>{const u=window.PilotBankAuth?.getCurrentUser?.();return typeof u==='string'?u:String(u?.id||u?.username||'guest');};
 const shuffle=rows=>{const a=[...rows];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function hide(){epoch++;panel?.classList.add('hidden');}
 function validate(d){
  if(d?.metadata?.term_count!==200||d.metadata.question_count!==400||d.categories?.length!==7||d.terms?.length!==200||d.questions?.length!==400)throw Error('학습지 데이터의 항목 수가 올바르지 않습니다.');
  const terms=new Map(d.terms.map(t=>[t.id,t])),ids=new Set();
  if(terms.size!==200)throw Error('중복 약어 항목이 있습니다.');
  for(const q of d.questions){if(!q?.id||ids.has(q.id)||q.subject!==SUBJECT||!terms.has(q.term_id)||!['english','reverse'].includes(q.direction)||q.choices?.length!==4||new Set(q.choices.map(c=>c.id)).size!==4||new Set(q.choices.map(c=>c.text)).size!==4||!q.choices.some(c=>c.id===q.answer))throw Error('학습지 문항 구성이 올바르지 않습니다.');ids.add(q.id);}
  for(const id of terms.keys())if(new Set(d.questions.filter(q=>q.term_id===id).map(q=>q.direction)).size!==2)throw Error('누락된 출제 유형이 있습니다.');
 }
 function importQuestions(){
  const known=new Set(bank.map(q=>q.id));
  for(const row of data.questions){if(known.has(row.id))continue;const q=JSON.parse(JSON.stringify(row));const override=adminQuestionOverrides.get(q.id);if(override)applyQuestionOverrideToQuestion(q,override);bank.push(q);known.add(q.id);}
  AIRLINE_ONLY_SUBJECTS.add(SUBJECT);
  populateSubjects();updateErrorCount();
  window.PilotBankRuntime=window.PilotBankRuntime||{};window.PilotBankRuntime.totalQuestionCount=bank.length;
  window.dispatchEvent(new CustomEvent('pilotbank:reference-loaded',{detail:{subject:SUBJECT,terms:200,questions:400,loaded:true}}));
 }
 async function load(){
  if(data){importQuestions();return data;}
  if(pending)return pending;
  pending=(async()=>{const r=await fetch(PATH,{cache:'no-store'});if(!r.ok)throw Error('학습지 파일을 불러오지 못했습니다.');const d=await r.json();validate(d);data=d;importQuestions();return d;})().finally(()=>{pending=null;});
  return pending;
 }
 function rows(){
  if(!data)return[];const wanted=new Set(data.questions.map(q=>q.id));
  return bank.filter(q=>wanted.has(q.id)&&(!state.category||q.topic_id==='ABBR-'+state.category.toUpperCase())&&(state.direction==='mixed'||q.direction===state.direction)&&q.gradable!==false&&!progressStore[q.id]?.errorReported&&(state.mode!=='exam'||!progressStore[q.id]?.examExcluded)&&(
   state.scope==='all'||state.scope==='unseen'&&!(progressStore[q.id]?.attempts>0)||state.scope==='wrong'&&progressStore[q.id]?.incorrect>0||state.scope==='favorite'&&progressStore[q.id]?.favorite
  ));
 }
 function selectPool(){
  const groups=new Map();for(const q of rows()){if(!groups.has(q.term_id))groups.set(q.term_id,[]);groups.get(q.term_id).push(q);}
  const picked=shuffle([...groups.values()]).map(g=>g[Math.floor(Math.random()*g.length)]);
  return picked.slice(0,state.count==='all'?picked.length:Number(state.count));
 }
 function setStatus(message,error=false){const el=$('[data-abbr95-status]',panel);el.textContent=message;el.classList.toggle('abbr95-error',error);}
 function updateSummary(){
  if(!data)return;const eligible=rows(),unique=new Set(eligible.map(q=>q.term_id)).size,all=bank.filter(q=>q.subject===SUBJECT),solved=all.filter(q=>progressStore[q.id]?.attempts>0).length;
  $('[data-abbr95-available]',panel).textContent=`선택 범위 ${unique}항목 · ${eligible.length}문항 중 항목당 1문항 출제`;
  $('[data-abbr95-progress]',panel).textContent=`풀이 완료 ${solved} / 400문항 · 오답 ${all.filter(q=>progressStore[q.id]?.incorrect>0).length}문항`;
  $('[data-abbr95-start]',panel).disabled=loading||!unique;
  if(!unique)setStatus(state.scope==='wrong'?'선택 범위에 기록된 오답이 없습니다.':state.scope==='favorite'?'선택 범위에 즐겨찾기한 문제가 없습니다.':'선택 범위에 출제할 문제가 없습니다.');else setStatus('학습은 즉시 해설을 확인하고, 시험은 마지막에 채점합니다.');
 }
 function renderGlossary(){
  if(!data)return;const needle=state.search.trim().toLocaleLowerCase();
  const terms=data.terms.filter(t=>(!state.category||t.category_id===state.category)&&(!needle||[t.abbreviation,t.english,t.korean,t.note,t.category_title].join(' ').toLocaleLowerCase().includes(needle)));
  $('[data-abbr95-term-count]',panel).textContent=`${terms.length}항목`;
  $('[data-abbr95-terms]',panel).innerHTML=terms.length?terms.map(t=>`<tr><th scope="row">${esc(t.abbreviation)}<small>${esc(t.category_title)}</small></th><td><span lang="en">${esc(t.english)}</span><strong>${esc(t.korean)}</strong><p>${esc(t.note)}</p></td></tr>`).join(''):'<tr><td colspan="2">검색 결과가 없습니다.</td></tr>';
 }
 function ensure(){
  if(panel)return;
  panel=document.createElement('section');panel.id='aviationAbbreviations95Card';panel.className='card hidden abbr95-panel';panel.setAttribute('aria-labelledby','abbr95Title');
  panel.innerHTML=`<div class="section-head"><div><span class="eyebrow">AVIATION ABBREVIATIONS</span><h2 id="abbr95Title">항공약어 학습지</h2><p class="muted">영문 명칭과 한국어 뜻을 연결하고, 헷갈리는 약어를 문맥과 함께 익히세요.</p></div><button type="button" class="button secondary" data-abbr95-back>참고서 선택</button></div>
   <div class="abbr95-summary"><span><b>200</b> 학습 항목</span><span><b>400</b> 객관식 문항</span><span><b>7</b> 학습 분야</span></div>
   <p class="muted" data-abbr95-progress></p><div class="abbr95-controls">
   <label>학습 분야<select data-abbr95-setting="category"><option value="">전체 분야</option></select></label>
   <label>출제 유형<select data-abbr95-setting="direction"><option value="mixed">두 유형 혼합</option><option value="english">약어 → 영문 명칭·의미</option><option value="reverse">한국어 뜻 → 약어</option></select></label>
   <label>복습 범위<select data-abbr95-setting="scope"><option value="all">전체 문제</option><option value="unseen">미풀이 문제</option><option value="wrong">오답만</option><option value="favorite">즐겨찾기만</option></select></label>
   <label>풀이 방식<select data-abbr95-setting="mode"><option value="study">학습 · 즉시 해설</option><option value="exam">시험 · 마지막 채점</option></select></label>
   <label>문제 수<select data-abbr95-setting="count"><option value="10">10문항</option><option value="20" selected>20문항</option><option value="50">50문항</option><option value="all">선택 범위 전체</option></select></label></div>
   <div class="abbr95-launch"><div><p data-abbr95-available></p><p data-abbr95-status role="status" aria-live="polite">학습지를 불러오는 중입니다.</p></div><button type="button" class="button" data-abbr95-start disabled>문제 풀기</button><button type="button" class="button secondary hidden" data-abbr95-retry>다시 불러오기</button></div>
   <p class="abbr95-note">한 번의 풀이에서는 같은 항목을 중복 출제하지 않습니다. 같은 철자라도 분야에 따라 뜻이 다를 수 있어 문제에 문맥을 함께 표시합니다.</p>
   <details class="abbr95-sheet"><summary>약어 정리표 보기 <small data-abbr95-term-count></small></summary><label class="abbr95-search">약어·영문·한국어 검색<input type="search" data-abbr95-search placeholder="예: ADS-B, glide slope, 어는 비" autocomplete="off"></label><div class="abbr95-table-wrap"><table><caption class="abbr95-sr-only">항공약어 영문 명칭·뜻·학습 포인트</caption><thead><tr><th scope="col">약어·기호</th><th scope="col">명칭·뜻·학습 포인트</th></tr></thead><tbody data-abbr95-terms></tbody></table></div></details>
   <details class="abbr95-sources"><summary>출처와 표기 안내</summary><p>FAA·EASA 등의 공식 용어 자료를 바탕으로 만든 학습 문제입니다. 영문 철자·하이픈·단복수는 기관별로 다를 수 있으며, 동의 표현을 오답 보기로 섞지 않았습니다. QNH·QFE·QNE는 영문 머리글자 약어가 아닌 Q 부호입니다.</p><ul data-abbr95-sources></ul></details>`;
  (document.querySelector('main.container')||document.querySelector('main')).append(panel);
  panel.addEventListener('change',e=>{const key=e.target.dataset.abbr95Setting;if(!Object.hasOwn(state,key))return;state[key]=e.target.value;updateSummary();if(key==='category')renderGlossary();});
  $('[data-abbr95-search]',panel).addEventListener('input',e=>{state.search=e.target.value;renderGlossary();});
  $('[data-abbr95-back]',panel).onclick=()=>{$('#referenceQuickNavBtn')?.click();};
  $('[data-abbr95-start]',panel).onclick=launch;
  $('[data-abbr95-retry]',panel).onclick=show;
 }
 function render(){
  const select=$('[data-abbr95-setting="category"]',panel);select.replaceChildren(new Option('전체 분야',''),...data.categories.map(c=>new Option(`${c.title} (${c.term_count})`,c.id)));select.value=state.category;
  for(const el of panel.querySelectorAll('[data-abbr95-setting]'))el.value=state[el.dataset.abbr95Setting];
  $('[data-abbr95-search]',panel).value=state.search;
  $('[data-abbr95-sources]',panel).innerHTML=Object.values(data.sources).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('');
  renderGlossary();updateSummary();
 }
 async function show(){
  ensure();setQuizFocus(false);hideStudySurfaces();hideAllHubs();panel.classList.remove('hidden');const token=epoch;
  loading=true;$('[data-abbr95-start]',panel).disabled=true;$('[data-abbr95-retry]',panel).classList.add('hidden');setStatus('학습지를 불러오는 중입니다.');window.scrollTo({top:0,behavior:'smooth'});
  try{await load();if(token!==epoch)return;loading=false;render();}catch(err){if(token!==epoch)return;loading=false;setStatus(String(err.message||err),true);$('[data-abbr95-retry]',panel).classList.remove('hidden');}
 }
 async function launch(){
  const account=owner(),token=epoch;loading=true;$('[data-abbr95-start]',panel).disabled=true;
  try{
   await load();if(token!==epoch||account!==owner())return;const pool=selectPool();if(!pool.length){loading=false;updateSummary();return;}
   activateLearningContext({kind:'reference',label:SUBJECT,allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:'200항목 · 400문항 · 7개 분야 · 같은 항목 중복 없이 출제'});
   els.mode.value=state.mode;els.noFigureOnly.checked=false;els.scope.value='all';applyModeUIState();
   hide();startSession(pool,{type:state.mode,from:'abbreviations95',contextLabel:SUBJECT,keepOrder:true});
  }catch(err){setStatus(String(err.message||err),true);}finally{loading=false;if(panel&&!panel.classList.contains('hidden'))updateSummary();}
 }
 function syncReturn(){
  const visible=Array.isArray(session)&&session.length>0&&session.every(q=>q.subject===SUBJECT);
  for(const id of ['quizCard','resultCard']){const host=document.getElementById(id);if(!host)continue;let bar=host.querySelector('.abbr95-return');if(!bar){bar=document.createElement('div');bar.className='abbr95-return';const b=document.createElement('button');b.type='button';b.className='button secondary';b.id=id==='quizCard'?'abbr95QuizReturn':'abbr95ResultReturn';b.textContent='약어 학습지로';b.onclick=show;bar.append(b);host.prepend(bar);}bar.classList.toggle('hidden',!visible);}
 }
 function boot(){
  ensure();const grid=$('#referenceStudyHubCard .reference-book-grid');
  if(!grid){console.error('[항공약어 학습지] 참고서 메뉴를 찾지 못했습니다.');return;}
  const button=document.createElement('button');button.id='referenceAbbreviations95Btn';button.type='button';button.className='book-choice-card reference-book-card abbr95-entry';button.innerHTML='<span class="abbr95-cover" aria-hidden="true"><span>ABC</span><small>AVIATION</small></span><strong>항공약어 학습지</strong><span>200항목 · 400문항 · 분야별 학습·오답 복습</span>';button.onclick=show;grid.append(button);
  const originalHide=hideStudySurfaces;hideStudySurfaces=function(...args){const r=originalHide.apply(this,args);hide();return r;};
  const originalHubs=hideAllHubs;hideAllHubs=function(...args){const r=originalHubs.apply(this,args);hide();return r;};
  const originalStart=startSession;startSession=function(source=null,meta=null){
   if(!source&&learningContext?.lockedSubject===SUBJECT&&data){source=selectPool();if(!source.length){show();return;}meta={type:els.mode.value,from:'abbreviations95',contextLabel:SUBJECT,keepOrder:true,...meta};}
   const result=originalStart.call(this,source,meta);syncReturn();return result;
  };
  QUIZ_EXIT_TARGETS.set('#referenceAbbreviations95Btn',SUBJECT);QUIZ_EXIT_TARGETS.set('#abbr95QuizReturn',SUBJECT);QUIZ_EXIT_TARGETS.set('#abbr95ResultReturn',SUBJECT);
  els.restart?.addEventListener('click',event=>{if(!session?.length||!session.every(q=>q.subject===SUBJECT))return;event.preventDefault();event.stopImmediatePropagation();show();},true);
  window.addEventListener('pilotbank:bank-loaded',()=>load().catch(()=>{}));
  if(window.PilotBankRuntime?.totalQuestionCount)load().catch(()=>{});
 }
 window.PilotBankAbbreviations95={version:'11.60.95',subject:SUBJECT,open:show,load,snapshot:()=>({loaded:!!data,state:{...state},terms:data?.terms.length||0,questions:data?.questions.length||0,available:rows().length,availableTerms:new Set(rows().map(q=>q.term_id)).size}),selectPool};
 boot();
})();
