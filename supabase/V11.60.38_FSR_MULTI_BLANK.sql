-- PilotBank v11.60.38
-- FSR 발췌형 주관식: 한 문제에 여러 빈칸 지원
-- v11.60.37 SQL 적용 후 실행. 기존 단일 빈칸 문제는 그대로 호환됨.

begin;

alter table public.reference_fill_questions
  add column if not exists blanks jsonb not null default '[]'::jsonb;

create or replace function public.pilotbank_fsr_create_question_v2(
  p_source_key text,
  p_section_code text,
  p_section_title text,
  p_chapter text,
  p_page_start integer,
  p_page_end integer,
  p_excerpt_text text,
  p_prompt_text text,
  p_blanks jsonb
)
returns uuid
language plpgsql security definer set search_path=public,pg_temp
as $$
declare v_id uuid; v_answer_text text;
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then raise exception 'Reviewer access required'; end if;
  if btrim(coalesce(p_source_key,''))='' or btrim(coalesce(p_section_code,''))='' then raise exception 'Source/section required'; end if;
  if char_length(btrim(coalesce(p_excerpt_text,'')))<5 then raise exception 'Excerpt required'; end if;
  if p_blanks is null or jsonb_typeof(p_blanks)<>'array' or jsonb_array_length(p_blanks)<1 then raise exception 'At least one blank required'; end if;
  if exists(select 1 from jsonb_array_elements(p_blanks) b where btrim(coalesce(b->>'answer',''))='') then raise exception 'Blank answer required'; end if;
  select string_agg(b->>'answer',' | ' order by ord) into v_answer_text
  from jsonb_array_elements(p_blanks) with ordinality x(b,ord);
  insert into public.reference_fill_questions(source_key,section_code,section_title,chapter,page_start,page_end,excerpt_text,prompt_text,answer_text,accepted_answers,blanks,author_id)
  values(btrim(p_source_key),btrim(p_section_code),coalesce(p_section_title,''),coalesce(p_chapter,''),p_page_start,p_page_end,btrim(p_excerpt_text),btrim(p_prompt_text),v_answer_text,'[]'::jsonb,p_blanks,auth.uid())
  returning id into v_id;
  return v_id;
end;$$;

create or replace function public.pilotbank_fsr_list_questions_v2(p_source_key text,p_author_id uuid)
returns table(id uuid,section_code text,section_title text,chapter text,page_start integer,page_end integer,prompt_text text,blanks jsonb,created_at timestamptz)
language sql stable security definer set search_path=public,pg_temp as $$
  select q.id,q.section_code,q.section_title,q.chapter,q.page_start,q.page_end,q.prompt_text,
    case when jsonb_typeof(q.blanks)='array' and jsonb_array_length(q.blanks)>0 then q.blanks
         else jsonb_build_array(jsonb_build_object('order',1,'answer',q.answer_text,'accepted_answers',q.accepted_answers)) end,
    q.created_at
  from public.reference_fill_questions q
  where q.source_key=p_source_key and q.author_id=p_author_id and q.is_active
  order by q.section_code,q.created_at,q.id;
$$;

create or replace function public.pilotbank_fsr_list_my_questions_v2(p_source_key text)
returns table(id uuid,section_code text,section_title text,prompt_text text,answer_text text,blanks jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then raise exception 'Reviewer access required'; end if;
  return query select q.id,q.section_code,q.section_title,q.prompt_text,q.answer_text,
    case when jsonb_typeof(q.blanks)='array' and jsonb_array_length(q.blanks)>0 then q.blanks
         else jsonb_build_array(jsonb_build_object('order',1,'answer',q.answer_text,'accepted_answers',q.accepted_answers)) end,
    q.created_at
  from public.reference_fill_questions q
  where q.source_key=p_source_key and q.author_id=auth.uid() and q.is_active
  order by q.created_at desc;
end;$$;

create or replace function public.pilotbank_fsr_check_answers(p_question_id uuid,p_answers text[])
returns table(is_correct boolean,canonical_answers jsonb,excerpt_text text,result_details jsonb)
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare q public.reference_fill_questions%rowtype; bs jsonb; b jsonb; idx int:=0; inp text; canon text; accepted jsonb; one_ok boolean; all_ok boolean:=true; details jsonb:='[]'::jsonb; cans jsonb:='[]'::jsonb;
begin
  select * into q from public.reference_fill_questions where id=p_question_id and is_active;
  if not found then raise exception 'Question not found'; end if;
  if jsonb_typeof(q.blanks)='array' and jsonb_array_length(q.blanks)>0 then bs=q.blanks;
  else bs=jsonb_build_array(jsonb_build_object('order',1,'answer',q.answer_text,'accepted_answers',q.accepted_answers)); end if;
  if coalesce(array_length(p_answers,1),0) <> jsonb_array_length(bs) then raise exception 'Answer count mismatch'; end if;
  for b in select value from jsonb_array_elements(bs) loop
    idx:=idx+1; inp:=coalesce(p_answers[idx],''); canon:=coalesce(b->>'answer',''); accepted:=coalesce(b->'accepted_answers','[]'::jsonb);
    one_ok=(public.pilotbank_fsr_normalize_answer(inp)=public.pilotbank_fsr_normalize_answer(canon)) or exists(select 1 from jsonb_array_elements_text(accepted) a where public.pilotbank_fsr_normalize_answer(inp)=public.pilotbank_fsr_normalize_answer(a));
    if not one_ok then all_ok:=false; end if;
    cans:=cans||jsonb_build_array(canon);
    details:=details||jsonb_build_array(jsonb_build_object('order',idx,'correct',one_ok,'answer',canon));
  end loop;
  return query select all_ok,cans,q.excerpt_text,details;
end;$$;

grant execute on function public.pilotbank_fsr_create_question_v2(text,text,text,text,integer,integer,text,text,jsonb) to authenticated;
grant execute on function public.pilotbank_fsr_list_questions_v2(text,uuid) to authenticated;
grant execute on function public.pilotbank_fsr_list_my_questions_v2(text) to authenticated;
grant execute on function public.pilotbank_fsr_check_answers(uuid,text[]) to authenticated;

commit;
