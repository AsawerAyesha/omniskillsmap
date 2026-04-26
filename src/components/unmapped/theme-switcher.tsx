import * as React from "react";
import { Sun, Moon, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeName } from "./theme-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* Three-state segmented control. The "thumb" slides under the active option
 * for a tactile, premium feel — matched to the precision easing curve used
 * elsewhere in the design system. Variants:
 *  - "full"    : labeled pill, fits in sidebar footers / drawers
 *  - "compact" : icon-only, fits in dense headers (policy topbar)
 *  - "stacked" : vertical icon column, used in the collapsed sidebar rail
 */
type Variant = "full" | "compact" | "stacked" | "popover";

interface Option {
  value: ThemeName;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  hint: string;
}

const OPTIONS: Option[] = [
  { value: "light", label: "Light", Icon: Sun,    hint: "Parchment · daytime"  },
  { value: "dark",  label: "Dark",  Icon: Moon,   hint: "Warm ink · low light" },
  { value: "onyx",  label: "Onyx",  Icon: Circle, hint: "True black · OLED"    },
];

export function ThemeSwitcher({
  variant = "full",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();

  if (variant === "popover") {
    const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Theme: ${current.label}. Click to change.`}
            title={`Theme · ${current.label}`}
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors",
              "border",
              className,
            )}
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.12)",
              color: "#F0EDE8",
            }}
          >
            <ThumbIcon option={current} active />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-56 p-2 border-border-subtle"
          style={{ background: "var(--surface-raised)", color: "var(--ink)" }}
        >
          <div className="px-2 pt-1 pb-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--ink-tertiary)]">
              Appearance
            </p>
          </div>
          <div role="radiogroup" aria-label="Theme" className="flex flex-col gap-0.5">
            {OPTIONS.map((o) => {
              const active = theme === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(o.value)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                    active
                      ? "bg-[var(--surface-sunken)]"
                      : "hover:bg-[var(--surface-sunken)]/60",
                  )}
                >
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-[var(--surface-sunken)]">
                    <ThumbIcon option={o} active={active} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm leading-none text-[var(--ink)]">
                      {o.label}
                    </span>
                    <span className="block text-[11px] mt-1 text-[var(--ink-tertiary)] truncate">
                      {o.hint}
                    </span>
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-[var(--earth)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === "stacked") {
    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className={cn(
          "flex flex-col items-center gap-1 rounded-xl p-1",
          "bg-[var(--surface-sunken)] border border-border-subtle",
          className,
        )}
      >
        {OPTIONS.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(o.value)}
              title={`${o.label} · ${o.hint}`}
              className={cn(
                "relative h-7 w-7 rounded-md inline-flex items-center justify-center transition-all duration-200 ease-precision",
                active
                  ? "bg-[var(--surface-raised)] text-[var(--ink)] shadow-sm"
                  : "text-[var(--ink-tertiary)] hover:text-[var(--ink)]",
              )}
            >
              <ThumbIcon option={o} active={active} />
            </button>
          );
        })}
      </div>
    );
  }

  const compact = variant === "compact";
  const activeIdx = OPTIONS.findIndex((o) => o.value === theme);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "relative inline-flex items-center rounded-full p-1 border border-border-subtle bg-[var(--surface-sunken)]",
        compact ? "gap-0" : "gap-0 w-full",
        className,
      )}
    >
      {/* Sliding thumb — absolutely positioned, animated with transform. */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 rounded-full bg-[var(--surface-raised)] shadow-sm transition-[left,width] duration-300 ease-precision"
        style={{
          left: `calc(${activeIdx} * (100% / 3) + 4px)`,
          width: "calc(100% / 3 - 8px)",
        }}
      />
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(o.value)}
            title={`${o.label} · ${o.hint}`}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full transition-colors duration-200 ease-precision",
              compact ? "h-7 w-9 px-0" : "h-8 flex-1 px-2 text-xs font-medium",
              active
                ? "text-[var(--ink)]"
                : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]",
            )}
          >
            <ThumbIcon option={o} active={active} />
            {!compact && <span className="leading-none">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* The Onyx icon needs special treatment so it visually reads as "void":
 * a filled black disc with a hairline ring. Sun and Moon use their lucide
 * defaults. */
function ThumbIcon({ option, active }: { option: Option; active: boolean }) {
  const { Icon, value } = option;
  if (value === "onyx") {
    return (
      <span
        aria-hidden
        className={cn(
          "block h-3.5 w-3.5 rounded-full border transition-colors",
          active
            ? "bg-black border-[var(--earth)]"
            : "bg-black/80 border-[var(--ink-tertiary)]",
        )}
      />
    );
  }
  return <Icon size={14} strokeWidth={1.75} />;
}
