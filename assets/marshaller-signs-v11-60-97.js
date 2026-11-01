/* Jeppesen marshalling signal worksheet · v11.60.97 */
(()=>{
 'use strict';
 if(window.PilotBankMarshaller97)return;
 const SUBJECT='Marshaller Sign 학습지',PATH='./data/questions-marshaller-signs-v1.json?v=11.60.97';
 const $=(s,r=document)=>r.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let data=null,pending=null,panel=null,epoch=0,loading=false;
 const state={category:'',direction:'mixed',scope:'all',mode:'study',count:'20',search:''};
 const owner=()=>{const u=window.PilotBankAuth?.getCurrentUser?.();return typeof u==='string'?u:String(u?.id||u?.username||'guest');};
 const shuffle=rows=>{const a=[...rows];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function hide(){epoch++;panel?.classList.add('hidden');}
 function validate(d){
  if(d?.metadata?.signal_count!==34||d.metadata.question_count!==68||d.categories?.length!==5||d.signals?.length!==34||d.questions?.length!==68)throw Error('수신호 학습지의 항목 수가 올바르지 않습니다.');
  const ids=new Set(),signals=new Set(d.signals.map(t=>t.id));
  if(signals.size!==34)throw Error('중복 수신호 항목이 있습니다.');
  for(const q of d.questions){if(!q.id||ids.has(q.id)||q.subject!==SUBJECT||!signals.has(q.signal_id)||!['identify','select_image'].includes(q.direction)||q.choices?.length!==4||new Set(q.choices.map(c=>c.id)).size!==4||!q.choices.some(c=>c.id===q.answer))throw Error('수신호 문항 구성이 올바르지 않습니다.');ids.add(q.id);
   if(q.direction==='identify'&&q.images?.length!==1||q.direction==='select_image'&&q.choices.some(c=>!c.image))throw Error('필수 도해 연결이 누락되었습니다.');
  }
 }
 function importQuestions(){
  const known=new Set(bank.map(q=>q.id));
  for(const row of data.questions){if(known.has(row.id))continue;const q=JSON.parse(JSON.stringify(row));const override=adminQuestionOverrides.get(q.id);if(override)applyQuestionOverrideToQuestion(q,override);bank.push(q);known.add(q.id);}
  AIRLINE_ONLY_SUBJECTS.add(SUBJECT);
  populateSubjects();updateErrorCount();
  window.PilotBankRuntime=window.PilotBankRuntime||{};window.PilotBankRuntime.totalQuestionCount=bank.length;
  window.dispatchEvent(new CustomEvent('pilotbank:reference-loaded',{detail:{subject:SUBJECT,terms:34,questions:68,loaded:true}}));
 }
 async function load(){
  if(data){importQuestions();return data;}
  if(pending)return pending;
  pending=(async()=>{const r=await fetch(PATH,{cache:'no-store'});if(!r.ok)throw Error('학습지 파일을 불러오지 못했습니다.');const d=await r.json();validate(d);data=d;importQuestions();return d;})().finally(()=>{pending=null;});
  return pending;
 }
 function rows(){
  if(!data)return[];const wanted=new Set(data.questions.map(q=>q.id));
  return bank.filter(q=>wanted.has(q.id)&&(!state.category||q.topic_id==='MARSHAL-'+state.category.toUpperCase())&&(state.direction==='mixed'||q.direction===state.direction)&&q.gradable!==false&&!progressStore[q.id]?.errorReported&&(state.mode!=='exam'||!progressStore[q.id]?.examExcluded)&&(
   state.scope==='all'||state.scope==='unseen'&&!(progressStore[q.id]?.attempts>0)||state.scope==='wrong'&&progressStore[q.id]?.incorrect>0||state.scope==='favorite'&&progressStore[q.id]?.favorite
  ));
 }
 function selectPool(){
  const groups=new Map();for(const q of rows()){if(!groups.has(q.signal_id))groups.set(q.signal_id,[]);groups.get(q.signal_id).push(q);}
  const picked=shuffle([...groups.values()]).map(g=>g[Math.floor(Math.random()*g.length)]);
  return picked.slice(0,state.count==='all'?picked.length:Number(state.count));
 }
 function setStatus(message,error=false){const el=$('[data-ms97-status]',panel);el.textContent=message;el.classList.toggle('ms97-error',error);}
 function updateSummary(){
  if(!data)return;const eligible=rows(),unique=new Set(eligible.map(q=>q.signal_id)).size,all=bank.filter(q=>q.subject===SUBJECT),solved=all.filter(q=>progressStore[q.id]?.attempts>0).length;
  $('[data-ms97-available]',panel).textContent=`선택 범위 ${unique}항목 · ${eligible.length}문항 중 항목당 1문항 출제`;
  $('[data-ms97-progress]',panel).textContent=`풀이 완료 ${solved} / 68문항 · 오답 ${all.filter(q=>progressStore[q.id]?.incorrect>0).length}문항`;
  $('[data-ms97-start]',panel).disabled=loading||!unique;
  if(!unique)setStatus(state.scope==='wrong'?'선택 범위에 기록된 오답이 없습니다.':state.scope==='favorite'?'선택 범위에 즐겨찾기한 문제가 없습니다.':'선택 범위에 출제할 문제가 없습니다.');else setStatus('학습은 즉시 해설을 확인하고, 시험은 마지막에 채점합니다.');
 }
 function renderGlossary(){
  if(!data)return;const needle=state.search.trim().toLocaleLowerCase();
  const signals=data.signals.filter(t=>(!state.category||t.category_id===state.category)&&(!needle||[t.english,t.korean,t.motion,t.note].join(' ').toLocaleLowerCase().includes(needle)));
  $('[data-ms97-term-count]',panel).textContent=signals.length+'종';
  $('[data-ms97-terms]',panel).innerHTML=signals.length?signals.map(t=>'<tr><th scope="row"><span lang="en">'+esc(t.english)+'</span><strong>'+esc(t.korean)+'</strong><small>'+esc(t.category_title)+' · 도해 p.'+t.source_figure_page+'</small></th><td><button type="button" class="ms97-sheet-zoom" data-ms97-zoom="'+esc(t.id)+'"><img src="./'+esc(t.image)+'" alt="수신호 학습 도해" loading="lazy"><span>도해 확대</span></button><p>'+esc(t.motion)+'</p><p>'+esc(t.note)+'</p><small>'+esc(t.reference)+'</small></td></tr>').join(''):'<tr><td colspan="2">검색 결과가 없습니다.</td></tr>';
 }
 function ensure(){
  if(panel)return;
  panel=document.createElement('section');panel.id='aviationMarshaller97Card';panel.className='card hidden ms97-panel';panel.setAttribute('aria-labelledby','ms97Title');
  panel.innerHTML=`<div class="section-head"><div><span class="eyebrow">JEPPESEN · MARSHALLING SIGNALS</span><h2 id="ms97Title">Marshaller Sign 학습지</h2><p class="muted">Jeppesen 원문 도해를 보고 지상요원→항공기 수신호를 익히세요.</p></div><button type="button" class="button secondary" data-ms97-back>참고서 선택</button></div>
   <div class="ms97-summary"><span><b>34</b> 수신호 도해</span><span><b>68</b> 객관식 문항</span><span><b>5</b> 학습 분야</span></div>
   <p class="muted" data-ms97-progress></p><div class="ms97-controls">
   <label>학습 분야<select data-ms97-setting="category"><option value="">전체 분야</option></select></label>
   <label>출제 유형<select data-ms97-setting="direction"><option value="mixed">두 유형 혼합</option><option value="identify">그림·동작 → 의미</option><option value="select_image">의미 → 그림·동작</option></select></label>
   <label>복습 범위<select data-ms97-setting="scope"><option value="all">전체 문제</option><option value="unseen">미풀이 문제</option><option value="wrong">오답만</option><option value="favorite">즐겨찾기만</option></select></label>
   <label>풀이 방식<select data-ms97-setting="mode"><option value="study">학습 · 즉시 해설</option><option value="exam">시험 · 마지막 채점</option></select></label>
   <label>문제 수<select data-ms97-setting="count"><option value="10">10문항</option><option value="20" selected>20문항</option><option value="50">50문항</option><option value="all">선택 범위 전체</option></select></label></div>
   <div class="ms97-launch"><div><p data-ms97-available></p><p data-ms97-status role="status" aria-live="polite">학습지를 불러오는 중입니다.</p></div><button type="button" class="button" data-ms97-start disabled>문제 풀기</button><button type="button" class="button secondary hidden" data-ms97-retry>다시 불러오기</button></div>
   <p class="ms97-note">한 번의 풀이에서는 같은 수신호를 중복 출제하지 않습니다. 정지 그림에 동작의 속도·순서를 함께 표시합니다. 좌·우 선회와 수평 이동은 조종사 관점이며, 후진 선회는 꼬리 방향을 묻습니다.</p>
   <details class="ms97-sheet"><summary>수신호 정리표 보기 <small data-ms97-term-count></small></summary><label class="ms97-search">명칭·동작·한국어 검색<input type="search" data-ms97-search placeholder="예: stop, 초크, 꼬리" autocomplete="off"></label><div class="ms97-table-wrap"><table><caption class="ms97-sr-only">수신호 명칭·원문 도해·동작·학습 포인트</caption><thead><tr><th scope="col">수신호 명칭</th><th scope="col">원문 도해·동작·학습 포인트</th></tr></thead><tbody data-ms97-terms></tbody></table></div></details>
   <details class="ms97-sources"><summary>출처와 표기 안내</summary><p>첨부된 Jeppesen Airway Manual의 ICAO Rules of the Air · Annex 2, 5.1.1.1–5.1.1.28에서 도해를 직접 발췌했습니다. 정답 명칭이 그림에 나타나지 않도록 도해 부분만 사용했습니다. 이번 범위는 유도요원→항공기 신호입니다.</p><ul data-ms97-sources></ul></details>`;
  (document.querySelector('main.container')||document.querySelector('main')).append(panel);
  panel.addEventListener('change',e=>{const key=e.target.dataset.ms97Setting;if(!Object.hasOwn(state,key))return;state[key]=e.target.value;updateSummary();if(key==='category')renderGlossary();});
  $('[data-ms97-search]',panel).addEventListener('input',e=>{state.search=e.target.value;renderGlossary();});
  $('[data-ms97-back]',panel).onclick=()=>{$('#referenceQuickNavBtn')?.click();};
  $('[data-ms97-start]',panel).onclick=launch;
  $('[data-ms97-retry]',panel).onclick=show;
 }
 function render(){
  const select=$('[data-ms97-setting="category"]',panel);select.replaceChildren(new Option('전체 분야',''),...data.categories.map(c=>new Option(`${c.title} (${c.signal_count})`,c.id)));select.value=state.category;
  for(const el of panel.querySelectorAll('[data-ms97-setting]'))el.value=state[el.dataset.ms97Setting];
  $('[data-ms97-search]',panel).value=state.search;
  $('[data-ms97-sources]',panel).textContent=data.metadata.source_file_name+' · 본문·도해 p.1134–1145 · '+data.metadata.source_sections;renderGlossary();updateSummary();
  renderGlossary();updateSummary();
 }
 async function show(){
  ensure();setQuizFocus(false);hideStudySurfaces();hideAllHubs();panel.classList.remove('hidden');const token=epoch;
  loading=true;$('[data-ms97-start]',panel).disabled=true;$('[data-ms97-retry]',panel).classList.add('hidden');setStatus('학습지를 불러오는 중입니다.');window.scrollTo({top:0,behavior:'smooth'});
  try{await load();if(token!==epoch)return;loading=false;render();}catch(err){if(token!==epoch)return;loading=false;setStatus(String(err.message||err),true);$('[data-ms97-retry]',panel).classList.remove('hidden');}
 }
 async function launch(){
  const account=owner(),token=epoch;loading=true;$('[data-ms97-start]',panel).disabled=true;
  try{
   await load();if(token!==epoch||account!==owner())return;const pool=selectPool();if(!pool.length){loading=false;updateSummary();return;}
   activateLearningContext({kind:'reference',label:SUBJECT,allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:'34종 · 68문항 · 5개 분야 · Jeppesen 원문 도해'});
   els.mode.value=state.mode;els.noFigureOnly.checked=false;els.scope.value='all';applyModeUIState();
   hide();startSession(pool,{type:state.mode,from:'marshaller97',contextLabel:SUBJECT,keepOrder:true});
  }catch(err){setStatus(String(err.message||err),true);}finally{loading=false;if(panel&&!panel.classList.contains('hidden'))updateSummary();}
 }
 function syncReturn(){
  const visible=Array.isArray(session)&&session.length>0&&session.every(q=>q.subject===SUBJECT);
  for(const id of ['quizCard','resultCard']){const host=document.getElementById(id);if(!host)continue;let bar=host.querySelector('.ms97-return');if(!bar){bar=document.createElement('div');bar.className='ms97-return';const b=document.createElement('button');b.type='button';b.className='button secondary';b.id=id==='quizCard'?'ms97QuizReturn':'ms97ResultReturn';b.textContent='수신호 학습지로';b.onclick=show;bar.append(b);host.prepend(bar);}bar.classList.toggle('hidden',!visible);}
 }
 let imageEpoch=0;
 function showZoom(path,label){
  let d=document.querySelector('#marshaller97Zoom');
  if(!d){d=document.createElement('dialog');d.id='marshaller97Zoom';d.className='ms97-zoom';d.innerHTML='<div><strong data-ms97-zoom-title></strong><button class="button secondary" type="button">닫기</button></div><img alt="확대 수신호 도해">';d.querySelector('button').onclick=()=>d.close();document.body.append(d);}
  d.querySelector('[data-ms97-zoom-title]').textContent=label;d.querySelector('img').src='./'+path;if(!d.open)d.showModal();
 }
 function guardImages(){
  const token=++imageEpoch,q=session[index],active=q?.subject===SUBJECT;els.quizCard.classList.toggle('marshaller97-quiz',active);
  els.choices.classList.toggle('ms97-picture-options',active&&q.direction==='select_image');
  let tools=els.quizCard.querySelector('.ms97-image-tools');
  if(!tools){tools=document.createElement('div');tools.className='ms97-image-tools hidden';els.choices.before(tools);}
  tools.classList.toggle('hidden',!active);
  if(!active){window.PilotBankMarshaller97Images={state:'idle'};return;}
  tools.replaceChildren();const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');tools.append(status);
  const buttons=[...els.choices.querySelectorAll('button.choice')],expected=(q.images||[]).length+q.choices.filter(c=>c.image).length;
  const targets=[...els.quizCard.querySelectorAll('img')].filter(i=>i.src.includes('/assets/marshaller97/'));
  const loaded=new Set(),failed=new Set();buttons.forEach(b=>b.disabled=true);
  const retry=document.createElement('button');retry.type='button';retry.className='button secondary hidden';retry.textContent='도해 다시 불러오기';retry.onclick=()=>renderQuestion();tools.append(retry);
  const zooms=document.createElement('div');zooms.className='ms97-zoom-controls';tools.append(zooms);
  for(const [path,label]of q.direction==='identify'?q.images.map(p=>[p,'문제 도해 확대']):q.choices.map(c=>[c.image,'보기 '+c.id+' 확대'])){
   const b=document.createElement('button');b.type='button';b.className='button secondary';b.textContent=label;b.onclick=()=>showZoom(path,label);zooms.append(b);
  }
  function check(){
   if(token!==imageEpoch||session[index]?.id!==q.id)return;
   const ready=expected===targets.length&&loaded.size===expected&&!failed.size;
   const error=failed.size>0||targets.length!==expected;
   window.PilotBankMarshaller97Images={questionId:q.id,state:ready?'ready':error?'error':'loading',loaded:loaded.size,total:expected};
   status.textContent=ready?'원문 도해를 확인한 뒤 답을 선택하세요.':error?'도해를 불러오지 못했습니다. 다시 불러온 후 답을 선택하세요.':'원문 도해를 불러오는 중입니다.';
   retry.classList.toggle('hidden',!error);
   const locked=!isExamLike()&&!!studyAnswers[q.id];buttons.forEach(b=>b.disabled=!ready||locked);
  }
  for(const img of targets){
   img.addEventListener('load',()=>{if(img.naturalWidth>0){loaded.add(img);failed.delete(img);}else failed.add(img);check();},{once:true});
   img.addEventListener('error',()=>{failed.add(img);check();},{once:true});
   if(img.complete){if(img.naturalWidth>0)loaded.add(img);else failed.add(img);}
  }
  check();
 }

 function boot(){
  ensure();
  panel.addEventListener('click',e=>{const b=e.target.closest('[data-ms97-zoom]');if(!b||!data)return;const sig=data.signals.find(t=>t.id===b.dataset.ms97Zoom);if(sig)showZoom(sig.image,'수신호 정리표 도해');});
  const originalRender=renderQuestion;renderQuestion=function(...args){const r=originalRender.apply(this,args);guardImages();return r;};
  const grid=$('#referenceStudyHubCard .reference-book-grid');
  if(!grid){console.error('[Marshaller Sign 학습지] 참고서 메뉴를 찾지 못했습니다.');return;}
  const button=document.createElement('button');button.id='referenceMarshaller97Btn';button.type='button';button.className='book-choice-card reference-book-card ms97-entry';button.innerHTML='<span class="ms97-cover" aria-hidden="true"><span>MARSHAL</span><small>JEPPESEN</small></span><strong>Marshaller Sign 학습지</strong><span>원문 도해 34종 · 68문항 · 그림·동작 학습</span>';button.onclick=show;grid.append(button);
  const originalHide=hideStudySurfaces;hideStudySurfaces=function(...args){const r=originalHide.apply(this,args);hide();return r;};
  const originalHubs=hideAllHubs;hideAllHubs=function(...args){const r=originalHubs.apply(this,args);hide();return r;};
  const originalStart=startSession;startSession=function(source=null,meta=null){
   if(!source&&learningContext?.lockedSubject===SUBJECT&&data){source=selectPool();if(!source.length){show();return;}meta={type:els.mode.value,from:'marshaller97',contextLabel:SUBJECT,keepOrder:true,...meta};}
   const result=originalStart.call(this,source,meta);syncReturn();return result;
  };
  QUIZ_EXIT_TARGETS.set('#referenceMarshaller97Btn',SUBJECT);QUIZ_EXIT_TARGETS.set('#ms97QuizReturn',SUBJECT);QUIZ_EXIT_TARGETS.set('#ms97ResultReturn',SUBJECT);
  els.restart?.addEventListener('click',event=>{if(!session?.length||!session.every(q=>q.subject===SUBJECT))return;event.preventDefault();event.stopImmediatePropagation();show();},true);
  window.addEventListener('pilotbank:bank-loaded',()=>load().catch(()=>{}));
  if(window.PilotBankRuntime?.totalQuestionCount)load().catch(()=>{});
 }
 window.PilotBankMarshaller97={version:'11.60.97',subject:SUBJECT,open:show,load,snapshot:()=>({loaded:!!data,state:{...state},signals:data?.signals.length||0,questions:data?.questions.length||0,available:rows().length,availableTerms:new Set(rows().map(q=>q.signal_id)).size}),selectPool};
 boot();
})();
