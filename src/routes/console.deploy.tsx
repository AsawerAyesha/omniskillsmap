import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Rocket,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Eye,
  EyeOff,
} from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";
import { KIND_META, type DatasetKind } from "@/lib/ingest";

/* /console/deploy — promote draft datasets to live and toggle context status.
 *
 * - Pick a context.
 * - For each kind we show: current LIVE version (if any) + LATEST DRAFT.
 * - "Promote" sets status='live' on the draft. The DB trigger
 *   `demote_previous_live` automatically archives the previous live row.
 * - Toggle the parent context between draft (private) and active (public).
 *   Public dashboard only reads from active contexts × live datasets. */

export const Route = createFileRoute("/console/deploy")({
  component: () => (
    <ConsoleGuard>
      <DeployPage />
    </ConsoleGuard>
  ),
});

interface ContextRow {
  id: string;
  code: string;
  name: string;
  status: "draft" | "active" | "archived";
  flag_emoji: string | null;
}

interface DatasetRow {
  id: string;
  context_id: string;
  kind: DatasetKind;
  version: number;
  status: "draft" | "live" | "archived";
  notes: string | null;
  created_at: string;
  published_at: string | null;
}

interface KindSummary {
  kind: DatasetKind;
  live: DatasetRow | null;
  latestDraft: DatasetRow | null;
}

function DeployPage() {
  const { user } = useConsoleAuth();
  const [contexts, setContexts] = React.useState<ContextRow[] | null>(null);
  const [contextId, setContextId] = React.useState<string>("");
  const [datasets, setDatasets] = React.useState<DatasetRow[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0); // refetch trigger

  // Load contexts
  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("contexts")
        .select("id,code,name,status,flag_emoji")
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      const rows = (data ?? []) as ContextRow[];
      setContexts(rows);
      if (rows.length && !contextId) setContextId(rows[0].id);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load datasets for selected context
  React.useEffect(() => {
    if (!contextId) {
      setDatasets(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("datasets")
        .select(
          "id,context_id,kind,version,status,notes,created_at,published_at",
        )
        .eq("context_id", contextId)
        .order("version", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setDatasets([]);
      } else {
        setDatasets((data ?? []) as DatasetRow[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contextId, tick]);

  const currentContext = contexts?.find((c) => c.id === contextId) ?? null;

  // Group datasets per kind
  const summaries: KindSummary[] = React.useMemo(() => {
    const all = datasets ?? [];
    return (Object.keys(KIND_META) as DatasetKind[]).map((kind) => {
      const ofKind = all.filter((d) => d.kind === kind);
      return {
        kind,
        live: ofKind.find((d) => d.status === "live") ?? null,
        latestDraft:
          ofKind.filter((d) => d.status === "draft").sort((a, b) => b.version - a.version)[0] ??
          null,
      };
    });
  }, [datasets]);

  const refresh = () => setTick((t) => t + 1);

  const promote = async (datasetId: string) => {
    setBusy(datasetId);
    setError(null);
    const { error } = await supabase
      .from("datasets")
      .update({ status: "live" } as never)
      .eq("id", datasetId);
    setBusy(null);
    if (error) {
      setError(error.message);
      return;
    }
    refresh();
  };

  const toggleContextStatus = async () => {
    if (!currentContext) return;
    const next = currentContext.status === "active" ? "draft" : "active";
    setBusy(`ctx-${currentContext.id}`);
    setError(null);
    const { error } = await supabase
      .from("contexts")
      .update({ status: next } as never)
      .eq("id", currentContext.id);
    setBusy(null);
    if (error) {
      setError(error.message);
      return;
    }
    setContexts(
      (contexts ?? []).map((c) =>
        c.id === currentContext.id ? { ...c, status: next } : c,
      ),
    );
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <header className="mb-8">
        <h1
          className="font-display tracking-tight"
          style={{ fontSize: 28, color: "var(--console-fg)" }}
        >
          Deploy
        </h1>
        <p
          className="mt-2 text-sm max-w-prose"
          style={{ color: "var(--console-fg-muted)" }}
        >
          Promote a draft dataset to <strong>live</strong>. The previous live
          version of the same kind will be archived automatically. The public
          dashboard only reads from <strong>active</strong> contexts ×{" "}
          <strong>live</strong> datasets.
        </p>
      </header>

      {/* Context picker + activation */}
      <div
        className="rounded-lg border p-5 mb-6 flex items-center gap-4 flex-wrap"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <div className="flex-1 min-w-[240px]">
          <div
            className="text-xs uppercase tracking-wider mb-1.5"
            style={{ color: "var(--console-fg-faint)" }}
          >
            Context
          </div>
          {contexts === null ? (
            <Loader2 size={14} className="animate-spin" />
          ) : contexts.length === 0 ? (
            <div
              className="text-xs"
              style={{ color: "var(--console-fg-muted)" }}
            >
              No contexts yet —{" "}
              <Link
                to="/console/contexts/new"
                className="underline"
                style={{ color: "var(--console-accent)" }}
              >
                create one
              </Link>
              .
            </div>
          ) : (
            <select
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              className="w-full rounded-md px-3 h-9 text-sm"
              style={{
                background: "var(--console-panel)",
                color: "var(--console-fg)",
                border: "1px solid var(--console-border)",
              }}
            >
              {contexts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag_emoji ?? "🌐"} {c.name} · {c.code}
                </option>
              ))}
            </select>
          )}
        </div>

        {currentContext && (
          <div className="flex items-center gap-3">
            <ContextStatusPill status={currentContext.status} />
            <button
              type="button"
              onClick={toggleContextStatus}
              disabled={busy === `ctx-${currentContext.id}`}
              className="inline-flex items-center gap-1.5 rounded-md px-4 h-9 text-sm font-medium disabled:opacity-50"
              style={
                currentContext.status === "active"
                  ? {
                      background: "var(--console-panel)",
                      color: "var(--console-fg)",
                      border: "1px solid var(--console-border)",
                    }
                  : {
                      background: "var(--earth-dark)",
                      color: "var(--earth-light)",
                    }
              }
            >
              {busy === `ctx-${currentContext.id}` && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {currentContext.status === "active" ? (
                <>
                  <EyeOff size={13} /> Take offline
                </>
              ) : (
                <>
                  <Eye size={13} /> Activate (go public)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          className="mb-4 flex items-start gap-2 rounded-md border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--console-danger)",
            color: "var(--console-danger)",
            background: "var(--console-canvas)",
          }}
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Per-kind table */}
      {currentContext && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            borderColor: "var(--console-border)",
            background: "var(--console-canvas)",
          }}
        >
          <table className="w-full text-sm">
            <thead
              className="text-xs uppercase tracking-wider"
              style={{
                color: "var(--console-fg-faint)",
                background: "var(--console-panel)",
              }}
            >
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Dataset kind</th>
                <th className="text-left px-4 py-2.5 font-medium">Live</th>
                <th className="text-left px-4 py-2.5 font-medium">Latest draft</th>
                <th className="text-right px-4 py-2.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr
                  key={s.kind}
                  className="border-t"
                  style={{ borderColor: "var(--console-border)" }}
                >
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--console-fg)" }}
                  >
                    <div className="font-medium">{KIND_META[s.kind].label}</div>
                    <div
                      className="text-xs mt-0.5 font-mono"
                      style={{ color: "var(--console-fg-faint)" }}
                    >
                      {s.kind}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--console-fg-muted)" }}
                  >
                    {s.live ? (
                      <div>
                        <div style={{ color: "var(--console-fg)" }}>
                          v{s.live.version}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {s.live.published_at
                            ? `Published ${new Date(s.live.published_at).toLocaleDateString()}`
                            : "—"}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--console-fg-faint)" }}>—</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--console-fg-muted)" }}
                  >
                    {s.latestDraft ? (
                      <div>
                        <div style={{ color: "var(--console-fg)" }}>
                          v{s.latestDraft.version}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {s.latestDraft.notes ?? "Uploaded draft"}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--console-fg-faint)" }}>
                        No draft —{" "}
                        <Link
                          to="/console/datasets"
                          className="underline"
                          style={{ color: "var(--console-accent)" }}
                        >
                          ingest
                        </Link>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.latestDraft ? (
                      <button
                        type="button"
                        onClick={() => promote(s.latestDraft!.id)}
                        disabled={busy === s.latestDraft.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium disabled:opacity-50"
                        style={{
                          background: "var(--earth-dark)",
                          color: "var(--earth-light)",
                        }}
                        title={
                          s.live
                            ? `This will replace live v${s.live.version} with v${s.latestDraft.version}`
                            : `Promote v${s.latestDraft.version} to live`
                        }
                      >
                        {busy === s.latestDraft.id && (
                          <Loader2 size={11} className="animate-spin" />
                        )}
                        <Rocket size={11} />
                        {s.live ? "Replace live" : "Promote"}
                      </button>
                    ) : (
                      <span style={{ color: "var(--console-fg-faint)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Public link reminder */}
      {currentContext?.status === "active" && (
        <div
          className="mt-4 flex items-center gap-2 text-xs"
          style={{ color: "var(--console-fg-muted)" }}
        >
          <Globe2 size={12} /> This context is public. Open the{" "}
          <Link
            to="/"
            className="underline"
            style={{ color: "var(--console-accent)" }}
          >
            home dashboard
          </Link>{" "}
          to verify live data.
        </div>
      )}

      {/* All-datasets history (last 20) */}
      {datasets && datasets.length > 0 && (
        <details className="mt-8">
          <summary
            className="cursor-pointer text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
            style={{ color: "var(--console-fg-faint)" }}
          >
            <ArrowRight size={11} /> All dataset versions ({datasets.length})
          </summary>
          <div
            className="mt-3 rounded-md border overflow-auto max-h-72"
            style={{ borderColor: "var(--console-border)" }}
          >
            <table className="w-full text-xs">
              <thead
                style={{
                  background: "var(--console-panel)",
                  color: "var(--console-fg-faint)",
                }}
              >
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Kind</th>
                  <th className="text-left px-3 py-2 font-medium">Version</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Created</th>
                  <th className="text-left px-3 py-2 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {datasets.slice(0, 50).map((d) => (
                  <tr
                    key={d.id}
                    className="border-t"
                    style={{ borderColor: "var(--console-border)" }}
                  >
                    <td
                      className="px-3 py-1.5 font-mono"
                      style={{ color: "var(--console-fg-muted)" }}
                    >
                      {d.kind}
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ color: "var(--console-fg)" }}
                    >
                      v{d.version}
                    </td>
                    <td className="px-3 py-1.5">
                      <DatasetStatusPill status={d.status} />
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ color: "var(--console-fg-faint)" }}
                    >
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ color: "var(--console-fg-faint)" }}
                    >
                      {d.published_at
                        ? new Date(d.published_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

function ContextStatusPill({
  status,
}: {
  status: ContextRow["status"];
}) {
  const tone =
    status === "active"
      ? { bg: "var(--earth-dark)", fg: "var(--earth-light)" }
      : status === "archived"
        ? { bg: "var(--console-panel)", fg: "var(--console-fg-faint)" }
        : { bg: "var(--console-panel)", fg: "var(--console-fg-muted)" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {status === "active" ? "Live · public" : status}
    </span>
  );
}

function DatasetStatusPill({
  status,
}: {
  status: DatasetRow["status"];
}) {
  const tone =
    status === "live"
      ? { bg: "var(--earth-dark)", fg: "var(--earth-light)" }
      : status === "archived"
        ? { bg: "var(--console-panel)", fg: "var(--console-fg-faint)" }
        : { bg: "var(--console-panel)", fg: "var(--console-fg-muted)" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {status}
    </span>
  );
}