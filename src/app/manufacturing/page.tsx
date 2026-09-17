import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, ChipList } from "@/components/ui";
import { FrontIcon } from "@/components/FrontIcon";
import { KindIcon } from "@/components/KindIcon";
import { ManufacturingMap, type SiteRow } from "@/components/ManufacturingMap";
import { manufacturingSites, CAPABILITY_LABEL } from "@/data/manufacturing";
import { supplyChains } from "@/data/manufacturing-wave";

export const metadata: Metadata = pageMeta({ title: "Manufacturing map", description: "Where ADCs are conjugated, cell therapies and viral vectors are made, and medical isotopes are produced: contract manufacturers and in-house sites on a world map, plus the seven supply chains behind cancer medicines and machines, from API synthesis and sterile generics to reactors, cyclotrons and linac factories.", path: "/manufacturing/" });

export default function ManufacturingPage() {
  const g = graph();
  const link = (e: Entity) => ({ id: e.id, name: e.name, route: routeFor(e) });
  const ents = (ids: string[]) => ids.map((id) => g.get(id)).filter((x): x is Entity => !!x);
  const sites: SiteRow[] = manufacturingSites.map((s) => {
    const op = s.operatorId ? g.get(s.operatorId) : undefined;
    const bn = s.bottleneckId ? g.get(s.bottleneckId) : undefined;
    return {
      id: s.id, name: s.name, operator: s.operator, operatorRoute: op ? routeFor(op) : undefined, ownership: s.ownership,
      city: s.city, country: s.country, lat: s.lat, lng: s.lng, capabilities: s.capabilities, capacity: s.capacity,
      customers: s.customers.map((id) => g.get(id)).filter((x): x is Entity => !!x).map(link),
      drugs: (s.drugs ?? []).map((id) => g.get(id)).filter((x): x is Entity => !!x).map(link),
      bottleneck: bn ? link(bn) : undefined, source: s.source,
    };
  });
  const counts = new Map<string, number>();
  for (const s of manufacturingSites) for (const c of s.capabilities) counts.set(c, (counts.get(c) ?? 0) + 1);
  const cdmo = manufacturingSites.filter((s) => s.ownership === "cdmo").length;
  const chains = supplyChains.map((c) => ({ ...c, section: g.get(c.sectionId), technologies: ents(c.technologies), companies: ents(c.companies), products: ents(c.products) }));
  const chainTech = new Set(supplyChains.flatMap((c) => c.technologies)).size;
  const chainCos = new Set(supplyChains.flatMap((c) => c.companies)).size;
  const gmp = g.get("pharmaceutical-gmp-inspections");
  const shortage = g.get("sterile-injectable-generics-manufacturing");
  return (
    <>
      <PageHeader kicker={<GroupKicker id="who" />} title="Manufacturing map"
        lede={`${manufacturingSites.length} sites, ${cdmo} of them contract manufacturers: ${counts.get("adc-conjugation") ?? 0} conjugate ADCs, ${counts.get("cell-therapy") ?? 0} make cell therapies, ${counts.get("radioisotope") ?? 0} produce medical isotopes. Below the map, ${supplyChains.length} supply chains trace ${chainTech} manufacturing technologies and ${chainCos} makers from raw material to the medicine or machine at the end.`} />
      <Container className="pb-16">
        <ManufacturingMap sites={sites} />
        <section className="grid md:grid-cols-2 gap-6 text-sm mt-10">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base inline-flex items-center gap-2"><KindIcon kind="bottleneck" className="h-5 w-5 text-accent" />Why capacity is a bottleneck</h2>
            <p>An ADC needs three supply chains (antibody, payload-linker, conjugation) and only a handful of sites can conjugate at commercial scale with highly potent payloads. Autologous CAR-T is made one patient at a time, so slots, vector and trained staff set how many patients can be treated: see <Link href={routeFor(g.must("b-manufacturing-cell-therapy"))} className="underline">the cell therapy manufacturing bottleneck</Link>. Radioligand therapy is limited by isotope production and same-week logistics: see the <Link href="/isotopes/" className="underline">isotope supply tracker</Link>.</p>
            <p>Most China-origin ADCs licensed to Western companies were made at WuXi XDC; the Singapore site and the new Lonza, Samsung Biologics and Abzena suites are the supply-chain response.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base inline-flex items-center gap-2"><KindIcon kind="paper" className="h-5 w-5 text-accent" />Sourcing</h2>
            <p>Each site links to the operator&rsquo;s own facility page or announcement. Capacity is described in the operator&rsquo;s words; volumes appear only where they have been published. Customers are listed only for publicly announced relationships, so most contract sites show none. Coordinates are the city.</p>
            <p>Capabilities: {(Object.keys(CAPABILITY_LABEL) as Array<keyof typeof CAPABILITY_LABEL>).map((c) => CAPABILITY_LABEL[c]).join(", ")}. Add a site in <code className="text-xs">src/data/manufacturing.ts</code>.</p>
          </div>
        </section>

        <section id="supply-chains" className="mt-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent"><KindIcon kind="pathway" className="h-6 w-6" /></span>
            <h2 className="text-xl font-semibold tracking-tight">Supply chains</h2>
          </div>
          <p className="text-sm text-muted max-w-3xl mb-3">Each card is one chain, read left to right: the manufacturing steps in order, the companies that run them, and the medicines or machines that depend on them. Shortages and recalls are recorded on the technology pages with their FDA or ASHP sources; inspection findings appear only as a class, see {gmp ? <Link href={routeFor(gmp)} className="underline">GMP, inspections and warning letters</Link> : "the GMP record"}. The 2023 platinum shortage is worked through in {shortage ? <Link href={routeFor(shortage)} className="underline">generic sterile injectables</Link> : "the sterile generics record"}.</p>
          <nav aria-label="Supply chains" className="flex flex-wrap gap-1.5 mb-6">
            {chains.map((c) => <a key={c.id} href={`#chain-${c.id}`} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5"><FrontIcon id={c.sectionId} className="h-3.5 w-3.5" />{c.name}</a>)}
          </nav>
          <div className="grid lg:grid-cols-2 gap-6">
            {chains.map((c) => (
              <article key={c.id} id={`chain-${c.id}`} className="card p-5 space-y-3 text-sm">
                <header className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent"><FrontIcon id={c.sectionId} className="h-6 w-6" /></span>
                  <div>
                    <h3 className="text-base font-semibold leading-snug">{c.name}</h3>
                    <p className="text-muted mt-0.5">{c.summary}{c.section ? <> Front: <Link href={routeFor(c.section)} className="underline">{c.section.name}</Link>.</> : null}</p>
                  </div>
                </header>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted mb-1.5 inline-flex items-center gap-1.5"><KindIcon kind="technology" className="h-3.5 w-3.5" />Steps ({c.technologies.length})</h4>
                  <ol className="flex flex-wrap items-center gap-1.5">
                    {c.technologies.map((t, i) => (
                      <li key={t.id} className="inline-flex items-center gap-1.5">
                        <Link href={routeFor(t)} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5"><span className="text-muted tabular-nums">{i + 1}</span>{t.name}</Link>
                        {i < c.technologies.length - 1 ? <span aria-hidden className="text-muted">&rarr;</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted mb-1.5 inline-flex items-center gap-1.5"><KindIcon kind="company" className="h-3.5 w-3.5" />Makers ({c.companies.length})</h4>
                  <ChipList items={c.companies} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted mb-1.5 inline-flex items-center gap-1.5"><KindIcon kind={c.id === "machines" ? "technology" : "drug"} className="h-3.5 w-3.5" />{c.id === "machines" ? "Machines at the end of the chain" : "Products at the end of the chain"} ({c.products.length})</h4>
                  <ChipList items={c.products} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
