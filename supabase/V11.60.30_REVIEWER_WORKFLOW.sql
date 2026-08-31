-- PilotBank v11.60.30
-- 부관리자 + 검수 모드 + 문제/이론 수정안 + 관리자/부관리자 2-role 승인 배포
-- Re-runnable. Existing user/question data is preserved.

begin;

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists is_subadmin boolean not null default false;

-- Existing published question override table (created by v11.60.13).
create table if not exists public.question_overrides (
  question_id text primary key,
  subject text,
  question_text text not null check (char_length(btrim(question_text)) > 0),
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) >= 2),
  answer text not null check (char_length(btrim(answer)) between 1 and 8),
  explanation text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.theory_overrides (
  subject text not null,
  stage_id text not null,
  stage_payload jsonb not null check (jsonb_typeof(stage_payload) = 'object'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (subject, stage_id)
);

create table if not exists public.review_change_proposals (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('question','theory')),
  content_key text not null check (char_length(btrim(content_key)) > 0),
  subject text not null check (char_length(btrim(subject)) > 0),
  stage_id text,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  base_snapshot jsonb,
  summary text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  rejected_by uuid references auth.users(id) on delete set null
);

create unique index if not exists review_change_proposals_one_pending_per_item
  on public.review_change_proposals(content_type, content_key)
  where status = 'pending';
create index if not exists review_change_proposals_created_idx
  on public.review_change_proposals(created_at desc);

create table if not exists public.review_change_approvals (
  proposal_id uuid not null references public.review_change_proposals(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('approve','reject')),
  role_at_decision text not null check (role_at_decision in ('admin','subadmin')),
  decided_at timestamptz not null default now(),
  primary key (proposal_id, reviewer_id)
);

create or replace function public.pilotbank_is_reviewer(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.approval_status = 'approved'
      and (coalesce(p.is_admin,false) or coalesce(p.is_subadmin,false))
  );
$$;

create or replace function public.pilotbank_review_current_role()
returns table (
  user_id uuid,
  is_admin boolean,
  is_subadmin boolean,
  can_review boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id,
         coalesce(p.is_admin,false),
         coalesce(p.is_subadmin,false),
         (p.approval_status='approved' and (coalesce(p.is_admin,false) or coalesce(p.is_subadmin,false)))
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.pilotbank_review_members_admin()
returns table (
  user_id uuid,
  username text,
  email text,
  approval_status text,
  is_admin boolean,
  is_subadmin boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.pilotbank_is_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;
  return query
  select p.id,
         p.username::text,
         p.email::text,
         p.approval_status::text,
         coalesce(p.is_admin,false),
         coalesce(p.is_subadmin,false)
  from public.profiles p
  where p.approval_status='approved'
  order by coalesce(p.is_admin,false) desc, coalesce(p.is_subadmin,false) desc, coalesce(nullif(btrim(p.username),''),p.email,'') asc;
end;
$$;

create or replace function public.pilotbank_set_subadmin(p_user_id uuid, p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin boolean;
  v_status text;
begin
  if auth.uid() is null or not public.pilotbank_is_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;
  select coalesce(is_admin,false), approval_status into v_admin, v_status
  from public.profiles where id=p_user_id;
  if not found then raise exception 'Member not found'; end if;
  if v_status <> 'approved' then raise exception 'Only approved members can be subadmins'; end if;
  if v_admin then raise exception 'Admin accounts already have review access and cannot be assigned as subadmin'; end if;
  update public.profiles set is_subadmin=coalesce(p_enabled,false) where id=p_user_id;
  return coalesce(p_enabled,false);
end;
$$;

create or replace function public.pilotbank_review_submit_proposal(
  p_content_type text,
  p_content_key text,
  p_subject text,
  p_stage_id text,
  p_payload jsonb,
  p_base_snapshot jsonb default null,
  p_summary text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then
    raise exception 'Reviewer access required';
  end if;
  if p_content_type not in ('question','theory') then raise exception 'Invalid content type'; end if;
  if btrim(coalesce(p_content_key,''))='' or btrim(coalesce(p_subject,''))='' then raise exception 'Content key and subject are required'; end if;
  if p_content_type='theory' and btrim(coalesce(p_stage_id,''))='' then raise exception 'Theory stage id is required'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'Payload must be a JSON object'; end if;
  if exists(select 1 from public.review_change_proposals where content_type=p_content_type and content_key=p_content_key and status='pending') then
    raise exception 'A pending proposal already exists for this item';
  end if;

  insert into public.review_change_proposals(content_type,content_key,subject,stage_id,payload,base_snapshot,summary,created_by)
  values(p_content_type,btrim(p_content_key),btrim(p_subject),nullif(btrim(coalesce(p_stage_id,'')),''),p_payload,p_base_snapshot,left(coalesce(p_summary,''),1000),auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.pilotbank_review_list_proposals()
returns table (
  id uuid,
  content_type text,
  content_key text,
  subject text,
  stage_id text,
  summary text,
  payload jsonb,
  base_snapshot jsonb,
  status text,
  created_at timestamptz,
  published_at timestamptz,
  created_by uuid,
  created_by_name text,
  admin_approved boolean,
  subadmin_approved boolean,
  my_decision text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then
    raise exception 'Reviewer access required';
  end if;
  return query
  select p.id,p.content_type,p.content_key,p.subject,p.stage_id,p.summary,p.payload,p.base_snapshot,p.status,p.created_at,p.published_at,p.created_by,
         coalesce(nullif(btrim(pr.username),''),pr.email,p.created_by::text)::text,
         exists(select 1 from public.review_change_approvals a where a.proposal_id=p.id and a.decision='approve' and a.role_at_decision='admin')::boolean,
         exists(select 1 from public.review_change_approvals a where a.proposal_id=p.id and a.decision='approve' and a.role_at_decision='subadmin')::boolean,
         (select a.decision from public.review_change_approvals a where a.proposal_id=p.id and a.reviewer_id=auth.uid() limit 1)::text
  from public.review_change_proposals p
  left join public.profiles pr on pr.id=p.created_by
  order by case p.status when 'pending' then 0 when 'published' then 1 else 2 end, p.created_at desc;
end;
$$;

create or replace function public.pilotbank_review_decide_proposal(p_proposal_id uuid, p_decision text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_prop public.review_change_proposals%rowtype;
  v_admin_ok boolean;
  v_subadmin_ok boolean;
begin
  if auth.uid() is null or not public.pilotbank_is_reviewer(auth.uid()) then
    raise exception 'Reviewer access required';
  end if;
  if p_decision not in ('approve','reject') then raise exception 'Decision must be approve or reject'; end if;

  select case when coalesce(p.is_admin,false) then 'admin' else 'subadmin' end
    into v_role
  from public.profiles p
  where p.id=auth.uid() and p.approval_status='approved' and (coalesce(p.is_admin,false) or coalesce(p.is_subadmin,false));
  if v_role is null then raise exception 'Reviewer role not found'; end if;

  select * into v_prop from public.review_change_proposals where id=p_proposal_id for update;
  if not found then raise exception 'Proposal not found'; end if;
  if v_prop.status <> 'pending' then return v_prop.status; end if;

  insert into public.review_change_approvals(proposal_id,reviewer_id,decision,role_at_decision,decided_at)
  values(v_prop.id,auth.uid(),p_decision,v_role,now())
  on conflict(proposal_id,reviewer_id) do update
    set decision=excluded.decision, role_at_decision=excluded.role_at_decision, decided_at=excluded.decided_at;

  if p_decision='reject' then
    update public.review_change_proposals
       set status='rejected', rejected_at=now(), rejected_by=auth.uid()
     where id=v_prop.id;
    return 'rejected';
  end if;

  select exists(select 1 from public.review_change_approvals a where a.proposal_id=v_prop.id and a.decision='approve' and a.role_at_decision='admin'),
         exists(select 1 from public.review_change_approvals a where a.proposal_id=v_prop.id and a.decision='approve' and a.role_at_decision='subadmin')
    into v_admin_ok,v_subadmin_ok;

  if not (v_admin_ok and v_subadmin_ok) then return 'pending'; end if;

  if v_prop.content_type='question' then
    if btrim(coalesce(v_prop.payload->>'question_text',''))='' then raise exception 'Published question text is empty'; end if;
    if jsonb_typeof(v_prop.payload->'choices') <> 'array' or jsonb_array_length(v_prop.payload->'choices') < 2 then raise exception 'Published question choices are invalid'; end if;
    if btrim(coalesce(v_prop.payload->>'answer',''))='' then raise exception 'Published question answer is empty'; end if;
    insert into public.question_overrides(question_id,subject,question_text,choices,answer,explanation,updated_by,updated_at)
    values(v_prop.content_key,v_prop.subject,v_prop.payload->>'question_text',v_prop.payload->'choices',upper(v_prop.payload->>'answer'),coalesce(v_prop.payload->>'explanation',''),auth.uid(),now())
    on conflict(question_id) do update set
      subject=excluded.subject,
      question_text=excluded.question_text,
      choices=excluded.choices,
      answer=excluded.answer,
      explanation=excluded.explanation,
      updated_by=excluded.updated_by,
      updated_at=excluded.updated_at;
  else
    insert into public.theory_overrides(subject,stage_id,stage_payload,updated_by,updated_at)
    values(v_prop.subject,v_prop.stage_id,v_prop.payload,auth.uid(),now())
    on conflict(subject,stage_id) do update set
      stage_payload=excluded.stage_payload,
      updated_by=excluded.updated_by,
      updated_at=excluded.updated_at;
  end if;

  update public.review_change_proposals
     set status='published', published_at=now(), published_by=auth.uid()
   where id=v_prop.id;
  return 'published';
end;
$$;

-- RLS: published overlays are readable by approved members. Draft/review workflow is reviewer-only.
alter table public.theory_overrides enable row level security;
alter table public.review_change_proposals enable row level security;
alter table public.review_change_approvals enable row level security;

revoke all on public.theory_overrides from anon, authenticated;
grant select on public.theory_overrides to authenticated;
drop policy if exists theory_overrides_approved_read on public.theory_overrides;
create policy theory_overrides_approved_read on public.theory_overrides for select to authenticated
using (public.pilotbank_is_approved(auth.uid()));

revoke all on public.review_change_proposals from anon, authenticated;
grant select on public.review_change_proposals to authenticated;
drop policy if exists review_change_proposals_reviewer_read on public.review_change_proposals;
create policy review_change_proposals_reviewer_read on public.review_change_proposals for select to authenticated
using (public.pilotbank_is_reviewer(auth.uid()));

revoke all on public.review_change_approvals from anon, authenticated;
grant select on public.review_change_approvals to authenticated;
drop policy if exists review_change_approvals_reviewer_read on public.review_change_approvals;
create policy review_change_approvals_reviewer_read on public.review_change_approvals for select to authenticated
using (public.pilotbank_is_reviewer(auth.uid()));

revoke all on function public.pilotbank_is_reviewer(uuid) from public, anon;
revoke all on function public.pilotbank_review_current_role() from public, anon;
revoke all on function public.pilotbank_review_members_admin() from public, anon;
revoke all on function public.pilotbank_set_subadmin(uuid,boolean) from public, anon;
revoke all on function public.pilotbank_review_submit_proposal(text,text,text,text,jsonb,jsonb,text) from public, anon;
revoke all on function public.pilotbank_review_list_proposals() from public, anon;
revoke all on function public.pilotbank_review_decide_proposal(uuid,text) from public, anon;

grant execute on function public.pilotbank_is_reviewer(uuid) to authenticated;
grant execute on function public.pilotbank_review_current_role() to authenticated;
grant execute on function public.pilotbank_review_members_admin() to authenticated;
grant execute on function public.pilotbank_set_subadmin(uuid,boolean) to authenticated;
grant execute on function public.pilotbank_review_submit_proposal(text,text,text,text,jsonb,jsonb,text) to authenticated;
grant execute on function public.pilotbank_review_list_proposals() to authenticated;
grant execute on function public.pilotbank_review_decide_proposal(uuid,text) to authenticated;

commit;
