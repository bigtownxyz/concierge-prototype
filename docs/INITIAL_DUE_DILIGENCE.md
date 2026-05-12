# Initial Due Diligence portal

Authenticated 7-step intake form for invited clients. Lives at
`/initial-due-diligence` on both the vercel.app URL and (when DNS resolves)
`thecitizenshipconcierge.com`. The holding-page middleware passes this
route through, so it works on the public domain even while the rest of
the site is in soft launch.

## One-time setup

### 1. Apply the SQL migration

`supabase/migrations/008_due_diligence.sql` creates:

- Table `due_diligence_submissions` with all 7 sections as columns, plus
  audit fields (`submitted_at`, `submitter_ip`, `submitter_user_agent`).
- RLS policies: applicants can read/insert/update **their own** row,
  **only while `submitted_at IS NULL`** — once submitted, the row is
  read-only from the client.
- Storage bucket `dd-passports` (private, 10 MB cap, PDF/PNG/JPG only)
  with RLS that scopes each applicant to a `{user_id}/...` folder.

Apply via either:

- **Supabase Studio** — open SQL Editor, paste the contents of
  `008_due_diligence.sql`, run.
- **Supabase CLI** — `supabase db push` from the project root if you have
  it linked.

### 2. Add the callback URL to Supabase Auth allowlist

Supabase Dashboard → **Authentication → URL Configuration → Redirect URLs**.
Add both of these so invites work on either entry point:

- `https://concierge-proto1231.vercel.app/initial-due-diligence/callback`
- `https://thecitizenshipconcierge.com/initial-due-diligence/callback`
- `https://www.thecitizenshipconcierge.com/initial-due-diligence/callback`

(The DNS-not-live entries are harmless — they only matter once the magic
link is clicked. The vercel.app one works today.)

## Inviting an applicant

### Option A — script (recommended)

From the project root:

```powershell
node scripts/invite-dd-applicant.mjs client@example.com
node scripts/invite-dd-applicant.mjs client@example.com "Real Name"
node scripts/invite-dd-applicant.mjs client@example.com "Real Name" "ChosenTempPass!"
```

The script:

1. Reads `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from
   `.env.local`.
2. Creates an auth user with a temporary password (random, or the value
   you pass as the 3rd arg). Email is auto-confirmed — no magic link.
3. Stamps `app_metadata`:
   - `is_dd_applicant: true` — middleware pins them to the DD portal
   - `must_change_password: true` — middleware forces a password change
     on first sign-in before they can see the wizard
4. Prints three lines: **Login URL · Email · Temp password**

Send those three lines to your client over any channel (email, Telegram,
Signal, etc.). On first sign-in they'll be routed to `/set-password`
automatically; once they change it, the must-change flag is cleared by
the server and they proceed to the wizard.

If a user with that email already exists, run with `--reset` to wipe
and re-invite:

```powershell
node scripts/invite-dd-applicant.mjs --reset client@example.com
```

### Option B — Supabase Dashboard

Authentication → Users → **Invite user** → paste email → Invite. This
sends the link with the project's **Site URL** as redirect target rather
than our callback route, so the applicant lands on the homepage. They'd
then need to navigate to `/initial-due-diligence` themselves and click
the magic-link button to re-auth. Workable but less smooth than the
script. Prefer Option A.

## What happens next

1. Applicant gets email, clicks the link.
2. Lands on `/initial-due-diligence/callback?code=…`.
3. The callback exchanges the code for a Supabase session, redirects to
   `/initial-due-diligence/set-password`.
4. Applicant chooses a password (min 8 chars), redirected to the wizard.
5. Wizard auto-creates an empty `due_diligence_submissions` row on first
   visit, then steps through 7 sections, saving on each "Continue".
6. On final submit: `submitted_at` set, IP/UA captured, notification
   email fires to `CONTACT_NOTIFY_TO` (or `GMAIL_FROM` / `GMAIL_USER`
   fallback) — the email includes a signed download URL for the passport
   that expires in 7 days.
7. Applicant lands on `/initial-due-diligence/submitted` (read-only).

## Where the data lives

| Thing | Location |
|---|---|
| Form responses | `public.due_diligence_submissions` row, keyed by `user_id` |
| Passport file | Supabase Storage bucket `dd-passports`, path `{user_id}/passport.{ext}` |
| Audit (IP, UA, timestamps) | columns on the submission row |
| Notification email body | rendered server-side, includes a 7-day signed URL for the passport |

## Reopening a submitted application

RLS blocks client-side edits once `submitted_at IS NOT NULL`. If an
applicant needs to amend, the advisor must clear `submitted_at` on the
row (run in Supabase Studio SQL editor with a service-role context):

```sql
UPDATE public.due_diligence_submissions
   SET submitted_at = NULL, submitter_ip = NULL, submitter_user_agent = NULL
 WHERE user_id = '<applicant-user-id>';
```

After this, the applicant can return to `/initial-due-diligence` and
continue editing as if they hadn't submitted yet.

## Removing the holding-page exception

When the public domain is ready to serve the real site (i.e. the
coming-soon middleware is being removed), the DD route handling can
stay as-is — it's already independent of the holding mechanism and
works on every host.
