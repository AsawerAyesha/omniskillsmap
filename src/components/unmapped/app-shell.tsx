import type { ReactNode } from "react";
import { useUnmappedMode } from "./mode-context";
import { YouthShell } from "./youth-shell";
import { PolicyShell } from "./policy-shell";
import { OfflineBanner } from "./offline-banner";
import { SkipLink } from "./skip-link";
import { BrandToaster } from "./brand-toaster";
import { PageTransition } from "./page-transition";
import { ContextConfigProvider, useContextConfig } from "./context-config/context-config-store";
import { ContextConfigDrawer } from "./context-config/context-config-drawer";

export function AppShell({ children }: { children: ReactNode }) {
  const { mode } = useUnmappedMode();
  const Shell = mode === "policy" ? PolicyShell : YouthShell;

  return (
    <ContextConfigProvider>
      <SkipLink />
      <OfflineBanner />
      <ReconfigureFader>
        <div key={mode} className="u-mode-fade">
          <Shell>
            <PageTransition>{children}</PageTransition>
          </Shell>
        </div>
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