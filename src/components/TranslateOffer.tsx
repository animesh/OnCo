"use client";

import { useEffect, useState } from "react";
import { LANGS, useLayer, type Lang } from "@/lib/layer";
import { dirFor, langNative, t, type UiKey } from "@/lib/i18n/ui";

const KEY = "onco.translate-offer.dismissed";

/** The two-letter primary subtag of a BCP 47 tag ("pt-BR" gives "pt"); empty when there is none. */
export function primaryLang(tag: string | undefined | null): string {
  return (tag ?? "").trim().toLowerCase().split(/[-_]/)[0] ?? "";
}

/** Which one-line instruction to show for the visitor's browser, picked from the user agent. */
export function browserHint(ua: string): UiKey {
  if (/Edg\//.test(ua)) return "offer.edge";
  if (/Firefox\//.test(ua)) return "offer.firefox";
  if (/Chrome\/|CriOS\//.test(ua)) return "offer.chrome";
  if (/Safari\//.test(ua)) return "offer.safari";
  return "offer.other";
}

export type Offer =
  | { kind: "switch"; to: Lang }
  | { kind: "translate"; hint: UiKey }
  | null;

/**
 * What to offer, given the browser's preferred languages, the chosen site language and the user agent:
 *  - nothing when any preferred language is the one already chosen;
 *  - a one-tap switch when the browser's first language is one of the nine we carry but is not selected;
 *  - the browser's own translator when the browser's language is not one we carry and the site is in English
 *    (when another site language is chosen, LangStrip already says the detailed text is English and how to translate).
 */
export function decideOffer(preferred: readonly string[], chosen: Lang, ua: string): Offer {
  const primaries = preferred.map(primaryLang).filter(Boolean);
  const first = primaries[0];
  if (!first || primaries.includes(chosen)) return null;
  const carried = LANGS.find((l) => l.code === first);
  if (carried) return { kind: "switch", to: carried.code };
  return chosen === "en" ? { kind: "translate", hint: browserHint(ua) } : null;
}

/**
 * One dismissible line at the top of the main column when the browser's language does not match the site language.
 * Renders nothing on the server and on the first client render, so it never affects hydration; dismissal is
 * remembered in localStorage. Not a modal, not sticky, hidden in print.
 */
export function TranslateOffer() {
  const [layer, update] = useLayer();
  const [env, setEnv] = useState<{ preferred: string[]; ua: string; dismissed: boolean } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      let dismissed = false;
      try { dismissed = localStorage.getItem(KEY) === "1"; } catch { /* private mode */ }
      const preferred = navigator.languages?.length ? [...navigator.languages] : [navigator.language];
      setEnv({ preferred, ua: navigator.userAgent, dismissed });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!env || env.dismissed) return null;
  const offer = decideOffer(env.preferred, layer.lang, env.ua);
  if (!offer) return null;

  const dismiss = () => { setEnv({ ...env, dismissed: true }); try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } };
  // The switch offer speaks the visitor's language; the translate hint is in the site language (English).
  const lang: Lang = offer.kind === "switch" ? offer.to : layer.lang;
  const close = t("strip.dismiss", lang);

  return (
    <div className="no-print mx-auto max-w-7xl px-4 sm:px-6 pt-3" lang={lang} dir={dirFor(lang)}>
      <div role="status" className="flex items-start gap-3 rounded-lg border border-border bg-accent-soft/60 px-3 py-2 text-[13px] leading-snug">
        <p className="flex-1 min-w-0 text-foreground/85">
          {offer.kind === "switch" ? (
            <>
              {t("offer.switch", lang, { language: langNative(offer.to) })}{" "}
              <button type="button" onClick={() => { update({ lang: offer.to }); dismiss(); }} className="underline text-accent hover:text-foreground font-medium">
                {t("offer.switchButton", lang, { language: langNative(offer.to) })}
              </button>
            </>
          ) : (
            <>
              {t("offer.english", lang)} <span className="text-muted">{t(offer.hint, lang)}</span>
            </>
          )}
        </p>
        <button type="button" onClick={dismiss} aria-label={close} title={close} className="ctl ctl-icon h-7 w-7 shrink-0 -my-0.5">
          <svg aria-hidden viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
        </button>
      </div>
    </div>
  );
}
