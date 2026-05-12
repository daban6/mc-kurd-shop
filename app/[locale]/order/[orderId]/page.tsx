"use client";

import { useState, useRef } from "react";
import { Sword, Clock, Copy, Check, Upload, HelpCircle } from "lucide-react";

export default function OrderPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Hardcoded order data
  const orderId = "ORD-2024-7X9K3M";
  const amount = "48,000 IQD";
  const sendTo = "07517056835";

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        {/* Header - Logo */}
        <div className="mb-8 flex items-center justify-center gap-1.5">
          <Sword className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">MC Kurd Shop</span>
        </div>

        {/* Order Status Badge */}
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
            borderColor: "#11998F",
            boxShadow: "0 0 12px #11998F40, 0 0 4px #11998F20",
            backgroundColor: "#13131a",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded"
              style={{ backgroundColor: "#11998F" }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">FIB</span>
              <span className="text-xs text-muted">First Iraqi Bank</span>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="mb-6 rounded border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">How to Pay</h2>
          
          <ol className="mb-6 space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                1
              </span>
              <span className="text-sm text-foreground">Open your FIB app</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                2
              </span>
              <span className="text-sm text-foreground">
                Send <span className="font-semibold text-success">{amount}</span> to account{" "}
                <span className="font-semibold">{sendTo}</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                3
              </span>
              <span className="text-sm text-foreground">Take a screenshot of the confirmation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                4
              </span>
              <span className="text-sm text-foreground">Upload the screenshot below</span>
            </li>
          </ol>

          {/* Copyable Info Boxes */}
          <div className="space-y-3">
            {/* Send To */}
            <div
              className="flex items-center justify-between rounded border px-3 py-2"
              style={{
                backgroundColor: "#0a0a0f",
                borderColor: "#11998F",
              }}
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-muted">Send To</span>
                <span className="font-mono text-sm font-medium text-foreground">{sendTo}</span>
              </div>
              <button
                onClick={() => handleCopy(sendTo, "sendTo")}
                className="flex h-8 w-8 items-center justify-center rounded bg-surface transition-colors hover:bg-border"
              >
                {copied === "sendTo" ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-muted" />
                )}
              </button>
            </div>

            {/* Amount */}
            <div
              className="flex items-center justify-between rounded border px-3 py-2"
              style={{
                backgroundColor: "#0a0a0f",
                borderColor: "#11998F",
              }}
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-muted">Amount</span>
                <span className="font-mono text-sm font-medium text-success">{amount}</span>
              </div>
              <button
                onClick={() => handleCopy("48000", "amount")}
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

        {/* Screenshot Upload Section */}
        <div className="mb-6 rounded border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Upload Payment Proof</h2>

          {/* Upload Zone */}
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

          {/* Selected File */}
          {selectedFile && (
            <div className="mb-4 flex items-center gap-2 rounded bg-background px-3 py-2">
              <Check className="h-4 w-4 text-success" />
              <span className="truncate text-sm text-foreground">{selectedFile.name}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={!selectedFile}
            className={`w-full rounded py-3 text-sm font-semibold transition-colors ${
              selectedFile
                ? "bg-primary text-foreground hover:bg-primary-hover"
                : "cursor-not-allowed bg-primary/40 text-foreground/50"
            }`}
          >
            Submit Payment Proof
          </button>
        </div>

        {/* Order ID Box */}
        <div
          className="mb-6 flex items-center justify-between rounded border border-border bg-background px-3 py-2"
        >
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-muted">Order ID</span>
            <span className="font-mono text-sm font-medium text-foreground">{orderId}</span>
          </div>
          <button
            onClick={() => handleCopy(orderId, "orderId")}
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
