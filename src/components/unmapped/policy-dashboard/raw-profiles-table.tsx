import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { RawProfile } from "./dashboard-data";

type SortKey = keyof RawProfile;
type Dir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; mono?: boolean; align?: "left" | "right" }[] = [
  { key: "id",             label: "Profile ID",       mono: true },
  { key: "occupation",     label: "Occupation match" },
  { key: "topSkill",       label: "Top skill" },
  { key: "education",      label: "Education level" },
  { key: "automationRisk", label: "Automation risk", mono: true, align: "right" },
  { key: "region",         label: "Region" },
];

export function RawProfilesTable({ rows }: { rows: RawProfile[] }) {
  const [open, setOpen] = React.useState(false);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: Dir }>({
    key: "id",
    dir: "asc",
  });

  const sorted = React.useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return out;
  }, [rows, sort]);

  const cycle = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  return (
    <section
      aria-label="Raw profile data"
      className="rounded-2xl"
      style={{
        background: var(--policy-panel),
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 md:px-6 py-4 text-left"
      >
        <div className="flex items-baseline gap-3">
          <h2
            className="text-[12px] uppercase tracking-[0.08em] font-medium"
            style={{ color: var(--policy-fg-muted) }}
          >
            View raw profile data
          </h2>
          <span
            className="text-[11px] font-mono tabular-nums"
            style={{ color: var(--policy-fg-faint) }}
          >
            {rows.length} rows
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: var(--policy-fg-muted) }}
        />
      </button>

      {open && (
        <div className="px-1 pb-4 overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr>
                {COLUMNS.map((c) => {
                  const active = sort.key === c.key;
                  const Icon = active
                    ? sort.dir === "asc"
                      ? ChevronUp
                      : ChevronDown
                    : ChevronsUpDown;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      className="px-4 py-2 text-[11px] uppercase tracking-[0.06em] font-medium"
                      style={{
                        color: active
                          ? "var(--earth)"
                          : var(--policy-fg-muted),
                        textAlign: c.align ?? "left",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => cycle(c.key)}
                        className="inline-flex items-center gap-1 hover:opacity-100"
                      >
                        {c.label}
                        <Icon size={12} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    background:
                      i % 2 === 0
                        ? "rgba(255,255,255,0)"
                        : var(--policy-panel),
                  }}
                >
                  {COLUMNS.map((c) => {
                    const v = r[c.key];
                    return (
                      <td
                        key={c.key}
                        className={`px-4 py-2.5 text-[12px] ${c.mono ? "font-mono tabular-nums" : ""}`}
                        style={{
                          color: "rgba(240,237,232,0.85)",
                          textAlign: c.align ?? "left",
                          borderTop: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {c.key === "automationRisk" ? `${v}%` : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}