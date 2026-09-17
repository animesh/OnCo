import type { TermInput } from "@/lib/schema";

/** Drug-class pages for the modality headers of the pivot table and elsewhere. */
const asOf = "2026-09-17";
type T = Omit<TermInput, "kind" | "asOf" | "links"> & { wikipedia?: string };
const t = (x: T): TermInput => ({ kind: "term", asOf, links: x.wikipedia ? [{ label: "Wikipedia", url: x.wikipedia }] : undefined, ...x });

export const termsModalities: TermInput[] = [
  t({
    id: "small-molecule", name: "Small molecule drug", category: "Treatment jargon",
    aka: ["small molecule", "small molecules", "small-molecule inhibitor", "small-molecule drug", "oral targeted drug", "chemical drug"],
    wikipedia: "https://en.wikipedia.org/wiki/Small_molecule",
    tldr: "A small molecule drug is a chemically made medicine small enough to slip inside cells, so it can usually be taken as a tablet.",
    summary: "A small molecule is a drug built by chemical synthesis rather than grown in living cells. Its molecules are hundreds of times lighter than an antibody, which lets them cross cell membranes and reach targets inside the cell, such as kinases, DNA repair enzymes and survival proteins. Most kinase inhibitors, PARP inhibitors, BCL2 inhibitors and hormone blockers are small molecules, and so is almost every classic chemotherapy drug.\n\nBecause they are stable and absorbed from the gut, small molecules are usually tablets or capsules taken at home, which is why so much of modern targeted therapy is oral. The trade-offs are the flip side of the same chemistry: they are cleared by liver enzymes, so food and other medicines can change their levels; they can bind related proteins and cause off-target side effects; and a single mutation in the target can stop them binding, which is a common route to resistance.\n\nThe other big class is biologics: antibodies, antibody-drug conjugates, bispecifics and cell therapies. These are made in cells, given by infusion or injection, and act mainly on targets at the cell surface or in the blood. Many treatment plans combine both, for example a small-molecule inhibitor with an antibody, or chemotherapy with a checkpoint inhibitor. The rule-of-thumb properties that predict whether a small molecule will be absorbed by mouth were set out by Lipinski and by Veber, and still guide drug design.",
    technologies: ["kinase-inhibitors", "protac-degrader", "peptide-drug-conjugate", "cytotoxic-chemotherapy"],
    drugs: ["imatinib", "osimertinib", "olaparib", "venetoclax"],
    terms: ["antibody", "monoclonal", "targeted-therapy-term"],
    keyPapers: ["paper-veber-oral-bioavailability-jmedchem-2002"],
  }),
  t({
    id: "vaccines-and-oncolytic-viruses", name: "Cancer vaccines and oncolytic viruses", category: "Immunology",
    aka: ["therapeutic cancer vaccine", "cancer vaccine", "cancer vaccines", "oncolytic virus therapy", "vaccine or oncolytic", "tumour vaccine"],
    wikipedia: "https://en.wikipedia.org/wiki/Cancer_vaccine",
    tldr: "Cancer vaccines teach the immune system to recognise proteins on tumour cells; oncolytic viruses infect and burst cancer cells while raising the alarm to immunity.",
    summary: "Two kinds of vaccine matter in oncology. Preventive vaccines stop the infections that cause cancer: HPV vaccination prevents most cervical cancers and hepatitis B vaccination prevents many liver cancers. Therapeutic vaccines are given to people who already have cancer and aim to train T cells against tumour proteins. They come in several forms: off-the-shelf vaccines against antigens shared by many tumours, personalised vaccines built from the mutations in one patient's tumour (usually as mRNA), dendritic cell vaccines made from the patient's own immune cells, and bacterial vectors engineered to carry tumour antigens.\n\nOncolytic viruses are a related idea from the other direction. A weakened or engineered virus infects tumour cells preferentially, multiplies inside them and bursts them, releasing tumour antigens and inflammatory signals that draw immune cells in. Talimogene laherparepvec, a modified herpes virus injected into melanoma deposits, was the first to be approved.\n\nFor decades therapeutic vaccines disappointed in late-stage trials, largely because tumours suppress the T cells they raise. The current wave pairs vaccines with checkpoint inhibitors so those T cells can act, and personalised mRNA vaccines are now in phase 3 trials in melanoma and other cancers. Sipuleucel-T, a dendritic cell product for prostate cancer, remains the one approved therapeutic vaccine in the older sense.",
    technologies: ["neoantigen-mrna-vaccine", "shared-antigen-vaccine", "dendritic-cell-vaccines", "bacterial-vector-vaccines", "oncolytic-virus", "hpv-vaccine", "checkpoint-inhibitor"],
    drugs: ["talimogene-laherparepvec", "sipuleucel-t", "intismeran-autogene"],
    cancers: ["melanoma", "prostate", "cervical"],
    terms: ["immunotherapy-term"],
  }),
];
