import * as React from "react";
import { Search, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COUNTRY_INDEX,
  PROJECTIONS_SOURCE,
  type CountryEntry,
  type RegionType,
  buildContextId,
  regionLabelFor,
  type ContextConfig,
  REGION_LABELS,
} from "./types";

interface Props {
  onApply: (cfg: ContextConfig) => void;
}

const REGIONS: RegionType[] = [
  "urban_formal",
  "urban_informal",
  "rural_agricultural",
  "custom",
];

type Validation = "idle" | "validating" | "ok";

export function AddContextFlow({ onApply }: Props) {
  const [query, setQuery] = React.useState("");
  const [country, setCountry] = React.useState<CountryEntry | null>(null);
  const [region, setRegion] = React.useState<RegionType | null>(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Three data-source validation states (one per chip)
  const [v1, setV1] = React.useState<Validation>("idle");
  const [v2, setV2] = React.useState<Validation>("idle");
  const [v3, setV3] = React.useState<Validation>("idle");

  const suggestions = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return COUNTRY_INDEX.filter((c) =>
      c.name.toLowerCase().startsWith(q),
    ).slice(0, 6);
  }, [query]);

  // Trigger validation cascade when both country + region picked
  React.useEffect(() => {
    if (!country || !region) {
      setV1("idle");
      setV2("idle");
      setV3("idle");
      return;
    }
    setV1("validating");
    setV2("validating");
    setV3("validating");
    const t1 = setTimeout(() => setV1("ok"), 500);
    const t2 = setTimeout(() => setV2("ok"), 900);
    const t3 = setTimeout(() => setV3("ok"), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [country, region]);

  const allValid = v1 === "ok" && v2 === "ok" && v3 === "ok";

  const handlePick = (c: CountryEntry) => {
    setCountry(c);
    setQuery(c.name);
    setShowSuggestions(false);
    if (!region) setRegion("urban_informal");
  };

  const reset = () => {
    setQuery("");
    setCountry(null);
    setRegion(null);
    setShowSuggestions(false);
  };

  const apply = () => {
    if (!country || !region || !allValid) return;
    const cfg: ContextConfig = {
      context_id: buildContextId(country.name, region, 2024),
      country: country.name,
      region_label: regionLabelFor(country.name, region),
      region_type: region,
      language: country.defaultLanguage,
      data_sources: {
        labor_market: country.laborMarket,
        education: country.education,
        projections: PROJECTIONS_SOURCE,
      },
      automation_calibration:
        region === "rural_agricultural"
          ? 0.78
          : region === "urban_informal"
            ? 0.7
            : 0.55,
      opportunity_types: ["formal_employment", "self_employment", "gig", "training"],
      wage_vintage: 2024,
      flag: country.flag,
    };
    onApply(cfg);
    reset();
  };

  return (
    <section className="px-5 py-5 border-t border-border-subtle space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.08em] font-medium text-ink-tertiary">
          Add a context
        </h3>
        {country && (
          <button
            type="button"
            onClick={reset}
            className="text-[11px] text-ink-tertiary hover:text-ink-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Step 1 — country search */}
      <div className="relative">
        <label className="block text-[12px] font-medium text-ink-secondary mb-1.5">
          1 · Country or region
        </label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCountry(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            placeholder="Try “Ban…”"
            className="w-full rounded-lg border border-border-subtle bg-surface-sunken/60 pl-9 pr-3 py-2.5 text-[13px] text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-earth focus:bg-surface-raised transition-colors"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-10 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border-strong bg-surface-raised shadow-[var(--shadow-md)]"
          >
            {suggestions.map((c) => (
              <li key={`${c.iso3}-${c.name}`}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePick(c);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-[13px] text-ink hover:bg-surface-sunken transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="text-[16px] leading-none">
                      {c.flag}
                    </span>
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[11px] font-mono text-ink-tertiary">
                    {c.iso3}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Step 2 — segmented control (only after country pick) */}
      {country && (
        <div className="opacity-0 animate-rise-in" style={{ animationDelay: "60ms" }}>
          <label className="block text-[12px] font-medium text-ink-secondary mb-1.5">
            2 · Context type
          </label>
          <div
            role="radiogroup"
            aria-label="Context type"
            className="grid grid-cols-2 gap-1 rounded-lg border border-border-subtle bg-surface-sunken/60 p-1"
          >
            {REGIONS.map((r) => {
              const active = region === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRegion(r)}
                  className={cn(
                    "rounded-md px-2.5 py-2 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-earth text-[#1A1814] shadow-[var(--shadow-sm)]"
                      : "text-ink-secondary hover:text-ink",
                  )}
                >
                  {REGION_LABELS[r]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 — data source preview */}
      {country && region && (
        <div className="opacity-0 animate-rise-in" style={{ animationDelay: "120ms" }}>
          <label className="block text-[12px] font-medium text-ink-secondary mb-1.5">
            3 · Data sources
          </label>
          <ul className="space-y-1.5">
            <ValidationChip
              state={v1}
              label={`ILO ${country.name} ILOSTAT`}
              source={country.laborMarket}
            />
            <ValidationChip
              state={v2}
              label={`UNESCO ${country.region}`}
              source={country.education}
            />
            <ValidationChip
              state={v3}
              label="Wittgenstein 2025 projections"
              source={PROJECTIONS_SOURCE}
            />
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={apply}
        disabled={!allValid}
        className={cn(
          "w-full rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all min-h-[44px]",
          allValid
            ? "bg-earth-dark text-earth-light hover:bg-ink"
            : "bg-surface-sunken text-ink-tertiary cursor-not-allowed",
        )}
      >
        {allValid
          ? `Apply ${country?.name} context`
          : country && region
            ? "Validating data sources…"
            : "Pick a country and context type"}
      </button>
    </section>
  );
}

function ValidationChip({
  state,
  label,
  source,
}: {
  state: Validation;
  label: string;
  source: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors",
        state === "ok"
          ? "border-signal-green/40 bg-signal-green/5"
          : "border-border-subtle bg-surface-sunken/60",
      )}
    >
      <div className="min-w-0">
        <div className="text-[12px] text-ink truncate">{label}</div>
        <div className="text-[10px] font-mono text-ink-tertiary truncate">
          {source}
        </div>
      </div>
      <span
        aria-label={state === "ok" ? "Validated" : "Validating"}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full"
      >
        {state === "ok" ? (
          <Check size={14} className="text-signal-green" strokeWidth={2.5} />
        ) : (
          <Loader2 size={14} className="animate-spin text-ink-tertiary" />
        )}
      </span>
    </li>
  );
}