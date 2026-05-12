import {
  Star,
  Zap,
  ChevronRight,
  Package,
  Calendar,
  HardDrive,
  Monitor,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ReviewSection from "@/components/shop/ReviewSection";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIqd(amount: number) {
  return new Intl.NumberFormat("en-IQ").format(amount) + " IQD";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className="h-4 w-4"
            fill={i <= Math.floor(rating) ? "#7c3aed" : "none"}
            stroke={i <= Math.ceil(rating) ? "#7c3aed" : "#71717a"}
            opacity={i === Math.ceil(rating) && rating % 1 !== 0 ? 0.5 : 1}
          />
        ))}
      </div>
      <span className="text-sm text-muted">
        {rating} ({reviewCount} reviews)
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isKurdish = locale === "ku";
  const supabase  = createAdminClient();

  // ── Fetch product
  const { data: product } = await supabase
    .from("product")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!product) notFound();

  // ── Parallel: images + category
  const [imagesRes, categoryRes] = await Promise.all([
    supabase
      .from("product_image")
      .select("id, url")
      .eq("productId", product.id)
      .order("sortOrder", { ascending: true }),
    supabase
      .from("category")
      .select("nameEn, nameKu")
      .eq("id", product.categoryId)
      .single(),
  ]);

  const images   = imagesRes.data ?? [];
  const category = categoryRes.data;

  // ── Locale-aware strings
  const name         = isKurdish ? (product.nameKu as string) || (product.nameEn as string) : (product.nameEn as string);
  const description  = isKurdish
    ? (product.descriptionKu as string) || (product.descriptionEn as string)
    : (product.descriptionEn as string);
  const categoryName = isKurdish
    ? (category?.nameKu as string) || (category?.nameEn as string)
    : (category?.nameEn as string);

  // ── Tab content (description uses real data; reviews/changelog stay static)
  const tabList = [
    {
      label: isKurdish ? "وەسف" : "Description",
      value: "description",
      content: (
        <div className="space-y-4 text-sm leading-7 text-muted">
          {description
            ? description.split("\n\n").map((para, i) => <p key={i}>{para}</p>)
            : <p className="text-muted">—</p>
          }
        </div>
      ),
    },
    {
      label: isKurdish ? "ڕەزامەندیەکان" : "Reviews",
      value: "reviews",
      content: <ReviewSection slug={slug} locale={locale} />,
    },
    {
      label: isKurdish ? "گۆڕانکاریەکان" : "Changelog",
      value: "changelog",
      content: (
        <div className="space-y-4 text-sm">
          {[
            { version: "v1.0.2", date: "April 28, 2025",   notes: "Bug fixes and performance improvements." },
            { version: "v1.0.1", date: "March 15, 2025",   notes: "Compatibility update." },
            { version: "v1.0.0", date: "February 2, 2025", notes: "Initial release." },
          ].map((entry, i) => (
            <div key={i} className="flex gap-4">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{entry.version}</span>
                  <span className="text-xs text-muted">{entry.date}</span>
                </div>
                <p className="mt-1 text-muted">{entry.notes}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-foreground">
          {isKurdish ? "سەرەکی" : "Home"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="transition-colors hover:text-foreground">
          {isKurdish ? "فرۆشگا" : "Shop"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Two-column layout */}
      <div className="flex flex-col gap-8 lg:flex-row">

        {/* Left — images (60%) */}
        <div className="flex flex-col gap-3 lg:w-3/5">
          {/* Main image */}
          <div className="flex h-80 items-center justify-center overflow-hidden rounded border border-border bg-gradient-to-br from-violet-950/40 to-slate-900 md:h-96">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0].url as string}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-16 w-16 text-muted opacity-40" />
            )}
          </div>

          {/* Thumbnails — always 4 slots */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => images[i] ?? null).map((img, i) => (
              <div
                key={i}
                className="flex h-20 cursor-pointer items-center justify-center overflow-hidden rounded border border-border bg-gradient-to-br from-violet-950/40 to-slate-900 transition-colors hover:border-primary/50"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url as string}
                    alt={`${name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-muted opacity-40" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — product info (40%) */}
        <div className="flex flex-col gap-4 lg:w-2/5">
          {/* Category badge */}
          {categoryName && <Badge>{categoryName}</Badge>}

          {/* Name */}
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-success">
              {formatIqd(product.priceIqd as number)}
            </span>
            <span className="text-sm text-muted">
              ${(product.priceUsd as number).toFixed(2)} USD
            </span>
          </div>

          {/* Rating (static — no review system yet) */}
          <StarRating rating={4.5} reviewCount={0} />

          {/* Short description */}
          <p className="text-sm leading-6 text-muted line-clamp-4">
            {description || "—"}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <AddToCartButton productId={product.id as string} locale={locale} />
            <Button variant="outline" size="lg" className="w-full">
              <Zap className="h-4 w-4" />
              {isKurdish ? "ئێستا بکڕە" : "Buy Now"}
            </Button>
          </div>

          <div className="border-t border-border" />

          {/* Product details */}
          <ul className="space-y-2.5">
            {[
              { icon: Package,  label: isKurdish ? "وەشان"        : "Version",        value: "—" },
              { icon: Calendar, label: isKurdish ? "دوایین نوێکردن": "Last Updated",   value: formatDate(product.updatedAt as string) },
              { icon: HardDrive,label: isKurdish ? "قەبارەی فایل"  : "File Size",      value: "—" },
              { icon: Monitor,  label: isKurdish ? "گونجاو بە"     : "Compatible With",value: "—" },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </span>
                <span className="font-medium text-foreground">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description" tabs={tabList} />
      </div>
    </div>
  );
}
