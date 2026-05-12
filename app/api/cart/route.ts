import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId  = session.user.id;
  const supabase = createAdminClient();

  const { data: cart } = await supabase
    .from("cart")
    .select("id")
    .eq("userId", userId)
    .single();

  if (!cart) return NextResponse.json([]);

  const { data: items, error } = await supabase
    .from("cart_item")
    .select("id, productId, addedAt")
    .eq("cartId", cart.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!items || items.length === 0) return NextResponse.json([]);

  const productIds = [...new Set(items.map((i) => i.productId as string))];

  const [productsRes, imagesRes] = await Promise.all([
    supabase
      .from("product")
      .select("id, nameEn, nameKu, slug, priceIqd, priceUsd")
      .in("id", productIds),
    supabase
      .from("product_image")
      .select("productId, url")
      .in("productId", productIds),
  ]);

  const productsById: Record<string, Record<string, unknown>> = Object.fromEntries(
    (productsRes.data ?? []).map((p) => [p.id as string, p as Record<string, unknown>])
  );

  const firstImageByProduct: Record<string, string> = {};
  for (const img of imagesRes.data ?? []) {
    const pid = img.productId as string;
    if (!firstImageByProduct[pid]) firstImageByProduct[pid] = img.url as string;
  }

  const result = items.map((item) => ({
    ...item,
    product: {
      ...(productsById[item.productId as string] ?? {}),
      firstImage: firstImageByProduct[item.productId as string] ?? null,
    },
  }));

  return NextResponse.json(result);
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { productId } = body as Record<string, unknown>;

  if (typeof productId !== "string" || !productId.trim()) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const uid      = session.user.id;
  const pid      = productId.trim();
  const supabase = createAdminClient();

  // Find or create cart
  let cartId: string;

  const { data: existingCart } = await supabase
    .from("cart")
    .select("id")
    .eq("userId", uid)
    .single();

  if (existingCart) {
    cartId = existingCart.id as string;
  } else {
    const { data: newCart, error: cartErr } = await supabase
      .from("cart")
      .insert({ userId: uid })
      .select("id")
      .single();
    if (cartErr || !newCart) {
      return NextResponse.json(
        { error: cartErr?.message ?? "Failed to create cart" },
        { status: 500 }
      );
    }
    cartId = newCart.id as string;
  }

  // Already in cart?
  const { data: existing } = await supabase
    .from("cart_item")
    .select("id")
    .eq("cartId", cartId)
    .eq("productId", pid)
    .single();

  if (existing) {
    return NextResponse.json({ alreadyInCart: true });
  }

  // Insert item
  const { error: insertErr } = await supabase
    .from("cart_item")
    .insert({ cartId, productId: pid });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
