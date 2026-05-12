"use client";

import { useState } from "react";
import { Sword, Package, Lock, Check } from "lucide-react";

// Hardcoded cart items
const cartItems = [
  {
    id: 1,
    name: "BSL Shaders",
    category: "Shaders",
    price: 15000,
    priceUSD: 11.5,
  },
  {
    id: 2,
    name: "RLCraft Modpack",
    category: "Modpacks",
    price: 25000,
    priceUSD: 19.2,
  },
  {
    id: 3,
    name: "Warrior Skin Pack",
    category: "Skins",
    price: 8000,
    priceUSD: 6.15,
  },
];

const paymentMethods = [
  {
    id: "fib",
    name: "FIB",
    fullName: "First Iraqi Bank",
    glowColor: "#11998F",
  },
  {
    id: "fastpay",
    name: "FastPay",
    fullName: "FastPay",
    glowColor: "#EE3264",
  },
  {
    id: "qicard",
    name: "QiCard",
    fullName: "QiCard",
    glowColor: "#1D4ED8",
  },
  {
    id: "crypto",
    name: "Crypto",
    fullName: "Cryptocurrency",
    glowColor: "#F7931A",
  },
];

function formatIQD(price: number) {
  return new Intl.NumberFormat("en-IQ").format(price) + " IQD";
}

function formatUSD(price: number) {
  return "$" + price.toFixed(2);
}

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const subtotalUSD = cartItems.reduce((sum, item) => sum + item.priceUSD, 0);
  const tax = 0;
  const total = subtotal + tax;
  const totalUSD = subtotalUSD;

  const canPlaceOrder = selectedMethod && termsAccepted;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-12 lg:py-12">
        {/* Left Column - Order Summary */}
        <div className="flex-1">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-1.5">
            <Sword className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">MC Kurd Shop</span>
          </div>

          {/* Cart Items */}
          <div className="rounded border border-border bg-surface p-4">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Order Summary</h2>
            
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="h-12 w-12 shrink-0 rounded bg-gradient-to-br from-violet-950/40 to-slate-900">
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-5 w-5 text-muted" />
                    </div>
                  </div>
                  
                  {/* Item Info */}
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="inline-flex w-fit rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Price */}
                  <span className="text-sm font-semibold text-success">
                    {formatIQD(item.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-border" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground">{formatIQD(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Tax</span>
                <span className="text-foreground">{formatIQD(tax)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <div className="text-right">
                    <div className="text-base font-bold text-foreground">{formatIQD(total)}</div>
                    <div className="text-xs text-muted">{formatUSD(totalUSD)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment */}
        <div className="flex-1 lg:max-w-md">
          <h1 className="mb-6 text-xl font-bold text-foreground">Complete Your Order</h1>

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
                    {/* Logo Placeholder */}
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: method.glowColor }}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {method.name}
                    </span>
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
                    termsAccepted
                      ? "border-primary bg-primary"
                      : "border-border bg-surface"
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

          {/* Place Order Button */}
          <button
            disabled={!canPlaceOrder}
            className={`w-full rounded py-3 text-sm font-semibold transition-colors ${
              canPlaceOrder
                ? "bg-primary text-foreground hover:bg-primary-hover"
                : "cursor-not-allowed bg-primary/40 text-foreground/50"
            }`}
          >
            Place Order
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
