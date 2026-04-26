import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Globe2, Database, Rocket, Upload, ArrowRight, Code } from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";

export const Route = createFileRoute("/console/")({
  component: () => (
    <ConsoleGuard>
      <ConsoleHome />
    </ConsoleGuard>
  ),
});

function ConsoleHome() {
  const { user } = useConsoleAuth();
  const [counts, setCounts] = React.useState<{
    total: number;
    active: number;
    draft: number;
  } | null>(null);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.from("contexts").select("status");
      if (cancelled) return;
      const rows = data ?? [];
      setCounts({
        total: rows.length,
        active: rows.filter((r) => r.status === "active").length,
        draft: rows.filter((r) => r.status === "draft").length,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <header className="mb-8">
        <h1
          className="font-display tracking-tight"
          style={{ fontSize: 28, color: "var(--console-fg)" }}
        >
          Workspace
        </h1>
        <p
          className="mt-2 text-sm max-w-prose"
          style={{ color: "var(--console-fg-muted)" }}
        >
          OmniSkill is a protocol layer. Configure a context, ingest local
          data, and publish — your dataset will drive the public dashboard.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Contexts" value={counts?.total} hint="Total" />
        <StatCard label="Active" value={counts?.active} hint="Live to public" />
        <StatCard label="Drafts" value={counts?.draft} hint="Not yet published" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ActionCard
          to="/console/contexts/new"
          icon={<Plus size={16} />}
          title="Create a context"
          desc="Country, calibration, taxonomy, languages."
        />
        <ActionCard
          to="/console/contexts"
          icon={<Globe2 size={16} />}
          title="Manage contexts"
          desc="View and edit your existing contexts."
        />
        <ActionCard
          to="/console/datasets"
          icon={<Upload size={16} />}
          title="Ingest data"
          desc="Upload CSVs into a context as a draft dataset."
        />
        <ActionCard
          to="/console/taxonomy"
          icon={<Database size={16} />}
          title="Taxonomy editor"
          desc="Map local credentials to ISCED / ISCO."
        />
        <ActionCard
          to="/console/deploy"
          icon={<Rocket size={16} />}
          title="Publish a dataset"
          desc="Promote a draft dataset to live."
        />
        <ActionCard
          to="/console/monitor"
          icon={<ArrowRight size={16} />}
          title="Monitor"
          desc="Ingestion runs and dataset health."
        />
      </div>

      <div
        className="mt-8 rounded-lg border p-5"
        style={{
          background: "var(--console-canvas)",
          borderColor: "var(--console-border)",
        }}
      >
        <div
          className="flex items-center gap-2 text-sm font-medium mb-1"
          style={{ color: "var(--console-fg)" }}
        >
          <Code size={14} style={{ color: "var(--console-accent)" }} />
          Public protocol API
        </div>
        <p
          className="text-xs mb-3"
          style={{ color: "var(--console-fg-muted)" }}
        >
          Any active context exposes its live data over a read-only JSON API.
          External systems plug in here.
        </p>
        <div className="space-y-1.5">
          <code
            className="block text-[11px] px-2.5 py-1.5 rounded font-mono"
            style={{
              background: "var(--console-elev, rgba(0,0,0,0.04))",
              color: "var(--console-fg)",
              border: "1px solid var(--console-border)",
            }}
          >
            GET /api/v1
          </code>
          <code
            className="block text-[11px] px-2.5 py-1.5 rounded font-mono"
            style={{
              background: "var(--console-elev, rgba(0,0,0,0.04))",
              color: "var(--console-fg)",
              border: "1px solid var(--console-border)",
            }}
          >
            GET /api/v1/contexts
          </code>
          <code
            className="block text-[11px] px-2.5 py-1.5 rounded font-mono"
            style={{
              background: "var(--console-elev, rgba(0,0,0,0.04))",
              color: "var(--console-fg)",
              border: "1px solid var(--console-border)",
            }}
          >
            GET /api/v1/contexts/&#123;code&#125;/datasets/&#123;kind&#125;?limit=500&amp;offset=0
          </code>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | undefined;
  hint: string;
}) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        background: "var(--console-canvas)",
        borderColor: "var(--console-border)",
      }}
    >
      <div
        className="text-xs uppercase tracking-wider"
        style={{ color: "var(--console-fg-faint)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 font-display tracking-tight"
        style={{ fontSize: 28, color: "var(--console-fg)" }}
      >
        {value ?? "—"}
      </div>
      <div
        className="text-xs mt-0.5"
        style={{ color: "var(--console-fg-muted)" }}
      >
        {hint}
      </div>
    </div>
  );
}

function ActionCard({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-lg border p-4 transition-colors block"
      style={{
        background: "var(--console-canvas)",
        borderColor: "var(--console-border)",
      }}
    >
      <div
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: "var(--console-fg)" }}
      >
        <span style={{ color: "var(--console-accent)" }}>{icon}</span>
        {title}
      </div>
      <div
        className="mt-1 text-xs"
        style={{ color: "var(--console-fg-muted)" }}
      >
        {desc}
      </div>
    </Link>
  );
}