// Shared CORS headers for the public OmniSkill API.
// All endpoints are read-only and intended to be embedded by external systems
// (governments, NGOs, employers), so we allow any origin.

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=60",
} as const;

export function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function errorResponse(message: string, status: number, extra?: Record<string, unknown>) {
  return jsonResponse({ error: message, status, ...(extra ?? {}) }, status);
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
