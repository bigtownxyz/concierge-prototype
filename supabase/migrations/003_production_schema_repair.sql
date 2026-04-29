-- Idempotent repair migration for live projects that drifted behind local schema.
-- Safe to run multiple times in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'client',
  full_name text,
  email text,
  phone text,
  country text,
  nationality text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists role text,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists country text,
  add column if not exists nationality text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.profiles
set role = 'client'
where role is null;

alter table public.profiles
  alter column role set default 'client';

alter table public.profiles
  alter column role set not null;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create table if not exists public.qualifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  strategic_focus text[] default '{}',
  investment_amount integer default 500000,
  timeline text,
  dependants integer default 0,
  is_us_citizen boolean,
  considering_renouncing boolean,
  constraints text[] default '{}',
  constraint_detail text,
  situation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.qualifications
  add column if not exists strategic_focus text[] default '{}',
  add column if not exists investment_amount integer default 500000,
  add column if not exists timeline text,
  add column if not exists dependants integer default 0,
  add column if not exists is_us_citizen boolean,
  add column if not exists considering_renouncing boolean,
  add column if not exists constraints text[] default '{}',
  add column if not exists constraint_detail text,
  add column if not exists situation text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.qualifications enable row level security;

drop policy if exists "Users can manage own qualifications" on public.qualifications;

create policy "Users can manage own qualifications"
  on public.qualifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.qualification_programs (
  id uuid default gen_random_uuid() primary key,
  qualification_id uuid references public.qualifications(id) on delete cascade not null,
  program_slug text not null,
  match_score integer default 0,
  created_at timestamptz default now()
);

alter table public.qualification_programs
  add column if not exists program_slug text,
  add column if not exists match_score integer default 0,
  add column if not exists created_at timestamptz default now();

alter table public.qualification_programs enable row level security;

drop policy if exists "Users can manage own qualification programs" on public.qualification_programs;

create policy "Users can manage own qualification programs"
  on public.qualification_programs for all
  using (
    exists (
      select 1
      from public.qualifications q
      where q.id = qualification_id
        and q.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.qualifications q
      where q.id = qualification_id
        and q.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, email, full_name)
  -- Live DB may require a role column that isn't represented in the local app schema.
  values (
    new.id,
    'client',
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do update
    set role = coalesce(public.profiles.role, 'client'),
        email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, role, email, full_name)
select
  u.id,
  'client',
  u.email,
  u.raw_user_meta_data->>'full_name'
from auth.users u
on conflict (id) do nothing;
