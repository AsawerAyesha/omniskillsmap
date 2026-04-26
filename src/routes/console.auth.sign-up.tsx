import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";

/* C1 — Console Sign Up.
 *
 * Mirrors the visual language of the sign-in screen (dark institutional left
 * panel, warm-white form panel) but accepts a new email + password and
 * provisions an account via supabase.auth.signUp. The auth.users INSERT
 * trigger automatically grants the new account the `operator` role, so on
 * success the operator lands in /console with full screen access. */

export const Route = createFileRoute("/console/auth/sign-up")({
  component: ConsoleSignUp,
});

function ConsoleSignUp() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useConsoleAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && session) {
      void navigate({ to: "/console", replace: true });
    }
  }, [authLoading, session, navigate]);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      triggerShake();
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }

    setSubmitting(true);
    const redirectUrl = `${window.location.origin}/console`;
    const { error: err, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setSubmitting(false);

    if (err) {
      setError(err.message || "Could not create account. Try again.");
      triggerShake();
      return;
    }
    // With auto-confirm enabled, signUp returns a session immediately.
    if (data.session) {
      void navigate({ to: "/console", replace: true });
    } else {
      // Fallback: confirmation required — surface a friendly message.
      setError(
        "Account created. Check your inbox to confirm your email before signing in.",
      );
    }
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
            OmniSkill
          </div>
          <div
            className="uppercase tracking-[0.18em]"
            style={{ fontSize: "13px", color: "#C4A882" }}
          >
            Infrastructure Console
          </div>
        </div>

        <div className="max-w-md space-y-6 my-12 md:my-0">
          <h1
            className="font-display italic"
            style={{
              fontSize: "26px",
              color: "#F0EDE8",
              lineHeight: 1.3,
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Get a working console in under a minute.
          </h1>

          <ul className="space-y-3" style={{ color: "rgba(240,237,232,0.78)" }}>
            {[
              "Spin up a Ghana, Bangladesh or custom-region context",
              "Connect your data — ILO, World Bank, or your own CSV",
              "Map local credentials to ISCO-08 / ISCED",
              "Publish a hosted URL or embed snippet",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "#C4A882" }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div
            className="rounded-md p-3 flex items-start gap-2.5 mt-6"
            style={{
              background: "rgba(196,168,130,0.08)",
              border: "1px solid rgba(196,168,130,0.25)",
            }}
          >
            <Sparkles size={14} style={{ color: "#C4A882", marginTop: 2 }} />
            <div
              className="text-xs leading-relaxed"
              style={{ color: "rgba(240,237,232,0.78)" }}
            >
              Demo mode: any email works, no inbox check needed. You'll be
              signed in immediately as an operator.
            </div>
          </div>
        </div>

        <p
          className="max-w-md leading-relaxed"
          style={{ fontSize: "12px", color: "#6B6560" }}
        >
          OmniSkill is open infrastructure. No vendor lock-in. Your data stays
          yours.
        </p>
      </aside>

      {/* RIGHT — warm white sign-up */}
      <main
        className="md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16"
        style={{ background: "#FAFAF8", color: "#1A1814" }}
      >
        <div className="w-full max-w-[400px]">
          <h2
            className="font-display tracking-tight"
            style={{ fontSize: "24px", color: "#1A1814" }}
          >
            Create your console account
          </h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(26,24,20,0.6)" }}>
            Use your work email. You'll get instant operator access.
          </p>

          <form
            onSubmit={onSubmit}
            className={
              shake
                ? "mt-7 space-y-3.5 animate-console-shake"
                : "mt-7 space-y-3.5"
            }
            noValidate
          >
            <Field label="Work email" htmlFor="email">
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

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
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

            <Field label="Confirm password" htmlFor="confirm">
              <input
                id="confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              style={{ height: 40, background: "#7A6548", color: "#F5EFE6" }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.background = "#5E4D36";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#7A6548";
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p
            className="mt-6 text-xs text-center"
            style={{ color: "rgba(26,24,20,0.55)" }}
          >
            Already have an account?{" "}
            <Link
              to="/console/auth/sign-in"
              search={{ redirect: "/console" }}
              className="underline underline-offset-2"
              style={{ color: "#7A6548" }}
            >
              Sign in
            </Link>
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
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
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
      </div>
      {children}
    </label>
  );
}
