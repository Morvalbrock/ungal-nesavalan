export function ProvenanceStatsBar() {
  return (
    <div className="w-full bg-[#1F1916] text-[#FDFBF7] py-6 px-4 md:px-12 border-b border-[#C69C55]/20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <div className="flex flex-col items-center text-center px-4">
          <span className="font-display text-2xl md:text-3xl text-[#E5C378] font-bold tracking-tight">40+</span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-white/80 mt-1 font-semibold">
            Weaving Clusters
          </span>
        </div>
        <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
          <span className="font-display text-2xl md:text-3xl text-[#E5C378] font-bold tracking-tight">180</span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-white/80 mt-1 font-semibold">
            Master Artisans
          </span>
        </div>
        <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
          <span className="font-display text-2xl md:text-3xl text-[#E5C378] font-bold tracking-tight">0</span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-white/80 mt-1 font-semibold">
            Middlemen / Speculators
          </span>
        </div>
        <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
          <span className="font-display text-2xl md:text-3xl text-[#E5C378] font-bold tracking-tight">92%</span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-white/80 mt-1 font-semibold">
            Direct Artisan Remittance
          </span>
        </div>
      </div>
    </div>
  );
}
