import { useNavigate, useLocation } from "@tanstack/react-router";
import { useUnmappedMode, type UnmappedMode } from "./mode-context";
import { cn } from "@/lib/utils";

/* Canonical home route for each mode. Switching modes navigates here so the
 * shell (youth vs policy) always wraps a route built for that shell —
 * fixes the "policy topbar wrapping the youth landing page" mixing bug. */
const MODE_HOME: Record<UnmappedMode, "/" | "/policy"> = {
  youth: "/",
  policy: "/policy",
};

/* Routes that legitimately belong to each mode. We only navigate when the
 * current pathname is NOT already in the target mode's tree, so toggling
 * modes from a sub-page doesn't yank the user away unnecessarily. */
function pathBelongsToMode(pathname: string, mode: UnmappedMode): boolean {
  if (mode === "policy") return pathname === "/policy" || pathname.startsWith("/policy/");
  // youth owns everything else
  return !(pathname === "/policy" || pathname.startsWith("/policy/"));
}

export function ModeSwitcher({ className }: { className?: string }) {
  const { mode, setMode } = useUnmappedMode();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const opts: { value: UnmappedMode; label: string }[] = [
    { value: "youth", label: "Youth" },
    { value: "policy", label: "Policy" },
  ];

  const onSelect = (next: UnmappedMode) => {
    if (next === mode) return;
    setMode(next);
    if (!pathBelongsToMode(pathname, next)) {
      navigate({ to: MODE_HOME[next] });
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Switch view"
      className={cn(
        "inline-flex items-center rounded-full p-1 border border-border-subtle",
        "bg-[var(--surface-sunken)]",
        className,
      )}
    >
      {opts.map((o) => {
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(o.value)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-colors flex-1",
              active
                ? "bg-[var(--surface-raised)] text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}