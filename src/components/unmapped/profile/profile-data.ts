/* Sample data for Amara's profile card. In a real app this would
   come from the intake submission + ESCO/ILO matching service. */
export interface OccupationMatch {
  iscoCode: string;
  title: string;
  confidence: number; // 0–100
  source: string;
}

export interface SkillCluster {
  name: string;
  count: number;
  examples: string[];
}

export interface LanguageEntry {
  flag: string;
  name: string;
  level: 1 | 2 | 3; // dots filled
}

export interface Signal {
  label: string;
  value: string;
  caption: string;
  source: string;
}

export const sampleProfile = {
  initials: "A",
  name: "Amara Mensah",
  location: "Accra, Ghana · Urban",
  profileId: "OmniSkill-GHA-2026-08441",
  occupations: [
    {
      iscoCode: "ISCO 7421",
      title: "Electronics and Telecom Equipment Installer",
      confidence: 87,
      source: "via ESCO taxonomy",
    },
    {
      iscoCode: "ISCO 7422",
      title: "Information & Communications Technology Installer",
      confidence: 74,
      source: "via ESCO taxonomy",
    },
    {
      iscoCode: "ISCO 7411",
      title: "Electrical Mechanic & Fitter",
      confidence: 61,
      source: "via ESCO taxonomy",
    },
  ] satisfies OccupationMatch[],
  clusters: [
    {
      name: "Technical & Repair",
      count: 7,
      examples: ["Phone repair", "Soldering", "Diagnostics"],
    },
    {
      name: "Digital Literacy",
      count: 5,
      examples: ["Smartphone use", "WhatsApp", "Online selling"],
    },
    {
      name: "Communication & Languages",
      count: 4,
      examples: ["English", "Twi", "Customer service"],
    },
    {
      name: "Business & Sales",
      count: 3,
      examples: ["Pricing", "Bargaining", "Stock keeping"],
    },
    {
      name: "Self-directed Learning",
      count: 2,
      examples: ["YouTube tutorials", "Peer learning"],
    },
  ] satisfies SkillCluster[],
  languages: [
    { flag: "🇬🇧", name: "English", level: 3 },
    { flag: "🇬🇭", name: "Twi", level: 3 },
    { flag: "🇫🇷", name: "French", level: 2 },
    { flag: "🇳🇬", name: "Hausa", level: 1 },
  ] satisfies LanguageEntry[],
  signals: [
    {
      label: "Sector employment growth",
      value: "↑ 12.4%",
      caption: "Electronics repair jobs, Ghana 2023–2024",
      source: "ILO ILOSTAT",
    },
    {
      label: "Wage floor estimate",
      value: "GHS 1,240/mo",
      caption: "Entry-level electronics technician, Accra urban",
      source: "World Bank WDI",
    },
  ] satisfies Signal[],
  recognizedIn: [
    { flag: "🇬🇭", name: "Ghana" },
    { flag: "🇳🇬", name: "Nigeria" },
    { flag: "🇰🇪", name: "Kenya" },
  ],
};

export type Profile = typeof sampleProfile;