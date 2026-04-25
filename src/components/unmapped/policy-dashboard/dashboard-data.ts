/* Aggregate cohort + labor-market data for the Policymaker Dashboard.
 * In production this would be fetched from the data warehouse. Here we
 * keep deterministic per-country fixtures so the context switcher feels real. */

export interface CohortOverview {
  activeProfiles: number;
  weeklyDelta: number;
  skillClusters: { name: string; profiles: number }[];
  educationDistribution: { label: string; pct: number }[]; // sums to 100
  gender: { female: number; male: number };
}

export interface SignalCard {
  label: string;
  value: string;
  caption: string;
  source: "ILO ILOSTAT" | "World Bank WDI";
  trend: "up-good" | "up-bad" | "down-good" | "neutral";
}

export interface HeatmapRow {
  cluster: string;
  /* 5 cells, each is profile count in that demand quintile */
  cells: [number, number, number, number, number];
}

export interface AutomationRow {
  occupation: string;
  risk: number; // 0-100
}

export interface ProjectionPoint {
  year: number;
  none: number;
  secondary: number;
  tertiary: number;
}

export interface RawProfile {
  id: string;
  occupation: string;
  topSkill: string;
  education: string;
  automationRisk: number;
  region: string;
}

export interface CountryDataset {
  country: string;
  contextLine: string;
  cohort: CohortOverview;
  signals: SignalCard[];
  heatmap: HeatmapRow[];
  automation: AutomationRow[];
  projections: ProjectionPoint[];
  rawProfiles: RawProfile[];
}

export const QUINTILES = [
  "Low",
  "Below avg",
  "Average",
  "Above avg",
  "High",
] as const;

/* ---------------- GHANA (default) ---------------- */
const ghana: CountryDataset = {
  country: "Ghana",
  contextLine: "Ghana · Electronics sector · 2024",
  cohort: {
    activeProfiles: 1247,
    weeklyDelta: 84,
    skillClusters: [
      { name: "Electronics & repair", profiles: 412 },
      { name: "Garment & textile", profiles: 311 },
      { name: "Construction trades", profiles: 268 },
      { name: "Hospitality & food", profiles: 184 },
      { name: "Digital & ICT support", profiles: 142 },
    ],
    educationDistribution: [
      { label: "None", pct: 6 },
      { label: "Primary", pct: 18 },
      { label: "JHS", pct: 31 },
      { label: "SHS / TVET", pct: 34 },
      { label: "Tertiary", pct: 11 },
    ],
    gender: { female: 58, male: 42 },
  },
  signals: [
    {
      label: "Sector employment growth",
      value: "↑ 12.4%",
      caption: "Electronics & repair, 2023–24",
      source: "ILO ILOSTAT",
      trend: "up-good",
    },
    {
      label: "Youth unemployment rate",
      value: "14.2%",
      caption: "Ages 15–24, Ghana national",
      source: "ILO ILOSTAT",
      trend: "up-bad",
    },
    {
      label: "Returns to vocational training",
      value: "+31%",
      caption: "Wage premium vs. secondary cert only",
      source: "World Bank WDI",
      trend: "up-good",
    },
    {
      label: "Informal employment share",
      value: "82.7%",
      caption: "Non-agricultural, Ghana",
      source: "ILO ILOSTAT",
      trend: "neutral",
    },
  ],
  heatmap: [
    { cluster: "Electronics & repair", cells: [12, 28, 64, 142, 166] },
    { cluster: "Garment & textile",     cells: [22, 51, 88, 96, 54] },
    { cluster: "Construction trades",   cells: [18, 41, 72, 88, 49] },
    { cluster: "Hospitality & food",    cells: [34, 47, 51, 32, 20] },
    { cluster: "Digital & ICT support", cells: [9, 21, 38, 41, 33] },
    { cluster: "Health & care",         cells: [16, 27, 35, 26, 14] },
  ],
  automation: [
    { occupation: "Data entry clerks",      risk: 81 },
    { occupation: "Routine manufacturing",  risk: 74 },
    { occupation: "Market trading",         risk: 44 },
    { occupation: "Phone repair",           risk: 32 },
    { occupation: "Health workers",         risk: 19 },
  ],
  projections: [
    { year: 2025, none: 8,  secondary: 41, tertiary: 12 },
    { year: 2027, none: 7,  secondary: 44, tertiary: 14 },
    { year: 2029, none: 6,  secondary: 47, tertiary: 16 },
    { year: 2031, none: 5,  secondary: 50, tertiary: 18 },
    { year: 2033, none: 4,  secondary: 52, tertiary: 21 },
    { year: 2035, none: 3,  secondary: 54, tertiary: 24 },
  ],
  rawProfiles: [
    { id: "GHA-2026-08441", occupation: "ISCO 7421 — Electronics installer", topSkill: "Soldering", education: "JHS", automationRisk: 32, region: "Greater Accra" },
    { id: "GHA-2026-08442", occupation: "ISCO 7531 — Tailor / dressmaker",   topSkill: "Pattern cutting", education: "Primary", automationRisk: 22, region: "Ashanti" },
    { id: "GHA-2026-08443", occupation: "ISCO 7115 — Carpenter",             topSkill: "Joinery", education: "JHS", automationRisk: 18, region: "Western" },
    { id: "GHA-2026-08444", occupation: "ISCO 5120 — Cook (informal)",       topSkill: "Banku & jollof", education: "None", automationRisk: 12, region: "Greater Accra" },
    { id: "GHA-2026-08445", occupation: "ISCO 3512 — IT user-support",       topSkill: "Network triage", education: "SHS", automationRisk: 47, region: "Central" },
    { id: "GHA-2026-08446", occupation: "ISCO 7233 — Machinery mechanic",    topSkill: "Diesel engine", education: "TVET", automationRisk: 36, region: "Eastern" },
    { id: "GHA-2026-08447", occupation: "ISCO 9333 — Freight handler",       topSkill: "Manual loading", education: "Primary", automationRisk: 58, region: "Greater Accra" },
    { id: "GHA-2026-08448", occupation: "ISCO 5223 — Shop sales assistant",  topSkill: "Customer care", education: "JHS", automationRisk: 41, region: "Ashanti" },
  ],
};

/* ---------------- BANGLADESH ---------------- */
const bangladesh: CountryDataset = {
  country: "Bangladesh",
  contextLine: "Bangladesh · Garment & ICT sectors · 2024",
  cohort: {
    activeProfiles: 3104,
    weeklyDelta: 211,
    skillClusters: [
      { name: "Garment & textile", profiles: 1248 },
      { name: "Construction trades", profiles: 612 },
      { name: "Digital & ICT support", profiles: 488 },
      { name: "Electronics & repair", profiles: 421 },
      { name: "Hospitality & food", profiles: 188 },
    ],
    educationDistribution: [
      { label: "None", pct: 4 },
      { label: "Primary", pct: 22 },
      { label: "Lower-sec", pct: 36 },
      { label: "Upper-sec / TVET", pct: 28 },
      { label: "Tertiary", pct: 10 },
    ],
    gender: { female: 64, male: 36 },
  },
  signals: [
    { label: "Sector employment growth",        value: "↑ 8.1%",  caption: "Ready-made garments, 2023–24", source: "ILO ILOSTAT",   trend: "up-good" },
    { label: "Youth unemployment rate",         value: "10.6%",   caption: "Ages 15–24, BGD national",      source: "ILO ILOSTAT",   trend: "up-bad"  },
    { label: "Returns to vocational training",  value: "+24%",    caption: "Wage premium vs. secondary",    source: "World Bank WDI",trend: "up-good" },
    { label: "Informal employment share",       value: "84.9%",   caption: "Non-agricultural, BGD",         source: "ILO ILOSTAT",   trend: "neutral" },
  ],
  heatmap: [
    { cluster: "Garment & textile",     cells: [18, 92, 188, 412, 538] },
    { cluster: "Construction trades",   cells: [28, 64, 112, 184, 224] },
    { cluster: "Digital & ICT support", cells: [22, 64, 121, 147, 134] },
    { cluster: "Electronics & repair",  cells: [14, 38, 72, 142, 155] },
    { cluster: "Hospitality & food",    cells: [26, 41, 52, 41, 28] },
    { cluster: "Health & care",         cells: [18, 34, 51, 44, 21] },
  ],
  automation: [
    { occupation: "Data entry clerks",      risk: 84 },
    { occupation: "Routine manufacturing",  risk: 79 },
    { occupation: "Market trading",         risk: 41 },
    { occupation: "Phone repair",           risk: 30 },
    { occupation: "Health workers",         risk: 17 },
  ],
  projections: [
    { year: 2025, none: 6,  secondary: 38, tertiary: 11 },
    { year: 2027, none: 5,  secondary: 42, tertiary: 13 },
    { year: 2029, none: 4,  secondary: 46, tertiary: 16 },
    { year: 2031, none: 3,  secondary: 49, tertiary: 19 },
    { year: 2033, none: 3,  secondary: 51, tertiary: 22 },
    { year: 2035, none: 2,  secondary: 53, tertiary: 26 },
  ],
  rawProfiles: [
    { id: "BGD-2026-12001", occupation: "ISCO 7531 — Tailor / dressmaker", topSkill: "Industrial sewing", education: "Lower-sec", automationRisk: 38, region: "Dhaka" },
    { id: "BGD-2026-12002", occupation: "ISCO 8159 — Garment finisher",    topSkill: "Quality control", education: "Primary", automationRisk: 62, region: "Chattogram" },
    { id: "BGD-2026-12003", occupation: "ISCO 3512 — IT user-support",     topSkill: "Helpdesk triage", education: "Tertiary", automationRisk: 41, region: "Dhaka" },
    { id: "BGD-2026-12004", occupation: "ISCO 7115 — Carpenter",           topSkill: "Wood framing", education: "Primary", automationRisk: 19, region: "Khulna" },
    { id: "BGD-2026-12005", occupation: "ISCO 7421 — Electronics installer", topSkill: "Mobile diagnostics", education: "TVET", automationRisk: 30, region: "Sylhet" },
    { id: "BGD-2026-12006", occupation: "ISCO 9333 — Freight handler",     topSkill: "Container loading", education: "None", automationRisk: 56, region: "Chattogram" },
  ],
};

/* ---------------- KENYA ---------------- */
const kenya: CountryDataset = {
  country: "Kenya",
  contextLine: "Kenya · ICT & agri-services · 2024",
  cohort: {
    activeProfiles: 982,
    weeklyDelta: 56,
    skillClusters: [
      { name: "Digital & ICT support", profiles: 318 },
      { name: "Agri-processing", profiles: 244 },
      { name: "Hospitality & food", profiles: 161 },
      { name: "Electronics & repair", profiles: 142 },
      { name: "Construction trades", profiles: 117 },
    ],
    educationDistribution: [
      { label: "None", pct: 3 },
      { label: "Primary", pct: 14 },
      { label: "Lower-sec", pct: 24 },
      { label: "Upper-sec / TVET", pct: 41 },
      { label: "Tertiary", pct: 18 },
    ],
    gender: { female: 52, male: 48 },
  },
  signals: [
    { label: "Sector employment growth",        value: "↑ 9.6%",  caption: "ICT & business services, 2023–24", source: "ILO ILOSTAT",   trend: "up-good" },
    { label: "Youth unemployment rate",         value: "13.4%",   caption: "Ages 15–24, KEN national",          source: "ILO ILOSTAT",   trend: "up-bad"  },
    { label: "Returns to vocational training",  value: "+27%",    caption: "Wage premium vs. secondary",        source: "World Bank WDI",trend: "up-good" },
    { label: "Informal employment share",       value: "78.1%",   caption: "Non-agricultural, KEN",             source: "ILO ILOSTAT",   trend: "neutral" },
  ],
  heatmap: [
    { cluster: "Digital & ICT support", cells: [12, 31, 62, 98, 115] },
    { cluster: "Agri-processing",       cells: [22, 38, 64, 71, 49] },
    { cluster: "Hospitality & food",    cells: [24, 38, 44, 36, 19] },
    { cluster: "Electronics & repair",  cells: [10, 22, 41, 38, 31] },
    { cluster: "Construction trades",   cells: [14, 26, 32, 27, 18] },
    { cluster: "Health & care",         cells: [11, 18, 24, 22, 12] },
  ],
  automation: [
    { occupation: "Data entry clerks",      risk: 78 },
    { occupation: "Routine manufacturing",  risk: 68 },
    { occupation: "Market trading",         risk: 39 },
    { occupation: "Phone repair",           risk: 28 },
    { occupation: "Health workers",         risk: 16 },
  ],
  projections: [
    { year: 2025, none: 4,  secondary: 46, tertiary: 18 },
    { year: 2027, none: 3,  secondary: 48, tertiary: 21 },
    { year: 2029, none: 3,  secondary: 50, tertiary: 24 },
    { year: 2031, none: 2,  secondary: 51, tertiary: 27 },
    { year: 2033, none: 2,  secondary: 52, tertiary: 30 },
    { year: 2035, none: 1,  secondary: 53, tertiary: 33 },
  ],
  rawProfiles: [
    { id: "KEN-2026-04101", occupation: "ISCO 3512 — IT user-support", topSkill: "Network triage", education: "Tertiary", automationRisk: 38, region: "Nairobi" },
    { id: "KEN-2026-04102", occupation: "ISCO 6111 — Crop farm worker", topSkill: "Irrigation", education: "Primary", automationRisk: 21, region: "Rift Valley" },
    { id: "KEN-2026-04103", occupation: "ISCO 5223 — Shop sales asst.", topSkill: "Mobile money", education: "Upper-sec", automationRisk: 44, region: "Nairobi" },
    { id: "KEN-2026-04104", occupation: "ISCO 7421 — Electronics installer", topSkill: "Phone repair", education: "TVET", automationRisk: 28, region: "Mombasa" },
    { id: "KEN-2026-04105", occupation: "ISCO 5120 — Cook (informal)",   topSkill: "Hotel kitchen", education: "Lower-sec", automationRisk: 14, region: "Coast" },
  ],
};

const peru: CountryDataset = {
  ...kenya,
  country: "Peru",
  contextLine: "Peru · Mining services & agro-export · 2024",
  cohort: { ...kenya.cohort, activeProfiles: 766, weeklyDelta: 41, gender: { female: 47, male: 53 } },
};

const vietnam: CountryDataset = {
  ...bangladesh,
  country: "Vietnam",
  contextLine: "Vietnam · Electronics manufacturing · 2024",
  cohort: { ...bangladesh.cohort, activeProfiles: 2188, weeklyDelta: 142, gender: { female: 55, male: 45 } },
};

const DATA: Record<string, CountryDataset> = {
  Ghana: ghana,
  Bangladesh: bangladesh,
  Kenya: kenya,
  Peru: peru,
  Vietnam: vietnam,
};

export function getCountryDataset(country: string): CountryDataset {
  return DATA[country] ?? ghana;
}