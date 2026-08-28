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
