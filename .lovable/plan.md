## Build the Landing / Entry screen for UNMAPPED

Replace the current placeholder design-system showcase on `/` with a proper Landing screen that follows the brief: hero, network constellation, country selector row, footer data-source strip, and staged on-load animations — all in the existing Civic Precision system (Fraunces + DM Sans, earth/ink palette).

### Files

**Create `src/components/unmapped/landing/skills-constellation.tsx`**
- Self-contained client component rendering an inline SVG, ~720×520 viewBox.
- Generate 70 dots with deterministic pseudo-random positions (seeded `mulberry32`, so SSR/CSR markup match — no hydration mismatch, no animations on initial server render).
- Dot sizes 2–6px, fill `var(--earth-dark)` with per-dot opacity 0.2–1.0.
- Connect dots whose distance < threshold with `stroke="var(--ink)"`, `stroke-width="0.5"`, opacity ~0.10.
- Each dot wrapped in `<g>` with CSS animation `u-pulse-dot` (scale 1 → 1.15 → 1, 2–6s duration, random `animation-delay`) — applied via inline `style` so SSR markup is stable.
- Hover: group `:hover` brightens nearby dots and lines via a CSS sibling-state attribute (`data-hover` toggled with React state on the SVG root group). Keep it lightweight — no per-frame JS.
- `prefers-reduced-motion`: pulse animation suppressed (handled in CSS).

**Create `src/components/unmapped/landing/region-pills.tsx`**
- Renders the "Currently configured for:" label plus two active region pills (`🌍 Sub-Saharan Africa`, `🌏 South Asia`) and a ghost `+ Add context` button.
- Active pills: `var(--earth-light)` bg, `var(--earth-dark)` text, 999px radius, small × remove affordance (decorative).
- "+ Add context": ghost (transparent bg, 1px `var(--border-strong)` border, ink-secondary text).
- Local React state for the pill list; `+ Add context` opens a tiny inline picker (4 preset regions). Keep state local — no global context wiring needed for this screen.

**Edit `src/routes/index.tsx`** — fully replace `Index()`:
- Wrapper: full-viewport section, `bg-[var(--surface)]`, with paper-grain overlay (`<div>` absolute inset, `pointer-events-none`, inline SVG `feTurbulence` noise as data URI, opacity 0.03).
- Update `head()` meta to landing-specific title/description.
- Layout: `u-container`, two-column grid on `lg:` (`lg:grid-cols-[1.1fr_1fr]`, 48px gap), single column stacked on mobile (visualization below text).
- **Hero left column:**
  - `<h1>` Fraunces, `text-[40px] md:text-[72px]`, `leading-[0.95] tracking-[-0.02em]`, `font-variation-settings: 'opsz' 144`. Text: `Your skills. Mapped.` (period in `var(--earth-dark)`).
  - Subtitle `<p>` DM Sans 18px, `text-[var(--ink-secondary)]`, `max-w-[42ch]`.
  - CTA row: primary `Map my skills →` (h-12, px-6, `rounded-full`, `bg-[var(--earth-dark)]`, `text-[var(--earth-light)]`, hover lift) + secondary `View for policymakers` (ghost, `border border-[var(--border-strong)]`, same height).
  - Stat chips row: three `<div>` chips with `font-mono text-[12px]`, sunken bg, 999px radius — `600M+ youth unmapped`, `190+ countries`, `Real ILO + World Bank data`.
- **Right column:** `<SkillsConstellation />` centered, `aspect-[4/3]`, max-w-[560px].
- **Below hero (full width inside container):** `<RegionPills />`.
- **Footer strip:** absolutely positioned at viewport bottom on `lg+`, static below content on mobile. `text-[12px] text-[var(--ink-tertiary)]`, dot-separated: `Powered by real data from: ILO ILOSTAT · World Bank WDI · ESCO · O*NET · Wittgenstein Centre`.
- All entrance animations driven by inline `style={{ animationDelay: '...' }}` on elements that share a single CSS class `u-rise-in` (defined in styles.css). No `u-stagger` — we need explicit per-element delays (0/120/240/360/420/480/600 ms) per the brief.

**Edit `src/styles.css`** — append to the existing `@layer components` block:
- `.u-rise-in` keyframe: `opacity 0 → 1`, `translateY(12px) → 0`, `var(--duration-page)` (600ms) with `var(--ease-precision)` (already expo-out-ish), `forwards`, `opacity:0` initial.
- `@keyframes u-pulse-dot`: `transform: scale(1)` → `scale(1.15)` → `scale(1)`, `transform-origin: center`. Applied via class `.u-dot { animation: u-pulse-dot var(--dur, 4s) ease-in-out infinite; transform-box: fill-box; }`.
- `prefers-reduced-motion`: disable both animations and reveal everything immediately.

### Notes

- Keep the route file purely presentational — no toast triggers, no design-system showcase. The previous showcase content is removed entirely.
- The Youth `AppShell` already wraps the route, so the landing renders inside the youth sidebar/bottom-tab chrome. That's fine for this brief; the hero still occupies the main content area at full width.
- SSR safety for the constellation: positions and per-dot delays must be deterministic (seeded RNG) so server and client markup match — `Math.random()` is forbidden at render time.
- No new dependencies. Lucide icons already installed for any small affordances (×, +).
- Accessibility: SVG gets `role="img"` and an `<title>` reading "Skills network visualization"; CTAs are real `<button>` / `<a>` with focus ring inherited from `.u-focus` selector already defined.
