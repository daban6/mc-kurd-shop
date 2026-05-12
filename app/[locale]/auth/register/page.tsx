"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sword, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToPrivacy) {
      setError("You must agree to the Privacy Policy and Terms of Service.");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({ email, password, name });
      if (signUpError) {
        setError(signUpError.message ?? "Registration failed. Please try again.");
        return;
      }
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
              Create Account
            </h1>
            <p className="text-xs text-muted">Join MC Kurd Shop today</p>
          </div>

          {/* Form */}
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="username"
                  type="text"
                  placeholder="CraftMaster99"
                  autoComplete="username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted"
                htmlFor="email"
              >
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
              <label
                className="text-xs font-medium text-muted"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Privacy Policy Checkbox */}
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              <span className="text-xs text-muted">
                I agree to the{" "}
                <Link href="/privacy" className="text-primary hover:text-primary-hover transition-colors">
                  Privacy Policy
                </Link>
                {" "}and{" "}
                <Link href="/terms" className="text-primary hover:text-primary-hover transition-colors">
                  Terms of Service
                </Link>
              </span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            {/* Submit */}
            <Button className="mt-2 w-full" size="default" disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Login link */}
          <p className="text-center text-xs text-muted">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
