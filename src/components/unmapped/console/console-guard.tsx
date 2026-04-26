import * as React from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useConsoleAuth } from "./auth-context";
import { ConsoleShell } from "./console-shell";

/* ConsoleGuard — wraps protected /console/* pages.
 *
 * - While auth state is loading, renders a quiet skeleton on the console
 *   surface so the page never flashes the sign-in form for a logged-in user.
 * - When unauthenticated, redirects to /console/auth/sign-in carrying the
 *   current href as `?redirect=` so deep links survive.
 * - When authenticated, mounts the ConsoleShell around the page. */
export function ConsoleGuard({ children }: { children: React.ReactNode }) {
  const { loading, session } = useConsoleAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !session) {
      // Only preserve a console deep-link target. Never use location.href
      // (which may already contain a redirect param) or paths outside
      // /console — that produces nested ?redirect=?redirect=… loops.
      const path = location.pathname;
      const safeRedirect =
        path.startsWith("/console") && !path.startsWith("/console/auth")
          ? path
          : "/console";
      void navigate({
        to: "/console/auth/sign-in",
        search: { redirect: safeRedirect },
        replace: true,
      });
    }
  }, [loading, session, navigate, location.pathname]);

  if (loading || !session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--console-bg)", color: "var(--console-fg-faint)" }}
      >
        <div className="text-xs uppercase tracking-[0.18em]">Loading…</div>
      </div>
    );
  }

  return <ConsoleShell>{children}</ConsoleShell>;
}