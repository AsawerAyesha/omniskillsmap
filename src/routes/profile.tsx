import { createFileRoute } from "@tanstack/react-router";
import { UCard, UStat } from "@/components/unmapped/primitives";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — UNMAPPED" },
      { name: "description", content: "Your skills, journey and progress on UNMAPPED." },
      { property: "og:title", content: "My Profile — UNMAPPED" },
      { property: "og:description", content: "Your skills, journey and progress on UNMAPPED." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="u-container py-8 md:py-12 space-y-6">
      <h1 className="font-display text-3xl tracking-tight">My profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard>
          <div className="text-sm text-[var(--ink-tertiary)] uppercase tracking-wider">Skills</div>
          <UStat size="md" className="mt-2">12</UStat>
        </UCard>
        <UCard>
          <div className="text-sm text-[var(--ink-tertiary)] uppercase tracking-wider">Hours learned</div>
          <UStat size="md" className="mt-2">84</UStat>
        </UCard>
        <UCard>
          <div className="text-sm text-[var(--ink-tertiary)] uppercase tracking-wider">Pathways</div>
          <UStat size="md" className="mt-2">3</UStat>
        </UCard>
      </div>
    </div>
  );
}