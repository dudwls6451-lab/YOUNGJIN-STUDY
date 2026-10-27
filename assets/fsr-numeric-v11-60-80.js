/* Numeric regulations: native grading and existing per-question cloud counters. */
(()=>{
 'use strict';
 const SUBJECT='고정익 운항기술기준',TITLE='고정익항공기를 위한 운항기술기준';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const bridge=()=>window.PilotBankFsrNumericBridge80;
 const $=s=>document.querySelector(s);
 let card,category='all',scope='all',count='20';
 const records=()=>bridge()?.records()||{};
 function questions(){return bridge()?.questions()||[];}
 function candidates(){const flags=records();return questions().filter(q=>(category==='all'||String(q.study_unit)===category)&&bridge().canPractice(q)&&(scope==='all'||scope==='wrong'&&flags[q.id]?.lastResult==='incorrect'||scope==='unseen'&&!(Number(flags[q.id]?.attempts)>0)));}
 function ensure(){
  if(card)return;
  card=document.createElement('section');card.id='fsrNumeric80Card';card.className='card hidden';card.setAttribute('aria-labelledby','fsrNumeric80Title');
  (document.querySelector('main.container')||document.querySelector('main')).append(card);
  card.addEventListener('change',e=>{if(e.target.id==='fsr80Category')category=e.target.value;if(e.target.id==='fsr80Scope')scope=e.target.value;if(e.target.id==='fsr80Count')count=e.target.value;updateCount();});
  card.addEventListener('click',async e=>{
   if(e.target.closest('[data-fsr80-back]')){card.classList.add('hidden');$('#referenceFsrBookBtn')?.click();return;}
   if(e.target.closest('[data-fsr80-retry]')){const b=e.target.closest('button');b.disabled=true;await bridge()?.reload();render();return;}
   if(e.target.closest('[data-fsr80-start]')){
    const pool=candidates();if(!pool.length)return;
    const limit=count==='all'?pool.length:Number(count),shuffled=[...pool];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    const chosen=shuffled.slice(0,limit),label='운항기술기준 · '+(category==='all'?'숫자 규정 전체':pool[0].study_unit_title)+(scope==='wrong'?' · 오답 복습':scope==='unseen'?' · 미학습':'');
    bridge()?.start(chosen.map(q=>q.id),label);
   }
  });
 }
 function updateCount(){
  if(!card)return;const available=candidates().length,n=count==='all'?available:Math.min(Number(count),available),button=card.querySelector('[data-fsr80-start]');
  card.querySelector('#fsr80Available').textContent=available?`선택 범위 ${available.toLocaleString()}문항 중 ${n.toLocaleString()}문항을 무작위로 출제합니다.`:scope==='wrong'?'선택한 범위에 최근 오답인 문항이 없습니다.':scope==='unseen'?'선택한 범위의 모든 문항을 한 번 이상 풀었습니다.':'선택한 범위에 출제 가능한 문항이 없습니다.';
  if(button){button.disabled=!available;button.textContent=n+'문항 학습 시작';}
 }
 function render(){
  ensure();const qs=questions(),status=window.PilotBankFsrNumeric80Status;
  if(qs.length!==100){
   card.innerHTML=`<div class="section-head"><div><span class="eyebrow">NUMERIC REGULATIONS</span><h2 id="fsrNumeric80Title">숫자로 익히는 운항기술기준</h2></div><button type="button" class="button secondary" data-fsr80-back>운항기술기준 홈</button></div><p role="status">${status?.state==='loading'?'문항을 불러오는 중입니다.':'객관식 문항을 불러오지 못했습니다. 연결을 확인하고 다시 불러오세요.'}</p><button class="button secondary" type="button" data-fsr80-retry ${status?.state==='loading'?'disabled':''}>다시 불러오기</button>`;return;
  }
  const flags=records(),seen=qs.filter(q=>Number(flags[q.id]?.attempts)>0).length;
  const attempts=qs.reduce((n,q)=>n+Math.max(0,Number(flags[q.id]?.attempts)||0),0),correct=qs.reduce((n,q)=>n+Math.max(0,Number(flags[q.id]?.correct)||0),0);
  const categories=[...new Map(qs.map(q=>[q.study_unit,q.study_unit_title]))].sort((a,b)=>a[0]-b[0]);
  card.innerHTML=`<div class="section-head"><div><span class="eyebrow">NUMERIC REGULATIONS · 100 QUESTIONS</span><h2 id="fsrNumeric80Title">숫자로 익히는 운항기술기준</h2><p class="muted">${TITLE} · 국토교통부고시 제2026-154호 · 2026.3.25. 개정 전문 기준</p></div><button type="button" class="button secondary" data-fsr80-back>운항기술기준 홈</button></div>
   <div class="fsr80-summary"><div><span>객관식 문제</span><strong>100<small>문항</small></strong></div><div><span>학습한 문항</span><strong>${seen}<small> / 100</small></strong></div><div><span>누적 정답률</span><strong>${attempts?Math.round(correct/attempts*100)+'%':'—'}</strong></div></div>
   <p class="fsr80-intro">시간·거리·고도·중량·비율을 조건과 함께 익혀 보세요. ‘이상/초과’, 운송사업 여부, 엔진 종류와 예외 조건에 주의하세요.</p>
   <div class="fsr80-settings"><label>학습 영역<select id="fsr80Category"><option value="all">전체 영역</option>${categories.map(([id,title])=>`<option value="${id}" ${category===String(id)?'selected':''}>${esc(title)} · ${qs.filter(q=>q.study_unit===id).length}문항</option>`).join('')}</select></label><label>문제 범위<select id="fsr80Scope">${[['all','전체 문제'],['wrong','최근 오답만'],['unseen','아직 안 푼 문제']].map(([v,l])=>`<option value="${v}" ${scope===v?'selected':''}>${l}</option>`).join('')}</select></label><label>문항 수<select id="fsr80Count">${[['10','10문항'],['20','20문항'],['all','선택 범위 전체']].map(([v,l])=>`<option value="${v}" ${count===v?'selected':''}>${l}</option>`).join('')}</select></label></div>
   <p id="fsr80Available" class="muted" role="status"></p><div class="fsr80-actions"><button class="button" type="button" data-fsr80-start>학습 시작</button><a class="fsr80-source-link" href="./references/fsr-aeroplanes-2026-154.pdf" target="_blank" rel="noopener">2026 개정 전문 PDF 보기</a></div>
   <div class="fsr80-topics">${categories.map(([id,title])=>`<div><strong>${esc(title)}</strong><span>${qs.filter(q=>q.study_unit===id).length}문항</span></div>`).join('')}</div>
   <p class="muted fsr80-footnote">각 문항 해설에 근거 조항과 공식 PDF 쪽수를 표시합니다. 풀이 기록은 기존 계정 기록에 저장되어 홈 진도·학습목표·마이페이지의 누적 분석에 반영됩니다. 기존 원문 학습·출제자별 주관식은 2024년 발췌 자료이며, 이번 객관식은 2026년 전문을 별도로 기준으로 합니다.</p>`;
  updateCount();
 }
 function open(){
  ensure();if(!bridge()?.open())return;
  render();card.classList.remove('hidden');window.PilotBankStudyTime?.updateState?.();window.scrollTo({top:0,behavior:'smooth'});
 }
 function installButtons(){
  const home=$('#fsrHomePane .fsr-menu-grid');
  if(home&&!$('#fsrNumeric80MenuBtn')){
   const button=document.createElement('button');button.id='fsrNumeric80MenuBtn';button.type='button';button.className='mode-choice-card';
   button.innerHTML='<strong>숫자 규정 객관식</strong><span>2026 개정 전문 · 7개 영역 · 100문항</span>';button.onclick=open;home.prepend(button);
  }
  const hub=$('#bookProblemHubCard .book-choice-grid');
  if(hub&&!$('#fsrNumeric80BookBtn')){
   const button=document.createElement('button');button.id='fsrNumeric80BookBtn';button.type='button';button.className='book-choice-card reference-book-card';
   button.innerHTML='<div class="fsr80-cover" aria-hidden="true">FLIGHT SAFETY<br><b>운항기술기준</b><small>NUMERIC REGULATIONS</small></div><strong>고정익 운항기술기준</strong><span>숫자 규정 객관식 · 100문항</span>';button.onclick=open;hub.append(button);
  }
 }
 function onQuestion(q){
  $('#fsrNumeric80Evidence')?.remove();if(q?.subject!==SUBJECT)return;
  const div=document.createElement('div');div.id='fsrNumeric80Evidence';div.className='fsr80-evidence';
  div.innerHTML=`<span>2026.3.25. 개정 · ${esc(q.source_clause)}</span><a href="./references/fsr-aeroplanes-2026-154.pdf#page=${Number(q.source_page)}" target="_blank" rel="noopener">근거 PDF p.${Number(q.source_page)} 보기</a>`;
  $('#questionText')?.after(div);
 }
 function boot(){ensure();installButtons();window.addEventListener('pilotbank:bank-loaded',()=>{installButtons();if(!card.classList.contains('hidden'))render();});}
 window.PilotBankFsrNumeric80={open,onQuestion};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
