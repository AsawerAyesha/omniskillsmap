# Cached real-world economic datasets

These JSON snapshots are **real values** sourced from public datasets. They
ship as static assets so the demo runs offline / on shared devices and so the
brief's "design for constraint" requirement holds end-to-end.

| File | Country | Sources | Vintage |
|------|---------|---------|---------|
| `ghana-2024.json`      | Ghana (urban informal · Accra) | ILO ILOSTAT, World Bank WDI, ITU, Frey-Osborne (LMIC-calibrated) | 2023–2024 |
| `bangladesh-2024.json` | Bangladesh (rural agricultural · Khulna) | ILO ILOSTAT, World Bank WDI, ITU, Frey-Osborne (LMIC-calibrated) | 2023–2024 |

Schema: `CountryDataSnapshot` in `src/data/types.ts`.

**Why static cache, not a live API:**
- ILOSTAT/WDI APIs require multi-second cold fetches that fail on intermittent
  3G — exactly Amara's connectivity profile.
- The values surfaced are stable annual figures (employment-to-population,
  sector growth, modeled wages); refresh cadence is once per data vintage.
- A live wire-up would be a one-file swap (replace the loader's static import
  with a `fetch()` to ILOSTAT REST) — the rest of the app is data-shape stable.

Each value includes a `source`, a `dataset` identifier, and a `vintage` so the
UI can render an honest "ILO ILOSTAT 2024 · cached" attribution pill instead
of a bare number.