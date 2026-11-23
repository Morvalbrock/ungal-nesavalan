import Link from "next/link";
import { Headphones } from "lucide-react";
import { announcementRepo } from "@/server/repositories";

const FALLBACK_OFFERS = [
  "Direct from Elampillai Looms · Authentic Handloom Sarees",
  "Free shipping across Tamil Nadu & India",
  "Cash on delivery available",
  "100% authentic handloom · direct from master weavers",
  "Complimentary blouse piece with every drape",
  "Returns subject to policy · Unboxing video mandatory"
];

export async function AnnouncementBar() {
  const items = await announcementRepo.listActive();
  const offers =
    items.length > 0
      ? items
      : FALLBACK_OFFERS.map((text, i) => ({
          id: `fallback_${i}`,
          text,
          link: "",
          sort: i + 1,
          active: true
        }));

  if (offers.length === 0) return null;

  // Ensure enough items to smoothly fill the marquee track
  let track = offers;
  while (track.length < 6) {
    track = [...track, ...offers];
  }
  track = [...track, ...track];

  return (
    <aside
      aria-label="Store Announcements"
      className="relative z-50 overflow-hidden border-b border-[#5a1c6a]/50 bg-[#32083b] text-purple-100"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Continuous Dynamic Marquee Ticker */}
        <div className="flex-1 overflow-hidden mask-fade-x py-1.5 sm:py-2">
          <div className="flex w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
            {track.map((item, i) => {
              const content = (
                <span className="flex items-center px-5 sm:px-8 text-[11px] font-medium uppercase tracking-widest2 text-purple-100/90 transition-colors hover:text-amber-300">
                  <span className="mr-5 sm:mr-8 text-amber-400">✦</span>
                  {item.text}
                </span>
              );

              return item.link ? (
                <Link
                  key={`${item.id}-${i}`}
                  href={item.link}
                  className="transition hover:text-amber-300"
                >
                  {content}
                </Link>
              ) : (
                <span key={`${item.id}-${i}`}>{content}</span>
              );
            })}
          </div>
        </div>

        {/* Support Hotline (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2 pl-4 md:pl-6 shrink-0 text-xs text-purple-200 border-l border-purple-800/50">
          <a
            href="tel:+918825810897"
            className="flex items-center gap-1.5 text-purple-200 hover:text-amber-300 font-medium transition-colors"
          >
            <Headphones className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] tracking-normal">Need Help? +91 88258 10897</span>
          </a>
        </div>

        {/* Mobile quick help button */}
        <div className="sm:hidden pl-2 shrink-0">
          <a
            href="tel:+918825810897"
            aria-label="Help Hotline"
            className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:underline whitespace-nowrap"
          >
            <span>📞 Help</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
