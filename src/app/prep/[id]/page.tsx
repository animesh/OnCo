import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { buildSheet } from "@/lib/first-60-days";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PrepSheet } from "@/components/PrepSheet";

export function generateStaticParams() {
  return graph().kind("cancer").map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = graph().get(id);
  if (!c || c.kind !== "cancer") return {};
  return pageMeta({ title: `Appointment sheet: ${c.name}`, description: `A printable one-page sheet for a ${c.name} appointment: your questions, the words you may hear, the tests and results to bring, the treatments you may be offered, and space for the answers and next steps.`, path: `/prep/${c.id}/` });
}

export default async function PrepSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = graph();
  const c = g.get(id);
  if (!c || c.kind !== "cancer") notFound();
  const data = buildSheet(c, g);
  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="live"><Link href="/prep/" className="kicker hover:text-foreground">· Appointment prep</Link></GroupKicker>}
        title={`Appointment sheet: ${c.name}`}
        ledeNode={<>One page to bring and write on: your details, the questions for <Link href={data.cancer.route} className="underline">{c.name}</Link> plus your own, the words you may hear, what to bring, the treatments the standard of care names, and room for the answers and agreed next steps. What you type stays in this browser. Print it or save it as a PDF. New to all this? Start with <Link href={`/first-60-days/${c.id}/`} className="underline">the first 60 days</Link>. Orientation, not medical advice.</>} />
      <Container className="pb-16">
        <PrepSheet data={data} />
      </Container>
    </>
  );
}
