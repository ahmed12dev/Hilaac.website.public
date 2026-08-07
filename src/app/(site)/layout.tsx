import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { getSettings } from "@/lib/api";

/**
 * Chrome for the public website only.
 *
 * Admin screens sit outside this route group, so they never inherit the site
 * navbar, footer or scroll bar — they get their own layout instead.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
