import Link from "next/link";
import type { Entity, Kind } from "@/lib/schema";
import { KIND_META, routeFor } from "@/lib/schema";
import { KIND_COLOR, statusClass } from "@/lib/text";
import { NAV_GROUPS } from "@/lib/nav";
import { DrugChip } from "./DrugChip";
import { NavIcon } from "./NavIcon";
import { GardenBackdrop, gardenSeed } from "./Garden";
import { KindName, StatusName } from "./T";
import { GroupText } from "./NavText";
import { TldrText } from "./TldrText";
import { EN_TEXT, nameAttrs } from "@/lib/translate";

export function KindChip({ kind }: { kind: Kind }) {
  return <span className={`chip border ${KIND_COLOR[kind]}`}><KindName kind={kind} form="label" fallback={KIND_META[kind].label} /></span>;
}

export function StatusChip({ status }: { status?: string }) {
  if (!status) return null;
  return <span className={`chip ${statusClass(status)}`}><StatusName status={status} /></span>;
}

/** A record's name as a link. Proper-noun kinds (drugs, genes, companies, trials, people) carry translate="no"; see src/lib/translate.ts. */
export function EntityLink({ e, className = "" }: { e: Entity; className?: string }) {
  return (
    <Link href={routeFor(e)} {...nameAttrs(e.kind, `underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground ${className}`)}>
      {e.name}
    </Link>
  );
}

export function EntityCard({ e, compact = false }: { e: Entity; compact?: boolean }) {
  return (
    <Link href={routeFor(e)} className="card block p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <KindChip kind={e.kind} />
        <StatusChip status={e.status} />
      </div>
      <div {...nameAttrs(e.kind, "font-semibold leading-snug text-balance")}>{e.name}</div>
      {!compact && <p className="text-sm text-muted mt-1.5 line-clamp-3"><TldrText id={e.id} tldr={e.tldr} simple={e.simple} /></p>}
    </Link>
  );
}

export function ChipList({ items, kind }: { items: Entity[]; kind?: Kind }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((e) => e.kind === "drug" ? (
        <DrugChip key={e.id} id={e.id} name={e.name} route={routeFor(e)} tldr={e.tldr} className={KIND_COLOR[kind ?? e.kind]} />
      ) : (
        <Link key={e.id} href={routeFor(e)} {...nameAttrs(e.kind, `chip border transition-[filter] hover:brightness-95 dark:hover:brightness-125 ${KIND_COLOR[kind ?? e.kind]}`)}>
          {e.name}
        </Link>
      ))}
    </div>
  );
}

/** Kicker naming the navigation section a page belongs to, linking to that section's landing page. */
export function GroupKicker({ id, children }: { id: string; children?: React.ReactNode }) {
  const g = NAV_GROUPS.find((x) => x.id === id);
  if (!g) return null;
  return (
    <>
      <Link href={g.href} className="kicker inline-flex items-center gap-1.5 py-1.5 -my-1.5 hover:text-foreground"><NavIcon id={g.id} className="h-3.5 w-3.5" /><GroupText id={g.id} /></Link>
      {children}
    </>
  );
}

/**
 * Page title block. A faint leaf spray or frond sits in the top-right corner (chosen by a hash of the
 * title so pages differ; hidden on phones). `tone="band"` adds the soft garden wash used by group
 * landing pages, echoing the home hero.
 */
export function PageHeader({ kicker, title, lede, ledeNode, right, logo, tone = "plain", seed, titleAttrs }: { kicker?: React.ReactNode; title: React.ReactNode; lede?: string; ledeNode?: React.ReactNode; right?: React.ReactNode; logo?: React.ReactNode; tone?: "plain" | "band"; /** Stable string for the decorative seed when `title` is not a plain string. */ seed?: string; /** `lang` and `translate` for the h1 (see `nameAttrs` in src/lib/translate.ts): a drug or gene name must not be translated, an English heading may be. */ titleAttrs?: ReturnType<typeof nameAttrs> }) {
  const inner = (
    <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10 ${tone === "band" ? "pb-10 sm:pb-12" : "pb-6"}`}>
      <GardenBackdrop variant="page" seed={gardenSeed(seed ?? (typeof title === "string" ? title : ""))} />
      <div className="relative">
        {kicker && <div className="mb-2 flex flex-wrap items-center gap-2">{kicker}</div>}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 max-w-3xl">
            {logo}
            <h1 lang={titleAttrs?.lang} translate={titleAttrs?.translate} className={`text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] first-letter:uppercase ${titleAttrs?.translate ? "notranslate" : ""}`}>{title}</h1>
          </div>
          {right}
        </div>
        {(ledeNode || lede) && <p className="mt-3 text-[17px] sm:text-lg text-foreground/85 max-w-3xl leading-relaxed">{ledeNode ?? lede}</p>}
      </div>
    </div>
  );
  return tone === "band" ? <div className="garden-band border-b border-border mb-8">{inner}</div> : inner;
}

export function Section({ title, children, id, aside }: { title: string; children: React.ReactNode; id?: string; aside?: React.ReactNode }) {
  return (
    <section id={id} className="mt-10">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 className="text-lg font-semibold tracking-tight leading-snug">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

/** Bulleted list of record text. The items stay English whatever the site language, hence lang="en". */
export function Bullets({ items, linked }: { items: string[]; linked?: (s: string) => React.ReactNode }) {
  if (!items.length) return null;
  return (
    <ul {...EN_TEXT} className="list-disc ps-5 space-y-1.5 text-[15px] leading-relaxed">
      {items.map((s, i) => <li key={i}>{linked ? linked(s) : s}</li>)}
    </ul>
  );
}
