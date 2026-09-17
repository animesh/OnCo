import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CancerIcon } from "@/components/CancerIcon";
import { GuideIcon } from "@/components/GuideIcon";
import { RememberedCancer } from "@/components/RememberedCancer";
import { WEEKS } from "@/lib/first-60-days";

export const metadata: Metadata = pageMeta({
  title: "The first 60 days",
  description: "A week-by-week plain-English guide to the first sixty days after a cancer diagnosis, one per cancer: the tests, the team, the decisions, the questions, the trials to ask about and the help that costs nothing.",
  path: "/first-60-days/",
});

const STEPS: Array<{ id: keyof typeof WEEKS; title: string; blurb: string }> = [
  { id: "now", title: "What happens now", blurb: "The staging tests and the technologies used to see and type the cancer." },
  { id: "team", title: "Who is on your team", blurb: "The specialties the standard of care names, and the tumour board where they meet." },
  { id: "decisions", title: "Decisions coming up", blurb: "Each treatment setting in the order it occurs, with the guideline behind it." },
  { id: "questions", title: "Questions to ask", blurb: "A question set for each visit, ready to tick and print." },
  { id: "trials", title: "Trials to ask about", blurb: "Trials open now for this cancer, the largest phase first." },
  { id: "free", title: "Help that costs nothing", blurb: "Free testing, helplines, travel help and financial schemes." },
  { id: "read", title: "What to read next", blurb: "The full cancer page and the words you will meet on it." },
];

export default function FirstSixtyDaysIndex() {
  const g = graph();
  const cancers = g.kind("cancer").sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
  const groups = new Map<string, typeof cancers>();
  for (const c of cancers) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="The first 60 days"
        lede="A diagnosis brings a rush of tests, names and decisions. This guide lays them out week by week for your cancer type, in plain words, built from what OnCo records for it: which tests come first, who you will meet, which decisions are ahead, what to ask, which trials to mention, and what you can get for free. The weeks are a typical order, not a schedule; your team's timing is the one that counts. This is orientation, not medical advice." />
      <Container className="pb-16">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <div className="kicker mb-2">Your guide</div>
            <RememberedCancer cancers={cancers.map((c) => ({ id: c.id, name: c.name, group: c.group }))} base="/first-60-days/" verb="The first 60 days with" />
          </div>
          <div>
            <div className="kicker mb-2">What each guide covers</div>
            <ol className="grid gap-2 sm:grid-cols-2">
              {STEPS.map((s) => (
                <li key={s.id} className="card p-3 flex gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><GuideIcon id={s.id} className="h-5 w-5" /></span>
                  <span className="min-w-0"><span className="block text-xs text-muted">{WEEKS[s.id]}</span><span className="block font-medium leading-snug">{s.title}</span><span className="block text-xs text-muted mt-0.5">{s.blurb}</span></span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <h2 className="text-lg font-semibold tracking-tight">Choose a cancer type</h2>
            <span className="text-sm text-muted tabular-nums">{cancers.length} guides</span>
          </div>
          <div className="space-y-6">
            {[...groups.entries()].map(([group, list]) => (
              <div key={group}>
                <div className="kicker mb-2 capitalize">{group}</div>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((c) => (
                    <li key={c.id}>
                      <Link href={`/first-60-days/${c.id}/`} className="card p-3 flex gap-3 hover:shadow-md transition h-full">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-6 w-6" /></span>
                        <span className="min-w-0"><span className="block font-medium leading-snug">{c.name}</span><span className="block text-xs text-muted mt-0.5 line-clamp-2">{c.tldr}</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <p className="text-sm text-muted mt-10">Also for the appointment itself: the <Link href="/prep/" className="underline">prep pack</Link> lets you tick the questions to bring, and each cancer has a <Link href="/prep/" className="underline">one-page sheet</Link> with room for the answers.</p>
      </Container>
    </>
  );
}
