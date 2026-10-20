/* Aviquestionbank 11.60.76 — shared group quizzes; grading and access checks run on the server. */
(() => {
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profile=()=>window.PilotBankAuth?.getCurrentProfile?.(),uid=()=>profile()?.id||'',key=()=>`pb-group-quiz76:${uid()}:${S.group?.id||''}`;
const S={group:null,user:'',epoch:0,serial:0,filter:'all',type:'all',offset:0,total:0,questions:[],view:'browse',cards:[],edit:null,session:[],cursor:0,saving:false,publication:null};
const letters=['A','B','C','D'];
const stamp=value=>{try{return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))+' KST';}catch{return '일시 확인 불가';}};
const fresh=()=>({question_type:'short_answer',question:'',choices:['','','',''],correct_choice:'A',accepted_answers:[''],ignore_case:true,ignore_spaces:true,explanation:''});
const context=()=>({epoch:S.epoch,group:S.group?.id,user:uid()});
const current=c=>c.epoch===S.epoch&&c.group===S.group?.id&&c.user===uid()&&c.user===S.user;
function errorText(e){if(['PGRST202','42883','42P01'].includes(e?.code))return '퀴즈 서버 설정이 필요합니다. 패치의 01_GROUP_QUIZ.sql을 적용해 주세요.';return e?.message||'처리하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.';}
async function rpc(name,args){if(!uid()||!S.group)throw Error('그룹에 로그인한 뒤 이용해 주세요.');const client=typeof supabaseClient!=='undefined'?supabaseClient:null;if(!client?.rpc)throw Error('서버 연결을 확인해 주세요.');const {data,error}=await client.rpc(name,args);if(error)throw error;return data;}
function notice(message,bad=false){const box=$('#sgq76Notice');if(box){box.textContent=message;box.dataset.error=String(bad);box.hidden=!message;}}
function remember(){if(S.view!=='compose'||S.edit||!S.group||!uid()||S.user!==uid())return;try{localStorage.setItem(key(),JSON.stringify({cards:S.cards,publication:S.publication,updated_at:Date.now()}));}catch{notice('이 기기에서 임시저장을 할 수 없습니다. 페이지를 닫기 전에 출제해 주세요.',true);}}
function saved(){try{const d=JSON.parse(localStorage.getItem(key()));if(Array.isArray(d?.cards)&&d.cards.length&&d.cards.length<=30){S.publication=d.publication||null;return d.cards.map(c=>({...fresh(),...c}));}}catch{}return null;}
function mount(){
 const parent=$('#studyGroupDetail');if(!parent)return false;if($('#studyGroupQuiz76'))return true;
 const section=document.createElement('section');section.id='studyGroupQuiz76';section.setAttribute('aria-labelledby','sgq76Title');
 section.innerHTML=`<header class="sgq76-heading"><div><p class="sgq76-eyebrow">함께 만드는 문제은행</p><h3 id="sgq76Title">스터디 그룹 퀴즈</h3><p id="sgq76GroupName"></p></div><button type="button" data-q76="refresh" class="sgq76-secondary">새로고침</button></header>
 <div class="sgq76-overview"><div class="sgq76-actions"><button type="button" data-q76="compose" class="sgq76-action"><strong>문제 출제하기</strong><span>질문과 정답을 카드에 입력하세요</span></button><button type="button" data-q76="browse" class="sgq76-action"><strong>문제 풀기</strong><span>우리 그룹의 퀴즈에 도전하세요</span></button><p>이 그룹의 그룹원끼리 출제하고 풀이합니다.</p></div><aside class="sgq76-stats" aria-label="그룹원 누적 퀴즈 통계"><div class="sgq76-stats-heading"><h4>그룹원 누적 기록</h4><span>전체 기간</span></div><div class="sgq76-table-scroll"><table><thead><tr><th scope="col">그룹원</th><th scope="col">출제수</th><th scope="col">풀이수</th><th scope="col">정답률</th></tr></thead><tbody id="sgq76Stats"><tr><td colspan="4">불러오는 중…</td></tr></tbody></table></div><p>풀이수·정답률은 재풀이를 포함합니다. 수정·내린 문제의 기존 기록도 유지됩니다.</p></aside></div>
 <p id="sgq76Notice" role="status" aria-live="polite" hidden></p>
 <div id="sgq76Workspace"></div>`;
 parent.append(section);section.addEventListener('click',click);section.addEventListener('input',input);section.addEventListener('change',change);section.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-q76-answer]')){e.preventDefault();submitAnswer();}});return true;
}
function setGroup(group){
 if(S.group?.id===group?.id&&S.user===uid()){if(group)S.group=group;return;}
 remember();S.epoch++;S.serial++;S.group=group;S.user=uid();S.view='browse';S.cards=[];S.edit=null;S.session=[];S.cursor=0;S.questions=[];S.total=0;S.offset=0;S.filter='all';S.type='all';S.saving=false;S.publication=null;
 if(!group){$('#studyGroupQuiz76')?.remove();return;}if(!mount())return;
 $('#sgq76GroupName').textContent=group.name||'';$('#sgq76Stats').innerHTML='<tr><td colspan="4">불러오는 중…</td></tr>';notice('');renderBrowse(true);
}
async function refresh({quiet=false}={}){
 if(!S.group||!uid()||!mount())return;const c=context(),serial=++S.serial;
 if(!quiet&&S.view==='browse')renderBrowse(true);
 const results=await Promise.allSettled([rpc('study_group_quiz_stats76',{p_group_id:c.group}),rpc('study_group_quiz_list76',{p_group_id:c.group,p_filter:S.filter,p_type:S.type,p_limit:20,p_offset:S.offset})]);
 if(!current(c)||serial!==S.serial)return;
 const [stats,list]=results;
 if(stats.status==='fulfilled')renderStats(stats.value||[]);else $('#sgq76Stats').innerHTML='<tr><td colspan="4">'+esc(errorText(stats.reason))+'</td></tr>';
 if(list.status==='fulfilled'){S.questions=list.value?.questions||[];S.total=Number(list.value?.total)||0;if(S.offset&&S.offset>=S.total){S.offset=0;return refresh({quiet});}if(S.view==='browse')renderBrowse();}
 else {if(S.view==='browse')renderBrowse(false,errorText(list.reason));}
 if(stats.status==='rejected'||list.status==='rejected')notice(errorText(stats.reason||list.reason),true);
}
function renderStats(rows){$('#sgq76Stats').innerHTML=rows.length?rows.map(r=>`<tr><th scope="row">${esc(r.username)}${r.user_id===uid()?'<small>나</small>':''}</th><td>${Number(r.authored)||0}</td><td>${Number(r.attempts)||0}</td><td>${r.accuracy==null?'—':Number(r.accuracy).toFixed(1).replace(/\.0$/,'')+'%'}</td></tr>`).join(''):'<tr><td colspan="4">아직 그룹원이 없습니다.</td></tr>';}
function meta(q){return `<p class="sgq76-provenance">출제자 <strong>${esc(q.author_username)}</strong> · <time datetime="${esc(q.created_at)}">${esc(stamp(q.created_at))}</time>${Number(q.revision)>1?`<br><span>수정 ${esc(stamp(q.updated_at))} · 버전 ${Number(q.revision)}</span>`:''}</p>`;}
function selectOptions(selected,values){return values.map(([value,label])=>`<option value="${value}"${value===selected?' selected':''}>${label}</option>`).join('');}
function activateAction(compose){for(const b of document.querySelectorAll('#studyGroupQuiz76 .sgq76-actions>button'))b.setAttribute('aria-pressed',String((b.dataset.q76==='compose')===compose));}
function renderBrowse(loading=false,error=''){
 activateAction(false);
 const host=$('#sgq76Workspace');if(!host)return;
 host.innerHTML=`<div class="sgq76-browser"><div class="sgq76-toolbar"><label>문제 범위<select id="sgq76Filter">${selectOptions(S.filter,[['all','전체 문제'],['unseen','아직 안 푼 문제'],['wrong','마지막 풀이 오답'],['mine','내가 출제한 문제']])}</select></label><label>문제 유형<select id="sgq76Type">${selectOptions(S.type,[['all','모든 유형'],['short_answer','주관식'],['multiple_choice','객관식']])}</select></label><button type="button" data-q76="start" ${loading||!S.total?'disabled':''}>랜덤 10문항 풀기</button></div><p class="sgq76-muted">선택한 범위 ${S.total}문항 · 출제자가 수정한 문제는 새 버전으로 다시 풀 수 있습니다.</p>
 <div id="sgq76QuestionList">${loading?'<p class="sgq76-empty">문제를 불러오는 중…</p>':error?`<p class="sgq76-empty">${esc(error)}</p>`:!S.questions.length?'<div class="sgq76-empty"><p>이 범위에 문제가 없습니다.</p><button type="button" data-q76="compose">첫 문제 출제하기</button></div>':S.questions.map(q=>`<article class="sgq76-question-row"><div class="sgq76-row-text"><div class="sgq76-tags"><span>${q.question_type==='short_answer'?'주관식':'객관식'}</span>${q.my_attempted?`<span class="${q.my_is_correct?'sgq76-good':'sgq76-bad'}">최근 ${q.my_is_correct?'정답':'오답'}</span>`:'<span>미풀이</span>'}</div><h4>${esc(q.question)}</h4>${meta(q)}</div><div class="sgq76-row-buttons"><button type="button" data-q76="one" data-id="${q.id}">풀기</button>${q.author_id===uid()?`<button type="button" class="sgq76-secondary" data-q76="edit" data-id="${q.id}">수정</button>`:''}</div></article>`).join('')}</div>
 <nav class="sgq76-pagination" aria-label="퀴즈 목록 페이지"><button type="button" class="sgq76-secondary" data-q76="previous-page" ${!S.offset?'disabled':''}>이전</button><span>${Math.floor(S.offset/20)+1} / ${Math.max(1,Math.ceil(S.total/20))}</span><button type="button" class="sgq76-secondary" data-q76="next-page" ${S.offset+20>=S.total?'disabled':''}>다음</button></nav></div>`;
}
function compose(){remember();S.publication=null;S.cards=saved()||[fresh()];S.edit=null;S.view='compose';notice('');renderEditor();}
function cardMarkup(c,i){const mc=c.question_type==='multiple_choice';return `<article class="sgq76-editor-card" data-card="${i}"><header><strong>${S.edit?'문제 수정':'카드 '+(i+1)}</strong><div><button type="button" class="sgq76-text-button" data-q76="duplicate" data-card="${i}" ${S.edit||S.cards.length>=30?'disabled':''}>복제</button><button type="button" class="sgq76-text-button" data-q76="remove" data-card="${i}" ${S.edit||S.cards.length===1?'disabled':''}>삭제</button></div></header><label>문제 유형<select data-field="question_type">${selectOptions(c.question_type,[['short_answer','주관식'],['multiple_choice','객관식 (4지선다)']])}</select></label><label>질문<textarea data-field="question" maxlength="2000" rows="3" placeholder="그룹원에게 물어볼 내용을 입력하세요">${esc(c.question)}</textarea></label>
 ${mc?`<fieldset class="sgq76-choice-editor"><legend>보기와 정답 <span>정답 하나를 선택하세요</span></legend>${letters.map((a,j)=>`<div><label class="sgq76-radio-label"><input type="radio" name="sgq76-correct-${i}" data-field="correct_choice" value="${a}" ${c.correct_choice===a?'checked':''}><span>${a}</span></label><input type="text" data-field="choice" data-choice="${j}" maxlength="1000" aria-label="카드 ${i+1} ${a} 보기" placeholder="${a} 보기" value="${esc(c.choices?.[j]||'')}"></div>`).join('')}</fieldset>`:`<label>허용 정답<textarea data-field="accepted_answers" maxlength="40020" rows="3" placeholder="예: Air Traffic Control&#10;ATC">${esc((c.accepted_answers||['']).join('\n'))}</textarea><small>여러 정답은 한 줄에 하나씩 입력하세요. 최대 20개 중 하나와 일치하면 정답입니다.</small></label><div class="sgq76-toggles"><label><input type="checkbox" data-field="ignore_case" ${c.ignore_case?'checked':''}>영문 대소문자 무시</label><label><input type="checkbox" data-field="ignore_spaces" ${c.ignore_spaces?'checked':''}>띄어쓰기 무시</label></div>`}
 <label>해설 <span class="sgq76-optional">선택</span><textarea data-field="explanation" maxlength="4000" rows="2" placeholder="정답의 이유나 참고 내용을 적어 주세요">${esc(c.explanation)}</textarea></label></article>`;}
function renderEditor(){
 activateAction(true);
 const host=$('#sgq76Workspace');if(!host)return;
 host.innerHTML=`<div class="sgq76-editor"><div class="sgq76-subheading"><div><h4>${S.edit?'출제한 문제 수정':'새 퀴즈 만들기'}</h4><p>${S.edit?'저장하면 새 버전이 됩니다. 이전 풀이 기록과 누적 통계는 유지됩니다.':'카드를 추가해 여러 문제를 한 번에 출제할 수 있습니다. 입력 내용은 이 기기에 임시저장됩니다.'}</p></div><button type="button" class="sgq76-secondary" data-q76="preview">미리보기</button></div><div id="sgq76EditorCards">${S.cards.map(cardMarkup).join('')}</div>
 ${!S.edit?`<button type="button" class="sgq76-add" data-q76="add" ${S.cards.length>=30?'disabled':''}>+ 문제 카드 추가 (${S.cards.length}/30)</button><details class="sgq76-import"><summary>여러 주관식 문제를 붙여넣기</summary><label>질문과 정답 사이에 Tab을 넣고, 문제마다 줄을 바꾸세요.<textarea id="sgq76Paste" rows="4" placeholder="질문[TAB]정답"></textarea></label><button type="button" class="sgq76-secondary" data-q76="import">카드로 추가</button></details>`:''}
 <div class="sgq76-editor-footer"><span>${S.cards.length}문항${S.edit?'':' · 출제 전까지 다른 그룹원에게 보이지 않습니다.'}</span><div><button type="button" class="sgq76-secondary" data-q76="cancel">${S.edit?'수정 취소':'임시저장 후 목록'}</button><button type="button" data-q76="publish" ${S.saving?'disabled':''}>${S.saving?'저장 중…':S.edit?'수정 저장':'그룹에 출제하기'}</button></div></div>${S.edit?'<button type="button" class="sgq76-text-button sgq76-danger" data-q76="archive">이 문제 내리기</button>':''}</div>`;
}
function input(e){
 const field=e.target.dataset.field,article=e.target.closest('[data-card]');if(!field||!article||S.view!=='compose')return;const c=S.cards[Number(article.dataset.card)];if(!c)return;
 if(field==='choice')c.choices[Number(e.target.dataset.choice)]=e.target.value;
 else if(field==='accepted_answers')c.accepted_answers=e.target.value.split(/\r?\n/);
 else if(e.target.type==='checkbox')c[field]=e.target.checked;
 else c[field]=e.target.value;remember();
}
function change(e){
 if(e.target.id==='sgq76Filter'||e.target.id==='sgq76Type'){S[e.target.id==='sgq76Filter'?'filter':'type']=e.target.value;S.offset=0;notice('');refresh();return;}
 if(e.target.dataset.field){input(e);if(e.target.dataset.field==='question_type')renderEditor();}
}
function validate(cards){if(!cards.length||cards.length>30)throw Error('한 번에 1~30문항을 출제할 수 있습니다.');return cards.map((c,i)=>{if(!c.question.trim())throw Error(`${i+1}번 카드의 질문을 입력해 주세요.`);if(c.question.length>2000||c.explanation.length>4000)throw Error(`${i+1}번 카드의 글자 수를 확인해 주세요.`);const r={...c,question:c.question.trim()};if(c.question_type==='multiple_choice'){r.choices=c.choices.map(x=>x.trim());if(r.choices.some(x=>!x||x.length>1000))throw Error(`${i+1}번 카드에 보기 4개를 모두 입력해 주세요.`);if(new Set(r.choices.map(x=>x.normalize('NFKC').replace(/\s/g,''))).size<4)throw Error(`${i+1}번 카드의 보기가 중복됩니다.`);}else{r.accepted_answers=c.accepted_answers.map(x=>x.trim()).filter(Boolean);if(!r.accepted_answers.length||r.accepted_answers.length>20||r.accepted_answers.some(x=>x.length>2000))throw Error(`${i+1}번 카드의 정답을 1~20개, 각 2000자 이내로 입력해 주세요.`);}return r;});}
async function publish(){
 if(S.saving)return;let cards;try{cards=validate(S.cards);}catch(e){notice(e.message,true);$('#sgq76Notice')?.scrollIntoView({block:'nearest',behavior:'smooth'});return;}
 const c=context(),edit=S.edit;const serialized=JSON.stringify(cards);if(!edit&&(!S.publication||S.publication.serialized!==serialized)){S.publication={request:crypto.randomUUID(),serialized};remember();}S.saving=true;renderEditor();notice('');
 try{if(edit)await rpc('study_group_quiz_update76',{p_question_id:edit.id,p_expected_revision:edit.revision,p_question:cards[0]});else await rpc('study_group_quiz_create76',{p_group_id:c.group,p_questions:cards,p_request_id:S.publication.request});if(!current(c))return;
  if(!edit)try{localStorage.removeItem(key());}catch{}S.cards=[];S.edit=null;S.publication=null;S.view='browse';S.offset=0;notice(edit?'문제를 수정했습니다.':'그룹에 '+cards.length+'문항을 출제했습니다.');await refresh();
 }catch(e){if(current(c)){notice(errorText(e),true);renderEditor();}}
 finally{if(current(c)){S.saving=false;const b=$('[data-q76="publish"]');if(b){b.disabled=false;b.textContent=S.edit?'수정 저장':'그룹에 출제하기';}}}
}
async function editQuestion(id){const c=context();notice('');try{const q=await rpc('study_group_quiz_edit_load76',{p_question_id:id});if(!current(c))return;remember();S.edit={id:q.id,revision:q.revision};S.cards=[{...fresh(),...q}];S.view='compose';renderEditor();$('#sgq76Workspace').scrollIntoView({block:'start',behavior:'smooth'});}catch(e){if(current(c))notice(errorText(e),true);}}
async function archive(){if(!S.edit||S.saving)return;if(!confirm('이 문제를 목록에서 내릴까요? 누적 출제수와 기존 풀이 기록은 유지됩니다.'))return;const c=context();S.saving=true;try{await rpc('study_group_quiz_archive76',{p_question_id:S.edit.id,p_expected_revision:S.edit.revision});if(!current(c))return;S.edit=null;S.cards=[];S.view='browse';notice('문제를 목록에서 내렸습니다.');await refresh();}catch(e){if(current(c))notice(errorText(e),true);}finally{if(current(c))S.saving=false;}}
function preview(){try{const cards=validate(S.cards);let d=$('#sgq76Preview');if(!d){d=document.createElement('dialog');d.id='sgq76Preview';d.className='sgq76-preview';document.body.append(d);d.addEventListener('click',e=>{if(e.target.closest('[data-preview-close]'))d.close();});}d.innerHTML='<header><h3>출제 미리보기</h3><button type="button" data-preview-close>닫기</button></header><p>미리보기는 풀이수에 포함되지 않습니다.</p>'+cards.map((c,i)=>`<article><h4>${i+1}. ${esc(c.question)}</h4>${c.question_type==='multiple_choice'?c.choices.map((v,j)=>`<p>${letters[j]}. ${esc(v)}${letters[j]===c.correct_choice?' · 정답':''}</p>`).join(''):'<p>허용 정답: '+esc(c.accepted_answers.join(' / '))+'</p>'}<p>해설: ${esc(c.explanation||'없음')}</p></article>`).join('');d.showModal();}catch(e){notice(e.message,true);}}
async function start(ids=null){
 const c=context();notice('문제를 불러오는 중…');try{const args={p_group_id:c.group,p_limit:ids?ids.length:10,p_filter:ids?'all':S.filter,p_type:ids?'all':S.type};if(ids)args.p_ids=ids;const rows=await rpc('study_group_quiz_start76',args);if(!current(c))return;if(!rows?.length){notice('선택한 범위에 풀 수 있는 문제가 없습니다.');return;}remember();S.edit=null;S.session=rows.map(q=>({q,answer:'',request:null,result:null,busy:false,error:'',locked:false}));S.cursor=0;S.view='solve';notice('');renderSolver();$('#sgq76Workspace').scrollIntoView({block:'start',behavior:'smooth'});}catch(e){if(current(c))notice(errorText(e),true);}}
function renderSolver(){
 activateAction(false);
 const host=$('#sgq76Workspace'),item=S.session[S.cursor];if(!host||!item)return;const q=item.q,r=item.result,mc=q.question_type==='multiple_choice';
 host.innerHTML=`<div class="sgq76-solver"><div class="sgq76-solver-heading"><strong>${S.cursor+1} / ${S.session.length}문항</strong><button type="button" class="sgq76-secondary" data-q76="end">풀이 마치기</button></div><div class="sgq76-tags"><span>${mc?'객관식':'주관식'}</span></div><h4 class="sgq76-stem">${esc(q.question)}</h4>${meta(q)}
 <fieldset class="sgq76-answer-options" ${r||item.busy||item.locked||item.request?'disabled':''}><legend class="sgq76-sr-only">답 입력</legend>${mc?q.choices.map((text,i)=>`<label class="${r?(letters[i]===r.correct_choice?'sgq76-answer-correct':letters[i]===item.answer?'sgq76-answer-wrong':''):''}"><input type="radio" name="sgq76-answer" data-q76-choice value="${letters[i]}" ${item.answer===letters[i]?'checked':''}><span>${letters[i]}</span><strong>${esc(text)}</strong></label>`).join(''):`<label>정답<input type="text" data-q76-answer maxlength="2000" autocomplete="off" placeholder="정답을 입력하세요" value="${esc(item.answer)}"></label>`}</fieldset>
 ${r?`<div class="sgq76-feedback ${r.is_correct?'sgq76-good':'sgq76-bad'}" role="status"><strong>${r.is_correct?'정답입니다':'오답입니다'}</strong><p>내 답: ${esc(mc?item.answer+'. '+q.choices[letters.indexOf(item.answer)]:item.answer)}</p><p>정답: ${esc(mc?r.correct_choice+'. '+r.correct_answer:r.correct_answer)}</p>${r.explanation?`<p class="sgq76-explanation">${esc(r.explanation)}</p>`:''}</div>`:`<button type="button" data-q76="submit" ${item.busy||item.locked?'disabled':''}>${item.busy?'채점 중…':item.request?'같은 답 다시 제출':'정답 제출'}</button>`}
 ${item.error?`<p class="sgq76-inline-error" role="alert">${esc(item.error)}</p>`:''}${item.locked?'<button type="button" class="sgq76-secondary" data-q76="reload-question">최신 문제 다시 불러오기</button>':''}
 <div class="sgq76-solver-footer"><button type="button" class="sgq76-secondary" data-q76="prev-question" ${S.cursor===0||item.busy?'disabled':''}>이전 문제</button><span>${S.session.filter(x=>x.result).length}문항 제출</span><button type="button" data-q76="next-question" ${item.busy?'disabled':''}>${S.cursor===S.session.length-1?'결과 보기':'다음 문제'}</button></div></div>`;
 const a=$('[data-q76-answer]');if(a&&!r&&!item.request)a.focus({preventScroll:true});
}
async function submitAnswer(){
 if(S.view!=='solve')return;const item=S.session[S.cursor];if(!item||item.busy||item.result||item.locked)return;
 if(!item.request){item.answer=item.q.question_type==='multiple_choice'?$('input[data-q76-choice]:checked')?.value||'':$('[data-q76-answer]')?.value||'';item.answer=item.answer.trim();}
 if(!item.answer){item.error='답을 입력하거나 보기 하나를 선택해 주세요.';renderSolver();return;}
 if(!item.request)item.request=crypto.randomUUID();const c=context();item.busy=true;item.error='';renderSolver();
 try{const result=await rpc('study_group_quiz_answer76',{p_question_id:item.q.id,p_expected_revision:item.q.revision,p_answer:item.answer,p_request_id:item.request});if(!current(c))return;item.result=result;notice('');refresh({quiet:true});}
 catch(e){if(!current(c))return;item.error=errorText(e);item.locked=['40001','P0002','42501'].includes(e?.code);if(!item.locked)item.error+=' 같은 답으로 다시 제출하면 중복 집계되지 않습니다.';}
 finally{if(current(c)){item.busy=false;if(S.view==='solve'&&S.session[S.cursor]===item)renderSolver();}}
}
async function reloadQuestion(){const item=S.session[S.cursor];if(!item)return;const c=context();try{const rows=await rpc('study_group_quiz_start76',{p_group_id:c.group,p_limit:1,p_filter:'all',p_type:'all',p_ids:[item.q.id]});if(!current(c))return;if(!rows?.length){notice('출제자가 내린 문제입니다. 다른 문제를 선택해 주세요.',true);return;}S.session[S.cursor]={q:rows[0],answer:'',request:null,result:null,busy:false,error:'',locked:false};renderSolver();}catch(e){if(current(c))notice(errorText(e),true);}}
function finish(){S.view='result';const submitted=S.session.filter(x=>x.result),correct=submitted.filter(x=>x.result.is_correct).length,wrong=submitted.length-correct;$('#sgq76Workspace').innerHTML=`<div class="sgq76-result"><h4>이번 퀴즈 결과</h4><strong>${correct} / ${submitted.length} 정답</strong><p>${S.session.length}문항 중 ${submitted.length}문항 제출 · 미제출 ${S.session.length-submitted.length}문항</p><p>정답률 ${submitted.length?Math.round(correct/submitted.length*100)+'%':'—'}</p><div><button type="button" data-q76="retry-wrong" ${!wrong?'disabled':''}>이번 오답 ${wrong}문항 다시 풀기</button><button type="button" class="sgq76-secondary" data-q76="browse">문제 목록</button></div></div>`;refresh({quiet:true});}
async function click(e){
 const b=e.target.closest('[data-q76]');if(!b||b.disabled||!S.group)return;const a=b.dataset.q76,i=Number(b.dataset.card);if(S.saving&&['compose','browse','edit','cancel','add','remove','duplicate','import'].includes(a))return;
 switch(a){
 case 'refresh':notice('');refresh();break;
 case 'compose':compose();break;
 case 'browse':remember();S.view='browse';S.edit=null;notice('');refresh();break;
 case 'cancel':remember();S.edit=null;S.view='browse';notice('');refresh();break;
 case 'add':if(S.cards.length<30){S.cards.push(fresh());remember();renderEditor();$('#sgq76EditorCards')?.lastElementChild?.scrollIntoView({block:'nearest',behavior:'smooth'});}break;
 case 'duplicate':if(S.cards.length<30&&S.cards[i]){S.cards.splice(i+1,0,JSON.parse(JSON.stringify(S.cards[i])));remember();renderEditor();}break;
 case 'remove':if(S.cards.length>1){S.cards.splice(i,1);remember();renderEditor();}break;
 case 'import':{const lines=($('#sgq76Paste')?.value||'').split(/\r?\n/).filter(x=>x.trim());const cards=lines.map(line=>{const [q,...parts]=line.split('\t');return {...fresh(),question:q.trim(),accepted_answers:[parts.join('\t').trim()]};});if(!cards.length||cards.some(c=>!c.question||!c.accepted_answers[0])){notice('각 줄에 질문, Tab, 정답을 입력해 주세요.',true);break;}const initial=S.cards.length===1&&!S.cards[0].question.trim()&&!S.cards[0].accepted_answers.some(x=>x.trim())?[]:S.cards;if(initial.length+cards.length>30){notice('최대 30문항까지 추가할 수 있습니다.',true);break;}S.cards=initial.concat(cards);remember();renderEditor();notice(cards.length+'개 카드를 추가했습니다.');break;}
 case 'preview':preview();break;case 'publish':publish();break;case 'archive':archive();break;case 'edit':editQuestion(b.dataset.id);break;
 case 'start':start();break;case 'one':start([b.dataset.id]);break;
 case 'previous-page':S.offset=Math.max(0,S.offset-20);refresh();break;case 'next-page':S.offset+=20;refresh();break;
 case 'submit':submitAnswer();break;case 'reload-question':reloadQuestion();break;
 case 'prev-question':if(S.cursor>0){cacheAnswer();S.cursor--;renderSolver();}break;
 case 'next-question':cacheAnswer();if(S.cursor<S.session.length-1){S.cursor++;renderSolver();}else finish();break;
 case 'end':if(!S.session.some(x=>x.busy))finish();break;
 case 'retry-wrong':start(S.session.filter(x=>x.result&&!x.result.is_correct).map(x=>x.q.id));break;
 }
}
function cacheAnswer(){const item=S.session[S.cursor];if(!item||item.result||item.request)return;item.answer=item.q.question_type==='multiple_choice'?$('input[data-q76-choice]:checked')?.value||'':$('[data-q76-answer]')?.value||'';}
window.PilotBankGroupQuiz76={setGroup,refresh,mount};
window.addEventListener('pagehide',remember);
try{if(typeof supabaseClient!=='undefined')supabaseClient.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||(session?.user?.id&&session.user.id!==S.user)){setGroup(null);$('#sgq76Preview')?.remove();}});}catch{}
})();
