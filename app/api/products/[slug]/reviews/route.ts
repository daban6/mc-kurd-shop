import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── GET /api/products/[slug]/reviews ─────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase  = createAdminClient();

  const { data: product } = await supabase
    .from("product")
    .select("id")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data: rows } = await supabase
    .from("review")
    .select("id, rating, comment, createdAt, userId")
    .eq("productId", product.id)
    .order("createdAt", { ascending: false });

  const reviews = rows ?? [];

  // Batch fetch user names
  const userIds   = [...new Set(reviews.map((r) => r.userId as string))];
  const nameById: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("user")
      .select("id, name")
      .in("id", userIds);

    for (const u of users ?? []) {
      nameById[u.id as string] = u.name as string;
    }
  }

  const shaped = reviews.map((r) => ({
    id:        r.id,
    rating:    r.rating,
    comment:   r.comment,
    createdAt: r.createdAt,
    userName:  nameById[r.userId as string] ?? null,
  }));

  const averageRating =
    shaped.length > 0
      ? shaped.reduce((sum, r) => sum + (r.rating as number), 0) / shaped.length
      : 0;

  return NextResponse.json({
    reviews:       shaped,
    averageRating: Math.round(averageRating * 10) / 10,
    totalCount:    shaped.length,
  });
}

// ─── POST /api/products/[slug]/reviews ────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const supabase  = createAdminClient();
  const userId    = session.user.id;

  // ── Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { rating, comment } = body as { rating?: unknown; comment?: unknown };

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== "string") {
      return NextResponse.json({ error: "comment must be a string" }, { status: 400 });
    }
    if (comment.length > 500) {
      return NextResponse.json(
        { error: "comment must be 500 characters or fewer" },
        { status: 400 }
      );
    }
  }

  // ── Resolve product
  const { data: product } = await supabase
    .from("product")
    .select("id")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // ── Check approved purchase
  const { data: orderItems } = await supabase
    .from("order_item")
    .select("id, orderId")
    .eq("productId", product.id);

  const orderItemIds = (orderItems ?? []).map((oi) => oi.orderId as string);
  let hasPurchased   = false;

  if (orderItemIds.length > 0) {
    const { data: approvedOrders } = await supabase
      .from("order")
      .select("id")
      .eq("userId", userId)
      .eq("status", "approved")
      .in("id", orderItemIds);

    hasPurchased = (approvedOrders ?? []).length > 0;
  }

  if (!hasPurchased) {
    return NextResponse.json(
      { error: "You must purchase this product before reviewing" },
      { status: 403 }
    );
  }

  // ── Check duplicate review
  const { data: existing } = await supabase
    .from("review")
    .select("id")
    .eq("productId", product.id)
    .eq("userId", userId)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this product" },
      { status: 409 }
    );
  }

  // ── Insert review
  const { error: insertError } = await supabase.from("review").insert({
    productId: product.id,
    userId,
    rating,
    comment: comment ?? null,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
