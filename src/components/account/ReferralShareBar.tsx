"use client";
import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

interface Props {
  code: string;
  shareUrl: string;
}

export function ReferralShareBar({ code, shareUrl }: Props) {
  const [copied, setCopied] = useState<"code" | "url" | null>(null);
  const shareText = `I've been buying handloom sarees from Ungal Nesavalan. Use my code ${code} for 10% off your first order — ${shareUrl}`;

  async function copy(kind: "code" | "url") {
    const value = kind === "code" ? code : shareUrl;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore — some browsers block clipboard in insecure contexts
    }
  }

  async function share() {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      copy("url");
      return;
    }
    try {
      await navigator.share({ title: "Ungal Nesavalan", text: shareText, url: shareUrl });
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        onClick={() => copy("code")}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-cream-warm px-4 py-2 text-sm hover:border-ink"
      >
        {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied === "code" ? "Code copied" : "Copy code"}
      </button>
      <button
        onClick={() => copy("url")}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-cream-warm px-4 py-2 text-sm hover:border-ink"
      >
        {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied === "url" ? "Link copied" : "Copy invite link"}
      </button>
      <button
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-cream hover:bg-ink/90"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
    </div>
  );
}
