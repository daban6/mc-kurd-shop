import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const userId   = session.user.id;

  const { data: orders, error: ordersError } = await supabase
    .from("order")
    .select("id, orderCode, totalIqd, totalUsd, currency, status, createdAt")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }
  if (!orders || orders.length === 0) return NextResponse.json([]);

  const orderIds = orders.map((o) => o.id as string);

  const { data: orderItems } = await supabase
    .from("order_item")
    .select("orderId, productId")
    .in("orderId", orderIds);

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

  const itemsByOrder: Record<string, { nameEn: string }[]> = {};
  for (const item of orderItems ?? []) {
    const oid = item.orderId as string;
    if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
    itemsByOrder[oid].push({ nameEn: productNameById[item.productId as string] ?? "—" });
  }

  const result = orders.map((order) => ({
    orderCode: order.orderCode,
    totalIqd:  order.totalIqd,
    totalUsd:  order.totalUsd,
    currency:  order.currency,
    status:    order.status,
    createdAt: order.createdAt,
    items:     itemsByOrder[order.id as string] ?? [],
  }));

  return NextResponse.json(result);
}
