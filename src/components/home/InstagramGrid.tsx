import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "./SectionHeading";

const IMAGES = [
  "https://picsum.photos/seed/insta-1/600/600",
  "https://picsum.photos/seed/insta-2/600/600",
  "https://picsum.photos/seed/insta-3/600/600",
  "https://picsum.photos/seed/insta-4/600/600",
  "https://picsum.photos/seed/insta-5/600/600",
  "https://picsum.photos/seed/insta-6/600/600"
];

export function InstagramGrid() {
  return (
    <section className="border-t border-border/60 bg-cream-warm/50 py-24">
      <Container>
        <SectionHeading
          eyebrow="@ungalnesavalan"
          title="Draped by our community"
          subtitle="Tag us with #WovenByHand for a chance to be featured."
        />

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-6">
          {IMAGES.map((src, i) => (
            <Link
              key={i}
              href="https://instagram.com/ungalnesavalan"
              target="_blank"
              rel="noopener"
              className="group relative block aspect-square overflow-hidden rounded-card"
            >
              <Image
                src={src}
                alt="Community drape"
                fill
                sizes="(min-width: 768px) 16vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/50">
                <svg
                  className="h-6 w-6 text-cream opacity-0 transition group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
