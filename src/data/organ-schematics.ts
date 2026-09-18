/**
 * Organ-level wireframe schematics for the cancers: the organ, its subsites and the regional lymph node
 * stations, drawn with the same primitives and classes as the technology and front schematics
 * (src/lib/wireframe.ts; "hot" = subsite marker, "accent" = node station, "soft" = context).
 *
 * `subsites[].match` lists lowercase fragments; a cancer's `subtypes` strings that contain one are linked to
 * that subsite in the legend, so the drawing and the Subtypes tab point at each other. Meshes stay under
 * 500 points. Positions are in arbitrary units; the viewer normalises. Not to scale, not anatomy-textbook
 * accurate: the aim is orientation (where is it, what is next to it, where do the nodes drain).
 */
import { add, box, cone, cylinder, dots, ellipsoid, empty, polyline, ring, sphere, torus, type Mesh, type Vec3 } from "@/lib/wireframe";

export type OrganSubsite = { id: string; label: string; at: Vec3; match?: string[]; note?: string };
export type OrganNode = { label: string; at: Vec3 };
export type OrganSchematic = {
  id: string; name: string; cancers: string[];
  /** One sentence on how disease and drainage relate in this organ. */
  caption: string;
  subsites: OrganSubsite[];
  /** Regional lymph node stations (empty where the organ has no lymphatic spread, with `nodeNote` saying why). */
  nodes: OrganNode[]; nodeNote?: string;
  build: () => Mesh;
};

const TAU = Math.PI * 2;
const cluster = (at: Vec3, n = 5, r = 0.14): Vec3[] => Array.from({ length: n }, (_, i) => [at[0] + r * Math.cos((TAU * i) / n), at[1] + r * Math.sin((TAU * i) / n) * 0.6, at[2] + (i % 2 ? 0.06 : -0.06)]);
const tube = (pts: Vec3[], r: number, cls?: string): Mesh => { const m = empty(); add(m, polyline(pts, cls)); add(m, polyline(pts.map((p) => [p[0] + r, p[1], p[2]] as Vec3), cls)); add(m, polyline(pts.map((p) => [p[0], p[1], p[2] + r] as Vec3), cls)); return m; };

/** Adds subsite rings, node clusters and labels to a built organ mesh. */
export function organMesh(o: OrganSchematic): Mesh {
  const m = o.build();
  m.labels = m.labels ?? [];
  for (const s of o.subsites) { add(m, ring(0.13, 10, "hot", "z"), { at: s.at }); add(m, ring(0.13, 10, "hot", "x"), { at: s.at }); m.labels.push({ at: s.at, text: s.label }); }
  for (const n of o.nodes) { add(m, dots(cluster(n.at), "accent")); m.labels.push({ at: n.at, text: `Nodes: ${n.label}` }); }
  return m;
}

export const ORGAN_SCHEMATICS: OrganSchematic[] = [
  { id: "breast", name: "Breast", cancers: ["tnbc", "breast-cancer", "breast-hr-positive", "breast-her2-positive", "male-breast-cancer", "ductal-carcinoma-in-situ", "hr-positive-early-high-risk", "hr-positive-metastatic-post-cdk46", "her2-low-metastatic-breast-cancer", "her2-positive-early-breast-cancer", "her2-positive-breast-brain-metastases", "tnbc-early", "tnbc-metastatic", "inflammatory-breast-cancer", "paget-disease-of-the-nipple", "phyllodes-tumour"],
    caption: "Most cancers start in the ducts and drain first to the axillary nodes, which is why the armpit is checked and a sentinel node is sampled.",
    subsites: [
      { id: "ducts", label: "Ducts (most cancers start here)", at: [0.35, 0.15, 0.85], match: ["ductal", "dcis", "no special type", "nst", "luminal", "basal", "her2", "claudin"] },
      { id: "lobules", label: "Lobules (lobular carcinoma; phyllodes tumours arise from the surrounding stroma)", at: [-0.7, -0.45, 0.5], match: ["lobular", "phyllodes"] },
      { id: "uoq", label: "Upper outer quadrant (commonest site)", at: [0.8, 0.7, 0.55] },
      { id: "nipple", label: "Nipple-areola", at: [0, 0, 1.08], match: ["paget"] },
    ],
    nodes: [{ label: "axillary level I", at: [2.0, 0.9, 0.1] }, { label: "axillary level II-III", at: [2.6, 1.5, -0.1] }, { label: "internal mammary", at: [-1.7, 0.5, 0.2] }, { label: "supraclavicular", at: [2.2, 2.3, 0] }],
    build: () => {
      const m = empty();
      add(m, ellipsoid(1.5, 1.2, 1.05, 5, 12));
      add(m, ring(0.22, 14, undefined, "z"), { at: [0, 0, 1.02] });
      for (let i = 0; i < 8; i++) { const a = (TAU * i) / 8; add(m, polyline([[0.12 * Math.cos(a), 0.12 * Math.sin(a), 0.98], [0.7 * Math.cos(a), 0.55 * Math.sin(a), 0.6], [1.15 * Math.cos(a), 0.9 * Math.sin(a), 0.15]], "soft")); add(m, dots([[1.2 * Math.cos(a), 0.95 * Math.sin(a), 0.1]], "soft")); }
      add(m, polyline([[-1.5, 0, 0], [1.5, 0, 0]], "soft")); add(m, polyline([[0, -1.2, 0], [0, 1.2, 0]], "soft"));
      add(m, box(4.4, 0.12, 0.5, "soft"), { at: [0.2, -0.2, -1.2] }); // chest wall
      add(m, polyline([[1.3, 0.6, -0.4], [2.0, 0.9, 0.1], [2.6, 1.5, -0.1], [2.2, 2.3, 0]], "soft")); // lymphatic route
      return m;
    } },
  { id: "lung", name: "Lungs, pleura and mediastinum", cancers: ["nsclc", "lung-cancer", "sclc", "mesothelioma", "pleural-mesothelioma", "thymic-epithelial", "pleuropulmonary-blastoma", "inflammatory-myofibroblastic-tumour", "egfr-mutant-nsclc", "alk-positive-nsclc", "kras-g12c-nsclc", "ros1-positive-nsclc", "met-altered-nsclc", "ret-fusion-nsclc", "braf-v600e-nsclc", "her2-mutant-nsclc", "ntrk-fusion-nsclc", "pdl1-high-nsclc", "resectable-nsclc", "stage-iii-unresectable-nsclc", "limited-stage-sclc", "extensive-stage-sclc", "lung-net"],
    caption: "Central tumours arise in the large airways, peripheral ones in the alveoli; both drain to hilar then mediastinal nodes, and the pleural lining is a separate cancer site.",
    subsites: [
      { id: "central", label: "Central airways (squamous, small-cell)", at: [-0.75, 0.55, 0.05], match: ["squamous", "small-cell", "small cell", "sclc", "neuroendocrine", "pleuropulmonary", "tracheobronchial", "bronchus", "myofibroblastic"] },
      { id: "peripheral", label: "Periphery (adenocarcinoma)", at: [1.75, -0.7, 0.35], match: ["adenocarcinoma", "egfr", "alk", "kras", "ros1", "ret", "met", "braf", "ntrk", "her2", "pd-l1"] },
      { id: "apex", label: "Apex (Pancoast)", at: [1.3, 1.65, 0] },
      { id: "pleura", label: "Pleura (mesothelioma)", at: [-2.35, 0.1, 0], match: ["epithelioid", "sarcomatoid", "biphasic", "pleural"] },
      { id: "thymus", label: "Thymus (anterior mediastinum)", at: [0, 1.05, 0.75], match: ["thymoma", "thymic", "type a", "type b", "carcinoma"] },
    ],
    nodes: [{ label: "hilar (N1)", at: [-0.8, 0.3, 0] }, { label: "mediastinal (N2)", at: [0, 0.75, -0.15] }, { label: "supraclavicular (N3)", at: [1.05, 2.25, 0] }],
    build: () => {
      const m = empty();
      add(m, ellipsoid(1.0, 1.7, 0.85, 5, 12), { at: [1.35, -0.1, 0] });
      add(m, ellipsoid(0.95, 1.7, 0.85, 5, 12), { at: [-1.35, -0.1, 0] });
      add(m, ellipsoid(1.05, 1.8, 0.95, 4, 10, "soft"), { at: [-1.35, -0.1, 0] }); // pleura
      add(m, cylinder(0.2, 1.3, 10, 2), { at: [0, 1.95, 0] });
      add(m, polyline([[0, 1.3, 0], [0.9, 0.65, 0], [1.35, 0.1, 0.1]])); add(m, polyline([[0, 1.3, 0], [-0.9, 0.65, 0], [-1.3, 0.1, 0.1]]));
      add(m, polyline([[0.9, 0.65, 0], [1.5, 0.9, 0.2]], "soft")); add(m, polyline([[1.35, 0.1, 0.1], [1.9, -0.6, 0.3]], "soft")); add(m, polyline([[-0.9, 0.65, 0], [-1.5, 0.9, 0.2]], "soft")); add(m, polyline([[-1.3, 0.1, 0.1], [-1.85, -0.7, 0.3]], "soft"));
      add(m, ellipsoid(0.55, 0.65, 0.45, 4, 8, "soft"), { at: [0.35, -0.55, 0.45] }); // heart
      add(m, ellipsoid(0.45, 0.35, 0.2, 3, 8, "soft"), { at: [0, 1.05, 0.75] }); // thymus
      return m;
    } },
  { id: "colorectum", name: "Colon, rectum, anus and appendix", cancers: ["peritoneal-mesothelioma", "colorectal", "rectal-cancer", "msi-high-colorectal", "braf-v600e-colorectal", "her2-amplified-colorectal", "kras-g12c-colorectal", "early-onset-colorectal", "anal", "appendiceal", "small-bowel", "small-intestinal-net"],
    caption: "Right-sided tumours behave differently from left-sided and rectal ones; the colon drains along its mesenteric vessels, the rectum into the mesorectum and pelvic side wall.",
    subsites: [
      { id: "right", label: "Right colon (MSI-high, BRAF commoner)", at: [-1.7, 0.3, 0], match: ["msi", "mmr", "braf", "right", "cms1", "mucinous", "serrated", "duodenal", "jejunal", "ileal", "small bowel"] },
      { id: "left", label: "Left colon and sigmoid", at: [1.6, -0.5, 0], match: ["left", "cms2", "cms4", "her2", "ras"] },
      { id: "rectum", label: "Rectum", at: [0.45, -2.15, 0], match: ["rectal", "rectum"] },
      { id: "anus", label: "Anal canal (HPV squamous)", at: [0.45, -2.7, 0.05], match: ["anal", "squamous", "hpv", "p16", "hiv"] },
      { id: "appendix", label: "Appendix", at: [-1.95, -1.55, 0.1], match: ["appendiceal", "pseudomyxoma", "goblet", "lamn", "hamn", "carcinoid"] },
      { id: "peritoneum", label: "Peritoneum and omentum (mesothelioma, peritoneal spread)", at: [0, 1.3, 0.3], match: ["peritone", "omentum", "mesothelioma", "mesothelial", "multicystic", "peritoneal metastas"] },
    ],
    nodes: [{ label: "pericolic", at: [-1.15, 0.65, 0.15] }, { label: "mesenteric root", at: [0, 0.1, 0.25] }, { label: "para-aortic", at: [0, 0.75, -0.25] }, { label: "mesorectal", at: [0.95, -2.0, 0.25] }, { label: "lateral pelvic and inguinal (anal)", at: [1.5, -2.45, 0] }],
    build: () => {
      const m = empty();
      const path: Vec3[] = [[-1.7, -1.2, 0], [-1.75, 0.3, 0], [-1.6, 1.1, 0], [-0.6, 0.85, 0.15], [0.6, 0.85, 0.15], [1.6, 1.1, 0], [1.7, -0.3, 0], [1.4, -1.1, 0], [0.7, -1.4, 0.1], [0.45, -1.9, 0], [0.45, -2.6, 0]];
      add(m, tube(path, 0.22));
      add(m, cylinder(0.24, 0.5, 10, 2), { at: [-1.7, -1.35, 0] }); // caecum
      add(m, polyline([[-1.75, -1.55, 0.05], [-1.95, -1.85, 0.1]])); // appendix
      add(m, ring(0.2, 12, undefined, "y"), { at: [0.45, -2.75, 0] }); // anus
      add(m, polyline([[-0.7, 0.4, 0.2], [0, 0.1, 0.25], [0.7, 0.35, 0.2]], "soft")); // mesentery
      add(m, polyline([[0, 1.6, -0.3], [0, -0.9, -0.3]], "soft")); // aorta
      return m;
    } },
  { id: "stomach-oesophagus", name: "Oesophagus and stomach", cancers: ["gastric", "gastric-her2-positive", "gastric-cldn18-2-positive", "gastric-pdl1-high", "gastric-msi-high", "early-gastric-cancer", "oesophageal-squamous-cell-carcinoma", "oesophageal-adenocarcinoma", "esophageal", "gist", "gist-kit-exon-11", "gist-pdgfra-d842v", "gist-imatinib-resistant"],
    caption: "Squamous cancers sit in the upper and middle oesophagus, adenocarcinomas at the junction and in the stomach; the stomach wall also gives rise to GIST from its pacemaker cells.",
    subsites: [
      { id: "upper", label: "Upper and middle oesophagus (squamous)", at: [0.2, 2.5, 0], match: ["squamous", "escc"] },
      { id: "gej", label: "Lower oesophagus and junction (adenocarcinoma)", at: [0.1, 0.95, 0], match: ["adenocarcinoma", "eac", "junction", "gej", "siewert", "barrett"] },
      { id: "fundus", label: "Cardia and fundus", at: [-0.95, 0.55, 0] },
      { id: "body", label: "Body (diffuse or intestinal type)", at: [-0.35, -0.05, 0.05], match: ["diffuse", "intestinal", "her2", "cldn18", "claudin", "ebv", "msi", "cin", "gs"] },
      { id: "antrum", label: "Antrum and pylorus", at: [1.3, -0.45, 0], match: ["antral", "pylori", "distal"] },
      { id: "wall", label: "Muscle wall (GIST)", at: [-0.2, -0.75, 0.6], match: ["gist", "kit", "pdgfra", "sdh", "wild-type"] },
    ],
    nodes: [{ label: "perigastric (greater and lesser curve)", at: [-0.4, -0.95, 0.2] }, { label: "coeliac and hepatic", at: [0.6, -0.9, -0.3] }, { label: "mediastinal", at: [0.5, 1.9, -0.3] }, { label: "cervical (upper oesophagus)", at: [0.5, 3.0, 0] }],
    build: () => {
      const m = empty();
      add(m, cylinder(0.2, 2.5, 10, 3), { at: [0.2, 2.15, 0] });
      add(m, ellipsoid(1.35, 0.85, 0.75, 5, 12), { at: [0.1, -0.05, 0], rotZ: -0.35 });
      add(m, cylinder(0.3, 0.7, 10, 2), { at: [1.4, -0.5, 0], rotZ: Math.PI / 2 });
      add(m, polyline([[1.75, -0.5, 0], [2.1, -0.9, 0], [2.0, -1.5, 0], [1.4, -1.7, 0]], "soft")); // duodenum
      add(m, polyline([[0.2, 3.4, 0], [0.2, 3.5, 0]], "soft"));
      add(m, ellipsoid(0.5, 0.35, 0.3, 3, 8, "soft"), { at: [-1.6, 0.4, -0.5] }); // spleen
      return m;
    } },
  { id: "pancreas-biliary", name: "Pancreas and bile ducts", cancers: ["pancreatic", "cholangiocarcinoma", "intrahepatic-cholangiocarcinoma", "extrahepatic-cholangiocarcinoma", "biliary-tract-cancer", "neuroendocrine", "pancreatic-net", "grade-3-net", "extrapulmonary-nec", "gallbladder", "ampullary"],
    caption: "Most pancreatic cancers arise in the head next to the bile duct, which is why jaundice is the presenting sign; bile duct cancers are named by where along the tree they sit.",
    subsites: [
      { id: "head", label: "Pancreatic head (most PDAC)", at: [-1.3, -0.15, 0.05], match: ["classical", "basal", "pdac", "ductal", "kras", "brca", "msi"] },
      { id: "tail", label: "Body and tail", at: [0.9, 0.1, 0] },
      { id: "ampulla", label: "Ampulla", at: [-1.5, -0.6, 0.1], match: ["ampullary"] },
      { id: "islets", label: "Islets (pancreatic NET)", at: [0.4, 0.15, 0.3], match: ["pnet", "pancreatic net", "insulinoma", "gastrinoma", "neuroendocrine", "grade", "nec", "small intestinal", "carcinoid"] },
      { id: "intrahepatic", label: "Intrahepatic ducts", at: [-0.5, 2.1, 0], match: ["intrahepatic", "idh", "fgfr2"] },
      { id: "perihilar", label: "Perihilar (Klatskin)", at: [-1.0, 1.4, 0], match: ["perihilar", "klatskin", "hilar"] },
      { id: "distal", label: "Distal bile duct", at: [-1.35, 0.55, 0.05], match: ["distal", "extrahepatic"] },
      { id: "gallbladder", label: "Gallbladder", at: [-1.75, 1.0, 0.35], match: ["gallbladder"] },
    ],
    nodes: [{ label: "peripancreatic", at: [-0.55, -0.7, 0] }, { label: "hepatic hilar", at: [-0.7, 1.15, 0.25] }, { label: "coeliac and superior mesenteric", at: [0.1, -1.0, -0.25] }],
    build: () => {
      const m = empty();
      add(m, ellipsoid(1.65, 0.36, 0.32, 3, 12), { at: [0.25, 0.05, 0], rotZ: 0.1 });
      add(m, sphere(0.55, 4, 10), { at: [-1.3, -0.15, 0] });
      add(m, polyline([[-1.0, 0.7, 0.1], [-2.0, 0.5, 0.1], [-2.15, -0.4, 0.1], [-1.6, -1.05, 0.1], [-0.7, -0.95, 0.1]], "soft")); // duodenal C-loop
      add(m, polyline([[-1.0, 1.4, 0], [-1.25, 0.9, 0.05], [-1.35, 0.4, 0.05], [-1.5, -0.55, 0.1]])); // common bile duct
      add(m, polyline([[-1.0, 1.4, 0], [-0.5, 2.0, 0], [-0.1, 2.5, 0.1]])); add(m, polyline([[-0.5, 2.0, 0], [-0.9, 2.5, -0.1]])); add(m, polyline([[-1.0, 1.4, 0], [-1.6, 1.9, 0], [-2.0, 2.3, 0]])); // intrahepatic ducts
      add(m, ellipsoid(0.25, 0.45, 0.25, 3, 8), { at: [-1.75, 1.0, 0.35] }); // gallbladder
      add(m, ellipsoid(1.9, 1.05, 0.9, 4, 12, "soft"), { at: [-0.7, 2.1, -0.2] }); // liver outline
      add(m, polyline([[-1.2, 0.05, -0.15], [0.2, 0.1, -0.15], [1.7, 0.2, -0.1]], "soft")); // pancreatic duct
      return m;
    } },
  { id: "liver", name: "Liver", cancers: ["hcc", "hcc-early", "hcc-intermediate", "hcc-advanced", "hepatoblastoma"],
    caption: "Hepatocellular carcinoma grows in a cirrhotic liver and spreads first inside it and into the portal vein, so staging depends on liver function and vascular invasion as much as on size.",
    subsites: [
      { id: "right", label: "Right lobe (segments V-VIII)", at: [-0.95, 0.15, 0.4], match: ["hbv", "hcv", "viral", "nash", "masld", "alcohol", "cirrhotic", "non-cirrhotic", "fibrolamellar", "hepatoblastoma", "fetal", "embryonal"] },
      { id: "left", label: "Left lobe (segments II-IV)", at: [1.15, 0.25, 0.3] },
      { id: "portal", label: "Portal vein (macrovascular invasion)", at: [0.1, -0.75, 0.45], match: ["portal", "vascular invasion", "macrovascular", "bclc c"] },
      { id: "capsule", label: "Capsule and diaphragm surface", at: [-0.4, 1.15, 0.2] },
    ],
    nodes: [{ label: "hepatic hilar", at: [0.15, -1.05, 0.5] }, { label: "coeliac", at: [0.45, -1.65, 0] }, { label: "paracaval", at: [-0.7, 1.2, -0.55] }],
    build: () => {
      const m = empty();
      add(m, ellipsoid(1.95, 1.2, 1.0, 5, 14));
      add(m, polyline([[0.5, 1.15, 0.2], [0.55, 0, 1.0], [0.6, -1.1, 0.3]], "soft")); // falciform ligament
      for (const x of [-1.3, -0.5]) add(m, polyline([[x, 1.0, 0.5], [x, -0.9, 0.5]], "soft")); // segment hints
      add(m, polyline([[0.1, -1.6, 0.5], [0.1, -0.7, 0.45], [-0.9, -0.2, 0.3]])); add(m, polyline([[0.1, -0.7, 0.45], [0.9, -0.1, 0.3]])); // portal vein
      add(m, polyline([[-0.6, 1.4, -0.5], [-0.6, 0.3, -0.5]], "soft")); // IVC
      add(m, ellipsoid(0.22, 0.42, 0.22, 3, 8, "soft"), { at: [0.35, -1.15, 0.75] }); // gallbladder
      return m;
    } },
  { id: "prostate", name: "Prostate", cancers: ["prostate", "prostate-low-risk", "prostate-intermediate-risk", "prostate-high-risk", "prostate-bcr", "prostate-mhspc", "prostate-nmcrpc", "prostate-mcrpc", "prostate-nepc"],
    caption: "About three quarters of cancers arise in the peripheral zone at the back of the gland, the part a finger or a biopsy needle reaches; drainage is to the obturator and iliac nodes.",
    subsites: [
      { id: "peripheral", label: "Peripheral zone (most cancers)", at: [0, -0.5, -0.75], match: ["acinar", "adenocarcinoma", "gleason-grade-group", "grade group", "localised", "castration", "hormone-sensitive", "mcrpc", "mhspc"] },
      { id: "transition", label: "Transition zone (BPH)", at: [0.35, 0.25, 0.4] },
      { id: "ductal", label: "Ducts (ductal, intraductal, neuroendocrine)", at: [-0.2, 0.55, -0.2], match: ["ductal", "intraductal", "neuroendocrine", "small cell", "nepc"] },
      { id: "sv", label: "Seminal vesicle (T3b)", at: [0.75, 0.95, -0.65], match: ["t3", "locally advanced"] },
    ],
    nodes: [{ label: "obturator", at: [1.55, -0.1, 0.2] }, { label: "internal iliac", at: [1.75, 0.65, -0.25] }, { label: "external iliac", at: [2.05, 1.1, 0.2] }, { label: "presacral", at: [0, 0.6, -1.5] }],
    build: () => {
      const m = empty();
      add(m, ellipsoid(1.05, 0.95, 0.95, 5, 12));
      add(m, cylinder(0.12, 2.6, 8, 3), { at: [0, 0.1, 0.05] }); // urethra
      add(m, torus(0.78, 0.06, 20, 4, "soft"), { at: [0, -0.15, -0.3], rotX: 0.3 }); // peripheral zone
      add(m, ring(0.38, 14, "soft", "y"), { at: [0, 0.2, 0.25] }); // transition zone
      add(m, ellipsoid(0.32, 0.55, 0.22, 3, 8, "soft"), { at: [0.75, 0.95, -0.65], rotZ: 0.4 }); add(m, ellipsoid(0.32, 0.55, 0.22, 3, 8, "soft"), { at: [-0.75, 0.95, -0.65], rotZ: -0.4 }); // seminal vesicles
      add(m, ellipsoid(1.1, 0.55, 0.9, 3, 10, "soft"), { at: [0, 1.75, 0] }); // bladder base
      add(m, ellipsoid(0.55, 0.5, 0.3, 3, 8, "soft"), { at: [0, -0.2, -1.55] }); // rectum
      return m;
    } },
  { id: "kidney-bladder-adrenal", name: "Kidneys, adrenals, ureters and bladder", cancers: ["non-muscle-invasive-bladder-cancer", "muscle-invasive-bladder-cancer", "urothelial", "clear-cell-rcc", "papillary-rcc", "chromophobe-rcc", "rcc", "wilms-tumor", "neuroblastoma", "adrenocortical", "pheochromocytoma-paraganglioma", "urethral", "penile"],
    caption: "Renal cell carcinoma comes from the kidney's filtering cortex, urothelial cancer from the lining of the collecting system and bladder, and the adrenal on top hosts cortical and medullary (neuroblastoma) tumours.",
    subsites: [
      { id: "cortex", label: "Renal cortex (RCC)", at: [-1.95, 1.75, 0.15], match: ["clear cell", "ccrcc", "papillary", "chromophobe", "vhl", "tfe3", "translocation", "collecting duct", "medullary", "sarcomatoid"] },
      { id: "pelvis", label: "Renal pelvis and ureter (upper tract urothelial)", at: [1.5, 1.6, 0.2], match: ["upper tract", "utuc", "renal pelvis", "ureter"] },
      { id: "urothelium", label: "Bladder lining (non-muscle-invasive)", at: [0, -1.35, 0.9], match: ["nmibc", "non-muscle", "papillary", "cis", "luminal", "basal", "fgfr3", "urothelial", "high-grade", "low-grade", "urethra", "penile", "pein"] },
      { id: "muscle", label: "Bladder muscle wall (muscle-invasive)", at: [-1.0, -1.45, 0.25], match: ["mibc", "nmibc-vs-mibc", "squamous", "small cell", "variant"] },
      { id: "adrenal-cortex", label: "Adrenal cortex", at: [1.5, 2.75, 0], match: ["adrenocortical", "cortisol", "aldosterone", "functional", "non-functional", "adrenal"] },
      { id: "adrenal-medulla", label: "Adrenal medulla and sympathetic chain (neuroblastoma)", at: [-1.5, 2.75, 0], match: ["mycn", "neuroblast", "ganglio", "high-risk", "intermediate-risk", "low-risk", "alk", "stage ms", "stage 4s", "pheochromocytoma", "paraganglioma", "ppgl"] },
      { id: "nephroblastoma", label: "Developing kidney (Wilms tumour)", at: [-1.6, 1.1, 0.25], match: ["favourable histology", "anaplastic", "wilms", "blastemal", "wt1", "bilateral"] },
    ],
    nodes: [{ label: "renal hilar", at: [-1.1, 1.55, 0] }, { label: "para-aortic and paracaval", at: [0, 1.15, -0.25] }, { label: "obturator and iliac (bladder)", at: [1.55, -1.25, 0] }],
    build: () => {
      const m = empty();
      for (const s of [-1, 1]) {
        add(m, ellipsoid(0.55, 0.95, 0.42, 5, 10), { at: [s * 1.6, 1.6, 0] });
        add(m, ring(0.28, 10, "soft", "z"), { at: [s * 1.35, 1.55, 0.1] }); // renal pelvis
        add(m, cone(0.35, 0.5, 8, "soft"), { at: [s * 1.5, 2.75, 0] }); // adrenal
        add(m, polyline([[s * 1.3, 1.25, 0.1], [s * 1.0, 0.4, 0.1], [s * 0.7, -0.6, 0.1], [s * 0.5, -1.05, 0.2]])); // ureter
      }
      add(m, ellipsoid(1.05, 0.8, 0.85, 5, 12), { at: [0, -1.4, 0] });
      add(m, cylinder(0.1, 0.6, 8, 2, "soft"), { at: [0, -2.45, 0] }); // urethra
      add(m, polyline([[0, 2.6, -0.3], [0, 0.2, -0.3]], "soft")); add(m, polyline([[0.25, 2.6, -0.3], [0.25, 0.2, -0.3]], "soft")); // aorta and IVC
      add(m, dots([[-0.45, 2.4, -0.3], [-0.45, 2.0, -0.3], [-0.45, 1.6, -0.3], [-0.45, 1.2, -0.3]], "soft")); // sympathetic chain
      return m;
    } },
  { id: "female-pelvis", name: "Uterus, cervix, ovaries, tubes and vulva", cancers: ["high-grade-serous-ovarian-cancer", "low-grade-serous-ovarian-cancer", "clear-cell-ovarian-cancer", "mucinous-ovarian-cancer", "granulosa-cell-tumour", "ovarian", "endometrial", "cervical", "vulvar", "gestational-trophoblastic", "uterine-sarcoma", "vaginal", "endometrial-pole-ultramutated", "endometrial-mmr-deficient", "endometrial-p53-abnormal", "endometrial-nsmp", "advanced-recurrent-endometrial-cancer", "uterine-carcinosarcoma", "early-cervical-cancer", "locally-advanced-cervical-cancer", "recurrent-metastatic-cervical-cancer", "platinum-sensitive-ovarian-cancer", "platinum-resistant-ovarian-cancer"],
    caption: "Most high-grade ovarian cancers begin at the tip of the fallopian tube; endometrial cancer lines the uterus, cervical cancer starts at the transformation zone; each drains to a different node group.",
    subsites: [
      { id: "fimbria", label: "Fallopian tube fimbria (origin of high-grade serous)", at: [1.65, 0.8, 0], match: ["high-grade serous", "hgsoc", "serous", "brca", "hrd", "platinum"] },
      { id: "ovary", label: "Ovary (other histologies, germ cell)", at: [-1.75, 0.1, 0.1], match: ["endometrioid", "clear cell", "mucinous", "low-grade serous", "germ cell", "granulosa", "sex cord", "borderline"] },
      { id: "endometrium", label: "Endometrium", at: [0, 0.3, 0.05], match: ["pole", "p53", "mmr", "msi", "nsmp", "endometrioid", "serous", "carcinosarcoma", "copy-number", "her2", "grade"] },
      { id: "myometrium", label: "Myometrium (uterine sarcoma)", at: [0.55, 0.05, 0.4], match: ["sarcoma", "leiomyosarcoma", "stromal"] },
      { id: "placenta", label: "Placental site (gestational trophoblastic)", at: [0.05, 0.75, 0.15], match: ["mole", "choriocarcinoma", "trophoblastic", "pstt", "ett", "low-risk", "high-risk", "hydatidiform"] },
      { id: "cervix", label: "Cervix, transformation zone", at: [0, -0.95, 0.25], match: ["hpv", "squamous", "adenocarcinoma", "cervical", "figo", "locally advanced", "small cell", "vaginal", "vain"] },
      { id: "vulva", label: "Vulva", at: [0, -2.7, 0.3], match: ["vulvar", "lichen", "hpv-independent", "hpv-associated", "melanoma", "paget"] },
    ],
    nodes: [{ label: "obturator and external iliac", at: [1.85, -0.65, 0] }, { label: "internal iliac", at: [1.6, -1.2, -0.25] }, { label: "para-aortic (ovary, high uterus)", at: [0, 1.95, -0.3] }, { label: "inguinal (vulva)", at: [1.7, -2.45, 0.2] }],
    build: () => {
      const m = empty();
      add(m, ellipsoid(0.75, 1.0, 0.6, 5, 10), { at: [0, 0.25, 0] });
      add(m, ring(0.3, 12, "soft", "z"), { at: [0, 0.3, 0.05] }); // cavity
      add(m, cylinder(0.36, 0.6, 10, 2), { at: [0, -0.95, 0] });
      add(m, cylinder(0.3, 1.3, 10, 3, "soft"), { at: [0, -1.95, 0] });
      for (const s of [-1, 1]) {
        add(m, polyline([[s * 0.55, 0.95, 0], [s * 1.1, 1.05, 0], [s * 1.5, 0.85, 0], [s * 1.7, 0.6, 0]]));
        add(m, polyline([[s * 1.7, 0.6, 0], [s * 1.9, 0.75, 0.1]], "soft")); add(m, polyline([[s * 1.7, 0.6, 0], [s * 1.95, 0.5, -0.1]], "soft")); add(m, polyline([[s * 1.7, 0.6, 0], [s * 1.85, 0.35, 0.05]], "soft")); // fimbriae
        add(m, ellipsoid(0.32, 0.5, 0.3, 4, 8), { at: [s * 1.75, 0.1, 0.1] });
      }
      add(m, ring(0.45, 14, undefined, "z"), { at: [0, -2.7, 0.3] }); // vulva
      return m;
    } },
  { id: "testis", name: "Testis and retroperitoneum", cancers: ["testicular", "seminoma", "non-seminoma", "paediatric-germ-cell-tumours"],
    caption: "Germ cell tumours drain along the spermatic cord to the para-aortic nodes high in the abdomen, not to the groin, which is why staging scans look at the retroperitoneum.",
    subsites: [
      { id: "germ", label: "Germinal epithelium", at: [-0.65, -1.0, 0.45], match: ["nsgct", "embryonal", "teratoma", "yolk sac", "choriocarcinoma", "mixed", "good-risk", "poor-risk", "intermediate"] },
      { id: "epididymis", label: "Epididymis and cord", at: [0.85, -0.55, 0.1] },
    ],
    nodes: [{ label: "para-aortic (retroperitoneal)", at: [0, 1.95, -0.2] }, { label: "left renal hilum (left testis)", at: [-0.95, 2.2, -0.1] }, { label: "inguinal (only after scrotal surgery)", at: [1.5, 0.1, 0.1] }],
    build: () => {
      const m = empty();
      for (const s of [-1, 1]) { add(m, ellipsoid(0.45, 0.7, 0.42, 5, 10), { at: [s * 0.65, -1.0, 0] }); add(m, polyline([[s * 0.95, -0.6, 0.1], [s * 1.0, -1.4, 0.1]], "soft")); add(m, polyline([[s * 0.65, -0.3, 0], [s * 0.6, 0.5, 0], [s * 0.4, 1.3, -0.1], [s * 0.15, 1.9, -0.2]])); }
      add(m, polyline([[0, 2.6, -0.25], [0, 0.8, -0.25]], "soft")); add(m, polyline([[0.3, 2.6, -0.25], [0.3, 0.8, -0.25]], "soft"));
      add(m, ellipsoid(0.4, 0.7, 0.3, 3, 8, "soft"), { at: [-1.3, 2.2, -0.2] }); add(m, ellipsoid(0.4, 0.7, 0.3, 3, 8, "soft"), { at: [1.5, 2.3, -0.2] }); // kidneys
      return m;
    } },
  { id: "skin", name: "Skin (cross-section)", cancers: ["melanoma", "basal-cell-carcinoma", "cutaneous-scc", "merkel-cell-carcinoma", "kaposi-sarcoma", "skin-cancer", "braf-v600-melanoma", "stage-iii-melanoma", "stage-ii-melanoma", "advanced-melanoma", "mucosal-melanoma", "acral-melanoma", "advanced-cutaneous-scc", "locally-advanced-bcc", "dermatofibrosarcoma-protuberans"],
    caption: "Each skin cancer comes from a different cell layer: melanocytes and basal cells at the base of the epidermis, keratinocytes above them, Merkel cells and blood vessels in the dermis; depth of invasion decides the risk.",
    subsites: [
      { id: "insitu", label: "Epidermis (in situ)", at: [-1.25, 1.12, 1.05], match: ["in situ", "lentigo", "superficial spreading", "stage 0"] },
      { id: "basal", label: "Basal layer (melanocytes, basal cells)", at: [-0.3, 0.88, 1.05], match: ["bcc", "basal", "nodular", "infiltrative", "superficial bcc", "morphoeic", "braf", "nras", "nf1", "triple wild"] },
      { id: "keratin", label: "Keratinocytes (squamous)", at: [0.65, 1.08, 1.05], match: ["cscc", "squamous", "keratinocyte", "bowen", "actinic", "immunosuppressed"] },
      { id: "dermis", label: "Dermis (invasive; Breslow depth)", at: [-0.65, 0.3, 1.05], match: ["breslow", "ulcer", "invasive", "thick", "nodular melanoma", "stage ii", "stage iii", "stage iv", "dfsp", "dermatofibrosarcoma"] },
      { id: "merkel", label: "Merkel cells (dermal-epidermal)", at: [1.25, 0.86, 1.05], match: ["merkel", "polyomavirus", "mcpyv", "virus-negative", "uv"] },
      { id: "vessels", label: "Dermal vessels (Kaposi)", at: [1.0, 0.05, 1.05], match: ["kaposi", "kshv", "hhv-8", "endemic", "epidemic", "classic", "iatrogenic"] },
      { id: "acral", label: "Acral and mucosal sites", at: [-1.55, 0.6, 1.05], match: ["acral", "mucosal", "kit", "desmoplastic"] },
    ],
    nodes: [{ label: "sentinel node in the draining basin", at: [2.35, -0.3, 0.5] }, { label: "regional basin (axilla, groin, neck)", at: [2.85, 0.35, 0.3] }],
    build: () => {
      const m = empty();
      add(m, box(3.3, 0.26, 2.1, undefined), { at: [0, 1.0, 0] }); // epidermis
      add(m, box(3.3, 1.2, 2.1, "soft"), { at: [0, 0.27, 0] }); // dermis
      add(m, box(3.3, 0.9, 2.1, "soft"), { at: [0, -0.8, 0] }); // subcutis
      add(m, polyline([[-1.65, 0.87, 1.05], [1.65, 0.87, 1.05]])); // basal layer
      add(m, dots(Array.from({ length: 9 }, (_, i) => [-1.5 + i * 0.36, 0.9, 1.06] as Vec3)));
      add(m, polyline([[0.2, 1.13, 0.4], [0.05, 0.4, 0.4], [-0.05, -0.2, 0.4]], "soft")); add(m, sphere(0.14, 3, 6, "soft"), { at: [-0.05, -0.25, 0.4] }); // hair follicle
      add(m, polyline([[-1.5, 0.05, 0.5], [-0.6, 0.15, 0.6], [0.4, -0.05, 0.6], [1.5, 0.1, 0.5]], "soft")); // vessel
      add(m, polyline([[-1.65, 1.15, 1.06], [-1.65, 0.3, 1.06]], "accent")); add(m, polyline([[-1.75, 1.15, 1.06], [-1.55, 1.15, 1.06]], "accent")); add(m, polyline([[-1.75, 0.3, 1.06], [-1.55, 0.3, 1.06]], "accent")); // Breslow depth gauge
      add(m, polyline([[1.65, -0.2, 0.6], [2.35, -0.3, 0.5], [2.85, 0.35, 0.3]], "soft")); // lymphatic
      return m;
    } },
  { id: "eye", name: "Eye", cancers: ["uveal-melanoma", "retinoblastoma"],
    caption: "Uveal melanoma arises in the pigmented choroid and ciliary body, retinoblastoma in the retina of infants; the eye has no lymphatics, so spread is through the blood (uveal melanoma almost always to the liver).",
    subsites: [
      { id: "choroid", label: "Choroid and ciliary body (uveal melanoma)", at: [0.65, 0.6, -0.6], match: ["choroid", "ciliary", "iris", "uveal", "bap1", "gnaq", "gna11", "class 2", "monosomy 3", "sf3b1", "eif1ax"] },
      { id: "retina", label: "Retina (retinoblastoma)", at: [-0.55, -0.35, -0.85], match: ["rb1", "retinoblastoma", "unilateral", "bilateral", "heritable", "sporadic", "trilateral", "group"] },
      { id: "iris", label: "Iris", at: [0.3, 0.35, 0.86] },
      { id: "nerve", label: "Optic nerve (route to the brain)", at: [0, -0.1, -1.75], match: ["optic nerve"] },
    ],
    nodes: [], nodeNote: "No lymphatic drainage: spread is haematogenous (uveal melanoma to the liver) or along the optic nerve (retinoblastoma).",
    build: () => {
      const m = empty();
      add(m, sphere(1.1, 6, 12));
      add(m, sphere(1.03, 4, 10, "soft")); // choroid
      add(m, ellipsoid(0.4, 0.4, 0.2, 3, 8), { at: [0, 0, 0.72] }); // lens
      add(m, ring(0.5, 16, undefined, "z"), { at: [0, 0, 0.86] }); // iris
      add(m, ellipsoid(0.55, 0.55, 0.3, 3, 10, "soft"), { at: [0, 0, 1.0] }); // cornea
      add(m, cylinder(0.2, 1.2, 8, 2), { at: [0, -0.1, -1.7], rotX: Math.PI / 2 }); // optic nerve
      add(m, polyline([[0.3, 0.9, -0.55], [0.8, 0.5, -0.65]], "soft")); // choroidal vessel hint
      return m;
    } },
  { id: "brain", name: "Brain", cancers: ["glioblastoma", "primary-cns-lymphoma", "medulloblastoma", "paediatric-low-grade-glioma", "dipg-dmg", "atrt", "ependymoma", "craniopharyngioma", "pituitary-tumours", "brain-tumours", "idh-mutant-astrocytoma", "oligodendroglioma", "paediatric-high-grade-glioma", "meningioma", "secondary-brain-tumours", "vestibular-schwannoma", "cns-germ-cell-tumours", "spinal-cord-tumours"],
    caption: "Gliomas infiltrate along white matter and can cross the corpus callosum, medulloblastoma sits in the cerebellum, and CNS lymphoma favours deep periventricular tissue; none spread through lymph nodes.",
    subsites: [
      { id: "frontal", label: "Frontal lobe (glioblastoma commonest)", at: [0.95, 0.65, 1.15], match: ["idh-wildtype", "gbm", "glioblastoma", "mgmt", "egfr", "tert", "grade 4", "mesenchymal", "proneural"] },
      { id: "temporal", label: "Temporal lobe", at: [1.7, -0.35, 0.3] },
      { id: "callosum", label: "Corpus callosum (butterfly glioma)", at: [0, 0.5, 0], match: ["butterfly", "corpus callosum", "multifocal"] },
      { id: "idh", label: "Lower-grade IDH-mutant glioma", at: [-1.25, 0.75, 0.9], match: ["idh-mutant", "oligodendroglioma", "astrocytoma", "1p/19q", "codeleted", "grade 2", "grade 3", "cdkn2a"] },
      { id: "cerebellum", label: "Cerebellum (medulloblastoma)", at: [0, -0.95, -1.25], match: ["wnt", "shh", "group 3", "group 4", "medulloblastoma", "desmoplastic", "large cell"] },
      { id: "brainstem", label: "Brainstem and spinal cord (diffuse midline glioma, cord tumours)", at: [0, -1.45, -0.6], match: ["dipg", "h3 k27", "h3.3 k27m", "h3.1 k27m", "k27m", "diffuse midline", "brainstem", "midline", "spinal", "intramedullary", "intradural", "filum terminale", "cauda equina", "haemangioblastoma"] },
      { id: "ventricle", label: "Ventricles and ependymal lining (ependymoma)", at: [0.5, 0.05, -0.2], match: ["ependymoma", "posterior fossa", "pf-a", "pf-b", "zfta", "yap1", "subependymoma", "myxopapillary"] },
      { id: "sella", label: "Sella and pituitary (pituitary tumours, craniopharyngioma)", at: [0, -1.1, 0.45], match: ["pituitary", "prolactinoma", "somatotroph", "corticotroph", "gonadotroph", "thyrotroph", "pit1", "adamantinomatous", "craniopharyngioma", "papillary (braf"] },
      { id: "deep", label: "Deep periventricular tissue (CNS lymphoma)", at: [-0.6, 0.15, -0.25], match: ["pcnsl", "cns lymphoma", "abc", "mcd", "myd88", "cd79b", "vitreoretinal"] },
      { id: "meninges", label: "Meninges and convexity (meningioma)", at: [0.4, 1.55, 0.3], match: ["meningioma", "meningeal", "convexity", "parasagittal", "skull base meningioma"] },
      { id: "grey-white", label: "Grey-white junction (brain metastases)", at: [-1.75, 0.1, -0.5], match: ["brain metastases", "brain metastasis", "leptomeningeal metastases"] },
      { id: "cpa", label: "Cerebellopontine angle and eighth nerve (vestibular schwannoma)", at: [1.0, -1.25, -0.85], match: ["schwannoma", "nf2-related", "cerebellopontine", "intracanalicular", "acoustic"] },
      { id: "pineal", label: "Pineal and suprasellar midline (germ cell tumours)", at: [0, 0.05, -0.75], match: ["germinoma", "germ cell", "pineal", "teratoma", "bifocal"] },
    ],
    nodes: [], nodeNote: "No conventional lymphatics: gliomas spread along white matter tracts and, rarely, through cerebrospinal fluid; medulloblastoma can seed the spine.",
    build: () => {
      const m = empty();
      for (const s of [-1, 1]) { add(m, ellipsoid(0.95, 1.1, 1.5, 5, 12), { at: [s * 0.95, 0.35, 0] }); for (let i = 0; i < 3; i++) add(m, polyline([[s * (0.3 + 0.3 * i), 1.35 - 0.15 * i, 1.0 - 0.5 * i], [s * (0.9 + 0.3 * i), 0.9 - 0.2 * i, 0.6 - 0.5 * i], [s * (1.4 + 0.2 * i), 0.3 - 0.2 * i, 0.3 - 0.4 * i]], "soft")); }
      add(m, polyline([[-0.6, 0.55, 0.7], [0, 0.75, 0], [0.6, 0.55, -0.7]], "soft")); // corpus callosum
      add(m, ellipsoid(1.05, 0.55, 0.7, 4, 10, "soft"), { at: [0, -0.95, -1.25] }); // cerebellum
      add(m, cylinder(0.3, 1.4, 8, 3, "soft"), { at: [0, -1.5, -0.6] }); // brainstem
      add(m, ring(0.35, 12, "soft", "x"), { at: [-0.6, 0.15, -0.25] }); add(m, ring(0.35, 12, "soft", "x"), { at: [0.6, 0.15, -0.25] }); // ventricles
      return m;
    } },
  { id: "head-neck", name: "Head and neck, salivary glands and thyroid", cancers: ["oropharyngeal-cancer", "laryngeal-cancer", "oral-cavity-cancer", "head-and-neck", "nasopharyngeal", "salivary-gland", "papillary-thyroid-cancer", "follicular-thyroid-cancer", "medullary-thyroid-cancer", "anaplastic-thyroid-cancer", "thyroid", "sinonasal", "nut-carcinoma", "parathyroid-carcinoma", "multiple-endocrine-neoplasia"],
    caption: "Site decides cause and behaviour: HPV drives oropharyngeal cancer, EBV drives nasopharyngeal cancer, tobacco drives oral and laryngeal cancer; all drain into the neck node levels that surgeons and radiotherapists map.",
    subsites: [
      { id: "oral", label: "Oral cavity and tongue", at: [1.15, -0.6, 0.35], match: ["oral", "tongue", "oral cavity", "hpv-negative", "hpv negative", "tobacco", "tp53"] },
      { id: "oropharynx", label: "Oropharynx: tonsil, base of tongue (HPV)", at: [0.35, -0.5, 0], match: ["hpv", "oropharyn", "p16", "tonsil"] },
      { id: "nasopharynx", label: "Nasopharynx (EBV)", at: [0.35, 0.55, 0], match: ["ebv", "nasopharyn", "keratinising", "non-keratinising", "undifferentiated", "sinonasal", "esthesioneuroblastoma", "nutm1", "nut carcinoma"] },
      { id: "larynx", label: "Larynx and hypopharynx", at: [0.25, -1.55, 0], match: ["laryn", "glottic", "supraglottic", "hypopharyn"] },
      { id: "parotid", label: "Parotid and other salivary glands", at: [-0.95, -0.45, 1.25], match: ["salivary", "parotid", "adenoid cystic", "mucoepidermoid", "acinic", "salivary duct", "myoepithelial", "androgen receptor", "her2", "ntrk", "secretory"] },
      { id: "thyroid", label: "Thyroid", at: [0.2, -2.45, 0.45], match: ["papillary", "follicular", "medullary", "anaplastic", "ret", "braf", "thyroid", "hurthle", "oncocytic", "poorly differentiated", "radioiodine", "parathyroid", "men1", "men2"] },
    ],
    nodes: [{ label: "level I (submandibular)", at: [1.15, -1.45, 0.75] }, { label: "level II (upper jugular)", at: [-0.2, -1.05, 1.25] }, { label: "level III-IV (jugular)", at: [-0.05, -1.95, 1.15] }, { label: "level V (posterior)", at: [-0.95, -1.7, 0.95] }, { label: "level VI (central, thyroid)", at: [0.25, -2.7, 0.25] }, { label: "retropharyngeal (nasopharynx)", at: [-0.45, -0.15, 0.25] }],
    build: () => {
      const m = empty();
      add(m, sphere(1.55, 6, 14, "soft"), { at: [-0.2, 0.55, 0] }); // skull
      add(m, polyline([[0.6, 1.4, 0], [1.4, 0.6, 0], [1.5, -0.2, 0], [1.2, -0.9, 0], [0.5, -1.2, 0]], undefined)); // face profile
      add(m, ellipsoid(0.6, 0.25, 0.4, 3, 8), { at: [0.9, -0.3, 0] }); // tongue
      add(m, ellipsoid(0.45, 0.35, 0.35, 3, 8, "soft"), { at: [0.35, 0.55, 0] }); // nasopharynx
      add(m, dots([[0.35, -0.45, 0.55], [0.35, -0.45, -0.55]])); // tonsils
      add(m, cylinder(0.3, 0.75, 10, 2), { at: [0.25, -1.55, 0] }); // larynx
      add(m, cylinder(0.22, 1.1, 8, 2, "soft"), { at: [-0.15, -1.55, 0] }); // hypopharynx/oesophagus
      add(m, cylinder(0.18, 0.9, 8, 2, "soft"), { at: [0.25, -2.4, 0] }); // trachea
      add(m, ellipsoid(0.55, 0.45, 0.45, 3, 8), { at: [-0.95, -0.45, 1.25] }); // parotid
      for (const s of [-1, 1]) add(m, ellipsoid(0.22, 0.42, 0.22, 3, 8), { at: [0.2, -2.45, s * 0.45] }); add(m, polyline([[0.2, -2.45, -0.25], [0.2, -2.45, 0.25]])); // thyroid
      add(m, polyline([[0.2, -0.7, 1.2], [0, -1.3, 1.25], [-0.05, -1.95, 1.15], [0, -2.6, 0.9]], "soft")); // jugular chain
      return m;
    } },
  { id: "haematopoietic", name: "Bone marrow, lymph nodes and spleen", cancers: ["marginal-zone-lymphoma", "cutaneous-t-cell-lymphoma", "primary-mediastinal-b-cell-lymphoma", "leukaemia", "aml", "all-leukemia", "cll", "cml", "dlbcl", "follicular-lymphoma", "hodgkin-lymphoma", "mantle-cell-lymphoma", "multiple-myeloma", "non-hodgkin-lymphoma", "mds", "myeloproliferative-neoplasms", "polycythaemia-vera", "essential-thrombocythaemia", "waldenstrom", "hairy-cell-leukemia", "peripheral-t-cell-lymphoma", "bpdcn", "burkitt-lymphoma", "hiv-associated-lymphoma", "cmml", "systemic-mastocytosis", "histiocytoses", "langerhans-cell-histiocytosis", "post-transplant-lymphoproliferative-disorder", "aml-flt3", "aml-idh", "aml-npm1-kmt2a", "aml-secondary", "apl", "aml-older-unfit", "smouldering-myeloma", "myeloma-transplant-eligible", "myeloma-transplant-ineligible", "myeloma-relapsed-refractory", "plasma-cell-leukaemia", "mds-lower-risk", "mds-higher-risk", "cll-treatment-naive", "cll-relapsed", "richter-transformation-cll", "cml-chronic-phase", "cml-advanced-phase", "primary-myelofibrosis"],
    caption: "Leukaemias, myeloma and MDS live in the marrow and blood; lymphomas grow in lymph nodes and spleen. The node stations are the disease map, not a route of spread, and staging counts them.",
    subsites: [
      { id: "marrow", label: "Bone marrow (leukaemia, MDS, MPN, myeloma)", at: [0, 0, 0], match: ["aml", "all", "leukaemia", "myeloid", "cmml", "mastocytosis", "burkitt", "ptld", "histiocyt", "lch", "lymphoblastic", "mds", "mpn", "myelofibrosis", "polycythaemia", "thrombocythaemia", "cml", "chronic phase", "blast", "myeloma", "plasma", "hairy", "waldenstr", "blastic", "npm1", "flt3", "kmt2a", "tp53", "ipss", "philadelphia", "ph-positive", "ph-negative", "t-cell", "b-cell", "hypercalcaemia", "light chain", "smouldering", "high-risk", "standard-risk", "del(17p)", "ighv", "richter", "jak2", "calr", "mpl"] },
      { id: "node", label: "Lymph node germinal centre (lymphomas)", at: [-1.4, 1.8, 0.6], match: ["gcb", "germinal", "follicular", "hodgkin", "nodular", "classical", "mantle", "dlbcl", "abc", "non-gcb", "double-hit", "high-grade", "ptcl", "alcl", "angioimmunoblastic", "nk", "lymphocyte", "sclerosis", "mixed cellularity", "ebv", "grade 1", "grade 3", "transformed", "blastoid", "sox11", "tp53-mutated"] },
      { id: "spleen", label: "Spleen", at: [1.9, 1.5, 0], match: ["splenic", "marginal zone", "hairy cell", "variant"] },
      { id: "blood", label: "Blood (leukaemic phase)", at: [-2.6, -0.6, 0], match: ["cll", "sll", "leukaemic", "circulating", "lymphocytosis", "sezary", "prolymphocytic"] },
      { id: "bone", label: "Lytic bone lesions (myeloma)", at: [1.25, -0.2, 0.4], match: ["crab", "lytic", "plasmacytoma", "bone disease", "extramedullary"] },
      { id: "extranodal", label: "Skin and extranodal sites", at: [2.25, -1.6, 0.4], match: ["cutaneous", "mycosis", "extranodal", "waldeyer", "cns", "testicular", "primary mediastinal", "malt", "gastric", "skin", "leukaemia cutis"] },
    ],
    nodes: [{ label: "cervical", at: [-2.4, 2.6, 0] }, { label: "axillary", at: [-1.4, 1.8, -0.6] }, { label: "mediastinal", at: [-0.4, 2.0, 0] }, { label: "para-aortic and mesenteric", at: [-0.3, 0.95, -0.25] }, { label: "inguinal", at: [1.2, -1.45, 0] }],
    nodeNote: "In lymphoma the node stations are the disease itself; staging (Ann Arbor / Lugano) counts how many regions and sides of the diaphragm are involved.",
    build: () => {
      const m = empty();
      add(m, cylinder(0.45, 3.2, 12, 4), { rotZ: Math.PI / 2 }); // long bone
      add(m, cylinder(0.27, 2.4, 8, 2, "hot"), { rotZ: Math.PI / 2 }); // marrow cavity
      add(m, dots(Array.from({ length: 14 }, (_, i) => [-1.1 + i * 0.17, 0.1 * Math.sin(i * 1.7), 0.1 * Math.cos(i * 2.3)] as Vec3), "hot"));
      add(m, sphere(0.6, 4, 8), { at: [1.85, 0, 0] }); add(m, sphere(0.6, 4, 8), { at: [-1.85, 0, 0] }); // bone ends
      add(m, ellipsoid(0.9, 0.6, 0.4, 4, 10, "soft"), { at: [1.9, 1.5, 0] }); // spleen
      add(m, polyline([[-2.4, 2.6, 0], [-1.4, 1.8, -0.6], [-0.4, 2.0, 0], [-0.3, 0.95, -0.25], [1.2, -1.45, 0]], "soft")); // lymphatic chain
      add(m, polyline([[-2.6, -1.4, 0], [-2.6, 0.4, 0]], "soft")); add(m, dots([[-2.6, -0.6, 0], [-2.55, -0.3, 0.05], [-2.65, -0.9, -0.05]], "soft")); // blood vessel with cells
      add(m, ring(0.18, 10, "hot", "z"), { at: [1.25, -0.2, 0.42] }); // lytic lesion
      return m;
    } },
  { id: "musculoskeletal", name: "Bone and soft tissue (limb cross-section)", cancers: ["leiomyosarcoma", "liposarcoma", "synovial-sarcoma", "sarcoma", "osteosarcoma", "ewing-sarcoma", "rhabdomyosarcoma", "chordoma", "desmoid-tumour", "tenosynovial-giant-cell-tumour", "epithelioid-sarcoma", "vascular-tumours", "chondrosarcoma", "angiosarcoma", "undifferentiated-pleomorphic-sarcoma", "myxofibrosarcoma", "alveolar-soft-part-sarcoma", "pecoma", "epithelioid-haemangioendothelioma", "malignant-peripheral-nerve-sheath-tumour", "retroperitoneal-sarcoma", "extremity-soft-tissue-sarcoma"],
    caption: "Bone sarcomas favour the fast-growing ends of long bones (osteosarcoma) or the shaft (Ewing), soft tissue sarcomas the deep muscle compartments; spread is through the blood to the lungs, rarely via lymph nodes.",
    subsites: [
      { id: "metaphysis", label: "Metaphysis, near the growth plate (osteosarcoma)", at: [0, 1.5, 0.35], match: ["osteosarcoma", "conventional", "osteoblastic", "chondroblastic", "fibroblastic", "telangiectatic", "high-grade", "parosteal", "periosteal"] },
      { id: "diaphysis", label: "Shaft (Ewing sarcoma)", at: [0, -0.5, 0.38], match: ["ewing", "ewsr1", "fli1", "round cell", "cic", "bcor", "localised", "metastatic"] },
      { id: "deep", label: "Deep soft tissue compartment", at: [1.05, 0.4, 0.6], match: ["liposarcoma", "leiomyosarcoma", "ups", "undifferentiated", "synovial", "chordoma", "epithelioid", "proximal type", "tgct", "villonodular", "haemangioendothelioma", "myxofibrosarcoma", "fibrosarcoma", "dedifferentiated", "well-differentiated", "mpnst", "angiosarcoma", "desmoid", "gist", "soft tissue", "bone", "retroperitoneal", "chondrosarcoma", "cartilaginous", "soft part", "pecoma", "nerve sheath", "limb"] },
      { id: "muscle", label: "Skeletal muscle (rhabdomyosarcoma)", at: [-1.05, -0.6, 0.55], match: ["rhabdomyosarcoma", "embryonal", "alveolar", "pax3", "pax7", "foxo1", "pleomorphic", "spindle", "fusion-positive", "fusion-negative"] },
      { id: "nv", label: "Neurovascular bundle (limb salvage decision)", at: [-0.5, 0.2, -0.95] },
    ],
    nodes: [], nodeNote: "Lymph node spread is rare (except epithelioid, synovial, clear cell and rhabdomyosarcoma); sarcomas go through the blood to the lungs.",
    build: () => {
      const m = empty();
      add(m, cylinder(0.36, 3.4, 12, 5)); // femur shaft
      add(m, sphere(0.6, 4, 10), { at: [0, 1.95, 0] }); add(m, ellipsoid(0.7, 0.45, 0.6, 4, 10), { at: [0, -1.95, 0] }); // ends
      add(m, ring(0.5, 14, "soft", "y"), { at: [0, 1.35, 0] }); add(m, ring(0.5, 14, "soft", "y"), { at: [0, -1.5, 0] }); // growth plate hints
      add(m, ellipsoid(1.25, 1.75, 1.1, 4, 12, "soft"), { at: [0, 0, 0] }); // muscle compartment
      add(m, ellipsoid(1.5, 1.9, 1.35, 3, 10, "soft"), { at: [0, 0, 0] }); // fascia / skin
      add(m, polyline([[-0.5, 1.6, -0.95], [-0.5, -1.6, -0.95]], "accent")); add(m, polyline([[-0.65, 1.6, -0.9], [-0.65, -1.6, -0.9]], "soft")); // vessels and nerve
      add(m, polyline([[1.25, 0.4, 0.6], [1.6, 0.9, 0.7], [1.9, 1.4, 0.75]], "soft")); // lymphatic (rarely used)
      return m;
    } },
];

export function organFor(cancerId: string): OrganSchematic | undefined { return ORGAN_SCHEMATICS.find((o) => o.cancers.includes(cancerId)); }
/** Subtype strings of a cancer that a subsite's `match` fragments pick out. */
export function matchedSubtypes(subsite: OrganSubsite, subtypes: string[]): string[] {
  if (!subsite.match?.length) return [];
  return subtypes.filter((s) => { const l = s.toLowerCase(); return subsite.match!.some((f) => l.includes(f)); });
}
