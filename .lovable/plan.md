
# OmniSkill — Infrastructure Layer Plan

Right now the app **looks** like infrastructure but is a styled demo: every dataset (`skills-map-data.ts`, `risk-data.ts`, `projections-data.ts`, `opportunities-data.ts`, `learn-data.ts`, `region-pills.tsx`) is hardcoded TypeScript. The console writes nothing. To prove this is a *protocol, not a product*, we need: tenants → per-tenant data uploads → public pages that read those uploads → audit trail.

## Goal

A government in Pakistan, an NGO in Kenya, and an employer in Brazil can each:
1. Sign up to the console
2. Create their own **context** (country/region + locale + calibration)
3. Upload their own labor data, taxonomy, occupations, automation scores
4. Publish a draft → live
5. The youth + policy dashboards instantly reflect *their* data when that context is selected

No code changes per tenant. Country params are **rows**, not constants.

---

## Architecture

```text
                  ┌─────────────────────────┐
                  │   OPERATOR CONSOLE      │
                  │   (gov / NGO / employer)│
                  └───────────┬─────────────┘
                              │ uploads CSV/JSON
                              ▼
        ┌──────────────────────────────────────────┐
        │        DATA LAYER (Lovable Cloud)        │
        │                                          │
        │  contexts ── datasets ── ingestion_runs  │
        │     │                                    │
        │     ├── taxonomy_skills (per context)    │
        │     ├── occupations     (per context)    │
        │     ├── automation_scores                │
        │     ├── labor_indicators (ILO/WB shape)  │
        │     ├── opportunities                    │
        │     └── learning_resources               │
        └──────────────────┬───────────────────────┘
                           │ public read (RLS: live + published)
                           ▼
                ┌──────────────────────┐
                │  YOUTH + POLICY APP  │
                │  reads active ctx    │
                └──────────────────────┘
```

---

## Database schema (migration)

Eight new tables, all with RLS. Roles already exist (`admin`, `operator`, `viewer`).

| Table | Purpose | Key columns |
|---|---|---|
| `contexts` | A tenant's country/region | code (e.g. `PK`, `KE-NRB`), name, locale, currency, calibration JSON, owner_org, status |
| `context_members` | Who can edit a context | context_id, user_id, role (`owner`/`editor`/`viewer`) |
| `datasets` | A versioned bundle per context | context_id, kind (`taxonomy`/`occupations`/`labor`/`automation`/`opportunities`/`learning`), version, status (`draft`/`live`/`archived`), published_at |
| `taxonomy_skills` | ESCO/ONET-style skill nodes | dataset_id, code, label, parent_code, level, source |
| `occupations` | ISCO-08 / O*NET occupations | dataset_id, code, title, isco_major, automation_risk |
| `labor_indicators` | ILO/WDI metrics | dataset_id, indicator_code, year, value, sex, age_band |
| `opportunities` | Jobs/internships available | dataset_id, title, employer, sector, skills[], region, remote |
| `learning_resources` | Courses tied to skills | dataset_id, title, provider, skill_codes[], duration_h, language, cost |
| `ingestion_runs` | Audit log of every upload | context_id, dataset_id, file_name, rows_in, rows_ok, rows_err, errors_jsonb, actor_id |

RLS rules:
- **Operators** can read/write only contexts where they're a member
- **Admins** can read/write everything
- **Public** (anon) can `SELECT` only rows in datasets with `status='live'` — this is what the youth/policy pages query
- `user_roles` keeps existing app-wide role; `context_members` adds per-tenant role

---

## File ingestion (server route)

Single endpoint `/api/console/ingest` (TanStack server route, auth-required):

```text
POST /api/console/ingest
  body: { contextId, datasetKind, version, format: "csv"|"json", payload }
  → validates with Zod schemas (one per kind)
  → inserts rows into the right table
  → writes ingestion_runs audit row
  → returns { datasetId, rowsOk, rowsErr, errors[] }
```

Templates the operator can download per kind (CSV headers fixed):
- `taxonomy.csv` → `code,label,parent_code,level,source`
- `occupations.csv` → `code,title,isco_major,automation_risk`
- `labor.csv` → `indicator_code,year,value,sex,age_band`
- `opportunities.csv` → `title,employer,sector,skills,region,remote`
- `learning.csv` → `title,provider,skill_codes,duration_h,language,cost`

Strict validation (reject bad rows with row-number errors), no partial writes unless operator chooses "import valid rows only".

---

## Console pages — wire to real data

Existing console routes get real backing:

| Route | What it does now (mock) | What it does after |
|---|---|---|
| `/console` | Static cards | Lists *my* contexts + draft/live counts from DB |
| `/console/contexts` | (missing list view) | Table of contexts I can edit; create/edit/archive |
| `/console/contexts/new` | UI only | Inserts row into `contexts`, adds me as owner in `context_members` |
| `/console/taxonomy` | Static tree | Pick context → upload CSV → preview → save as draft dataset |
| `/console/connections` | Mock | Same upload flow for `opportunities` + `learning` + `labor` |
| `/console/deploy` | Mock | Promote a `draft` dataset → `live`, archive previous live |
| `/console/monitor` | Mock | Live feed of `ingestion_runs` for my contexts |

Each upload page: dropzone → server validates → preview table (first 20 rows + error summary) → "Save as draft" or "Save & publish".

---

## Public pages — read live data per context

The country pill on the home/policy/youth pages already exists. We make it the **tenant selector**. Replace each `*-data.ts` import with a TanStack Query hook against Lovable Cloud:

| Public page | Hardcoded today | Reads after |
|---|---|---|
| `/` RegionPills | hardcoded list | `contexts WHERE status='active'` |
| `/intake` skills | hardcoded | `taxonomy_skills` for active context's live taxonomy dataset |
| `/opportunities` | mock cards | `opportunities` for active context's live dataset |
| `/learn` | mock courses | `learning_resources` for active context |
| `/ai-readiness` | static risk | `occupations.automation_risk` for active context |
| `/policy/skills` | mock heatmap | aggregated `taxonomy_skills` + `labor_indicators` |
| `/policy/projections` | mock chart | `labor_indicators` time series |
| `/policy/risk` | mock | `occupations` joined to labor share |
| `/policy/opportunities` | mock | aggregated `opportunities` |

Empty-state per page: "No live data for {context}. Operators: upload via console."

---

## How you'll test it (the actual point)

End-to-end smoke test you run yourself, twice with **two different operator accounts** to prove tenancy:

```text
ROUND 1 — Operator A (Pakistan)
1. Sign up A → /console
2. Create context "Pakistan / PK / Urdu+English / PKR"
3. Upload taxonomy_pk.csv  (10 skills)   → save draft → publish
4. Upload occupations_pk.csv (5 jobs)    → publish
5. Upload labor_pk.csv (ILO youth NEET)  → publish
6. Open / in incognito → pick Pakistan   → see your 10 skills, 5 jobs, NEET chart

ROUND 2 — Operator B (Kenya)
7. Sign up B → /console (cannot see A's contexts)
8. Create context "Kenya / KE / Swahili+English / KES"
9. Upload completely different CSVs       → publish
10. Public app, switch to Kenya           → all numbers change, Pakistan's data nowhere
11. Switch back to Pakistan               → A's numbers return

NEGATIVE TESTS
12. Operator B tries to GET /api/console/datasets?contextId=<A's ctx>  → 403
13. Anonymous visitor queries DB directly for a draft dataset          → 0 rows (RLS)
14. Upload a CSV with bad rows → preview shows row-numbered errors, no partial write
15. Publish v2 of taxonomy → public immediately reflects v2, v1 archived
16. Archive a context → public app falls back to "no live data"
```

Sample CSVs (5–10 rows each, two countries) ship in `/templates/` so you can run the test in 10 minutes.

---

## What's out of scope (be explicit)

- No auto-scraping of ILO/WB. Operators bring their own CSV in the published shape (we ship the schema + a one-page "how to export from ILOSTAT" guide).
- No multi-language UI yet — only `locale` is stored on context (used for number/date formatting + future i18n).
- No data marketplace / cross-context analytics (admin-only view comes later).
- No payments, no quotas — Lovable Cloud free tier limits apply.

---

## Build order (so you can test as we go)

1. **Migration**: 8 tables + RLS + `context_members` join + helper functions
2. **Console: contexts list + create + members** (you can already verify tenancy here)
3. **Server route `/api/console/ingest`** + Zod schemas for all 6 dataset kinds
4. **Console: taxonomy upload page** (one upload flow, then the others mirror it)
5. **Console: deploy + monitor pages** wired to real data
6. **Public: replace `region-pills` and one dashboard (`/policy/skills`) with live data** — proves the round-trip
7. **Public: migrate remaining pages** off `*-data.ts`
8. **Sample CSVs in `/templates/`** + a README with the test script above

After step 6 you can already run the full round-trip test. Steps 7–8 finish the rest of the surface.

---

## Decisions needed from you

1. **Do you want to be promoted to `admin`** (full cross-tenant visibility) for testing? Default: yes.
2. **Tenancy model**: one user = one org with many contexts (simpler) **or** orgs as a separate table with multiple users per org (more realistic). I recommend starting with `context_members` (per-context membership) and adding orgs later.
3. **Publishing model**: hard cutover (v2 live → v1 archived instantly) or **canary** (v2 live for 10% of viewers first). Recommend hard cutover for v1.
4. **Anonymous public read**: should the youth/policy pages work without login, or require sign-in too? Current app is anonymous — recommend keeping it that way.
