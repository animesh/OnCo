/**
 * The universe: how much of each kind exists in the world, so OnCo can state its own completeness.
 *
 * Every denominator is a real, checkable figure from a named source, with the method that produced it
 * and the date it was checked. Fetched figures come from the snapshots in universe-lists/ (refreshed
 * weekly by `npm run fetch:universe`, scripts/fetch-universe.ts); fixed figures are typed here with
 * their citation. Where a figure is a round number, a text-search hit count or depends on name parsing,
 * `approx` is true and the UI says "about". Kinds that OnCo defines itself (fronts, technologies,
 * pairings, roadmaps, ideas, bottlenecks, collections) have no external denominator and say so.
 *
 * src/lib/completeness.ts turns each denominator into "in OnCo / of / missing" using the same scope
 * on the corpus side (approved products against an approved-drugs list, and so on).
 */
import type { Kind } from "@/lib/schema";
import nciDrugs from "./universe-lists/nci-cancer-drugs.json";
import nciTypes from "./universe-lists/nci-cancer-types.json";
import globocanSites from "./universe-lists/globocan-sites.json";
import nciCenters from "./universe-lists/nci-cancer-centers.json";
import oeciMembers from "./universe-lists/oeci-members.json";
import nhsAlliances from "./universe-lists/nhs-cancer-alliances.json";
import evenone from "./universe-lists/evenone-portfolio.json";
import uicc from "./universe-lists/uicc-members.json";
import nlmJournals from "./universe-lists/nlm-oncology-journals.json";
import openalexTop from "./universe-lists/openalex-top-oncology-papers.json";
import keggCancer from "./universe-lists/kegg-cancer-pathways.json";
import reactome from "./universe-lists/reactome-cancer-pathways.json";
import hallmarks from "./universe-lists/hallmarks-2022.json";
import nciDictionary from "./universe-lists/nci-dictionary.json";
import ctgov from "./universe-lists/ctgov-oncology.json";
import oceSponsors from "./universe-lists/fda-oce-sponsors.json";
import chemblTargets from "./universe-lists/chembl-oncology-targets.json";

export type Denominator = {
  /** Stable id, used in URL anchors (/completeness/#<id>). */
  id: string;
  /** The OnCo kind this denominator is about; "none" for cross-kind or OnCo-defined rows. */
  kind: Kind | "none";
  /** Short description of the population counted, e.g. "FDA-approved cancer drugs (NCI A to Z list)". */
  scope: string;
  /** How many exist in the world under this scope. `null` when there is no external denominator. */
  total: number | null;
  /** True when the figure is a round number, a search hit count, or depends on name parsing. */
  approx: boolean;
  source: { label: string; url: string };
  /** How the number was produced, in plain words, so anyone can reproduce it. */
  method: string;
  /** Date the figure was checked, YYYY-MM-DD. */
  checked: string;
  /** Which subset of the corpus is compared against this denominator. */
  ours: string;
  /** Name of the universe-lists snapshot that holds the item list, when the missing items can be named. */
  list?: string;
};

const ONCO_DEFINED = "OnCo-defined taxonomy; there is no external list of these to count against, so no denominator is claimed.";

export const UNIVERSE: Denominator[] = [
  // Drugs
  {
    id: "drugs-nci-az", kind: "drug", scope: "FDA-approved cancer drugs (NCI A to Z list)",
    total: nciDrugs.total, approx: false, source: nciDrugs.source, method: nciDrugs.method, checked: nciDrugs.checked,
    ours: "Products in OnCo matched to an NCI entry by generic name, brand name, alias or code.", list: "nci-cancer-drugs",
  },
  // Cancer types
  {
    id: "cancers-nci-az", kind: "cancer", scope: "Cancer types (NCI A to Z list)",
    total: nciTypes.total, approx: false, source: nciTypes.source, method: nciTypes.method, checked: nciTypes.checked,
    ours: "Cancers in OnCo matched to an NCI entry by name or alias (UK and US spellings treated as equal).", list: "nci-cancer-types",
  },
  {
    id: "cancers-globocan", kind: "cancer", scope: "GLOBOCAN 2022 cancer sites",
    total: globocanSites.total, approx: false, source: globocanSites.source, method: globocanSites.method, checked: globocanSites.checked,
    ours: "GLOBOCAN sites that at least one OnCo cancer page maps to (src/data/globocan-map.ts).", list: "globocan-sites",
  },
  // Targets
  {
    id: "targets-chembl", kind: "target", scope: "Molecular targets of approved oncology drugs (ChEMBL)",
    total: chemblTargets.total, approx: true, source: chemblTargets.source, method: chemblTargets.method, checked: chemblTargets.checked,
    ours: "ChEMBL targets whose gene symbol matches an OnCo target's symbol, name or alias.", list: "chembl-oncology-targets",
  },
  // Trials
  {
    id: "trials-ctgov-interventional", kind: "trial", scope: "Interventional cancer studies on ClinicalTrials.gov",
    total: ctgov.total, approx: false, source: ctgov.source, method: ctgov.method, checked: ctgov.checked,
    ours: "OnCo trials with an NCT id.",
  },
  {
    id: "trials-ctgov-phase3", kind: "trial", scope: "Phase 3 interventional cancer studies on ClinicalTrials.gov",
    total: ctgov.phase3, approx: false, source: ctgov.source, method: ctgov.method, checked: ctgov.checked,
    ours: "OnCo trials with an NCT id and phase 3 or 2/3.",
  },
  {
    id: "trials-ctgov-recruiting", kind: "trial", scope: "Recruiting interventional cancer studies on ClinicalTrials.gov",
    total: ctgov.recruiting, approx: false, source: ctgov.source, method: ctgov.method, checked: ctgov.checked,
    ours: "OnCo trials with an NCT id whose status is recruiting or active.",
  },
  // Companies
  {
    id: "companies-ctgov-industry-p3", kind: "company", scope: "Industry lead sponsors of phase 3 cancer trials (ClinicalTrials.gov)",
    total: ctgov.industryPhase3.sponsors, approx: true, source: ctgov.source, method: ctgov.method, checked: ctgov.checked,
    ours: "Sponsor names matched to an OnCo company by name or alias after removing corporate suffixes; subsidiaries listed under their own name count as separate sponsors.", list: "ctgov-oncology",
  },
  {
    id: "companies-fda-oce", kind: "company", scope: "Companies with an FDA oncology approval notification since 2023",
    total: oceSponsors.total, approx: true, source: oceSponsors.source, method: oceSponsors.method, checked: oceSponsors.checked,
    ours: "Sponsors named in FDA OCE notifications matched to an OnCo company by name or alias.", list: "fda-oce-sponsors",
  },
  // Institutions
  {
    id: "institutions-nci", kind: "institution", scope: "NCI-designated cancer centres (US)",
    total: nciCenters.total, approx: false, source: nciCenters.source, method: nciCenters.method, checked: nciCenters.checked,
    ours: "NCI centres matched to an OnCo institution by website domain or name.", list: "nci-cancer-centers",
  },
  {
    id: "institutions-oeci", kind: "institution", scope: "OECI member cancer institutes (Europe and partners)",
    total: oeciMembers.total, approx: false, source: oeciMembers.source, method: oeciMembers.method, checked: oeciMembers.checked,
    ours: "OECI members matched to an OnCo institution by website domain or name.", list: "oeci-members",
  },
  {
    id: "companies-evenone", kind: "company", scope: "Even One Ventures portfolio companies",
    total: evenone.total, approx: false, source: evenone.source, method: evenone.method, checked: evenone.checked,
    ours: "Portfolio companies matched to an OnCo company by website domain or name; refreshed weekly so new companies surface here.", list: "evenone-portfolio",
  },
  {
    id: "institutions-nhs-alliances", kind: "institution", scope: "NHS England Cancer Alliances (UK)",
    total: nhsAlliances.total, approx: false, source: nhsAlliances.source, method: nhsAlliances.method, checked: nhsAlliances.checked,
    ours: "Cancer Alliances matched to an OnCo institution by website domain or name.", list: "nhs-cancer-alliances",
  },
  {
    id: "institutions-uicc", kind: "institution", scope: "UICC member organisations (global)",
    total: uicc.total, approx: true, source: uicc.source, method: uicc.method, checked: uicc.checked,
    ours: "All institutions in OnCo (membership is not verified per record, so this is an upper bound on coverage).",
  },
  // People
  {
    id: "people-oeci-leaders", kind: "person", scope: "Leaders of OECI member cancer institutes",
    total: oeciMembers.items.filter((m) => m.leaders.length > 0).length, approx: true, source: oeciMembers.source,
    method: "The first person named under the leadership heading of each OECI member profile (director, CEO or equivalent); members with no leader listed are excluded.", checked: oeciMembers.checked,
    ours: "Leaders matched to an OnCo person by name after removing titles.", list: "oeci-members",
  },
  {
    id: "people-nci-directors", kind: "person", scope: "Directors of NCI-designated cancer centres",
    total: nciCenters.total, approx: true, source: nciCenters.source,
    method: "One director per NCI-designated centre; the NCI profile pages do not list names, so only the count is external.", checked: nciCenters.checked,
    ours: "People in OnCo whose primary institution is NCI-designated and whose role starts with Director.",
  },
  // Pathways
  {
    id: "pathways-kegg-cancer", kind: "pathway", scope: "KEGG cancer pathway maps",
    total: keggCancer.total, approx: false, source: keggCancer.source, method: keggCancer.method, checked: keggCancer.checked,
    ours: "KEGG maps mapped by hand to at least one OnCo pathway page (src/lib/completeness.ts).", list: "kegg-cancer-pathways",
  },
  {
    id: "pathways-hallmarks", kind: "pathway", scope: "Hallmarks of cancer (Hanahan 2022)",
    total: hallmarks.total, approx: false, source: hallmarks.source, method: hallmarks.method, checked: hallmarks.checked,
    ours: "Hallmarks with at least one mapped OnCo pathway page.", list: "hallmarks-2022",
  },
  {
    id: "pathways-reactome", kind: "pathway", scope: "Reactome human pathways matching 'cancer'",
    total: reactome.total, approx: true, source: reactome.source, method: reactome.method, checked: reactome.checked,
    ours: "All pathway pages in OnCo (a scale comparison, not a name match).",
  },
  // Journals
  {
    id: "journals-nlm", kind: "journal", scope: "MEDLINE-indexed journals under the subject Neoplasms",
    total: nlmJournals.total, approx: false, source: nlmJournals.source, method: nlmJournals.method, checked: nlmJournals.checked,
    ours: "NLM journals matched to an OnCo journal by ISSN, title or MEDLINE abbreviation.", list: "nlm-oncology-journals",
  },
  // Key papers
  {
    id: "papers-openalex-top100", kind: "paper", scope: "100 most-cited oncology works (OpenAlex)",
    total: openalexTop.total, approx: false, source: openalexTop.source, method: openalexTop.method, checked: openalexTop.checked,
    ours: "Works matched to an OnCo key paper by DOI.", list: "openalex-top-oncology-papers",
  },
  // Terms
  {
    id: "terms-nci-dictionary", kind: "term", scope: "NCI Dictionary of Cancer Terms",
    total: nciDictionary.total, approx: false, source: nciDictionary.source, method: nciDictionary.method, checked: nciDictionary.checked,
    ours: "All glossary terms in OnCo (a scale comparison, not a term match).",
  },
  // OnCo-defined kinds: no external denominator.
  { id: "technologies", kind: "technology", scope: "Technologies", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/technologies.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All technology pages." },
  { id: "sections", kind: "section", scope: "Fronts", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/sections.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All fronts." },
  { id: "pairings", kind: "pairing", scope: "Pairings", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/pairings.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All pairings." },
  { id: "roadmaps", kind: "roadmap", scope: "Roadmaps", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/roadmaps.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All roadmaps." },
  { id: "ideas", kind: "idea", scope: "Ideas", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/ideas.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All ideas." },
  { id: "bottlenecks", kind: "bottleneck", scope: "Bottlenecks", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/bottlenecks.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All bottlenecks." },
  { id: "collections", kind: "collection", scope: "Collections", total: null, approx: false, source: { label: "OnCo", url: "https://github.com/judegomila/OnCo/blob/main/src/data/collections.ts" }, method: ONCO_DEFINED, checked: "2026-09-10", ours: "All collections (open databases and registries OnCo links to)." },
];

export function denominator(id: string): Denominator | undefined {
  return UNIVERSE.find((d) => d.id === id);
}

/** The raw snapshots, keyed by list name, for completeness.ts and the /completeness/ page. */
export const UNIVERSE_LISTS = {
  "nci-cancer-drugs": nciDrugs,
  "nci-cancer-types": nciTypes,
  "globocan-sites": globocanSites,
  "nci-cancer-centers": nciCenters,
  "oeci-members": oeciMembers,
  "nhs-cancer-alliances": nhsAlliances,
  "evenone-portfolio": evenone,
  "nlm-oncology-journals": nlmJournals,
  "openalex-top-oncology-papers": openalexTop,
  "kegg-cancer-pathways": keggCancer,
  "hallmarks-2022": hallmarks,
  "ctgov-oncology": ctgov,
  "fda-oce-sponsors": oceSponsors,
  "chembl-oncology-targets": chemblTargets,
} as const;
