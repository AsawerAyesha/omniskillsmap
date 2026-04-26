import * as React from "react";
import { Check } from "lucide-react";

/* Horizontal stepper. Active step = filled earth circle. Complete = teal
 * check circle. Upcoming = gray outline. The connecting lines fill earth
 * once the step on their right has been completed. */

export interface Step {
  id: number;
  label: string;
}

export function OnboardingStepper({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) {
  return (
    <ol
      className="flex items-center w-full"
      role="list"
      aria-label="Onboarding progress"
    >
      {steps.map((s, i) => {
        const status: "complete" | "active" | "upcoming" =
          s.id < current ? "complete" : s.id === current ? "active" : "upcoming";
        const isLast = i === steps.length - 1;
        const lineFilled = s.id < current;
        return (
          <li
            key={s.id}
            className="flex items-center"
            style={{ flex: isLast ? "0 0 auto" : 1 }}
          >
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
                style={{
                  background:
                    status === "complete"
                      ? "var(--console-success)"
                      : status === "active"
                        ? "var(--earth-dark)"
                        : "transparent",
                  color:
                    status === "complete"
                      ? "#FFFFFF"
                      : status === "active"
                        ? "var(--earth-light)"
                        : "var(--console-fg-faint)",
                  border:
                    status === "upcoming"
                      ? "1px solid var(--console-border)"
                      : "1px solid transparent",
                }}
              >
                {status === "complete" ? <Check size={14} strokeWidth={2.25} /> : s.id}
              </div>
              <span
                className="text-[11px] tracking-wide whitespace-nowrap"
                style={{
                  color:
                    status === "active"
                      ? "var(--console-fg)"
                      : "var(--console-fg-muted)",
                  fontWeight: status === "active" ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div
                className="flex-1 h-px mx-3 mt-[-18px]"
                style={{
                  background: lineFilled
                    ? "var(--console-success)"
                    : "var(--console-border)",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}