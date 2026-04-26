import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Compass, Download, ShieldCheck, Users } from "lucide-react";
import { useUnmappedMode } from "@/components/unmapped/mode-context";
import { getRiskDataset } from "@/components/unmapped/policy-dashboard/risk-data";
import { RiskBoard } from "@/components/unmapped/policy-dashboard/risk-board";

export const Route = createFileRoute("/policy/risk")({
  head: () => ({
    meta: [
      { title: "Automation Risk — UNMAPPED Policy" },
      {
        name: "description",
        content:
          "LMIC-calibrated automation exposure by occupation, task decomposition and adjacent low-risk pivots.",
      },
      { property: "og:title", content: "Automation Risk — UNMAPPED Policy" },
      {
        property: "og:description",
        content:
          "Where the cohort is most exposed to automation, why, and what realistic pivots exist.",
      },
    ],
  }),
  component: PolicyRiskPage,
});

function PolicyRiskPage() {
  const { country } = useUnmappedMode();
  const data = React.useMemo(() => getRiskDataset(country), [country]);

  const stats = [
    {
      icon: Users,
      label: "Workers exposed",
      value: data.totals.exposedWorkers.toLocaleString(),
      sub: "in cohort",
    },
    {
      icon: Compass,
      label: "Weighted avg. risk",
      value: `${data.totals.avgRisk}%`,
      sub: "LMIC-calibrated",
    },
    {
      icon: AlertTriangle,
      label: "High-risk occupations",
      value: String(data.totals.highRiskCount),
      sub: "≥ 70% exposure",
    },
    {
      icon: ShieldCheck,
      label: "Pivot pathways",
      value: String(data.totals.pathwaysAvailable),
      sub: "low-risk adjacencies",
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
              Automation Risk
            </h1>
            <p
              className="mt-1 text-[12px] font-mono"
              style={{ color: var(--policy-fg-muted) }}
            >
              {data.contextLine} · Frey-Osborne + ILO task indices, LMIC-calibrated
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "var(--earth)", color: var(--policy-accent-ink) }}
          >
            <Download size={13} strokeWidth={1.6} />
            Export risk register
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
          <RiskBoard data={data} />
        </div>
      </div>
    </div>
  );
}