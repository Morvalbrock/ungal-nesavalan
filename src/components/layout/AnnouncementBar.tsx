import { announcementRepo } from "@/server/repositories";
import Link from "next/link";

const FALLBACK_OFFERS = [
  "Free shipping across Tamil Nadu",
  "Cash on delivery available",
  "Handloom Mark certified · direct from master weavers",
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
    <div className="relative overflow-hidden border-b border-ink/10 bg-ink text-cream">
      <div className="mask-fade-x">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {track.map((item, i) => {
            const content = (
              <span className="flex items-center px-8 py-2 text-[11px] font-medium uppercase tracking-widest2 text-cream/85">
                <span className="mr-8 text-gold-soft">✦</span>
                {item.text}
              </span>
            );

            return item.link ? (
              <Link
                key={`${item.id}-${i}`}
                href={item.link}
                className="transition hover:text-gold-soft"
              >
                {content}
              </Link>
            ) : (
              <span key={`${item.id}-${i}`}>{content}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
