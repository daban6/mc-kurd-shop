import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const userId   = session.user.id;
  const now      = new Date().toISOString();

  const { data: downloads, error: downloadsError } = await supabase
    .from("download")
    .select("token, orderItemId, expiresAt")
    .eq("userId", userId)
    .gt("expiresAt", now);

  if (downloadsError) {
    return NextResponse.json({ error: downloadsError.message }, { status: 500 });
  }
  if (!downloads || downloads.length === 0) return NextResponse.json([]);

  const orderItemIds = downloads.map((d) => d.orderItemId as string);

  const { data: orderItems } = await supabase
    .from("order_item")
    .select("id, productId")
    .in("id", orderItemIds);

  const productIds = [...new Set((orderItems ?? []).map((i) => i.productId as string))];
  const productNameById: Record<string, string> = {};

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("product")
      .select("id, nameEn")
      .in("id", productIds);

    for (const p of products ?? []) {
      productNameById[p.id as string] = p.nameEn as string;
    }
  }

  const productByOrderItem: Record<string, string> = {};
  for (const item of orderItems ?? []) {
    productByOrderItem[item.id as string] = item.productId as string;
  }

  const result = downloads.map((d) => ({
    token:       d.token,
    expiresAt:   d.expiresAt,
    productName: productNameById[productByOrderItem[d.orderItemId as string]] ?? "—",
  }));

  return NextResponse.json(result);
}
