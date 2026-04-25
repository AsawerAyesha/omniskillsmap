/* Automation Risk dataset — extends the small dashboard list into a full
 * occupational risk register with task decomposition, exposed worker
 * counts and adjacent low-risk pivots. Country-aware. */

import { getCountryDataset } from "./dashboard-data";

export type RiskBand = "low" | "moderate" | "elevated" | "high";

export interface TaskMix {
  routineCognitive: number;   // % of job content
  routineManual: number;
  nonRoutineCognitive: number;
  interpersonal: number;
}

export interface RiskOccupation {
  isco: string;            // e.g. "ISCO 4132"
  title: string;           // e.g. "Data entry clerks"
  cluster: string;
  risk: number;            // 0–100
  band: RiskBand;
  exposedWorkers: number;  // in cohort
  trend5y: number;         // -10 .. +10 percentage-point change in 5y
  tasks: TaskMix;
  pivots: string[];        // 2-3 adjacent low-risk occupations
  rationale: string;
}

export interface RiskDataset {
  country: string;
  contextLine: string;
  totals: {
    exposedWorkers: number;
    avgRisk: number;
    highRiskCount: number;       // occupations classified high
    pathwaysAvailable: number;   // total pivot opportunities
  };
  bandSummary: Record<RiskBand, { count: number; workers: number }>;
  occupations: RiskOccupation[];
}

export const BAND_META: Record<
  RiskBand,
  { label: string; color: string; ring: string; range: string }
> = {
  low:      { label: "Low",      color: "#7FB58A", ring: "rgba(127,181,138,0.35)", range: "0–24%"  },
  moderate: { label: "Moderate", color: "#7C9EB2", ring: "rgba(124,158,178,0.35)", range: "25–49%" },
  elevated: { label: "Elevated", color: "#C4A882", ring: "rgba(196,168,130,0.35)", range: "50–69%" },
  high:     { label: "High",     color: "#E07A5F", ring: "rgba(224,122,95,0.35)",  range: "70–100%"},
};

function bandFor(risk: number): RiskBand {
  if (risk >= 70) return "high";
  if (risk >= 50) return "elevated";
  if (risk >= 25) return "moderate";
  return "low";
}

/* Per-country occupation lens. Numbers are illustrative but follow the
 * same direction LMIC studies show: routine clerical and manufacturing
 * are the most exposed; interpersonal & dexterous trades the least. */

interface OccTemplate {
  isco: string;
  title: string;
  cluster: string;
  risk: number;
  exposed: number;
  trend5y: number;
  tasks: TaskMix;
  pivots: string[];
  rationale: string;
}

const TEMPLATES: Record<string, OccTemplate[]> = {
  Ghana: [
    { isco: "ISCO 4132", title: "Data entry clerks",         cluster: "Digital & ICT support", risk: 81, exposed: 142, trend5y: +6, tasks: { routineCognitive: 62, routineManual: 12, nonRoutineCognitive: 16, interpersonal: 10 }, pivots: ["IT user-support", "Payroll clerk", "Records officer"],         rationale: "Form recognition + LLMs absorb most data-capture tasks; payroll & records remain compliance-bound." },
    { isco: "ISCO 8159", title: "Routine manufacturing op.", cluster: "Garment & textile",     risk: 74, exposed: 188, trend5y: +5, tasks: { routineCognitive: 14, routineManual: 64, nonRoutineCognitive: 12, interpersonal: 10 }, pivots: ["Quality controller", "Line supervisor", "Maintenance tech"],     rationale: "Pick-and-place automation eats routine sewing; QC & maintenance stay human-led." },
    { isco: "ISCO 9333", title: "Freight handlers",          cluster: "Construction trades",   risk: 58, exposed: 96,  trend5y: +3, tasks: { routineCognitive: 8,  routineManual: 70, nonRoutineCognitive: 12, interpersonal: 10 }, pivots: ["Warehouse coordinator", "Forklift operator", "Logistics clerk"],   rationale: "Container ports automate gradually in LMICs; coordination roles grow." },
    { isco: "ISCO 5223", title: "Shop sales assistants",     cluster: "Hospitality & food",    risk: 44, exposed: 124, trend5y: +2, tasks: { routineCognitive: 28, routineManual: 18, nonRoutineCognitive: 18, interpersonal: 36 }, pivots: ["Mobile-money agent", "Customer-care rep", "Floor manager"],        rationale: "Self-checkout pressure but face-to-face informal trade still dominates." },
    { isco: "ISCO 7421", title: "Phone repair tech.",        cluster: "Electronics & repair",  risk: 32, exposed: 144, trend5y: +1, tasks: { routineCognitive: 18, routineManual: 30, nonRoutineCognitive: 32, interpersonal: 20 }, pivots: ["Solar PV technician", "IoT installer", "Repair instructor"],       rationale: "Manual dexterity + diagnosis remain hard to automate at LMIC capital costs." },
    { isco: "ISCO 7115", title: "Carpenters",                cluster: "Construction trades",   risk: 24, exposed: 268, trend5y: 0,  tasks: { routineCognitive: 8,  routineManual: 38, nonRoutineCognitive: 32, interpersonal: 22 }, pivots: ["Site supervisor", "Joinery teacher", "Furniture entrepreneur"],    rationale: "On-site adaptability and unique cuts protect carpentry from full automation." },
    { isco: "ISCO 5120", title: "Cooks (informal)",          cluster: "Hospitality & food",    risk: 19, exposed: 184, trend5y: 0,  tasks: { routineCognitive: 6,  routineManual: 28, nonRoutineCognitive: 28, interpersonal: 38 }, pivots: ["Food entrepreneur", "Catering supervisor", "Nutrition aide"],      rationale: "Customer interaction + recipe variability give strong human moat." },
    { isco: "ISCO 3253", title: "Community health worker",   cluster: "Health & care",         risk: 12, exposed: 88,  trend5y: -1, tasks: { routineCognitive: 8,  routineManual: 14, nonRoutineCognitive: 30, interpersonal: 48 }, pivots: ["Maternal-care aide", "Health educator", "Clinic coordinator"],     rationale: "Trust, mobility and language make this one of the safest LMIC jobs." },
  ],
  Bangladesh: [
    { isco: "ISCO 4132", title: "Data entry clerks",         cluster: "Digital & ICT support", risk: 84, exposed: 188, trend5y: +7, tasks: { routineCognitive: 64, routineManual: 10, nonRoutineCognitive: 16, interpersonal: 10 }, pivots: ["Helpdesk technician", "Records officer", "Web QA tester"],          rationale: "Outsourced data-capture pipelines are the first to be replaced by LLMs." },
    { isco: "ISCO 8159", title: "Garment finishers",         cluster: "Garment & textile",     risk: 79, exposed: 612, trend5y: +6, tasks: { routineCognitive: 12, routineManual: 70, nonRoutineCognitive: 10, interpersonal: 8  }, pivots: ["Quality controller", "Line supervisor", "Pattern technician"],     rationale: "Automated cutting & finishing rapidly arriving at scale in Dhaka factories." },
    { isco: "ISCO 9333", title: "Freight handlers",          cluster: "Construction trades",   risk: 56, exposed: 244, trend5y: +3, tasks: { routineCognitive: 8,  routineManual: 70, nonRoutineCognitive: 12, interpersonal: 10 }, pivots: ["Warehouse coordinator", "Cold-chain handler", "Customs clerk"],    rationale: "Chattogram port modernisation will shift roles from lift to coordinate." },
    { isco: "ISCO 5223", title: "Shop sales assistants",     cluster: "Hospitality & food",    risk: 41, exposed: 96,  trend5y: +2, tasks: { routineCognitive: 26, routineManual: 18, nonRoutineCognitive: 20, interpersonal: 36 }, pivots: ["Mobile-money agent", "Logistics clerk", "Customer-care rep"],      rationale: "Bazaar trade slow to automate; org. retail will pressure formal stores." },
    { isco: "ISCO 7421", title: "Mobile diagnostics tech.",  cluster: "Electronics & repair",  risk: 30, exposed: 142, trend5y: 0,  tasks: { routineCognitive: 18, routineManual: 30, nonRoutineCognitive: 34, interpersonal: 18 }, pivots: ["Appliance repair", "Solar installer", "IoT integrator"],          rationale: "Physical diagnosis + tactile work resist automation; demand growing." },
    { isco: "ISCO 3253", title: "Community health worker",   cluster: "Health & care",         risk: 17, exposed: 121, trend5y: -1, tasks: { routineCognitive: 8,  routineManual: 12, nonRoutineCognitive: 30, interpersonal: 50 }, pivots: ["Maternal-care aide", "Pharmacy assistant", "Health educator"],     rationale: "Field outreach is the lowest-automation segment in BGD studies." },
  ],
  Kenya: [
    { isco: "ISCO 4132", title: "Data entry clerks",         cluster: "Digital & ICT support", risk: 78, exposed: 124, trend5y: +6, tasks: { routineCognitive: 62, routineManual: 10, nonRoutineCognitive: 18, interpersonal: 10 }, pivots: ["Junior developer", "QA tester", "Records officer"],                rationale: "BPO data-capture in Nairobi is among the fastest-substituted segments." },
    { isco: "ISCO 8159", title: "Tea-factory operator",      cluster: "Agri-processing",       risk: 68, exposed: 188, trend5y: +4, tasks: { routineCognitive: 12, routineManual: 64, nonRoutineCognitive: 14, interpersonal: 10 }, pivots: ["QC technician", "Cold-chain handler", "Equipment operator"],       rationale: "Tea sorting and weighing are the next obvious automation targets." },
    { isco: "ISCO 5223", title: "Shop sales assistants",     cluster: "Hospitality & food",    risk: 39, exposed: 84,  trend5y: +2, tasks: { routineCognitive: 26, routineManual: 18, nonRoutineCognitive: 22, interpersonal: 34 }, pivots: ["Mobile-money agent", "Floor manager", "Customer-care rep"],       rationale: "M-PESA agent network shows where displaced retail can pivot." },
    { isco: "ISCO 7421", title: "Phone repair tech.",        cluster: "Electronics & repair",  risk: 28, exposed: 142, trend5y: 0,  tasks: { routineCognitive: 18, routineManual: 32, nonRoutineCognitive: 30, interpersonal: 20 }, pivots: ["Solar installer", "Drone repair", "Repair instructor"],            rationale: "Hardware repair benefits from on-the-ground latency advantages." },
    { isco: "ISCO 6111", title: "Crop farm worker",          cluster: "Agri-processing",       risk: 21, exposed: 244, trend5y: -1, tasks: { routineCognitive: 6,  routineManual: 36, nonRoutineCognitive: 30, interpersonal: 28 }, pivots: ["Irrigation technician", "Drone-spray pilot", "Agro-extension"],   rationale: "Smallholder agriculture too fragmented for full mechanisation in 5y." },
    { isco: "ISCO 3253", title: "Community health worker",   cluster: "Health & care",         risk: 16, exposed: 96,  trend5y: -1, tasks: { routineCognitive: 8,  routineManual: 12, nonRoutineCognitive: 30, interpersonal: 50 }, pivots: ["Pharmacy aide", "Maternal-care aide", "Health educator"],         rationale: "CHW model expanding nationally; among the safest job categories." },
  ],
};

export function getRiskDataset(country: string): RiskDataset {
  const cohort = getCountryDataset(country);
  const list = TEMPLATES[country] ?? TEMPLATES.Ghana;

  const occupations: RiskOccupation[] = list.map((t) => ({
    isco: t.isco,
    title: t.title,
    cluster: t.cluster,
    risk: t.risk,
    band: bandFor(t.risk),
    exposedWorkers: t.exposed,
    trend5y: t.trend5y,
    tasks: t.tasks,
    pivots: t.pivots,
    rationale: t.rationale,
  }));

  const exposed = occupations.reduce((a, o) => a + o.exposedWorkers, 0);
  const weighted =
    occupations.reduce((a, o) => a + o.risk * o.exposedWorkers, 0) /
    Math.max(1, exposed);

  const bandSummary: RiskDataset["bandSummary"] = {
    low:      { count: 0, workers: 0 },
    moderate: { count: 0, workers: 0 },
    elevated: { count: 0, workers: 0 },
    high:     { count: 0, workers: 0 },
  };
  for (const o of occupations) {
    bandSummary[o.band].count += 1;
    bandSummary[o.band].workers += o.exposedWorkers;
  }

  return {
    country,
    contextLine: cohort.contextLine,
    totals: {
      exposedWorkers: exposed,
      avgRisk: Math.round(weighted),
      highRiskCount: bandSummary.high.count,
      pathwaysAvailable: occupations.reduce((a, o) => a + o.pivots.length, 0),
    },
    bandSummary,
    occupations: occupations.sort((a, b) => b.risk - a.risk),
  };
}

export const TASK_META: Record<
  keyof TaskMix,
  { label: string; color: string }
> = {
  routineCognitive:    { label: "Routine cognitive", color: "#E07A5F" },
  routineManual:       { label: "Routine manual",    color: "#C4A882" },
  nonRoutineCognitive: { label: "Non-routine cog.",  color: "#7C9EB2" },
  interpersonal:       { label: "Interpersonal",     color: "#7FB58A" },
};