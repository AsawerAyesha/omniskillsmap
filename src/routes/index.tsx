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
    <div className="relative min-h-screen bg-surface">
      {/* Paper grain overlay (Tailwind arbitrary bg-image) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[length:240px_240px] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 md:px-6 pt-12 md:pt-20 pb-40 md:pb-32">
        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left: text + CTAs + stats */}
          <div>
            <h1
              className="font-display text-ink text-[clamp(40px,8vw,72px)] leading-[0.95] tracking-[-0.02em] animate-rise-in opacity-0 [font-variation-settings:'opsz'_144,'wght'_400]"
              style={{ animationDelay: "0ms" }}
            >
              Your skills<span className="text-earth-dark">.</span>{" "}
              Mapped<span className="text-earth-dark">.</span>
            </h1>

            <p
              className="mt-6 max-w-[42ch] text-[18px] leading-[1.55] text-ink-secondary animate-rise-in opacity-0"
              style={{ animationDelay: "120ms" }}
            >
              An open infrastructure for youth to discover, own, and connect
              their skills to real economic opportunity.
            </p>

            {/* CTAs */}
            <div
              className="mt-8 flex flex-wrap items-center gap-3 animate-rise-in opacity-0"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/intake"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-earth px-6 text-[15px] font-medium text-ink shadow-sm transition-all duration-300 ease-precision hover:shadow-md hover:-translate-y-0.5"
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
                className="inline-flex h-12 items-center rounded-full border border-border-strong bg-transparent px-6 text-[15px] font-medium text-ink transition-colors hover:bg-surface-sunken"
              >
                View for policymakers
              </button>
            </div>

            {/* Stat chips */}
            <div className="mt-7 flex flex-wrap gap-2">
              {STATS.map((s, i) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full border border-border-subtle bg-surface-sunken px-3 py-1.5 font-mono text-[12px] text-ink-secondary animate-rise-in opacity-0"
                  style={{ animationDelay: `${360 + i * 60}ms` }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Right: constellation */}
          <div
            className="mx-auto w-full max-w-[560px] aspect-[4/3] animate-rise-in opacity-0"
            style={{ animationDelay: "600ms" }}
          >
            <SkillsConstellation className="h-full w-full" />
          </div>
        </div>

        {/* Country/region selector row */}
        <div
          className="mt-16 md:mt-20 border-t border-border-subtle pt-8 animate-rise-in opacity-0"
          style={{ animationDelay: "720ms" }}
        >
          <RegionPills />
        </div>
      </div>

      {/* Footer data-source strip */}
      <footer
        className="relative z-10 border-t border-border-subtle bg-surface/80 backdrop-blur-sm lg:absolute lg:bottom-0 lg:left-0 lg:right-0 animate-rise-in opacity-0"
        style={{ animationDelay: "840ms" }}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 flex flex-wrap items-center gap-x-2 gap-y-1 py-4 text-[12px] text-ink-tertiary">
          <span>Powered by real data from:</span>
          {SOURCES.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className="font-mono tracking-wide">{s}</span>
              {i < SOURCES.length - 1 && (
                <span aria-hidden className="text-ink-tertiary/60">·</span>
              )}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
