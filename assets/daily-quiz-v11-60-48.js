/* Account-scoped, resumable five-question daily entry gate. */
(() => {
  const TABLE = 'pilotbank_daily_quizzes';
  let locked = true, panel, state, key, userId, cloud = false, finish, bankSource, flags;
  const day = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function valid(s) { return s?.day === day() && Array.isArray(s.questions) && s.questions.length === 5 && new Set(s.questions.map(q=>q.id)).size === 5 && s.questions.every(q=>q.question && Array.isArray(q.choices) && q.choices.some(c=>String(c.id)===String(q.answer))) && s.answers && typeof s.answers === 'object' && Object.entries(s.answers).every(([id,a])=>s.questions.some(q=>q.id===id&&q.choices.some(c=>String(c.id)===String(a)))); }
  function count(s) { return s.questions.filter(q=>q.choices.some(c=>String(c.id)===String(s.answers[q.id]))).length; }
  function randomInt(n) { const limit = Math.floor(4294967296/n)*n; let v; do { v=crypto.getRandomValues(new Uint32Array(1))[0]; } while(v>=limit); return v%n; }
  function draw(rows) {
    const seen = new Set();
    const pool = rows.filter(q=>{if(!q?.id || seen.has(q.id))return false;seen.add(q.id);return q.question && q.choices?.length>=2 && q.choices.some(c=>String(c.id)===String(q.answer)) && !q.answer_pending_review && !q.extraction_review_required && !q.requires_figure && !flags?.[q.id]?.examExcluded && !flags?.[q.id]?.errorReported;});
    if(pool.length<5)throw Error('출제 가능한 문제가 5개 미만입니다. 문제 데이터를 확인한 후 다시 시도해 주세요.');
    for(let i=pool.length-1;i>0;i--){const j=randomInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
    return pool.slice(0,5).map(q=>({id:String(q.id),question:q.question,subject:q.subject||'',choices:q.choices.map(c=>({id:String(c.id),text:String(c.text)})),answer:String(q.answer),explanation:q.explanation||''}));
  }
  function localRead(){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
  function localWrite(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{return false;}}
  async function cloudRead(){const {data,error}=await window.supabaseClient.from(TABLE).select('state').eq('user_id',userId).eq('quiz_day',day()).maybeSingle();if(error)throw error;return data?.state;}
  async function save(){state.updatedAt=Date.now();localWrite();if(cloud){try{const remote=await cloudRead();if(valid(remote)&&remote.questions.map(q=>q.id).join('|')===state.questions.map(q=>q.id).join('|'))state.answers={...remote.answers,...state.answers};}catch{}const {error}=await window.supabaseClient.from(TABLE).upsert({user_id:userId,quiz_day:state.day,state},{onConflict:'user_id,quiz_day'});if(error){cloud=false;localWrite();}}}
  function status(){return cloud?'계정에 자동 저장됩니다.':'이 기기에 자동 저장됩니다. 계정 동기화가 연결되지 않았습니다.';}
  function ensurePanel(){if(panel)return;panel=document.createElement('section');panel.id='dailyQuizGate';panel.className='pb-daily-gate';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','dailyQuizTitle');document.body.append(panel);}
  function render(){
    ensurePanel();const index=state.questions.findIndex(q=>!Object.hasOwn(state.answers,q.id));
    if(index<0){const score=state.questions.filter(q=>state.answers[q.id]===q.answer).length;panel.innerHTML=`<div class="pb-daily-card"><h1 id="dailyQuizTitle">오늘의 퀴즈 완료</h1><p>5문항 중 ${score}문항 정답</p><p>오늘도 좋은 학습이 되길 바랍니다.</p><button id="dailyEnterHome" class="button">홈으로 이동</button></div>`;panel.querySelector('button').onclick=unlock;panel.querySelector('button').focus();return;}
    const q=state.questions[index];panel.innerHTML=`<div class="pb-daily-card"><p class="pb-daily-eyebrow">${escape(state.day)} · 오늘의 퀴즈</p><h1 id="dailyQuizTitle">오늘의 퀴즈 ${index+1} / 5</h1><p>5문항에 모두 답하면 홈으로 이동할 수 있습니다.</p><progress max="5" value="${count(state)}" aria-label="완료 문항"></progress><p class="muted">${escape(q.subject)}</p><h2 class="pb-daily-question">${escape(q.question)}</h2><div class="pb-daily-choices">${q.choices.map(c=>`<button type="button" class="pb-daily-choice" data-answer="${escape(c.id)}">${escape(c.id)}. ${escape(c.text)}</button>`).join('')}</div><div id="dailyFeedback" role="status" aria-live="polite"></div><p id="dailySaveStatus" class="muted">${status()}</p></div>`;
    panel.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=async()=>{
      if(Object.hasOwn(state.answers,q.id))return;
      state.answers[q.id]=btn.dataset.answer;
      panel.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',String(b===btn));if(b.dataset.answer===q.answer)b.classList.add('is-correct');else if(b===btn)b.classList.add('is-wrong');});
      const good=state.answers[q.id]===q.answer;const feedback=panel.querySelector('#dailyFeedback');feedback.innerHTML=`<p class="${good?'pb-good':'pb-bad'}">${good?'정답입니다.':`오답입니다. 정답: ${escape(q.answer)}`}</p><p>${escape(q.explanation)}</p><button class="button" id="dailyNextBtn">${index===4?'결과 보기':'다음 문제'}</button>`;
      const next=feedback.querySelector('button');next.disabled=true;await save();next.disabled=false;panel.querySelector('#dailySaveStatus').textContent=status();next.onclick=()=>{if(state.day!==day()){initialize().catch(showError);}else render();};next.focus();
    });panel.querySelector('[data-answer]')?.focus();
  }
  function unlock(){if(!state||count(state)!==5)return;locked=false;document.body.classList.remove('pb-home-gate-pending');panel?.remove();panel=null;finish?.();}
  function showError(err){ensurePanel();panel.innerHTML=`<div class="pb-daily-card"><h1 id="dailyQuizTitle">오늘의 퀴즈를 준비하지 못했습니다.</h1><p>${escape(err.message||err)}</p><button class="button">다시 시도</button></div>`;panel.querySelector('button').onclick=()=>initialize().catch(showError);}
  async function initialize(){
    const date=day();userId=window.PilotBankAuth?.getCurrentProfile?.()?.id||null;const label=userId||window.PilotBankAuth?.getCurrentUser?.()||'guest';key=`pilotbank-daily-v1::${encodeURIComponent(String(label))}::${date}`;let local=localRead(),remote=null;cloud=!!(userId&&window.supabaseClient);
    if(cloud){try{remote=await cloudRead();}catch{cloud=false;}}
    if(valid(remote)){state=remote;if(valid(local)&&local.questions.map(q=>q.id).join('|')===remote.questions.map(q=>q.id).join('|'))state.answers={...local.answers,...remote.answers};}
    else if(valid(local))state=local;else state={day:date,questions:draw(bankSource),answers:{},updatedAt:Date.now()};
    // First creation is atomic: retain the server's canonical draw if another device won.
    if(cloud&&!valid(remote)){try{const {error}=await window.supabaseClient.from(TABLE).upsert({user_id:userId,quiz_day:date,state},{onConflict:'user_id,quiz_day',ignoreDuplicates:true});if(error)throw error;const canonical=await cloudRead();if(valid(canonical))state=canonical;}catch{cloud=false;}}
    await save();if(count(state)===5){unlock();return;}render();
  }
  function run(rows,options={}){locked=true;document.body.classList.add('pb-home-gate-pending');bankSource=rows;flags=options.flags;return new Promise(resolve=>{finish=resolve;initialize().catch(showError);});}
  // Navigation remains blocked while the entry gate is pending; logout/theme stay usable.
  document.addEventListener('click',e=>{if(locked&&e.target.closest?.('#primaryFeatureNav,main.pilotbank-main,#homeTitleBtn')){e.preventDefault();e.stopImmediatePropagation();}},true);
  window.PilotBankDailyQuiz={run,isLocked:()=>locked};
})();
