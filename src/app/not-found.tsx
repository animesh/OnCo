import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { KindIcon } from "@/components/KindIcon";
import { RouteIcon } from "@/components/RouteIcon";
import { NavIcon } from "@/components/NavIcon";
import { NotFoundHelper } from "@/components/NotFoundHelper";
import { KIND_META, KINDS } from "@/lib/schema";

/** Ways in that are not a kind hub: the anatomical map, the per-cancer view, the full search and home. */
const WAYS_IN: { href: string; title: string; blurb: string }[] = [
  { href: "/body/", title: "Body map", blurb: "Pick where the cancer is to reach its page and the technologies used there." },
  { href: "/for-me/", title: "For me", blurb: "Choose one or more cancers and see everything in OnCo that touches them." },
  { href: "/search/", title: "Full search", blurb: "Word and concept search over every record, with why each result matched." },
  { href: "/", title: "Home", blurb: "The front page: fronts, latest changes and the state of the art." },
];

/**
 * The 404 page. Rendered inside the root layout, so the header, search palette and footer stay. The static
 * export cannot see the failed address on the server, so NotFoundHelper reads it in the browser, searches
 * the index for its words and lists the closest records; the rest of the page is the site's ways in.
 */
export default function NotFound() {
  return (
    <>
      <PageHeader title="That page is not here" lede="The address you followed does not match anything in OnCo, so here are the closest matches and the ways in." seed="not-found" />
      <Container className="pb-16 max-w-5xl space-y-12">
        <NotFoundHelper />

        <section aria-labelledby="nf-search">
          <h2 id="nf-search" className="text-lg font-semibold tracking-tight mb-3 inline-flex items-center gap-2"><NavIcon id="search" className="h-5 w-5 text-accent" />Search OnCo</h2>
          <SearchBox large />
        </section>

        <section aria-labelledby="nf-ways">
          <h2 id="nf-ways" className="text-lg font-semibold tracking-tight mb-3 inline-flex items-center gap-2"><NavIcon id="find" className="h-5 w-5 text-accent" />Other ways in</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WAYS_IN.map((w) => (
              <li key={w.href}>
                <Link href={w.href} className="card card-link p-4 block h-full">
                  <span className="flex items-center gap-2 font-medium"><RouteIcon href={w.href} className="h-5 w-5 text-accent" />{w.title}</span>
                  <span className="block text-sm text-muted mt-1">{w.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="nf-kinds">
          <h2 id="nf-kinds" className="text-lg font-semibold tracking-tight mb-3 inline-flex items-center gap-2"><NavIcon id="map" className="h-5 w-5 text-accent" />Browse by kind</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {KINDS.map((k) => {
              const m = KIND_META[k];
              return (
                <li key={k}>
                  <Link href={`/${m.route}/`} className="card card-link p-4 block h-full">
                    <span className="flex items-center gap-2 font-medium first-letter:uppercase"><KindIcon kind={k} className="h-5 w-5 text-accent" />{m.title ?? m.plural.charAt(0).toUpperCase() + m.plural.slice(1)}</span>
                    <span className="block text-sm text-muted mt-1">{m.blurb}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>
    </>
  );
}
