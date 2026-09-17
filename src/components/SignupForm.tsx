"use client";

import { useState } from "react";
import { accountEnabled, sendMagicLink } from "@/lib/account";
import { useT } from "@/lib/i18n/ui";

const ACTION = process.env.NEXT_PUBLIC_SIGNUP_ACTION ?? "";
const LIST = process.env.NEXT_PUBLIC_SIGNUP_LIST ?? "";

/**
 * Email sign-up. With accounts configured it sends a magic link, which both creates the account and records the
 * address; otherwise it posts the address to the list provider named in NEXT_PUBLIC_SIGNUP_ACTION (Buttondown or
 * Listmonk form endpoint). Nothing else is collected. If neither is configured the form explains that and offers
 * the feed and the Watch button instead of pretending to save the address.
 */
export function SignupForm() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const configured = accountEnabled || !!ACTION;
  const send = async (e: React.FormEvent) => {
    if (accountEnabled) { e.preventDefault(); if (!email.includes("@")) return; setState("sending"); setState((await sendMagicLink(email.trim())) ? "sent" : "error"); return; }
    setState("sent");
  };
  if (state === "sent") return <p className="rounded-lg border border-accent/40 bg-accent-soft text-accent px-4 py-3">{accountEnabled ? t("account.sent") : t("signup.done")}</p>;
  if (!configured) return (
    <div className="card p-5 space-y-2 text-sm">
      <p>{t("signup.soon")}</p>
    </div>
  );
  return (
    <form action={accountEnabled ? undefined : ACTION} method="post" target={accountEnabled ? undefined : "_blank"} onSubmit={send} className="card p-5 space-y-3">
      <label className="block text-sm"><span className="text-muted">{t("account.email")}</span><input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
      {!accountEnabled && LIST && <input type="hidden" name="l" value={LIST} />}
      {!accountEnabled && <input type="hidden" name="tag" value="onco.cc" />}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full justify-center">{accountEnabled ? t("account.send") : t("signup.button")}</button>
      {state === "error" && <p className="text-sm text-muted">{t("account.error")}</p>}
      <p className="text-xs text-muted">{t("signup.why")}</p>
    </form>
  );
}
