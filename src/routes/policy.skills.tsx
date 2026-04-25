import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policy/skills")({
  head: () => ({
    meta: [
      { title: "Skills Map — UNMAPPED Policy" },
      { name: "description", content: "National skills map by ISCO occupation." },
      { property: "og:title", content: "Skills Map — UNMAPPED Policy" },
      { property: "og:description", content: "National skills map by ISCO occupation." },
    ],
  }),
  component: SkillsMap,
});

function SkillsMap() {
  return (
    <div className="u-container py-10">
      <h1 className="font-display text-3xl tracking-tight">Skills Map</h1>
      <p className="mt-3 text-[var(--ink-secondary)]">Occupation × region heatmap goes here.</p>
    </div>
  );
}