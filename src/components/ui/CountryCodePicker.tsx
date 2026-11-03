"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES, type Country } from "@/data/countries";

interface CountryCodePickerProps {
  selected: Country;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

export function CountryCodePicker({ selected, onSelect, disabled = false }: CountryCodePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-full items-center gap-1.5 rounded-l-card border border-r-0 border-border bg-cream px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-cream/80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select country dial code"
      >
        <span className="text-base leading-none" role="img" aria-label={selected.name}>
          {selected.flag}
        </span>
        <span className="text-xs font-semibold tracking-wide text-ink tabular-nums">{selected.dialCode}</span>
        <ChevronDown className={`h-3 w-3 text-ink-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-card border border-border bg-white p-2 shadow-elev">
          {/* Search box */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="w-full rounded-md border border-border bg-cream/40 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-ink focus:bg-white"
            />
          </div>

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-border/30">
            {filteredCountries.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-muted">No countries found</p>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === selected.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onSelect(country);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between px-2.5 py-2 text-left text-xs transition hover:bg-cream ${
                      isSelected ? "bg-cream font-medium text-ink" : "text-ink/80"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted tabular-nums">{country.dialCode}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-maroon" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
