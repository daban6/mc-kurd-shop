"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const HARDCODED_USER_ID = "8LUaQsVuXEqvMUnZIqL5Wl5KkVaEycMX";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartProduct {
  id: string;
  nameEn: string;
  nameKu: string;
  slug: string;
  priceIqd: number;
  priceUsd: number;
  firstImage: string | null;
}

interface CartItem {
  id: string;
  productId: string;
  addedAt: string;
  product: CartProduct;
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string) => Promise<{ alreadyInCart?: boolean }>;
  removeFromCart: (itemId: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,   setItems]   = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res  = await fetch(`/api/cart?userId=${HARDCODED_USER_ID}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId: string) => {
      const res  = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: HARDCODED_USER_ID, productId }),
      });
      const data = await res.json();
      await fetchCart();
      return data as { alreadyInCart?: boolean };
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      await fetchCart();
    },
    [fetchCart]
  );

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount: items.length, addToCart, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
