import { createFileRoute } from "@tanstack/react-router";
import { UCard, UBadge, UOccupation } from "@/components/unmapped/primitives";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — UNMAPPED" },
      { name: "description", content: "Jobs, apprenticeships and grants matched to your skills." },
      { property: "og:title", content: "Opportunities — UNMAPPED" },
      { property: "og:description", content: "Jobs, apprenticeships and grants matched to your skills." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const items = [
    { code: "7212", name: "Welder apprentice — Tema port", risk: "green" as const },
    { code: "2512", name: "Junior developer — Accra fintech", risk: "green" as const },
    { code: "3212", name: "Lab technician — Korle Bu", risk: "amber" as const },
  ];
  return (
    <div className="u-container py-8 md:py-12 space-y-6">
      <h1 className="font-display text-3xl tracking-tight">Opportunities</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <UCard key={i.code} className="flex items-center justify-between">
            <UOccupation code={i.code} name={i.name} />
            <UBadge variant={i.risk}>{i.risk === "green" ? "Durable" : "Transition"}</UBadge>
          </UCard>
        ))}
      </div>
    </div>
  );
}