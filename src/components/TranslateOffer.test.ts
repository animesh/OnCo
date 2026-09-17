import { describe, expect, it } from "vitest";
import { browserHint, decideOffer, primaryLang } from "./TranslateOffer";
import { DOSE_RE, nameAttrs } from "@/lib/translate";
import { EN, UI_DICTS } from "@/lib/i18n/ui";
import { LANGS } from "@/lib/layer";

const CHROME = "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const SAFARI = "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const FIREFOX = "Mozilla/5.0 (Macintosh; rv:130.0) Gecko/20100101 Firefox/130.0";
const EDGE = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36 Edg/129.0";

describe("translate offer", () => {
  it("reads the primary language subtag", () => {
    expect(primaryLang("pt-BR")).toBe("pt");
    expect(primaryLang("zh-Hant-TW")).toBe("zh");
    expect(primaryLang("EN_us")).toBe("en");
    expect(primaryLang(undefined)).toBe("");
  });

  it("stays quiet when the browser already prefers the chosen language", () => {
    expect(decideOffer(["en-GB", "fr"], "en", CHROME)).toBeNull();
    expect(decideOffer(["it", "en"], "en", CHROME)).toBeNull();
    expect(decideOffer(["es-MX"], "es", CHROME)).toBeNull();
    expect(decideOffer([], "en", CHROME)).toBeNull();
  });

  it("offers a one-tap switch to a language we carry", () => {
    expect(decideOffer(["es-ES"], "en", CHROME)).toEqual({ kind: "switch", to: "es" });
    expect(decideOffer(["ja"], "fr", SAFARI)).toEqual({ kind: "switch", to: "ja" });
    expect(decideOffer(["en-US"], "de", SAFARI)).toEqual({ kind: "switch", to: "en" });
  });

  it("points to the browser's translator for a language we do not carry, only while the site is in English", () => {
    expect(decideOffer(["it-IT"], "en", CHROME)).toEqual({ kind: "translate", hint: "offer.chrome" });
    expect(decideOffer(["ko"], "en", SAFARI)).toEqual({ kind: "translate", hint: "offer.safari" });
    expect(decideOffer(["nl"], "en", FIREFOX)).toEqual({ kind: "translate", hint: "offer.firefox" });
    expect(decideOffer(["tr"], "en", EDGE)).toEqual({ kind: "translate", hint: "offer.edge" });
    expect(decideOffer(["it-IT"], "es", CHROME)).toBeNull();
  });

  it("has an instruction key for every hint in every language", () => {
    for (const hint of ["offer.chrome", "offer.edge", "offer.safari", "offer.firefox", "offer.other"] as const) {
      expect(EN[hint]).toBeTruthy();
      for (const l of LANGS) expect(UI_DICTS[l.code][hint]).toBeTruthy();
    }
    expect(browserHint("")).toBe("offer.other");
  });
});

describe("translation attributes", () => {
  it("marks proper-noun kinds untranslatable and the rest as English", () => {
    expect(nameAttrs("drug")).toEqual({ translate: "no", className: "notranslate" });
    expect(nameAttrs("trial", "chip")).toEqual({ translate: "no", className: "chip notranslate" });
    expect(nameAttrs("cancer")).toEqual({ lang: "en" });
    expect(nameAttrs(undefined, "x")).toEqual({ lang: "en", className: "x" });
  });

  it("finds doses and units inside a sentence", () => {
    const hits = (s: string) => [...s.matchAll(DOSE_RE)].map((m) => m[0]);
    expect(hits("150 mg twice daily with food")).toEqual(["150 mg"]);
    expect(hits("8 mg/kg loading then 6 mg/kg every 3 weeks")).toEqual(["8 mg/kg", "6 mg/kg"]);
    expect(hits("7.4 GBq every 6 weeks, 6 cycles")).toEqual(["7.4 GBq"]);
    expect(hits("2 Gy in 30 fractions")).toEqual(["2 Gy"]);
    expect(hits("Take with water.")).toEqual([]);
  });
});
