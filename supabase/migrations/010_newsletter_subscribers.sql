-- Newsletter subscribers — list captured from the footer field and the
-- dedicated /newsletter page. Stored in Concierge Supabase; not yet pushed
-- anywhere downstream. RLS allows anyone to subscribe (insert) but only
-- admins can read the list.

create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text,
  user_agent text,
  unsubscribed_at timestamptz,
  created_at timestamptz default now()
);

-- Case-insensitive uniqueness so "Foo@bar.com" doesn't slip past "foo@bar.com".
create unique index if not exists newsletter_subscribers_email_lower_idx
  on public.newsletter_subscribers (lower(email));

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists "Admins can read subscribers" on public.newsletter_subscribers;
create policy "Admins can read subscribers"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can update subscribers" on public.newsletter_subscribers;
create policy "Admins can update subscribers"
  on public.newsletter_subscribers for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
