import * as React from "react";
import {
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ChevronDown,
  Wallet,
  TrendingUp,
  Clock,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "./use-count-up";
import type { Opportunity } from "./opportunities-data";
import type { FitChip } from "./constraint-fit";

interface Props {
  opportunity: Opportunity;
  index: number;
  /* Constraint-aware additions — empty/zero when no signals are active. */
  fitChips?: FitChip[];
  scoreDelta?: number;
}

const STAGGER = [0, 80, 160, 240, 320];

export function OpportunityCard({
  opportunity: o,
  index,
  fitChips = [],
  scoreDelta = 0,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [filled, setFilled] = React.useState(false);
  const adjusted = Math.max(0, Math.min(100, o.matchScore + scoreDelta));
  const score = useCountUp(adjusted, 400);

  React.useEffect(() => {
    const t = setTimeout(() => setFilled(true), 120 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const havePct = (o.skillsHave / o.skillsTotal) * 100;
  const delay = STAGGER[Math.min(index, STAGGER.length - 1)];

  return (
    <article
      className="opacity-0 animate-rise-in rounded-2xl border border-border-subtle bg-surface-raised p-5 md:p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* TOP ROW — type badge + match score */}
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-secondary">
          {o.categoryLabel}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-earth-light px-2.5 py-1 text-[12px] font-medium text-earth-dark"
          aria-label={`Match score ${adjusted} percent${scoreDelta !== 0 ? `, adjusted from ${o.matchScore}` : ""}`}
          title={
            scoreDelta === 0
              ? undefined
              : `Adjusted ${scoreDelta > 0 ? "+" : ""}${scoreDelta} from base ${o.matchScore}% based on your constraints.`
          }
        >
          {scoreDelta !== 0 && (
            <span className="font-mono tabular-nums text-ink-tertiary line-through opacity-70">
              {o.matchScore}
            </span>
          )}
          <span className="font-mono tabular-nums">{score}%</span>
          <span className="hidden sm:inline">match</span>
        </span>
      </div>

      {/* CONSTRAINT FIT CHIPS — only render when we have any */}
      {fitChips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {fitChips.map((c, i) => {
            const Icon = c.icon;
            const good = c.tone === "good";
            return (
              <li key={`${c.label}-${i}`}>
                <span
                  title={c.hint}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    good
                      ? "border-signal-green/30 bg-signal-green/10 text-signal-green"
                      : "border-signal-amber/40 bg-signal-amber/10 text-signal-amber",
                  )}
                >
                  <Icon size={11} strokeWidth={1.7} />
                  {c.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* TITLE + ORG */}
      <div className="mt-3">
        <h3 className="text-[17px] font-medium leading-snug text-ink">
          {o.title}
        </h3>
        <p className="mt-1 text-[13px] text-ink-secondary">
          {o.org} · {o.location}
        </p>
      </div>

      {/* DESCRIPTION (2-line clamp + read more) */}
      <Description text={o.description} />

      {/* DATA ROW — wage / growth / duration */}
      <div className="mt-4 flex flex-wrap gap-2">
        <DataChip icon={<Wallet size={13} />} value={o.wage} />
        <DataChip icon={<TrendingUp size={13} />} value={o.growth} />
        <DataChip icon={<Clock size={13} />} value={o.duration} />
      </div>

      {/* SKILLS GAP BAR */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-medium text-ink-secondary">Your match</span>
          <span className="font-mono tabular-nums text-ink-tertiary">
            {o.skillsHave} / {o.skillsTotal} skills
          </span>
        </div>
        <SegmentedBar
          have={o.skillsHave}
          total={o.skillsTotal}
          filled={filled}
        />
        <p className="mt-1.5 text-[12px] text-ink-tertiary">
          You have <span className="text-ink-secondary">{o.skillsHave}</span> of{" "}
          {o.skillsTotal} required skills · {havePct.toFixed(0)}% complete
        </p>
      </div>

      {/* SKILLS TO ACQUIRE — collapsible */}
      <div className="mt-4 border-t border-border-subtle pt-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left text-[13px] font-medium text-ink hover:text-earth-dark"
        >
          <span>
            Skills to acquire ({o.skillsToAcquire.length})
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200 text-ink-tertiary",
              open && "rotate-180",
            )}
          />
        </button>
        {open && (
          <div className="mt-3 space-y-3">
            <ul className="flex flex-wrap gap-1.5">
              {o.skillsToAcquire.map((s, i) => (
                <li
                  key={s}
                  className="opacity-0 animate-tag-pop inline-flex items-center gap-1.5 rounded-full border border-dashed border-earth/60 bg-earth-light/40 px-2.5 py-1 text-[12px] text-earth-dark"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {s}
                </li>
              ))}
            </ul>
            {o.trainingAvailable && (
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-earth-dark hover:underline underline-offset-4"
              >
                <GraduationCap size={14} />
                Free training available
                <ArrowRight size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM ACTION ROW */}
      <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-ink hover:bg-surface-sunken transition-colors"
        >
          Learn more
          <ArrowRight size={14} />
        </a>
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          aria-pressed={saved}
          onClick={() => setSaved((v) => !v)}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle transition-colors",
            saved
              ? "bg-earth-light text-earth-dark border-earth/40"
              : "bg-surface-raised text-ink-secondary hover:bg-surface-sunken",
          )}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
    </article>
  );
}

function DataChip({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-1.5 text-[12px] font-mono tabular-nums text-ink">
      <span className="text-ink-tertiary" aria-hidden>
        {icon}
      </span>
      {value}
    </span>
  );
}

function SegmentedBar({
  have,
  total,
  filled,
}: {
  have: number;
  total: number;
  filled: boolean;
}) {
  return (
    <div
      className="mt-2 flex gap-1"
      role="progressbar"
      aria-valuenow={have}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Skills matched"
    >
      {Array.from({ length: total }).map((_, i) => {
        const isHave = i < have;
        return (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-[500ms] ease-precision",
              isHave
                ? filled
                  ? "bg-earth opacity-100 scale-y-100"
                  : "bg-earth opacity-0 scale-y-50"
                : "border border-dashed border-earth/60 bg-transparent",
            )}
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        );
      })}
    </div>
  );
}

function Description({ text }: { text: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-2">
      <p
        className={cn(
          "text-[13px] leading-relaxed text-ink-secondary",
          !open && "line-clamp-2",
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 text-[12px] font-medium text-earth-dark hover:underline underline-offset-4"
      >
        {open ? "Read less" : "Read more"}
      </button>
    </div>
  );
}