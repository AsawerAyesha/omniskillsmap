import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Pencil,
  Database,
  RefreshCw,
  MoreHorizontal,
  Plus,
  X,
  Upload,
  Download,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Link2,
  FileSpreadsheet,
  Webhook,
  Server,
  Search,
  ChevronDown,
  Copy,
} from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";

/* C3 — Data connections.
 *
 * Operator-facing screen for managing all data sources feeding a context.
 * Surfaces every "bring your own data" affordance the challenge requires:
 * official APIs, file uploads w/ column mapping, database connections,
 * and webhook live feeds. Right-side slide-in drawer (480px) replaces a
 * modal so operators can read the source list while configuring. */

export const Route = createFileRoute("/console/connections")({
  component: () => (
    <ConsoleGuard>
      <DataConnections />
    </ConsoleGuard>
  ),
});

/* ─── Mock data ────────────────────────────────────────────────────── */

type SourceStatus = "active" | "stale" | "error";
type SourceType = "official" | "upload" | "database" | "webhook";

interface ConnectedSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  recordsLabel: string;
  lastSynced: string;
  vintage: string;
  warning?: string;
}

const INITIAL_SOURCES: ConnectedSource[] = [
  {
    id: "ilo",
    name: "ILO ILOSTAT",
    type: "official",
    status: "active",
    recordsLabel: "847 signals",
    lastSynced: "2 hours ago",
    vintage: "2024",
  },
  {
    id: "wdi",
    name: "World Bank WDI",
    type: "official",
    status: "active",
    recordsLabel: "312 indicators",
    lastSynced: "6 hours ago",
    vintage: "2023",
  },
  {
    id: "wage-survey",
    name: "Custom wage survey",
    type: "upload",
    status: "stale",
    recordsLabel: "124 records",
    lastSynced: "3 days ago",
    vintage: "2023",
    warning: "Consider refreshing",
  },
];

interface OfficialApi {
  id: string;
  name: string;
  initials: string;
  swatch: string;
  description: string;
}

const OFFICIAL_APIS: OfficialApi[] = [
  { id: "ilo", name: "ILO ILOSTAT", initials: "IL", swatch: "#2F6F8F", description: "Labor force, employment, and wage statistics from 189 member states." },
  { id: "wdi", name: "World Bank WDI", initials: "WB", swatch: "#3D5A80", description: "World Development Indicators — macroeconomic, demographic, and social signals." },
  { id: "esco", name: "ESCO Taxonomy", initials: "ES", swatch: "#7B5E3A", description: "European multilingual classification of skills, competences, qualifications, occupations." },
  { id: "uis", name: "UNESCO UIS", initials: "UN", swatch: "#506B82", description: "Education indicators including ISCED-aligned attainment and enrolment data." },
  { id: "wittgenstein", name: "Wittgenstein Centre", initials: "WC", swatch: "#6B4F6E", description: "Demographic projections by age, sex, and educational attainment to 2100." },
  { id: "itu", name: "ITU ICT", initials: "IT", swatch: "#3F7A6E", description: "Digital connectivity, internet penetration, and ICT infrastructure indicators." },
  { id: "wbes", name: "World Bank Enterprise Surveys", initials: "EN", swatch: "#7A4F3F", description: "Firm-level survey data on employment, skills demand, and obstacles to growth." },
];

/* ─── Page ─────────────────────────────────────────────────────────── */

function DataConnections() {
  const [sources, setSources] = React.useState<ConnectedSource[]>(INITIAL_SOURCES);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const activeCount = sources.filter((s) => s.status === "active" || s.status === "stale").length;

  const handleSyncNow = (id: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, lastSynced: "just now", status: "active", warning: undefined } : s,
      ),
    );
  };

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-2">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-tight tracking-tight">
            Data connections
          </h1>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <ContextChip />
            <span
              className="text-[13px]"
              style={{ color: "var(--console-fg-muted)" }}
            >
              {activeCount} sources active · Last sync 2 hours ago · Next sync in 22 hours
            </span>
          </div>
        </div>
      </div>

      {/* Connected sources table */}
      <section className="mt-8">
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
                style={{
                  background: "var(--console-panel)",
                  color: "var(--console-fg-muted)",
                }}
              >
                <Th>Source name</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Records</Th>
                <Th>Last synced</Th>
                <Th>Vintage</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr
                  key={s.id}
                  className="border-t"
                  style={{ borderColor: "var(--console-rule)" }}
                >
                  <Td>
                    <div className="font-medium" style={{ color: "var(--console-fg)" }}>
                      {s.name}
                    </div>
                  </Td>
                  <Td>
                    <TypeBadge type={s.type} />
                  </Td>
                  <Td>
                    <StatusCell status={s.status} />
                  </Td>
                  <Td>
                    <span style={{ color: "var(--console-fg-muted)" }}>{s.recordsLabel}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--console-fg-muted)" }}>{s.lastSynced}</span>
                      {s.warning && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px]"
                          style={{ color: "var(--signal-amber)" }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "var(--signal-amber)" }}
                          />
                          {s.warning}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span style={{ color: "var(--console-fg-muted)" }}>{s.vintage}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      {s.type === "upload" ? (
                        <>
                          <ToolbarBtn icon={Upload} label="Re-upload" onClick={() => {}} />
                          <ToolbarBtn icon={Download} label="Download current" onClick={() => {}} />
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSyncNow(s.id)}
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors"
                            style={{
                              borderColor: "var(--console-border)",
                              color: "var(--console-fg)",
                              background: "var(--console-canvas)",
                            }}
                          >
                            <RefreshCw size={12} />
                            Sync now
                          </button>
                          <button
                            type="button"
                            className="text-xs underline-offset-2 hover:underline"
                            style={{ color: "var(--console-accent)" }}
                          >
                            Configure
                          </button>
                        </>
                      )}
                      <KebabMenu
                        open={openMenuId === s.id}
                        onToggle={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                        type={s.type}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-xs"
                    style={{ color: "var(--console-fg-faint)" }}
                  >
                    No data sources yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border transition-colors"
            style={{
              borderColor: "var(--console-border)",
              color: "var(--console-fg)",
              background: "var(--console-canvas)",
            }}
          >
            <Plus size={14} />
            Add data source
          </button>
        </div>
      </section>

      {/* Data quality */}
      <DataQualityPanel />

      {/* Drawer */}
      <AddSourceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

/* ─── Pieces ───────────────────────────────────────────────────────── */

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.08em] font-medium ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function ContextChip() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors"
      style={{
        background: "color-mix(in oklab, var(--console-accent) 12%, transparent)",
        color: "var(--console-accent)",
      }}
    >
      <span className="font-medium">Ghana Urban 2024</span>
      <Pencil size={11} strokeWidth={2} />
    </button>
  );
}

function TypeBadge({ type }: { type: SourceType }) {
  const map: Record<SourceType, { label: string; tone: "green" | "amber" | "blue" | "muted" }> = {
    official: { label: "Official API", tone: "green" },
    upload: { label: "Custom upload", tone: "amber" },
    database: { label: "Database", tone: "blue" },
    webhook: { label: "Webhook", tone: "muted" },
  };
  const { label, tone } = map[type];
  const bg =
    tone === "green"
      ? "color-mix(in oklab, var(--signal-green) 14%, transparent)"
      : tone === "amber"
      ? "color-mix(in oklab, var(--signal-amber) 14%, transparent)"
      : tone === "blue"
      ? "color-mix(in oklab, var(--signal-blue, #3D6FA8) 14%, transparent)"
      : "var(--console-panel-strong)";
  const fg =
    tone === "green"
      ? "var(--signal-green)"
      : tone === "amber"
      ? "var(--signal-amber)"
      : tone === "blue"
      ? "var(--signal-blue, #3D6FA8)"
      : "var(--console-fg-muted)";
  return (
    <span
      className="inline-flex items-center text-[11px] px-2 py-0.5 rounded font-medium"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

function StatusCell({ status }: { status: SourceStatus }) {
  const map = {
    active: { color: "var(--signal-green)", label: "Active" },
    stale: { color: "var(--signal-amber)", label: "Active" },
    error: { color: "var(--console-danger)", label: "Error" },
  } as const;
  const { color, label } = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span style={{ color: "var(--console-fg)" }}>{label}</span>
    </span>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors"
      style={{
        borderColor: "var(--console-border)",
        color: "var(--console-fg)",
        background: "var(--console-canvas)",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function KebabMenu({
  open,
  onToggle,
  type,
}: {
  open: boolean;
  onToggle: () => void;
  type: SourceType;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="More actions"
        className="p-1 rounded-md transition-colors"
        style={{ color: "var(--console-fg-muted)" }}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-10 min-w-[140px] rounded-md border py-1 shadow-md"
          style={{
            background: "var(--console-canvas)",
            borderColor: "var(--console-border)",
          }}
          role="menu"
        >
          <MenuItem label="View logs" />
          {type !== "upload" && <MenuItem label="View schema" />}
          <MenuItem label="Disconnect" tone="danger" />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, tone }: { label: string; tone?: "danger" }) {
  return (
    <button
      type="button"
      className="w-full text-left px-3 py-1.5 text-xs transition-colors"
      style={{
        color: tone === "danger" ? "var(--console-danger)" : "var(--console-fg)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--console-panel)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </button>
  );
}

/* ─── Data quality ─────────────────────────────────────────────────── */

function DataQualityPanel() {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium mb-3">Data quality overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QualityCard label="Coverage" value="87%" sub="of required signal types populated" tone="green" />
        <QualityCard label="Freshness" value="2" sub="sources need refresh" tone="amber" />
        <QualityCard label="Completeness" value="3 of 4" sub="required sectors covered" tone="green" />
      </div>

      <div
        className="mt-4 rounded-lg border p-4 flex items-start gap-3"
        style={{
          borderColor: "color-mix(in oklab, var(--signal-amber) 40%, transparent)",
          background: "color-mix(in oklab, var(--signal-amber) 6%, transparent)",
        }}
      >
        <AlertTriangle size={18} style={{ color: "var(--signal-amber)" }} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            Youth unemployment rate not found for this context
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--console-fg-muted)" }}>
            This signal is shown to policy users. Without it, the dashboard will display "not available".
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--console-accent)" }}
            >
              <Search size={12} />
              Search for this data →
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: "var(--console-fg-muted)" }}
            >
              <Plus size={12} />
              Add manually
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function QualityCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "green" | "amber";
}) {
  const color = tone === "green" ? "var(--signal-green)" : "var(--signal-amber)";
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        borderColor: "var(--console-border)",
        background: "var(--console-canvas)",
      }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.08em]"
        style={{ color: "var(--console-fg-muted)" }}
      >
        {label}
      </div>
      <div className="mt-1 font-display text-[24px] leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1.5 text-xs" style={{ color: "var(--console-fg-muted)" }}>
        {sub}
      </div>
    </div>
  );
}

/* ─── Drawer ───────────────────────────────────────────────────────── */

type DrawerTab = "official" | "upload" | "database" | "webhook";

function AddSourceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = React.useState<DrawerTab>("official");

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1"
        style={{ background: "rgba(0,0,0,0.32)" }}
      />
      <aside
        className="w-[480px] max-w-full h-full overflow-y-auto border-l flex flex-col"
        style={{
          background: "var(--console-canvas)",
          borderColor: "var(--console-border)",
        }}
      >
        <header
          className="px-5 h-14 shrink-0 border-b flex items-center"
          style={{ borderColor: "var(--console-border)" }}
        >
          <div className="font-display text-base">Add data source</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto p-1 rounded-md"
            style={{ color: "var(--console-fg-muted)" }}
          >
            <X size={16} />
          </button>
        </header>

        <div
          className="px-5 pt-3 border-b flex gap-1 overflow-x-auto"
          style={{ borderColor: "var(--console-border)" }}
        >
          <DrawerTabBtn label="Official APIs" active={tab === "official"} onClick={() => setTab("official")} icon={Server} />
          <DrawerTabBtn label="File upload" active={tab === "upload"} onClick={() => setTab("upload")} icon={FileSpreadsheet} />
          <DrawerTabBtn label="Database" active={tab === "database"} onClick={() => setTab("database")} icon={Database} />
          <DrawerTabBtn label="Webhook" active={tab === "webhook"} onClick={() => setTab("webhook")} icon={Webhook} />
        </div>

        <div className="flex-1 px-5 py-5">
          {tab === "official" && <TabOfficial />}
          {tab === "upload" && <TabUpload />}
          {tab === "database" && <TabDatabase />}
          {tab === "webhook" && <TabWebhook />}
        </div>
      </aside>
    </div>
  );
}

function DrawerTabBtn({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-md border-b-2 -mb-px transition-colors whitespace-nowrap"
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

/* ── Tab 1: Official APIs ── */

function TabOfficial() {
  const [connected, setConnected] = React.useState<Set<string>>(new Set(["ilo", "wdi"]));
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      {OFFICIAL_APIS.map((api) => {
        const isConnected = connected.has(api.id);
        const isExpanded = expanded === api.id;
        return (
          <div
            key={api.id}
            className="rounded-lg border"
            style={{
              borderColor: "var(--console-border)",
              background: "var(--console-canvas)",
            }}
          >
            <div className="p-3 flex items-start gap-3">
              <div
                className="h-9 w-9 rounded shrink-0 flex items-center justify-center text-[11px] font-medium text-white"
                style={{ background: api.swatch }}
              >
                {api.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{api.name}</div>
                <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--console-fg-muted)" }}>
                  {api.description}
                </div>
              </div>
              {isConnected ? (
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium shrink-0"
                  style={{
                    background: "color-mix(in oklab, var(--signal-green) 14%, transparent)",
                    color: "var(--signal-green)",
                  }}
                >
                  <Check size={10} />
                  Connected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : api.id)}
                  className="text-xs px-3 py-1.5 rounded-md font-medium shrink-0 transition-colors"
                  style={{
                    background: "var(--console-accent)",
                    color: "var(--console-accent-fg)",
                  }}
                >
                  {isExpanded ? "Cancel" : "Connect"}
                </button>
              )}
            </div>
            {isExpanded && !isConnected && (
              <div
                className="border-t p-3 space-y-3"
                style={{ borderColor: "var(--console-rule)", background: "var(--console-panel)" }}
              >
                <Field label="API key (if required)">
                  <input
                    type="text"
                    placeholder="Optional for public sources"
                    className="w-full text-sm px-3 py-2 rounded-md border bg-transparent"
                    style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Country filter">
                    <SelectInput value="Ghana" options={["Ghana", "All countries", "Kenya", "Nigeria"]} />
                  </Field>
                  <Field label="Vintage year">
                    <SelectInput value="2024" options={["2024", "2023", "2022", "All available"]} />
                  </Field>
                </div>
                <Field label="Sync frequency">
                  <SelectInput value="Daily" options={["Manual only", "Every hour", "Daily", "Weekly"]} />
                </Field>
                <button
                  type="button"
                  onClick={() => {
                    setConnected((prev) => new Set(prev).add(api.id));
                    setExpanded(null);
                  }}
                  className="text-xs px-3 py-1.5 rounded-md font-medium"
                  style={{
                    background: "var(--console-accent)",
                    color: "var(--console-accent-fg)",
                  }}
                >
                  Confirm connection
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block text-[11px] uppercase tracking-[0.08em] mb-1"
        style={{ color: "var(--console-fg-muted)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectInput({ value, options }: { value: string; options: string[] }) {
  const [v, setV] = React.useState(value);
  return (
    <div className="relative">
      <select
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="w-full appearance-none text-sm px-3 py-2 pr-8 rounded-md border bg-transparent"
        style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "var(--console-canvas)" }}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
        style={{ color: "var(--console-fg-muted)" }}
      />
    </div>
  );
}

/* ── Tab 2: File upload ── */

interface DetectedColumn {
  source: string;
  sample: string;
  mapping: string;
}

const REQUIRED_TARGETS = ["country_code", "signal_type", "value", "unit", "vintage_year"];
const OPTIONAL_TARGETS = ["sector_code", "occupation_isco", "gender", "age_group"];
const SKIP_OPTION = "— Skip this column —";
const ALL_TARGETS = [SKIP_OPTION, ...REQUIRED_TARGETS, ...OPTIONAL_TARGETS];

function TabUpload() {
  const [file, setFile] = React.useState<string | null>(null);
  const [columns, setColumns] = React.useState<DetectedColumn[]>([]);
  const [validated, setValidated] = React.useState<null | { ok: boolean; rows: number }>(null);
  const [importing, setImporting] = React.useState(false);
  const [imported, setImported] = React.useState<null | number>(null);
  const [progress, setProgress] = React.useState(0);

  const onFile = (name: string) => {
    setFile(name);
    setColumns([
      { source: "iso3", sample: "GHA", mapping: "country_code" },
      { source: "indicator", sample: "monthly_wage", mapping: "signal_type" },
      { source: "amount", sample: "420", mapping: "value" },
      { source: "currency", sample: "GHS", mapping: "unit" },
      { source: "year", sample: "2023", mapping: "vintage_year" },
      { source: "isco_code", sample: "7421", mapping: "occupation_isco" },
      { source: "notes", sample: "informal sector", mapping: SKIP_OPTION },
    ]);
    setValidated(null);
    setImported(null);
  };

  const validate = () => {
    const missing = REQUIRED_TARGETS.filter((t) => !columns.some((c) => c.mapping === t));
    setValidated({ ok: missing.length === 0, rows: missing.length === 0 ? 124 : 0 });
  };

  const runImport = () => {
    setImporting(true);
    setProgress(0);
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(id);
          setImporting(false);
          setImported(124);
          return 100;
        }
        return p + 10;
      });
    }, 80);
  };

  if (!file) {
    return (
      <div>
        <label
          className="block rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
          style={{
            borderColor: "color-mix(in oklab, var(--console-accent) 40%, transparent)",
            background: "var(--console-panel)",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f.name);
          }}
        >
          <Upload size={20} className="mx-auto mb-2" style={{ color: "var(--console-accent)" }} />
          <div className="text-sm font-medium">Drop your CSV, Excel, or JSON file here</div>
          <div className="text-xs mt-1" style={{ color: "var(--console-fg-muted)" }}>
            Or{" "}
            <span style={{ color: "var(--console-accent)" }} className="underline underline-offset-2">
              browse files
            </span>
          </div>
          <div className="text-[11px] mt-3" style={{ color: "var(--console-fg-faint)" }}>
            Accepted: .csv, .xlsx, .json
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) onFile(f.name);
            }}
          />
        </label>
      </div>
    );
  }

  if (imported !== null) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={36} className="mx-auto mb-3" style={{ color: "var(--signal-green)" }} />
        <div className="text-sm font-medium">Imported {imported} records</div>
        <div className="text-xs mt-1" style={{ color: "var(--console-fg-muted)" }}>
          {file} is now available in this context.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "var(--console-fg-muted)" }}>
        <FileSpreadsheet size={12} />
        <span className="truncate flex-1">{file}</span>
        <button
          type="button"
          onClick={() => setFile(null)}
          className="underline underline-offset-2"
          style={{ color: "var(--console-accent)" }}
        >
          Replace
        </button>
      </div>

      <div
        className="text-[11px] uppercase tracking-[0.08em] mb-2"
        style={{ color: "var(--console-fg-muted)" }}
      >
        Map columns
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--console-border)" }}>
        <div
          className="grid grid-cols-2 text-[11px] uppercase tracking-[0.08em] px-3 py-2 border-b"
          style={{
            borderColor: "var(--console-rule)",
            background: "var(--console-panel)",
            color: "var(--console-fg-muted)",
          }}
        >
          <div>Your column</div>
          <div>Maps to</div>
        </div>
        {columns.map((c, i) => {
          const skipped = c.mapping === SKIP_OPTION;
          return (
            <div
              key={c.source}
              className="grid grid-cols-2 gap-2 px-3 py-2 items-center border-t"
              style={{ borderColor: "var(--console-rule)" }}
            >
              <div className="min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: skipped ? "var(--signal-amber)" : "var(--console-fg)" }}
                >
                  {c.source}
                </div>
                <div className="text-[11px] truncate" style={{ color: "var(--console-fg-faint)" }}>
                  e.g. {c.sample}
                </div>
              </div>
              <select
                value={c.mapping}
                onChange={(e) => {
                  const next = [...columns];
                  next[i] = { ...c, mapping: e.target.value };
                  setColumns(next);
                  setValidated(null);
                }}
                className="text-xs px-2 py-1.5 rounded-md border bg-transparent"
                style={{
                  borderColor: "var(--console-border)",
                  color: skipped ? "var(--signal-amber)" : "var(--console-fg)",
                }}
              >
                {ALL_TARGETS.map((t) => (
                  <option key={t} value={t} style={{ background: "var(--console-canvas)" }}>
                    {t}
                    {REQUIRED_TARGETS.includes(t) ? " *" : ""}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={validate}
          className="text-xs px-3 py-1.5 rounded-md border"
          style={{
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
            background: "var(--console-canvas)",
          }}
        >
          Validate mapping
        </button>
        {validated?.ok && (
          <button
            type="button"
            onClick={runImport}
            disabled={importing}
            className="text-xs px-3 py-1.5 rounded-md font-medium inline-flex items-center gap-1.5"
            style={{
              background: "var(--console-accent)",
              color: "var(--console-accent-fg)",
              opacity: importing ? 0.7 : 1,
            }}
          >
            {importing && <Loader2 size={12} className="animate-spin" />}
            {importing ? "Importing…" : "Import"}
          </button>
        )}
      </div>

      {validated && (
        <div className="mt-3 text-xs">
          {validated.ok ? (
            <div className="inline-flex items-center gap-1.5" style={{ color: "var(--signal-green)" }}>
              <CheckCircle2 size={12} />
              {validated.rows} rows will import
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5" style={{ color: "var(--console-danger)" }}>
              <AlertTriangle size={12} />
              Required mappings missing — assign country_code, signal_type, value, unit, vintage_year.
            </div>
          )}
        </div>
      )}

      {importing && (
        <div className="mt-3">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--console-panel-strong)" }}>
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, background: "var(--console-accent)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tab 3: Database ── */

function TabDatabase() {
  const [conn, setConn] = React.useState("");
  const [tested, setTested] = React.useState<null | "ok" | "fail">(null);
  const [testing, setTesting] = React.useState(false);

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTested(conn.startsWith("postgres://") || conn.startsWith("mysql://") ? "ok" : "fail");
    }, 600);
  };

  return (
    <div className="space-y-4">
      <Field label="Connection string">
        <div className="flex gap-2">
          <input
            type="text"
            value={conn}
            onChange={(e) => {
              setConn(e.target.value);
              setTested(null);
            }}
            placeholder="postgres://user:pass@host:5432/db"
            className="flex-1 text-sm px-3 py-2 rounded-md border bg-transparent font-mono"
            style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
          />
          <button
            type="button"
            onClick={runTest}
            disabled={!conn || testing}
            className="text-xs px-3 py-2 rounded-md border inline-flex items-center gap-1.5"
            style={{
              borderColor: "var(--console-border)",
              color: "var(--console-fg)",
              background: "var(--console-canvas)",
              opacity: !conn || testing ? 0.5 : 1,
            }}
          >
            {testing && <Loader2 size={12} className="animate-spin" />}
            Test
          </button>
        </div>
      </Field>

      {tested === "ok" && (
        <div className="text-xs inline-flex items-center gap-1.5" style={{ color: "var(--signal-green)" }}>
          <CheckCircle2 size={12} />
          Connection successful
        </div>
      )}
      {tested === "fail" && (
        <div className="text-xs inline-flex items-center gap-1.5" style={{ color: "var(--console-danger)" }}>
          <AlertTriangle size={12} />
          Could not connect — check the connection string format.
        </div>
      )}

      {tested === "ok" && (
        <>
          <Field label="Table or view">
            <SelectInput
              value="public.wage_observations"
              options={["public.wage_observations", "public.employment", "public.training_outcomes"]}
            />
          </Field>
          <Field label="Sync schedule">
            <SelectInput value="Daily" options={["Manual only", "Every hour", "Daily", "Weekly"]} />
          </Field>
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-md font-medium"
            style={{
              background: "var(--console-accent)",
              color: "var(--console-accent-fg)",
            }}
          >
            Continue to column mapping →
          </button>
        </>
      )}
    </div>
  );
}

/* ── Tab 4: Webhook ── */

function TabWebhook() {
  const url = "https://api.unmapped.io/v1/ingest/wh_a8b3c9e2f7d1";
  const [copied, setCopied] = React.useState(false);
  const [tested, setTested] = React.useState(false);
  const sample = [
    "{",
    '  "country_code": "GHA",',
    '  "signal_type": "monthly_wage",',
    '  "value": 420,',
    '  "unit": "GHS",',
    '  "vintage_year": 2024,',
    '  "occupation_isco": "7421"',
    "}",
  ].join("\n");

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-4">
      <Field label="Your webhook endpoint">
        <div
          className="rounded-md border p-2.5 flex items-center gap-2"
          style={{
            borderColor: "var(--console-border)",
            background: "var(--console-panel)",
          }}
        >
          <code className="font-mono text-[12px] truncate flex-1" style={{ color: "var(--console-fg)" }}>
            {url}
          </code>
          <button
            type="button"
            onClick={copy}
            className="text-xs px-2 py-1 rounded inline-flex items-center gap-1"
            style={{ color: "var(--console-fg-muted)" }}
            aria-label="Copy URL"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </Field>

      <Field label="Expected payload">
        <pre
          className="rounded-md border p-3 text-[12px] font-mono overflow-x-auto leading-relaxed whitespace-pre"
          style={{
            borderColor: "var(--console-border)",
            background: "var(--console-panel)",
            color: "var(--console-fg-muted)",
          }}
        >
          {sample}
        </pre>
      </Field>

      <button
        type="button"
        onClick={() => setTested(true)}
        className="text-xs px-3 py-1.5 rounded-md border inline-flex items-center gap-1.5"
        style={{
          borderColor: "var(--console-border)",
          color: "var(--console-fg)",
          background: "var(--console-canvas)",
        }}
      >
        <Link2 size={12} />
        Send test payload
      </button>

      {tested && (
        <div className="text-xs inline-flex items-center gap-1.5" style={{ color: "var(--signal-green)" }}>
          <CheckCircle2 size={12} />
          Test payload accepted (200 OK)
        </div>
      )}
    </div>
  );
}
