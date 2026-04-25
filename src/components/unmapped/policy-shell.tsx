import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeSwitcher } from "./mode-switcher";
import { useContextConfig } from "./context-config/context-config-store";
import { ThemeSwitcher } from "./theme-switcher";
import { useTheme } from "./theme-context";

const LINKS = [
  { to: "/policy", label: "Overview" },
  { to: "/policy/skills", label: "Skills Map" },
  { to: "/policy/opportunities", label: "Opportunities" },
  { to: "/policy/risk", label: "Automation Risk" },
  { to: "/policy/projections", label: "Projections" },
] as const;

export function PolicyShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { active, openDrawer } = useContextConfig();
  const { theme, setTheme } = useTheme();

  /* Policy is an analytical context that wants a dark-family palette by
   * default — but we now respect the user's explicit choice. If the user
   * has selected "light" (only meaningful in the youth shell), we promote
   * them to "dark" while the policy shell is mounted, then restore their
   * preference on unmount so toggling back to youth never leaves them
   * stranded in a dark theme they didn't ask for. Onyx is honored as-is. */
  React.useEffect(() => {
    const previous = theme;
    if (theme === "light") setTheme("dark");
    return () => {
      if (previous === "light") setTheme("light");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--ink)]">
      <header className="w-full" style={{ background: "#1C1A16", color: "#F0EDE8" }}>
        <div className="u-container flex items-center gap-4 lg:gap-6 py-3">
          {/* Brand cluster — fixed-width, never shrinks */}
          <div className="flex items-center gap-3 shrink-0">
            <Compass size={18} strokeWidth={1.5} style={{ color: "#C4A882" }} />
            <span className="font-display text-base tracking-tight">UNMAPPED</span>
            <span
              className="hidden lg:inline-block text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: "rgba(196,168,130,0.15)",
                color: "#C4A882",
                border: "1px solid rgba(196,168,130,0.25)",
              }}
            >
              Policy View
            </span>
          </div>

          {/* Primary nav — single line, scrollable as a last-resort. min-w-0
           * lets it shrink inside the flex row so the right cluster is never
           * pushed onto a second line. */}
          <nav
            aria-label="Primary"
            className="hidden md:flex flex-1 min-w-0 items-center gap-5 lg:gap-6 overflow-x-auto no-scrollbar"
          >
            {LINKS.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "text-sm pb-1 border-b transition-colors whitespace-nowrap shrink-0",
                    active ? "border-[#C4A882]" : "border-transparent hover:opacity-100",
                  )}
                  style={{ color: active ? "#F0EDE8" : "#9C9890" }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster — never wraps, never shrinks. We removed the
           * duplicate SwitchContextButton so the country pill is the single
           * affordance for context switching. */}
          <div className="ml-auto flex items-center gap-2 lg:gap-3 shrink-0">
            <ThemeSwitcher variant="compact" />

            <button
              type="button"
              onClick={openDrawer}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#F0EDE8",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              aria-label={`Active context: ${active.country}. Click to switch.`}
            >
              <span aria-hidden>{active.flag}</span>
              <span className="hidden sm:inline">{active.country}</span>
              <span className="opacity-60 hidden lg:inline">·</span>
              <span className="opacity-70 hidden lg:inline">Switch</span>
            </button>

            <button
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap"
              style={{ background: "#C4A882", color: "#1A1814" }}
            >
              <Download size={14} strokeWidth={1.5} />
              <span className="hidden lg:inline">Export</span>
            </button>

            <div
              aria-label="Account"
              className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ background: "rgba(196,168,130,0.2)", color: "#C4A882" }}
            >
              MA
            </div>

            <ModeSwitcher />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}