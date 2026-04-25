import * as React from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ArrowRight, Check } from "lucide-react";
import { initialIntake } from "../components/unmapped/intake/intake-types";
import type { IntakeData } from "../components/unmapped/intake/intake-types";
import {
  Step1Where,
  Step2Education,
  Step3Experience,
  Step4LangDigital,
  Step5Quick,
} from "../components/unmapped/intake/steps";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "Map your skills — UNMAPPED" },
      {
        name: "description",
        content:
          "A short, respectful intake to build your skills profile from your real experience.",
      },
      { property: "og:title", content: "Map your skills — UNMAPPED" },
      {
        property: "og:description",
        content:
          "A short, respectful intake to build your skills profile from your real experience.",
      },
    ],
  }),
  component: IntakePage,
});

const STEP_TITLES = [
  "Where are you from?",
  "Your education",
  "What work have you done?",
  "Languages & digital skills",
  "Almost done — a few quick questions",
] as const;

const SHORT_LABELS = [
  "Your home",
  "Your education",
  "Your experience",
  "Languages & digital",
  "A few quick questions",
] as const;

function IntakePage() {
  const router = useRouter();
  const [data, setData] = React.useState<IntakeData>(initialIntake);
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState<"fwd" | "back">("fwd");
  const [done, setDone] = React.useState(false);

  const set = React.useCallback(
    <K extends keyof IntakeData>(key: K, value: IntakeData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const canContinue = React.useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(data.country && data.regionType && data.language);
      case 1:
        return Boolean(data.education);
      case 2:
        return data.experiences.length > 0;
      case 3:
        return (
          Object.values(data.languageProficiency).some((v) => v != null) &&
          data.digitalSkills.length > 0
        );
      case 4:
        return Boolean(data.working && data.goal && data.internet);
      default:
        return false;
    }
  }, [step, data]);

  const goNext = () => {
    if (!canContinue) return;
    if (step === STEP_TITLES.length - 1) {
      setDone(true);
      return;
    }
    setDirection("fwd");
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) {
      router.history.back();
      return;
    }
    setDirection("back");
    setStep((s) => s - 1);
  };

  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  if (done) {
    return <IntakeComplete data={data} />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col">
      {/* Progress + back */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]/95 backdrop-blur border-b border-[var(--border-subtle)]">
        <div className="u-progress" style={{ height: 3 }}>
          <div
            className="u-progress__fill"
            style={{
              width: `${progress}%`,
              transition: "width 350ms var(--ease-precision)",
            }}
          />
        </div>
        <div className="mx-auto w-full max-w-[560px] px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="inline-flex items-center justify-center h-11 w-11 -ml-2 rounded-full text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)] transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <p className="text-[13px] text-[var(--ink-tertiary)] font-medium tabular-nums">
            Step {step + 1} of {STEP_TITLES.length}
            <span className="hidden sm:inline">
              {" "}— {SHORT_LABELS[step]}
            </span>
          </p>
          <span className="w-11" aria-hidden />
        </div>
      </header>

      {/* Step body */}
      <main className="flex-1 mx-auto w-full max-w-[560px] px-4 pt-6 pb-32 overflow-x-hidden">
        <h1
          key={`title-${step}`}
          className="font-display text-[28px] sm:text-[32px] leading-[1.1] tracking-tight text-[var(--ink)] mb-6"
          style={{
            fontVariationSettings: '"opsz" 144, "wght" 400',
          }}
        >
          {STEP_TITLES[step]}
        </h1>

        <div
          key={`body-${step}`}
          className={direction === "fwd" ? "u-step-in-fwd" : "u-step-in-back"}
        >
          {step === 0 && <Step1Where data={data} set={set} />}
          {step === 1 && <Step2Education data={data} set={set} />}
          {step === 2 && <Step3Experience data={data} set={set} />}
          {step === 3 && <Step4LangDigital data={data} set={set} />}
          {step === 4 && <Step5Quick data={data} set={set} />}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-10 border-t border-[var(--border-subtle)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[560px] px-4 py-4">
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className={
              "group inline-flex w-full h-12 items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-all " +
              (canContinue
                ? "bg-[var(--earth)] text-[var(--ink)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:translate-y-[-1px]"
                : "bg-[var(--surface-sunken)] text-[var(--ink-tertiary)] cursor-not-allowed")
            }
            style={{ transitionTimingFunction: "var(--ease-precision)" }}
          >
            {step === STEP_TITLES.length - 1 ? "Build my profile" : "Continue"}
            <ArrowRight
              size={16}
              strokeWidth={1.75}
              className={canContinue ? "transition-transform group-hover:translate-x-0.5" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function IntakeComplete({ data }: { data: IntakeData }) {
  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[560px] text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--earth-light)] text-[var(--earth-dark)]">
          <Check size={22} strokeWidth={2} />
        </span>
        <h1
          className="mt-6 font-display text-[32px] leading-[1.1] tracking-tight text-[var(--ink)]"
          style={{ fontVariationSettings: '"opsz" 144, "wght" 400' }}
        >
          Profile saved
        </h1>
        <p className="mt-3 text-[15px] text-[var(--ink-secondary)]">
          We're mapping your {data.experiences.length} experiences against ILO
          and World Bank skill data. This takes a moment.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-3 py-1.5 font-mono text-[12px] text-[var(--ink-secondary)]">
          {data.experiences.slice(0, 3).join(" · ") || "—"}
        </div>
      </div>
    </div>
  );
}