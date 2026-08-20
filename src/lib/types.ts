/**
 * Content shapes returned by the admin dashboard's public REST API.
 * Every field the UI depends on is optional-tolerant: the admin panel can
 * evolve without breaking the site.
 */

export type Locale = "so" | "en";

/** A string that may be localised per language by the admin panel. */
export type Localized = string | { so?: string; en?: string };

export interface NewsCategory {
  id: string;
  slug: string;
  name: Localized;
  count?: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body?: Localized;
  cover?: string | null;
  category?: string;
  categorySlug?: string;
  author?: string;
  authorRole?: string;
  publishedAt: string;
  readingMinutes?: number;
  featured?: boolean;
  tags?: string[];
}

export type ProjectStatus = "planned" | "ongoing" | "completed" | "paused";

export interface Project {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  body?: Localized;
  cover?: string | null;
  status: ProjectStatus;
  progress: number; // 0–100
  budget?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
}

export interface Leader {
  id: string;
  slug?: string;
  name: string;
  position: Localized;
  bio: Localized;
  photo?: string | null;
  region?: string;
  order?: number;
  socials?: {
    facebook?: string;
    x?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    email?: string;
    website?: string;
  };
}

export interface PartyEvent {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  cover?: string | null;
  startsAt: string;
  endsAt?: string;
  location: Localized;
  city?: string;
  registerUrl?: string;
  capacity?: number;
  attending?: number;
  status?: "upcoming" | "past" | "cancelled";
}

export interface GalleryItem {
  id: string;
  type: "photo" | "video";
  title?: Localized;
  src: string;
  thumb?: string;
  poster?: string;
  album?: string;
  width?: number;
  height?: number;
  takenAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: Localized;
  quote: Localized;
  avatar?: string | null;
  region?: string;
  rating?: number;
}

export interface StatItem {
  id: string;
  label: Localized;
  value: number;
  suffix?: string;
  icon?: string;
}

export interface TimelineEntry {
  id: string;
  year: string;
  title: Localized;
  description: Localized;
}

export interface HeroSlide {
  src: string;
  captionSo?: string;
  captionEn?: string;
}

export interface SiteSettings {
  partyName: Localized;
  tagline: Localized;
  heroHeadline: Localized;
  heroSubheadline: Localized;
  heroImage?: string | null;
  heroVideo?: string | null;
  /** Homepage hero slideshow, managed from the admin dashboard. */
  heroSlides?: HeroSlide[];
  logo?: string;
  about: {
    /** Short version, shown on the About card. */
    history: Localized;
    vision: Localized;
    mission: Localized;
    /** Full text, shown on /about/history, /about/vision, /about/mission.
        Falls back to the short version when an editor hasn't written one. */
    historyFull?: Localized;
    visionFull?: Localized;
    missionFull?: Localized;
    values: { id: string; title: Localized; description: Localized; icon?: string }[];
    timeline: TimelineEntry[];
  };
  contact: {
    address: Localized;
    email: string;
    phone: string;
    hours?: Localized;
    mapEmbedUrl?: string;
    mapLink?: string;
  };
  socials: {
    facebook?: string;
    x?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  registerUrl?: string;
}

/**
 * Live membership totals from the registration backend (counts only —
 * no personal data crosses the boundary).
 */
export interface LiveTotals {
  totalMembers: number;
  totalRegions: number;
  totalDistricts: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
