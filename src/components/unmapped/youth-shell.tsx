import * as React from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  House,
  User,
  Briefcase,
  BookOpen,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeftRight,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeSwitcher } from "./mode-switcher";
import { SwitchContextButton } from "./context-config/switch-context-button";
import { useContextConfig } from "./context-config/context-config-store";
import { useUnmappedMode } from "./mode-context";
import { ThemeSwitcher } from "./theme-switcher";
import omniskillMark from "@/assets/omniskill-mark.svg";

const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/ai-readiness", label: "Risk", icon: ShieldAlert },
] as const;

export function YouthShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { openDrawer, active } = useContextConfig();
  const { mode, setMode } = useUnmappedMode();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("u.sidebar.collapsed") === "1";
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("u.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen flex bg-[var(--surface)] text-[var(--ink)]">
      {/* Desktop sidebar — fixed to viewport, collapsible to icon rail */}
      <aside
        aria-label="Primary navigation"
        data-collapsed={collapsed}
        className={cn(
          "hidden md:flex flex-col shrink-0 sticky top-0 self-start h-screen",
          "border-r border-border-subtle bg-[var(--surface-raised)]",
          "transition-[width] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "w-[64px]" : "w-[240px]",
        )}
      >
        <div
          className={cn(
            "h-[68px] border-b border-border-subtle flex items-center",
            collapsed ? "justify-center px-2" : "justify-between px-5",
          )}
        >
          {!collapsed && (
            <span className="inline-flex items-center gap-2 font-display text-lg tracking-tight">
              <img src={omniskillMark} alt="" aria-hidden="true" width={36} height={36} className="rounded-md" />
              OmniSkill
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-tertiary)] hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen size={16} strokeWidth={1.5} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={1.5} />
            )}
          </button>
        </div>

        <nav
          aria-label="Primary"
          className={cn(
            "flex-1 overflow-y-auto py-4 space-y-1",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {TABS.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                title={collapsed ? t.label : undefined}
                aria-label={t.label}
                className={cn(
                  "flex items-center rounded-lg text-sm transition-colors",
                  collapsed
                    ? "h-10 w-10 mx-auto justify-center"
                    : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-[var(--earth-light)] text-[var(--earth-dark)] font-medium"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={
                    active
                      ? "text-[var(--earth-dark)] shrink-0"
                      : "text-[var(--ink-tertiary)] shrink-0"
                  }
                />
                {!collapsed && <span className="truncate">{t.label}</span>}
              </Link>
            );
          })}
          {/* Persistent prominent link to Operator Console */}
          <Link
            to="/console"
            title={collapsed ? "Operator Console" : undefined}
            aria-label="Operator Console"
            className={cn(
              "mt-2 flex items-center rounded-lg text-sm transition-colors border border-border-subtle bg-[var(--surface-sunken)] hover:bg-[var(--earth-light)] hover:text-[var(--earth-dark)] text-[var(--ink-secondary)]",
              collapsed
                ? "h-10 w-10 mx-auto justify-center"
                : "gap-3 px-3 py-2.5",
            )}
          >
            <Terminal size={20} strokeWidth={1.5} className="shrink-0" />
            {!collapsed && <span className="truncate font-medium">Operator Console</span>}
          </Link>
        </nav>

        <div
          className={cn(
            "border-t border-border-subtle",
            collapsed ? "px-2 py-3 space-y-2" : "px-4 py-4 space-y-3",
          )}
        >
          {!collapsed && (
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-tertiary)]">
              Context
            </div>
          )}
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={openDrawer}
                title={`Switch context — ${active.country}`}
                aria-label={`Switch context. Active: ${active.country}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-[var(--surface-raised)] text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)] transition-colors"
              >
                <span aria-hidden className="text-[14px] leading-none">
                  {active.flag}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = mode === "youth" ? "policy" : "youth";
                  setMode(next);
                  if (next === "policy") navigate({ to: "/policy" });
                  else navigate({ to: "/" });
                }}
                title={`Switch to ${mode === "youth" ? "Policy" : "Youth"} view`}
                aria-label={`Switch to ${mode === "youth" ? "Policy" : "Youth"} view`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-[var(--surface-sunken)] text-[var(--ink-tertiary)] hover:text-[var(--ink)] transition-colors"
              >
                <ArrowLeftRight size={14} strokeWidth={1.5} />
              </button>
              <ThemeSwitcher variant="stacked" />
            </div>
          ) : (
            <>
              <SwitchContextButton className="w-full justify-start" />
              <ModeSwitcher className="w-full justify-stretch" />
              <div className="pt-1">
                <div className="text-[11px] uppercase tracking-wider text-[var(--ink-tertiary)] mb-1.5">
                  Theme
                </div>
                <ThemeSwitcher variant="full" />
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-[var(--surface-raised)]">
          <span className="inline-flex items-center gap-2 font-display text-base tracking-tight">
            <img src={omniskillMark} alt="" aria-hidden="true" width={32} height={32} className="rounded-md" />
            OmniSkill
          </span>
          <div className="flex items-center gap-2">
            <ThemeSwitcher variant="compact" />
            <SwitchContextButton />
            <Link
              to="/console"
              aria-label="Operator Console"
              className="p-2 rounded-full hover:bg-[var(--surface-sunken)] transition-colors"
            >
              <Terminal size={18} strokeWidth={1.5} className="text-[var(--ink-secondary)]" />
            </Link>
            <button
              aria-label="Notifications"
              className="p-2 rounded-full hover:bg-[var(--surface-sunken)] transition-colors"
            >
              <Bell size={18} strokeWidth={1.5} className="text-[var(--ink-secondary)]" />
            </button>
          </div>
        </header>

        <main id="main" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Primary"
          className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-raised)] border-t border-border-subtle z-30"
        >
          <ul className="grid grid-cols-5">
            {TABS.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    aria-label={t.label}
                    className="flex flex-col items-center gap-1 py-2.5 relative"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className={
                        active
                          ? "text-[var(--earth-dark)]"
                          : "text-[var(--ink-tertiary)]"
                      }
                    />
                    <span
                      className={cn(
                        "text-[11px] leading-none",
                        active
                          ? "text-[var(--earth-dark)] font-medium"
                          : "text-[var(--ink-tertiary)]",
                      )}
                    >
                      {t.label}
                    </span>
                    {active && (
                      <span
                        aria-hidden
                        className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--earth)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}