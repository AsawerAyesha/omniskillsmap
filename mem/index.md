# Project Memory

## Core
Product: UNMAPPED — skills infrastructure for youth in low-income countries (World Bank/ILO data).
Aesthetic: "Civic Precision" — institutional trust (UN/World Bank) + 2026 warmth & motion. NOT startup SaaS, NOT gov portal.
Fonts: Fraunces (display/numbers), DM Sans (body/UI), JetBrains Mono (data/codes). Never use Inter/Poppins.
Brand colors live as CSS vars in src/styles.css: --earth #C4A882, --earth-light #F5EFE6, --earth-dark #7A6548, --ink #1A1814, --surface #FAFAF8. Signal: green/amber/red/blue.
Motion: 200/350/600ms with cubic-bezier(0.16,1,0.3,1) expo-out. No bounce/spring. 60ms stagger.
Radii: 4/8/16/999px. Spacing on 4px base. Lucide icons stroke-width 1.5, 16px, ink-secondary.
Use semantic tokens only — never hardcode colors in components. Primitives in src/components/unmapped/primitives.tsx (UCard, UBadge, UChip, UProgress, UOccupation, UStat).
Full dark mode via .dark class + prefers-color-scheme. Grid: 12-col, max 1200px, 24px gutters (16px mobile) — use .u-container.

## Memories
