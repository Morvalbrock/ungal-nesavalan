"use client";
import { Share2 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function WhatsAppShare({
  productName,
  productSlug,
  message
}: {
  productName: string;
  productSlug: string;
  message?: string;
}) {
  const url = `${SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")}/products/${productSlug}`;
  const text = message ?? `Take a look at "${productName}" from Ungal Nesavalan — ${url}`;
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-ink-soft transition hover:border-ink hover:text-ink"
    >
      <Share2 className="h-3.5 w-3.5" /> Share on WhatsApp
    </a>
  );
}
