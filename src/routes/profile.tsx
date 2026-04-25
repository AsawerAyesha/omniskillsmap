import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Share2, Download, Info, MapPin } from "lucide-react";
import {
  sampleProfile,
  type OccupationMatch,
  type SkillCluster,
  type LanguageEntry,
  type Signal,
} from "../components/unmapped/profile/profile-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Amara Mensah — Skills Profile · UNMAPPED" },
      {
        name: "description",
        content:
          "A portable skills credential built on ISCO-08 and ESCO standards, with real labour market signals from ILO and World Bank.",
      },
      { property: "og:title", content: "Amara Mensah — Skills Profile · UNMAPPED" },
      {
        property: "og:description",
        content:
          "A portable skills credential built on ISCO-08 and ESCO standards, with real labour market signals.",
      },
    ],
  }),
  component: ProfilePage,
});

/* Stagger helper — N=index, returns ms delay string */
const delayFor = (i: number) => ({ animationDelay: `${i * 80}ms` });

function ProfilePage() {
  const p = sampleProfile;
  /* Skeleton shimmer for occupation matches — 400ms */
  const [matchesReady, setMatchesReady] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMatchesReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto w-full max-w-[840px] px-4 md:px-6 py-8 md:py-12 space-y-8">
        {/* HEADER */}
        <header
          className="flex items-start justify-between gap-4 animate-rise-in opacity-0 print-keep"
          style={delayFor(0)}
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-earth-light font-display text-[24px] text-earth-dark [font-variation-settings:'opsz'_144,'wght'_400]"
            >
              {p.initials}
            </span>
            <div className="min-w-0">
              <h1
                className="font-display text-[26px] leading-tight text-ink [font-variation-settings:'opsz'_144,'wght'_400]"
              >
                {p.name}
              </h1>
              <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-ink-tertiary">
                <MapPin size={12} strokeWidth={1.75} className="shrink-0" />
                {p.location}
              </p>
              <p className="mt-1 font-mono text-[11px] text-ink-tertiary tracking-wide">
                {p.profileId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print shrink-0">
            <button
              type="button"
              aria-label="Share profile"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-transparent px-3 h-10 text-[13px] font-medium text-ink-secondary hover:bg-surface-sunken transition-colors"
            >
              <Share2 size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Download as PDF"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-transparent px-3 h-10 text-[13px] font-medium text-ink-secondary hover:bg-surface-sunken transition-colors"
            >
              <Download size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </header>

        {/* OCCUPATION MATCHES */}
        <section
          aria-labelledby="occupations-heading"
          className="animate-rise-in opacity-0"
          style={delayFor(1)}
        >
          <h2
            id="occupations-heading"
            className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-tertiary mb-3"
          >
            Your closest occupation matches
          </h2>
          <div className="space-y-3">
            {!matchesReady
              ? [0, 1, 2].map((i) => <OccupationSkeleton key={i} prominent={i === 0} />)
              : p.occupations.map((o, i) => (
                  <OccupationCard
                    key={o.iscoCode}
                    match={o}
                    prominent={i === 0}
                  />
                ))}
          </div>
        </section>

        {/* SKILL CLUSTERS */}
        <section
          aria-labelledby="clusters-heading"
          className="animate-rise-in opacity-0"
          style={delayFor(2)}
        >
          <h2
            id="clusters-heading"
            className="text-[15px] font-medium text-ink mb-3"
          >
            Your skill clusters
          </h2>

          {/* Mobile: horizontal scroll. Desktop: 2-col grid. */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-2">
              {p.clusters.map((c) => (
                <ClusterCard key={c.name} cluster={c} className="w-[260px]" />
              ))}
            </div>
          </div>
          <div className="hidden md:grid md:grid-cols-2 gap-3">
            {p.clusters.map((c) => (
              <ClusterCard key={c.name} cluster={c} />
            ))}
          </div>
        </section>

        {/* LANGUAGES STRIP */}
        <section
          aria-labelledby="languages-heading"
          className="animate-rise-in opacity-0"
          style={delayFor(3)}
        >
          <h2
            id="languages-heading"
            className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-tertiary mb-3"
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {p.languages.map((l) => (
              <LanguageBadge key={l.name} language={l} />
            ))}
          </div>
        </section>

        {/* DATA SIGNALS */}
        <section
          aria-labelledby="signals-heading"
          className="rounded-2xl border border-border-subtle bg-surface-raised p-5 md:p-6 shadow-[var(--shadow-sm)] animate-rise-in opacity-0 print-keep"
          style={delayFor(4)}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2
              id="signals-heading"
              className="text-[15px] font-medium text-ink inline-flex items-center gap-1.5"
            >
              Real labour market signals for your profile
              <span
                title="Signals are computed from public ILO + World Bank datasets, filtered for your country and occupation cluster."
                className="inline-flex items-center text-ink-tertiary"
              >
                <Info size={14} strokeWidth={1.5} />
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {p.signals.map((s) => (
              <SignalCard key={s.label} signal={s} />
            ))}
          </div>
        </section>

        {/* PORTABILITY FOOTER */}
        <section
          className="rounded-2xl bg-earth-light border border-border-subtle p-5 md:p-6 animate-rise-in opacity-0 print-keep"
          style={delayFor(5)}
        >
          <p className="text-[14px] leading-relaxed text-earth-dark max-w-[60ch]">
            This profile is portable. It uses international{" "}
            <span className="font-mono text-[13px]">ISCO-08</span> and{" "}
            <span className="font-mono text-[13px]">ESCO</span> standards —
            recognised across 190+ countries.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-earth-dark/80">
            <span className="text-[12px] uppercase tracking-[0.08em] text-earth-dark/70">
              Recognised in
            </span>
            {p.recognizedIn.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1">
                <span aria-hidden>{c.flag}</span>
                {c.name}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 h-11 rounded-full bg-earth-dark px-5 text-[14px] font-medium text-earth-light hover:opacity-90 transition-opacity"
            >
              <Download size={14} strokeWidth={1.75} />
              Download as PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-11 rounded-full border border-earth-dark/30 bg-transparent px-5 text-[14px] font-medium text-earth-dark hover:bg-earth-dark/5 transition-colors"
            >
              <Share2 size={14} strokeWidth={1.75} />
              Share link
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function OccupationCard({
  match,
  prominent,
}: {
  match: OccupationMatch;
  prominent: boolean;
}) {
  return (
    <article
      className={
        "rounded-2xl bg-surface-raised p-4 md:p-5 print-card transition-shadow " +
        (prominent
          ? "border-2 border-border-strong shadow-[var(--shadow-md)]"
          : "border border-border-subtle shadow-[var(--shadow-sm)]")
      }
    >
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="font-mono text-[11px] text-earth-dark tracking-wide">
          {match.iscoCode}
        </span>
        <span className="font-mono text-[12px] text-ink tabular-nums">
          {match.confidence}%
        </span>
      </div>
      <h3 className="text-[15px] font-medium leading-snug text-ink">
        {match.title}
      </h3>
      <div className="mt-3 relative h-[3px] w-full bg-surface-sunken rounded-full overflow-hidden">
        <div
          className="h-full bg-earth rounded-full transition-[width] duration-700 ease-precision"
          style={{ width: `${match.confidence}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-ink-tertiary">{match.source}</p>
    </article>
  );
}

function OccupationSkeleton({ prominent }: { prominent: boolean }) {
  return (
    <div
      aria-hidden
      className={
        "rounded-2xl bg-surface-raised p-4 md:p-5 " +
        (prominent
          ? "border-2 border-border-strong shadow-[var(--shadow-md)]"
          : "border border-border-subtle shadow-[var(--shadow-sm)]")
      }
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-3 w-10" />
      </div>
      <Shimmer className="h-4 w-3/4 mb-3" />
      <Shimmer className="h-[3px] w-full rounded-full" />
      <Shimmer className="h-2.5 w-24 mt-3" />
    </div>
  );
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "block rounded bg-[linear-gradient(90deg,var(--surface-sunken)_0%,color-mix(in_oklab,var(--earth)_18%,var(--surface-sunken))_50%,var(--surface-sunken)_100%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none " +
        className
      }
    />
  );
}

function ClusterCard({
  cluster,
  className = "",
}: {
  cluster: SkillCluster;
  className?: string;
}) {
  return (
    <article
      className={
        "rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-[var(--shadow-sm)] print-card " +
        className
      }
    >
      <header className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[14px] font-medium text-ink leading-tight">
          {cluster.name}
        </h3>
        <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface-sunken px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
          {cluster.count} skills
        </span>
      </header>
      <div className="flex flex-wrap gap-1.5">
        {cluster.examples.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-full bg-earth-light px-2.5 py-1 text-[12px] font-medium text-earth-dark"
          >
            {s}
          </span>
        ))}
      </div>
    </article>
  );
}

function LanguageBadge({ language }: { language: LanguageEntry }) {
  const dots = [0, 1, 2].map((i) => (i < language.level ? "●" : "○")).join("");
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-raised px-3 py-1.5 text-[13px] text-ink"
      aria-label={`${language.name}, level ${language.level} of 3`}
    >
      <span aria-hidden>{language.flag}</span>
      <span>{language.name}</span>
      <span
        aria-hidden
        className="font-mono text-[11px] text-earth-dark tracking-tight leading-none"
      >
        {dots}
      </span>
    </span>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  return (
    <article className="relative rounded-xl bg-surface-sunken/60 pl-4 pr-4 py-4 print-card border border-border-subtle">
      {/* Left signal-green border */}
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-signal-green"
      />
      <p className="text-[12px] uppercase tracking-[0.06em] text-ink-tertiary">
        {signal.label}
      </p>
      <p
        className="mt-1 font-display text-[36px] leading-none text-ink [font-variation-settings:'opsz'_144,'wght'_400] tabular-nums"
      >
        {signal.value}
      </p>
      <p className="mt-2 text-[12px] text-ink-secondary leading-snug">
        {signal.caption}
      </p>
      <p className="mt-2 text-[11px] text-earth-dark font-mono">
        Source: {signal.source}
      </p>
    </article>
  );
}