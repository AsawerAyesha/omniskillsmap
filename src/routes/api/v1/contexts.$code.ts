import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonResponse, errorResponse, preflight } from "@/lib/api-cors";

/* GET /api/v1/contexts/:code
 * Returns a single active context by its code (e.g. "PK", "GH-URBAN"). */

export const Route = createFileRoute("/api/v1/contexts/$code")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ params }) => {
        const code = String(params.code).trim();
        if (!code || code.length > 64) {
          return errorResponse("Invalid context code", 400);
        }

        const { data, error } = await supabaseAdmin
          .from("contexts")
          .select(
            "id, code, name, locale, currency, owner_org, flag_emoji, calibration, updated_at, created_at"
          )
          .eq("status", "active")
          .eq("code", code)
          .maybeSingle();

        if (error) {
          return errorResponse("Failed to load context", 500, { detail: error.message });
        }
        if (!data) {
          return errorResponse("Context not found or not published", 404);
        }

        // Live datasets summary
        const { data: datasets } = await supabaseAdmin
          .from("datasets")
          .select("kind, version, published_at")
          .eq("context_id", data.id)
          .eq("status", "live");

        return jsonResponse({
          ...data,
          live_datasets: datasets ?? [],
        });
      },
    },
  },
});
