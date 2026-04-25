import * as React from "react";
import { Check, Copy } from "lucide-react";
import type { ContextConfig } from "./types";

/* Tiny JSON syntax highlighter — no external lib.
 * Earth color for strings, ink-secondary for keys. */
function highlight(json: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) {
      tokens.push(
        <span key={`p${i++}`} style={{ color: "var(--ink-tertiary)" }}>
          {json.slice(last, m.index)}
        </span>,
      );
    }
    if (m[1] && m[2]) {
      // key
      tokens.push(
        <span key={`k${i++}`} style={{ color: "var(--ink-secondary)" }}>
          {m[1]}
        </span>,
      );
      tokens.push(
        <span key={`c${i++}`} style={{ color: "var(--ink-tertiary)" }}>
          {m[2]}
        </span>,
      );
    } else if (m[1]) {
      // string value
      tokens.push(
        <span key={`s${i++}`} style={{ color: "var(--earth-dark)" }}>
          {m[1]}
        </span>,
      );
    } else if (m[3]) {
      // boolean / null
      tokens.push(
        <span key={`b${i++}`} style={{ color: "var(--signal-blue)" }}>
          {m[3]}
        </span>,
      );
    } else if (m[4]) {
      // number
      tokens.push(
        <span key={`n${i++}`} style={{ color: "var(--signal-green)" }}>
          {m[4]}
        </span>,
      );
    }
    last = re.lastIndex;
  }
  if (last < json.length) {
    tokens.push(
      <span key={`p${i++}`} style={{ color: "var(--ink-tertiary)" }}>
        {json.slice(last)}
      </span>,
    );
  }
  return tokens;
}

function toJson(cfg: ContextConfig): string {
  // explicit ordering matches the spec
  const ordered = {
    context_id: cfg.context_id,
    country: cfg.country,
    region_type: cfg.region_type,
    language: cfg.language,
    data_sources: cfg.data_sources,
    automation_calibration: Number(cfg.automation_calibration.toFixed(2)),
    opportunity_types: cfg.opportunity_types,
    wage_vintage: cfg.wage_vintage,
  };
  return JSON.stringify(ordered, null, 2);
}

export function JsonPreview({ config }: { config: ContextConfig }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const json = React.useMemo(() => toJson(config), [config]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="border-t border-border-subtle bg-surface-sunken/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-5 py-3 flex items-center justify-between text-[12px] uppercase tracking-[0.08em] font-medium text-ink-tertiary hover:text-ink-secondary transition-colors"
      >
        <span>Config as JSON</span>
        <span className="text-[11px] font-mono normal-case tracking-normal">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="relative rounded-lg border border-border-subtle bg-surface-raised">
            <button
              type="button"
              onClick={copy}
              className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface-raised px-2 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-sunken transition-colors"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-signal-green" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy JSON
                </>
              )}
            </button>
            <pre className="text-[12px] leading-relaxed font-mono p-3 overflow-x-auto whitespace-pre">
              <code>{highlight(json)}</code>
            </pre>
          </div>
          <p className="mt-2 text-[11px] text-ink-tertiary">
            This is the actual config the matching pipeline reads — not hard-coded UI.
          </p>
        </div>
      )}
    </div>
  );
}