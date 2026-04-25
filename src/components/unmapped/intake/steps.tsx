import * as React from "react";
import {
  Building2,
  Home,
  Trees,
  GraduationCap,
  Smartphone,
  MessageCircle,
  Video,
  Table2,
  Code2,
  Share2,
  ShoppingBag,
  Plus,
  ChevronDown,
} from "lucide-react";
import { SelectCard, Pill, LevelSelector } from "./intake-primitives";
import { TagInput } from "./tag-input";
import { COUNTRIES, suggestionsFor } from "./intake-types";
import type { IntakeData } from "./intake-types";

type Setter = <K extends keyof IntakeData>(key: K, value: IntakeData[K]) => void;

/* ---------- Step 1: Where are you from? ---------- */
export function Step1Where({
  data,
  set,
}: {
  data: IntakeData;
  set: Setter;
}) {
  const country = COUNTRIES.find((c) => c.code === data.country) ?? COUNTRIES[0];
  return (
    <div className="space-y-7">
      {/* Country dropdown */}
      <div>
        <label
          htmlFor="intake-country"
          className="block text-[13px] font-medium text-ink-secondary mb-2"
        >
          Country
        </label>
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px]"
          >
            {country.flag}
          </span>
          <select
            id="intake-country"
            value={data.country}
            onChange={(e) => set("country", e.target.value)}
            className="appearance-none w-full rounded-2xl border border-border-strong bg-surface-raised pl-12 pr-10 min-h-[56px] text-[15px] text-ink focus:border-earth transition-colors"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag}  {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-tertiary"
          />
        </div>
      </div>

      {/* Region type */}
      <fieldset>
        <legend className="block text-[13px] font-medium text-ink-secondary mb-2">
          Where do you live?
        </legend>
        <div role="radiogroup" className="space-y-2">
          {[
            { id: "urban", title: "Urban city", description: "A large city with many neighbourhoods", icon: <Building2 size={18} strokeWidth={1.5} /> },
            { id: "town", title: "Small town", description: "A market town or growing settlement", icon: <Home size={18} strokeWidth={1.5} /> },
            { id: "rural", title: "Rural area", description: "A village or farming community", icon: <Trees size={18} strokeWidth={1.5} /> },
          ].map((opt) => (
            <SelectCard
              key={opt.id}
              selected={data.regionType === opt.id}
              icon={opt.icon}
              title={opt.title}
              description={opt.description}
              onClick={() => set("regionType", opt.id as IntakeData["regionType"])}
            />
          ))}
        </div>
      </fieldset>

      {/* Language */}
      <div>
        <p className="block text-[13px] font-medium text-ink-secondary mb-2">
          What language do you prefer?
        </p>
        <div className="flex flex-wrap gap-2">
          {["English", "French", "Swahili", "Twi", "Hausa", "Bengali", "Hindi"].map((l) => (
            <Pill
              key={l}
              selected={data.language === l}
              onClick={() => set("language", l)}
            >
              {l}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 2: Education ---------- */
const EDUCATION_OPTIONS: {
  id: NonNullable<IntakeData["education"]>;
  title: string;
  description: string;
  meta: string;
}[] = [
  { id: "none", title: "No formal schooling", description: "Learning came from family, work, community", meta: "ISCED 0" },
  { id: "primary", title: "Primary", description: "Some or all of primary school completed", meta: "ISCED 1" },
  { id: "lower-secondary", title: "Lower secondary", description: "Junior high / middle school", meta: "ISCED 2" },
  { id: "upper-secondary", title: "Upper secondary", description: "Senior high school", meta: "ISCED 3" },
  { id: "vocational", title: "Vocational / Technical", description: "Trade school, apprenticeship", meta: "ISCED 4–5" },
  { id: "university", title: "University or above", description: "Bachelor's degree or higher", meta: "ISCED 6+" },
];

export function Step2Education({
  data,
  set,
}: {
  data: IntakeData;
  set: Setter;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium text-ink-secondary">
        Highest level completed
      </p>
      <div role="radiogroup" className="space-y-2">
        {EDUCATION_OPTIONS.map((opt) => (
          <SelectCard
            key={opt.id}
            selected={data.education === opt.id}
            icon={<GraduationCap size={18} strokeWidth={1.5} />}
            title={opt.title}
            description={opt.description}
            meta={`Equivalent to: ${opt.meta}`}
            onClick={() => set("education", opt.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Step 3: Experience ---------- */
export function Step3Experience({
  data,
  set,
}: {
  data: IntakeData;
  set: Setter;
}) {
  const suggestions = suggestionsFor(data.country).filter(
    (s) => !data.experiences.some((e) => e.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <p className="text-[14px] text-ink-secondary">
        Tell us about your experience — formal or not.
      </p>

      <div>
        <p className="block text-[13px] font-medium text-ink-secondary mb-2">
          Add what you've done
        </p>
        <TagInput
          ariaLabel="Add a skill or job"
          placeholder="Type a skill or job and press Enter"
          value={data.experiences}
          onChange={(next) => set("experiences", next)}
        />
      </div>

      {suggestions.length > 0 && (
        <div>
          <p className="block text-[13px] font-medium text-ink-secondary mb-2">
            Common in your region
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Pill
                key={s}
                onClick={() => set("experiences", [...data.experiences, s])}
                className="!min-h-[36px] !px-3 !text-[13px]"
              >
                <Plus size={12} strokeWidth={2} />
                {s}
              </Pill>
            ))}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="day-to-day"
          className="block text-[13px] font-medium text-ink-secondary mb-2"
        >
          Describe what you do day-to-day{" "}
          <span className="text-ink-tertiary font-normal">(optional)</span>
        </label>
        <textarea
          id="day-to-day"
          value={data.dayToDay}
          onChange={(e) => set("dayToDay", e.target.value)}
          rows={4}
          placeholder="A typical day for me looks like…"
          className="w-full rounded-2xl border border-border-subtle bg-surface-sunken px-4 py-3 text-[14px] text-ink placeholder:text-ink-tertiary focus:border-earth focus:bg-surface-raised transition-colors resize-none"
        />
      </div>
    </div>
  );
}

/* ---------- Step 4: Languages & digital skills ---------- */
const DIGITAL_SKILLS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "smartphone", label: "Basic smartphone use", icon: <Smartphone size={18} strokeWidth={1.5} /> },
  { id: "messaging", label: "WhatsApp / messaging", icon: <MessageCircle size={18} strokeWidth={1.5} /> },
  { id: "video", label: "Video calls", icon: <Video size={18} strokeWidth={1.5} /> },
  { id: "spreadsheets", label: "Spreadsheets", icon: <Table2 size={18} strokeWidth={1.5} /> },
  { id: "coding", label: "Basic coding", icon: <Code2 size={18} strokeWidth={1.5} /> },
  { id: "social", label: "Social media management", icon: <Share2 size={18} strokeWidth={1.5} /> },
  { id: "selling", label: "Online selling", icon: <ShoppingBag size={18} strokeWidth={1.5} /> },
];

export function Step4LangDigital({
  data,
  set,
}: {
  data: IntakeData;
  set: Setter;
}) {
  /* Languages: derive from preferred + a couple of common locals */
  const langs = React.useMemo(() => {
    const base = new Set<string>([data.language, "English", "French", "Swahili"]);
    return Array.from(base);
  }, [data.language]);

  const toggleDigital = (id: string) => {
    const has = data.digitalSkills.includes(id);
    set(
      "digitalSkills",
      has ? data.digitalSkills.filter((d) => d !== id) : [...data.digitalSkills, id],
    );
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary mb-2">
          Languages you speak
        </p>
        <ul className="space-y-2">
          {langs.map((lang) => (
            <li
              key={lang}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-raised px-4 py-3 min-h-[56px]"
            >
              <span className="text-[14px] font-medium text-ink">
                {lang}
              </span>
              <LevelSelector
                label={lang}
                value={data.languageProficiency[lang] ?? null}
                onChange={(v) =>
                  set("languageProficiency", {
                    ...data.languageProficiency,
                    [lang]: v,
                  })
                }
              />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[13px] font-medium text-ink-secondary mb-2">
          Digital skills you have
        </p>
        <div role="group" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DIGITAL_SKILLS.map((s) => {
            const selected = data.digitalSkills.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => toggleDigital(s.id)}
                className={
                  "group flex items-center gap-3 rounded-2xl border px-3 py-3 min-h-[56px] text-left transition-colors duration-150 " +
                  (selected
                    ? "border-earth bg-earth-light"
                    : "border-border-subtle bg-surface-raised hover:border-border-strong")
                }
              >
                <span
                  className={
                    "shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg " +
                    (selected
                      ? "bg-[color-mix(in_oklab,var(--earth)_30%,transparent)] text-earth-dark"
                      : "bg-surface-sunken text-ink-secondary")
                  }
                >
                  {s.icon}
                </span>
                <span className="flex-1 text-[14px] font-medium text-ink">
                  {s.label}
                </span>
                <span
                  aria-hidden
                  className={
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border " +
                    (selected
                      ? "border-earth-dark bg-earth-dark text-earth-light"
                      : "border-border-strong text-transparent")
                  }
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 5: Quick questions ---------- */
const Q1: { id: NonNullable<IntakeData["working"]>; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "part-time", label: "Part-time" },
  { id: "no", label: "No" },
];
const Q2: { id: NonNullable<IntakeData["goal"]>; label: string }[] = [
  { id: "find-job", label: "Find a job" },
  { id: "start-business", label: "Start a business" },
  { id: "upgrade-skills", label: "Upgrade skills" },
  { id: "understand-options", label: "Understand my options" },
];
const Q3: { id: NonNullable<IntakeData["internet"]>; label: string }[] = [
  { id: "mobile", label: "Mobile data" },
  { id: "wifi", label: "WiFi" },
  { id: "shared", label: "Shared device" },
  { id: "limited", label: "Limited access" },
];

export function Step5Quick({
  data,
  set,
}: {
  data: IntakeData;
  set: Setter;
}) {
  /* Accordion: focused index = first unanswered, can be re-opened by clicking */
  const [focused, setFocused] = React.useState<number>(0);

  React.useEffect(() => {
    if (focused === 0 && data.working) setFocused(1);
    else if (focused === 1 && data.goal) setFocused(2);
  }, [data.working, data.goal, focused]);

  const cards: {
    title: string;
    answered: string | null;
    body: React.ReactNode;
  }[] = [
    {
      title: "Are you currently working?",
      answered: data.working ? Q1.find((o) => o.id === data.working)?.label ?? null : null,
      body: (
        <div className="flex flex-wrap gap-2">
          {Q1.map((o) => (
            <Pill key={o.id} selected={data.working === o.id} onClick={() => set("working", o.id)}>
              {o.label}
            </Pill>
          ))}
        </div>
      ),
    },
    {
      title: "What's your main goal?",
      answered: data.goal ? Q2.find((o) => o.id === data.goal)?.label ?? null : null,
      body: (
        <div className="flex flex-wrap gap-2">
          {Q2.map((o) => (
            <Pill key={o.id} selected={data.goal === o.id} onClick={() => set("goal", o.id)}>
              {o.label}
            </Pill>
          ))}
        </div>
      ),
    },
    {
      title: "How do you usually access the internet?",
      answered: data.internet ? Q3.find((o) => o.id === data.internet)?.label ?? null : null,
      body: (
        <div className="flex flex-wrap gap-2">
          {Q3.map((o) => (
            <Pill key={o.id} selected={data.internet === o.id} onClick={() => set("internet", o.id)}>
              {o.label}
            </Pill>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {cards.map((c, i) => {
        const isOpen = focused === i;
        return (
          <div
            key={c.title}
            className={
              "rounded-2xl border bg-surface-raised transition-colors duration-150 " +
              (isOpen
                ? "border-earth shadow-[var(--shadow-sm)]"
                : "border-border-subtle")
            }
          >
            <button
              type="button"
              onClick={() => setFocused(i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-4 py-4 min-h-[56px] text-left"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-ink-tertiary">
                  Q{i + 1}
                </span>
                <span className="text-[15px] font-medium text-ink">
                  {c.title}
                </span>
              </span>
              {c.answered && !isOpen && (
                <span className="text-[13px] text-earth-dark font-medium">
                  {c.answered}
                </span>
              )}
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4">{c.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}