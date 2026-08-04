import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Events } from "@/components/sections/Events";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Leadership } from "@/components/sections/Leadership";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { NewsPreview } from "@/components/sections/NewsPreview";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import {
  getEvents,
  getGallery,
  getLeaders,
  getNews,
  getOverview,
  getProjects,
  getSettings,
  getStats,
  getTestimonials,
} from "@/lib/api";

// Live member/region/district figures refresh every 30s; the rest of the page
// is regenerated on the same pass.
export const revalidate = 30;

export default async function HomePage() {
  // One parallel fetch pass — every section is rendered from admin content.
  const [settings, stats, overview, leaders, news, projects, events, gallery, testimonials] =
    await Promise.all([
      getSettings(),
      getStats(),
      getOverview(),
      getLeaders(),
      getNews({ pageSize: 4 }),
      getProjects(),
      getEvents(),
      getGallery(),
      getTestimonials(),
    ]);

  return (
    <>
      <Hero settings={settings} stats={stats} />
      <About settings={settings} />
      <Stats stats={stats} overview={overview} />
      <Leadership leaders={leaders} limit={6} />
      <NewsPreview articles={news.items} />
      <ProjectsPreview projects={projects} />
      <Events events={events} limit={4} />
      <Gallery items={gallery} limit={8} />
      <Testimonials testimonials={testimonials} />
      <MembershipCTA settings={settings} />
      <Contact settings={settings} />
    </>
  );
}
