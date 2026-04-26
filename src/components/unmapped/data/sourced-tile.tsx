import * as React from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourcedValue } from "@/data/types";

/* SourcedTile — the canonical surface for any real-world econometric value.
 *
 * Brief requires that ≥2 econometric signals are *visibly* surfaced and
 * traceable to a real dataset. Every place we render a real number flows
 * through this component so the attribution + vintage pill is consistent
 * (and impossible to forget).
 *
 * The component is intentionally theme-neutral: it consumes the surrounding
 * `--ink*` / `--surface*` tokens on Youth surfaces, and the policy surfaces
 * pass `palette="policy"` to switch into the dashboard ink palette.
 */

interface Props {
  signal: SourcedValue<string | number>;
  /** Short, human-readable label for the value. */
  label: string;
  /** Optional value formatter — useful for unit suffixes. */
  formatValue?: (v: SourcedValue<string | number>["value"]) => string;
  /** Surface palette. Defaults to "youth" (parchment / cream tones). */
  palette?: "youth" | "policy";
  /** Compact variant — used on dense rails (e.g. opportunity-card data row). */
  size?: "md" | "sm";
  /** When true, append a small "cached" hint to the source pill. */
  cached?: boolean;
}

export function SourcedTile({
  signal,
  label,
  formatValue,
  palette = "youth",
  size = "md",
  cached = true,
}: Props) {
  const valueText = formatValue
    ? formatValue(signal.value)
    : typeof signal.value === "number"
      ? formatNumber(signal.value, signal.unit)
      : String(signal.value);

  const isPolicy = palette === "policy";
  const surface = isPolicy ? "var(--policy-panel)" : undefined;
  const border = isPolicy ? "var(--policy-panel-border)" : undefined;
  const labelColor = isPolicy ? "var(--policy-fg-muted)" : undefined;
  const sourceColor = isPolicy ? "var(--policy-fg-faint)" : undefined;

  return (
    <div
      className={cn(
        "rounded-xl border",
        size === "md" ? "p-4" : "p-3",
        !isPolicy && "border-border-subtle bg-surface-sunken/60",
      )}
      style={isPolicy ? { background: surface, borderColor: border } : undefined}
      title={signal.note}
    >
      <div
        className={cn(
          "leading-none tracking-tight",
          size === "md" ? "text-[26px]" : "text-[20px]",
          !isPolicy && "text-ink",
        )}
        style={isPolicy ? { color: "var(--policy-fg)" } : undefined}
      >
        {valueText}
      </div>
      <div
        className={cn(
          "mt-2",
          size === "md" ? "text-[12px]" : "text-[11px]",
          !isPolicy && "text-ink-secondary",
        )}
        style={isPolicy ? { color: labelColor } : undefined}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 flex items-center gap-1.5 font-mono uppercase tracking-[0.06em]",
          size === "md" ? "text-[10px]" : "text-[9px]",
          !isPolicy && "text-ink-tertiary",
        )}
        style={isPolicy ? { color: sourceColor } : undefined}
      >
        <Database size={10} strokeWidth={1.6} aria-hidden />
        <span>
          {signal.source} · {signal.vintage}
          {cached && " · cached"}
        </span>
      </div>
    </div>
  );
}

/* Tiny inline variant — for opportunity cards where the signal needs to fit
 * into the existing data-chip rail rather than its own tile. */
export function SourcedChip({
  signal,
  label,
}: {
  signal: SourcedValue<string | number>;
  label: string;
}) {
  const valueText =
    typeof signal.value === "number"
      ? formatNumber(signal.value, signal.unit)
      : String(signal.value);
  return (
    <span
      className="inline-flex flex-col items-start rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-1.5"
      title={`${signal.note ?? label} — ${signal.source} ${signal.vintage}`}
    >
      <span className="font-mono tabular-nums text-[12px] text-ink leading-tight">
        {valueText}
      </span>
      <span className="mt-0.5 text-[9px] uppercase tracking-[0.06em] text-ink-tertiary leading-none">
        {signal.source} · {signal.vintage}
      </span>
    </span>
  );
}

function formatNumber(v: number, unit?: string): string {
  const abs = Math.abs(v);
  let str: string;
  if (abs >= 100) str = v.toFixed(0);
  else if (abs >= 10) str = v.toFixed(1);
  else str = v.toFixed(1);
  if (unit?.startsWith("%")) return `${v >= 0 ? "" : ""}${str}%${unit.slice(1) ? ` ${unit.slice(1)}` : ""}`;
  if (unit) return `${str} ${unit}`;
  return str;
}