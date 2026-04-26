import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Info,
  MapPin,
  Settings2,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OpportunityCard } from "@/components/unmapped/opportunities/opportunity-card";
import { useContextConfig } from "@/components/unmapped/context-config/context-config-store";
import {
  opportunities,
  FILTERS,
  type OpportunityCategory,
} from "@/components/unmapped/opportunities/opportunities-data";
import { evaluateFit } from "@/components/unmapped/opportunities/constraint-fit";
import { ConstraintBanner } from "@/components/unmapped/constraint-banner";
import { DEFAULT_ADVANCED_SIGNALS } from "@/components/unmapped/context-config/types";
import { useCountryData } from "@/data/use-country-data";
import { SourcedTile } from "@/components/unmapped/data/sourced-tile";
import { COUNTRY_INDEX } from "@/components/unmapped/context-config/types";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Your opportunities — OmniSkill" },
      {
        name: "description",
        content:
          "Honest, reachable opportunity matches for your skills profile, with real ILO and World Bank labour market signals.",
      },
      { property: "og:title", content: "Your opportunities — OmniSkill" },
      {
        property: "og:description",
        content:
          "Honest, reachable matches with real wage data and the gap you need to close.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

type Filter = OpportunityCategory | "all";

function OpportunitiesPage() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const { openDrawer, active } = useContextConfig();
  const signals = active.advanced_signals ?? DEFAULT_ADVANCED_SIGNALS;

  /* Resolve the active country to its ISO3 so we can look up the cached
   * real-data snapshot. We also expose a `wired` flag so the sidebar can
   * be honest when the user picks a country we haven't yet wired up. */
  const iso3 =
    COUNTRY_INDEX.find((c) => c.name === active.country)?.iso3 ?? "GHA";
  const { data: country, wired } = useCountryData(iso3);

  /* Evaluate fit + adjusted score for every opportunity once. */
  const enriched = React.useMemo(
    () =>
      opportunities.map((o) => {
        const fit = evaluateFit(o, signals);
        return {
          o,
          fit,
          adjustedScore: Math.max(0, Math.min(100, o.matchScore + fit.scoreDelta)),
        };
      }),
    [signals],
  );

  const demotedCount = enriched.filter((e) => e.fit.demotedReason !== null).length;
  const demotedReasons = React.useMemo(() => {
    const set = new Set<string>();
    for (const e of enriched) if (e.fit.demotedReason) set.add(e.fit.demotedReason);
    return Array.from(set);
  }, [enriched]);

  const filtered = React.useMemo(
    () =>
      (filter === "all"
        ? enriched
        : enriched.filter(({ o }) => o.category === filter)
      )
        .slice()
        .sort((a, b) => b.adjustedScore - a.adjustedScore),
    [filter, enriched],
  );

  const counts = React.useMemo(() => {
    const map = new Map<Filter, number>();
    map.set("all", opportunities.length);
    for (const o of opportunities) {
      map.set(o.category, (map.get(o.category) ?? 0) + 1);
    }
    return map;
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 py-6 md:py-10">
        {/* HEADER */}
        <header className="opacity-0 animate-rise-in" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              aria-label="Back to profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary hover:bg-surface-sunken transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-[16px] font-medium text-ink">Your opportunities</h1>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-earth-light/60 px-2.5 py-1 text-[12px] text-earth-dark">
              <MapPin size={12} />
              <span aria-hidden>{active.flag}</span>
              {active.country} · {active.region_label.split("·").pop()?.trim() ?? "Electronics & Repair"}
            </span>
            <button
              type="button"
              onClick={openDrawer}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] text-ink-secondary hover:bg-surface-sunken transition-colors"
            >
              <Settings2 size={12} />
              Switch context
            </button>
          </div>
        </header>

        {/* TWO-COLUMN: cards + signals (sidebar on desktop) */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          {/* LEFT COLUMN — filters, disclaimer, cards */}
          <div>
            {/* FILTER ROW */}
            <nav
              aria-label="Filter opportunities"
              className="opacity-0 animate-rise-in -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto"
              style={{ animationDelay: "60ms" }}
            >
              <ul className="flex gap-2 w-max md:w-auto md:flex-wrap">
                {FILTERS.map((f) => {
                  const active = filter === f.value;
                  const count = counts.get(f.value) ?? 0;
                  return (
                    <li key={f.value}>
                      <button
                        type="button"
                        onClick={() => setFilter(f.value)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors min-h-[36px]",
                          active
                            ? "border-earth bg-earth-light text-earth-dark font-medium"
                            : "border-border-subtle text-ink-tertiary hover:text-ink hover:bg-surface-sunken",
                        )}
                      >
                        <span>{f.label}</span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[11px] font-mono tabular-nums",
                            active
                              ? "bg-earth/20 text-earth-dark"
                              : "bg-surface-sunken text-ink-tertiary",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* HONEST DISCLAIMER */}
            <div
              className="opacity-0 animate-rise-in mt-4 flex items-start gap-2 rounded-lg border border-earth/30 bg-earth-light/50 px-3 py-2.5 text-[12px] text-earth-dark"
              style={{ animationDelay: "120ms" }}
              role="note"
            >
              <Info size={14} className="mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                These matches use cached <strong>ILO ILOSTAT</strong> and{" "}
                <strong>World Bank WDI</strong> series for {country.country},{" "}
                vintage {country.headline.sectorGrowth.vintage}. Wages are
                modelled estimates — actual offers vary by employer.
                {!wired && (
                  <>
                    {" "}
                    Country snapshot for <strong>{active.country}</strong> is
                    not yet wired — values shown are from {country.country} as
                    a fallback.
                  </>
                )}
              </p>
            </div>

            {/* CONSTRAINT BANNER — hidden when no advanced signals are set */}
            <div
              className="opacity-0 animate-rise-in mt-3"
              style={{ animationDelay: "150ms" }}
            >
              <ConstraintBanner />
            </div>

            {/* DEMOTED-COUNT NOTE — only when constraints pushed cards down */}
            {demotedCount > 0 && (
              <p
                className="opacity-0 animate-rise-in mt-3 text-[12px] text-ink-tertiary"
                style={{ animationDelay: "180ms" }}
              >
                {demotedCount} {demotedCount === 1 ? "opportunity ranks" : "opportunities rank"} lower because of your{" "}
                {humaniseReasons(demotedReasons)} setting.{" "}
                <button
                  type="button"
                  onClick={openDrawer}
                  className="font-medium text-earth-dark hover:underline underline-offset-2"
                >
                  Relax
                </button>
              </p>
            )}

            {/* CARD STACK or EMPTY STATE */}
            <div className="mt-5 space-y-4">
              {filtered.length === 0 ? (
                <EmptyState onReset={() => setFilter("all")} />
              ) : (
                filtered.map(({ o, fit }, i) => (
                  <OpportunityCard
                    key={o.id}
                    opportunity={o}
                    index={i}
                    fitChips={fit.chips}
                    scoreDelta={fit.scoreDelta}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — sticky on desktop, inline on mobile */}
          <aside
            className="opacity-0 animate-rise-in lg:sticky lg:top-6"
            style={{ animationDelay: "200ms" }}
            aria-label="Labour market signals"
          >
            <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-[var(--shadow-sm)]">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                Labor market signals
              </h2>
              <p className="mt-1 text-[12px] text-ink-secondary">
                {country.country} · {country.focalSector.localLabel}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <SourcedTile
                  signal={country.headline.sectorGrowth}
                  label={`Sector job growth, ${country.focalSector.localLabel}`}
                  formatValue={(v) =>
                    typeof v === "number" ? `↑ ${v.toFixed(1)}%` : String(v)
                  }
                />
                <SourcedTile
                  signal={country.headline.avgEntryWage}
                  label="Avg. entry wage / month"
                />
                <SourcedTile
                  signal={country.headline.youthNeet}
                  label="Youth not in education, employment or training"
                  formatValue={(v) =>
                    typeof v === "number" ? `${v.toFixed(1)}%` : String(v)
                  }
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface-raised/60 p-8 text-center">
      <span
        aria-hidden
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-earth-light text-earth-dark"
      >
        <SearchX size={24} strokeWidth={1.5} />
      </span>
      <h3 className="mt-4 text-[20px] tracking-tight text-ink">
        No matches in this slice
      </h3>
      <p className="mx-auto mt-2 max-w-[420px] text-[13px] text-ink-secondary leading-relaxed">
        We couldn't find matches for your exact profile in this region. Try
        switching to a nearby region or broader sector.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-4 py-2 text-[13px] font-medium text-ink hover:bg-surface-sunken transition-colors min-h-[44px]"
      >
        Adjust filters
      </button>
    </div>
  );
}

function humaniseReasons(reasons: string[]): string {
  if (reasons.length === 0) return "constraint";
  const map: Record<string, string> = {
    connectivity: "connectivity",
    mobility: "mobility",
    displacement: "displacement",
  };
  const labels = reasons.map((r) => map[r] ?? r);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}