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
import { LiveContextPicker } from "./live/live-context-picker";

/* The route tree is the source of truth for which shell to render.
 * If the URL is /policy or /policy/* → PolicyShell, otherwise YouthShell.
 * The persisted `mode` is kept in sync as a side effect so other consumers
 * (e.g. drawer copy, analytics) read a consistent value, but we never let
 * a stale `mode` cause a shell/route mismatch (the old "components mixing"
 * bug). */
function isPolicyPath(pathname: string): boolean {
  return pathname === "/policy" || pathname.startsWith("/policy/");
}

/* /console/* is a fully separate top-level surface — it brings its own
 * shell (ConsoleShell) so we short-circuit AppShell entirely and just
 * render the route outlet. The reset-password route is also outside the
 * Youth/Policy shells. */
function isConsolePath(pathname: string): boolean {
  return (
    pathname === "/console" ||
    pathname.startsWith("/console/") ||
    pathname === "/reset-password"
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { mode, setMode } = useUnmappedMode();
  const policyView = isPolicyPath(pathname);
  const consoleView = isConsolePath(pathname);
  const Shell = policyView ? PolicyShell : YouthShell;

  React.useEffect(() => {
    if (consoleView) return; // Console manages its own state; don't fight it.
    const next = policyView ? "policy" : "youth";
    if (next !== mode) setMode(next);
  }, [policyView, consoleView, mode, setMode]);

  // Console + reset-password render bare — they ship their own shell.
  if (consoleView) {
    return (
      <ContextConfigProvider>
        <SkipLink />
        <OfflineBanner />
        {children}
        <BrandToaster />
      </ContextConfigProvider>
    );
  }

  return (
    <ContextConfigProvider>
      <CountryBridge />
      <SkipLink />
      <OfflineBanner />
      <ReconfigureFader>
        <Shell>
          <PageTransition>{children}</PageTransition>
        </Shell>
      </ReconfigureFader>
      <ContextConfigDrawer />
      <BrandToaster />
      <div className="fixed top-4 right-4 z-50 pointer-events-auto">
        <LiveContextPicker />
      </div>
    </ContextConfigProvider>
  );
}

/* CountryBridge — single source of truth fix.
 *
 * Two stores hold a "country" today: the older UnmappedModeProvider (used by
 * the policy dashboards) and the newer ContextConfigProvider (used by the
 * Youth opportunity flow + Demo Switcher). When the Demo Switcher fires
 * `applyContext`, the new active country must propagate to the policy
 * dashboards too — otherwise judges see a mode-mismatch during the demo.
 *
 * Rather than refactor every dashboard onto the new store mid-hackathon,
 * we sync one direction here: ContextConfig.active.country → mode.setCountry.
 * This component renders nothing. */
function CountryBridge() {
  const { active } = useContextConfig();
  const { country, setCountry } = useUnmappedMode();
  React.useEffect(() => {
    if (active.country && active.country !== country) {
      setCountry(active.country);
    }
  }, [active.country, country, setCountry]);
  return null;
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