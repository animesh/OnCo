import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { agents, SOURCES } from "@/data/interactions";
import { validateInteractions } from "@/lib/interactions-validate";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { InteractionChecker, type CheckerDrug } from "./InteractionChecker";

export const metadata: Metadata = pageMeta({ title: "Drug interaction checker", description: "Pick two or more cancer drugs and co-medications and see flagged pairs: CYP3A4 inhibitors and inducers with TKIs, QT stacking, PPIs with acid-dependent absorption, P-gp, CYP2D6 and tamoxifen, bleeding with BTK inhibitors, plus food, hepatic and renal flags. From the prescribing information.", path: "/interactions/" });

export default function InteractionsPage() {
  validateInteractions();
  const g = graph();
  const drugs: Record<string, CheckerDrug> = {};
  for (const a of agents) if (!a.external) { const d = g.must(a.id); if (d.kind === "drug") drugs[a.id] = { id: a.id, route: routeFor(d), modality: d.modality, tldr: d.tldr }; }
  const products = agents.filter((a) => !a.external).length, comeds = agents.length - products;
  const pairs = agents.reduce((n, a) => n + (a.pairs?.length ?? 0), 0);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Drug interaction checker"
        lede={`${products} oncology products and ${comeds} common co-medications with their CYP, P-gp, QT and absorption properties, plus ${pairs} interactions named in labels. Pick two or more and the rules flag every pair: a TKI with an azole, a PPI with an acid-dependent drug, two QT-prolonging agents, warfarin with a fluoropyrimidine. Frequent, avoidable errors, caught before the prescription.`} />
      <Container className="pb-16">
        <InteractionChecker drugs={drugs} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 text-sm">
          <div className="card p-4 space-y-1.5">
            <h2 className="font-semibold">How flags are derived</h2>
            <p className="text-muted">Each drug carries properties from its prescribing information: CYP3A4 substrate (sensitive or moderate), inhibitor or inducer strength, CYP2D6, CYP2C8 and CYP1A2 roles, QT risk, acid-dependent absorption, P-gp, anticoagulant or bleeding risk. Rules combine them in both directions: sensitive substrate plus strong inhibitor is major, moderate combinations are moderate, two known-risk QT drugs are major. Interactions the label names explicitly (brentuximab with bleomycin, capecitabine with warfarin, high-dose methotrexate with NSAIDs) are added as label pairs. Management text is the victim drug&rsquo;s own label instruction where one exists.</p>
          </div>
          <div className="card p-4 space-y-1.5">
            <h2 className="font-semibold">Limits</h2>
            <p className="text-muted">This is a decision aid over a curated list, not a complete interaction database: a drug absent from the list is not cleared, and a pair with no flag is not proven safe. CYP classifications follow the <a href={SOURCES.fdaCyp.url} target="_blank" rel="noopener noreferrer" className="underline">FDA interaction tables</a>; QT risk follows the label or <a href={SOURCES.crediblemeds.url} target="_blank" rel="noopener noreferrer" className="underline">CredibleMeds</a>. Checkpoint inhibitors and most antibodies have no pharmacokinetic interactions and are listed for their toxicity notes only; see the <Link href="/irae/" className="underline">irAE guide</Link>. Verify in the current label and with a pharmacist. Not medical advice.</p>
          </div>
        </div>
      </Container>
    </>
  );
}
