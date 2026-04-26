import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonResponse, errorResponse, preflight } from "@/lib/api-cors";

/* GET /api/v1/contexts/:code/datasets
 * Lists every live dataset (one per kind) for an active context. */

export const Route = createFileRoute("/api/v1/contexts/$code/datasets")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ params }) => {
        const code = String(params.code).trim();
        if (!code || code.length > 64) {
          return errorResponse("Invalid context code", 400);
        }

        const { data: ctx, error: ctxErr } = await supabaseAdmin
          .from("contexts")
          .select("id, code, name")
          .eq("status", "active")
          .eq("code", code)
          .maybeSingle();

        if (ctxErr) return errorResponse("Failed to load context", 500, { detail: ctxErr.message });
        if (!ctx) return errorResponse("Context not found or not published", 404);

        const { data, error } = await supabaseAdmin
          .from("datasets")
          .select("id, kind, version, published_at, notes")
          .eq("context_id", ctx.id)
          .eq("status", "live")
          .order("kind");

        if (error) {
          return errorResponse("Failed to load datasets", 500, { detail: error.message });
        }

        return jsonResponse({
          context: { code: ctx.code, name: ctx.name },
          count: data?.length ?? 0,
          datasets: data ?? [],
        });
      },
    },
  },
});
