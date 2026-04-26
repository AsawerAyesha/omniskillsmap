# Add a real Sign Up flow to the Console

## The problem

Right now `/console/auth/sign-in` only has a sign-in form. The "Create a new deployment" button routes to a 4-step onboarding wizard that never actually creates a Supabase account, so there is **no way for a new user to get credentials** from the UI.

## What we'll build

### 1. New Sign Up screen at `/console/auth/sign-up`

A new route file `src/routes/console.auth.sign-up.tsx` that mirrors the visual design of the sign-in screen (same dark-left / warm-white-right split, same operator-type panel) but with a sign-up form:

- Fields: **Work email**, **Password** (with show/hide toggle), **Confirm password**
- Primary button: **"Create account"** → calls `supabase.auth.signUp({ email, password })`
- On success → redirect straight to `/console` (auto-confirm enabled, see step 3)
- Inline error handling + the same shake animation pattern used on sign-in
- Footer link: **"Already have an account? Sign in"** → routes to `/console/auth/sign-in`

### 2. Add a "Sign up" link on the existing sign-in screen

In `src/routes/console.auth.sign-in.tsx`:
- Change the ghost **"Create a new deployment"** button to instead route to `/console/auth/sign-up` (the onboarding wizard stays available but is no longer the only path)
- Add a small footer line: *"New here? Create an account"* with a link to `/console/auth/sign-up`

### 3. Enable email auto-confirm (hackathon convenience)

Use `supabase--configure_auth` to set `auto_confirm_email: true` so judges/testers don't need to check an inbox. Sign-up immediately gives them a working session.

### 4. Auto-assign the `operator` role on signup

The `ConsoleGuard` and role-aware screens (C2–C6) check `user_roles` for `operator`. If signup doesn't insert a row there, the new user will be locked out of every console screen.

Add a Postgres migration that:
- Creates a trigger on `auth.users` (insert) that adds a `('user_id', 'operator')` row into `public.user_roles` for every new signup
- This makes any newly-signed-up user immediately able to use all console screens

### 5. Demo credentials hint (optional polish)

On the sign-in screen, add a tiny dismissible hint card: *"Demo? Sign up with any email — instant access, no email verification needed."*

## Technical notes

- Uses existing `supabase.auth.signUp()` — no edge function needed
- The sign-up screen reuses the same `Field` component pattern and inline styles already in `console.auth.sign-in.tsx` for visual consistency
- The trigger uses `SECURITY DEFINER` to bypass RLS when inserting into `user_roles`
- Auto-confirm is reversible — turn it off post-hackathon by re-running `configure_auth` with `auto_confirm_email: false`
- No changes needed to `ConsoleAuthProvider` or `ConsoleGuard` — they already react to new sessions

## Files

**Created**
- `src/routes/console.auth.sign-up.tsx`
- One DB migration for the auto-role trigger

**Modified**
- `src/routes/console.auth.sign-in.tsx` (re-point ghost button + add footer sign-up link)

## After this lands

1. Open `/console/auth/sign-up`
2. Enter any email + password (≥6 chars)
3. Click "Create account" → instantly logged in, operator role assigned, redirected to `/console`
4. All C2–C6 screens are accessible
