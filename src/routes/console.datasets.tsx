import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Upload,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  ArrowRight,
} from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";
import {
  KIND_META,
  validateCsv,
  type DatasetKind,
  type ParseResult,
} from "@/lib/ingest";

/* /console/datasets — ingestion surface.
 * Operator picks a context + dataset kind, uploads a CSV. We validate every
 * row with Zod, surface errors inline, then on commit:
 *   1. Insert a draft `datasets` row (next version number for that kind).
 *   2. Bulk-insert validated rows into the kind's child table.
 *   3. Append one `ingestion_runs` audit row.
 * RLS gates everything — only context editors can write. */

export const Route = createFileRoute("/console/datasets")({
  component: () => (
    <ConsoleGuard>
      <DatasetsPage />
    </ConsoleGuard>
  ),
});

/* Stream a File via ReadableStream so we can report read progress. Falls back
 * to f.text() when streams are unavailable. */
async function readFileWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  if (!file.stream) {
    onProgress(100);
    return file.text();
  }
  const total = file.size || 1;
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8");
  let received = 0;
  let text = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    text += decoder.decode(value, { stream: true });
    onProgress(Math.min(99, Math.round((received / total) * 100)));
  }
  text += decoder.decode();
  onProgress(100);
  return text;
}

interface ContextRow {
  id: string;
  code: string;
  name: string;
  flag_emoji: string | null;
}

/* Per-kind unique constraints (must match the DB indexes). Used to dedupe
 * rows before upserting so Postgres doesn't see two rows with the same
 * conflict target in a single payload. */
const UNIQUE_KEYS: Partial<Record<DatasetKind, string[]>> = {
  taxonomy: ["dataset_id", "code"],
  occupations: ["dataset_id", "code"],
  labor: ["dataset_id", "indicator_code", "year", "sex", "age_band"],
};

function dedupeBy<T extends Record<string, unknown>>(
  rows: T[],
  keys: string[],
): T[] {
  const seen = new Map<string, T>();
  for (const row of rows) {
    const k = keys.map((c) => String(row[c] ?? "∅")).join("│");
    seen.set(k, row); // last-wins
  }
  return Array.from(seen.values());
}

function DatasetsPage() {
  const { user } = useConsoleAuth();
  const [contexts, setContexts] = React.useState<ContextRow[] | null>(null);
  const [contextId, setContextId] = React.useState<string>("");
  const [kind, setKind] = React.useState<DatasetKind>("taxonomy");
  const [fileName, setFileName] = React.useState<string>("");
  const [csvText, setCsvText] = React.useState<string>("");
  const [result, setResult] = React.useState<ParseResult<unknown> | null>(null);
  const [committing, setCommitting] = React.useState(false);
  const [committed, setCommitted] = React.useState<{
    dataset_id: string;
    version: number;
    inserted: number;
  } | null>(null);
  const [commitError, setCommitError] = React.useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = React.useState<
    "idle" | "reading" | "validating" | "done"
  >("idle");
  const [uploadPct, setUploadPct] = React.useState(0);
  const [commitPhase, setCommitPhase] = React.useState<
    "idle" | "creating" | "inserting" | "logging" | "done"
  >("idle");
  const [commitPct, setCommitPct] = React.useState(0);
  const [commitProgress, setCommitProgress] = React.useState<{
    inserted: number;
    total: number;
  }>({ inserted: 0, total: 0 });

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("contexts")
        .select("id,code,name,flag_emoji")
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

  const meta = KIND_META[kind];

  const onFile = async (f: File) => {
    setFileName(f.name);
    setCommitted(null);
    setCommitError(null);
    setResult(null);
    setUploadPhase("reading");
    setUploadPct(0);

    // Stream the file so we can show real read progress for large CSVs.
    const text = await readFileWithProgress(f, (pct) => setUploadPct(pct));
    setCsvText(text);

    setUploadPhase("validating");
    setUploadPct(100);
    // Yield to the browser so the progress bar can paint before we block on parse.
    await new Promise((r) => setTimeout(r, 30));
    const r = validateCsv(text, meta.schema as never);
    setResult(r as ParseResult<unknown>);
    setUploadPhase("done");
  };

  // Re-validate when kind changes
  React.useEffect(() => {
    if (!csvText) return;
    const r = validateCsv(csvText, meta.schema as never);
    setResult(r as ParseResult<unknown>);
    setCommitted(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const downloadExample = () => {
    const blob = new Blob([meta.example], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-example.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onCommit = async () => {
    if (!user || !contextId || !result || result.ok.length === 0) return;
    setCommitting(true);
    setCommitError(null);
    setCommitPhase("creating");
    setCommitPct(0);
    setCommitProgress({ inserted: 0, total: result.ok.length });

    // 1. Determine next version
    const { data: prev } = await supabase
      .from("datasets")
      .select("version")
      .eq("context_id", contextId)
      .eq("kind", kind)
      .order("version", { ascending: false })
      .limit(1);
    const nextVersion = (prev?.[0]?.version ?? 0) + 1;

    // 2. Insert draft dataset
    const { data: ds, error: dsErr } = await supabase
      .from("datasets")
      .insert({
        context_id: contextId,
        kind,
        version: nextVersion,
        status: "draft",
        notes: `Uploaded ${fileName}`,
        created_by: user.id,
      } as never)
      .select("id, version")
      .single();

    if (dsErr || !ds) {
      setCommitError(dsErr?.message ?? "Failed to create dataset");
      setCommitting(false);
      setCommitPhase("idle");
      return;
    }

    // 3. Bulk insert child rows (chunked for safety)
    const rowsWithDataset = (result.ok as Record<string, unknown>[]).map((r) => ({
      ...r,
      dataset_id: ds.id,
    }));

    // Deduplicate within the CSV against the table's unique key. Postgres
    // upsert can't accept two rows with the same conflict target in a single
    // payload, so we collapse them client-side first (last-wins).
    const conflictCols = UNIQUE_KEYS[kind];
    const dedupedRows = conflictCols
      ? dedupeBy(rowsWithDataset, conflictCols)
      : rowsWithDataset;
    const droppedDuplicates = rowsWithDataset.length - dedupedRows.length;

    setCommitPhase("inserting");
    const CHUNK = 500;
    for (let i = 0; i < dedupedRows.length; i += CHUNK) {
      const chunk = dedupedRows.slice(i, i + CHUNK);
      const query = supabase.from(meta.table as never);
      const { error: rowErr } = conflictCols
        ? await query.upsert(chunk as never, {
            onConflict: conflictCols.join(","),
            ignoreDuplicates: false,
          })
        : await query.insert(chunk as never);
      if (rowErr) {
        setCommitError(`Row insert failed at row ${i + 1}: ${rowErr.message}`);
        // Best-effort: leave the empty draft so the operator can retry/delete.
        setCommitting(false);
        setCommitPhase("idle");
        return;
      }
      const insertedSoFar = Math.min(i + chunk.length, dedupedRows.length);
      setCommitProgress({ inserted: insertedSoFar, total: dedupedRows.length });
      setCommitPct(Math.round((insertedSoFar / dedupedRows.length) * 100));
    }

    // 4. Audit log
    setCommitPhase("logging");
    await supabase.from("ingestion_runs").insert({
      actor_id: user.id,
      context_id: contextId,
      dataset_id: ds.id,
      kind,
      file_name: fileName,
      rows_in: result.totalRows,
      rows_ok: dedupedRows.length,
      rows_err: result.errors.length,
      errors: result.errors.slice(0, 50) as never,
    } as never);

    setCommitted({
      dataset_id: ds.id,
      version: ds.version,
      inserted: dedupedRows.length,
    });
    if (droppedDuplicates > 0) {
      setCommitError(
        `Note: ${droppedDuplicates} duplicate row${droppedDuplicates === 1 ? "" : "s"} were collapsed (same ${conflictCols!.filter((c: string) => c !== "dataset_id").join(" + ")}).`,
      );
    }
    setCommitting(false);
    setCommitPhase("done");
    setCommitPct(100);
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <header className="mb-8">
        <h1
          className="font-display tracking-tight"
          style={{ fontSize: 28, color: "var(--console-fg)" }}
        >
          Ingest a dataset
        </h1>
        <p
          className="mt-2 text-sm max-w-prose"
          style={{ color: "var(--console-fg-muted)" }}
        >
          Upload a CSV into a context. We validate every row with the schema for
          this dataset kind. Validated rows are inserted into a <strong>draft</strong>{" "}
          dataset — promote it to live from the Deploy page when you're ready.
        </p>
      </header>

      {/* Context + kind picker */}
      <div
        className="rounded-lg border p-5 grid sm:grid-cols-2 gap-4 mb-6"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <Field label="Context">
          {contexts === null ? (
            <Loader2 size={14} className="animate-spin" />
          ) : contexts.length === 0 ? (
            <div className="text-xs" style={{ color: "var(--console-fg-muted)" }}>
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
              className="w-full rounded-md px-3 h-9 text-sm [&>option]:bg-[var(--console-panel)] [&>option]:text-[var(--console-fg)]"
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
        </Field>

        <Field label="Dataset kind">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DatasetKind)}
            className="w-full rounded-md px-3 h-9 text-sm [&>option]:bg-[var(--console-panel)] [&>option]:text-[var(--console-fg)]"
            style={{
              background: "var(--console-panel)",
              color: "var(--console-fg)",
              border: "1px solid var(--console-border)",
            }}
          >
            {(Object.keys(KIND_META) as DatasetKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_META[k].label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Schema + example */}
      <div
        className="rounded-lg border p-5 mb-6"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--console-fg-faint)" }}
            >
              Expected columns
            </div>
            <div
              className="mt-1 font-mono text-xs"
              style={{ color: "var(--console-fg)" }}
            >
              {meta.headers.join(", ")}
            </div>
            {kind === "labor" && (
              <div
                className="mt-2 text-xs"
                style={{ color: "var(--console-fg-faint)" }}
              >
                Also accepts raw ILOSTAT exports:{" "}
                <span className="font-mono">
                  ref_area, source, indicator, sex, classif1, classif2, time,
                  obs_value, obs_status, note_classif, note_indicator, note_source
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={downloadExample}
            className="inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium shrink-0"
            style={{
              background: "var(--console-panel)",
              color: "var(--console-fg)",
              border: "1px solid var(--console-border)",
            }}
          >
            <Download size={12} /> Example CSV
          </button>
        </div>

        <label
          className="block rounded-md border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
          style={{
            borderColor: "var(--console-border)",
            background: "var(--console-panel)",
          }}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
            disabled={uploadPhase === "reading" || uploadPhase === "validating"}
          />
          <Upload
            size={20}
            className="mx-auto mb-2"
            style={{ color: "var(--console-fg-faint)" }}
          />
          <div className="text-sm" style={{ color: "var(--console-fg)" }}>
            {fileName || "Click to choose a CSV file"}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--console-fg-faint)" }}
          >
            UTF-8, header row required.
          </div>
        </label>

        {(uploadPhase === "reading" || uploadPhase === "validating") && (
          <div className="mt-4">
            <div
              className="flex items-center justify-between text-xs mb-1.5"
              style={{ color: "var(--console-fg-muted)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                {uploadPhase === "reading"
                  ? `Reading ${fileName}…`
                  : "Validating rows against schema…"}
              </span>
              <span className="font-mono">{uploadPct}%</span>
            </div>
            <ProgressBar pct={uploadPhase === "validating" ? 100 : uploadPct} indeterminate={uploadPhase === "validating"} />
          </div>
        )}
      </div>

      {/* Validation result */}
      {result && (
        <div
          className="rounded-lg border p-5 mb-6"
          style={{
            borderColor: "var(--console-border)",
            background: "var(--console-canvas)",
          }}
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Stat label="Total rows" value={result.totalRows} />
            <Stat
              label="Valid"
              value={result.ok.length}
              tone={result.ok.length > 0 ? "good" : undefined}
            />
            <Stat
              label="Errors"
              value={result.errors.length}
              tone={result.errors.length > 0 ? "bad" : undefined}
            />
          </div>

          {result.errors.length > 0 && (
            <div className="mb-4">
              <div
                className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1"
                style={{ color: "var(--console-danger)" }}
              >
                <AlertCircle size={12} /> First {Math.min(10, result.errors.length)}{" "}
                errors
              </div>
              <div
                className="rounded-md border max-h-56 overflow-auto"
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
                      <th className="px-3 py-2 text-left font-medium w-16">Line</th>
                      <th className="px-3 py-2 text-left font-medium">Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.slice(0, 10).map((err, i) => (
                      <tr
                        key={i}
                        className="border-t"
                        style={{ borderColor: "var(--console-border)" }}
                      >
                        <td
                          className="px-3 py-1.5 font-mono"
                          style={{ color: "var(--console-fg-muted)" }}
                        >
                          {err.line}
                        </td>
                        <td
                          className="px-3 py-1.5"
                          style={{ color: "var(--console-fg)" }}
                        >
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="text-xs" style={{ color: "var(--console-fg-muted)" }}>
              {result.ok.length > 0
                ? `Ready to insert ${result.ok.length} row${result.ok.length === 1 ? "" : "s"} into a new draft dataset.`
                : "No valid rows — fix the CSV and re-upload."}
            </div>
            <button
              type="button"
              disabled={committing || result.ok.length === 0 || !contextId}
              onClick={onCommit}
              className="inline-flex items-center gap-2 rounded-md px-5 h-10 text-sm font-medium disabled:opacity-50"
              style={{
                background: "var(--earth-dark)",
                color: "var(--earth-light)",
              }}
            >
              {committing && <Loader2 size={14} className="animate-spin" />}
              {committing ? "Committing…" : "Commit as draft"}
              {!committing && <ArrowRight size={14} />}
            </button>
          </div>

          {committing && (
            <div className="mt-4">
              <div
                className="flex items-center justify-between text-xs mb-1.5"
                style={{ color: "var(--console-fg-muted)" }}
              >
                <span>
                  {commitPhase === "creating" && "Creating draft dataset…"}
                  {commitPhase === "inserting" &&
                    `Inserting rows… ${commitProgress.inserted.toLocaleString()} / ${commitProgress.total.toLocaleString()}`}
                  {commitPhase === "logging" && "Writing audit log…"}
                </span>
                <span className="font-mono">{commitPct}%</span>
              </div>
              <ProgressBar
                pct={commitPct}
                indeterminate={commitPhase === "creating" || commitPhase === "logging"}
              />
            </div>
          )}

          {commitError && (
            <div
              className="mt-3 flex items-start gap-2 text-xs rounded-md border px-3 py-2"
              style={{
                borderColor: "var(--console-danger)",
                color: "var(--console-danger)",
                background: "var(--console-panel)",
              }}
            >
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              {commitError}
            </div>
          )}

          {committed && (
            <div
              className="mt-3 flex items-start gap-2 text-xs rounded-md border px-3 py-2"
              style={{
                borderColor: "var(--console-border)",
                color: "var(--console-fg)",
                background: "var(--console-panel)",
              }}
            >
              <CheckCircle2
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--console-accent, #16a34a)" }}
              />
              <div>
                Created draft dataset (version {committed.version}) with{" "}
                {committed.inserted} row{committed.inserted === 1 ? "" : "s"}.{" "}
                <Link
                  to="/console/deploy"
                  className="underline"
                  style={{ color: "var(--console-accent)" }}
                >
                  Promote to live →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className="text-xs flex items-center gap-1.5"
        style={{ color: "var(--console-fg-faint)" }}
      >
        <Database size={12} /> Drafts are private to your context until you publish.
        <FileSpreadsheet size={12} className="ml-3" /> All ingestion runs are logged.
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="text-xs uppercase tracking-wider mb-1.5"
        style={{ color: "var(--console-fg-faint)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({
  pct,
  indeterminate,
}: {
  pct: number;
  indeterminate?: boolean;
}) {
  return (
    <div
      className="h-1.5 w-full rounded-full overflow-hidden"
      style={{
        background: "var(--console-panel)",
        border: "1px solid var(--console-border)",
      }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={
          indeterminate
            ? "h-full animate-pulse"
            : "h-full transition-all duration-200 ease-out"
        }
        style={{
          width: indeterminate ? "100%" : `${Math.max(2, pct)}%`,
          background: "var(--earth-dark, var(--console-accent))",
          opacity: indeterminate ? 0.5 : 1,
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "good"
      ? "var(--earth-dark)"
      : tone === "bad"
        ? "var(--console-danger)"
        : "var(--console-fg)";
  return (
    <div
      className="rounded-md border p-3"
      style={{
        borderColor: "var(--console-border)",
        background: "var(--console-panel)",
      }}
    >
      <div
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "var(--console-fg-faint)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 font-display tracking-tight"
        style={{ fontSize: 22, color }}
      >
        {value}
      </div>
    </div>
  );
}