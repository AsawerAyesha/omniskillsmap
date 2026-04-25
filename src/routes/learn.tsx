import { createFileRoute } from "@tanstack/react-router";
import { UCard, UProgress } from "@/components/unmapped/primitives";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — UNMAPPED" },
      { name: "description", content: "Skill modules curated for the future of work." },
      { property: "og:title", content: "Learn — UNMAPPED" },
      { property: "og:description", content: "Skill modules curated for the future of work." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const modules = [
    { name: "Fabrication fundamentals", pct: 72 },
    { name: "Digital literacy", pct: 41 },
    { name: "Customer service", pct: 88 },
  ];
  return (
    <div className="u-container py-8 md:py-12 space-y-6">
      <h1 className="font-display text-3xl tracking-tight">Learn</h1>
      <div className="grid gap-4">
        {modules.map((m) => (
          <UCard key={m.name}>
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-medium">{m.name}</span>
              <span className="font-mono text-xs text-[var(--ink-tertiary)]">{m.pct}%</span>
            </div>
            <UProgress value={m.pct} />
          </UCard>
        ))}
      </div>
    </div>
  );
}