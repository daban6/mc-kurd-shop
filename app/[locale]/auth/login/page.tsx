"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sword, Mail, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [error,           setError]           = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [unverified,      setUnverified]      = useState(false);
  const [resending,       setResending]       = useState(false);
  const [resendSuccess,   setResendSuccess]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnverified(false);
    setResendSuccess(false);
    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        if (signInError.status === 403) {
          setUnverified(true);
        } else {
          setError(signInError.message ?? "Invalid email or password.");
        }
        return;
      }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendSuccess(false);
    try {
      await authClient.sendVerificationEmail({ email, callbackURL: "/en/auth/verified" });
      setResendSuccess(true);
    } catch {
      // silently ignore — user can try again
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-lg border border-border bg-surface p-8">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Sword className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                MC Kurd Shop
              </span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Welcome Back
            </h1>
            <p className="text-xs text-muted">Sign in to your account</p>
          </div>

          {/* Form */}
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-medium text-muted"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Error / unverified */}
            {unverified ? (
              <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs">
                <p className="mb-2 text-yellow-400">
                  Please verify your email address before signing in.
                </p>
                {resendSuccess ? (
                  <p className="text-green-400">Verification email sent! Check your inbox.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-medium text-primary transition-colors hover:text-primary-hover disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend verification email"}
                  </button>
                )}
              </div>
            ) : error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : null}

            {/* Submit */}
            <Button className="mt-2 w-full" size="default" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
