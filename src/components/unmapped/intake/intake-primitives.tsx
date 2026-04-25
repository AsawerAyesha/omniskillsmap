import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* ============================================================
   Selectable card — radio-like behaviour with clear non-color
   secondary signal (check icon) for accessibility.
   ============================================================ */
export interface SelectCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "title"> {
  selected: boolean;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
}

export function SelectCard({
  selected,
  icon,
  title,
  description,
  meta,
  className,
  ...props
}: SelectCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        "group relative w-full text-left rounded-2xl border bg-surface-raised px-4 py-4 min-h-[64px] flex items-start gap-3",
        "transition-[background-color,border-color,box-shadow] duration-150",
        selected
          ? "border-earth bg-earth-light shadow-[var(--shadow-sm)]"
          : "border-border-subtle hover:border-border-strong",
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg",
            selected
              ? "bg-[color-mix(in_oklab,var(--earth)_30%,transparent)] text-earth-dark"
              : "bg-surface-sunken text-ink-secondary",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-medium text-ink leading-snug">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-[13px] text-ink-secondary leading-snug">
            {description}
          </span>
        )}
        {meta && (
          <span className="mt-2 inline-flex items-center rounded-full border border-border-subtle bg-surface-sunken px-2 py-0.5 font-mono text-[11px] text-ink-tertiary">
            {meta}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          "shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-earth-dark bg-earth-dark text-earth-light"
            : "border-border-strong bg-transparent text-transparent",
        )}
      >
        <Check size={12} strokeWidth={2.5} />
      </span>
    </button>
  );
}

/* ============================================================
   Pill button — single or multi-select pill toggle.
   ============================================================ */
export interface PillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}
export function Pill({ selected, className, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 min-h-[44px] text-[14px] font-medium transition-colors duration-150",
        selected
          ? "border-earth bg-earth-light text-earth-dark"
          : "border-border-strong bg-transparent text-ink-secondary hover:bg-surface-sunken",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Dot-level selector (●●○) — accessible 3-step proficiency.
   ============================================================ */
const LEVELS = ["Basic", "Conversational", "Fluent"] as const;
export type LevelValue = (typeof LEVELS)[number] | null;

export function LevelSelector({
  value,
  onChange,
  label,
}: {
  value: LevelValue;
  onChange: (v: LevelValue) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={`${label} proficiency`}
      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-sunken p-1"
    >
      {LEVELS.map((lvl, i) => {
        const active = value === lvl;
        const filled = value ? LEVELS.indexOf(value) >= i : false;
        return (
          <button
            key={lvl}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : lvl)}
            title={lvl}
            aria-label={lvl}
            className={cn(
              "min-h-[36px] min-w-[44px] px-2 rounded-full inline-flex items-center justify-center gap-0.5 text-[12px] transition-colors",
              active
                ? "bg-earth-dark text-earth-light"
                : "text-ink-secondary hover:bg-surface-raised",
            )}
          >
            <span aria-hidden className="font-mono tracking-tight leading-none">
              {LEVELS.map((_, j) => (j <= i ? (filled ? "●" : "○") : "○")).join("")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const PROFICIENCY_LEVELS = LEVELS;