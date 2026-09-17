import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, KindChip, PageHeader } from "@/components/ui";
import { issueUrl, REPO } from "@/lib/issue-links";
import { reviewCoverage, reviewQueue, translationCoverage, TRACK_META, type Track } from "@/lib/review-queue";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { panelOverview, STANCE_META } from "@/lib/model-reviews";
import { DisagreeIcon, HumanIcon, MachineCommentaryNote, PanelIcon } from "@/components/ModelPanel";
import { KindIcon } from "@/components/KindIcon";

export const metadata: Metadata = pageMeta({ title: "Review: model panel and human queue", description: "A panel of named AI models comments on OnCo records (machine commentary, not clinical review) and a queue ranks which pages most need a named clinical, scientific, regulatory or patient-advocate reviewer.", path: "/review/" });

const TRACKS: Track[] = ["clinical", "scientific", "regulatory", "advocate"];
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

const H2 = ({ id, icon, children }: { id?: string; icon: React.ReactNode; children: React.ReactNode }) => <h2 id={id} className="text-2xl font-semibold tracking-tight mb-3 inline-flex items-center gap-2"><span className="text-accent">{icon}</span>{children}</h2>;

export default function ReviewPage() {
  const queue = reviewQueue();
  const cov = reviewCoverage();
  const langs = translationCoverage();
  const top = queue.slice(0, 50);
  const translationIssue = issueUrl("translation-review", {}, { title: "translation review: " });
  const panel = panelOverview();
  const g = graph();
  const splits = panel.records.filter((r) => r.disagreements > 0).length;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="Review"
        lede={`Two layers sit on every record. A panel of named AI models comments on what is right, what is missing and what is disputed, each claim tied to the record's own sources: machine commentary, not clinical review. Human reviewers sign pages off on top of it. ${cov.reviewed
          ? `${cov.reviewed.toLocaleString("en-GB")} of ${cov.total.toLocaleString("en-GB")} reviewable pages carry a named human review; the queue below ranks the rest by reach, stakes and staleness.`
          : `${cov.total.toLocaleString("en-GB")} pages are open for a named human review and none has one yet; the queue below ranks them by reach, stakes and staleness.`}`} />
      <Container className="pb-16">
        <nav aria-label="Sections" className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-8">
          {[["#panel", "Model panel"], ["#disagreements", "Where models disagree"], ["#coverage", "Human coverage"], ["#queue", "The human queue"], ["#tracks", "By track"], ["#translations", "Translations"], ["#how", "How to review"]].map(([href, label]) => (
            <a key={href} href={href} className="underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground">{label}</a>
          ))}
        </nav>

        <section id="panel" className="scroll-mt-24">
          <H2 icon={<PanelIcon className="h-6 w-6" />}>Model panel</H2>
          <p className="text-sm text-muted mb-2 max-w-3xl">Each model on the panel reads a record and its linked records, then returns verdicts on the record&apos;s own claims: <span className="font-medium text-foreground">{STANCE_META.supports.label.toLowerCase()}</span> (stated and backed by the source), <span className="font-medium text-foreground">{STANCE_META.disputes.label.toLowerCase()}</span>, <span className="font-medium text-foreground">{STANCE_META.missing.label.toLowerCase()}</span> or <span className="font-medium text-foreground">{STANCE_META.unclear.label.toLowerCase()}</span>. Model name, version and date are shown on every card and sources come only from the record&apos;s own links. Hand-written illustrations carry an <span className="chip border border-dashed border-foreground/30 text-muted">Example</span> badge.</p>
          <MachineCommentaryNote className="mb-4 max-w-3xl" />
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            <div className="card p-4"><div className="kicker mb-1">Models on the panel</div><div className="text-2xl font-semibold tabular-nums">{panel.models.filter((m) => m.onPanel).length}</div><div className="text-xs text-muted">{panel.models.filter((m) => m.onPanel).map((m) => m.name).join(", ")}</div></div>
            <div className="card p-4"><div className="kicker mb-1">Records with commentary</div><div className="text-2xl font-semibold tabular-nums">{panel.records.length}</div><div className="text-xs text-muted">{panel.records.filter((r) => r.example).length ? `${panel.records.filter((r) => r.example).length} example${panel.records.filter((r) => r.example).length === 1 ? "" : "s"} so far` : "live model output"}</div></div>
            <div className="card p-4"><div className="kicker mb-1">Records where models disagree</div><div className="text-2xl font-semibold tabular-nums">{splits}</div><div className="text-xs text-muted">same claim, different stances</div></div>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="p-3">Model</th><th className="p-3">Provider</th><th className="p-3">Version</th><th className="p-3 text-right">Records reviewed</th><th className="p-3">Latest</th></tr></thead>
              <tbody className="divide-y divide-border">
                {panel.models.map((m) => (
                  <tr key={m.id}>
                    <td className="p-3 font-medium"><span className="inline-flex items-center gap-2"><PanelIcon className="h-4 w-4 text-accent" />{m.name}{!m.onPanel && <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" title="Found in review files but not in the current panel table">past member</span>}</span></td>
                    <td className="p-3 text-muted">{m.provider}</td>
                    <td className="p-3 text-muted"><code className="text-xs">{m.id}</code> · v{m.version}</td>
                    <td className="p-3 text-right tabular-nums">{m.records}</td>
                    <td className="p-3 text-muted tabular-nums">{m.latest ?? "none yet"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">The panel table lives in <code>src/lib/model-reviews.ts</code>; reviews are written by <code>scripts/model-reviews.ts</code> to <code>public/reviews/models/</code>, one JSON file per record, and validated when the site is built.</p>
        </section>

        <section id="disagreements" className="scroll-mt-24 mt-12">
          <H2 icon={<DisagreeIcon className="h-6 w-6" />}>Where models disagree</H2>
          <p className="text-sm text-muted mb-4 max-w-3xl">Records with commentary, those that split the panel first. A split means two models gave the same claim different stances; the record page shows each position with its source.</p>
          {panel.records.length ? (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted"><tr><th className="p-3">Record</th><th className="p-3 text-right">Models</th><th className="p-3 text-right">Disagreements</th><th className="p-3">Latest</th><th className="p-3"></th></tr></thead>
                <tbody className="divide-y divide-border">
                  {panel.records.map((r) => {
                    const e = g.get(r.recordId);
                    return (
                      <tr key={r.recordId}>
                        <td className="p-3"><div className="flex items-center gap-2">{e && <KindChip kind={e.kind} />}{e ? <Link href={routeFor(e)} className="font-medium hover:underline">{e.name}</Link> : <code>{r.recordId}</code>}{r.example && <span className="chip border border-dashed border-foreground/30 text-muted">Example</span>}</div></td>
                        <td className="p-3 text-right tabular-nums">{r.models}</td>
                        <td className="p-3 text-right tabular-nums">{r.disagreements ? <span className={`chip ${STANCE_META.disputes.cls}`}>{r.disagreements}</span> : <span className="text-muted">agree</span>}</td>
                        <td className="p-3 text-muted tabular-nums">{r.latest}</td>
                        <td className="p-3 text-right">{e && <Link className="text-xs underline whitespace-nowrap" href={routeFor(e)}>Read the panel</Link>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-muted">No record carries model commentary yet.</p>}
        </section>

        <section id="coverage" className="scroll-mt-24 mt-12">
          <H2 icon={<HumanIcon className="h-6 w-6" />}>Human coverage</H2>
          <p className="text-sm text-muted mb-3 max-w-3xl">Named clinicians, scientists, regulatory specialists and patient advocates sign pages off on top of the model panel. A human review is a statement about a page on a date and is the only review OnCo treats as clinical.</p>
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            <div className="card p-4"><div className="kicker mb-1">Pages reviewed</div>{cov.reviewed ? <div className="text-2xl font-semibold tabular-nums">{cov.reviewed.toLocaleString("en-GB")} <span className="text-sm text-muted font-normal">of {cov.total.toLocaleString("en-GB")} ({pct(cov.reviewed, cov.total)}%)</span></div> : <div className="text-2xl font-semibold">None yet <span className="text-sm text-muted font-normal">of {cov.total.toLocaleString("en-GB")} open for review</span></div>}</div>
            <div className="card p-4"><div className="kicker mb-1">Expert sign-offs</div><div className="text-2xl font-semibold tabular-nums">{cov.byTrack.expert}</div><div className="text-xs text-muted">clinical, scientific and regulatory tracks</div></div>
            <div className="card p-4"><div className="kicker mb-1">Patient-advocate sign-offs</div><div className="text-2xl font-semibold tabular-nums">{cov.byTrack.advocate}</div><div className="text-xs text-muted">TL;DRs, simple text and questions</div></div>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="p-3">Kind</th><th className="p-3 text-right">Pages</th><th className="p-3 text-right">Expert</th><th className="p-3 text-right">Advocate</th><th className="p-3 text-right">Any review</th><th className="p-3">Tracks needed</th></tr></thead>
              <tbody className="divide-y divide-border">
                {cov.byKind.map((k) => (
                  <tr key={k.kind}>
                    <td className="p-3"><KindChip kind={k.kind} /></td>
                    <td className="p-3 text-right tabular-nums">{k.total.toLocaleString("en-GB")}</td>
                    <td className="p-3 text-right tabular-nums">{k.expert}</td>
                    <td className="p-3 text-right tabular-nums">{k.advocate}</td>
                    <td className="p-3 text-right tabular-nums">{k.any} <span className="text-muted">({pct(k.any, k.total)}%)</span></td>
                    <td className="p-3 text-xs text-muted">{k.needs.map((t) => TRACK_META[t].label).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">Companies, institutions, people, collections and journals are attributed (who wrote the record) rather than reviewed; organisations correct their own records through Suggest an edit.</p>
        </section>

        <section id="queue" className="scroll-mt-24 mt-12">
          <H2 icon={<KindIcon kind="person" className="h-6 w-6" />}>The human queue</H2>
          <p className="text-sm text-muted mb-4 max-w-3xl">Score out of 100: <strong>reach</strong> (graph connections, log-scaled, up to 40), <strong>stakes</strong> (evidence score or a kind default, up to 30), <strong>staleness</strong> (days since the record&apos;s <code>asOf</code>, a year is 30). Pages already reviewed on every track they need within a year sort to the bottom.</p>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="p-3">#</th><th className="p-3">Page</th><th className="p-3 text-right">Score</th><th className="p-3 text-right">Links</th><th className="p-3 text-right">Evidence</th><th className="p-3 text-right">Age</th><th className="p-3">Needs</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y divide-border">
                {top.map((q, i) => (
                  <tr key={q.id}>
                    <td className="p-3 text-muted tabular-nums">{i + 1}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><KindChip kind={q.kind} /><Link href={q.route} className="font-medium hover:underline">{q.name}</Link></div></td>
                    <td className="p-3 text-right tabular-nums" title={`reach ${q.parts.reach} + stakes ${q.parts.stakes} + staleness ${q.parts.staleness}`}>{q.score}</td>
                    <td className="p-3 text-right tabular-nums">{q.degree}</td>
                    <td className="p-3 text-right tabular-nums">{q.evidence ?? <span className="text-muted">n/a</span>}</td>
                    <td className="p-3 text-right tabular-nums">{q.daysOld} d</td>
                    <td className="p-3 text-xs text-muted">{q.missing.length ? q.missing.map((t) => TRACK_META[t].label).join(", ") : "reviewed"}</td>
                    <td className="p-3 text-right"><a className="text-xs underline whitespace-nowrap" href={q.issueUrl} rel="noopener">Review this page</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">Showing the top {top.length} of {queue.length.toLocaleString("en-GB")} reviewable pages.</p>
        </section>

        <section id="tracks" className="scroll-mt-24 mt-12">
          <H2 icon={<KindIcon kind="section" className="h-6 w-6" />}>By track</H2>
          <p className="text-sm text-muted mb-4 max-w-3xl">The ten highest-need pages for each track, so a clinician, a scientist, a regulatory specialist or an advocate can start without reading the whole queue.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {TRACKS.map((t) => {
              const rows = queue.filter((q) => q.missing.includes(t)).slice(0, 10);
              return (
                <div key={t} className="card p-4">
                  <div className="kicker mb-1">{TRACK_META[t].label}</div>
                  <p className="text-xs text-muted mb-3">{TRACK_META[t].checks}</p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    {rows.map((q) => (
                      <li key={q.id} className="flex flex-wrap items-baseline justify-between gap-x-3"><Link href={q.route} className="hover:underline">{q.name}</Link><a className="text-xs underline text-muted" href={issueUrl("review", { entity: `${q.id} (${q.kind}) · ${q.name}`, track: t, page: `https://onco.cc${q.route}` }, { title: `review: ${q.id}` })} rel="noopener">review</a></li>
                    ))}
                    {!rows.length && <li className="text-muted list-none -ml-5">Nothing outstanding on this track.</li>}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>

        <section id="translations" className="scroll-mt-24 mt-12">
          <H2 icon={<KindIcon kind="term" className="h-6 w-6" />}>Translations</H2>
          <p className="text-sm text-muted mb-4 max-w-3xl">Every translated TL;DR is machine-assisted until a named speaker of the language reviews it. Pages show <span className="text-[10px] font-semibold border border-border rounded px-1">MT</span> until then and <span className="text-[10px] font-semibold border rounded px-1 text-emerald-800 border-emerald-300 dark:text-emerald-200 dark:border-emerald-800">Reviewed</span> after. Reviews are recorded in <code>src/data/i18n/reviewed.ts</code>.</p>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted"><tr><th className="p-3">Language</th><th className="p-3 text-right">Translated TL;DRs</th><th className="p-3 text-right">Reviewed</th><th className="p-3 text-right">Reviewers</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y divide-border">
                {langs.map((l) => (
                  <tr key={l.lang}>
                    <td className="p-3">{l.label} <span className="text-muted">{l.native}</span></td>
                    <td className="p-3 text-right tabular-nums">{l.translated.toLocaleString("en-GB")}</td>
                    <td className="p-3 text-right tabular-nums">{l.reviewed} <span className="text-muted">({pct(l.reviewed, l.translated)}%)</span></td>
                    <td className="p-3 text-right tabular-nums">{l.reviewers}</td>
                    <td className="p-3 text-right"><a className="text-xs underline whitespace-nowrap" href={issueUrl("translation-review", { language: l.label }, { title: `translation review: ${l.lang}` })} rel="noopener">Review translations</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">Spotted a wrong translation on one page? Use <a className="underline" href={issueUrl("translation-fix", {}, { title: "translation: " })} rel="noopener">Translation fix</a>; to sign off a batch, <a className="underline" href={translationIssue} rel="noopener">Translation review</a>.</p>
        </section>

        <section id="how" className="scroll-mt-24 mt-12 max-w-3xl">
          <H2 icon={<KindIcon kind="paper" className="h-6 w-6" />}>How to review</H2>
          <ol className="list-decimal pl-5 space-y-2 text-[15px] leading-relaxed">
            <li>Pick a page from the queue and read it with its linked sources open.</li>
            <li>Click <em>Review this page</em>. The issue form carries the checklist for your track: {TRACKS.map((t) => TRACK_META[t].label.toLowerCase()).join(", ")}. Say what you checked and what you found wrong, with sources.</li>
            <li>State your name, role and organisation, a profile URL we can verify, and your conflicts of interest for the last three years. &ldquo;None declared&rdquo; is a valid answer and is displayed.</li>
            <li>A maintainer verifies identity, fixes anything you flagged (each fix is a sourced edit through the same gate), then records the sign-off in <code>src/data/reviews.ts</code>. The badge appears on the page with your name, the date and your COI statement, and you appear on the <Link className="underline" href="/reviewers/">roster</Link>.</li>
          </ol>
          <p className="text-sm text-muted mt-4">A review is a statement about a page on a date, not an endorsement. Nothing is edited directly by reviewers or by anyone else: every change enters as an issue and is checked before it is merged. Tracks and verification rules: <a className="underline" href={`${REPO}/blob/main/.github/REVIEWERS.md`} rel="noopener">REVIEWERS.md</a>.</p>
        </section>
      </Container>
    </>
  );
}
