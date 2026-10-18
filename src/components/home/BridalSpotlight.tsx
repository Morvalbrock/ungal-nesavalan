"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Ruler, ShieldCheck, Sparkles, X } from "lucide-react";

export function BridalSpotlight() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // WhatsApp direct connect for convenience
    const text = encodeURIComponent(
      `Hello Ungal Nesavalan, I would like to book a Bridal Saree Consultation.\nName: ${name}\nPhone: ${phone}${date ? `\nWedding Date: ${date}` : ""}`
    );
    window.open(`https://wa.me/918825810897?text=${text}`, "_blank");
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
      setName("");
      setPhone("");
      setDate("");
    }, 1500);
  };

  return (
    <>
      {/* SECTION 4: SPOTLIGHT FEATURE: THE BRIDAL ATELIER & MASTERCRAFT */}
      <section className="w-full bg-[#F5EFEB] py-16 md:py-24 px-4 md:px-12 border-y border-[#D0C4BF]/40" id="bridal-atelier">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side Editorial Bridal Photo Frame */}
          <div className="col-span-12 lg:col-span-6 relative">
            <div className="relative p-3 bg-[#FBF9F5] border border-[#C69C55]/30 shadow-2xl">
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#EFEEEA]">
                <Image
                  src="/images/generating.png"
                  alt="The Bridal Edit Elampillai Handloom Pure Silk Saree"
                  width={720}
                  height={900}
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>

              {/* Framing Label */}
              <div className="absolute -top-3 -right-3 px-4 py-1 bg-[#1F1916] text-[#E5C378] text-[10px] uppercase font-semibold tracking-widest border border-[#C69C55]/40 shadow-lg">
                BR-2026 Archive
              </div>

              {/* Decorative Stamp */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 md:w-24 md:h-24 rounded-full border border-[#C69C55]/40 bg-[#FBF9F5]/95 backdrop-blur-md flex flex-col items-center justify-center p-2 text-center shadow-lg">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-[#7A5817]" />
                <span className="text-[8px] md:text-[9px] uppercase tracking-tighter text-[#1B1C1A] font-bold mt-0.5">
                  Elampillai Guild
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Editorial Copy */}
          <div className="col-span-12 lg:col-span-6 flex flex-col items-start pl-0 lg:pl-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-[#7A5817]"></span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7A5817]">
                Couture Spotlight · The Bridal Edit · Elampillai Looms
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl text-[#1B1C1A] leading-[1.15] mb-4">
              Woven for Generations. <br />
              <span className="italic font-normal">Blessed by the Loom.</span>
            </h2>

            <p className="text-sm md:text-base text-[#4D4541] leading-relaxed mb-6">
              Handcrafted in the legendary handloom weaving hub of Elampillai, Salem. Each bridal drape is individually created using authentic twisted mulberry silks, rich traditional zari motifs, and ancestral pit-loom artistry. No mass production. Directly from our looms to you.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">
              <div className="bg-[#FBF9F5] p-3.5 border border-[#D0C4BF]/40 flex flex-col">
                <Ruler className="h-5 w-5 text-[#7A5817] mb-1.5" />
                <span className="text-xs uppercase tracking-wider text-[#1B1C1A] font-bold">
                  Custom Blouse
                </span>
                <span className="text-[11px] text-[#7F7570] mt-0.5">Unstitched 1m silk included</span>
              </div>
              <div className="bg-[#FBF9F5] p-3.5 border border-[#D0C4BF]/40 flex flex-col">
                <Award className="h-5 w-5 text-[#7A5817] mb-1.5" />
                <span className="text-xs uppercase tracking-wider text-[#1B1C1A] font-bold">
                  Weaver Signed
                </span>
                <span className="text-[11px] text-[#7F7570] mt-0.5">Direct craftsman charter</span>
              </div>
              <div className="bg-[#FBF9F5] p-3.5 border border-[#D0C4BF]/40 flex flex-col">
                <ShieldCheck className="h-5 w-5 text-[#7A5817] mb-1.5" />
                <span className="text-xs uppercase tracking-wider text-[#1B1C1A] font-bold">
                  Silk Mark
                </span>
                <span className="text-[11px] text-[#7F7570] mt-0.5">100% certified filament</span>
              </div>
            </div>

            {/* Bridal Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-6 py-3.5 bg-[#7D1D24] hover:bg-[#94252D] text-[#FDFBF7] text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-md"
              >
                Reserve a Bridal Consultation
              </button>
              <Link
                href="/category/bridal-sarees"
                className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1B1C1A] hover:text-[#7A5817] transition-colors flex items-center py-2"
              >
                Explore Bridal Suite
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BRIDAL CONSULTATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F1916]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] max-w-lg w-full p-6 md:p-8 border border-[#C69C55]/40 shadow-2xl relative animate-fadeUp">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#EFEEEA] flex items-center justify-center text-[#1B1C1A] hover:text-[#7D1D24] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A5817] font-semibold block mb-1">
              Guild Concierge
            </span>
            <h3 className="font-display text-2xl text-[#1B1C1A] mb-2">Book a Private Bridal Viewing</h3>
            <p className="text-xs text-[#4D4541] mb-6 leading-relaxed">
              Connect over a curated high-resolution video viewing or visit our Kanchipuram loom atelier for bespoke muhurtham color palette commissions.
            </p>

            {submitted ? (
              <div className="p-4 bg-[#EFEEEA] text-center text-sm text-[#1B1C1A]">
                Opening WhatsApp consultation chat with our master guild concierge…
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1B1C1A] mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Sundaram"
                    className="w-full px-3 py-2 bg-[#F5EFEB] border border-[#D0C4BF] text-sm focus:border-[#7A5817] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1B1C1A] mb-1">
                    Contact WhatsApp / Mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 88258 10897"
                    className="w-full px-3 py-2 bg-[#F5EFEB] border border-[#D0C4BF] text-sm focus:border-[#7A5817] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1B1C1A] mb-1">
                    Wedding / Muhurtham Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5EFEB] border border-[#D0C4BF] text-sm focus:border-[#7A5817] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#7D1D24] hover:bg-[#94252D] text-[#FDFBF7] text-xs font-semibold uppercase tracking-[0.2em] transition-colors mt-2"
                >
                  Confirm Consultation via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
