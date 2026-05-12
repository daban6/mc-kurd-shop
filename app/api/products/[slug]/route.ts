import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("product")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [categoryRes, imagesRes] = await Promise.all([
    supabase
      .from("category")
      .select("id, nameEn, nameKu, slug")
      .eq("id", product.categoryId)
      .single(),
    supabase
      .from("product_image")
      .select("id, url")
      .eq("productId", product.id),
  ]);

  return NextResponse.json({
    ...product,
    category: categoryRes.data ?? null,
    images:   imagesRes.data ?? [],
  });
}
