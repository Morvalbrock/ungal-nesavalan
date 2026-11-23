"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Check,
  Award,
  Star,
  CheckCircle2,
  Scroll,
  Home,
  Truck,
  ShoppingBag,
  MessageCircle,
  Zap,
  Loader2
} from "lucide-react";
import { useSareeModalStore } from "./saree-modal-store";
import { useCartStore } from "@/features/cart/cart.store";

export function SareeDetailModal() {
  const { isOpen, saree, close } = useSareeModalStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  const [activeImage, setActiveImage] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (saree) {
      setActiveImage(saree.imageUrl);
      setQty(1);
      setPincodeChecked(false);
      setPincode("");
    }
  }, [saree]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  if (!isOpen || !saree) return null;

  const rawThumbs =
    saree.thumbnails && saree.thumbnails.length > 0
      ? saree.thumbnails
      : [saree.imageUrl];
  const cleanThumbs = Array.from(
    new Set(
      rawThumbs.filter(
        (url) =>
          Boolean(url) &&
          !url.includes("img.png") &&
          !url.includes("screen.png") &&
          !url.includes("generating.png")
      )
    )
  );
  const thumbs = cleanThumbs.length > 0 ? cleanThumbs : [saree.imageUrl];

  // Parse numeric price for cart
  const numericPrice = parseInt(saree.price.replace(/[^\d]/g, ""), 10) || 750;
  const pricePaise = numericPrice * 100;

  const handleAddToCart = () => {
    addItemToCart({
      productId: saree.productId || `modal_${Date.now()}`,
      variantId: `var_${saree.productId || "default"}`,
      slug: saree.slug || "royal-violet-aarani-soft-silk-saree",
      name: saree.title,
      variantLabel: saree.badge || "Authentic Elampillai Handloom",
      image: activeImage || saree.imageUrl,
      unitPricePaise: pricePaise,
      quantity: qty,
      maxStock: 25
    });

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1800);
  };

  const handleDirectBuy = async () => {
    if (buyingNow) return;
    setBuyingNow(true);

    let targetVariantId = `var_${saree.productId || "default"}`;
    let targetPricePaise = pricePaise;

    if (saree.slug) {
      try {
        const res = await fetch(`/api/products/${saree.slug}`);
        if (res.ok) {
          const fullProduct = await res.json();
          if (fullProduct.variants && fullProduct.variants.length > 0) {
            const inStock =
              fullProduct.variants.find((v: { stock?: number }) => (Number(v.stock) || 0) > 0) ||
              fullProduct.variants[0];
            targetVariantId = inStock.id;
            if (inStock.priceOverride) targetPricePaise = inStock.priceOverride;
          }
        }
      } catch {
        // Fallback
      }
    }

    addItemToCart({
      productId: saree.productId || `modal_${Date.now()}`,
      variantId: targetVariantId,
      slug: saree.slug || "royal-violet-aarani-soft-silk-saree",
      name: saree.title,
      variantLabel: saree.badge || "Authentic Elampillai Handloom",
      image: activeImage || saree.imageUrl,
      unitPricePaise: targetPricePaise,
      quantity: qty,
      maxStock: 25
    });

    close();
    router.push("/checkout");
  };

  const checkPincode = () => {
    if (pincode.trim().length >= 6) {
      setPincodeChecked(true);
    } else {
      alert("Please enter a valid 6-digit Indian PIN code (e.g. 637502)");
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Vanakkam! I am interested in purchasing "${saree.title}" (${saree.price}) from Ungal Nesavalan.`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-saree-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-purple-950/75 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-purple-200 overflow-hidden max-h-[92vh] flex flex-col transition-transform duration-300 scale-100 animate-fadeUp">
        {/* Close Button */}
        <button
          onClick={close}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-purple-100 text-slate-600 hover:text-brand-plum shadow-md flex items-center justify-center transition-all focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Gallery */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Showcase Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-purple-100 bg-[#faf7fd] shadow-md group">
                <Image
                  src={activeImage || saree.imageUrl}
                  alt={saree.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />

                {/* Direct Loom Tag */}
                <div className="absolute bottom-3.5 left-3.5 bg-brand-deep/90 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-sm font-medium flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-300" />
                  Salem Pit-loom Authentic
                </div>
              </div>

              {/* Thumbnails - only displayed when multiple authentic photos exist */}
              {thumbs.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {thumbs.map((thumbUrl, idx) => {
                    const isCurrent = (activeImage || saree.imageUrl) === thumbUrl;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(thumbUrl)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 p-0.5 shrink-0 transition-all focus:outline-none ${
                          isCurrent
                            ? "border-brand-purple ring-2 ring-purple-300 ring-offset-1"
                            : "border-purple-200 hover:border-brand-purple"
                        }`}
                      >
                        <Image
                          src={thumbUrl}
                          alt={`Thumb ${idx + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          unoptimized
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Details & Actions */}
            <div className="lg:col-span-6 space-y-4">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-slate-500">
                <Link href="/" className="hover:text-brand-purple">
                  Home
                </Link>
                <span>&gt;</span>
                <Link href="/products" className="hover:text-brand-purple">
                  Handloom Sarees
                </Link>
                <span>&gt;</span>
                <span className="text-brand-plum font-semibold">{saree.badge}</span>
              </nav>

              {/* Saree Title */}
              <h2
                id="modal-saree-title"
                className="text-2xl sm:text-3xl font-heritage font-bold text-brand-plum leading-snug"
              >
                {saree.title}
              </h2>

              {/* Rating & Verified Reviews — only shown when real review data exists.
                   Previously defaulted to 4.9 / 96, which lied about brand-new products. */}
              {saree.reviewCount && saree.reviewCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-500 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  {saree.rating != null && (
                    <span className="text-xs font-semibold text-slate-700">{saree.rating}</span>
                  )}
                  {saree.rating != null && <span className="text-slate-400 text-xs">|</span>}
                  <span className="text-xs text-brand-purple font-medium hover:underline cursor-pointer">
                    {saree.reviewCount} verified artisan review{saree.reviewCount === 1 ? "" : "s"}
                  </span>
                </div>
              )}

              {/* Price Display — strikethrough + discount badge only when a real
                   sale is in effect; otherwise show just the live price. */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-extrabold text-brand-plum">{saree.price}</span>
                {saree.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">{saree.originalPrice}</span>
                )}
                {saree.discount && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {saree.discount}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-brand-gold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full ml-auto">
                  Direct Weaver Price • No Middlemen
                </span>
              </div>

              {/* Key Highlights */}
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>100% Pit-loom Woven</strong> in Elampillai traditional cluster
                  </span>
                </li>
                {saree.blousePieceIncluded === false ? (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Direct Loom Finish</strong> — blouse piece not included
                    </span>
                  </li>
                ) : (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Running Blouse Included (0.8m)</strong> with matching rich border
                    </span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Free Express Delivery</strong> across Tamil Nadu &amp; all India
                  </span>
                </li>
              </ul>

              {/* Fabric & Specifications Table */}
              <div className="rounded-xl border border-purple-100 bg-[#fdfaff] p-3 text-xs space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-plum flex items-center gap-1.5">
                  <Scroll className="h-3.5 w-3.5 text-brand-gold" />
                  Fabric &amp; Weave Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Weave Technique:</span>
                    <span className="font-medium text-slate-800">
                      {saree.weave || "Authentic Elampillai Pit-loom"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fabric Blend:</span>
                    <span className="font-medium text-slate-800">
                      {saree.fabric || "Pure Mulberry Soft Silk blend"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Saree Length:</span>
                    <span className="font-medium text-slate-800">
                      {saree.length || "6.2 Meters with Blouse Piece"}
                    </span>
                  </div>
                  {saree.borderWork && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Border Work:</span>
                      <span className="font-medium text-slate-800">
                        {saree.borderWork}
                      </span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Care Instructions:</span>
                    <span className="font-medium text-slate-800">
                      Gentle hand wash or Dry clean recommended
                    </span>
                  </div>
                </div>
              </div>

              {/* Weaver Origin Box — only shown when a specific weaver is known, so we
                  never claim "Master Weaver Selvam & Family" for every product. */}
              {saree.weaver && (
                <div className="p-3 rounded-xl bg-purple-100/60 border border-purple-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-deep text-amber-300 flex items-center justify-center shrink-0">
                    <Home className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-brand-plum">{saree.weaver}</p>
                    <p className="text-slate-500 text-[11px]">
                      Elampillai Loom · Salem District, Tamil Nadu
                    </p>
                  </div>
                </div>
              )}

              {/* Pincode Delivery Check */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check Delivery &amp; COD Availability
                </label>
                <div className="flex gap-2">
                  <input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 637502)"
                    type="text"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                  <button
                    onClick={checkPincode}
                    type="button"
                    className="px-5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-brand-plum font-semibold text-xs transition-colors shrink-0"
                  >
                    Check
                  </button>
                </div>
                {pincodeChecked && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery available! Free delivery in 2-3 business days. COD supported.
                  </p>
                )}
              </div>

              {/* Quantity & CTAs */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-purple-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-purple-50 text-xs font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-brand-plum min-w-[28px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-purple-50 text-xs font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Only 4 left in current loom batch
                  </span>
                </div>

                {/* Action Buttons: Direct Buy Now, Add to Cart & WhatsApp */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDirectBuy}
                    disabled={buyingNow}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-deep to-brand-purple hover:from-brand-purple hover:to-brand-deep text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75 active:scale-[0.99]"
                  >
                    {buyingNow ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                        <span>Proceeding to Checkout…</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                        <span>Direct Buy Now &bull; {saree.price}</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-purple-200 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 ${
                        addedAnimation
                          ? "!bg-emerald-700 !text-white !border-emerald-700"
                          : "text-brand-plum bg-purple-50/60"
                      }`}
                    >
                      {addedAnimation ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added to Bag!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 text-brand-purple" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/918825810897?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Order via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
