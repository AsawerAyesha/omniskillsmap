import * as React from "react";
import type { CohortOverview } from "./dashboard-data";

interface Props {
  cohort: CohortOverview;
}

/* Cohort Overview — leftmost column.
 * Dark-mode tuned: uses inline rgba so it stays consistent inside the
 * dashboard's forced-dark surface, regardless of the global theme. */
export function CohortPanel({ cohort }: Props) {
  const maxCluster = Math.max(...cohort.skillClusters.map((c) => c.profiles));

  return (
    <section
      aria-label="Cohort overview"
      className="rounded-2xl p-5 md:p-6 space-y-7"
      style={{
        background: "var(--policy-panel)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2
          className="text-[12px] uppercase tracking-[0.08em] font-medium"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Cohort overview
        </h2>
        <ExportButton label="CSV" />
      </header>

      {/* Active profiles */}
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Active profiles
        </div>
        <div
          className="mt-2 tracking-tight leading-none"
          style={{ color: "var(--policy-fg)", fontSize: "48px" }}
        >
          {cohort.activeProfiles.toLocaleString()}
        </div>
        <div
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium font-mono tabular-nums"
          style={{ color: "var(--signal-green)" }}
        >
          ↑ +{cohort.weeklyDelta} this week
        </div>
      </div>

      {/* Skill clusters bar chart */}
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.08em] mb-3"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Skill clusters
        </div>
        <ul className="space-y-2.5">
          {cohort.skillClusters.map((c) => {
            const pct = (c.profiles / maxCluster) * 100;
            return (
              <li key={c.name} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                <div>
                  <div
                    className="text-[12px] mb-1"
                    style={{ color: "var(--policy-fg)" }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--policy-panel-border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-precision"
                      style={{ width: `${pct}%`, background: "var(--earth)" }}
                    />
                  </div>
                </div>
                <div
                  className="font-mono tabular-nums text-[12px] min-w-[40px] text-right"
                  style={{ color: "var(--policy-fg)" }}
                >
                  {c.profiles}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Education stacked bar */}
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.08em] mb-3"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Education level distribution
        </div>
        <div
          className="flex h-3 rounded-full overflow-hidden"
          style={{ border: "1px solid var(--policy-panel-border)" }}
        >
          {cohort.educationDistribution.map((seg, i) => {
            // earth gradient light → dark, using opacity steps
            const steps = [0.35, 0.5, 0.65, 0.8, 1];
            const opacity = steps[Math.min(i, steps.length - 1)];
            return (
              <div
                key={seg.label}
                title={`${seg.label}: ${seg.pct}%`}
                className="h-full transition-[flex-basis] duration-700 ease-precision"
                style={{
                  flexBasis: `${seg.pct}%`,
                  background: `color-mix(in oklab, var(--earth) ${
                    opacity * 100
                  }%, transparent)`,
                }}
              />
            );
          })}
        </div>
        <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
          {cohort.educationDistribution.map((seg, i) => {
            const steps = [0.35, 0.5, 0.65, 0.8, 1];
            const opacity = steps[Math.min(i, steps.length - 1)];
            return (
              <li
                key={seg.label}
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "var(--policy-fg)" }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-sm shrink-0"
                  style={{
                    background: `color-mix(in oklab, var(--earth) ${
                      opacity * 100
                    }%, transparent)`,
                  }}
                />
                <span>{seg.label}</span>
                <span className="font-mono tabular-nums" style={{ color: "var(--policy-fg-muted)" }}>
                  {seg.pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Gender breakdown */}
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.08em] mb-3"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Gender breakdown
        </div>
        <div className="flex items-baseline gap-4">
          <GenderStat pct={cohort.gender.female} label="F" highlight />
          <span
            aria-hidden
            className="text-[28px]"
            style={{ color: "var(--policy-fg-faint)" }}
          >
            ·
          </span>
          <GenderStat pct={cohort.gender.male} label="M" />
        </div>
      </div>
    </section>
  );
}

function GenderStat({
  pct,
  label,
  highlight = false,
}: {
  pct: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="tracking-tight leading-none"
        style={{
          color: highlight ? "var(--earth)" : "var(--policy-fg)",
          fontSize: "32px",
        }}
      >
        {pct}%
      </span>
      <span
        className="text-[12px] font-mono"
        style={{ color: "var(--policy-fg-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function ExportButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] transition-colors"
      style={{
        background: "var(--policy-panel)",
        color: "var(--policy-fg)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      Export {label}
    </button>
  );
}