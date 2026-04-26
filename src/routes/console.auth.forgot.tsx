import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/console/auth/forgot")({
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--console-bg)", color: "var(--console-fg)" }}
    >
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-8">
          <Compass size={18} strokeWidth={1.5} style={{ color: "var(--console-accent)" }} />
          <span className="font-display text-base tracking-tight">UNMAPPED Console</span>
        </div>
        <h2 className="font-display text-2xl tracking-tight">Reset your password</h2>
        <p className="mt-1.5 text-sm" style={{ color: "var(--console-fg-muted)" }}>
          We'll email you a link to set a new password.
        </p>

        {sent ? (
          <div
            className="mt-7 rounded-md p-4 text-sm"
            style={{
              background: "var(--console-panel)",
              border: "1px solid var(--console-border)",
            }}
          >
            Check <strong>{email}</strong> for a reset link. You can close this tab.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <input
              type="email"
              required
              placeholder="you@ministry.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link
          to="/console/auth/sign-in"
          className="mt-6 inline-block text-xs underline-offset-2 hover:underline"
          style={{ color: "var(--console-fg-muted)" }}
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}