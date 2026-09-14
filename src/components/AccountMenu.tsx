"use client";

import { useEffect, useRef, useState } from "react";
import { accountEnabled, captureSession, loadSession, onAccountChange, pushWatchlist, sendMagicLink, signOut, syncWatchlist, type Session } from "@/lib/account";
import { useT } from "@/lib/i18n/ui";

/**
 * Sign in to keep the watchlist across devices. Renders nothing unless accounts are configured (see lib/account.ts).
 * `inline` is the fuller card used on /saved/; the default is the compact header control.
 */
export function AccountMenu({ inline = false, className = "" }: { inline?: boolean; className?: string }) {
  const { t } = useT();
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [synced, setSynced] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!accountEnabled) return;
    let alive = true;
    (async () => {
      const s = (await captureSession()) ?? loadSession();
      if (!alive) return;
      setSession(s);
      if (s) { const r = await syncWatchlist(); if (alive && r.ok) setSynced(r.count); }
    })();
    const off = onAccountChange((s) => setSession(s));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onList = () => { if (!loadSession()) return; clearTimeout(timer); timer = setTimeout(() => { pushWatchlist().then((ok) => { if (ok) setSynced((n) => (n ?? 0)); }); }, 800); };
    window.addEventListener("onco:watchlist", onList);
    return () => { alive = false; off(); window.removeEventListener("onco:watchlist", onList); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (!accountEnabled) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("sending");
    setState((await sendMagicLink(email.trim())) ? "sent" : "error");
  };

  const dialogEl = (
    <dialog ref={dialog} onClose={() => setOpen(false)} className="backdrop:bg-black/50 bg-card text-foreground rounded-xl border border-border p-0 w-[min(94vw,26rem)]">
      <form onSubmit={send} className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3"><h2 className="text-base font-semibold">{t("account.title")}</h2><button type="button" onClick={() => setOpen(false)} className="rounded border border-border px-2 py-0.5 text-sm hover:bg-foreground/5" aria-label="Close">×</button></div>
        <p className="text-sm text-muted">{t("account.why")}</p>
        {state === "sent" ? <p className="text-sm rounded-lg border border-accent/40 bg-accent-soft text-accent px-3 py-2">{t("account.sent")}</p> : (
          <>
            <label className="block text-sm"><span className="text-muted">{t("account.email")}</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
            <button type="submit" disabled={state === "sending"} className="btn w-full justify-center">{t("account.send")}</button>
            {state === "error" && <p className="text-sm text-muted">{t("account.error")}</p>}
          </>
        )}
      </form>
    </dialog>
  );

  if (inline) {
    return (
      <div className={`card p-4 text-sm ${className}`}>
        {session ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span><span className="text-accent" aria-hidden>●</span> {t("account.synced")}{synced !== null ? ` · ${synced}` : ""} <span className="text-muted">· {session.user.email}</span></span>
            <button type="button" onClick={() => signOut()} className="chip border border-border bg-card hover:bg-foreground/5">{t("account.signOut")}</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted">{t("account.why")}</span>
            <button type="button" onClick={() => setOpen(true)} className="btn">{t("account.signIn")}</button>
          </div>
        )}
        {dialogEl}
      </div>
    );
  }

  return (
    <span className={className}>
      {session ? (
        <button type="button" onClick={() => signOut()} title={`${session.user.email} · ${t("account.signOut")}`} aria-label={`${session.user.email}: ${t("account.signOut")}`} className="ctl ctl-icon">
          <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[11px] font-semibold">{(session.user.email[0] ?? "?").toUpperCase()}</span>
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="ctl px-2.5 text-xs" title={t("account.title")}>{t("account.signIn")}</button>
      )}
      {dialogEl}
    </span>
  );
}
