import type { LevelValue } from "./intake-primitives";

export interface IntakeData {
  /* Step 1 */
  country: string;
  regionType: "urban" | "town" | "rural" | null;
  language: string;
  /* Step 2 */
  education:
    | "none"
    | "primary"
    | "lower-secondary"
    | "upper-secondary"
    | "vocational"
    | "university"
    | null;
  /* Step 3 */
  experiences: string[];
  dayToDay: string;
  /* Step 4 */
  languageProficiency: Record<string, LevelValue>;
  digitalSkills: string[];
  /* Step 5 */
  working: "yes" | "part-time" | "no" | null;
  goal:
    | "find-job"
    | "start-business"
    | "upgrade-skills"
    | "understand-options"
    | null;
  internet: "mobile" | "wifi" | "shared" | "limited" | null;
}

export const initialIntake: IntakeData = {
  country: "GH",
  regionType: null,
  language: "English",
  education: null,
  experiences: [],
  dayToDay: "",
  languageProficiency: {},
  digitalSkills: [],
  working: null,
  goal: null,
  internet: null,
};

export const COUNTRIES: { code: string; flag: string; name: string }[] = [
  { code: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia" },
];

/* Suggestion catalogue keyed by country code. Falls back to "default". */
export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  GH: ["Phone repair", "Trotro driving", "Tailoring", "Market selling", "Hair braiding", "Farming"],
  KE: ["Boda boda", "Mama mboga", "Tailoring", "Phone repair", "Farming", "Tutoring"],
  NG: ["Tailoring", "Hair braiding", "Phone repair", "Catering", "Trading", "Tutoring"],
  BD: ["Garment work", "Tailoring", "Rickshaw driving", "Mobile recharge", "Farming", "Tutoring"],
  IN: ["Tutoring", "Tailoring", "Auto driving", "Mobile recharge", "Farming", "Catering"],
  default: ["Tailoring", "Phone repair", "Tutoring", "Farming", "Selling", "Cooking"],
};

export function suggestionsFor(country: string): string[] {
  return SKILL_SUGGESTIONS[country] ?? SKILL_SUGGESTIONS.default;
}