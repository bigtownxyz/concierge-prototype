-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Extends auth.users with additional profile data

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  country text,
  nationality text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ─── Qualifications ───────────────────────────────────────────────────────────
-- Stores the results of the qualification form

create table if not exists public.qualifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  strategic_focus text[] default '{}',
  investment_amount integer default 500000,
  situation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.qualifications enable row level security;

create policy "Users can manage own qualifications"
  on public.qualifications for all
  using (auth.uid() = user_id);

-- ─── Qualification Programs ────────────────────────────────────────────────────
-- The programs selected/matched for a given qualification

create table if not exists public.qualification_programs (
  id uuid default gen_random_uuid() primary key,
  qualification_id uuid references public.qualifications(id) on delete cascade not null,
  program_slug text not null,
  match_score integer default 0,
  created_at timestamptz default now()
);

alter table public.qualification_programs enable row level security;

create policy "Users can manage own qualification programs"
  on public.qualification_programs for all
  using (
    exists (
      select 1
      from public.qualifications q
      where q.id = qualification_id
        and q.user_id = auth.uid()
    )
  );

-- ─── Auto-create profile on signup ────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists to allow re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
