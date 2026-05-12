import { Link } from "@/i18n/navigation";
import {
  Package,
  Sparkles,
  User,
  Puzzle,
  ShoppingCart,
  ArrowRight,
  Grid3X3,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  modpacks: Package,
  shaders:  Sparkles,
  skins:    User,
  plugins:  Puzzle,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IQ").format(price) + " IQD";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKurdish  = locale === "ku";
  const supabase   = createAdminClient();

  // ── Parallel fetch: categories, featured product rows, product counts
  const [categoriesRes, featuredRes, countsRes] = await Promise.all([
    supabase.from("category").select("*").order("nameEn", { ascending: true }),
    supabase
      .from("product")
      .select("id, nameEn, nameKu, slug, priceIqd, categoryId")
      .eq("published", true)
      .order("createdAt", { ascending: false })
      .limit(6),
    supabase
      .from("product")
      .select("categoryId")
      .eq("published", true),
  ]);

  const dbCategories = categoriesRes.data ?? [];
  const dbProducts   = featuredRes.data ?? [];

  // ── Count published products per category
  const countByCategory: Record<string, number> = {};
  for (const row of countsRes.data ?? []) {
    const cid = row.categoryId as string;
    countByCategory[cid] = (countByCategory[cid] ?? 0) + 1;
  }

  // ── Fetch first image for each featured product
  const productIds = dbProducts.map((p) => p.id as string);
  const firstImageByProduct: Record<string, string> = {};

  if (productIds.length > 0) {
    const { data: imageRows } = await supabase
      .from("product_image")
      .select("productId, url")
      .in("productId", productIds);

    for (const img of imageRows ?? []) {
      const pid = img.productId as string;
      if (!firstImageByProduct[pid]) firstImageByProduct[pid] = img.url as string;
    }
  }

  // ── Build category lookup and augment products
  const categoriesById = Object.fromEntries(
    dbCategories.map((c) => [c.id as string, c])
  );

  const featuredProducts = dbProducts.map((p) => ({
    ...p,
    category:   categoriesById[p.categoryId as string] ?? null,
    firstImage: firstImageByProduct[p.id as string] ?? null,
  }));

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">

      {/* Hero */}
      <section className="border-b border-border bg-surface px-4 py-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight text-foreground text-balance md:text-4xl lg:text-5xl">
              {isKurdish
                ? "باشترین شوێن بۆ کڕینی شتەکانی ماینکرافت"
                : "The Best Place to Buy Minecraft Content"}
            </h1>
            <p className="mt-3 max-w-lg text-sm text-muted md:text-base">
              {isKurdish
                ? "چاوگە، مۆدپاک، پێستە و پلاگینەکان بە نرخی گونجاو"
                : "Shaders, modpacks, skins, and plugins at affordable prices"}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-hover"
              >
                {isKurdish ? "بینینی فرۆشگا" : "Browse Shop"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={"/shop" as never}
                className="inline-flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
              >
                <Grid3X3 className="h-4 w-4" />
                {isKurdish ? "پۆلەکان" : "View Categories"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {isKurdish ? "پۆلەکان" : "Categories"}
            </h2>
            <Link
              href="/shop"
              className="text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              {isKurdish ? "هەموو ببینە" : "View all"}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dbCategories.map((cat) => {
              const Icon  = CATEGORY_ICONS[cat.slug as string] ?? Package;
              const name  = isKurdish ? (cat.nameKu as string) || (cat.nameEn as string) : (cat.nameEn as string);
              const count = countByCategory[cat.id as string] ?? 0;

              return (
                <Link
                  key={cat.id as string}
                  href={`/shop?category=${cat.slug}` as never}
                  className="group flex h-16 items-center gap-3 rounded border border-border bg-surface px-4 transition-colors hover:border-primary/50"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <span className="text-xs text-muted">
                      {count} {isKurdish ? "بەرهەم" : "items"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {isKurdish ? "بەرهەمە تایبەتەکان" : "Featured Products"}
            </h2>
            <Link
              href="/shop"
              className="text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              {isKurdish ? "هەموو ببینە" : "View all"}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featuredProducts.map((product) => {
              const name         = isKurdish
                ? (product.nameKu as string) || (product.nameEn as string)
                : (product.nameEn as string);
              const categoryName = isKurdish
                ? (product.category?.nameKu as string) || (product.category?.nameEn as string)
                : (product.category?.nameEn as string);

              return (
                <Link
                  key={product.id as string}
                  href={`/shop/${product.slug}` as never}
                  className="group flex flex-col overflow-hidden rounded border border-border bg-surface transition-colors hover:border-primary/50"
                >
                  {/* Image */}
                  <div className="h-36 overflow-hidden bg-gradient-to-br from-violet-950/40 to-slate-900">
                    {product.firstImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.firstImage}
                        alt={name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    {categoryName && (
                      <span className="inline-flex w-fit rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {categoryName}
                      </span>
                    )}
                    <h3 className="line-clamp-1 text-sm font-medium text-foreground">
                      {name}
                    </h3>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-semibold text-success">
                        {formatPrice(product.priceIqd as number)}
                      </span>
                      <button className="flex items-center justify-center rounded bg-primary p-1.5 text-foreground transition-colors hover:bg-primary-hover">
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
