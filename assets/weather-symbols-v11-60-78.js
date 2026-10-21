(() => {
'use strict';
const SUBJECT='항공기상서비스 사용자 안내서';
const qs=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeTab='quiz',selected=null,scope='all',count='10',search='',returnTo=null;
function hostCategories(){return document.querySelectorAll('#weatherSymbols75Card [data-wms-category]');}
function rows(){return (typeof bank!=='undefined'?bank:[]).filter(q=>q.subject===SUBJECT);}
function permitted(){return window.PilotBankProtectedWeather76?.canAccess()===true;}
function canOpen(){return permitted()&&!window.PilotBankDailyQuiz?.isLocked();}
function allowed(q){return q.gradable!==false&&!progressStore[q.id]?.errorReported;}
function modeRows(){return rows().filter(q=>(q.question_kind==='weather_criteria')===(activeTab==='criteria'));}
function categories(){return [...new Set(modeRows().map(q=>q.symbol_category))].map(title=>({title,count:modeRows().filter(q=>q.symbol_category===title).length}));}
function chosen(){return modeRows().filter(q=>!selected||selected.has(q.symbol_category));}
function pool(){return chosen().filter(q=>allowed(q)&&(scope!=='wrong'||Number(progressStore[q.id]?.incorrect)>0)&&(scope!=='unseen'||!Number(progressStore[q.id]?.attempts)));}
function statistics(items){
 const period=window.PilotBankStudyPlan?.stats?.(SUBJECT,items);
 if(period)return {solved:period.solved,accuracy:period.accuracyPct,total:items.length,period:true};
 let solved=0,attempts=0,correct=0;for(const q of items){const r=progressStore[q.id]||{};if(Number(r.attempts))solved++;attempts+=Number(r.attempts)||0;correct+=Number(r.correct)||0;}
 return {solved,accuracy:attempts?Math.round(correct/attempts*100):null,total:items.length,period:false};
}
function ensureUi(){
 if(!permitted()){window.PilotBankProtectedWeather76?.purge();return;}

 const grid=qs('#referenceStudyHubCard .reference-book-grid');
 if(grid&&!qs('#weatherSymbols75BookBtn')){
  const b=document.createElement('button');b.id='weatherSymbols75BookBtn';b.type='button';b.className='book-choice-card reference-book-card';
  b.innerHTML='<img src="'+esc(window.PilotBankWeatherSymbols75Metadata?.cover||'')+'" alt="항공기상서비스 사용자 안내서 표지" loading="lazy"><strong>항공기상서비스 사용자 안내서</strong><span>5차 개정판 · 심볼과 관측·예보 기준</span>';grid.prepend(b);b.onclick=open;
 }
 if(!qs('#weatherSymbols75Card')){
  const section=document.createElement('section');section.id='weatherSymbols75Card';section.className='card wms75 hidden';
  (qs('main.container')||qs('main')).append(section);
  section.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b)return;
   if(b.matches('[data-wms-return]')){backToReference();return;}
   if(b.matches('[data-wms-tab]')){activeTab=b.dataset.wmsTab;selected=null;render();qs(`[data-wms-tab="${activeTab}"]`)?.focus({preventScroll:true});return;}
   if(b.matches('[data-wms-all]')){selected=null;render();return;}
   if(b.matches('[data-wms-retry]')){retry(b);return;}
   if(b.matches('[data-wms-start]')){start();return;}
   if(b.matches('[data-wms-zoom]'))zoom(b.querySelector('img')?.getAttribute('src'),b);
  });
  section.addEventListener('change',event=>{
   const t=event.target;
   if(t.matches('[data-wms-category]')){
    if(!selected)selected=new Set(categories().map(c=>c.title));
    const category=t.value;t.checked?selected.add(category):selected.delete(category);render();[...hostCategories()].find(e=>e.value===category)?.focus({preventScroll:true});
   }else if(t.matches('#wms75Scope')){scope=t.value;render();qs('#wms75Scope')?.focus({preventScroll:true});}
   else if(t.matches('#wms75Count'))count=t.value;
  });
  section.addEventListener('input',event=>{if(event.target.id==='wms75Search'){search=event.target.value;renderDictionary();}});
 }
 if(!qs('#wms75QuizBack')){
  const b=document.createElement('button');b.id='wms75QuizBack';b.type='button';b.className='button secondary wms75-quiz-back hidden';b.textContent='안내서 퀴즈 설정';els.quizCard.querySelector('.quiz-header').after(b);b.onclick=open;
 }
 try{QUIZ_EXIT_TARGETS.set('#weatherSymbols75BookBtn','항공기상 안내서 퀴즈');QUIZ_EXIT_TARGETS.set('#wms75QuizBack','안내서 퀴즈 설정');}catch{}
 // Core result retry keeps the accumulated wrong list; restart returns to this reference's settings.
 if(!els.restart.dataset.wms75Wired){els.restart.dataset.wms75Wired='true';els.restart.addEventListener('click',event=>{if(session.every(q=>q.subject===SUBJECT)){event.preventDefault();event.stopImmediatePropagation();open();}},true);}
}
function backToReference(){
 hideStudySurfaces();hideAllHubs();setQuizFocus(false);qs('#referenceStudyHubCard')?.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});
}
function open(){
 if(!canOpen())return false;
 setQuizFocus(false);hideStudySurfaces();hideAllHubs();ensureUi();render();qs('#weatherSymbols75Card').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});qs('#wms75Title')?.focus({preventScroll:true});return true;
}
async function retry(button){button.disabled=true;button.textContent='불러오는 중…';await loadBank();render();}
function render(){
 if(!permitted())return;
 const host=qs('#weatherSymbols75Card');if(!host)return;
 const criterion=activeTab==='criteria',ready=window.PilotBankWeatherSymbols75Status==='ready';
 const header='<header class="wms75-heading"><div><p class="wms75-eyebrow">항공기상서비스 사용자 안내서 · 5차 개정판</p><h2 id="wms75Title" tabindex="-1">항공기상 퀴즈</h2><p>기상도 심볼과 관측·예보 기준을 익혀 보세요.</p></div><button class="button secondary" type="button" data-wms-return>참고서 홈</button></header>';
 const tabs=`<div class="wms75-tabs wms78-tabs" role="group" aria-label="학습 방식"><button type="button" data-wms-tab="quiz" aria-pressed="${activeTab==='quiz'}">그림 퀴즈</button><button type="button" data-wms-tab="criteria" aria-pressed="${criterion}">관측·예보 기준</button><button type="button" data-wms-tab="dictionary" aria-pressed="${activeTab==='dictionary'}">심볼 사전</button></div>`;
 if(!ready){host.innerHTML=header+'<div class="wms75-empty" role="status"><p>KYJ 전용 안내서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p><button type="button" class="button" data-wms-retry>다시 불러오기</button></div>';return;}
 if(criterion&&window.PilotBankWeatherCriteria78Status!=='ready'){
  host.innerHTML=header+tabs+'<div class="wms75-empty" role="status"><p>관측·예보 기준 문제를 불러오지 못했습니다. 그림 퀴즈는 계속 이용할 수 있어요.</p><button type="button" class="button" data-wms-retry>다시 불러오기</button></div>';return;
 }
 const st=statistics(chosen()),cat=categories();
 host.innerHTML=header+tabs+`<p class="wms78-intro">${criterion?'METAR/SPECI와 국지보고의 조건을 구분하며 평균기간·관측 높이·보고 간격·예보와 경보 기준을 학습합니다.':'심볼 그림을 보고 의미를 맞히거나 심볼 사전에서 찾아보세요.'}</p>
 <div class="wms75-summary"><div><span>학습한 문항</span><strong>${st.solved}<small> / ${st.total}</small></strong></div><div><span>정답률</span><strong>${st.accuracy===null?'—':st.accuracy+'%'}</strong></div><div><span>${st.period?'기간 미학습 문항':'아직 안 푼 문항'}</span><strong>${st.total-st.solved}</strong></div></div><p class="wms75-period">${st.period?'설정한 공부 기간 기준':'누적 학습 기록 기준'} · 선택한 분류의 학습 현황</p>
 <fieldset class="wms75-categories"><legend>학습할 분류</legend><button class="wms75-all" type="button" data-wms-all>전체 선택</button><div>${cat.map(c=>`<label><input type="checkbox" data-wms-category value="${esc(c.title)}" ${!selected||selected.has(c.title)?'checked':''}><span>${esc(c.title)}<small>${c.count}</small></span></label>`).join('')}</div></fieldset>
 <div class="wms75-quiz-settings${activeTab==='dictionary'?' hidden':''}"><label>출제 범위<select id="wms75Scope"><option value="all" ${scope==='all'?'selected':''}>전체 문항</option><option value="wrong" ${scope==='wrong'?'selected':''}>오답만${st.period?' (누적)':''}</option><option value="unseen" ${scope==='unseen'?'selected':''}>아직 안 푼 문항${st.period?' (누적)':''}</option></select></label><label>출제 개수<select id="wms75Count"><option value="10" ${count==='10'?'selected':''}>10문항</option><option value="20" ${count==='20'?'selected':''}>20문항</option><option value="all" ${count==='all'?'selected':''}>선택 범위 전체</option></select></label><button class="button" type="button" data-wms-start ${pool().length?'':'disabled'}>퀴즈 시작</button><p class="wms75-selection" role="status">출제 가능 ${pool().length}문항 · 매번 순서를 섞어 출제하고 바로 채점합니다.</p>${pool().length?'':'<p class="wms75-empty">선택한 범위에 출제할 문항이 없습니다.</p>'}</div>
 <div class="wms75-dictionary${activeTab==='dictionary'?'':' hidden'}"><label class="wms75-search">심볼 이름·설명 검색<input id="wms75Search" type="search" value="${esc(search)}" placeholder="예: 착빙, 전선, 제트기류"></label><div id="wms75DictionaryGrid" class="wms75-dictionary-grid"></div></div>
 <details class="wms75-coverage"><summary>수록 범위와 출처</summary><p>${criterion?'기준 문제 153문항 · 10개 분류. 사용자가 제공한 5차 개정판의 관측·예보·특보 지침과 수치표를 기준으로 출제했습니다. 정답 확인 시 해설에 인쇄 쪽수와 PDF 쪽수를 함께 표시합니다. 표마다 경계 표현이 다른 경우 질문에 적용 표를 명시합니다.':'안내서 별표 3(인쇄 121~123쪽)의 범례, 구름·제트기류 표기와 NWS 바람깃 보충을 포함한 기존 그림 퀴즈 86문항입니다.'}</p></details>`;
 renderDictionary();
}
function renderDictionary(){
 const grid=qs('#wms75DictionaryGrid');if(!grid)return;
 const term=search.trim().toLocaleLowerCase(),items=(activeTab==='dictionary'?chosen():[]).filter(q=>!term||(q.symbol_label+' '+q.symbol_category+' '+q.explanation).toLocaleLowerCase().includes(term));
 grid.innerHTML=items.length?items.map(q=>`<article class="wms75-dictionary-item"><button type="button" class="wms75-symbol-image" data-wms-zoom aria-label="${esc(q.symbol_label)} 그림 확대"><img src="${esc(q.images[0])}" alt="${esc(q.symbol_label)}" loading="lazy"></button><p class="wms75-category">${esc(q.symbol_category)}</p><h3>${esc(q.symbol_label)}</h3><p>${esc(q.explanation)}</p><small>${q.symbol_source.kind==='guide'?'안내서 인쇄 p.'+q.symbol_source.printed_page:'NWS 바람깃 보충'}</small></article>`).join(''):'<p class="wms75-empty" role="status">검색 결과가 없습니다.</p>';
}
function start(){
 if(!canOpen())return false;
 if(window.PilotBankAuth?.canAccessFeature?.('problem_bank')===false){alert('이 계정에는 문제 풀이 사용 권한이 없습니다.');return false;}
 const available=pool();if(!available.length)return false;
 const source=shuffle(available).slice(0,count==='all'?available.length:Number(count));
 hideStudySurfaces();hideAllHubs();els.mode.value='study';els.scope.value='all';els.noFigureOnly.checked=false;
 const label=activeTab==='criteria'?'관측·예보 기준 퀴즈':'기상도 심볼 퀴즈';
 activateLearningContext({kind:'reference',label,allowedSubjects:[SUBJECT],lockedSubject:SUBJECT,note:''});
 startSession(source,{type:'study',from:'weatherSymbols75',contextLabel:label});return true;
}
function onQuestion(q){
 qs('#wms78Hint')?.remove();
 const ours=q.subject===SUBJECT;els.quizCard.dataset.weatherSymbols75=String(ours);qs('#wms75QuizBack')?.classList.toggle('hidden',!ours);if(!ours)return;
 if(q.question_kind==='weather_criteria'){
  els.meta.replaceChildren();for(const text of ['관측·예보 기준',q.symbol_category]){const pill=document.createElement('span');pill.className='pill';pill.textContent=text;els.meta.append(pill);}
  if(q.hint){const hint=document.createElement('details');hint.id='wms78Hint';hint.className='wms78-hint';const summary=document.createElement('summary');summary.textContent='힌트';const text=document.createElement('p');text.textContent=q.hint;hint.append(summary,text);els.question.after(hint);}
  return;
 }

 els.meta.replaceChildren();for(const text of [q.symbol_category,q.symbol_source?.kind==='guide'?'안내서 범례':'바람깃 보충']){const pill=document.createElement('span');pill.className='pill';pill.textContent=text;els.meta.append(pill);}
 for(const image of els.figureGallery.querySelectorAll('img')){
  const buttons=[...els.choices.querySelectorAll('.choice')];
  const release=()=>{image.style.width=image.naturalWidth/image.naturalHeight>3?'640px':'210px';if(image.isConnected&&session[index]?.id===q.id&&!studyAnswers[q.id])buttons.forEach(b=>b.disabled=false);};
  buttons.forEach(b=>b.disabled=true);
  image.addEventListener('load',release,{once:true});
  if(image.complete&&image.naturalWidth)release();
  image.addEventListener('error',()=>{if(session[index]?.id!==q.id)return;els.figureNotice.textContent='심볼 그림을 불러오지 못했습니다. 그림을 확인한 뒤 답을 선택할 수 있습니다.';els.figureNotice.classList.remove('hidden');const retry=document.createElement('button');retry.type='button';retry.className='button secondary wms75-image-retry';retry.textContent='그림 다시 불러오기';retry.onclick=()=>renderQuestion();els.figureNotice.append(retry);},{once:true});
  image.alt='기상도 심볼 그림';const b=document.createElement('button');b.type='button';b.className='wms75-figure-zoom';b.setAttribute('aria-label','심볼 그림 확대');image.replaceWith(b);b.append(image);const hint=document.createElement('span');hint.textContent='그림 확대';b.append(hint);b.onclick=()=>zoom(image.getAttribute('src'),b);
 }
}
function onResult(items){
 const ours=items.length&&items.every(q=>q.subject===SUBJECT);els.resultCard.dataset.weatherGuide78=String(!!ours);if(ours)els.restart.textContent='안내서 퀴즈 설정';
}
function zoom(src,opener){
 if(!src)return;let dialog=qs('#wms75Zoom');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='wms75Zoom';dialog.className='wms75';dialog.setAttribute('aria-label','기상도 심볼 확대');dialog.innerHTML='<div class="wms75-zoom-head"><strong>심볼 그림</strong><button type="button" class="button secondary" data-wms-bigger>더 확대</button><button type="button" class="button secondary" data-wms-close>닫기</button></div><div class="wms75-zoom-paper"><img alt="기상도 심볼 확대"></div>';document.body.append(dialog);dialog.querySelector('[data-wms-close]').onclick=()=>dialog.close();dialog.querySelector('[data-wms-bigger]').onclick=()=>{dialog.dataset.expanded=String(dialog.dataset.expanded!=='true');dialog.querySelector('[data-wms-bigger]').textContent=dialog.dataset.expanded==='true'?'화면에 맞춤':'더 확대';};dialog.addEventListener('close',()=>{if(returnTo?.isConnected)returnTo.focus({preventScroll:true});returnTo=null;});}
 returnTo=opener;dialog.dataset.expanded='false';dialog.querySelector('[data-wms-bigger]').textContent='더 확대';const picture=dialog.querySelector('img');picture.onload=()=>dialog.style.setProperty('--wms75-zoom-width',Math.max(600,picture.naturalWidth)+'px');picture.src=src;dialog.showModal();dialog.querySelector('.wms75-zoom-paper').scrollTo(0,0);
}
ensureUi();window.addEventListener('pilotbank:bank-loaded',()=>{ensureUi();if(qs('#weatherSymbols75Card')&&!qs('#weatherSymbols75Card').classList.contains('hidden'))render();const cover=qs('#weatherSymbols75BookBtn img');if(cover&&window.PilotBankWeatherSymbols75Metadata?.cover)cover.src=window.PilotBankWeatherSymbols75Metadata.cover;});
window.PilotBankWeatherSymbols75={open,start,onQuestion,onResult,openCriteria:()=>{activeTab='criteria';selected=null;return open();}};
})();
