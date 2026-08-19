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
| `DATABASE_URL` | **Required.** PostgreSQL for this website's own `site_*` tables. |
| `SITE_ADMIN_EMAIL` | **Required.** Seeds the first administrator account. |
| `SITE_ADMIN_PASSWORD` | **Required.** Password for that account. No default exists — if these are unset, nobody can sign in. |
| `AUTH_SECRET` | Signs the fallback session token used when the database is unreachable. Defaults to `SITE_ADMIN_PASSWORD`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL — used for SEO metadata, Open Graph and `sitemap.xml`. |
| `NEXT_PUBLIC_API_BASE` | The registration system. Live member totals are read from it and `/join` submissions are forwarded to it. Leave empty to run standalone. |
| `NEXT_PUBLIC_REGISTER_URL` | Sends "Join the Party" to the standalone registration app instead of this site's own `/join`. |
| `NEXT_PUBLIC_REVALIDATE` | Seconds to cache upstream API responses server-side. Default `300`. |

---

## The admin dashboard

`/admin` is this website's **own** dashboard, with its own accounts and its own database
tables. It is not the registration system's admin panel, and it cannot read registration data.

The only contact between the two systems is over HTTPS: member totals are read from
`GET <NEXT_PUBLIC_API_BASE>/api/public/stats`, and `/join` submissions are posted back.

| Screen | What it manages |
|---|---|
| Dashboard | Counts across every collection, plus recent activity |
| Analytics | Member growth, messages over time, regional breakdown, audit trail |
| News · Projects · Events · Leadership · Gallery · Testimonials | Bilingual content, published/draft per row |
| Media Library | Image uploads, stored in PostgreSQL and served from `/api/media/:id` |
| Members Registry | This site's own member records, with CSV import and export |
| Messages · Subscribers | Contact-form submissions and newsletter sign-ups |
| Site Settings | Hero, about, contact, socials, announcement banner, slideshow |
| Administrators | Accounts and owner/editor roles (owners only) |

Every change is written to `site_activity`, so the Analytics screen shows who did what.

### Where content comes from

Content is read from this website's own database — `src/lib/server/content.ts` and
`collections.ts` — and the same rows are exposed read-only at `/api/public/*` for anything
else that wants them.

`src/lib/fallback.ts` holds **only** the default site copy used until an administrator saves
their own. Its content collections are deliberately empty: a page with no rows shows an empty
state rather than invented articles or invented people.

### Uploads

Railway containers have no disk that survives a redeploy, so uploaded images are stored as
bytes in the `site_media` table and served from `/api/media/:id` with a long cache header.
JPG, PNG, WebP, GIF and AVIF up to 5 MB. SVG is deliberately rejected — it can carry script,
and these files are served from the site's own origin.

---

## Deploying on Railway

The service builds from GitHub `main` with Nixpacks and starts with `npm start`.

**One gotcha worth knowing:** Railway sets `NODE_ENV=production`, which makes a bare
`npm ci` skip `devDependencies`. TypeScript and Tailwind live there and `next build` needs
both, so the install command in `nixpacks.toml` passes `--include=dev`. Remove that flag and
every build fails with `Cannot find module 'typescript'`.

The `site_*` tables are created automatically on first database access — there is no
migration step to run.

---

## Structure

```
src/
  app/
    page.tsx                  Home — every section on one page
    about/  leadership/  news/  projects/  events/  gallery/  contact/
    news/[slug]/              Article detail (SSG + ISR)
    projects/[slug]/          Project detail (SSG + ISR)
    admin/                    Sign-in and the whole dashboard
    api/public/[resource]/    Read-only JSON for published content
    api/media/[id]/           Serves an uploaded image
    api/site-admin/           Dashboard CRUD (every route requires a session)
    api/search/               Site-wide search across news, projects, events
    api/contact/              Stores a contact-form message
    api/newsletter/           Stores a newsletter subscriber
    sitemap.ts  robots.ts     SEO
    globals.css               Design tokens + utilities
  components/
    layout/                   Navbar, Footer, search dialog, theme & language toggles
    sections/                 Hero, About, Leadership, News, Projects, Events,
                              Gallery, Stats, Testimonials, MembershipCTA, Contact
    ui/                       Buttons, cards, badges, lightbox, counters, pagination…
  lib/
    api.ts                    Content readers used by every page
    types.ts                  Content shapes
    fallback.ts               Default site copy (content collections are empty)
    server/
      db.ts                   Pool, schema and password hashing
      auth.ts                 Sessions, accounts and roles
      content.ts              News and projects
      collections.ts          Events, leadership, gallery, testimonials, messages
      members.ts              Members registry, CSV import/export
      media.ts                Image uploads
      activity.ts             Audit trail and analytics
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

## Hosting

The site runs on **Railway**, building from GitHub `main` and serving with `npm start`.
See "Deploying on Railway" above for the one build setting that matters.

`vercel.json` is left in place for anyone who wants to deploy a copy to Vercel instead; it
only pins the region (Frankfurt, the closest to Somalia).

### How the pieces connect

```
Visitor ──> This website ──> its own PostgreSQL (site_* tables)
                  │
                  └──HTTPS──> xisbiga-hilaac.com ──> the registration system's database
                                (member totals in, /join submissions out)
```

| Call | Purpose |
|---|---|
| `GET /api/public/stats` | Live member, region and district totals |
| `POST /api/register` | `/join` submissions land in the registration system |
| `GET /api/locations` | Region and district options for the join form |

The two systems share nothing but those HTTPS calls. A website administrator has no access
to registration data, and a registration-system administrator has no access to this
dashboard.
