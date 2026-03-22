"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  mainImageUrl: string | undefined;
  saleLabel?: string | undefined;
}

function IconPackage() {
  return (
    <svg viewBox="0 0 24 24" className="size-16 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 7l8 4 8-4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function IconZoom() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function ProductGallery({
  images,
  productName,
  mainImageUrl,
  saleLabel,
}: ProductGalleryProps) {
  const allImages = useMemo(
    () =>
      images.length > 0
        ? images
        : mainImageUrl
        ? [{ id: "main", url: mainImageUrl, position: 0 }]
        : [],
    [images, mainImageUrl]
  );

  const [selected, setSelected] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-[20px] border border-[#e5e7eb] bg-[#f3f4f6]">
        <div className="flex h-full items-center justify-center">
          <IconPackage />
        </div>
      </div>
    );
  }

  const current = (allImages[selected] ?? allImages[0])!;
  const visibleThumbs = allImages.slice(0, 4);

  return (
    <div>
      <div className="relative mb-4 aspect-square overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-[#f3f4f6]">
        <Image
          src={current.url}
          alt={current.alt_text ?? productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-8"
          priority
        />

        {saleLabel && (
          <span className="absolute left-5 top-5 rounded-lg bg-[#d62828] px-3 py-1.5 font-display text-sm font-bold text-white">
            {saleLabel}
          </span>
        )}

        <button
          type="button"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-lg"
          aria-label="Ampliar imagen"
        >
          <IconZoom />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {visibleThumbs.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelected(i)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f3f4f6] ${
              selected === i ? "border-[#1e3a5f]" : "border-[#e5e7eb]"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt_text ?? `${productName} ${i + 1}`}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          </button>
        ))}

        {allImages.length > 4 && (
          <button
            type="button"
            className="h-20 w-20 shrink-0 rounded-xl border-2 border-[#e5e7eb] bg-[#1e3a5f] font-display text-sm font-bold text-white/80"
          >
            +{allImages.length - 4}
          </button>
        )}
      </div>
    </div>
  );
}
