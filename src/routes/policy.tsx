import { createFileRoute } from "@tanstack/react-router";
import { UCard, UStat } from "@/components/unmapped/primitives";

export const Route = createFileRoute("/policy")({
  head: () => ({
    meta: [
      { title: "Policy Overview — UNMAPPED" },
      { name: "description", content: "Country-level skills infrastructure overview." },
      { property: "og:title", content: "Policy Overview — UNMAPPED" },
      { property: "og:description", content: "Country-level skills infrastructure overview." },
    ],
  }),
  component: PolicyOverview,
});

function PolicyOverview() {
  return (
    <div className="u-container py-10 space-y-6">
      <h1 className="font-display text-3xl tracking-tight">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard><UStat size="md">128k</UStat><div className="mt-2 text-xs text-[var(--ink-tertiary)] uppercase tracking-wider">Learners</div></UCard>
        <UCard><UStat size="md">61%</UStat><div className="mt-2 text-xs text-[var(--ink-tertiary)] uppercase tracking-wider">Durable</div></UCard>
        <UCard><UStat size="md">2,471</UStat><div className="mt-2 text-xs text-[var(--ink-tertiary)] uppercase tracking-wider">Occupations</div></UCard>
        <UCard><UStat size="md">14</UStat><div className="mt-2 text-xs text-[var(--ink-tertiary)] uppercase tracking-wider">Partners</div></UCard>
      </div>
    </div>
  );
}