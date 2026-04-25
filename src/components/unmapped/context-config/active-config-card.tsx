import * as React from "react";
import { cn } from "@/lib/utils";
import { LANG_LABELS, REGION_LABELS, type ContextConfig } from "./types";

interface Props {
  config: ContextConfig;
  active: boolean;
  canRemove: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onEdit: () => void;
}

const sourceLabel = (src: string) => {
  if (src.startsWith("ilostat_")) {
    const parts = src.split("_");
    const country = parts[1]?.toUpperCase();
    const year = parts[2];
    return `ILO ${country} ILOSTAT ${year}`;
  }
  if (src.startsWith("unesco_")) return `UNESCO ${src.replace("unesco_", "").replace(/_/g, " ")}`;
  if (src.startsWith("wittgenstein")) return "Wittgenstein 2025 projections";
  return src;
};

const calibLabel = (n: number) =>
  n >= 0.7
    ? "Low-capital LMIC calibration"
    : n >= 0.4
      ? "Mixed-economy calibration"
      : "High-capital calibration";

export function ActiveConfigCard({
  config,
  active,
  canRemove,
  onSelect,
  onRemove,
  onEdit,
}: Props) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-surface-raised transition-colors",
        active
          ? "border-border-subtle border-l-[3px] border-l-earth shadow-[var(--shadow-sm)]"
          : "border-border-subtle hover:bg-surface-sunken/40 cursor-pointer",
      )}
      onClick={!active ? onSelect : undefined}
    >
      <div className="px-4 py-3">
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden className="text-[18px] leading-none">
              {config.flag}
            </span>
            <h4 className="text-[15px] font-medium text-ink truncate">
              {config.region_label}
            </h4>
          </div>
          {active && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-earth-light px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-earth-dark">
              Active
            </span>
          )}
        </header>

        <ul className="mt-2 space-y-1 text-[12px] text-ink-secondary">
          <li className="flex gap-2">
            <span className="text-ink-tertiary w-[64px] shrink-0">Data</span>
            <span className="truncate">
              {sourceLabel(config.data_sources.labor_market)}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-ink-tertiary w-[64px] shrink-0">Language</span>
            <span className="truncate">
              {LANG_LABELS[config.language]}
              {config.language === "en" &&
              config.region_label.includes("Sub-Saharan")
                ? " + Twi"
                : ""}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-ink-tertiary w-[64px] shrink-0">Auto.</span>
            <span className="truncate">{calibLabel(config.automation_calibration)}</span>
          </li>
        </ul>

        <footer className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
          <span className="text-[10px] font-mono text-ink-tertiary uppercase tracking-[0.06em]">
            {REGION_LABELS[config.region_type]}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-md px-2 py-1 text-[12px] font-medium text-ink-secondary hover:bg-surface-sunken transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={!canRemove}
              onClick={(e) => {
                e.stopPropagation();
                if (canRemove) onRemove();
              }}
              className={cn(
                "rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
                canRemove
                  ? "text-signal-red hover:bg-signal-red/10"
                  : "text-ink-tertiary cursor-not-allowed",
              )}
            >
              Remove
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}