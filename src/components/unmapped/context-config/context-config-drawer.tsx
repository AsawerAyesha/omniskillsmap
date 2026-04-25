import * as React from "react";
import { X, Compass } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUnmappedMode } from "../mode-context";
import { useContextConfig } from "./context-config-store";
import { ActiveConfigCard } from "./active-config-card";
import { AddContextFlow } from "./add-context-flow";
import { AdvancedConfig } from "./advanced-config";
import { JsonPreview } from "./json-preview";

export function ContextConfigDrawer() {
  const {
    open,
    closeDrawer,
    configs,
    active,
    setActiveById,
    removeConfig,
    updateConfig,
    applyContext,
  } = useContextConfig();

  const { setCountry } = useUnmappedMode();

  // Sync the legacy mode-context country whenever the active context changes,
  // so the dashboard / shells that still read `country` stay in step.
  React.useEffect(() => {
    if (active?.country) setCountry(active.country);
  }, [active?.country, setCountry]);

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? null : closeDrawer())}>
      <SheetContent
        side="right"
        className="!w-full sm:!max-w-[420px] p-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Earth top accent */}
        <div aria-hidden className="h-[3px] w-full bg-earth shrink-0" />

        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 border-b border-border-subtle">
          <div>
            <h2 className="font-display text-[22px] tracking-tight text-ink leading-tight">
              Configure context
            </h2>
            <p className="mt-1 text-[13px] text-ink-secondary leading-snug">
              Changes apply instantly — no rebuild required.
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close panel"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-sunken transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Active configs */}
          <section className="px-5 py-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[11px] uppercase tracking-[0.08em] font-medium text-ink-tertiary">
                Active configurations
              </h3>
              <span className="text-[11px] font-mono text-ink-tertiary">
                {configs.length} / 3
              </span>
            </div>

            <ul className="space-y-2">
              {configs.map((c) => (
                <li key={c.context_id}>
                  <ActiveConfigCard
                    config={c}
                    active={c.context_id === active.context_id}
                    canRemove={configs.length > 1}
                    onSelect={() =>
                      applyContext(c).catch(() => setActiveById(c.context_id))
                    }
                    onRemove={() => removeConfig(c.context_id)}
                    onEdit={() => setActiveById(c.context_id)}
                  />
                </li>
              ))}
            </ul>
          </section>

          {/* Add flow */}
          {configs.length < 3 ? (
            <AddContextFlow onApply={applyContext} />
          ) : (
            <div className="px-5 py-4 border-t border-border-subtle">
              <p className="text-[12px] text-ink-tertiary">
                Maximum of 3 active contexts. Remove one to add another.
              </p>
            </div>
          )}

          {/* Advanced — edits the active config */}
          <AdvancedConfig
            config={active}
            onChange={(patch) => updateConfig(active.context_id, patch)}
          />

          {/* JSON preview */}
          <JsonPreview config={active} />
        </div>
      </SheetContent>

      {/* Reconfiguration overlay lives outside the Sheet content so it stays visible after close */}
      <ReconfigurationOverlay />
    </Sheet>
  );
}

/* Renders only when isReconfiguring=true. Animates the centered loader. */
function ReconfigurationOverlay() {
  const { isReconfiguring, reconfiguringFor } = useContextConfig();

  if (!isReconfiguring && !reconfiguringFor) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-200 ${
        isReconfiguring ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "color-mix(in oklab, var(--surface) 92%, transparent)",
      }}
    >
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-earth-light">
          <Compass
            size={24}
            strokeWidth={1.5}
            className="text-earth-dark animate-spin"
            style={{ animationDuration: "1800ms" }}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-earth/40 animate-ping"
          />
        </span>
        <p className="font-display text-[20px] italic tracking-tight text-ink">
          Reconfiguring for {reconfiguringFor}…
        </p>
      </div>
    </div>
  );
}