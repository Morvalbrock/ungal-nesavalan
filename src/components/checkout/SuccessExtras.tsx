"use client";
import { useEffect } from "react";
import { Share2, Tag } from "lucide-react";
import { track } from "@/features/analytics/track";
import { formatINR } from "@/lib/utils";

interface Props {
  orderId: string;
  revenuePaise: number;
  couponCode?: string;
  referralCode?: string;
  referralValueLabel?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function SuccessExtras({
  orderId,
  revenuePaise,
  couponCode,
  referralCode,
  referralValueLabel
}: Props) {
  useEffect(() => {
    track.purchase({
      orderId,
      revenueInr: Math.round(revenuePaise / 100),
      couponCode
    });
  }, [orderId, revenuePaise, couponCode]);

  if (!referralCode) return null;

  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl = `${base}/products?ref=${referralCode}`;
  const message = `I just picked up a saree from Ungal Nesavalan. Here's ${referralValueLabel ?? "a discount"} on your first order — use code ${referralCode} at checkout: ${shareUrl}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-card border border-gold/40 bg-gold/5 p-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[10px] uppercase tracking-widest text-ink-soft">
        <Tag className="h-3 w-3" /> Refer & save
      </div>
      <p className="mt-3 font-display text-2xl">Share {referralValueLabel ?? "a treat"} with a friend</p>
      <p className="mt-2 text-sm text-ink-muted">
        They save on their first order. Your code:{" "}
        <span className="rounded bg-cream px-2 py-1 font-mono text-ink">{referralCode}</span>
      </p>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-5 inline-flex"
      >
        <Share2 className="h-4 w-4" /> Share on WhatsApp
      </a>
      <p className="mt-3 text-[11px] text-ink-muted">Order total: {formatINR(revenuePaise)}</p>
    </div>
  );
}
