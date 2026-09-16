import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CachedPages } from "@/components/RegisterSW";

export const metadata: Metadata = pageMeta({ title: "Offline", description: "OnCo works offline for pages you have already visited. This page lists what this browser has cached.", path: "/offline/", noindex: true });

/** Shown by the service worker when a page is requested offline and is not cached; also reachable directly. */
export default function OfflinePage() {
  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="You are offline" lede="OnCo is a static site, so anything you have opened before is still here. Search runs from a cached index. Pages you have not visited need a connection the first time." />
      <Container className="pb-16 max-w-3xl space-y-8">
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">Pages available in this browser</h2>
          <CachedPages />
        </section>
        <section className="card p-4 text-sm">
          <div className="kicker mb-1">If you are online and still see this</div>
          <p>Reload the page once; a slow connection can run past the short wait the offline copy is given. If every page on onco.cc shows this while other sites load, a work or school network is probably blocking the domain name: try the same page on mobile data, and ask the network administrator to allow onco.cc and www.onco.cc.</p>
        </section>
        <section className="card p-4 text-sm text-muted">
          <div className="kicker mb-1">How this works</div>
          <p>A service worker keeps a copy of the site shell, the search index, the molecule structures you have seen and up to a few hundred visited pages. When the network is slow or absent it serves those copies. Nothing about you is stored; the cache holds only public pages. Install OnCo from your browser menu to open it like an app.</p>
          <p className="mt-2">Your <Link className="underline" href="/saved/">saved views and watchlist</Link> are kept separately in this browser and work offline too.</p>
        </section>
      </Container>
    </>
  );
}
