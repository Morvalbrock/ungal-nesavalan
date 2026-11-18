export function StitchTrustHighlights() {
  const cards = [
    {
      icon: "🚚",
      iconBg: "bg-amber-50 text-amber-700 border border-amber-200/60",
      title: "Free Express Delivery",
      subtitle: "Across All India"
    },
    {
      icon: "🏷️",
      iconBg: "bg-purple-50 text-purple-800 border border-purple-200/60",
      title: "Direct Weaver Price",
      subtitle: "Loom to Doorstep"
    },
    {
      icon: "💳",
      iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      title: "Cash On Delivery",
      subtitle: "Pay after Inspection"
    },
    {
      icon: "🔄",
      iconBg: "bg-rose-50 text-rose-700 border border-rose-200/60",
      title: "7 Days Returns",
      subtitle: "Hassle-free Pickup"
    }
  ];

  return (
    <section className="border-b border-purple-100/80 py-4 sm:py-6 bg-transparent" data-purpose="trust-badges">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-100 shadow-xs sm:shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 flex items-center space-x-2.5 sm:space-x-3.5 group hover:-translate-y-0.5"
            >
              <div
                className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-xl shrink-0 group-hover:scale-105 transition-transform ${card.iconBg}`}
              >
                {card.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-sm font-bold text-purple-950 leading-tight group-hover:text-brand-purple transition-colors truncate">
                  {card.title}
                </p>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
