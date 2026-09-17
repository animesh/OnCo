import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { graph } from "./graph";
import { translationFixUrl } from "./issue-links";
import {
  doseTokens, englishSentences, loadSummaryTranslation, parseSummaryTranslation, protectedTokens, readSummaryTranslation, SUMMARY_LANGS, SUMMARY_TRANSLATIONS_DIR,
  summaryHash, summaryTranslationIndex, summaryTranslationsFor, validateTranslation,
} from "./summary-translations";

const SOURCE = "Trastuzumab deruxtecan (T-DXd) is given at 5.4 mg/kg every three weeks in HER2-low breast cancer. DESTINY-Breast04 (NCT03734029) showed a PFS gain over chemotherapy; KRAS and PD-L1 status did not change the effect.";
const GOOD_ES = "Trastuzumab deruxtecan (T-DXd) se administra a 5,4 mg/kg cada tres semanas en el cáncer de mama HER2-low. DESTINY-Breast04 (NCT03734029) mostró una ganancia de SLP frente a la quimioterapia; el estado de KRAS y PD-L1 no modificó el efecto.";
const GOOD_ZH = "Trastuzumab deruxtecan（T-DXd）在 HER2 低表达乳腺癌中每三周给药一次，剂量为 5.4 mg/kg。DESTINY-Breast04（NCT03734029）显示其无进展生存期优于化疗；KRAS 和 PD-L1 状态并未改变疗效。";

describe("summary hash", () => {
  it("is the sha256 of the trimmed summary, so surrounding whitespace does not invalidate a translation", () => {
    expect(summaryHash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(summaryHash("  abc \n")).toBe(summaryHash("abc"));
    expect(summaryHash("abc.")).not.toBe(summaryHash("abc"));
  });
});

describe("validator heuristics", () => {
  it("passes faithful Spanish and Chinese translations", () => {
    expect(validateTranslation(SOURCE, GOOD_ES)).toEqual({ ok: true });
    expect(validateTranslation(SOURCE, GOOD_ZH)).toEqual({ ok: true });
  });

  it("rejects empty output", () => {
    expect(validateTranslation(SOURCE, "   ")).toEqual({ ok: false, problems: ["empty output"] });
  });

  it("flags an English sentence longer than eight words but not short untranslated names", () => {
    const leftover = `${GOOD_ES} The trial also enrolled patients with hormone receptor positive disease and prior CDK4/6 exposure.`;
    const r = validateTranslation(SOURCE, leftover);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems.some((p) => p.startsWith("English sentence left untranslated"))).toBe(true);
    expect(englishSentences("DESTINY-Breast04 y KEYNOTE-522 son ensayos de fase 3 con un diseño abierto.")).toEqual([]);
    expect(englishSentences("Short English here.")).toEqual([]);
    expect(englishSentences("El paciente tiene una respuesta completa y el equipo la registra en el informe.")).toEqual([]);
  });

  it("requires every NCT id, gene symbol and dose from the source", () => {
    expect(protectedTokens(SOURCE)).toEqual(expect.arrayContaining(["NCT03734029", "HER2", "KRAS", "PD-L1"]));
    expect(doseTokens(SOURCE)).toEqual(["54mg/kg"]);
    expect(doseTokens("5,4 mg/kg")).toEqual(["54mg/kg"]);
    const noNct = validateTranslation(SOURCE, GOOD_ES.replace("NCT03734029", "NCT03734028"));
    expect(noNct.ok).toBe(false);
    if (!noNct.ok) expect(noNct.problems).toContain("missing token NCT03734029");
    const noGene = validateTranslation(SOURCE, GOOD_ES.replace("KRAS", "K-RAS"));
    expect(noGene.ok).toBe(false);
    if (!noGene.ok) expect(noGene.problems).toContain("missing token KRAS");
    const noDose = validateTranslation(SOURCE, GOOD_ES.replace("5,4 mg/kg", "5,4 mg"));
    expect(noDose.ok).toBe(false);
    if (!noDose.ok) expect(noDose.problems).toContain("missing dose 54mg/kg");
  });

  it("flags a truncated reply", () => {
    const r = validateTranslation(SOURCE, "Trastuzumab deruxtecan.");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems.some((p) => p.startsWith("output is much shorter"))).toBe(true);
  });
});

describe("loader", () => {
  const dir = mkdtempSync(join(tmpdir(), "onco-summaries-"));
  const summary = "Pathologic complete response means no invasive cancer remains.";
  const good = { source_hash: summaryHash(summary), text: "Respuesta patológica completa significa que no queda cáncer invasivo.", model: "claude-fable-5-1", date: "2026-09-17" };
  mkdirSync(join(dir, "es"), { recursive: true });
  mkdirSync(join(dir, "zh"), { recursive: true });
  mkdirSync(join(dir, "fr"), { recursive: true });
  writeFileSync(join(dir, "es", "pcr.json"), JSON.stringify(good));
  writeFileSync(join(dir, "zh", "pcr.json"), JSON.stringify({ ...good, text: "病理完全缓解。", source_hash: summaryHash("an older English summary") }));
  writeFileSync(join(dir, "fr", "pcr.json"), "{ not json");
  writeFileSync(join(dir, "es", "tnbc.json"), JSON.stringify({ ...good, text: "Ejemplo.", example: true }));
  writeFileSync(join(dir, "es", "orphan.json"), JSON.stringify(good));

  it("returns a translation only when the stored hash matches the current English", () => {
    expect(loadSummaryTranslation("pcr", "es", summary, dir)).toEqual({ text: good.text, model: good.model, date: good.date });
    expect(loadSummaryTranslation("pcr", "es", `${summary} And a new sentence.`, dir)).toBeUndefined();
    expect(loadSummaryTranslation("pcr", "zh", summary, dir)).toBeUndefined();
    expect(readSummaryTranslation("zh", "pcr", dir)?.text).toBe("病理完全缓解。");
  });

  it("ignores malformed files and missing languages without throwing", () => {
    expect(loadSummaryTranslation("pcr", "fr", summary, dir)).toBeUndefined();
    expect(loadSummaryTranslation("pcr", "de", summary, dir)).toBeUndefined();
    expect(parseSummaryTranslation(JSON.stringify({ ...good, date: "17/09/2026" }))).toBeUndefined();
    expect(parseSummaryTranslation(JSON.stringify({ ...good, source_hash: "abc" }))).toBeUndefined();
    expect(parseSummaryTranslation(JSON.stringify({ ...good, text: "" }))).toBeUndefined();
  });

  it("treats example files like real ones and builds the per-record map from valid languages only", () => {
    expect(loadSummaryTranslation("tnbc", "es", summary, dir)).toEqual({ text: "Ejemplo.", model: good.model, date: good.date, example: true });
    expect(summaryTranslationsFor({ id: "pcr", summary }, dir)).toEqual({ es: { text: good.text, model: good.model, date: good.date } });
    expect(summaryTranslationsFor({ id: "pcr", summary: "" }, dir)).toEqual({});
  });

  it("indexes valid and stale files per language, counting orphans as stale", () => {
    const idx = summaryTranslationIndex([{ id: "pcr", summary }, { id: "tnbc", summary }], dir);
    expect([...idx.es.valid].sort()).toEqual(["pcr", "tnbc"]);
    expect([...idx.es.stale]).toEqual(["orphan"]);
    expect([...idx.zh.stale]).toEqual(["pcr"]);
    expect([...idx.fr.stale]).toEqual(["pcr"]);
    expect(idx.de.valid.size + idx.de.stale.size).toBe(0);
  });
});

describe("committed examples", () => {
  it("the hand-written pcr examples in public/i18n/summaries match the current English summary (refresh source_hash after editing the pcr summary)", () => {
    const pcr = graph().must("pcr");
    const map = summaryTranslationsFor(pcr, SUMMARY_TRANSLATIONS_DIR);
    expect(map.es?.example).toBe(true);
    expect(map.zh?.example).toBe(true);
    expect(validateTranslation(pcr.summary, map.es!.text)).toEqual({ ok: true });
    expect(validateTranslation(pcr.summary, map.zh!.text)).toEqual({ ok: true });
  });

  it("every stored file across the corpus parses and matches a record, so stale files are noticed", () => {
    const g = graph();
    const idx = summaryTranslationIndex(g.entities, SUMMARY_TRANSLATIONS_DIR);
    for (const lang of SUMMARY_LANGS) expect([...idx[lang].stale], `stale ${lang} summary translations`).toEqual([]);
  });
});

describe("report link", () => {
  it("opens the translation-fix form with record, language and provenance prefilled", () => {
    const url = translationFixUrl({ kind: "term", id: "pcr", name: "Pathologic complete response (pCR)" }, "Chinese", { model: "claude-fable-5-1", date: "2026-09-17" });
    const p = new URL(url).searchParams;
    expect(p.get("template")).toBe("translation-fix.yml");
    expect(p.get("language")).toBe("Chinese");
    expect(p.get("entity")).toContain("pcr (term)");
    expect(p.get("current")).toContain("claude-fable-5-1");
    expect(p.get("title")).toBe("translation: pcr (Chinese)");
  });
});
