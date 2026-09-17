import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity } from "@/lib/schema";
import { logoFor } from "@/lib/logos";
import { flagFor } from "@/lib/flags";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { FrontIcon } from "@/components/FrontIcon";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef, type LinkItem } from "@/components/EntityBrowser";

export const metadata: Metadata = pageMeta({ title: "Machines", path: "/machines/", description: "The scanners, accelerators, endoscopes, robots, ablation devices, radiotherapy guidance and QA hardware, pharmacy robots and cooling caps hospitals use against cancer: what each machine does, what it is used for, its advantages and limits against the alternatives, who makes it, and which centres run the rare ones such as proton and carbon-ion therapy, BNCT, Gamma Knife, MR-linacs and focused ultrasound for the brain." });

/** Machine families, in the order they appear; each lists technology ids (existing and machine-wave records) and the front whose icon represents it. */
const FAMILIES: Array<{ name: string; icon: string; blurb: string; ids: string[] }> = [
  { name: "Imaging scanners", icon: "imaging", blurb: "How tumours are found, staged and measured.", ids: ["x-ray-radiography-fluoroscopy", "ct", "dual-energy-spectral-ct", "photon-counting-ct", "ultrasound", "ultrasound-elastography-ceus", "mri", "mri-field-strengths", "breast-mri-coils-abbreviated-mri", "mammography", "contrast-enhanced-mammography", "ai-mammography-screening", "pet", "pet-ct", "pet-mri", "total-body-pet-screening", "nuclear-medicine-hardware", "spect", "spect-ct", "intraoperative-mri-ct", "optical-imaging"] },
  { name: "Endoscopes and clinic imaging", icon: "early-detection", blurb: "Scopes, capsules and cameras that look inside the gut, airway, cervix and skin.", ids: ["endoscopic-ultrasound-systems", "robotic-bronchoscopy", "capsule-endoscopy-systems", "ai-endoscopy-detection", "cystoscopy-turbt", "colposcopes-digital-cervical-screening", "dermoscopy-ai", "confocal-oct-skin-imaging"] },
  { name: "Radiotherapy machines", icon: "radiation", blurb: "Photon and electron beams, from the everyday linac to dedicated radiosurgery units.", ids: ["c-arm-linac", "ring-gantry-linac", "tomotherapy", "mr-linac", "cyberknife", "gamma-knife", "zap-x", "biology-guided-radiotherapy", "radiosurgery-srs", "brachytherapy-afterloaders", "intraoperative-radiotherapy", "electron-beam-therapy-systems", "total-skin-electron-therapy", "superficial-radiotherapy", "lattice-radiotherapy", "flash-rt", "flash-research-accelerators", "cobalt-60-teletherapy"] },
  { name: "Radiotherapy guidance and quality", icon: "radiation", blurb: "The planning software, cameras, imagers, record systems and dosimeters that make a beam accurate.", ids: ["treatment-planning-systems", "knowledge-based-planning", "oncology-information-systems", "in-room-imaging-systems", "patient-positioning-surface-guidance-systems", "surface-guided-radiotherapy", "respiratory-gating-tumour-tracking-systems", "respiratory-motion-management", "radiotherapy-qa-phantoms-dosimeters", "in-vivo-dosimetry"] },
  { name: "Particle therapy", icon: "radiation", blurb: "Protons, carbon ions and neutrons: the machines that stop inside the tumour.", ids: ["proton-therapy", "proton-therapy-systems", "carbon-ion", "carbon-ion-synchrotrons", "bnct", "bnct-accelerator-systems"] },
  { name: "Ablation and energy devices", icon: "devices", blurb: "Heat, cold, sound, light, electric pulses and fields delivered through a needle or from outside.", ids: ["thermal-ablation", "cryoablation-systems", "microwave-rf-ablation", "irreversible-electroporation", "electrochemotherapy", "electrochemotherapy-devices", "hifu-histotripsy", "bbb-focused-ultrasound", "transcranial-focused-ultrasound-systems", "litt", "litt-systems", "hyperthermia", "hyperthermia-systems", "magnetic-nanoparticle-hyperthermia", "photoimmunotherapy", "photodynamic-therapy-lasers", "hipec", "hipec-pipac-devices", "ttfields"] },
  { name: "Surgical machines", icon: "surgery", blurb: "Robots, navigation, cameras and probes in the operating theatre.", ids: ["robotic-surgery", "surgical-robot-platforms", "fluorescence-guided-surgery", "intraoperative-fluorescence-imaging-systems", "sentinel-node", "gamma-probes-dose-calibrators"] },
  { name: "Chemotherapy delivery and supportive devices", icon: "chemotherapy", blurb: "Pharmacy robots, sealed connectors, pumps and cooling caps around the chemotherapy chair.", ids: ["pharmacy-automation", "closed-system-transfer-devices", "infusion-devices-vascular-access", "scalp-cooling"] },
  { name: "Laboratory and production", icon: "diagnostics", blurb: "The instruments behind pathology, blood tests, sequencing and tracer supply.", ids: ["whole-slide-scanners", "flow-cytometers", "spatial-biology-instruments", "next-gen-short-read-platforms", "long-read-sequencing", "medical-cyclotrons-synthesis-modules", "cyclotron-isotope-production"] },
];

/** Machines rare enough that where they are matters; the location section lists every centre in the corpus that runs each. */
const EXOTIC = ["proton-therapy-systems", "carbon-ion-synchrotrons", "mr-linac", "gamma-knife", "cyberknife", "tomotherapy", "zap-x", "biology-guided-radiotherapy", "hifu-histotripsy", "ttfields", "bnct", "bnct-accelerator-systems", "transcranial-focused-ultrasound-systems", "litt-systems", "hyperthermia-systems", "electrochemotherapy-devices", "flash-research-accelerators", "hipec-pipac-devices"];

const REGION = new Intl.DisplayNames(["en-GB"], { type: "region" });
const countryName = (code: string) => { try { return REGION.of(code) ?? code; } catch { return code; } };
const link = (e: Entity): LinkItem => ({ label: e.name.split(" (")[0], href: routeFor(e), tip: e.tldr });

/** Vendors of a machine: companies the record names plus companies whose record names the machine. */
function vendorsOf(g: ReturnType<typeof graph>, t: Entity): Entity[] {
  const out = new Map<string, Entity>();
  for (const id of t.companies) { const c = g.get(id); if (c) out.set(id, c); }
  for (const c of g.incoming(t.id).get("company") ?? []) out.set(c.id, c);
  return [...out.values()].sort((a, b) => a.name.localeCompare(b.name));
}
/** Centres running a machine: institutions the record names plus institutions whose record names the machine. */
function centresOf(g: ReturnType<typeof graph>, t: Entity): Entity[] {
  const out = new Map<string, Entity>();
  for (const id of t.institutions) { const i = g.get(id); if (i) out.set(id, i); }
  for (const i of g.incoming(t.id).get("institution") ?? []) out.set(i.id, i);
  return [...out.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function MachinesPage() {
  const g = graph();
  const rows: BrowserRow[] = [];
  let vendorCount = new Set<string>(), centreCount = new Set<string>();
  for (const f of FAMILIES) {
    for (const id of f.ids) {
      const t = g.get(id); if (!t || t.kind !== "technology") continue;
      const vendors = vendorsOf(g, t); const centres = centresOf(g, t);
      vendors.forEach((v) => vendorCount.add(v.id)); centres.forEach((c) => centreCount.add(c.id));
      const cancers = t.cancers.map((c) => g.get(c)).filter((x): x is Entity => !!x);
      const logo = vendors.map((v) => logoFor(v.id, v.kind === "company" ? v.website : undefined).src).find(Boolean);
      rows.push({
        id: t.id, name: t.name, tldr: t.tldr, route: routeFor(t), status: t.status, logo, avatar: "org",
        schematic: { id: t.id, sections: t.sections },
        facets: { family: [f.name], front: t.sections.map((s) => g.get(s)?.name ?? s), rarity: [centres.length >= 10 ? "Widespread in the corpus" : centres.length > 0 ? "Few named centres" : "Not tracked by centre"], era: t.since ? [String(t.since).slice(0, 3) + "0s"] : ["Not dated"] },
        cols: {
          vendors: vendors.map(link), centres: centres.map(link), cancers: cancers.slice(0, 8).map(link),
          strength: t.strengths[0], limit: t.limitations[0], since: t.since,
        },
        sortKeys: { vendors: vendors.length, centres: centres.length, since: typeof t.since === "number" ? t.since : 0 },
      });
    }
  }
  vendorCount = new Set(vendorCount); centreCount = new Set(centreCount);
  const facets: FacetDef[] = [
    { key: "family", label: "Family", searchable: false, width: "w-52", order: FAMILIES.map((f) => f.name) },
    { key: "front", label: "Front", searchable: false, width: "w-40" },
    { key: "rarity", label: "Where it is", searchable: false, width: "w-48", order: ["Widespread in the corpus", "Few named centres", "Not tracked by centre"] },
    { key: "era", label: "First used", searchable: false, width: "w-32" },
  ];
  const columns: ColDef[] = [
    { key: "vendors", label: "Vendors", sortable: true, numeric: true, tip: "Companies in the corpus that make the machine; sorted by how many." },
    { key: "centres", label: "Centres that run it", sortable: true, numeric: true, hide: "hidden md:table-cell", tip: "Institutions in the corpus known to operate the machine. Proton and carbon centres follow the PTCOG list of facilities in operation." },
    { key: "cancers", label: "Used for", hide: "hidden lg:table-cell", tip: "Cancers the record links, up to eight." },
    { key: "strength", label: "Main advantage", hide: "hidden xl:table-cell", tip: "The first strength on the record; the technology page lists all of them against the alternatives." },
    { key: "limit", label: "Main limit", hide: "hidden xl:table-cell", tip: "The first limitation on the record." },
    { key: "since", label: "Since", sortable: true, numeric: true, hide: "hidden sm:table-cell", tip: "Year first used in patients or first cleared, where the record gives one." },
  ];
  const exotic = EXOTIC.map((id) => g.get(id)).filter((t): t is Entity => !!t && t.kind === "technology").map((t) => ({ t, centres: centresOf(g, t), vendors: vendorsOf(g, t) })).filter((x) => x.centres.length > 0);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="map" />} title="Machines"
        lede={`${rows.length} machine classes across ${FAMILIES.length} families, from the plain X-ray to carbon-ion synchrotrons, with ${vendorCount.size} vendors and ${centreCount.size} centres from the corpus. Each row says what the machine does, what it is used for, its main advantage and limit against the alternatives, who makes it and where the rare ones are. Click any family to filter, any vendor or centre to open its page.`} />
      <Container className="pb-16">
        <div className="flex flex-wrap gap-2 mb-6">
          {FAMILIES.map((f) => {
            const n = rows.filter((r) => r.facets.family[0] === f.name).length;
            return (
              <Link key={f.name} href={`/machines/?family=${encodeURIComponent(f.name)}`} title={f.blurb} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-accent hover:text-accent">
                <FrontIcon id={f.icon} className="h-4 w-4" /><span className="font-medium">{f.name}</span><span className="text-muted">{n}</span>
              </Link>
            );
          })}
        </div>
        <EntityBrowser rows={rows} facets={facets} columns={columns} noun="machines" defaultSort={{ key: "centres", dir: -1 }} />

        <section id="locations" className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2.5"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><FrontIcon id="radiation" className="h-5 w-5" /></span>Where the rare machines are</h2>
          <p className="mt-2 text-[15px] text-muted max-w-3xl">Centres in the corpus known to run each machine, grouped by country. Proton and carbon-ion centres follow the <a className="underline hover:text-accent" href="https://www.ptcog.site/index.php/facilities-in-operation-public" target="_blank" rel="noreferrer">PTCOG list of facilities in operation</a>; the other lists name only centres OnCo could confirm, so they are a floor, not a census. Every centre links to its page.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {exotic.map(({ t, centres, vendors }) => {
              const byCountry = new Map<string, Entity[]>();
              for (const c of centres) { const code = c.kind === "institution" ? c.country : "??"; byCountry.set(code, [...(byCountry.get(code) ?? []), c]); }
              const countries = [...byCountry.entries()].sort((a, b) => b[1].length - a[1].length || countryName(a[0]).localeCompare(countryName(b[0])));
              const front = t.sections[0] ?? "devices";
              return (
                <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={routeFor(t)} className="font-semibold leading-snug flex items-center gap-2.5 hover:text-accent"><span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><FrontIcon id={front} className="h-4.5 w-4.5" /></span>{t.name}</Link>
                    <span className="text-xs text-muted whitespace-nowrap">{centres.length} {centres.length === 1 ? "centre" : "centres"} in {countries.length} {countries.length === 1 ? "country" : "countries"}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{t.tldr}</p>
                  {vendors.length > 0 && <p className="mt-2 text-xs text-muted">Made by {vendors.map((v, i) => <span key={v.id}>{i > 0 && ", "}<Link href={routeFor(v)} className="underline hover:text-accent">{v.name.split(" (")[0]}</Link></span>)}.</p>}
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {countries.map(([code, list]) => (
                      <li key={code} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-muted min-w-[7rem]"><span className="me-1" aria-hidden>{flagFor(code)}</span>{countryName(code)}</span>
                        <span className="flex flex-wrap gap-x-2 gap-y-1">{list.map((c) => <Link key={c.id} href={routeFor(c)} title={c.tldr} className="underline decoration-border hover:text-accent hover:decoration-accent">{c.name.split(" / ")[0].split(" (")[0]}</Link>)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section id="families" className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2.5"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><FrontIcon id="devices" className="h-5 w-5" /></span>Families at a glance</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FAMILIES.map((f) => {
              const members = rows.filter((r) => r.facets.family[0] === f.name);
              return (
                <div key={f.name} className="rounded-xl border border-border bg-card p-4">
                  <Link href={`/machines/?family=${encodeURIComponent(f.name)}`} className="font-semibold flex items-center gap-2.5 hover:text-accent"><span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><FrontIcon id={f.icon} className="h-4.5 w-4.5" /></span>{f.name}</Link>
                  <p className="mt-1.5 text-sm text-muted">{f.blurb}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {members.map((m) => <li key={m.id}><Link href={m.route} title={m.tldr} className="underline decoration-border hover:text-accent hover:decoration-accent">{m.name.split(" (")[0]}</Link></li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
        <p className="text-xs text-muted mt-8 max-w-3xl">Vendors and centres come from the technology, company and institution records; a machine with no centre listed is not absent from hospitals, only not yet mapped. Field strengths, energies and years appear only where the source record states them.</p>
      </Container>
    </>
  );
}
