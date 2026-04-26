import * as React from "react";
import type { AutomationRow } from "./dashboard-data";

function riskToken(risk: number) {
  if (risk >= 70) return { color: "var(--signal-red)", dot: "🔴" };
  if (risk >= 40) return { color: "var(--signal-amber)", dot: "🟡" };
  return { color: "var(--signal-green)", dot: "🟢" };
}

export function AutomationList({ rows }: { rows: AutomationRow[] }) {
  return (
    <section
      aria-label="Automation exposure"
      className="rounded-2xl p-5 md:p-6 space-y-5"
      style={{
        background: "var(--policy-panel)",
        border: "1px solid var(--policy-panel-border)",
      }}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: "var(--policy-fg-muted)" }}
          >
            Automation exposure
          </h2>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "var(--policy-fg-faint)" }}
          >
            LMIC-calibrated · Frey-Osborne
          </p>
        </div>
      </header>

      <ul className="space-y-3">
        {rows.map((r) => {
          const { color, dot } = riskToken(r.risk);
          return (
            <li key={r.occupation}>
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span
                  className="text-[13px]"
                  style={{ color: "rgba(240,237,232,0.9)" }}
                >
                  {r.occupation}
                </span>
                <span
                  className="text-[12px] font-mono tabular-nums inline-flex items-center gap-1"
                  style={{ color: "var(--policy-fg)" }}
                >
                  <span aria-hidden>{dot}</span>
                  {r.risk}%
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "var(--policy-panel-border)" }}
                role="progressbar"
                aria-valuenow={r.risk}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${r.occupation} automation risk`}
              >
                <div
                  className="h-full transition-[width] duration-700 ease-precision"
                  style={{ width: `${r.risk}%`, background: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p
        className="text-[11px] leading-relaxed pt-2 border-t"
        style={{
          color: "var(--policy-fg-muted)",
          borderColor: "var(--policy-panel-border)",
        }}
      >
        Risk calibrated for LMIC context (lower capital intensity).
        Source: Frey &amp; Osborne + ILO task indices.
      </p>
    </section>
  );
}