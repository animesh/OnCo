import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { completeness, headline } from "@/lib/completeness";
import { CompletenessTable } from "@/components/CompletenessTable";
import { DatasetJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({ title: "About & methodology", description: "What OnCo is, how it is built, its rules for facts, and how to contribute.", path: "/about/" });

export default function About() {
  const g = graph();
  const cov = completeness();
  const h = headline(cov);
  return (
    <>
      <DatasetJsonLd />
      <PageHeader kicker={<GroupKicker id="learn" />} title="About OnCo" lede="A public, cited, editable map of oncology. Built so that a patient, a scientist, an investor, or a policymaker can walk in and see the current state of the art, the history, and what is coming, for any cancer, and follow the links between them." />
      <Container className="pb-16 prose-onco text-[15px] leading-relaxed max-w-3xl space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">What it is</h2>
          <p>OnCo is a knowledge graph of {g.entities.length.toLocaleString("en-GB")} objects across {KINDS.filter((k) => g.kind(k).length > 0).length} kinds: {KINDS.filter((k) => g.kind(k).length > 0).map((k) => `${g.kind(k).length.toLocaleString("en-GB")} ${KIND_META[k].plural}`).join(", ")}. Every object has its own page, a plain-English TL;DR, a technical summary, an internal last-checked date, links out to Wikipedia and primary sources, and a list of everything in the graph that connects to it. Relationships are declared once and backlinks are derived, so the graph is always consistent.</p>
          <p>The first fully built example is <Link href="/cancers/tnbc/">triple-negative breast cancer</Link>, chosen because it went from the subtype with no targeted therapy to one with immunotherapy, PARP inhibitors, three ADCs, and a positive bispecific ADC within six years. Other cancers have state-of-the-art, standard-of-care, history, and pipeline sections at varying depth.</p>
        </section>
        <section id="completeness" className="scroll-mt-24">
          <h2 className="text-xl font-semibold mb-2">Completeness</h2>
          <p>Counts alone say nothing about coverage. Each row below sets an OnCo count against a sourced count of what exists on the same scope: products against the NCI list of FDA-approved cancer drugs, institutions against the NCI-designated centres and OECI members, journals against the MEDLINE oncology set, key papers against the 100 most-cited oncology works. Across the {cov.filter((c) => c.listed).length} scopes with a public list OnCo holds {h.ours.toLocaleString("en-GB")} of {h.total.toLocaleString("en-GB")} listed items ({h.pct}%). The <Link href="/completeness/">completeness page</Link> names every missing item with an add-this link; the denominators, their sources and the date each was checked live in <code>src/data/universe.ts</code> and are refreshed weekly.</p>
          <div className="not-prose text-sm"><CompletenessTable rows={cov} compact /></div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Rules for facts</h2>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li><strong>Keep it current.</strong> Oncology changes weekly. Each record carries an internal last-checked date used by maintainers; the public page shows the current state, not a timestamp.</li>
            <li><strong>Prefer a link to a remembered number.</strong> Trial results quote the headline figure only when it is sourced on the page or in the linked trial record. Where a figure is approximate it says so.</li>
            <li><strong>Evidence tier is visible.</strong> Approved, phase 3, phase 2, phase 1, preclinical, concept: colour-coded on every card.</li>
            <li><strong>Ideas are labelled as ideas</strong>, with a maturity grade and a proposed test, so speculation cannot be mistaken for evidence.</li>
            <li><strong>Unknown beats guessed.</strong> Missing fields render as missing.</li>
            <li><strong>No patient data.</strong> The corpus contains public information about technologies, products, organisations, and trials only.</li>
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Institution ranking methodology</h2>
          <p>The <Link href="/institutions/">institution table</Link> uses a disclosed formula: Newsweek points (60 minus the Newsweek/Statista World&apos;s Best Specialized Hospitals 2026 Oncology rank; zero if unranked), plus NCI designation points (Comprehensive 15, Clinical or Basic Laboratory 8), plus two points per distinct OnCo object linked to the institution. The last term rewards presence in this evidence base and is therefore also a coverage measure. The <Link href="/universities/">university table</Link> sums those scores by parent university and sits alongside links to Nature Index and SCImago, which are better measures of research output. Treat all of it as a starting point for argument, not a verdict.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">How it is built</h2>
          <p>Next.js static export on Vercel; TypeScript data files validated by Zod schemas; a build step that checks every cross-reference resolves and emits the corpus as JSON at <Link href="/api/">/api/v1/</Link>. Search runs entirely in the browser. The map uses Natural Earth country outlines from world-atlas. No server and no database. Google Analytics counts visits and page views so we can see what people use; there are no advertising trackers, and the corrections, watchlist and sign-in features store nothing about you beyond what you type.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">How to contribute</h2>
          <p>The repository is <a href="https://github.com/judegomila/OnCo" rel="noopener">github.com/judegomila/OnCo</a>. Each kind lives in one file under <code>src/data/</code>. Add or edit a record, include a source URL, run <code>npm test</code> (which validates the schema and every reference), and open a pull request. The <Link href="/roadmap/">Roadmap</Link> page lists what we want to build next; the failure-museum, readout calendar, and MCP server are the most requested.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Sources</h2>
          <p>FDA Oncology Center of Excellence and the AACR quarterly approval digests; ClinicalTrials.gov; NCI PDQ; NCCN and ESMO guidelines; OncoKB and CIViC; conference coverage from ASCO, ESMO, AACR, SABCS, ASH; Newsweek/Statista hospital rankings; Nature Index. See <Link href="/collections/">Collections</Link> for the full list with licences.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Status and disclaimer</h2>
          <p><strong>OnCo is a work in progress.</strong> Every fact on this site is being built and checked in the open and may be incomplete, out of date, or wrong. Much of the corpus was drafted quickly from public sources and has not yet been reviewed by a named expert; pages that have been reviewed carry a badge with the reviewer and date. You must do your own research and verify anything here at its primary source (the publication, label, registry, regulator, or guideline linked from the page) before relying on it.</p>
          <p><strong>Not medical advice.</strong> OnCo is an orientation tool. It does not know your case. Decisions about diagnosis and treatment belong with you and your clinicians. If something here is wrong, use “Suggest an edit” on the page or open a <a href="https://github.com/judegomila/OnCo/issues/new/choose" rel="noopener">fact correction</a>; confirmed errors are logged at <Link href="/corrections/">/corrections/</Link>.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Credits and data sources</h2>
          <p>Molecular structures from <a href="https://pubchem.ncbi.nlm.nih.gov" rel="noopener">PubChem</a> and the <a href="https://www.rcsb.org" rel="noopener">RCSB Protein Data Bank</a>; organisation logos from <a href="https://commons.wikimedia.org" rel="noopener">Wikimedia Commons</a> via Wikidata (licences recorded per file) with site favicons as fallback; live trial data from <a href="https://clinicaltrials.gov" rel="noopener">ClinicalTrials.gov</a>; label checks from <a href="https://open.fda.gov" rel="noopener">openFDA</a>; research output from <a href="https://openalex.org" rel="noopener">OpenAlex</a>; country outlines from Natural Earth via world-atlas. Trademarks belong to their owners and are shown for identification. The editorial approach (cite everything, omit what you cannot confirm) follows the Open Medical Registry.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Licence</h2>
          <div id="licence"><p>Code: MIT. Data (the contents of <code>src/data/</code>): copyright OnCo, licensed <a className="underline" href="https://creativecommons.org/licenses/by-nc/4.0/" rel="noopener">CC BY-NC 4.0</a>. Free for individual and educational use, including academic and non-profit use, with the attribution “Data from OnCo (onco.cc)”.</p><p className="mt-1">Commercial use (inside a paid product or service, advertising-funded redistribution, or a company data pipeline) must contact us to pay for the data. Ask through a <a className="underline" href="https://github.com/judegomila/OnCo/issues/new?labels=licensing&title=Commercial+licence+request" rel="noopener">licensing request</a>.</p></div>
        </section>
      </Container>
    </>
  );
}
