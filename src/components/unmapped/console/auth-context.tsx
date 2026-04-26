import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/* Console auth context.
 *
 * Holds the authenticated session, the resolved app role(s), and helper
 * predicates the route guard + UI can use without re-querying every render.
 * The role list is loaded once per session change from `public.user_roles`.
 */
export type AppRole = "admin" | "operator" | "viewer";

export interface ConsoleAuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = React.createContext<ConsoleAuthState | null>(null);

export function ConsoleAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<Session | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);

  const loadRoles = React.useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setRoles([]);
      return;
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) {
      console.warn("[console-auth] failed to load roles", error);
      setRoles([]);
      return;
    }
    setRoles((data ?? []).map((r) => r.role as AppRole));
  }, []);

  React.useEffect(() => {
    // CRITICAL: subscribe BEFORE getSession so we never miss the first event.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      // Defer the role fetch so we don't block the auth callback.
      setTimeout(() => {
        void loadRoles(next?.user?.id);
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadRoles(data.session?.user?.id).finally(() => setLoading(false));
      if (!data.session) setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadRoles]);

  const value = React.useMemo<ConsoleAuthState>(() => {
    return {
      loading,
      session,
      user: session?.user ?? null,
      roles,
      hasRole: (r) => roles.includes(r),
      hasAnyRole: (rs) => rs.some((r) => roles.includes(r)),
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refresh: async () => {
        await loadRoles(session?.user?.id);
      },
    };
  }, [loading, session, roles, loadRoles]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConsoleAuth(): ConsoleAuthState {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useConsoleAuth must be used inside <ConsoleAuthProvider>");
  return ctx;
}