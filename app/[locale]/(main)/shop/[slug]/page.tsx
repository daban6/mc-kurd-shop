import {
  Star,
  ShoppingCart,
  Zap,
  ChevronRight,
  Package,
  Calendar,
  HardDrive,
  Monitor,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { ReviewsSection } from "@/components/product/ReviewsSection";

const product = {
  name: "BSL Shaders",
  category: "Shaders",
  priceIqd: 15000,
  priceUsd: 11.5,
  rating: 4.5,
  reviewCount: 128,
  description:
    "BSL Shaders is a shaderpack made for Minecraft: Java Edition with high compatibility and optimization. It features beautiful lighting, shadows, reflections, and atmospheric effects that transform the look of Minecraft while keeping performance reasonable.",
  version: "8.2.04",
  lastUpdated: "April 28, 2025",
  fileSize: "2.4 MB",
  compatibleWith: "Minecraft 1.16 – 1.21",
};

function formatIqd(amount: number) {
  return new Intl.NumberFormat("en-IQ").format(amount) + " IQD";
}

function StarRating({ rating }: { rating: number }) {
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
        {rating} ({product.reviewCount} reviews)
      </span>
    </div>
  );
}

const tabContent = {
  description: (
    <div className="space-y-4 text-sm leading-7 text-muted">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo.
      </p>
    </div>
  ),
  changelog: (
    <div className="space-y-4 text-sm">
      {[
        { version: "v8.2.04", date: "April 28, 2025", notes: "Fixed water reflection artifacts. Improved sky rendering on AMD GPUs." },
        { version: "v8.2.03", date: "March 15, 2025", notes: "Performance improvements. Added new cloud settings." },
        { version: "v8.2.02", date: "February 2, 2025", notes: "1.21 compatibility update. Fixed shadow rendering bugs." },
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
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  void slug;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Two-column layout */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left — 60% */}
        <div className="flex flex-col gap-3 lg:w-3/5">
          {/* Main image */}
          <div className="flex h-80 items-center justify-center overflow-hidden rounded border border-border bg-gradient-to-br from-violet-950/40 to-slate-900 md:h-96">
            <Package className="h-16 w-16 text-muted opacity-40" />
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-20 cursor-pointer items-center justify-center overflow-hidden rounded border border-border bg-gradient-to-br from-violet-950/40 to-slate-900 transition-colors hover:border-primary/50"
              >
                <Package className="h-6 w-6 text-muted opacity-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Right — 40% */}
        <div className="flex flex-col gap-4 lg:w-2/5">
          {/* Category badge */}
          <Badge>{product.category}</Badge>

          {/* Product name */}
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-success">
              {formatIqd(product.priceIqd)}
            </span>
            <span className="text-sm text-muted">${product.priceUsd} USD</span>
          </div>

          {/* Star rating */}
          <StarRating rating={product.rating} />

          {/* Short description */}
          <p className="text-sm leading-6 text-muted">{product.description}</p>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button size="lg" className="w-full">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              <Zap className="h-4 w-4" />
              Buy Now
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Product details */}
          <ul className="space-y-2.5">
            {[
              { icon: Package, label: "Version", value: product.version },
              { icon: Calendar, label: "Last Updated", value: product.lastUpdated },
              { icon: HardDrive, label: "File Size", value: product.fileSize },
              { icon: Monitor, label: "Compatible With", value: product.compatibleWith },
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
        <Tabs
          defaultValue="description"
          tabs={[
            { label: "Description", value: "description", content: tabContent.description },
            { 
              label: "Reviews", 
              value: "reviews", 
              content: <ReviewsSection productId="00000000-0000-0000-0000-000000000001" /> 
            },
            { label: "Changelog", value: "changelog", content: tabContent.changelog },
          ]}
        />
      </div>
    </div>
  );
}
