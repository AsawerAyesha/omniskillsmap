import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useUnmappedMode } from "@/components/unmapped/mode-context";
import { CohortPanel, ExportButton } from "@/components/unmapped/policy-dashboard/cohort-panel";
import { SignalCards } from "@/components/unmapped/policy-dashboard/signal-cards";
import { SkillsHeatmap } from "@/components/unmapped/policy-dashboard/skills-heatmap";
import { AutomationList } from "@/components/unmapped/policy-dashboard/automation-list";
import { ProjectionChart } from "@/components/unmapped/policy-dashboard/projection-chart";
import { RawProfilesTable } from "@/components/unmapped/policy-dashboard/raw-profiles-table";
import { getCountryDataset } from "@/components/unmapped/policy-dashboard/dashboard-data";

export const Route = createFileRoute("/policy/")({
  head: () => ({
    meta: [
      { title: "Policy Dashboard — UNMAPPED" },
      {
        name: "description",
        content:
          "Aggregate cohort skills gaps, real ILO and World Bank signals, automation risk and education projections — for program officers and government analysts.",
      },
      { property: "og:title", content: "Policy Dashboard — UNMAPPED" },
      {
        property: "og:description",
        content:
          "Country-level skills infrastructure: cohort overview, real labour market signals, automation exposure and projections.",
      },
    ],
  }),
  component: PolicyDashboard,
});

function PolicyDashboard() {
  const { country } = useUnmappedMode();
  const data = React.useMemo(() => getCountryDataset(country), [country]);

  /* Brief toast on country change — the dashboard re-renders automatically
   * because `data` is memoised on `country`, and chart entrance animations
   * re-fire from the `key={country}` wrapper below. The dark-theme class is
   * owned by PolicyShell, so we no longer need to touch <html> from here. */
  const prevCountry = React.useRef(country);
  React.useEffect(() => {
    if (prevCountry.current === country) return;
    prevCountry.current = country;
    toast(`Loading data for ${country}…`, {
      duration: 600,
      id: "policy-context-switch",
    });
  }, [country]);

  return (
    <div
      className="min-h-[calc(100vh-49px)]"
      style={{ background: var(--policy-bg), color: var(--policy-fg) }}
    >
      {/* Sub-header: title + context line + page-level export */}
      <div
        className="border-b"
        style={{ borderColor: var(--policy-panel-border) }}
      >
        <div className="u-container py-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] tracking-tight leading-tight">
              Cohort dashboard
            </h1>
            <p
              className="mt-1 text-[12px] font-mono"
              style={{ color: var(--policy-fg-muted) }}
            >
              {data.contextLine}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton label="CSV" />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
              style={{
                background: "var(--earth)",
                color: var(--policy-accent-ink),
              }}
            >
              <Download size={13} strokeWidth={1.6} />
              Export PDF report
            </button>
          </div>
        </div>
      </div>

      <div className="u-container py-6 space-y-6">
        <div key={country} className="animate-rise-in">
          {/* Top 12-col grid: cohort | signals (×2) */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Column 1 — Cohort Overview (4 cols on desktop, full on mobile) */}
            <div className="lg:col-span-4">
              <CohortPanel cohort={data.cohort} />
            </div>

            {/* Column 2 — Signals + Heatmap (8 cols), with Column 3 stacked on lg */}
            <div className="lg:col-span-5 space-y-6">
              <section
                aria-label="Real econometric signals"
                className="rounded-2xl p-5 md:p-6"
                style={{
                  background: var(--policy-panel),
                  border: "1px solid var(--policy-panel-border)",
                }}
              >
                <header className="flex items-baseline justify-between gap-3 mb-4">
                  <div>
                    <h2
                      className="text-[12px] uppercase tracking-[0.08em] font-medium"
                      style={{ color: var(--policy-fg-muted) }}
                    >
                      Real econometric signals
                    </h2>
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: var(--policy-fg-faint) }}
                    >
                      {data.country} · ILO ILOSTAT + World Bank WDI
                    </p>
                  </div>
                  <ExportButton label="CSV" />
                </header>
                <SignalCards signals={data.signals} />
              </section>

              <SkillsHeatmap rows={data.heatmap} />
            </div>

            {/* Column 3 — Automation risk (3 cols) */}
            <div className="lg:col-span-3">
              <AutomationList rows={data.automation} />
            </div>
          </div>

          {/* Bottom row — projections */}
          <div className="mt-6">
            <ProjectionChart points={data.projections} />
          </div>

          {/* Raw profile table */}
          <div className="mt-6">
            <RawProfilesTable rows={data.rawProfiles} />
          </div>
        </div>
      </div>
    </div>
  );
}