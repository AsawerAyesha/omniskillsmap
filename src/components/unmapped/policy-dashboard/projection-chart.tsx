import * as React from "react";
import type { ProjectionPoint } from "./dashboard-data";

interface Props {
  points: ProjectionPoint[];
  nowYear?: number;
}

/* Lightweight inline-SVG line chart — three series in earth family.
 * No chart lib needed; keeps the dashboard fast and bundle small. */
export function ProjectionChart({ points, nowYear = 2026 }: Props) {
  const W = 640;
  const H = 220;
  const PAD = { top: 16, right: 24, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xs = points.map((p) => p.year);
  const xMin = Math.min(...xs, nowYear);
  const xMax = Math.max(...xs, nowYear);
  const yMax = 60; // % of youth population (chosen for headroom)
  const yTicks = [0, 15, 30, 45, 60];

  const x = (year: number) =>
    PAD.left + ((year - xMin) / (xMax - xMin)) * innerW;
  const y = (val: number) =>
    PAD.top + (1 - val / yMax) * innerH;

  const series: {
    key: keyof Omit<ProjectionPoint, "year">;
    label: string;
    color: string;
    width: number;
  }[] = [
    { key: "secondary", label: "Secondary", color: "var(--earth)",      width: 2 },
    { key: "tertiary",  label: "Tertiary",  color: "var(--earth-dark)", width: 2 },
    { key: "none",      label: "No education", color: "var(--earth-light)", width: 1.5 },
  ];

  const path = (k: keyof Omit<ProjectionPoint, "year">) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${y(p[k])}`)
      .join(" ");

  const nowX = x(nowYear);

  return (
    <section
      aria-label="Education level projections"
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: var(--policy-panel),
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: var(--policy-fg-muted) }}
          >
            Education level projections 2025–2035
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: var(--policy-fg-faint) }}
          >
            Wittgenstein Centre · % of youth population
          </p>
        </div>
        <ul className="hidden sm:flex items-center gap-4">
          {series.map((s) => (
            <li
              key={s.key}
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: var(--policy-fg) }}
            >
              <span
                className="inline-block h-[2px] w-4 rounded"
                style={{ background: s.color }}
              />
              {s.label}
            </li>
          ))}
        </ul>
      </header>

      <div className="overflow-x-auto -mx-1 px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[220px]"
          role="img"
          aria-label="Three education level projections from 2025 to 2035"
        >
          {/* y-axis grid + labels */}
          {yTicks.map((t) => {
            const yy = y(t);
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={yy}
                  y2={yy}
                  stroke=var(--policy-panel-border)
                  strokeDasharray={t === 0 ? "0" : "2 4"}
                />
                <text
                  x={PAD.left - 6}
                  y={yy + 3}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fill=var(--policy-fg-faint)
                >
                  {t}%
                </text>
              </g>
            );
          })}

          {/* x-axis labels */}
          {points.map((p) => (
            <text
              key={p.year}
              x={x(p.year)}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fill=var(--policy-fg-muted)
            >
              {p.year}
            </text>
          ))}

          {/* "now" annotation line */}
          <line
            x1={nowX}
            x2={nowX}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke=var(--policy-fg-faint)
            strokeDasharray="3 3"
          />
          <text
            x={nowX + 4}
            y={PAD.top + 10}
            fontSize="10"
            fontFamily="DM Sans, sans-serif"
            fill=var(--policy-fg)
          >
            {nowYear} (now)
          </text>

          {/* lines */}
          {series.map((s) => (
            <g key={s.key}>
              <path
                d={path(s.key)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 800,
                  strokeDashoffset: 800,
                  animation: "policy-line-draw 900ms cubic-bezier(0.16,1,0.3,1) forwards",
                }}
              />
              {points.map((p) => (
                <circle
                  key={`${s.key}-${p.year}`}
                  cx={x(p.year)}
                  cy={y(p[s.key])}
                  r={2.5}
                  fill={s.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* mobile legend */}
      <ul className="sm:hidden flex flex-wrap items-center gap-3 mt-2">
        {series.map((s) => (
          <li
            key={s.key}
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: var(--policy-fg) }}
          >
            <span className="inline-block h-[2px] w-4 rounded" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>

      <style>{`@keyframes policy-line-draw { to { stroke-dashoffset: 0; } }`}</style>
    </section>
  );
}