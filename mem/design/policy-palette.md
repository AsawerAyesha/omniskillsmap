---
name: Policy palette tokens
description: Theme-aware CSS variables that paint every policy mode surface across light/dark/onyx
type: design
---
The policy dashboard uses dedicated theme-aware CSS variables defined in `src/styles.css`:

- `--policy-bg` — page canvas
- `--policy-panel` / `--policy-panel-strong` — card / hover wash
- `--policy-panel-border` — hairline border
- `--policy-fg` / `--policy-fg-muted` / `--policy-fg-faint` — text hierarchy
- `--policy-grid` / `--policy-grid-strong` — chart gridlines and axis baselines
- `--policy-accent-ink` — foreground on the warm earth pill (e.g. Export button, active chips)

They are redefined inside `:root`, `.dark`, and `.theme-onyx` so the user's theme switch propagates everywhere — header, page wrappers, every board component, every SVG chart fill/stroke.

When adding a new policy view or chart:
- Use `var(--policy-bg)` for the page wrapper (NOT `--surface`).
- Use `var(--policy-panel)` for cards, `var(--policy-panel-border)` for borders.
- Use `var(--policy-fg-muted)` for labels, `var(--policy-fg-faint)` for axis ticks/hints.
- For SVG attributes (`fill`, `stroke`), wrap in quotes: `fill="var(--policy-fg-faint)"`.
- For Tailwind arbitrary classes, use `text-[color:var(--policy-fg)]`, `bg-[color:var(--policy-panel)]`.

Never hardcode `#111009`, `#F0EDE8`, `rgba(255,255,255,*)`, or `rgba(240,237,232,*)` — they break light mode.
