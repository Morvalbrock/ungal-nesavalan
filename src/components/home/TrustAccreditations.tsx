import { Award, Hammer, IndianRupee, ShieldCheck } from "lucide-react";

export function TrustAccreditations() {
  return (
    <section className="w-full bg-[#EFEEEA] py-10 md:py-12 px-4 md:px-12 border-t border-[#D0C4BF]/40">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-start gap-3.5 p-2">
          <Hammer className="h-7 w-7 text-[#7A5817] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs uppercase text-[#1B1C1A] font-bold tracking-wider mb-1">
              Handloom Mark
            </h4>
            <p className="text-[11px] text-[#4D4541] leading-snug">
              Govt. of India certified authentic manual pit-loom warp tensioning.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2">
          <ShieldCheck className="h-7 w-7 text-[#7A5817] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs uppercase text-[#1B1C1A] font-bold tracking-wider mb-1">
              Silk Mark
            </h4>
            <p className="text-[11px] text-[#4D4541] leading-snug">
              100% Pure natural mulberry silk verified by Central Silk Board tests.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2">
          <IndianRupee className="h-7 w-7 text-[#7A5817] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs uppercase text-[#1B1C1A] font-bold tracking-wider mb-1">
              Direct Weaver Pay
            </h4>
            <p className="text-[11px] text-[#4D4541] leading-snug">
              Fair ethical craft wages paid directly into weaver guild trust funds.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2">
          <Award className="h-7 w-7 text-[#7A5817] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs uppercase text-[#1B1C1A] font-bold tracking-wider mb-1">
              GI Tag Verified
            </h4>
            <p className="text-[11px] text-[#4D4541] leading-snug">
              Geographical Indication Registry protection for Kanchipuram lineage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
