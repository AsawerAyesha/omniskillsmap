import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policy/risk")({
  head: () => ({
    meta: [
      { title: "Automation Risk — UNMAPPED Policy" },
      { name: "description", content: "Automation exposure by occupation." },
      { property: "og:title", content: "Automation Risk — UNMAPPED Policy" },
      { property: "og:description", content: "Automation exposure by occupation." },
    ],
  }),
  component: PolicyRisk,
});

function PolicyRisk() {
  return (
    <div className="u-container py-10">
      <h1 className="font-display text-3xl tracking-tight">Automation Risk</h1>
      <p className="mt-3 text-[var(--ink-secondary)]">Risk distributions and exposure curves.</p>
    </div>
  );
}