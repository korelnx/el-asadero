"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <a href="/" className="inline-flex items-center gap-3 justify-center">
            <div className="w-10 h-10 border border-primary flex items-center justify-center">
              <span className="text-primary text-lg font-serif">AP</span>
            </div>
            <span className="text-xl font-serif tracking-wide">African Paradise</span>
          </a>
          <p className="text-foreground-muted text-sm">Reset your password</p>
        </div>

        <div className="bg-card border border-border p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-green-400 text-sm">
                Check your email for a password reset link.
              </p>
              <a href="/login" className="text-primary text-sm hover:underline">
                Back to sign in
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-foreground-muted">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-foreground-muted">
          <a href="/login" className="text-primary hover:underline">Back to sign in</a>
        </p>
      </div>
    </div>
  );
}
