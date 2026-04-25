import * as React from "react";

export type UnmappedMode = "youth" | "policy";

interface ModeContextValue {
  mode: UnmappedMode;
  setMode: (m: UnmappedMode) => void;
  toggle: () => void;
  country: string;
  setCountry: (c: string) => void;
}

const ModeContext = React.createContext<ModeContextValue | null>(null);
const STORAGE_KEY = "unmapped:mode";
const COUNTRY_KEY = "unmapped:country";

export function UnmappedModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<UnmappedMode>("youth");
  const [country, setCountryState] = React.useState<string>("Ghana");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as UnmappedMode | null;
      if (stored === "youth" || stored === "policy") setModeState(stored);
      const c = localStorage.getItem(COUNTRY_KEY);
      if (c) setCountryState(c);
    } catch {
      /* ignore */
    }
  }, []);

  const setMode = React.useCallback((m: UnmappedMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const setCountry = React.useCallback((c: string) => {
    setCountryState(c);
    try {
      localStorage.setItem(COUNTRY_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = React.useCallback(
    () => setMode(mode === "youth" ? "policy" : "youth"),
    [mode, setMode],
  );

  const value = React.useMemo(
    () => ({ mode, setMode, toggle, country, setCountry }),
    [mode, setMode, toggle, country, setCountry],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useUnmappedMode() {
  const ctx = React.useContext(ModeContext);
  if (!ctx) throw new Error("useUnmappedMode must be used inside UnmappedModeProvider");
  return ctx;
}