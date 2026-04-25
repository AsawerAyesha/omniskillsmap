import * as React from "react";
import {
  type ContextConfig,
  type RegionType,
  COUNTRY_INDEX,
  buildContextId,
  regionLabelFor,
  PROJECTIONS_SOURCE,
} from "./types";

interface Store {
  /* Drawer */
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  /* Active context list (max 3) */
  configs: ContextConfig[];
  active: ContextConfig;
  setActiveById: (id: string) => void;
  removeConfig: (id: string) => void;
  addConfig: (cfg: ContextConfig) => void;
  updateConfig: (id: string, patch: Partial<ContextConfig>) => void;

  /* Cross-app reconfiguration overlay */
  isReconfiguring: boolean;
  reconfiguringFor: string | null;
  applyContext: (cfg: ContextConfig) => Promise<void>;
}

const Ctx = React.createContext<Store | null>(null);

/* Default configs — Ghana urban informal as the primary, plus Bangladesh rural. */
function makeDefault(country: string, region: RegionType): ContextConfig {
  const entry = COUNTRY_INDEX.find((c) => c.name === country)!;
  return {
    context_id: buildContextId(country, region, 2024),
    country,
    region_label: regionLabelFor(country, region),
    region_type: region,
    language: entry.defaultLanguage,
    data_sources: {
      labor_market: entry.laborMarket,
      education: entry.education,
      projections: PROJECTIONS_SOURCE,
    },
    automation_calibration:
      region === "rural_agricultural" ? 0.78 : region === "urban_informal" ? 0.7 : 0.55,
    opportunity_types: ["formal_employment", "self_employment", "gig", "training"],
    wage_vintage: 2024,
    flag: entry.flag,
  };
}

const INITIAL: ContextConfig[] = [
  makeDefault("Ghana", "urban_informal"),
  makeDefault("Bangladesh", "rural_agricultural"),
];

export function ContextConfigProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [configs, setConfigs] = React.useState<ContextConfig[]>(INITIAL);
  const [activeId, setActiveId] = React.useState<string>(INITIAL[0].context_id);
  const [isReconfiguring, setReconfiguring] = React.useState(false);
  const [reconfiguringFor, setReconfiguringFor] = React.useState<string | null>(null);

  const active = React.useMemo(
    () => configs.find((c) => c.context_id === activeId) ?? configs[0],
    [configs, activeId],
  );

  const setActiveById = React.useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const removeConfig = React.useCallback(
    (id: string) => {
      setConfigs((prev) => {
        if (prev.length === 1) return prev; // keep at least one
        const next = prev.filter((c) => c.context_id !== id);
        if (id === activeId) setActiveId(next[0].context_id);
        return next;
      });
    },
    [activeId],
  );

  const addConfig = React.useCallback((cfg: ContextConfig) => {
    setConfigs((prev) => {
      // dedupe by id
      if (prev.some((c) => c.context_id === cfg.context_id)) return prev;
      const next = [...prev, cfg].slice(-3); // max 3
      return next;
    });
  }, []);

  const updateConfig = React.useCallback(
    (id: string, patch: Partial<ContextConfig>) => {
      setConfigs((prev) =>
        prev.map((c) => (c.context_id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const applyContext = React.useCallback(
    async (cfg: ContextConfig) => {
      // 1. Drawer closes (handled by caller)
      setOpen(false);
      // 2. Activate reconfiguration overlay
      setReconfiguringFor(cfg.country);
      // small delay to let drawer animate (300ms)
      await new Promise((r) => setTimeout(r, 280));
      setReconfiguring(true);
      // 3. Hold overlay briefly so loader is visible
      await new Promise((r) => setTimeout(r, 320));
      // ensure config exists in store
      setConfigs((prev) => {
        if (prev.some((c) => c.context_id === cfg.context_id)) return prev;
        return [...prev, cfg].slice(-3);
      });
      setActiveId(cfg.context_id);
      // 4. New data fades in (300ms) — overlay drops
      await new Promise((r) => setTimeout(r, 220));
      setReconfiguring(false);
      setReconfiguringFor(null);
    },
    [],
  );

  const openDrawer = React.useCallback(() => setOpen(true), []);
  const closeDrawer = React.useCallback(() => setOpen(false), []);

  /* Memoise the context value so consumers (drawer, shells, dashboard) only
   * re-render when something they actually read changes. Without this, every
   * keystroke or transient state change in the provider would create a new
   * Store object and re-render the entire app — a major contributor to the
   * tab-click lag. */
  const value = React.useMemo<Store>(
    () => ({
      open,
      openDrawer,
      closeDrawer,
      configs,
      active,
      setActiveById,
      removeConfig,
      addConfig,
      updateConfig,
      isReconfiguring,
      reconfiguringFor,
      applyContext,
    }),
    [
      open,
      openDrawer,
      closeDrawer,
      configs,
      active,
      setActiveById,
      removeConfig,
      addConfig,
      updateConfig,
      isReconfiguring,
      reconfiguringFor,
      applyContext,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContextConfig() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useContextConfig must be used inside <ContextConfigProvider>",
    );
  return ctx;
}