/* PilotBank v11.60.36 · 검댕이 항공법규 제28회 모의고사 */
(()=>{
  const SUBJECT="검댕이 항공법규";
  const PATH="./data/questions-airlaw-mock28-v1.json";
  let loaded=false, promise=null;
  async function loadMock28(){
    if(loaded) return true;
    if(promise) return promise;
    promise=(async()=>{
      const r=await fetch(`${PATH}?v=11.60.36`,{cache:"no-store"});
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const d=await r.json();
      const rows=Array.isArray(d)?d:(d.questions||[]);
      if(rows.length!==25) throw new Error(`제28회 문항 수 오류: ${rows.length}`);
      if(typeof bank==="undefined"||!Array.isArray(bank)) throw new Error("기본 문제은행이 아직 준비되지 않았습니다.");
      const ids=new Set(bank.map(q=>q&&q.id).filter(Boolean));
      for(const q of rows){
        if(!q?.id||ids.has(q.id)) continue;
        const o=typeof adminQuestionOverrides!=="undefined"?adminQuestionOverrides.get(q.id):null;
        if(o&&typeof applyQuestionOverrideToQuestion==="function") applyQuestionOverrideToQuestion(q,o);
        bank.push(q); ids.add(q.id);
      }
      loaded=true;
      try{ updateAvailableCount(); }catch{}
      try{ updateErrorCount(); }catch{}
      return true;
    })().catch(e=>{promise=null;throw e});
    return promise;
  }
  function boot(tries=0){
    if(typeof bank!=="undefined"&&Array.isArray(bank)){
      loadMock28().catch(e=>console.error("[v11.60.36] 항공법규 제28회 로드 실패",e));
      return;
    }
    if(tries<100) setTimeout(()=>boot(tries+1),100);
  }
  boot();
  window.PilotBankAirLawMock28={load:loadMock28,subject:SUBJECT,version:"11.60.36"};
})();
