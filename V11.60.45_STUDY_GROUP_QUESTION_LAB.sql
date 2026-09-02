-- PilotBank v11.60.45
-- Study Group Question Lab: create / solve / comment / question-creation goal
-- Apply after the existing v11.59.3 study-group schema (included in v11.60.x deployments).
-- Safe to re-run.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Question creation goal type
-- ------------------------------------------------------------
alter table if exists public.study_group_goals
  drop constraint if exists study_group_goals_goal_type_check;
alter table if exists public.study_group_goals
  add constraint study_group_goals_goal_type_check
  check (goal_type in ('study_time','theory_stage','questions','question_create'));

-- ------------------------------------------------------------
-- 2) Group-created questions, attempts, and question comments
-- ------------------------------------------------------------
create table if not exists public.study_group_questions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(btrim(question)) between 1 and 2000),
  choice_a text not null check (char_length(btrim(choice_a)) between 1 and 1000),
  choice_b text not null check (char_length(btrim(choice_b)) between 1 and 1000),
  choice_c text not null check (char_length(btrim(choice_c)) between 1 and 1000),
  choice_d text not null check (char_length(btrim(choice_d)) between 1 and 1000),
  correct_choice text not null check (correct_choice in ('A','B','C','D')),
  explanation text not null default '' check (char_length(explanation) <= 4000),
  tag text not null default '' check (char_length(tag) <= 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists study_group_questions_group_created_idx on public.study_group_questions(group_id, created_at desc);
create index if not exists study_group_questions_author_created_idx on public.study_group_questions(author_id, created_at desc);

create table if not exists public.study_group_question_attempts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.study_group_questions(id) on delete cascade,
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_choice text not null check (selected_choice in ('A','B','C','D')),
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);
create index if not exists study_group_question_attempts_user_idx on public.study_group_question_attempts(user_id, answered_at desc);
create index if not exists study_group_question_attempts_question_idx on public.study_group_question_attempts(question_id, answered_at desc);

create table if not exists public.study_group_question_comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.study_group_questions(id) on delete cascade,
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists study_group_question_comments_question_idx on public.study_group_question_comments(question_id, created_at);

alter table public.study_group_questions enable row level security;
alter table public.study_group_question_attempts enable row level security;
alter table public.study_group_question_comments enable row level security;
revoke all on public.study_group_questions, public.study_group_question_attempts, public.study_group_question_comments from anon, authenticated;

-- ------------------------------------------------------------
-- 3) RPC API
-- ------------------------------------------------------------
create or replace function public.study_group_question_create(
  p_group_id uuid, p_question text, p_choice_a text, p_choice_b text,
  p_choice_c text, p_choice_d text, p_correct_choice text,
  p_explanation text default '', p_tag text default ''
) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid; v_correct text:=upper(btrim(coalesce(p_correct_choice,'')));
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  if v_correct not in ('A','B','C','D') then raise exception 'Correct choice must be A, B, C, or D'; end if;
  insert into public.study_group_questions(group_id,author_id,question,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation,tag)
  values(p_group_id,auth.uid(),left(btrim(p_question),2000),left(btrim(p_choice_a),1000),left(btrim(p_choice_b),1000),left(btrim(p_choice_c),1000),left(btrim(p_choice_d),1000),v_correct,left(coalesce(p_explanation,''),4000),left(btrim(coalesce(p_tag,'')),80))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.study_group_questions(p_group_id uuid,p_limit integer default 100,p_offset integer default 0)
returns table(question_id uuid,question text,choice_a text,choice_b text,choice_c text,choice_d text,tag text,author_id uuid,author_username text,created_at timestamptz,comment_count bigint,attempt_count bigint,my_attempted boolean,my_selected_choice text,my_correct_choice text,my_is_correct boolean,my_explanation text,can_delete boolean)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  return query
  select q.id,q.question,q.choice_a,q.choice_b,q.choice_c,q.choice_d,q.tag,q.author_id,
    coalesce(nullif(btrim(p.username),''),split_part(coalesce(p.email,''),'@',1),'회원')::text,
    q.created_at,coalesce(cc.cnt,0),coalesce(ac.cnt,0),(ma.id is not null),ma.selected_choice,
    case when ma.id is not null then q.correct_choice else null end,
    ma.is_correct,
    case when ma.id is not null then q.explanation else null end,
    (q.author_id=auth.uid() or public.study_group_is_leader(q.group_id,auth.uid()))
  from public.study_group_questions q
  left join public.profiles p on p.id=q.author_id
  left join lateral(select count(*)::bigint cnt from public.study_group_question_comments c where c.question_id=q.id) cc on true
  left join lateral(select count(*)::bigint cnt from public.study_group_question_attempts a where a.question_id=q.id) ac on true
  left join lateral(select a.id,a.selected_choice,a.is_correct from public.study_group_question_attempts a where a.question_id=q.id and a.user_id=auth.uid() order by a.answered_at desc,a.id desc limit 1) ma on true
  where q.group_id=p_group_id and q.is_active
  order by q.created_at desc,q.id desc
  limit greatest(1,least(coalesce(p_limit,100),500)) offset greatest(coalesce(p_offset,0),0);
end $$;

create or replace function public.study_group_question_answer(p_question_id uuid,p_selected_choice text)
returns table(selected_choice text,correct_choice text,is_correct boolean,explanation text)
language plpgsql security definer set search_path=public,pg_temp as $$
declare q public.study_group_questions%rowtype; v_selected text:=upper(btrim(coalesce(p_selected_choice,''))); v_correct boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into q from public.study_group_questions where id=p_question_id and is_active;
  if q.id is null then raise exception 'Question not found'; end if;
  if not public.study_group_is_member(q.group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  if v_selected not in ('A','B','C','D') then raise exception 'Selected choice must be A, B, C, or D'; end if;
  v_correct := (v_selected=q.correct_choice);
  insert into public.study_group_question_attempts(question_id,group_id,user_id,selected_choice,is_correct) values(q.id,q.group_id,auth.uid(),v_selected,v_correct);
  return query select v_selected,q.correct_choice,v_correct,q.explanation;
end $$;

create or replace function public.study_group_question_delete(p_question_id uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare q public.study_group_questions%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into q from public.study_group_questions where id=p_question_id;
  if q.id is null then return; end if;
  if q.author_id<>auth.uid() and not public.study_group_is_leader(q.group_id,auth.uid()) then raise exception 'Question delete access required'; end if;
  delete from public.study_group_questions where id=p_question_id;
end $$;

create or replace function public.study_group_question_comments(p_question_id uuid)
returns table(comment_id uuid,author_id uuid,author_username text,content text,created_at timestamptz,can_delete boolean)
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_group_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select group_id into v_group_id from public.study_group_questions where id=p_question_id and is_active;
  if v_group_id is null then raise exception 'Question not found'; end if;
  if not public.study_group_is_member(v_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  return query select c.id,c.author_id,coalesce(nullif(btrim(p.username),''),split_part(coalesce(p.email,''),'@',1),'회원')::text,c.content,c.created_at,(c.author_id=auth.uid() or public.study_group_is_leader(c.group_id,auth.uid())) from public.study_group_question_comments c left join public.profiles p on p.id=c.author_id where c.question_id=p_question_id order by c.created_at,c.id;
end $$;

create or replace function public.study_group_question_comment_create(p_question_id uuid,p_content text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_group_id uuid;v_id uuid;v_content text:=left(btrim(coalesce(p_content,'')),2000);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select group_id into v_group_id from public.study_group_questions where id=p_question_id and is_active;
  if v_group_id is null then raise exception 'Question not found'; end if;
  if not public.study_group_is_member(v_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  if v_content='' then raise exception 'Comment is required'; end if;
  insert into public.study_group_question_comments(question_id,group_id,author_id,content) values(p_question_id,v_group_id,auth.uid(),v_content) returning id into v_id;return v_id;
end $$;

create or replace function public.study_group_question_comment_delete(p_comment_id uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare c public.study_group_question_comments%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into c from public.study_group_question_comments where id=p_comment_id;
  if c.id is null then return; end if;
  if c.author_id<>auth.uid() and not public.study_group_is_leader(c.group_id,auth.uid()) then raise exception 'Comment delete access required'; end if;
  delete from public.study_group_question_comments where id=p_comment_id;
end $$;

-- ------------------------------------------------------------
-- 4) Dashboard v2: include question_create goal progress
-- ------------------------------------------------------------
create or replace function public.study_group_dashboard_v2(p_group_id uuid, p_goal_date date)
returns table (user_id uuid,username text,is_leader boolean,study_seconds bigint,question_count bigint,goals_total integer,goals_done integer,all_done boolean,goal_results jsonb)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  if p_goal_date is null then raise exception 'Goal date is required'; end if;
  return query
  with member_rows as (
    select m.user_id,(sg.owner_id=m.user_id) leader,coalesce(nullif(btrim(p.username),''),split_part(coalesce(p.email,''),'@',1),'회원')::text display_name
    from public.study_group_members m join public.study_groups sg on sg.id=m.group_id and sg.is_active left join public.profiles p on p.id=m.user_id where m.group_id=p_group_id
  ),time_stats as (
    select t.user_id,coalesce(sum(t.active_seconds),0)::bigint seconds from public.user_study_time_daily t where t.study_date=p_goal_date and exists(select 1 from member_rows mr where mr.user_id=t.user_id) group by t.user_id
  ),question_stats as (
    select a.user_id,count(*)::bigint cnt from public.user_attempts a where (a.answered_at at time zone 'Asia/Seoul')::date=p_goal_date and exists(select 1 from member_rows mr where mr.user_id=a.user_id) group by a.user_id
  ),create_stats as (
    select q.author_id user_id,count(*)::bigint cnt from public.study_group_questions q where q.group_id=p_group_id and q.is_active and (q.created_at at time zone 'Asia/Seoul')::date=p_goal_date group by q.author_id
  )
  select mr.user_id,mr.display_name,mr.leader,coalesce(ts.seconds,0)::bigint,coalesce(qs.cnt,0)::bigint,coalesce(gr.total_goals,0)::integer,coalesce(gr.done_goals,0)::integer,(coalesce(gr.total_goals,0)>0 and coalesce(gr.done_goals,0)=coalesce(gr.total_goals,0))::boolean,coalesce(gr.results,'[]'::jsonb)
  from member_rows mr left join time_stats ts on ts.user_id=mr.user_id left join question_stats qs on qs.user_id=mr.user_id left join create_stats cs on cs.user_id=mr.user_id
  left join lateral (
    select count(*)::integer total_goals,count(*) filter(where x.done)::integer done_goals,jsonb_agg(jsonb_build_object('goal_id',x.goal_id,'goal_type',x.goal_type,'title',x.title,'note',x.note,'target_study_minutes',x.target_study_minutes,'target_subject',x.target_subject,'target_stage_order',x.target_stage_order,'target_questions',x.target_questions,'current_value',x.current_value,'done',x.done) order by x.sort_order,x.created_at,x.goal_id) results
    from (
      select g.id goal_id,g.goal_type,g.title,g.note,g.target_study_minutes,g.target_subject,g.target_stage_order,g.target_questions,g.sort_order,g.created_at,
        case when g.goal_type='study_time' then coalesce(ts.seconds,0) when g.goal_type='questions' then coalesce(qs.cnt,0) when g.goal_type='question_create' then coalesce(cs.cnt,0) when g.goal_type='theory_stage' then coalesce(th.passed_count,0) else 0 end::bigint current_value,
        case when g.goal_type='study_time' then coalesce(ts.seconds,0)>=g.target_study_minutes*60 when g.goal_type='questions' then coalesce(qs.cnt,0)>=g.target_questions when g.goal_type='question_create' then coalesce(cs.cnt,0)>=g.target_questions when g.goal_type='theory_stage' then coalesce(th.passed_count,0)>=coalesce(g.target_stage_order,0) else false end::boolean done
      from public.study_group_goals g left join lateral(select count(*) filter(where tp.passed)::bigint passed_count from public.user_theory_progress tp where tp.user_id=mr.user_id and tp.storage_key=public.study_group_theory_storage_key(g.target_subject)) th on true
      where g.group_id=p_group_id and g.goal_date=p_goal_date
    ) x
  ) gr on true order by mr.leader desc,lower(mr.display_name);
end $$;

-- Allow direct goal editor writes for the new goal type under existing leader-only policies.
-- Existing insert/update RLS policies remain valid because they test group leadership, not goal_type.

do $$ begin
  if to_regclass('public.study_group_goals') is not null then
    update public.study_group_goals set updated_at=updated_at where false;
  end if;
end $$;

revoke all on function public.study_group_question_create(uuid,text,text,text,text,text,text,text,text) from public,anon;
revoke all on function public.study_group_questions(uuid,integer,integer) from public,anon;
revoke all on function public.study_group_question_answer(uuid,text) from public,anon;
revoke all on function public.study_group_question_delete(uuid) from public,anon;
revoke all on function public.study_group_question_comments(uuid) from public,anon;
revoke all on function public.study_group_question_comment_create(uuid,text) from public,anon;
revoke all on function public.study_group_question_comment_delete(uuid) from public,anon;
grant execute on function public.study_group_question_create(uuid,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.study_group_questions(uuid,integer,integer) to authenticated;
grant execute on function public.study_group_question_answer(uuid,text) to authenticated;
grant execute on function public.study_group_question_delete(uuid) to authenticated;
grant execute on function public.study_group_question_comments(uuid) to authenticated;
grant execute on function public.study_group_question_comment_create(uuid,text) to authenticated;
grant execute on function public.study_group_question_comment_delete(uuid) to authenticated;
grant execute on function public.study_group_dashboard_v2(uuid,date) to authenticated;
