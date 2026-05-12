import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reviews?productId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      "createdAt",
      user:user_id (
        id,
        name
      )
    `)
    .eq("product_id", productId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviews });
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // TODO: Replace with real session user in Phase 9
  const hardcodedUserId = "dVsvseN5gYMuDqfCrnzpnM5Tt5wRhvhW";

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { productId, rating, comment } = body;

  if (!productId || !rating) {
    return NextResponse.json(
      { error: "productId and rating are required" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  // Check if user already reviewed this product
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", hardcodedUserId)
    .single();

  if (existingReview) {
    return NextResponse.json(
      { error: "You have already reviewed this product" },
      { status: 400 }
    );
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: hardcodedUserId,
      rating,
      comment: comment || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }

  return NextResponse.json({ review }, { status: 201 });
}
