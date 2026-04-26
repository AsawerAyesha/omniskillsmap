import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Layers, MapPin, TrendingUp, Users } from "lucide-react";
import { useUnmappedMode } from "@/components/unmapped/mode-context";
import { SkillsMapBoard } from "@/components/unmapped/policy-dashboard/skills-map-board";
import { getSkillsMapDataset } from "@/components/unmapped/policy-dashboard/skills-map-data";
import { LiveDataPanel } from "@/components/unmapped/live/live-data-panel";

export const Route = createFileRoute("/policy/skills")({
  head: () => ({
    meta: [
      { title: "Skills Map — OmniSkill Policy" },
      {
        name: "description",
        content:
          "National skills map by ISCO occupation cluster — supply, demand, regional concentration and tier classification.",
      },
      { property: "og:title", content: "Skills Map — OmniSkill Policy" },
      {
        property: "og:description",
        content:
          "Cluster-by-cluster supply vs demand, regional concentration and ISCO classification for the active country context.",
      },
    ],
  }),
  component: SkillsMapPage,
});

function SkillsMapPage() {
  const { country } = useUnmappedMode();
  const data = React.useMemo(() => getSkillsMapDataset(country), [country]);

  const stats: Array<{
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
    label: string;
    value: string;
    sub: string;
  }> = [
    {
      icon: Users,
      label: "Active profiles",
      value: data.totals.profiles.toLocaleString(),
      sub: "in cohort",
    },
    {
      icon: Layers,
      label: "Skill clusters",
      value: String(data.totals.clusters),
      sub: "ISCO sub-major",
    },
    {
      icon: TrendingUp,
      label: "Occupations tracked",
      value: String(data.totals.occupations),
      sub: "ILO-coded",
    },
    {
      icon: MapPin,
      label: "Regions covered",
      value: String(data.totals.regions),
      sub: data.country,
    },
  ];

  return (
    <div
      className="min-h-[calc(100vh-49px)]"
      style={{ background: "var(--policy-bg)", color: "var(--policy-fg)" }}
    >
      {/* Sub-header */}
      <div
        className="border-b"
        style={{ borderColor: "var(--policy-panel-border)" }}
      >
        <div className="u-container py-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] tracking-tight leading-tight">
              Skills Map
            </h1>
            <p
              className="mt-1 text-[12px] font-mono"
              style={{ color: "var(--policy-fg-muted)" }}
            >
              {data.contextLine} · ISCO-08 classification
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "var(--earth)", color: "var(--policy-accent-ink)" }}
          >
            <Download size={13} strokeWidth={1.6} />
            Export skills map
          </button>
        </div>
      </div>

      <div className="u-container py-6 space-y-6">
        {/* Live taxonomy from operator console (visible only when an active
            context exists with a published taxonomy dataset). */}
        <LiveDataPanel kind="skills" title="Live skills taxonomy" />

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{
                background: "var(--policy-panel)",
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
                  style={{ color: "var(--policy-fg-muted)" }}
                >
                  {s.label}
                </div>
                <div className="text-[20px] leading-none mt-0.5 tabular-nums">
                  {s.value}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--policy-fg-faint)" }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main board */}
        <div key={country} className="animate-rise-in">
          <SkillsMapBoard data={data} />
        </div>
      </div>
    </div>
  );
}