import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SortOption = "newest" | "price_asc" | "price_desc";
const VALID_SORTS: SortOption[] = ["newest", "price_asc", "price_desc"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get("category")?.trim() ?? null;
  const search       = searchParams.get("search")?.trim().slice(0, 100) ?? null;
  const sort         = searchParams.get("sort") ?? "newest";

  const supabase = createAdminClient();

  // Resolve category slug → id
  let categoryId: string | null = null;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("category")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (!cat) return NextResponse.json([]);
    categoryId = cat.id as string;
  }

  // Build product query
  let query = supabase
    .from("product")
    .select("id, nameEn, nameKu, slug, priceIqd, priceUsd, categoryId, createdAt")
    .eq("published", true);

  if (categoryId) {
    query = query.eq("categoryId", categoryId);
  }

  if (search) {
    // Strip characters that could break the or() filter syntax
    const safe = search.replace(/[,%]/g, " ");
    query = query.or(`nameEn.ilike.%${safe}%,nameKu.ilike.%${safe}%`);
  }

  const validSort = VALID_SORTS.includes(sort as SortOption) ? (sort as SortOption) : "newest";
  switch (validSort) {
    case "price_asc":  query = query.order("priceIqd", { ascending: true });  break;
    case "price_desc": query = query.order("priceIqd", { ascending: false }); break;
    default:           query = query.order("createdAt", { ascending: false }); break;
  }

  const { data: products, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!products || products.length === 0) return NextResponse.json([]);

  const productIds  = products.map((p) => p.id as string);
  const categoryIds = [...new Set(products.map((p) => p.categoryId as string).filter(Boolean))];

  const [categoriesRes, imagesRes] = await Promise.all([
    supabase
      .from("category")
      .select("id, nameEn, nameKu, slug")
      .in("id", categoryIds),
    supabase
      .from("product_image")
      .select("productId, url")
      .in("productId", productIds),
  ]);

  const categoriesById: Record<string, unknown> = Object.fromEntries(
    (categoriesRes.data ?? []).map((c) => [c.id as string, c])
  );

  const firstImageByProduct: Record<string, string> = {};
  for (const img of imagesRes.data ?? []) {
    const pid = img.productId as string;
    if (!firstImageByProduct[pid]) firstImageByProduct[pid] = img.url as string;
  }

  const result = products.map((p) => ({
    ...p,
    category:   categoriesById[p.categoryId as string] ?? null,
    firstImage: firstImageByProduct[p.id as string] ?? null,
  }));

  return NextResponse.json(result);
}
