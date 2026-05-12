"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

interface Props {
  productId: string;
  locale?: string;
}

export default function AddToCartButton({ productId, locale }: Props) {
  const { addToCart } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const isKurdish = locale === "ku";

  async function handleClick() {
    if (state !== "idle") return;
    setState("adding");
    try {
      await addToCart(productId);
      setState("added");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={state === "adding"}
    >
      {state === "added" ? (
        <>
          <Check className="h-4 w-4" />
          {isKurdish ? "زیادکرا!" : "Added!"}
        </>
      ) : state === "adding" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isKurdish ? "زیادکردن..." : "Adding…"}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {isKurdish ? "زیادکردن بۆ سەبەتە" : "Add to Cart"}
        </>
      )}
    </Button>
  );
}
