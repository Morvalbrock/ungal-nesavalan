"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, Copy, Mail, MapPin, Phone, Trash2, User } from "lucide-react";
import { dismissAbandonedCart } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";
import type { CartItem } from "@/features/cart/cart.types";
import type { Address } from "@/types/address";

export interface AbandonedCartCardProps {
  cartId: string;
  checkoutUrl: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
  };
  address?: Pick<Address, "fullName" | "line1" | "line2" | "city" | "state" | "pincode" | "country" | "phone">;
  items: CartItem[];
  subtotalPaise: number;
  ageHours: number;
  updatedAt: string;
  notifiedAt?: string;
}

export function AbandonedCartCard({
  cartId,
  checkoutUrl,
  customer,
  address,
  items,
  subtotalPaise,
  ageHours,
  updatedAt,
  notifiedAt
}: AbandonedCartCardProps) {
  const [copied, setCopied] = useState(false);
  const [dismissError, setDismissError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalQty = items.reduce((n, i) => n + i.quantity, 0);
  const ageLabel = ageHours < 1 ? "just now" : ageHours < 24 ? `${ageHours}h ago` : `${Math.floor(ageHours / 24)}d ago`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea");
      el.value = checkoutUrl;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const onDismiss = () => {
    if (!confirm("Dismiss this abandoned cart record? This cannot be undone.")) return;
    setDismissError(null);
    startTransition(async () => {
      const res = await dismissAbandonedCart(cartId);
      if (!res.ok) setDismissError(res.error);
    });
  };

  return (
    <article className="rounded-card border border-border bg-white shadow-xs">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 bg-cream-warm/40 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted">
            <span>Abandoned cart</span>
            <span>·</span>
            <span>{ageLabel}</span>
            {notifiedAt && (
              <>
                <span>·</span>
                <span className="text-emerald-700">Email sent {new Date(notifiedAt).toLocaleDateString("en-IN")}</span>
              </>
            )}
          </div>
          <h3 className="mt-1 font-display text-xl text-ink">
            {customer.name || customer.email}
          </h3>
          <p className="text-xs text-ink-muted">
            Last activity: {new Date(updatedAt).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Subtotal</p>
            <p className="font-display text-2xl text-maroon">{formatINR(subtotalPaise)}</p>
            <p className="text-[11px] text-ink-muted">
              {items.length} {items.length === 1 ? "item" : "items"} · {totalQty} qty
            </p>
          </div>
        </div>
      </header>

      {/* Contact + Address */}
      <div className="grid gap-4 border-b border-border/70 px-5 py-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Contact
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-ink-muted" />
              <span>{customer.name || "—"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-ink-muted" />
              <a className="hover:underline" href={`mailto:${customer.email}`}>
                {customer.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-ink-muted" />
              {customer.phone ? (
                <a className="hover:underline" href={`tel:${customer.phone}`}>
                  {customer.phone}
                </a>
              ) : (
                <span className="text-ink-muted">Not provided</span>
              )}
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Default shipping address
          </p>
          {address ? (
            <div className="flex gap-2 text-sm leading-relaxed">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <div>
                <p className="font-medium">{address.fullName}</p>
                <p>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p className="text-ink-muted">{address.country}</p>
                <p className="text-ink-muted">{address.phone}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No saved address on file.</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/60 border-b border-border/70">
        <div className="flex items-center justify-between px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          <span>Items in cart</span>
          <span>Line total</span>
        </div>
        {items.map((i) => (
          <div
            key={`${i.productId}::${i.variantId}`}
            className="flex items-center gap-3 px-5 py-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-border bg-cream">
              {i.image ? (
                <Image
                  src={i.image}
                  alt={i.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <a
                href={`/products/${i.slug}`}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-1 text-sm font-medium text-ink hover:underline"
              >
                {i.name}
              </a>
              <p className="text-xs text-ink-muted">{i.variantLabel}</p>
              <p className="text-xs text-ink-muted">
                Qty {i.quantity} × {formatINR(i.unitPricePaise)}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums">
              {formatINR(i.unitPricePaise * i.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            readOnly
            value={checkoutUrl}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 truncate rounded border border-border bg-cream-warm/50 px-3 py-2 font-mono text-xs text-ink-muted"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center gap-2 rounded border border-ink bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream hover:bg-ink/90"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy checkout URL
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-muted hover:border-maroon hover:text-maroon disabled:cursor-not-allowed disabled:opacity-50"
            title="Dismiss"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {pending ? "…" : "Dismiss"}
          </button>
        </div>
        {dismissError && (
          <p className="w-full text-xs text-maroon">Could not dismiss: {dismissError}</p>
        )}
      </footer>
    </article>
  );
}
