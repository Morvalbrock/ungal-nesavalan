import { announcementRepo } from "@/server/repositories";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Announcements — Admin" };

export default async function AdminAnnouncementsPage() {
  const announcements = await announcementRepo.list();
  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
