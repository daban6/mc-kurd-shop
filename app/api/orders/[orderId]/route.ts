import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("order")
    .select("*")
    .eq("orderCode", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_item")
    .select("*")
    .eq("orderId", orderId);

  const { data: screenshots } = await supabase
    .from("payment_screenshot")
    .select("*")
    .eq("orderId", orderId);

  return NextResponse.json({
    ...order,
    items: items ?? [],
    screenshots: screenshots ?? [],
  });
}
