/* Today's graded answers are independent of study-plan dates and selected books. */
(()=>{
 const DAY=86400000;let api,scopeKey='',remote=[],loading=false,error=false,lastFetch=0,generation=0;
 const dateOf=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 const user=()=>String(api?.user?.()||'guest');
 function scope(now=Date.now()){
  const date=dateOf(now),account=user(),key=account+'|'+date,start=Date.parse(date+'T00:00:00+09:00');
  if(scopeKey!==key){scopeKey=key;remote=[];loading=false;error=false;lastFetch=0;generation++;}
  return {date,account,key,start,end:start+DAY};
 }
 function localRows(account){try{const rows=JSON.parse(localStorage.getItem('pilotbank-study-attempts-v1::'+encodeURIComponent(account))||'[]');return Array.isArray(rows)?rows:[]}catch{return []}}
 function snapshot(now=Date.now()){
  const s=scope(now),seen=new Set(),ids=new Set();let total=0,correct=0;
  for(const row of [...remote,...localRows(s.account)]){
   if(row?.question_id===null||row?.question_id===undefined)continue;
   const id=String(row.question_id),t=Date.parse(row.answered_at),key=id+'|'+t;
   if(!id||!Number.isFinite(t)||t<s.start||t>=s.end||t>now||seen.has(key))continue;
   seen.add(key);ids.add(id);total++;if(row.is_correct===true)correct++;
  }
  return {...s,total,unique:ids.size,correct,incorrect:total-correct,loading,error,localOnly:!api?.cloud?.()};
 }
 function render(){
  if(!api)return;const host=document.querySelector('#topProgressGrid');if(!host)return;
  let box=document.querySelector('#todayStudyCount88');if(!box){box=document.createElement('section');box.id='todayStudyCount88';box.setAttribute('aria-labelledby','todayStudyCountTitle88');}
  const anchor=document.querySelector('#studyDailyGoal')||host;if(box.nextElementSibling!==anchor)anchor.before(box);
  const s=snapshot(),fmt=n=>n.toLocaleString('ko-KR');
  box.innerHTML=`<div class="today88-heading"><div><p class="today88-date">${s.date.replaceAll('-','.')} · 오늘의 기록</p><h3 id="todayStudyCountTitle88">오늘 푼 문제</h3></div><button class="today88-refresh" type="button" aria-label="오늘 풀이 기록 다시 불러오기">새로고침</button></div><p class="today88-total" aria-live="polite" aria-atomic="true"><strong>${fmt(s.total)}</strong><span>문제</span></p><div class="today88-details"><div><span>고유 문항</span><strong>${fmt(s.unique)}<small>개</small></strong></div><div><span>정답</span><strong>${fmt(s.correct)}<small>회</small></strong></div><div><span>오답</span><strong>${fmt(s.incorrect)}<small>회</small></strong></div></div><p class="today88-note">모든 교재 · 반복 풀이 포함 · 한국 시간 자정 기준</p><p class="today88-status" role="status">${s.loading?'서버 기록을 확인하고 있어요.':s.error?'서버 기록을 확인하지 못했어요. 현재 확인된 기록 기준입니다.':s.localOnly?'현재 기기 기록 기준입니다.':''}</p>`;
  box.querySelector('button').onclick=()=>refresh(true);box.querySelector('button').disabled=loading;
 }
 async function refresh(force=false){
  if(!api)return;const s=scope();
  if(!api.cloud?.()||!window.supabaseClient){render();return;}
  if(loading||!force&&lastFetch&&Date.now()-lastFetch<30000){render();return;}
  loading=true;error=false;const token=++generation;render();
  try{
   const rows=[];
   for(let offset=0;;offset+=1000){
    const result=await window.supabaseClient.from('user_attempts').select('id,question_id,is_correct,answered_at').eq('user_id',s.account).gte('answered_at',new Date(s.start).toISOString()).lt('answered_at',new Date(s.end).toISOString()).order('answered_at',{ascending:true}).order('id',{ascending:true}).range(offset,offset+999);
    if(result.error)throw result.error;const batch=result.data||[];rows.push(...batch);if(batch.length<1000)break;
    if(token!==generation||scope().key!==s.key)return;
   }
   if(token!==generation||scope().key!==s.key)return;remote=rows;
  }catch{if(token===generation&&scope().key===s.key)error=true;}
  finally{if(token===generation&&scope().key===s.key){loading=false;lastFetch=Date.now();render();}}
 }
 function init(x){api=x;render();refresh();setInterval(()=>{render();refresh()},30000);window.addEventListener('focus',()=>refresh(true));window.addEventListener('online',()=>refresh(true));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh(true)});}
 window.PilotBankToday88={init,render,refresh,snapshot};
})();
