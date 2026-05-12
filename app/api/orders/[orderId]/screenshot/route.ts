import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDiscordWebhook } from "@/lib/discord";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file field is required" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "File must be image/jpeg, image/png, or image/webp" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: orderRow } = await supabase
    .from("order")
    .select("id, userId")
    .eq("orderCode", orderId)
    .single();

  if (!orderRow) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if ((orderRow.userId as string) !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orderUuid   = orderRow.id;
  const timestamp   = Date.now();
  const storagePath = `${orderId}/${timestamp}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("payment_screenshot").insert({
    orderId: orderUuid,
    fileUrl: storagePath,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("order")
    .update({ updatedAt: new Date().toISOString() })
    .eq("id", orderUuid);

  await sendDiscordWebhook({
    embeds: [
      {
        title:  "New Payment Screenshot",
        color:  0x7c3aed,
        fields: [{ name: "Order ID", value: orderId, inline: true }],
        timestamp: new Date().toISOString(),
      },
    ],
  });

  return NextResponse.json({ success: true });
}
