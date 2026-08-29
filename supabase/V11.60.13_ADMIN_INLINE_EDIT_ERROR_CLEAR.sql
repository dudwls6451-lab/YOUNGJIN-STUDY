-- PilotBank v11.60.13
-- 관리자 인라인 문제 수정 + 보고된 오류 전체 삭제
-- v11.60.0 FULL SQL(특히 public.pilotbank_is_admin / pilotbank_is_approved) 적용 후 실행.
-- Re-runnable.

begin;

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

create index if not exists question_overrides_updated_idx
  on public.question_overrides(updated_at desc);

alter table public.question_overrides enable row level security;

revoke all on public.question_overrides from anon, authenticated;
grant select, insert, update, delete on public.question_overrides to authenticated;

drop policy if exists question_overrides_approved_read on public.question_overrides;
create policy question_overrides_approved_read
on public.question_overrides for select to authenticated
using (public.pilotbank_is_approved(auth.uid()));

drop policy if exists question_overrides_admin_insert on public.question_overrides;
create policy question_overrides_admin_insert
on public.question_overrides for insert to authenticated
with check (
  public.pilotbank_is_admin(auth.uid())
  and (updated_by is null or updated_by = auth.uid())
);

drop policy if exists question_overrides_admin_update on public.question_overrides;
create policy question_overrides_admin_update
on public.question_overrides for update to authenticated
using (public.pilotbank_is_admin(auth.uid()))
with check (
  public.pilotbank_is_admin(auth.uid())
  and (updated_by is null or updated_by = auth.uid())
);

drop policy if exists question_overrides_admin_delete on public.question_overrides;
create policy question_overrides_admin_delete
on public.question_overrides for delete to authenticated
using (public.pilotbank_is_admin(auth.uid()));

-- 관리자 오류 보고 전체 삭제.
-- 보고만 지우면 사용자의 user_question_progress.error_reported=true가 남아
-- 다음 접속 때 동일 보고가 다시 '전송 대기'로 살아날 수 있으므로,
-- 삭제 대상 보고와 대응하는 서버 ERROR 플래그도 함께 해제한다.
create or replace function public.pilotbank_admin_clear_error_reports()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer := 0;
begin
  if auth.uid() is null or not public.pilotbank_is_admin(auth.uid()) then
    raise exception 'Admin access required';
  end if;

  update public.user_question_progress p
     set error_reported = false,
         error_reported_at = null,
         error_note = ''
   where exists (
     select 1
       from public.error_reports r
      where r.user_id = p.user_id
        and r.question_id = p.question_id
   );

  delete from public.error_reports;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.pilotbank_admin_clear_error_reports() from public, anon;
grant execute on function public.pilotbank_admin_clear_error_reports() to authenticated;

commit;
