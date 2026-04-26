import * as React from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  FileText,
  Settings,
  LogOut,
  Compass,
  Layers,
  Database,
  Network,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "../theme-switcher";
import { useConsoleAuth, type AppRole } from "./auth-context";

/* Console shell — left sidebar + top utility bar.
 *
 * Surfaces use the `--console-*` token family so light / dark / onyx all
 * resolve correctly without any hard-coded hex colors. The shell is
 * intentionally separate from PolicyShell / YouthShell so future C1–C6
 * screens can iterate independently. */

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  /** If set, only users with one of these roles see the item. */
  roles?: AppRole[];
}

const NAV: NavItem[] = [
  { to: "/console", label: "Workspace", icon: LayoutDashboard },
  { to: "/console/contexts", label: "Contexts", icon: Layers },
  { to: "/console/connections", label: "Connections", icon: Database },
  { to: "/console/taxonomy", label: "Taxonomy", icon: Network },
  { to: "/console/deploy", label: "Deploy", icon: Rocket },
  { to: "/console/cohorts", label: "Cohorts", icon: Users },
  { to: "/console/programs", label: "Programs", icon: BookOpen },
  { to: "/console/signals", label: "Signals", icon: Activity },
  { to: "/console/methodology", label: "Methodology", icon: FileText },
  { to: "/console/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

function roleLabel(roles: AppRole[]): string {
  if (roles.includes("admin")) return "Admin";
  if (roles.includes("operator")) return "Operator";
  return "Viewer";
}

function userInitials(email: string | undefined | null): string {
  if (!email) return "··";
  const local = email.split("@")[0] ?? "";
  return local.slice(0, 2).toUpperCase();
}

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, roles, signOut, hasAnyRole } = useConsoleAuth();

  const visibleNav = NAV.filter((n) => !n.roles || hasAnyRole(n.roles));

  const current = visibleNav.find((n) =>
    n.to === "/console" ? pathname === "/console" : pathname.startsWith(n.to),
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--console-bg)", color: "var(--console-fg)" }}
    >
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-[240px] shrink-0 flex-col border-r"
        style={{
          background: "var(--console-sidebar-bg)",
          borderColor: "var(--console-border)",
        }}
      >
        <div
          className="px-5 h-14 flex items-center gap-2.5 border-b"
          style={{ borderColor: "var(--console-border)" }}
        >
          <Compass size={18} strokeWidth={1.5} style={{ color: "var(--console-accent)" }} />
          <span className="font-display text-base tracking-tight">UNMAPPED</span>
          <span
            className="ml-auto text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--console-panel-strong)",
              color: "var(--console-fg-muted)",
            }}
          >
            Console
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Console sections">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = current?.to === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors relative",
                  "outline-none focus-visible:ring-2",
                )}
                style={{
                  color: active ? "var(--console-fg)" : "var(--console-fg-muted)",
                  background: active ? "var(--console-panel)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--console-panel)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
                    style={{ background: "var(--console-accent)" }}
                  />
                )}
                <Icon size={16} strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {item.roles?.includes("admin") && (
                  <span
                    className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--console-panel-strong)",
                      color: "var(--console-fg-faint)",
                    }}
                  >
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t" style={{ borderColor: "var(--console-border)" }}>
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
              style={{
                background: "var(--console-accent)",
                color: "var(--console-accent-fg)",
              }}
            >
              {userInitials(user?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{user?.email ?? "—"}</div>
              <div className="text-[10px]" style={{ color: "var(--console-fg-faint)" }}>
                {roleLabel(roles)}
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/console/auth/sign-in", search: { redirect: "/console" } });
              }}
              aria-label="Sign out"
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--console-fg-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--console-panel)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
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
              Console
            </span>
            <span style={{ color: "var(--console-fg-faint)" }}>/</span>
            <span className="text-sm font-medium truncate">
              {current?.label ?? "Workspace"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher variant="popover" />
            <span
              className="hidden sm:inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
              style={{
                background: "var(--console-panel-strong)",
                color: "var(--console-fg-muted)",
              }}
            >
              {roleLabel(roles)}
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