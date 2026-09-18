import { describe, expect, it } from "vitest";
import MiniSearch from "minisearch";
import { answerText, composeAnswer, recordFromEntity, retrieveIds, sentences, type AskRecord } from "./ask";
import { benchmark, scoreAnswer } from "@/data/benchmark";
import { askEval, askEvalNew, scoreAskEval } from "@/data/ask-eval";
import { graph } from "./graph";
import { routeFor } from "./schema";
import { searchDocs, type SearchDoc } from "./search-index";
import { buildSemanticIndex, semanticSearch } from "./semantic";
import { semanticDocs } from "./semantic-docs";
import { askHarness } from "./ask-harness";
import { analyseQuestion, classifyIntent } from "./ask-intent";
import { unknownLexiconIds } from "./ask-index-build";
import { abbreviation, decodeAskIndex, deriveAliases, encodeAskIndex, regionCode, shortName } from "./ask-index";
import { batchFromQuestion, followUpsFor, hasSurvivalFigure, regionFromQuestion } from "./ask-compose";

describe("sentences", () => {
  it("splits on sentence ends and drops fragments", () => {
    expect(sentences("Sacituzumab govitecan is a TROP2 ADC. It is approved in TNBC after two prior lines. Ok.")).toEqual([
      "Sacituzumab govitecan is a TROP2 ADC.", "It is approved in TNBC after two prior lines.",
    ]);
  });
});

describe("composeAnswer (extractive fallback)", () => {
  const records: AskRecord[] = [
    { id: "sg", kind: "drug", name: "Sacituzumab govitecan", route: "/drugs/sg/", tldr: "An antibody that carries chemotherapy to TROP2 on tumour cells.", passages: [
      { text: "An antibody that carries chemotherapy to TROP2 on tumour cells.", field: "TL;DR" },
      { text: "Sacituzumab govitecan is approved for metastatic triple-negative breast cancer after two prior therapies.", field: "summary" },
      { text: "Neutropenia and diarrhoea are the main grade 3 toxicities.", field: "summary" },
    ] },
    { id: "ascent", kind: "trial", name: "ASCENT", route: "/trials/ascent/", tldr: "The trial that proved sacituzumab govitecan in TNBC.", passages: [
      { text: "The trial that proved sacituzumab govitecan in TNBC.", field: "TL;DR" },
      { text: "ASCENT, overall survival: sacituzumab govitecan 12.1 months versus chemotherapy 6.7 months, hazard ratio 0.48.", field: "outcome" },
    ] },
  ];

  it("copies sentences verbatim with one citation per sentence, ordered by record", () => {
    const a = composeAnswer("What is the survival benefit of sacituzumab govitecan in TNBC?", records);
    expect(a.sentences.length).toBeGreaterThan(1);
    for (const s of a.sentences) expect(records.flatMap((r) => r.passages.map((p) => p.text))).toContain(s.text);
    expect(a.sentences.some((s) => s.text.startsWith("ASCENT, overall survival"))).toBe(true);
    expect(a.sources.map((s) => s.id)).toEqual(["sg", "ascent"]);
    expect(a.sentences.map((s) => s.cite)).toEqual([...a.sentences.map((s) => s.cite)].sort());
    expect(answerText(a)).toContain("[1] Sacituzumab govitecan (https://onco.cc/drugs/sg/)");
  });

  it("falls back to the top TL;DR and says so when nothing matches", () => {
    const a = composeAnswer("quantum chromodynamics", records);
    expect(a.confidence).toBe("low");
    expect(a.note).toBeDefined();
    expect(a.sentences.length).toBe(1);
    expect(a.sentences[0].field).toBe("TL;DR");
  });

  it("returns no sentences for no records", () => {
    expect(composeAnswer("anything", []).sentences).toEqual([]);
  });
});

describe("Ask index", () => {
  it("names only records that exist in the lexicon", () => {
    expect(unknownLexiconIds()).toEqual([]);
  });

  it("derives aliases from name, abbreviation, brand and code", () => {
    const a = deriveAliases({ id: "trastuzumab-deruxtecan", kind: "drug", name: "Trastuzumab deruxtecan", brand: "Enhertu", code: "DS-8201, T-DXd" });
    expect(a).toEqual(expect.arrayContaining(["Trastuzumab deruxtecan", "Enhertu", "DS-8201", "T-DXd"]));
    const c = deriveAliases({ id: "tnbc", kind: "cancer", name: "Triple-negative breast cancer (TNBC)" });
    expect(c).toEqual(expect.arrayContaining(["Triple-negative breast cancer", "TNBC", "triple-negative"]));
    expect(deriveAliases({ id: "x", kind: "term", name: "Cancer" })).toEqual([]);
  });

  it("round-trips through the compact wire format and derives routes", { timeout: 120_000 }, () => {
    const { index } = askHarness();
    const back = decodeAskIndex(JSON.parse(JSON.stringify(encodeAskIndex(index))));
    expect(back.entries.length).toBe(index.entries.length);
    const tnbc = back.entries.find((e) => e.id === "tnbc")!;
    expect(tnbc.kind).toBe("cancer");
    expect(tnbc.route).toBe("/cancers/tnbc/");
    expect(tnbc.aliases).toContain("triple-negative");
    expect(back.pairs.length).toBeGreaterThanOrEqual(benchmark.length);
  });

  it("uses the abbreviation as the short name for cancers", () => {
    expect(shortName({ kind: "cancer", name: "Triple-negative breast cancer (TNBC)" })).toBe("TNBC");
    expect(shortName({ kind: "drug", name: "Trastuzumab deruxtecan" })).toBe("Trastuzumab deruxtecan");
    expect(shortName({ kind: "technology", name: "CT (computed tomography)" })).toBe("CT");
  });
});

describe("intent and entity resolution", () => {
  it("classifies the common question shapes", () => {
    expect(classifyIntent("What does 'triple-negative' mean in breast cancer?")).toBe("define");
    expect(classifyIntent("How is TNBC treated?")).toBe("treatments");
    expect(classifyIntent("Is Enhertu approved in the UK?")).toBe("approval");
    expect(classifyIntent("How does trastuzumab deruxtecan work?")).toBe("mechanism");
    expect(classifyIntent("What are the side effects of Trodelvy?")).toBe("side-effects");
    expect(classifyIntent("What trials are open for pancreatic cancer?")).toBe("trials");
    expect(classifyIntent("Enhertu vs Trodelvy")).toBe("compare");
    expect(classifyIntent("Enhertu vs Trodelvy", 1)).not.toBe("compare");
    expect(classifyIntent("What is the survival rate for TNBC?")).toBe("prognosis");
    expect(classifyIntent("Who makes Keytruda?")).toBe("who");
    expect(classifyIntent("How much does Enhertu cost?")).toBe("cost");
    expect(classifyIntent("What did KEYNOTE-522 show?")).toBe("results");
    expect(classifyIntent("What is the standard treatment for stage II-III TNBC today?")).toBe("treatments");
  });

  it("resolves aliases, abbreviations, hyphen and quote variants", () => {
    const { index } = askHarness();
    const ids = (q: string) => analyseQuestion(q, index).entities.filter((e) => e.strong).map((e) => e.entry.id);
    expect(ids("What does 'triple-negative' mean in breast cancer?")[0]).toBe("tnbc");
    expect(ids("What does “triple negative” mean?")[0]).toBe("tnbc");
    expect(ids("Is Enhertu approved in the UK?")).toEqual(["trastuzumab-deruxtecan"]);
    expect(ids("What is HER2-low?")[0]).toBe("her2-low");
    expect(ids("What is HER2 low?")[0]).toBe("her2-low");
    expect(ids("Trodelvy side effects")).toContain("sacituzumab-govitecan");
    expect(ids("What did the VISION trial show?")).toContain("vision");
    expect(ids("What does pCR mean after chemotherapy?")[0]).toBe("pcr");
    expect(ids("Who makes Keytruda?")).toEqual(["pembrolizumab"]);
  });

  it("matches the owner's example to the curated benchmark pair", () => {
    const { index } = askHarness();
    const a = analyseQuestion("What does 'triple-negative' mean in breast cancer?", index);
    expect(a.pair?.pair.ids).toContain("tnbc");
    expect(a.pair?.similarity).toBe(1);
    // A paraphrase still matches.
    const b = analyseQuestion("What does triple-negative mean in breast cancer", index);
    expect(b.pair?.pair.ids).toContain("tnbc");
  });

  it("reads a region named in the question", () => {
    expect(regionFromQuestion("Is Enhertu approved in the UK?")).toBe("UK");
    expect(regionFromQuestion("Is Enhertu approved in Japan?")).toBe("JP");
    expect(regionFromQuestion("Is Enhertu approved?")).toBeUndefined();
  });

  it("suggests follow-ups that skip the current intent", () => {
    const f = followUpsFor({ kind: "cancer", name: "Triple-negative breast cancer (TNBC)" }, "define");
    expect(f).toContain("How is TNBC treated?");
    expect(f).toContain("What trials are open for TNBC?");
    expect(f.some((x) => x.startsWith("What is TNBC"))).toBe(false);
  });
});

describe("September 2026 kinds: intents, aliases, index extras, survival guard", () => {
  it("classifies the new question shapes", () => {
    expect(classifyIntent("Which investors back radioligand startups?")).toBe("investors");
    expect(classifyIntent("Who invests in Arcellx?")).toBe("investors");
    expect(classifyIntent("Which YC companies work on cancer?")).toBe("companies");
    expect(classifyIntent("Which YC W24 companies are working on cancer?")).toBe("companies");
    expect(classifyIntent("What did India approve for CAR-T?")).toBe("regional-approvals");
    expect(classifyIntent("Which drugs did China approve for lung cancer?")).toBe("regional-approvals");
    // No regulator named: an ordinary approval question, not a regional listing.
    expect(classifyIntent("Which TROP2 ADCs are approved for first-line metastatic triple-negative breast cancer?")).toBe("approval");
    expect(classifyIntent("What is the roadmap for radiation therapy?")).toBe("roadmap");
    expect(classifyIntent("Where is cancer surgery heading over the next decade?")).toBe("roadmap");
    expect(classifyIntent("Which journals publish oncology nursing research?")).toBe("journals");
    expect(classifyIntent("Which journals cover radiation oncology?")).toBe("journals");
    expect(classifyIntent("Is scalp cooling worth it for taxane chemo?")).toBe("evidence");
    expect(classifyIntent("Is acupuncture proven for nausea?")).toBe("evidence");
    expect(classifyIntent("Which KEGG pathway covers bladder cancer?")).toBe("define");
  });

  it("drops the evidence reading when nothing graded is named", () => {
    const { index } = askHarness();
    expect(analyseQuestion("Does Enhertu work in HER2-low breast cancer?", index).intent).not.toBe("evidence");
    expect(analyseQuestion("Does ginger help with chemo nausea?", index).intent).toBe("evidence");
  });

  it("resolves the new aliases and kinds", () => {
    const { index } = askHarness();
    const ids = (q: string) => analyseQuestion(q, index).entities.filter((e) => e.strong).map((e) => e.entry.id);
    expect(ids("Which YC companies work on cancer?")).toContain("y-combinator");
    expect(ids("Is the ketogenic diet proven for glioblastoma?")[0]).toBe("ketogenic-diet-glioblastoma");
    expect(ids("What is NexCAR19?")).toEqual(["talicabtagene-autoleucel"]);
    expect(ids("Which KEGG pathway covers bladder cancer?")[0]).toBe("bladder-cancer-signalling");
    expect(ids("What is hsa05214?")).toContain("glioma-signalling");
    expect(ids("What is the Lancet Oncology?")[0]).toBe("lancet-oncology");
    expect(ids("Does fenbendazole cure cancer?")).toContain("fenbendazole-ivermectin-repurposing-claims");
    const tmh = ids("Did low-dose nivolumab work in the Tata Memorial trial?");
    expect(tmh).toContain("low-dose-nivolumab-tmh");
    expect(tmh).not.toContain("elective-neck-dissection-tmh");
  });

  it("carries grade, batch and approved regions in the index and its wire format", () => {
    const { index } = askHarness();
    const by = (id: string) => index.entries.find((e) => e.id === id)!;
    expect(by("scalp-cooling").grade).toBe("strong");
    expect(by("st-johns-wort-interaction").grade).toBe("harm");
    expect(by("ketogenic-diet-glioblastoma").grade).toBe("insufficient");
    expect(by("granza-bio").batch).toBe("W24");
    expect(by("talicabtagene-autoleucel").regions).toContain("IN");
    expect(by("sintilimab").regions).toContain("CN");
    expect(by("tnbc").grade).toBeUndefined();
    const back = decodeAskIndex(JSON.parse(JSON.stringify(encodeAskIndex(index))));
    expect(back.entries.find((e) => e.id === "granza-bio")?.batch).toBe("W24");
    expect(back.entries.find((e) => e.id === "scalp-cooling")?.grade).toBe("strong");
    expect(back.entries.find((e) => e.id === "sintilimab")?.regions).toContain("CN");
  });

  it("treats a bracketed gloss as a gloss, not an abbreviation", () => {
    expect(abbreviation("Low-dose nivolumab plus metronomic chemotherapy (Tata Memorial)")).toBeUndefined();
    expect(abbreviation("Bladder cancer (KEGG map)")).toBeUndefined();
    expect(abbreviation("Triple-negative breast cancer (TNBC)")).toBe("TNBC");
    expect(abbreviation("Cognitive behavioural therapy for insomnia (CBT-I)")).toBe("CBT-I");
  });

  it("recognises survival and mortality figures but not trial medians or toxicity rates", () => {
    expect(hasSurvivalFigure("Five-year survival is 12%.")).toBe(true);
    expect(hasSurvivalFigure("About 2.6 million cancer deaths in 2022.")).toBe(true);
    expect(hasSurvivalFigure("People who chose alternative medicine were two and a half times as likely to die.")).toBe(true);
    expect(hasSurvivalFigure("Mortality was 96 per 100,000.")).toBe(true);
    expect(hasSurvivalFigure("Approved 2020 for pretreated metastatic TNBC (ASCENT: OS 12.1 vs 6.7 months) and 2023 for HR+/HER2- breast cancer.")).toBe(false);
    expect(hasSurvivalFigure("Neutropenia occurred in 49% of patients.")).toBe(false);
  });

  it("reads YC batches and region codes", () => {
    expect(batchFromQuestion("Which YC W24 companies work on cancer?")).toBe("W24");
    expect(batchFromQuestion("What did the S21 trial show?")).toBeUndefined();
    expect(regionCode("China")).toBe("CN");
    expect(regionCode("IN")).toBe("IN");
    expect(regionCode("Japan")).toBe("JP");
    expect(regionCode("Switzerland")).toBeUndefined();
  });
});

describe("Ask OnCo end to end, September 2026 kinds", () => {
  it("states the evidence grade first and never frames a harm-graded approach as an option", async () => {
    const a = await askHarness().ask("Is it safe to use alternative medicine instead of chemotherapy?");
    expect(a.template).toBe("evidence");
    expect(a.sentences[0].field).toBe("evidence grade");
    expect(a.sentences[0].text).toMatch(/evidence of harm or interaction/);
    expect(answerText(a)).toMatch(/does not present it as an option/);
    expect(a.sentences.some((s) => s.field === "strengths")).toBe(false);
    for (const s of a.sentences) expect(hasSurvivalFigure(s.text)).toBe(false);
  });

  it("grades an insufficient approach and says it is not a reason to use it outside a trial", async () => {
    const a = await askHarness().ask("Is the ketogenic diet proven for glioblastoma?");
    expect(a.template).toBe("evidence");
    expect(a.entities[0].id).toBe("ketogenic-diet-glioblastoma");
    expect(answerText(a)).toMatch(/insufficient evidence/);
    expect(answerText(a)).toMatch(/not a reason to use it outside a trial/);
  });

  it("lists what a regulator approved, with brand and year, and reads the drug records", async () => {
    const a = await askHarness().ask("What did India approve for CAR-T?");
    expect(a.template).toBe("regional-approvals");
    const text = answerText(a);
    expect(text).toMatch(/approved in India by the CDSCO/);
    expect(text).toMatch(/NexCAR19, 2023/);
    expect(text).toMatch(/Qartemi/);
    expect(a.consulted.some((s) => s.id === "varnimcabtagene-autoleucel")).toBe(true);
  });

  it("lists one YC batch of an investor's portfolio", async () => {
    const a = await askHarness().ask("Which YC W24 companies are working on cancer?");
    expect(a.template).toBe("companies");
    expect(answerText(a)).toMatch(/Winter 2024 \(W24\)/);
    expect(answerText(a)).toMatch(/Granza Bio/);
  });

  it("aggregates the investors behind a field's companies", async () => {
    const a = await askHarness().ask("Which investors back radioligand startups?");
    expect(a.template).toBe("investors");
    expect(answerText(a)).toMatch(/Investors backing Radioligand therapy companies/);
  });

  it("walks the roadmap built around a front", async () => {
    const a = await askHarness().ask("What is the roadmap for radiation therapy?");
    expect(a.template).toBe("roadmap");
    expect(a.sources.some((s) => s.id === "radiation-roadmap")).toBe(true);
    expect(answerText(a)).toMatch(/Coming next/);
  });

  it("matches journals on a topic and reads them", async () => {
    const a = await askHarness().ask("Which journals publish oncology nursing research?");
    expect(a.template).toBe("journals");
    expect(answerText(a)).toMatch(/Oncology nursing forum/i);
    expect(a.consulted.some((s) => s.id === "cancer-nursing")).toBe(true);
  });
});

describe("Ask OnCo end to end", () => {
  it("answers the owner's example with the TNBC TL;DR and the definition, cited", async () => {
    const a = await askHarness().ask("What does 'triple-negative' mean in breast cancer?", "UK");
    expect(a.intent).toBe("define");
    expect(a.template).toBe("define");
    expect(a.confidence).toBe("high");
    expect(a.entities[0].id).toBe("tnbc");
    expect(a.sources[0].id).toBe("tnbc");
    expect(a.sentences[0].cite).toBe(1);
    expect(a.sentences[0].text).toMatch(/lacks the three receptors \(oestrogen, progesterone, HER2\)/);
    const text = answerText(a).toLowerCase();
    for (const must of ["oestrogen", "progesterone", "her2", "er <1%", "pr <1%"]) expect(text).toContain(must);
    expect(a.followUps).toContain("How is TNBC treated?");
    expect(a.method).toMatch(/nothing is generated/);
    expect(a.readMore.some((r) => r.href === "/cancers/tnbc/")).toBe(true);
  });

  it("starts approval answers with the region the question names", async () => {
    const a = await askHarness().ask("Is Enhertu approved in the UK?", "US");
    expect(a.template).toBe("approval");
    expect(answerText(a)).toMatch(/In the United Kingdom, Trastuzumab deruxtecan is approved by the MHRA/);
  });

  it("answers prognosis questions with the state of the art first and no bare figure", async () => {
    const a = await askHarness().ask("What is the survival rate for triple negative breast cancer?");
    expect(a.template).toBe("prognosis");
    expect(a.sentences[0].field).toBe("TL;DR");
    expect(a.sentences.some((s) => s.field === "survival disclosure")).toBe(true);
    expect(a.readMore.some((r) => r.href === "/survival/")).toBe(true);
    expect(a.sentences[0].text).not.toMatch(/\d+%/);
  });

  it("compares two products side by side and links the compare page", async () => {
    const a = await askHarness().ask("Enhertu vs Trodelvy");
    expect(a.template).toBe("compare");
    expect(a.entities.map((e) => e.id).sort()).toEqual(["sacituzumab-govitecan", "trastuzumab-deruxtecan"]);
    expect(a.readMore.some((r) => r.href.startsWith("/compare/?ids="))).toBe(true);
  });

  it("falls back to sentence retrieval when nothing is named", async () => {
    const a = await askHarness().ask("Which oncology drugs were approved in the US in July 2026?");
    expect(a.sentences.length).toBeGreaterThan(0);
    for (const s of a.sentences) expect(a.sources[s.cite - 1]).toBeDefined();
  });

  it("clears the floors on the open benchmark and the natural set (before/after measured 2026-09-10)", { timeout: 120_000 }, async () => {
    const h = askHarness();
    // Before (extractive only): benchmark rubric 0.69, recall 0.41; natural rubric 0.59, recall 0.59.
    // After (this pipeline): benchmark rubric 0.83, recall 1.00 (the benchmark questions are curated pairs; with pairs
    // switched off 0.70 and 0.57); natural rubric 1.00, recall 0.93. Floors sit below so regressions fail loudly.
    let bScore = 0, bRecall = 0;
    for (const q of benchmark) {
      const a = await h.ask(q.question, "US");
      bScore += scoreAnswer(q, answerText(a)).score;
      const ids = a.consulted.map((s) => s.id);
      bRecall += q.entities.length ? q.entities.filter((id) => ids.includes(id)).length / q.entities.length : 1;
    }
    expect(bScore / benchmark.length).toBeGreaterThanOrEqual(0.76);
    expect(bRecall / benchmark.length).toBeGreaterThanOrEqual(0.9);
    let nScore = 0, nRecall = 0;
    for (const q of askEval) {
      const a = await h.ask(q.question, "US");
      const s = scoreAskEval(q, answerText(a), a.consulted.map((x) => x.id));
      nScore += s.score; nRecall += s.retrievalRecall;
    }
    expect(nScore / askEval.length).toBeGreaterThanOrEqual(0.88);
    expect(nRecall / askEval.length).toBeGreaterThanOrEqual(0.85);
  });

  it("clears the floors on the second natural set (India and China, journals, KEGG, companies, investors, complementary, roadmaps; measured 2026-09-10)", { timeout: 120_000 }, async () => {
    // Before the September 2026 work: rubric 0.74, recall 0.92. After: rubric 1.00, recall 1.00. Floors sit below.
    const h = askHarness();
    let score = 0, recall = 0;
    for (const q of askEvalNew) {
      const a = await h.ask(q.question, "US");
      const s = scoreAskEval(q, answerText(a), a.consulted.map((x) => x.id));
      score += s.score; recall += s.retrievalRecall;
    }
    expect(score / askEvalNew.length).toBeGreaterThanOrEqual(0.9);
    expect(recall / askEvalNew.length).toBeGreaterThanOrEqual(0.9);
  });

  it("keeps the extractive path at or above its previous floors", { timeout: 120_000 }, () => {
    const g = graph();
    const ms = new MiniSearch<SearchDoc>({ fields: ["name", "aka", "tldr", "tags", "id"], storeFields: ["id"], searchOptions: { boost: { name: 4, aka: 3, id: 2 }, prefix: true, fuzzy: 0.2 } });
    ms.addAll(searchDocs());
    const sem = buildSemanticIndex(semanticDocs());
    let score = 0, recall = 0;
    for (const q of benchmark) {
      const ids = retrieveIds(ms.search(q.question).slice(0, 12).map((h) => ({ id: String(h.id) })), semanticSearch(sem, q.question, 12), 6);
      const records = ids.map((id) => { const e = g.must(id); return recordFromEntity(e, routeFor(e)); });
      score += scoreAnswer(q, answerText(composeAnswer(q.question, records))).score;
      recall += q.entities.length ? q.entities.filter((id) => ids.includes(id)).length / q.entities.length : 1;
    }
    // Measured 0.3645 before and 0.3595 after the blood-cancer subtype pages (17 Sept 2026): io-40 lost "checkpoint-inhibitor"
    // when bosutinib (semantic score 0.209) edged past irae (0.209) on term-frequency drift from the nineteen new records.
    expect(recall / benchmark.length).toBeGreaterThanOrEqual(0.355);
    expect(score / benchmark.length).toBeGreaterThanOrEqual(0.62);
  });
});
