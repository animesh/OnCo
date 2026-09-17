"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSearch } from "./SearchBox";
import { KindIcon } from "./KindIcon";
import type { SearchDoc } from "@/lib/search-index";
import { KIND_META, type Kind } from "@/lib/schema";
import { KIND_COLOR, STATUS_LABEL, statusClass } from "@/lib/text";
import { brokenLinkIssueUrl, kindFromPath, MISSED_PATHS_KEY, parseMissed, pathToQuery, recordMiss } from "@/lib/not-found-query";

const TOP = 8;

type State = { path: string; query: string; kind: Kind | null; referrer: string; rows: SearchDoc[] | null };

/**
 * The useful half of the 404 page. Reads the failed address from the browser (the export has no server),
 * turns its words into a search over the same index the search box uses, and lists the closest records
 * and pages. The miss is appended to a local list ("onco:missed-paths", newest 50) so a visitor or the
 * owner can see what was asked for; nothing is sent anywhere unless the report link is clicked.
 */
export function NotFoundHelper() {
  const [s, setS] = useState<State | null>(null);

  useEffect(() => {
    let live = true;
    // Deferred a frame: the address is an external fact read once after mount, like ?q= on the search page.
    const id = requestAnimationFrame(() => {
      const path = window.location.pathname;
      const query = pathToQuery(path);
      const kind = kindFromPath(path);
      const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
      try { localStorage.setItem(MISSED_PATHS_KEY, JSON.stringify(recordMiss(parseMissed(localStorage.getItem(MISSED_PATHS_KEY)), path))); } catch { /* private mode or full */ }
      setS({ path, query, kind, referrer, rows: query ? null : [] });
      if (!query) return;
      loadSearch()
        .then(({ ms }) => { if (live) setS((prev) => (prev ? { ...prev, rows: ms.search(query).slice(0, TOP) as unknown as SearchDoc[] } : prev)); })
        .catch(() => { if (live) setS((prev) => (prev ? { ...prev, rows: [] } : prev)); });
    });
    return () => { live = false; cancelAnimationFrame(id); };
  }, []);

  if (!s) return <p className="text-sm text-muted">Looking for the nearest match…</p>;
  const hub = s.kind ? KIND_META[s.kind] : null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted break-all">
        Address asked for: <code className="rounded bg-foreground/5 px-1.5 py-0.5 text-foreground">{s.path}</code>
        {" · "}
        <a href={brokenLinkIssueUrl(s.path, s.referrer)} rel="noopener" className="underline hover:text-foreground">Report this broken link</a>
      </p>

      {s.query && (
        <section aria-labelledby="nf-suggest">
          <h2 id="nf-suggest" className="text-lg font-semibold tracking-tight mb-3 inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4" /></svg>
            Were you looking for one of these?
          </h2>
          {s.rows === null && <p className="text-sm text-muted">Searching for &ldquo;{s.query}&rdquo;…</p>}
          {s.rows && s.rows.length === 0 && (
            <p className="text-sm text-muted">Nothing in OnCo matches &ldquo;{s.query}&rdquo;. {hub ? <>Browse <Link href={`/${hub.route}/`} className="underline hover:text-foreground">all {hub.plural}</Link> or </> : "Try "}<Link href={`/search/?q=${encodeURIComponent(s.query)}`} className="underline hover:text-foreground">the full search</Link>, which also matches concepts.</p>
          )}
          {s.rows && s.rows.length > 0 && (
            <>
              <ol className="space-y-2">
                {s.rows.map((r) => (
                  <li key={r.id}>
                    <Link href={r.route} className="card card-link p-3 flex items-start gap-3 block">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={`chip border inline-flex items-center gap-1 ${r.kind === "page" ? "border-border text-muted" : KIND_COLOR[r.kind]}`}>{r.kind !== "page" && <KindIcon kind={r.kind} className="h-3 w-3" />}{r.kind === "page" ? "Page" : KIND_META[r.kind].label}</span>
                          <span className="font-medium">{r.name}</span>
                          {r.status && <span className={`chip ${statusClass(r.status)}`}>{STATUS_LABEL[r.status] ?? r.status}</span>}
                        </span>
                        <span className="block text-sm text-muted mt-1 line-clamp-2">{r.tldr}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
                <Link href={`/search/?q=${encodeURIComponent(s.query)}`} className="underline hover:text-foreground">All results for &ldquo;{s.query}&rdquo;</Link>
                {hub && <Link href={`/${hub.route}/`} className="underline hover:text-foreground">All {hub.plural}</Link>}
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
