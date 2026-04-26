import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* Public route — Supabase recovery flow lands here. The user is already
 * signed in by the recovery link; we just collect a new password. */
export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords don't match.");
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    window.setTimeout(() => {
      void navigate({ to: "/console", replace: true });
    }, 1200);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--console-bg)", color: "var(--console-fg)" }}
    >
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-8">
          <Compass size={18} strokeWidth={1.5} style={{ color: "var(--console-accent)" }} />
          <span className="font-display text-base tracking-tight">OmniSkill Console</span>
        </div>
        <h2 className="font-display text-2xl tracking-tight">Set a new password</h2>
        {done ? (
          <p className="mt-4 text-sm" style={{ color: "var(--console-fg-muted)" }}>
            Updated. Redirecting to Console…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <input
              type="password"
              required
              placeholder="New password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full bg-transparent rounded-md px-3 py-2.5 text-sm outline-none"
              style={{
                border: "1px solid var(--console-border)",
                color: "var(--console-fg)",
              }}
            />
            <input
              type="password"
              required
              placeholder="Confirm password"
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full bg-transparent rounded-md px-3 py-2.5 text-sm outline-none"
              style={{
                border: "1px solid var(--console-border)",
                color: "var(--console-fg)",
              }}
            />
            {error && (
              <div
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
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium disabled:opacity-70"
              style={{
                background: "var(--console-accent)",
                color: "var(--console-accent-fg)",
              }}
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}