# Console — design system extension + C0 (Sign-In)

A new top-level section at `/console`, completely separate from `/` (Youth) and `/policy`. It will be the operator + admin surface (role-gated) for ministries, NGOs and the UNMAPPED platform team. C0 ships with the foundation; C1–C6 plug into it as you send each prompt.

## What you get in this step

1. **A new shell** (`ConsoleShell`) — left sidebar IA, top utility bar, content canvas. Same three themes (light parchment / dark warm-ink / onyx OLED), same design tokens, no changes to existing screens.
2. **Real auth via Lovable Cloud** — email/password + Google, with a `user_roles` table (`admin`, `operator`, `viewer`) and a `has_role()` security-definer function. Routes under `/console/*` are gated.
3. **C0 Sign-In screen** — split-pane layout, brand panel left, form right, with Email/Password, Google, "Forgot password", and a `redirect` search param so deep links survive the round-trip.
4. **Console-specific tokens layered on the existing palette** — a thin extension to `src/styles.css` adds `--console-*` variables that resolve per-theme. No changes to `--policy-*` or shadcn semantics.

## Information architecture (placeholder shell, ready for C1–C6)

```text
/console                       → Workspace overview (C1 will fill this)
/console/cohorts               → C2
/console/programs              → C3
/console/signals               → C4
/console/methodology           → C5
/console/settings              → C6 (admin-only sections gated)
/console/auth/sign-in          → C0
/console/auth/forgot           → password reset request
/console/auth/reset-password   → recovery callback (public)
```

The sidebar shows all sections; admin-only ones get a small "Admin" chip and are hidden for non-admins. The active country pill, theme switcher and account avatar live in the top utility bar (matching the Policy header language but with a Console accent).

## Visual language

- **Same tokens, new accent**: Console uses a cool slate accent (`--console-accent`) so judges immediately read it as a separate surface from Policy's warm earth. Both still resolve through light/dark/onyx.
- **Sidebar (240px)**: `--console-sidebar-bg` (slightly raised vs canvas), section labels in `--policy-fg-muted` equivalent, active item gets a 2px left rule in the accent + soft wash.
- **Topbar (56px)**: brand mark, breadcrumb, country pill, theme switcher, avatar w/ role chip ("Admin" / "Operator" / "Viewer").
- **Density**: tighter than Youth (closer to the Policy dashboards). 12/14/16px type scale, 8px grid.
- **Motion**: reuses `--ease-precision` and `rise-in` for content swaps; sidebar items use a 120ms color crossfade.

## C0 — Sign-In screen

Two-column 1248px max layout:

- **Left (brand panel, 5/12)** — full-bleed in `--console-accent-wash`, displays:
  - Compass mark + "UNMAPPED Console" wordmark
  - Single tagline ("Skills intelligence for ministries and partners")
  - One-line attribution row (cached ILOSTAT/WDI snapshot indicator) so the institutional tone is set before login
  - Footer: version + "Civic Compass · v0.1"
- **Right (form, 7/12)** — `--card` surface, 400px wide:
  - H1 "Sign in to Console"
  - Sub "Use your work email or Google account"
  - Email field, Password field (with show/hide), "Forgot password?" link
  - Primary button "Sign in" (accent), secondary "Continue with Google" with G icon
  - Inline error region (one line, `--signal-red`)
  - Footer micro-copy: "By continuing you agree to UNMAPPED's data-use policy"
- **States**: idle / loading (button disabled + spinner) / error (shake + inline message) / 2FA-not-yet (placeholder for later)
- **Behavior**: On success, fetch the user's role from `user_roles`, then `navigate({ to: search.redirect ?? "/console" })`. Already-authenticated visits to `/console/auth/sign-in` redirect away.

## Auth + roles (Lovable Cloud)

- Enable Lovable Cloud (one click) and use email/password + Google.
- New tables (with RLS):
  - `app_role` enum: `admin`, `operator`, `viewer`
  - `user_roles (id, user_id, role)` with `(user_id, role)` unique
  - `has_role(_user_id uuid, _role app_role)` SECURITY DEFINER function
- A pathless layout route `src/routes/_console_auth.tsx` runs `beforeLoad` to:
  - Verify a session exists (redirect to `/console/auth/sign-in` with `redirect=<href>` if not)
  - Hydrate `auth.role` into router context so child routes can gate admin-only views with `hasAnyRole(['admin'])`.
- Role assignment for new signups defaults to `viewer`; admins promote via C6 Settings (built later).

## Files I will create / touch (no existing screens modified)

**New (Console foundation + C0):**
- `src/components/unmapped/console/console-shell.tsx` — sidebar + topbar + outlet
- `src/components/unmapped/console/console-sidebar.tsx`
- `src/components/unmapped/console/console-topbar.tsx`
- `src/components/unmapped/console/console-tokens.css` (imported from `styles.css`) — defines `--console-accent`, `--console-accent-wash`, `--console-sidebar-bg`, `--console-rule`, etc., with light/dark/onyx variants
- `src/routes/console.tsx` — layout route (renders `ConsoleShell` + `Outlet`)
- `src/routes/console.index.tsx` — temporary placeholder until C1
- `src/routes/_console_auth.tsx` — auth gate (pathless)
- `src/routes/console.auth.sign-in.tsx` — **C0**
- `src/routes/console.auth.forgot.tsx` — request reset
- `src/routes/reset-password.tsx` — public recovery callback (per platform requirement)
- `src/integrations/supabase/auth-context.tsx` — exposes `auth` to router context (session + role)
- Migration: `app_role` enum, `user_roles` table, RLS policies, `has_role()` function, trigger to auto-create `viewer` role on signup
- `mem/design/console-tokens.md` + index update — so future agents apply the Console palette correctly

**Touched (additive only, zero behavior change to existing screens):**
- `src/styles.css` — `@import` the new console tokens block (additive)
- `src/router.tsx` — add `auth` to router context type
- `src/routes/__root.tsx` — wrap `AppShell` with `AuthProvider`; pass `auth` into router context

The existing `AppShell`/`YouthShell`/`PolicyShell` logic is untouched — `AppShell` already short-circuits on `/policy/*`; we add the same short-circuit for `/console/*` so the Console renders its own shell and the Youth/Policy mode bridge is bypassed.

## Out of scope for this step

- C1–C6 content (will be built one-by-one as you send each prompt)
- Admin user-management UI (lands in C6)
- 2FA, magic links, SAML SSO (can be added later via Lovable Cloud)

## Acceptance checklist

- [ ] Visiting `/` and `/policy` is byte-identical to today (no regressions)
- [ ] `/console` redirects to `/console/auth/sign-in?redirect=%2Fconsole` when logged out
- [ ] C0 renders cleanly in light, dark, and onyx
- [ ] Successful sign-in lands on `/console` (placeholder) with sidebar, topbar, role chip
- [ ] Refresh on `/console` keeps the session (no flash of login screen — gate runs in `beforeLoad`)
- [ ] `user_roles` + `has_role()` exist with RLS; new signups get `viewer` automatically
- [ ] No hard-coded `#111009` / `rgba(255,255,255,*)` introduced — Console uses tokens only

Ready to ship the foundation + C0. After approval, send the C1 prompt and I'll drop it straight into `/console`.