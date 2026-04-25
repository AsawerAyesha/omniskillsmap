import * as React from "react";
import { Sparkles, Settings2, Wifi, WifiOff, Footprints, Bus, Tent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContextConfig } from "./context-config/context-config-store";
import {
  CONNECTIVITY_LABELS,
  MOBILITY_LABELS,
  DISPLACEMENT_LABELS,
  DEFAULT_ADVANCED_SIGNALS,
  type AdvancedSignals,
} from "./context-config/types";
import { hasActiveSignals } from "./opportunities/constraint-fit";

/* Compact strip that names the active matching constraints + opens the
 * Configure Context drawer. Hidden when all signals are at defaults. */
export function ConstraintBanner({ className }: { className?: string }) {
  const { active, openDrawer } = useContextConfig();
  const signals: AdvancedSignals =
    active.advanced_signals ?? DEFAULT_ADVANCED_SIGNALS;

  if (!hasActiveSignals(signals)) return null;

  const items: { icon: React.ReactNode; label: string }[] = [];
  if (signals.connectivity !== DEFAULT_ADVANCED_SIGNALS.connectivity) {
    items.push({
      icon:
        signals.connectivity === "offline_first" ? (
          <WifiOff size={12} strokeWidth={1.6} />
        ) : (
          <Wifi size={12} strokeWidth={1.6} />
        ),
      label: CONNECTIVITY_LABELS[signals.connectivity],
    });
  }
  if (signals.mobility !== DEFAULT_ADVANCED_SIGNALS.mobility) {
    items.push({
      icon:
        signals.mobility === "walking" ? (
          <Footprints size={12} strokeWidth={1.6} />
        ) : (
          <Bus size={12} strokeWidth={1.6} />
        ),
      label: MOBILITY_LABELS[signals.mobility],
    });
  }
  if (signals.displacement !== DEFAULT_ADVANCED_SIGNALS.displacement) {
    items.push({
      icon: <Tent size={12} strokeWidth={1.6} />,
      label: DISPLACEMENT_LABELS[signals.displacement],
    });
  }

  return (
    <div
      role="note"
      aria-label="Recommendations adapted to your constraints"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-earth/30 bg-earth-light/50 px-3 py-2.5",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-medium text-earth-dark">
        <Sparkles size={12} strokeWidth={1.6} />
        Adapted for
      </span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <span className="inline-flex items-center gap-1 rounded-full border border-earth/40 bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-earth-dark">
              {it.icon}
              {it.label}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={openDrawer}
        className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-earth-dark hover:bg-earth/10 transition-colors"
      >
        <Settings2 size={11} strokeWidth={1.6} />
        Adjust
      </button>
    </div>
  );
}