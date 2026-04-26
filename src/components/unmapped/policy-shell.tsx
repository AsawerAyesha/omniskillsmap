import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Download, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeSwitcher } from "./mode-switcher";
import { useContextConfig } from "./context-config/context-config-store";
import { ThemeSwitcher } from "./theme-switcher";
import { useTheme } from "./theme-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { to: "/policy", label: "Overview" },
  { to: "/policy/skills", label: "Skills Map" },
  { to: "/policy/opportunities", label: "Opportunities" },
  { to: "/policy/risk", label: "Automation Risk" },
  { to: "/policy/projections", label: "Projections" },
] as const;

type NavLink = (typeof LINKS)[number];

/* ResponsiveNav — measures the available width and the natural width of each
 * link, then renders only the ones that fit on a single line. Anything that
 * would overflow is collapsed into a "More" dropdown so policy users never
 * lose access to a section just because the viewport (or right cluster)
 * grew. The measurement uses an off-screen "ghost" row so we always know
 * the natural widths regardless of which items are currently visible. */
function ResponsiveNav({
  links,
  pathname,
}: {
  links: readonly NavLink[];
  pathname: string;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ghostRef = React.useRef<HTMLDivElement | null>(null);
  const moreRef = React.useRef<HTMLButtonElement | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(links.length);

  const recompute = React.useCallback(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;

    const available = container.clientWidth;
    const itemEls = Array.from(ghost.children) as HTMLElement[];
    const widths = itemEls.map((el) => el.getBoundingClientRect().width);
    const gap = 24; // matches gap-6 (lg) — small overestimate is safe
    const moreWidth = (moreRef.current?.getBoundingClientRect().width ?? 64) + gap;

    // Try to fit all links first.
    const total = widths.reduce((s, w) => s + w, 0) + gap * (widths.length - 1);
    if (total <= available) {
      setVisibleCount(links.length);
      return;
    }

    // Otherwise reserve space for the More trigger and count how many fit.
    let used = 0;
    let count = 0;
    for (let i = 0; i < widths.length; i++) {
      const next = used + widths[i] + (i > 0 ? gap : 0);
      if (next + moreWidth > available) break;
      used = next;
      count++;
    }
    setVisibleCount(Math.max(0, count));
  }, [links.length]);

  React.useLayoutEffect(() => {
    recompute();
  }, [recompute, pathname]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(container);
    if (containerRef.current?.parentElement) ro.observe(containerRef.current.parentElement);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  const visible = links.slice(0, visibleCount);
  const overflow = links.slice(visibleCount);
  const overflowHasActive = overflow.some((l) => l.to === pathname);

  return (
    <div
      ref={containerRef}
      aria-label="Primary"
      role="navigation"
      className="hidden md:flex flex-1 min-w-0 items-center gap-5 lg:gap-6 relative"
    >
      {/* Ghost row — invisible, used only to measure natural link widths.
       * Positioned absolutely so it never affects layout. */}
      <div
        ref={ghostRef}
        aria-hidden
        className="absolute -top-[9999px] left-0 flex items-center gap-5 lg:gap-6 pointer-events-none"
      >
        {links.map((l) => (
          <span
            key={`ghost-${l.to}`}
            className="text-sm pb-1 border-b border-transparent whitespace-nowrap"
          >
            {l.label}
          </span>
        ))}
      </div>

      {visible.map((l) => {
        const isActive = pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "text-sm pb-1 border-b transition-colors whitespace-nowrap shrink-0",
              isActive ? "border-[#C4A882]" : "border-transparent hover:opacity-100",
            )}
            style={{ color: isActive ? "#F0EDE8" : "#9C9890" }}
          >
            {l.label}
          </Link>
        );
      })}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              ref={moreRef}
              type="button"
              aria-label={`More sections (${overflow.length})`}
              className={cn(
                "inline-flex items-center gap-1 text-sm pb-1 border-b transition-colors whitespace-nowrap shrink-0 outline-none",
                overflowHasActive ? "border-[#C4A882]" : "border-transparent",
              )}
              style={{ color: overflowHasActive ? "#F0EDE8" : "#9C9890" }}
            >
              <span>More</span>
              <MoreHorizontal size={14} strokeWidth={1.75} />
              <span
                className="ml-1 inline-flex items-center justify-center text-[10px] font-medium rounded-full px-1.5 min-w-[18px] h-[18px]"
                style={{
                  background: overflowHasActive
                    ? "rgba(196,168,130,0.25)"
                    : "rgba(255,255,255,0.08)",
                  color: overflowHasActive ? "#C4A882" : "#9C9890",
                }}
              >
                {overflow.length}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="min-w-[200px] border-border-subtle"
            style={{ background: "#23201B", color: "#F0EDE8" }}
          >
            {overflow.map((l) => {
              const isActive = pathname === l.to;
              return (
                <DropdownMenuItem key={l.to} asChild>
                  <Link
                    to={l.to}
                    className={cn(
                      "w-full cursor-pointer text-sm",
                      isActive && "font-medium",
                    )}
                    style={{
                      color: isActive ? "#C4A882" : "#F0EDE8",
                    }}
                  >
                    {l.label}
                    {isActive && (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full"
                        style={{ background: "#C4A882" }}
                        aria-hidden
                      />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

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

          {/* Primary nav — overflow-aware. Items that would push the right
           * cluster off the row collapse into a "More" dropdown so nothing
           * is hidden behind a horizontal scroll. */}
          <ResponsiveNav links={LINKS} pathname={pathname} />

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