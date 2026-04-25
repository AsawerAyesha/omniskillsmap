/* Projections dataset — 5-year forward labour-market simulation by country.
 * Three scenarios (baseline / accelerated / disruptive) ripple across:
 *   - Cohort supply curve (cumulative profiles entering market)
 *   - Demand index per skill cluster
 *   - Education attainment trajectories
 *   - Net opportunity gap (placements vs. supply)
 * Deterministic — the warehouse would replace this in production.
 */

export type ScenarioId = "baseline" | "accelerated" | "disruptive";

export interface ScenarioMeta {
  id: ScenarioId;
  label: string;
  shortLabel: string;
  color: string;
  ring: string;
  blurb: string;
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline",
    shortLabel: "Base",
    color: "#7C9EB2",
    ring: "rgba(124,158,178,0.35)",
    blurb: "Current policy mix, no shocks. ILO trend extension.",
  },
  {
    id: "accelerated",
    label: "Accelerated investment",
    shortLabel: "Accel.",
    color: "#7FB58A",
    ring: "rgba(127,181,138,0.35)",
    blurb: "+30% TVET funding, scaled employer partnerships.",
  },
  {
    id: "disruptive",
    label: "Disruptive shock",
    shortLabel: "Shock",
    color: "#E07A5F",
    ring: "rgba(224,122,95,0.35)",
    blurb: "Automation acceleration + climate displacement.",
  },
];

export interface YearPoint {
  year: number;
  baseline: number;
  accelerated: number;
  disruptive: number;
}

export interface ClusterProjection {
  cluster: string;
  /* indexed: 100 = year-0 demand baseline */
  demand2030: Record<ScenarioId, number>;
  /* projected supply gap in 2030 (negative = shortage, positive = surplus) */
  gap2030: Record<ScenarioId, number>;
  notes: string;
}

export interface AttainmentTrajectory {
  year: number;
  none: Record<ScenarioId, number>;
  secondary: Record<ScenarioId, number>;
  tertiary: Record<ScenarioId, number>;
}

export interface KeyMilestone {
  year: number;
  label: string;
  detail: string;
  scenario: ScenarioId | "all";
}

export interface ProjectionsDataset {
  country: string;
  contextLine: string;
  startYear: number;
  endYear: number;
  totals: {
    cohort2030: Record<ScenarioId, number>;
    placement2030: Record<ScenarioId, number>;
    avgDemandIndex2030: Record<ScenarioId, number>;
    confidenceBand: number; // ± percentage points
  };
  supplyCurve: YearPoint[];          // cumulative cohort entering market (k)
  demandIndex: YearPoint[];          // weighted demand index (100 baseline)
  attainment: AttainmentTrajectory[];
  clusters: ClusterProjection[];
  milestones: KeyMilestone[];
}

/* ──────────────────────────────────────────────────────────────────────
 * Per-country deterministic fixtures
 * ────────────────────────────────────────────────────────────────────── */
const GHANA: ProjectionsDataset = {
  country: "Ghana",
  contextLine: "Ghana · 5-year forward simulation · 2025–2030",
  startYear: 2025,
  endYear: 2030,
  totals: {
    cohort2030: { baseline: 184, accelerated: 246, disruptive: 158 },
    placement2030: { baseline: 71, accelerated: 124, disruptive: 49 },
    avgDemandIndex2030: { baseline: 112, accelerated: 128, disruptive: 96 },
    confidenceBand: 6,
  },
  supplyCurve: [
    { year: 2025, baseline: 42,  accelerated: 42,  disruptive: 42 },
    { year: 2026, baseline: 71,  accelerated: 78,  disruptive: 66 },
    { year: 2027, baseline: 102, accelerated: 121, disruptive: 91 },
    { year: 2028, baseline: 131, accelerated: 165, disruptive: 116 },
    { year: 2029, baseline: 158, accelerated: 207, disruptive: 138 },
    { year: 2030, baseline: 184, accelerated: 246, disruptive: 158 },
  ],
  demandIndex: [
    { year: 2025, baseline: 100, accelerated: 100, disruptive: 100 },
    { year: 2026, baseline: 102, accelerated: 105, disruptive: 99  },
    { year: 2027, baseline: 105, accelerated: 111, disruptive: 97  },
    { year: 2028, baseline: 108, accelerated: 117, disruptive: 96  },
    { year: 2029, baseline: 110, accelerated: 122, disruptive: 96  },
    { year: 2030, baseline: 112, accelerated: 128, disruptive: 96  },
  ],
  attainment: [
    { year: 2025, none: { baseline: 18, accelerated: 18, disruptive: 18 }, secondary: { baseline: 54, accelerated: 54, disruptive: 54 }, tertiary: { baseline: 28, accelerated: 28, disruptive: 28 } },
    { year: 2027, none: { baseline: 16, accelerated: 13, disruptive: 19 }, secondary: { baseline: 55, accelerated: 53, disruptive: 56 }, tertiary: { baseline: 29, accelerated: 34, disruptive: 25 } },
    { year: 2030, none: { baseline: 13, accelerated:  8, disruptive: 21 }, secondary: { baseline: 55, accelerated: 49, disruptive: 56 }, tertiary: { baseline: 32, accelerated: 43, disruptive: 23 } },
  ],
  clusters: [
    { cluster: "Digital & ICT",        demand2030: { baseline: 124, accelerated: 148, disruptive: 132 }, gap2030: { baseline: -1800, accelerated: -400,  disruptive: -3100 }, notes: "Fastest demand growth; supply struggles to keep pace." },
    { cluster: "Care & Health",        demand2030: { baseline: 118, accelerated: 132, disruptive: 121 }, gap2030: { baseline: -1200, accelerated: -150,  disruptive: -2200 }, notes: "Demographic tailwind; female-skewed pipeline." },
    { cluster: "Green & Climate",      demand2030: { baseline: 122, accelerated: 144, disruptive: 138 }, gap2030: { baseline: -2400, accelerated: -700,  disruptive: -3800 }, notes: "Adaptation jobs concentrated in coastal regions." },
    { cluster: "Trades & Construction",demand2030: { baseline: 108, accelerated: 116, disruptive: 102 }, gap2030: { baseline:  -300, accelerated:  600,  disruptive: -1200 }, notes: "Cyclical; tied to public infrastructure cadence." },
    { cluster: "Agriculture & Agri-tech", demand2030: { baseline: 104, accelerated: 118, disruptive:  88 }, gap2030: { baseline:   400, accelerated: 1200,  disruptive: -1500 }, notes: "Climate volatility creates two divergent paths." },
    { cluster: "Logistics",            demand2030: { baseline: 110, accelerated: 122, disruptive:  92 }, gap2030: { baseline:  -600, accelerated:  100,  disruptive: -1900 }, notes: "Port-led; vulnerable to automation in handling." },
    { cluster: "Creative & Media",     demand2030: { baseline: 106, accelerated: 114, disruptive:  98 }, gap2030: { baseline:   200, accelerated:  800,  disruptive:  -700 }, notes: "Generative AI compresses entry-level demand." },
    { cluster: "Hospitality & Tourism",demand2030: { baseline: 112, accelerated: 124, disruptive:  86 }, gap2030: { baseline:  -800, accelerated:    0,  disruptive: -2600 }, notes: "Tourism upside; shock-sensitive on global travel." },
  ],
  milestones: [
    { year: 2026, label: "TVET reform vote", detail: "Pending bill scales certification across 14 regions.", scenario: "accelerated" },
    { year: 2027, label: "Digital demand cross-over", detail: "ICT cluster overtakes trades in absolute openings.", scenario: "all" },
    { year: 2028, label: "Automation tipping point", detail: "Routine clerical roles drop below 60% of 2025 level.", scenario: "disruptive" },
    { year: 2030, label: "Tertiary attainment 40%+", detail: "Achievable only under accelerated scenario.", scenario: "accelerated" },
  ],
};

const BANGLADESH: ProjectionsDataset = {
  country: "Bangladesh",
  contextLine: "Bangladesh · 5-year forward simulation · 2025–2030",
  startYear: 2025,
  endYear: 2030,
  totals: {
    cohort2030: { baseline: 412, accelerated: 538, disruptive: 348 },
    placement2030: { baseline: 162, accelerated: 281, disruptive: 102 },
    avgDemandIndex2030: { baseline: 116, accelerated: 134, disruptive: 91 },
    confidenceBand: 7,
  },
  supplyCurve: [
    { year: 2025, baseline:  92, accelerated:  92, disruptive:  92 },
    { year: 2026, baseline: 158, accelerated: 174, disruptive: 144 },
    { year: 2027, baseline: 226, accelerated: 264, disruptive: 198 },
    { year: 2028, baseline: 292, accelerated: 358, disruptive: 252 },
    { year: 2029, baseline: 354, accelerated: 450, disruptive: 302 },
    { year: 2030, baseline: 412, accelerated: 538, disruptive: 348 },
  ],
  demandIndex: [
    { year: 2025, baseline: 100, accelerated: 100, disruptive: 100 },
    { year: 2026, baseline: 103, accelerated: 107, disruptive:  98 },
    { year: 2027, baseline: 107, accelerated: 114, disruptive:  95 },
    { year: 2028, baseline: 110, accelerated: 121, disruptive:  93 },
    { year: 2029, baseline: 113, accelerated: 128, disruptive:  92 },
    { year: 2030, baseline: 116, accelerated: 134, disruptive:  91 },
  ],
  attainment: [
    { year: 2025, none: { baseline: 22, accelerated: 22, disruptive: 22 }, secondary: { baseline: 58, accelerated: 58, disruptive: 58 }, tertiary: { baseline: 20, accelerated: 20, disruptive: 20 } },
    { year: 2027, none: { baseline: 19, accelerated: 15, disruptive: 23 }, secondary: { baseline: 59, accelerated: 57, disruptive: 60 }, tertiary: { baseline: 22, accelerated: 28, disruptive: 17 } },
    { year: 2030, none: { baseline: 15, accelerated:  9, disruptive: 26 }, secondary: { baseline: 60, accelerated: 54, disruptive: 60 }, tertiary: { baseline: 25, accelerated: 37, disruptive: 14 } },
  ],
  clusters: [
    { cluster: "Garments & Textiles",  demand2030: { baseline: 102, accelerated: 108, disruptive:  82 }, gap2030: { baseline:  1800, accelerated:  3200, disruptive: -1100 }, notes: "Automation in cutting/finishing reshapes entry roles." },
    { cluster: "Digital & ICT",        demand2030: { baseline: 132, accelerated: 156, disruptive: 138 }, gap2030: { baseline: -3400, accelerated: -1200, disruptive: -5800 }, notes: "BPO + freelancer pipeline; English barrier persists." },
    { cluster: "Care & Health",        demand2030: { baseline: 122, accelerated: 138, disruptive: 124 }, gap2030: { baseline: -2200, accelerated:  -400, disruptive: -3600 }, notes: "Aging workforce in hospitals; rural gap acute." },
    { cluster: "Logistics & Ports",    demand2030: { baseline: 114, accelerated: 126, disruptive:  94 }, gap2030: { baseline:  -900, accelerated:   400, disruptive: -2800 }, notes: "Chittagong corridor drives demand; automation risk high." },
    { cluster: "Green & Climate",      demand2030: { baseline: 128, accelerated: 152, disruptive: 142 }, gap2030: { baseline: -3100, accelerated: -1100, disruptive: -4900 }, notes: "Flood adaptation roles surge under disruption." },
    { cluster: "Construction",         demand2030: { baseline: 110, accelerated: 122, disruptive:  98 }, gap2030: { baseline:  -600, accelerated:   800, disruptive: -2100 }, notes: "Urban densification sustains demand baseline." },
    { cluster: "Agriculture",          demand2030: { baseline: 102, accelerated: 116, disruptive:  84 }, gap2030: { baseline:  2400, accelerated:  3800, disruptive:   200 }, notes: "Salinity displaces coastal farms; retraining gap." },
    { cluster: "Creative & Media",     demand2030: { baseline: 108, accelerated: 118, disruptive:  96 }, gap2030: { baseline:   100, accelerated:   900, disruptive: -1400 }, notes: "Mobile-first content; gen-AI compresses junior tier." },
  ],
  milestones: [
    { year: 2026, label: "RMG automation wave", detail: "First major factory rollouts displace cutting roles.", scenario: "disruptive" },
    { year: 2027, label: "Digital corridor launch", detail: "National BPO + freelancer platform reaches scale.", scenario: "accelerated" },
    { year: 2028, label: "Climate displacement peak", detail: "Coastal districts see 18% workforce migration.", scenario: "disruptive" },
    { year: 2030, label: "Care sector formalisation", detail: "Public health hires close 60% of baseline gap.", scenario: "accelerated" },
  ],
};

const KENYA: ProjectionsDataset = {
  country: "Kenya",
  contextLine: "Kenya · 5-year forward simulation · 2025–2030",
  startYear: 2025,
  endYear: 2030,
  totals: {
    cohort2030: { baseline: 218, accelerated: 294, disruptive: 188 },
    placement2030: { baseline: 96, accelerated: 162, disruptive: 64 },
    avgDemandIndex2030: { baseline: 118, accelerated: 136, disruptive: 98 },
    confidenceBand: 6,
  },
  supplyCurve: [
    { year: 2025, baseline:  52, accelerated:  52, disruptive:  52 },
    { year: 2026, baseline:  86, accelerated:  96, disruptive:  79 },
    { year: 2027, baseline: 122, accelerated: 144, disruptive: 109 },
    { year: 2028, baseline: 156, accelerated: 196, disruptive: 138 },
    { year: 2029, baseline: 188, accelerated: 246, disruptive: 164 },
    { year: 2030, baseline: 218, accelerated: 294, disruptive: 188 },
  ],
  demandIndex: [
    { year: 2025, baseline: 100, accelerated: 100, disruptive: 100 },
    { year: 2026, baseline: 104, accelerated: 108, disruptive: 100 },
    { year: 2027, baseline: 108, accelerated: 116, disruptive:  99 },
    { year: 2028, baseline: 112, accelerated: 123, disruptive:  98 },
    { year: 2029, baseline: 115, accelerated: 130, disruptive:  98 },
    { year: 2030, baseline: 118, accelerated: 136, disruptive:  98 },
  ],
  attainment: [
    { year: 2025, none: { baseline: 14, accelerated: 14, disruptive: 14 }, secondary: { baseline: 52, accelerated: 52, disruptive: 52 }, tertiary: { baseline: 34, accelerated: 34, disruptive: 34 } },
    { year: 2027, none: { baseline: 12, accelerated:  9, disruptive: 16 }, secondary: { baseline: 53, accelerated: 51, disruptive: 54 }, tertiary: { baseline: 35, accelerated: 40, disruptive: 30 } },
    { year: 2030, none: { baseline:  9, accelerated:  5, disruptive: 18 }, secondary: { baseline: 53, accelerated: 47, disruptive: 54 }, tertiary: { baseline: 38, accelerated: 48, disruptive: 28 } },
  ],
  clusters: [
    { cluster: "Digital & ICT",        demand2030: { baseline: 138, accelerated: 162, disruptive: 142 }, gap2030: { baseline: -2100, accelerated:  -300, disruptive: -3600 }, notes: "Silicon Savannah momentum; tertiary feeder strong." },
    { cluster: "Agri-tech",            demand2030: { baseline: 116, accelerated: 134, disruptive:  98 }, gap2030: { baseline:  -800, accelerated:   600, disruptive: -2200 }, notes: "Drought + climate-smart practices reshape demand." },
    { cluster: "Care & Health",        demand2030: { baseline: 120, accelerated: 134, disruptive: 122 }, gap2030: { baseline: -1400, accelerated:  -200, disruptive: -2400 }, notes: "Devolved county health systems drive recruitment." },
    { cluster: "Green & Climate",      demand2030: { baseline: 130, accelerated: 152, disruptive: 144 }, gap2030: { baseline: -2600, accelerated:  -800, disruptive: -4100 }, notes: "Geothermal + solar; coastal adaptation roles." },
    { cluster: "Tourism & Hospitality",demand2030: { baseline: 114, accelerated: 126, disruptive:  86 }, gap2030: { baseline:  -500, accelerated:   400, disruptive: -2300 }, notes: "Wildlife tourism resilient; aviation shock-sensitive." },
    { cluster: "Creative & Media",     demand2030: { baseline: 110, accelerated: 122, disruptive: 102 }, gap2030: { baseline:   300, accelerated:  1100, disruptive:  -800 }, notes: "Nairobi creative cluster; pan-African distribution." },
    { cluster: "Logistics",            demand2030: { baseline: 112, accelerated: 124, disruptive:  92 }, gap2030: { baseline:  -700, accelerated:   200, disruptive: -2000 }, notes: "Mombasa corridor; Nairobi inland depot expansion." },
    { cluster: "Manufacturing",        demand2030: { baseline: 108, accelerated: 120, disruptive:  90 }, gap2030: { baseline:   100, accelerated:   900, disruptive: -1500 }, notes: "BIG 4 agenda continuity dependent." },
  ],
  milestones: [
    { year: 2026, label: "Hustler Fund cohort matures", detail: "First wave of micro-entrepreneurs report 24-month outcomes.", scenario: "all" },
    { year: 2027, label: "ICT export milestone", detail: "Digital services exports cross USD 1B threshold.", scenario: "accelerated" },
    { year: 2028, label: "Drought stress peak", detail: "Northern counties see agricultural workforce contract 22%.", scenario: "disruptive" },
    { year: 2030, label: "Green jobs majority", detail: "Climate-aligned roles surpass 30% of new openings.", scenario: "accelerated" },
  ],
};

const FIXTURES: Record<string, ProjectionsDataset> = {
  Ghana: GHANA,
  Bangladesh: BANGLADESH,
  Kenya: KENYA,
};

export function getProjectionsDataset(country: string): ProjectionsDataset {
  return FIXTURES[country] ?? GHANA;
}
