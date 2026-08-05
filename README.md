# Xisbiga Hilaac — Official Public Website

A premium, bilingual (Somali / English) public website for **Xisbiga Hilaac**, built to run
alongside the existing Node.js + PostgreSQL registration & admin system.

Stack: **Next.js 15** (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Lucide React.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

The dev server runs on **http://localhost:3100** (port 3000 is used by another local project).

```bash
npm run build
```

```bash
npm start
```

---

## Brand colours

Sampled from the live site and the HILAAC emblem — **not** the generic `#D4AF37` gold.

| Token | Hex | Use |
|---|---|---|
| `gold-500` | `#F5A800` | **Primary brand gold** (logo, buttons, accents) |
| `gold-600` | `#E09400` | Hover / pressed gold |
| `gold-300` | `#FFC94D` | Light gold, gradient start |
| `gold-50` | `#FFF8E7` | Tinted surfaces |
| `antique-500` | `#D4AF37` | Deep antique gold — gradient depth, metallic sheen |
| `ink-900` | `#111827` | Dark charcoal |
| `ink-950` | `#0A0F1A` | Dark-mode canvas, hero / footer |
| `ink-50` | `#F8FAFC` | Light gray band |
| white | `#FFFFFF` | Light-mode canvas |

All tokens live in `src/app/globals.css` under `@theme`. Change them there and the whole site follows.

> **Note on Tailwind:** the project path contains spaces, which breaks Tailwind 4's automatic
> source detection and silently drops every utility class. `globals.css` therefore declares
> `@source "../../src/**/*.{ts,tsx}"` explicitly. Keep that line.

---

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Base URL of the admin backend. **Leave empty to run on bundled fallback content.** |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL — used for SEO metadata, Open Graph and `sitemap.xml`. |
| `NEXT_PUBLIC_REGISTER_URL` | Where every "Join the Party" button sends visitors (the existing registration app). |
| `NEXT_PUBLIC_REVALIDATE` | Seconds to cache API responses server-side. Default `300`. |

---

## Connecting the admin dashboard

Every section — news, projects, leadership, events, gallery, testimonials, stats and site
settings — is rendered from the API. Until an endpoint exists the site falls back to the
bundled content in `src/lib/fallback.ts`, so **nothing ever renders empty**.

Add these read-only endpoints to the existing Node server (`server.js`), all returning JSON:

| Method | Path | Returns |
|---|---|---|
| GET | `/api/public/settings` | `SiteSettings` |
| GET | `/api/public/stats` | `StatItem[]` |
| GET | `/api/public/leadership` | `Leader[]` |
| GET | `/api/public/news` | `NewsArticle[]` or `Paginated<NewsArticle>` |
| GET | `/api/public/news/:slug` | `NewsArticle` |
| GET | `/api/public/news-categories` | `NewsCategory[]` |
| GET | `/api/public/projects` | `Project[]` |
| GET | `/api/public/projects/:slug` | `Project` |
| GET | `/api/public/events` | `PartyEvent[]` |
| GET | `/api/public/gallery` | `GalleryItem[]` |
| GET | `/api/public/testimonials` | `Testimonial[]` |
| POST | `/api/public/contact` | `{ name, email, phone, subject, message }` → stores the message |
| POST | `/api/public/newsletter` | `{ email }` → stores the subscriber |

The exact TypeScript shapes are in **`src/lib/types.ts`** — that file is the contract.

Three conveniences are built into the client (`src/lib/api.ts`):

- **Envelopes are unwrapped.** A bare array, `{ data: [...] }` and `{ items: [...] }` all work.
- **Fields can be bilingual.** Any text field accepts either a plain string or
  `{ "so": "...", "en": "..." }`. The language toggle picks the right one at runtime.
- **Partial records are safe.** `settings` is deep-merged over the defaults, so an incomplete
  admin record can't blank out the page.

Image fields may be absolute URLs or paths relative to `NEXT_PUBLIC_API_BASE`. When a record has
no image, a branded gold placeholder with the party emblem is shown instead.

CORS is not required — all API calls happen server-side during rendering.

---

## Structure

```
src/
  app/
    page.tsx                  Home — every section on one page
    about/  leadership/  news/  projects/  events/  gallery/  contact/
    news/[slug]/              Article detail (SSG + ISR)
    projects/[slug]/          Project detail (SSG + ISR)
    api/search/               Site-wide search across news, projects, events
    api/contact/              Forwards the contact form to the admin backend
    api/newsletter/           Forwards newsletter sign-ups
    sitemap.ts  robots.ts     SEO
    globals.css               Design tokens + utilities
  components/
    layout/                   Navbar, Footer, search dialog, theme & language toggles
    sections/                 Hero, About, Leadership, News, Projects, Events,
                              Gallery, Stats, Testimonials, MembershipCTA, Contact
    ui/                       Buttons, cards, badges, lightbox, counters, pagination…
  lib/
    api.ts                    REST client with fallback
    types.ts                  API contract
    fallback.ts               Bundled seed content
    i18n/                     Somali + English UI dictionary and provider
    theme.tsx                 Dark / light mode (no flash on first paint)
```

---

## Features

- **Bilingual** Somali (default) + English, remembered in `localStorage`.
- **Dark / light mode** with a pre-paint inline script — no flash of the wrong theme.
- **Sticky navbar** that condenses on scroll, gold scroll-progress bar, mobile drawer.
- **Search** across news, projects and events — click the icon or press `Ctrl`/`⌘` + `K`.
- **Scroll animations** throughout, all disabled automatically under `prefers-reduced-motion`.
- **Masonry gallery** with a keyboard-navigable lightbox (`←` `→` `Esc`).
- **Animated counters**, project progress bars, event capacity meters, testimonial carousel.
- **SEO**: per-page metadata, Open Graph, Twitter cards, `PoliticalParty` and `NewsArticle`
  JSON-LD, generated `sitemap.xml` and `robots.txt`.
- **Accessibility**: skip link, focus-visible rings, ARIA labels, semantic landmarks,
  `aria-pressed` / `aria-current` states, dialogs that trap scroll and close on `Esc`.
- **Performance**: static generation with ISR, AVIF/WebP images, ~102 kB shared first-load JS.

---

## Deploying

A standard Next.js 15 app — Vercel detects and builds it with no configuration.
`vercel.json` only pins the region (Frankfurt, the closest Vercel region to
Somalia) so server-rendered pages stay fast for visitors there.

### Steps

1. Import this repository at [vercel.com/new](https://vercel.com/new)
2. Leave every build setting on its default — Framework should read **Next.js**
3. Add the environment variables below
4. Deploy

### Environment variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://www.xisbiga-hilaac.com` |
| `NEXT_PUBLIC_SITE_URL` | your deployed URL, e.g. `https://xisbiga-hilaac.vercel.app` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://www.xisbiga-hilaac.com/admin.html` |
| `NEXT_PUBLIC_REVALIDATE` | `30` |

**No database credentials belong here.** The website reaches PostgreSQL only
through the registration backend's HTTPS API, so the database stays private to
that server.

### How the pieces connect

```
This website  ──HTTPS──>  xisbiga-hilaac.com (Node backend)  ──>  PostgreSQL
                                                                      ^
                                                          registration system
                                                          + admin dashboard
```

| Call | Purpose |
|---|---|
| `GET /api/public/stats` | Live member, region and district totals |
| `POST /api/register` | `/join` submissions land in the same `registrations` table |
| `GET /api/locations` | Region and district options for the join form |

Because the site talks to the backend over HTTPS, it can be hosted anywhere —
Vercel, Netlify, Cloudflare Pages or a container host — with no change to the
registration system.
