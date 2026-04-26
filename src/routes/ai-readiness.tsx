import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  Languages,
  Cpu,
  Layers,
  ChevronDown,
  Plus,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-readiness")({
  head: () => ({
    meta: [
      { title: "AI Readiness & Displacement Risk — OmniSkill" },
      {
        name: "description",
        content:
          "Personal AI displacement risk and regional labour-market projections, calibrated for low- and middle-income economies using Frey-Osborne, ILO, Wittgenstein and World Bank data.",
      },
      { property: "og:title", content: "AI Readiness & Displacement Risk — OmniSkill" },
      {
        property: "og:description",
        content:
          "Skill-by-skill resilience scoring, LMIC-calibrated automation risk, and Wittgenstein 2025 projections for Sub-Saharan Africa.",
      },
    ],
  }),
  component: AiReadinessPage,
});

/* ─────────────────────────────────────────────────────────────────────────
 * Module 02 — AI Readiness & Displacement Risk
 *
 * Two views toggled by a pill switcher:
 *   "My risk"   → personal resilience score + skill-by-skill breakdown
 *   "My region" → Wittgenstein projections + LMIC-vs-base automation
 *
 * Charts are inline SVG (consistent with policy-dashboard/projection-chart.tsx)
 * — no Chart.js dependency to keep bundle small and SSR-safe.
 * ────────────────────────────────────────────────────────────────────── */

type ViewKey = "risk" | "region";

function AiReadinessPage() {
  const [view, setView] = React.useState<ViewKey>("risk");

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <PageHeader view={view} onViewChange={setView} />

      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div key={view} className="animate-[ai-fade_250ms_ease-out_both]">
          {view === "risk" ? <MyRiskView /> : <MyRegionView />}
        </div>
      </div>

      <style>{`
        @keyframes ai-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ai-rise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ai-bar-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ai-arc-draw {
          to { stroke-dashoffset: var(--arc-final); }
        }
        @keyframes ai-line-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────  Header  ──────────────────────────────── */

function PageHeader({
  view,
  onViewChange,
}: {
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
}) {
  const [explainOpen, setExplainOpen] = React.useState(false);

  return (
    <header
      className="border-b"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Link
            to="/"
            aria-label="Back to home"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-sunken)]"
            style={{ color: "var(--ink-secondary)" }}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <ShieldAlert
            size={18}
            strokeWidth={1.5}
            style={{ color: "var(--ink-secondary)" }}
          />
          <h1 className="text-base font-medium" style={{ color: "var(--ink)" }}>
            AI readiness
          </h1>

          <span
            className="ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{
              background: "var(--earth-light)",
              color: "var(--earth-dark)",
            }}
          >
            <span aria-hidden>🇬🇭</span> Ghana · Electronics &amp; Repair
          </span>

          <div className="ml-auto">
            <PillToggle view={view} onChange={onViewChange} />
          </div>
        </div>
      </div>

      {/* Honest disclaimer strip — full bleed (no rounded corners) */}
      <div
        className="border-t border-b"
        style={{
          background: "var(--earth-light)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-3 flex items-start gap-3">
          <Info
            size={14}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--earth-dark)" }}
          />
          <p
            className="text-[12.5px] leading-relaxed flex-1"
            style={{ color: "var(--earth-dark)" }}
          >
            This assessment uses Frey &amp; Osborne automation data adjusted for
            Ghana&apos;s economy. It is an estimate, not a prediction.{" "}
            <span className="opacity-75">
              Source: Frey-Osborne 2013 + ILO task indices.
            </span>
          </p>
          <button
            type="button"
            onClick={() => setExplainOpen((v) => !v)}
            aria-expanded={explainOpen}
            aria-label="Explain LMIC calibration"
            className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-raised)]"
            style={{ color: "var(--earth-dark)" }}
          >
            <HelpCircle size={14} strokeWidth={1.75} />
          </button>
        </div>
        {explainOpen && (
          <div
            className="border-t"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-3 text-[12px] leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
              <strong style={{ color: "var(--ink)" }}>What is LMIC calibration?</strong>{" "}
              Frey-Osborne scores were estimated for high-capital US/EU labour
              markets. We adjust them for low- and middle-income contexts where
              automation capital is scarcer, manual labour is cheaper, and the
              task composition of similar job titles differs. Adjustments use
              ILO task content indices and ISIC sector data for the active context.
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function PillToggle({
  view,
  onChange,
}: {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Switch view"
      className="inline-flex items-center rounded-full p-1"
      style={{ background: "var(--surface-sunken)" }}
    >
      {([
        { k: "risk", label: "My risk" },
        { k: "region", label: "My region" },
      ] as const).map((opt) => {
        const active = view === opt.k;
        return (
          <button
            key={opt.k}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.k)}
            className={cn(
              "rounded-full px-4 h-8 text-[12.5px] font-medium transition-colors",
              "min-w-[88px]",
            )}
            style={{
              background: active ? "var(--earth-dark)" : "transparent",
              color: active ? "var(--earth-light)" : "var(--ink-secondary)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────────  View A: My Risk  ─────────────────────── */

interface SkillRow {
  name: string;
  pct: number; // 0–100 risk
  why?: string;
  source?: string;
}

const SKILLS: SkillRow[] = [
  { name: "Electronics repair & diagnostics", pct: 31 },
  { name: "Multilingual communication", pct: 18 },
  { name: "Customer service & negotiation", pct: 29 },
  { name: "Self-directed / online learning", pct: 22 },
  {
    name: "Basic digital literacy",
    pct: 48,
    why: "Routine digital tasks (data lookup, simple form filling) are increasingly automated by LLM-powered assistants, but applied troubleshooting remains human.",
    source: "ILO task content index · ISIC C26",
  },
  {
    name: "Inventory & stock management",
    pct: 67,
    why: "POS systems with built-in inventory and demand-prediction tooling are spreading rapidly, even in informal retail.",
    source: "ILO task content index · ISIC G47",
  },
  {
    name: "Cash handling / manual transactions",
    pct: 74,
    why: "Cash handling is being replaced by mobile money and automated POS systems.",
    source: "ILO task content index · ISIC G47",
  },
];

function riskBucket(pct: number): "durable" | "transition" | "high" {
  if (pct < 40) return "durable";
  if (pct < 65) return "transition";
  return "high";
}

function riskColor(b: ReturnType<typeof riskBucket>): string {
  if (b === "durable") return "var(--signal-green)";
  if (b === "transition") return "var(--signal-amber)";
  return "var(--signal-red)";
}

function riskLabel(b: ReturnType<typeof riskBucket>): string {
  if (b === "durable") return "Durable";
  if (b === "transition") return "Transition zone";
  return "High exposure";
}

function MyRiskView() {
  return (
    <div className="space-y-10">
      <ResilienceScore score={68} />
      <SkillBreakdown />
      <AdjacentSkills />
      <DataSignalCard
        accent="var(--signal-green)"
        label="Real signal · ILO task content index · Ghana · Electronics sector"
        statA={{
          value: "62%",
          line1: "of tasks in your sector are non-routine",
          line2: "(harder to automate)",
        }}
        statB={{
          value: "38%",
          line1: "routine task share",
          line2: "source: ILO Future of Work dataset",
        }}
        source="ILO Future of Work · Task indices · 2022"
      />
    </div>
  );
}

/* ── Section 1: Resilience score with animated SVG arc ────────────── */

function ResilienceScore({ score }: { score: number }) {
  const size = 200;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const startOffset = c; // empty at start
  const finalOffset = c * (1 - score / 100);

  const color =
    score >= 60
      ? "var(--signal-green)"
      : score >= 40
        ? "var(--signal-amber)"
        : "var(--signal-red)";

  return (
    <section
      className="rounded-2xl border p-6 md:p-10"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
        animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={startOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={
                {
                  ["--arc-final" as string]: String(finalOffset),
                  animation:
                    "ai-arc-draw 800ms cubic-bezier(0.16,1,0.3,1) forwards",
                } as React.CSSProperties
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display leading-none"
              style={{ fontSize: 72, color: "var(--ink)" }}
            >
              {score}
            </span>
          </div>
        </div>

        <div
          className="mt-3 text-[13px]"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Resilience score
        </div>
        <div
          className="mt-1 text-[12.5px] max-w-[420px]"
          style={{ color: "var(--ink-secondary)" }}
        >
          Based on your skill diversity, digital literacy, and language range.
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <SupportChip
            tone="teal"
            icon={<Languages size={12} strokeWidth={1.75} />}
            label="3 languages"
            note="Increases resilience"
          />
          <SupportChip
            tone="amber"
            icon={<Cpu size={12} strokeWidth={1.75} />}
            label="Digital: Basic"
            note="Moderate digital exposure"
          />
          <SupportChip
            tone="teal"
            icon={<Layers size={12} strokeWidth={1.75} />}
            label="6 skill clusters"
            note="Good diversity"
          />
        </div>
      </div>
    </section>
  );
}

function SupportChip({
  tone,
  icon,
  label,
  note,
}: {
  tone: "teal" | "amber";
  icon: React.ReactNode;
  label: string;
  note: string;
}) {
  const palette =
    tone === "teal"
      ? { bg: "color-mix(in oklab, var(--signal-green) 12%, transparent)", fg: "var(--signal-green)" }
      : { bg: "color-mix(in oklab, var(--signal-amber) 14%, transparent)", fg: "var(--signal-amber)" };

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: palette.bg }}
    >
      <span
        className="inline-flex items-center gap-1 text-[12px] font-medium"
        style={{ color: palette.fg }}
      >
        {icon}
        {label}
      </span>
      <span className="text-[11px]" style={{ color: "var(--ink-tertiary)" }}>
        · {note}
      </span>
    </div>
  );
}

/* ── Section 2: Skill-by-skill breakdown ───────────────────────────── */

function SkillBreakdown() {
  return (
    <section
      style={{ animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) 80ms both" }}
    >
      <div className="flex items-end justify-between gap-3 mb-3">
        <h2
          className="font-display"
          style={{ fontSize: 22, color: "var(--ink)" }}
        >
          Your skills — what&apos;s at risk, what&apos;s durable
        </h2>
        <div
          className="text-[11px] text-right"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Frey-Osborne 2013 · ILO task indices · LMIC-calibrated
        </div>
      </div>

      {/* LMIC calibration note */}
      <div
        className="rounded-lg border p-3 mb-5 flex items-start gap-2.5"
        style={{
          background: "color-mix(in oklab, var(--signal-amber) 8%, transparent)",
          borderColor: "color-mix(in oklab, var(--signal-amber) 35%, transparent)",
        }}
      >
        <Info
          size={14}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--signal-amber)" }}
        />
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: "var(--ink-secondary)" }}
        >
          <strong style={{ color: "var(--ink)" }}>
            Risk scores adjusted for Ghana&apos;s economy.
          </strong>{" "}
          Base Frey-Osborne score for &quot;Inventory management&quot;:{" "}
          <span className="font-mono">74%</span>. Adjusted for LMIC context
          (lower automation capital, higher manual labour share):{" "}
          <span className="font-mono">67%</span>.
        </p>
      </div>

      <ul
        className="rounded-2xl border divide-y"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border-subtle)",
          // @ts-expect-error css var
          "--tw-divide-opacity": 1,
        }}
      >
        {SKILLS.map((s, i) => (
          <SkillRowItem key={s.name} row={s} index={i} />
        ))}
      </ul>
    </section>
  );
}

function SkillRowItem({ row, index }: { row: SkillRow; index: number }) {
  const bucket = riskBucket(row.pct);
  const color = riskColor(bucket);
  const label = riskLabel(bucket);
  const collapsible = bucket !== "durable";
  const [open, setOpen] = React.useState(false);

  return (
    <li
      className="px-4 md:px-5 py-3.5"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div
          className="flex-1 min-w-[160px] text-[13.5px] leading-snug"
          style={{ color: "var(--ink)" }}
        >
          {row.name}
        </div>

        {/* Bar */}
        <div className="order-3 md:order-none basis-full md:basis-auto md:flex-1 md:max-w-[280px]">
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "var(--surface-sunken)" }}
          >
            <div
              className="h-full rounded-full origin-left"
              style={{
                width: `${row.pct}%`,
                background: color,
                transform: "scaleX(0)",
                animation: `ai-bar-grow 600ms cubic-bezier(0.16,1,0.3,1) ${index * 80}ms forwards`,
              }}
            />
          </div>
        </div>

        {/* Label pill */}
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap"
          style={{
            background: `color-mix(in oklab, ${color} 14%, transparent)`,
            color,
          }}
        >
          {label}
        </span>

        {/* Percentage */}
        <span
          className="font-mono text-[13px] tabular-nums w-[44px] text-right"
          style={{ color }}
        >
          {row.pct}%
        </span>

        {/* Chevron */}
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Hide explanation" : "Why is this at risk?"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-sunken)]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            <ChevronDown
              size={14}
              strokeWidth={1.75}
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms",
              }}
            />
          </button>
        ) : (
          <span className="w-7" aria-hidden />
        )}
      </div>

      {collapsible && open && row.why && (
        <div
          className="mt-3 ml-0 md:ml-2 rounded-lg p-3 text-[12.5px] leading-relaxed"
          style={{
            background: "var(--surface-sunken)",
            color: "var(--ink-secondary)",
            animation: "ai-fade 250ms ease-out both",
          }}
        >
          <div>
            <strong style={{ color: "var(--ink)" }}>Why at risk?</strong>{" "}
            {row.why}
          </div>
          {row.source && (
            <div
              className="mt-2 text-[11px]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Source: {row.source}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/* ── Section 3: Adjacent skills ────────────────────────────────────── */

interface AdjacentCard {
  name: string;
  category: string;
  delta: number;
  weeks: number;
  resourceLabel: string;
  resourceUrl: string;
}

const ADJACENT: AdjacentCard[] = [
  {
    name: "Mobile money & digital payments",
    category: "Digital",
    delta: 6,
    weeks: 4,
    resourceLabel: "MTN MoMo Agent training (free)",
    resourceUrl: "https://www.mtn.com.gh/momo/",
  },
  {
    name: "Basic electrical circuit diagnostics",
    category: "Technical",
    delta: 4,
    weeks: 8,
    resourceLabel: "YouTube: ElectroBOOM circuit basics (free)",
    resourceUrl: "https://www.youtube.com/@ElectroBOOM",
  },
  {
    name: "Small business bookkeeping",
    category: "Business",
    delta: 5,
    weeks: 6,
    resourceLabel: "GIZ digital bookkeeping course (free)",
    resourceUrl: "https://www.giz.de/",
  },
];

function AdjacentSkills() {
  return (
    <section
      style={{ animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) 160ms both" }}
    >
      <div className="mb-1">
        <h2
          className="font-display"
          style={{ fontSize: 22, color: "var(--ink)" }}
        >
          Skills that would increase your resilience
        </h2>
        <p
          className="text-[13px] mt-1"
          style={{ color: "var(--ink-secondary)" }}
        >
          Adding these would move you out of the transition zone.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {ADJACENT.map((card) => (
          <AdjacentCardRow key={card.name} card={card} />
        ))}
      </div>
    </section>
  );
}

function AdjacentCardRow({ card }: { card: AdjacentCard }) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  return (
    <article
      className="rounded-2xl border p-4 md:p-5"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[180px]">
          <div
            className="text-[15px] font-medium"
            style={{ color: "var(--ink)" }}
          >
            {card.name}
          </div>
          <div className="mt-1">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                background: "var(--earth-light)",
                color: "var(--earth-dark)",
              }}
            >
              {card.category}
            </span>
          </div>
        </div>

        <div
          className="text-[13px] font-medium whitespace-nowrap"
          style={{ color: "var(--signal-green)" }}
        >
          +{card.delta} pts to resilience score
        </div>

        <div
          className="text-[12.5px] whitespace-nowrap"
          style={{ color: "var(--ink-tertiary)" }}
        >
          ~{card.weeks} weeks · Free resource available
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-[12px] rounded-md px-2.5 h-8 inline-flex items-center transition-colors hover:bg-[var(--surface-sunken)]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Resource
            <ChevronDown
              size={13}
              strokeWidth={1.75}
              className="ml-1"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms",
              }}
            />
          </button>
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={cn(
              "text-[12px] rounded-md px-3 h-8 inline-flex items-center gap-1 border transition-colors",
            )}
            style={{
              background: saved ? "var(--earth-dark)" : "transparent",
              color: saved ? "var(--earth-light)" : "var(--ink-secondary)",
              borderColor: saved ? "var(--earth-dark)" : "var(--border-subtle)",
            }}
          >
            <Plus size={12} strokeWidth={2} />
            {saved ? "Saved to plan" : "Save to my plan"}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="mt-3 rounded-lg p-3 flex items-center gap-3"
          style={{
            background: "var(--surface-sunken)",
            animation: "ai-fade 250ms ease-out both",
          }}
        >
          <span
            className="text-[12px]"
            style={{ color: "var(--ink-secondary)" }}
          >
            Free learning resource:
          </span>
          <a
            href={card.resourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[12.5px] inline-flex items-center gap-1 underline underline-offset-2"
            style={{ color: "var(--earth-dark)" }}
          >
            {card.resourceLabel}
            <ExternalLink size={11} strokeWidth={1.75} />
          </a>
        </div>
      )}
    </article>
  );
}

/* ── Section 4 / View B Section 4: Data signal cards ───────────────── */

interface DataSignalProps {
  accent: string;
  label: string;
  statA: { value: string; line1: string; line2: string };
  statB?: { value: string; line1: string; line2: string };
  source: string;
  children?: React.ReactNode;
}

function DataSignalCard({
  accent,
  label,
  statA,
  statB,
  source,
  children,
}: DataSignalProps) {
  return (
    <section
      className="border"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: 0,
        animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) 240ms both",
      }}
    >
      <div className="p-5 md:p-6">
        <div
          className="text-[11px] uppercase tracking-[0.08em] font-medium mb-4"
          style={{ color: "var(--ink-tertiary)" }}
        >
          {label}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataStat {...statA} />
          {statB && <DataStat {...statB} />}
        </div>

        {children}

        <div
          className="mt-5 pt-3 border-t text-[11px]"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--ink-tertiary)",
          }}
        >
          {source}
        </div>
      </div>
    </section>
  );
}

function DataStat({
  value,
  line1,
  line2,
}: {
  value: string;
  line1: string;
  line2: string;
}) {
  return (
    <div>
      <div
        className="font-display leading-none"
        style={{ fontSize: 32, color: "var(--ink)" }}
      >
        {value}
      </div>
      <div
        className="mt-2 text-[13px]"
        style={{ color: "var(--ink-secondary)" }}
      >
        {line1}
      </div>
      <div
        className="mt-0.5 text-[11.5px]"
        style={{ color: "var(--ink-tertiary)" }}
      >
        {line2}
      </div>
    </div>
  );
}

/* ───────────────────────  View B: My Region  ──────────────────────── */

function MyRegionView() {
  return (
    <div className="space-y-10">
      <RegionProjections />
      <AutomationComparison />
      <SkillsGapTrajectory />
      <DataSignalCard
        accent="var(--signal-blue)"
        label="Real signal · World Bank Human Capital Index · Ghana"
        statA={{
          value: "0.43",
          line1: "Human Capital Index score (0–1 scale)",
          line2:
            "A child born in Ghana today will be 43% as productive as they could be with full education and health.",
        }}
        source="World Bank HCI 2020"
      >
        <HciComparison />
      </DataSignalCard>
    </div>
  );
}

/* ── Region Section 1: Wittgenstein projections ───────────────────── */

interface ProjPoint {
  year: number;
  secondary: number;
  none: number;
  tertiary: number;
}

const PROJECTIONS: ProjPoint[] = [
  { year: 2025, secondary: 38, none: 22, tertiary: 8 },
  { year: 2027, secondary: 40, none: 20, tertiary: 9 },
  { year: 2029, secondary: 42, none: 18, tertiary: 10 },
  { year: 2031, secondary: 44, none: 17, tertiary: 11 },
  { year: 2033, secondary: 46, none: 15, tertiary: 13 },
  { year: 2035, secondary: 47, none: 14, tertiary: 14 },
];

function RegionProjections() {
  return (
    <section
      style={{ animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h2
            className="font-display"
            style={{ fontSize: 22, color: "var(--ink)" }}
          >
            Where your region is heading
          </h2>
          <p
            className="text-[13px] mt-1"
            style={{ color: "var(--ink-secondary)" }}
          >
            Education landscape · Sub-Saharan Africa · 2025–2035
          </p>
        </div>
        <div
          className="text-[11px] text-right"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Wittgenstein Centre for Demography
          <br />
          and Global Human Capital · SSP2 scenario
        </div>
      </div>

      <div
        className="rounded-2xl border p-4 md:p-5"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Custom HTML legend */}
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
          <LegendItem
            color="var(--earth)"
            label="Secondary education"
            value={`${PROJECTIONS[0].secondary}% → ${PROJECTIONS[PROJECTIONS.length - 1].secondary}%`}
          />
          <LegendItem
            color="var(--signal-red)"
            dashed
            label="No formal education"
            value={`${PROJECTIONS[0].none}% → ${PROJECTIONS[PROJECTIONS.length - 1].none}%`}
          />
          <LegendItem
            color="var(--signal-green)"
            label="Tertiary education"
            value={`${PROJECTIONS[0].tertiary}% → ${PROJECTIONS[PROJECTIONS.length - 1].tertiary}%`}
          />
        </ul>

        <ProjectionsLineChart points={PROJECTIONS} />

        {/* Insight strip */}
        <div
          className="mt-4 px-4 py-3 rounded-md"
          style={{
            background: "var(--earth-light)",
            color: "var(--earth-dark)",
          }}
        >
          <p className="text-[12.5px] leading-relaxed">
            <strong>By 2035,</strong> secondary-educated youth in your region
            will grow by 9 percentage points. Skills infrastructure built today
            will serve a larger, better-educated population.
          </p>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "var(--earth-dark)", opacity: 0.7 }}
          >
            Source: Wittgenstein Centre 2025 projections · SSP2 scenario
          </p>
        </div>
      </div>
    </section>
  );
}

function LegendItem({
  color,
  label,
  value,
  dashed,
}: {
  color: string;
  label: string;
  value: string;
  dashed?: boolean;
}) {
  return (
    <li className="inline-flex items-center gap-2 text-[12px]">
      <span
        aria-hidden
        className="inline-block h-[3px] w-5 rounded"
        style={{
          background: dashed
            ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 8px)`
            : color,
        }}
      />
      <span style={{ color: "var(--ink)" }}>{label}</span>
      <span className="font-mono" style={{ color: "var(--ink-tertiary)" }}>
        {value}
      </span>
    </li>
  );
}

function ProjectionsLineChart({ points }: { points: ProjPoint[] }) {
  const W = 720;
  const H = 240;
  const PAD = { top: 12, right: 16, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xs = points.map((p) => p.year);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = 60;
  const yTicks = [0, 15, 30, 45, 60];

  const x = (year: number) =>
    PAD.left + ((year - xMin) / (xMax - xMin)) * innerW;
  const y = (val: number) => PAD.top + (1 - val / yMax) * innerH;

  const series: {
    key: keyof Omit<ProjPoint, "year">;
    color: string;
    dashed?: boolean;
  }[] = [
    { key: "secondary", color: "var(--earth)" },
    { key: "tertiary", color: "var(--signal-green)" },
    { key: "none", color: "var(--signal-red)", dashed: true },
  ];

  const path = (k: keyof Omit<ProjPoint, "year">) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${y(p[k])}`)
      .join(" ");

  const nowX = x(2026);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 240 }}
        role="img"
        aria-label="Education attainment projections, Sub-Saharan Africa, 2025 to 2035"
      >
        {/* y grid + labels */}
        {yTicks.map((t) => {
          const yy = y(t);
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yy}
                y2={yy}
                stroke="var(--border-subtle)"
                strokeDasharray={t === 0 ? "0" : "2 4"}
              />
              <text
                x={PAD.left - 6}
                y={yy + 3}
                textAnchor="end"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--ink-tertiary)"
              >
                {t}%
              </text>
            </g>
          );
        })}

        {/* x labels */}
        {points.map((p) => (
          <text
            key={p.year}
            x={x(p.year)}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fontFamily="JetBrains Mono, monospace"
            fill="var(--ink-tertiary)"
          >
            {p.year}
          </text>
        ))}

        {/* "now" line */}
        <line
          x1={nowX}
          x2={nowX}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke="var(--ink-tertiary)"
          strokeDasharray="3 3"
        />
        <text
          x={nowX + 4}
          y={PAD.top + 10}
          fontSize="10"
          fontFamily="DM Sans, sans-serif"
          fill="var(--ink-secondary)"
        >
          Now
        </text>

        {/* series */}
        {series.map((s) => (
          <g key={s.key}>
            <path
              d={path(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? "5 4" : undefined}
              style={{
                strokeDasharray: s.dashed ? "5 4" : 1000,
                strokeDashoffset: s.dashed ? 0 : 1000,
                animation: s.dashed
                  ? undefined
                  : "ai-line-draw 1000ms cubic-bezier(0.16,1,0.3,1) forwards",
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
  );
}

/* ── Region Section 2: Automation comparison (grouped horizontal bars) */

interface AutomationRow {
  job: string;
  base: number;
  ghana: number;
}

const AUTOMATION: AutomationRow[] = [
  { job: "Phone repair tech", base: 52, ghana: 31 },
  { job: "Market trader", base: 61, ghana: 44 },
  { job: "Data entry clerk", base: 87, ghana: 74 },
  { job: "Agricultural worker", base: 68, ghana: 56 },
];

function AutomationComparison() {
  return (
    <section
      style={{ animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) 80ms both" }}
    >
      <div className="mb-1">
        <h2
          className="font-display"
          style={{ fontSize: 22, color: "var(--ink)" }}
        >
          Automation exposure — how your context compares
        </h2>
        <p
          className="text-[13px] mt-1"
          style={{ color: "var(--ink-secondary)" }}
        >
          The same job title carries different risk in different economies.
        </p>
      </div>

      <div
        className="mt-4 rounded-2xl border p-4 md:p-5"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Custom HTML legend */}
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
          <li className="inline-flex items-center gap-2 text-[12px]">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: "var(--ink-tertiary)" }}
            />
            <span style={{ color: "var(--ink)" }}>
              High-capital economy (US/EU base)
            </span>
          </li>
          <li className="inline-flex items-center gap-2 text-[12px]">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: "var(--earth)" }}
            />
            <span style={{ color: "var(--ink)" }}>
              Your context (Ghana, LMIC-adjusted)
            </span>
          </li>
        </ul>

        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[420px] space-y-4">
            {AUTOMATION.map((row, i) => (
              <AutomationBarGroup key={row.job} row={row} index={i} />
            ))}
          </div>
        </div>

        <p
          className="mt-4 text-[11.5px] leading-relaxed"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Lower automation risk in LMIC contexts reflects lower capital
          investment in automation, higher manual labour preference, and
          different task composition. Source: Frey-Osborne + ILO.
        </p>
      </div>
    </section>
  );
}

function AutomationBarGroup({
  row,
  index,
}: {
  row: AutomationRow;
  index: number;
}) {
  return (
    <div>
      <div
        className="flex items-baseline justify-between mb-1.5 text-[12.5px]"
        style={{ color: "var(--ink)" }}
      >
        <span className="font-medium">{row.job}</span>
        <span
          className="font-mono text-[11.5px]"
          style={{ color: "var(--ink-tertiary)" }}
        >
          {row.base}% → {row.ghana}%
        </span>
      </div>
      <div className="space-y-1.5">
        {/* base */}
        <div className="flex items-center gap-2">
          <div
            className="h-3 rounded-sm flex-1 overflow-hidden"
            style={{ background: "var(--surface-sunken)" }}
          >
            <div
              className="h-full rounded-sm origin-left"
              style={{
                width: `${row.base}%`,
                background: "var(--ink-tertiary)",
                transform: "scaleX(0)",
                animation: `ai-bar-grow 600ms cubic-bezier(0.16,1,0.3,1) ${index * 80}ms forwards`,
              }}
            />
          </div>
          <span
            className="font-mono text-[10.5px] w-9 text-right"
            style={{ color: "var(--ink-tertiary)" }}
          >
            {row.base}%
          </span>
        </div>
        {/* ghana */}
        <div className="flex items-center gap-2">
          <div
            className="h-3 rounded-sm flex-1 overflow-hidden"
            style={{ background: "var(--surface-sunken)" }}
          >
            <div
              className="h-full rounded-sm origin-left"
              style={{
                width: `${row.ghana}%`,
                background: "var(--earth)",
                transform: "scaleX(0)",
                animation: `ai-bar-grow 600ms cubic-bezier(0.16,1,0.3,1) ${index * 80 + 120}ms forwards`,
              }}
            />
          </div>
          <span
            className="font-mono text-[10.5px] w-9 text-right"
            style={{ color: "var(--earth-dark)" }}
          >
            {row.ghana}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Region Section 3: Skills gap trajectory ───────────────────────── */

function SkillsGapTrajectory() {
  return (
    <section
      style={{ animation: "ai-rise 600ms cubic-bezier(0.16,1,0.3,1) 160ms both" }}
    >
      <div className="mb-3">
        <h2
          className="font-display"
          style={{ fontSize: 22, color: "var(--ink)" }}
        >
          Where the skills gap is opening
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GapStatCard
          label="Secondary-educated youth in SSA by 2035"
          value="↑ 9 pp"
          accent="var(--signal-green)"
          line1="9 percentage point increase in secondary-educated youth"
          source="Wittgenstein Centre 2025 · SSP2"
        />
        <GapStatCard
          label="Current skills infrastructure coverage"
          value="~12%"
          accent="var(--signal-amber)"
          line1="Estimated % of youth with formal skills profiles"
          source="World Bank STEP estimate"
        />
      </div>

      <div
        className="mt-4 rounded-2xl border p-4 md:p-5"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div
          className="text-[12px] font-medium mb-2"
          style={{ color: "var(--ink)" }}
        >
          Infrastructure gap
        </div>
        <div
          className="relative h-3 rounded-sm overflow-hidden"
          style={{
            background:
              "repeating-linear-gradient(45deg, color-mix(in oklab, var(--ink-tertiary) 14%, transparent) 0 4px, transparent 4px 8px)",
            border: "1px dashed var(--border-strong)",
          }}
        >
          <div
            className="h-full origin-left"
            style={{
              width: "12%",
              background: "var(--earth)",
              transform: "scaleX(0)",
              animation:
                "ai-bar-grow 700ms cubic-bezier(0.16,1,0.3,1) 240ms forwards",
            }}
          />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span
            className="text-[11.5px]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Covered today
          </span>
          <span
            className="font-mono text-[11.5px]"
            style={{ color: "var(--ink)" }}
          >
            12% / 100%
          </span>
        </div>
        <p
          className="mt-3 text-[12.5px] leading-relaxed"
          style={{ color: "var(--ink-secondary)" }}
        >
          <strong style={{ color: "var(--ink)" }}>
            88% of secondary-educated youth by 2035
          </strong>{" "}
          will remain unmapped without systems like this.
        </p>
      </div>
    </section>
  );
}

function GapStatCard({
  label,
  value,
  accent,
  line1,
  source,
}: {
  label: string;
  value: string;
  accent: string;
  line1: string;
  source: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div
        className="text-[11.5px] uppercase tracking-[0.06em]"
        style={{ color: "var(--ink-tertiary)" }}
      >
        {label}
      </div>
      <div
        className="font-display mt-2 leading-none"
        style={{ fontSize: 32, color: accent }}
      >
        {value}
      </div>
      <p
        className="mt-3 text-[12.5px]"
        style={{ color: "var(--ink-secondary)" }}
      >
        {line1}
      </p>
      <div
        className="mt-3 pt-2 border-t text-[11px]"
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--ink-tertiary)",
        }}
      >
        {source}
      </div>
    </div>
  );
}

/* ── Region Section 4: HCI comparison row inside DataSignalCard ──── */

function HciComparison() {
  const items: { name: string; score: number; tone: string }[] = [
    { name: "Ghana", score: 0.43, tone: "var(--signal-blue)" },
    { name: "SSA average", score: 0.4, tone: "var(--ink-tertiary)" },
    { name: "High-income avg", score: 0.71, tone: "var(--signal-green)" },
  ];
  return (
    <div className="mt-6 space-y-2.5">
      {items.map((it, i) => (
        <div key={it.name} className="flex items-center gap-3">
          <div
            className="text-[12px] w-32 shrink-0"
            style={{ color: "var(--ink-secondary)" }}
          >
            {it.name}
          </div>
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: "var(--surface-sunken)" }}
          >
            <div
              className="h-full rounded-full origin-left"
              style={{
                width: `${it.score * 100}%`,
                background: it.tone,
                transform: "scaleX(0)",
                animation: `ai-bar-grow 600ms cubic-bezier(0.16,1,0.3,1) ${i * 90 + 200}ms forwards`,
              }}
            />
          </div>
          <span
            className="font-mono text-[12px] w-12 text-right"
            style={{ color: "var(--ink)" }}
          >
            {it.score.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}