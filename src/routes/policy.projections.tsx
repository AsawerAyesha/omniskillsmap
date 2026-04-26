import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Compass, Download, LineChart, Sigma, Sparkles } from "lucide-react";
import { useUnmappedMode } from "@/components/unmapped/mode-context";
import { ProjectionsBoard } from "@/components/unmapped/policy-dashboard/projections-board";
import { getProjectionsDataset } from "@/components/unmapped/policy-dashboard/projections-data";

export const Route = createFileRoute("/policy/projections")({
  head: () => ({
    meta: [
      { title: "Projections — UNMAPPED Policy" },
      {
        name: "description",
        content:
          "Forward labour-market projections by scenario: cohort supply, demand index, attainment trajectories and cluster gaps.",
      },
      { property: "og:title", content: "Projections — UNMAPPED Policy" },
      {
        property: "og:description",
        content:
          "Five-year scenario simulation of supply, demand and attainment across LMIC cohorts.",
      },
    ],
  }),
  component: PolicyProjectionsPage,
});

function PolicyProjectionsPage() {
  const { country } = useUnmappedMode();
  const data = React.useMemo(() => getProjectionsDataset(country), [country]);

  const stats = [
    {
      icon: Sigma,
      label: "Horizon",
      value: `${data.startYear}–${data.endYear}`,
      sub: "5-year window",
    },
    {
      icon: LineChart,
      label: "Cohort by 2030",
      value: `${data.totals.cohort2030.baseline}k`,
      sub: "baseline scenario",
    },
    {
      icon: Sparkles,
      label: "Demand index 2030",
      value: String(data.totals.avgDemandIndex2030.baseline),
      sub: "100 = 2025",
    },
    {
      icon: Compass,
      label: "Scenarios",
      value: "3",
      sub: "base · accel · shock",
    },
  ];

  return (
    <div
      className="min-h-[calc(100vh-49px)]"
      style={{ background: var(--policy-bg), color: var(--policy-fg) }}
    >
      <div
        className="border-b"
        style={{ borderColor: var(--policy-panel-border) }}
      >
        <div className="u-container py-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] tracking-tight leading-tight">
              Projections
            </h1>
            <p
              className="mt-1 text-[12px] font-mono"
              style={{ color: var(--policy-fg-muted) }}
            >
              {data.contextLine} · ILO trend extension + Wittgenstein attainment
              + cohort dynamics
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "var(--earth)", color: var(--policy-accent-ink) }}
          >
            <Download size={13} strokeWidth={1.6} />
            Export scenario brief
          </button>
        </div>
      </div>

      <div className="u-container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{
                background: var(--policy-panel),
                border: "1px solid var(--policy-panel-border)",
              }}
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(196,168,130,0.12)",
                  color: "#C4A882",
                }}
              >
                <s.icon size={16} strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <div
                  className="text-[10px] uppercase tracking-[0.08em]"
                  style={{ color: var(--policy-fg-muted) }}
                >
                  {s.label}
                </div>
                <div className="text-[20px] leading-none mt-0.5 tabular-nums">
                  {s.value}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: var(--policy-fg-faint) }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div key={country} className="animate-rise-in">
          <ProjectionsBoard data={data} />
        </div>
      </div>
    </div>
  );
}
