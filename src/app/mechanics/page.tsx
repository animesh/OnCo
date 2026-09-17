import type { Metadata } from "next";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor, type Entity, type Kind, type Pathway } from "@/lib/schema";
import { KIND_COLOR } from "@/lib/text";
import { pathwayView } from "@/lib/pathway-products";
import { MECHANICS, MECHANICS_STAGE_COUNT, type MechanicsStage } from "@/data/mechanics-atlas";
import { PathwayDiagramInteractive } from "@/components/PathwayDiagramInteractive";
import { ChipList, Container, GroupKicker, PageHeader } from "@/components/ui";
import { Tip } from "@/components/Tip";
import { FrontIcon } from "@/components/FrontIcon";
import { THEORY_HUB_ID, THEORY_ICONS, THEORY_IDS, theoryStatus } from "@/data/theories-wave";

export const metadata: Metadata = {
  title: "Mechanics of cancer",
  description: "How cancer works, drawn stage by stage: the body's defences, how a cell turns malignant, the replication machinery, death and repair, feeding, immune escape, metastasis, the tumour ecosystem, and why treatments fail. Every mechanism linked to the drugs and technologies that act on it.",
};

/** Resolve ids of one kind through the graph; anything missing is silently skipped. */
function pick<K extends Kind>(ids: string[] | undefined, kind: K): Extract<Entity, { kind: K }>[] {
  const g = graph();
  const out: Extract<Entity, { kind: K }>[] = [];
  for (const id of ids ?? []) {
    const e = g.get(id);
    if (e && e.kind === kind) out.push(e as Extract<Entity, { kind: K }>);
  }
  return out;
}

/** A linked chip with a hover explanation, for technologies, targets, terms and bottlenecks. */
function TipChip({ e }: { e: Entity }) {
  return (
    <Tip title={e.name} text={e.tldr} href={routeFor(e)} inline={false}>
      <Link href={routeFor(e)} className={`chip border transition-[filter] hover:brightness-95 dark:hover:brightness-125 ${KIND_COLOR[e.kind]}`}>{e.name}</Link>
    </Tip>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[7.5rem_1fr] sm:gap-4 items-start">
      <div className="kicker pt-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

const DIAGRAMS_PER_STAGE = 2;

export default function MechanicsPage() {
  const g = graph();
  // Each pathway diagram is drawn once, at the first stage that lists it; later stages link back to it.
  const drawnAt = new Map<string, { anchor: string; stageTitle: string }>();
  const plan = MECHANICS.map((c) => ({
    ...c,
    stages: c.stages.map((s) => {
      const anchor = `s-${s.id}`;
      const pathways = pick(s.pathways, "pathway");
      const draw: Pathway[] = [];
      const linked: Array<{ p: Pathway; back?: { anchor: string; stageTitle: string } }> = [];
      for (const p of pathways) {
        const prior = drawnAt.get(p.id);
        if (!prior && draw.length < DIAGRAMS_PER_STAGE) { draw.push(p); drawnAt.set(p.id, { anchor, stageTitle: s.title }); }
        else linked.push({ p, back: prior });
      }
      return { stage: s, anchor, draw, linked };
    }),
  }));

  const diagramCount = drawnAt.size;
  const drugIds = new Set(MECHANICS.flatMap((c) => c.stages.flatMap((s) => s.drugs)).filter((id) => g.get(id)?.kind === "drug"));
  const targetIds = new Set(MECHANICS.flatMap((c) => c.stages.flatMap((s) => s.targets)).filter((id) => g.get(id)?.kind === "target"));
  const theoryHub = g.get(THEORY_HUB_ID);
  const theories = pick([...THEORY_IDS], "term");

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="map" />}
        title="Mechanics of cancer"
        lede="How cancer works, drawn stage by stage: from the defences a tumour has to breach, through the machinery it hijacks to copy itself, to the ways it feeds, hides, spreads and outlasts treatment. Every stage is a diagram, and every diagram is tied to the drugs, technologies and targets that act on it."
      />
      <Container className="pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            [MECHANICS.length, "chapters"], [MECHANICS_STAGE_COUNT, "stages"], [diagramCount, "pathway diagrams"], [drugIds.size + targetIds.size, "products and targets placed"],
          ].map(([n, label]) => (
            <div key={label} className="card px-4 py-3">
              <div className="text-2xl font-semibold tabular-nums leading-none">{n}</div>
              <div className="kicker mt-1.5">{label}</div>
            </div>
          ))}
        </div>

        <p className="text-[15px] text-muted max-w-3xl leading-relaxed">
          Read it top to bottom as a story, or jump to a chapter. In each diagram, violet boxes are druggable targets; pick a product above a diagram to see which
          nodes it hits and where the escape routes are. The <Link href="/resistance/" className="underline">resistance atlas</Link> continues chapter nine class by class, and
          the <Link href="/pathways/" className="underline">pathway index</Link> lists every diagram alone.
        </p>

        <nav aria-label="Chapters" className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-8 mb-6 bg-background/95 backdrop-blur border-y border-border flex flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible items-center gap-1.5 text-sm">
          <span className="kicker mr-1 hidden sm:inline">Chapters</span>
          {MECHANICS.map((c, i) => (
            <a key={c.id} href={`#c-${c.id}`} className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap">
              <span className="text-muted tabular-nums mr-1">{i + 1}</span>{c.title}
            </a>
          ))}
          {theories.length > 0 && (
            <a href="#c-theories" className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap">
              <span className="text-muted tabular-nums mr-1">{MECHANICS.length + 1}</span>Theories
            </a>
          )}
        </nav>

        <div className="space-y-16">
          {plan.map((c, ci) => (
            <section key={c.id} id={`c-${c.id}`} className="scroll-mt-28">
              <header className="max-w-3xl">
                <div className="kicker">Chapter {ci + 1} · {c.stages.length} stages</div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-balance">{c.title}</h2>
                <p className="mt-3 text-[15px] sm:text-base text-foreground/85 leading-relaxed">{c.plain}</p>
                <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {c.stages.map(({ stage, anchor }, si) => (
                    <li key={anchor}><a href={`#${anchor}`} className="text-muted hover:text-foreground"><span className="tabular-nums">{ci + 1}.{si + 1}</span> {stage.title}</a></li>
                  ))}
                </ol>
              </header>

              <div className="mt-8 space-y-12">
                {c.stages.map(({ stage, anchor, draw, linked }, si) => (
                  <StageBlock key={anchor} stage={stage} anchor={anchor} number={`${ci + 1}.${si + 1}`} draw={draw} linked={linked} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {theories.length > 0 && (
          <section id="c-theories" className="mt-16 scroll-mt-28">
            <header className="max-w-3xl">
              <div className="kicker">Chapter {MECHANICS.length + 1} · {theories.length} schools of thought</div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-balance">Theories of cancer</h2>
              <p className="mt-3 text-[15px] sm:text-base text-foreground/85 leading-relaxed">
                The chapters above describe what cancer does. This chapter is about what cancer is: the schools of thought that have tried to explain it, from Boveri&apos;s
                chromosomes and the somatic mutation theory to bioelectric patterning, with what each got right, what it got wrong, and the treatments that came from it.
                Solid arrows in the map mean one theory feeds another; blocked arrows mean it was proposed against another.
              </p>
            </header>
            {theoryHub?.kind === "pathway" && (
              <figure className="mt-6">
                <PathwayDiagramInteractive view={pathwayView(theoryHub)} />
                <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                  <Link href={routeFor(theoryHub)} className="font-medium underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground">{theoryHub.name}</Link>
                  <span className="text-muted leading-snug">Open the hub for the full comparison and the scorecard of what has panned out.</span>
                </figcaption>
                {theoryHub.analogy && <p className="mt-1.5 text-sm text-muted italic max-w-3xl leading-relaxed">{theoryHub.analogy}</p>}
              </figure>
            )}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {theories.map((e) => {
                const status = theoryStatus(e.summary);
                return (
                  <li key={e.id}>
                    <Link href={routeFor(e)} className="card h-full p-4 flex gap-3 transition-[filter] hover:brightness-95 dark:hover:brightness-125">
                      <FrontIcon id={THEORY_ICONS[e.id] ?? "drug-discovery"} className="h-6 w-6 shrink-0 text-accent mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-medium leading-snug text-balance">{e.name}</div>
                        {status && <div className="kicker mt-1">{status}</div>}
                        <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-4">{e.tldr}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-16 text-xs text-muted max-w-3xl leading-relaxed">
          How this page is built: the chapters and stages are a curated atlas (<code>src/data/mechanics-atlas.ts</code>); every diagram, drug, target, technology and term is an
          object in the knowledge graph with its own page and sources. Each diagram is drawn once, at the first stage that needs it, and later stages link back to it.
          Nothing here is medical advice; see <Link href="/about/" className="underline">about and methodology</Link>.
        </div>
      </Container>
    </>
  );
}

function StageBlock({ stage, anchor, number, draw, linked }: {
  stage: MechanicsStage; anchor: string; number: string; draw: Pathway[]; linked: Array<{ p: Pathway; back?: { anchor: string; stageTitle: string } }>;
}) {
  const drugs = pick(stage.drugs, "drug");
  const technologies = pick(stage.technologies, "technology");
  const targets = pick(stage.targets, "target");
  const terms = pick(stage.terms, "term");
  const bottlenecks = pick(stage.bottlenecks, "bottleneck");
  const actsHere = drugs.length + technologies.length + targets.length > 0;

  return (
    <article id={anchor} className="scroll-mt-28">
      <div className="max-w-3xl">
        <div className="kicker">Stage {number}</div>
        <h3 className="text-xl font-semibold tracking-tight mt-0.5 text-balance">{stage.title}</h3>
        <p className="mt-2 text-[15px] text-foreground/85 leading-relaxed">{stage.plain}</p>
      </div>

      {draw.length > 0 && (
        <div className="mt-5 space-y-5">
          {draw.map((p) => (
            <figure key={p.id}>
              <PathwayDiagramInteractive view={pathwayView(p)} />
              <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <Link href={routeFor(p)} className="font-medium underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground">{p.name}</Link>
                <span className="text-muted leading-snug">{p.tldr}</span>
              </figcaption>
              {p.analogy && <p className="mt-1.5 text-sm text-muted italic max-w-3xl leading-relaxed">{p.analogy}</p>}
            </figure>
          ))}
        </div>
      )}

      {linked.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="kicker mr-1">Also drawn</span>
          {linked.map(({ p, back }) => back ? (
            <a key={p.id} href={`#${back.anchor}`} className={`chip border ${KIND_COLOR.pathway}`} title={`Drawn at ${back.stageTitle}`}>{p.name} <span aria-hidden className="opacity-60">↑</span></a>
          ) : (
            <Link key={p.id} href={routeFor(p)} className={`chip border ${KIND_COLOR.pathway}`}>{p.name}</Link>
          ))}
        </div>
      )}

      <div className="card mt-5 p-4 sm:p-5 space-y-3.5">
        {actsHere && (
          <Row label="Acts here">
            {drugs.length > 0 && <ChipList items={drugs} />}
            {technologies.map((e) => <TipChip key={e.id} e={e} />)}
            {targets.map((e) => <TipChip key={e.id} e={e} />)}
          </Row>
        )}
        {terms.length > 0 && <Row label="Words">{terms.map((e) => <TipChip key={e.id} e={e} />)}</Row>}
        {bottlenecks.length > 0 && <Row label="Bottleneck">{bottlenecks.map((e) => <TipChip key={e.id} e={e} />)}</Row>}
        {stage.openQuestions.length > 0 && (
          <div className="grid gap-1.5 sm:grid-cols-[7.5rem_1fr] sm:gap-4 items-start">
            <div className="kicker pt-1">Open questions</div>
            <ul className="space-y-1 text-sm leading-relaxed">
              {stage.openQuestions.map((q) => <li key={q} className="pl-3 border-l-2 border-accent/50">{q}</li>)}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
