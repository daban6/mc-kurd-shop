"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ImageIcon, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "published" | "draft";

interface Product {
  id: string;
  name: string;
  category: string;
  priceIqd: number;
  status: ProductStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: "1", name: "BSL Shaders",       category: "Shaders",  priceIqd: 15000, status: "published" },
  { id: "2", name: "RLCraft Modpack",   category: "Modpacks", priceIqd: 25000, status: "published" },
  { id: "3", name: "Warrior Skin Pack", category: "Skins",    priceIqd: 8000,  status: "draft"     },
];

const statusStyles: Record<ProductStatus, string> = {
  published: "bg-green-500/15 text-green-400",
  draft:     "bg-[#1e1e2e] text-[#71717a]",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#f4f4f5]">Products</h1>
          <p className="mt-0.5 text-sm text-[#71717a]">Manage your digital goods catalog</p>
        </div>
        <Link
          href={"/dashboard/products/new" as never}
          className="flex items-center gap-1.5 rounded bg-[#7c3aed] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#1e1e2e] bg-[#13131a]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-left text-xs text-[#71717a]">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price (IQD)</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {PRODUCTS.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-[#0a0a0f]/50">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-[#1e1e2e] bg-[#0a0a0f]">
                      <ImageIcon className="h-4 w-4 text-[#71717a]" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#f4f4f5]">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-[#71717a]">{product.category}</td>
                  <td className="px-4 py-3 font-medium text-green-400">
                    {product.priceIqd.toLocaleString()} IQD
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[product.status]}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}` as never}
                        className="flex items-center gap-1 rounded bg-[#1e1e2e] px-2.5 py-1 text-xs font-medium text-[#f4f4f5] transition-colors hover:bg-[#7c3aed]/20 hover:text-[#7c3aed]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="flex items-center gap-1 rounded bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-[#1e1e2e] bg-[#13131a] p-6">
            <div className="mb-1 flex items-start justify-between">
              <h2 className="text-base font-semibold text-[#f4f4f5]">Delete Product</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-[#71717a] transition-colors hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-6 text-sm text-[#71717a]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#f4f4f5]">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded border border-[#1e1e2e] bg-transparent px-4 py-2 text-sm font-medium text-[#f4f4f5] transition-colors hover:bg-[#1e1e2e]"
              >
                Cancel
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
