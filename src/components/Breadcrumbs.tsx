import Link from "next/link";
import type { Crumb } from "@/lib/seo";
import { KIND_META, KINDS } from "@/lib/schema";
import { KindName, T } from "./T";

/** Kind whose route or public title matches a crumb label ("Treatments & tests", "cancers"), for translation. */
function kindForLabel(label: string) {
  return KINDS.find((k) => { const m = KIND_META[k]; return label === (m.title ?? m.plural) || label === m.plural || label === m.label; });
}

/**
 * Visible breadcrumb trail (Home › Kind › Name). Mirrors the BreadcrumbList JSON-LD emitted by `JsonLd`, which is
 * built from the same `Crumb[]`, so the two never disagree. The last crumb is the current page and is not a link.
 * "Home" and kind names follow the site language; entity names stay as written.
 */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;
  const text = (c: Crumb, i: number) => {
    if (i === 0 && c.href === "/") return <T k="home" />;
    const k = kindForLabel(c.label);
    return k ? <KindName kind={k} form={KIND_META[k].title === c.label ? "title" : c.label === KIND_META[k].label ? "label" : "plural"} fallback={c.label} /> : c.label;
  };
  return (
    <nav aria-label="Breadcrumb" className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-5 -mb-4 text-xs text-muted ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-x-1.5 min-w-0">
              {i > 0 && <span aria-hidden className="text-muted/70 rtl:-scale-x-100">›</span>}
              {last
                ? <Link href={c.href} aria-current="page" className="truncate max-w-[60vw] text-foreground/80 hover:text-foreground hover:underline underline-offset-2">{text(c, i)}</Link>
                : <Link href={c.href} className="text-accent hover:underline underline-offset-2">{text(c, i)}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
