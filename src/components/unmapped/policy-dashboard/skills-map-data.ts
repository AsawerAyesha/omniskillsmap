/* Skills Map data layer — derived from the cohort dataset but enriched with
 * supply/demand ratios, region splits and ISCO sub-major group context.
 * Deterministic per-country so the context switcher tells a coherent story. */

import {
  getCountryDataset,
  type HeatmapRow,
} from "./dashboard-data";

export type SkillTier = "critical" | "growing" | "stable" | "declining";

export interface SkillCluster {
  cluster: string;
  iscoMajor: string; // e.g. "ISCO 7 — Craft & related trades"
  supply: number;   // profiles available in cohort
  demand: number;   // labour-market demand index 0-100
  weeklyDelta: number; // new profiles last 7 days
  tier: SkillTier;
  topOccupations: string[];
  topRegions: string[];
  cells: HeatmapRow["cells"];
}

export interface SkillsMapDataset {
  country: string;
  contextLine: string;
  totals: {
    profiles: number;
    clusters: number;
    occupations: number;
    regions: number;
  };
  regions: string[];
  clusters: SkillCluster[];
}

/* ---------- Per-country narrative metadata. The cohort data (heatmap +
 * raw profiles) lives in dashboard-data; here we add the “market lens”. */

interface ClusterMeta {
  iscoMajor: string;
  demand: number;
  tier: SkillTier;
  topOccupations: string[];
}

const CLUSTER_META: Record<string, Record<string, ClusterMeta>> = {
  Ghana: {
    "Electronics & repair":   { iscoMajor: "ISCO 7 — Craft & trades",       demand: 86, tier: "critical",  topOccupations: ["Electronics installer", "Phone repair tech", "Solar PV technician"] },
    "Garment & textile":      { iscoMajor: "ISCO 7 — Craft & trades",       demand: 71, tier: "stable",    topOccupations: ["Tailor / dressmaker", "Pattern cutter", "Garment finisher"] },
    "Construction trades":    { iscoMajor: "ISCO 7 — Craft & trades",       demand: 78, tier: "growing",   topOccupations: ["Carpenter", "Mason / bricklayer", "Plumber"] },
    "Hospitality & food":     { iscoMajor: "ISCO 5 — Services & sales",     demand: 54, tier: "stable",    topOccupations: ["Cook (informal)", "Waiter", "Hotel housekeeper"] },
    "Digital & ICT support":  { iscoMajor: "ISCO 3 — Technicians & assoc.", demand: 88, tier: "critical",  topOccupations: ["IT user-support", "Digital sales agent", "Data assistant"] },
    "Health & care":          { iscoMajor: "ISCO 5 — Services & sales",     demand: 64, tier: "growing",   topOccupations: ["Community health aide", "Childcare worker", "Elderly care"] },
  },
  Bangladesh: {
    "Garment & textile":      { iscoMajor: "ISCO 8 — Plant & machine ops",  demand: 91, tier: "critical",  topOccupations: ["Industrial sewing operator", "Garment finisher", "Quality controller"] },
    "Construction trades":    { iscoMajor: "ISCO 7 — Craft & trades",       demand: 80, tier: "growing",   topOccupations: ["Carpenter", "Mason", "Steel fixer"] },
    "Digital & ICT support":  { iscoMajor: "ISCO 3 — Technicians & assoc.", demand: 84, tier: "critical",  topOccupations: ["Helpdesk technician", "Web/mobile QA", "Data entry supervisor"] },
    "Electronics & repair":   { iscoMajor: "ISCO 7 — Craft & trades",       demand: 76, tier: "growing",   topOccupations: ["Mobile diagnostics", "Solar installer", "Appliance repair"] },
    "Hospitality & food":     { iscoMajor: "ISCO 5 — Services & sales",     demand: 48, tier: "stable",    topOccupations: ["Cook (informal)", "Restaurant server", "Tea-stall operator"] },
    "Health & care":          { iscoMajor: "ISCO 5 — Services & sales",     demand: 66, tier: "growing",   topOccupations: ["Community health worker", "Maternal-care aide", "Pharmacy assistant"] },
  },
  Kenya: {
    "Digital & ICT support":  { iscoMajor: "ISCO 3 — Technicians & assoc.", demand: 89, tier: "critical",  topOccupations: ["IT user-support", "Mobile-money agent", "Junior developer"] },
    "Agri-processing":        { iscoMajor: "ISCO 8 — Plant & machine ops",  demand: 72, tier: "growing",   topOccupations: ["Tea-factory operator", "Dairy processor", "Cold-chain handler"] },
    "Hospitality & food":     { iscoMajor: "ISCO 5 — Services & sales",     demand: 58, tier: "stable",    topOccupations: ["Cook (informal)", "Hotel housekeeper", "Tour guide"] },
    "Electronics & repair":   { iscoMajor: "ISCO 7 — Craft & trades",       demand: 74, tier: "growing",   topOccupations: ["Phone repair", "Solar installer", "TV/AV technician"] },
    "Construction trades":    { iscoMajor: "ISCO 7 — Craft & trades",       demand: 70, tier: "stable",    topOccupations: ["Mason", "Carpenter", "Welder"] },
    "Health & care":          { iscoMajor: "ISCO 5 — Services & sales",     demand: 67, tier: "growing",   topOccupations: ["Community health worker", "Childcare worker", "Pharmacy aide"] },
  },
};

const REGIONS: Record<string, string[]> = {
  Ghana:      ["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Northern"],
  Bangladesh: ["Dhaka", "Chattogram", "Khulna", "Sylhet", "Rajshahi"],
  Kenya:      ["Nairobi", "Mombasa", "Rift Valley", "Coast", "Western"],
  Peru:       ["Lima", "Arequipa", "Cusco", "La Libertad", "Piura"],
  Vietnam:    ["Ho Chi Minh", "Hanoi", "Da Nang", "Can Tho", "Hai Phong"],
};

/* Region weights — first regions get a bigger share so the bars feel
 * realistic (urban concentration). Generated deterministically from index. */
function weightsFor(country: string, cluster: string): Record<string, number> {
  const regions = REGIONS[country] ?? REGIONS.Ghana;
  const seed =
    cluster.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    Math.max(1, regions.length);
  const out: Record<string, number> = {};
  let remaining = 100;
  regions.forEach((r, i) => {
    const idx = (i + seed) % regions.length;
    const base = [38, 24, 16, 10, 7, 5][idx] ?? 4;
    out[r] = base;
    remaining -= base;
  });
  // normalise to ~100
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(out)) out[k] = Math.round((out[k] / total) * 100);
  return out;
}

function tierFromCluster(meta: ClusterMeta | undefined): SkillTier {
  return meta?.tier ?? "stable";
}

export function getSkillsMapDataset(country: string): SkillsMapDataset {
  const cohort = getCountryDataset(country);
  const metaTable =
    CLUSTER_META[country] ??
    CLUSTER_META.Ghana; /* Peru/Vietnam fall back to Ghana lens */
  const regions = REGIONS[country] ?? REGIONS.Ghana;

  const supplyByCluster: Record<string, number> = {};
  for (const c of cohort.cohort.skillClusters) supplyByCluster[c.name] = c.profiles;

  const clusters: SkillCluster[] = cohort.heatmap.map((row, i) => {
    const meta = metaTable[row.cluster];
    const supply =
      supplyByCluster[row.cluster] ??
      row.cells.reduce((a, b) => a + b, 0);
    const w = weightsFor(country, row.cluster);
    const top3 = Object.entries(w)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([r, p]) => `${r} · ${p}%`);
    return {
      cluster: row.cluster,
      iscoMajor: meta?.iscoMajor ?? "ISCO 9 — Elementary occupations",
      supply,
      demand: meta?.demand ?? 50 + (i * 7) % 30,
      weeklyDelta: Math.max(2, Math.round(supply * 0.04)),
      tier: tierFromCluster(meta),
      topOccupations:
        meta?.topOccupations ?? ["Occupation A", "Occupation B", "Occupation C"],
      topRegions: top3,
      cells: row.cells,
    };
  });

  const occupationCount = clusters.reduce(
    (a, c) => a + c.topOccupations.length,
    0,
  );

  return {
    country,
    contextLine: cohort.contextLine,
    totals: {
      profiles: cohort.cohort.activeProfiles,
      clusters: clusters.length,
      occupations: occupationCount,
      regions: regions.length,
    },
    regions,
    clusters,
  };
}

export const TIER_META: Record<
  SkillTier,
  { label: string; color: string; ring: string }
> = {
  critical:  { label: "Critical demand", color: "#E07A5F", ring: "rgba(224,122,95,0.35)" },
  growing:   { label: "Growing",         color: "#C4A882", ring: "rgba(196,168,130,0.35)" },
  stable:    { label: "Stable",          color: "#7C9EB2", ring: "rgba(124,158,178,0.35)" },
  declining: { label: "Declining",       color: "#6E6A62", ring: "rgba(110,106,98,0.35)" },
};