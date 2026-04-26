import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, ArrowRight, Database, Globe2, Layers, Shield } from "lucide-react";

/* /protocol — public docs page describing the OmniSkill protocol API.
 *
 * This is what makes the project a layer rather than an app: it documents
 * the contract that any government, NGO, training provider or employer
 * can plug into. Sober editorial layout, parchment palette inherited
 * from the public design system. */

export const Route = createFileRoute("/protocol")({
  head: () => ({
    meta: [
      { title: "OmniSkill Protocol — Open infrastructure for skills data" },
      {
        name: "description",
        content:
          "The OmniSkill Protocol is an open, multi-tenant data layer for skills, occupations, labor markets, and learning opportunities. Country-specific data is configuration, not code.",
      },
      {
        property: "og:title",
        content: "OmniSkill Protocol — Open infrastructure for skills data",
      },
      {
        property: "og:description",
        content:
          "Plug local data into a shared protocol. Versioned, multi-tenant, RLS-isolated, public JSON API.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "OmniSkill Protocol" },
      {
        name: "twitter:description",
        content:
          "Open infrastructure for skills, occupations, labor markets, and learning opportunities.",
      },
    ],
  }),
  component: ProtocolPage,
});

function ProtocolPage() {
  return (
    <article
      className="mx-auto px-6 lg:px-10 py-14 lg:py-20"
      style={{ maxWidth: 880, color: "var(--ink)" }}
    >
      {/* Hero */}
      <header className="mb-14">
        <div
          className="text-[11px] uppercase tracking-[0.16em] mb-4"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Protocol · v1
        </div>
        <h1
          className="font-display tracking-tight"
          style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05 }}
        >
          Skills data, as infrastructure.
        </h1>
        <p
          className="mt-5 text-lg leading-relaxed max-w-prose"
          style={{ color: "var(--ink-secondary)" }}
        >
          OmniSkill is a layer, not a product. Any government, NGO, training
          provider or employer can plug in their local labor market data,
          taxonomy, automation calibration and language — and get a
          versioned, multi-tenant API + dashboard out of the box. Country
          parameters are inputs, not hardcoded assumptions.
        </p>
        <div className="mt-7 flex items-center gap-3 flex-wrap">
          <Link
            to="/api/v1"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-colors"
            style={{
              background: "var(--ink)",
              color: "var(--surface)",
            }}
          >
            Browse the API
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/console"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-colors border"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--ink)",
            }}
          >
            Operator console
          </Link>
        </div>
      </header>

      {/* Pillars */}
      <section className="grid sm:grid-cols-2 gap-5 mb-16">
        <Pillar
          icon={<Layers size={16} />}
          title="Configuration over code"
          body="Taxonomy, occupations, labor indicators, opportunities and learning resources are CSV-ingested per context. No code change needed for a new country."
        />
        <Pillar
          icon={<Globe2 size={16} />}
          title="Multi-tenant by design"
          body="Each context (country, region, employer) owns its datasets. Row-Level Security enforces isolation across the entire stack."
        />
        <Pillar
          icon={<Database size={16} />}
          title="Versioned datasets"
          body="Every upload is a draft version. Promotion to live atomically archives the previous version. Full audit trail in ingestion_runs."
        />
        <Pillar
          icon={<Shield size={16} />}
          title="Public read, scoped write"
          body="Active contexts expose their live datasets to any client. Edits require operator membership in that context."
        />
      </section>

      {/* Concepts */}
      <Section id="concepts" title="Concepts">
        <ConceptRow
          term="Context"
          definition="A tenant — typically a country or region (e.g. Pakistan, Ghana Urban). Holds calibration parameters, locale, currency, and ownership."
        />
        <ConceptRow
          term="Dataset"
          definition="A versioned bundle of one kind, scoped to a context. Lifecycle: draft → live → archived."
        />
        <ConceptRow
          term="Kind"
          definition="The schema family. One of taxonomy, occupations, labor, opportunities, learning."
        />
        <ConceptRow
          term="Calibration"
          definition="Per-context tunables stored on the context (e.g. automation risk weighting for the local economy)."
        />
        <ConceptRow
          term="Ingestion run"
          definition="Append-only audit record for every CSV upload: rows in / ok / err, file name, validation errors, actor."
        />
      </Section>

      {/* API endpoints */}
      <Section id="api" title="REST API">
        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "var(--ink-secondary)" }}
        >
          All endpoints return JSON, allow CORS from any origin, and respond
          with a 60-second cache hint. Only datasets in <Code>status=live</Code>{" "}
          inside contexts in <Code>status=active</Code> are returned.
        </p>

        <Endpoint
          method="GET"
          path="/api/v1"
          desc="Discovery document with endpoint index and supported kinds."
        />
        <Endpoint
          method="GET"
          path="/api/v1/contexts"
          desc="List every published context."
        />
        <Endpoint
          method="GET"
          path="/api/v1/contexts/{code}"
          desc="One context by code, with summary of its live datasets."
        />
        <Endpoint
          method="GET"
          path="/api/v1/contexts/{code}/datasets"
          desc="All live datasets for a context, one per kind."
        />
        <Endpoint
          method="GET"
          path="/api/v1/contexts/{code}/datasets/{kind}"
          desc="Rows for one kind. Pagination via limit (1..1000) and offset."
        />
      </Section>

      {/* Example */}
      <Section id="example" title="Example response">
        <p
          className="text-base mb-4"
          style={{ color: "var(--ink-secondary)" }}
        >
          A request for the labor indicators of the Pakistan context:
        </p>
        <PreBlock>{`GET /api/v1/contexts/PK/datasets/labor?limit=2

{
  "context": { "code": "PK", "name": "Pakistan" },
  "dataset": {
    "kind": "labor",
    "version": 3,
    "published_at": "2026-04-25T10:14:22.118Z"
  },
  "paging": { "limit": 2, "offset": 0, "returned": 2, "total": 184 },
  "rows": [
    {
      "indicator_code": "youth_unemployment",
      "year": 2024,
      "sex": "F",
      "age_band": "15-24",
      "value": 11.6
    },
    {
      "indicator_code": "labour_force_participation",
      "year": 2024,
      "sex": "M",
      "age_band": "15-64",
      "value": 67.4
    }
  ]
}`}</PreBlock>
      </Section>

      {/* Schemas */}
      <Section id="schemas" title="Dataset schemas">
        <p
          className="text-base mb-5"
          style={{ color: "var(--ink-secondary)" }}
        >
          Each kind validates uploaded CSVs against a Zod schema. Field names
          must match exactly.
        </p>

        <SchemaTable
          name="taxonomy"
          rows={[
            ["code", "string", "Stable identifier within the context."],
            ["label", "string", "Human-readable skill name."],
            ["parent_code", "string?", "Code of the parent skill, if any."],
            ["level", "int", "Depth in the hierarchy (0 = root)."],
            ["source", "string?", "Origin (e.g. ESCO, O*NET, custom)."],
          ]}
        />
        <SchemaTable
          name="occupations"
          rows={[
            ["code", "string", "Local occupation code."],
            ["title", "string", "Occupation title in the context locale."],
            ["isco_major", "string?", "ISCO-08 major group mapping."],
            ["automation_risk", "number 0..1", "Calibrated automation exposure."],
          ]}
        />
        <SchemaTable
          name="labor"
          rows={[
            ["indicator_code", "string", "e.g. youth_unemployment."],
            ["year", "int", "Reference year."],
            ["sex", "M | F | T?", "Optional disaggregation."],
            ["age_band", "string?", "e.g. 15-24."],
            ["value", "number", "Indicator value (units depend on indicator)."],
          ]}
        />
        <SchemaTable
          name="opportunities"
          rows={[
            ["title", "string", "Opportunity title."],
            ["employer", "string?", "Org or platform offering it."],
            ["sector", "string?", "Industry / sector tag."],
            ["region", "string?", "Geographic scope within the context."],
            ["remote", "boolean", "Remote-eligible flag."],
            ["skills", "string[]", "Skill codes from the live taxonomy."],
            ["url", "string?", "Application URL."],
          ]}
        />
        <SchemaTable
          name="learning"
          rows={[
            ["title", "string", "Course or resource title."],
            ["provider", "string?", "Issuing org."],
            ["url", "string?", "Direct URL."],
            ["language", "string?", "ISO 639 code."],
            ["duration_h", "number?", "Hours to complete."],
            ["cost", "number?", "Local currency, 0 = free."],
            ["skill_codes", "string[]", "Skill codes covered."],
          ]}
        />
      </Section>

      {/* Lifecycle */}
      <Section id="lifecycle" title="Dataset lifecycle">
        <ol
          className="space-y-3 text-base leading-relaxed pl-5"
          style={{ color: "var(--ink-secondary)", listStyle: "decimal" }}
        >
          <li>
            Operator uploads a CSV via the console. Rows are validated
            client-side against the kind's schema; bad rows surface inline.
          </li>
          <li>
            On commit, a new <Code>dataset</Code> is created with{" "}
            <Code>status=draft</Code> and the validated rows are bulk-inserted.
            An <Code>ingestion_runs</Code> record captures the audit trail.
          </li>
          <li>
            From the deploy screen, the operator promotes a draft to{" "}
            <Code>live</Code>. A trigger archives any previous live version
            and stamps <Code>published_at</Code>.
          </li>
          <li>
            The context is flipped to <Code>active</Code>. The public dashboard
            and API now serve the new dataset, scoped by the URL <Code>?ctx=</Code>{" "}
            param or the API path.
          </li>
        </ol>
      </Section>

      {/* Security */}
      <Section id="security" title="Security model">
        <ul
          className="space-y-3 text-base leading-relaxed pl-5"
          style={{ color: "var(--ink-secondary)", listStyle: "disc" }}
        >
          <li>
            Roles live in a separate <Code>user_roles</Code> table. Role checks
            go through a security-definer function to avoid recursive RLS.
          </li>
          <li>
            Operators are members of the contexts they own or edit. Writes to
            datasets and child tables require <Code>can_edit_context</Code>.
          </li>
          <li>
            Public reads are gated by a SQL predicate that requires both{" "}
            <Code>contexts.status='active'</Code> and{" "}
            <Code>datasets.status='live'</Code>.
          </li>
          <li>
            Ingestion runs are append-only. The audit log cannot be edited or
            deleted, even by context owners.
          </li>
        </ul>
      </Section>

      {/* Footer CTA */}
      <footer
        className="mt-20 pt-10 border-t flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Plug in
          </div>
          <div
            className="font-display text-2xl tracking-tight mt-1"
            style={{ color: "var(--ink)" }}
          >
            Bring your own context.
          </div>
        </div>
        <Link
          to="/console"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md"
          style={{ background: "var(--ink)", color: "var(--surface)" }}
        >
          Open the console
          <ArrowRight size={14} />
        </Link>
      </footer>
    </article>
  );
}

/* ---------- Atoms ---------- */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <h2
        className="font-display tracking-tight mb-5"
        style={{ fontSize: 24, color: "var(--ink)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="inline-flex items-center justify-center h-8 w-8 rounded-md mb-3"
        style={{
          background: "var(--surface-sunken)",
          color: "var(--ink)",
        }}
      >
        {icon}
      </div>
      <div
        className="font-medium mb-1"
        style={{ color: "var(--ink)", fontSize: 15 }}
      >
        {title}
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--ink-secondary)" }}
      >
        {body}
      </p>
    </div>
  );
}

function ConceptRow({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  return (
    <div
      className="grid grid-cols-[140px_1fr] gap-5 py-3 border-b"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div
        className="text-sm font-medium"
        style={{ color: "var(--ink)" }}
      >
        {term}
      </div>
      <div
        className="text-sm leading-relaxed"
        style={{ color: "var(--ink-secondary)" }}
      >
        {definition}
      </div>
    </div>
  );
}

function Endpoint({
  method,
  path,
  desc,
}: {
  method: string;
  path: string;
  desc: string;
}) {
  return (
    <div
      className="flex flex-wrap items-baseline gap-3 py-3 border-b"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span
        className="inline-block text-[11px] font-mono px-1.5 py-0.5 rounded"
        style={{
          background: "var(--surface-sunken)",
          color: "var(--ink)",
          minWidth: 42,
          textAlign: "center",
        }}
      >
        {method}
      </span>
      <code
        className="font-mono text-sm"
        style={{ color: "var(--ink)" }}
      >
        {path}
      </code>
      <span
        className="text-sm flex-1 min-w-[200px]"
        style={{ color: "var(--ink-secondary)" }}
      >
        {desc}
      </span>
    </div>
  );
}

function SchemaTable({
  name,
  rows,
}: {
  name: string;
  rows: [string, string, string][];
}) {
  return (
    <div className="mb-7">
      <div
        className="text-[11px] uppercase tracking-[0.12em] mb-2"
        style={{ color: "var(--ink-tertiary)" }}
      >
        Kind: {name}
      </div>
      <div
        className="rounded-md border overflow-hidden"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-sunken)" }}>
              <Th>Field</Th>
              <Th>Type</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([f, t, d]) => (
              <tr
                key={f}
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <td className="px-3 py-2 font-mono" style={{ color: "var(--ink)" }}>
                  {f}
                </td>
                <td
                  className="px-3 py-2 font-mono text-xs"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  {t}
                </td>
                <td className="px-3 py-2" style={{ color: "var(--ink-secondary)" }}>
                  {d}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left px-3 py-2 text-[11px] uppercase tracking-[0.1em] font-medium"
      style={{ color: "var(--ink-tertiary)" }}
    >
      {children}
    </th>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-[0.875em] px-1 py-0.5 rounded"
      style={{
        background: "var(--surface-sunken)",
        color: "var(--ink)",
      }}
    >
      {children}
    </code>
  );
}

function PreBlock({ children }: { children: string }) {
  return (
    <pre
      className="rounded-md p-4 overflow-x-auto text-xs leading-relaxed"
      style={{
        background: "var(--surface-sunken)",
        color: "var(--ink)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <code className="font-mono">{children}</code>
    </pre>
  );
}
