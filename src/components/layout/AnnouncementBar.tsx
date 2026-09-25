const OFFERS = [
  "Free shipping on orders above ₹5,000",
  "Cash on delivery available across India",
  "Handloom Mark certified · direct from master weavers",
  "Complimentary blouse piece with every drape",
  "7-day easy returns · reverse pickup available"
];

export function AnnouncementBar() {
  const track = [...OFFERS, ...OFFERS];
  return (
    <div className="relative overflow-hidden border-b border-ink/10 bg-ink text-cream">
      <div className="mask-fade-x">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {track.map((offer, i) => (
            <span
              key={i}
              className="flex items-center px-8 py-2 text-[11px] font-medium uppercase tracking-widest2 text-cream/85"
            >
              <span className="mr-8 text-gold-soft">✦</span>
              {offer}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
