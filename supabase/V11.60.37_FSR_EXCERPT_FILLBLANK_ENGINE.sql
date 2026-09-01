-- PilotBank v11.60.37
-- 고정익항공기 운항기술기준 · 발췌형 빈칸/단답형 출제 엔진
-- v11.60.30의 profiles.is_subadmin / pilotbank_is_reviewer()가 적용된 DB를 기준으로 함.
-- 승인 워크플로 없음: 관리자/부관리자가 저장하면 즉시 학습자 출제자별 문제집에 공개됨.

begin;
create extension if not exists pgcrypto;

create table if not exists public.reference_fill_questions (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  section_code text not null,
  section_title text not null default '',
  chapter text not null default '',
  page_start integer,
  page_end integer,
  excerpt_text text not null check (char_length(btrim(excerpt_text)) >= 5),
  prompt_text text not null check (char_length(btrim(prompt_text)) >= 5),
  answer_text text not null check (char_length(btrim(answer_text)) >= 1),
  accepted_answers jsonb not null default '[]'::jsonb check (jsonb_typeof(accepted_answers)='array'),
  author_id uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reference_fill_questions_source_author_idx on public.reference_fill_questions(source_key,author_id,created_at);
create index if not exists reference_fill_questions_source_section_idx on public.reference_fill_questions(source_key,section_code);

alter table public.reference_fill_questions enable row level security;
revoke all on public.reference_fill_questions from anon, authenticated;

create or replace function public.pilotbank_fsr_normalize_answer(p_text text)
returns text language sql immutable as $$
  select regexp_replace(lower(btrim(coalesce(p_text,''))), '[[:space:]]+', '', 'g');
$$;

create or replace function public.pilotbank_fsr_create_question(
  p_source_key text,
  p_section_code text,
  p_section_title text,
  p_chapter text,
  p_page_start integer,
  p_page_end integer,
  p_excerpt_text text,
  p_prompt_text text,
  p_answer_text text,
  p_accepted_answers text[] default array[]::text[]
)
returns uuid
language plpgsql security definer set search_path=public,pg_temp
as $$
declare v_id uuid; v_answers jsonb;
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then raise exception 'Reviewer access required'; end if;
  if btrim(coalesce(p_source_key,''))='' or btrim(coalesce(p_section_code,''))='' then raise exception 'Source/section required'; end if;
  if char_length(btrim(coalesce(p_excerpt_text,'')))<5 or char_length(btrim(coalesce(p_answer_text,'')))<1 then raise exception 'Excerpt/answer required'; end if;
  if position(btrim(p_answer_text) in p_excerpt_text)=0 then raise exception 'Answer must be selected from excerpt text'; end if;
  v_answers=to_jsonb(coalesce(p_accepted_answers,array[]::text[]));
  insert into public.reference_fill_questions(source_key,section_code,section_title,chapter,page_start,page_end,excerpt_text,prompt_text,answer_text,accepted_answers,author_id)
  values(btrim(p_source_key),btrim(p_section_code),coalesce(p_section_title,''),coalesce(p_chapter,''),p_page_start,p_page_end,btrim(p_excerpt_text),btrim(p_prompt_text),btrim(p_answer_text),v_answers,auth.uid())
  returning id into v_id;
  return v_id;
end;$$;

create or replace function public.pilotbank_fsr_list_authors(p_source_key text)
returns table(author_id uuid, author_name text, question_count bigint)
language sql stable security definer set search_path=public,pg_temp as $$
  select q.author_id,
         coalesce(nullif(btrim(p.username),''),nullif(btrim(p.email),''),'출제자')::text as author_name,
         count(*)::bigint
  from public.reference_fill_questions q
  left join public.profiles p on p.id=q.author_id
  where q.source_key=p_source_key and q.is_active
  group by q.author_id,p.username,p.email
  order by count(*) desc, author_name asc;
$$;

create or replace function public.pilotbank_fsr_list_questions(p_source_key text,p_author_id uuid)
returns table(id uuid,section_code text,section_title text,chapter text,page_start integer,page_end integer,prompt_text text,created_at timestamptz)
language sql stable security definer set search_path=public,pg_temp as $$
  select q.id,q.section_code,q.section_title,q.chapter,q.page_start,q.page_end,q.prompt_text,q.created_at
  from public.reference_fill_questions q
  where q.source_key=p_source_key and q.author_id=p_author_id and q.is_active
  order by q.section_code,q.created_at,q.id;
$$;

create or replace function public.pilotbank_fsr_check_answer(p_question_id uuid,p_answer text)
returns table(is_correct boolean,canonical_answer text,excerpt_text text)
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare q public.reference_fill_questions%rowtype; norm text; ok boolean;
begin
  select * into q from public.reference_fill_questions where id=p_question_id and is_active;
  if not found then raise exception 'Question not found'; end if;
  norm=public.pilotbank_fsr_normalize_answer(p_answer);
  ok=(norm=public.pilotbank_fsr_normalize_answer(q.answer_text)) or exists(
    select 1 from jsonb_array_elements_text(q.accepted_answers) a where norm=public.pilotbank_fsr_normalize_answer(a)
  );
  return query select ok,q.answer_text,q.excerpt_text;
end;$$;

create or replace function public.pilotbank_fsr_list_my_questions(p_source_key text)
returns table(id uuid,section_code text,section_title text,prompt_text text,answer_text text,created_at timestamptz)
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then raise exception 'Reviewer access required'; end if;
  return query select q.id,q.section_code,q.section_title,q.prompt_text,q.answer_text,q.created_at
  from public.reference_fill_questions q where q.source_key=p_source_key and q.author_id=auth.uid() and q.is_active order by q.created_at desc;
end;$$;

create or replace function public.pilotbank_fsr_delete_question(p_question_id uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare owner uuid; admin_flag boolean;
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then raise exception 'Reviewer access required'; end if;
  select author_id into owner from public.reference_fill_questions where id=p_question_id and is_active;
  if owner is null then return false; end if;
  select coalesce(is_admin,false) into admin_flag from public.profiles where id=auth.uid();
  if owner<>auth.uid() and not coalesce(admin_flag,false) then raise exception 'Only the author or an admin can delete this question'; end if;
  update public.reference_fill_questions set is_active=false,updated_at=now() where id=p_question_id;
  return true;
end;$$;

grant execute on function public.pilotbank_fsr_list_authors(text) to authenticated;
grant execute on function public.pilotbank_fsr_list_questions(text,uuid) to authenticated;
grant execute on function public.pilotbank_fsr_check_answer(uuid,text) to authenticated;
grant execute on function public.pilotbank_fsr_create_question(text,text,text,text,integer,integer,text,text,text,text[]) to authenticated;
grant execute on function public.pilotbank_fsr_list_my_questions(text) to authenticated;
grant execute on function public.pilotbank_fsr_delete_question(uuid) to authenticated;
commit;
