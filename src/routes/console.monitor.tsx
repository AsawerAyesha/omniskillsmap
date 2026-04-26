import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Database,
  Clock,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";
import { supabase } from "@/integrations/supabase/client";

/* C6 — Real ingestion monitor backed by ingestion_runs.
 *
 * Lists every CSV upload across contexts the operator can see, with row
 * counts, error details, the actor, and a link to the underlying dataset
 * version. This is the audit / lineage surface for the protocol layer. */

export const Route = createFileRoute("/console/monitor")({
  component: () => (
    <ConsoleGuard>
      <MonitorScreen />
    </ConsoleGuard>
  ),
});

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
  teal: "#3FB8AF",
  amber: "#E0A458",
  red: "#D9534F",
  green: "#6FCF97",
};

interface Context {
  id: string;
  code: string;
  name: string;
  flag_emoji: string | null;
}

interface Dataset {
  id: string;
  kind: string;
  version: number;
  status: string;
}

interface IngestionError {
  row?: number;
  message?: string;
  field?: string;
  [k: string]: unknown;
}

interface Run {
  id: string;
  context_id: string;
  dataset_id: string | null;
  kind: string;
  file_name: string | null;
  rows_in: number;
  rows_ok: number;
  rows_err: number;
  errors: IngestionError[];
  actor_id: string;
  created_at: string;
}

const KIND_LABEL: Record<string, string> = {
  taxonomy: "Taxonomy",
  occupations: "Occupations",
  labor: "Labor indicators",
  opportunities: "Opportunities",
  learning: "Learning resources",
};

function MonitorScreen() {
  const [contexts, setContexts] = React.useState<Context[]>([]);
  const [contextId, setContextId] = React.useState<string>("");
  const [runs, setRuns] = React.useState<Run[]>([]);
  const [datasets, setDatasets] = React.useState<Dataset[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("contexts")
        .select("id, code, name, flag_emoji")
        .order("name");
      const rows = (data ?? []) as Context[];
      setContexts(rows);
      if (rows.length && !contextId) setContextId(rows[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = React.useCallback(async () => {
    if (!contextId) return;
    setLoading(true);
    const [runsRes, dsRes] = await Promise.all([
      supabase
        .from("ingestion_runs")
        .select(
          "id, context_id, dataset_id, kind, file_name, rows_in, rows_ok, rows_err, errors, actor_id, created_at"
        )
        .eq("context_id", contextId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("datasets")
        .select("id, kind, version, status")
        .eq("context_id", contextId),
    ]);
    setRuns((runsRes.data ?? []) as unknown as Run[]);
    setDatasets((dsRes.data ?? []) as Dataset[]);
    setLoading(false);
  }, [contextId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const dsMap = React.useMemo(() => {
    const m = new Map<string, Dataset>();
    for (const d of datasets) m.set(d.id, d);
    return m;
  }, [datasets]);

  // Aggregate stats
  const stats = React.useMemo(() => {
    const total = runs.length;
    const ok = runs.filter((r) => r.rows_err === 0 && r.rows_ok > 0).length;
    const partial = runs.filter((r) => r.rows_err > 0 && r.rows_ok > 0).length;
    const failed = runs.filter((r) => r.rows_ok === 0 && r.rows_err > 0).length;
    const totalRows = runs.reduce((acc, r) => acc + r.rows_ok, 0);
    return { total, ok, partial, failed, totalRows };
  }, [runs]);

  return (
    <div className="min-h-full" style={{ background: T.bg, color: T.fg }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 space-y-6">
        <header className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <Link
              to="/console"
              className="inline-flex items-center gap-1.5 text-xs mb-3"
              style={{ color: T.fgMuted }}
            >
              <ArrowLeft size={12} />
              Workspace
            </Link>
            <h1
              className="font-display tracking-tight"
              style={{ fontSize: 28, lineHeight: 1.15, color: T.fg }}
            >
              Ingestion monitor
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: T.fgMuted }}>
              Every CSV upload, validated rows, and errors per context.
              Audit trail is append-only.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md outline-none"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                color: T.fg,
              }}
            >
              {contexts.length === 0 && <option value="">No contexts</option>}
              {contexts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag_emoji ? `${c.flag_emoji} ` : ""}
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                color: T.fg,
              }}
            >
              <RefreshCw
                size={12}
                strokeWidth={1.75}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <Metric label="Runs" value={stats.total.toString()} sub="all time" subColor={T.fgMuted} />
          <Metric label="Successful" value={stats.ok.toString()} sub="0 errors" subColor={T.green} />
          <Metric label="Partial" value={stats.partial.toString()} sub="some rows rejected" subColor={T.amber} />
          <Metric label="Failed" value={stats.failed.toString()} sub="0 rows committed" subColor={T.red} />
          <Metric
            label="Rows committed"
            value={stats.totalRows.toLocaleString()}
            sub="across all kinds"
            subColor={T.teal}
          />
        </section>

        {/* Runs table */}
        <section
          className="rounded-lg overflow-hidden"
          style={{ background: T.card, border: `1px solid ${T.border}` }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <h2 className="text-sm font-medium" style={{ color: T.fg }}>
              Ingestion runs
            </h2>
            <span className="text-[11px]" style={{ color: T.fgFaint }}>
              latest 200
            </span>
          </div>

          {runs.length === 0 ? (
            <div
              className="px-5 py-10 text-center text-sm"
              style={{ color: T.fgMuted }}
            >
              {loading
                ? "Loading…"
                : "No ingestion runs yet for this context. Upload a CSV from the Ingest data screen."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-[11px] uppercase tracking-[0.1em]"
                    style={{ color: T.fgFaint, background: T.cardElev }}
                  >
                    <Th />
                    <Th>When</Th>
                    <Th>Kind</Th>
                    <Th>File</Th>
                    <Th>Dataset</Th>
                    <Th align="right">In</Th>
                    <Th align="right">OK</Th>
                    <Th align="right">Err</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const open = expanded === r.id;
                    const status = runStatus(r);
                    const ds = r.dataset_id ? dsMap.get(r.dataset_id) : null;
                    return (
                      <React.Fragment key={r.id}>
                        <tr
                          className="cursor-pointer hover:bg-white/[0.02]"
                          style={{ borderTop: `1px solid ${T.border}` }}
                          onClick={() => setExpanded(open ? null : r.id)}
                        >
                          <Td>
                            {open ? (
                              <ChevronDown size={14} style={{ color: T.fgMuted }} />
                            ) : (
                              <ChevronRight size={14} style={{ color: T.fgMuted }} />
                            )}
                          </Td>
                          <Td>
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{ color: T.fgMuted }}
                            >
                              <Clock size={11} />
                              {formatDate(r.created_at)}
                            </span>
                          </Td>
                          <Td>
                            <span style={{ color: T.fg }}>
                              {KIND_LABEL[r.kind] ?? r.kind}
                            </span>
                          </Td>
                          <Td>
                            <span
                              className="font-mono text-xs"
                              style={{ color: T.fgMuted }}
                            >
                              {r.file_name ?? "—"}
                            </span>
                          </Td>
                          <Td>
                            {ds ? (
                              <span
                                className="inline-flex items-center gap-1.5 text-xs"
                                style={{ color: T.fgMuted }}
                              >
                                <Database size={11} />v{ds.version}{" "}
                                <Badge status={ds.status} />
                              </span>
                            ) : (
                              <span style={{ color: T.fgFaint }}>—</span>
                            )}
                          </Td>
                          <Td align="right">
                            <span style={{ color: T.fg }}>{r.rows_in}</span>
                          </Td>
                          <Td align="right">
                            <span style={{ color: T.green }}>{r.rows_ok}</span>
                          </Td>
                          <Td align="right">
                            <span
                              style={{
                                color: r.rows_err > 0 ? T.red : T.fgFaint,
                              }}
                            >
                              {r.rows_err}
                            </span>
                          </Td>
                          <Td>
                            <StatusPill status={status} />
                          </Td>
                        </tr>
                        {open && (
                          <tr style={{ background: T.cardElev }}>
                            <td colSpan={9} className="px-5 py-4">
                              <RunDetail run={r} actorId={r.actor_id} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function Metric({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub: string;
  subColor: string;
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
        className="font-display tracking-tight mt-2"
        style={{ fontSize: 26, lineHeight: 1.05, color: T.fg }}
      >
        {value}
      </div>
      <div className="text-[12px] mt-2" style={{ color: subColor }}>
        {sub}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="px-4 py-2.5 font-medium"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td className="px-4 py-3" style={{ textAlign: align }}>
      {children}
    </td>
  );
}

function Badge({ status }: { status: string }) {
  const color =
    status === "live" ? T.green : status === "draft" ? T.amber : T.fgFaint;
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider"
      style={{
        color,
        border: `1px solid ${color}`,
        opacity: 0.85,
      }}
    >
      {status}
    </span>
  );
}

type RunStatus = "success" | "partial" | "failed" | "empty";

function runStatus(r: Run): RunStatus {
  if (r.rows_in === 0) return "empty";
  if (r.rows_ok === 0 && r.rows_err > 0) return "failed";
  if (r.rows_err > 0) return "partial";
  return "success";
}

function StatusPill({ status }: { status: RunStatus }) {
  const map: Record<RunStatus, { label: string; color: string; Icon: React.ComponentType<{ size?: number }> }> = {
    success: { label: "Success", color: T.green, Icon: CheckCircle2 },
    partial: { label: "Partial", color: T.amber, Icon: AlertCircle },
    failed: { label: "Failed", color: T.red, Icon: XCircle },
    empty: { label: "Empty", color: T.fgFaint, Icon: AlertCircle },
  };
  const { label, color, Icon } = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}40`,
      }}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

function RunDetail({ run, actorId }: { run: Run; actorId: string }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <DetailRow label="Run ID" value={run.id} mono />
        <DetailRow label="Actor" value={actorId} mono />
        <DetailRow
          label="Dataset ID"
          value={run.dataset_id ?? "—"}
          mono
        />
      </div>

      {run.errors && run.errors.length > 0 ? (
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.12em] mb-2"
            style={{ color: T.fgFaint }}
          >
            Validation errors ({run.errors.length})
          </div>
          <div
            className="rounded-md overflow-hidden"
            style={{ border: `1px solid ${T.border}` }}
          >
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr
                    style={{ background: T.bg, color: T.fgFaint }}
                    className="text-[10px] uppercase tracking-wider"
                  >
                    <th className="px-3 py-2 text-left w-16">Row</th>
                    <th className="px-3 py-2 text-left w-32">Field</th>
                    <th className="px-3 py-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {run.errors.slice(0, 200).map((e, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: `1px solid ${T.border}` }}
                    >
                      <td className="px-3 py-1.5" style={{ color: T.amber }}>
                        {e.row ?? "—"}
                      </td>
                      <td
                        className="px-3 py-1.5 font-mono"
                        style={{ color: T.fgMuted }}
                      >
                        {e.field ?? "—"}
                      </td>
                      <td className="px-3 py-1.5" style={{ color: T.fg }}>
                        {e.message ?? JSON.stringify(e)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {run.errors.length > 200 && (
            <div
              className="text-[11px] mt-1.5"
              style={{ color: T.fgFaint }}
            >
              Showing first 200 of {run.errors.length} errors.
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs" style={{ color: T.fgMuted }}>
          No validation errors recorded.
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-[0.12em] mb-1"
        style={{ color: T.fgFaint }}
      >
        {label}
      </div>
      <div
        className={mono ? "font-mono break-all" : ""}
        style={{ color: T.fg, fontSize: 11 }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
