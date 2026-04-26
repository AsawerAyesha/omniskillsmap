import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, preflight } from "@/lib/api-cors";

/* GET /api/v1
 * Discovery / index endpoint for the public OmniSkill protocol API. */

export const Route = createFileRoute("/api/v1/")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = `${url.protocol}//${url.host}/api/v1`;
        return jsonResponse({
          name: "OmniSkill Protocol API",
          version: "1",
          description:
            "Public read API. Each context (country / region / employer) exposes its live datasets. All endpoints return JSON.",
          endpoints: {
            list_contexts: `${base}/contexts`,
            get_context: `${base}/contexts/{code}`,
            list_datasets: `${base}/contexts/{code}/datasets`,
            get_dataset: `${base}/contexts/{code}/datasets/{kind}`,
          },
          dataset_kinds: [
            "taxonomy",
            "occupations",
            "labor",
            "opportunities",
            "learning",
          ],
        });
      },
    },
  },
});
