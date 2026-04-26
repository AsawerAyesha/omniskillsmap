# UNMAPPED — Alignment Audit & Winning Edge Plan

## TL;DR — Are we aligned?

**Yes — strongly.** You're already hitting the brief's core trap that kills most teams ("a beautiful dashboard that tells you things you already knew"). What we have:

- **All three required modules** built (most teams build only two): Skills Signal Engine (intake → profile), AI Readiness & Displacement Risk Lens (policy.risk + Frey-Osborne wording), Opportunity Matching with **dual interface** (Youth opportunities + Policy opportunities-board).
- **Country-agnostic infrastructure layer** is real, not a slide: `Context Configuration` drawer, 12 seeded LMIC countries, swappable labor-market / education / projection sources, opportunity types, language list, automation calibration knob, advanced signals (connectivity, mobility, displacement). This is the single biggest discriminator versus other teams.
- **Constraint-aware design** is in the product (Constraint Banner on opportunities, offline-first connectivity tier, mobility radius, displacement context, learning board "works offline" copy). Brief literally says "Design for constraint" — we already do.
- **Three themes (Light/Dark/Onyx)** + parchment/ink design language reads as institutional-grade (UN/World Bank aesthetic) — not generic SaaS purple. Judges will notice on screen-share within 5 seconds.
- **References to real taxonomies** are visible in the UI: ISCO-08, ESCO, ILO ILOSTAT, World Bank WDI, O*NET, Wittgenstein Centre, Frey-Osborne. Brief requires "surface ≥2 econometric signals visibly to the user — not buried in the algorithm." We name them in headers and footers.

## Where we're vulnerable (judges will probe these)

The brief is explicit that **weak teams are penalized for** synthetic data, slide-only localization, and overengineered tech / under-engineered UX. We're at risk on:

1. **Real data, not proxies.** Right now everything is hand-authored mock JSON. Even one country wired to a *live* (or pre-cached) ILO/WDI fetch would change the conversation from "mock" to "infrastructure". Brief: *"grounded in real economic data — not synthetic proxies."*
2. **Localizability with real evidence.** We have the *toggles*, but the demo doesn't yet flip Ghana → Bangladesh and visibly re-render data, language, automation calibration, and opportunity mix. Brief: *"show your tool configured for one context, then show what it would take to reconfigure for a second."*
3. **Honest about limits.** Brief: *"the best teams know exactly what they don't know."* We don't yet have a visible "What we don't know / data caveats" surface.
4. **Profile portability.** Brief: *"portable across borders & sectors, and explainable to a non-expert user."* We have a Skills Profile Card; we don't yet have **export as portable credential** (signed JSON / PDF / shareable link / QR).
5. **Wittgenstein 2025–2035 projections.** Mentioned in copy, but we don't yet show *how Amara's region is shifting* in a way she (not just a policymaker) can read. The youth-side projection story is missing.
6. **Two-context demo.** We have country switching but no scripted "Ghana urban informal → Bangladesh rural agricultural" toggle that recolors the entire app in one click during demo.

## Winning Edge Plan — 8 moves, ranked by judge-impact-per-hour

### 1. Wire one real dataset end-to-end (Ghana, ILOSTAT)
The single highest-ROI move. Pre-cache a small JSON snapshot of ILO ILOSTAT employment-by-sector + wage data for Ghana, ship it as a static asset, and bind 2–3 tiles on the Youth opportunity card and Policy overview to those values. Add a tiny "source: ILO ILOSTAT 2024 · cached" pill. Even one country with real numbers reframes everything else as "scaffolding ready for the same wire-up." Brief literally requires this.

### 2. "Reconfigure in 30 seconds" demo flow
Add a top-of-app **Demo Switcher** (presets: *Ghana · Urban Informal* ↔ *Bangladesh · Rural Agricultural*) that flips country, region, language hint, automation calibration, opportunity mix, and visibly re-renders 3–4 surfaces in <2s. This *is* the country-agnostic proof. It collapses the brief's hardest requirement into a single click.

### 3. Portable Skills Credential export
On the Skills Profile, add a **"Download portable credential"** button that produces (a) a signed-looking JSON (ESCO-aligned schema), (b) a printable PDF Skills Card, (c) a QR code that re-imports into another instance. Mention "works on a shared device" in the caption. Directly satisfies "portable across borders & sectors."

### 4. Youth-side projections strip ("Where your region is heading")
A small horizontal strip on Amara's home/profile showing 2025 → 2035 attainment shift for her cohort (Wittgenstein), with a one-line plain-English read: *"By 2030, secondary completion in your region rises from 48% → 61%. Your edge today erodes by 2030 unless you add [skill]."* This is the rare youth-readable projection the brief explicitly asks for.

### 5. "What we don't know" caveats panel
A small **Methodology & Limits** drawer accessible from any page footer. List: data vintage, what's modeled vs measured, calibration assumptions, known gaps (e.g., "informal wage data is sparse — we use ILO modelled estimates"). This single feature signals the maturity the brief rewards in "honest about limits."

### 6. Two visible econometric signals on the youth opportunity card
Audit each opportunity card and ensure **two named, sourced signals** are visible (e.g., *"Sector growth +12.4% YoY · ILOSTAT 2024"* and *"Wage floor 1,850 GHS/mo · WDI 2023"*), not buried. Brief: must surface ≥2 econometric signals **visibly**.

### 7. Constraint-aware narrative tightening
The Constraint Banner already exists. Add a one-line "*This match assumes your offline-first connectivity and walking-distance mobility — change in Configure Context to broaden options.*" so judges literally see constraint shape outcomes. Cheap, devastatingly on-brief.

### 8. The 90-second story arc for the demo video
Open on Amara's intake → portable profile → opportunity card with two real ILO signals + constraint banner → toggle to Policy mode (same data, aggregate view) → click Demo Switcher to Bangladesh, watch everything reflow → close on the "Methodology & Limits" caveat panel and the export-credential button. That arc hits every "Strong Submission" bullet from the brief.

## What you can SKIP (judges won't care, brief doesn't reward)

- More pretty animations beyond what's already there
- More countries in the picker (12 is already over-indexed)
- More dashboard charts on the policy side — we already have plenty
- A real auth/login system — not asked for
- Any LLM features — not in the brief; absence is fine

## Technical scope of the 8 moves (for build mode)

| # | Files touched | Effort |
|---|---|---|
| 1 | new `src/data/ilostat-gha-2024.json`; small loader hook; bind in `opportunities-board.tsx`, `signal-cards.tsx`, opportunity card | 2–3h |
| 2 | new `DemoSwitcher` component in shells; extend `context-config-store` with preset apply method | 1–2h |
| 3 | `profile.tsx`: add export button; new `lib/credential.ts` (JSON schema, QR via `qrcode` npm, PDF via existing print path) | 2h |
| 4 | new `projections-strip.tsx` for youth; reuse `wittgenstein` series shape; mount on `index.tsx` and `profile.tsx` | 1.5h |
| 5 | new `methodology-drawer.tsx`; trigger added to all shell footers | 1h |
| 6 | sweep `opportunity-card.tsx` to ensure 2 named signals with source pills | 0.5h |
| 7 | one-line copy update inside Constraint Banner | 5 min |
| 8 | demo script doc + light copy polish | 30 min |

Total: ~10 focused hours to move from "great-looking prototype" to "demonstrably hackathon-winning entry against this exact brief."

## Recommended build order

Start with **#1 (real data) + #2 (reconfigure demo) + #6 (visible signals)** — these three together neutralize the brief's three weak-submission traps in one push. Then #3, #4, #5 to lock the strong-submission bullets. #7 and #8 are last-mile polish.

---

**Approve this plan and I'll start with moves 1, 2, and 6** (the highest-leverage trio) in the next build pass.
