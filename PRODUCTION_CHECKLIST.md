# BabyBook — Production Readiness Checklist

## Service Provider Credentials Needed

### 1. Supabase (production project) — REQUIRED
Create a new hosted project at **supabase.com** (free tier is fine to start).

| Credential | Where to get it | Env var |
|---|---|---|
| Project URL | Project Settings → API | `NEXT_PUBLIC_SUPABASE_URL` |
| Anon key | Project Settings → API | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service role key | Project Settings → API | `SUPABASE_SERVICE_ROLE_KEY` |

**Post-creation steps:**
- Run all 8 migrations: `supabase db push` (with prod credentials) or paste SQL files in the Supabase SQL Editor in order (001 → 008)
- Auth → URL Configuration: set **Site URL** to `https://yourdomain.com`, add production URL to **Redirect URLs**
- Auth → Email Templates: customise confirmation / invite / reset emails with your brand
- Verify the `media` storage bucket appears (created by migrations 003/004)

---

### 2. SMTP provider (for real email delivery) — REQUIRED
Supabase free tier uses shared SMTP — unreliable for production. Configure in **Supabase Dashboard → Auth → SMTP Settings**.

| Provider | Free tier | Notes |
|---|---|---|
| **Resend** (recommended) | 3,000 emails/mo | Best DX, easiest setup |
| Postmark | 100 emails/mo | Excellent deliverability |
| SendGrid | 100 emails/mo | Most widely used |
| AWS SES | ~62,000 emails/mo | Cheapest at volume |

Fields needed: Host, Port, Username, Password, Sender email + name.

---

### 3. Vercel (hosting) — REQUIRED
`apps/web/vercel.json` is already configured. Steps:
1. Import repo at vercel.com → set **Root Directory** = `apps/web`
2. Add all four env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production `https://` URL)

---

### 4. Sentry (error tracking) — RECOMMENDED
Free tier covers small apps. Replaces silent `console.error` with real alerting.
- Create a Next.js project at sentry.io → get DSN
- Add env vars: `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN`
- Install: `npx @sentry/wizard@latest -i nextjs`

---

### 5. Domain / DNS — REQUIRED
Purchase a domain and point it to Vercel via CNAME. Vercel auto-provisions TLS.

---

## Code Fixes (Blockers — must fix before launch)

### Fix 1 — Remove hardcoded Mailpit URL from production UI
**File:** `apps/web/src/app/(auth)/confirm-email/ConfirmEmailClient.tsx`

The "Open Mailpit" link (`http://127.0.0.1:54324`) is hardcoded and appears in the confirmation screen in production. Wrap in a `NODE_ENV` check:
```tsx
{process.env.NODE_ENV === 'development' && (
  <a href="http://127.0.0.1:54324">Open Mailpit ↗</a>
)}
```

---

### Fix 2 — Add forgot-password / reset-password flow
No password recovery exists — users who forget their password are permanently locked out.

**New files to create:**
- `apps/web/src/app/(auth)/forgot-password/page.tsx`
- `apps/web/src/app/(auth)/forgot-password/ForgotPasswordForm.tsx` — calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- `apps/web/src/app/(auth)/reset-password/page.tsx`
- `apps/web/src/app/(auth)/reset-password/ResetPasswordForm.tsx` — calls `supabase.auth.updateUser({ password })`, redirects to `/` on success

**Existing files to update:**
- `apps/web/src/app/(auth)/login/LoginForm.tsx` — add "Forgot password?" link below the password field
- `apps/web/src/middleware.ts` — add `/forgot-password` and `/reset-password` to the public routes array

---

### Fix 3 — Sanitize error messages shown to users
**File:** `apps/web/src/app/error.tsx`

Currently renders raw `error.message` which may expose DB internals to users:
```tsx
const displayMessage = process.env.NODE_ENV === 'production'
  ? 'Something went wrong. Please try again.'
  : error.message;
```

---

### Fix 4 — Runtime environment variable validation
**New file:** `apps/web/src/lib/env.ts`

Missing env vars currently cause cryptic deep failures. Add Zod validation at startup:
```typescript
import { z } from 'zod';
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});
export const env = envSchema.parse(process.env);
```
Import from this file in `apps/web/src/lib/supabase/server.ts` and `client.ts`.

---

### Fix 5 — Add Zod input validation to server actions
**Files:** `apps/web/src/app/actions/pages.ts`, `onboarding.ts`, `settings.ts`, `sections.ts`

TypeScript provides compile-time safety only. Add runtime Zod parsing at the top of each action before any DB call. Use schemas from `packages/shared/src/validation/index.ts` where they already exist.

---

## Code Additions (Important — pre-launch)

### Addition 1 — GitHub Actions CI/CD
**New file:** `.github/workflows/ci.yml`

Triggers on every PR and push to `main`:
1. `npm ci`
2. Type check: `node_modules/.bin/tsc --noEmit -p apps/web/tsconfig.json`
3. Tests: `npm test --workspaces --if-present`
4. Lint: `npm run lint --workspace=apps/web`

Production deploys are handled automatically by Vercel's GitHub integration.

---

### Addition 2 — Expand test coverage
Current gaps (all follow the existing Vitest + `vi.mock` pattern in `pages.test.ts`):

| New test file | What to cover |
|---|---|
| `apps/web/src/__tests__/actions/onboarding.test.ts` | `completeOnboarding` — unauthenticated, duplicate family, happy path |
| `apps/web/src/__tests__/actions/settings.test.ts` | `updateTheme`, `updateFamily`, `updateChild` — auth checks + success |
| `apps/web/src/__tests__/actions/sections.test.ts` | `createSection`, `deleteSection`, `movePageToSection` |
| `apps/web/src/__tests__/middleware.test.ts` | Unauthenticated redirect, unconfirmed-email redirect, public route pass-through |

---

## Nice to Have (Post-launch)

| Item | Notes |
|---|---|
| Analytics | Vercel Analytics (free, built-in) or Plausible ($9/mo, privacy-friendly) |
| Account deletion | Settings action to wipe all family data + Supabase `admin.deleteUser()` |
| Email change flow | `supabase.auth.updateUser({ email })` with re-verification step |
| Legal pages | `/privacy` and `/terms` — required for GDPR / app store listings |
| E2E tests | Playwright: sign up → confirm → onboard → create page → read book |
| Health endpoint | `apps/web/src/app/api/health/route.ts` returning 200 + build SHA |
| MFA | Enable TOTP in Supabase Auth settings + add settings UI toggle |

---

## Verification Checklist

- [ ] **Forgot password:** Log out → /login → "Forgot password?" → enter email → real email arrives → click link → set new password → sign in succeeds
- [ ] **Mailpit link hidden:** Production build → /confirm-email → no Mailpit link visible in the page
- [ ] **Error messages safe:** Trigger a server error → generic message shown, not raw DB error
- [ ] **Env validation:** Remove `NEXT_PUBLIC_SUPABASE_URL` from env → clear Zod error at startup, not a cryptic crash
- [ ] **CI:** Open a test PR → GitHub Actions runs → type check + tests + lint all green
- [ ] **Production smoke test:** Create Supabase production project → run 8 migrations → deploy to Vercel → sign up → confirm email → onboard → create journal page → view in reader → growth chart loads
- [ ] **Email delivery:** Sign up on production → confirmation email in real inbox within 30 seconds
