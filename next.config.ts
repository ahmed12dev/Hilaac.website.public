import type { NextConfig } from "next";

/**
 * Images coming from the admin dashboard are served from the API host, so we
 * allow any https host by default and let ADMIN_API_BASE narrow it in prod.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Hides the floating "N" badge Next.js shows in the corner during development.
  // It never appears in production, but it's in the way while working.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  // Allowed dev origins: avoids future Next.js warning when accessing the
  // site via the LAN IP. Update if you run the dev server on a different port.
  allowedDevOrigins: ["http://localhost:3101", "http://192.168.18.113:3101"],
};

export default nextConfig;
