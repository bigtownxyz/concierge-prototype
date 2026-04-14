alter table public.qualifications
  add column if not exists timeline text,
  add column if not exists dependants integer default 0,
  add column if not exists is_us_citizen boolean,
  add column if not exists considering_renouncing boolean,
  add column if not exists constraints text[] default '{}',
  add column if not exists constraint_detail text;
