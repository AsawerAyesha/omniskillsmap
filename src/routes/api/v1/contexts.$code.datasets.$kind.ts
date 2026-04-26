import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonResponse, errorResponse, preflight } from "@/lib/api-cors";

/* GET /api/v1/contexts/:code/datasets/:kind
 * Returns the live rows for a given dataset kind in an active context.
 * kind ∈ { taxonomy | occupations | labor | opportunities | learning }.
 *
 * Query params:
 *   limit  (1..1000, default 500)
 *   offset (>=0, default 0)
 */

type KindTable =
  | "taxonomy_skills"
  | "occupations"
  | "labor_indicators"
  | "opportunities"
  | "learning_resources";

const KIND_TABLE: Record<string, { table: KindTable; cols: string }> = {
  taxonomy:      { table: "taxonomy_skills",  cols: "code, label, parent_code, level, source" },
  occupations:   { table: "occupations",      cols: "code, title, isco_major, automation_risk" },
  labor:         { table: "labor_indicators", cols: "indicator_code, year, sex, age_band, value, ref_area, source_code, classif1, classif2, obs_status, note_classif, note_indicator, note_source" },
  opportunities: { table: "opportunities",    cols: "title, employer, sector, region, remote, skills, url" },
  learning:      { table: "learning_resources", cols: "title, provider, url, language, duration_h, cost, skill_codes" },
};

export const Route = createFileRoute("/api/v1/contexts/$code/datasets/$kind")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ params, request }) => {
        const code = String(params.code).trim();
        const kind = String(params.kind).trim().toLowerCase();

        if (!code || code.length > 64) {
          return errorResponse("Invalid context code", 400);
        }
        const conf = KIND_TABLE[kind];
        if (!conf) {
          return errorResponse(
            `Unknown dataset kind '${kind}'. Allowed: ${Object.keys(KIND_TABLE).join(", ")}`,
            400
          );
        }

        const url = new URL(request.url);
        const limit = clamp(parseInt(url.searchParams.get("limit") ?? "500", 10) || 500, 1, 1000);
        const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);

        // Resolve active context
        const { data: ctx, error: ctxErr } = await supabaseAdmin
          .from("contexts")
          .select("id, code, name")
          .eq("status", "active")
          .eq("code", code)
          .maybeSingle();

        if (ctxErr) return errorResponse("Failed to load context", 500, { detail: ctxErr.message });
        if (!ctx) return errorResponse("Context not found or not published", 404);

        // Resolve the live dataset for this kind
        const { data: ds, error: dsErr } = await supabaseAdmin
          .from("datasets")
          .select("id, kind, version, published_at")
          .eq("context_id", ctx.id)
          .eq("status", "live")
          .eq("kind", kind as "taxonomy" | "occupations" | "labor" | "opportunities" | "learning")
          .maybeSingle();

        if (dsErr) return errorResponse("Failed to resolve dataset", 500, { detail: dsErr.message });
        if (!ds) return errorResponse(`No live ${kind} dataset for this context`, 404);

        // Fetch rows + count
        const rowsRes = await supabaseAdmin
          .from(conf.table)
          .select(conf.cols, { count: "exact" })
          .eq("dataset_id", ds.id)
          .range(offset, offset + limit - 1);

        if (rowsRes.error) {
          return errorResponse("Failed to load rows", 500, { detail: rowsRes.error.message });
        }

        return jsonResponse({
          context: { code: ctx.code, name: ctx.name },
          dataset: {
            kind: ds.kind,
            version: ds.version,
            published_at: ds.published_at,
          },
          paging: {
            limit,
            offset,
            returned: rowsRes.data?.length ?? 0,
            total: rowsRes.count ?? null,
          },
          rows: rowsRes.data ?? [],
        });
      },
    },
  },
});

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
