import { heroSlideRepo } from "@/server/repositories";
import { HeroSlidesClient } from "./HeroSlidesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hero slides" };

export default async function AdminHeroSlidesPage() {
  const slides = await heroSlideRepo.list();
  return <HeroSlidesClient initialSlides={slides} />;
}
