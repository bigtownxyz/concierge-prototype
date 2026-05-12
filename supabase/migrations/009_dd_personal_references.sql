-- 009_dd_personal_references.sql
-- Adds a "Personal References" step to the DD wizard.
-- New JSONB column stores an array of { platform, url } entries.

ALTER TABLE public.due_diligence_submissions
  ADD COLUMN IF NOT EXISTS personal_references JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.due_diligence_submissions.personal_references IS
  'Array of {platform, url} entries — social media + online profiles.';

-- Wizard step range grows from 1..7 to 1..8 to accommodate the new section.
ALTER TABLE public.due_diligence_submissions
  DROP CONSTRAINT IF EXISTS due_diligence_submissions_current_step_check;

ALTER TABLE public.due_diligence_submissions
  ADD CONSTRAINT due_diligence_submissions_current_step_check
  CHECK (current_step BETWEEN 1 AND 8);
