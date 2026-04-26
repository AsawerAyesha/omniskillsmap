# Project Memory

## Core
Three themes: light (parchment), dark (warm ink), onyx (true black/OLED). All policy surfaces MUST consume `--policy-bg / --policy-panel / --policy-panel-border / --policy-fg / --policy-fg-muted / --policy-fg-faint / --policy-grid / --policy-grid-strong / --policy-accent-ink` — never hard-code `#111009`, `rgba(255,255,255,*)`, or `rgba(240,237,232,*)`. Tokens are defined in `src/styles.css` under `:root`, `.dark`, and `.theme-onyx`.
Youth shell uses shadcn semantic tokens (`--surface`, `--surface-raised`, `--surface-sunken`, `--ink`, ...) which `.theme-onyx` already remaps — do not introduce hard-coded surface colors there either.

## Memories
- [Policy palette tokens](mem://design/policy-palette) — Theme-aware tokens that drive every policy dashboard surface
- [Console palette tokens](mem://design/console-tokens) — Slate-accented token family for the /console operator+admin surface; ConsoleGuard wraps gated routes; roles live in `user_roles` + `has_role()`
