/* useCountryData() — single source of truth for all "real number" surfaces.
 *
 * Returns the cached snapshot for the active context (Ghana, Bangladesh)
 * and a `wired` flag for any other country so the UI can show an honest
 * "Configured but not yet wired" pill instead of inventing numbers. */

import * as React from "react";
import type { CountryDataSnapshot } from "./types";
import ghana from "./ilostat/ghana-2024.json";
import bangladesh from "./ilostat/bangladesh-2024.json";

const SNAPSHOTS: Record<string, CountryDataSnapshot> = {
  GHA: ghana as CountryDataSnapshot,
  BGD: bangladesh as CountryDataSnapshot,
};

export interface UseCountryDataResult {
  /** True when we have a real cached snapshot for this ISO3. */
  wired: boolean;
  /** Snapshot to render. Always defined — falls back to Ghana for unwired
   *  countries so existing surfaces never crash; the `wired` flag is the
   *  signal to render the honest "not yet wired" attribution. */
  data: CountryDataSnapshot;
  /** ISO3 the caller requested, even if we fell back. */
  requestedIso3: string;
}

export function useCountryData(iso3: string): UseCountryDataResult {
  return React.useMemo(() => {
    const upper = iso3.toUpperCase();
    const snap = SNAPSHOTS[upper];
    return {
      wired: Boolean(snap),
      data: snap ?? SNAPSHOTS.GHA,
      requestedIso3: upper,
    };
  }, [iso3]);
}

/** ISO3 codes that have a real cached snapshot. Useful for the Demo Switcher
 *  to label its presets as "real data" vs "scaffolding only". */
export const WIRED_COUNTRIES: ReadonlySet<string> = new Set(Object.keys(SNAPSHOTS));