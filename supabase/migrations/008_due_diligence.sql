-- 008_due_diligence.sql
-- Initial Due Diligence (DD/BG) intake form schema.
-- Powers the /initial-due-diligence wizard at thecitizenshipconcierge.com.
--
-- One submission per auth.users row. Applicant invites are issued via
-- Supabase Auth Admin (Dashboard → Auth → Users → Invite). The wizard
-- auto-creates the submission row on first visit if one doesn't exist.
-- Once submitted_at is set, RLS makes the row read-only — applicants
-- cannot edit a finalized DD via the JS console.

-- ──────────────────────────────────────────────────────────────────────────
-- Table
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.due_diligence_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- START
  first_name                       TEXT,
  middle_name                      TEXT,
  last_name                        TEXT,
  country_of_birth                 TEXT,
  date_of_birth                    DATE,
  has_government_birth_certificate BOOLEAN,
  address_street                   TEXT,
  address_city                     TEXT,
  address_state                    TEXT,
  address_country                  TEXT,
  address_postcode                 TEXT,
  marital_status                   TEXT,

  -- PASSPORT
  passport_issuing_country TEXT,
  passport_file_path       TEXT, -- Supabase Storage object path within dd-passports bucket

  -- APPLICANTS — array of { name, relationship }
  is_sole_applicant      BOOLEAN,
  additional_applicants  JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- FUNDS
  employment_status TEXT,
  funds_source      TEXT,
  investment_method TEXT CHECK (investment_method IS NULL OR investment_method IN ('bank_transfer', 'crypto')),

  -- NET WORTH — single number per category + free-form notes
  nw_bank_savings     NUMERIC(20, 2),
  nw_investments      NUMERIC(20, 2),
  nw_real_estate      NUMERIC(20, 2),
  nw_business_assets  NUMERIC(20, 2),
  nw_crypto           NUMERIC(20, 2),
  nw_notes            TEXT,

  -- SECURITY (5 yes/no questions)
  security_visa_denied              BOOLEAN,
  security_criminal_investigation   BOOLEAN,
  security_threat                   BOOLEAN,
  security_communicable_disease     BOOLEAN,
  security_prior_cbi_application    BOOLEAN,

  -- POLICE RECORDS
  police_records_notes TEXT,

  -- Wizard progress (1..7), bumps as the applicant advances
  current_step SMALLINT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 7),

  -- Submit audit
  submitted_at         TIMESTAMPTZ,
  submitter_ip         TEXT,
  submitter_user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.due_diligence_submissions IS
  'Initial DD/BG intake from invited applicants. One row per auth user; locked read-only once submitted_at is set.';

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_dd_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dd_touch_updated_at ON public.due_diligence_submissions;
CREATE TRIGGER trg_dd_touch_updated_at
  BEFORE UPDATE ON public.due_diligence_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_dd_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE public.due_diligence_submissions ENABLE ROW LEVEL SECURITY;

-- Applicant can read their own row
DROP POLICY IF EXISTS "dd: applicant reads own submission"
  ON public.due_diligence_submissions;
CREATE POLICY "dd: applicant reads own submission"
  ON public.due_diligence_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Applicant can insert their own row (used by the wizard on first visit if no
-- row exists yet). user_id must equal their auth.uid().
DROP POLICY IF EXISTS "dd: applicant creates own submission"
  ON public.due_diligence_submissions;
CREATE POLICY "dd: applicant creates own submission"
  ON public.due_diligence_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Applicant can update their own row ONLY while it's not yet submitted.
-- This is the critical compliance guard — without it a client could re-edit
-- a finalized DD by calling supabase.from().update() in the browser console.
--
-- USING is evaluated against the EXISTING row (gates which rows are even
-- visible/targetable). WITH CHECK is evaluated against the row's POST-UPDATE
-- state, so it must NOT require submitted_at IS NULL — otherwise the act of
-- setting submitted_at = now() would fail its own check predicate.
DROP POLICY IF EXISTS "dd: applicant updates own submission while open"
  ON public.due_diligence_submissions;
CREATE POLICY "dd: applicant updates own submission while open"
  ON public.due_diligence_submissions
  FOR UPDATE
  USING (auth.uid() = user_id AND submitted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Storage bucket for passport uploads
-- ──────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dd-passports',
  'dd-passports',
  FALSE,                                              -- private
  10485760,                                           -- 10 MB cap
  ARRAY['image/png','image/jpeg','image/jpg','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: applicant can upload/read/replace files under their own
-- {user_id}/ folder. They cannot list or touch anyone else's files.
DROP POLICY IF EXISTS "dd-passports: applicant uploads own"
  ON storage.objects;
CREATE POLICY "dd-passports: applicant uploads own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'dd-passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "dd-passports: applicant reads own"
  ON storage.objects;
CREATE POLICY "dd-passports: applicant reads own"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'dd-passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "dd-passports: applicant replaces own"
  ON storage.objects;
CREATE POLICY "dd-passports: applicant replaces own"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'dd-passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'dd-passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "dd-passports: applicant deletes own"
  ON storage.objects;
CREATE POLICY "dd-passports: applicant deletes own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'dd-passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Note: service-role queries bypass RLS, so the server can read any file for
-- review/export without additional policies.
