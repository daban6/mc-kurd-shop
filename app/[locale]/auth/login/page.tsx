import { Sword, Mail, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
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
          <form className="w-full space-y-4">
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
                  className="h-10 w-full rounded border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit */}
            <Button className="mt-2 w-full" size="default">
              Sign In
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
