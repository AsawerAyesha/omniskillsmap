import type { LucideIcon } from "lucide-react";
import { WifiOff, Wifi, Footprints, Bus, Tent, IdCard } from "lucide-react";
import type { AdvancedSignals } from "../context-config/types";
import type { Opportunity } from "./opportunities-data";

export interface FitChip {
  tone: "good" | "warn";
  label: string;
  icon: LucideIcon;
  /* short reason shown via title= on hover */
  hint: string;
}

export interface FitResult {
  chips: FitChip[];
  scoreDelta: number; // -8…+8
  /* Why this card was demoted/promoted, used in tooltips & empty-state copy */
  demotedReason: "connectivity" | "mobility" | "displacement" | null;
}

const NEUTRAL: FitResult = { chips: [], scoreDelta: 0, demotedReason: null };

function isDefault(s: AdvancedSignals): boolean {
  return (
    s.connectivity === "intermittent" &&
    s.mobility === "local_transit" &&
    s.displacement === "none"
  );
}

export function evaluateFit(
  o: Opportunity,
  signals: AdvancedSignals | undefined,
): FitResult {
  if (!signals || isDefault(signals)) return NEUTRAL;

  const chips: FitChip[] = [];
  let delta = 0;
  let demotedReason: FitResult["demotedReason"] = null;

  /* ---------- Connectivity ---------- */
  if (signals.connectivity === "offline_first") {
    if (o.offlineFriendly === true) {
      chips.push({
        tone: "good",
        label: "Works offline",
        icon: Wifi,
        hint: "Materials and check-ins don't need daily data.",
      });
      delta += 4;
    } else if (o.offlineFriendly === false) {
      chips.push({
        tone: "warn",
        label: "Needs daily data",
        icon: WifiOff,
        hint: "Role expects regular online access — flagged because you're offline-first.",
      });
      delta -= 6;
      demotedReason = "connectivity";
    }
  }

  /* ---------- Mobility ---------- */
  if (signals.mobility === "walking") {
    const km = o.walkableRadiusKm;
    if (typeof km === "number") {
      if (km <= 5) {
        chips.push({
          tone: "good",
          label: `≤${km} km`,
          icon: Footprints,
          hint: "Within walking distance of your area.",
        });
        delta += 4;
      } else if (km > 15) {
        chips.push({
          tone: "warn",
          label: "Regional travel",
          icon: Bus,
          hint: `~${km} km from your area — may need transit.`,
        });
        delta -= 6;
        demotedReason = demotedReason ?? "mobility";
      }
    }
  } else if (signals.mobility === "local_transit") {
    const km = o.walkableRadiusKm;
    if (typeof km === "number" && km <= 15) {
      delta += 2; // soft boost, no chip
    } else if (typeof km === "number" && km > 30) {
      chips.push({
        tone: "warn",
        label: "Outside transit range",
        icon: Bus,
        hint: `~${km} km — beyond local transit.`,
      });
      delta -= 4;
      demotedReason = demotedReason ?? "mobility";
    }
  }

  /* ---------- Displacement ---------- */
  if (signals.displacement !== "none") {
    if (o.refugeeAccessible === true) {
      chips.push({
        tone: "good",
        label: "Refugee-friendly partner",
        icon: Tent,
        hint: "Partner accepts UNHCR / IDP IDs.",
      });
      delta += 4;
    } else if (o.refugeeAccessible === false) {
      chips.push({
        tone: "warn",
        label: "ID requirements may apply",
        icon: IdCard,
        hint: "Partner typically requires national ID — confirm before applying.",
      });
      delta -= 4;
      demotedReason = demotedReason ?? "displacement";
    }
  }

  /* clamp */
  if (delta > 8) delta = 8;
  if (delta < -8) delta = -8;

  /* only mark "demoted" when net effect is negative */
  if (delta >= 0) demotedReason = null;

  return { chips, scoreDelta: delta, demotedReason };
}

/* Are any signals different from the defaults? Used by the banner. */
export function hasActiveSignals(s: AdvancedSignals | undefined): boolean {
  if (!s) return false;
  return !isDefault(s);
}