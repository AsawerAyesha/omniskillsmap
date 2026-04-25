import * as React from "react";

/* Three theme tracks:
 *  - "light"  → default parchment surfaces.
 *  - "dark"   → warm ink dark theme (existing).
 *  - "onyx"   → true-black OLED variant, layered on top of `dark` so the
 *               shadcn semantic mapping is inherited, then surfaces and
 *               borders are swapped to pure black. See styles.css.
 *
 * The provider mounts the right combination of classes on <html> and
 * persists the user choice. Adding/removing classes is debounced inside
 * a single rAF so React commits and DOM mutations stay aligned.
 */
export type ThemeName = "light" | "dark" | "onyx";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  /** True when the active palette is dark-family (dark or onyx). */
  isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "unmapped:theme";

function applyTheme(name: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Brief opt-in transition class so color swaps animate instead of snapping.
  root.classList.add("theme-transition");
  window.setTimeout(() => root.classList.remove("theme-transition"), 260);

  root.classList.remove("light", "dark", "theme-onyx");
  if (name === "light") {
    root.classList.add("light");
  } else if (name === "dark") {
    root.classList.add("dark");
  } else {
    // Onyx layers on top of dark to inherit the dark semantic mapping.
    root.classList.add("dark", "theme-onyx");
  }
}

function readStored(): ThemeName | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "onyx") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>("light");

  // Hydrate from storage on mount; default to OS preference if unset.
  React.useEffect(() => {
    const stored = readStored();
    if (stored) {
      setThemeState(stored);
      applyTheme(stored);
      return;
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial: ThemeName = prefersDark ? "dark" : "light";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = React.useCallback((next: ThemeName) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, isDark: theme !== "light" }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
