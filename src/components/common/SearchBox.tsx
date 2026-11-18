"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

interface Props {
  autoFocus?: boolean;
}

export function SearchBox({ autoFocus = false }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    startTransition(() => {
      const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
      router.push(next);
    });
  }

  return (
    <form onSubmit={submit} role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        Search sarees
      </label>
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for Kalyani Sarees, Pure Cotton, Aarani Silk…"
        className="w-full rounded-full border border-purple-200 bg-purple-50/40 py-3 pl-11 pr-24 text-sm text-slate-800 placeholder:text-purple-900/40 outline-none transition-all hover:bg-white focus:border-transparent focus:bg-white focus:ring-2 focus:ring-brand-purple shadow-inner"
      />
      <button
        type="submit"
        disabled={pending}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand-deep hover:bg-brand-purple px-5 py-2 text-xs font-medium text-white transition-all shadow-sm disabled:opacity-60"
      >
        {pending ? "…" : "Search"}
      </button>
    </form>
  );
}
