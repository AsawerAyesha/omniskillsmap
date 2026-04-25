import * as React from "react";
import { Sun, Moon, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeName } from "./theme-context";

/* Three-state segmented control. The "thumb" slides under the active option
 * for a tactile, premium feel — matched to the precision easing curve used
 * elsewhere in the design system. Variants:
 *  - "full"    : labeled pill, fits in sidebar footers / drawers
 *  - "compact" : icon-only, fits in dense headers (policy topbar)
 *  - "stacked" : vertical icon column, used in the collapsed sidebar rail
 */
type Variant = "full" | "compact" | "stacked";

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
