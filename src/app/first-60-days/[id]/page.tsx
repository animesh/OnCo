import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { buildGuide, WEEKS, type Guide, type GuideLink, type GuideSectionId, type GuideSocRow } from "@/lib/first-60-days";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CancerIcon } from "@/components/CancerIcon";
import { GuideIcon } from "@/components/GuideIcon";
import { PrintButton } from "@/components/PrintButton";

export function generateStaticParams() {
  return graph().kind("cancer").map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = graph().get(id);
  if (!c || c.kind !== "cancer") return {};
  return pageMeta({ title: `The first 60 days: ${c.name}`, description: `Week by week after a ${c.name} diagnosis: the tests, the team, the decisions ahead, the questions to ask, the trials to mention and the help that costs nothing. From OnCo's record, in plain words.`, path: `/first-60-days/${c.id}/` });
}

const TITLES: Record<GuideSectionId, string> = {
  now: "What happens now", team: "Who is on your team", decisions: "Decisions coming up", questions: "Questions to ask at each visit",
  trials: "Trials to ask about", free: "Help that costs nothing", read: "What to read next",
};

function Step({ id, children, count }: { id: GuideSectionId; children: React.ReactNode; count?: number }) {
  return (
    <section id={`sec-${id}`} className="print-section relative pl-14 sm:pl-16 scroll-mt-28">
      <span className="absolute left-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent ring-4 ring-background"><GuideIcon id={id} className="h-5 w-5" /></span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
        <a href={`#sec-${id}`} className="kicker hover:text-foreground">{WEEKS[id]}</a>
        <h2 className="text-lg font-semibold tracking-tight leading-snug">{TITLES[id]}</h2>
        {count !== undefined && <span className="text-xs text-muted tabular-nums">{count}</span>}
      </div>
      {children}
    </section>
  );
}

function Chip({ l }: { l: GuideLink }) {
  return <Link href={l.route} title={l.tldr} className="chip border border-border bg-card hover:bg-surface">{l.name}</Link>;
}

function SocRow({ r, n }: { r: GuideSocRow; n?: number }) {
  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        {n !== undefined && <span className="tabular-nums text-muted text-sm">{n}.</span>}
        <Link href={r.href} className="font-medium hover:underline">{r.setting}</Link>
        {r.guideline && (r.guidelineUrl ? <a href={r.guidelineUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted underline">{r.guideline}</a> : <span className="text-xs text-muted">{r.guideline}</span>)}
      </div>
      <p className="text-[15px] leading-relaxed mt-1">{r.approach}</p>
      {r.refs.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{r.refs.map((l) => <Chip key={l.id} l={l} />)}</div>}
    </li>
  );
}

function Nav({ guide }: { guide: Guide }) {
  return (
    <nav aria-label="Sections" className="no-print sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/95 backdrop-blur border-b border-border flex flex-wrap items-center gap-1.5 text-sm">
      {guide.sections.map((s) => <a key={s} href={`#sec-${s}`} className="chip border border-border bg-card hover:bg-surface inline-flex items-center gap-1.5"><GuideIcon id={s} className="h-3.5 w-3.5" />{TITLES[s]}</a>)}
      <span className="ml-auto"><PrintButton title={`The first 60 days: ${guide.cancer.name}`} /></span>
    </nav>
  );
}

export default async function FirstSixtyDaysPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = graph();
  const c = g.get(id);
  if (!c || c.kind !== "cancer") notFound();
  const guide = buildGuide(c, g);
  const { now, team, decisions, questions, trials, free, read } = guide;
  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="live"><Link href="/first-60-days/" className="kicker hover:text-foreground">· The first 60 days</Link></GroupKicker>}
        logo={<span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent mt-1"><CancerIcon cancerId={c.id} className="h-7 w-7" /></span>}
        title={`The first 60 days: ${c.name}`}
        ledeNode={<>{c.tldr} Below, week by week, is what OnCo&apos;s record of <Link href={guide.cancer.route} className="underline">{c.name}</Link> says about the first two months: the order is typical, the timing is yours to ask about. Sections appear only where the record has something to say. Orientation, not medical advice.</>} />
      <Container className="pb-16">
        <Nav guide={guide} />
        <div className="mt-8 space-y-12 max-w-4xl">
          {now && (
            <Step id="now">
              <p className="text-sm text-muted mb-3">Staging tests establish exactly what and where the cancer is. Everything else follows from the answers.</p>
              {now.rows.length > 0 && <ul className="space-y-3">{now.rows.map((r) => <SocRow key={r.setting} r={r} />)}</ul>}
              {now.journeyDiagnosis.length > 0 && (
                <div className="card p-4 mt-3">
                  <div className="kicker mb-1">From the recorded treatment journey</div>
                  <ul className="list-disc ps-5 text-[15px] leading-relaxed space-y-1">{now.journeyDiagnosis.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
              )}
              {now.biomarkers.length > 0 && (
                <div className="mt-3">
                  <div className="kicker mb-1.5">Biomarkers your report may list</div>
                  <div className="flex flex-wrap gap-1.5">{now.biomarkers.map((b) => <Link key={b} href="/biomarker-matrix/" className="chip border border-border bg-card hover:bg-surface">{b}</Link>)}</div>
                  <p className="text-xs text-muted mt-1.5">Ask which of these were tested and what the results were; see the <Link href="/report-reader/" className="underline">report reader</Link> for what each value means.</p>
                </div>
              )}
              {now.technologies.length > 0 && (
                <div className="mt-3">
                  <div className="kicker mb-1.5">Tests and imaging linked to this cancer</div>
                  <div className="flex flex-wrap gap-1.5">{now.technologies.map((t) => <Chip key={t.id} l={t} />)}</div>
                </div>
              )}
              {now.staging.length > 0 && (
                <div className="mt-3">
                  <div className="kicker mb-1.5">How it is staged</div>
                  <div className="flex flex-wrap gap-1.5">{now.staging.map((s) => <Link key={s.id} href={s.route} title={s.meta} className="chip border border-border bg-card hover:bg-surface">{s.name}</Link>)}</div>
                </div>
              )}
            </Step>
          )}

          {team && (
            <Step id="team" count={team.roles.length}>
              <p className="text-sm text-muted mb-3">These specialties appear in the standard of care for this cancer. In most centres they meet weekly as a <Link href="/tumor-board/" className="underline">tumour board</Link> to agree each plan; you can ask when yours was discussed and what was decided.</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {team.roles.map((r) => (
                  <li key={r.role}><Link href={r.href} className="card p-3 block hover:shadow-md transition h-full"><span className="block font-medium">{r.role}</span><span className="block text-xs text-muted mt-0.5">{r.because}</span></Link></li>
                ))}
              </ul>
              <p className="text-xs text-muted mt-2">A <Link href="/second-opinion/" className="underline">second opinion</Link> from a centre that treats many similar cases is normal, not rude; the standard of care tells you what to compare it against.</p>
            </Step>
          )}

          {decisions && (
            <Step id="decisions" count={decisions.rows.length + decisions.journeys.reduce((n, j) => n + j.decisions.length, 0)}>
              <p className="text-sm text-muted mb-3">Each row is a setting from the standard of care, in the order it usually arises. Not all will apply to you; your stage and biomarkers decide which do. The guideline grade, where recorded, says how strong the evidence is.</p>
              {decisions.rows.length > 0 && <ol className="space-y-3">{decisions.rows.map((r, i) => <SocRow key={`${r.setting}-${i}`} r={r} n={i + 1} />)}</ol>}
              {decisions.journeys.map((j) => (
                <div key={j.id} className="card p-4 mt-3">
                  <div className="kicker mb-1">Decision points in the recorded journey, <Link href={j.route} className="underline">{j.stage}</Link></div>
                  <ul className="list-disc ps-5 text-[15px] leading-relaxed space-y-1">{j.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
              ))}
            </Step>
          )}

          {questions && (
            <Step id="questions" count={questions.groups.reduce((n, [, qs]) => n + qs.length, 0)}>
              <p className="text-sm text-muted mb-3">{questions.source === "handwritten" ? "Written by hand for this cancer." : "Generated from this cancer's standard of care, biomarkers and open problems."} Take the group that matches where you are. To tick, add your own and print, open the <Link href={`/prep/${c.id}/`} className="underline">one-page appointment sheet</Link>.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {questions.groups.map(([setting, qs]) => (
                  <div key={setting} className="card p-4">
                    <h3 className="font-medium mb-2">{setting}</h3>
                    <ol className="list-decimal ps-5 space-y-1.5 text-[15px] leading-snug">{qs.map((q, i) => <li key={i}>{q.question}<span className="block text-xs text-muted mt-0.5">{q.why}</span></li>)}</ol>
                  </div>
                ))}
              </div>
            </Step>
          )}

          {trials && (
            <Step id="trials" count={trials.length}>
              <p className="text-sm text-muted mb-3">Trials open now for this cancer in OnCo, largest phase first. Joining a trial is a decision like any other: ask what the comparison arm is, whether a placebo is used, and what happens if you leave. The <Link href={`${guide.cancer.route}#sec-trials`} className="underline">cancer page</Link> searches ClinicalTrials.gov live for more.</p>
              <ul className="space-y-2">
                {trials.map((t) => (
                  <li key={t.id}>
                    <Link href={t.route} className="card p-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 hover:shadow-md transition">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-xs text-muted">Phase {t.phase}{t.status ? ` · ${t.status}` : ""}{t.nct ? ` · ${t.nct}` : ""}</span>
                      <span className="block w-full text-sm text-muted">{t.setting}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Step>
          )}

          <Step id="free" count={free.links.length}>
            <p className="text-sm text-muted mb-3">Much of what helps in the first weeks is free if you know to ask: testing, helplines, rides and lodging, second opinions, trial travel.</p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {free.links.map((l) => <li key={l.id}><Link href={l.route} className="card p-3 block hover:shadow-md transition h-full"><span className="block font-medium">{l.name}</span><span className="block text-xs text-muted mt-0.5">{l.tldr}</span></Link></li>)}
            </ul>
          </Step>

          <Step id="read" count={read.pages.length + read.terms.length}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {read.pages.map((p) => <li key={p.id}><Link href={p.route} className="card p-3 block hover:shadow-md transition h-full"><span className="block font-medium">{p.name}</span>{p.tldr && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{p.tldr}</span>}</Link></li>)}
            </ul>
            {read.terms.length > 0 && (
              <div className="mt-4">
                <div className="kicker mb-1.5">Words this page and the cancer page use</div>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {read.terms.map((t) => <li key={t.id} className="text-sm"><Link href={t.route} className="font-medium underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground">{t.name}</Link>{t.tldr && <span className="text-muted">: {t.tldr}</span>}</li>)}
                </ul>
                <p className="text-xs text-muted mt-2">Every term links to the <Link href="/terms/" className="underline">glossary</Link>.</p>
              </div>
            )}
          </Step>
        </div>
      </Container>
    </>
  );
}
