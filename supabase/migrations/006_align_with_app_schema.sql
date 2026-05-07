-- Apply on bhujlerwneesihhliuov to bring the original Concierge project's schema
-- in line with what the app expects. Idempotent except for the explicit DROP
-- COLUMN lines, which target legacy fields the app doesn't use.
--
-- Run via: Supabase Dashboard → SQL Editor → New Query → paste → Run.

create extension if not exists pgcrypto;

-- ─── profiles ────────────────────────────────────────────────────────────────

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

update public.profiles set role = 'client' where role is null;

alter table public.profiles
  alter column role set default 'client',
  alter column role set not null;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ─── qualifications ──────────────────────────────────────────────────────────
-- Drop legacy columns from the old schema (app uses different names/types).
-- Test-only project: existing rows lose these values, which is fine.

alter table public.qualifications
  drop column if exists current_citizenship,
  drop column if exists budget,
  drop column if exists primary_goal,
  drop column if exists important_factor,
  drop column if exists plan_to_renounce,
  drop column if exists recommended_programs,
  drop column if exists lead_status,
  drop column if exists utm_source,
  drop column if exists utm_medium,
  drop column if exists utm_campaign,
  drop column if exists referrer,
  drop column if exists dependents,         -- old spelling, app uses 'dependants'
  drop column if exists constraints;        -- old type was text, app expects text[]

-- Add fresh columns the app uses.
alter table public.qualifications
  add column if not exists strategic_focus text[] default '{}',
  add column if not exists investment_amount integer default 500000,
  add column if not exists timeline text,
  add column if not exists dependants integer default 0,
  add column if not exists family_members jsonb default '[]'::jsonb,
  add column if not exists is_us_citizen boolean,
  add column if not exists considering_renouncing boolean,
  add column if not exists constraints text[] default '{}',
  add column if not exists constraint_detail text,
  add column if not exists situation text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

comment on column public.qualifications.family_members is
  'Structured list of dependants. Each item: { id, relation: spouse|parent|sibling|child, nationality, age }.';

alter table public.qualifications enable row level security;

drop policy if exists "Users can manage own qualifications" on public.qualifications;
create policy "Users can manage own qualifications"
  on public.qualifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── qualification_programs ──────────────────────────────────────────────────

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
  using (exists (select 1 from public.qualifications q where q.id = qualification_id and q.user_id = auth.uid()))
  with check (exists (select 1 from public.qualifications q where q.id = qualification_id and q.user_id = auth.uid()));

-- ─── contact_messages ────────────────────────────────────────────────────────

create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  subject text,
  message text not null,
  notified boolean default false,
  notify_error text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message" on public.contact_messages for insert with check (true);

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages" on public.contact_messages for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages" on public.contact_messages for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── handle_new_user trigger ─────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, email, full_name)
  values (new.id, 'client', new.email, new.raw_user_meta_data->>'full_name')
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
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- Backfill any existing auth.users without a profile row
insert into public.profiles (id, role, email, full_name)
select u.id, 'client', u.email, u.raw_user_meta_data->>'full_name'
from auth.users u
on conflict (id) do nothing;
