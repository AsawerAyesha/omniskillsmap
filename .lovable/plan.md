# Constraint-aware matching

Wire the existing Advanced Signals (connectivity, mobility, displacement) into the Youth surfaces so recommendations *feel* shaped by them. Today the signals are captured in Configure Context but no surface reads them.

## What the user will see

**1. "Adapted for…" banner** at the top of `/opportunities` and `/learn`
Compact strip that names the active constraints and links to the drawer:

```text
Adapted for  📶 Offline-first · 👣 Walking · 🏕 Refugee   [ Adjust ]
```

Hidden when all three signals are at defaults (intermittent / local_transit / none).

**2. Fit chips on every opportunity card**
Each card gets up to three small chips next to the type badge:

- ✓ green chip when the opportunity satisfies a constraint ("Works offline", "≤5 km", "Refugee-friendly partner")
- ⚠ amber chip when it conflicts ("Needs daily data", "Regional travel required")

These are derived per card — no editorial copy per opportunity.

**3. Soft re-ranking, not filtering**
Cards stay in the list but the match score is nudged ±8 pts based on fit, and the order respects that. Nothing is silently dropped, so users keep agency.

**4. Honest empty / partial state**
When constraints push results down, show a one-line note above the stack:

> "3 opportunities ranked lower because of your mobility setting. [Relax]"

The Relax link opens the drawer at the Advanced Signals section.

**5. Lesson rail mirror in `/learn`**
Same banner + a single "Offline-ready" chip on lesson cards when `connectivity=offline_first`.

## Technical approach

**Data — extend opportunities-data.ts**
Add three optional booleans per opportunity (defaulted by sensible fallbacks where missing):

```ts
interface Opportunity {
  // …existing
  offlineFriendly?: boolean;     // can be done with intermittent data
  walkableRadiusKm?: number;     // distance from Amara's home
  refugeeAccessible?: boolean;   // partner accepts refugee/IDP IDs
}
```

Seed values for the existing 6 opportunities — mix of fits & conflicts so the UI is visible.

**Matching helper — new file `src/components/unmapped/opportunities/constraint-fit.ts`**

```ts
export interface FitChip { tone: "good" | "warn"; label: string; icon: LucideIcon }
export function evaluateFit(o: Opportunity, s: AdvancedSignals): {
  chips: FitChip[];          // for the card
  scoreDelta: number;        // -8…+8
}
```

Pure function. Rules:
- `connectivity=offline_first` + `offlineFriendly=true` → +4 "Works offline"; opposite → -6 "Needs daily data"
- `mobility=walking` + `walkableRadiusKm<=5` → +4 "≤5 km"; >15 → -6 "Regional travel"
- `mobility=local_transit` + walkable<=15 → +2 (no chip needed)
- `displacement≠none` + `refugeeAccessible=true` → +4 "Refugee-friendly partner"; false → -4 "ID requirements may apply"

**UI changes**
- `opportunity-card.tsx` — accept `fit: FitChip[]` and `adjustedScore` props; render chips under the type badge, show original score struck-through when nudged.
- `opportunities.tsx` — read `active.advanced_signals`, compute fit per card, sort by adjusted score, render banner + lowered-count note.
- `learn-board.tsx` — same banner; "Offline-ready" chip on lesson cards when applicable.
- New shared component `src/components/unmapped/constraint-banner.tsx` — used by both pages.

**No re-ranking when defaults are active** — `evaluateFit` returns empty chips and `scoreDelta=0` so the page looks unchanged for users who never opened Advanced Signals.

## Files

Created
- `src/components/unmapped/constraint-banner.tsx`
- `src/components/unmapped/opportunities/constraint-fit.ts`

Edited
- `src/components/unmapped/opportunities/opportunities-data.ts` (3 fields × 6 rows)
- `src/components/unmapped/opportunities/opportunity-card.tsx` (chips + adjusted score)
- `src/routes/opportunities.tsx` (banner, sort, lowered-count note)
- `src/components/unmapped/learn/learn-board.tsx` (banner + offline chip)

## Out of scope

- Persisting saved/relaxed state to a backend (still local).
- Geolocation — `walkableRadiusKm` is editorial seed data, not live distance.
- Policy-side surfaces — the request is youth-facing.
