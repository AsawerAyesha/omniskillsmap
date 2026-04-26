import * as React from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  FileText,
  Settings,
  CircleDashed,
} from "lucide-react";
import omniskillMark from "@/assets/omniskill-mark.svg";

/* OnboardingShell — visual twin of ConsoleShell but with the navigation
 * dimmed and non-interactive. Used during the org-onboarding flow so the
 * operator gets a preview of the surface they're configuring without being
 * able to navigate away mid-setup. The "current step" label in the header
 * replaces the workspace breadcrumb. */

const NAV = [
  { label: "Workspace", icon: LayoutDashboard },
  { label: "Cohorts", icon: Users },
  { label: "Programs", icon: BookOpen },
  { label: "Signals", icon: Activity },
  { label: "Methodology", icon: FileText },
  { label: "Settings", icon: Settings },
] as const;

export function OnboardingShell({
  step,
  totalSteps,
  stepTitle,
  children,
}: {
  step: number;
  totalSteps: number;
  stepTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--console-bg)", color: "var(--console-fg)" }}
    >
      {/* Dimmed sidebar */}
      <aside
        className="hidden md:flex w-[240px] shrink-0 flex-col border-r select-none"
        style={{
          background: "var(--console-sidebar-bg)",
          borderColor: "var(--console-border)",
        }}
        aria-hidden
      >
        <div
          className="px-5 h-14 flex items-center gap-2.5 border-b"
          style={{ borderColor: "var(--console-border)" }}
        >
          <img src={omniskillMark} alt="" aria-hidden="true" width={20} height={20} className="rounded-sm" />
          <span className="font-display text-base tracking-tight">OmniSkill</span>
          <span
            className="ml-auto text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--console-panel-strong)",
              color: "var(--console-fg-muted)",
            }}
          >
            Setup
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5" style={{ opacity: 0.35 }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm"
                style={{ color: "var(--console-fg-muted)" }}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div
          className="px-3 py-3 border-t"
          style={{ borderColor: "var(--console-border)", opacity: 0.5 }}
        >
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <CircleDashed
              size={20}
              strokeWidth={1.5}
              style={{ color: "var(--console-fg-faint)" }}
            />
            <div className="text-xs" style={{ color: "var(--console-fg-faint)" }}>
              Setting up…
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-14 shrink-0 border-b flex items-center px-5 gap-3"
          style={{
            background: "var(--console-canvas)",
            borderColor: "var(--console-border)",
          }}
        >
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className="text-xs uppercase tracking-[0.12em]"
              style={{ color: "var(--console-fg-faint)" }}
            >
              Setup
            </span>
            <span style={{ color: "var(--console-fg-faint)" }}>/</span>
            <span className="text-sm font-medium truncate">
              Step {step} of {totalSteps} · {stepTitle}
            </span>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}