import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Download, Sparkles, Target, Users } from "lucide-react";
import { useUnmappedMode } from "@/components/unmapped/mode-context";
import { OpportunitiesBoard } from "@/components/unmapped/policy-dashboard/opportunities-board";
import { getOppDataset } from "@/components/unmapped/policy-dashboard/opportunities-data";

export const Route = createFileRoute("/policy/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — UNMAPPED Policy" },
      {
        name: "description",
        content:
          "Aggregate opportunity flows: open programs, fill rates, sector demand, the placement pipeline and partner program inventory.",
      },
      { property: "og:title", content: "Opportunities — UNMAPPED Policy" },
      {
        property: "og:description",
        content:
          "Where opportunities exist, who they reach, and where the unmet gaps sit — by sector, category and region.",
      },
    ],
  }),
  component: PolicyOpportunitiesPage,
});

function PolicyOpportunitiesPage() {
  const { country } = useUnmappedMode();
  const data = React.useMemo(() => getOppDataset(country), [country]);

  const stats = [
    {
      icon: Briefcase,
      label: "Open opportunities",
      value: data.totals.openOpportunities.toLocaleString(),
      sub: `+${data.totals.weeklyDelta}/wk`,
    },
    {
      icon: Users,
      label: "Youth matched",
      value: data.totals.matchedYouth.toLocaleString(),
      sub: "this quarter",
    },
    {
      icon: Target,
      label: "Avg. fill rate",
      value: `${data.totals.avgFillRate}%`,
      sub: "weighted",
    },
    {
      icon: Sparkles,
      label: "Unmet demand",
      value: data.totals.unmetGap.toLocaleString(),
      sub: "training-ready",
    },
  ];

  return (
    <div
      className="min-h-[calc(100vh-49px)]"
      style={{ background: "#111009", color: "#F0EDE8" }}
    >
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="u-container py-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] tracking-tight leading-tight">
              Opportunities
            </h1>
            <p
              className="mt-1 text-[12px] font-mono"
              style={{ color: "rgba(240,237,232,0.55)" }}
            >
              {data.contextLine} · partner program inventory & placement pipeline
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "var(--earth)", color: "#1A1814" }}
          >
            <Download size={13} strokeWidth={1.6} />
            Export inventory
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
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
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
                  style={{ color: "rgba(240,237,232,0.55)" }}
                >
                  {s.label}
                </div>
                <div className="text-[20px] leading-none mt-0.5 tabular-nums">
                  {s.value}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "rgba(240,237,232,0.45)" }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div key={country} className="animate-rise-in">
          <OpportunitiesBoard data={data} />
        </div>
      </div>
    </div>
  );
}