import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Cancer } from "@/lib/schema";
import { centreRowsFor, countryName, packCentreRows, type CentreRow } from "@/lib/centre-table";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { SecondOpinion, type SoCancer, type SoCountry, type SoPerson } from "@/components/SecondOpinion";
import { referralRoutes } from "@/data/referral-routes";

export const metadata: Metadata = pageMeta({ title: "Second-opinion finder", description: "Choose your cancer and country: the expert centres OnCo links to that cancer with their designations, trials, research output and machines on record, the people who work on it, and how to get referred for a second opinion where you live, with sources.", path: "/second-opinion/" });

function peopleFor(c: Cancer): SoPerson[] {
  const g = graph();
  const base = c.name.replace(/\s*\(.*?\)\s*$/, "").toLowerCase();
  const needles = [base, ...c.aka.map((a) => a.toLowerCase())].filter((s) => s.length >= 4);
  const linked = new Set((g.neighbours(c.id).get("person") ?? []).map((p) => p.id));
  return g.kind("person")
    .filter((p) => linked.has(p.id) || p.specialisms.some((s) => needles.some((n) => s.toLowerCase().includes(n))))
    .sort((a, b) => Number(linked.has(b.id)) - Number(linked.has(a.id)) || a.name.localeCompare(b.name))
    .map((p) => { const inst = p.institutionId ? g.get(p.institutionId) : undefined; return { id: p.id, name: p.name, role: p.role, route: routeFor(p), institutionId: p.institutionId, institutionName: inst?.name, specialisms: p.specialisms }; });
}

export default function SecondOpinionPage() {
  const g = graph();
  // Same selection as the cancer page's Expert centres tab, built once per cancer (src/lib/centre-table.ts) and packed so
  // institution facts and trial names travel once rather than once per cancer.
  const byCancer: Record<string, CentreRow[]> = Object.fromEntries(g.kind("cancer").map((c) => [c.id, centreRowsFor(c.id)]));
  const { pack, links } = packCentreRows(byCancer);
  const cancers: SoCancer[] = g.kind("cancer").map((c) => ({ id: c.id, name: c.name, group: c.group, route: routeFor(c), centres: links[c.id] ?? [], people: peopleFor(c) }));
  const counts = new Map<string, number>();
  for (const i of g.kind("institution")) counts.set(i.country, (counts.get(i.country) ?? 0) + 1);
  const countries: SoCountry[] = [...counts.entries()].map(([code, n]) => ({ code, label: countryName(code), n })).sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  const countryNames = Object.fromEntries(countries.map((c) => [c.code, c.label]));

  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="Second-opinion finder"
        lede="Who to ask, where they are, and how to get referred. Pick your cancer and country to see the centres OnCo links to that cancer (yours first) with what can be measured about each: designations, trials for the cancer, research output and the machines on record; the clinicians and scientists who work on it; and a plain-language guide to how second opinions work in your health system: who refers, what records to send, remote review services, cost and timing, with sources." />
      <Container className="pb-16">
        <SecondOpinion cancers={cancers} routes={referralRoutes} countries={countries} countryNames={countryNames} pack={pack} />
      </Container>
    </>
  );
}
