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

// Placeholder product data
const products = [
  {
    id: 1,
    name: "BSL Shaders",
    category: "Shaders",
    price: 15000,
    image: "/placeholder-shader.jpg",
  },
  {
    id: 2,
    name: "RLCraft Modpack",
    category: "Modpacks",
    price: 25000,
    image: "/placeholder-modpack.jpg",
  },
  {
    id: 3,
    name: "Warrior Skin Pack",
    category: "Skins",
    price: 8000,
    image: "/placeholder-skin.jpg",
  },
  {
    id: 4,
    name: "EssentialsX Plugin",
    category: "Plugins",
    price: 12000,
    image: "/placeholder-plugin.jpg",
  },
  {
    id: 5,
    name: "SEUS PTGI Shaders",
    category: "Shaders",
    price: 20000,
    image: "/placeholder-shader.jpg",
  },
  {
    id: 6,
    name: "Pixelmon Modpack",
    category: "Modpacks",
    price: 30000,
    image: "/placeholder-modpack.jpg",
  },
];

const categories = [
  {
    id: 1,
    name: "Modpacks",
    nameKu: "مۆدپاکەکان",
    icon: Package,
    count: 24,
  },
  {
    id: 2,
    name: "Shaders",
    nameKu: "چاوگەکان",
    icon: Sparkles,
    count: 18,
  },
  {
    id: 3,
    name: "Skins",
    nameKu: "پێستەکان",
    icon: User,
    count: 56,
  },
  {
    id: 4,
    name: "Plugins",
    nameKu: "پلاگینەکان",
    icon: Puzzle,
    count: 32,
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IQ").format(price) + " IQD";
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKurdish = locale === "ku";

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Hero Section */}
      <section className="border-b border-border bg-surface px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl text-balance">
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
                href="/categories"
                className="inline-flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
              >
                <Grid3X3 className="h-4 w-4" />
                {isKurdish ? "پۆلەکان" : "View Categories"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-b border-border px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {isKurdish ? "پۆلەکان" : "Categories"}
            </h2>
            <Link
              href="/categories"
              className="text-xs text-primary transition-colors hover:text-primary-hover"
            >
              {isKurdish ? "هەموو ببینە" : "View all"}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 rounded border border-border bg-surface p-4 transition-colors hover:border-primary/50"
              >
                <category.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {isKurdish ? category.nameKu : category.name}
                </span>
                <span className="text-xs text-muted">
                  {category.count} {isKurdish ? "بەرهەم" : "items"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {isKurdish ? "بەرهەمە تایبەتەکان" : "Featured Products"}
            </h2>
            <Link
              href="/shop"
              className="text-xs text-primary transition-colors hover:text-primary-hover"
            >
              {isKurdish ? "هەموو ببینە" : "View all"}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded border border-border bg-surface transition-colors hover:border-primary/50"
              >
                {/* Product Image Placeholder */}
                <div className="aspect-square bg-border/50">
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-8 w-8 text-muted" />
                  </div>
                </div>
                {/* Product Info */}
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <span className="inline-flex w-fit rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {product.category}
                  </span>
                  <h3 className="line-clamp-1 text-sm font-medium text-foreground">
                    {product.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs font-semibold text-success">
                      {formatPrice(product.price)}
                    </span>
                    <button className="flex items-center justify-center rounded bg-primary p-1.5 text-foreground transition-colors hover:bg-primary-hover">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
