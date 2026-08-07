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
  getContentEvents,
  getContentGallery,
  getContentLeaders,
  getLiveTotals,
  getNews,
  getContentProjects,
  getSettings,
  getStats,
  getTestimonials,
} from "@/lib/api";

// Live member/region/district figures refresh every 30s; the rest of the page
// is regenerated on the same pass.
export const revalidate = 30;

export default async function HomePage() {
  // One parallel fetch pass — every section is rendered from admin content.
  const [settings, stats, liveTotals, leaders, news, projects, events, gallery, testimonials] =
    await Promise.all([
      getSettings(),
      getStats(),
      getLiveTotals(),
      getContentLeaders(),
      getNews({ pageSize: 4 }),
      getContentProjects(),
      getContentEvents(),
      getContentGallery(),
      getTestimonials(),
    ]);

  return (
    <>
      <Hero settings={settings} stats={stats} />
      <About settings={settings} />
      <Stats
        stats={stats}
        liveTotals={liveTotals}
        counts={{
          activeProjects: projects.filter((p) => p.status === "ongoing").length,
          completedProjects: projects.filter((p) => p.status === "completed").length,
          upcomingEvents: events.filter((e) => e.status !== "past").length,
        }}
      />
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
