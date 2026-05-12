import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const supabase    = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("order")
    .select("*")
    .eq("orderCode", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if ((order.userId as string) !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: items } = await supabase
    .from("order_item")
    .select("*")
    .eq("orderId", order.id);

  const { data: screenshots } = await supabase
    .from("payment_screenshot")
    .select("*")
    .eq("orderId", order.id);

  return NextResponse.json({
    ...order,
    items:       items ?? [],
    screenshots: screenshots ?? [],
  });
}
