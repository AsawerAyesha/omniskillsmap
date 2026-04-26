import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Download,
  Upload,
  Search,
  Check,
  AlertTriangle,
  Trash2,
  Sparkles,
  Hand,
  CloudDownload,
  RotateCcw,
  Loader2,
  X,
} from "lucide-react";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";

/* C4 — Taxonomy mapping.
 *
 * The most technically dense console screen. Operators map their country's
 * local credentials to ISCED levels and their local job titles to ISCO-08
 * codes, plus override Frey-Osborne automation risk for context-specific
 * occupations. A sticky save bar surfaces unresolved gaps and gates the
 * "Validate & publish" action until every required mapping is filled. */

export const Route = createFileRoute("/console/taxonomy")({
  component: () => (
    <ConsoleGuard>
      <TaxonomyMapping />
    </ConsoleGuard>
  ),
});

/* ─── ISCED reference ──────────────────────────────────────────────── */

interface ISCEDLevel {
  level: number;
  label: string;
}
const ISCED_LEVELS: ISCEDLevel[] = [
  { level: 0, label: "Early childhood / none" },
  { level: 1, label: "Primary education" },
  { level: 2, label: "Lower secondary education" },
  { level: 3, label: "Upper secondary education" },
  { level: 4, label: "Post-secondary non-tertiary" },
  { level: 5, label: "Short-cycle tertiary" },
  { level: 6, label: "Bachelor's level" },
  { level: 7, label: "Master's level" },
  { level: 8, label: "Doctoral level" },
];

type CredentialStatus = "mapped" | "review" | "unmapped";
interface Credential {
  id: string;
  name: string;
  description: string;
  iscedLevel: number | null;
}

const INITIAL_CREDENTIALS: Credential[] = [
  { id: "c1", name: "BECE (Basic Education Certificate Exam)", description: "End of junior high school exam", iscedLevel: 2 },
  { id: "c2", name: "WASSCE (West Africa Senior School Cert)", description: "End of senior high school exam", iscedLevel: 3 },
  { id: "c3", name: "HND (Higher National Diploma)", description: "Polytechnic-level qualification", iscedLevel: 5 },
  { id: "c4", name: "BSc / BA (Bachelor's degree)", description: "University undergraduate degree", iscedLevel: 6 },
  { id: "c5", name: "No formal education", description: "Did not complete primary", iscedLevel: 0 },
  { id: "c6", name: "Vocational certificate (NVTI)", description: "National Vocational Training Institute", iscedLevel: null },
  { id: "c7", name: "MPhil (Master of Philosophy)", description: "Research-track master's", iscedLevel: 7 },
  { id: "c8", name: "MSLC (Middle School Leaving Cert)", description: "Pre-1987 lower secondary cert", iscedLevel: null },
];

function credentialStatus(c: Credential): CredentialStatus {
  if (c.iscedLevel === null) return "unmapped";
  if (c.description.trim() === "" || c.name.trim() === "") return "review";
  return "mapped";
}

/* ─── ISCO reference (mock match engine) ───────────────────────────── */

interface ISCOEntry {
  code: string;
  title: string;
  description: string;
  feyOsborne: number; // 0..1
  keywords: string[];
}

const ISCO_DB: ISCOEntry[] = [
  { code: "8322", title: "Car, taxi and van drivers", description: "Drive motor cars and small vans to transport passengers or goods.", feyOsborne: 0.89, keywords: ["taxi", "driver", "car", "van", "uber", "keke", "tricycle", "okada"] },
  { code: "8331", title: "Bus and tram drivers", description: "Operate buses and trams for passenger transport.", feyOsborne: 0.67, keywords: ["bus", "tram", "trotro", "minibus"] },
  { code: "9621", title: "Messengers, package and luggage porters and deliverers", description: "Carry messages, packages, parcels.", feyOsborne: 0.94, keywords: ["delivery", "courier", "dispatch", "porter"] },
  { code: "5230", title: "Cashiers and ticket clerks", description: "Operate cash registers, validate transactions.", feyOsborne: 0.97, keywords: ["cashier", "till", "ticket", "money", "susu", "collector"] },
  { code: "5120", title: "Cooks", description: "Prepare and cook a wide range of dishes in restaurants and food outlets.", feyOsborne: 0.81, keywords: ["cook", "chef", "chop bar", "kitchen", "food"] },
  { code: "9412", title: "Kitchen helpers", description: "Wash and clean kitchen equipment, prepare ingredients.", feyOsborne: 0.94, keywords: ["kitchen", "helper", "wash", "prep"] },
  { code: "5223", title: "Shop sales assistants", description: "Sell goods directly in shops, markets, and stalls.", feyOsborne: 0.92, keywords: ["sales", "shop", "market", "trader", "seller", "stall", "vendor"] },
  { code: "9520", title: "Street and related sales workers", description: "Sell goods in streets and public places.", feyOsborne: 0.86, keywords: ["street", "hawker", "market", "vendor"] },
  { code: "7411", title: "Building and related electricians", description: "Install, maintain and repair electrical wiring in buildings.", feyOsborne: 0.42, keywords: ["electrician", "wiring", "electric"] },
  { code: "7421", title: "Electronics mechanics and servicers", description: "Install, service and repair electronic equipment.", feyOsborne: 0.37, keywords: ["electronics", "phone repair", "tv repair", "technician"] },
  { code: "9111", title: "Domestic cleaners and helpers", description: "Sweep, clean, wash, iron in private households.", feyOsborne: 0.69, keywords: ["domestic", "cleaner", "house help", "maid"] },
  { code: "6111", title: "Field crop and vegetable growers", description: "Grow field crops and vegetables for sale.", feyOsborne: 0.87, keywords: ["farmer", "crop", "farm", "agric", "vegetable"] },
  { code: "5142", title: "Beauticians and related workers", description: "Provide beauty treatments, hairdressing, manicure.", feyOsborne: 0.27, keywords: ["beautician", "hairdresser", "salon", "barber", "braider"] },
  { code: "7115", title: "Carpenters and joiners", description: "Construct, install, maintain and repair wooden structures.", feyOsborne: 0.72, keywords: ["carpenter", "wood", "joiner", "furniture"] },
];

interface ISCOMatch {
  entry: ISCOEntry;
  confidence: number;
}

function findMatches(query: string): ISCOMatch[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const scored = ISCO_DB.map((entry) => {
    let hits = 0;
    let kwHit = 0;
    for (const t of tokens) {
      if (entry.title.toLowerCase().includes(t)) hits += 2;
      for (const kw of entry.keywords) {
        if (kw.includes(t) || t.includes(kw)) {
          kwHit += 1;
          break;
        }
      }
    }
    const raw = hits * 25 + kwHit * 30;
    return { entry, confidence: Math.min(99, raw + (raw > 0 ? 35 : 0)) };
  })
    .filter((m) => m.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
  return scored;
}

type MappingSource = "ai" | "manual" | "imported";
interface OccupationMapping {
  id: string;
  localTitle: string;
  iscoCode: string;
  iscoTitle: string;
  confidence: number;
  source: MappingSource;
}

const INITIAL_OCCUPATIONS: OccupationMapping[] = [
  { id: "o1", localTitle: "Trotro driver", iscoCode: "8331", iscoTitle: "Bus and tram drivers", confidence: 88, source: "ai" },
  { id: "o2", localTitle: "Susu collector", iscoCode: "5230", iscoTitle: "Cashiers and ticket clerks", confidence: 71, source: "ai" },
  { id: "o3", localTitle: "Chop bar cook", iscoCode: "5120", iscoTitle: "Cooks", confidence: 92, source: "manual" },
  { id: "o4", localTitle: "Market trader", iscoCode: "5223", iscoTitle: "Shop sales assistants", confidence: 85, source: "imported" },
  { id: "o5", localTitle: "Phone repair technician", iscoCode: "7421", iscoTitle: "Electronics mechanics and servicers", confidence: 94, source: "ai" },
  { id: "o6", localTitle: "Okada rider", iscoCode: "8322", iscoTitle: "Car, taxi and van drivers", confidence: 79, source: "manual" },
];

interface AutomationOverride {
  iscoCode: string;
  iscoTitle: string;
  base: number;
  override: number | null;
  why: string;
}

const INITIAL_OVERRIDES: AutomationOverride[] = [
  { iscoCode: "5230", iscoTitle: "Cashiers and ticket clerks", base: 0.97, override: 0.55, why: "Mobile money is dominant; cash transactions still common at small shops" },
  { iscoCode: "9621", iscoTitle: "Messengers, package and luggage porters", base: 0.94, override: 0.4, why: "Last-mile delivery in unaddressed areas requires human routing" },
  { iscoCode: "9412", iscoTitle: "Kitchen helpers", base: 0.94, override: null, why: "" },
  { iscoCode: "5223", iscoTitle: "Shop sales assistants", base: 0.92, override: 0.6, why: "Open-air markets are not point-of-sale-automatable" },
  { iscoCode: "8322", iscoTitle: "Car, taxi and van drivers", base: 0.89, override: 0.7, why: "Self-driving deployment timeline is decade+ in this context" },
];

/* ─── Page ─────────────────────────────────────────────────────────── */

function TaxonomyMapping() {
  const [credentials, setCredentials] = React.useState<Credential[]>(INITIAL_CREDENTIALS);
  const [occupations, setOccupations] = React.useState<OccupationMapping[]>(INITIAL_OCCUPATIONS);
  const [overrides, setOverrides] = React.useState<AutomationOverride[]>(INITIAL_OVERRIDES);

  const credMappedCount = credentials.filter((c) => credentialStatus(c) === "mapped").length;
  const credUnmapped = credentials.filter((c) => credentialStatus(c) !== "mapped").length;
  const occGoal = 20;
  const occMappedCount = Math.min(occGoal, occupations.length);
  const occMissing = Math.max(0, occGoal - occupations.length);

  return (
    <div className="pb-24">
      <div className="px-8 py-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <header>
          <h1 className="font-display text-[28px] leading-tight tracking-tight">
            Taxonomy mapping
          </h1>
          <p className="mt-2 text-sm max-w-[640px]" style={{ color: "var(--console-fg-muted)" }}>
            Map your local credentials and job titles to international standards so
            Amara's profile is recognized everywhere.
          </p>
          <div
            className="mt-3 inline-flex items-center gap-2 text-[12px] px-2.5 py-1 rounded-full"
            style={{
              background: "var(--console-panel-strong)",
              color: "var(--console-fg-muted)",
            }}
          >
            <span>
              Education: <strong style={{ color: "var(--console-fg)" }}>{credMappedCount} of {credentials.length}</strong> mapped
            </span>
            <span style={{ color: "var(--console-fg-faint)" }}>·</span>
            <span>
              Occupations: <strong style={{ color: "var(--console-fg)" }}>{occMappedCount} of {occGoal}</strong> mapped
            </span>
          </div>
        </header>

        {/* Section 1 */}
        <CredentialsSection
          credentials={credentials}
          setCredentials={setCredentials}
        />

        {/* Section 2 */}
        <OccupationsSection
          occupations={occupations}
          setOccupations={setOccupations}
        />

        {/* Section 3 */}
        <OverridesSection overrides={overrides} setOverrides={setOverrides} />
      </div>

      <SaveBar credUnmapped={credUnmapped} occMissing={occMissing} />
    </div>
  );
}

/* ─── Section 1: Credentials → ISCED ───────────────────────────────── */

function CredentialsSection({
  credentials,
  setCredentials,
}: {
  credentials: Credential[];
  setCredentials: React.Dispatch<React.SetStateAction<Credential[]>>;
}) {
  const updateRow = (id: string, patch: Partial<Credential>) => {
    setCredentials((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const removeRow = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };
  const addRow = () => {
    setCredentials((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, name: "", description: "", iscedLevel: null },
    ]);
  };

  return (
    <section className="mt-10">
      <SectionTitle>Education credentials → ISCED levels</SectionTitle>

      <ParchmentNote>
        ISCED is the international standard for education levels. Mapping your
        local credentials to ISCED ensures profiles are portable across 190+
        countries.
      </ParchmentNote>

      <div
        className="mt-4 rounded-lg border overflow-hidden"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{ background: "var(--console-panel)", color: "var(--console-fg-muted)" }}
            >
              <Th style={{ width: 240 }}>Local credential name</Th>
              <Th style={{ width: 200 }}>Local description</Th>
              <Th style={{ width: 240 }}>Maps to ISCED level</Th>
              <Th style={{ width: 110 }}>Status</Th>
              <Th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {credentials.map((c) => {
              const status = credentialStatus(c);
              return (
                <tr key={c.id} className="border-t" style={{ borderColor: "var(--console-rule)" }}>
                  <Td>
                    <CellInput
                      value={c.name}
                      onChange={(v) => updateRow(c.id, { name: v })}
                      placeholder="e.g. WASSCE"
                    />
                  </Td>
                  <Td>
                    <CellInput
                      value={c.description}
                      onChange={(v) => updateRow(c.id, { description: v })}
                      placeholder="Short description"
                    />
                  </Td>
                  <Td>
                    <ISCEDSelect
                      value={c.iscedLevel}
                      onChange={(v) => updateRow(c.id, { iscedLevel: v })}
                    />
                  </Td>
                  <Td>
                    <StatusBadge status={status} />
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => removeRow(c.id)}
                      aria-label="Remove row"
                      className="p-1 rounded transition-colors"
                      style={{ color: "var(--console-fg-faint)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 font-medium"
          style={{ color: "var(--console-accent)" }}
        >
          <Plus size={12} />
          Add credential
        </button>
        <span style={{ color: "var(--console-fg-faint)" }}>·</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5"
          style={{ color: "var(--console-fg-muted)" }}
        >
          <CloudDownload size={12} />
          Import from UNESCO for this country
        </button>
        <span style={{ color: "var(--console-fg-faint)" }}>·</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5"
          style={{ color: "var(--console-fg-muted)" }}
        >
          <Download size={12} />
          Download mapping as CSV
        </button>
      </div>
    </section>
  );
}

function CellInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm px-2 py-1.5 rounded-md border bg-transparent"
      style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
    />
  );
}

function ISCEDSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className="w-full appearance-none text-sm px-2 py-1.5 rounded-md border bg-transparent"
      style={{
        borderColor: "var(--console-border)",
        color: value === null ? "var(--console-fg-muted)" : "var(--console-fg)",
      }}
    >
      <option value="" style={{ background: "var(--console-canvas)" }}>
        Select ISCED level…
      </option>
      {ISCED_LEVELS.map((l) => (
        <option key={l.level} value={l.level} style={{ background: "var(--console-canvas)" }}>
          ISCED {l.level} — {l.label}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status }: { status: CredentialStatus }) {
  const map = {
    mapped: { color: "var(--signal-green)", label: "Mapped", icon: <Check size={10} /> },
    review: { color: "var(--signal-amber)", label: "Needs review", icon: <AlertTriangle size={10} /> },
    unmapped: { color: "var(--console-fg-muted)", label: "Unmapped", icon: null },
  } as const;
  const { color, label, icon } = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap"
      style={{
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/* ─── Section 2: Local titles → ISCO ───────────────────────────────── */

function OccupationsSection({
  occupations,
  setOccupations,
}: {
  occupations: OccupationMapping[];
  setOccupations: React.Dispatch<React.SetStateAction<OccupationMapping[]>>;
}) {
  const [query, setQuery] = React.useState("");
  const [matches, setMatches] = React.useState<ISCOMatch[] | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null);
  const [overrideMode, setOverrideMode] = React.useState(false);
  const [overrideCode, setOverrideCode] = React.useState("");
  const [overrideTitle, setOverrideTitle] = React.useState("");

  const runSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setSelectedCode(null);
    setOverrideMode(false);
    window.setTimeout(() => {
      setMatches(findMatches(query));
      setSearching(false);
    }, 350);
  };

  const confirm = () => {
    if (overrideMode) {
      if (!overrideCode.trim() || !overrideTitle.trim() || !query.trim()) return;
      setOccupations((prev) => [
        ...prev,
        {
          id: `o-${Date.now()}`,
          localTitle: query.trim(),
          iscoCode: overrideCode.trim(),
          iscoTitle: overrideTitle.trim(),
          confidence: 100,
          source: "manual",
        },
      ]);
    } else {
      const m = matches?.find((x) => x.entry.code === selectedCode);
      if (!m) return;
      setOccupations((prev) => [
        ...prev,
        {
          id: `o-${Date.now()}`,
          localTitle: query.trim(),
          iscoCode: m.entry.code,
          iscoTitle: m.entry.title,
          confidence: m.confidence,
          source: "ai",
        },
      ]);
    }
    setQuery("");
    setMatches(null);
    setSelectedCode(null);
    setOverrideMode(false);
    setOverrideCode("");
    setOverrideTitle("");
  };

  const remove = (id: string) => setOccupations((p) => p.filter((o) => o.id !== id));

  return (
    <section className="mt-12">
      <SectionTitle>Local job titles → ISCO-08 codes</SectionTitle>

      <p className="text-sm max-w-[760px]" style={{ color: "var(--console-fg-muted)" }}>
        When users describe their work, OmniSkill needs to translate informal job
        descriptions into ISCO-08 codes. Add the most common job titles in your
        context below.
      </p>

      {/* Split panel */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--console-border)", background: "var(--console-canvas)" }}
        >
          <div className="text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color: "var(--console-fg-muted)" }}>
            Add a job title from your context
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setMatches(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            placeholder='e.g. "Keke driver", "Susu collector", "Chop bar cook"'
            className="w-full text-sm px-3 py-2 rounded-md border bg-transparent"
            style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={runSearch}
              disabled={!query.trim() || searching}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium"
              style={{
                background: "var(--console-accent)",
                color: "var(--console-accent-fg)",
                opacity: !query.trim() || searching ? 0.55 : 1,
              }}
            >
              {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              {searching ? "Searching…" : "Find ISCO match"}
            </button>
            {(matches || searching) && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setMatches(null);
                  setSelectedCode(null);
                  setOverrideMode(false);
                }}
                className="text-xs"
                style={{ color: "var(--console-fg-muted)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right */}
        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--console-border)", background: "var(--console-canvas)" }}
        >
          <div className="text-[11px] uppercase tracking-[0.08em] mb-2" style={{ color: "var(--console-fg-muted)" }}>
            Suggested ISCO-08 matches
          </div>

          {!matches && !searching && (
            <div className="text-xs py-6 text-center" style={{ color: "var(--console-fg-faint)" }}>
              Enter a job title on the left, then click "Find ISCO match".
            </div>
          )}

          {searching && (
            <div className="py-6 text-center" style={{ color: "var(--console-fg-faint)" }}>
              <Loader2 size={16} className="animate-spin inline" />
            </div>
          )}

          {matches && matches.length === 0 && !overrideMode && (
            <div className="text-xs py-4" style={{ color: "var(--console-fg-muted)" }}>
              No close matches. Use{" "}
              <button
                type="button"
                onClick={() => setOverrideMode(true)}
                className="underline underline-offset-2"
                style={{ color: "var(--console-accent)" }}
              >
                manual override
              </button>{" "}
              to enter an ISCO code directly.
            </div>
          )}

          {matches && matches.length > 0 && !overrideMode && (
            <div className="space-y-2">
              {matches.map((m) => {
                const selected = selectedCode === m.entry.code;
                return (
                  <button
                    key={m.entry.code}
                    type="button"
                    onClick={() => setSelectedCode(m.entry.code)}
                    className="w-full text-left rounded-md border p-3 transition-colors"
                    style={{
                      borderColor: selected
                        ? "var(--console-accent)"
                        : "var(--console-border)",
                      background: selected
                        ? "color-mix(in oklab, var(--console-accent) 6%, transparent)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-baseline gap-2">
                      <code
                        className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--console-panel-strong)",
                          color: "var(--console-accent)",
                        }}
                      >
                        ISCO {m.entry.code}
                      </code>
                      <span className="text-sm font-medium">{m.entry.title}</span>
                      <span
                        className="ml-auto text-[11px] font-mono"
                        style={{ color: "var(--console-fg-muted)" }}
                      >
                        {m.confidence}%
                      </span>
                    </div>
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: "var(--console-fg-muted)" }}
                    >
                      {m.entry.description}
                    </p>
                    <div
                      className="mt-2 h-1 rounded-full overflow-hidden"
                      style={{ background: "var(--console-panel-strong)" }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${m.confidence}%`,
                          background:
                            m.confidence >= 80
                              ? "var(--signal-green)"
                              : m.confidence >= 60
                              ? "var(--signal-amber)"
                              : "var(--console-fg-muted)",
                        }}
                      />
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setOverrideMode(true)}
                className="text-xs underline underline-offset-2"
                style={{ color: "var(--console-fg-muted)" }}
              >
                None of these match
              </button>
            </div>
          )}

          {overrideMode && (
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--console-fg-muted)" }}>
                Manual override
              </div>
              <input
                type="text"
                value={overrideCode}
                onChange={(e) => setOverrideCode(e.target.value)}
                placeholder="ISCO code (e.g. 7421)"
                className="w-full text-sm px-3 py-2 rounded-md border bg-transparent font-mono"
                style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
              />
              <input
                type="text"
                value={overrideTitle}
                onChange={(e) => setOverrideTitle(e.target.value)}
                placeholder="Official ISCO title"
                className="w-full text-sm px-3 py-2 rounded-md border bg-transparent"
                style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
              />
              <button
                type="button"
                onClick={() => setOverrideMode(false)}
                className="text-xs"
                style={{ color: "var(--console-fg-muted)" }}
              >
                ← Back to suggestions
              </button>
            </div>
          )}

          {(selectedCode || overrideMode) && (
            <div className="mt-3 pt-3 border-t flex justify-end" style={{ borderColor: "var(--console-rule)" }}>
              <button
                type="button"
                onClick={confirm}
                disabled={
                  overrideMode
                    ? !overrideCode.trim() || !overrideTitle.trim()
                    : !selectedCode
                }
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium"
                style={{
                  background: "var(--console-accent)",
                  color: "var(--console-accent-fg)",
                  opacity:
                    (overrideMode && (!overrideCode.trim() || !overrideTitle.trim())) ||
                    (!overrideMode && !selectedCode)
                      ? 0.55
                      : 1,
                }}
              >
                <Check size={12} />
                Confirm mapping
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk row */}
      <div
        className="mt-6 rounded-lg border px-4 py-3 flex items-center gap-3 flex-wrap"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-panel)",
        }}
      >
        <span className="text-sm font-medium">Have an existing mapping?</span>
        <label
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border cursor-pointer"
          style={{
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
            background: "var(--console-canvas)",
          }}
        >
          <Upload size={12} />
          Upload CSV
          <input type="file" accept=".csv" className="hidden" />
        </label>
        <span style={{ color: "var(--console-fg-faint)" }}>·</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs"
          style={{ color: "var(--console-accent)" }}
        >
          <Download size={12} />
          Download template
        </button>
      </div>

      {/* Mapping table */}
      <div
        className="mt-4 rounded-lg border overflow-hidden"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{ background: "var(--console-panel)", color: "var(--console-fg-muted)" }}
            >
              <Th>Local title</Th>
              <Th style={{ width: 110 }}>ISCO code</Th>
              <Th>ISCO title</Th>
              <Th style={{ width: 110 }}>Confidence</Th>
              <Th style={{ width: 130 }}>Source</Th>
              <Th style={{ width: 50 }} />
            </tr>
          </thead>
          <tbody>
            {occupations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs" style={{ color: "var(--console-fg-faint)" }}>
                  No mappings yet. Add a job title above to get started.
                </td>
              </tr>
            )}
            {occupations.map((o) => (
              <tr key={o.id} className="border-t" style={{ borderColor: "var(--console-rule)" }}>
                <Td>
                  <span className="font-medium">{o.localTitle}</span>
                </Td>
                <Td>
                  <code
                    className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--console-panel-strong)",
                      color: "var(--console-accent)",
                    }}
                  >
                    {o.iscoCode}
                  </code>
                </Td>
                <Td>
                  <span style={{ color: "var(--console-fg-muted)" }}>{o.iscoTitle}</span>
                </Td>
                <Td>
                  <ConfidenceBar value={o.confidence} />
                </Td>
                <Td>
                  <SourceBadge source={o.source} />
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => remove(o.id)}
                    aria-label="Remove mapping"
                    className="p-1 rounded"
                    style={{ color: "var(--console-fg-faint)" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const tone =
    value >= 80 ? "var(--signal-green)" : value >= 60 ? "var(--signal-amber)" : "var(--console-fg-muted)";
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1 rounded-full overflow-hidden max-w-[60px]"
        style={{ background: "var(--console-panel-strong)" }}
      >
        <div className="h-full" style={{ width: `${value}%`, background: tone }} />
      </div>
      <span className="font-mono text-[11px]" style={{ color: "var(--console-fg-muted)" }}>
        {value}%
      </span>
    </div>
  );
}

function SourceBadge({ source }: { source: MappingSource }) {
  const map = {
    ai: { color: "#7C5BBF", label: "AI suggested", icon: <Sparkles size={10} /> },
    manual: { color: "var(--console-fg-muted)", label: "Manual", icon: <Hand size={10} /> },
    imported: { color: "var(--signal-green)", label: "Imported", icon: <CloudDownload size={10} /> },
  } as const;
  const { color, label, icon } = map[source];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium"
      style={{
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/* ─── Section 3: Automation overrides ──────────────────────────────── */

function OverridesSection({
  overrides,
  setOverrides,
}: {
  overrides: AutomationOverride[];
  setOverrides: React.Dispatch<React.SetStateAction<AutomationOverride[]>>;
}) {
  const update = (code: string, patch: Partial<AutomationOverride>) => {
    setOverrides((prev) => prev.map((o) => (o.iscoCode === code ? { ...o, ...patch } : o)));
  };
  const reset = (code: string) => update(code, { override: null, why: "" });

  return (
    <section className="mt-12">
      <SectionTitle>Automation risk adjustments for this context</SectionTitle>

      <p className="text-sm max-w-[760px]" style={{ color: "var(--console-fg-muted)" }}>
        Frey-Osborne scores are based on US task composition. Override scores
        here for occupations that work differently in your context.
      </p>

      <div
        className="mt-3 rounded-md border px-3 py-2 inline-flex items-center gap-2 text-xs"
        style={{
          borderColor: "color-mix(in oklab, var(--signal-amber) 40%, transparent)",
          background: "color-mix(in oklab, var(--signal-amber) 6%, transparent)",
          color: "var(--console-fg)",
        }}
      >
        <AlertTriangle size={12} style={{ color: "var(--signal-amber)" }} />
        Overrides apply only to this context. They do not affect other deployments.
      </div>

      <div
        className="mt-4 rounded-lg border overflow-hidden"
        style={{
          borderColor: "var(--console-border)",
          background: "var(--console-canvas)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: "var(--console-panel)", color: "var(--console-fg-muted)" }}>
              <Th>ISCO code + title</Th>
              <Th style={{ width: 160 }}>Frey-Osborne base</Th>
              <Th style={{ width: 160 }}>Your override</Th>
              <Th>Why? (optional)</Th>
              <Th style={{ width: 130 }} />
            </tr>
          </thead>
          <tbody>
            {overrides.map((o) => {
              const effective = o.override ?? o.base;
              const delta = o.override !== null ? o.override - o.base : 0;
              return (
                <tr key={o.iscoCode} className="border-t" style={{ borderColor: "var(--console-rule)" }}>
                  <Td>
                    <div className="flex items-baseline gap-2">
                      <code
                        className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--console-panel-strong)",
                          color: "var(--console-accent)",
                        }}
                      >
                        {o.iscoCode}
                      </code>
                      <span className="font-medium">{o.iscoTitle}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-sm" style={{ color: "var(--console-fg-muted)" }}>
                      {(o.base * 100).toFixed(0)}%
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={o.override === null ? "" : Math.round(o.override * 100)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            update(o.iscoCode, { override: null });
                          } else {
                            const n = Math.max(0, Math.min(100, Number(raw)));
                            update(o.iscoCode, { override: n / 100 });
                          }
                        }}
                        placeholder="—"
                        className="w-16 text-sm px-2 py-1 rounded-md border bg-transparent font-mono text-right"
                        style={{ borderColor: "var(--console-border)", color: "var(--console-fg)" }}
                      />
                      <span className="text-xs" style={{ color: "var(--console-fg-muted)" }}>%</span>
                      {o.override !== null && delta !== 0 && (
                        <span
                          className="ml-1 text-[10px] font-mono"
                          style={{
                            color: delta < 0 ? "var(--signal-green)" : "var(--signal-amber)",
                          }}
                        >
                          {delta > 0 ? "+" : ""}{(delta * 100).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <CellInput
                      value={o.why}
                      onChange={(v) => update(o.iscoCode, { why: v })}
                      placeholder="Why does this differ here?"
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[11px]" style={{ color: "var(--console-fg-faint)" }}>
                        Effective {(effective * 100).toFixed(0)}%
                      </span>
                      {o.override !== null && (
                        <button
                          type="button"
                          onClick={() => reset(o.iscoCode)}
                          className="inline-flex items-center gap-1 text-[11px]"
                          style={{ color: "var(--console-accent)" }}
                        >
                          <RotateCcw size={10} />
                          Reset
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─── Save bar ─────────────────────────────────────────────────────── */

function SaveBar({
  credUnmapped,
  occMissing,
}: {
  credUnmapped: number;
  occMissing: number;
}) {
  const [publishing, setPublishing] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const blocked = credUnmapped > 0;

  const publish = () => {
    if (blocked) return;
    setPublishing(true);
    window.setTimeout(() => {
      setPublishing(false);
      setToast("Taxonomy validated and published.");
      window.setTimeout(() => setToast(null), 2400);
    }, 700);
  };

  return (
    <>
      {toast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-md border px-3 py-2 text-xs shadow-md inline-flex items-center gap-2"
          style={{
            background: "var(--console-canvas)",
            borderColor: "var(--console-border)",
            color: "var(--console-fg)",
          }}
        >
          <Check size={12} style={{ color: "var(--signal-green)" }} />
          {toast}
        </div>
      )}
      <div
        className="fixed bottom-0 left-0 md:left-[240px] right-0 z-40 border-t px-6 py-3 flex items-center gap-3"
        style={{
          background: "var(--console-canvas)",
          borderColor: "var(--console-border)",
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          {blocked ? (
            <>
              <AlertTriangle size={12} style={{ color: "var(--console-danger)" }} />
              <span style={{ color: "var(--console-danger)" }}>
                {credUnmapped} unmapped credential{credUnmapped === 1 ? "" : "s"}
                {occMissing > 0 ? `, ${occMissing} more job titles recommended` : ""}
              </span>
            </>
          ) : occMissing > 0 ? (
            <>
              <AlertTriangle size={12} style={{ color: "var(--signal-amber)" }} />
              <span style={{ color: "var(--console-fg-muted)" }}>
                {occMissing} more job title{occMissing === 1 ? "" : "s"} recommended for full coverage
              </span>
            </>
          ) : (
            <>
              <Check size={12} style={{ color: "var(--signal-green)" }} />
              <span style={{ color: "var(--console-fg-muted)" }}>All required mappings complete.</span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-md"
            style={{ color: "var(--console-fg-muted)" }}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={blocked || publishing}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium"
            style={{
              background: "var(--console-accent)",
              color: "var(--console-accent-fg)",
              opacity: blocked || publishing ? 0.55 : 1,
            }}
          >
            {publishing && <Loader2 size={12} className="animate-spin" />}
            Validate & publish →
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Shared ───────────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[20px] mb-2 tracking-tight">{children}</h2>
  );
}

function ParchmentNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-md border px-3 py-2 text-[13px] leading-relaxed mt-1"
      style={{
        background: "color-mix(in oklab, var(--signal-amber) 5%, var(--console-canvas))",
        borderColor: "var(--console-border)",
        color: "var(--console-fg-muted)",
      }}
    >
      {children}
    </div>
  );
}

function Th({
  children,
  className = "",
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <th
      className={`px-3 py-2.5 text-[11px] uppercase tracking-[0.08em] font-medium ${className}`}
      style={style}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2.5 align-middle ${className}`}>{children}</td>;
}
