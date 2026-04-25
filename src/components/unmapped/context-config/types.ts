/* Shared types + reference data for the Context Configuration system.
 * Mirrors the JSON shape shown in the demo footer. */

export type RegionType =
  | "urban_formal"
  | "urban_informal"
  | "rural_agricultural"
  | "custom";

export type OpportunityType =
  | "formal_employment"
  | "self_employment"
  | "gig"
  | "training";

export type LanguageCode =
  | "auto"
  | "en"
  | "fr"
  | "ar"
  | "bn"
  | "sw"
  | "tw";

export interface DataSources {
  labor_market: string;
  education: string;
  projections: string;
}

export interface ContextConfig {
  context_id: string;
  country: string;
  region_label: string; // human-readable, e.g. "Sub-Saharan Africa · Urban Informal"
  region_type: RegionType;
  language: LanguageCode;
  data_sources: DataSources;
  automation_calibration: number; // 0–1, two decimals
  opportunity_types: OpportunityType[];
  wage_vintage: 2021 | 2022 | 2023 | 2024;
  flag: string; // emoji
}

export const REGION_LABELS: Record<RegionType, string> = {
  urban_formal: "Urban formal",
  urban_informal: "Urban informal",
  rural_agricultural: "Rural agricultural",
  custom: "Custom",
};

export const LANG_LABELS: Record<LanguageCode, string> = {
  auto: "Auto-detect",
  en: "English",
  fr: "French",
  ar: "Arabic",
  bn: "Bengali",
  sw: "Swahili",
  tw: "Twi",
};

export interface CountryEntry {
  name: string;
  flag: string;
  iso3: string;
  region: string; // for the human-readable label prefix
  defaultLanguage: LanguageCode;
  /* Source identifiers used to seed data_sources */
  laborMarket: string;
  education: string;
}

export const COUNTRY_INDEX: CountryEntry[] = [
  { name: "Ghana",       flag: "🇬🇭", iso3: "GHA", region: "Sub-Saharan Africa", defaultLanguage: "en", laborMarket: "ilostat_gha_2024", education: "unesco_ssa_2023" },
  { name: "Kenya",       flag: "🇰🇪", iso3: "KEN", region: "East Africa",         defaultLanguage: "sw", laborMarket: "ilostat_ken_2024", education: "unesco_ssa_2023" },
  { name: "Bangladesh",  flag: "🇧🇩", iso3: "BGD", region: "South Asia",          defaultLanguage: "bn", laborMarket: "ilostat_bgd_2024", education: "unesco_south_asia_2023" },
  { name: "Bangalore",   flag: "🇮🇳", iso3: "IND", region: "South Asia",          defaultLanguage: "en", laborMarket: "ilostat_ind_2024", education: "unesco_south_asia_2023" },
  { name: "India",       flag: "🇮🇳", iso3: "IND", region: "South Asia",          defaultLanguage: "en", laborMarket: "ilostat_ind_2024", education: "unesco_south_asia_2023" },
  { name: "Peru",        flag: "🇵🇪", iso3: "PER", region: "Latin America",       defaultLanguage: "en", laborMarket: "ilostat_per_2024", education: "unesco_latam_2023" },
  { name: "Vietnam",     flag: "🇻🇳", iso3: "VNM", region: "Southeast Asia",      defaultLanguage: "en", laborMarket: "ilostat_vnm_2024", education: "unesco_sea_2023" },
  { name: "Nigeria",     flag: "🇳🇬", iso3: "NGA", region: "West Africa",         defaultLanguage: "en", laborMarket: "ilostat_nga_2024", education: "unesco_ssa_2023" },
  { name: "Senegal",     flag: "🇸🇳", iso3: "SEN", region: "West Africa",         defaultLanguage: "fr", laborMarket: "ilostat_sen_2024", education: "unesco_ssa_2023" },
  { name: "Morocco",     flag: "🇲🇦", iso3: "MAR", region: "North Africa",        defaultLanguage: "ar", laborMarket: "ilostat_mar_2024", education: "unesco_mena_2023" },
  { name: "Egypt",       flag: "🇪🇬", iso3: "EGY", region: "North Africa",        defaultLanguage: "ar", laborMarket: "ilostat_egy_2024", education: "unesco_mena_2023" },
  { name: "Indonesia",   flag: "🇮🇩", iso3: "IDN", region: "Southeast Asia",      defaultLanguage: "en", laborMarket: "ilostat_idn_2024", education: "unesco_sea_2023" },
];

export function buildContextId(
  country: string,
  region: RegionType,
  vintage: number,
) {
  const entry = COUNTRY_INDEX.find((c) => c.name === country);
  const iso = entry?.iso3 ?? country.slice(0, 3).toUpperCase();
  const slug =
    region === "rural_agricultural"
      ? "rural"
      : region === "urban_informal"
        ? "urban-informal"
        : region === "urban_formal"
          ? "urban-formal"
          : "custom";
  return `${iso}-${slug}-${vintage}`;
}

export function regionLabelFor(country: string, region: RegionType): string {
  const entry = COUNTRY_INDEX.find((c) => c.name === country);
  const prefix = entry?.region ?? country;
  const suffix =
    region === "rural_agricultural"
      ? "Rural agricultural"
      : region === "urban_informal"
        ? "Urban informal"
        : region === "urban_formal"
          ? "Urban formal"
          : "Custom";
  return `${prefix} · ${suffix}`;
}

export const PROJECTIONS_SOURCE = "wittgenstein_2025";