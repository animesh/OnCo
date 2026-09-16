import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CommandPalette, PaletteTrigger } from "@/components/CommandPalette";
import { NavMenu } from "@/components/NavMenu";
import { ThemeToggle, ThemeScript } from "@/components/ThemeToggle";
import { SkipLink } from "@/components/SkipLink";
import { LayerToggle, LayerScript } from "@/components/LayerToggle";
import { LangStrip } from "@/components/LangStrip";
import { SectionSiblings } from "@/components/SectionSiblings";
import { RegionProvider } from "@/lib/region";
import { RegionToggle } from "@/components/RegionToggle";
import { GitHubStars } from "@/components/GitHubStars";
import { AccountMenu } from "@/components/AccountMenu";
import { RegisterSW } from "@/components/RegisterSW";
import { FEED_TYPES } from "@/lib/seo";
import { GardenBackdrop, GardenDefs } from "@/components/Garden";
import { FooterNav } from "@/components/FooterNav";
import { T } from "@/components/T";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/**
 * Site-wide defaults. Every page sets its own title, description, canonical URL and social copies via `pageMeta`
 * (src/lib/seo.ts); these are the fallbacks and the shared bits (metadataBase, title template, robots, Twitter card).
 * The Open Graph / Twitter image comes from src/app/opengraph-image.png and is inherited by every route.
 */
export const metadata: Metadata = {
  title: { default: "OnCo: time to win", template: "%s · OnCo" },
  description: "Total information dominance on cancer: every technology, target, product, company, institution, pathway, trial, and idea, one page per object, linked, with plain-English TL;DRs.",
  metadataBase: new URL("https://onco.cc"),
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "OnCo", statusBarStyle: "default" },
  alternates: { canonical: "https://onco.cc/", types: FEED_TYPES },
  applicationName: "OnCo",
  keywords: ["oncology", "cancer", "cancer treatments", "clinical trials", "drug targets", "antibody-drug conjugates", "radiopharmaceuticals", "knowledge graph", "open data"],
  openGraph: { title: "OnCo: time to win", description: "The current state of the art, the history, and what is coming, for every cancer.", type: "website", siteName: "OnCo", locale: "en_GB", url: "https://onco.cc/" },
  twitter: { card: "summary_large_image", title: "OnCo: time to win", description: "The current state of the art, the history, and what is coming, for every cancer." },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="shrink-0">
      <rect width="64" height="64" rx="14" fill="#d6336c" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="#fff" strokeWidth="5" />
      <circle cx="32" cy="12" r="4" fill="#fff" />
      <circle cx="50" cy="42" r="4" fill="#fff" />
      <circle cx="14" cy="42" r="4" fill="#fff" />
    </svg>
  );
}

export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#d6336c" }, { media: "(prefers-color-scheme: dark)", color: "#121816" }] };

/**
 * The saved site language is applied to <html lang> and <html dir> before paint by LayerScript and kept in sync
 * by useLayer, so the static "en" here is only the server default. Chrome text in server components goes through
 * <T>, which renders English first and swaps after hydration.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <RegionProvider>
        <ThemeScript />
        <LayerScript />
        <GardenDefs />
        <SkipLink />
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-1.5 sm:gap-3 xl:gap-2 2xl:gap-3">
            <Link href="/" className="inline-flex h-10 shrink-0 items-center gap-2.5 rounded-lg sm:pe-2 font-semibold tracking-tight" aria-label="OnCo home">
              <Mark />
              <span className="text-[15px]">OnCo</span>
              <span className="hidden min-[1800px]:inline text-muted font-normal text-sm">time to win</span>
            </Link>
            <NavMenu />
            {/* Shrinks to an icon at phone widths so the fixed-width controls and the menu button always fit on one row. */}
            <div className="ms-auto flex-1 min-w-10 max-w-[17rem] sm:max-w-xs xl:ms-auto">
              <PaletteTrigger className="w-full h-10 rounded-[0.625rem]" />
            </div>
            <RegionToggle />
            <LayerToggle />
            <ThemeToggle />
            <AccountMenu className="inline-flex" />
            <GitHubStars className="hidden sm:inline-flex" />
            <a href="https://github.com/judegomila/OnCo" rel="noopener" aria-label="OnCo on GitHub" title="GitHub repository" className="ctl ctl-icon hidden sm:inline-flex">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
          </div>
        </header>
        <LangStrip />
        <CommandPalette />
        <RegisterSW />
        <main id="main" className="flex-1">{children}<SectionSiblings /></main>
        <footer className="garden-footer relative border-t border-border mt-28">
          {/* A low grass line grows up from the footer's top edge into the gap above it. */}
          <GardenBackdrop variant="footer" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-[minmax(0,1.6fr)_repeat(6,minmax(0,1fr))] lg:gap-x-8 text-sm">
              <div className="col-span-2 sm:col-span-3 xl:col-span-1">
                <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight"><Mark size={24} /><span>OnCo</span></Link>
                <p className="text-muted max-w-md mt-3 leading-relaxed"><T k="footer.about" /></p>
                <p className="text-muted mt-3 max-w-md leading-relaxed">
                  <strong className="text-foreground/80"><T k="footer.wip" /></strong> <T k="footer.disclaimer" />
                </p>
              </div>
              <FooterNav />
            </div>
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-muted">
              <p><T k="footer.licence" /> <Link href="/about/#licence" className="underline hover:text-foreground"><T k="footer.commercial" /></Link>. <T k="footer.madeBy" /> <a href="https://judegomila.com" rel="noopener author" className="underline hover:text-foreground">Jude Gomila</a>.</p>
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/about/" className="hover:text-foreground hover:underline"><T k="footer.aboutLink" /></Link>
                <Link href="/corrections/" className="hover:text-foreground hover:underline"><T k="footer.corrections" /></Link>
                <Link href="/api/" className="hover:text-foreground hover:underline"><T k="footer.api" /></Link>
                <a href="https://github.com/judegomila/OnCo" rel="noopener" className="hover:text-foreground hover:underline">GitHub</a>
              </p>
            </div>
          </div>
        </footer>
              </RegionProvider>
      </body>
    </html>
  );
}
