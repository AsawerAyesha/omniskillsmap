import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  HeartHandshake,
  Briefcase,
  ChevronDown,
  Search,
  X,
  Plus,
  Copy,
  Check,
  Wifi,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { OnboardingShell } from "@/components/unmapped/console/onboarding-shell";
import {
  OnboardingStepper,
  type Step,
} from "@/components/unmapped/console/onboarding-stepper";

/* C1 Screen B — Org Onboarding. 4-step setup flow rendered inside an
 * OnboardingShell that previews the (dimmed) console surface. State is
 * kept in component memory + sessionStorage so a refresh mid-setup doesn't
 * blow away the operator's work. No DB writes yet — final submit just
 * lands the user on a success state. */

export const Route = createFileRoute("/console/onboarding")({
  component: OnboardingPage,
});

const STEPS: Step[] = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Region" },
  { id: 3, label: "Team" },
  { id: 4, label: "Credentials" },
];

type OrgType = "government" | "ngo" | "employer";
type UseCase = "youth-skills" | "talent-matching" | "policy-dashboard" | "training-alignment";
type Role = "Admin" | "Data Manager" | "Viewer";

interface TeamMember {
  id: string;
  email: string;
  role: Role;
}

interface OnboardingState {
  orgName: string;
  orgType: OrgType | null;
  country: string;
  beneficiaries: string;
  useCases: UseCase[];
  regions: string[];
  lowBandwidth: boolean;
  team: TeamMember[];
  apiKey: string;
  webhookUrl: string;
  ackKey: boolean;
}

const COUNTRIES = [
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "SN", name: "Senegal", flag: "🇸🇳" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
];

const REGIONS = [
  { id: "africa-west", label: "West Africa" },
  { id: "africa-east", label: "East Africa" },
  { id: "africa-south", label: "Southern Africa" },
  { id: "africa-north", label: "North Africa" },
  { id: "mena", label: "Middle East & N. Africa" },
  { id: "south-asia", label: "South Asia" },
  { id: "se-asia", label: "Southeast Asia" },
  { id: "east-asia", label: "East Asia" },
  { id: "latam", label: "Latin America" },
  { id: "caribbean", label: "Caribbean" },
];

const STORAGE_KEY = "unmapped:onboarding";

function generateKey(): string {
  // Pseudo API key: prefix + 32 hex-ish chars. Shown read-only.
  const rand = () =>
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
  return `unm_live_${rand()}${rand()}`.slice(0, 44);
}

function initialState(): OnboardingState {
  if (typeof window !== "undefined") {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as OnboardingState;
      } catch {
        /* fall through */
      }
    }
  }
  const seedOrg =
    typeof window !== "undefined"
      ? (window.sessionStorage.getItem("unmapped:operator-type") as OrgType | null)
      : null;
  return {
    orgName: "",
    orgType: seedOrg,
    country: "",
    beneficiaries: "",
    useCases: [],
    regions: [],
    lowBandwidth: false,
    team: [],
    apiKey: generateKey(),
    webhookUrl: "",
    ackKey: false,
  };
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [state, setState] = React.useState<OnboardingState>(() => initialState());
  const [done, setDone] = React.useState(false);

  // Persist state on change
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const canContinue = React.useMemo(() => {
    if (step === 1) {
      return Boolean(
        state.orgName.trim() &&
          state.orgType &&
          state.country &&
          state.useCases.length > 0,
      );
    }
    if (step === 2) return state.regions.length > 0;
    if (step === 3) return true; // optional
    if (step === 4) return state.ackKey;
    return false;
  }, [step, state]);

  const onBack = () => {
    if (step === 1) {
      void navigate({ to: "/console/auth/sign-in", search: { redirect: "/console" } });
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const onContinue = () => {
    if (!canContinue) return;
    if (step === 4) {
      setDone(true);
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  if (done) {
    return (
      <OnboardingShell step={4} totalSteps={4} stepTitle="Setup complete">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div
            className="mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "color-mix(in oklab, var(--console-success) 15%, transparent)",
              color: "var(--console-success)",
            }}
          >
            <CheckCircle2 size={28} strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-3xl tracking-tight">
            Your deployment is ready
          </h1>
          <p
            className="mt-3 text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--console-fg-muted)" }}
          >
            <strong style={{ color: "var(--console-fg)" }}>{state.orgName}</strong>{" "}
            is now configured. You can begin importing cohorts and publishing
            opportunities from the Workspace.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined")
                  window.sessionStorage.removeItem(STORAGE_KEY);
                void navigate({ to: "/console" });
              }}
              className="inline-flex items-center gap-2 rounded-md px-4 h-10 text-sm font-medium transition-colors"
              style={{
                background: "var(--console-accent)",
                color: "var(--console-accent-fg)",
              }}
            >
              Go to Workspace <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  const stepTitle =
    step === 1
      ? "About your organization"
      : step === 2
        ? "Your deployment region"
        : step === 3
          ? "Invite your team"
          : "Your API credentials";

  return (
    <OnboardingShell step={step} totalSteps={4} stepTitle={stepTitle}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <div className="px-2 py-2">
          <OnboardingStepper steps={STEPS} current={step} />
        </div>

        <div className="mt-10">
          <div className="mb-6">
            <div
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "var(--console-fg-faint)" }}
            >
              Step {step} of 4
            </div>
            <h1 className="mt-1 font-display text-3xl tracking-tight">{stepTitle}</h1>
          </div>

          {step === 1 && <Step1 state={state} update={update} />}
          {step === 2 && <Step2 state={state} update={update} />}
          {step === 3 && <Step3 state={state} update={update} />}
          {step === 4 && <Step4 state={state} update={update} />}
        </div>

        {/* Footer nav */}
        <div
          className="mt-12 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--console-border)" }}
        >
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--console-fg-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--console-fg)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--console-fg-muted)")}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-md px-4 h-10 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--console-accent)",
              color: "var(--console-accent-fg)",
            }}
          >
            {step === 4 ? "Complete setup" : "Continue"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}

/* ----------------------------- STEP 1 ----------------------------- */

function Step1({
  state,
  update,
}: {
  state: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div className="space-y-7">
      <FieldBlock label="Organization name" htmlFor="org-name">
        <input
          id="org-name"
          type="text"
          value={state.orgName}
          onChange={(e) => update("orgName", e.target.value)}
          placeholder="e.g. Ministry of Youth & Sports"
          className="w-full rounded-md px-3 text-sm outline-none transition-colors"
          style={{
            height: 40,
            background: "var(--console-canvas)",
            border: "1px solid var(--console-border)",
            color: "var(--console-fg)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--console-accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--console-border)")}
        />
      </FieldBlock>

      <FieldBlock label="Organization type">
        <div className="grid sm:grid-cols-3 gap-2.5">
          {(
            [
              { id: "government", title: "Government", sub: "Public sector", Icon: Building2 },
              { id: "ngo", title: "NGO", sub: "Civil society", Icon: HeartHandshake },
              { id: "employer", title: "Employer", sub: "Private sector", Icon: Briefcase },
            ] as const
          ).map(({ id, title, sub, Icon }) => {
            const active = state.orgType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => update("orgType", id)}
                aria-pressed={active}
                className="text-left rounded-md p-4 transition-all"
                style={{
                  background: active
                    ? "color-mix(in oklab, var(--earth) 12%, var(--console-canvas))"
                    : "var(--console-canvas)",
                  border: active
                    ? "1px solid var(--earth-dark)"
                    : "1px solid var(--console-border)",
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  style={{
                    color: active ? "var(--earth-dark)" : "var(--console-fg-muted)",
                  }}
                />
                <div className="mt-2 text-sm font-medium">{title}</div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--console-fg-muted)" }}
                >
                  {sub}
                </div>
              </button>
            );
          })}
        </div>
      </FieldBlock>

      <FieldBlock label="Primary country of operation" htmlFor="country">
        <CountryPicker
          value={state.country}
          onChange={(v) => update("country", v)}
        />
      </FieldBlock>

      <FieldBlock
        label="Estimated beneficiaries per year"
        htmlFor="beneficiaries"
        helper="Used to right-size your deployment"
      >
        <input
          id="beneficiaries"
          type="number"
          inputMode="numeric"
          min={0}
          value={state.beneficiaries}
          onChange={(e) => update("beneficiaries", e.target.value)}
          placeholder="50,000"
          className="w-full rounded-md px-3 text-sm outline-none font-mono transition-colors"
          style={{
            height: 40,
            background: "var(--console-canvas)",
            border: "1px solid var(--console-border)",
            color: "var(--console-fg)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--console-accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--console-border)")}
        />
      </FieldBlock>

      <FieldBlock label="Primary use case (select all that apply)">
        <div className="grid sm:grid-cols-2 gap-2.5">
          {(
            [
              { id: "youth-skills", label: "Youth skills mapping" },
              { id: "talent-matching", label: "Employer talent matching" },
              { id: "policy-dashboard", label: "Policy dashboard" },
              { id: "training-alignment", label: "Training program alignment" },
            ] as const
          ).map(({ id, label }) => {
            const active = state.useCases.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  update(
                    "useCases",
                    active
                      ? state.useCases.filter((u) => u !== id)
                      : [...state.useCases, id],
                  )
                }
                aria-pressed={active}
                className="text-left rounded-md p-3.5 flex items-center gap-3 transition-all"
                style={{
                  background: active
                    ? "color-mix(in oklab, var(--earth) 10%, var(--console-canvas))"
                    : "var(--console-canvas)",
                  border: active
                    ? "1px solid var(--earth-dark)"
                    : "1px solid var(--console-border)",
                }}
              >
                <span
                  className="h-4 w-4 rounded shrink-0 flex items-center justify-center"
                  style={{
                    background: active ? "var(--earth-dark)" : "transparent",
                    border: active ? "1px solid var(--earth-dark)" : "1px solid var(--console-border)",
                    color: "var(--earth-light)",
                  }}
                >
                  {active && <Check size={11} strokeWidth={2.5} />}
                </span>
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </div>
      </FieldBlock>
    </div>
  );
}

function CountryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = COUNTRIES.find((c) => c.code === value);
  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-md px-3 text-sm flex items-center justify-between transition-colors"
        style={{
          height: 40,
          background: "var(--console-canvas)",
          border: "1px solid var(--console-border)",
          color: selected ? "var(--console-fg)" : "var(--console-fg-faint)",
        }}
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span style={{ fontSize: 16 }}>{selected.flag}</span>
              {selected.name}
            </>
          ) : (
            "Select a country…"
          )}
        </span>
        <ChevronDown size={14} style={{ color: "var(--console-fg-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-md shadow-lg overflow-hidden"
          style={{
            background: "var(--console-canvas)",
            border: "1px solid var(--console-border)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 border-b"
            style={{ borderColor: "var(--console-border)" }}
          >
            <Search size={13} style={{ color: "var(--console-fg-faint)" }} />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              placeholder="Search countries…"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              style={{ color: "var(--console-fg)" }}
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div
                className="px-3 py-3 text-xs"
                style={{ color: "var(--console-fg-faint)" }}
              >
                No matches.
              </div>
            )}
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors"
                style={{
                  color: "var(--console-fg)",
                  background: c.code === value ? "var(--console-panel)" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--console-panel)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    c.code === value ? "var(--console-panel)" : "transparent")
                }
              >
                <span style={{ fontSize: 16 }}>{c.flag}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- STEP 2 ----------------------------- */

function Step2({
  state,
  update,
}: {
  state: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const toggleRegion = (id: string) =>
    update(
      "regions",
      state.regions.includes(id)
        ? state.regions.filter((r) => r !== id)
        : [...state.regions, id],
    );

  return (
    <div className="space-y-7">
      <FieldBlock
        label="Target deployment regions"
        helper="Select one or more regions where this deployment will operate. Tap regions on the map or use the list below."
      >
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--console-canvas)",
            border: "1px solid var(--console-border)",
          }}
        >
          <WorldMap selected={state.regions} onToggle={toggleRegion} />
        </div>

        {state.regions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {state.regions.map((id) => {
              const r = REGIONS.find((x) => x.id === id);
              if (!r) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                  style={{
                    background:
                      "color-mix(in oklab, var(--earth) 18%, var(--console-canvas))",
                    color: "var(--earth-dark)",
                    border: "1px solid var(--earth-dark)",
                  }}
                >
                  {r.label}
                  <button
                    type="button"
                    onClick={() => toggleRegion(id)}
                    aria-label={`Remove ${r.label}`}
                    style={{ color: "var(--earth-dark)" }}
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <div
            className="text-[11px] uppercase tracking-[0.10em] mb-2"
            style={{ color: "var(--console-fg-muted)" }}
          >
            Or pick from list
          </div>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {REGIONS.map((r) => {
              const active = state.regions.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRegion(r.id)}
                  className="flex items-center justify-between text-left rounded-md px-3 py-2 text-sm transition-colors"
                  style={{
                    background: active ? "var(--console-panel)" : "transparent",
                    border: active
                      ? "1px solid var(--earth-dark)"
                      : "1px solid var(--console-border)",
                    color: active ? "var(--console-fg)" : "var(--console-fg-muted)",
                  }}
                >
                  {r.label}
                  {active && <Check size={13} style={{ color: "var(--earth-dark)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </FieldBlock>

      <div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{
          background: "var(--console-canvas)",
          border: "1px solid var(--console-border)",
        }}
      >
        <div
          className="h-9 w-9 shrink-0 rounded-md flex items-center justify-center"
          style={{
            background: "var(--console-panel-strong)",
            color: "var(--console-accent)",
          }}
        >
          <Wifi size={16} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Low-bandwidth deployment</div>
          <div
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: "var(--console-fg-muted)" }}
          >
            Optimize for 2G/3G connections. Reduces image weight, defers
            non-critical assets, and uses text-first dashboards in the field app.
          </div>
        </div>
        <Toggle
          checked={state.lowBandwidth}
          onChange={(v) => update("lowBandwidth", v)}
          label="Toggle low-bandwidth mode"
        />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-colors"
      style={{
        width: 36,
        height: 20,
        background: checked ? "var(--earth-dark)" : "var(--console-border)",
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
        style={{
          transform: `translateX(${checked ? 18 : 2}px)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

/* Simplified SVG world map — clickable region overlays. Not geo-accurate;
 * just enough to give an interactive feel without pulling a heavy lib. */
function WorldMap({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const fill = (id: string) =>
    selected.includes(id)
      ? "var(--earth-dark)"
      : "color-mix(in oklab, var(--console-fg) 8%, transparent)";
  const stroke = "var(--console-border)";

  return (
    <svg
      viewBox="0 0 800 380"
      className="w-full h-auto"
      role="img"
      aria-label="World regions selector"
    >
      {/* Backdrop */}
      <rect width="800" height="380" fill="transparent" />

      {/* Latin America */}
      <RegionShape
        id="latam"
        d="M180 180 Q150 200 160 250 L180 320 Q200 350 230 340 L260 300 Q280 250 270 210 L240 180 Z"
        fill={fill("latam")}
        stroke={stroke}
        onClick={() => onToggle("latam")}
        label="Latin America"
      />
      {/* Caribbean */}
      <RegionShape
        id="caribbean"
        d="M225 165 q15 -8 30 0 q5 8 -5 14 q-15 6 -28 -2 z"
        fill={fill("caribbean")}
        stroke={stroke}
        onClick={() => onToggle("caribbean")}
        label="Caribbean"
      />
      {/* North Africa */}
      <RegionShape
        id="africa-north"
        d="M375 160 L470 160 L480 195 L390 195 Z"
        fill={fill("africa-north")}
        stroke={stroke}
        onClick={() => onToggle("africa-north")}
        label="North Africa"
      />
      {/* West Africa */}
      <RegionShape
        id="africa-west"
        d="M360 200 L420 200 L425 245 L370 250 Z"
        fill={fill("africa-west")}
        stroke={stroke}
        onClick={() => onToggle("africa-west")}
        label="West Africa"
      />
      {/* East Africa */}
      <RegionShape
        id="africa-east"
        d="M430 200 L480 200 L485 260 L440 265 Z"
        fill={fill("africa-east")}
        stroke={stroke}
        onClick={() => onToggle("africa-east")}
        label="East Africa"
      />
      {/* Southern Africa */}
      <RegionShape
        id="africa-south"
        d="M390 270 L470 270 L460 320 L405 325 Z"
        fill={fill("africa-south")}
        stroke={stroke}
        onClick={() => onToggle("africa-south")}
        label="Southern Africa"
      />
      {/* MENA */}
      <RegionShape
        id="mena"
        d="M490 145 L560 145 L570 185 L495 190 Z"
        fill={fill("mena")}
        stroke={stroke}
        onClick={() => onToggle("mena")}
        label="Middle East & N. Africa"
      />
      {/* South Asia */}
      <RegionShape
        id="south-asia"
        d="M580 165 L640 165 L645 220 L585 225 Z"
        fill={fill("south-asia")}
        stroke={stroke}
        onClick={() => onToggle("south-asia")}
        label="South Asia"
      />
      {/* SE Asia */}
      <RegionShape
        id="se-asia"
        d="M650 215 L720 215 L725 265 L655 270 Z"
        fill={fill("se-asia")}
        stroke={stroke}
        onClick={() => onToggle("se-asia")}
        label="Southeast Asia"
      />
      {/* East Asia */}
      <RegionShape
        id="east-asia"
        d="M650 140 L740 140 L745 200 L660 205 Z"
        fill={fill("east-asia")}
        stroke={stroke}
        onClick={() => onToggle("east-asia")}
        label="East Asia"
      />
    </svg>
  );
}

function RegionShape({
  id,
  d,
  fill,
  stroke,
  onClick,
  label,
}: {
  id: string;
  d: string;
  fill: string;
  stroke: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <path
      id={id}
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      onClick={onClick}
      role="button"
      aria-label={label}
      style={{ cursor: "pointer", transition: "fill 200ms" }}
    >
      <title>{label}</title>
    </path>
  );
}

/* ----------------------------- STEP 3 ----------------------------- */

function Step3({
  state,
  update,
}: {
  state: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("Data Manager");

  const add = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    if (state.team.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())) return;
    update("team", [
      ...state.team,
      { id: crypto.randomUUID?.() ?? String(Date.now()), email: trimmed, role },
    ]);
    setEmail("");
  };

  const remove = (id: string) =>
    update("team", state.team.filter((m) => m.id !== id));

  return (
    <div className="space-y-6">
      <FieldBlock
        label="Add team members"
        helper="They'll receive an invite to set up their console access."
      >
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="colleague@ministry.gov"
            className="flex-1 rounded-md px-3 text-sm outline-none transition-colors"
            style={{
              height: 40,
              background: "var(--console-canvas)",
              border: "1px solid var(--console-border)",
              color: "var(--console-fg)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--console-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--console-border)")}
          />
          <RoleSelect value={role} onChange={setRole} />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 text-sm font-medium transition-colors"
            style={{
              height: 40,
              background: "var(--console-fg)",
              color: "var(--console-bg)",
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </FieldBlock>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "var(--console-canvas)",
          border: "1px solid var(--console-border)",
        }}
      >
        {state.team.length === 0 ? (
          <div
            className="px-4 py-8 text-center text-sm"
            style={{ color: "var(--console-fg-faint)" }}
          >
            No team members yet. Add one above or skip for now.
          </div>
        ) : (
          <ul>
            {state.team.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--console-border)",
                }}
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-medium"
                  style={{
                    background: "var(--console-panel-strong)",
                    color: "var(--console-fg-muted)",
                  }}
                >
                  {m.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{m.email}</div>
                </div>
                <span
                  className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--console-panel)",
                    color: "var(--console-fg-muted)",
                  }}
                >
                  {m.role}
                </span>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  aria-label={`Remove ${m.email}`}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: "var(--console-fg-faint)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--console-danger)";
                    e.currentTarget.style.background = "var(--console-panel)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--console-fg-faint)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => update("team", [])}
          className="text-xs underline underline-offset-2"
          style={{ color: "var(--console-fg-faint)" }}
        >
          Skip for now — I'll invite my team later
        </button>
      </div>
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
}: {
  value: Role;
  onChange: (v: Role) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        className="appearance-none rounded-md px-3 pr-9 text-sm outline-none transition-colors"
        style={{
          height: 40,
          background: "var(--console-canvas)",
          border: "1px solid var(--console-border)",
          color: "var(--console-fg)",
        }}
      >
        <option>Admin</option>
        <option>Data Manager</option>
        <option>Viewer</option>
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--console-fg-muted)" }}
      />
    </div>
  );
}

/* ----------------------------- STEP 4 ----------------------------- */

function Step4({
  state,
  update,
}: {
  state: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-7">
      <FieldBlock
        label="Deployment API key"
        helper="Use this in your data pipeline integrations. Save it now — it won't be shown in full again."
      >
        <div
          className="rounded-md p-3 flex items-center gap-2"
          style={{
            background: "var(--console-panel)",
            border: "1px solid var(--console-border)",
          }}
        >
          <code
            className="flex-1 break-all"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--console-fg)",
            }}
          >
            {state.apiKey}
          </code>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: copied ? "var(--console-success)" : "var(--console-fg)",
              color: copied ? "#fff" : "var(--console-bg)",
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy key"}
          </button>
        </div>
      </FieldBlock>

      <FieldBlock
        label="Webhook URL"
        htmlFor="webhook"
        helper="Where should we send pipeline status notifications? Optional."
      >
        <input
          id="webhook"
          type="url"
          value={state.webhookUrl}
          onChange={(e) => update("webhookUrl", e.target.value)}
          placeholder="https://your-org.example.com/webhooks/unmapped"
          className="w-full rounded-md px-3 text-sm outline-none transition-colors font-mono"
          style={{
            height: 40,
            background: "var(--console-canvas)",
            border: "1px solid var(--console-border)",
            color: "var(--console-fg)",
            fontSize: 13,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--console-accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--console-border)")}
        />
      </FieldBlock>

      <label
        className="flex items-start gap-3 rounded-md p-4 cursor-pointer transition-colors"
        style={{
          background: state.ackKey
            ? "color-mix(in oklab, var(--earth) 8%, var(--console-canvas))"
            : "var(--console-canvas)",
          border: state.ackKey
            ? "1px solid var(--earth-dark)"
            : "1px solid var(--console-border)",
        }}
      >
        <input
          type="checkbox"
          checked={state.ackKey}
          onChange={(e) => update("ackKey", e.target.checked)}
          className="sr-only"
        />
        <span
          className="mt-0.5 h-4 w-4 rounded shrink-0 flex items-center justify-center"
          style={{
            background: state.ackKey ? "var(--earth-dark)" : "transparent",
            border: state.ackKey
              ? "1px solid var(--earth-dark)"
              : "1px solid var(--console-border)",
            color: "var(--earth-light)",
          }}
        >
          {state.ackKey && <Check size={11} strokeWidth={2.5} />}
        </span>
        <div className="text-sm leading-relaxed">
          I understand this key grants{" "}
          <strong>write access to my deployment</strong>. I will store it securely
          and never commit it to source control.
        </div>
      </label>
    </div>
  );
}

/* ----------------------------- shared ----------------------------- */

function FieldBlock({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--console-fg)" }}
      >
        {label}
      </label>
      {children}
      {helper && (
        <p
          className="mt-1.5 text-xs leading-relaxed"
          style={{ color: "var(--console-fg-faint)" }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}