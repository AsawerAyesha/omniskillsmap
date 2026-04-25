import { createFileRoute } from "@tanstack/react-router";
import { LearnBoard } from "@/components/unmapped/learn/learn-board";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Your pathway · UNMAPPED" },
      {
        name: "description",
        content:
          "A personal learning pathway built from your skills profile, ESCO standards and real labour-market signals — works offline.",
      },
      { property: "og:title", content: "Learn — Your pathway · UNMAPPED" },
      {
        property: "og:description",
        content:
          "Modules ordered to unlock your next opportunity, with portable ESCO credentials.",
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-ink-tertiary">
            Learn
          </p>
          <h1 className="mt-1 font-display text-[34px] md:text-[42px] leading-[1.05] tracking-tight text-ink [font-variation-settings:'opsz'_144,'wght'_400]">
            Your pathway<span className="text-earth-dark">.</span>
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] text-ink-secondary">
            Built from your skills profile, ordered to unlock your next match.
            Every credential is portable.
          </p>
        </header>
        <LearnBoard />
      </div>
    </div>
  );
}