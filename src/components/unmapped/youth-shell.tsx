import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { House, User, Briefcase, BookOpen, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountryChip } from "./country-chip";
import { ModeSwitcher } from "./mode-switcher";

const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/learn", label: "Learn", icon: BookOpen },
] as const;

export function YouthShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-[var(--surface)] text-[var(--ink)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-border-subtle bg-[var(--surface-raised)]">
        <div className="px-6 py-5 border-b border-border-subtle">
          <span className="font-display text-lg tracking-tight">UNMAPPED</span>
        </div>
        <nav aria-label="Primary" className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-[var(--earth-light)] text-[var(--earth-dark)] font-medium"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={active ? "text-[var(--earth-dark)]" : "text-[var(--ink-tertiary)]"}
                />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border-subtle space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-[var(--ink-tertiary)]">
            Context
          </div>
          <CountryChip />
          <ModeSwitcher className="w-full justify-stretch" />
        </div>
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-[var(--surface-raised)]">
          <span className="font-display text-base tracking-tight">UNMAPPED</span>
          <div className="flex items-center gap-2">
            <CountryChip />
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
          <ul className="grid grid-cols-4">
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