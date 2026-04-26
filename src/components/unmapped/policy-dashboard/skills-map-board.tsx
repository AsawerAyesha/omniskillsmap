import * as React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TIER_META,
  type SkillCluster,
  type SkillsMapDataset,
} from "./skills-map-data";

interface Props {
  data: SkillsMapDataset;
}

/* ──────────────────────────────────────────────────────────────────────
 * Skills Map board
 *  - Left: filterable cluster grid. Each card shows ISCO group, supply,
 *    demand bar, weekly delta, top occupations and regional split.
 *  - Right: a supply × demand quadrant scatter (the "skills market" lens).
 *    Bubble size = cohort supply, position = (supply rank, demand). The
 *    upper-right quadrant is the "high-leverage" zone — high demand we
 *    can already supply. Upper-left is "training opportunity" — high
 *    demand but thin supply.
 * ────────────────────────────────────────────────────────────────────── */
export function SkillsMapBoard({ data }: Props) {
  const [region, setRegion] = React.useState<string>("All regions");
  const [tier, setTier] = React.useState<"all" | SkillCluster["tier"]>("all");
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return data.clusters.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
      if (region === "All regions") return true;
      // crude region filter — show cluster if region appears in its top 3
      return c.topRegions.some((r) => r.startsWith(region));
    });
  }, [data.clusters, region, tier]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ─────────── LEFT — filters + cluster cards ─────────── */}
      <section className="lg:col-span-7 space-y-4">
        {/* Filter bar */}
        <div
          className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-3"
          style={{
            background: var(--policy-panel),
            border: "1px solid var(--policy-panel-border)",
          }}
        >
          {/* Region chips */}
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-[0.08em]"
              style={{ color: var(--policy-fg-faint) }}
            >
              Region
            </span>
            {["All regions", ...data.regions].map((r) => {
              const active = region === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors",
                    active
                      ? "border border-[var(--earth)] text-[color:var(--policy-fg)]"
                      : "border border-transparent",
                  )}
                  style={{
                    background: active
                      ? "rgba(196,168,130,0.18)"
                      : var(--policy-panel),
                    color: active ? "var(--policy-fg)" : "var(--policy-fg)",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div
            className="hidden md:block h-5 w-px"
            style={{ background: var(--policy-panel-border) }}
          />

          {/* Tier filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-[0.08em]"
              style={{ color: var(--policy-fg-faint) }}
            >
              Tier
            </span>
            {(["all", "critical", "growing", "stable", "declining"] as const).map(
              (t) => {
                const active = tier === t;
                const meta = t === "all" ? null : TIER_META[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors inline-flex items-center gap-1.5",
                      active ? "text-[color:var(--policy-fg)]" : "",
                    )}
                    style={{
                      background: active
                        ? var(--policy-panel-border)
                        : var(--policy-panel),
                      border: `1px solid ${
                        active ? meta?.ring ?? var(--policy-grid-strong) : "transparent"
                      }`,
                      color: active ? "var(--policy-fg)" : "var(--policy-fg)",
                    }}
                  >
                    {meta && (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: meta.color }}
                      />
                    )}
                    {t === "all" ? "All" : meta?.label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Cluster cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <ClusterCard
              key={c.cluster}
              cluster={c}
              active={activeId === c.cluster}
              onHover={() => setActiveId(c.cluster)}
              onLeave={() => setActiveId(null)}
            />
          ))}
          {filtered.length === 0 && (
            <div
              className="sm:col-span-2 rounded-2xl px-5 py-10 text-center text-[13px]"
              style={{
                background: var(--policy-panel),
                border: "1px dashed var(--policy-grid)",
                color: var(--policy-fg-muted),
              }}
            >
              No clusters match this filter combination.
            </div>
          )}
        </div>
      </section>

      {/* ─────────── RIGHT — supply/demand quadrant ─────────── */}
      <aside className="lg:col-span-5">
        <SupplyDemandQuadrant
          clusters={data.clusters}
          activeId={activeId}
          onActivate={setActiveId}
        />
      </aside>
    </div>
  );
}

/* ====================================================================== */
/*  Cluster card                                                          */
/* ====================================================================== */
function ClusterCard({
  cluster,
  active,
  onHover,
  onLeave,
}: {
  cluster: SkillCluster;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const tier = TIER_META[cluster.tier];
  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group rounded-2xl p-4 transition-all duration-200 cursor-pointer"
      style={{
        background: active ? var(--policy-panel-strong) : var(--policy-panel),
        border: `1px solid ${active ? tier.ring : var(--policy-panel-border)}`,
        boxShadow: active
          ? `0 8px 32px -16px ${tier.color}40`
          : "none",
      }}
    >
      {/* Top: cluster + tier */}
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[15px] leading-tight tracking-tight truncate">
            {cluster.cluster}
          </h3>
          <p
            className="text-[10px] font-mono uppercase tracking-[0.06em] mt-1"
            style={{ color: var(--policy-fg-faint) }}
          >
            {cluster.iscoMajor}
          </p>
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1"
          style={{
            background: `${tier.color}1f`,
            color: tier.color,
            border: `1px solid ${tier.ring}`,
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: tier.color }}
          />
          {tier.label}
        </span>
      </header>

      {/* Supply vs demand bars */}
      <div className="space-y-2 mb-3">
        <BarRow
          label="Cohort supply"
          value={cluster.supply}
          display={`${cluster.supply.toLocaleString()} profiles`}
          ratio={Math.min(1, cluster.supply / 1500)}
          color=var(--policy-fg-muted)
        />
        <BarRow
          label="Market demand"
          value={cluster.demand}
          display={`${cluster.demand} / 100`}
          ratio={cluster.demand / 100}
          color={tier.color}
        />
      </div>

      {/* Top occupations */}
      <div className="mb-3">
        <div
          className="text-[10px] uppercase tracking-[0.06em] mb-1.5"
          style={{ color: var(--policy-fg-faint) }}
        >
          Top occupations
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {cluster.topOccupations.map((o) => (
            <li
              key={o}
              className="text-[11px] px-2 py-0.5 rounded"
              style={{
                background: var(--policy-panel),
                color: "var(--policy-fg)",
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      </div>

      {/* Regional split */}
      <div
        className="flex items-center justify-between gap-3 pt-3 border-t"
        style={{ borderColor: var(--policy-panel-border) }}
      >
        <div className="min-w-0">
          <div
            className="text-[10px] uppercase tracking-[0.06em]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Regional concentration
          </div>
          <div
            className="text-[11px] font-mono mt-0.5 truncate"
            style={{ color: "var(--policy-fg)" }}
          >
            {cluster.topRegions.join("  ·  ")}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-mono whitespace-nowrap"
          style={{ color: "rgba(124,158,178,0.95)" }}
        >
          +{cluster.weeklyDelta}/wk
          <ArrowUpRight size={12} strokeWidth={1.8} />
        </span>
      </div>
    </article>
  );
}

function BarRow({
  label,
  display,
  ratio,
  color,
}: {
  label: string;
  value: number;
  display: string;
  ratio: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span
          className="text-[10px] uppercase tracking-[0.06em]"
          style={{ color: var(--policy-fg-faint) }}
        >
          {label}
        </span>
        <span
          className="text-[11px] font-mono tabular-nums"
          style={{ color: "var(--policy-fg)" }}
        >
          {display}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: var(--policy-panel-border) }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${Math.max(2, ratio * 100)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  Supply × Demand quadrant (SVG)                                        */
/* ====================================================================== */
function SupplyDemandQuadrant({
  clusters,
  activeId,
  onActivate,
}: {
  clusters: SkillCluster[];
  activeId: string | null;
  onActivate: (id: string | null) => void;
}) {
  const W = 480;
  const H = 420;
  const PAD = { l: 44, r: 20, t: 28, b: 40 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const maxSupply = Math.max(...clusters.map((c) => c.supply), 1);

  const points = clusters.map((c) => {
    const x = PAD.l + (c.supply / maxSupply) * innerW;
    const y = PAD.t + (1 - c.demand / 100) * innerH;
    const r = 8 + Math.sqrt(c.supply) * 0.7;
    return { c, x, y, r };
  });

  return (
    <div
      className="rounded-2xl p-5 md:p-6 h-full"
      style={{
        background: var(--policy-panel),
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium inline-flex items-center gap-2"
            style={{ color: var(--policy-fg-muted) }}
          >
            <Sparkles size={12} strokeWidth={1.8} style={{ color: "var(--earth)" }} />
            Supply × Demand quadrant
          </h2>
          <p
            className="text-[11px] mt-1"
            style={{ color: var(--policy-fg-faint) }}
          >
            Bubble size = cohort supply. Upper-right = high-leverage clusters.
          </p>
        </div>
      </header>

      <div className="w-full overflow-hidden">
        <svg
          role="img"
          aria-label="Supply versus demand scatter"
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ display: "block" }}
        >
          {/* Quadrant background — subtle "leverage" tint upper-right */}
          <defs>
            <linearGradient id="leverage" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0%" stopColor="rgba(196,168,130,0)" />
              <stop offset="100%" stopColor="rgba(196,168,130,0.10)" />
            </linearGradient>
          </defs>
          <rect
            x={PAD.l}
            y={PAD.t}
            width={innerW}
            height={innerH}
            fill="url(#leverage)"
          />

          {/* Quadrant divider lines (median) */}
          <line
            x1={PAD.l + innerW / 2}
            x2={PAD.l + innerW / 2}
            y1={PAD.t}
            y2={PAD.t + innerH}
            stroke=var(--policy-panel-border)
            strokeDasharray="3 4"
          />
          <line
            x1={PAD.l}
            x2={PAD.l + innerW}
            y1={PAD.t + innerH / 2}
            y2={PAD.t + innerH / 2}
            stroke=var(--policy-panel-border)
            strokeDasharray="3 4"
          />

          {/* Axes */}
          <line
            x1={PAD.l}
            x2={PAD.l}
            y1={PAD.t}
            y2={PAD.t + innerH}
            stroke=var(--policy-grid-strong)
          />
          <line
            x1={PAD.l}
            x2={PAD.l + innerW}
            y1={PAD.t + innerH}
            y2={PAD.t + innerH}
            stroke=var(--policy-grid-strong)
          />

          {/* Axis labels */}
          <text
            x={PAD.l + innerW / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fill=var(--policy-fg-muted)
          >
            Cohort supply →
          </text>
          <text
            x={-PAD.t - innerH / 2}
            y={14}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fill=var(--policy-fg-muted)
          >
            Market demand →
          </text>

          {/* Quadrant captions */}
          <text x={PAD.l + 6} y={PAD.t + 14} fontSize="10" fill="rgba(224,122,95,0.85)">
            Training opportunity
          </text>
          <text
            x={PAD.l + innerW - 6}
            y={PAD.t + 14}
            textAnchor="end"
            fontSize="10"
            fill="rgba(196,168,130,0.95)"
          >
            High leverage
          </text>
          <text x={PAD.l + 6} y={PAD.t + innerH - 6} fontSize="10" fill=var(--policy-fg-faint)>
            Low priority
          </text>
          <text
            x={PAD.l + innerW - 6}
            y={PAD.t + innerH - 6}
            textAnchor="end"
            fontSize="10"
            fill="rgba(124,158,178,0.85)"
          >
            Saturated
          </text>

          {/* Bubbles */}
          {points.map(({ c, x, y, r }) => {
            const tier = TIER_META[c.tier];
            const active = activeId === c.cluster;
            return (
              <g
                key={c.cluster}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => onActivate(c.cluster)}
                onMouseLeave={() => onActivate(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={`${tier.color}33`}
                  stroke={tier.color}
                  strokeWidth={active ? 2 : 1}
                  style={{
                    transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                    filter: active ? `drop-shadow(0 0 12px ${tier.color}aa)` : "none",
                  }}
                />
                {active && (
                  <g pointerEvents="none">
                    <rect
                      x={x + r + 8}
                      y={y - 22}
                      rx={4}
                      ry={4}
                      width={Math.min(180, c.cluster.length * 7 + 24)}
                      height={36}
                      fill="rgba(20,18,15,0.92)"
                      stroke=var(--policy-grid)
                    />
                    <text
                      x={x + r + 18}
                      y={y - 8}
                      fontSize="11"
                      fill=var(--policy-fg)
                      fontFamily="ui-sans-serif, system-ui"
                    >
                      {c.cluster}
                    </text>
                    <text
                      x={x + r + 18}
                      y={y + 7}
                      fontSize="10"
                      fill=var(--policy-fg-muted)
                      fontFamily="ui-monospace, monospace"
                    >
                      {c.supply.toLocaleString()} supply · {c.demand} demand
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
        {(Object.keys(TIER_META) as Array<keyof typeof TIER_META>).map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 text-[11px]"
            style={{ color: var(--policy-fg) }}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ background: TIER_META[k].color }}
            />
            {TIER_META[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}