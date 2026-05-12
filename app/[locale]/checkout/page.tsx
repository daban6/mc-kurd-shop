"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Sword, Package, Lock, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

const paymentMethods = [
  { id: "fib",     name: "FIB",     fullName: "First Iraqi Bank", glowColor: "#11998F", logo: "/payment/fib.png"     },
  { id: "fastpay", name: "FastPay", fullName: "FastPay",          glowColor: "#EE3264", logo: "/payment/fastpay.png" },
  { id: "qicard",  name: "QiCard",  fullName: "QiCard",           glowColor: "#1D4ED8", logo: "/payment/qicard.png"  },
  { id: "crypto",  name: "Crypto",  fullName: "Cryptocurrency",   glowColor: "#F7931A", logo: "/payment/crypto.png"  },
];

function formatIQD(price: number) {
  return new Intl.NumberFormat("en-IQ").format(price) + " IQD";
}

function formatUSD(price: number) {
  return "$" + price.toFixed(2);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"IQD" | "USD">("IQD");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalIqd = items.reduce((sum, item) => sum + item.product.priceIqd, 0);
  const totalUsd = items.reduce((sum, item) => sum + item.product.priceUsd, 0);

  const canPlaceOrder = items.length > 0 && !!selectedMethod && termsAccepted && !placing;

  async function handlePlaceOrder() {
    if (!canPlaceOrder || !selectedMethod) return;
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          paymentMethod: selectedMethod,
          items: items.map((item) => ({
            productId: item.productId,
            priceIqd: item.product.priceIqd,
            priceUsd: item.product.priceUsd,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to place order. Please try again.");
        return;
      }
      const { orderId } = (await res.json()) as { orderId: string };
      router.push(`/order/${orderId}` as never);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-12 lg:py-12">

        {/* Left Column — Order Summary */}
        <div className="flex-1">
          <div className="mb-6 flex items-center gap-1.5">
            <Sword className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">MC Kurd Shop</span>
          </div>

          <div className="rounded border border-border bg-surface p-4">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Order Summary</h2>

            {items.length === 0 ? (
              <p className="text-sm text-muted">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gradient-to-br from-violet-950/40 to-slate-900">
                      {item.product.firstImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.firstImage}
                          alt={item.product.nameEn}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {item.product.nameEn}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-success">
                      {formatIQD(item.product.priceIqd)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="my-4 border-t border-border" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground">{formatIQD(totalIqd)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Tax</span>
                <span className="text-foreground">{formatIQD(0)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <div className="text-right">
                    <div className="text-base font-bold text-foreground">{formatIQD(totalIqd)}</div>
                    <div className="text-xs text-muted">{formatUSD(totalUsd)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Payment */}
        <div className="flex-1 lg:max-w-md">
          <h1 className="mb-6 text-xl font-bold text-foreground">Complete Your Order</h1>

          {/* Currency Switcher */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-foreground">Currency</h3>
            <div className="inline-flex items-center rounded border border-border bg-surface text-xs">
              <button
                onClick={() => setCurrency("IQD")}
                className={`px-3 py-1.5 transition-colors ${
                  currency === "IQD"
                    ? "bg-violet-600 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                IQD
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 transition-colors ${
                  currency === "USD"
                    ? "bg-violet-600 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                USD
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="relative flex flex-col items-center gap-2 rounded border p-4 transition-all"
                    style={{
                      borderColor: isSelected ? method.glowColor : "#1e1e2e",
                      boxShadow: isSelected
                        ? `0 0 12px ${method.glowColor}40, 0 0 4px ${method.glowColor}20`
                        : "none",
                      backgroundColor: "#13131a",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={method.logo} alt={method.name} className="h-8 w-8 object-contain" />
                    <span className="text-xs font-medium text-foreground">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="mb-6">
            <label className="flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    termsAccepted ? "border-primary bg-primary" : "border-border bg-surface"
                  }`}
                >
                  {termsAccepted && <Check className="h-3 w-3 text-foreground" />}
                </div>
              </div>
              <span className="text-xs text-muted">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder}
            className={`w-full rounded py-3 text-sm font-semibold transition-colors ${
              canPlaceOrder
                ? "bg-primary text-foreground hover:bg-primary-hover"
                : "cursor-not-allowed bg-primary/40 text-foreground/50"
            }`}
          >
            {placing ? "Placing Order…" : "Place Order"}
          </button>

          {/* Secure Checkout */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
