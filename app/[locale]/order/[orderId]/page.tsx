"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Sword, Clock, Copy, Check, Upload, HelpCircle } from "lucide-react";

interface MethodInfo {
  name: string;
  fullName: string;
  glowColor: string;
  accountNumber: string;
}

const METHOD_INFO: Record<string, MethodInfo> = {
  fib: {
    name: "FIB",
    fullName: "First Iraqi Bank",
    glowColor: "#11998F",
    accountNumber: "07517056835",
  },
  fastpay: {
    name: "FastPay",
    fullName: "FastPay",
    glowColor: "#EE3264",
    accountNumber: "07517056835",
  },
  qicard: {
    name: "QiCard",
    fullName: "QiCard",
    glowColor: "#1D4ED8",
    accountNumber: "07517056835",
  },
  crypto: {
    name: "Crypto",
    fullName: "Cryptocurrency",
    glowColor: "#F7931A",
    accountNumber: "bc1q...wallet-address",
  },
};

interface Order {
  orderCode: string;
  totalIqd: number;
  totalUsd: number;
  paymentMethod: string;
  currency: string;
  status: string;
}

function formatIQD(amount: number) {
  return new Intl.NumberFormat("en-IQ").format(amount) + " IQD";
}

export default function OrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          setLoadError("Order not found.");
          return;
        }
        setOrder(await res.json());
      } catch {
        setLoadError("Failed to load order.");
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  async function handleSubmitProof() {
    if (!selectedFile || uploading || uploadSuccess) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("screenshot", selectedFile);
      const res = await fetch(`/api/orders/${orderId}/screenshot`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUploadError((data as { error?: string }).error ?? "Upload failed. Please try again.");
        return;
      }
      setUploadSuccess(true);
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">{loadError}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const methodInfo = METHOD_INFO[order.paymentMethod] ?? METHOD_INFO.fib;
  const amountDisplay =
    order.currency === "USD"
      ? `$${order.totalUsd.toFixed(2)}`
      : formatIQD(order.totalIqd);
  const amountRaw =
    order.currency === "USD" ? order.totalUsd.toFixed(2) : String(order.totalIqd);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-center gap-1.5">
          <Sword className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">MC Kurd Shop</span>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">Order Placed</span>
          </div>
        </div>

        {/* Payment Method Card */}
        <div
          className="mb-6 rounded border p-4"
          style={{
            borderColor: methodInfo.glowColor,
            boxShadow: `0 0 12px ${methodInfo.glowColor}40, 0 0 4px ${methodInfo.glowColor}20`,
            backgroundColor: "#13131a",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded"
              style={{ backgroundColor: methodInfo.glowColor }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{methodInfo.name}</span>
              <span className="text-xs text-muted">{methodInfo.fullName}</span>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="mb-6 rounded border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">How to Pay</h2>

          <ol className="mb-6 space-y-3">
            {[
              `Open your ${methodInfo.name} app`,
              `Send ${amountDisplay} to account ${methodInfo.accountNumber}`,
              "Take a screenshot of the confirmation",
              "Upload the screenshot below",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ol>

          {/* Copyable Info Boxes */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between rounded border px-3 py-2"
              style={{ backgroundColor: "#0a0a0f", borderColor: methodInfo.glowColor }}
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-muted">Send To</span>
                <span className="font-mono text-sm font-medium text-foreground">
                  {methodInfo.accountNumber}
                </span>
              </div>
              <button
                onClick={() => handleCopy(methodInfo.accountNumber, "sendTo")}
                className="flex h-8 w-8 items-center justify-center rounded bg-surface transition-colors hover:bg-border"
              >
                {copied === "sendTo" ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-muted" />
                )}
              </button>
            </div>

            <div
              className="flex items-center justify-between rounded border px-3 py-2"
              style={{ backgroundColor: "#0a0a0f", borderColor: methodInfo.glowColor }}
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-muted">Amount</span>
                <span className="font-mono text-sm font-medium text-success">{amountDisplay}</span>
              </div>
              <button
                onClick={() => handleCopy(amountRaw, "amount")}
                className="flex h-8 w-8 items-center justify-center rounded bg-surface transition-colors hover:bg-border"
              >
                {copied === "amount" ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-muted" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Screenshot Upload */}
        <div className="mb-6 rounded border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Upload Payment Proof</h2>

          {uploadSuccess ? (
            <div className="flex items-center gap-2 rounded border border-green-500/30 bg-green-500/10 px-3 py-3 text-sm text-green-400">
              <Check className="h-4 w-4 shrink-0" />
              Payment proof submitted! We&apos;ll verify and activate your order shortly.
            </div>
          ) : (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-border px-4 py-8 transition-colors hover:border-primary/50"
              >
                <Upload className="mb-2 h-8 w-8 text-muted" />
                <span className="text-sm text-muted">Click to upload or drag and drop</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="mb-4 flex items-center gap-2 rounded bg-background px-3 py-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="truncate text-sm text-foreground">{selectedFile.name}</span>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {uploadError}
                </div>
              )}

              <button
                onClick={handleSubmitProof}
                disabled={!selectedFile || uploading}
                className={`w-full rounded py-3 text-sm font-semibold transition-colors ${
                  selectedFile && !uploading
                    ? "bg-primary text-foreground hover:bg-primary-hover"
                    : "cursor-not-allowed bg-primary/40 text-foreground/50"
                }`}
              >
                {uploading ? "Uploading…" : "Submit Payment Proof"}
              </button>
            </>
          )}
        </div>

        {/* Order ID Box */}
        <div className="mb-6 flex items-center justify-between rounded border border-border bg-background px-3 py-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-muted">Order ID</span>
            <span className="font-mono text-sm font-medium text-foreground">{order.orderCode}</span>
          </div>
          <button
            onClick={() => handleCopy(order.orderCode, "orderId")}
            className="flex h-8 w-8 items-center justify-center rounded bg-surface transition-colors hover:bg-border"
          >
            {copied === "orderId" ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted" />
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Need help? Contact support</span>
        </div>
      </div>
    </div>
  );
}
