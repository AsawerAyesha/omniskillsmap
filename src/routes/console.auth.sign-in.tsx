import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Compass, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConsoleAuth } from "@/components/unmapped/console/auth-context";

/* C0 — Sign in to Console.
 *
 * Two-column layout. Left: brand wash with institutional tagline. Right:
 * email/password + Google sign-in. After success the user is redirected to
 * the `redirect` search param (or /console). Already-authenticated visits
 * are short-circuited away. All surfaces use --console-* tokens so all
 * three themes resolve. */

interface SignInSearch {
  redirect: string;
}

export const Route = createFileRoute("/console/auth/sign-in")({
  validateSearch: (raw): SignInSearch => ({
    redirect: typeof raw.redirect === "string" ? raw.redirect : "/console",
  }),
  component: SignInPage,
});

function SignInPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useConsoleAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  // Already signed in → bounce to redirect target
  React.useEffect(() => {
    if (!authLoading && session) {
      void navigate({ to: search.redirect || "/console", replace: true });
    }
  }, [authLoading, session, navigate, search.redirect]);

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

  const onGoogle = async () => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}${search.redirect || "/console"}`
            : undefined,
      },
    });
    if (err) setError(err.message);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--console-bg)", color: "var(--console-fg)" }}
    >
      {/* Left brand panel (5/12) */}
      <aside
        className="hidden md:flex md:w-5/12 lg:w-[42%] flex-col justify-between p-10 lg:p-14"
        style={{
          background: "var(--console-accent-wash)",
          color: "var(--console-accent-fg)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Compass size={22} strokeWidth={1.5} />
          <span className="font-display text-lg tracking-tight">UNMAPPED Console</span>
        </div>

        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-3xl lg:text-4xl leading-[1.1] tracking-tight">
            Skills intelligence for ministries and partners.
          </h1>
          <p className="text-sm opacity-80 leading-relaxed">
            Configure programs, monitor cohorts, and publish opportunities backed
            by sourced ILOSTAT and World Bank signals.
          </p>
          <div
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.10)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--console-success)" }}
            />
            Cached · ILOSTAT 2024 · WDI 2023
          </div>
        </div>

        <div className="text-[11px] opacity-60 tracking-wide">
          Civic Compass · v0.1
        </div>
      </aside>

      {/* Right form column */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <Compass size={18} strokeWidth={1.5} style={{ color: "var(--console-accent)" }} />
            <span className="font-display text-base tracking-tight">UNMAPPED Console</span>
          </div>

          <h2 className="font-display text-2xl tracking-tight">Sign in to Console</h2>
          <p className="mt-1.5 text-sm" style={{ color: "var(--console-fg-muted)" }}>
            Use your work email or Google account.
          </p>

          <form
            onSubmit={onSubmit}
            className={shake ? "mt-7 space-y-4 animate-shake" : "mt-7 space-y-4"}
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
                className="w-full bg-transparent rounded-md px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  border: "1px solid var(--console-border)",
                  color: "var(--console-fg)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--console-accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--console-border)")
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
                  style={{ color: "var(--console-fg-muted)" }}
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
                  className="w-full bg-transparent rounded-md px-3 py-2.5 pr-10 text-sm outline-none transition-colors"
                  style={{
                    border: "1px solid var(--console-border)",
                    color: "var(--console-fg)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--console-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--console-border)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded"
                  style={{ color: "var(--console-fg-faint)" }}
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
                  background: "rgba(192,57,43,0.10)",
                  color: "var(--console-danger)",
                  border: "1px solid rgba(192,57,43,0.30)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-70"
              style={{
                background: "var(--console-accent)",
                color: "var(--console-accent-fg)",
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  e.currentTarget.style.background = "var(--console-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--console-accent)";
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="flex-1 h-px" style={{ background: "var(--console-rule)" }} />
              <span
                className="text-[10px] uppercase tracking-[0.14em]"
                style={{ color: "var(--console-fg-faint)" }}
              >
                or
              </span>
              <span className="flex-1 h-px" style={{ background: "var(--console-rule)" }} />
            </div>

            <button
              type="button"
              onClick={onGoogle}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: "transparent",
                color: "var(--console-fg)",
                border: "1px solid var(--console-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--console-panel)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <GoogleMark />
              Continue with Google
            </button>
          </form>

          <p
            className="mt-8 text-[11px] leading-relaxed"
            style={{ color: "var(--console-fg-faint)" }}
          >
            By continuing you agree to UNMAPPED's data-use policy. Your access
            level is determined by your assigned role; contact your workspace
            admin to request operator or admin permissions.
          </p>
        </div>
      </main>

      <style>{`
        @keyframes console-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }
        .animate-shake { animation: console-shake 380ms cubic-bezier(0.16,1,0.3,1); }
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
          style={{ color: "var(--console-fg-muted)" }}
        >
          {label}
        </span>
        {right}
      </div>
      {children}
    </label>
  );
}

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2c-.4.4 6.6-4.8 6.6-14.7 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}