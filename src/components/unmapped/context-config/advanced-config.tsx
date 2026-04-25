import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ContextConfig,
  type OpportunityType,
  type LanguageCode,
  LANG_LABELS,
} from "./types";

interface Props {
  config: ContextConfig;
  onChange: (patch: Partial<ContextConfig>) => void;
}

const OPPS: { id: OpportunityType; label: string }[] = [
  { id: "formal_employment", label: "Formal employment" },
  { id: "self_employment", label: "Self-employment" },
  { id: "gig", label: "Gig work" },
  { id: "training", label: "Training pathways" },
];

const VINTAGES = [2021, 2022, 2023, 2024] as const;
const LANGS: LanguageCode[] = ["auto", "en", "fr", "ar", "bn", "sw"];

export function AdvancedConfig({ config, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  const toggleOpp = (id: OpportunityType) => {
    const has = config.opportunity_types.includes(id);
    onChange({
      opportunity_types: has
        ? config.opportunity_types.filter((o) => o !== id)
        : [...config.opportunity_types, id],
    });
  };

  const calibPct = Math.round(config.automation_calibration * 100);

  return (
    <section className="border-t border-border-subtle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-surface-sunken/40 transition-colors"
      >
        <span className="text-[12px] uppercase tracking-[0.08em] font-medium text-ink-tertiary">
          Advanced — customize signals
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-ink-tertiary transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5">
          {/* Automation calibration slider */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label
                htmlFor="calib"
                className="text-[12px] font-medium text-ink-secondary"
              >
                Automation risk calibration
              </label>
              <span className="text-[12px] font-mono tabular-nums text-ink">
                {calibPct}%
              </span>
            </div>
            <input
              id="calib"
              type="range"
              min={0}
              max={100}
              value={calibPct}
              onChange={(e) =>
                onChange({ automation_calibration: Number(e.target.value) / 100 })
              }
              className="u-range w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.06em] font-mono text-ink-tertiary">
              <span>High-capital</span>
              <span>Low-capital LMIC</span>
            </div>
          </div>

          {/* Wage vintage segmented */}
          <div>
            <label className="block text-[12px] font-medium text-ink-secondary mb-1.5">
              Wage data vintage
            </label>
            <div className="grid grid-cols-4 gap-1 rounded-lg border border-border-subtle bg-surface-sunken/60 p-1">
              {VINTAGES.map((y) => {
                const active = config.wage_vintage === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => onChange({ wage_vintage: y })}
                    aria-pressed={active}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-[12px] font-mono tabular-nums transition-colors",
                      active
                        ? "bg-earth text-[#1A1814]"
                        : "text-ink-secondary hover:text-ink",
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opportunity type toggles */}
          <div>
            <label className="block text-[12px] font-medium text-ink-secondary mb-1.5">
              Opportunity types
            </label>
            <ul className="grid grid-cols-2 gap-1.5">
              {OPPS.map((o) => {
                const on = config.opportunity_types.includes(o.id);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => toggleOpp(o.id)}
                      aria-pressed={on}
                      className={cn(
                        "w-full inline-flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-[12px] font-medium transition-colors",
                        on
                          ? "border-earth bg-earth-light text-earth-dark"
                          : "border-border-subtle bg-surface-raised text-ink-secondary hover:bg-surface-sunken",
                      )}
                    >
                      <span>{o.label}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px]",
                          on
                            ? "border-earth-dark bg-earth-dark text-earth-light"
                            : "border-border-strong bg-surface-raised text-transparent",
                        )}
                      >
                        ✓
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Language override */}
          <div>
            <label
              htmlFor="lang"
              className="block text-[12px] font-medium text-ink-secondary mb-1.5"
            >
              Language / script override
            </label>
            <select
              id="lang"
              value={config.language}
              onChange={(e) =>
                onChange({ language: e.target.value as LanguageCode })
              }
              className="w-full rounded-lg border border-border-subtle bg-surface-sunken/60 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-earth focus:bg-surface-raised transition-colors"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}