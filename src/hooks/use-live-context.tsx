import * as React from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  fetchActiveContexts,
  type LiveContext,
} from "@/lib/live-data";

/* useLiveContext — resolves the public-facing active context from URL search.
 *
 * The selected context lives in `?ctx=<code>` so it's bookmarkable and
 * survives reloads. Falls back to the first active context if no `?ctx`
 * is set or the code is unknown. Returns `null` if no contexts are active. */

interface UseLiveContextResult {
  loading: boolean;
  contexts: LiveContext[];
  active: LiveContext | null;
  setActive: (code: string) => void;
}

export function useLiveContext(): UseLiveContextResult {
  const location = useLocation();
  const navigate = useNavigate();
  const [contexts, setContexts] = React.useState<LiveContext[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void fetchActiveContexts()
      .then((rows) => {
        if (!cancelled) setContexts(rows);
      })
      .catch(() => {
        if (!cancelled) setContexts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const search = location.search as Record<string, unknown> | undefined;
  const ctxCode =
    typeof search?.ctx === "string" ? (search.ctx as string) : null;

  const active = React.useMemo<LiveContext | null>(() => {
    if (!contexts || contexts.length === 0) return null;
    if (ctxCode) {
      const found = contexts.find((c) => c.code === ctxCode);
      if (found) return found;
    }
    return contexts[0];
  }, [contexts, ctxCode]);

  const setActive = React.useCallback(
    (code: string) => {
      const params = new URLSearchParams(
        Object.entries((location.search as Record<string, unknown>) ?? {}).reduce(
          (acc, [k, v]) => {
            if (typeof v === "string") acc[k] = v;
            return acc;
          },
          {} as Record<string, string>,
        ),
      );
      params.set("ctx", code);
      void navigate({
        to: `${location.pathname}?${params.toString()}` as string,
        replace: true,
      });
    },
    [navigate, location.pathname, location.search],
  );

  return {
    loading: contexts === null,
    contexts: contexts ?? [],
    active,
    setActive,
  };
}