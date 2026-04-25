/* Aggregate Opportunities — what programs are available, who they reach,
 * and where the supply / demand gaps sit. Country-aware, deterministic. */

import { getCountryDataset } from "./dashboard-data";

export type OppCategory =
  | "employment"
  | "self-employment"
  | "gig"
  | "training";

export interface SectorFlow {
  sector: string;
  open: number;        // open opportunities this quarter
  fillRate: number;    // 0–100, % being filled
  matchedYouth: number;// youth currently matched
  gap: number;         // unmet demand (positive = shortage)
  weeklyDelta: number;
  byCategory: Record<OppCategory, number>;
}

export interface PipelineNode {
  stage: "Discovered" | "Matched" | "Applied" | "Placed";
  count: number;
}

export interface ProgramRow {
  id: string;
  name: string;
  partner: string;
  category: OppCategory;
  sector: string;
  region: string;
  capacity: number;
  filled: number;
  status: "Active" | "Onboarding" | "Closed";
}

export interface OppDataset {
  country: string;
  contextLine: string;
  totals: {
    openOpportunities: number;
    matchedYouth: number;
    avgFillRate: number; // weighted
    weeklyDelta: number;
    unmetGap: number;
  };
  byCategory: Record<OppCategory, number>;
  sectors: SectorFlow[];
  pipeline: PipelineNode[];
  programs: ProgramRow[];
}

/* ─── Per-country sector lens ─── */
const SECTOR_LENS: Record<
  string,
  Array<{ sector: string; demand: number; cat: Record<OppCategory, number> }>
> = {
  Ghana: [
    { sector: "Electronics & repair",   demand: 86, cat: { employment: 142, "self-employment": 88,  gig: 64,  training: 121 } },
    { sector: "Construction trades",    demand: 78, cat: { employment: 188, "self-employment": 71,  gig: 22,  training: 96  } },
    { sector: "Digital & ICT support",  demand: 88, cat: { employment: 96,  "self-employment": 41,  gig: 132, training: 144 } },
    { sector: "Garment & textile",      demand: 71, cat: { employment: 124, "self-employment": 112, gig: 18,  training: 71  } },
    { sector: "Hospitality & food",     demand: 54, cat: { employment: 88,  "self-employment": 56,  gig: 41,  training: 38  } },
    { sector: "Health & care",          demand: 64, cat: { employment: 71,  "self-employment": 22,  gig: 14,  training: 64  } },
  ],
  Bangladesh: [
    { sector: "Garment & textile",      demand: 91, cat: { employment: 612, "self-employment": 84,  gig: 38,  training: 218 } },
    { sector: "Construction trades",    demand: 80, cat: { employment: 244, "self-employment": 96,  gig: 32,  training: 121 } },
    { sector: "Digital & ICT support",  demand: 84, cat: { employment: 188, "self-employment": 72,  gig: 168, training: 192 } },
    { sector: "Electronics & repair",   demand: 76, cat: { employment: 142, "self-employment": 76,  gig: 41,  training: 96  } },
    { sector: "Hospitality & food",     demand: 48, cat: { employment: 71,  "self-employment": 38,  gig: 22,  training: 31  } },
    { sector: "Health & care",          demand: 66, cat: { employment: 96,  "self-employment": 18,  gig: 11,  training: 84  } },
  ],
  Kenya: [
    { sector: "Digital & ICT support",  demand: 89, cat: { employment: 124, "self-employment": 62,  gig: 188, training: 156 } },
    { sector: "Agri-processing",        demand: 72, cat: { employment: 96,  "self-employment": 71,  gig: 22,  training: 88  } },
    { sector: "Electronics & repair",   demand: 74, cat: { employment: 84,  "self-employment": 56,  gig: 41,  training: 64  } },
    { sector: "Hospitality & food",     demand: 58, cat: { employment: 71,  "self-employment": 41,  gig: 38,  training: 32  } },
    { sector: "Construction trades",    demand: 70, cat: { employment: 88,  "self-employment": 38,  gig: 18,  training: 56  } },
    { sector: "Health & care",          demand: 67, cat: { employment: 64,  "self-employment": 18,  gig: 11,  training: 71  } },
  ],
};

const PROGRAM_TEMPLATES: Record<string, ProgramRow[]> = {
  Ghana: [
    { id: "GHA-PRG-0118", name: "TVET Phone Repair Cohort 7",     partner: "Ghana TVET Authority",   category: "training",        sector: "Electronics & repair",  region: "Greater Accra", capacity: 120, filled: 96,  status: "Active" },
    { id: "GHA-PRG-0119", name: "Samsung Care Bench Pipeline",    partner: "Franko Trading",         category: "employment",      sector: "Electronics & repair",  region: "Greater Accra", capacity: 60,  filled: 41,  status: "Active" },
    { id: "GHA-PRG-0124", name: "FixIt Platform Onboarding",      partner: "FixIt Ghana",            category: "gig",             sector: "Digital & ICT support", region: "Greater Accra", capacity: 200, filled: 124, status: "Active" },
    { id: "GHA-PRG-0131", name: "YEA Micro-grant — Repair Hubs",  partner: "Youth Employment Agency",category: "self-employment", sector: "Electronics & repair",  region: "Ashanti",       capacity: 40,  filled: 18,  status: "Onboarding" },
    { id: "GHA-PRG-0142", name: "Tailoring Co-op Cohort 3",       partner: "ATU Tailors Guild",      category: "self-employment", sector: "Garment & textile",     region: "Western",       capacity: 80,  filled: 71,  status: "Active" },
    { id: "GHA-PRG-0150", name: "Mason Apprenticeship — Cape",    partner: "GIZ Construction TVET",  category: "training",        sector: "Construction trades",   region: "Central",       capacity: 60,  filled: 32,  status: "Onboarding" },
  ],
  Bangladesh: [
    { id: "BGD-PRG-0211", name: "RMG Operator Fast-track",        partner: "BGMEA Skills Council",   category: "training",        sector: "Garment & textile",    region: "Dhaka",         capacity: 400, filled: 312, status: "Active" },
    { id: "BGD-PRG-0214", name: "Helpdesk Bootcamp — Cohort 9",   partner: "BASIS",                  category: "training",        sector: "Digital & ICT support",region: "Dhaka",         capacity: 120, filled: 96,  status: "Active" },
    { id: "BGD-PRG-0220", name: "Steel-fixer Site Pipeline",      partner: "Bashundhara Group",      category: "employment",      sector: "Construction trades",  region: "Chattogram",    capacity: 200, filled: 148, status: "Active" },
    { id: "BGD-PRG-0231", name: "Mobile Repair Co-op",            partner: "ICT Division",           category: "self-employment", sector: "Electronics & repair", region: "Sylhet",        capacity: 80,  filled: 41,  status: "Onboarding" },
  ],
  Kenya: [
    { id: "KEN-PRG-0309", name: "Ajira Digital Cohort 12",        partner: "Ajira / KICTA",          category: "gig",             sector: "Digital & ICT support",region: "Nairobi",       capacity: 250, filled: 188, status: "Active" },
    { id: "KEN-PRG-0312", name: "Tea-factory Operator Pipeline",  partner: "KETA",                   category: "employment",      sector: "Agri-processing",      region: "Rift Valley",   capacity: 120, filled: 84,  status: "Active" },
    { id: "KEN-PRG-0315", name: "Solar Installer Cert.",          partner: "Strathmore Energy",      category: "training",        sector: "Electronics & repair", region: "Mombasa",       capacity: 80,  filled: 56,  status: "Active" },
    { id: "KEN-PRG-0322", name: "Mama Mboga Co-op",               partner: "KCB Foundation",         category: "self-employment", sector: "Hospitality & food",   region: "Coast",         capacity: 60,  filled: 22,  status: "Onboarding" },
  ],
};

function fillRateFor(seed: string): number {
  // deterministic 55–88
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 55 + (h % 34);
}

export function getOppDataset(country: string): OppDataset {
  const cohort = getCountryDataset(country);
  const lens =
    SECTOR_LENS[country] ??
    SECTOR_LENS.Ghana;
  const programs =
    PROGRAM_TEMPLATES[country] ??
    PROGRAM_TEMPLATES.Ghana;

  const sectors: SectorFlow[] = lens.map((l) => {
    const open = Object.values(l.cat).reduce((a, b) => a + b, 0);
    const fillRate = fillRateFor(`${country}:${l.sector}`);
    const matchedYouth = Math.round((open * fillRate) / 100);
    const gap = Math.max(0, Math.round(open * (l.demand / 100)) - matchedYouth);
    return {
      sector: l.sector,
      open,
      fillRate,
      matchedYouth,
      gap,
      weeklyDelta: Math.round(open * 0.04),
      byCategory: l.cat,
    };
  });

  const open = sectors.reduce((a, s) => a + s.open, 0);
  const matched = sectors.reduce((a, s) => a + s.matchedYouth, 0);
  const weighted = Math.round((matched / Math.max(1, open)) * 100);
  const gap = sectors.reduce((a, s) => a + s.gap, 0);
  const weekly = sectors.reduce((a, s) => a + s.weeklyDelta, 0);

  // Roll up byCategory
  const byCategory: Record<OppCategory, number> = {
    employment: 0,
    "self-employment": 0,
    gig: 0,
    training: 0,
  };
  for (const s of sectors) {
    (Object.keys(s.byCategory) as OppCategory[]).forEach((k) => {
      byCategory[k] += s.byCategory[k];
    });
  }

  // Funnel: deterministic from cohort + demand
  const discovered = cohort.cohort.activeProfiles;
  const matchedFunnel = Math.round(discovered * 0.62);
  const applied = Math.round(matchedFunnel * 0.55);
  const placed = Math.round(applied * 0.41);

  return {
    country,
    contextLine: cohort.contextLine,
    totals: {
      openOpportunities: open,
      matchedYouth: matched,
      avgFillRate: weighted,
      weeklyDelta: weekly,
      unmetGap: gap,
    },
    byCategory,
    sectors: sectors.sort((a, b) => b.open - a.open),
    pipeline: [
      { stage: "Discovered", count: discovered },
      { stage: "Matched",    count: matchedFunnel },
      { stage: "Applied",    count: applied },
      { stage: "Placed",     count: placed },
    ],
    programs,
  };
}

export const CATEGORY_META: Record<
  OppCategory,
  { label: string; color: string; ring: string }
> = {
  employment:        { label: "Employment",      color: "#7C9EB2", ring: "rgba(124,158,178,0.35)" },
  "self-employment": { label: "Self-employment", color: "#C4A882", ring: "rgba(196,168,130,0.35)" },
  gig:               { label: "Gig work",        color: "#A87FB8", ring: "rgba(168,127,184,0.35)" },
  training:          { label: "Training",        color: "#7FB58A", ring: "rgba(127,181,138,0.35)" },
};