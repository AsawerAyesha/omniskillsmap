import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Building2, HeartHandshake, Briefcase, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";

/* C1 Screen A — Console Landing.
 *
 * Pre-login full-viewport split (50/50 desktop). Left: dark institutional
 * brand panel with operator-type selector. Right: warm-white sign-in form
 * with primary "Continue" and a ghost "Create a new deployment" CTA that
 * routes the operator into the onboarding flow.
 *
 * The selected operator type is persisted to sessionStorage so the
 * onboarding flow can prefill Step 1 when the operator clicks
 * "Create a new deployment". */

interface SignInSearch {
  redirect: string;
}

export const Route = createFileRoute("/console/auth/sign-in")({
  validateSearch: (raw): SignInSearch => {
    const r = typeof raw.redirect === "string" ? raw.redirect : "/console";
    // Only accept safe console paths; reject anything that points back at
    // the auth screen or contains nested redirect params (which would
    // otherwise produce an exponential URL loop).
    const safe =
      r.startsWith("/console") &&
      !r.startsWith("/console/auth") &&
      !r.includes("redirect=")
        ? r
        : "/console";
    return { redirect: safe };
  },
  component: ConsoleLanding,
});

type OperatorType = "government" | "ngo" | "employer";

const OPERATOR_CARDS: Array<{
  id: OperatorType;
  title: string;
  blurb: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  {
    id: "government",
    title: "Government ministry",
    blurb: "Deploy for national youth labor programs",
    Icon: Building2,
  },
  {
    id: "ngo",
    title: "NGO / Training provider",
    blurb: "Configure for your beneficiary population",
    Icon: HeartHandshake,
  },
  {
    id: "employer",
    title: "Employer / Sector body",
    blurb: "Map your vacancies to real skills signals",
    Icon: Briefcase,
  },
];

function ConsoleLanding() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useConsoleAuth();

  const [operator, setOperator] = React.useState<OperatorType | null>(() => {
    if (typeof window === "undefined") return null;
    const v = window.sessionStorage.getItem("unmapped:operator-type");
    return (v as OperatorType | null) ?? null;
  });

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && session) {
      void navigate({ to: search.redirect || "/console", replace: true });
    }
  }, [authLoading, session, navigate, search.redirect]);

  const selectOperator = (id: OperatorType) => {
    setOperator(id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("unmapped:operator-type", id);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) {
      setError(err.message || "Could not sign in. Check your credentials.");
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      return;
    }
    void navigate({ to: search.redirect || "/console", replace: true });
  };

  const onCreateDeployment = () => {
    void navigate({ to: "/console/onboarding" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT — dark institutional panel */}
      <aside
        className="md:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16"
        style={{ background: "#111009", color: "#F0EDE8" }}
      >
        <div className="space-y-1.5">
          <div
            className="font-display tracking-tight"
            style={{ fontSize: "32px", color: "#F0EDE8", lineHeight: 1.1 }}
          >
            UNMAPPED
          </div>
          <div
            className="uppercase tracking-[0.18em]"
            style={{ fontSize: "13px", color: "#C4A882" }}
          >
            Infrastructure Console
          </div>
        </div>

        <div className="max-w-md space-y-8 my-12 md:my-0">
          <h1
            className="font-display italic"
            style={{
              fontSize: "22px",
              color: "#F0EDE8",
              lineHeight: 1.35,
              fontVariationSettings: '"opsz" 144',
            }}
          >
            A protocol any institution can deploy.
          </h1>

          <div className="space-y-2.5">
            {OPERATOR_CARDS.map(({ id, title, blurb, Icon }) => {
              const active = operator === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectOperator(id)}
                  aria-pressed={active}
                  className="w-full text-left rounded-md p-4 transition-all duration-200 group flex items-start gap-3"
                  style={{
                    background: active
                      ? "rgba(196,168,130,0.08)"
                      : "rgba(255,255,255,0.025)",
                    border: active
                      ? "1px solid #C4A882"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.borderColor = "rgba(196,168,130,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  <div
                    className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center"
                    style={{
                      background: active ? "#C4A882" : "rgba(196,168,130,0.12)",
                      color: active ? "#111009" : "#C4A882",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: "#F0EDE8" }}
                    >
                      {title}
                      {active && (
                        <Check size={13} style={{ color: "#C4A882" }} />
                      )}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(240,237,232,0.6)" }}
                    >
                      {blurb}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p
          className="max-w-md leading-relaxed"
          style={{ fontSize: "12px", color: "#6B6560" }}
        >
          UNMAPPED is open infrastructure. No vendor lock-in. Your data stays yours.
        </p>
      </aside>

      {/* RIGHT — warm white sign-in */}
      <main
        className="md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16"
        style={{ background: "#FAFAF8", color: "#1A1814" }}
      >
        <div className="w-full max-w-[400px]">
          <h2
            className="font-display tracking-tight"
            style={{ fontSize: "24px", color: "#1A1814" }}
          >
            Sign in to your console
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "rgba(26,24,20,0.6)" }}
          >
            Use your work email to access your deployment.
          </p>

          <form
            onSubmit={onSubmit}
            className={shake ? "mt-7 space-y-3.5 animate-console-shake" : "mt-7 space-y-3.5"}
            noValidate
          >
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-md px-3 text-sm outline-none transition-colors"
                style={{
                  height: 36,
                  border: "1px solid rgba(26,24,20,0.14)",
                  color: "#1A1814",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#7A6548")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(26,24,20,0.14)")
                }
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              right={
                <Link
                  to="/console/auth/forgot"
                  className="text-xs underline-offset-2 hover:underline"
                  style={{ color: "rgba(26,24,20,0.55)" }}
                >
                  Forgot password?
                </Link>
              }
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white rounded-md px-3 pr-10 text-sm outline-none transition-colors"
                  style={{
                    height: 36,
                    border: "1px solid rgba(26,24,20,0.14)",
                    color: "#1A1814",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#7A6548")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(26,24,20,0.14)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded"
                  style={{ color: "rgba(26,24,20,0.45)" }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>

            {error && (
              <div
                role="alert"
                className="text-xs px-3 py-2 rounded-md"
                style={{
                  background: "rgba(192,57,43,0.08)",
                  color: "#9B2D22",
                  border: "1px solid rgba(192,57,43,0.25)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70"
              style={{
                height: 40,
                background: "#7A6548",
                color: "#F5EFE6",
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  e.currentTarget.style.background = "#5E4D36";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#7A6548";
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Signing in…" : "Continue"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="flex-1 h-px" style={{ background: "rgba(26,24,20,0.10)" }} />
              <span
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: "rgba(26,24,20,0.4)" }}
              >
                or
              </span>
              <span className="flex-1 h-px" style={{ background: "rgba(26,24,20,0.10)" }} />
            </div>

            <button
              type="button"
              onClick={onCreateDeployment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors"
              style={{
                height: 40,
                background: "transparent",
                color: "#1A1814",
                border: "1px solid rgba(26,24,20,0.18)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(26,24,20,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Create a new deployment
            </button>
          </form>

          <p
            className="mt-6 text-xs text-center"
            style={{ color: "rgba(26,24,20,0.5)" }}
          >
            Need a deployment key from your organization?{" "}
            <a
              href="mailto:deploy@unmapped.org"
              className="underline underline-offset-2"
              style={{ color: "#7A6548" }}
            >
              Request access
            </a>
          </p>
        </div>
      </main>

      <style>{`
        @keyframes console-shake-kf {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }
        .animate-console-shake { animation: console-shake-kf 380ms cubic-bezier(0.16,1,0.3,1); }
      `}</style>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  right,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className="text-[11px] uppercase tracking-[0.10em] font-medium"
          style={{ color: "rgba(26,24,20,0.55)" }}
        >
          {label}
        </span>
        {right}
      </div>
      {children}
    </label>
  );
}