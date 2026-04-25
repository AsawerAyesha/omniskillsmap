import * as React from "react";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContextConfig } from "./context-config-store";

interface Props {
  className?: string;
  /* When true, render with a darker pill suited for the policy topbar. */
  variant?: "light" | "dark";
}

export function SwitchContextButton({ className, variant = "light" }: Props) {
  const { openDrawer, active } = useContextConfig();
  return (
    <button
      type="button"
      onClick={openDrawer}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors min-h-[36px]",
        variant === "light"
          ? "border border-border-subtle bg-surface-raised text-ink-secondary hover:bg-surface-sunken hover:text-ink"
          : "text-[#F0EDE8]/80 hover:text-[#F0EDE8]",
        className,
      )}
      style={
        variant === "dark"
          ? {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }
          : undefined
      }
      aria-label="Switch context"
    >
      <Settings2 size={13} strokeWidth={1.6} />
      <span aria-hidden className="text-[13px] leading-none">
        {active.flag}
      </span>
      <span>Switch context</span>
    </button>
  );
}