import * as React from "react";
import { QUINTILES, type HeatmapRow } from "./dashboard-data";

interface Props {
  rows: HeatmapRow[];
}

export function SkillsHeatmap({ rows }: Props) {
  const max = React.useMemo(
    () => Math.max(...rows.flatMap((r) => r.cells)),
    [rows],
  );
  const totals = React.useMemo(
    () => rows.map((r) => r.cells.reduce((a, b) => a + b, 0)),
    [rows],
  );

  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--policy-panel)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-4">
        <h2
          className="text-[12px] uppercase tracking-[0.08em] font-medium"
          style={{ color: "var(--policy-fg-muted)" }}
        >
          Skills gap by occupation cluster
        </h2>
        <span
          className="text-[10px] uppercase tracking-[0.08em] font-mono"
          style={{ color: "var(--policy-fg-faint)" }}
        >
          Demand quintile →
        </span>
      </header>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-left border-separate border-spacing-1 min-w-[560px]">
          <thead>
            <tr>
              <th className="w-[180px]" />
              {QUINTILES.map((q) => (
                <th
                  key={q}
                  scope="col"
                  className="text-[11px] font-medium pb-2 text-center"
                  style={{ color: "var(--policy-fg-muted)" }}
                >
                  {q}
                </th>
              ))}
              <th
                scope="col"
                className="text-[11px] font-mono uppercase tracking-[0.06em] pb-2 text-right pr-1"
                style={{ color: "var(--policy-fg-faint)" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.cluster}>
                <th
                  scope="row"
                  className="text-[12px] font-medium pr-3 text-left"
                  style={{ color: "var(--policy-fg)" }}
                >
                  {r.cluster}
                </th>
                {r.cells.map((v, ci) => {
                  const intensity = v / max;
                  const pct = Math.round(
                    (v / r.cells.reduce((a, b) => a + b, 0)) * 100,
                  );
                  return (
                    <td key={ci} className="p-0">
                      <div
                        title={`${r.cluster} · ${QUINTILES[ci]}: ${v} profiles (${pct}%)`}
                        className="h-9 w-full rounded-md transition-transform duration-200 hover:scale-[1.06] cursor-pointer flex items-center justify-center"
                        style={{
                          background: `color-mix(in oklab, var(--earth) ${
                            10 + intensity * 85
                          }%, transparent)`,
                          border: "1px solid var(--policy-panel)",
                        }}
                      >
                        <span
                          className="text-[10px] font-mono tabular-nums"
                          style={{
                            color:
                              intensity > 0.45
                                ? "rgba(20,18,15,0.85)"
                                : "var(--policy-fg)",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    </td>
                  );
                })}
                <td
                  className="text-right pr-1 text-[12px] font-mono tabular-nums"
                  style={{ color: "var(--policy-fg)" }}
                >
                  {totals[ri]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="mt-3 text-[11px]"
        style={{ color: "var(--policy-fg-faint)" }}
      >
        Cells show profile counts. Colour intensity scales to the maximum cell
        in this view. Hover for details.
      </p>
    </div>
  );
}