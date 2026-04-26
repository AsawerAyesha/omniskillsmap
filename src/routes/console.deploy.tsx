import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Loader2,
  Globe,
  Code2,
  Plug,
  Webhook,
  ChevronDown,
  ChevronRight,
  Plus,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";

/* C5 — Deploy & embed.
 *
 * Operator publishes a configured context and receives the integration
 * artifacts (hosted URL + QR, embed snippet, API key, webhook). Pre-deploy
 * shows a readiness checklist that surfaces gaps; post-deploy reveals the
 * artifact tabs. A multi-context table at the bottom lets operators jump
 * between deployments. */

export const Route = createFileRoute("/console/deploy")({
  component: () => (
    <ConsoleGuard>
      <DeployScreen />
    </ConsoleGuard>
  ),
});

/* ─── Page ─────────────────────────────────────────────────────────── */

type DeployPhase = "idle" | "deploying" | "live";

const PROGRESS_STEPS = [
  "Validating configuration…",
  "Loading ILO data for Ghana…",
  "Building skills taxonomy index…",
  "Generating embeddings…",
  "Context live!",
];

function DeployScreen() {
  const [phase, setPhase] = React.useState<DeployPhase>("idle");
  const [progress, setProgress] = React.useState(0);
  const [stepIdx, setStepIdx] = React.useState(0);

  const startDeploy = () => {
    setPhase("deploying");
    setProgress(0);
    setStepIdx(0);

    const totalDuration = 4500;
    const tickMs = 60;
    const start = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);
      const idx = Math.min(
        PROGRESS_STEPS.length - 1,
        Math.floor((pct / 100) * PROGRESS_STEPS.length),
      );
      setStepIdx(idx);
      if (pct >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase("live"), 350);
      }
    }, tickMs);
  };

  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto pb-16">
      <header>
        <h1 className="font-display text-[28px] leading-tight tracking-tight">
          Deploy your context
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--console-fg-muted)" }}
        >
          Publish <span style={{ color: "var(--console-fg)" }} className="font-medium">Ghana Urban 2024</span> and get the integration artifacts to embed OmniSkill.
        </p>
      </header>

      {phase !== "live" && <ReadinessBanner />}

      {phase === "idle" && <PreDeploy onDeploy={startDeploy} />}
      {phase === "deploying" && <DeployingPanel progress={progress} stepIdx={stepIdx} />}
      {phase === "live" && <DeploymentArtifacts />}

      <MultiContextTable />
    </div>
  );
}

/* ─── Banners & checklist ──────────────────────────────────────────── */

function ReadinessBanner() {
  // For demo: ready (no blocking issues).
  return (
    <div
      className="mt-6 rounded-lg border px-4 py-3 flex items-start gap-3"
      style={{
        borderColor: "color-mix(in oklab, var(--signal-green) 40%, transparent)",
        background: "color-mix(in oklab, var(--signal-green) 6%, transparent)",
      }}
    >
      <CheckCircle2 size={18} style={{ color: "var(--signal-green)" }} className="shrink-0 mt-0.5" />
      <div className="text-sm">
        <span className="font-medium">Ghana Urban 2024 is ready to deploy.</span>{" "}
        <span style={{ color: "var(--console-fg-muted)" }}>
          All required data is connected and taxonomy is mapped.
        </span>
      </div>
    </div>
  );
}

interface ChecklistItem {
  status: "ok" | "warn" | "fail";
  label: string;
  meta: string;
  fixTo?: string;
}

const CHECKLIST: ChecklistItem[] = [
  { status: "ok", label: "Context configuration", meta: "Complete" },
  { status: "ok", label: "Labor market data (ILO ILOSTAT)", meta: "847 records · vintage 2024" },
  { status: "ok", label: "Education taxonomy", meta: "8 credentials mapped" },
  { status: "ok", label: "ISCO occupation mapping", meta: "20 titles mapped" },
  { status: "warn", label: "Automation calibration", meta: "Using defaults" },
  { status: "ok", label: "Opportunity types configured", meta: "4 types active" },
];

function PreDeploy({ onDeploy }: { onDeploy: () => void }) {
  return (
    <section className="mt-6">
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <div
          className="px-4 py-3 border-b text-xs font-medium uppercase tracking-[0.08em]"
          style={{
            borderColor: "var(--console-rule)",
            color: "var(--console-fg-muted)",
            background: "var(--console-panel)",
          }}
        >
          Deployment checklist
        </div>
        <ul>
          {CHECKLIST.map((c, i) => (
            <li
              key={c.label}
              className={`px-4 py-3 flex items-center gap-3 ${
                i > 0 ? "border-t" : ""
              }`}
              style={{ borderColor: "var(--console-rule)" }}
            >
              <ChecklistIcon status={c.status} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.label}</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--console-fg-muted)" }}
                >
                  {c.meta}
                </div>
              </div>
              {c.status !== "ok" && (
                <button
                  type="button"
                  className="text-xs underline-offset-2 hover:underline"
                  style={{ color: "var(--console-accent)" }}
                >
                  Review
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onDeploy}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 rounded-md font-medium text-sm transition-colors"
        style={{
          background: "var(--console-accent)",
          color: "var(--console-accent-fg)",
        }}
      >
        <Rocket size={16} />
        Deploy context
      </button>
      <div
        className="mt-2 text-center text-xs"
        style={{ color: "var(--console-fg-faint)" }}
      >
        Estimated deployment time: ~30 seconds
      </div>
    </section>
  );
}

function ChecklistIcon({ status }: { status: ChecklistItem["status"] }) {
  if (status === "ok") {
    return (
      <CheckCircle2
        size={16}
        style={{ color: "var(--signal-green)" }}
        className="shrink-0"
      />
    );
  }
  if (status === "warn") {
    return (
      <Info
        size={16}
        style={{ color: "var(--signal-amber)" }}
        className="shrink-0"
      />
    );
  }
  return (
    <AlertTriangle
      size={16}
      style={{ color: "var(--console-danger)" }}
      className="shrink-0"
    />
  );
}

/* ─── Deploying panel ──────────────────────────────────────────────── */

function DeployingPanel({
  progress,
  stepIdx,
}: {
  progress: number;
  stepIdx: number;
}) {
  return (
    <section className="mt-6">
      <div
        className="rounded-lg border p-6 text-center"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <Loader2
          size={24}
          className="mx-auto animate-spin mb-3"
          style={{ color: "var(--console-accent)" }}
        />
        <div className="text-sm font-medium">Deploying Ghana Urban 2024</div>
        <div
          className="mt-1 text-xs h-4 transition-opacity"
          style={{ color: "var(--console-fg-muted)" }}
        >
          {PROGRESS_STEPS[stepIdx]}
        </div>
        <div
          className="mt-4 mx-auto max-w-md h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--console-panel-strong)" }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${progress}%`,
              background: "var(--console-accent)",
            }}
          />
        </div>
        <div
          className="mt-2 text-[11px] font-mono"
          style={{ color: "var(--console-fg-faint)" }}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </section>
  );
}

/* ─── Live artifacts ───────────────────────────────────────────────── */

type ArtifactTab = "url" | "embed" | "api" | "webhook";

function DeploymentArtifacts() {
  const [tab, setTab] = React.useState<ArtifactTab>("url");

  return (
    <section className="mt-6">
      <div
        className="rounded-lg border px-4 py-3 flex items-center gap-3 mb-4"
        style={{
          borderColor: "color-mix(in oklab, var(--signal-green) 40%, transparent)",
          background: "color-mix(in oklab, var(--signal-green) 6%, transparent)",
        }}
      >
        <CheckCircle2 size={18} style={{ color: "var(--signal-green)" }} className="shrink-0" />
        <div className="text-sm">
          <span className="font-medium">Context live.</span>{" "}
          <span style={{ color: "var(--console-fg-muted)" }}>
            Deployed in 28s · v1.0.0
          </span>
        </div>
        <a
          href="https://unmapped.app/c/gha-urban-2024"
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--console-accent)" }}
        >
          Open live context
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 border-b overflow-x-auto"
        style={{ borderColor: "var(--console-border)" }}
      >
        <ArtifactTabBtn icon={Globe} label="Hosted URL" active={tab === "url"} onClick={() => setTab("url")} />
        <ArtifactTabBtn icon={Code2} label="Embed snippet" active={tab === "embed"} onClick={() => setTab("embed")} />
        <ArtifactTabBtn icon={Plug} label="API access" active={tab === "api"} onClick={() => setTab("api")} />
        <ArtifactTabBtn icon={Webhook} label="Webhook" active={tab === "webhook"} onClick={() => setTab("webhook")} />
      </div>

      <div
        className="rounded-b-lg border border-t-0 p-5"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        {tab === "url" && <TabUrl />}
        {tab === "embed" && <TabEmbed />}
        {tab === "api" && <TabApi />}
        {tab === "webhook" && <TabWebhook />}
      </div>
    </section>
  );
}

function ArtifactTabBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs rounded-t-md border-b-2 -mb-px transition-colors whitespace-nowrap"
      style={{
        borderColor: active ? "var(--console-accent)" : "transparent",
        color: active ? "var(--console-fg)" : "var(--console-fg-muted)",
        fontWeight: active ? 500 : 400,
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

/* ─── Tab 1: Hosted URL ────────────────────────────────────────────── */

function TabUrl() {
  const url = "https://unmapped.app/c/gha-urban-2024";
  const [advanced, setAdvanced] = React.useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
      <div className="min-w-0 space-y-4">
        <div>
          <Label>Public URL</Label>
          <div className="mt-1 flex gap-2">
            <code
              className="flex-1 font-mono text-[13px] px-3 py-2.5 rounded-md border truncate"
              style={{
                background: "var(--console-panel)",
                borderColor: "var(--console-border)",
                color: "var(--console-fg)",
              }}
            >
              {url}
            </code>
            <CopyButton value={url} />
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md font-medium"
              style={{
                background: "var(--console-accent)",
                color: "var(--console-accent-fg)",
              }}
            >
              Open
              <ArrowRight size={12} />
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAdvanced((s) => !s)}
          className="inline-flex items-center gap-1 text-xs"
          style={{ color: "var(--console-fg-muted)" }}
        >
          {advanced ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Use a custom domain
        </button>

        {advanced && (
          <div
            className="rounded-md border p-3 space-y-2"
            style={{
              borderColor: "var(--console-border)",
              background: "var(--console-panel)",
            }}
          >
            <Label>Custom domain</Label>
            <input
              type="text"
              placeholder="e.g. youth.gov.gh"
              className="w-full text-sm px-3 py-2 rounded-md border bg-transparent"
              style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
            />
            <p
              className="text-[11px]"
              style={{ color: "var(--console-fg-faint)" }}
            >
              Add a CNAME record pointing to <code className="font-mono">edge.unmapped.app</code>. SSL is automatic.
            </p>
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-md border"
              style={{
                borderColor: "var(--console-border)",
                color: "var(--console-fg)",
                background: "var(--console-canvas)",
              }}
            >
              Verify domain
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <QrCode value={url} size={148} />
        <div
          className="mt-2 text-[11px] max-w-[148px] leading-snug"
          style={{ color: "var(--console-fg-muted)" }}
        >
          Share this QR code to give youth users instant access.
        </div>
      </div>
    </div>
  );
}

/* Pseudo-random but deterministic QR pattern (visual only). */
function QrCode({ value, size = 148 }: { value: string; size?: number }) {
  const cells = 25;
  const cellSize = size / cells;
  // Hash the value to seed the pattern
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  const rng = (i: number) => {
    const x = Math.sin((h + i) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) ||
    (r < 7 && c >= cells - 7) ||
    (r >= cells - 7 && c < 7);

  const renderFinder = (r0: number, c0: number) => {
    const x = c0 * cellSize;
    const y = r0 * cellSize;
    const s = 7 * cellSize;
    return (
      <g key={`f-${r0}-${c0}`}>
        <rect x={x} y={y} width={s} height={s} fill="var(--console-fg)" />
        <rect
          x={x + cellSize}
          y={y + cellSize}
          width={s - 2 * cellSize}
          height={s - 2 * cellSize}
          fill="var(--console-canvas)"
        />
        <rect
          x={x + 2 * cellSize}
          y={y + 2 * cellSize}
          width={s - 4 * cellSize}
          height={s - 4 * cellSize}
          fill="var(--console-fg)"
        />
      </g>
    );
  };

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (isFinder(r, c)) continue;
      if (rng(r * cells + c) > 0.55) {
        dots.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="var(--console-fg)"
          />,
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-md border inline-block"
      style={{
        background: "var(--console-canvas)",
        borderColor: "var(--console-border)",
      }}
      role="img"
      aria-label={`QR code linking to ${value}`}
    >
      {dots}
      {renderFinder(0, 0)}
      {renderFinder(0, cells - 7)}
      {renderFinder(cells - 7, 0)}
    </svg>
  );
}

/* ─── Tab 2: Embed snippet ─────────────────────────────────────────── */

function TabEmbed() {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [entry, setEntry] = React.useState<"full" | "intake" | "opportunities">("full");
  const [language, setLanguage] = React.useState<"auto" | "en" | "fr" | "ar">("auto");
  const [width, setWidth] = React.useState<"full" | "400" | "custom">("full");
  const [customWidth, setCustomWidth] = React.useState("600");

  const widthAttr =
    width === "full" ? "100%" : width === "400" ? "400px" : `${customWidth}px`;

  const snippet = [
    `<script src="https://cdn.unmapped.app/v1/embed.js" async></script>`,
    `<div`,
    `  data-unmapped-context="gha-urban-2024"`,
    `  data-unmapped-theme="${theme}"`,
    `  data-unmapped-entry="${entry}"`,
    `  data-unmapped-language="${language}"`,
    `  style="width: ${widthAttr}; height: 720px;"`,
    `></div>`,
  ].join("\n");

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--console-fg-muted)" }}>
        Add OmniSkill directly into your own website or portal. The embed
        inherits your context configuration automatically.
      </p>

      <div className="relative">
        <pre
          className="rounded-md border p-4 text-[12px] font-mono overflow-x-auto leading-relaxed whitespace-pre"
          style={{
            background: "var(--console-panel)",
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
          }}
        >
          <SyntaxHtml code={snippet} />
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton value={snippet} compact />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="w-full appearance-none text-sm px-3 py-2 rounded-md border bg-transparent"
            style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
          >
            <option value="auto" style={{ background: "var(--console-canvas)" }}>Auto-detect from browser</option>
            <option value="en" style={{ background: "var(--console-canvas)" }}>English</option>
            <option value="fr" style={{ background: "var(--console-canvas)" }}>Français</option>
            <option value="ar" style={{ background: "var(--console-canvas)" }}>العربية</option>
          </select>
        </Field>

        <Field label="Theme">
          <ChoiceRow
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Field>

        <Field label="Entry point">
          <select
            value={entry}
            onChange={(e) => setEntry(e.target.value as typeof entry)}
            className="w-full appearance-none text-sm px-3 py-2 rounded-md border bg-transparent"
            style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
          >
            <option value="full" style={{ background: "var(--console-canvas)" }}>Full flow</option>
            <option value="intake" style={{ background: "var(--console-canvas)" }}>Skills intake only</option>
            <option value="opportunities" style={{ background: "var(--console-canvas)" }}>Opportunities only</option>
          </select>
        </Field>

        <Field label="Width">
          <div className="space-y-2">
            <ChoiceRow
              value={width}
              onChange={setWidth}
              options={[
                { value: "full", label: "Full" },
                { value: "400", label: "400px" },
                { value: "custom", label: "Custom" },
              ]}
            />
            {width === "custom" && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-20 text-sm px-2 py-1.5 rounded-md border bg-transparent font-mono text-right"
                  style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
                />
                <span className="text-xs" style={{ color: "var(--console-fg-muted)" }}>px</span>
              </div>
            )}
          </div>
        </Field>
      </div>
    </div>
  );
}

function ChoiceRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div
      className="inline-flex rounded-md border p-0.5"
      style={{
        borderColor: "var(--console-border)",
        background: "var(--console-panel)",
      }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="text-xs px-2.5 py-1 rounded transition-colors"
            style={{
              background: active ? "var(--console-canvas)" : "transparent",
              color: active ? "var(--console-fg)" : "var(--console-fg-muted)",
              fontWeight: active ? 500 : 400,
              boxShadow: active ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* Tiny HTML-attribute syntax highlighter. */
function SyntaxHtml({ code }: { code: string }) {
  // Tokenize roughly: tags, attribute names, attribute values, comments
  const TAG = "var(--console-accent)";
  const ATTR = "#7C5BBF";
  const STR = "var(--signal-green)";
  const PUNCT = "var(--console-fg-muted)";

  const lines = code.split("\n");
  return (
    <code className="block">
      {lines.map((line, li) => {
        const tokens: React.ReactNode[] = [];
        // Match: <tag, </tag, attr=, "value", > and rest
        const re = /(<\/?[a-zA-Z][\w-]*)|([a-zA-Z-][\w-]*)(=)("[^"]*")|("[^"]*")|(\/?>)|([^<>"=]+)/g;
        let m: RegExpExecArray | null;
        let key = 0;
        while ((m = re.exec(line)) !== null) {
          if (m[1]) {
            tokens.push(<span key={key++} style={{ color: TAG }}>{m[1]}</span>);
          } else if (m[2] && m[3] && m[4]) {
            tokens.push(<span key={key++} style={{ color: ATTR }}>{m[2]}</span>);
            tokens.push(<span key={key++} style={{ color: PUNCT }}>{m[3]}</span>);
            tokens.push(<span key={key++} style={{ color: STR }}>{m[4]}</span>);
          } else if (m[5]) {
            tokens.push(<span key={key++} style={{ color: STR }}>{m[5]}</span>);
          } else if (m[6]) {
            tokens.push(<span key={key++} style={{ color: TAG }}>{m[6]}</span>);
          } else if (m[7]) {
            tokens.push(<span key={key++}>{m[7]}</span>);
          }
        }
        return (
          <span key={li} className="block">
            {tokens.length > 0 ? tokens : line}
          </span>
        );
      })}
    </code>
  );
}

/* ─── Tab 3: API access ────────────────────────────────────────────── */

function TabApi() {
  const [revealed, setRevealed] = React.useState(false);
  const [key, setKey] = React.useState("unm_live_gha_d8e2c1a9b6f3e0a7c4b12f4a");
  const [rotating, setRotating] = React.useState(false);

  const display = revealed
    ? key
    : `${key.slice(0, 13)}${"•".repeat(12)}${key.slice(-4)}`;

  const rotate = () => {
    setRotating(true);
    window.setTimeout(() => {
      const random =
        "unm_live_gha_" +
        Array.from({ length: 24 }, () =>
          "0123456789abcdef"[Math.floor(Math.random() * 16)],
        ).join("");
      setKey(random);
      setRevealed(true);
      setRotating(false);
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>API key</Label>
        <div className="mt-1 flex gap-2">
          <code
            className="flex-1 font-mono text-[13px] px-3 py-2.5 rounded-md border truncate"
            style={{
              background: "var(--console-panel)",
              borderColor: "var(--console-border)",
              color: "var(--console-fg)",
            }}
          >
            {display}
          </code>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border"
            style={{
              borderColor: "var(--console-border)",
              color: "var(--console-fg)",
              background: "var(--console-canvas)",
            }}
          >
            {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
            {revealed ? "Hide" : "Reveal"}
          </button>
          <CopyButton value={key} />
          <button
            type="button"
            onClick={rotate}
            disabled={rotating}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border"
            style={{
              borderColor: "var(--console-border)",
              color: "var(--console-danger)",
              background: "var(--console-canvas)",
              opacity: rotating ? 0.6 : 1,
            }}
          >
            {rotating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Rotate key
          </button>
        </div>
        <p className="mt-2 text-[11px]" style={{ color: "var(--console-fg-faint)" }}>
          Treat this key like a password. Rotation invalidates the previous key immediately.
        </p>
      </div>

      <div>
        <Label>Base URL</Label>
        <code
          className="mt-1 block font-mono text-[13px] px-3 py-2.5 rounded-md border"
          style={{
            background: "var(--console-panel)",
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
          }}
        >
          https://api.unmapped.app/v1
        </code>
      </div>

      <div>
        <Label>Quick reference</Label>
        <div className="mt-2 space-y-2">
          <EndpointCard method="POST" path="/intake/submit" desc="Submit a youth skills form" />
          <EndpointCard method="GET" path="/profiles/{id}" desc="Retrieve a generated profile" />
          <EndpointCard method="GET" path="/signals/{context_id}" desc="Get econometric signals" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--console-accent)" }}
        >
          View full API docs
          <ExternalLink size={11} />
        </a>
        <span style={{ color: "var(--console-fg-faint)" }}>·</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border"
          style={{
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
            background: "var(--console-canvas)",
          }}
        >
          <Download size={12} />
          Postman collection
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border"
          style={{
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
            background: "var(--console-canvas)",
          }}
        >
          <Download size={12} />
          OpenAPI spec
        </button>
      </div>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  desc: string;
}) {
  const methodColor: Record<typeof method, string> = {
    GET: "var(--signal-green)",
    POST: "var(--console-accent)",
    PATCH: "var(--signal-amber)",
    DELETE: "var(--console-danger)",
  };
  return (
    <div
      className="rounded-md border px-3 py-2 flex items-center gap-3"
      style={{
        borderColor: "var(--console-border)",
        background: "var(--console-panel)",
      }}
    >
      <span
        className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded"
        style={{
          color: methodColor[method],
          background: `color-mix(in oklab, ${methodColor[method]} 14%, transparent)`,
          minWidth: 46,
          textAlign: "center",
        }}
      >
        {method}
      </span>
      <code className="font-mono text-[12.5px]" style={{ color: "var(--console-fg)" }}>
        {path}
      </code>
      <span className="ml-auto text-xs" style={{ color: "var(--console-fg-muted)" }}>
        {desc}
      </span>
    </div>
  );
}

/* ─── Tab 4: Webhook ───────────────────────────────────────────────── */

interface WhEvent {
  id: string;
  label: string;
  enabled: boolean;
}

function TabWebhook() {
  const [events, setEvents] = React.useState<WhEvent[]>([
    { id: "profile_generated", label: "New profile generated", enabled: true },
    { id: "pipeline_synced", label: "Pipeline sync complete", enabled: true },
    { id: "feedback_submitted", label: "User feedback submitted", enabled: false },
  ]);
  const [endpoint, setEndpoint] = React.useState("");
  const secret = "whsec_gha_a3f1c9d2e8b7401af6c5e0d4";
  const [tested, setTested] = React.useState<null | "ok" | "fail">(null);
  const [testing, setTesting] = React.useState(false);

  const toggle = (id: string) =>
    setEvents((p) => p.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)));

  const sendTest = () => {
    if (!endpoint) {
      setTested("fail");
      return;
    }
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      setTested("ok");
    }, 600);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Receive notifications when</Label>
        <div className="mt-2 space-y-1.5">
          {events.map((e) => (
            <label
              key={e.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox checked={e.enabled} onChange={() => toggle(e.id)} />
              <span style={{ color: e.enabled ? "var(--console-fg)" : "var(--console-fg-muted)" }}>
                {e.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Field label="Endpoint URL">
        <input
          type="url"
          value={endpoint}
          onChange={(e) => {
            setEndpoint(e.target.value);
            setTested(null);
          }}
          placeholder="https://your-app.example.com/webhooks/unmapped"
          className="w-full text-sm px-3 py-2 rounded-md border bg-transparent font-mono"
          style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
        />
      </Field>

      <div>
        <Label>Signing secret</Label>
        <div className="mt-1 flex gap-2">
          <code
            className="flex-1 font-mono text-[13px] px-3 py-2.5 rounded-md border truncate"
            style={{
              background: "var(--console-panel)",
              borderColor: "var(--console-border)",
              color: "var(--console-fg)",
            }}
          >
            {secret}
          </code>
          <CopyButton value={secret} />
        </div>
        <p className="mt-2 text-[11px]" style={{ color: "var(--console-fg-faint)" }}>
          Verify the <code className="font-mono">X-Unmapped-Signature</code> header on each request.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={sendTest}
          disabled={testing}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium"
          style={{
            background: "var(--console-accent)",
            color: "var(--console-accent-fg)",
            opacity: testing ? 0.6 : 1,
          }}
        >
          {testing && <Loader2 size={12} className="animate-spin" />}
          Send test event
        </button>
        {tested === "ok" && (
          <span className="text-xs inline-flex items-center gap-1.5" style={{ color: "var(--signal-green)" }}>
            <CheckCircle2 size={12} /> Test event accepted (200 OK)
          </span>
        )}
        {tested === "fail" && (
          <span className="text-xs inline-flex items-center gap-1.5" style={{ color: "var(--console-danger)" }}>
            <AlertTriangle size={12} /> Add an endpoint URL first
          </span>
        )}
      </div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
      className="h-4 w-4 rounded shrink-0 border inline-flex items-center justify-center transition-colors"
      style={{
        borderColor: checked ? "var(--console-accent)" : "var(--console-border)",
        background: checked ? "var(--console-accent)" : "transparent",
        color: "var(--console-accent-fg)",
      }}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </button>
  );
}

/* ─── Multi-context table ──────────────────────────────────────────── */

interface DeployedContext {
  id: string;
  name: string;
  region: string;
  status: "live" | "draft";
  profiles: number;
  lastActive: string;
}

const DEPLOYED: DeployedContext[] = [
  { id: "gha-urban-2024", name: "Ghana Urban 2024", region: "West Africa · GHA", status: "live", profiles: 1284, lastActive: "Just now" },
  { id: "bgd-dhaka-2024", name: "Bangladesh Dhaka 2024", region: "South Asia · BGD", status: "live", profiles: 642, lastActive: "12 min ago" },
  { id: "ken-rural-2025", name: "Kenya Rural 2025", region: "East Africa · KEN", status: "draft", profiles: 0, lastActive: "—" },
];

function MultiContextTable() {
  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-[20px] tracking-tight">All your deployed contexts</h2>
        <Link
          to="/console/contexts/new"
          className="inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--console-accent)" }}
        >
          <Plus size={12} />
          Create new context
        </Link>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{ background: "var(--console-panel)", color: "var(--console-fg-muted)" }}
            >
              <Th>Context</Th>
              <Th>Region</Th>
              <Th>Status</Th>
              <Th className="text-right">Profiles</Th>
              <Th>Last active</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {DEPLOYED.map((d) => (
              <tr key={d.id} className="border-t" style={{ borderColor: "var(--console-rule)" }}>
                <Td>
                  <div className="font-medium">{d.name}</div>
                  <code
                    className="font-mono text-[11px]"
                    style={{ color: "var(--console-fg-faint)" }}
                  >
                    {d.id}
                  </code>
                </Td>
                <Td>
                  <span style={{ color: "var(--console-fg-muted)" }}>{d.region}</span>
                </Td>
                <Td>
                  {d.status === "live" ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded font-medium"
                      style={{
                        background: "color-mix(in oklab, var(--signal-green) 14%, transparent)",
                        color: "var(--signal-green)",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--signal-green)" }}
                      />
                      Live
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium"
                      style={{
                        background: "var(--console-panel-strong)",
                        color: "var(--console-fg-muted)",
                      }}
                    >
                      Draft
                    </span>
                  )}
                </Td>
                <Td className="text-right">
                  <span className="font-mono">{d.profiles.toLocaleString()}</span>
                </Td>
                <Td>
                  <span style={{ color: "var(--console-fg-muted)" }}>{d.lastActive}</span>
                </Td>
                <Td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs underline-offset-2 hover:underline"
                      style={{ color: "var(--console-accent)" }}
                    >
                      Manage
                    </button>
                    {d.status === "live" && (
                      <a
                        href={`https://unmapped.app/c/${d.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--console-fg-muted)" }}
                      >
                        Open
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─── Shared atoms ─────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block text-[11px] uppercase tracking-[0.08em]"
      style={{ color: "var(--console-fg-muted)" }}
    >
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function CopyButton({ value, compact = false }: { value: string; compact?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(value);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy"
      className={`inline-flex items-center gap-1.5 text-xs rounded-md border ${
        compact ? "px-2 py-1" : "px-3 py-2"
      }`}
      style={{
        borderColor: "var(--console-border)",
        color: "var(--console-fg)",
        background: "var(--console-canvas)",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Th({
  children,
  className = "",
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.08em] font-medium ${className}`}
      style={style}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
