import * as React from "react";
import type { SignalCard } from "./dashboard-data";

function trendColor(t: SignalCard["trend"]) {
  if (t === "up-good" || t === "down-good") return "var(--signal-green)";
  if (t === "up-bad") return "var(--signal-red)";
  return "var(--signal-amber)";
}

export function SignalCards({ signals }: { signals: SignalCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {signals.map((s, i) => {
        const accent = trendColor(s.trend);
        return (
          <article
            key={s.label}
            className="rounded-2xl p-5 opacity-0 animate-rise-in"
            style={{
              background: var(--policy-panel),
              border: "1px solid var(--policy-panel-border)",
              borderLeft: `3px solid ${accent}`,
              animationDelay: `${i * 80}ms`,
              boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.08em] font-medium"
              style={{ color: var(--policy-fg-muted) }}
            >
              {s.label}
            </div>
            <div
              className="mt-2 tracking-tight leading-none"
              style={{ color: "var(--policy-fg)", fontSize: "36px" }}
            >
              {s.value}
            </div>
            <p
              className="mt-2 text-[12px] leading-snug"
              style={{ color: var(--policy-fg) }}
            >
              {s.caption}
            </p>
            <div
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] font-mono rounded-full px-2 py-0.5"
              style={{
                background: var(--policy-panel),
                color: var(--policy-fg-muted),
                border: "1px solid var(--policy-panel-strong)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: accent }}
              />
              {s.source}
            </div>
          </article>
        );
      })}
    </div>
  );
}