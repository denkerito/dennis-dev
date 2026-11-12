import { readFileSync } from "node:fs";
import path from "node:path";

import type { Metadata, Viewport } from "next";
import { Anton } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { SkipLink } from "@/components/SkipLink/SkipLink";
import { site } from "@/content/site";

import "./globals.css";

// Provisional display typeface. Downloaded at build time and served from
// the site's own origin, so visitors make no request to Google.
const displayFont = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

/**
 * Public address of the site, read at build time. Optional: without it the
 * canonical URL and Open Graph URL are left out.
 */
function readSiteUrl(): URL | undefined {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    throw new Error(`SITE_URL is not a valid absolute URL: "${value}"`);
  }
}

const siteUrl = readSiteUrl();

/**
 * Reads a theme token's value from globals.css at build time, so that colour
 * values are written in one place only, even where CSS variables cannot reach
 * (such as the browser theme colour meta tag).
 */
function readThemeToken(name: string): string {
  const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  const match = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`Theme token ${name} not found in globals.css`);
  return match[1].trim();
}

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    siteName: site.name,
    locale: site.locale,
    ...(siteUrl && { url: "/" }),
  },
  ...(siteUrl && {
    metadataBase: siteUrl,
    alternates: { canonical: "/" },
  }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: readThemeToken("--color-paper"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={displayFont.variable}>
      <body>
        <SkipLink targetId="main" />
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
