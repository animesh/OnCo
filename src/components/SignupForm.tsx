"use client";

import { useEffect, useState } from "react";
import { accountEnabled, captureSession, loadSession, onAccountChange, provider, sendMagicLink, signOut, startSignIn, type Session } from "@/lib/account";
import { useT } from "@/lib/i18n/ui";

const ACTION = process.env.NEXT_PUBLIC_SIGNUP_ACTION ?? "";
const LIST = process.env.NEXT_PUBLIC_SIGNUP_LIST ?? "";

/**
 * Account sign-up. With WorkOS configured one button opens AuthKit (email code, password, Google or passkey) and the
 * user is recorded there; with Supabase it sends a magic link; otherwise it posts the address to the list provider
 * named in NEXT_PUBLIC_SIGNUP_ACTION. If nothing is configured the form says so instead of pretending to save the address.
 */
export function SignupForm() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (!accountEnabled) return;
    let alive = true;
    captureSession().then((s) => { if (alive) setSession(s ?? loadSession()); });
    const off = onAccountChange((s) => setSession(s));
    return () => { alive = false; off(); };
  }, []);
  const configured = accountEnabled || !!ACTION;
  const send = async (e: React.FormEvent) => {
    if (provider === "supabase") { e.preventDefault(); if (!email.includes("@")) return; setState("sending"); setState((await sendMagicLink(email.trim())) ? "sent" : "error"); return; }
    setState("sent");
  };
  if (session) return (
    <div className="card p-5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span><span className="text-accent" aria-hidden>●</span> {t("account.hello", { email: session.user.name ? `${session.user.name} (${session.user.email})` : session.user.email })}</span>
      <button type="button" onClick={() => signOut()} className="chip border border-border bg-card hover:bg-foreground/5">{t("account.signOut")}</button>
    </div>
  );
  if (provider === "workos") return (
    <div className="card p-5 space-y-3">
      <button type="button" onClick={() => startSignIn("/saved/")} className="btn btn-primary w-full justify-center">{t("account.continue")}</button>
      <p className="text-xs text-muted">{t("account.providerNote")}</p>
    </div>
  );
  if (state === "sent") return <p className="rounded-lg border border-accent/40 bg-accent-soft text-accent px-4 py-3">{accountEnabled ? t("account.sent") : t("signup.done")}</p>;
  if (!configured) return (
    <div className="card p-5 space-y-2 text-sm">
      <p>{t("signup.soon")}</p>
    </div>
  );
  return (
    <form action={accountEnabled ? undefined : ACTION} method="post" target={accountEnabled ? undefined : "_blank"} onSubmit={send} className="card p-5 space-y-3">
      <label className="block text-sm"><span className="text-muted">{t("account.email")}</span><input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2" /></label>
      {!accountEnabled && LIST && <input type="hidden" name="l" value={LIST} />}
      {!accountEnabled && <input type="hidden" name="tag" value="onco.cc" />}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full justify-center">{accountEnabled ? t("account.send") : t("signup.button")}</button>
      {state === "error" && <p className="text-sm text-muted">{t("account.error")}</p>}
      <p className="text-xs text-muted">{t("signup.why")}</p>
    </form>
  );
}
