import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  type OppCategory,
  type OppDataset,
  type ProgramRow,
  type SectorFlow,
} from "./opportunities-data";

interface Props {
  data: OppDataset;
}

/* ──────────────────────────────────────────────────────────────────────
 * Aggregate Opportunities board
 *  Top row     : Placement pipeline (funnel) + Category mix donut.
 *  Middle row  : Sector flow — stacked horizontal bars per sector showing
 *                category mix, with fill rate + unmet gap badges.
 *  Bottom row  : Partner program inventory (sortable, capacity-aware).
 * ────────────────────────────────────────────────────────────────────── */
export function OpportunitiesBoard({ data }: Props) {
  const [category, setCategory] = React.useState<"all" | OppCategory>("all");
  const [activeSector, setActiveSector] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Top row */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PipelineFunnel pipeline={data.pipeline} />
        </div>
        <div className="lg:col-span-5">
          <CategoryMix
            byCategory={data.byCategory}
            active={category}
            onChange={setCategory}
          />
        </div>
      </div>

      {/* Middle row — sector flow */}
      <SectorFlowPanel
        sectors={data.sectors}
        category={category}
        activeSector={activeSector}
        onActivate={setActiveSector}
      />

      {/* Bottom — program inventory */}
      <ProgramInventory programs={data.programs} category={category} />
    </div>
  );
}

/* ====================================================================== */
/*  Pipeline funnel                                                       */
/* ====================================================================== */
function PipelineFunnel({ pipeline }: { pipeline: OppDataset["pipeline"] }) {
  const max = pipeline[0]?.count ?? 1;
  const W = 560;
  const H = 220;
  const PAD = 24;
  const innerW = W - PAD * 2;
  const stepW = innerW / pipeline.length;

  return (
    <section
      className="rounded-2xl p-5 md:p-6 h-full"
      style={{
        background: var(--policy-panel),
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="mb-3">
        <h2
          className="text-[12px] uppercase tracking-[0.08em] font-medium"
          style={{ color: var(--policy-fg-muted) }}
        >
          Placement pipeline
        </h2>
        <p
          className="mt-1 text-[11px]"
          style={{ color: var(--policy-fg-faint) }}
        >
          Discovered → Matched → Applied → Placed (last 90 days)
        </p>
      </header>

      <svg
        role="img"
        aria-label="Placement pipeline funnel"
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="funnelFill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(196,168,130,0.45)" />
            <stop offset="100%" stopColor="rgba(124,158,178,0.45)" />
          </linearGradient>
        </defs>

        {/* Funnel polygon */}
        <polygon
          fill="url(#funnelFill)"
          stroke=var(--policy-grid)
          points={pipeline
            .map((p, i) => {
              const x = PAD + i * stepW + stepW / 2;
              const h = (p.count / max) * (H - 80);
              const yTop = (H - 30 - h) / 2 + 20;
              return `${x},${yTop}`;
            })
            .concat(
              pipeline
                .slice()
                .reverse()
                .map((p, i) => {
                  const realI = pipeline.length - 1 - i;
                  const x = PAD + realI * stepW + stepW / 2;
                  const h = (p.count / max) * (H - 80);
                  const yBot = (H - 30 - h) / 2 + 20 + h;
                  return `${x},${yBot}`;
                }),
            )
            .join(" ")}
        />

        {/* Stage markers */}
        {pipeline.map((p, i) => {
          const x = PAD + i * stepW + stepW / 2;
          const ratio = i === 0 ? 1 : p.count / pipeline[i - 1].count;
          return (
            <g key={p.stage}>
              <line
                x1={x}
                x2={x}
                y1={20}
                y2={H - 30}
                stroke="var(--policy-grid)"
                strokeDasharray="2 4"
              />
              <text
                x={x}
                y={14}
                textAnchor="middle"
                fontSize="11"
                fontFamily="ui-sans-serif, system-ui"
                fill="var(--policy-fg)"
              >
                {p.count.toLocaleString()}
              </text>
              <text
                x={x}
                y={H - 14}
                textAnchor="middle"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                fill=var(--policy-fg-muted)
              >
                {p.stage}
              </text>
              {i > 0 && (
                <text
                  x={x - stepW / 2}
                  y={H / 2 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fill={ratio < 0.5 ? "rgba(224,122,95,0.95)" : "rgba(127,181,138,0.95)"}
                >
                  {Math.round(ratio * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}

/* ====================================================================== */
/*  Category mix donut                                                    */
/* ====================================================================== */
function CategoryMix({
  byCategory,
  active,
  onChange,
}: {
  byCategory: Record<OppCategory, number>;
  active: "all" | OppCategory;
  onChange: (next: "all" | OppCategory) => void;
}) {
  const entries = (Object.keys(byCategory) as OppCategory[]).map((k) => ({
    key: k,
    value: byCategory[k],
    color: CATEGORY_META[k].color,
    label: CATEGORY_META[k].label,
  }));
  const total = entries.reduce((a, e) => a + e.value, 0) || 1;

  // SVG donut
  const SIZE = 180;
  const R = 70;
  const STROKE = 22;
  const C = 2 * Math.PI * R;

  let offset = 0;
  const arcs = entries.map((e) => {
    const len = (e.value / total) * C;
    const arc = {
      ...e,
      dasharray: `${len} ${C - len}`,
      dashoffset: -offset,
    };
    offset += len;
    return arc;
  });

  return (
    <section
      className="rounded-2xl p-5 md:p-6 h-full"
      style={{
        background: var(--policy-panel),
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: var(--policy-fg-muted) }}
          >
            Opportunity mix
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Click a segment to filter the board
          </p>
        </div>
        {active !== "all" && (
          <button
            type="button"
            onClick={() => onChange("all")}
            className="text-[11px] underline"
            style={{ color: var(--policy-fg) }}
          >
            Clear
          </button>
        )}
      </header>

      <div className="flex items-center gap-5">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="shrink-0"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke=var(--policy-panel-border)
            strokeWidth={STROKE}
          />
          {arcs.map((a) => {
            const isActive = active === a.key;
            const dim = active !== "all" && !isActive;
            return (
              <circle
                key={a.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={isActive ? STROKE + 4 : STROKE}
                strokeDasharray={a.dasharray}
                strokeDashoffset={a.dashoffset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                opacity={dim ? 0.25 : 1}
                style={{
                  cursor: "pointer",
                  transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
                onClick={() => onChange(isActive ? "all" : a.key)}
              />
            );
          })}
          <text
            x={SIZE / 2}
            y={SIZE / 2 - 4}
            textAnchor="middle"
            fontSize="22"
            fontFamily="ui-sans-serif, system-ui"
            fill=var(--policy-fg)
          >
            {total.toLocaleString()}
          </text>
          <text
            x={SIZE / 2}
            y={SIZE / 2 + 14}
            textAnchor="middle"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            fill=var(--policy-fg-muted)
          >
            opportunities
          </text>
        </svg>

        <ul className="flex-1 space-y-1.5 min-w-0">
          {entries.map((e) => {
            const pct = Math.round((e.value / total) * 100);
            const isActive = active === e.key;
            return (
              <li key={e.key}>
                <button
                  type="button"
                  onClick={() => onChange(isActive ? "all" : e.key)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
                  )}
                  style={{
                    background: isActive ? var(--policy-panel-strong) : "transparent",
                    border: `1px solid ${isActive ? CATEGORY_META[e.key].ring : "transparent"}`,
                  }}
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: e.color }}
                    />
                    <span
                      className="text-[12px] truncate"
                      style={{ color: "var(--policy-fg)" }}
                    >
                      {e.label}
                    </span>
                  </span>
                  <span
                    className="text-[11px] font-mono tabular-nums whitespace-nowrap"
                    style={{ color: var(--policy-fg-muted) }}
                  >
                    {e.value.toLocaleString()} · {pct}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*  Sector flow                                                           */
/* ====================================================================== */
function SectorFlowPanel({
  sectors,
  category,
  activeSector,
  onActivate,
}: {
  sectors: SectorFlow[];
  category: "all" | OppCategory;
  activeSector: string | null;
  onActivate: (next: string | null) => void;
}) {
  const max = Math.max(
    ...sectors.map((s) =>
      category === "all" ? s.open : s.byCategory[category],
    ),
    1,
  );

  return (
    <section
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
            Sector flow
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Stacked by category. Bar length = opportunities
            {category !== "all" ? ` (${CATEGORY_META[category].label})` : ""}.
            Right column shows fill-rate + unmet gap.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {(Object.keys(CATEGORY_META) as OppCategory[]).map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 text-[11px]"
              style={{ color: var(--policy-fg) }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: CATEGORY_META[k].color }}
              />
              {CATEGORY_META[k].label}
            </span>
          ))}
        </div>
      </header>

      <ul className="space-y-3">
        {sectors.map((s) => {
          const total =
            category === "all" ? s.open : s.byCategory[category];
          const pct = (total / max) * 100;
          const isActive = activeSector === s.sector;
          const cats = (Object.keys(CATEGORY_META) as OppCategory[]);
          const visibleCats =
            category === "all" ? cats : cats.filter((c) => c === category);
          const visibleTotal =
            visibleCats.reduce((a, c) => a + s.byCategory[c], 0) || 1;

          return (
            <li
              key={s.sector}
              onMouseEnter={() => onActivate(s.sector)}
              onMouseLeave={() => onActivate(null)}
              className="grid grid-cols-12 items-center gap-3 cursor-pointer"
            >
              <div className="col-span-12 sm:col-span-3 min-w-0">
                <div
                  className="text-[13px] truncate"
                  style={{
                    color: isActive ? "var(--policy-fg)" : "var(--policy-fg)",
                  }}
                >
                  {s.sector}
                </div>
                <div
                  className="text-[10px] font-mono mt-0.5"
                  style={{ color: var(--policy-fg-faint) }}
                >
                  {s.matchedYouth.toLocaleString()} matched · +{s.weeklyDelta}/wk
                </div>
              </div>

              <div className="col-span-12 sm:col-span-7">
                <div
                  className="h-7 w-full rounded-md flex overflow-hidden"
                  style={{
                    background: var(--policy-panel),
                    width: `${Math.max(8, pct)}%`,
                    minWidth: 80,
                    transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {visibleCats.map((c) => {
                    const v = s.byCategory[c];
                    const w = (v / visibleTotal) * 100;
                    if (w === 0) return null;
                    return (
                      <div
                        key={c}
                        title={`${CATEGORY_META[c].label}: ${v.toLocaleString()}`}
                        style={{
                          width: `${w}%`,
                          background: CATEGORY_META[c].color,
                          opacity: isActive ? 1 : 0.85,
                          transition: "opacity 200ms",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2">
                <span
                  className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(127,181,138,0.12)",
                    color: "rgba(127,181,138,0.95)",
                  }}
                  title="Fill rate"
                >
                  {s.fillRate}%
                </span>
                {s.gap > 0 && (
                  <span
                    className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(224,122,95,0.12)",
                      color: "rgba(224,122,95,0.95)",
                    }}
                    title="Unmet demand"
                  >
                    −{s.gap}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ====================================================================== */
/*  Program inventory                                                     */
/* ====================================================================== */
function ProgramInventory({
  programs,
  category,
}: {
  programs: ProgramRow[];
  category: "all" | OppCategory;
}) {
  const filtered =
    category === "all"
      ? programs
      : programs.filter((p) => p.category === category);

  return (
    <section
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
            Partner program inventory
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Live capacity vs. enrolment, by sector and region.
          </p>
        </div>
        <span
          className="text-[11px] font-mono"
          style={{ color: var(--policy-fg-muted) }}
        >
          {filtered.length} of {programs.length} shown
        </span>
      </header>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-[760px]">
          <thead>
            <tr style={{ color: var(--policy-fg-muted) }}>
              <Th>Program ID</Th>
              <Th>Program</Th>
              <Th>Category</Th>
              <Th>Sector</Th>
              <Th>Region</Th>
              <Th align="right">Capacity</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const fill = Math.round((p.filled / p.capacity) * 100);
              const cat = CATEGORY_META[p.category];
              return (
                <tr
                  key={p.id}
                  className="group"
                  style={{ background: var(--policy-panel) }}
                >
                  <Td mono>{p.id}</Td>
                  <Td>
                    <div
                      className="text-[13px]"
                      style={{ color: var(--policy-fg) }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="text-[10px] font-mono"
                      style={{ color: var(--policy-fg-faint) }}
                    >
                      {p.partner}
                    </div>
                  </Td>
                  <Td>
                    <span
                      className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5"
                      style={{
                        background: `${cat.color}1f`,
                        color: cat.color,
                        border: `1px solid ${cat.ring}`,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: cat.color }}
                      />
                      {cat.label}
                    </span>
                  </Td>
                  <Td>{p.sector}</Td>
                  <Td>{p.region}</Td>
                  <Td align="right">
                    <div
                      className="text-[11px] font-mono tabular-nums"
                      style={{ color: "var(--policy-fg)" }}
                    >
                      {p.filled}/{p.capacity}
                    </div>
                    <div
                      className="mt-1 h-1 rounded-full overflow-hidden"
                      style={{
                        background: var(--policy-panel-border),
                        width: 100,
                        marginLeft: "auto",
                      }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${fill}%`,
                          background:
                            fill > 90
                              ? "var(--signal-red, #E07A5F)"
                              : fill > 65
                                ? "var(--earth, #C4A882)"
                                : "rgba(127,181,138,0.95)",
                        }}
                      />
                    </div>
                  </Td>
                  <Td>
                    <span
                      className="text-[11px]"
                      style={{
                        color:
                          p.status === "Active"
                            ? "rgba(127,181,138,0.95)"
                            : p.status === "Onboarding"
                              ? "rgba(196,168,130,0.95)"
                              : var(--policy-fg-faint),
                      }}
                    >
                      ● {p.status}
                    </span>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--policy-fg)" }}
                    >
                      Open <ArrowRight size={12} strokeWidth={1.8} />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="text-[10px] uppercase tracking-[0.08em] font-medium px-2 pb-1"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  align = "left",
}: {
  children?: React.ReactNode;
  mono?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn("px-2 py-2 align-middle", mono && "font-mono text-[11px]")}
      style={{
        color: mono ? "var(--policy-fg)" : "var(--policy-fg)",
        textAlign: align,
      }}
    >
      {children}
    </td>
  );
}