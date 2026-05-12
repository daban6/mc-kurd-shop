"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sword, Mail, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

const COOLDOWN = 30;

export default function VerifyEmailPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear cooldown interval on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Poll for email verification every 3 seconds
  useEffect(() => {
    const poll = setInterval(async () => {
      const { data: session } = await authClient.getSession();
      if (session?.user?.emailVerified === true) {
        clearInterval(poll);
        router.push("/auth/verified");
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [router]);

  async function handleResend() {
    if (!email || countdown > 0 || sending) return;
    setSending(true);
    setError(null);
    setSent(false);
    try {
      await authClient.sendVerificationEmail({ email, callbackURL: "/en/auth/verified" });
      setSent(true);
      setCountdown(COOLDOWN);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const buttonDisabled = sending || countdown > 0 || !email;
  const buttonLabel    = sending
    ? "Sending…"
    : countdown > 0
    ? `Resend in ${countdown}s…`
    : "Resend email";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <Sword className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              MC Kurd Shop
            </span>
          </div>

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-xl font-semibold text-foreground">Check your inbox</h1>
          <p className="mb-1 text-sm text-muted">
            We sent a verification link to your email. Click it to activate your account.
          </p>
          {email && (
            <p className="mb-8 text-sm font-medium text-foreground">{email}</p>
          )}

          {/* Feedback */}
          {sent  && <p className="mb-4 text-xs text-green-400">Verification email sent! Check your inbox.</p>}
          {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

          {/* Resend button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={buttonDisabled}
            className="w-full rounded bg-primary py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
          </button>

          {/* Back to login */}
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
