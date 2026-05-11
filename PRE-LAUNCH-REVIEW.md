# ConciergeDashboard2 — Pre-Launch Readiness Review

**Date:** 2026-05-11
**Reviewer:** Claude (parallel audit + direct verification)
**Live URL audited:** https://concierge-proto1231.vercel.app
**Verdict:** **Not ready for public launch.** ~10 blockers, most quick fixes.

---

## TL;DR

**Code wiring is mostly correct.** Supabase auth + LC CRM + Gmail SMTP + Calendly are all properly plumbed. Programmes, qualification modal, programme detail pages all render. Vercel deploys cleanly.

**The launch blockers are not "broken integrations" — they're production hygiene:**
- The whole site is rendered at 88% scale (debug-mode `zoom` left in `(public)/layout.tsx`).
- `robots.txt` and `sitemap.xml` 404 on live (middleware matcher misses them).
- 4 locales declared (en/ar/zh/ru) — only `en.json` exists. Going live like this either crashes or silently shows English under foreign URLs.
- Privacy + Terms are placeholders, dated March, no UAE PDPL framing (you're a Dubai entity advising HNW clients — this gets read).
- `next.config.ts` silences 11 real TypeScript errors via `ignoreBuildErrors: true`.
- `/admin` exists, gated by login only (no role check), with a stub page.
- `/blog` is in nav, but `[slug]` calls `notFound()` unconditionally — placeholder for Phase 3.
- Open redirect via `?next=https://evil.com` in the auth callback.
- Indexing globally blocked by `noindex/nofollow` — correct *while on the prototype URL*, must flip when the real domain ships.

**Decisions you owe yourself before launch:**
1. Final domain (drives `NEXT_PUBLIC_SITE_URL`, robots flip, locale URLs).
2. Locales — English-only or actually multi-language?
3. Blog and Compare — ship or hide?
4. Landing v2 vs v3 — pick one.
5. Admin — usable internally or 404 it for now?

Full detail below. Day-of-launch sprint is ~3-4 hours of code edits + getting Privacy/Terms reviewed by a UAE solicitor.

> **Note on audit scope:** this review is code + live-curl. I did not exercise real user flows (signup with confirmation email, qualification → LC CRM row, contact form → mailbox, Calendly booking). See "User-verified checks remaining" at the end before going public.

---

## 🔴 BLOCKERS (must fix before going live)

### 1. `zoom: 0.88` wraps every public page
`app/[locale]/(public)/layout.tsx:10`
```tsx
<div style={{ zoom: 0.88 }}>
```
This is dev/demo styling — every visitor sees the entire site at 88% scale. Verified live on `/`. Mobile-breaking, accessibility-violating, makes Lighthouse a mess. **Remove.**

### 2. Indexing globally disabled (correct for prototype URL — but flip it when domain ships)
- `app/layout.tsx:22-30` — `robots: { index: false, follow: false }` for both general + googleBot
- `app/robots.ts:9` — `disallow: "/"`

Both commented `// TEMPORARY`. Fine while on `concierge-proto1231.vercel.app`, but **must flip before launch** on the production domain or Google never finds you.

### 3. `/robots.txt` and `/sitemap.xml` return 404 on the live site
The handlers exist (`app/robots.ts`, `app/sitemap.ts`) but the next-intl middleware matcher in `middleware.ts:57` doesn't exclude `.txt`/`.xml`, so requests get routed through `[locale]` and 404. Fix the matcher:
```ts
matcher: [
  "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
],
```

### 4. 4 locales declared, only English translations exist
`i18n/config.ts:1` declares `["en", "ar", "zh", "ru"]` and the live site's HTML emits `hreflang` links for all four. Only `messages/en.json` exists. Visiting `/ar`, `/zh`, `/ru` will crash or fall back to English silently. **Pick one**: ship English-only by trimming the locales array, or actually translate `messages/{ar,zh,ru}.json` before launch.

### 5. Open redirect in auth callback
`app/[locale]/(auth)/callback/route.ts:50`
```ts
const redirectTo = next.startsWith("/") ? `${origin}${next}` : next;
```
With `next = "https://evil.com"`, `startsWith("/")` is `false`, so `redirectTo = "https://evil.com"` and `NextResponse.redirect` sends `Location: https://evil.com`. After a real Supabase code exchange completes, the user lands on the attacker's domain — believing they came from your trusted auth flow. Standard post-auth open-redirect.

(Note: the `?next=//evil.com` "protocol-relative" variant is *not* exploitable here — `startsWith("/")` is true and the URL becomes `https://yourdomain.com//evil.com`, a same-origin path. But the full-URL variant above is real.)

Fix: validate the `next` value against same origin before redirecting:
```ts
let redirectTo = `${origin}/${locale}/programs`;
if (next.startsWith("/") && !next.startsWith("//")) {
  redirectTo = `${origin}${next}`;
}
```

### 6. Privacy & Terms are skeleton content, wrong jurisdiction
- `app/[locale]/(public)/privacy/page.tsx:11` — "Last updated: March 2026" (it's May)
- No mention of UAE PDPL — per project memory, the Concierge entity is Dubai-based, not UK. EU/UK visitors still pull in GDPR.
- Email shown: `privacy@concierge.app` — different domain to anything else; presumably placeholder.
- No registered entity name, no UAE trade licence number, no governing-law clause in `terms/page.tsx`.

This is a HNW citizenship advisory — the legal pages will be inspected. Get a UAE solicitor to draft these before launch.

### 7. `/admin` only gated by "any logged-in user"
`middleware.ts:9-23` protects `/admin` with session existence only — no role check. `app/[locale]/(admin)/admin/page.tsx` is a stub. Any logged-in user can hit `/en/admin`. Add a `profiles.role === 'admin'` check (or equivalent) before launch, or take the route out.

### 8. `/blog` is in nav but renders "coming soon"
- `app/[locale]/(public)/blog/page.tsx:20-21` — placeholder text
- `app/[locale]/(public)/blog/[slug]/page.tsx` — unconditional `notFound()`
- Still linked from Navbar/Footer

Either delete the blog routes + links, or populate at least 1 real post.

### 9. Build silences errors
`next.config.ts:7-12`:
```ts
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```
With these off, **11 real TypeScript errors are being hidden**, including:
- `app/[locale]/(auth)/callback/route.ts:21` — Supabase client type mismatch
- `app/[locale]/(public)/programs/[slug]/program-detail.tsx:384, 402, 416, 431, 606, 637` — Framer Motion `ease` typed wrong (array of numbers instead of `Easing | Easing[]`)
- `lib/supabase/profile-bootstrap.ts:72` — `prefer-const` ESLint error

Fix the errors, then flip both flags to `false`. The cost of leaving them on is that any future regression will pass CI silently.

### 10. `NEXT_PUBLIC_SITE_URL` set in Production only, missing from Preview
`vercel env ls` shows it set for Production only. Memory confirms this was a deliberate Vercel CLI workaround. `lib/utils.ts:65` falls back to `http://localhost:3000` if it's missing — so any preview deployment will email password-reset / magic-link URLs pointing at localhost. Add it to Preview via the dashboard.

---

## 🟡 MEDIUM (fix before/just after launch)

### 11. `/results` and `/profile` not in middleware protected list
`middleware.ts:9` only guards `/portal` and `/admin`. `/results` and `/profile` rely on client-side auth checks — there's a brief flash of authenticated UI before the redirect kicks in. Add them:
```ts
const PROTECTED_PREFIXES = ["/portal", "/admin", "/results", "/profile"];
```

### 12. `/compare` page is a "Coming soon" placeholder
Still linked from the nav. Either implement or remove from `lib/constants.ts` NAV_LINKS.

### 13. No cookie consent banner
GDPR/PECR requires consent for any non-essential cookies if EU/UK visitors are in scope (they are — global HNW prospects). Calendly embed already sets `hide_gdpr_banner=1` which suggests awareness. Add a banner (Cookiebot, klaro, or hand-rolled) before launch in EU/UK.

### 14. Contact email sending blocks the HTTP response
`app/api/contact/route.ts:137` — `await sendEmail()` with no internal timeout. If Gmail is slow, user's request hangs. Either:
- Fire-and-forget with `void sendEmail().catch(log)`, OR
- Add an SMTP timeout in nodemailer config, OR
- Queue it (Inngest, Trigger.dev, etc.)

### 15. `/api/profile/bootstrap` has no input validation, leaks internal errors
`app/api/profile/bootstrap/route.ts:9-43`. Body is `.catch(() => ({}))`-cast with no Zod schema, and `bootstrapProfile()` errors are passed through to the client verbatim — including messages like "RLS policy is blocking profile creation" which leak schema details. Add Zod + a generic public error message.

### 16. No rate limiting on any API route
`/api/contact`, `/api/leads/intake`, `/api/profile/bootstrap` — all wide open. Honeypot in `/api/contact` helps with dumb bots but not determined ones. Add Vercel-style per-IP throttling or Upstash rate-limit middleware.

### 17. Validation errors leak Zod schema structure to client
`app/api/leads/intake/route.ts:72` returns `issues: parsed.error.issues` to caller — exposes field names + validation rules. Log server-side, return generic message client-side.

### 18. Request body logged on validation failure
`app/api/leads/intake/route.ts:64-66` dumps the full payload (names, phone numbers, family details) into logs. Operational risk if logs are not access-controlled. Log field names + error count, not values.

### 19. README is `create-next-app` boilerplate
Stale from project init. New contributor or future-you-in-three-months will hate it. Update with: stack, env vars (without secrets), Supabase migrations, deploy notes.

### 20. Profile bootstrap silently drops missing columns
`lib/supabase/profile-bootstrap.ts:82-117` retries by removing payload keys when the DB rejects them. If production `profiles` schema diverges (e.g. `nationality` column dropped), user data is silently lost. Verify all 7 migrations in `supabase/migrations/` have run on the live `bhujlerwneesihhliuov` project — particularly 003_production_schema_repair, 004_add_family_members, 006_align_with_app_schema, 007_drop_legacy_tables.

### 21. Calendly slug hardcoded
`app/[locale]/(public)/results/page.tsx:671` — `calendly.com/lc-concierge/concierge-consultation`. Move to env var so swapping accounts doesn't need a code change.

### 22. Landing v2 vs v3 — decide which ships
`/` renders `LandingV2Page`. `/landing-v3` exists separately with the Hero3D component. Decide which one ships, retire the other (or document why both stay).

---

## 🟢 MINOR (nice-to-fix)

- **Favicon present, no apple-touch-icon, no OG image** — `public/og/` directory exists but is empty.
- **`public/logo.png` is 600×100** — fine for header, but no proper square favicon variants.
- **Material Symbols font has no `&display=optional`** — `app/layout.tsx:43` — blocks render briefly.
- **Privacy + Terms pages have only `title`, no `description`** — meta tags incomplete.
- **`engines.node = 22.x` but `.node-version = 20.x`** — currently running 22.14, package.json wins, but reconcile to avoid surprise on Vercel rebuilds.
- **No structured data (schema.org)** — LocalBusiness + FAQPage would help SEO once indexing is on.
- **Compare page in nav but non-functional** — already in Medium.
- **External `<img>` in `components/landing/ProgramsShowcase.tsx:52`** — Supabase CDN images, swap to `<Image>` for LCP.
- **Email confirmation message in QualifyModal** — informal ("come back and log in"), could be crisper.
- **Repository config:** large committed PNGs (`vercel-production-snapshots-after-fix.png`, `snapshots-section-border-refactor*.png`) are excluded by `.gitignore` — good. But `tsconfig.tsbuildinfo` is in `.gitignore` (correct) — verify it's not in git history.

---

## ✅ PASSING (already in good shape)

- **All 16 programme pages render** with images present (`public/images/programs/`).
- **Supabase service-role key correctly server-side only**, no `NEXT_PUBLIC_` exposure.
- **LC intake (CRM) fail-open pattern works** — modal flow never blocked by CRM outage.
- **Honeypot field on contact form** correctly silently succeeds.
- **HTML escaping on email template** (`app/api/contact/route.ts:126-132`).
- **Magic link flow correct** — uses `buildAbsoluteUrl`, encodes `next` properly.
- **handle_new_user trigger** present in migrations 001 + 003, idempotent.
- **Vercel deployment pipeline** — auto-deploys, recent build green, 52s build time.
- **Programme directory + detail pages** working, dynamic metadata via `generateMetadata`.
- **Middleware locale matching** — `/en` → 307 redirect to `/` works (`as-needed` prefix).
- **TLS + HSTS headers present** on live site.
- **Live home page renders correctly** — `LandingV2`, full nav, hero, no broken DOM.

---

## SUGGESTED ORDER OF FIXES

**Day-of-launch sprint (~3-4 hours):**
1. Delete `zoom: 0.88` from public layout *(2 minutes)*
2. Fix middleware matcher so `/robots.txt` + `/sitemap.xml` resolve *(5 minutes)*
3. Trim locales to `["en"]` or commit to translating *(5 minutes if trimming)*
4. Fix open redirect in `callback/route.ts:50` *(10 minutes)*
5. Remove `/blog` from NAV_LINKS + footer + delete blog routes *(15 minutes)*
6. Either hide `/admin` or add role gate *(30 minutes)*
7. Fix the 11 TS errors then flip `ignoreBuildErrors: false` *(1-2 hours)*
8. Update Privacy + Terms with UAE PDPL framing + entity details *(1 hour; get a lawyer eventually)*
9. Add `/results` and `/profile` to middleware PROTECTED_PREFIXES *(2 minutes)*
10. Add NEXT_PUBLIC_SITE_URL to Vercel **Preview** env *(2 minutes)*
11. Flip the `robots: { index: false }` in `app/layout.tsx` + `disallow` in `app/robots.ts` **after** custom domain points at it *(2 minutes)*

**Week-1 follow-up:**
12. Cookie banner
13. Rate limiting on API routes
14. Validation + generic errors on `/api/profile/bootstrap`
15. Fire-and-forget the contact-form email
16. Verify all 7 Supabase migrations applied in production
17. Decide on landing v2 vs v3
18. Add favicons + OG image
19. Rewrite README

**Nice-to-have:**
- structured data, twitter:card image, font-display swap, etc.

---

## USER-VERIFIED CHECKS REMAINING

This audit was code-level + live HTTP probing. **Before launch, exercise these flows manually** (or with Playwright):

- [ ] **Signup with confirmation email** — sign up with a fresh real email; confirm the confirmation link's URL points at the production domain (not `localhost:3000`), clicking it lands on `/results` with qualification claimed.
- [ ] **Password reset** — request a reset, confirm email arrives with production URL, set a new password successfully.
- [ ] **Magic-link login** — request magic link, click, land logged-in on `/results` or the encoded `next` target.
- [ ] **Qualification modal end-to-end** — submit a full 5-step qualification *without* signing up; confirm a row appears in LC Command Centre `qualification_submissions` and a `contacts` row appears under the Concierge business. Then sign up and confirm the `signed_up=true` PATCH fires.
- [ ] **Contact form** — submit a message, confirm it lands at `concierge@learningcrypto.com` (delivered to admin@'s mailbox via Workspace alias), and a row lands in `contact_messages` with `notified=true`.
- [ ] **Calendly embed** — load `/results` as a qualified user, confirm Calendly widget loads and a test booking can be made.
- [ ] **Programme deep-link** — visit `/programs/dominica` (or any slug), confirm OG tags + page metadata pick up the programme name, "Add to Application" works for logged-in qualified users.
- [ ] **Multi-locale URLs** — visit `/ar`, `/zh`, `/ru` — confirm they don't crash, then either translate or remove from `i18n/config.ts`.
- [ ] **Database schema sanity** — log into Supabase dashboard for `bhujlerwneesihhliuov` and verify all 7 migrations show as applied. Particularly check `profiles` has columns `country, nationality, full_name, email, phone`; `qualifications` has `investment_amount, strategic_focus, situation, updated_at`.
- [ ] **Vercel env Preview** — add `NEXT_PUBLIC_SITE_URL` to Preview environment (currently Production-only).

---

## OUTSTANDING QUESTIONS

1. **Custom domain** — what's the final URL? Currently on `concierge-proto1231.vercel.app`. `NEXT_PUBLIC_SITE_URL` and the "TEMPORARY" indexing flags all hinge on this.
2. **Locales** — was multi-language ever the intent, or scaffolding leftovers from a template? If yes, when is translation work happening?
3. **Blog** — kill it or fill it?
4. **Compare tool** — same question.
5. **Landing v3** — promotion target?
6. **Admin** — when is Phase 7 planned? Should the route just 404 until then?
