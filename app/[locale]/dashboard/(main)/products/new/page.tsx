"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, ImagePlus, X, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Modpacks", "Shaders", "Skins", "Plugins"] as const;

// ─── Shared styles ────────────────────────────────────────────────────────────

const input =
  "h-9 w-full rounded border border-[#1e1e2e] bg-[#0a0a0f] px-3 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]";

const label = "mb-1.5 block text-xs font-medium text-[#71717a]";

const divider = <div className="h-px bg-[#1e1e2e]" />;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const [nameEn,    setNameEn]    = useState("");
  const [nameKu,    setNameKu]    = useState("");
  const [descEn,    setDescEn]    = useState("");
  const [descKu,    setDescKu]    = useState("");
  const [category,  setCategory]  = useState("");
  const [priceIqd,  setPriceIqd]  = useState("");
  const [priceUsd,  setPriceUsd]  = useState("");
  const [published, setPublished] = useState(false);
  const [dlFile,    setDlFile]    = useState<File | null>(null);
  const [previews,  setPreviews]  = useState<(string | null)[]>([null, null, null, null]);

  const dlRef  = useRef<HTMLInputElement>(null);
  const img0   = useRef<HTMLInputElement>(null);
  const img1   = useRef<HTMLInputElement>(null);
  const img2   = useRef<HTMLInputElement>(null);
  const img3   = useRef<HTMLInputElement>(null);
  const imgRefs = [img0, img1, img2, img3];

  function pickImage(index: number, file: File) {
    const url = URL.createObjectURL(file);
    setPreviews((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  }

  function removeImage(index: number) {
    setPreviews((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    const ref = imgRefs[index].current;
    if (ref) ref.value = "";
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={"/dashboard/products" as never}
          className="flex items-center gap-1.5 text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-xl font-semibold text-[#f4f4f5]">New Product</h1>
      </div>

      <div className="space-y-6 rounded-lg border border-[#1e1e2e] bg-[#13131a] p-6">

        {/* Names */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Name (English)</label>
            <input
              type="text"
              placeholder="BSL Shaders"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Name (Kurdish)</label>
            <input
              type="text"
              placeholder="بی ئێس ئێل شەیدەرز"
              dir="rtl"
              value={nameKu}
              onChange={(e) => setNameKu(e.target.value)}
              className={input}
            />
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <label className={label}>Description (English)</label>
          <textarea
            placeholder="Describe the product..."
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            rows={4}
            className="w-full resize-none rounded border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>
        <div>
          <label className={label}>Description (Kurdish)</label>
          <textarea
            placeholder="باسی بەرهەم بکە..."
            dir="rtl"
            value={descKu}
            onChange={(e) => setDescKu(e.target.value)}
            rows={4}
            className="w-full resize-none rounded border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>

        {divider}

        {/* Category + Prices */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={label}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${input} cursor-pointer`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Price (IQD)</label>
            <input
              type="number"
              placeholder="15000"
              min={0}
              value={priceIqd}
              onChange={(e) => setPriceIqd(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Price (USD)</label>
            <input
              type="number"
              placeholder="10"
              min={0}
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              className={input}
            />
          </div>
        </div>

        {divider}

        {/* Download file upload */}
        <div>
          <label className={label}>Download File</label>
          <div
            onClick={() => dlRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#1e1e2e] p-8 transition-colors hover:border-[#7c3aed]/50"
          >
            {dlFile ? (
              <div className="flex items-center gap-2 text-sm text-[#f4f4f5]">
                <FileText className="h-5 w-5 text-[#7c3aed]" />
                <span>{dlFile.name}</span>
                <span className="text-[#71717a]">
                  ({(dlFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[#71717a]" />
                <p className="text-sm text-[#71717a]">Click to upload the product file</p>
                <p className="text-xs text-[#71717a]/60">Any file type accepted</p>
              </>
            )}
          </div>
          <input
            ref={dlRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setDlFile(file);
            }}
          />
        </div>

        {/* Image slots */}
        <div>
          <label className={label}>Product Images (up to 4)</label>
          <div className="grid grid-cols-4 gap-3">
            {previews.map((preview, i) => (
              <div key={i} className="relative aspect-square">
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Product image ${i + 1}`}
                      className="h-full w-full rounded-lg border border-[#1e1e2e] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => imgRefs[i].current?.click()}
                    className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#1e1e2e] transition-colors hover:border-[#7c3aed]/50"
                  >
                    <ImagePlus className="h-6 w-6 text-[#71717a]" />
                  </button>
                )}
                <input
                  ref={imgRefs[i]}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) pickImage(i, file);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {divider}

        {/* Published toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#f4f4f5]">Published</p>
            <p className="text-xs text-[#71717a]">
              Make this product visible to customers
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() => setPublished((p) => !p)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              published ? "bg-[#7c3aed]" : "bg-[#1e1e2e]"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                published ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>

        {/* Save */}
        <button
          type="button"
          className="w-full rounded bg-[#7c3aed] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9]"
        >
          Save Product
        </button>

      </div>
    </div>
  );
}
