import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  X,
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";

/* C6 — Live Monitor Dashboard.
 *
 * Operator-facing operational view. This screen forces a dark palette
 * regardless of the global console theme, because the operator mental
 * model here is "operations / signals" — analogous to a NOC / pipeline
 * monitor. All surfaces are derived from a small inline token set so the
 * visual language is consistent across cards, tables and charts. */

export const Route = createFileRoute("/console/monitor")({
  component: () => (
    <ConsoleGuard>
      <MonitorScreen />
    </ConsoleGuard>
  ),
});

/* ---------- Dark-mode token set (scoped to this screen) ---------- */
const T = {
  bg: "#111009",
  card: "#1C1A16",
  cardElev: "#221F1A",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  fg: "#F0EDE8",
  fgMuted: "rgba(240,237,232,0.65)",
  fgFaint: "rgba(240,237,232,0.42)",
  earth: "#C4A882",
  earthDeep: "#7A6548",
  teal: "#3FB8AF",
  amber: "#E0A458",
  red: "#D9534F",
  green: "#6FCF97",
  purple: "#A689D6",
  gray: "#6B6560",
  grid: "rgba(255,255,255,0.06)",
  axis: "#6B6560",
};

/* ---------- Mock operational data ---------- */

const profilesSeries = [
  { d: "Apr 13", v: 62 },
  { d: "Apr 14", v: 78 },
  { d: "Apr 15", v: 84 },
  { d: "Apr 16", v: 71 },
  { d: "Apr 17", v: 95 },
  { d: "Apr 18", v: 88 },
  { d: "Apr 19", v: 102 },
  { d: "Apr 20", v: 96 },
  { d: "Apr 21", v: 110 },
  { d: "Apr 22", v: 121 },
  { d: "Apr 23", v: 117 },
  { d: "Apr 24", v: 134 },
  { d: "Apr 25", v: 128 },
  { d: "Apr 26", v: 142 },
];

const opportunityBars = [
  { name: "Formal employment", value: 412 },
  { name: "Vocational training", value: 367 },
  { name: "Self-employment", value: 284 },
  { name: "Gig work", value: 184 },
];

interface PipelineRun {
  id: string;
  name: string;
  context: string;
  status: "success" | "partial" | "failed";
  records: string;
  duration: string;
  triggered: "Scheduled" | "Manual";
}

const PIPELINES: PipelineRun[] = [
  {
    id: "p1",
    name: "ILO ILOSTAT ingest",
    context: "Ghana Urban",
    status: "success",
    records: "847",
    duration: "34s",
    triggered: "Scheduled",
  },
  {
    id: "p2",
    name: "World Bank WDI",
    context: "Ghana Urban",
    status: "success",
    records: "312",
    duration: "12s",
    triggered: "Scheduled",
  },
  {
    id: "p3",
    name: "ESCO taxonomy sync",
    context: "All contexts",
    status: "success",
    records: "4,231",
    duration: "2m 14s",
    triggered: "Manual",
  },
  {
    id: "p4",
    name: "ILO ILOSTAT ingest",
    context: "Bangladesh Rural",
    status: "partial",
    records: "203",
    duration: "41s",
    triggered: "Scheduled",
  },
];

interface Activity {
  id: string;
  message: string;
  ago: string;
  color: string;
}

const ACTIVITY: Activity[] = [
  { id: "a1", message: "Pipeline sync complete (ILO Ghana)", ago: "2h ago", color: T.teal },
  { id: "a2", message: "14 new profiles generated", ago: "3h ago", color: T.purple },
  { id: "a3", message: "Pipeline sync complete (WDI Ghana)", ago: "6h ago", color: T.teal },
  { id: "a4", message: "New context 'Bangladesh Rural' deployed", ago: "1d ago", color: T.earth },
  { id: "a5", message: "Custom wage CSV re-uploaded (Ghana)", ago: "2d ago", color: T.amber },
  { id: "a6", message: "API key rotated by admin@ministry.gov.gh", ago: "3d ago", color: T.gray },
];

/* ---------- Screen ---------- */

function MonitorScreen() {
  const [alertOpen, setAlertOpen] = React.useState(true);

  return (
    <div
      className="min-h-full"
      style={{ background: T.bg, color: T.fg }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 space-y-6">
        {/* Page header */}
        <header className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1
              className="font-display tracking-tight"
              style={{ fontSize: 28, lineHeight: 1.15, color: T.fg }}
            >
              Live monitor
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: T.fgMuted }}>
              Operational health of your UNMAPPED deployments. Auto-refreshes every 60s.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] px-2.5 py-1.5 rounded-full"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.fgMuted }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: T.green }}
              />
              Live
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.fg }}
            >
              <RefreshCw size={12} strokeWidth={1.75} />
              Refresh
            </button>
          </div>
        </header>

        {/* Conditional alert banner */}
        {alertOpen && (
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{
              background: "rgba(224,164,88,0.08)",
              border: `1px solid rgba(224,164,88,0.35)`,
            }}
          >
            <AlertTriangle
              size={18}
              strokeWidth={1.75}
              className="shrink-0 mt-0.5"
              style={{ color: T.amber }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm" style={{ color: T.fg }}>
                <span style={{ color: T.amber, fontWeight: 500 }}>
                  Bangladesh Rural context:
                </span>{" "}
                ILO data sync returned only 203 of expected ~600 records. Youth
                unemployment rate unavailable for this context.
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md"
                  style={{ background: T.amber, color: "#1A1410", fontWeight: 500 }}
                >
                  <RefreshCw size={11} strokeWidth={2} />
                  Retry pipeline
                </button>
                <a
                  href="#"
                  className="text-xs underline-offset-4 hover:underline"
                  style={{ color: T.amber }}
                >
                  Add manual data →
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAlertOpen(false)}
              aria-label="Dismiss alert"
              className="p-1 rounded transition-colors -mr-1 -mt-1"
              style={{ color: T.fgMuted }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Metrics row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Active profiles"
            value="1,247"
            sub="+84 this week"
            subColor={T.green}
            display
          />
          <MetricCard
            label="Data freshness"
            value="2h · 6h"
            sub="ILO: 2h ago · WDI: 6h ago"
            subColor={T.teal}
          />
          <MetricCard
            label="Avg. profile generation"
            value="18s"
            sub="median over 24h"
            subColor={T.teal}
            display
          />
          <MetricCard
            label="Pipeline health"
            value="3 / 4"
            sub={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: T.amber }}
                />
                1 pipeline partial
              </span>
            }
            subColor={T.amber}
          />
        </section>

        {/* Context status cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ContextCard
            flag="🇬🇭"
            name="Ghana Urban 2024"
            profiles="934"
            opportunities="1,128"
            occupation="Electrical installer"
            sources={[
              { label: "ILO", color: T.green },
              { label: "WDI", color: T.green },
              { label: "ESCO", color: T.green },
            ]}
            lastRun="2h ago — 847 records synced"
          />
          <ContextCard
            flag="🇧🇩"
            name="Bangladesh Rural 2024"
            profiles="313"
            opportunities="402"
            occupation="Garment machinist"
            sources={[
              { label: "ILO", color: T.amber },
              { label: "WDI", color: T.green },
              { label: "ESCO", color: T.green },
            ]}
            lastRun="2h ago — 203 records synced"
          />
        </section>

        {/* Pipeline + Activity grid */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <PipelineTable runs={PIPELINES} />
          <ActivityFeed items={ACTIVITY} />
        </section>

        {/* Usage analytics */}
        <section
          className="rounded-lg p-5"
          style={{ background: T.card, border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-medium" style={{ color: T.fg }}>
                Usage analytics
              </h2>
              <p className="text-xs mt-0.5" style={{ color: T.fgFaint }}>
                Aggregated across all deployed contexts.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors"
              style={{ background: T.cardElev, border: `1px solid ${T.border}`, color: T.fg }}
            >
              <Download size={12} strokeWidth={1.75} />
              Export usage report (CSV)
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line chart */}
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.12em] mb-3"
                style={{ color: T.fgFaint }}
              >
                Profile generations · 14 days
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={profilesSeries}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid stroke={T.grid} vertical={false} />
                    <XAxis
                      dataKey="d"
                      tick={{ fill: T.axis, fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: T.border }}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fill: T.axis, fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: T.border }}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: T.cardElev,
                        border: `1px solid ${T.borderStrong}`,
                        borderRadius: 6,
                        color: T.fg,
                        fontSize: 12,
                      }}
                      cursor={{ stroke: T.borderStrong, strokeDasharray: "3 3" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={T.earth}
                      strokeWidth={2}
                      dot={{ r: 2, fill: T.earth, strokeWidth: 0 }}
                      activeDot={{ r: 4, fill: T.earth }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart */}
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.12em] mb-3"
                style={{ color: T.fgFaint }}
              >
                Profiles by opportunity type
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={opportunityBars}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid stroke={T.grid} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: T.axis, fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: T.border }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: T.fgMuted, fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: T.border }}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        background: T.cardElev,
                        border: `1px solid ${T.borderStrong}`,
                        borderRadius: 6,
                        color: T.fg,
                        fontSize: 12,
                      }}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="value" fill={T.teal} radius={[0, 3, 3, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function MetricCard({
  label,
  value,
  sub,
  subColor,
  display = false,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  subColor: string;
  display?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.12em]"
        style={{ color: T.fgFaint }}
      >
        {label}
      </div>
      <div
        className={display ? "font-display tracking-tight mt-2" : "font-display tracking-tight mt-2"}
        style={{
          fontSize: display ? 40 : 26,
          lineHeight: 1.05,
          color: T.fg,
        }}
      >
        {value}
      </div>
      <div className="text-[12px] mt-2" style={{ color: subColor }}>
        {sub}
      </div>
    </div>
  );
}

function ContextCard({
  flag,
  name,
  profiles,
  opportunities,
  occupation,
  sources,
  lastRun,
}: {
  flag: string;
  name: string;
  profiles: string;
  opportunities: string;
  occupation: string;
  sources: Array<{ label: string; color: string }>;
  lastRun: string;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-md flex items-center justify-center text-lg"
          style={{ background: T.cardElev, border: `1px solid ${T.border}` }}
          aria-hidden
        >
          {flag}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: T.fg }}>
            {name}
          </div>
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded mt-1"
            style={{
              background: "rgba(111,207,151,0.12)",
              color: T.green,
            }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: T.green }}
            />
            Active
          </span>
        </div>
        <a
          href="#"
          className="text-xs inline-flex items-center gap-1 hover:underline underline-offset-4"
          style={{ color: T.earth }}
        >
          View <ArrowRight size={11} />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <Stat label="Profiles (wk)" value={profiles} />
        <Stat label="Matched" value={opportunities} />
        <Stat label="Top match" value={occupation} small />
      </div>

      <div
        className="flex items-center gap-3 mt-4 pt-4"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <div className="flex items-center gap-2">
          {sources.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider"
              style={{ color: T.fgMuted }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs" style={{ color: T.fgFaint }}>
          Last run: <span style={{ color: T.fgMuted }}>{lastRun}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors"
          style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.fg }}
        >
          <RefreshCw size={11} strokeWidth={1.75} />
          Sync now
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-[0.10em]"
        style={{ color: T.fgFaint }}
      >
        {label}
      </div>
      <div
        className="mt-1 truncate"
        style={{
          fontSize: small ? 13 : 18,
          fontWeight: small ? 400 : 500,
          color: T.fg,
        }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function PipelineTable({ runs }: { runs: PipelineRun[] }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <div>
          <h2 className="text-sm font-medium" style={{ color: T.fg }}>
            Pipeline runs — last 7 days
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: T.fgFaint }}>
            All scheduled and manual ingest runs across deployed contexts.
          </p>
        </div>
        <a
          href="#"
          className="text-xs inline-flex items-center gap-1 hover:underline underline-offset-4"
          style={{ color: T.earth }}
        >
          Pipeline settings <ExternalLink size={11} />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: T.cardElev }}>
              {[
                "Pipeline",
                "Context",
                "Status",
                "Records",
                "Duration",
                "Triggered",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] font-medium"
                  style={{ color: T.fgFaint }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const partial = r.status === "partial";
              const failed = r.status === "failed";
              return (
                <tr
                  key={r.id}
                  style={{
                    borderTop: `1px solid ${T.border}`,
                    boxShadow: partial
                      ? `inset 3px 0 0 ${T.amber}`
                      : failed
                        ? `inset 3px 0 0 ${T.red}`
                        : undefined,
                  }}
                >
                  <td className="px-4 py-3" style={{ color: T.fg }}>
                    {r.name}
                  </td>
                  <td className="px-4 py-3" style={{ color: T.fgMuted }}>
                    {r.context}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td
                    className="px-4 py-3 font-mono"
                    style={{ color: T.fg, fontSize: 12 }}
                  >
                    {r.records}
                  </td>
                  <td
                    className="px-4 py-3 font-mono"
                    style={{ color: T.fgMuted, fontSize: 12 }}
                  >
                    {r.duration}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: T.fgFaint }}
                  >
                    {r.triggered}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href="#"
                        className="text-xs hover:underline underline-offset-4"
                        style={{ color: T.earth }}
                      >
                        View logs
                      </a>
                      {partial && (
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded-md"
                          style={{
                            background: "rgba(224,164,88,0.12)",
                            color: T.amber,
                            border: `1px solid rgba(224,164,88,0.30)`,
                          }}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: PipelineRun["status"] }) {
  if (status === "success") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded"
        style={{ background: "rgba(111,207,151,0.10)", color: T.green }}
      >
        <CheckCircle2 size={11} strokeWidth={2} />
        Success
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded"
        style={{ background: "rgba(224,164,88,0.12)", color: T.amber }}
      >
        <AlertTriangle size={11} strokeWidth={2} />
        Partial
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded"
      style={{ background: "rgba(217,83,79,0.14)", color: T.red }}
    >
      <AlertCircle size={11} strokeWidth={2} />
      Failed
    </span>
  );
}

function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <aside
      className="rounded-lg flex flex-col"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      <div
        className="px-5 py-4"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <h2 className="text-sm font-medium" style={{ color: T.fg }}>
          Recent activity
        </h2>
      </div>
      <ol className="flex-1 px-5 py-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-start gap-2.5 py-2.5"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
              style={{ background: a.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] leading-snug" style={{ color: T.fg }}>
                {a.message}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: T.fgFaint }}>
                {a.ago}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="px-5 py-3" style={{ borderTop: `1px solid ${T.border}` }}>
        <Link
          to="/console"
          className="text-xs hover:underline underline-offset-4 inline-flex items-center gap-1"
          style={{ color: T.earth }}
        >
          View full audit log <ArrowRight size={11} />
        </Link>
      </div>
    </aside>
  );
}