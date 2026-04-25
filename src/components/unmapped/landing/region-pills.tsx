import * as React from "react";
import { Plus, X } from "lucide-react";

interface Region {
  id: string;
  flag: string;
  name: string;
}

const INITIAL: Region[] = [
  { id: "ssa", flag: "🌍", name: "Sub-Saharan Africa" },
  { id: "sa", flag: "🌏", name: "South Asia" },
];

const PRESETS: Region[] = [
  { id: "lac", flag: "🌎", name: "Latin America & Caribbean" },
  { id: "mena", flag: "🌍", name: "Middle East & North Africa" },
  { id: "sea", flag: "🌏", name: "Southeast Asia" },
  { id: "eap", flag: "🌏", name: "East Asia & Pacific" },
];

export function RegionPills() {
  const [active, setActive] = React.useState<Region[]>(INITIAL);
  const [open, setOpen] = React.useState(false);

  const remove = (id: string) =>
    setActive((prev) => prev.filter((r) => r.id !== id));
  const add = (r: Region) => {
    setActive((prev) =>
      prev.some((p) => p.id === r.id) ? prev : [...prev, r],
    );
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[13px] text-ink-tertiary">
        Currently configured for:
      </span>

      {active.map((r) => (
        <span
          key={r.id}
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-earth-light pl-3 pr-1.5 py-1.5 text-[13px] font-medium text-earth-dark"
        >
          <span aria-hidden>{r.flag}</span>
          <span>{r.name}</span>
          <button
            type="button"
            aria-label={`Remove ${r.name}`}
            onClick={() => remove(r.id)}
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-earth-dark/70 hover:bg-[color-mix(in_oklab,var(--earth)_30%,transparent)] hover:text-earth-dark transition-colors"
          >
            <X size={12} strokeWidth={1.75} />
          </button>
        </span>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-[13px] text-ink-secondary hover:bg-surface-sunken transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add context
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-20 mt-2 w-[260px] rounded-xl border border-border-subtle bg-surface-raised p-1.5 shadow-[var(--shadow-md)]"
          >
            {PRESETS.filter((p) => !active.some((a) => a.id === p.id)).map(
              (r) => (
                <button
                  key={r.id}
                  type="button"
                  role="option"
                  onClick={() => add(r)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-ink hover:bg-surface-sunken transition-colors"
                >
                  <span aria-hidden>{r.flag}</span>
                  <span>{r.name}</span>
                </button>
              ),
            )}
            {PRESETS.every((p) => active.some((a) => a.id === p.id)) && (
              <p className="px-2.5 py-2 text-[12px] text-ink-tertiary">
                All preset regions added.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}