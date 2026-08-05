import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { getSettings } from "@/lib/api";
import { LanguageProvider } from "@/lib/i18n/provider";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { SITE_URL, t } from "@/lib/utils";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display-loaded",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-loaded",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5a800" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const name = t(settings.partyName, "so") || "Xisbiga Hilaac";
  const description = t(settings.heroSubheadline, "so");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} — ${t(settings.tagline, "so")}`,
      template: `%s | ${name}`,
    },
    description,
    keywords: [
      "Xisbiga Hilaac",
      "Hilaac Political Party",
      "Somalia politics",
      "siyaasadda Soomaaliya",
      "xisbi Soomaaliyeed",
      "Somali political party",
    ],
    authors: [{ name }],
    applicationName: name,
    alternates: {
      canonical: "/",
      languages: { "so-SO": "/", "en-GB": "/" },
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} — ${t(settings.heroHeadline, "en")}`,
      description,
      url: SITE_URL,
      locale: "so_SO",
      alternateLocale: ["en_GB"],
      images: [{ url: "/images/logo-circle.webp", width: 768, height: 768, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: ["/images/logo-circle.webp"],
    },
    icons: {
      icon: [{ url: "/images/logo-circle.webp", type: "image/webp" }],
      apple: [{ url: "/images/logo-circle.webp" }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const name = t(settings.partyName, "so");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "PoliticalParty",
    name,
    alternateName: t(settings.partyName, "en"),
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-circle.webp`,
    slogan: t(settings.tagline, "en"),
    email: settings.contact.email,
    telephone: settings.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: t(settings.contact.address, "en"),
      addressCountry: "SO",
    },
    sameAs: Object.values(settings.socials ?? {}).filter(Boolean),
  };

  return (
    <html lang="so" suppressHydrationWarning className={`${sora.variable} ${jakarta.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ScrollProgress />
            <Navbar />
            <main id="main">{children}</main>
            <Footer settings={settings} />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
