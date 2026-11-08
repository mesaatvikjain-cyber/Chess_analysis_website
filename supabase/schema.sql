create table if not exists public.chess_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  collections jsonb not null default '[]'::jsonb,
  review_history jsonb not null default '[]'::jsonb,
  games jsonb not null default '[]'::jsonb,
  study_goals jsonb not null default '{"reviews":3,"mistakes":5,"openings":3}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint chess_user_data_collections_array check (jsonb_typeof(collections) = 'array'),
  constraint chess_user_data_review_history_array check (jsonb_typeof(review_history) = 'array'),
  constraint chess_user_data_games_array check (jsonb_typeof(games) = 'array'),
  constraint chess_user_data_study_goals_object check (jsonb_typeof(study_goals) = 'object')
);

alter table public.chess_user_data
  add column if not exists games jsonb not null default '[]'::jsonb;

alter table public.chess_user_data
  add column if not exists study_goals jsonb not null default '{"reviews":3,"mistakes":5,"openings":3}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chess_user_data_games_array'
      and conrelid = 'public.chess_user_data'::regclass
  ) then
    alter table public.chess_user_data
      add constraint chess_user_data_games_array check (jsonb_typeof(games) = 'array');
  end if;
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chess_user_data_study_goals_object'
      and conrelid = 'public.chess_user_data'::regclass
  ) then
    alter table public.chess_user_data
      add constraint chess_user_data_study_goals_object check (jsonb_typeof(study_goals) = 'object');
  end if;
end;
$$;

alter table public.chess_user_data enable row level security;

drop policy if exists "Users can read their own chess data" on public.chess_user_data;
drop policy if exists "Users can create their own chess data" on public.chess_user_data;
drop policy if exists "Users can update their own chess data" on public.chess_user_data;
drop policy if exists "Users can delete their own chess data" on public.chess_user_data;

create policy "Users can read their own chess data"
  on public.chess_user_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.chess_user_data from anon;
grant select, insert, update, delete on public.chess_user_data to authenticated;

create policy "Users can create their own chess data"
  on public.chess_user_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own chess data"
  on public.chess_user_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own chess data"
  on public.chess_user_data for delete
  to authenticated
  using ((select auth.uid()) = user_id);
