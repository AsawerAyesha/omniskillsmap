import { useUnmappedMode, type UnmappedMode } from "./mode-context";
import { cn } from "@/lib/utils";

export function ModeSwitcher({ className }: { className?: string }) {
  const { mode, setMode } = useUnmappedMode();
  const opts: { value: UnmappedMode; label: string }[] = [
    { value: "youth", label: "Youth" },
    { value: "policy", label: "Policy" },
  ];

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
            onClick={() => setMode(o.value)}
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