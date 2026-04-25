import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeSwitcher } from "./mode-switcher";
import { SwitchContextButton } from "./context-config/switch-context-button";
import { useContextConfig } from "./context-config/context-config-store";

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--ink)]">
      <header className="w-full" style={{ background: "#1C1A16", color: "#F0EDE8" }}>
        <div className="u-container flex items-center gap-6 py-3">
          <div className="flex items-center gap-3 shrink-0">
            <Compass size={18} strokeWidth={1.5} style={{ color: "#C4A882" }} />
            <span className="font-display text-base tracking-tight">UNMAPPED</span>
            <span
              className="hidden sm:inline-block text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(196,168,130,0.15)",
                color: "#C4A882",
                border: "1px solid rgba(196,168,130,0.25)",
              }}
            >
              Policy View
            </span>
          </div>

          <nav
            aria-label="Primary"
            className="hidden md:flex flex-1 justify-center items-center gap-6"
          >
            {LINKS.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "text-sm pb-1 border-b transition-colors",
                    active ? "border-[#C4A882]" : "border-transparent hover:opacity-100",
                  )}
                  style={{ color: active ? "#F0EDE8" : "#9C9890" }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openDrawer}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#F0EDE8",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span aria-hidden>{active.flag}</span>
              <span>{active.country}</span>
              <span className="opacity-60">·</span>
              <span className="opacity-70">Switch</span>
            </button>

            <SwitchContextButton variant="dark" className="hidden md:inline-flex" />

            <button
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
              style={{ background: "#C4A882", color: "#1A1814" }}
            >
              <Download size={14} strokeWidth={1.5} /> Export
            </button>

            <div
              aria-label="Account"
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium"
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