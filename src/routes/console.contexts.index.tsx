import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Loader2, AlertCircle, Globe2, FileText } from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";

/* /console/contexts — list of contexts the operator can edit. */
export const Route = createFileRoute("/console/contexts/")({
  component: () => (
    <ConsoleGuard>
      <ContextsList />
    </ConsoleGuard>
  ),
});

interface ContextRow {
  id: string;
  code: string;
  name: string;
  status: "draft" | "active" | "archived";
  flag_emoji: string | null;
  locale: string;
  updated_at: string;
  created_at: string;
}

function ContextsList() {
  const { user } = useConsoleAuth();
  const [rows, setRows] = React.useState<ContextRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("contexts")
        .select("id,code,name,status,flag_emoji,locale,updated_at,created_at")
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data ?? []) as ContextRow[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <header className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1
            className="font-display tracking-tight"
            style={{ fontSize: 28, color: "var(--console-fg)" }}
          >
            Contexts
          </h1>
          <p
            className="mt-2 text-sm max-w-prose"
            style={{ color: "var(--console-fg-muted)" }}
          >
            A context is a country + region + calibration package. Create one,
            ingest data into it, then publish it live to the public dashboard.
          </p>
        </div>
        <Link
          to="/console/contexts/new"
          className="inline-flex items-center gap-1.5 rounded-md px-4 h-10 text-sm font-medium shrink-0"
          style={{ background: "var(--earth-dark)", color: "var(--earth-light)" }}
        >
          <Plus size={14} /> New context
        </Link>
      </header>

      {rows === null && !error && (
        <div
          className="flex items-center gap-2 text-sm py-12"
          style={{ color: "var(--console-fg-faint)" }}
        >
          <Loader2 size={14} className="animate-spin" />
          Loading your contexts…
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2 rounded-md border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--console-danger)",
            color: "var(--console-danger)",
            background: "var(--console-canvas)",
          }}
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Couldn't load contexts: {error}</span>
        </div>
      )}

      {rows && rows.length === 0 && !error && (
        <div
          className="rounded-lg border p-10 text-center"
          style={{
            borderColor: "var(--console-border)",
            background: "var(--console-canvas)",
          }}
        >
          <Globe2
            size={32}
            className="mx-auto mb-3"
            style={{ color: "var(--console-fg-faint)" }}
          />
          <h2 className="text-base font-medium" style={{ color: "var(--console-fg)" }}>
            No contexts yet
          </h2>
          <p
            className="mt-1 text-sm max-w-md mx-auto"
            style={{ color: "var(--console-fg-muted)" }}
          >
            Create your first context to define a country, calibration, and
            taxonomy. You'll then be able to ingest CSVs and publish.
          </p>
          <Link
            to="/console/contexts/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-md px-4 h-9 text-sm font-medium"
            style={{ background: "var(--earth-dark)", color: "var(--earth-light)" }}
          >
            <Plus size={14} /> Create context
          </Link>
        </div>
      )}

      {rows && rows.length > 0 && (
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
                <th className="text-left px-4 py-2.5 font-medium">Context</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-left px-4 py-2.5 font-medium">Locale</th>
                <th className="text-left px-4 py-2.5 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t"
                  style={{ borderColor: "var(--console-border)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 18 }}>{r.flag_emoji ?? "🌐"}</span>
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "var(--console-fg)" }}
                        >
                          {r.name}
                        </div>
                        <div
                          className="text-xs flex items-center gap-1"
                          style={{ color: "var(--console-fg-faint)" }}
                        >
                          <FileText size={11} />
                          {r.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--console-fg-muted)" }}
                  >
                    {r.locale}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--console-fg-muted)" }}
                  >
                    {new Date(r.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ContextRow["status"] }) {
  const tone =
    status === "active"
      ? { bg: "var(--earth-dark)", fg: "var(--earth-light)" }
      : status === "archived"
        ? { bg: "var(--console-panel)", fg: "var(--console-fg-faint)" }
        : { bg: "var(--console-panel)", fg: "var(--console-fg-muted)" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {status}
    </span>
  );
}