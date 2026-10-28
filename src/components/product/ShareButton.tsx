"use client";
import { useEffect, useRef, useState } from "react";
import { Share2, Copy, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function buildAbsoluteUrl(slug: string) {
  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/products/${slug}`;
}

export function ShareButton({
  productName,
  productSlug,
  className
}: {
  productName: string;
  productSlug: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const url = buildAbsoluteUrl(productSlug);
  const shareText = `Take a look at "${productName}" from Ungal Nesavalan`;

  const handleClick = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({ title: productName, text: shareText, url });
        return;
      } catch {
        // User dismissed or share failed — fall through to popover.
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignored
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} — ${url}`)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-label="Share this product"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm backdrop-blur-sm transition hover:bg-cream hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/30"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-card border border-border bg-white text-sm shadow-lg"
        >
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-ink transition hover:bg-cream-warm/60"
          >
            <Share2 className="h-4 w-4 text-emerald-700" />
            Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={copyLink}
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-ink transition hover:bg-cream-warm/60"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-700" />
                Link copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-ink-muted" />
                Copy link
              </>
            )}
          </button>
          <a
            href={emailHref}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-ink transition hover:bg-cream-warm/60"
          >
            <Mail className="h-4 w-4 text-ink-muted" />
            Email a friend
          </a>
        </div>
      )}
    </div>
  );
}
