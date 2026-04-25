/* Opportunity matches for Amara — Module 03 youth view.
 * In production this would come from a matching service combining her
 * skill profile (ESCO) with regional vacancy + ILO/World Bank signals. */

export type OpportunityCategory =
  | "employment"
  | "self-employment"
  | "gig"
  | "training";

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  categoryLabel: string;
  title: string;
  org: string;
  location: string;
  description: string;
  matchScore: number; // 0–100
  wage: string;
  growth: string;
  duration: string;
  skillsHave: number;
  skillsTotal: number;
  skillsToAcquire: string[];
  trainingAvailable: boolean;
}

export interface SectorSignal {
  value: string;
  label: string;
  source: string;
}

export const opportunities: Opportunity[] = [
  {
    id: "op-001",
    category: "training",
    categoryLabel: "Apprenticeship",
    title: "Mobile Device Technician Apprenticeship",
    org: "Ghana TVET Authority",
    location: "Accra Central",
    description:
      "Structured 6-month programme covering board-level repair, diagnostics and customer handover. Stipend included; led by accredited master technicians at the Kokomlemle workshop.",
    matchScore: 87,
    wage: "GHS 1,100–1,400/mo",
    growth: "+14% growth",
    duration: "6 months",
    skillsHave: 6,
    skillsTotal: 8,
    skillsToAcquire: ["Basic circuit diagnostics", "Safety certification"],
    trainingAvailable: true,
  },
  {
    id: "op-002",
    category: "employment",
    categoryLabel: "Employment",
    title: "Service Bench Technician — Samsung Care",
    org: "Franko Trading Enterprise",
    location: "Osu, Accra",
    description:
      "In-warranty repair role on a structured bench, focused on display and battery service for current Galaxy line. Manufacturer training in first 60 days.",
    matchScore: 81,
    wage: "GHS 1,650–2,100/mo",
    growth: "+9% growth",
    duration: "Hire in 4 weeks",
    skillsHave: 7,
    skillsTotal: 9,
    skillsToAcquire: ["Samsung One UI diagnostics", "Soldering re-certification"],
    trainingAvailable: true,
  },
  {
    id: "op-003",
    category: "self-employment",
    categoryLabel: "Self-employment",
    title: "Workshop Owner — Community Repair Hub",
    org: "MEST Africa · YEA micro-grant",
    location: "Madina, Accra",
    description:
      "Seed grant + tooling kit to formalise a small repair shop with up to two helpers. Includes 8 weeks of bookkeeping and pricing coaching.",
    matchScore: 76,
    wage: "GHS 1,800–3,200/mo",
    growth: "+18% sector",
    duration: "12 weeks setup",
    skillsHave: 5,
    skillsTotal: 9,
    skillsToAcquire: [
      "Basic bookkeeping",
      "Customer pricing",
      "Inventory management",
      "Tax registration (GRA)",
    ],
    trainingAvailable: true,
  },
  {
    id: "op-004",
    category: "gig",
    categoryLabel: "Gig work",
    title: "On-demand Repair Partner",
    org: "FixIt Ghana platform",
    location: "Greater Accra",
    description:
      "Take phone & laptop repair jobs through the FixIt mobile app. Variable hours; payouts every 7 days. Reputation score determines lead priority.",
    matchScore: 72,
    wage: "GHS 800–1,900/mo",
    growth: "+22% platform",
    duration: "Start in 1 week",
    skillsHave: 6,
    skillsTotal: 7,
    skillsToAcquire: ["Customer service basics"],
    trainingAvailable: false,
  },
  {
    id: "op-005",
    category: "training",
    categoryLabel: "Short course",
    title: "Certificate in Electronics Safety & Soldering",
    org: "Accra Technical University",
    location: "Online + 2 lab weekends",
    description:
      "Recognised credential addressing the two most common gaps in your profile. Free for under-25 youth in Greater Accra under the YEA-ATU pathway.",
    matchScore: 68,
    wage: "Free programme",
    growth: "Credential",
    duration: "8 weeks",
    skillsHave: 4,
    skillsTotal: 5,
    skillsToAcquire: ["Safety certification"],
    trainingAvailable: true,
  },
];

export const sectorSignals: SectorSignal[] = [
  {
    value: "↑ 12.4%",
    label: "Sector job growth (2023–24)",
    source: "ILO ILOSTAT",
  },
  {
    value: "GHS 1,240",
    label: "Avg. entry wage / month",
    source: "World Bank WDI",
  },
];

export const FILTERS: { value: OpportunityCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "employment", label: "Employment" },
  { value: "self-employment", label: "Self-employment" },
  { value: "gig", label: "Gig work" },
  { value: "training", label: "Training" },
];