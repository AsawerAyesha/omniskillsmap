import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, AlertTriangle, BarChart3, BellRing } from "lucide-react";
import { toast } from "sonner";
import {
  UCard,
  UBadge,
  UChip,
  UProgress,
  UOccupation,
  UStat,
} from "@/components/unmapped/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — UNMAPPED" },
      { name: "description", content: "Skills infrastructure for youth in low-income countries." },
      { property: "og:title", content: "UNMAPPED" },
      { property: "og:description", content: "Skills infrastructure for youth in low-income countries." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="u-container py-10 md:py-16">
        <div className="max-w-3xl u-stagger">
          <UBadge variant="blue">
            <BarChart3 size={12} strokeWidth={1.5} /> World Bank · ILO data
          </UBadge>
          <h1 className="mt-6 font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Skills infrastructure for the next generation, mapped with{" "}
            <span className="italic text-[var(--earth-dark)]">precision</span>.
          </h1>
          <p className="mt-6 text-lg text-[var(--ink-secondary)] max-w-2xl">
            UNMAPPED translates global labour data into clear, durable pathways for
            youth in low-income countries — pairing institutional rigor with human
            empathy.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => toast.success("Profile saved", { description: "Last sync just now" })}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--earth-dark)] text-[var(--earth-light)] px-4 py-2 text-sm font-medium"
            >
              <BellRing size={14} strokeWidth={1.5} /> Success toast
            </button>
            <button
              onClick={() => toast.error("Sync failed", { description: "Check your connection" })}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm"
            >
              Error
            </button>
            <button
              onClick={() => toast.info("New cohort opens 5 May")}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm"
            >
              Info
            </button>
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 u-stagger">
          <div>
            <UStat size="lg">2,471</UStat>
            <div className="mt-2 text-sm text-ink-tertiary uppercase tracking-wider">
              Occupations mapped
            </div>
          </div>
          <div>
            <UStat size="lg">61<span className="text-[var(--ink-tertiary)]">%</span></UStat>
            <div className="mt-2 text-sm text-ink-tertiary uppercase tracking-wider">
              Durable to 2035
            </div>
          </div>
          <div>
            <UStat size="lg">14</UStat>
            <div className="mt-2 text-sm text-ink-tertiary uppercase tracking-wider">
              Partner countries
            </div>
          </div>
          <div>
            <UStat size="lg">128k</UStat>
            <div className="mt-2 text-sm text-ink-tertiary uppercase tracking-wider">
              Learners onboarded
            </div>
          </div>
        </div>
      </section>

      {/* Component showcase */}
      <section className="u-container pb-24">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-3xl tracking-tight">Design system</h2>
          <span className="font-mono text-xs text-ink-tertiary">v0.1.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 u-stagger">
          {/* Badges */}
          <UCard>
            <h3 className="font-display text-xl mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <UBadge>Neutral</UBadge>
              <UBadge variant="green">
                <TrendingUp size={12} strokeWidth={1.5} /> Durable
              </UBadge>
              <UBadge variant="amber">Transition</UBadge>
              <UBadge variant="red">
                <AlertTriangle size={12} strokeWidth={1.5} /> High risk
              </UBadge>
              <UBadge variant="blue">Informational</UBadge>
            </div>
          </UCard>

          {/* Data chips */}
          <UCard>
            <h3 className="font-display text-xl mb-4">Data chips</h3>
            <div className="flex flex-wrap gap-2">
              <UChip value="84.2%" label="Adoption" />
              <UChip value="1,204" label="Learners" />
              <UChip value="ISCO-7212" label="Code" />
            </div>
          </UCard>

          {/* Progress */}
          <UCard>
            <h3 className="font-display text-xl mb-2">Skill mastery</h3>
            <p className="text-sm text-ink-tertiary mb-4">Welding fabrication · cohort 04</p>
            <UProgress value={72} />
            <div className="mt-3 flex justify-between font-mono text-xs text-ink-secondary">
              <span>72%</span>
              <span>target 85%</span>
            </div>
          </UCard>

          {/* Occupation tags */}
          <UCard className="md:col-span-2">
            <h3 className="font-display text-xl mb-4">Occupation tags</h3>
            <div className="flex flex-wrap gap-2">
              <UOccupation code="7212" name="Welders & flame cutters" />
              <UOccupation code="2512" name="Software developers" />
              <UOccupation code="3212" name="Medical lab technicians" />
              <UOccupation code="6111" name="Field crop growers" />
              <UOccupation code="5223" name="Shop sales assistants" />
            </div>
          </UCard>

          {/* Typography sample */}
          <UCard>
            <h3 className="font-display text-xl mb-4">Typography</h3>
            <p className="font-display text-2xl">Fraunces — display</p>
            <p className="text-base text-ink-secondary mt-1">DM Sans — body copy</p>
            <p className="font-mono text-sm text-ink-tertiary mt-1">JetBrains — 0123.456</p>
          </UCard>
        </div>

        {/* Palette */}
        <div className="mt-10">
          <h3 className="font-display text-xl mb-4">Palette</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              ["earth", "var(--earth)"],
              ["earth-light", "var(--earth-light)"],
              ["earth-dark", "var(--earth-dark)"],
              ["ink", "var(--ink)"],
              ["surface-sunken", "var(--surface-sunken)"],
              ["signal-green", "var(--signal-green)"],
              ["signal-amber", "var(--signal-amber)"],
              ["signal-red", "var(--signal-red)"],
            ].map(([name, val]) => (
              <div key={name} className="u-card !p-3">
                <div
                  className="h-12 w-full rounded-md border border-border-subtle"
                  style={{ backgroundColor: val }}
                />
                <div className="mt-2 font-mono text-[11px] text-ink-secondary">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
