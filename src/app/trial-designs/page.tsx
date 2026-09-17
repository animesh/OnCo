import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Term, type Trial } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, StatusChip } from "@/components/ui";
import { KindIcon } from "@/components/KindIcon";

export const metadata: Metadata = pageMeta({
  title: "Trial design picker",
  description: "Every clinical trial design as a card: when to use it, a worked example from a trial in OnCo, and its main risk. Comparative, single-arm, master protocol, adaptive, dose-finding and pragmatic designs, plus a plain-English guide to which design fits your question.",
  path: "/trial-designs/",
});

/** One design card: the glossary term that explains it, the corpus trial that shows it, and the two things a reader most needs. */
type Card = { term: string; when: string; risk: string; example: string; exampleNote: string };
type Group = { id: string; title: string; blurb: string; icon: ReactNode; cards: Card[] };

const svg = (d: string) => (
  <svg aria-hidden focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d={d} /></svg>
);

const GROUPS: Group[] = [
  {
    id: "comparative", title: "Comparative designs", blurb: "Two or more arms, assigned by chance. The only designs that can prove a treatment causes a benefit.",
    icon: svg("M4 5h7v14H4zM13 5h7v14h-7zM7.5 9v6M16.5 9v6"),
    cards: [
      { term: "randomised-trial", when: "You want to know whether a new treatment is better than the current standard, and enough patients exist to compare them fairly.", risk: "Slow and expensive; the standard of care can move on before the trial reads out.", example: "checkmate-067", exampleNote: "945 patients randomised equally across three arms, followed for ten years." },
      { term: "non-inferiority", when: "The new option is shorter, cheaper, less toxic or easier, and you need to show it gives up little or nothing.", risk: "A sloppy trial drifts towards no difference, which here looks like success; the margin decides everything.", example: "persephone", exampleNote: "Six months of trastuzumab against twelve, judged against a pre-specified margin." },
      { term: "non-inferiority-margin", when: "You are reading or writing a non-inferiority protocol and need to justify how much loss is acceptable.", risk: "A wide margin makes almost anything look good enough; a superiority miss is not a non-inferiority win.", example: "fast-forward", exampleNote: "One-week breast radiotherapy met its margin on five-year local relapse." },
      { term: "stratified-randomisation", when: "The trial is small or a few factors (stage, biomarker, region) strongly predict outcome and must be balanced by construction.", risk: "Too many strata leave cells empty; the factors chosen become the subgroups everyone will later argue over.", example: "imvigor011", exampleNote: "Only patients with a positive blood test for leftover cancer were randomised." },
      { term: "double-blind", when: "The outcome involves judgement (symptoms, scan reads, when to stop treatment) and expectations could colour it.", risk: "Many cancer treatments cannot be disguised; blinding then shifts to the people reading the scans.", example: "act-iv", exampleNote: "A vaccine against a control vaccine, both with chemotherapy, in 745 patients." },
      { term: "crossover", when: "Control patients will be offered the experimental drug at progression, for ethical or practical reasons.", risk: "Dilutes the survival comparison; a real benefit can vanish, and its absence can be excused.", example: "psmafore", exampleNote: "Most control patients crossed over to the radioligand, blurring overall survival." },
    ],
  },
  {
    id: "single-arm", title: "Single-arm and externally controlled designs", blurb: "Everyone gets the new treatment. Fast and small, and unable on their own to show anyone lives longer.",
    icon: svg("M8 4h8v16H8zM12 8v8M10 12h4"),
    cards: [
      { term: "single-arm", when: "A rare or heavily pre-treated population with no good comparator, and a drug whose effect on tumour shrinkage should be large and obvious.", risk: "Patient selection and response-evaluable definitions flatter the result; confirmatory trials sometimes fail.", example: "l-mind", exampleNote: "81 patients, a 60 percent response rate and a matched real-world comparison behind an approval." },
      { term: "external-control-arm", when: "Randomisation is impossible or unethical and good historical or registry data on similar patients exist.", risk: "Differences between eras and populations masquerade as drug effects; both arms of ACT IV beat historical expectations.", example: "nmtrc003", exampleNote: "105 children on eflornithine compared with a propensity-matched external control." },
      { term: "window-of-opportunity-trial", when: "You need to see what a drug does inside a tumour and surgery is already scheduled a few weeks away.", risk: "Cannot measure survival; a short exposure can miss slow effects; delaying surgery must be justified.", example: "progesterone-preop-tmh", exampleNote: "A single pre-operative injection, with survival followed for years afterwards." },
      { term: "real-world-evidence", when: "You want to know whether a trial result holds in older, sicker and more diverse patients treated in routine care.", risk: "Confounding by indication: patients who received the drug differ from those who did not in ways records do not capture.", example: "pathfinder-2", exampleNote: "About 35,000 adults given a blood test alongside standard screening in a single-arm study." },
    ],
  },
  {
    id: "master-protocols", title: "Master protocols", blurb: "One infrastructure, many questions: one drug across cancers, many drugs within a cancer, or arms that come and go for years.",
    icon: svg("M4 5h16M12 5v4M12 9 6 13M12 9l6 4M4 13h4v6H4zM10 13h4v6h-4zM16 13h4v6h-4z"),
    cards: [
      { term: "basket-trial", when: "A molecular alteration appears in a few percent of many cancers and a drug is built for it.", risk: "Small baskets give wide confidence intervals, and a target can drive one cancer and be a passenger in another.", example: "navigate", exampleNote: "Larotrectinib across 17 tumour types, the first tumour-agnostic approval." },
      { term: "umbrella-trial", when: "One cancer splits into many small molecular subgroups and patients should be tested once and considered for many arms.", risk: "Screening hundreds to fill sub-studies of thirty is slow, and many patients screen into no arm at all.", example: "myelomatch", exampleNote: "Every new leukaemia sequenced within days and routed to a matched sub-study." },
      { term: "basket-umbrella-platform", when: "The disease will have new candidate treatments for years and a shared control arm can serve them all.", risk: "Control arm drift over a long trial; governance and statistics are heavier than for a single trial.", example: "stampede", exampleNote: "Arms added and dropped against one hormone-therapy control since 2005, in more than 12,000 men." },
    ],
  },
  {
    id: "adaptive", title: "Adaptive designs", blurb: "Rules fixed in advance let the trial change as data come in: merge phases, resize, drop arms, tilt randomisation.",
    icon: svg("M4 18 10 9l4 5 6-9M4 18h16"),
    cards: [
      { term: "seamless-adaptive", when: "A successful phase 2 cohort should roll straight into a registrational trial without a pause between phases.", risk: "Alpha control and a firewall around the interim data are essential; the phase 2 patients may not be quite the phase 3 population.", example: "nrg-hn002-hn005", exampleNote: "A phase 2/3 de-escalation trial stopped when the reduced-dose arms did worse." },
      { term: "response-adaptive-randomisation", when: "Several arms compete and it is ethical and practical to steer later patients towards what is working.", risk: "Less efficient than 1:1, vulnerable to time trends, and can leak which arm is winning.", example: "stampede", exampleNote: "Multi-arm multi-stage: arms that fail early stages are retired, the rest carry on." },
      { term: "bayesian-trial-design", when: "You have real prior information (adult data, earlier trials) and a small population, or you need continuous updating for dose finding or graduation rules.", risk: "The prior is a judgement; regulators want it justified in advance and the false-positive rate simulated.", example: "nmtrc003", exampleNote: "An externally controlled approval of the kind Bayesian borrowing formalises." },
      { term: "sample-size-re-estimation", when: "The effect size used to plan the trial is uncertain and you want the option to enlarge the trial at an interim without inflating false positives.", risk: "Unblinded re-estimation must be paired with methods that hold alpha; sizing on inflated early data is the classic way to fail.", example: "dream3r", exampleNote: "Sized on encouraging early data and stopped early without meeting its endpoint." },
      { term: "group-sequential-design", when: "You will look at the data more than once and want the right to stop early for benefit, harm or futility.", risk: "Early stopping overestimates the effect and truncates secondary endpoints and long-term safety.", example: "adaura", exampleNote: "Unblinded early on the monitoring committee's recommendation; survival benefit confirmed later." },
      { term: "biomarker-stratified-design", when: "You need to learn whether a marker predicts benefit, not just prognosis, or to co-develop a drug with its companion test.", risk: "Enriching on an unvalidated marker excludes patients who would have benefited; separate p-values are not an interaction test.", example: "magnitude", exampleNote: "Marker-positive and marker-negative cohorts run side by side; one stopped for futility, one won." },
      { term: "smart-design", when: "The real question is a strategy (start with A, switch to B on poor response) rather than a single drug.", risk: "Needs more patients because they are split at each stage, and the decision rule must work identically at every site.", example: "captivate", exampleNote: "Patients with undetectable residual disease re-randomised to stop or continue." },
    ],
  },
  {
    id: "dose-finding", title: "Dose-finding designs", blurb: "How a first-in-human trial climbs to a useful dose, and why the highest tolerable dose is no longer the goal.",
    icon: svg("M6 20V4M6 8h4M6 12h6M6 16h8M6 20h10M18 4v6m-3-3h6"),
    cards: [
      { term: "dose-escalation-design", when: "A new agent is entering people for the first time and the dose-toxicity relationship is unknown.", risk: "The 3+3 design treats many patients at ineffective doses and finds the maximum tolerated dose poorly; model-based designs need a statistician.", example: "rejoice-ovarian01", exampleNote: "Escalation, then a randomised dose-optimisation part, then phase 3 at the chosen dose." },
      { term: "project-optimus", when: "A targeted drug or antibody-drug conjugate saturates its target below the maximum tolerated dose and the pivotal dose has not been compared with a lower one.", risk: "Adds a randomised dose cohort and months to development; skipping it can mean an approved dose nobody can stay on.", example: "low-dose-nivolumab-tmh", exampleNote: "One twentieth of the standard dose tested in a randomised trial, for affordability." },
      { term: "first-in-human", when: "Preclinical work is complete and the question is whether the drug is safe enough, at any dose, to study further.", risk: "Late toxicities are missed in short observation windows; a small early signal is easily over-read.", example: "augment-101", exampleNote: "A phase 1/2 that carried a new drug class from first dose to approval." },
    ],
  },
  {
    id: "pragmatic", title: "Pragmatic, cluster and real-world designs", blurb: "Testing treatments where and how they will actually be used, from a single patient to whole districts.",
    icon: svg("M3 20h18M5 20v-7l7-6 7 6v7M10 20v-5h4v5M12 3v2"),
    cards: [
      { term: "pragmatic-trial", when: "The intervention is already in use (a generic drug, an exercise programme, a screening schedule) and the question is whether it works in ordinary care.", risk: "Usual care varies and drifts, adherence is lower, and record-based outcomes are less complete, all pulling towards no difference.", example: "challenge", exampleNote: "A coached exercise programme after chemotherapy, delivered across five countries over three years." },
      { term: "cluster-randomised-trial", when: "The intervention is delivered to a community, clinic or hospital and cannot be given to one person and withheld from the next.", risk: "Needs more participants for the same power, and few clusters cannot be rescued by many individuals.", example: "osmanabad-hpv-screening", exampleNote: "52 villages randomised to four screening strategies; only HPV testing cut deaths." },
      { term: "stepped-wedge-design", when: "Every site will adopt the new approach eventually and it cannot be rolled out everywhere at once.", risk: "Intervention periods are later than control periods, so anything else that changes over time is partly confounded.", example: "sano", exampleNote: "Dutch hospitals switched to active surveillance in randomised order." },
      { term: "registry-based-trial", when: "A complete, linkable registry already records the outcome you care about and the intervention is simple.", risk: "Data are only as good as the registry; scan-defined and patient-reported outcomes are out of reach.", example: "circulate-japan", exampleNote: "An observational cohort tested for circulating tumour DNA feeds randomised sub-studies." },
      { term: "decentralised-trial", when: "Eligible patients live far from centres, the drug is oral or the intervention is behavioural, and enrolment or diversity is the bottleneck.", risk: "Infusions, biopsies and central imaging still need sites; local scans add noise; digital tools exclude some patients.", example: "bwel", exampleNote: "A two-year weight-loss programme delivered by telephone to more than 3,000 women." },
      { term: "n-of-1-trial", when: "A fast-acting, reversible treatment for a stable symptom, and the question is what works for this patient.", risk: "Useless for treatments with carry-over or for outcomes that cannot be measured repeatedly, which rules out anticancer drugs.", example: "olanzapine-appetite-tmh", exampleNote: "A group-level answer to an appetite question that a series of single-patient trials could personalise." },
    ],
  },
];

/** Plain-English decision list: the question a reader has, and the design that answers it. */
const DECISIONS: { q: string; a: string; term: string }[] = [
  { q: "Is the new treatment better than what we do now?", a: "A randomised controlled trial, blinded if the outcome involves judgement.", term: "randomised-trial" },
  { q: "Can we give less (shorter, fewer fractions, no chemotherapy) without losing much?", a: "A non-inferiority trial with a justified margin, analysed both intention-to-treat and per protocol.", term: "non-inferiority-margin" },
  { q: "Does this drug work in a rare mutation that appears across many cancers?", a: "A basket trial, with response rate per basket and a confirmatory commitment.", term: "basket-trial" },
  { q: "Which of many targeted drugs helps which molecular subgroup of one cancer?", a: "An umbrella trial with a shared screening panel and matched sub-studies.", term: "umbrella-trial" },
  { q: "Will there be new candidate treatments in this disease for years to come?", a: "A platform trial with a shared control arm and pre-specified rules for adding and dropping arms.", term: "basket-umbrella-platform" },
  { q: "Does the marker predict benefit, or just prognosis?", a: "A biomarker-stratified design that randomises within marker-positive and marker-negative groups and tests the interaction.", term: "biomarker-stratified-design" },
  { q: "What dose should go into the pivotal trial?", a: "Model-based dose escalation followed by a randomised comparison of two or more doses.", term: "project-optimus" },
  { q: "Should treatment change depending on early response or residual disease?", a: "A SMART design that re-randomises at the decision point and compares whole strategies.", term: "smart-design" },
  { q: "Does the intervention work in ordinary clinics and ordinary patients?", a: "A pragmatic trial with broad eligibility, usual care as comparator and a hard outcome.", term: "pragmatic-trial" },
  { q: "Is the intervention delivered to a community or a whole clinic?", a: "A cluster-randomised trial, or a stepped-wedge design if every site will adopt it eventually.", term: "cluster-randomised-trial" },
  { q: "Can we randomise at all?", a: "If not, a single-arm trial with an external control, and honesty about what it cannot show.", term: "external-control-arm" },
  { q: "Which treatment works for this one patient's symptom?", a: "An N-of-1 trial, if the treatment acts and wears off quickly.", term: "n-of-1-trial" },
];

const READING: { term: string; label: string }[] = [
  { term: "kaplan-meier-curve", label: "Kaplan-Meier curves and censoring" },
  { term: "hazard-ratio", label: "Hazard ratio" },
  { term: "absolute-benefit", label: "Absolute versus relative benefit" },
  { term: "confidence-interval", label: "Confidence interval" },
  { term: "statistical-significance", label: "P values and multiplicity" },
  { term: "estimand", label: "Estimands and intercurrent events" },
  { term: "surrogate-validation", label: "Which surrogates have earned trust" },
  { term: "quality-adjusted-survival", label: "Quality-adjusted survival" },
  { term: "qol-pro", label: "Patient-reported outcomes" },
  { term: "trial-failure-modes", label: "Why trials fail" },
];

const LIFECYCLE: { term: string; label: string }[] = [
  { term: "trial-lifecycle", label: "From protocol to label" },
  { term: "trial-protocol", label: "Protocol and analysis plan" },
  { term: "ethics-review", label: "Ethics review" },
  { term: "informed-consent", label: "Informed consent" },
  { term: "trial-registration", label: "Registration and results reporting" },
  { term: "clinical-equipoise", label: "Equipoise" },
  { term: "data-monitoring-committee", label: "Data monitoring committee" },
  { term: "interim-analysis", label: "Interim analysis and readout" },
  { term: "futility", label: "Futility" },
  { term: "trial-phases", label: "Phases 1, 2 and 3" },
];

export default function TrialDesignsPage() {
  const g = graph();
  const term = (id: string) => g.get(id) as Term | undefined;
  const trial = (id: string) => g.get(id) as Trial | undefined;
  const cardCount = GROUPS.reduce((n, grp) => n + grp.cards.filter((c) => term(c.term)).length, 0);

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Trial design picker"
        lede="Every trial design in the glossary as a card: when to use it, a trial in OnCo that used it, and the risk that most often undoes it. Below the cards is a plain-English list that starts from the question you want answered and names the design that answers it, then the statistics you will meet when the result comes out and the lifecycle every trial passes through." />
      <Container className="pb-16">
        <div className="text-sm text-muted mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="tabular-nums">{cardCount} designs</span>
          <span className="tabular-nums">{GROUPS.length} families</span>
          <Link href="/terms/?category=Trials" className="underline">All trial terms</Link>
          <Link href="/terms/?category=Endpoints" className="underline">All endpoint terms</Link>
          <Link href="/explained/" className="underline">Trials in plain words</Link>
          <Link href="/failures/" className="underline">Failure museum</Link>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-10">
          {GROUPS.map((grp) => (
            <a key={grp.id} href={`#${grp.id}`} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1.5">
              <span className="text-accent [&>svg]:h-4 [&>svg]:w-4">{grp.icon}</span>{grp.title}
              <span className="text-muted tabular-nums ml-1">{grp.cards.filter((c) => term(c.term)).length}</span>
            </a>
          ))}
          <a href="#which-design" className="chip border border-border bg-card hover:bg-foreground/5">Which design fits my question</a>
          <a href="#reading" className="chip border border-border bg-card hover:bg-foreground/5">Reading the result</a>
          <a href="#lifecycle" className="chip border border-border bg-card hover:bg-foreground/5">Lifecycle</a>
        </div>

        <div className="space-y-14">
          {GROUPS.map((grp) => (
            <section key={grp.id} id={grp.id} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-1 pb-2 border-b border-border">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{grp.icon}</span>
                <h2 className="text-xl font-semibold"><a href={`#${grp.id}`} className="hover:underline">{grp.title}</a></h2>
                <span className="ml-auto text-sm text-muted tabular-nums">{grp.cards.filter((c) => term(c.term)).length} design{grp.cards.length === 1 ? "" : "s"}</span>
              </div>
              <p className="text-sm text-muted mb-4 max-w-3xl">{grp.blurb}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grp.cards.map((c) => {
                  const t = term(c.term);
                  if (!t) return null;
                  const ex = trial(c.example);
                  return (
                    <article key={c.term} className="card p-4 flex flex-col gap-3">
                      <h3 className="text-base font-semibold leading-snug">
                        <Link href={routeFor(t)} className="inline-flex items-start gap-2 hover:underline"><span className="mt-0.5 text-accent shrink-0"><KindIcon kind="term" className="h-4 w-4" /></span>{t.name}</Link>
                      </h3>
                      <p className="text-sm text-muted">{t.tldr}</p>
                      <dl className="text-sm space-y-2">
                        <div><dt className="text-xs uppercase tracking-wide text-muted">When to use it</dt><dd>{c.when}</dd></div>
                        <div><dt className="text-xs uppercase tracking-wide text-muted">Main risk</dt><dd>{c.risk}</dd></div>
                        {ex && (
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted">Worked example</dt>
                            <dd>
                              <Link href={routeFor(ex)} className="inline-flex items-center gap-1.5 font-medium hover:underline"><KindIcon kind="trial" className="h-4 w-4 text-accent" />{ex.name}</Link>
                              <span className="ml-2 align-middle"><StatusChip status={ex.status} /></span>
                              <span className="block text-muted">{c.exampleNote}</span>
                            </dd>
                          </div>
                        )}
                      </dl>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                        <Link href={`/terms/?category=${encodeURIComponent(t.category)}`} className="chip border border-border bg-card hover:bg-foreground/5 text-xs">{t.category}</Link>
                        {t.related.slice(0, 3).map((r) => { const rt = term(r); return rt ? <Link key={r} href={routeFor(rt)} className="chip border border-border bg-card hover:bg-foreground/5 text-xs">{rt.name.replace(/\s*\(.*\)$/, "")}</Link> : null; })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          <section id="which-design" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-1 pb-2 border-b border-border">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{svg("M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.5-1 1-1 2.2M12 17v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z")}</span>
              <h2 className="text-xl font-semibold"><a href="#which-design" className="hover:underline">Which design fits my question</a></h2>
            </div>
            <p className="text-sm text-muted mb-4 max-w-3xl">Start from the question, not the design. Each answer links to the term that explains the trade-offs.</p>
            <ol className="grid gap-2 sm:grid-cols-2">
              {DECISIONS.map((d, i) => {
                const t = term(d.term);
                return (
                  <li key={d.term + i} className="card p-3 text-sm flex gap-3">
                    <span className="tabular-nums text-muted shrink-0 w-5 text-right">{i + 1}.</span>
                    <div>
                      <p className="font-medium">{d.q}</p>
                      <p className="text-muted">{d.a}</p>
                      {t && <Link href={routeFor(t)} className="inline-flex items-center gap-1 mt-1 text-accent hover:underline"><KindIcon kind="term" className="h-3.5 w-3.5" />{t.name}</Link>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section id="reading" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-1 pb-2 border-b border-border">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{svg("M4 19V5M4 19h16M6 15c3 0 4-8 7-8s4 5 7 5")}</span>
              <h2 className="text-xl font-semibold"><a href="#reading" className="hover:underline">Reading the result</a></h2>
            </div>
            <p className="text-sm text-muted mb-4 max-w-3xl">The statistics a trial report throws at you, each with a worked example from the corpus. The <Link href="/forest/" className="underline">forest plot</Link> puts every hazard ratio in OnCo on one axis and <Link href="/explained/" className="underline">Trials in plain words</Link> turns results into people out of 100.</p>
            <div className="flex flex-wrap gap-2">
              {READING.map((r) => { const t = term(r.term); return t ? <Link key={r.term} href={routeFor(t)} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1.5"><KindIcon kind="term" className="h-4 w-4 text-accent" />{r.label}</Link> : null; })}
            </div>
          </section>

          <section id="lifecycle" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-1 pb-2 border-b border-border">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{svg("M3 12h18M6 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 15v3m6-3v3m6-3v3")}</span>
              <h2 className="text-xl font-semibold"><a href="#lifecycle" className="hover:underline">The lifecycle every trial passes through</a></h2>
            </div>
            <p className="text-sm text-muted mb-4 max-w-3xl">Protocol, ethics review, registration, enrolment, monitoring, readout, publication, label. The <Link href="/regulatory/" className="underline">regulatory timeline</Link> dates the last step for every product in OnCo and the <Link href="/catalysts/" className="underline">catalyst calendar</Link> lists the readouts still to come.</p>
            <div className="flex flex-wrap gap-2">
              {LIFECYCLE.map((r) => { const t = term(r.term); return t ? <Link key={r.term} href={routeFor(t)} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1.5"><KindIcon kind="term" className="h-4 w-4 text-accent" />{r.label}</Link> : null; })}
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
