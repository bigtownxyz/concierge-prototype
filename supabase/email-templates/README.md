# Supabase Email Templates

Branded HTML for the Concierge auth emails. These are the source of truth; the live versions live in the Supabase Dashboard (Supabase doesn't sync them from the repo).

## Files

| File | Supabase template | Suggested subject line |
|------|-------------------|------------------------|
| `confirm-signup.html` | **Confirm signup** | `Confirm your email — Concierge` |
| `magic-link.html` | **Magic Link** | `Your sign-in link` |
| `reset-password.html` | **Reset Password** | `Reset your password` |

`_shell-reference.html` documents the design tokens (colours, fonts, logo URL) — not used by Supabase, just a reference for future templates.

## How to install

1. Open the Supabase Dashboard → project **bhujlerwneesihhliuov** → **Authentication** → **Email Templates**.
2. For each template:
   - Pick the template from the left sidebar (Confirm signup / Magic Link / Reset Password).
   - Paste the matching HTML file contents into the **Message body** editor.
   - Set the **Subject** field to the suggested line above (or your own).
   - Click **Save**.
3. Test:
   - Confirm signup → trigger by signing up with a fresh email at `/login`.
   - Magic link → trigger by hitting the "Email magic link" option on `/login`.
   - Reset password → trigger via `/forgot-password`.

## Important checks before going live

- **Site URL config** — in the same Dashboard area, **Authentication → URL Configuration**. The "Site URL" must be the production domain (the `{{ .ConfirmationURL }}` link is built from it). Currently the templates reference `concierge-proto1231.vercel.app`. When you cut to a real domain, update:
  - Site URL in Supabase
  - Every `concierge-proto1231.vercel.app` reference in these HTML files (logo, header link, footer)
  - `NEXT_PUBLIC_SITE_URL` in Vercel
- **Redirect URL allowlist** — same screen. Anything in `?next=` must be on this list or Supabase rejects the redirect.
- **Custom SMTP is already on** (Gmail, admin@learningcrypto.com → concierge@learningcrypto.com per the project memory). Confirm it's still enabled under **Authentication → SMTP Settings** before changing templates — otherwise emails fall back to the generic Supabase `noreply@mail.app.supabase.io` and your branding goes unread because it lands in spam.

## Template variables

Supabase substitutes these at send time:

- `{{ .ConfirmationURL }}` — the click-through link. Different per template (confirm vs magic vs reset), but the variable name is the same in all three.
- `{{ .Email }}` — recipient email address. Not used in the current templates but available if you want it.
- `{{ .SiteURL }}` — the Site URL config value.
- `{{ .Token }}` / `{{ .TokenHash }}` — raw token if you want to build a custom redirect URL.
- `{{ .Data.foo }}` — anything set in `user_metadata` at signup. E.g. if QualifyModal stored `first_name` in user_metadata, you could write `Hello {{ .Data.first_name }}`.

## Design tokens (shared visual shell)

| Token | Hex |
|-------|-----|
| Body bg | `#11101C` |
| Card bg | `#1B1A2B` |
| Card border | `#2D2D45` |
| Header bg | `#181828` |
| Lilac hairline / link | `#bbc4f7` (site brand primary) |
| Body text | `#B8BAC7` |
| Heading text | `#F5F5F6` |
| Muted/uppercase | `#8D90A3` |
| Button bg | `#353A63` |
| Button border | `#5A6397` |
| Button text | `#F5F5F6` |

Typography: Manrope 400/500/600/700, system fallbacks. Web fonts load in Apple Mail / iOS; Gmail/Outlook fall back to system — that's expected.

Logo: SVG to match the site exactly. `public/logo.svg` exposed at `/logo.svg`. Caveat: Outlook for Windows desktop strips SVG and shows alt text instead — modern Gmail / Apple Mail / Outlook web all render it fine.

## Testing in different email clients

The templates use `<table>`-based layout and inline styles. The only non-bulletproof flourishes are:

- The gold hairline (`linear-gradient`) — gracefully degrades to a thin dark bar in clients that drop gradients (Outlook on Windows).
- Web font — gracefully falls back to system-ui.

To preview before sending to a real user:

```bash
# from project root:
start supabase/email-templates/confirm-signup.html
# (or open the file in any browser)
```

For multi-client testing (Outlook, Gmail, Apple Mail, Yahoo), use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) — both have free trials.
