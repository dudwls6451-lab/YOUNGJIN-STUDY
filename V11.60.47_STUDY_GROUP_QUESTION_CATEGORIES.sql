-- PilotBank v11.60.47
-- Study Group Question Lab: group-defined custom categories
-- Prerequisite: V11.60.45_STUDY_GROUP_QUESTION_LAB.sql

begin;

-- 1) Group-owned category catalog
create table if not exists public.study_group_question_categories (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

create unique index if not exists study_group_question_categories_group_name_uidx
  on public.study_group_question_categories(group_id, lower(btrim(name)));
create index if not exists study_group_question_categories_group_created_idx
  on public.study_group_question_categories(group_id, created_at, id);

alter table public.study_group_question_categories enable row level security;
revoke all on public.study_group_question_categories from anon, authenticated;

-- 2) Every group question can optionally belong to one custom category.
alter table public.study_group_questions
  add column if not exists category_id uuid null references public.study_group_question_categories(id) on delete set null;
create index if not exists study_group_questions_group_category_created_idx
  on public.study_group_questions(group_id, category_id, created_at desc);

-- 3) Create a category. Duplicate names in the same group reuse the existing category.
create or replace function public.study_group_question_category_create(
  p_group_id uuid,
  p_name text
) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_name text:=btrim(coalesce(p_name,''));
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  if char_length(v_name) < 1 or char_length(v_name) > 60 then raise exception 'Category name must be between 1 and 60 characters'; end if;

  select c.id into v_id
  from public.study_group_question_categories c
  where c.group_id=p_group_id and lower(btrim(c.name))=lower(v_name)
  order by c.created_at,c.id
  limit 1;
  if v_id is not null then return v_id; end if;

  begin
    insert into public.study_group_question_categories(group_id,created_by,name)
    values(p_group_id,auth.uid(),v_name)
    returning id into v_id;
  exception when unique_violation then
    select c.id into v_id
    from public.study_group_question_categories c
    where c.group_id=p_group_id and lower(btrim(c.name))=lower(v_name)
    order by c.created_at,c.id
    limit 1;
  end;
  return v_id;
end $$;

-- 4) List categories with the number of active questions currently assigned.
create or replace function public.study_group_question_categories(p_group_id uuid)
returns table(category_id uuid,name text,created_by uuid,created_at timestamptz,question_count bigint)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  return query
  select c.id,c.name,c.created_by,c.created_at,count(q.id)::bigint
  from public.study_group_question_categories c
  left join public.study_group_questions q
    on q.category_id=c.id and q.group_id=c.group_id and q.is_active
  where c.group_id=p_group_id
  group by c.id,c.name,c.created_by,c.created_at
  order by lower(c.name),c.created_at,c.id;
end $$;

-- 5) v2 create API adds category assignment while keeping the v11.60.45 API intact.
create or replace function public.study_group_question_create_v2(
  p_group_id uuid,
  p_question text,
  p_choice_a text,
  p_choice_b text,
  p_choice_c text,
  p_choice_d text,
  p_correct_choice text,
  p_category_id uuid,
  p_explanation text default '',
  p_tag text default ''
) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_id uuid;
  v_correct text:=upper(btrim(coalesce(p_correct_choice,'')));
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  if v_correct not in ('A','B','C','D') then raise exception 'Correct choice must be A, B, C, or D'; end if;
  if p_category_id is not null and not exists(
    select 1 from public.study_group_question_categories c
    where c.id=p_category_id and c.group_id=p_group_id
  ) then raise exception 'Category does not belong to this study group'; end if;

  insert into public.study_group_questions(
    group_id,author_id,question,choice_a,choice_b,choice_c,choice_d,
    correct_choice,explanation,tag,category_id
  ) values(
    p_group_id,auth.uid(),left(btrim(p_question),2000),left(btrim(p_choice_a),1000),
    left(btrim(p_choice_b),1000),left(btrim(p_choice_c),1000),left(btrim(p_choice_d),1000),
    v_correct,left(coalesce(p_explanation,''),4000),left(btrim(coalesce(p_tag,'')),80),p_category_id
  ) returning id into v_id;
  return v_id;
end $$;

-- 6) Extend the existing question-list RPC so the UI receives category id/name.
drop function if exists public.study_group_questions(uuid,integer,integer);
create function public.study_group_questions(
  p_group_id uuid,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table(
  question_id uuid,
  question text,
  choice_a text,
  choice_b text,
  choice_c text,
  choice_d text,
  tag text,
  category_id uuid,
  category_name text,
  author_id uuid,
  author_username text,
  created_at timestamptz,
  comment_count bigint,
  attempt_count bigint,
  my_attempted boolean,
  my_selected_choice text,
  my_correct_choice text,
  my_is_correct boolean,
  my_explanation text,
  can_delete boolean
)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.study_group_is_member(p_group_id,auth.uid()) then raise exception 'Study-group membership required'; end if;
  return query
  select q.id,q.question,q.choice_a,q.choice_b,q.choice_c,q.choice_d,q.tag,
    q.category_id,c.name,q.author_id,
    coalesce(nullif(btrim(p.username),''),split_part(coalesce(p.email,''),'@',1),'회원')::text,
    q.created_at,coalesce(cc.cnt,0),coalesce(ac.cnt,0),(ma.id is not null),ma.selected_choice,
    case when ma.id is not null then q.correct_choice else null end,
    ma.is_correct,
    case when ma.id is not null then q.explanation else null end,
    (q.author_id=auth.uid() or public.study_group_is_leader(q.group_id,auth.uid()))
  from public.study_group_questions q
  left join public.study_group_question_categories c on c.id=q.category_id and c.group_id=q.group_id
  left join public.profiles p on p.id=q.author_id
  left join lateral(select count(*)::bigint cnt from public.study_group_question_comments x where x.question_id=q.id) cc on true
  left join lateral(select count(*)::bigint cnt from public.study_group_question_attempts a where a.question_id=q.id) ac on true
  left join lateral(
    select a.id,a.selected_choice,a.is_correct
    from public.study_group_question_attempts a
    where a.question_id=q.id and a.user_id=auth.uid()
    order by a.answered_at desc,a.id desc limit 1
  ) ma on true
  where q.group_id=p_group_id and q.is_active
  order by q.created_at desc,q.id desc
  limit greatest(1,least(coalesce(p_limit,100),500))
  offset greatest(coalesce(p_offset,0),0);
end $$;

revoke all on function public.study_group_question_category_create(uuid,text) from public,anon;
revoke all on function public.study_group_question_categories(uuid) from public,anon;
revoke all on function public.study_group_question_create_v2(uuid,text,text,text,text,text,text,uuid,text,text) from public,anon;
revoke all on function public.study_group_questions(uuid,integer,integer) from public,anon;

grant execute on function public.study_group_question_category_create(uuid,text) to authenticated;
grant execute on function public.study_group_question_categories(uuid) to authenticated;
grant execute on function public.study_group_question_create_v2(uuid,text,text,text,text,text,text,uuid,text,text) to authenticated;
grant execute on function public.study_group_questions(uuid,integer,integer) to authenticated;

commit;
