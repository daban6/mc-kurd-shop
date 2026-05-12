import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Currency = "IQD" | "USD";
type PaymentMethod = "fib" | "fastpay" | "qicard" | "crypto";

interface OrderItem {
  productId: string;
  priceIqd: number;
  priceUsd: number;
}

const CURRENCIES: Currency[]           = ["IQD", "USD"];
const PAYMENT_METHODS: PaymentMethod[] = ["fib", "fastpay", "qicard", "crypto"];
const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateOrderId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return `MCK-${date}-${suffix}`;
}

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

  const { currency, paymentMethod, items } = body as Record<string, unknown>;

  if (!CURRENCIES.includes(currency as Currency)) {
    return NextResponse.json({ error: "currency must be IQD or USD" }, { status: 400 });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    return NextResponse.json({ error: "paymentMethod must be fib, fastpay, qicard, or crypto" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
  }

  const sanitizedItems: OrderItem[] = [];
  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      return NextResponse.json({ error: "Each item must be an object" }, { status: 400 });
    }
    const { productId, priceIqd, priceUsd } = item as Record<string, unknown>;
    if (typeof productId !== "string" || !productId.trim()) {
      return NextResponse.json({ error: "Each item requires a productId string" }, { status: 400 });
    }
    if (typeof priceIqd !== "number" || priceIqd < 0) {
      return NextResponse.json({ error: "Each item requires a non-negative priceIqd number" }, { status: 400 });
    }
    if (typeof priceUsd !== "number" || priceUsd < 0) {
      return NextResponse.json({ error: "Each item requires a non-negative priceUsd number" }, { status: 400 });
    }
    sanitizedItems.push({ productId: productId.trim(), priceIqd, priceUsd });
  }

  const totalIqd  = sanitizedItems.reduce((sum, i) => sum + i.priceIqd, 0);
  const totalUsd  = sanitizedItems.reduce((sum, i) => sum + i.priceUsd, 0);
  const orderCode = generateOrderId();
  const now       = new Date().toISOString();
  const supabase  = createAdminClient();

  const { data: orderRow, error: orderError } = await supabase
    .from("order")
    .insert({
      orderCode,
      userId: session.user.id,
      status: "pending",
      currency,
      paymentMethod,
      totalIqd,
      totalUsd,
      createdAt: now,
      updatedAt: now,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    return NextResponse.json({ error: orderError?.message ?? "Insert failed" }, { status: 500 });
  }

  const orderItems = sanitizedItems.map((item) => ({
    orderId:   orderRow.id,
    productId: item.productId,
    priceIqd:  item.priceIqd,
    priceUsd:  item.priceUsd,
  }));

  const { error: itemsError } = await supabase.from("order_item").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ orderId: orderCode }, { status: 201 });
}
