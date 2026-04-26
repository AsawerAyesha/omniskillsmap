import * as React from "react";
import { Globe2, Radio, ChevronDown } from "lucide-react";
import { useLiveContext } from "@/hooks/use-live-context";

/* Compact pill that sits at the top of public dashboard pages.
 * - Hidden when no contexts are active (so the demo content still shows).
 * - When ≥1 active context exists, shows a select to switch between them. */

export function LiveContextPicker({ className }: { className?: string }) {
  const { loading, contexts, active, setActive } = useLiveContext();

  if (loading) return null;
  if (!active || contexts.length === 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${className ?? ""}`}
      style={{
        background: "var(--background)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <span
        className="inline-flex items-center gap-1 font-medium uppercase tracking-wider"
        style={{ color: "var(--primary, #16a34a)" }}
      >
        <Radio size={11} className="animate-pulse" /> Live
      </span>
      <span style={{ color: "var(--muted-foreground)" }}>·</span>
      <Globe2 size={12} style={{ color: "var(--muted-foreground)" }} />
      <div className="relative inline-flex items-center">
        <select
          value={active.code}
          onChange={(e) => setActive(e.target.value)}
          className="appearance-none bg-transparent pr-5 text-xs font-medium focus:outline-none cursor-pointer"
          style={{ color: "var(--foreground)" }}
        >
          {contexts.map((c) => (
            <option key={c.id} value={c.code}>
              {c.flag_emoji ?? "🌐"} {c.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          className="pointer-events-none absolute right-0"
          style={{ color: "var(--muted-foreground)" }}
        />
      </div>
    </div>
  );
}