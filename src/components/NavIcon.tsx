import { KIND_META, KINDS, type Kind } from "@/lib/schema";
const ROUTE_TO_KIND: Record<string, Kind> = Object.fromEntries(KINDS.map((k) => [KIND_META[k].route.replace(/\//g, ""), k]));
import { KindIcon } from "./KindIcon";
import { FrontIcon } from "./FrontIcon";
import { hasRouteIcon, RouteIcon } from "./RouteIcon";
import type { ReactNode } from "react";

/**
 * Monoline wireframe icons for the five navigation groups in src/lib/nav.ts (`find`, `map`,
 * `intel`, `who`, `learn`) plus `github` and `search`. Same grammar as FrontIcon: 24x24 viewBox,
 * 1.5px stroke, currentColor, rounded joins, no fills except tiny dots. Server-safe, no hooks.
 */

type IconProps = { className: string };
type Icon = (p: IconProps) => ReactNode;

function Svg({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

// Start here: compass.
const Find: Icon = (p) => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={9} />
    <path d="M15.5 8.5l-2 5-5 2 2-5Z" />
    <circle cx={12} cy={12} r={1} fill="currentColor" stroke="none" />
  </Svg>
);

// Cancers & treatments: folded map.
const Map: Icon = (p) => (
  <Svg {...p}>
    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2Z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>
);

// News & evidence: newspaper.
const Intel: Icon = (p) => (
  <Svg {...p}>
    <path d="M4 4h13v13a3 3 0 0 0 3 3H7a3 3 0 0 1-3-3Z" />
    <path d="M17 9h3v8" />
    <path d="M7.5 8h6M7.5 11.5h6M7.5 15h6" />
  </Svg>
);

// Institutions & people: two people.
const Who: Icon = (p) => (
  <Svg {...p}>
    <circle cx={9} cy={8} r={3} />
    <path d="M3.5 19.5V18a5.5 5.5 0 0 1 11 0v1.5" />
    <path d="M16 5.1a3 3 0 0 1 0 5.8" />
    <path d="M17.5 12.7a5.5 5.5 0 0 1 3 4.8v2" />
  </Svg>
);

// Learn & contribute: open book.
const Learn: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z" />
    <path d="M12 6.5v13" />
  </Svg>
);

// GitHub: repository fork.
const GitHub: Icon = (p) => (
  <Svg {...p}>
    <circle cx={6} cy={4.5} r={2} />
    <circle cx={18} cy={4.5} r={2} />
    <circle cx={12} cy={19.5} r={2} />
    <path d="M6 6.5v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2M12 11.5v6" />
  </Svg>
);

// Search: magnifier.
const Search: Icon = (p) => (
  <Svg {...p}>
    <circle cx={10.5} cy={10.5} r={6.5} />
    <path d="M15.3 15.3 20.5 20.5" />
  </Svg>
);
const Live: Icon = (p) => (
  <Svg {...p}><path d="M12 20s-6.5-4.2-6.5-9A3.5 3.5 0 0 1 12 8.6 3.5 3.5 0 0 1 18.5 11c0 4.8-6.5 9-6.5 9Z" /><path d="M4 16.5c1.5 1.2 3 1.8 4.5 1.8M20 16.5c-1.5 1.2-3 1.8-4.5 1.8" /></Svg>
);


const ICONS: Record<string, Icon> = {
  find: Find,
  live: Live,
  map: Map,
  intel: Intel,
  who: Who,
  learn: Learn,
  github: GitHub,
  search: Search,
};


/** Icon for a navigation item, derived from its route: kind indexes get their kind glyph, fronts their front glyph, the rest a keyword match. */
export function NavItemIcon({ href, label, className = "h-4 w-4" }: { href: string; label: string; className?: string }) {
  const seg = href.replace(/^\/|\/$/g, "").split("/");
  const kind = ROUTE_TO_KIND[seg[0]];
  if (!(kind && seg.length === 1) && hasRouteIcon(href)) return <RouteIcon href={href} className={className} />;
  if (kind && seg.length === 1) return <KindIcon kind={kind} className={className} />;
  if (seg[0] === "fronts" && seg[1]) return <FrontIcon id={seg[1]} className={className} />;
  const l = (label + " " + href).toLowerCase();
  const pick = (re: RegExp, id: string) => (re.test(l) ? id : null);
  const id = pick(/search|ask|explore|query|path|graph|navigator|landscape|compare|timeline|saved|body/, "find") ?? pick(/trial|evidence|forest|explained|readout|calendar|catalyst/, "trials") ?? pick(/approval|regulat|hta|nhs|coverage|paying|financial|assistance|price|exclusivity|deal|market|pipeline|scorecard|sponsor|manufactur/, "money") ?? pick(/paper|journal|publishing|pulse|digest|preprint|newsletter|news|changelog|history|status|freshness|audit|correction/, "intel") ?? pick(/people|heroes|reviewer|contributor|institution|universit|leadership|compan|countr|case/, "who") ?? pick(/learn|about|roadmap|gap|bottleneck|idea|suggest|eval|api|build|schema|data|teach|path|open/, "learn") ?? pick(/prep|side|symptom|report reader|survivor|second opinion|diet|supportive|for me|live/, "live") ?? pick(/mechanics|atlas|molecule|journey|pathway|dossier|model|question|preclinical|assay|resistance|payload|toxicity|isotope|prevalence|regimen|sequenc|staging|guideline|calculator|interaction|irae|biomarker|tumour/, "map") ?? "search";
  if (id === "trials") return <KindIcon kind="trial" className={className} />;
  if (id === "money") return <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6c0 2.4-5 1.4-5 3.8 0 1 1 1.6 2.5 1.6s2.5-.6 2.5-1.6" /></svg>;
  return <NavIcon id={id} className={className} />;
}

export function NavIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  const Component = ICONS[id] ?? Search;
  return <Component className={className} />;
}
