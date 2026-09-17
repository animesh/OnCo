import Link from "next/link";
import type { Cancer } from "@/lib/schema";
import { questionsFor } from "@/lib/questions";

/** Printable "questions to ask your oncologist", grouped by setting. Server component. */
export function Questions({ cancer }: { cancer: Cancer }) {
  const { source, items } = questionsFor(cancer);
  const settings = [...new Set(items.map((q) => q.setting))];
  return (
    <div className="card p-5 print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div>
          <div className="kicker">Bring to your appointment</div>
          <h3 className="text-lg font-semibold mt-0.5">Questions to ask your oncologist about {cancer.name.replace(/\s*\(.*?\)\s*$/, "")}</h3>
        </div>
        <div className="text-xs text-muted">{source === "handwritten" ? "Curated set" : "Generated from this cancer's standard of care, biomarkers, and pipeline"} · {items.length} questions</div>
      </div>
      <div className="space-y-5">
        {settings.map((s) => (
          <section key={s}>
            <h4 className="font-medium mb-2">{s}</h4>
            <ol className="space-y-2.5 list-decimal pl-5">
              {items.filter((q) => q.setting === s).map((q, i) => (
                <li key={i} className="text-[15px] leading-relaxed">
                  <span>{q.question}</span>
                  <div className="text-sm text-muted mt-0.5">Why: {q.why}</div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className="text-sm mt-5">Newly diagnosed? Read <Link href={`/first-60-days/${cancer.id}/`} className="underline">the first 60 days with {cancer.name.replace(/\s*\(.*?\)\s*$/, "")}</Link>, then print the <Link href={`/prep/${cancer.id}/`} className="underline">one-page appointment sheet</Link> with room for the answers.</p>
      <p className="text-xs text-muted mt-5">Print this page for your appointment (your browser&apos;s print command). These prompts are for discussion; your clinical team knows your case.</p>
    </div>
  );
}
