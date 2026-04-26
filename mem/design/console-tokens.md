---
name: Console palette tokens
description: Theme-aware CSS variables that paint the /console operator-admin surface across light/dark/onyx
type: design
---
The Console (operator + admin surface at `/console`) uses a dedicated token
family defined in `src/styles.css`, redeclared inside `:root`, `.dark`, and
`.theme-onyx` so the user's theme switch propagates across every console view.

Tokens:
- `--console-bg` — page canvas
- `--console-canvas` — header / content panel surface
- `--console-sidebar-bg` — sidebar surface (slightly recessed vs canvas)
- `--console-panel` / `--console-panel-strong` — chip / hover wash
- `--console-border` — hairline 1px borders
- `--console-rule` — even fainter dividers (form separators)
- `--console-fg` / `--console-fg-muted` / `--console-fg-faint` — text hierarchy
- `--console-accent` / `--console-accent-hover` / `--console-accent-fg` — slate accent (distinct from Policy's earth)
- `--console-accent-wash` — gradient used on the C0 sign-in brand panel
- `--console-success` / `--console-danger` — status colors

Rules:
- Never hardcode hex colors inside `/components/unmapped/console/**` or `/routes/console.*`. Always go through the tokens above.
- Console intentionally uses a cool slate accent so it reads as a different tool from Policy's warm earth.
- The Console shell short-circuits `AppShell` (no Youth/Policy chrome). New `/console/*` routes must opt into `<ConsoleGuard>` for auth + the shell wrapper.
- Auth state lives in `ConsoleAuthProvider` (`src/components/unmapped/console/auth-context.tsx`). Roles come from `public.user_roles`; admin checks must use `hasRole('admin')` (never trust client-only flags).