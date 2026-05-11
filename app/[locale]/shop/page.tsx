"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Package,
  Sparkles,
  User,
  Puzzle,
  ShoppingCart,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useParams } from "next/navigation";

// Placeholder product data - 12 products
const allProducts = [
  { id: 1, name: "BSL Shaders", category: "Shaders", price: 15000 },
  { id: 2, name: "RLCraft Modpack", category: "Modpacks", price: 25000 },
  { id: 3, name: "Warrior Skin Pack", category: "Skins", price: 8000 },
  { id: 4, name: "EssentialsX Plugin", category: "Plugins", price: 12000 },
  { id: 5, name: "SEUS PTGI Shaders", category: "Shaders", price: 20000 },
  { id: 6, name: "Pixelmon Modpack", category: "Modpacks", price: 30000 },
  { id: 7, name: "Complementary Shaders", category: "Shaders", price: 18000 },
  { id: 8, name: "All The Mods 9", category: "Modpacks", price: 35000 },
  { id: 9, name: "Ninja Skin Bundle", category: "Skins", price: 10000 },
  { id: 10, name: "WorldEdit Plugin", category: "Plugins", price: 15000 },
  { id: 11, name: "Continuum Shaders", category: "Shaders", price: 22000 },
  { id: 12, name: "Vault Hunters Pack", category: "Modpacks", price: 28000 },
];

const categories = [
  { id: "all", name: "All", nameKu: "هەموو", icon: Package },
  { id: "modpacks", name: "Modpacks", nameKu: "مۆدپاکەکان", icon: Package },
  { id: "shaders", name: "Shaders", nameKu: "چاوگەکان", icon: Sparkles },
  { id: "skins", name: "Skins", nameKu: "پێستەکان", icon: User },
  { id: "plugins", name: "Plugins", nameKu: "پلاگینەکان", icon: Puzzle },
];

const sortOptions = [
  { id: "newest", name: "Newest", nameKu: "نوێترین" },
  { id: "price-low", name: "Price: Low to High", nameKu: "نرخ: کەم بۆ زۆر" },
  { id: "price-high", name: "Price: High to Low", nameKu: "نرخ: زۆر بۆ کەم" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IQ").format(price) + " IQD";
}

export default function ShopPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isKurdish = locale === "ku";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.category.toLowerCase() === selectedCategory;
    const matchesMinPrice = !minPrice || product.price >= parseInt(minPrice);
    const matchesMaxPrice = !maxPrice || product.price <= parseInt(maxPrice);
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return b.id - a.id; // newest
  });

  // Active filters for badges
  const activeFilters: { key: string; label: string }[] = [];
  if (selectedCategory !== "all") {
    const cat = categories.find((c) => c.id === selectedCategory);
    activeFilters.push({
      key: "category",
      label: isKurdish ? cat?.nameKu || "" : cat?.name || "",
    });
  }
  if (minPrice) {
    activeFilters.push({
      key: "minPrice",
      label: `Min: ${formatPrice(parseInt(minPrice))}`,
    });
  }
  if (maxPrice) {
    activeFilters.push({
      key: "maxPrice",
      label: `Max: ${formatPrice(parseInt(maxPrice))}`,
    });
  }

  const clearFilter = (key: string) => {
    if (key === "category") setSelectedCategory("all");
    if (key === "minPrice") setMinPrice("");
    if (key === "maxPrice") setMaxPrice("");
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
  };

  // Pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const FilterSidebar = () => (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted">
          {isKurdish ? "گەڕان" : "Search"}
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKurdish ? "گەڕان..." : "Search..."}
            className="w-full rounded border border-border bg-surface py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted">
          {isKurdish ? "پۆل" : "Category"}
        </label>
        <div className="flex flex-col gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 rounded px-2.5 py-1.5 text-left text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <category.icon className="h-4 w-4" />
              {isKurdish ? category.nameKu : category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted">
          {isKurdish ? "مەودای نرخ (IQD)" : "Price Range (IQD)"}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted">
          {isKurdish ? "ڕیزکردن" : "Sort by"}
        </label>
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex w-full items-center justify-between rounded border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground"
          >
            {isKurdish
              ? sortOptions.find((o) => o.id === sortBy)?.nameKu
              : sortOptions.find((o) => o.id === sortBy)?.name}
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          {showSortDropdown && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded border border-border bg-surface py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-2.5 py-1.5 text-left text-sm transition-colors ${
                    sortBy === option.id
                      ? "bg-primary/20 text-primary"
                      : "text-foreground hover:bg-border"
                  }`}
                >
                  {isKurdish ? option.nameKu : option.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-row gap-6 px-6 py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-border pr-5 lg:block">
          <FilterSidebar />
        </aside>

        {/* Mobile Filter Button */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {isKurdish ? "فلتەرەکان" : "Filters"}
          </button>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  {isKurdish ? "فلتەرەکان" : "Filters"}
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="mt-5 w-full rounded bg-primary py-2 text-sm font-medium text-foreground"
              >
                {isKurdish ? "دیتن" : "Apply"}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1 lg:pl-5">
          {/* Results Header */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">
              {sortedProducts.length} {isKurdish ? "بەرهەم" : "products"}
            </span>

            {/* Active Filter Badges */}
            {activeFilters.length > 0 && (
              <>
                <span className="text-muted">|</span>
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-xs text-primary"
                  >
                    {filter.label}
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className="hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  {isKurdish ? "سڕینەوەی هەموو" : "Clear all"}
                </button>
              </>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {paginatedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group flex flex-col overflow-hidden rounded border border-border bg-surface transition-colors hover:border-primary/50"
              >
                {/* Product Image Placeholder */}
                <div className="h-36 bg-gradient-to-br from-violet-950/40 to-slate-900">
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Add to cart logic
                      }}
                      className="flex items-center justify-center rounded bg-primary p-1.5 text-foreground transition-colors hover:bg-primary-hover"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {paginatedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted" />
              <p className="mt-3 text-sm text-muted">
                {isKurdish
                  ? "هیچ بەرهەمێک نەدۆزرایەوە"
                  : "No products found"}
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 text-sm text-violet-400 hover:text-violet-300"
              >
                {isKurdish ? "سڕینەوەی فلتەرەکان" : "Clear filters"}
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-muted transition-colors hover:bg-border hover:text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded text-sm transition-colors ${
                    currentPage === page
                      ? "bg-primary text-foreground"
                      : "border border-border bg-surface text-muted hover:bg-border hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-muted transition-colors hover:bg-border hover:text-foreground disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
