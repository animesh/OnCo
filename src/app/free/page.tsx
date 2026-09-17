import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { KindIcon } from "@/components/KindIcon";
import { FREE_GROUPS, freeServices, type FreeGroup, type FreeService } from "@/data/free-wave";

export const metadata: Metadata = pageMeta({
  title: "Free in oncology",
  description: "Everything a patient, family or researcher can get at no charge: free tumour and inherited-risk testing, national screening and HPV vaccination, nurse helplines, rides and lodging, second opinions, trial travel help, genetic counselling, survivorship programmes, wigs and prostheses, and open data. Who is eligible, where, and the source.",
  path: "/free/",
});

const domain = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

/** Regions with an OnCo coverage page; other regions render as plain chips. */
const REGION_HREF: Record<string, string> = { UK: "/coverage/uk/", England: "/coverage/uk/", US: "/coverage/us/", "US (California)": "/coverage/us/", "US (calls from anywhere)": "/coverage/us/" };

const ICON_PROPS = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** One line-drawn glyph per group, in the site's stroke style. */
function GroupIcon({ id, className = "h-5 w-5" }: { id: FreeGroup; className?: string }) {
  switch (id) {
    case "testing": return <svg {...ICON_PROPS} className={className}><path d="M9 3v6l-4.5 8A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-3L15 9V3" /><path d="M8 3h8" /><path d="M7.5 14h9" /></svg>;
    case "screening": return <svg {...ICON_PROPS} className={className}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /><path d="M8.5 11h5M11 8.5v5" /></svg>;
    case "hpv": return <svg {...ICON_PROPS} className={className}><path d="M17 3l4 4" /><path d="M19 5l-9 9" /><path d="M6 12l6 6" /><path d="M4 20l3-3" /><path d="M9 15l2-2M11 17l2-2" /></svg>;
    case "helplines": return <svg {...ICON_PROPS} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
    case "travel": return <svg {...ICON_PROPS} className={className}><path d="M3 17h18" /><path d="M5 17V11l3-5h8l3 5v6" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /><path d="M5 11h14" /></svg>;
    case "second-opinion": return <svg {...ICON_PROPS} className={className}><path d="M4 5h10v8H8l-4 3z" /><path d="M14 9h6v8h-2l-3 2v-2h-1" /></svg>;
    case "trials": return <svg {...ICON_PROPS} className={className}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v3h6V3" /><path d="M8 11h8M8 15h5" /></svg>;
    case "drugs": return <svg {...ICON_PROPS} className={className}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" /><path d="M9.5 9.5l5 5" /></svg>;
    case "genetics": return <svg {...ICON_PROPS} className={className}><path d="M8 3c0 6 8 6 8 12s-8 6-8 6" /><path d="M16 3c0 6-8 6-8 12s8 6 8 6" /><path d="M8.5 6.5h7M8.5 17.5h7" /></svg>;
    case "survivorship": return <svg {...ICON_PROPS} className={className}><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /><path d="M8 12h2l1.5-3 2 6 1.5-3h1" /></svg>;
    case "wigs": return <svg {...ICON_PROPS} className={className}><path d="M6 20v-6a6 6 0 0 1 12 0v6" /><path d="M6 20h12" /><path d="M9 12c-1 2-1 5 0 8M15 12c1 2 1 5 0 8" /></svg>;
    case "data": return <svg {...ICON_PROPS} className={className}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>;
  }
}

function RegionChip({ where }: { where: string }) {
  const href = REGION_HREF[where];
  const cls = "chip border border-border bg-card text-xs";
  return href ? <Link href={href} className={`${cls} hover:bg-foreground/5`} title="How care is paid for here">{where}</Link> : <span className={cls}>{where}</span>;
}

function ServiceCard({ s }: { s: FreeService }) {
  const g = graph();
  const coll = s.collection ? g.get(s.collection) : undefined;
  const entities = (s.entityIds ?? []).map((id) => g.get(id)).filter((e): e is NonNullable<typeof e> => Boolean(e));
  return (
    <li id={s.id} className="card p-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">
          {coll ? <Link href={routeFor(coll)} className="hover:underline">{s.name}</Link> : <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a>}
        </h3>
        <RegionChip where={s.where} />
      </div>
      <p className="text-[15px] leading-relaxed">{s.what}</p>
      <dl className="text-sm text-muted grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="kicker">Who</dt><dd>{s.who}</dd>
        {s.phone && <><dt className="kicker">Call</dt><dd><a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{s.phone}</a></dd></>}
      </dl>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="chip border border-border bg-card hover:bg-foreground/5" title="Source: the programme's own page">{domain(s.url)}</a>
        {s.internal && <Link href={s.internal.href} className="chip border border-border bg-card hover:bg-foreground/5">{s.internal.label}</Link>}
        {entities.map((e) => (
          <Link key={e.id} href={routeFor(e)} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1"><KindIcon kind={e.kind} className="h-3 w-3" />{e.name}</Link>
        ))}
      </div>
    </li>
  );
}

export default function FreePage() {
  const groups = FREE_GROUPS.map((gr) => ({ ...gr, items: freeServices.filter((s) => s.group === gr.id) })).filter((gr) => gr.items.length);
  const regions = new Set(freeServices.map((s) => s.where.split(" (")[0]));

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="live"><span className="kicker">·</span><Link href="/assistance/" className="kicker hover:underline">Financial help</Link><span className="kicker">·</span><Link href="/second-opinion/" className="kicker hover:underline">Second opinion</Link></GroupKicker>}
        title="Free in oncology"
        lede={`What you can get for nothing. ${freeServices.length} programmes and services across ${groups.length} groups and ${regions.size} regions: sequencing paid for by charities and health services, screening and vaccination that are free at the point of use, nurse lines, rides and beds near the hospital, second opinions, help with trial travel, genetic counselling, survivorship programmes, wigs and prostheses, and the open data researchers build on. Each entry says who is eligible and links to the programme's own page.`}
      />
      <Container className="pb-16">
        <div className="card p-4 text-sm text-muted max-w-3xl border-amber-300/60 dark:border-amber-700/60">
          <div className="kicker mb-1">Read this first</div>
          <p>Eligibility rules change and differ by country, so the linked page is the authority; OnCo lists only programmes with a public page of their own. Free at the point of use means no bill when you attend, not that nobody pays. Nothing here is medical advice: screening is for people without symptoms, and anyone with symptoms should see a doctor. For manufacturer free-drug programmes, reimbursement and generics, product by product, use the <Link href="/assistance/" className="underline">financial help</Link> page.</p>
        </div>

        <nav aria-label="Groups" className="mt-8 flex flex-wrap gap-2">
          {groups.map((gr) => (
            <a key={gr.id} href={`#${gr.id}`} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1.5"><GroupIcon id={gr.id} className="h-3.5 w-3.5" />{gr.title}<span className="text-muted">{gr.items.length}</span></a>
          ))}
        </nav>

        {groups.map((gr) => (
          <section key={gr.id} id={gr.id} className="mt-12 scroll-mt-20">
            <div className="flex items-start gap-3 mb-1">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card"><GroupIcon id={gr.id} className="h-4 w-4" /></span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight leading-snug"><a href={`#${gr.id}`} className="hover:underline">{gr.title}</a></h2>
                <p className="text-sm text-muted max-w-3xl">{gr.blurb}</p>
              </div>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gr.items.map((s) => <ServiceCard key={s.id} s={s} />)}
            </ul>
          </section>
        ))}

        <section className="mt-12 card p-4 text-sm text-muted max-w-3xl">
          <div className="kicker mb-1">Missing something?</div>
          <p>If a free programme with a public page is not here, send it through the <Link href="/corrections/" className="underline">corrections</Link> page with the link. Programmes without a page of their own, and offers that are discounted rather than free, are left out on purpose.</p>
        </section>
      </Container>
    </>
  );
}
