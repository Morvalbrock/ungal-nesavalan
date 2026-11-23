import { Gem, MessageCircle } from "lucide-react";

export function StitchSareeCareBanner() {
  return (
    <>
      {/* Mobile Handloom Care & Maintenance Guide (Matching Stitch Mobile Screen) */}
      <section className="px-3.5 py-3 md:hidden" data-purpose="care-authenticity">
        <div className="bg-gradient-to-r from-[#44054a] to-[#5b0863] rounded-2xl p-4 text-white text-center shadow-sm border border-purple-600/40">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xl mb-2 border border-amber-300/40">
            💎
          </div>
          <h3 className="font-serif font-bold text-sm tracking-wide !text-white text-white">
            Handloom Care &amp; Maintenance Guide
          </h3>
          <p className="text-[11px] text-purple-200 mt-1 max-w-xs mx-auto">
            Each parcel includes traditional maintenance tips &amp; direct weaver care instructions.
          </p>
          {/* WhatsApp Contact Button */}
          <div className="mt-3 flex items-center justify-center">
            <a
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-full shadow-md active:scale-95 transition"
              href="https://wa.me/918825810897?text=Vanakkam!%20I%20have%20queries%20about%20your%20saree%20fabric%20and%20care%20guide."
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>💬</span>
              <span>WhatsApp Weaver Direct</span>
            </a>
          </div>
        </div>
      </section>

      {/* Desktop Handloom Care Strip */}
      <section className="hidden md:block bg-purple-900 text-purple-100 py-8 border-y border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-amber-300 text-xl shrink-0 mx-auto md:mx-0">
              <Gem className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">
                Handloom Care &amp; Maintenance Guide
              </h4>
              <p className="text-xs text-purple-200">
                Each parcel includes traditional maintenance tips &amp; direct weaver care instructions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-300 font-medium">Have queries on fabric details?</span>
            <a
              href="https://wa.me/918825810897?text=Vanakkam!%20I%20have%20queries%20about%20your%20saree%20fabric%20and%20care%20guide."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Weaver</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
