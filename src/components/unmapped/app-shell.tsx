import * as React from "react";
import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { useUnmappedMode } from "./mode-context";
import { YouthShell } from "./youth-shell";
import { PolicyShell } from "./policy-shell";
import { OfflineBanner } from "./offline-banner";
import { SkipLink } from "./skip-link";
import { BrandToaster } from "./brand-toaster";
import { PageTransition } from "./page-transition";
import { ContextConfigProvider, useContextConfig } from "./context-config/context-config-store";
import { ContextConfigDrawer } from "./context-config/context-config-drawer";

/* The route tree is the source of truth for which shell to render.
 * If the URL is /policy or /policy/* → PolicyShell, otherwise YouthShell.
 * The persisted `mode` is kept in sync as a side effect so other consumers
 * (e.g. drawer copy, analytics) read a consistent value, but we never let
 * a stale `mode` cause a shell/route mismatch (the old "components mixing"
 * bug). */
function isPolicyPath(pathname: string): boolean {
  return pathname === "/policy" || pathname.startsWith("/policy/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { mode, setMode } = useUnmappedMode();
  const policyView = isPolicyPath(pathname);
  const Shell = policyView ? PolicyShell : YouthShell;

  React.useEffect(() => {
    const next = policyView ? "policy" : "youth";
    if (next !== mode) setMode(next);
  }, [policyView, mode, setMode]);

  return (
    <ContextConfigProvider>
      <SkipLink />
      <OfflineBanner />
      <ReconfigureFader>
        <Shell>
          <PageTransition>{children}</PageTransition>
        </Shell>
      </ReconfigureFader>
      <ContextConfigDrawer />
      <BrandToaster />
    </ContextConfigProvider>
  );
}

/* Fades the entire app while a reconfiguration is in flight so the
 * background data appears to swap. The overlay loader lives in the drawer. */
function ReconfigureFader({ children }: { children: ReactNode }) {
  const { isReconfiguring } = useContextConfig();
  return (
    <div
      className="transition-opacity duration-200 ease-precision"
      style={{ opacity: isReconfiguring ? 0 : 1 }}
      aria-busy={isReconfiguring || undefined}
    >
      {children}
    </div>
  );
}