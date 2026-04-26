import * as React from "react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BAND_META,
  TASK_META,
  type RiskBand,
  type RiskDataset,
  type RiskOccupation,
  type TaskMix,
} from "./risk-data";

interface Props {
  data: RiskDataset;
}

/* ──────────────────────────────────────────────────────────────────────
 * Automation Risk board
 *  Top    : Exposure spectrum (SVG) — every occupation as a bubble on a
 *           0-100 risk axis, bubble size = exposed workers, color = band.
 *           Band-totals live above the axis.
 *  Middle : Selected occupation detail — task decomposition stacked bar,
 *           5-year trend, why-it's-at-risk rationale, pivot pathways.
 *  Bottom : Risk register — sortable table fallback.
 * ────────────────────────────────────────────────────────────────────── */
export function RiskBoard({ data }: Props) {
  const [selectedIsco, setSelectedIsco] = React.useState<string>(
    data.occupations[0]?.isco ?? "",
  );
  /* Reset selection when the dataset (country) changes */
  React.useEffect(() => {
    setSelectedIsco(data.occupations[0]?.isco ?? "");
  }, [data]);

  const selected =
    data.occupations.find((o) => o.isco === selectedIsco) ??
    data.occupations[0];

  return (
    <div className="space-y-6">
      <ExposureSpectrum
        data={data}
        selectedIsco={selectedIsco}
        onSelect={setSelectedIsco}
      />

      {selected && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <OccupationDetail occ={selected} />
          </div>
          <div className="lg:col-span-5">
            <PivotPathways occ={selected} />
          </div>
        </div>
      )}

      <RiskRegister
        rows={data.occupations}
        selectedIsco={selectedIsco}
        onSelect={setSelectedIsco}
      />
    </div>
  );
}

/* ====================================================================== */
/*  Exposure spectrum                                                     */
/* ====================================================================== */
function ExposureSpectrum({
  data,
  selectedIsco,
  onSelect,
}: {
  data: RiskDataset;
  selectedIsco: string;
  onSelect: (isco: string) => void;
}) {
  const W = 1080;
  const H = 240;
  const PAD = { l: 56, r: 24, t: 56, b: 56 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const maxExposed = Math.max(...data.occupations.map((o) => o.exposedWorkers), 1);

  /* Distribute bubbles vertically with a gentle jitter so overlapping
   * occupations stay readable. Deterministic from ISCO code. */
  function jitter(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return (h % 100) / 100; // 0..1
  }

  const bubbles = data.occupations.map((o) => {
    const x = PAD.l + (o.risk / 100) * innerW;
    const y = PAD.t + 20 + jitter(o.isco) * (innerH - 40);
    const r = 8 + Math.sqrt(o.exposedWorkers) * 0.9;
    return { o, x, y, r };
  });

  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--policy-panel)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: "var(--policy-fg-muted)" }}
          >
            Exposure spectrum
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "var(--policy-fg-faint)" }}
          >
            Each bubble is an occupation in the cohort. Size = workers exposed,
            colour = risk band. Click to inspect.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {(Object.keys(BAND_META) as RiskBand[]).map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 text-[11px]"
              style={{ color: "var(--policy-fg)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: BAND_META[b].color }}
              />
              {BAND_META[b].label}
              <span
                className="font-mono"
                style={{ color: "var(--policy-fg-faint)" }}
              >
                · {BAND_META[b].range}
              </span>
            </span>
          ))}
        </div>
      </header>

      <div className="w-full overflow-hidden">
        <svg
          role="img"
          aria-label="Automation exposure spectrum"
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="riskGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(127,181,138,0.18)" />
              <stop offset="35%" stopColor="rgba(124,158,178,0.18)" />
              <stop offset="65%" stopColor="rgba(196,168,130,0.18)" />
              <stop offset="100%" stopColor="rgba(224,122,95,0.22)" />
            </linearGradient>
          </defs>

          {/* Risk-band background strip */}
          <rect
            x={PAD.l}
            y={PAD.t + 8}
            width={innerW}
            height={innerH - 16}
            rx={10}
            fill="url(#riskGradient)"
          />

          {/* Band dividers (25 / 50 / 70) */}
          {[25, 50, 70].map((t) => {
            const x = PAD.l + (t / 100) * innerW;
            return (
              <line
                key={t}
                x1={x}
                x2={x}
                y1={PAD.t + 8}
                y2={PAD.t + innerH - 8}
                stroke="var(--policy-panel-border)"
                strokeDasharray="3 4"
              />
            );
          })}

          {/* Band totals — counts of occupations per band */}
          {(Object.keys(BAND_META) as RiskBand[]).map((b) => {
            const ranges: Record<RiskBand, [number, number]> = {
              low: [0, 24],
              moderate: [25, 49],
              elevated: [50, 69],
              high: [70, 100],
            };
            const [lo, hi] = ranges[b];
            const cx = PAD.l + ((lo + hi) / 2 / 100) * innerW;
            const summary = data.bandSummary[b];
            return (
              <g key={b}>
                <text
                  x={cx}
                  y={PAD.t - 28}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  fill={BAND_META[b].color}
                >
                  {BAND_META[b].label.toUpperCase()}
                </text>
                <text
                  x={cx}
                  y={PAD.t - 12}
                  textAnchor="middle"
                  fontSize="13"
                  fontFamily="ui-sans-serif, system-ui"
                  fill="var(--policy-fg)"
                >
                  {summary.workers.toLocaleString()}
                  <tspan
                    fill="var(--policy-fg-faint)"
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                  >
                    {"  "}
                    · {summary.count} occ.
                  </tspan>
                </text>
              </g>
            );
          })}

          {/* Axis */}
          <line
            x1={PAD.l}
            x2={PAD.l + innerW}
            y1={PAD.t + innerH}
            y2={PAD.t + innerH}
            stroke="var(--policy-grid-strong)"
          />
          {[0, 25, 50, 70, 100].map((t) => {
            const x = PAD.l + (t / 100) * innerW;
            return (
              <g key={t}>
                <line
                  x1={x}
                  x2={x}
                  y1={PAD.t + innerH}
                  y2={PAD.t + innerH + 4}
                  stroke="var(--policy-grid-strong)"
                />
                <text
                  x={x}
                  y={PAD.t + innerH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fill="var(--policy-fg-muted)"
                >
                  {t}%
                </text>
              </g>
            );
          })}
          <text
            x={PAD.l + innerW / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fill="var(--policy-fg-muted)"
          >
            Probability of automation in 10 years →
          </text>

          {/* Bubbles */}
          {bubbles.map(({ o, x, y, r }) => {
            const meta = BAND_META[o.band];
            const active = selectedIsco === o.isco;
            return (
              <g
                key={o.isco}
                onClick={() => onSelect(o.isco)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={`${meta.color}33`}
                  stroke={meta.color}
                  strokeWidth={active ? 2.4 : 1.2}
                  style={{
                    transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                    filter: active
                      ? `drop-shadow(0 0 14px ${meta.color}cc)`
                      : "none",
                  }}
                />
                {active && (
                  <text
                    x={x}
                    y={y - r - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                    fill="var(--policy-fg)"
                  >
                    {o.title}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

/* ====================================================================== */
/*  Occupation detail                                                     */
/* ====================================================================== */
function OccupationDetail({ occ }: { occ: RiskOccupation }) {
  const meta = BAND_META[occ.band];
  const taskKeys = Object.keys(TASK_META) as Array<keyof TaskMix>;
  const total = taskKeys.reduce((a, k) => a + occ.tasks[k], 0) || 100;

  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--policy-panel)",
        border: `1px solid ${meta.ring}`,
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p
            className="text-[10px] font-mono uppercase tracking-[0.08em] mb-1"
            style={{ color: "var(--policy-fg-faint)" }}
          >
            {occ.isco} · {occ.cluster}
          </p>
          <h2 className="text-[20px] tracking-tight leading-tight">
            {occ.title}
          </h2>
        </div>
        <div className="text-right">
          <div
            className="text-[10px] uppercase tracking-[0.08em]"
            style={{ color: "var(--policy-fg-muted)" }}
          >
            Risk band
          </div>
          <div
            className="text-[28px] leading-none tabular-nums mt-1"
            style={{ color: meta.color }}
          >
            {occ.risk}%
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: meta.color }}
          >
            {meta.label} · {meta.range}
          </div>
        </div>
      </header>

      {/* Task decomposition */}
      <div className="mb-4">
        <div
          className="text-[10px] uppercase tracking-[0.06em] mb-1.5"
          style={{ color: "var(--policy-fg-faint)" }}
        >
          Task decomposition
        </div>
        <div
          className="h-3 w-full rounded-md flex overflow-hidden"
          style={{ background: "var(--policy-panel-border)" }}
        >
          {taskKeys.map((k) => {
            const w = (occ.tasks[k] / total) * 100;
            return (
              <div
                key={k}
                title={`${TASK_META[k].label}: ${occ.tasks[k]}%`}
                style={{
                  width: `${w}%`,
                  background: TASK_META[k].color,
                  transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            );
          })}
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          {taskKeys.map((k) => (
            <li
              key={k}
              className="text-[11px] flex items-center justify-between gap-2"
            >
              <span
                className="inline-flex items-center gap-1.5 min-w-0"
                style={{ color: "var(--policy-fg)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: TASK_META[k].color }}
                />
                <span className="truncate">{TASK_META[k].label}</span>
              </span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--policy-fg-muted)" }}
              >
                {occ.tasks[k]}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cohort + trend */}
      <div
        className="grid grid-cols-2 gap-3 pt-3 border-t"
        style={{ borderColor: "var(--policy-panel-border)" }}
      >
        <Stat
          label="Workers exposed"
          value={occ.exposedWorkers.toLocaleString()}
          sub="in cohort"
        />
        <Stat
          label="5-year risk trend"
          value={`${occ.trend5y > 0 ? "+" : ""}${occ.trend5y} pp`}
          sub={occ.trend5y > 0 ? "rising" : occ.trend5y < 0 ? "falling" : "stable"}
          tone={occ.trend5y > 2 ? "bad" : occ.trend5y < 0 ? "good" : "neutral"}
        />
      </div>

      {/* Rationale */}
      <p
        className="mt-4 text-[12px] leading-relaxed"
        style={{ color: "var(--policy-fg)" }}
      >
        <span
          className="font-mono uppercase text-[10px] tracking-[0.08em] mr-2"
          style={{ color: meta.color }}
        >
          Why
        </span>
        {occ.rationale}
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "good"
      ? "rgba(127,181,138,0.95)"
      : tone === "bad"
        ? "rgba(224,122,95,0.95)"
        : "var(--policy-fg)";
  const Icon = tone === "good" ? TrendingDown : tone === "bad" ? TrendingUp : null;
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{ background: "var(--policy-panel)" }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.06em]"
        style={{ color: "var(--policy-fg-muted)" }}
      >
        {label}
      </div>
      <div
        className="text-[18px] leading-none mt-1 tabular-nums inline-flex items-center gap-1.5"
        style={{ color }}
      >
        {Icon && <Icon size={14} strokeWidth={2} />}
        {value}
      </div>
      <div
        className="text-[10px] mt-0.5"
        style={{ color: "var(--policy-fg-faint)" }}
      >
        {sub}
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  Pivot pathways                                                        */
/* ====================================================================== */
function PivotPathways({ occ }: { occ: RiskOccupation }) {
  const fromMeta = BAND_META[occ.band];
  return (
    <section
      className="rounded-2xl p-5 md:p-6 h-full"
      style={{
        background: "var(--policy-panel)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="mb-4">
        <h2
          className="text-[12px] uppercase tracking-[0.08em] font-medium"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Mitigation pathways
        </h2>
        <p
          className="mt-1 text-[11px]"
          style={{ color: "var(--policy-fg-faint)" }}
        >
          Adjacent occupations with overlapping skills and lower exposure.
        </p>
      </header>

      {/* Origin */}
      <div
        className="rounded-lg px-3 py-2 mb-3 inline-flex items-center gap-2 text-[12px]"
        style={{
          background: `${fromMeta.color}1f`,
          border: `1px solid ${fromMeta.ring}`,
          color: "var(--policy-fg)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: fromMeta.color }}
        />
        From: {occ.title}
        <span
          className="font-mono tabular-nums"
          style={{ color: fromMeta.color }}
        >
          {occ.risk}%
        </span>
      </div>

      <ol className="space-y-2">
        {occ.pivots.map((p, i) => (
          <li
            key={p}
            className="rounded-lg p-3 flex items-center gap-3"
            style={{
              background: "var(--policy-panel)",
              border: "1px solid var(--policy-panel-strong)",
            }}
          >
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0"
              style={{
                background: "rgba(127,181,138,0.18)",
                color: "rgba(127,181,138,0.95)",
                border: "1px solid rgba(127,181,138,0.35)",
              }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="text-[13px]"
                style={{ color: "var(--policy-fg)" }}
              >
                {p}
              </div>
              <div
                className="text-[10px] font-mono mt-0.5"
                style={{ color: "var(--policy-fg-faint)" }}
              >
                Overlap on interpersonal &amp; non-routine cognitive tasks
              </div>
            </div>
            <ArrowRight
              size={14}
              strokeWidth={1.8}
              style={{ color: "var(--policy-fg-muted)" }}
            />
          </li>
        ))}
      </ol>

      <p
        className="text-[11px] leading-relaxed mt-4 pt-3 border-t"
        style={{
          color: "var(--policy-fg-muted)",
          borderColor: "var(--policy-panel-border)",
        }}
      >
        Pathways are derived from ESCO skill-overlap ≥ 0.45 and a target band
        of moderate risk or lower.
      </p>
    </section>
  );
}

/* ====================================================================== */
/*  Risk register                                                         */
/* ====================================================================== */
function RiskRegister({
  rows,
  selectedIsco,
  onSelect,
}: {
  rows: RiskOccupation[];
  selectedIsco: string;
  onSelect: (isco: string) => void;
}) {
  return (
    <section
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--policy-panel)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: "var(--policy-fg-muted)" }}
          >
            Risk register
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "var(--policy-fg-faint)" }}
          >
            Click a row to inspect above.
          </p>
        </div>
        <span
          className="text-[11px] font-mono"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          {rows.length} occupations
        </span>
      </header>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-[680px]">
          <thead>
            <tr style={{ color: "var(--policy-fg-muted)" }}>
              <Th>ISCO</Th>
              <Th>Occupation</Th>
              <Th>Cluster</Th>
              <Th align="right">Workers</Th>
              <Th align="right">Risk</Th>
              <Th align="right">5y trend</Th>
              <Th>Band</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const meta = BAND_META[r.band];
              const isActive = selectedIsco === r.isco;
              return (
                <tr
                  key={r.isco}
                  onClick={() => onSelect(r.isco)}
                  className={cn(
                    "cursor-pointer transition-colors",
                  )}
                  style={{
                    background: isActive
                      ? "var(--policy-panel-border)"
                      : "var(--policy-panel)",
                    outline: isActive ? `1px solid ${meta.ring}` : "none",
                  }}
                >
                  <Td mono>{r.isco}</Td>
                  <Td>{r.title}</Td>
                  <Td>{r.cluster}</Td>
                  <Td align="right" mono>
                    {r.exposedWorkers.toLocaleString()}
                  </Td>
                  <Td align="right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <div
                        className="h-1 rounded-full overflow-hidden shrink-0"
                        style={{
                          background: "var(--policy-panel-border)",
                          width: 80,
                        }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${r.risk}%`,
                            background: meta.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-mono tabular-nums w-9 text-right"
                        style={{ color: meta.color }}
                      >
                        {r.risk}%
                      </span>
                    </div>
                  </Td>
                  <Td align="right" mono>
                    <span
                      style={{
                        color:
                          r.trend5y > 2
                            ? "rgba(224,122,95,0.95)"
                            : r.trend5y < 0
                              ? "rgba(127,181,138,0.95)"
                              : "var(--policy-fg)",
                      }}
                    >
                      {r.trend5y > 0 ? "+" : ""}
                      {r.trend5y} pp
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5"
                      style={{
                        background: `${meta.color}1f`,
                        color: meta.color,
                        border: `1px solid ${meta.ring}`,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: meta.color }}
                      />
                      {meta.label}
                    </span>
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
