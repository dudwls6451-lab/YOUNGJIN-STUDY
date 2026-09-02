-- PilotBank v11.60.49
-- My Page · 나만의 이론정리 / 개인 필기노트
-- Supabase SQL Editor에서 1회 실행. 재실행 가능(idempotent).

create extension if not exists pgcrypto;

create table if not exists public.personal_theory_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  subject text not null default '',
  category text not null default '',
  tags text[] not null default '{}'::text[],
  content text not null default '',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personal_theory_notes_title_len check (char_length(title) between 1 and 140),
  constraint personal_theory_notes_subject_len check (char_length(subject) <= 80),
  constraint personal_theory_notes_category_len check (char_length(category) <= 80),
  constraint personal_theory_notes_content_len check (char_length(content) <= 60000)
);

create index if not exists personal_theory_notes_user_updated_idx
  on public.personal_theory_notes(user_id, is_pinned desc, updated_at desc);

alter table public.personal_theory_notes enable row level security;

-- 기존 이름의 정책만 교체하여 여러 번 실행해도 안전하게 유지합니다.
drop policy if exists personal_theory_notes_own_select on public.personal_theory_notes;
drop policy if exists personal_theory_notes_own_insert on public.personal_theory_notes;
drop policy if exists personal_theory_notes_own_update on public.personal_theory_notes;
drop policy if exists personal_theory_notes_own_delete on public.personal_theory_notes;

create policy personal_theory_notes_own_select
on public.personal_theory_notes for select to authenticated
using (user_id = auth.uid());

create policy personal_theory_notes_own_insert
on public.personal_theory_notes for insert to authenticated
with check (user_id = auth.uid());

create policy personal_theory_notes_own_update
on public.personal_theory_notes for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy personal_theory_notes_own_delete
on public.personal_theory_notes for delete to authenticated
using (user_id = auth.uid());

create or replace function public.pilotbank_personal_theory_notes_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_personal_theory_notes_updated_at on public.personal_theory_notes;
create trigger trg_personal_theory_notes_updated_at
before update on public.personal_theory_notes
for each row execute function public.pilotbank_personal_theory_notes_touch_updated_at();

grant select, insert, update, delete on public.personal_theory_notes to authenticated;
