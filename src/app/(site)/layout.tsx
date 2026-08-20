import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { getAnnouncement, getSettings } from "@/lib/api";

/**
 * Chrome for the public website only.
 *
 * Admin screens sit outside this route group, so they never inherit the site
 * navbar, footer or scroll bar — they get their own layout instead.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, announcement] = await Promise.all([getSettings(), getAnnouncement()]);

  return (
    <>
      {announcement && (
        <AnnouncementBar
          textSo={announcement.textSo}
          textEn={announcement.textEn}
          link={announcement.link || undefined}
        />
      )}
      <ScrollProgress />
      <Navbar settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
