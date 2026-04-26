/* Shape of every cached country snapshot.
 *
 * The brief requires that we surface ≥2 econometric signals visibly to the
 * user — and that those signals come from real datasets, not synthetic
 * proxies. Every numeric value here is therefore tagged with its source,
 * dataset identifier, and vintage so the UI can render an attribution pill
 * next to it (e.g. "ILO ILOSTAT 2024 · cached"). */

export interface SourcedValue<T = number> {
  value: T;
  /** Human-readable dataset label, e.g. "ILO ILOSTAT". */
  source: string;
  /** Machine identifier for the underlying series, e.g. "EMP_TEMP_SEX_AGE_NB". */
  dataset: string;
  /** Reporting year of the value. */
  vintage: number;
  /** Optional unit hint (e.g. "% YoY", "GHS/mo"). */
  unit?: string;
  /** Optional one-line caveat shown on hover. */
  note?: string;
}

export interface SectorSnapshot {
  /** ISCO-08 sub-major group label, e.g. "ISCO 74 — Electrical & electronic". */
  iscoGroup: string;
  /** Local sector label as a youth would describe it, e.g. "Electronics & repair". */
  localLabel: string;
  employmentShare: SourcedValue; // % of total employment
  yoyGrowth: SourcedValue;       // % YoY change in sector employment
  entryWageMonthly: SourcedValue<string>; // formatted local wage range
  automationExposure: SourcedValue;       // 0–1, LMIC-calibrated Frey-Osborne
}

export interface CountryDataSnapshot {
  iso3: string;
  country: string;
  region: string;            // e.g. "Sub-Saharan Africa"
  contextLabel: string;      // e.g. "Urban informal · Accra"
  currency: string;          // e.g. "GHS"

  /** Headline labour signals shown on the youth opportunity sidebar
   *  AND on the policy overview's "Real econometric signals" card. */
  headline: {
    sectorGrowth: SourcedValue;        // sector job growth, % YoY
    avgEntryWage: SourcedValue<string>; // formatted, e.g. "GHS 1,240"
    youthNeet: SourcedValue;           // % youth not in education/employment/training
    employmentToPop: SourcedValue;     // 15+ employment-to-population, %
    informalShare: SourcedValue;       // informal share of non-agric employment, %
    mobileBroadband: SourcedValue;     // mobile broadband subscriptions / 100
  };

  /** Sector-level snapshot used to enrich the focal opportunity sector
   *  on the youth view (Electronics & Repair for Ghana, Garment for BD). */
  focalSector: SectorSnapshot;
}