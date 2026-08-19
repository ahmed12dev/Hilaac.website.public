/**
 * Default site copy, used only until an administrator saves their own from
 * the dashboard. Everything here is editable at /admin/dashboard/settings.
 *
 * The content collections below are deliberately EMPTY. News, projects,
 * leadership, events, gallery and testimonials come from the database that the
 * admin dashboard writes to — nothing else. A page with no rows shows an empty
 * state rather than invented articles or invented people, so nothing appears
 * on the public website that an administrator did not put there.
 */
import type {
  GalleryItem,
  Leader,
  NewsArticle,
  NewsCategory,
  PartyEvent,
  Project,
  SiteSettings,
  StatItem,
  Testimonial,
} from "./types";

export const fallbackSettings: SiteSettings = {
  partyName: { so: "Xisbiga Hilaac", en: "Hilaac Political Party" },
  tagline: {
    so: "Midnimo, Horumar iyo Caddaalad",
    en: "Unity, Progress and Justice",
  },
  heroHeadline: {
    so: "Dhisidda Soomaaliya Xoog Badan, Midaysan oo Barwaaqo ah",
    en: "Building a Strong, United, and Prosperous Somalia",
  },
  heroSubheadline: {
    so: "Xisbiga Hilaac wuxuu u taagan yahay dowladnimo daacad ah, dhalinyaro fursado leh, iyo dalka oo dhan oo isku xiran — muwaadin walba cod buuxa leh.",
    en: "Hilaac stands for honest governance, opportunity for our youth, and a connected nation — where every citizen has a full voice.",
  },
  logo: "/images/logo-circle.webp",
  heroImage: "/images/flag.webp",
  heroSlides: [
    { src: "/images/flag.webp", captionSo: "Calanka Xisbiga Hilaac", captionEn: "The Hilaac party flag" },
    { src: "/images/logo-circle.webp", captionSo: "Astaanta Xisbiga", captionEn: "The party emblem" },
  ],
  about: {
    history: {
      so: "Xisbiga Hilaac waxaa la aasaasay iyadoo ay ka dambeeyeen muwaadiniin rumaysan in Soomaaliya ay u baahan tahay siyaasad ku dhisan daacadnimo, xisaabtan iyo adeeg dadweyne. Laga bilaabo kulamo yaryar oo degmooyinka lagu qabtay ilaa hay'ad qaran oo laga hirgeliyo gobol kasta, safarkeennu wuxuu ahaa mid ku salaysan codka shacabka.",
      en: "Hilaac was founded by citizens who believed Somalia deserves politics built on integrity, accountability and public service. From small district gatherings to a national organisation present in every region, our journey has been powered by ordinary people.",
    },
    vision: {
      so: "Soomaaliya nabad ah, midaysan oo barwaaqaysan, halkaas oo muwaadin kasta uu ku helo caddaalad, waxbarasho tayo leh iyo fursad dhaqaale.",
      en: "A peaceful, united and prosperous Somalia where every citizen has access to justice, quality education and economic opportunity.",
    },
    mission: {
      so: "Inaan dhisno hoggaan daacad ah, dhaqaale kobcaya, iyo adeegyo bulsho oo gaaraya reer guuraaga, magaalooyinka iyo qurbaha — anagoo ku shaqaynayna hufnaan buuxda.",
      en: "To build honest leadership, a growing economy and public services that reach pastoral communities, cities and the diaspora alike — operating with complete transparency.",
    },
    values: [
      {
        id: "v1",
        icon: "shield",
        title: { so: "Daacadnimo", en: "Integrity" },
        description: {
          so: "Lacagta dadweynaha waa amaanad. Wax kasta oo aan qabanno waa la baari karaa.",
          en: "Public money is a trust. Everything we do is open to inspection.",
        },
      },
      {
        id: "v2",
        icon: "users",
        title: { so: "Midnimo", en: "Unity" },
        description: {
          so: "Qabiil ma aha barnaamij. Waxaan u wada shaqaynaa Soomaaliya oo dhan.",
          en: "Clan is not a policy. We work for all of Somalia, together.",
        },
      },
      {
        id: "v3",
        icon: "scale",
        title: { so: "Caddaalad", en: "Justice" },
        description: {
          so: "Sharci isku mid ah qof walba — awoodda ma aha wax lagu kor mariyo dadka.",
          en: "One law for everyone — power must never rise above the people.",
        },
      },
      {
        id: "v4",
        icon: "sprout",
        title: { so: "Horumar", en: "Progress" },
        description: {
          so: "Waxbarasho, caafimaad iyo shaqo dhalinyarada — aasaaska mustaqbalka.",
          en: "Education, health and youth employment — the foundation of the future.",
        },
      },
    ],
    timeline: [
      {
        id: "t1",
        year: "2019",
        title: { so: "Aasaaska", en: "Foundation" },
        description: {
          so: "Koox muwaadiniin ah oo ka kala socda gobollada ayaa dejiyay axdiga Hilaac.",
          en: "Citizens from across the regions drafted the founding charter of Hilaac.",
        },
      },
      {
        id: "t2",
        year: "2021",
        title: { so: "Diiwaangelin Rasmi ah", en: "Official Registration" },
        description: {
          so: "Xisbigu wuxuu helay diiwaangelin rasmi ah, waxaana la furay xafiisyo gobol.",
          en: "The party secured official registration and opened its first regional offices.",
        },
      },
      {
        id: "t3",
        year: "2023",
        title: { so: "Ballaarinta Qaranka", en: "National Expansion" },
        description: {
          so: "Waxaa la gaaray in ka badan 18 gobol, waxaana la bilaabay barnaamijka dhalinyarada.",
          en: "Reached more than 18 regions and launched the national youth programme.",
        },
      },
      {
        id: "t4",
        year: "2025",
        title: { so: "Nidaamka Diiwaangelinta Dhijitaalka", en: "Digital Membership" },
        description: {
          so: "Nidaam dhijitaal ah oo xubinnimo iyo kaarar la xaqiijin karo ayaa la hirgeliyay.",
          en: "Launched digital membership with verifiable member cards nationwide.",
        },
      },
      {
        id: "t5",
        year: "2026",
        title: { so: "Ololaha Qaran", en: "National Campaign" },
        description: {
          so: "Ololaha qaran ee doorashooyinka soo socda ayaa si rasmi ah loo bilaabay.",
          en: "The national campaign for the coming elections officially began.",
        },
      },
    ],
  },
  contact: {
    address: { so: "Muqdisho, Soomaaliya", en: "Mogadishu, Somalia" },
    email: "info@xisbiga-hilaac.com",
    phone: "+252 61 000 0000",
    hours: {
      so: "Sabti – Khamiis, 8:00 subaxnimo – 5:00 galabnimo",
      en: "Saturday – Thursday, 8:00 AM – 5:00 PM",
    },
    mapEmbedUrl:
      "https://www.google.com/maps?q=Mogadishu,Somalia&output=embed",
    mapLink: "https://www.google.com/maps/place/Mogadishu",
  },
  socials: {
    facebook: "https://facebook.com/",
    x: "https://x.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    tiktok: "https://tiktok.com/",
  },
  registerUrl: "https://www.xisbiga-hilaac.com/register.html",
};

/* ── Content collections ────────────────────────────────────────────
   Intentionally empty. Real rows are written by the admin dashboard into
   the site_* tables and read back by lib/server/content.ts. */

export const fallbackStats: StatItem[] = [];

export const fallbackCategories: NewsCategory[] = [];

export const fallbackNews: NewsArticle[] = [];

export const fallbackProjects: Project[] = [];

export const fallbackLeaders: Leader[] = [];

export const fallbackEvents: PartyEvent[] = [];

export const fallbackGallery: GalleryItem[] = [];

export const fallbackTestimonials: Testimonial[] = [];
