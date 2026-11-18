import { Truck, ShieldCheck, Banknote, Headphones } from "lucide-react";

export function AnnouncementBar() {
  return (
    <>
      {/* Mobile Announcement Bar (Matching Stitch Mobile Screen) */}
      <aside className="bg-[#2e022c] text-amber-200 text-[11px] py-1.5 px-3 font-medium tracking-wide flex items-center justify-between border-b border-amber-500/20 z-50 sm:hidden">
        <div className="flex items-center space-x-1.5 overflow-hidden whitespace-nowrap">
          <span>🌾</span>
          <span className="truncate">Direct from Elampillai Looms • Free Shipping in India</span>
        </div>
        <a
          className="text-amber-300 font-semibold text-[10px] pl-2 whitespace-nowrap flex items-center hover:underline"
          href="tel:+918825810897"
        >
          <span>📞 Help</span>
        </a>
      </aside>

      {/* Desktop / Tablet Announcement Bar */}
      <aside className="hidden sm:block bg-[#32083b] text-white text-xs py-2 px-4 border-b border-[#5a1c6a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Shipping & Manufacturer Perks */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-purple-200 text-xs">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Truck className="h-3.5 w-3.5 text-[#eab308]" />
              Free Shipping Across Tamil Nadu &amp; India
            </span>
            <span className="hidden sm:inline text-purple-400">|</span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <ShieldCheck className="h-3.5 w-3.5 text-[#eab308]" />
              Direct from Weaver - Elampillai Loom
            </span>
            <span className="hidden md:inline text-purple-400">|</span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Banknote className="h-3.5 w-3.5 text-[#eab308]" />
              Cash on Delivery Available
            </span>
          </div>

          {/* Support Hotline */}
          <div className="flex items-center gap-4 text-xs">
            <a
              className="flex items-center gap-1.5 text-purple-200 hover:text-amber-300 font-medium transition-colors"
              href="tel:+918825810897"
            >
              <Headphones className="h-3.5 w-3.5 text-amber-400" />
              <span>Need Help? +91 88258 10897</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
