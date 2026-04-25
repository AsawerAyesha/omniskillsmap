import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policy/projections")({
  head: () => ({
    meta: [
      { title: "Projections — UNMAPPED Policy" },
      { name: "description", content: "Forward labour-market projections." },
      { property: "og:title", content: "Projections — UNMAPPED Policy" },
      { property: "og:description", content: "Forward labour-market projections." },
    ],
  }),
  component: PolicyProjections,
});

function PolicyProjections() {
  return (
    <div className="u-container py-10">
      <h1 className="font-display text-3xl tracking-tight">Projections</h1>
      <p className="mt-3 text-[var(--ink-secondary)]">Scenario projections by occupation.</p>
    </div>
  );
}