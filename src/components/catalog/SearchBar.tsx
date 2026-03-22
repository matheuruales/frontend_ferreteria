"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function SearchBar({ placeholder = "Buscar productos..." }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const updateURL = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      router.push(`/catalogo?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => updateURL(q), 300);
    setDebounceTimer(timer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer) clearTimeout(debounceTimer);
    updateURL(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-300 bg-white/90 py-3 pl-10 pr-4 text-sm shadow-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
        <IconSearch />
      </span>
    </form>
  );
}
