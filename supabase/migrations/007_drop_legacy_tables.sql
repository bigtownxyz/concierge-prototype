-- Drop legacy tables from the original Concierge schema that the current app
-- doesn't use. Verified empty (or seed-only for `programs`) and zero references
-- in code. Cascading drop handles their RLS policies, indexes, and any FKs
-- pointing at auth.users that were blocking user deletion.

drop table if exists public.notifications cascade;
drop table if exists public.audit_log cascade;
drop table if exists public.documents cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.applications cascade;
drop table if exists public.milestones cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.programs cascade;
