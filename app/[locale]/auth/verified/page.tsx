"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function VerifiedPage() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="mb-2 text-xl font-semibold text-foreground">Email Verified!</h1>
          <p className="mb-6 text-sm text-muted">
            Your account has been verified successfully.
          </p>

          <p className="mb-6 text-xs text-muted">
            {count > 0 ? `Redirecting in ${count}…` : "Redirecting…"}
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded bg-primary px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary-hover"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
