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

export const Route = createFileRoute("/policy")({
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
  const { country, mode } = useUnmappedMode();
  const data = React.useMemo(() => getCountryDataset(country), [country]);

  /* Force dark theme on the policy dashboard for the analytical context.
   * Restores the previous theme class on unmount so the youth view stays warm. */
  React.useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const hadLight = root.classList.contains("light");
    root.classList.add("dark");
    root.classList.remove("light");
    return () => {
      if (!hadDark) root.classList.remove("dark");
      if (hadLight) root.classList.add("light");
    };
  }, []);

  /* Re-mount the data layer when country changes so charts re-animate.
   * Also fire a brief loading toast — the live demo of country-agnostic arch. */
  const prevCountry = React.useRef(country);
  const [phase, setPhase] = React.useState<"in" | "out">("in");
  React.useEffect(() => {
    if (prevCountry.current === country) return;
    setPhase("out");
    toast(`Loading data for ${country}…`, {
      duration: 600,
      id: "policy-context-switch",
    });
    const t1 = setTimeout(() => setPhase("in"), 220);
    prevCountry.current = country;
    return () => clearTimeout(t1);
  }, [country]);

  // Suppress lint: mode is read for type-safety / future gating.
  void mode;

  return (
    <div
      className="min-h-[calc(100vh-49px)]"
      style={{ background: "#111009", color: "#F0EDE8" }}
    >
      {/* Sub-header: title + context line + page-level export */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="u-container py-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] tracking-tight leading-tight">
              Cohort dashboard
            </h1>
            <p
              className="mt-1 text-[12px] font-mono"
              style={{ color: "rgba(240,237,232,0.55)" }}
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
                color: "#1A1814",
              }}
            >
              <Download size={13} strokeWidth={1.6} />
              Export PDF report
            </button>
          </div>
        </div>
      </div>

      <div className="u-container py-6 space-y-6">
        <div
          className={`transition-all duration-200 ease-precision ${
            phase === "out"
              ? "opacity-0 translate-y-1"
              : "opacity-100 translate-y-0"
          }`}
          // Re-mount children on country change for fresh chart animations
          key={`${country}-${phase}`}
        >
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
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <header className="flex items-baseline justify-between gap-3 mb-4">
                  <div>
                    <h2
                      className="text-[12px] uppercase tracking-[0.08em] font-medium"
                      style={{ color: "rgba(240,237,232,0.55)" }}
                    >
                      Real econometric signals
                    </h2>
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: "rgba(240,237,232,0.45)" }}
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