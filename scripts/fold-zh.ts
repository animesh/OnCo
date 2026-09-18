/**
 * Fold `tldrZh` exports from wave files into `tldr_zh` in src/data/i18n/zh.ts (append-only, skips keys already present).
 * Waves written by parallel agents export their Chinese TL;DRs instead of editing the shared dictionary, which avoids
 * merge conflicts; run `npm run fold:zh` after merging such a branch. Add new wave modules to WAVES.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tldrZh as manufacturing } from "../src/data/manufacturing-wave";
import { tldrZh as theories } from "../src/data/theories-wave";
import { tldrZh as platform } from "../src/data/platform-trials-wave";
import { tldrZh as trialDesign } from "../src/data/trial-design-wave";
import { tldrZh as law } from "../src/data/law-wave";
import { tldrZh as diagnostics2 } from "../src/data/diagnostics-wave2";
import { tldrZh as networks } from "../src/data/institution-networks-wave";
import { tldrZh as prostate } from "../src/data/prostate-subtypes";
import { tldrZh as machines2 } from "../src/data/machines-wave2";
import { tldrZh as sponsors3 } from "../src/data/companies-sponsors-wave3";
import { tldrZh as cns } from "../src/data/cns-subtypes";
import { tldrZh as colorectalLymphoma } from "../src/data/colorectal-lymphoma-subtypes";
import { tldrZh as upperGiLiver } from "../src/data/upper-gi-liver-subtypes";
import { tldrZh as blood } from "../src/data/blood-subtypes";
import { tldrZh as gynaecological } from "../src/data/gynaecological-subtypes";
import { tldrZh as skin } from "../src/data/skin-subtypes";
import { tldrZh as lung } from "../src/data/lung-subtypes";
import { tldrZh as breast } from "../src/data/breast-subtypes";
import { tldrZh as sarcomaBone } from "../src/data/sarcoma-bone-subtypes";

const WAVES: Record<string, string>[] = [manufacturing, theories, platform, trialDesign, law, diagnostics2, networks, prostate, machines2, sponsors3, cns, colorectalLymphoma, upperGiLiver, blood, gynaecological, skin, lung, breast, sarcomaBone];
const path = "src/data/i18n/zh.ts";
let z = readFileSync(path, "utf8");
const have = new Set([...z.matchAll(/^\s*(?:"([^"]+)"|([A-Za-z_$][\w$]*)):\s/mg)].map((m) => m[1] ?? m[2]));
let add = "";
for (const t of WAVES) for (const [k, v] of Object.entries(t)) if (!have.has(k)) { add += `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`; have.add(k); }
if (add) { const i = z.lastIndexOf("\n};"); z = z.slice(0, i + 1) + add + z.slice(i + 1); writeFileSync(path, z); }
console.log(`fold-zh: ${add ? add.trimEnd().split("\n").length : 0} entries added`);
