import * as React from "react";
import { Copy, Check } from "lucide-react";

/* JsonPreview — sticky right-rail panel that renders the live config.json
 * with naive syntax highlighting (keys / strings / numbers / booleans).
 * No third-party highlighter dependency: keeps bundle small and avoids
 * a Worker-incompatible package landing in the SSR build. */

function highlight(json: string): React.ReactNode[] {
  // Tokenize: keys ("foo":), strings, numbers, booleans, null, punctuation.
  const re =
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|\b(-?\d+(?:\.\d+)?)\b|([{}\[\],])/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) {
      out.push(json.slice(last, m.index));
    }
    const [full, str, colon, kw, num, punct] = m;
    if (str !== undefined) {
      const isKey = colon !== undefined;
      out.push(
        <span
          key={i++}
          style={{
            color: isKey ? "var(--console-accent)" : "var(--earth-dark)",
          }}
        >
          {str}
        </span>,
      );
      if (colon) out.push(colon);
    } else if (kw !== undefined) {
      out.push(
        <span key={i++} style={{ color: "var(--signal-blue)" }}>
          {kw}
        </span>,
      );
    } else if (num !== undefined) {
      out.push(
        <span key={i++} style={{ color: "var(--signal-amber)" }}>
          {num}
        </span>,
      );
    } else if (punct !== undefined) {
      out.push(
        <span key={i++} style={{ color: "var(--console-fg-muted)" }}>
          {punct}
        </span>,
      );
    } else {
      out.push(full);
    }
    last = m.index + full.length;
  }
  if (last < json.length) out.push(json.slice(last));
  return out;
}

export function JsonPreview({ value }: { value: unknown }) {
  const [copied, setCopied] = React.useState(false);
  const json = React.useMemo(() => JSON.stringify(value, null, 2), [value]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <aside
      className="hidden lg:flex flex-col rounded-lg overflow-hidden sticky top-4"
      style={{
        width: 280,
        maxHeight: "calc(100vh - 8rem)",
        background: "var(--console-canvas)",
        border: "1px solid var(--console-border)",
      }}
      aria-label="Live config.json preview"
    >
      <header
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: "var(--console-border)" }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: "var(--console-fg-faint)" }}
          >
            Live
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: "var(--console-fg)" }}
          >
            config.json
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: copied ? "var(--console-success)" : "var(--console-panel-strong)",
            color: copied ? "#fff" : "var(--console-fg)",
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </header>
      <pre
        className="flex-1 overflow-auto p-3 m-0"
        style={{
          background: "var(--console-panel)",
          fontFamily: "var(--font-mono)",
          fontSize: 11.5,
          lineHeight: 1.55,
          color: "var(--console-fg)",
        }}
      >
        <code>{highlight(json)}</code>
      </pre>
    </aside>
  );
}