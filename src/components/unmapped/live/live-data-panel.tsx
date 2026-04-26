import * as React from "react";
import { Database, Radio, AlertCircle, Loader2 } from "lucide-react";
import { useLiveContext } from "@/hooks/use-live-context";
import {
  fetchLiveSkills,
  fetchLiveOccupations,
  fetchLiveOpportunities,
  type SkillRow,
  type OccupationRow,
  type OpportunityRow,
} from "@/lib/live-data";

/* LiveDataPanel — drop-in panel that public pages render above their
 * (mock) dashboard chrome. When a live context is selected via the
 * top-right picker, this panel shows real rows from the operator's
 * uploaded dataset. When no context is active, renders nothing so the
 * existing demo content stands alone. */

type Kind = "skills" | "occupations" | "opportunities";

export function LiveDataPanel({ kind, title }: { kind: Kind; title: string }) {
  const { active } = useLiveContext();
  const [rows, setRows] = React.useState<unknown[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!active) {
      setRows(null);
      return;
    }
    let cancelled = false;
    setRows(null);
    setError(null);
    const fetcher =
      kind === "skills"
        ? fetchLiveSkills(active.id)
        : kind === "occupations"
          ? fetchLiveOccupations(active.id)
          : fetchLiveOpportunities(active.id);
    void fetcher
      .then((r) => {
        if (!cancelled) setRows(r as unknown[]);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setRows([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, kind]);

  if (!active) return null;

  return (
    <section
      className="rounded-lg border p-5 mb-6"
      style={{
        background: "var(--card, var(--background))",
        borderColor: "var(--border)",
      }}
      aria-label={`Live ${kind} data for ${active.name}`}
    >
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Radio
            size={13}
            className="animate-pulse"
            style={{ color: "var(--primary, #16a34a)" }}
          />
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h2>
          <span
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            · live from {active.flag_emoji ?? "🌐"} {active.name}
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Database size={11} />
          {rows === null ? "—" : rows.length} rows
        </span>
      </header>

      {rows === null && (
        <div
          className="flex items-center gap-2 text-sm py-4"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Loader2 size={13} className="animate-spin" /> Loading live data…
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2 text-xs py-2"
          style={{ color: "var(--destructive, #dc2626)" }}
        >
          <AlertCircle size={12} className="mt-0.5" />
          {error}
        </div>
      )}

      {rows && rows.length === 0 && !error && (
        <p
          className="text-sm py-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          No {kind} dataset has been published live for this context yet. Upload
          one in the operator console (<code>/console/datasets</code>) and
          publish it on <code>/console/deploy</code>.
        </p>
      )}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          {kind === "skills" && <SkillsTable rows={rows as SkillRow[]} />}
          {kind === "occupations" && (
            <OccupationsTable rows={rows as OccupationRow[]} />
          )}
          {kind === "opportunities" && (
            <OpportunitiesTable rows={rows as OpportunityRow[]} />
          )}
        </div>
      )}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left px-3 py-2 text-[11px] font-medium uppercase tracking-wider"
      style={{ color: "var(--muted-foreground)" }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      className={`px-3 py-1.5 text-xs ${mono ? "font-mono" : ""}`}
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </td>
  );
}

function SkillsTable({ rows }: { rows: SkillRow[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Code</Th>
          <Th>Label</Th>
          <Th>Source</Th>
          <Th>Level</Th>
          <Th>Parent</Th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 50).map((r, i) => (
          <tr
            key={i}
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Td mono>{r.code}</Td>
            <Td>{r.label}</Td>
            <Td mono>{r.source ?? "—"}</Td>
            <Td>{r.level}</Td>
            <Td mono>{r.parent_code ?? "—"}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OccupationsTable({ rows }: { rows: OccupationRow[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Code</Th>
          <Th>Title</Th>
          <Th>ISCO</Th>
          <Th>Automation risk</Th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 50).map((r, i) => (
          <tr
            key={i}
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Td mono>{r.code}</Td>
            <Td>{r.title}</Td>
            <Td mono>{r.isco_major ?? "—"}</Td>
            <Td>
              {r.automation_risk == null ? (
                "—"
              ) : (
                <RiskBar value={r.automation_risk} />
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RiskBar({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const tone =
    pct >= 70 ? "#dc2626" : pct >= 40 ? "#d97706" : "#16a34a";
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-20 rounded-full overflow-hidden"
        style={{ background: "var(--muted, #e5e7eb)" }}
      >
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
      <span className="font-mono">{pct}%</span>
    </div>
  );
}

function OpportunitiesTable({ rows }: { rows: OpportunityRow[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <Th>Title</Th>
          <Th>Employer</Th>
          <Th>Sector</Th>
          <Th>Region</Th>
          <Th>Remote</Th>
          <Th>Skills</Th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 50).map((r) => (
          <tr
            key={r.id}
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Td>
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "var(--primary, #16a34a)" }}
                >
                  {r.title}
                </a>
              ) : (
                r.title
              )}
            </Td>
            <Td>{r.employer ?? "—"}</Td>
            <Td>{r.sector ?? "—"}</Td>
            <Td>{r.region ?? "—"}</Td>
            <Td>{r.remote ? "yes" : "no"}</Td>
            <Td mono>
              {r.skills.length === 0 ? "—" : r.skills.slice(0, 4).join(", ")}
              {r.skills.length > 4 ? ` +${r.skills.length - 4}` : ""}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}