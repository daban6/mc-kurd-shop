import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const VALID_STATUSES  = ["pending", "approved", "rejected"];
const VALID_ACTIONS   = ["approve", "reject"] as const;
const ADMIN_ROLES     = ["superAdmin", "contentAdmin", "paymentAdmin"];
type Action = (typeof VALID_ACTIONS)[number];

function groupBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = item[key] as string;
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ADMIN_ROLES.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("order")
    .select("*")
    .order("createdAt", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders, error: ordersError } = await query;

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json([]);
  }

  const orderIds = orders.map((o) => o.id as string);
  const userIds  = [...new Set(orders.map((o) => o.userId as string))];

  const [itemsRes, screenshotsRes, usersRes] = await Promise.all([
    supabase.from("order_item").select("*").in("orderId", orderIds),
    supabase
      .from("payment_screenshot")
      .select("orderId, fileUrl")
      .in("orderId", orderIds),
    supabase.from("user").select("id, name, email").in("id", userIds),
  ]);

  const itemsByOrder = groupBy(
    (itemsRes.data ?? []) as Record<string, unknown>[],
    "orderId"
  );
  const screenshotsByOrder = groupBy(
    (screenshotsRes.data ?? []) as Record<string, unknown>[],
    "orderId"
  );
  const usersById = Object.fromEntries(
    (usersRes.data ?? []).map((u) => [u.id, u])
  );

  const result = orders.map((order) => ({
    ...order,
    user:        usersById[order.userId as string] ?? null,
    items:       itemsByOrder[order.id as string] ?? [],
    screenshots: screenshotsByOrder[order.id as string] ?? [],
  }));

  return NextResponse.json(result);
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ADMIN_ROLES.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { orderId, action } = body as Record<string, unknown>;

  if (typeof orderId !== "string" || !orderId.trim()) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }
  if (!VALID_ACTIONS.includes(action as Action)) {
    return NextResponse.json(
      { error: "action must be approve or reject" },
      { status: 400 }
    );
  }

  const supabase  = createAdminClient();
  const now       = new Date().toISOString();
  const newStatus = action === "approve" ? "approved" : "rejected";

  const { data: order, error: fetchError } = await supabase
    .from("order")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("order")
    .update({ status: newStatus, updatedAt: now })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (action === "approve") {
    const { data: items, error: itemsError } = await supabase
      .from("order_item")
      .select("*")
      .eq("orderId", orderId);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const downloads = (items ?? []).map((item) => ({
      orderItemId: item.id as string,
      userId:      order.userId as string,
      token:       randomBytes(16).toString("hex"),
      expiresAt,
    }));

    if (downloads.length > 0) {
      const { error: downloadError } = await supabase
        .from("download")
        .insert(downloads);

      if (downloadError) {
        return NextResponse.json({ error: downloadError.message }, { status: 500 });
      }
    }

    const { data: user } = await supabase
      .from("user")
      .select("name, email")
      .eq("id", order.userId)
      .single();

    if (user?.email) {
      const resend    = new Resend(process.env.RESEND_API_KEY);
      const expiryDate = new Date(expiresAt).toDateString();
      const tokenList  = downloads
        .map((d, i) => `${i + 1}. ${d.token}  (expires ${expiryDate})`)
        .join("\n");

      await resend.emails.send({
        from:    "noreply@mckurdshop.com",
        to:      user.email,
        subject: "Your order has been approved",
        text: [
          `Hi ${(user.name as string) ?? "there"},`,
          "",
          `Your order ${order.orderCode as string} has been approved.`,
          "",
          "Download tokens:",
          tokenList,
          "",
          "Thank you for your purchase!",
          "— MC Kurd Shop",
        ].join("\n"),
      });
    }
  }

  return NextResponse.json({ success: true });
}
