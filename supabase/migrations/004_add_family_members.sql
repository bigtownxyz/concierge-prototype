alter table public.qualifications
  add column if not exists family_members jsonb default '[]'::jsonb;

comment on column public.qualifications.family_members is
  'Structured list of dependants. Each item: { id, relation: spouse|parent|sibling|child, nationality, age }. The dependants integer column is kept as a derived count for backward compatibility.';
