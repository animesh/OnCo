"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MechanismCard } from "./MechanismCard";
import { DockingScene } from "./DockingScene";
import type { StructureEntry } from "./Molecule3D";

export type ActionTarget = { id: string; name: string; route: string };

/** Class-level account of what happens after binding, in plain words, used when a product has no steps of its own. */
export function defaultSteps(group: string, drug: string, target: string): string[] {
  const t = target || "its target";
  switch (group) {
    case "Antibody-drug conjugate": return [`${drug}'s antibody arm binds ${t} on the surface of the cancer cell.`, "The cell pulls the whole conjugate inside (internalisation).", "The linker is cut in the cell's acidic compartments and the payload is released.", "The payload damages DNA or microtubules, so the cell cannot divide.", "The cancer cell dies; some payload leaks to neighbouring cells (bystander effect)."];
    case "Antibody": return [`${drug} binds ${t}.`, "The bound receptor or ligand can no longer pass its signal.", "Immune cells may recognise the antibody-coated cell and attack it.", "Growth and survival signals fall and the cancer cells stop dividing or die."];
    case "Bispecific or engager": return [`One arm of ${drug} binds ${t} on the cancer cell.`, "The other arm grips a T cell, holding the two cells together.", "The T cell is activated and releases cytotoxic granules.", "The cancer cell is killed and the T cell moves on to the next one."];
    case "Radiopharmaceutical": return [`${drug} binds ${t} on the cancer cell or is taken up by it.`, "The attached radioisotope decays, releasing radiation over a short range.", "DNA in the cancer cell and its close neighbours is broken.", "Cells that cannot repair the damage die over the following days and weeks."];
    case "Degrader": return [`${drug} binds ${t} with one end and an E3 ubiquitin ligase with the other.`, "The ligase tags the target protein with ubiquitin.", "The proteasome shreds the tagged protein; the drug is released and repeats the cycle.", "With the protein gone, the signals that depended on it stop."];
    case "Hormonal": return [`${drug} acts on ${t}, the hormone receptor or the enzyme that makes the hormone.`, "The hormone signal that drives the cancer cells to grow is switched off or starved.", "Growth slows and hormone-dependent cells die over weeks to months."];
    case "Cytotoxic chemotherapy": return [`${drug} enters dividing cells, cancerous and normal alike.`, `It acts on ${t}, interfering with DNA or the machinery of cell division.`, "Cells that are dividing are arrested and die; fast-dividing cancer cells are hit hardest.", "Normal fast-dividing tissues (bone marrow, gut, hair) recover between cycles."];
    case "Protein or peptide": return [`${drug} binds ${t}.`, "The receptor is switched on or blocked, changing the signals the cell receives.", "Immune or growth responses shift as a result."];
    default: return [`${drug} slips into a pocket on ${t}.`, "The occupied pocket can no longer bind its natural partner (often ATP for a kinase).", "The signal the protein normally passes on stops.", "Cancer cells that depended on that signal stop dividing or die; resistance can arise when the pocket mutates."];
  }
}

/**
 * "See it in action": the molecule arriving at its target (from a solved complex where one exists), the animated
 * class schematic of what follows (passed in as `schematic`), and the step-by-step mechanism. Everything is drawn
 * from data already on the page; nothing is fetched from outside the site.
 */
export function SeeItInAction({ drug, group, mechanism, steps, complex, molecule, targets, schematic }: { drug: string; group: string; mechanism: string; steps: string[]; complex?: StructureEntry; molecule?: StructureEntry; targets: ActionTarget[]; schematic?: ReactNode }) {
  const targetText = targets.map((t) => t.name).join(", ");
  const list = steps.length ? steps : defaultSteps(group, drug, targets[0]?.name ?? "");
  const hasDock = !!(complex || molecule);
  if (!hasDock && !schematic) return <MechanismCard steps={list} />;
  return (
    <section className="card overflow-hidden" aria-label="See it in action">
      <div className="px-4 pt-4 pb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="kicker">See it in action</div>
          <p className="text-sm mt-1">
            {mechanism}{targets.length ? <> Connects to {targets.map((t, i) => <span key={t.id}>{i > 0 && (i === targets.length - 1 ? " and " : ", ")}<Link href={t.route} className="underline">{t.name}</Link></span>)}.</> : null}
          </p>
        </div>
        <span className="text-[11px] text-muted">{complex ? "Left: a solved structure of the drug bound to its target." : hasDock ? "Left: the molecule; no solved complex yet." : ""}</span>
      </div>
      <div className={`grid gap-px bg-border ${hasDock && schematic ? "md:grid-cols-2" : ""}`}>
        {hasDock && (
          <div className="bg-card">
            <div className="px-3 pt-2 text-[11px] text-muted">1. Where it connects{targetText ? `: ${targetText}` : ""}</div>
            <DockingScene complex={complex} molecule={molecule} targetName={targetText} />
          </div>
        )}
        {schematic && (
          <div className="bg-card">
            <div className="px-3 pt-2 text-[11px] text-muted">{hasDock ? "2." : "1."} What happens next: the {group.toLowerCase()} schematic</div>
            {schematic}
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <MechanismCard steps={list} title={`${hasDock && schematic ? 3 : 2}. Step by step`} />
      </div>
    </section>
  );
}
