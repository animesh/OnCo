import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { decisionCancerIds, decisionsFor, type DecisionEvidence, type DecisionOption, type DecisionSection } from "@/lib/decisions";
import { evidenceLabel } from "@/lib/evidence";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CancerIcon } from "@/components/CancerIcon";
import { GuidelineChip } from "@/components/GuidelineChip";
import { PrintButton } from "@/components/PrintButton";
import { SurvivalDisclosure } from "@/components/SurvivalDisclosure";
import { Tip } from "@/components/Tip";

export function generateStaticParams() {
  return decisionCancerIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = decisionsFor(id);
  return d ? pageMeta({ title: `${d.cancer.name} · Decisions`, description: `The decisions a person with ${d.cancer.name} may face, one section per treatment setting: the options named in the standard of care, what each is for, the trials behind them with their results, the recorded trade-offs and the questions to ask.`, path: `/cancers/${id}/decisions/` }) : {};
}

/** Small line icons so each block has a glyph; drawn inline to avoid a dependency. */
function Ico({ name, className = "h-4 w-4" }: { name: "fork" | "aim" | "flask" | "scales" | "question" | "book" | "list" | "single" | "context"; className?: string }) {
  const paths: Record<typeof name, ReactNode> = {
    fork: <><path d="M6 3v6c0 3 3 4 6 4s6-1 6-4V3" /><path d="M12 13v8" /><circle cx="6" cy="3" r="1.5" /><circle cx="18" cy="3" r="1.5" /><circle cx="12" cy="21" r="1.5" /></>,
    aim: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
    flask: <><path d="M9 3h6" /><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M7.5 15h9" /></>,
    scales: <><path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-3 7a3 3 0 0 0 6 0L5 7Z" /><path d="M19 7l-3 7a3 3 0 0 0 6 0l-3-7Z" /><path d="M8 21h8" /></>,
    question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7" /><circle cx="12" cy="17" r=".6" /></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /><path d="M8 7h7" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
    single: <><path d="M12 3v18" /><path d="M8 17l4 4 4-4" /></>,
    context: <><circle cx="12" cy="12" r="9" /><path d="M12 8v.5M12 11v5" /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

function Kicker({ icon, children }: { icon: Parameters<typeof Ico>[0]["name"]; children: ReactNode }) {
  return <div className="kicker mb-2 inline-flex items-center gap-1.5"><Ico name={icon} className="h-3.5 w-3.5" />{children}</div>;
}

function OptionCard({ o }: { o: DecisionOption }) {
  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={o.route} className="font-semibold hover:underline">{o.name}</Link>
        {o.status && <span className={`chip ${statusClass(o.status)}`}>{STATUS_LABEL[o.status] ?? o.status}</span>}
        {o.modality && <Link href={o.kind === "drug" ? "/drugs/" : "/technologies/"} className="chip bg-foreground/5 text-[10px] hover:bg-foreground/10">{o.modality}</Link>}
      </div>
      <p className="text-[15px] leading-relaxed mt-2 text-foreground/90">{o.tldr}</p>
      {o.strengths.length > 0 && <ul className="mt-2 text-sm list-disc ps-5 space-y-0.5 text-foreground/80">{o.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>}
    </div>
  );
}

function TradeOffs({ options }: { options: DecisionOption[] }) {
  const withData = options.filter((o) => o.sideEffects.length || o.cautions.length);
  if (!withData.length) return <p className="text-sm text-muted">No side-effect rates or interaction flags are recorded for these options yet. The <Link className="underline" href="/side-effects/">side-effect lookup</Link> and <Link className="underline" href="/interactions/">interaction checker</Link> cover the products that have them.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {withData.map((o) => (
        <div key={o.id} className="card p-4">
          <div className="flex items-baseline justify-between gap-2"><Link href={o.route} className="font-medium hover:underline">{o.name}</Link>{o.kind === "drug" && <Link href={`${o.route}#toxicity`} className="text-xs text-muted hover:underline">all recorded rates →</Link>}</div>
          {o.sideEffects.length > 0 && (
            <table className="onco mt-2 text-sm" lang="en">
              <thead><tr><th>Side effect</th><th className="text-end">Any grade</th><th className="text-end">Grade 3+</th></tr></thead>
              <tbody>
                {o.sideEffects.map((s, i) => (
                  <tr key={i}>
                    <td><Link href="/side-effects/" className="hover:underline">{s.event}</Link>{s.note && <span className="text-muted text-xs"> · {s.note}</span>}</td>
                    <td className="text-end tabular-nums">{s.anyGradePct !== undefined ? `${s.anyGradePct}%` : "-"}</td>
                    <td className="text-end tabular-nums">{s.grade3PlusPct !== undefined ? <a className="underline decoration-dotted underline-offset-[3px]" href={s.source} rel="noopener" title="Source">{s.grade3PlusPct}%</a> : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {o.cautions.length > 0 && <ul className="mt-2 text-sm space-y-1 text-foreground/85">{o.cautions.map((c, i) => <li key={i} className="flex gap-2"><span aria-hidden className="text-accent">•</span><span>{c}</span></li>)}</ul>}
          {o.sideEffects.length > 0 && <p className="text-[11px] text-muted mt-2">Rates from the label or pivotal trial as recorded on the product page; each grade 3+ figure links to its source.</p>}
        </div>
      ))}
    </div>
  );
}

function EvidenceRow({ e, options }: { e: DecisionEvidence; options: DecisionOption[] }) {
  const linked = options.filter((o) => e.optionIds.includes(o.id));
  const arms = e.primary?.arms.filter((a) => a.value !== undefined) ?? [];
  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={e.route} className="font-medium hover:underline">{e.name}</Link>
        <Link href={`/trials/?phase=${encodeURIComponent(`Phase ${e.phase}`)}`} className="chip bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-900 text-[10px]">Phase {e.phase}</Link>
        {e.nct && <a className="chip bg-foreground/5 text-[10px] font-mono hover:bg-foreground/10" href={`https://clinicaltrials.gov/study/${e.nct}`} rel="noopener">{e.nct}</a>}
        {e.yearReported && <Link href="/timeline/" className="chip bg-foreground/5 text-[10px] tabular-nums hover:bg-foreground/10">{e.yearReported}</Link>}
        {e.enrolled && <span className="chip bg-foreground/5 text-[10px] tabular-nums">{e.enrolled.toLocaleString("en-GB")} people</span>}
        {e.evidence !== null && <Tip title={`Evidence ${e.evidence}/100 · ${evidenceLabel(e.evidence)}`} text="How much and what kind of evidence, not how big the benefit." href="/evidence/" linkLabel="How it is scored →"><Link href="/evidence/" className="chip bg-foreground/5 text-[10px] tabular-nums">evidence {e.evidence}</Link></Tip>}
      </div>
      {linked.length > 0 && <div className="text-xs text-muted mt-1">Tests {linked.map((o, i) => <span key={o.id}>{i > 0 && ", "}<Link href={o.route} className="underline">{o.name}</Link></span>)}</div>}
      <div className="text-sm text-muted mt-1">{e.setting}</div>
      {e.result ? <div className="mt-2 text-[15px] leading-relaxed"><SurvivalDisclosure text={e.result} /></div> : <p className="mt-2 text-sm text-muted">No headline result recorded yet.</p>}
      {e.primary && arms.length > 0 && (
        <div className="mt-2 text-sm">
          <span className="text-muted">{e.primary.endpoint}{e.primary.unit ? ` (${e.primary.unit})` : ""}: </span>
          {arms.map((a, i) => <span key={i}>{i > 0 && <span className="text-muted"> vs </span>}<span className="font-medium">{a.name}</span> <span className="tabular-nums">{a.value}</span>{a.n ? <span className="text-muted text-xs"> (n={a.n})</span> : null}</span>)}
          {e.primary.hr !== undefined && <span className="text-muted"> · HR {e.primary.hr}</span>}
          {e.primary.source && <> · <a className="underline text-muted" href={e.primary.source} rel="noopener">source</a></>}
        </div>
      )}
    </li>
  );
}

function SectionCard({ s, cancerId }: { s: DecisionSection; cancerId: string }) {
  const drugIds = s.options.filter((o) => o.kind === "drug").map((o) => o.id);
  return (
    <section id={s.id} className="scroll-mt-28">
      <div className="card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/sequencing/${cancerId}/`} className="kicker hover:underline">{s.lineLabel}</Link>
            <h2 className="text-xl font-semibold tracking-tight mt-0.5">{s.setting}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${s.singlePath ? "bg-foreground/5" : "bg-accent-soft text-accent"} inline-flex items-center gap-1`}><Ico name={s.singlePath ? "single" : "fork"} className="h-3 w-3" />{s.singlePath ? (s.options.length === 1 ? "One path named" : "Described in words") : `${s.options.length} options`}</span>
            {drugIds.length >= 2 && <Link href={`/compare/?ids=${drugIds.join(",")}`} className="chip border bg-card border-border hover:bg-foreground/5 text-xs">Compare side by side →</Link>}
          </div>
        </div>
        <p className="text-[15px] leading-relaxed mt-3 text-foreground/90">{s.approach}</p>
        {s.guideline && <div className="mt-3 inline-flex items-center gap-2 flex-wrap"><Kicker icon="book">Guideline</Kicker><GuidelineChip g={s.guideline} /></div>}

        <div className="mt-6">
          <Kicker icon="aim">{s.singlePath ? "The path, in plain words" : "The options, in plain words"}</Kicker>
          {s.options.length === 0 ? (
            <p className="text-sm text-muted">This setting names no product or technology record yet; the approach above is the standard as written. Ask your team which specific treatments they mean.</p>
          ) : (
            <div className={`grid gap-4 ${s.options.length > 1 ? "md:grid-cols-2" : ""}`}>{s.options.map((o) => <OptionCard key={o.id} o={o} />)}</div>
          )}
          {s.context.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs"><span className="text-muted inline-flex items-center gap-1"><Ico name="context" className="h-3 w-3" />Also referenced:</span>{s.context.map((c) => <Tip key={c.id} title={c.name} text={c.tldr} href={c.route}><Link href={c.route} className="chip border bg-card border-border hover:bg-foreground/5">{c.name}</Link></Tip>)}</div>}
        </div>

        <div className="mt-6">
          <Kicker icon="flask">The evidence behind it</Kicker>
          {s.evidence.length === 0 ? <p className="text-sm text-muted">No trial record is attached to this row yet. The <Link className="underline" href={`/cancers/${cancerId}/#trials`}>trials tab</Link> lists what is recruiting and the landmark trials for this cancer.</p> : <ul className="space-y-3">{s.evidence.map((e) => <EvidenceRow key={e.id} e={e} options={s.options} />)}</ul>}
        </div>

        <div className="mt-6">
          <Kicker icon="scales">The main trade-offs on record</Kicker>
          <TradeOffs options={s.options} />
        </div>

        <div className="mt-6">
          <Kicker icon="question">Questions to ask about this decision</Kicker>
          <ol className="list-decimal ps-5 space-y-2">{s.questions.map((q, i) => <li key={i} className="text-[15px] leading-relaxed"><span>{q.question}</span><div className="text-sm text-muted mt-0.5">Why: {q.why}</div></li>)}</ol>
          <p className="text-xs text-muted mt-3">Add these to your <Link className="underline" href="/prep/">appointment list</Link>, or take the <Link className="underline" href={`/cancers/${cancerId}/#questions`}>full question set</Link> for this cancer.</p>
        </div>
      </div>
    </section>
  );
}

export default async function DecisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = decisionsFor(id);
  if (!d) notFound();
  const c = graph().must(id);
  const short = d.cancer.name.replace(/\s*\(.*?\)\s*$/, "");
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cancers", href: "/cancers/" }, { label: d.cancer.name, href: routeFor(c) }, { label: "Decisions", href: `/cancers/${id}/decisions/` }]} />
      <PageHeader
        kicker={<GroupKicker id="live"><span className="kicker">·</span><Link href={`${d.cancer.route}#care`} className="kicker hover:underline">Standard of care</Link></GroupKicker>}
        title={`${short}: the decisions you may face`}
        lede={`${d.sections.length} treatment setting${d.sections.length === 1 ? "" : "s"}, ${d.forks} with more than one named option. Each section lays out the options the standard of care names, what each is for, the trials behind them with their recorded results, the side effects and cautions on record, and questions to ask. Built from the cancer page's standard-of-care rows; nothing here is advice for your case.`}
        logo={<span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={d.cancer.id} className="h-8 w-8" /></span>}
        right={<div className="flex flex-col items-end gap-2 text-xs text-muted"><PrintButton /><Link href={`${d.cancer.route}#care`} className="underline">Cancer page →</Link><Link href="/second-opinion/" className="underline">Second-opinion finder →</Link></div>} />
      <Container className="pb-16">
        <nav aria-label="Decision points" className="card p-4 mb-8">
          <Kicker icon="list">Decision points</Kicker>
          <ol className="flex flex-wrap gap-2">
            {d.sections.map((s, i) => (
              <li key={s.id}><a href={`#${s.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-accent hover:bg-accent-soft"><span className="text-muted tabular-nums text-xs">{i + 1}</span><span>{s.setting}</span><Ico name={s.singlePath ? "single" : "fork"} className="h-3 w-3 text-muted" /></a></li>
            ))}
          </ol>
        </nav>
        <div className="space-y-8">{d.sections.map((s) => <SectionCard key={s.id} s={s} cancerId={d.cancer.id} />)}</div>
        <div className="card p-4 mt-8 text-sm text-muted">
          <span className="font-medium text-foreground">How to read this page.</span> Options and results come from OnCo records with their sources; the settings are the standard-of-care rows on the <Link className="underline" href={`${d.cancer.route}#care`}>cancer page</Link>, and the lines of therapy are on the <Link className="underline" href={`/sequencing/${d.cancer.id}/`}>sequencing grid</Link>. Where a setting names one path, the choice is usually about timing, trials and where to be treated: see <Link className="underline" href={`${d.cancer.route}#centres`}>expert centres</Link>. OnCo is orientation, not medical advice.
        </div>
      </Container>
    </>
  );
}
