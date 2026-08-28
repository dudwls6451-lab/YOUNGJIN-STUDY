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
