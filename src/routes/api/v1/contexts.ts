import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonResponse, errorResponse, preflight } from "@/lib/api-cors";

/* GET /api/v1/contexts
 * Lists all active (publicly published) contexts. */

export const Route = createFileRoute("/api/v1/contexts")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async () => {
        const { data, error } = await supabaseAdmin
          .from("contexts")
          .select("code, name, locale, currency, owner_org, flag_emoji, calibration, updated_at")
          .eq("status", "active")
          .order("name");

        if (error) {
          return errorResponse("Failed to load contexts", 500, { detail: error.message });
        }

        return jsonResponse({
          count: data?.length ?? 0,
          contexts: data ?? [],
        });
      },
    },
  },
});
