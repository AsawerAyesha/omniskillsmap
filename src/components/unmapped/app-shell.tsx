import type { ReactNode } from "react";
import { useUnmappedMode } from "./mode-context";
import { YouthShell } from "./youth-shell";
import { PolicyShell } from "./policy-shell";
import { OfflineBanner } from "./offline-banner";
import { SkipLink } from "./skip-link";
import { BrandToaster } from "./brand-toaster";
import { PageTransition } from "./page-transition";

export function AppShell({ children }: { children: ReactNode }) {
  const { mode } = useUnmappedMode();
  const Shell = mode === "policy" ? PolicyShell : YouthShell;

  return (
    <>
      <SkipLink />
      <OfflineBanner />
      <div key={mode} className="u-mode-fade">
        <Shell>
          <PageTransition>{children}</PageTransition>
        </Shell>
      </div>
      <BrandToaster />
    </>
  );
}