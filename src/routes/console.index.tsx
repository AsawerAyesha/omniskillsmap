import { createFileRoute } from "@tanstack/react-router";
import { ConsoleGuard } from "@/components/unmapped/console/console-guard";

export const Route = createFileRoute("/console/")({
  component: ConsoleHome,
});

function ConsoleHome() {
  return (
    <ConsoleGuard>
      <div className="px-8 py-10 max-w-5xl">
        <h1 className="font-display text-3xl tracking-tight">Workspace</h1>
        <p
          className="mt-2 text-sm max-w-prose"
          style={{ color: "var(--console-fg-muted)" }}
        >
          Console foundation is live. Send the C1 prompt and this surface will be
          replaced with the Workspace overview — cohorts, programs, signal
          health, and quick actions.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Cohorts", hint: "Reserved for C2" },
            { label: "Programs", hint: "Reserved for C3" },
            { label: "Signals", hint: "Reserved for C4" },
            { label: "Methodology", hint: "Reserved for C5" },
            { label: "Settings", hint: "Reserved for C6 · admin" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border p-4"
              style={{
                background: "var(--console-canvas)",
                borderColor: "var(--console-border)",
              }}
            >
              <div className="text-sm font-medium">{card.label}</div>
              <div
                className="mt-1 text-xs"
                style={{ color: "var(--console-fg-faint)" }}
              >
                {card.hint}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConsoleGuard>
  );
}