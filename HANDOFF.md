# Concierge Prototype: Handoff

Last updated: 2026-05-21

This document orients a future Claude session working on this repo. Read it
before making changes.

## What this is

ConciergeDashboard2 is the **Concierge** marketing site + applicant portal: a
Next.js app for a citizenship / residency-by-investment advisory. The brand
name is just "Concierge" (never "Learning Crypto Concierge" or "LC
Concierge"). The business is Dubai/UAE-based.

- **Stack:** Next.js 15.5 (App Router, Turbopack), React 19, Supabase
  (auth + Postgres), Tailwind, framer-motion, next-intl (`[locale]` segment).
- **Repo:** local at `C:\Users\mbini\Coding\ConciergeDashboard2`.
- **Git remote:** `prototype` → `github.com/bigtownxyz/concierge-prototype`.
  Working branch is `master`. Push with `git push prototype master`.
- **Deploy:** Vercel auto-builds `master`. Prototype URL:
  `https://concierge-proto1231.vercel.app`.

## Run / build

```
npm run dev      # local dev (Turbopack)
npm run build    # production build — use THIS to verify, see note below
```

Note: `npx tsc --noEmit` reports pre-existing type errors (in
`app/[locale]/(auth)/callback/route.ts` and `program-detail.tsx`) that are
NOT from recent work and do not block the build. Verify with `npm run build`
(or `npx next build`), which passes clean.

When running build commands via Bash, always `cd` to the project root first.
An earlier session ran a build from inside `public/images/programs/` and
committed a stray `.next/` artifact there.

## The two enquiry flows (most important concept)

There are **two** ways a visitor becomes a lead. They are deliberately
separate and route to different pages.

### 1. Quiz flow — `QualifyModal`
- File: `components/shared/QualifyModal.tsx`. Mounted globally via
  `QualifyModalGlobal` (event `open-qualify-modal`).
- For users who don't know which programme they want. 4-step discovery quiz
  that scores and ranks programmes.
- Writes a `qualifications` row with **`strategic_focus` populated**.
- Lands the user on **`/results`** (radar scores + match analysis).
- Still in use — triggered from programme detail pages and the portal.

### 2. Programme-first flow — `ApplyForProgrammeModal`
- File: `components/shared/ApplyForProgrammeModal.tsx`. Mounted globally via
  `ApplyModalGlobal` (event `open-apply-modal`). This is the **primary**
  flow on the landing page (`landing-v2`).
- For users who already picked programme(s). 5-step modal.
- Writes a `qualifications` row with **`strategic_focus = []`** (empty).
- Lands the user on **`/application`** (their application overview).
- Submission pipeline: `lib/concierge-apply-signup.ts`.

### Routing rule (how the two pages stay correct)
- `qualifications.strategic_focus` non-empty → **quiz user** → `/results`.
- `qualifications.strategic_focus` empty → **enquiry user** → `/application`.
- Each page mirror-redirects if a user lands on the wrong one:
  `results/page.tsx` sends empty-focus users to `/application`;
  `application/page.tsx` sends populated-focus users to `/results`.
- "My Account" / "My Application" nav links point at `/application`
  (`Navbar.tsx`, `PreviewShell.tsx`). The mirror-redirect handles quiz users.

The route `/application` was renamed from `/application-received` this
session. It is an ongoing "application overview", not a one-time
confirmation page.

### Returning authed users
- Reopening `ApplyForProgrammeModal` while signed in pre-fills profile +
  prior qualification (no refilling). See the `loadAuthAndPrefill` effect.
- On a programme card / detail page, an authed user with an existing
  application gets a one-click **"Add"** button instead of the modal —
  `addProgrammeToApplication(slug)` in `lib/concierge-apply-signup.ts`
  writes straight to `qualification_programs` and routes to `/application`.

## The PROGRAMS data model

All programmes live in `lib/constants.ts` as the `PROGRAMS` array (typed by
the `Program` interface). The array is kept **sorted alphabetically by
`country`** — there is a one-off script pattern in session history; keep new
entries in alphabetical position by hand or re-run a sort.

To add or edit a programme:
1. Edit the entry in `lib/constants.ts`.
2. If it needs a hero image, drop `public/images/programs/{slug}.jpg` AND add
   the slug to `PROGRAM_IMAGE_SLUGS` (also in `constants.ts`). Cards without
   a registered image fall back to a region gradient — no broken images.
3. New `region` values must be added to `REGIONS` (constants.ts) and to
   `REGION_GRADIENTS` + `REGION_ACCENT` in `programs-grid.tsx`.
4. ISO short codes for the apply modal pills live in `programmeShortLabel`
   inside `ApplyForProgrammeModal.tsx`.

Flags worth knowing on `Program`:
- `comingSoon?: boolean` — lists the programme but closes enquiries. Shows an
  amber "Coming soon" badge, greys out the CTA, and
  `addProgrammeToApplication` refuses the slug server-side. Currently set on
  **Argentina**.
- `featured`, `exclusive` — badges. `featured` is suppressed when
  `comingSoon` is also set.

The `/programs` grid (`programs-grid.tsx`) has a **Sort by** dropdown
(`SORT_OPTIONS`): Country A–Z (default), Z–A, lowest/highest investment,
fastest processing, most visa-free.

## What changed this session (2026-05-20 / 05-21)

In commit order (all on `master`, pushed to `prototype`):

- Nav links + enquiry post-submit now land on `/application`; route renamed
  from `/application-received`; page reframed as an overview.
- Authed users skip refilling the apply modal; one-click "Add" for adding a
  programme to an existing application; CTAs show "Add +" / grey out when
  already on the application.
- Landing focus-route card swapped from UAE to Panama.
- Programme minimums updated: Panama 300k, St Kitts 300k, Grenada 275k,
  Antigua 270k, El Salvador 1,021,999, Chile 500k, Serbia 400k.
- Added 3 CBI programmes: Sao Tome & Principe, Vanuatu, Sierra Leone
  (+ new `africa` region). Hero images generated via higgsfield Soul
  Location and committed.
- Graceful image fallback (`PROGRAM_IMAGE_SLUGS`).
- PROGRAMS sorted alphabetically by country.
- Sort-by dropdown added; Argentina flagged `comingSoon`.
- The four landing sections below "A wider read on six real pathways"
  (Advisory process, Why Concierge, Testimonials, FAQ) were visually
  redesigned in `components/landing-v2/LandingV2Page.tsx`.

## Open items / known limitations

1. **Email-confirm flickers through `/results`.** Supabase only honours
   `emailRedirectTo` URLs on its allowlist; `/results` is allowlisted,
   `/application` is not. New enquiry users who confirm via email land on
   `/results`, which auto-redirects to `/application` — functional but with a
   visible flicker. Real fix: add `/application` to the Supabase dashboard
   URL allowlist, then change the `next=` param in
   `lib/concierge-apply-signup.ts` (`submitApplicationSignup`). Code-only
   change is not enough.

2. **Mirror-redirects are client-side.** The `/results` ↔ `/application`
   guards run in a `useEffect` after the Supabase call, so there is a brief
   loading state before redirect. Converting the page guards to Server
   Components would remove the flicker. Offered, not yet done.

3. **New programme data is partly fabricated.** Sao Tome, Vanuatu, Sierra
   Leone — visa-free counts, processing times, radar scores, benefits, and
   marketing copy are reasonable defaults, not verified figures. Confirm with
   the client before launch.

4. **Missing programmes.** On 2026-05-21 the user listed programmes that
   should exist but don't: **Italy, Albania, Austria, Nauru, Malta,
   Turkey**. Not yet added.

5. **El Salvador min/max inconsistency.** `minInvestment` is 1,021,999 but
   `maxInvestment` is still 100,000 (max < min). Bump max when touching it.

## Conventions (do not violate)

- **No em-dashes** anywhere — in code, copy, or commit messages. Use `:`,
  `.`, `,`, or rewrite. This is a hard global rule.
- Brand name is exactly **"Concierge"**.
- Primary colour is lilac **`#bbc4f7`**. Soft amber **`#FFC864`** is reserved
  for notes / highlights / the "Coming soon" badge.
- Visual bar is high: striking, atmospheric, luxury feel — not safe or
  generic. The landing redesign uses Instrument Serif italic accents
  (`SERIF_FONT` token in `LandingV2Page.tsx`) woven into headings.
- Server-side Supabase writes use the `service_role` key + zod validation,
  not anon + RLS (anon-from-route consistently 401s).
- Concierge, Locate AI, and Learning Crypto are separate businesses — never
  mix their infrastructure or accounts.

## Key files

| Path | Purpose |
|---|---|
| `lib/constants.ts` | `PROGRAMS`, `REGIONS`, `FAQ_ITEMS`, `TESTIMONIALS`, `PROGRAM_IMAGE_SLUGS` |
| `components/shared/QualifyModal.tsx` | Quiz flow modal |
| `components/shared/ApplyForProgrammeModal.tsx` | Programme-first flow modal |
| `lib/concierge-apply-signup.ts` | Enquiry submission + `addProgrammeToApplication` |
| `components/landing-v2/LandingV2Page.tsx` | Landing page (primary entry) |
| `app/[locale]/(public)/programs/programs-grid.tsx` | `/programs` grid, filters, sort |
| `app/[locale]/(public)/programs/[slug]/program-detail.tsx` | Programme detail page |
| `app/[locale]/(public)/application/page.tsx` | Application overview (enquiry users) |
| `app/[locale]/(public)/results/page.tsx` | Quiz results page (quiz users) |
| `app/initial-due-diligence/` | DD applicant portal — see `docs/INITIAL_DUE_DILIGENCE.md` |
