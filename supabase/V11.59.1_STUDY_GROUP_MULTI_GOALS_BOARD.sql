-- Aviation Question Bank v11.59.1
-- Study Group multi-goals + group board migration
-- Run AFTER V11.59_STUDY_GROUP.sql in Supabase SQL Editor.
-- Safe to re-run: DDL is idempotent and legacy-goal migration is conflict-safe.

create extension if not exists pgcrypto;

-- ============================================================
-- 1) Multiple daily goals
-- ============================================================

create table if not exists public.study_group_goals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  goal_date date not null,
  goal_type text not null check (goal_type in ('study_time','theory_stage','questions')),
  title text not null default '' check (char_length(title) <= 120),
  target_study_minutes integer not null default 0 check (target_study_minutes between 0 and 1440),
  target_subject text,
  target_stage_order integer check (target_stage_order is null or target_stage_order >= 1),
  target_questions integer not null default 0 check (target_questions between 0 and 10000),
  note text not null default '' check (char_length(note) <= 500),
  sort_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  source_daily_goal_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_daily_goal_id, goal_type)
);

create index if not exists study_group_goals_group_date_idx
  on public.study_group_goals(group_id, goal_date, sort_order, created_at);

-- Preserve any v11.59.0 single-row goals by splitting them into independent goals.
insert into public.study_group_goals(
  group_id, goal_date, goal_type, title, target_study_minutes,
  target_subject, target_stage_order, target_questions, note,
  sort_order, created_by, source_daily_goal_id, created_at, updated_at
)
select
  g.group_id, g.goal_date, 'study_time', '공부시간', g.target_study_minutes,
  null, null, 0, g.note,
  10, g.created_by, g.id, g.created_at, g.updated_at
from public.study_group_daily_goals g
where g.target_study_minutes > 0
on conflict (source_daily_goal_id, goal_type) do nothing;

insert into public.study_group_goals(
  group_id, goal_date, goal_type, title, target_study_minutes,
  target_subject, target_stage_order, target_questions, note,
  sort_order, created_by, source_daily_goal_id, created_at, updated_at
)
select
  g.group_id, g.goal_date, 'theory_stage', coalesce(g.target_subject,'이론') || ' 진도', 0,
  g.target_subject, g.target_stage_order, 0, g.note,
  20, g.created_by, g.id, g.created_at, g.updated_at
from public.study_group_daily_goals g
where g.target_stage_order is not null
on conflict (source_daily_goal_id, goal_type) do nothing;

insert into public.study_group_goals(
  group_id, goal_date, goal_type, title, target_study_minutes,
  target_subject, target_stage_order, target_questions, note,
  sort_order, created_by, source_daily_goal_id, created_at, updated_at
)
select
  g.group_id, g.goal_date, 'questions', '문제 풀이', 0,
  null, null, g.target_questions, g.note,
  30, g.created_by, g.id, g.created_at, g.updated_at
from public.study_group_daily_goals g
where g.target_questions > 0
on conflict (source_daily_goal_id, goal_type) do nothing;

alter table public.study_group_goals enable row level security;
revoke all on public.study_group_goals from anon, authenticated;
grant select on public.study_group_goals to authenticated;

drop policy if exists "study_group_goals_visible_to_members_v2" on public.study_group_goals;
create policy "study_group_goals_visible_to_members_v2"
on public.study_group_goals for select to authenticated
using (public.study_group_is_member(group_id, auth.uid()));

create or replace function public.study_group_goals(p_group_id uuid, p_goal_date date)
returns table (
  goal_id uuid,
  goal_type text,
  title text,
  target_study_minutes integer,
  target_subject text,
  target_stage_order integer,
  target_questions integer,
  note text,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id, auth.uid()) then raise exception 'Study-group membership required'; end if;
  if p_goal_date is null then raise exception 'Goal date is required'; end if;

  return query
  select g.id, g.goal_type, g.title, g.target_study_minutes, g.target_subject,
         g.target_stage_order, g.target_questions, g.note, g.sort_order,
         g.created_at, g.updated_at
  from public.study_group_goals g
  where g.group_id=p_group_id and g.goal_date=p_goal_date
  order by g.sort_order, g.created_at, g.id;
end;
$$;

create or replace function public.study_group_save_goal(
  p_goal_id uuid,
  p_group_id uuid,
  p_goal_date date,
  p_goal_type text,
  p_title text,
  p_target_study_minutes integer,
  p_target_subject text,
  p_target_stage_order integer,
  p_target_questions integer,
  p_note text,
  p_sort_order integer
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_type text := lower(btrim(coalesce(p_goal_type,'')));
  v_title text := left(btrim(coalesce(p_title,'')),120);
  v_minutes integer := greatest(0,coalesce(p_target_study_minutes,0));
  v_subject text := nullif(btrim(coalesce(p_target_subject,'')),'');
  v_stage integer := p_target_stage_order;
  v_questions integer := greatest(0,coalesce(p_target_questions,0));
  v_note text := left(coalesce(p_note,''),500);
  v_sort integer := greatest(0,coalesce(p_sort_order,0));
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  if p_goal_date is null then raise exception 'Goal date is required'; end if;
  if v_type not in ('study_time','theory_stage','questions') then raise exception 'Unsupported goal type'; end if;

  if v_type='study_time' then
    if v_minutes < 1 or v_minutes > 1440 then raise exception 'Study-time target must be between 1 and 1440 minutes'; end if;
    v_subject := null; v_stage := null; v_questions := 0;
    if v_title='' then v_title := '공부시간'; end if;
  elsif v_type='theory_stage' then
    if v_subject is null or public.study_group_theory_storage_key(v_subject) is null then raise exception 'Unsupported theory subject'; end if;
    if v_stage is null or v_stage < 1 then raise exception 'Theory-stage target is required'; end if;
    v_minutes := 0; v_questions := 0;
    if v_title='' then v_title := v_subject || ' 진도'; end if;
  elsif v_type='questions' then
    if v_questions < 1 or v_questions > 10000 then raise exception 'Question target must be between 1 and 10000'; end if;
    v_minutes := 0; v_subject := null; v_stage := null;
    if v_title='' then v_title := '문제 풀이'; end if;
  end if;

  if p_goal_id is null then
    insert into public.study_group_goals(
      group_id, goal_date, goal_type, title, target_study_minutes,
      target_subject, target_stage_order, target_questions, note,
      sort_order, created_by, updated_at
    ) values (
      p_group_id, p_goal_date, v_type, v_title, v_minutes,
      v_subject, v_stage, v_questions, v_note,
      v_sort, auth.uid(), now()
    ) returning id into v_id;
  else
    update public.study_group_goals set
      goal_type=v_type,
      title=v_title,
      target_study_minutes=v_minutes,
      target_subject=v_subject,
      target_stage_order=v_stage,
      target_questions=v_questions,
      note=v_note,
      sort_order=v_sort,
      updated_at=now()
    where id=p_goal_id and group_id=p_group_id
    returning id into v_id;
    if v_id is null then raise exception 'Goal not found'; end if;
  end if;

  return v_id;
end;
$$;

create or replace function public.study_group_delete_goal(p_goal_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select group_id into v_group_id from public.study_group_goals where id=p_goal_id;
  if v_group_id is null then return; end if;
  if not public.study_group_is_leader(v_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  delete from public.study_group_goals where id=p_goal_id;
end;
$$;

create or replace function public.study_group_dashboard_v2(p_group_id uuid, p_goal_date date)
returns table (
  user_id uuid,
  username text,
  is_leader boolean,
  study_seconds bigint,
  question_count bigint,
  goals_total integer,
  goals_done integer,
  all_done boolean,
  goal_results jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id, auth.uid()) then raise exception 'Study-group membership required'; end if;
  if p_goal_date is null then raise exception 'Goal date is required'; end if;

  return query
  with member_rows as (
    select m.user_id,
           (sg.owner_id=m.user_id) as leader,
           coalesce(nullif(btrim(p.username),''), split_part(coalesce(p.email,''),'@',1), '회원')::text as display_name
    from public.study_group_members m
    join public.study_groups sg on sg.id=m.group_id and sg.is_active
    left join public.profiles p on p.id=m.user_id
    where m.group_id=p_group_id
  ),
  time_stats as (
    select t.user_id, coalesce(sum(t.active_seconds),0)::bigint as seconds
    from public.user_study_time_daily t
    where t.study_date=p_goal_date
      and exists (select 1 from member_rows mr where mr.user_id=t.user_id)
    group by t.user_id
  ),
  question_stats as (
    select a.user_id, count(*)::bigint as cnt
    from public.user_attempts a
    where (a.answered_at at time zone 'Asia/Seoul')::date=p_goal_date
      and exists (select 1 from member_rows mr where mr.user_id=a.user_id)
    group by a.user_id
  )
  select
    mr.user_id,
    mr.display_name,
    mr.leader,
    coalesce(ts.seconds,0)::bigint,
    coalesce(qs.cnt,0)::bigint,
    coalesce(gr.total_goals,0)::integer,
    coalesce(gr.done_goals,0)::integer,
    (coalesce(gr.total_goals,0)>0 and coalesce(gr.done_goals,0)=coalesce(gr.total_goals,0))::boolean,
    coalesce(gr.results,'[]'::jsonb)
  from member_rows mr
  left join time_stats ts on ts.user_id=mr.user_id
  left join question_stats qs on qs.user_id=mr.user_id
  left join lateral (
    select
      count(*)::integer as total_goals,
      count(*) filter (where x.done)::integer as done_goals,
      jsonb_agg(
        jsonb_build_object(
          'goal_id',x.goal_id,
          'goal_type',x.goal_type,
          'title',x.title,
          'note',x.note,
          'target_study_minutes',x.target_study_minutes,
          'target_subject',x.target_subject,
          'target_stage_order',x.target_stage_order,
          'target_questions',x.target_questions,
          'current_value',x.current_value,
          'done',x.done
        ) order by x.sort_order, x.created_at, x.goal_id
      ) as results
    from (
      select
        g.id as goal_id,
        g.goal_type,
        g.title,
        g.note,
        g.target_study_minutes,
        g.target_subject,
        g.target_stage_order,
        g.target_questions,
        g.sort_order,
        g.created_at,
        case
          when g.goal_type='study_time' then coalesce(ts.seconds,0)
          when g.goal_type='questions' then coalesce(qs.cnt,0)
          when g.goal_type='theory_stage' then coalesce(th.passed_count,0)
          else 0
        end::bigint as current_value,
        case
          when g.goal_type='study_time' then coalesce(ts.seconds,0) >= g.target_study_minutes*60
          when g.goal_type='questions' then coalesce(qs.cnt,0) >= g.target_questions
          when g.goal_type='theory_stage' then coalesce(th.passed_count,0) >= coalesce(g.target_stage_order,0)
          else false
        end::boolean as done
      from public.study_group_goals g
      left join lateral (
        select count(*) filter (where tp.passed)::bigint as passed_count
        from public.user_theory_progress tp
        where tp.user_id=mr.user_id
          and tp.storage_key=public.study_group_theory_storage_key(g.target_subject)
      ) th on true
      where g.group_id=p_group_id and g.goal_date=p_goal_date
    ) x
  ) gr on true
  order by mr.leader desc, lower(mr.display_name);
end;
$$;

-- ============================================================
-- 2) Study-group board
-- ============================================================

create table if not exists public.study_group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_group_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.study_group_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_group_posts_group_created_idx
  on public.study_group_posts(group_id, created_at desc);
create index if not exists study_group_comments_post_created_idx
  on public.study_group_comments(post_id, created_at);

alter table public.study_group_posts enable row level security;
alter table public.study_group_comments enable row level security;
revoke all on public.study_group_posts from anon, authenticated;
revoke all on public.study_group_comments from anon, authenticated;
grant select on public.study_group_posts to authenticated;
grant select on public.study_group_comments to authenticated;

drop policy if exists "study_group_posts_visible_to_members" on public.study_group_posts;
create policy "study_group_posts_visible_to_members"
on public.study_group_posts for select to authenticated
using (public.study_group_is_member(group_id, auth.uid()));

drop policy if exists "study_group_comments_visible_to_members" on public.study_group_comments;
create policy "study_group_comments_visible_to_members"
on public.study_group_comments for select to authenticated
using (
  exists (
    select 1 from public.study_group_posts p
    where p.id=post_id and public.study_group_is_member(p.group_id, auth.uid())
  )
);

create or replace function public.study_group_board_posts(
  p_group_id uuid,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  post_id uuid,
  title text,
  content text,
  author_id uuid,
  author_username text,
  created_at timestamptz,
  updated_at timestamptz,
  comment_count bigint,
  can_delete boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id, auth.uid()) then raise exception 'Study-group membership required'; end if;

  return query
  select p.id, p.title, p.content, p.author_id,
         coalesce(nullif(btrim(pr.username),''), split_part(coalesce(pr.email,''),'@',1), '회원')::text,
         p.created_at, p.updated_at,
         (select count(*) from public.study_group_comments c where c.post_id=p.id)::bigint,
         (p.author_id=auth.uid() or public.study_group_is_leader(p_group_id,auth.uid()))::boolean
  from public.study_group_posts p
  left join public.profiles pr on pr.id=p.author_id
  where p.group_id=p_group_id
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit,50),1),100)
  offset greatest(coalesce(p_offset,0),0);
end;
$$;

create or replace function public.study_group_board_create_post(p_group_id uuid, p_title text, p_content text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_title text := left(btrim(coalesce(p_title,'')),120);
  v_content text := left(btrim(coalesce(p_content,'')),5000);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id, auth.uid()) then raise exception 'Study-group membership required'; end if;
  if v_title='' then raise exception 'Post title is required'; end if;
  if v_content='' then raise exception 'Post content is required'; end if;
  insert into public.study_group_posts(group_id,author_id,title,content)
  values(p_group_id,auth.uid(),v_title,v_content)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.study_group_board_delete_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
  v_author_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select group_id,author_id into v_group_id,v_author_id from public.study_group_posts where id=p_post_id;
  if v_group_id is null then return; end if;
  if v_author_id<>auth.uid() and not public.study_group_is_leader(v_group_id,auth.uid()) then
    raise exception 'Post delete permission denied';
  end if;
  delete from public.study_group_posts where id=p_post_id;
end;
$$;

create or replace function public.study_group_board_comments(p_post_id uuid)
returns table (
  comment_id uuid,
  author_id uuid,
  author_username text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  can_delete boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select group_id into v_group_id from public.study_group_posts where id=p_post_id;
  if v_group_id is null then raise exception 'Post not found'; end if;
  if not public.study_group_is_member(v_group_id, auth.uid()) then raise exception 'Study-group membership required'; end if;

  return query
  select c.id,c.author_id,
         coalesce(nullif(btrim(pr.username),''), split_part(coalesce(pr.email,''),'@',1), '회원')::text,
         c.content,c.created_at,c.updated_at,
         (c.author_id=auth.uid() or public.study_group_is_leader(v_group_id,auth.uid()))::boolean
  from public.study_group_comments c
  left join public.profiles pr on pr.id=c.author_id
  where c.post_id=p_post_id
  order by c.created_at,c.id;
end;
$$;

create or replace function public.study_group_board_create_comment(p_post_id uuid, p_content text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
  v_id uuid;
  v_content text := left(btrim(coalesce(p_content,'')),2000);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select group_id into v_group_id from public.study_group_posts where id=p_post_id;
  if v_group_id is null then raise exception 'Post not found'; end if;
  if not public.study_group_is_member(v_group_id, auth.uid()) then raise exception 'Study-group membership required'; end if;
  if v_content='' then raise exception 'Comment content is required'; end if;
  insert into public.study_group_comments(post_id,author_id,content)
  values(p_post_id,auth.uid(),v_content)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.study_group_board_delete_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
  v_author_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select p.group_id,c.author_id into v_group_id,v_author_id
  from public.study_group_comments c
  join public.study_group_posts p on p.id=c.post_id
  where c.id=p_comment_id;
  if v_group_id is null then return; end if;
  if v_author_id<>auth.uid() and not public.study_group_is_leader(v_group_id,auth.uid()) then
    raise exception 'Comment delete permission denied';
  end if;
  delete from public.study_group_comments where id=p_comment_id;
end;
$$;

-- ============================================================
-- Function permissions
-- ============================================================

revoke all on function public.study_group_goals(uuid,date) from public,anon;
revoke all on function public.study_group_save_goal(uuid,uuid,date,text,text,integer,text,integer,integer,text,integer) from public,anon;
revoke all on function public.study_group_delete_goal(uuid) from public,anon;
revoke all on function public.study_group_dashboard_v2(uuid,date) from public,anon;
revoke all on function public.study_group_board_posts(uuid,integer,integer) from public,anon;
revoke all on function public.study_group_board_create_post(uuid,text,text) from public,anon;
revoke all on function public.study_group_board_delete_post(uuid) from public,anon;
revoke all on function public.study_group_board_comments(uuid) from public,anon;
revoke all on function public.study_group_board_create_comment(uuid,text) from public,anon;
revoke all on function public.study_group_board_delete_comment(uuid) from public,anon;

grant execute on function public.study_group_goals(uuid,date) to authenticated;
grant execute on function public.study_group_save_goal(uuid,uuid,date,text,text,integer,text,integer,integer,text,integer) to authenticated;
grant execute on function public.study_group_delete_goal(uuid) to authenticated;
grant execute on function public.study_group_dashboard_v2(uuid,date) to authenticated;
grant execute on function public.study_group_board_posts(uuid,integer,integer) to authenticated;
grant execute on function public.study_group_board_create_post(uuid,text,text) to authenticated;
grant execute on function public.study_group_board_delete_post(uuid) to authenticated;
grant execute on function public.study_group_board_comments(uuid) to authenticated;
grant execute on function public.study_group_board_create_comment(uuid,text) to authenticated;
grant execute on function public.study_group_board_delete_comment(uuid) to authenticated;
