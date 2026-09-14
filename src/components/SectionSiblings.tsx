"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";
import { NavItemIcon } from "./NavIcon";
import { GroupText, ItemText } from "./NavText";

/**
 * "More in this section": at the foot of every navigation page, the sibling pages of its group(s) as icon chips,
 * so each tool page cross-links to the rest of its section without every page having to hand-write the list.
 * Entity pages and pages outside the navigation render nothing (they carry their own related-pages blocks).
 */
export function SectionSiblings() {
  const path = usePathname();
  const groups = NAV_GROUPS.filter((g) => g.items.some((it) => it.href === path));
  if (!groups.length || path === "/") return null;
  return (
    <aside aria-label="More in this section" className="mx-auto max-w-6xl px-4 sm:px-6 mt-16">
      {groups.map((g) => (
        <div key={g.id} className="card p-4 mb-3">
          <div className="kicker mb-2 inline-flex items-center gap-1.5"><Link href={g.href} className="hover:text-foreground">More in <GroupText id={g.id} /></Link></div>
          <ul className="flex flex-wrap gap-1.5">
            {g.items.filter((it) => it.href !== path && !it.href.startsWith("http")).map((it) => (
              <li key={it.href}>
                <Link href={it.href} title={it.blurb} className="chip border border-border bg-card hover:bg-foreground/5 hover:text-accent inline-flex items-center gap-1.5">
                  <NavItemIcon href={it.href} label={it.label} className="h-3.5 w-3.5 shrink-0" />
                  <ItemText href={it.href} groupId={g.id} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
