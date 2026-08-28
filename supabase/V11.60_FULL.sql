-- ============================================================
-- Aviation Question Bank v11.59.3
-- STUDY GROUP — FULL / LATEST Supabase installer
-- ============================================================
-- Includes:
--   v11.59.0  Study-group base schema / invites / membership / daily progress
--   v11.59.1  Multiple goals + study-group board
--   v11.59.2  Goal-save RPC compatibility hotfix
--   v11.59.3  Direct goal write + leader-only RLS recovery
--
-- Usage:
--   Supabase > SQL Editor > New query > paste/run this entire file once.
--   Safe to re-run on an existing v11.59.x installation.
--
-- Data safety:
--   This installer does NOT drop study-group tables and does NOT clear existing
--   groups, members, invitations, goals, posts, or comments. Legacy single-row
--   daily goals are migrated with conflict-safe INSERTs.
--
-- IMPORTANT:
--   This script assumes the app's existing member/profile and learning tables
--   (including profiles and user_feature_access) already exist.
-- ============================================================

begin;

-- Aviation Question Bank v11.59.0
-- Study Group backend — run ONCE in Supabase SQL Editor before deploying the web patch.
-- Depends on the existing v11.50 member feature-access schema and learning-progress tables.
-- Internal in-app invitations only; no email/SMS provider is required.

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 60),
  owner_id uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_group_members (
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('leader','member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.study_group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (group_id, invitee_id),
  check (inviter_id <> invitee_id)
);

create table if not exists public.study_group_daily_goals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  goal_date date not null,
  target_study_minutes integer not null default 0 check (target_study_minutes between 0 and 1440),
  target_subject text,
  target_stage_order integer check (target_stage_order is null or target_stage_order >= 1),
  target_questions integer not null default 0 check (target_questions between 0 and 10000),
  note text not null default '' check (char_length(note) <= 500),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, goal_date)
);

create index if not exists study_groups_owner_idx on public.study_groups(owner_id, created_at desc);
create index if not exists study_group_members_user_idx on public.study_group_members(user_id, joined_at desc);
create index if not exists study_group_invites_invitee_idx on public.study_group_invites(invitee_id, status, created_at desc);
create index if not exists study_group_goals_group_date_idx on public.study_group_daily_goals(group_id, goal_date desc);

-- ============================================================
-- Security helpers
-- ============================================================

create or replace function public.study_group_is_member(p_group_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.study_group_members m
    join public.study_groups g on g.id = m.group_id and g.is_active
    where m.group_id = p_group_id and m.user_id = p_user_id
  );
$$;

create or replace function public.study_group_is_leader(p_group_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.study_groups g
    where g.id = p_group_id and g.is_active and g.owner_id = p_user_id
  );
$$;

create or replace function public.study_group_has_airline_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.user_feature_access f
      on f.user_id = p.id and f.feature_key = 'airline_course'
    where p.id = p_user_id
      and p.approval_status = 'approved'
      and (coalesce(p.is_admin, false) or coalesce(f.enabled, true))
  );
$$;

create or replace function public.study_group_theory_storage_key(p_subject text)
returns text
language sql
immutable
as $$
  select case p_subject
    when '항공기상' then 'weatherAll'
    when '검댕이 항공법규' then 'airlawAll'
    when '항공교통통신' then 'atccomm300'
    when 'K-AIM' then 'kaimCourse30'
    when '비행이론' then 'flightTheory23'
    when '공중항법' then 'airNavigation31'
    else null
  end;
$$;

-- ============================================================
-- RLS: direct reads are restricted; writes are RPC-only.
-- ============================================================

alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;
alter table public.study_group_invites enable row level security;
alter table public.study_group_daily_goals enable row level security;

revoke all on public.study_groups from anon, authenticated;
revoke all on public.study_group_members from anon, authenticated;
revoke all on public.study_group_invites from anon, authenticated;
revoke all on public.study_group_daily_goals from anon, authenticated;
grant select on public.study_groups to authenticated;
grant select on public.study_group_members to authenticated;
grant select on public.study_group_invites to authenticated;
grant select on public.study_group_daily_goals to authenticated;

drop policy if exists "study_groups_visible_to_members_or_invitees" on public.study_groups;
create policy "study_groups_visible_to_members_or_invitees"
on public.study_groups for select to authenticated
using (
  public.study_group_is_member(id, auth.uid())
  or exists (
    select 1 from public.study_group_invites i
    where i.group_id = id and i.invitee_id = auth.uid() and i.status = 'pending'
  )
);

drop policy if exists "study_group_members_visible_to_members" on public.study_group_members;
create policy "study_group_members_visible_to_members"
on public.study_group_members for select to authenticated
using (public.study_group_is_member(group_id, auth.uid()));

drop policy if exists "study_group_invites_visible_to_parties" on public.study_group_invites;
create policy "study_group_invites_visible_to_parties"
on public.study_group_invites for select to authenticated
using (invitee_id = auth.uid() or public.study_group_is_leader(group_id, auth.uid()));

drop policy if exists "study_group_goals_visible_to_members" on public.study_group_daily_goals;
create policy "study_group_goals_visible_to_members"
on public.study_group_daily_goals for select to authenticated
using (public.study_group_is_member(group_id, auth.uid()));

-- ============================================================
-- Member discovery / invitations
-- ============================================================

create or replace function public.study_group_eligible_members(p_group_id uuid default null)
returns table (
  user_id uuid,
  username text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_has_airline_access(auth.uid()) then
    raise exception 'Airline-course access is required';
  end if;
  if p_group_id is not null and not public.study_group_is_leader(p_group_id, auth.uid()) then
    raise exception 'Study-group leader access required';
  end if;

  return query
  select
    p.id,
    coalesce(nullif(btrim(p.username), ''), split_part(coalesce(p.email,''), '@', 1), '회원')::text
  from public.profiles p
  left join public.user_feature_access f
    on f.user_id = p.id and f.feature_key = 'airline_course'
  where p.id <> auth.uid()
    and p.approval_status = 'approved'
    and (coalesce(p.is_admin, false) or coalesce(f.enabled, true))
    and (
      p_group_id is null
      or not exists (
        select 1 from public.study_group_members m
        where m.group_id = p_group_id and m.user_id = p.id
      )
    )
    and (
      p_group_id is null
      or not exists (
        select 1 from public.study_group_invites i
        where i.group_id = p_group_id and i.invitee_id = p.id and i.status = 'pending'
      )
    )
  order by lower(coalesce(p.username, p.email, ''));
end;
$$;

create or replace function public.study_group_create(p_name text, p_invitee_ids uuid[] default array[]::uuid[])
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
  v_name text := btrim(coalesce(p_name, ''));
  v_invitee uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_has_airline_access(auth.uid()) then
    raise exception 'Airline-course access is required';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 60 then
    raise exception 'Group name must be 2-60 characters';
  end if;

  insert into public.study_groups(name, owner_id)
  values (v_name, auth.uid())
  returning id into v_group_id;

  insert into public.study_group_members(group_id, user_id, role)
  values (v_group_id, auth.uid(), 'leader');

  for v_invitee in
    select distinct x
    from unnest(coalesce(p_invitee_ids, array[]::uuid[])) as x
    where x is not null and x <> auth.uid()
  loop
    if not public.study_group_has_airline_access(v_invitee) then
      raise exception 'One or more selected members do not have airline-course access';
    end if;
    insert into public.study_group_invites(group_id, inviter_id, invitee_id, status, created_at, responded_at)
    values (v_group_id, auth.uid(), v_invitee, 'pending', now(), null)
    on conflict (group_id, invitee_id) do update
      set inviter_id = excluded.inviter_id,
          status = 'pending',
          created_at = now(),
          responded_at = null;
  end loop;

  return v_group_id;
exception when others then
  raise;
end;
$$;

create or replace function public.study_group_invite_members(p_group_id uuid, p_invitee_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invitee uuid;
  v_count integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_leader(p_group_id, auth.uid()) then
    raise exception 'Study-group leader access required';
  end if;

  for v_invitee in
    select distinct x
    from unnest(coalesce(p_invitee_ids, array[]::uuid[])) as x
    where x is not null and x <> auth.uid()
  loop
    if not public.study_group_has_airline_access(v_invitee) then
      raise exception 'One or more selected members do not have airline-course access';
    end if;
    if exists (select 1 from public.study_group_members m where m.group_id=p_group_id and m.user_id=v_invitee) then
      continue;
    end if;
    insert into public.study_group_invites(group_id, inviter_id, invitee_id, status, created_at, responded_at)
    values (p_group_id, auth.uid(), v_invitee, 'pending', now(), null)
    on conflict (group_id, invitee_id) do update
      set inviter_id = excluded.inviter_id,
          status = 'pending',
          created_at = now(),
          responded_at = null;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.study_group_my_invites()
returns table (
  invite_id uuid,
  group_id uuid,
  group_name text,
  inviter_id uuid,
  inviter_username text,
  created_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    i.id,
    g.id,
    g.name,
    i.inviter_id,
    coalesce(nullif(btrim(p.username), ''), split_part(coalesce(p.email,''), '@', 1), '회원')::text,
    i.created_at
  from public.study_group_invites i
  join public.study_groups g on g.id = i.group_id and g.is_active
  left join public.profiles p on p.id = i.inviter_id
  where i.invitee_id = auth.uid() and i.status = 'pending'
  order by i.created_at desc;
$$;

create or replace function public.study_group_respond_invite(p_invite_id uuid, p_accept boolean)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invite public.study_group_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_invite
  from public.study_group_invites
  where id = p_invite_id
  for update;

  if not found or v_invite.invitee_id <> auth.uid() then raise exception 'Invite not found'; end if;
  if v_invite.status <> 'pending' then raise exception 'Invite already processed'; end if;

  if coalesce(p_accept, false) then
    if not public.study_group_has_airline_access(auth.uid()) then
      raise exception 'Airline-course access is required';
    end if;
    if not exists (select 1 from public.study_groups g where g.id=v_invite.group_id and g.is_active) then
      raise exception 'Study group is no longer active';
    end if;
    insert into public.study_group_members(group_id, user_id, role)
      values (v_invite.group_id, auth.uid(), 'member')
      on conflict (group_id, user_id) do nothing;
    update public.study_group_invites
      set status='accepted', responded_at=now()
      where id=p_invite_id;
    return 'accepted';
  else
    update public.study_group_invites
      set status='declined', responded_at=now()
      where id=p_invite_id;
    return 'declined';
  end if;
end;
$$;

-- ============================================================
-- Group management
-- ============================================================

create or replace function public.study_group_my_groups()
returns table (
  group_id uuid,
  group_name text,
  owner_id uuid,
  is_leader boolean,
  member_count integer,
  created_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    g.id,
    g.name,
    g.owner_id,
    (g.owner_id = auth.uid()),
    count(m2.user_id)::integer,
    g.created_at
  from public.study_groups g
  join public.study_group_members me on me.group_id=g.id and me.user_id=auth.uid()
  join public.study_group_members m2 on m2.group_id=g.id
  where g.is_active
  group by g.id, g.name, g.owner_id, g.created_at
  order by g.created_at desc;
$$;

create or replace function public.study_group_rename(p_group_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_name text := btrim(coalesce(p_name,''));
begin
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 60 then raise exception 'Group name must be 2-60 characters'; end if;
  update public.study_groups set name=v_name, updated_at=now() where id=p_group_id;
end;
$$;

create or replace function public.study_group_remove_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  if p_user_id = auth.uid() then raise exception 'The leader cannot remove themself'; end if;
  delete from public.study_group_members where group_id=p_group_id and user_id=p_user_id;
  update public.study_group_invites
     set status='cancelled', responded_at=coalesce(responded_at, now())
   where group_id=p_group_id and invitee_id=p_user_id and status in ('pending','accepted');
end;
$$;

create or replace function public.study_group_leave(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.study_group_is_leader(p_group_id, auth.uid()) then
    raise exception 'The group leader cannot leave. Delete the group instead.';
  end if;
  delete from public.study_group_members where group_id=p_group_id and user_id=auth.uid();
end;
$$;

create or replace function public.study_group_delete(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  delete from public.study_groups where id=p_group_id;
end;
$$;

-- ============================================================
-- Daily goal + member dashboard
-- ============================================================

create or replace function public.study_group_set_daily_goal(
  p_group_id uuid,
  p_goal_date date,
  p_target_study_minutes integer default 0,
  p_target_subject text default null,
  p_target_stage_order integer default null,
  p_target_questions integer default 0,
  p_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_minutes integer := greatest(0, coalesce(p_target_study_minutes,0));
  v_questions integer := greatest(0, coalesce(p_target_questions,0));
  v_subject text := nullif(btrim(coalesce(p_target_subject,'')), '');
  v_note text := left(coalesce(p_note,''), 500);
begin
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  if p_goal_date is null then raise exception 'Goal date is required'; end if;
  if v_minutes > 1440 then raise exception 'Study-time target cannot exceed 1440 minutes'; end if;
  if v_questions > 10000 then raise exception 'Question target is too large'; end if;
  if p_target_stage_order is not null and p_target_stage_order < 1 then raise exception 'Invalid stage target'; end if;
  if v_subject is not null and public.study_group_theory_storage_key(v_subject) is null then raise exception 'Unsupported theory subject'; end if;
  if p_target_stage_order is not null and v_subject is null then raise exception 'A theory subject is required for a stage target'; end if;
  if v_minutes = 0 and p_target_stage_order is null and v_questions = 0 then
    raise exception 'Set at least one daily target';
  end if;

  insert into public.study_group_daily_goals(
    group_id, goal_date, target_study_minutes, target_subject, target_stage_order,
    target_questions, note, created_by, updated_at
  ) values (
    p_group_id, p_goal_date, v_minutes, v_subject, p_target_stage_order,
    v_questions, v_note, auth.uid(), now()
  )
  on conflict (group_id, goal_date) do update set
    target_study_minutes=excluded.target_study_minutes,
    target_subject=excluded.target_subject,
    target_stage_order=excluded.target_stage_order,
    target_questions=excluded.target_questions,
    note=excluded.note,
    created_by=auth.uid(),
    updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.study_group_clear_daily_goal(p_group_id uuid, p_goal_date date)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
  delete from public.study_group_daily_goals where group_id=p_group_id and goal_date=p_goal_date;
end;
$$;

create or replace function public.study_group_dashboard(p_group_id uuid, p_goal_date date)
returns table (
  user_id uuid,
  username text,
  is_leader boolean,
  has_goal boolean,
  goal_date date,
  target_study_minutes integer,
  target_subject text,
  target_stage_order integer,
  target_questions integer,
  goal_note text,
  study_seconds bigint,
  question_count bigint,
  passed_stage_count bigint,
  study_time_done boolean,
  progress_done boolean,
  questions_done boolean,
  all_done boolean
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
  with goal as (
    select g.*,
           public.study_group_theory_storage_key(g.target_subject) as storage_key
    from public.study_group_daily_goals g
    where g.group_id=p_group_id and g.goal_date=p_goal_date
  ),
  member_rows as (
    select m.user_id, (sg.owner_id=m.user_id) as leader,
           coalesce(nullif(btrim(p.username), ''), split_part(coalesce(p.email,''), '@', 1), '회원')::text as display_name
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
  ),
  theory_stats as (
    select t.user_id, count(*) filter (where t.passed)::bigint as cnt
    from public.user_theory_progress t
    cross join goal g
    where g.storage_key is not null
      and t.storage_key=g.storage_key
      and exists (select 1 from member_rows mr where mr.user_id=t.user_id)
    group by t.user_id
  )
  select
    mr.user_id,
    mr.display_name,
    mr.leader,
    (g.id is not null) as has_goal,
    p_goal_date,
    coalesce(g.target_study_minutes,0)::integer,
    g.target_subject,
    g.target_stage_order,
    coalesce(g.target_questions,0)::integer,
    coalesce(g.note,'')::text,
    coalesce(ts.seconds,0)::bigint,
    coalesce(qs.cnt,0)::bigint,
    coalesce(th.cnt,0)::bigint,
    (coalesce(g.target_study_minutes,0)=0 or coalesce(ts.seconds,0) >= coalesce(g.target_study_minutes,0)*60)::boolean,
    (g.target_stage_order is null or coalesce(th.cnt,0) >= g.target_stage_order)::boolean,
    (coalesce(g.target_questions,0)=0 or coalesce(qs.cnt,0) >= coalesce(g.target_questions,0))::boolean,
    (
      g.id is not null
      and (coalesce(g.target_study_minutes,0)=0 or coalesce(ts.seconds,0) >= coalesce(g.target_study_minutes,0)*60)
      and (g.target_stage_order is null or coalesce(th.cnt,0) >= g.target_stage_order)
      and (coalesce(g.target_questions,0)=0 or coalesce(qs.cnt,0) >= coalesce(g.target_questions,0))
    )::boolean
  from member_rows mr
  left join goal g on true
  left join time_stats ts on ts.user_id=mr.user_id
  left join question_stats qs on qs.user_id=mr.user_id
  left join theory_stats th on th.user_id=mr.user_id
  order by mr.leader desc, lower(mr.display_name);
end;
$$;

-- ============================================================
-- Function permissions
-- ============================================================

revoke all on function public.study_group_has_airline_access(uuid) from public, anon, authenticated;
revoke all on function public.study_group_is_member(uuid, uuid) from public, anon;
revoke all on function public.study_group_is_leader(uuid, uuid) from public, anon;
revoke all on function public.study_group_theory_storage_key(text) from public, anon;
revoke all on function public.study_group_eligible_members(uuid) from public, anon;
revoke all on function public.study_group_create(text, uuid[]) from public, anon;
revoke all on function public.study_group_invite_members(uuid, uuid[]) from public, anon;
revoke all on function public.study_group_my_invites() from public, anon;
revoke all on function public.study_group_respond_invite(uuid, boolean) from public, anon;
revoke all on function public.study_group_my_groups() from public, anon;
revoke all on function public.study_group_rename(uuid, text) from public, anon;
revoke all on function public.study_group_remove_member(uuid, uuid) from public, anon;
revoke all on function public.study_group_leave(uuid) from public, anon;
revoke all on function public.study_group_delete(uuid) from public, anon;
revoke all on function public.study_group_set_daily_goal(uuid,date,integer,text,integer,integer,text) from public, anon;
revoke all on function public.study_group_clear_daily_goal(uuid,date) from public, anon;
revoke all on function public.study_group_dashboard(uuid,date) from public, anon;

grant execute on function public.study_group_is_member(uuid, uuid) to authenticated;
grant execute on function public.study_group_is_leader(uuid, uuid) to authenticated;
grant execute on function public.study_group_theory_storage_key(text) to authenticated;
grant execute on function public.study_group_eligible_members(uuid) to authenticated;
grant execute on function public.study_group_create(text, uuid[]) to authenticated;
grant execute on function public.study_group_invite_members(uuid, uuid[]) to authenticated;
grant execute on function public.study_group_my_invites() to authenticated;
grant execute on function public.study_group_respond_invite(uuid, boolean) to authenticated;
grant execute on function public.study_group_my_groups() to authenticated;
grant execute on function public.study_group_rename(uuid, text) to authenticated;
grant execute on function public.study_group_remove_member(uuid, uuid) to authenticated;
grant execute on function public.study_group_leave(uuid) to authenticated;
grant execute on function public.study_group_delete(uuid) to authenticated;
grant execute on function public.study_group_set_daily_goal(uuid,date,integer,text,integer,integer,text) to authenticated;
grant execute on function public.study_group_clear_daily_goal(uuid,date) to authenticated;
grant execute on function public.study_group_dashboard(uuid,date) to authenticated;

-- Keep internal access check private; callers receive only the filtered eligible-member RPC result.
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


-- ============================================================
-- v11.59.2 compatibility layer
-- ============================================================

-- Aviation Question Bank v11.59.2
-- Study Group goal-save hotfix
-- Run once AFTER v11.59.0 / v11.59.1 study-group SQL.
-- Does not delete or reset any existing study-group data.

create extension if not exists pgcrypto;

create or replace function public.study_group_add_goal_v2(
  p_group_id uuid,
  p_goal_date date,
  p_goal jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_type text := lower(btrim(coalesce(p_goal->>'goal_type','')));
  v_title text := left(btrim(coalesce(p_goal->>'title','')),120);
  v_minutes integer := greatest(0,coalesce(nullif(p_goal->>'target_study_minutes','')::integer,0));
  v_subject text := nullif(btrim(coalesce(p_goal->>'target_subject','')),'');
  v_stage integer := nullif(p_goal->>'target_stage_order','')::integer;
  v_questions integer := greatest(0,coalesce(nullif(p_goal->>'target_questions','')::integer,0));
  v_note text := left(coalesce(p_goal->>'note',''),500);
  v_sort integer := greatest(0,coalesce(nullif(p_goal->>'sort_order','')::integer,0));
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
  else
    if v_questions < 1 or v_questions > 10000 then raise exception 'Question target must be between 1 and 10000'; end if;
    v_minutes := 0; v_subject := null; v_stage := null;
    if v_title='' then v_title := '문제 풀이'; end if;
  end if;

  insert into public.study_group_goals(
    group_id, goal_date, goal_type, title, target_study_minutes,
    target_subject, target_stage_order, target_questions, note,
    sort_order, created_by, updated_at
  ) values (
    p_group_id, p_goal_date, v_type, v_title, v_minutes,
    v_subject, v_stage, v_questions, v_note,
    v_sort, auth.uid(), now()
  ) returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.study_group_update_goal_v2(
  p_goal_id uuid,
  p_group_id uuid,
  p_goal jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_type text := lower(btrim(coalesce(p_goal->>'goal_type','')));
  v_title text := left(btrim(coalesce(p_goal->>'title','')),120);
  v_minutes integer := greatest(0,coalesce(nullif(p_goal->>'target_study_minutes','')::integer,0));
  v_subject text := nullif(btrim(coalesce(p_goal->>'target_subject','')),'');
  v_stage integer := nullif(p_goal->>'target_stage_order','')::integer;
  v_questions integer := greatest(0,coalesce(nullif(p_goal->>'target_questions','')::integer,0));
  v_note text := left(coalesce(p_goal->>'note',''),500);
  v_sort integer := greatest(0,coalesce(nullif(p_goal->>'sort_order','')::integer,0));
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_goal_id is null then raise exception 'Goal id is required'; end if;
  if not public.study_group_is_leader(p_group_id, auth.uid()) then raise exception 'Study-group leader access required'; end if;
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
  else
    if v_questions < 1 or v_questions > 10000 then raise exception 'Question target must be between 1 and 10000'; end if;
    v_minutes := 0; v_subject := null; v_stage := null;
    if v_title='' then v_title := '문제 풀이'; end if;
  end if;

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
  return v_id;
end;
$$;

revoke all on function public.study_group_add_goal_v2(uuid,date,jsonb) from public, anon;
revoke all on function public.study_group_update_goal_v2(uuid,uuid,jsonb) from public, anon;
grant execute on function public.study_group_add_goal_v2(uuid,date,jsonb) to authenticated;
grant execute on function public.study_group_update_goal_v2(uuid,uuid,jsonb) to authenticated;

-- Ask PostgREST to refresh its function/schema cache immediately.
notify pgrst, 'reload schema';


-- ============================================================
-- v11.59.3 final direct-write / RLS layer
-- This section defines the FINAL goal-write behavior.
-- ============================================================

-- Aviation Question Bank v11.59.3
-- Study Group direct goal-write recovery hotfix
-- Run once AFTER the v11.59.1 study-group SQL. Safe to re-run.
-- No existing groups, goals, invitations, posts, or comments are deleted.

create extension if not exists pgcrypto;

-- Defensive schema repair: make sure the multi-goal table has every column
-- expected by the v11.59.3 web client even if an earlier migration was partial.
create table if not exists public.study_group_goals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  goal_date date not null,
  goal_type text not null default 'study_time',
  title text not null default '',
  target_study_minutes integer not null default 0,
  target_subject text,
  target_stage_order integer,
  target_questions integer not null default 0,
  note text not null default '',
  sort_order integer not null default 0,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_daily_goal_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.study_group_goals add column if not exists goal_date date;
alter table public.study_group_goals add column if not exists goal_type text;
alter table public.study_group_goals add column if not exists title text;
alter table public.study_group_goals add column if not exists target_study_minutes integer;
alter table public.study_group_goals add column if not exists target_subject text;
alter table public.study_group_goals add column if not exists target_stage_order integer;
alter table public.study_group_goals add column if not exists target_questions integer;
alter table public.study_group_goals add column if not exists note text;
alter table public.study_group_goals add column if not exists sort_order integer;
alter table public.study_group_goals add column if not exists created_by uuid;
alter table public.study_group_goals add column if not exists source_daily_goal_id uuid;
alter table public.study_group_goals add column if not exists created_at timestamptz;
alter table public.study_group_goals add column if not exists updated_at timestamptz;

alter table public.study_group_goals alter column goal_type set default 'study_time';
alter table public.study_group_goals alter column title set default '';
alter table public.study_group_goals alter column target_study_minutes set default 0;
alter table public.study_group_goals alter column target_questions set default 0;
alter table public.study_group_goals alter column note set default '';
alter table public.study_group_goals alter column sort_order set default 0;
alter table public.study_group_goals alter column created_by set default auth.uid();
alter table public.study_group_goals alter column created_at set default now();
alter table public.study_group_goals alter column updated_at set default now();

create index if not exists study_group_goals_group_date_idx
  on public.study_group_goals(group_id, goal_date, sort_order, created_at);

alter table public.study_group_goals enable row level security;

-- v11.59.3 deliberately allows direct writes ONLY to the active group's leader.
-- This removes RPC/function-cache dependency while preserving group isolation.
grant select, insert, update, delete on public.study_group_goals to authenticated;
revoke all on public.study_group_goals from anon;

drop policy if exists "study_group_goals_visible_to_members_v2" on public.study_group_goals;
create policy "study_group_goals_visible_to_members_v2"
on public.study_group_goals for select
to authenticated
using (public.study_group_is_member(group_id, auth.uid()));

drop policy if exists "study_group_goals_insert_leader_v11593" on public.study_group_goals;
create policy "study_group_goals_insert_leader_v11593"
on public.study_group_goals for insert
to authenticated
with check (
  public.study_group_is_leader(group_id, auth.uid())
  and created_by = auth.uid()
  and goal_date is not null
  and goal_type in ('study_time','theory_stage','questions')
  and char_length(coalesce(title,'')) <= 120
  and coalesce(target_study_minutes,0) between 0 and 1440
  and (target_stage_order is null or target_stage_order >= 1)
  and coalesce(target_questions,0) between 0 and 10000
  and char_length(coalesce(note,'')) <= 500
);

drop policy if exists "study_group_goals_update_leader_v11593" on public.study_group_goals;
create policy "study_group_goals_update_leader_v11593"
on public.study_group_goals for update
to authenticated
using (public.study_group_is_leader(group_id, auth.uid()))
with check (
  public.study_group_is_leader(group_id, auth.uid())
  and goal_type in ('study_time','theory_stage','questions')
  and char_length(coalesce(title,'')) <= 120
  and coalesce(target_study_minutes,0) between 0 and 1440
  and (target_stage_order is null or target_stage_order >= 1)
  and coalesce(target_questions,0) between 0 and 10000
  and char_length(coalesce(note,'')) <= 500
);

drop policy if exists "study_group_goals_delete_leader_v11593" on public.study_group_goals;
create policy "study_group_goals_delete_leader_v11593"
on public.study_group_goals for delete
to authenticated
using (public.study_group_is_leader(group_id, auth.uid()));

-- Small diagnostic RPC: useful for confirming DB access from the browser/admin console.
create or replace function public.study_group_goal_write_status(p_group_id uuid)
returns table (
  authenticated boolean,
  is_member boolean,
  is_leader boolean,
  can_airline_access boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    auth.uid() is not null,
    public.study_group_is_member(p_group_id, auth.uid()),
    public.study_group_is_leader(p_group_id, auth.uid()),
    public.study_group_has_airline_access(auth.uid());
$$;

revoke all on function public.study_group_goal_write_status(uuid) from public, anon;
grant execute on function public.study_group_goal_write_status(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;

-- Final PostgREST schema refresh after the transaction commits.
notify pgrst, 'reload schema';

-- Lightweight installation check. This does not modify data.
select
  'v11.59.3 study-group full installer complete'::text as status,
  to_regclass('public.study_groups') is not null as study_groups_ready,
  to_regclass('public.study_group_members') is not null as members_ready,
  to_regclass('public.study_group_invites') is not null as invites_ready,
  to_regclass('public.study_group_goals') is not null as multi_goals_ready,
  to_regclass('public.study_group_posts') is not null as board_posts_ready,
  to_regclass('public.study_group_comments') is not null as board_comments_ready,
  to_regprocedure('public.study_group_goal_write_status(uuid)') is not null as direct_goal_write_ready;


-- PilotBank v11.60.0 — Push notifications + Announcements + Weekly Ranking
-- Safe additive migration. Existing study-group data is not removed.
-- Run after the existing member/profile/learning schema. Re-runnable.

begin;

create extension if not exists pgcrypto;

create or replace function public.pilotbank_is_approved(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.profiles p where p.id=p_user_id and p.approval_status='approved');
$$;
create or replace function public.pilotbank_is_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.profiles p where p.id=p_user_id and p.approval_status='approved' and coalesce(p.is_admin,false));
$$;
create or replace function public.pilotbank_current_week_start()
returns date language sql stable as $$
  select ((now() at time zone 'Asia/Seoul')::date - (extract(isodow from (now() at time zone 'Asia/Seoul'))::int - 1));
$$;

create table if not exists public.app_public_settings(
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
insert into public.app_public_settings(key,value,updated_at)
values ('push_vapid_public_key','BNpAmVlSJAXlbK-Y1d8sbNQwxk0aT-rqo3f8patlwF9QJ2Kwou92Y323RJTMelciHrzbQm_qR5smvZ0poDK2or0',now())
on conflict(key) do update set value=excluded.value, updated_at=excluded.updated_at;

create table if not exists public.push_subscriptions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id,updated_at desc);

create table if not exists public.user_activity(
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  last_inactivity_notified_for_seen_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements(
  id uuid primary key default gen_random_uuid(),
  title text not null check(char_length(btrim(title)) between 2 and 120),
  body text not null check(char_length(btrim(body)) between 2 and 4000),
  created_by uuid not null references auth.users(id) on delete cascade,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  push_sent_at timestamptz
);
create index if not exists announcements_created_idx on public.announcements(created_at desc);

create table if not exists public.push_delivery_log(
  id bigint generated by default as identity primary key,
  subscription_id uuid references public.push_subscriptions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  event_key text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now(),
  unique(subscription_id,event_key)
);

create table if not exists public.weekly_ranking_rounds(
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  week_end date not null,
  title text not null,
  duration_minutes integer not null default 50 check(duration_minutes between 1 and 180),
  question_count integer not null default 50 check(question_count between 1 and 100),
  question_ids text[] not null,
  pool_version text not null default 'weekly-text-v1',
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_ranking_entries(
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.weekly_ranking_rounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'started' check(status in ('started','submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer,
  duration_seconds integer,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(round_id,user_id)
);
create index if not exists weekly_ranking_entries_rank_idx on public.weekly_ranking_entries(round_id,status,score desc,duration_seconds asc,submitted_at asc);

create table if not exists public.weekly_ranking_comments(
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.weekly_ranking_rounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists weekly_ranking_comments_round_idx on public.weekly_ranking_comments(round_id,created_at asc);

-- RLS / grants
alter table public.app_public_settings enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_activity enable row level security;
alter table public.announcements enable row level security;
alter table public.push_delivery_log enable row level security;
alter table public.weekly_ranking_rounds enable row level security;
alter table public.weekly_ranking_entries enable row level security;
alter table public.weekly_ranking_comments enable row level security;

revoke all on public.app_public_settings,public.push_subscriptions,public.user_activity,public.announcements,public.push_delivery_log,public.weekly_ranking_rounds,public.weekly_ranking_entries,public.weekly_ranking_comments from anon,authenticated;
grant select on public.app_public_settings to authenticated;
grant select,insert,update,delete on public.push_subscriptions to authenticated;
grant select,insert,update on public.user_activity to authenticated;
grant select,insert,update,delete on public.announcements to authenticated;

drop policy if exists app_public_settings_read on public.app_public_settings;
create policy app_public_settings_read on public.app_public_settings for select to authenticated using(public.pilotbank_is_approved(auth.uid()));

drop policy if exists push_subscriptions_own_select on public.push_subscriptions;
create policy push_subscriptions_own_select on public.push_subscriptions for select to authenticated using(user_id=auth.uid());
drop policy if exists push_subscriptions_own_insert on public.push_subscriptions;
create policy push_subscriptions_own_insert on public.push_subscriptions for insert to authenticated with check(user_id=auth.uid() and public.pilotbank_is_approved(auth.uid()));
drop policy if exists push_subscriptions_own_update on public.push_subscriptions;
create policy push_subscriptions_own_update on public.push_subscriptions for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists push_subscriptions_own_delete on public.push_subscriptions;
create policy push_subscriptions_own_delete on public.push_subscriptions for delete to authenticated using(user_id=auth.uid());

drop policy if exists user_activity_own_select on public.user_activity;
create policy user_activity_own_select on public.user_activity for select to authenticated using(user_id=auth.uid());
drop policy if exists user_activity_own_insert on public.user_activity;
create policy user_activity_own_insert on public.user_activity for insert to authenticated with check(user_id=auth.uid() and public.pilotbank_is_approved(auth.uid()));
drop policy if exists user_activity_own_update on public.user_activity;
create policy user_activity_own_update on public.user_activity for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

drop policy if exists announcements_read on public.announcements;
create policy announcements_read on public.announcements for select to authenticated using(is_published and public.pilotbank_is_approved(auth.uid()));
drop policy if exists announcements_admin_insert on public.announcements;
create policy announcements_admin_insert on public.announcements for insert to authenticated with check(public.pilotbank_is_admin(auth.uid()) and created_by=auth.uid());
drop policy if exists announcements_admin_update on public.announcements;
create policy announcements_admin_update on public.announcements for update to authenticated using(public.pilotbank_is_admin(auth.uid())) with check(public.pilotbank_is_admin(auth.uid()));
drop policy if exists announcements_admin_delete on public.announcements;
create policy announcements_admin_delete on public.announcements for delete to authenticated using(public.pilotbank_is_admin(auth.uid()));

-- Round list hides question IDs until the user actually starts.
create or replace function public.weekly_ranking_round_list(p_limit integer default 12)
returns table(round_id uuid,week_start date,week_end date,title text,duration_minutes integer,question_count integer,created_at timestamptz,my_status text,my_score integer,my_duration_seconds integer)
language sql stable security definer set search_path=public,pg_temp as $$
  select r.id,r.week_start,r.week_end,r.title,r.duration_minutes,r.question_count,r.created_at,
         e.status,e.score,e.duration_seconds
  from public.weekly_ranking_rounds r
  left join public.weekly_ranking_entries e on e.round_id=r.id and e.user_id=auth.uid()
  where public.pilotbank_is_approved(auth.uid())
  order by r.week_start desc
  limit greatest(1,least(coalesce(p_limit,12),52));
$$;

create or replace function public.weekly_ranking_start(p_round_id uuid)
returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare r public.weekly_ranking_rounds%rowtype; e public.weekly_ranking_entries%rowtype; deadline timestamptz;
begin
  if not public.pilotbank_is_approved(auth.uid()) then raise exception 'Approved members only'; end if;
  select * into r from public.weekly_ranking_rounds where id=p_round_id;
  if not found then raise exception 'Ranking round not found'; end if;
  if r.week_start<>public.pilotbank_current_week_start() then
    select * into e from public.weekly_ranking_entries where round_id=r.id and user_id=auth.uid();
    if not found then raise exception 'Past ranking rounds cannot be started'; end if;
  else
    insert into public.weekly_ranking_entries(round_id,user_id,status,started_at)
    values(r.id,auth.uid(),'started',now()) on conflict(round_id,user_id) do nothing;
    select * into e from public.weekly_ranking_entries where round_id=r.id and user_id=auth.uid();
  end if;
  deadline:=e.started_at+make_interval(mins=>r.duration_minutes);
  return jsonb_build_object('round_id',r.id,'title',r.title,'week_start',r.week_start,'status',e.status,'started_at',e.started_at,'deadline_at',deadline,'duration_minutes',r.duration_minutes,'question_count',r.question_count,'question_ids',to_jsonb(r.question_ids),'score',e.score,'duration_seconds',e.duration_seconds,'submitted_at',e.submitted_at,'answers',e.answers);
end;$$;

create or replace function public.weekly_ranking_save_draft(p_round_id uuid,p_answers jsonb)
returns void language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare e public.weekly_ranking_entries%rowtype; r public.weekly_ranking_rounds%rowtype; k text; v text; clean jsonb='{}'::jsonb;
begin
  if not public.pilotbank_is_approved(auth.uid()) then raise exception 'Approved members only'; end if;
  select * into e from public.weekly_ranking_entries where round_id=p_round_id and user_id=auth.uid() for update;
  if not found or e.status<>'started' then return; end if;
  select * into r from public.weekly_ranking_rounds where id=p_round_id;
  if now()>e.started_at+make_interval(mins=>r.duration_minutes)+interval '10 seconds' then return; end if;
  for k,v in select key,value#>>'{}' from jsonb_each(coalesce(p_answers,'{}'::jsonb)) loop
    if k=any(r.question_ids) and upper(v) in ('A','B','C','D') then clean:=clean||jsonb_build_object(k,upper(v)); end if;
  end loop;
  update public.weekly_ranking_entries set answers=coalesce(answers,'{}'::jsonb)||clean,updated_at=now() where id=e.id;
end;$$;

create or replace function public.weekly_ranking_my_entry(p_round_id uuid)
returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select case when not public.pilotbank_is_approved(auth.uid()) then null else (
    select jsonb_build_object('round_id',e.round_id,'status',e.status,'started_at',e.started_at,'submitted_at',e.submitted_at,'score',e.score,'duration_seconds',e.duration_seconds,'answers',e.answers)
    from public.weekly_ranking_entries e where e.round_id=p_round_id and e.user_id=auth.uid()
  ) end;
$$;

create or replace function public.weekly_ranking_leaderboard(p_round_id uuid)
returns table(rank_no bigint,user_id uuid,display_name text,score integer,duration_seconds integer,submitted_at timestamptz,is_me boolean)
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.pilotbank_is_admin(auth.uid()) and not exists(select 1 from public.weekly_ranking_entries e where e.round_id=p_round_id and e.user_id=auth.uid() and e.status='submitted') then
    raise exception 'Submit this ranking round before viewing the leaderboard';
  end if;
  return query
  select row_number() over(order by e.score desc,e.duration_seconds asc,e.submitted_at asc)::bigint,
         e.user_id,coalesce(nullif(btrim(p.username),''),split_part(coalesce(p.email,''),'@',1),'회원')::text,
         e.score,e.duration_seconds,e.submitted_at,(e.user_id=auth.uid())
  from public.weekly_ranking_entries e left join public.profiles p on p.id=e.user_id
  where e.round_id=p_round_id and e.status='submitted'
  order by e.score desc,e.duration_seconds asc,e.submitted_at asc;
end;$$;

create or replace function public.weekly_ranking_comments_list(p_round_id uuid)
returns table(comment_id uuid,user_id uuid,display_name text,body text,created_at timestamptz,can_delete boolean)
language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.pilotbank_is_admin(auth.uid()) and not exists(select 1 from public.weekly_ranking_entries e where e.round_id=p_round_id and e.user_id=auth.uid() and e.status='submitted') then raise exception 'Submit before viewing comments'; end if;
  return query select c.id,c.user_id,coalesce(nullif(btrim(p.username),''),split_part(coalesce(p.email,''),'@',1),'회원')::text,c.body,c.created_at,(c.user_id=auth.uid() or public.pilotbank_is_admin(auth.uid()))
  from public.weekly_ranking_comments c left join public.profiles p on p.id=c.user_id where c.round_id=p_round_id order by c.created_at asc;
end;$$;

create or replace function public.weekly_ranking_post_comment(p_round_id uuid,p_body text)
returns uuid language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare cid uuid;
begin
  if char_length(btrim(coalesce(p_body,''))) not between 1 and 1000 then raise exception 'Comment must be 1-1000 characters'; end if;
  if not public.pilotbank_is_admin(auth.uid()) and not exists(select 1 from public.weekly_ranking_entries e where e.round_id=p_round_id and e.user_id=auth.uid() and e.status='submitted') then raise exception 'Submit before commenting'; end if;
  insert into public.weekly_ranking_comments(round_id,user_id,body) values(p_round_id,auth.uid(),btrim(p_body)) returning id into cid; return cid;
end;$$;

create or replace function public.weekly_ranking_delete_comment(p_comment_id uuid)
returns void language plpgsql volatile security definer set search_path=public,pg_temp as $$
begin
  delete from public.weekly_ranking_comments c where c.id=p_comment_id and (c.user_id=auth.uid() or public.pilotbank_is_admin(auth.uid()));
end;$$;

revoke all on function public.pilotbank_is_approved(uuid),public.pilotbank_is_admin(uuid) from public,anon;
grant execute on function public.pilotbank_is_approved(uuid),public.pilotbank_is_admin(uuid) to authenticated;
revoke all on function public.weekly_ranking_round_list(integer),public.weekly_ranking_start(uuid),public.weekly_ranking_save_draft(uuid,jsonb),public.weekly_ranking_my_entry(uuid),public.weekly_ranking_leaderboard(uuid),public.weekly_ranking_comments_list(uuid),public.weekly_ranking_post_comment(uuid,text),public.weekly_ranking_delete_comment(uuid) from public,anon;
grant execute on function public.weekly_ranking_round_list(integer),public.weekly_ranking_start(uuid),public.weekly_ranking_save_draft(uuid,jsonb),public.weekly_ranking_my_entry(uuid),public.weekly_ranking_leaderboard(uuid),public.weekly_ranking_comments_list(uuid),public.weekly_ranking_post_comment(uuid,text),public.weekly_ranking_delete_comment(uuid) to authenticated;

commit;
notify pgrst,'reload schema';
