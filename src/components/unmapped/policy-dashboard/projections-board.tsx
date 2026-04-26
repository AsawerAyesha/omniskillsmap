import * as React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SCENARIOS,
  type ProjectionsDataset,
  type ScenarioId,
  type ScenarioMeta,
  type YearPoint,
} from "./projections-data";

interface Props {
  data: ProjectionsDataset;
}

/* ──────────────────────────────────────────────────────────────────────
 * Projections board
 *  Top    : Scenario controls (segmented) + KPI deltas vs baseline
 *  Middle : Dual-curve chart — supply (cumulative cohort) vs demand index
 *           with confidence band + milestone markers
 *  Lower  : Cluster gap matrix (sortable by current scenario)
 *  Side   : Attainment trajectory (stacked bars 2025/2027/2030)
 * ────────────────────────────────────────────────────────────────────── */
export function ProjectionsBoard({ data }: Props) {
  const [scenario, setScenario] = React.useState<ScenarioId>("baseline");
  const [hoverYear, setHoverYear] = React.useState<number | null>(null);

  return (
    <div className="space-y-6">
      <ScenarioControls
        scenario={scenario}
        onChange={setScenario}
        data={data}
      />

      <DualCurveChart
        data={data}
        scenario={scenario}
        hoverYear={hoverYear}
        onHoverYear={setHoverYear}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ClusterGapMatrix data={data} scenario={scenario} />
        </div>
        <div className="lg:col-span-5">
          <AttainmentTrajectoryPanel data={data} scenario={scenario} />
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  Scenario controls + KPI deltas                                        */
/* ====================================================================== */
function ScenarioControls({
  scenario,
  onChange,
  data,
}: {
  scenario: ScenarioId;
  onChange: (s: ScenarioId) => void;
  data: ProjectionsDataset;
}) {
  const meta = SCENARIOS.find((s) => s.id === scenario)!;
  const baseCohort = data.totals.cohort2030.baseline;
  const basePlace = data.totals.placement2030.baseline;
  const baseDemand = data.totals.avgDemandIndex2030.baseline;

  const cohort = data.totals.cohort2030[scenario];
  const place = data.totals.placement2030[scenario];
  const demand = data.totals.avgDemandIndex2030[scenario];

  const kpis = [
    {
      label: "Cohort by 2030",
      value: `${cohort.toLocaleString()}k`,
      delta: cohort - baseCohort,
      unit: "k vs base",
    },
    {
      label: "Placements by 2030",
      value: `${place.toLocaleString()}k`,
      delta: place - basePlace,
      unit: "k vs base",
    },
    {
      label: "Demand index 2030",
      value: String(demand),
      delta: demand - baseDemand,
      unit: "pts vs base",
    },
    {
      label: "Confidence band",
      value: `± ${data.totals.confidenceBand}%`,
      delta: 0,
      unit: "model error",
    },
  ];

  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: var(--policy-panel),
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: var(--policy-fg-muted) }}
          >
            Scenario
          </h2>
          <p
            className="mt-1 text-[11px] max-w-md"
            style={{ color: var(--policy-fg-muted) }}
          >
            {meta.blurb}
          </p>
        </div>

        <div
          className="inline-flex rounded-lg p-1"
          style={{
            background: var(--policy-panel),
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          role="tablist"
          aria-label="Projection scenario"
        >
          {SCENARIOS.map((s) => {
            const active = s.id === scenario;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(s.id)}
                className={cn(
                  "px-3 py-1.5 text-[12px] rounded-md transition-colors flex items-center gap-2",
                  active
                    ? "text-[color:var(--policy-accent-ink)]"
                    : "text-[color:var(--policy-fg)] hover:text-[color:var(--policy-fg)]",
                )}
                style={{
                  background: active ? s.color : "transparent",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: active ? var(--policy-accent-ink) : s.color,
                    opacity: active ? 0.65 : 1,
                  }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <KpiTile key={k.label} {...k} accent={meta.color} />
        ))}
      </div>
    </section>
  );
}

function KpiTile({
  label,
  value,
  delta,
  unit,
  accent,
}: {
  label: string;
  value: string;
  delta: number;
  unit: string;
  accent: string;
}) {
  const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
  const tone =
    delta > 0
      ? "rgba(127,181,138,0.95)"
      : delta < 0
      ? "rgba(224,122,95,0.95)"
      : var(--policy-fg-muted);

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: var(--policy-panel),
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.08em]"
        style={{ color: var(--policy-fg-muted) }}
      >
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div
          className="text-[22px] tabular-nums leading-none"
          style={{ color: accent }}
        >
          {value}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] tabular-nums">
        <Icon size={11} strokeWidth={2} style={{ color: tone }} />
        <span style={{ color: tone }}>
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
        <span style={{ color: var(--policy-fg-faint) }}>{unit}</span>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  Dual-curve chart — supply (k profiles) vs demand index                */
/* ====================================================================== */
function DualCurveChart({
  data,
  scenario,
  hoverYear,
  onHoverYear,
}: {
  data: ProjectionsDataset;
  scenario: ScenarioId;
  hoverYear: number | null;
  onHoverYear: (y: number | null) => void;
}) {
  const W = 1080;
  const H = 320;
  const PAD = { l: 56, r: 64, t: 36, b: 44 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const meta = SCENARIOS.find((s) => s.id === scenario)!;
  const xs = data.supplyCurve.map((p) => p.year);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const supplyMax =
    Math.max(
      ...data.supplyCurve.flatMap((p) => [p.baseline, p.accelerated, p.disruptive]),
    ) * 1.05;
  const demandValues = data.demandIndex.flatMap((p) => [
    p.baseline,
    p.accelerated,
    p.disruptive,
  ]);
  const demandMin = Math.min(...demandValues, 90);
  const demandMax = Math.max(...demandValues, 140);

  const x = (year: number) =>
    PAD.l + ((year - xMin) / (xMax - xMin)) * innerW;
  const ySupply = (v: number) =>
    PAD.t + (1 - v / supplyMax) * innerH;
  const yDemand = (v: number) =>
    PAD.t + (1 - (v - demandMin) / (demandMax - demandMin)) * innerH;

  const supplyPath = (key: keyof Omit<YearPoint, "year">) =>
    data.supplyCurve
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${ySupply(p[key])}`)
      .join(" ");

  const demandPath = (key: keyof Omit<YearPoint, "year">) =>
    data.demandIndex
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${yDemand(p[key])}`)
      .join(" ");

  /* Confidence band around the active scenario's supply curve */
  const band = data.totals.confidenceBand / 100;
  const bandPath = (() => {
    const top = data.supplyCurve.map(
      (p) => `${x(p.year)},${ySupply(p[scenario] * (1 + band))}`,
    );
    const bot = data.supplyCurve
      .map((p) => `${x(p.year)},${ySupply(p[scenario] * (1 - band))}`)
      .reverse();
    return `M ${top.join(" L ")} L ${bot.join(" L ")} Z`;
  })();

  /* Hover crosshair */
  const hoverPoint = hoverYear
    ? data.supplyCurve.find((p) => p.year === hoverYear)
    : null;
  const hoverDemand = hoverYear
    ? data.demandIndex.find((p) => p.year === hoverYear)
    : null;

  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: var(--policy-panel),
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: var(--policy-fg-muted) }}
          >
            Supply × demand trajectory
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Cumulative cohort (left axis, k profiles) vs weighted demand index
            (right axis, 100 = 2025). Active scenario shown with ±
            {data.totals.confidenceBand}% band.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <LegendDot color={meta.color} label="Supply (active)" />
          <LegendDot color={meta.color} label="Demand (active)" dashed />
          <LegendDot
            color=var(--policy-fg-faint)
            label="Other scenarios"
            ghost
          />
        </div>
      </header>

      <div className="w-full overflow-hidden">
        <svg
          role="img"
          aria-label="Supply and demand projection"
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ display: "block" }}
          onMouseLeave={() => onHoverYear(null)}
        >
          {/* Y grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={PAD.t + innerH * t}
              y2={PAD.t + innerH * t}
              stroke=var(--policy-panel-strong)
            />
          ))}

          {/* Supply axis labels (left) */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const v = Math.round(supplyMax * (1 - t));
            return (
              <text
                key={`sl-${t}`}
                x={PAD.l - 8}
                y={PAD.t + innerH * t + 3}
                textAnchor="end"
                fontSize="10"
                fill=var(--policy-fg-faint)
                fontFamily="ui-monospace, monospace"
              >
                {v}k
              </text>
            );
          })}

          {/* Demand axis labels (right) */}
          {[0, 0.5, 1].map((t) => {
            const v = Math.round(demandMax - (demandMax - demandMin) * t);
            return (
              <text
                key={`dl-${t}`}
                x={W - PAD.r + 8}
                y={PAD.t + innerH * t + 3}
                textAnchor="start"
                fontSize="10"
                fill=var(--policy-fg-faint)
                fontFamily="ui-monospace, monospace"
              >
                {v}
              </text>
            );
          })}

          {/* X axis years */}
          {data.supplyCurve.map((p) => (
            <g key={p.year}>
              <line
                x1={x(p.year)}
                x2={x(p.year)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke={
                  p.year === hoverYear
                    ? var(--policy-grid-strong)
                    : var(--policy-panel)
                }
              />
              <text
                x={x(p.year)}
                y={H - PAD.b + 16}
                textAnchor="middle"
                fontSize="10"
                fill=var(--policy-fg-muted)
                fontFamily="ui-monospace, monospace"
              >
                {p.year}
              </text>
            </g>
          ))}

          {/* Confidence band */}
          <path d={bandPath} fill={meta.color} fillOpacity={0.08} />

          {/* Ghost (non-active) scenarios */}
          {SCENARIOS.filter((s) => s.id !== scenario).map((s) => (
            <g key={s.id} opacity={0.25}>
              <path
                d={supplyPath(s.id)}
                fill="none"
                stroke={s.color}
                strokeWidth={1.25}
              />
              <path
                d={demandPath(s.id)}
                fill="none"
                stroke={s.color}
                strokeWidth={1.25}
                strokeDasharray="3 3"
              />
            </g>
          ))}

          {/* Active scenario lines */}
          <path
            d={supplyPath(scenario)}
            fill="none"
            stroke={meta.color}
            strokeWidth={2.4}
          />
          <path
            d={demandPath(scenario)}
            fill="none"
            stroke={meta.color}
            strokeWidth={2}
            strokeDasharray="4 4"
          />

          {/* Data points (active) */}
          {data.supplyCurve.map((p) => (
            <circle
              key={`sp-${p.year}`}
              cx={x(p.year)}
              cy={ySupply(p[scenario])}
              r={p.year === hoverYear ? 5 : 3}
              fill={meta.color}
              stroke=var(--policy-bg)
              strokeWidth={1.5}
            />
          ))}

          {/* Milestone flags */}
          {data.milestones.map((m) => {
            if (m.scenario !== "all" && m.scenario !== scenario) return null;
            const cx = x(m.year);
            return (
              <g key={`${m.year}-${m.label}`}>
                <line
                  x1={cx}
                  x2={cx}
                  y1={PAD.t - 12}
                  y2={H - PAD.b}
                  stroke={meta.color}
                  strokeOpacity={0.35}
                  strokeDasharray="2 4"
                />
                <circle
                  cx={cx}
                  cy={PAD.t - 12}
                  r={4}
                  fill={meta.color}
                  stroke=var(--policy-bg)
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

          {/* Hit-test rects per year for hover */}
          {data.supplyCurve.map((p, i) => {
            const prev = data.supplyCurve[i - 1];
            const next = data.supplyCurve[i + 1];
            const left = prev ? (x(prev.year) + x(p.year)) / 2 : x(p.year) - 20;
            const right = next ? (x(next.year) + x(p.year)) / 2 : x(p.year) + 20;
            return (
              <rect
                key={`ht-${p.year}`}
                x={left}
                y={PAD.t}
                width={right - left}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => onHoverYear(p.year)}
                style={{ cursor: "crosshair" }}
              />
            );
          })}

          {/* Hover tooltip */}
          {hoverPoint && hoverDemand && (
            <g>
              <rect
                x={x(hoverPoint.year) + 10}
                y={PAD.t + 6}
                rx={6}
                width={158}
                height={58}
                fill="rgba(17,16,9,0.92)"
                stroke=var(--policy-grid)
              />
              <text
                x={x(hoverPoint.year) + 20}
                y={PAD.t + 22}
                fontSize="10"
                fill=var(--policy-fg-muted)
                fontFamily="ui-monospace, monospace"
              >
                {hoverPoint.year} · {meta.shortLabel}
              </text>
              <text
                x={x(hoverPoint.year) + 20}
                y={PAD.t + 38}
                fontSize="11"
                fill=var(--policy-fg)
                fontFamily="ui-monospace, monospace"
              >
                Supply {hoverPoint[scenario]}k
              </text>
              <text
                x={x(hoverPoint.year) + 20}
                y={PAD.t + 54}
                fontSize="11"
                fill=var(--policy-fg)
                fontFamily="ui-monospace, monospace"
              >
                Demand idx {hoverDemand[scenario]}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Milestone strip */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {data.milestones.map((m) => {
          const visible = m.scenario === "all" || m.scenario === scenario;
          return (
            <div
              key={`${m.year}-${m.label}`}
              className="rounded-lg p-3"
              style={{
                background: visible
                  ? var(--policy-panel)
                  : "rgba(255,255,255,0.015)",
                border: `1px solid ${
                  visible ? var(--policy-panel-border) : var(--policy-panel)
                }`,
                opacity: visible ? 1 : 0.45,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      m.scenario === "all"
                        ? var(--policy-fg-muted)
                        : SCENARIOS.find((s) => s.id === m.scenario)?.color,
                  }}
                />
                <span
                  className="text-[10px] font-mono"
                  style={{ color: var(--policy-fg-muted) }}
                >
                  {m.year} ·{" "}
                  {m.scenario === "all"
                    ? "all scenarios"
                    : SCENARIOS.find((s) => s.id === m.scenario)?.shortLabel}
                </span>
              </div>
              <div
                className="mt-1 text-[12px] font-medium"
                style={{ color: var(--policy-fg) }}
              >
                {m.label}
              </div>
              <div
                className="mt-0.5 text-[11px]"
                style={{ color: var(--policy-fg-muted) }}
              >
                {m.detail}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LegendDot({
  color,
  label,
  dashed,
  ghost,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  ghost?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ color: ghost ? var(--policy-fg-faint) : var(--policy-fg) }}
    >
      <svg width="20" height="6">
        <line
          x1="0"
          x2="20"
          y1="3"
          y2="3"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      </svg>
      {label}
    </span>
  );
}

/* ====================================================================== */
/*  Cluster gap matrix                                                    */
/* ====================================================================== */
type SortKey = "demand" | "gap" | "cluster";
function ClusterGapMatrix({
  data,
  scenario,
}: {
  data: ProjectionsDataset;
  scenario: ScenarioId;
}) {
  const [sort, setSort] = React.useState<SortKey>("gap");
  const meta = SCENARIOS.find((s) => s.id === scenario)!;

  const rows = [...data.clusters].sort((a, b) => {
    if (sort === "cluster") return a.cluster.localeCompare(b.cluster);
    if (sort === "demand") return b.demand2030[scenario] - a.demand2030[scenario];
    return a.gap2030[scenario] - b.gap2030[scenario]; // most negative first
  });

  const maxAbsGap = Math.max(
    ...data.clusters.map((c) => Math.abs(c.gap2030[scenario])),
    1,
  );

  return (
    <section
      className="rounded-2xl p-5 md:p-6 h-full"
      style={{
        background: var(--policy-panel),
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: var(--policy-fg-muted) }}
          >
            Cluster gap matrix · 2030
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Demand index (100 = 2025) and net cohort gap under{" "}
            <span style={{ color: meta.color }}>{meta.label.toLowerCase()}</span>.
            Negative = shortage.
          </p>
        </div>
      </header>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-[12px]" style={{ color: var(--policy-fg) }}>
          <thead>
            <tr
              className="text-left"
              style={{ color: var(--policy-fg-muted) }}
            >
              <ThSort onClick={() => setSort("cluster")} active={sort === "cluster"}>
                Cluster
              </ThSort>
              <ThSort onClick={() => setSort("demand")} active={sort === "demand"}>
                Demand idx
              </ThSort>
              <th className="px-2 py-2 text-[10px] uppercase tracking-[0.08em] font-medium">
                Net gap (cohort)
              </th>
              <ThSort onClick={() => setSort("gap")} active={sort === "gap"}>
                Δ
              </ThSort>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const gap = c.gap2030[scenario];
              const demand = c.demand2030[scenario];
              const w = (Math.abs(gap) / maxAbsGap) * 100;
              const tone =
                gap < -1500
                  ? "#E07A5F"
                  : gap < 0
                  ? "#C4A882"
                  : "#7FB58A";
              return (
                <tr
                  key={c.cluster}
                  className="border-t"
                  style={{ borderColor: var(--policy-panel-border) }}
                >
                  <td className="px-2 py-2.5 align-top">
                    <div className="font-medium leading-tight">{c.cluster}</div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: var(--policy-fg-muted) }}
                    >
                      {c.notes}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 align-top tabular-nums font-mono">
                    <span
                      style={{
                        color:
                          demand >= 120
                            ? "#7FB58A"
                            : demand >= 105
                            ? "#C4A882"
                            : demand >= 95
                            ? var(--policy-fg)
                            : "#E07A5F",
                      }}
                    >
                      {demand}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 align-middle min-w-[160px]">
                    <div className="relative h-1.5 rounded-full bg-[color:var(--policy-panel)] overflow-hidden">
                      <div
                        className="absolute top-0 h-full rounded-full"
                        style={{
                          width: `${w}%`,
                          background: tone,
                          left: gap < 0 ? `${50 - w / 2}%` : "50%",
                        }}
                      />
                      <div
                        className="absolute top-0 h-full"
                        style={{
                          left: "50%",
                          width: 1,
                          background: var(--policy-grid-strong),
                        }}
                      />
                    </div>
                  </td>
                  <td
                    className="px-2 py-2.5 align-middle text-right tabular-nums font-mono"
                    style={{ color: tone }}
                  >
                    {gap > 0 ? "+" : ""}
                    {gap.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ThSort({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.08em] font-medium">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-[color:var(--policy-fg)] transition-colors"
        style={{ color: active ? var(--policy-fg) : undefined }}
      >
        {children}
        <span
          className="text-[8px]"
          style={{ opacity: active ? 1 : 0.4 }}
        >
          ▾
        </span>
      </button>
    </th>
  );
}

/* ====================================================================== */
/*  Attainment trajectory                                                 */
/* ====================================================================== */
function AttainmentTrajectoryPanel({
  data,
  scenario,
}: {
  data: ProjectionsDataset;
  scenario: ScenarioId;
}) {
  const meta = SCENARIOS.find((s) => s.id === scenario)!;
  const segments = [
    { key: "tertiary" as const, label: "Tertiary", color: "var(--earth-dark, #8E7048)" },
    { key: "secondary" as const, label: "Secondary", color: "var(--earth, #C4A882)" },
    { key: "none" as const, label: "No formal", color: "var(--earth-light, #DCC9A8)" },
  ];

  return (
    <section
      className="rounded-2xl p-5 md:p-6 h-full"
      style={{
        background: var(--policy-panel),
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <header className="mb-4">
        <h2
          className="text-[12px] uppercase tracking-[0.08em] font-medium"
          style={{ color: var(--policy-fg-muted) }}
        >
          Attainment trajectory
        </h2>
        <p
          className="mt-1 text-[11px]"
          style={{ color: var(--policy-fg-faint) }}
        >
          Education mix evolution under{" "}
          <span style={{ color: meta.color }}>{meta.label.toLowerCase()}</span>.
        </p>
      </header>

      <div className="space-y-4">
        {data.attainment.map((row) => {
          const tertiary = row.tertiary[scenario];
          const secondary = row.secondary[scenario];
          const none = row.none[scenario];
          return (
            <div key={row.year}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span
                  className="font-mono text-[11px]"
                  style={{ color: var(--policy-fg) }}
                >
                  {row.year}
                </span>
                <span
                  className="font-mono text-[11px] tabular-nums"
                  style={{ color: meta.color }}
                >
                  {tertiary}% tertiary
                </span>
              </div>
              <div
                className="flex h-3 w-full overflow-hidden rounded-full"
                style={{ background: var(--policy-panel-strong) }}
              >
                <div
                  style={{
                    width: `${tertiary}%`,
                    background: segments[0].color,
                  }}
                />
                <div
                  style={{
                    width: `${secondary}%`,
                    background: segments[1].color,
                  }}
                />
                <div
                  style={{
                    width: `${none}%`,
                    background: segments[2].color,
                  }}
                />
              </div>
              <div
                className="mt-1 flex justify-between text-[10px] tabular-nums font-mono"
                style={{ color: var(--policy-fg-muted) }}
              >
                <span>None {none}%</span>
                <span>Secondary {secondary}%</span>
                <span>Tertiary {tertiary}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-5 pt-4 border-t flex flex-wrap items-center gap-3 text-[11px]"
        style={{
          borderColor: var(--policy-panel-border),
          color: var(--policy-fg),
        }}
      >
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* Local export for unused-import safety */
export type { ScenarioMeta };
