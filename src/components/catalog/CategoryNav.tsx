"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryNavProps {
  categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category_slug");

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      <Link
        href="/catalogo"
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !activeSlug
            ? "bg-primary-500 text-white shadow-sm"
            : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300 hover:text-primary-700"
        }`}
      >
        Todos
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/catalogo?category_slug=${cat.slug}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeSlug === cat.slug
              ? "bg-primary-500 text-white shadow-sm"
              : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300 hover:text-primary-700"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
