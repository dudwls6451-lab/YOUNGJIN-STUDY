-- PilotBank v11.60.42 · cross-device annotations
-- Run once in Supabase SQL Editor before deploying the web patch.
-- Stores the editable highlight/freehand annotation state for Aviwiki,
-- 고정익항공기를 위한 운항기술기준(FSR), and ICAO Doc 8168 Vol. I.

create table if not exists public.pilotbank_study_annotations (
  user_id uuid not null references auth.users(id) on delete cascade,
  surface_key text not null,
  content_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, surface_key, content_key),
  constraint pilotbank_study_annotations_surface_key_chk
    check (surface_key in ('aviwiki','fsr','icao8168'))
);

create index if not exists pilotbank_study_annotations_user_updated_idx
  on public.pilotbank_study_annotations (user_id, updated_at desc);

alter table public.pilotbank_study_annotations enable row level security;

revoke all on public.pilotbank_study_annotations from anon;
grant select, insert, update, delete on public.pilotbank_study_annotations to authenticated;

drop policy if exists pilotbank_study_annotations_select_own on public.pilotbank_study_annotations;
create policy pilotbank_study_annotations_select_own
  on public.pilotbank_study_annotations
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists pilotbank_study_annotations_insert_own on public.pilotbank_study_annotations;
create policy pilotbank_study_annotations_insert_own
  on public.pilotbank_study_annotations
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists pilotbank_study_annotations_update_own on public.pilotbank_study_annotations;
create policy pilotbank_study_annotations_update_own
  on public.pilotbank_study_annotations
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists pilotbank_study_annotations_delete_own on public.pilotbank_study_annotations;
create policy pilotbank_study_annotations_delete_own
  on public.pilotbank_study_annotations
  for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.pilotbank_study_annotations is
  'Private per-user editable highlights and freehand annotations synced across devices.';
