/* Period statistics use dated attempts, never subtract lifetime snapshots. */
(()=>{
 const DAY=86400000; let lastNative='',lastTickDay='',api,cacheKey='',remote=[],loading=false,error='',generation=0;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const user=()=>api?.user()||'guest',key=kind=>'pilotbank-study-'+kind+'-v1::'+encodeURIComponent(user());
 const read=(kind,fallback)=>{try{return JSON.parse(localStorage.getItem(key(kind)))||fallback}catch{return fallback}};
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s+'T00:00:00+09:00'))&&new Date(Date.parse(s+'T00:00:00Z')).toISOString().slice(0,10)===s;
 function plan(){const p=read('plan',null);return p&&validDate(p.start)&&validDate(p.end)&&p.start<=p.end?p:null}
 function bounds(p){return [Date.parse(p.start+'T00:00:00+09:00'),Date.parse(p.end+'T00:00:00+09:00')+DAY]}
 function write(kind,value){localStorage.setItem(key(kind),JSON.stringify(value))}
 function record(q,correct,at){const rows=read('attempts',[]);rows.push({question_id:q.id,is_correct:!!correct,answered_at:at});try{write('attempts',rows);if(detail?.open)drawDetail()}catch{error='이 기기에 기간별 풀이 기록을 저장하지 못했습니다.'} }
 function attemptIndex(){
  const p=plan();if(!p)return null;
  const [start,end]=bounds(p),seen=new Set(),index=new Map();
  for(const r of [...(cacheKey===user()+'|'+p.start+'|'+p.end?remote:[]),...read('attempts',[])]){
   const t=Date.parse(r.answered_at),id=String(r.question_id),k=id+'|'+t;
   if(t<start||t>=end||!Number.isFinite(t)||seen.has(k))continue;
   seen.add(k);const count=index.get(id)||{attempts:0,correct:0};count.attempts++;if(r.is_correct)count.correct++;index.set(id,count);
  }
  return index;
 }
 function stats(subject,questions,index=attemptIndex()){
  if(!index)return null;
  const ids=new Set(questions.map(q=>String(q.id)));let solved=0,attempts=0,correct=0,rounds=ids.size?Infinity:0;
  for(const id of ids){const count=index.get(id);rounds=Math.min(rounds,count?.attempts||0);if(count){solved++;attempts+=count.attempts;correct+=count.correct;}}
  const nextRoundSolved=[...ids].filter(id=>(index.get(id)?.attempts||0)>rounds).length;
  return {total:ids.size,solved,attempts,correct,rounds,nextRoundSolved,incorrect:attempts-correct,progressPct:ids.size?Math.round(solved/ids.size*100):0,accuracyPct:attempts?Math.round(correct/attempts*100):null};
 }

 // Details share the saved-period attempt calculation with the subject cards.
 const detailCourses={
  "비행정보 및 관제절차":"theory-flight-info-atc-v1.json",
  '항공기상':'theory-weather-all.json','검댕이 항공법규':'theory-airlaw-all.json',
  '항공교통통신':'theory-atccomm-all.json','K-AIM':'theory-kaim-course-v3.json',
  '비행이론':'theory-flight-theory-v1.json','공중항법':'theory-air-navigation-v1.json'
 };
 const courseCache=new Map();
 let detail=null,detailSubject='',detailAccount='',detailView='unit';
 function unitGroups(questions){
  const groups=new Map();
  for(const q of questions){
   const unit=String(q.study_unit??q.studyUnit??q.unit??(typeof q.subunit?.code==='string'?q.subunit.code.split('.')[0]:'')).trim();
   const round=q.source_round??q.round;
   const code=unit?'su:'+unit:round!=null?'round:'+round:'other';
   const label=unit?'Study Unit '+unit:round!=null?round+'회차':'단원 미지정';
   if(!groups.has(code))groups.set(code,{id:code,label,title:unit?String(q.study_unit_title||''):'',questions:[]});
   groups.get(code).questions.push(q);
  }
  return [...groups.values()].sort((a,b)=>a.id==='other'?1:b.id==='other'?-1:a.label.localeCompare(b.label,'ko',{numeric:true}));
 }
 function stageGroups(questions,stages){
  const lookup=new Map(questions.map(q=>[String(q.id),q])),covered=new Set();
  const rows=stages.map((stage,i)=>{
   const ids=[...new Set((stage.question_ids||[]).map(String))];
   const qs=ids.filter(id=>lookup.has(id)).map(id=>lookup.get(id));
   qs.forEach(q=>covered.add(String(q.id)));
   return {id:String(stage.id||i),label:(stage.order??i+1)+'단계',title:String(stage.title||stage.unit_title||''),questions:qs,missing:ids.length-qs.length};
  });
  const rest=questions.filter(q=>!covered.has(String(q.id)));
  if(rest.length)rows.push({id:'unassigned',label:'단계 미지정 문항',title:'현재 이론 단계에 연결되지 않은 문제',questions:rest});
  return rows;
 }
 function ensureDetail(){
  if(detail)return detail;
  detail=document.createElement('dialog');detail.id='studyProgressDetail';
  detail.setAttribute('aria-labelledby','studyProgressDetailTitle');
  detail.innerHTML='<div class="sp-detail-shell"><header class="sp-detail-header"><div><span class="sp-detail-eyebrow">나의 학습 진도</span><h2 id="studyProgressDetailTitle"></h2></div><button type="button" class="sp-detail-close" aria-label="진도 상세 닫기">닫기</button></header><div class="sp-detail-scroll"><p id="studyProgressDetailPeriod" class="sp-detail-muted"></p><div id="studyProgressDetailSummary"></div><div class="sp-detail-views" role="group" aria-label="진도 구분"><button type="button" data-detail-view="unit">Study Unit별</button><button type="button" data-detail-view="stage">단계별</button></div><p id="studyProgressDetailNotice" class="sp-detail-muted"></p><div id="studyProgressDetailRows" aria-live="polite"></div></div></div>';
  document.body.append(detail);
  detail.querySelector('.sp-detail-close').onclick=()=>detail.close();
  detail.addEventListener('click',e=>{if(e.target===detail){const r=detail.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)detail.close();}});
  detail.addEventListener('close',()=>{const subject=detailSubject;detailSubject='';const opener=[...document.querySelectorAll('[data-study-detail]')].find(b=>b.dataset.studyDetail===subject);opener?.focus({preventScroll:true});});
  detail.querySelectorAll('[data-detail-view]').forEach(button=>button.onclick=()=>{detailView=button.dataset.detailView;drawDetail();});
  return detail;
 }
 function openDetail(subject){
  ensureDetail();detailSubject=subject;detailAccount=String(user());detailView='unit';drawDetail();if(!detail.open)detail.showModal();
  if(detailCourses[subject])loadDetailCourse(subject);
 }
 async function loadDetailCourse(subject,retry=false){
  if(courseCache.has(subject)&&!retry)return;
  courseCache.set(subject,{loading:true});drawDetail();
  try{
   const response=await fetch('./data/'+detailCourses[subject]+'?v='+(subject==='비행이론'?'11.60.84':subject==='공중항법'?'11.60.83':subject==='검댕이 항공법규'?'11.60.82':'11.60.67'),{cache:['검댕이 항공법규','공중항법','비행이론'].includes(subject)?'no-store':'default'});
   if(!response.ok)throw Error('course');
   const payload=await response.json();
   if(!Array.isArray(payload.stages))throw Error('stages');
   courseCache.set(subject,{stages:payload.stages.slice().sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0))});
  }catch{courseCache.set(subject,{error:true});}
  drawDetail();
 }
 function drawDetail(){
  if(!detail?.open&&!detailSubject)return;
  if(detailAccount!==String(user())||!plan()){detail.close();detailSubject='';return;}
  const subject=detailSubject,p=plan(),questions=api.questions(subject),counts=attemptIndex(),st=stats(subject,questions,counts),g=p.goals?.[subject],course=courseCache.get(subject);
  detail.querySelector('#studyProgressDetailTitle').textContent=subject;
  detail.querySelector('#studyProgressDetailPeriod').textContent=p.start+' ~ '+p.end+' · 한국 시간 · 저장된 공부 기간 기준';
  detail.querySelector('#studyProgressDetailSummary').innerHTML=`<div class="sp-detail-summary"><div><span>과목 진도율</span><strong>${st.progressPct}%</strong><small>${st.solved} / ${st.total}문항</small></div><div><span>정답률</span><strong>${st.accuracyPct===null?'—':st.accuracyPct+'%'}</strong><small>정답 ${st.correct} / ${st.attempts}회 풀이</small></div></div><p class="sp-detail-muted">${chosen(p).includes(subject)&&g?`설정한 목표: 진도율 ${g.progress}% · 정답률 ${g.accuracy}%`:'일일 목표에서 제외된 과목입니다.'}</p>${loading?'<p class="sp-detail-state" role="status">서버 이력을 불러오는 중입니다.</p>':''}${error?'<p class="sp-detail-state" role="status">서버 이력을 확인하지 못해 현재 기기 기록 기준으로 표시합니다.</p>':''}`;
  detail.querySelectorAll('[data-detail-view]').forEach(b=>{b.hidden=b.dataset.detailView==='stage'&&!detailCourses[subject];b.setAttribute('aria-pressed',String(b.dataset.detailView===detailView));});
  const host=detail.querySelector('#studyProgressDetailRows'),notice=detail.querySelector('#studyProgressDetailNotice');
  notice.textContent='진도율은 기간 중 푼 고유 문항 비율이며, 정답률은 반복 풀이를 포함합니다. 회독은 이 공부 기간에 모든 문제를 한 번씩 푼 횟수입니다.';
  if(detailView==='stage'){
   notice.textContent+=' 단계별 수치는 이론 읽음·통과 여부가 아닌 연결된 문제의 풀이 진도입니다. 같은 문제가 여러 단계에 연결되면 각 단계에 표시되며 과목 합계는 중복 집계하지 않습니다.';
   if(!course||course.loading){host.innerHTML='<p class="sp-detail-state" role="status">단계 목록을 불러오는 중입니다.</p>';return;}
   if(course.error){host.innerHTML='<p class="sp-detail-state" role="status">단계 목록을 불러오지 못했습니다.</p><button type="button" class="sp-detail-retry">다시 시도</button>';host.querySelector('button').onclick=()=>loadDetailCourse(subject,true);return;}
  }
  notice.textContent+=' 오답만 풀기는 이 공부 기간에 한 번이라도 틀린 문제를 출제합니다. 오류 신고·미채점 문항은 출제에서 제외합니다.';
  const groups=detailView==='stage'?stageGroups(questions,course.stages):unitGroups(questions);
  const selections=[];
  host.innerHTML=groups.length?groups.map((group,groupIndex)=>{
   const available=[...new Map(group.questions.filter(q=>api.canPractice?.(q)!==false).map(q=>[String(q.id),q])).values()];
   const wrong=available.filter(q=>{const c=counts.get(String(q.id));return c&&c.attempts>c.correct;});
   selections.push({group,available,wrong});
   const s=stats(subject,group.questions,counts);
   const target=chosen(p).includes(subject)&&Number.isFinite(g?.accuracy)?g.accuracy:null;
   const below=s.attempts>0&&target!==null&&s.correct*100<s.attempts*target;
   const accuracy=s.attempts?(Math.floor(s.correct/s.attempts*10000)/100)+'%':'—';
   const rounds=group.missing?'회독 집계 보류 · 연결 문항을 모두 불러와 주세요.':s.total?`완료 ${s.rounds}회독 · ${s.rounds+1}회독 ${s.nextRoundSolved} / ${s.total}문항`:'회독 —';
   return `<article class="sp-detail-row${below?' sp-detail-row-warning':''}"><div class="sp-detail-row-heading"><div><h3>${esc(group.label)}</h3>${group.title?`<p>${esc(group.title)}</p>`:''}</div><strong>${s.total?s.progressPct+'%':'—'}</strong></div><progress max="100" value="${s.progressPct}" aria-label="${esc(group.label)} 진도율"></progress><div class="sp-detail-row-counts"><span>${s.solved} / ${s.total}문항</span><span>정답률 ${accuracy}</span></div><p class="sp-detail-rounds">${rounds}</p>${below?`<p class="sp-detail-accuracy-warning">정답률 목표 ${target}% 미달 · 복습이 필요합니다.</p>`:!s.attempts?'<p class="sp-detail-muted">미학습 · 정답률 미집계</p>':''}<p class="sp-detail-muted">${s.attempts}회 풀이 · 정답 ${s.correct}회 · 오답 ${s.incorrect}회</p>${group.missing?`<p class="sp-detail-muted">연결 문항 중 ${group.missing}개가 아직 로드되지 않았습니다. 현재 불러온 문항 기준입니다.</p>`:!s.total?'<p class="sp-detail-muted">현재 연결된 문제가 없습니다.</p>':''}<div class="sp-detail-practice-actions"><button type="button" data-unit-practice="all" data-group-index="${groupIndex}" ${!available.length||!api.practice?'disabled':''}>${detailView==='stage'?'이 단계 풀기':'이 유닛 풀기'} (${available.length})</button><button type="button" data-unit-practice="wrong" data-group-index="${groupIndex}" ${!wrong.length||loading||!api.practice?'disabled':''}>오답만 풀기 (${wrong.length})</button></div></article>`;
  }).join(''):'<p class="sp-detail-state">문항이 아직 로드되지 않았습니다. 교재 학습에서 이 과목을 연 뒤 다시 확인해 주세요.</p>';
  host.querySelectorAll('[data-unit-practice]').forEach(button=>button.onclick=()=>{
   const selection=selections[Number(button.dataset.groupIndex)],wrongOnly=button.dataset.unitPractice==='wrong';
   const rows=wrongOnly?selection.wrong:selection.available;
   if(!rows.length||!api.practice)return;
   const request={subject,questionIds:rows.map(q=>String(q.id)),label:subject+' · '+selection.group.label+(wrongOnly?' · 기간 내 오답':''),wrongOnly};
   detail.close();api.practice(request);
  });
 }

 const chosen=p=>Array.isArray(p?.subjects)?p.subjects:Object.keys(p?.goals||{});
 const dateOf=t=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
 function daily(now=Date.now()){
  const p=plan();if(!p)return null;const [a,b]=bounds(p),date=dateOf(now),days=Math.round((b-a)/DAY),index=Math.floor((Date.parse(date+'T00:00:00+09:00')-a)/DAY),subjects=chosen(p),ids=new Map();let total=0;
  for(const subject of subjects){const qs=api.questions(subject);const count=qs.length;const target=Math.ceil(count*(p.goals?.[subject]?.progress||100)/100);total+=target;for(const q of qs)ids.set(String(q.id),subject);}
  const first=new Map();for(const r of [...(cacheKey===user()+'|'+p.start+'|'+p.end?remote:[]),...read('attempts',[])]){const t=Date.parse(r.answered_at),id=String(r.question_id);if(t>=a&&t<b&&t<=now&&ids.has(id)&&(!first.has(id)||t<first.get(id)))first.set(id,t);}
  let done=0,before=0,all=0;for(const subject of subjects){const target=Math.ceil(api.questions(subject).length*(p.goals?.[subject]?.progress||100)/100);const times=[...first].filter(([id])=>ids.get(id)===subject).map(([,t])=>t).sort((a,b)=>a-b).slice(0,target);all+=times.length;for(const t of times){const d=dateOf(t);if(d===date)done++;else if(d<date)before++;}}
  const base=days?Math.ceil(total/days):0,active=index>=0&&index<days,target=active?Math.min(base,Math.max(0,total-before)):0;
  return {date,start:p.start,end:p.end,days,total,base,target,done,all,active,percent:target?Math.min(100,Math.floor(done/target*100)):(active?100:0),remaining:Math.max(0,target-done),hour:Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',hourCycle:'h23'}).format(new Date(now))),enabled:p.reminders!==false};
 }
 function home(){let box=document.querySelector('#studyDailyGoal');const host=document.querySelector('#topProgressGrid');if(!host)return;const d=daily();if(!d){box?.remove();document.querySelector('#studyGoalToast')?.remove();nativeSync(null);return}if(!box){box=document.createElement('section');box.id='studyDailyGoal';host.before(box)}box.innerHTML=`<h3>오늘의 학습 목표</h3><p class="muted">${esc(d.start)} ~ ${esc(d.end)} · 목표 총 ${d.total}문항 ÷ ${d.days}일 · 하루 ${d.base}문항</p>${d.active?`<div class="study-daily-numbers"><strong>${d.percent}%</strong><span>오늘 ${d.done} / ${d.target}문항</span></div><progress max="100" value="${d.percent}" aria-label="일일 학습목표 달성률"></progress><p>${d.remaining?`오늘 ${d.remaining}문항이 남았습니다.`:'오늘의 목표를 달성했습니다.'}</p>${d.hour>=18&&d.remaining?`<p class="study-daily-warning" role="alert">오늘의 학습 목표가 미달성 상태입니다. 자정 전까지 ${d.remaining}문항을 더 풀어 주세요.</p>`:''}`:`<p>${d.date<d.start?'공부 시작일 전입니다.':'공부 기간이 종료되었습니다.'}</p>`}${loading?'<p class="muted">서버 이력을 확인하는 중입니다.</p>':''}${error?'<p class="muted">서버 이력을 확인하지 못해 현재 기기 기록 기준으로 표시합니다.</p>':''}`;if(!d.active||!d.enabled||d.remaining<=0)document.querySelector('#studyGoalToast')?.remove();else{const text=document.querySelector('#studyGoalToast p');if(text)text.textContent=`오늘 ${d.done}/${d.target}문항 · ${d.remaining}문항이 남았습니다.`;}if(loading||error)nativeSync(null);else nativeSync(d);}
 function nativeSync(d){if(!window.AqbStudyAlerts?.sync)return;const payload=JSON.stringify(d?{...d,account:String(user())}: {enabled:false});if(lastNative!==payload){lastNative=payload;try{window.AqbStudyAlerts.sync(payload)}catch{}}}
 function tick(now=Date.now()) {home();const d=daily(now);if(!d||!d.active||!d.enabled||loading||error||d.remaining<=0)return;const hours=[18,20,22,23],hour=hours.filter(h=>h<=d.hour).pop();if(hour===undefined)return;if(document.visibilityState!=='visible'&&(window.AqbStudyAlerts||window.Notification?.permission!=='granted'))return;const sent=read('alerts',{}),id=d.date+'|'+hour;if(sent[id])return;sent[id]=true;try{write('alerts',Object.fromEntries(Object.entries(sent).filter(([k])=>k.slice(0,10)>=d.date)))}catch{return}
  if(document.visibilityState==='visible'){let toast=document.querySelector('#studyGoalToast');if(!toast){toast=document.createElement('div');toast.id='studyGoalToast';toast.setAttribute('role','alert');document.body.append(toast)}toast.innerHTML=`<strong>${hour}시 학습목표 알림</strong><p>오늘 ${d.done}/${d.target}문항 · ${d.remaining}문항이 남았습니다.</p><button type="button" class="button secondary">닫기</button>`;toast.querySelector('button').onclick=()=>toast.remove();}
  if(!window.AqbStudyAlerts&&window.Notification?.permission==='granted')try{new Notification('Aviquestionbank · 일일 목표 미달성',{body:`오늘 ${d.done}/${d.target}문항, ${d.remaining}문항이 남았습니다.`,tag:'aqb-daily-'+id})}catch{}
 }
 function init(x){api=x;window.PilotBankStudySettings?.init({user,cloud:()=>api.cloud(),changed:()=>{cacheKey='';render();api.settingsChanged?.();api.home();refresh();}});setInterval(()=>{const day=today();if(lastTickDay!==day){lastTickDay=day;api.home()}tick()},30000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refresh(true);tick()}});window.addEventListener('focus',()=>{refresh(true);tick()});}
 async function refresh(force=false){const p=plan();if(!p||!api?.cloud())return;const k=user()+'|'+p.start+'|'+p.end;if(cacheKey===k&&!force)return;cacheKey=k;remote=[];loading=true;error='';const token=++generation;render();api.home();try{const [a,b]=bounds(p),rows=[];for(let offset=0;;offset+=1000){const {data,error:err}=await window.supabaseClient.from('user_attempts').select('id,question_id,is_correct,answered_at').eq('user_id',api.user()).gte('answered_at',new Date(a).toISOString()).lt('answered_at',new Date(b).toISOString()).order('answered_at',{ascending:true}).order('id',{ascending:true}).range(offset,offset+999);if(err)throw err;rows.push(...(data||[]));if(!data||data.length<1000)break;}if(token!==generation)return;remote=rows;}catch(e){if(token!==generation)return;error='서버 풀이 이력을 불러오지 못했습니다. 현재 기기 기록만 표시합니다. 다시 불러오기를 눌러 주세요.';}finally{if(token===generation){loading=false;render();api.home();}}}
 function render(){if(!api)return;drawDetail();const host=document.querySelector('#focusBookSettings');if(!host)return;let box=document.querySelector('#studyPlanSettings');if(!box){box=document.createElement('section');box.id='studyPlanSettings';host.before(box)}if(box.dataset.account!==String(user())){box.dataset.account=String(user());box.dataset.dirty='0';box.dataset.editing='0';}const p=plan(),subjects=[...new Set([...api.subjects(),...chosen(p)])],goals=p?.goals||{},selected=chosen(p),editing=!p||box.dataset.editing==='1',periodCounts=attemptIndex();
 if(box.dataset.dirty==='1'){const status=box.querySelector('#studyPlanStatus');if(status)status.textContent=loading?'기간별 서버 이력 불러오는 중…':error;return;}
 box.innerHTML=`<div class="study-plan-heading"><h3>공부 기간과 목표</h3>${p&&!editing?'<button class="button" type="button" id="editStudyPlan">목표 수정</button>':''}</div>${p?`<p class="study-plan-summary">${editing?'목표 수정 중':'저장된 학습목표'} · ${esc(p.start)} ~ ${esc(p.end)} · ${selected.length}개 교재</p>`:''}<p class="muted">기간은 한국 시간 기준이며 시작일과 종료일을 모두 포함합니다. 공부 기간·교재 목표·알림 설정은 로그인 계정으로 기기 간 동기화됩니다. 풀이 이력은 기존 학습 기록을 사용합니다.</p><form id="studyPlanForm"><fieldset class="study-plan-fields" data-editing="${editing}"><div class="study-plan-dates"><label>시작일<input name="start" type="date" required value="${esc(p?.start||today())}"></label><label>종료일<input name="end" type="date" required value="${esc(p?.end||today())}"></label></div><p class="muted">목표에 포함할 교재만 체크하세요. 문항이 로드되지 않은 교재는 먼저 교재 학습에서 열어 주세요. 진도율은 기간 중 푼 고유 문항 비율, 정답률은 반복 풀이를 포함한 정답 비율입니다.</p><div class="study-plan-books">${subjects.map((s,i)=>{const st=stats(s,api.questions(s),periodCounts),g=goals[s]||{progress:100,accuracy:80};return `<article class="study-plan-book"><h4><label><input class="study-book-select" type="checkbox" name="book${i}" ${selected.includes(s)?'checked':''} ${api.questions(s).length||selected.includes(s)?'':'disabled'}> ${esc(s)}</label></h4><div class="study-plan-targets"><label>목표 진도율 (%)<input type="number" min="1" max="100" step="1" ${selected.includes(s)?'required':'disabled'} name="progress${i}" value="${g.progress}"></label><label>목표 정답률 (%)<input type="number" min="1" max="100" step="1" ${selected.includes(s)?'required':'disabled'} name="accuracy${i}" value="${g.accuracy}"></label></div>${st?`<p>기간 진도 <strong>${st.progressPct}%</strong> (${st.solved}/${st.total}) · 정답률 <strong>${st.accuracyPct===null?'—':st.accuracyPct+'%'}</strong></p><p class="muted">${st.attempts}회 풀이 · 정답 ${st.correct}회 · 오답 ${st.incorrect}회</p>${selected.includes(s)?`<p>${st.total>0&&st.progressPct>=g.progress?'진도 목표 달성':'진도 목표 진행 중'} · ${st.accuracyPct!==null&&st.accuracyPct>=g.accuracy?'정답률 목표 달성':'정답률 목표 진행 중'}</p>`:'<p class="muted">일일 목표에서 제외</p>'}`:'<p class="muted">공부 기간을 저장하면 기간별 현황이 표시됩니다.</p>'}${p?`<button type="button" class="study-plan-detail-open" data-study-detail="${esc(s)}" aria-haspopup="dialog" aria-label="${esc(s)} 단원별 진도 보기">단원별 진도 보기 <span aria-hidden="true">→</span></button>`:''}</article>`}).join('')}</div><label class="study-reminder-option"><input type="checkbox" name="reminders" ${p?.reminders===false?'':'checked'}> 미달성 알림: 매일 18·20·22·23시 (한국 시간)</label><p class="muted">일일 목표 = 선택 교재의 목표 문항 수 합계 ÷ 공부 일수 (올림). 기간 중 처음 푼 문항만 일일 진도로 인정하며, 남은 전체 목표가 적으면 일일 목표를 줄입니다.</p><button class="button secondary" type="button" id="enableStudyAlerts">알림 권한 설정</button><p id="studyAlertHelp" class="muted">새 Android 앱에서는 앱을 닫아도 예약 알림을 받습니다. 웹·기존 앱은 페이지가 실행되는 동안 알림을 확인합니다.</p></fieldset><div class="study-plan-actions">${editing?`<button class="button" type="submit">${p?'수정한 목표 저장':'기간·목표 저장'}</button>${p?'<button class="button secondary" type="button" id="cancelStudyPlanEdit">수정 취소</button>':''}`:''}<button class="button secondary" type="button" id="clearStudyPlan">기간 해제</button><button class="button secondary" type="button" id="refreshStudyPlan">이력 다시 불러오기</button></div><p id="studyPlanStatus" role="status">${loading?'기간별 서버 이력 불러오는 중…':esc(error)}</p></form><p class="muted">기간 설정 시 홈의 집중학습 현황에도 같은 계산을 적용합니다. 기간 해제 시 홈은 누적 현황으로 돌아옵니다. 서버에 날짜별 이력이 없는 과거 기기 내 기록은 소급 집계되지 않습니다.</p>`;
 if(!editing){box.querySelectorAll('.study-plan-fields input').forEach(input=>input.disabled=true);box.querySelector('#enableStudyAlerts').hidden=true;}
 box.querySelectorAll('[data-study-detail]').forEach(button=>button.onclick=()=>openDetail(button.dataset.studyDetail));
 box.querySelector('#editStudyPlan')?.addEventListener('click',()=>{box.dataset.editing='1';box.dataset.dirty='0';render();box.querySelector('[name=start]')?.focus();});
 box.querySelector('#cancelStudyPlanEdit')?.addEventListener('click',()=>{box.dataset.editing='0';box.dataset.dirty='0';render();});
 box.querySelector('form').addEventListener('input',()=>box.dataset.dirty='1');
 box.querySelectorAll('.study-book-select').forEach(input=>input.onchange=()=>{const card=input.closest('article');card.querySelectorAll('input[type=number]').forEach(n=>{n.disabled=!input.checked;n.required=input.checked})});
 box.querySelector('#enableStudyAlerts').onclick=async()=>{const help=box.querySelector('#studyAlertHelp');if(window.AqbStudyAlerts?.enable){window.AqbStudyAlerts.enable();help.textContent='Android 알림 권한과 정확한 시간 알람 설정을 허용해 주세요.';}else if(window.Notification){try{const permission=await Notification.requestPermission();help.textContent=permission==='granted'?'웹 알림이 허용되었습니다. 페이지가 실행되는 동안 알림을 보냅니다.':'시스템 알림이 허용되지 않았습니다. 화면 내 알림은 계속 표시됩니다.'}catch{help.textContent='시스템 알림을 지원하지 않는 환경입니다. 화면 내 알림은 계속 표시됩니다.'}}else help.textContent='이 환경은 시스템 알림을 지원하지 않습니다. 새 Android 앱에서 예약 알림을 사용할 수 있습니다.';};
 box.querySelector('form').onsubmit=e=>{e.preventDefault();const f=e.target,start=f.elements.start.value,end=f.elements.end.value,status=box.querySelector('#studyPlanStatus');if(!validDate(start)||!validDate(end)||start>end){status.textContent='종료일은 시작일과 같거나 늦어야 합니다.';return}const next={start,end,goals:{},subjects:[],reminders:f.elements.reminders.checked};for(let i=0;i<subjects.length;i++){if(!f.elements['book'+i].checked)continue;const previous=goals[subjects[i]],changed=!previous||Number(f.elements['progress'+i].value)!==previous.progress;if(!api.questions(subjects[i]).length&&changed){status.textContent='선택한 교재의 문항을 불러온 뒤 목표 진도율을 변경해 주세요. 기존 목표는 유지됩니다.';return}next.subjects.push(subjects[i]);const progress=Number(f.elements['progress'+i].value),accuracy=Number(f.elements['accuracy'+i].value);if(!Number.isInteger(progress)||progress<1||progress>100||!Number.isInteger(accuracy)||accuracy<1||accuracy>100){status.textContent='목표는 1~100 사이의 정수로 입력해 주세요.';return}next.goals[subjects[i]]={progress,accuracy}}if(!next.subjects.length){status.textContent='목표에 포함할 교재를 하나 이상 선택해 주세요.';return}try{write('plan',next);window.PilotBankStudySettings?.savePlan(next);box.dataset.dirty='0';box.dataset.editing='0';cacheKey='';render();api.home();refresh();box.querySelector('#studyPlanStatus').textContent='기간과 목표를 저장했습니다.'}catch{status.textContent='설정을 저장하지 못했습니다. 저장 공간을 확인해 주세요.'}};
 box.querySelector('#clearStudyPlan').onclick=()=>{try{localStorage.removeItem(key('plan'));window.PilotBankStudySettings?.savePlan(null);box.dataset.dirty='0';box.dataset.editing='0';generation++;cacheKey='';remote=[];loading=false;error='';render();api.home()}catch{box.querySelector('#studyPlanStatus').textContent='설정을 변경하지 못했습니다.'}};
 box.querySelector('#refreshStudyPlan').onclick=()=>{window.PilotBankStudySettings?.sync();refresh(true)};window.PilotBankStudySettings?.paint();
 }
 window.addEventListener('pilotbank:bank-loaded',()=>{if(api)render();});
 window.PilotBankStudyPlan={init,plan,record,stats,render,refresh,daily,home,tick,status:()=>({loading,error}),today,bounds};
})();
