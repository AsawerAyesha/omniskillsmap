import * as React from "react";
import { ChevronDown, Wifi, Footprints, Tent, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ContextConfig,
  type ConnectivityTier,
  type MobilityTier,
  type DisplacementContext,
  type AdvancedSignals as AdvancedSignalsT,
  CONNECTIVITY_LABELS,
  CONNECTIVITY_HINTS,
  MOBILITY_LABELS,
  MOBILITY_HINTS,
  DISPLACEMENT_LABELS,
  DEFAULT_ADVANCED_SIGNALS,
} from "./types";

interface Props {
  config: ContextConfig;
  onChange: (patch: Partial<ContextConfig>) => void;
}

const CONNECTIVITY: ConnectivityTier[] = ["offline_first", "intermittent", "broadband"];
const MOBILITY: MobilityTier[] = ["walking", "local_transit", "regional"];
const DISPLACEMENT: DisplacementContext[] = [
  "none",
  "internally_displaced",
  "refugee",
  "returnee",
  "host_community",
];

export function AdvancedSignals({ config, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const signals: AdvancedSignalsT = config.advanced_signals ?? DEFAULT_ADVANCED_SIGNALS;

  const patch = (next: Partial<AdvancedSignalsT>) =>
    onChange({ advanced_signals: { ...signals, ...next } });

  const isCustomised =
    signals.connectivity !== DEFAULT_ADVANCED_SIGNALS.connectivity ||
    signals.mobility !== DEFAULT_ADVANCED_SIGNALS.mobility ||
    signals.displacement !== DEFAULT_ADVANCED_SIGNALS.displacement;

  return (
    <section className="border-t border-border-subtle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-surface-sunken/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.5} className="text-earth-dark" />
          <span className="text-[12px] uppercase tracking-[0.08em] font-medium text-ink-tertiary">
            Advanced signals — matching modifiers
          </span>
          {isCustomised && (
            <span
              aria-label="Customised"
              className="inline-flex h-1.5 w-1.5 rounded-full bg-earth"
            />
          )}
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
          <p className="text-[11px] leading-snug text-ink-tertiary">
            Optional. Influences how opportunities, lessons, and risk scores are
            ranked — does not change the underlying data.
          </p>

          {/* Connectivity */}
          <SignalGroup
            icon={<Wifi size={14} strokeWidth={1.5} />}
            label="Connectivity constraints"
            hint={CONNECTIVITY_HINTS[signals.connectivity]}
          >
            <Segmented
              value={signals.connectivity}
              onChange={(v) => patch({ connectivity: v as ConnectivityTier })}
              options={CONNECTIVITY.map((c) => ({
                value: c,
                label: CONNECTIVITY_LABELS[c],
              }))}
            />
          </SignalGroup>

          {/* Mobility */}
          <SignalGroup
            icon={<Footprints size={14} strokeWidth={1.5} />}
            label="Mobility constraints"
            hint={MOBILITY_HINTS[signals.mobility]}
          >
            <Segmented
              value={signals.mobility}
              onChange={(v) => patch({ mobility: v as MobilityTier })}
              options={MOBILITY.map((m) => ({
                value: m,
                label: MOBILITY_LABELS[m],
              }))}
            />
          </SignalGroup>

          {/* Displacement */}
          <SignalGroup
            icon={<Tent size={14} strokeWidth={1.5} />}
            label="Displacement context"
            hint="Unlocks UNHCR / IOM partner pathways when applicable."
          >
            <select
              value={signals.displacement}
              onChange={(e) =>
                patch({ displacement: e.target.value as DisplacementContext })
              }
              className="w-full rounded-lg border border-border-subtle bg-surface-sunken/60 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-earth focus:bg-surface-raised transition-colors"
            >
              {DISPLACEMENT.map((d) => (
                <option key={d} value={d}>
                  {DISPLACEMENT_LABELS[d]}
                </option>
              ))}
            </select>
          </SignalGroup>

          {isCustomised && (
            <button
              type="button"
              onClick={() =>
                onChange({ advanced_signals: { ...DEFAULT_ADVANCED_SIGNALS } })
              }
              className="text-[11px] uppercase tracking-[0.06em] font-medium text-ink-tertiary hover:text-ink transition-colors"
            >
              Reset to defaults
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* --------------------------- internals --------------------------- */

function SignalGroup({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-ink-secondary">
        {icon}
        <span className="text-[12px] font-medium">{label}</span>
      </div>
      {children}
      <p className="mt-1 text-[11px] leading-snug text-ink-tertiary">{hint}</p>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      className="grid gap-1 rounded-lg border border-border-subtle bg-surface-sunken/60 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
              active
                ? "bg-earth text-[#1A1814]"
                : "text-ink-secondary hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}