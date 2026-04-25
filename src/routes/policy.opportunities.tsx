import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policy/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — UNMAPPED Policy" },
      { name: "description", content: "Aggregate opportunity flows by sector." },
      { property: "og:title", content: "Opportunities — UNMAPPED Policy" },
      { property: "og:description", content: "Aggregate opportunity flows by sector." },
    ],
  }),
  component: PolicyOpps,
});

function PolicyOpps() {
  return (
    <div className="u-container py-10">
      <h1 className="font-display text-3xl tracking-tight">Opportunities</h1>
      <p className="mt-3 text-[var(--ink-secondary)]">Sector × opportunity flows.</p>
    </div>
  );
}