-- PilotBank v11.60.44
-- 보고된 오류 전체 삭제 safe-update hotfix
-- 증상: DELETE requires a WHERE clause
-- v11.60.13 및 v11.60.30 이후 재실행 가능.

begin;

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

  -- 보고만 삭제하면 사용자 progress의 ERROR 플래그가 남아 다시 전송대기로 살아날 수 있으므로 함께 해제.
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

  -- Supabase/pg-safeupdate 환경은 WHERE 없는 DELETE를 거부한다.
  -- error_reports.id는 관리자 화면에서도 조회하는 row identifier이며 NULL이 아닌 행만 삭제하여 전체 삭제 의도를 유지한다.
  delete from public.error_reports r
   where r.id is not null;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.pilotbank_admin_clear_error_reports() from public, anon;
grant execute on function public.pilotbank_admin_clear_error_reports() to authenticated;

commit;
