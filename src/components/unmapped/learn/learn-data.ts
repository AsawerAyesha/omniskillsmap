/* Sample learning content tied to Amara's profile.
   In a real app these modules are matched from the user's
   highest-confidence ISCO occupation + the gap analysis from
   /opportunities. For now we hardcode a Ghana / Electronics
   pathway that connects to the rest of the Youth surfaces. */

export interface Lesson {
  title: string;
  minutes: number;
  done: boolean;
}

export interface PathwayModule {
  id: string;
  step: number;
  title: string;
  blurb: string;
  cluster: string;          // matches a SkillCluster.name on the profile
  iscoLink: string;         // e.g. "ISCO 7421"
  totalMinutes: number;
  level: "Foundation" | "Intermediate" | "Advanced";
  progress: number;         // 0–100
  credential: string;       // micro-credential name
  offlineKb: number;        // download size for low-bandwidth
  lessons: Lesson[];
  unlocks: string;          // what this module unlocks downstream
}

export interface BiteSize {
  id: string;
  title: string;
  minutes: number;
  emoji: string;
  tag: string;
}

export interface SkillGap {
  skill: string;
  reason: string;            // why it matters (drawn from market signal)
  delta: number;             // 0-100, how far you are from "ready"
  jobUnlock: string;         // opportunity title that unlocks at 100
}

export const learnData = {
  learnerFirstName: "Amara",
  weeklyMinutes: 84,
  weeklyTarget: 120,
  streakDays: 5,
  modulesCompleted: 2,
  totalCredentials: 1,
  pathwayTitle: "Pathway to Electronics & Telecom Installer",
  pathwayCaption:
    "Built from your closest occupation match (ISCO 7421) and a 12.4% sector growth signal.",
  modules: [
    {
      id: "m1",
      step: 1,
      title: "Fabrication Fundamentals",
      blurb:
        "Reading a circuit, soldering safely, and the four tools every repair shop expects you to use.",
      cluster: "Technical & Repair",
      iscoLink: "ISCO 7421",
      totalMinutes: 95,
      level: "Foundation",
      progress: 72,
      credential: "ESCO Soldering · Tier 1",
      offlineKb: 8400,
      unlocks: "Module 2 · Diagnostic Workflows",
      lessons: [
        { title: "How a circuit moves charge", minutes: 12, done: true },
        { title: "The five-tool starter kit", minutes: 14, done: true },
        { title: "Soldering: heat, tin, joint", minutes: 22, done: true },
        { title: "Reading a basic schematic", minutes: 18, done: true },
        { title: "Safety: ESD & ventilation", minutes: 15, done: false },
        { title: "Practice: solder a USB cable", minutes: 14, done: false },
      ],
    },
    {
      id: "m2",
      step: 2,
      title: "Diagnostic Workflows",
      blurb:
        "A repeatable 5-step routine to triage broken phones and small appliances — without guessing.",
      cluster: "Technical & Repair",
      iscoLink: "ISCO 7421",
      totalMinutes: 110,
      level: "Intermediate",
      progress: 28,
      credential: "ESCO Diagnostics · Tier 1",
      offlineKb: 11200,
      unlocks: "Module 3 · Customer & Pricing",
      lessons: [
        { title: "Listen first: the customer brief", minutes: 10, done: true },
        { title: "Visible vs. hidden faults", minutes: 16, done: true },
        { title: "Multimeter: the 3 readings", minutes: 22, done: false },
        { title: "Component-level vs. board-level", minutes: 20, done: false },
        { title: "Decision: repair, replace, refer", minutes: 18, done: false },
        { title: "Lab: triage a dead Tecno phone", minutes: 24, done: false },
      ],
    },
    {
      id: "m3",
      step: 3,
      title: "Customer & Pricing",
      blurb:
        "Quoting fairly, explaining the fault in plain words, and keeping clients who come back twice.",
      cluster: "Business & Sales",
      iscoLink: "ISCO 7421",
      totalMinutes: 70,
      level: "Foundation",
      progress: 0,
      credential: "ESCO Service · Tier 1",
      offlineKb: 5600,
      unlocks: "Apprenticeship readiness",
      lessons: [
        { title: "Quoting without losing the job", minutes: 12, done: false },
        { title: "Three sentences that build trust", minutes: 10, done: false },
        { title: "Receipts, warranty, repeat clients", minutes: 14, done: false },
        { title: "Handling complaints calmly", minutes: 16, done: false },
        { title: "Role-play: explain a motherboard fault", minutes: 18, done: false },
      ],
    },
  ] satisfies PathwayModule[],
  bites: [
    {
      id: "b1",
      title: "Identify a counterfeit charger in 30 seconds",
      minutes: 5,
      emoji: "⚡",
      tag: "Safety",
    },
    {
      id: "b2",
      title: "Three WhatsApp templates for client follow-up",
      minutes: 4,
      emoji: "💬",
      tag: "Comms",
    },
    {
      id: "b3",
      title: "Pricing: cost-plus vs. value-based",
      minutes: 6,
      emoji: "💰",
      tag: "Business",
    },
    {
      id: "b4",
      title: "Read a battery health report",
      minutes: 5,
      emoji: "🔋",
      tag: "Diagnostics",
    },
    {
      id: "b5",
      title: "Solder joint: cold vs. clean",
      minutes: 4,
      emoji: "🔥",
      tag: "Practice",
    },
  ] satisfies BiteSize[],
  gaps: [
    {
      skill: "Multimeter fluency",
      reason: "Needed for 3 of 5 matched roles in Accra urban.",
      delta: 40,
      jobUnlock: "Bench Technician · Repair shop",
    },
    {
      skill: "Customer scripts in English",
      reason: "Tied to wage-floor uplift in ILO 2024 data.",
      delta: 25,
      jobUnlock: "Front-of-shop Technician",
    },
    {
      skill: "Inventory & receipts",
      reason: "Required by 78% of formal apprenticeships.",
      delta: 60,
      jobUnlock: "Apprenticeship · Telco partner",
    },
  ] satisfies SkillGap[],
};

export type LearnData = typeof learnData;
