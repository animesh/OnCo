/**
 * Finds trials the cancer subtype pages (records with a `parent` field) and their key papers name by acronym but the
 * corpus has no trial record for. Acronym-like tokens (uppercase-heavy words, words with digits, hyphenated numbers)
 * are pulled from every rendered string of those records and checked against trial `name`, `aka` and `nct`.
 *
 *   npx tsx scripts/subtype-trial-gaps.ts [--json=/tmp/gaps.json]
 *
 * Used on 17 Sept 2026 to build src/data/trials-subtypes-wave.ts; rerun after a subtype wave to find new gaps.
 */
import { writeFileSync } from "node:fs";
import { graph } from "../src/lib/graph";
import { papersSubtypesWave } from "../src/data/papers-subtypes-wave";

const g = graph();
const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

// Known trial identities: name and aka (whole, without parentheticals, and each word of four letters or more), nct, and
// the stem before a trailing cohort or part number ("MajesTEC-1" also covers "MajesTEC", "VIALE-A" covers "VIALE").
// Records registered under their NCT id ("nct04988295" for MARIPOSA-2) are only matched when the acronym appears in
// their name or aka, so such records should carry the acronym as an aka.
const known = new Set<string>();
for (const t of g.kind("trial")) {
  if (t.nct) known.add(norm(t.nct));
  for (const s of [t.name, ...t.aka]) {
    if (!s) continue;
    known.add(norm(s));
    const bare = s.replace(/\([^)]*\)/g, " ").trim();
    known.add(norm(bare));
    for (const seg of bare.split(/\s*[/;:]\s*/)) if (seg.trim()) known.add(norm(seg));
    for (const m of s.matchAll(/\(([^)]+)\)/g)) { known.add(norm(m[1])); for (const part of m[1].split(/[\s,/]+/)) if (part.length >= 4) known.add(norm(part)); }
    for (const part of bare.split(/[\s,/]+/)) if (part.length >= 4) known.add(norm(part));
    const stem = bare.match(/^([A-Za-z][A-Za-z]+)[ -](?:\d+[A-Za-z]?|[A-Z]|[A-Z][a-z]+\d*)$/);
    if (stem) known.add(norm(stem[1]));
  }
}

// Tokens that look like trial acronyms but are genes, drugs, endpoints, staging, bodies, regimens or units.
const STOP = new Set(
  `TNM NCCN ESMO ASCO AJCC WHO FDA EMA NICE NHS NIH NCI DNA RNA MRI PET PCR PFS DFS EFS ORR MRD IDH1 IDH2 TP53 BRCA1 BRCA2 EGFR ALK ROS1 KRAS G12C MET RET BRAF V600E HER2 NTRK PD-L1 PDL1 PD-1 CTLA-4 BCL2 MYC FLT3 NPM1 JAK2 CALR MPL BCR-ABL BCR-ABL1 PIK3CA ESR1 AKT1 PTEN ATM CDK4 CDK6 CDK4/6 FGFR1 FGFR2 FGFR3 VHL SMARCB1 SMARCA4 NF1 NF2 MGMT TERT ATRX K27M H3K27M EBV HPV HBV HCV HIV CMV MYD88 CXCR4 NOTCH1 SF3B1 IGHV ZAP70 ASXL1 RUNX1 CEBPA KMT2A MLL PML-RARA PML::RARA RARA ETV6 CBFB MYH11 NUP214 PDGFRA PDGFRB KIT SDHB SDHA SDHC SDHD MEN1 MEN2 RB1 WT1 CTNNB1 APC MLH1 MSH2 MSH6 PMS2 EPCAM POLE POLD1 MSI MSS dMMR pMMR MSI-H TMB CPS TPS IHC FISH NGS ctDNA cfDNA PSA PSMA LDH AFP HCG CA-125 CA125 CA19-9 CEA CgA SSTR SSTR2 DOTATATE Lu-177 177Lu Ga-68 68Ga I-131 131I Ra-223 223Ra Y-90 90Y F-18 18F TKI TKIs ADC ADCs CAR-T CAR-Ts BiTE TCR HSCT ASCT SCT R-CHOP CHOP ABVD BEACOPP eBEACOPP R-CVP FCR MVAC ddMVAC FOLFOX FOLFIRI FOLFIRINOX mFOLFIRINOX CAPOX XELOX EOX ECF FLOT DCF VAC VDC VDC/IE VIDE VAI ICE DHAP GDP ESHAP BEAM CBV FLAG-IDA 7+3 HiDAC ATRA ATO Ara-C VRd KRd DRd D-VRd Dara-VRd VMP VTD IMiD IMiDs CD38 CD19 CD20 CD22 CD30 CD33 CD34 CD3 CD79b CD123 CD117 CD56 CD5 CD10 CD23 CD138 BCMA GPRC5D FcRH5 SLAMF7 XPO1 BTK BTKi PI3K mTOR VEGF VEGFR VEGFR2 TIGIT LAG-3 TIM-3 OX40 IL-2 IL-6 IL-15 TNF IFN GM-CSF G-CSF EPO TPO JAK STAT3 MAPK MEK ERK RAS RAF SHP2 SOS1 KEAP1 STK11 LKB1 SMAD4 CDKN2A CCND1 CCNE1 MDM2 WEE1 ATR PARP PARPi HRD HRR gBRCA sBRCA tBRCA BRCAm HRP LOH GIS GEP ERBB2 ERBB3 NRG1 NRAS HRAS GNAQ GNA11 BAP1 EIF1AX PRAME MITF SOX10 S100 HMB-45 ISUP PI-RADS BI-RADS LI-RADS TI-RADS EORTC RTOG NRG SWOG ECOG CALGB NSABP GOG NCIC NCRI MRC ANZUP ANZGOG GBG ABCSG IBCSG SOLTI UNICANCER GINECO AGO ENGOT NSGO GCIG JCOG JGOG KGOG WJOG TCOG CCTG COG SIOP SIOPE SIOPEN IRSG EpSSG EURAMOS EuroNet BFM AIEOP UKALL DFCI MSKCC MDACC UCSF NIHR HTA QALY ICER SEER GLOBOCAN IARC ICD-O ICD-10 ICD-11 FIGO ENETS NANETS IWG IMWG iwCLL ELN IPSS IPSS-R IPSS-M R-ISS R2-ISS ISS IPI FLIPI MIPI DIPSS MIPSS70 GIPSS CPSS WPSS RAEB RARS CMML JMML MDS MDS/MPN MPN MPNs AML ALL CLL CML APL SLL DLBCL PMBCL MCL MZL MALT LPL HL cHL NLPHL NHL PTCL AITL ALCL CTCL ATLL ENKTL NKTCL HSTCL EATL MEITL BPDCN LCH HLH SMM MGUS GBM DIPG DMG ATRT ETMR LGG HGG PNET PXA DNET SEGA TSC PCNSL SCLC NSCLC LCNEC MPM GIST GISTs LMS UPS MFS DDLPS WDLPS MLS ASPS EWS RMS ARMS ERMS DFSP MPNST EHE HCC iCCA eCCA pCCA dCCA CCA BTC GBC PDAC IPMN MCN PanNET PanNEC NET NETs NEC NECs MiNEN MTC PTC FTC ATC DTC RAI RAI-R HNSCC SCCHN OPSCC OPC NPC LSCC OSCC OCSCC SNUC ACC SDC MEC ccRCC pRCC chRCC RCC nccRCC UTUC MIBC NMIBC BCG CIS TURBT EBRT IMRT VMAT SBRT SABR SRS WBRT PCI HDR LDR ADT CRPC mCRPC nmCRPC mHSPC mCSPC HSPC CSPC ARPI ARSI ARTA AR-V7 GnRH LHRH TNBC HR+ HER2+ HER2-low ER+ PR+ IDC ILC DCIS LCIS IBC MBC eBC EBC pCR RCB Ki-67 Ki67 MammaPrint Oncotype EPclin PAM50 BCI CTS5 IHC0 IHC1+ IHC2+ IHC3+ CRC mCRC LARC TNT TME LAR APR CRT nCRT cCR ncCR RAS-wt CMS1 CMS2 CMS3 CMS4 FAP HNPCC ESCC EAC GEJ OGJ GEA GOJ HGD LGD ESD EMR OGD EUS ERCP MRCP CEUS CTC CTCs WGS WES RNA-seq scRNA CRISPR Cas9 TCGA ICGC PCAWG GENIE COSMIC OncoKB ClinVar gnomAD UKB WCRF AICR AJCC8 UICC TNM8 TNM7 SIGN BSH BCSH BSG BTS RCR RCP RCS RCOG BAUS EAU AUA SUO SIU ASTRO ESTRO ESSO SSO ESGO IGCS SGO ASH EHA EBMT ASTCT CIBMTR ISCT ISTH AACR MCBS NNT NNH IQR QoL HRQoL PRO PROs PROMs PRO-CTCAE CTCAE RECIST iRECIST mRECIST PERCIST Lugano Cheson ELN2022 ELN2017 WHO2022 WHO2016 ICC R-IPI NCCN-IPI CNS-IPI aaIPI KPS ADL CGA VES-13 CARG CRASH BMI eGFR CrCl ALT AST ALP GGT INR APTT WBC ANC B2M CRP ESR TSH TgAb TPOAb ACTH IGF-1 DHEA DHEAS SHBG hCG IGCCCG BEP VIP TIP TI-CE GemOx GEMOX CISCA POMB ACE JEB PEB RPLND PC-RPLND HDCT PBSCT TACE TARE SIRT RFA MWA HAIC HAI ALPPS PVE LRT BCLC ALBI MELD Child-Pugh HBsAg HBeAg NAFLD NASH MASLD MASH ALD PSC PBC IBD UC EPCAM ROS1 NRG1 MET-ex14 METex14 HER2-mutant EGFR-mutant T790M C797S L858R ex19del ex20ins Exon20 G719X L861Q S768I ALK-positive ROS1-positive RET-fusion NTRK-fusion KRAS-G12C BRAF-V600E MEKi BRAFi EGFRi ALKi TRKi WBC ANC Plt Hb TTP TTF DoR DOR CBR TTR ORR-CR ORR/CR TRAE TRAEs irAE irAEs AE AEs SAE SAEs DLT DLTs MTD RP2D ITT PP mITT HR CI SD OS CR PR PD NE NR FGFR2b CLDN18.2 Claudin18.2 TROP2 TROP-2 Nectin-4 NECTIN-4 B7-H3 B7-H4 HER3 c-MET cMET DLL3 SEZ6 GD2 GPC3 GPC2 CEACAM5 MSLN FRa FR-alpha FOLR1 TF CD70 CD46 ROR1 CCR8 CD47 SIRPa STING TLR9 TLR7 IL-12 IL-18 IL-21 IL-7 mRNA siRNA ASO PROTAC PROTACs MGD KRASi RASi PanRAS Pan-RAS SOS1i SHP2i ERKi CDK2 CDK7 CDK9 PLK1 AURKA AURKB BET BRD4 EZH2 DOT1L LSD1 HDAC HDACi DNMT DNMTi HMA HMAs IDHi IDH1i IDH2i MENi KMT2Ar NPM1m FLT3-ITD FLT3-TKD TKD ITD BCL-2 BCL2i MCL1 MCL-1 BH3 XIAP SMAC IAP TRAIL DR5 CD40 4-1BB GITR ICOS CD27 CD28 CD137 NKG2D NKG2A KIR HLA HLA-A2 HLA-A*02:01 MHC MHC-I MHC-II TAP1 B2M JAK1 JAK2 IFNGR1 IFNGR2 IRF1 STAT1 SOCS1 PTPN2 ADAR1 cGAS TREX1 MAVS RIG-I MDA5 NLRP3 ASC GSDMD PANoptosis TIL TILs TCR-T TCR-Ts TIL-therapy TRUC TRUCK TRUCKs`.split(/\s+/).map((s) => norm(s)),
);

type Hit = { token: string; recordIds: string[]; paperIds: string[]; contexts: string[] };
const hits = new Map<string, Hit>();

function tokens(text: string): string[] {
  const out: string[] = [];
  // Capture a word that carries capitals or digits, optionally followed by a hyphen or space and a number-bearing part
  // ("KEYNOTE-811", "CheckMate 816", "DESTINY-Gastric01", "innovaTV 301", "CodeBreaK 300", "TROPION-Lung01", "GOG-3031").
  const re = /(?<![A-Za-z0-9])([A-Za-z][A-Za-z0-9]*(?:[ -](?:[A-Za-z]*\d[A-Za-z0-9]*|[A-Z][A-Za-z]*\d+|[A-Z][a-z]+(?=\s\d)))?(?:[ -]\d+[A-Za-z]?)?)(?![A-Za-z0-9])/g;
  for (const m of text.matchAll(re)) {
    const tok = m[1].trim();
    if (tok.length < 4) continue;
    const upper = (tok.match(/[A-Z]/g) ?? []).length;
    const hasDigit = /\d/.test(tok);
    const mixed = /[a-z][A-Z]|[A-Z]{2}[a-z]/.test(tok); // CheckMate, CodeBreaK, PSMAfore, postMONARCH, innovaTV
    if (!(upper >= 3 || hasDigit || mixed)) continue;
    if (/^[A-Z][a-z]+$/.test(tok)) continue;
    if (/^\d/.test(tok)) continue;
    if (/^(NCT\d{8}|ISRCTN\d+)$/.test(tok)) continue;
    if (/^\d{4}$/.test(tok) || /\b(19|20)\d{2}\b/.test(tok) && !/[A-Z]{3}/.test(tok)) continue;
    const head = tok.split(/[ -]/)[0];
    if (STOP.has(norm(tok)) || STOP.has(norm(head))) continue;
    out.push(tok);
  }
  return out;
}

function walk(v: unknown, out: string[]): void {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => walk(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["links", "wikipedia", "asOf", "id", "tags", "provenance", "doi", "pmid", "authors", "url"].includes(k)) walk(x, out);
}

const subtypes = g.kind("cancer").filter((c) => (c as { parent?: string }).parent);
const paperIds = new Set(papersSubtypesWave.map((p) => p.id));
const papers = g.kind("paper").filter((p) => paperIds.has(p.id));

function scan(e: { id: string }, isPaper: boolean) {
  const strings: string[] = [];
  walk(e, strings);
  for (const s of strings) for (const tok of tokens(s)) {
    if (known.has(norm(tok))) continue;
    const key = norm(tok);
    const h = hits.get(key) ?? { token: tok, recordIds: [], paperIds: [], contexts: [] };
    (isPaper ? h.paperIds : h.recordIds).push(e.id);
    if (h.contexts.length < 2) { const i = s.indexOf(tok); h.contexts.push(s.slice(Math.max(0, i - 60), i + tok.length + 60).replace(/\n/g, " ")); }
    hits.set(key, h);
  }
}
for (const c of subtypes) scan(c, false);
for (const p of papers) scan(p, true);

const rows = [...hits.values()].map((h) => ({ ...h, recordIds: [...new Set(h.recordIds)], paperIds: [...new Set(h.paperIds)] })).sort((a, b) => a.token.localeCompare(b.token));
console.log(`${subtypes.length} subtype pages, ${papers.length} papers, ${rows.length} unknown acronym-like tokens`);
for (const r of rows) console.log(`${r.token}\t${r.recordIds.join(",")}\t${r.paperIds.join(",")}\t${r.contexts[0]}`);
const out = process.argv.find((a) => a.startsWith("--json="))?.slice(7);
if (out) writeFileSync(out, JSON.stringify(rows, null, 1));
