import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SkillsConstellation } from "../components/unmapped/landing/skills-constellation";
import { RegionPills } from "../components/unmapped/landing/region-pills";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNMAPPED — Your skills. Mapped." },
      {
        name: "description",
        content:
          "An open infrastructure for youth to discover, own, and connect their skills to real economic opportunity. Powered by ILO and World Bank data.",
      },
      { property: "og:title", content: "UNMAPPED — Your skills. Mapped." },
      {
        property: "og:description",
        content:
          "Open skills infrastructure for youth in low-income countries, built on ILO and World Bank data.",
      },
    ],
  }),
  component: Landing,
});

const STATS = [
  "600M+ youth unmapped",
  "190+ countries",
  "Real ILO + World Bank data",
];

const SOURCES = [
  "ILO ILOSTAT",
  "World Bank WDI",
  "ESCO",
  "O*NET",
  "Wittgenstein Centre",
];

function Landing() {
  return (
    <div className="relative min-h-[calc(100vh-0px)] bg-[var(--surface)]">
      {/* Paper grain overlay */}
      <div className="u-grain" aria-hidden />

      <div className="u-container relative pt-12 md:pt-20 pb-40 md:pb-32">
        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left: text + CTAs + stats */}
          <div>
            <h1
              className="u-rise-in font-display text-[var(--ink)]"
              style={{
                fontSize: "clamp(40px, 8vw, 72px)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                fontVariationSettings: '"opsz" 144, "wght" 400',
                animationDelay: "0ms",
              }}
            >
              Your skills<span className="text-[var(--earth-dark)]">.</span>{" "}
              Mapped<span className="text-[var(--earth-dark)]">.</span>
            </h1>

            <p
              className="u-rise-in mt-6 text-[18px] leading-[1.55] text-[var(--ink-secondary)]"
              style={{ maxWidth: "42ch", animationDelay: "120ms" }}
            >
              An open infrastructure for youth to discover, own, and connect
              their skills to real economic opportunity.
            </p>

            {/* CTAs */}
            <div
              className="u-rise-in mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/intake"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-[var(--earth)] px-6 text-[15px] font-medium text-[var(--ink)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:translate-y-[-1px] transition-all"
                style={{ transitionTimingFunction: "var(--ease-precision)" }}
              >
                Map my skills
                <ArrowRight
                  size={16}
                  strokeWidth={1.75}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <button
                type="button"
                className="inline-flex h-12 items-center rounded-full border border-[var(--border-strong)] bg-transparent px-6 text-[15px] font-medium text-[var(--ink)] hover:bg-[var(--surface-sunken)] transition-colors"
              >
                View for policymakers
              </button>
            </div>

            {/* Stat chips */}
            <div className="mt-7 flex flex-wrap gap-2">
              {STATS.map((s, i) => (
                <span
                  key={s}
                  className="u-rise-in inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-3 py-1.5 font-mono text-[12px] text-[var(--ink-secondary)]"
                  style={{ animationDelay: `${360 + i * 60}ms` }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Right: constellation */}
          <div
            className="u-rise-in mx-auto w-full"
            style={{
              maxWidth: "560px",
              aspectRatio: "4 / 3",
              animationDelay: "600ms",
            }}
          >
            <SkillsConstellation className="h-full w-full" />
          </div>
        </div>

        {/* Country/region selector row */}
        <div
          className="u-rise-in mt-16 md:mt-20 border-t border-[var(--border-subtle)] pt-8"
          style={{ animationDelay: "720ms" }}
        >
          <RegionPills />
        </div>
      </div>

      {/* Footer data-source strip */}
      <footer
        className="u-rise-in relative z-10 border-t border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-sm lg:absolute lg:bottom-0 lg:left-0 lg:right-0"
        style={{ animationDelay: "840ms" }}
      >
        <div className="u-container flex flex-wrap items-center gap-x-2 gap-y-1 py-4 text-[12px] text-[var(--ink-tertiary)]">
          <span>Powered by real data from:</span>
          {SOURCES.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className="font-mono tracking-wide">{s}</span>
              {i < SOURCES.length - 1 && (
                <span aria-hidden className="text-[var(--ink-tertiary)]/60">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
