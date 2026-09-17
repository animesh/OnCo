/**
 * Optional accounts. Two providers, chosen at build time by which public keys are present:
 *  - WorkOS (NEXT_PUBLIC_WORKOS_CLIENT_ID): AuthKit hosted sign-in (email code, password, Google, passkey) through the
 *    browser-only PKCE flow, no server and no client library. Every user is recorded in WorkOS User Management.
 *  - Supabase (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY): magic link by email plus a watchlist table.
 * With neither set, everything here is off. The session lives in localStorage; only the email address (and, with
 * WorkOS, the name the user gave) is stored. See docs/LAUNCH.md for the dashboard steps.
 */
import { loadWatchlist, replaceWatchlist, type WatchItem } from "@/lib/watchlist";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const WORKOS = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID ?? "";
const WORKOS_API = "https://api.workos.com/user_management";
export type Provider = "workos" | "supabase" | "none";
export const provider: Provider = WORKOS ? "workos" : URL && KEY ? "supabase" : "none";
export const accountEnabled = provider !== "none";
/** True when the provider keeps the watchlist server-side (Supabase); WorkOS accounts keep it in the browser. */
export const syncsWatchlist = provider === "supabase";

export type Session = { access_token: string; refresh_token: string; expires_at: number; user: { id: string; email: string; name?: string } };
const SKEY = "onco:session:v1";
const PKCE_KEY = "onco:pkce";
const EVENT = "onco:account";

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try { const raw = window.localStorage.getItem(SKEY); return raw ? (JSON.parse(raw) as Session) : null; } catch { return null; }
}
function saveSession(s: Session | null) {
  try { if (s) window.localStorage.setItem(SKEY, JSON.stringify(s)); else window.localStorage.removeItem(SKEY); } catch { /* storage blocked */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: s }));
}
export function onAccountChange(fn: (s: Session | null) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<Session | null>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

const headers = (token?: string): Record<string, string> => ({ apikey: KEY, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) });

/* ---------- WorkOS (PKCE, browser only) ---------- */

const b64url = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function jwtClaims(token: string): Record<string, unknown> {
  try { const p = token.split(".")[1] ?? ""; return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>; } catch { return {}; }
}
/** The address WorkOS returns to; registered in the dashboard under Redirects. */
export const workosRedirect = () => window.location.origin + "/signup/";

/** Send the reader to WorkOS AuthKit; `returnTo` is the path to come back to once signed in. */
export async function startSignIn(returnTo?: string): Promise<void> {
  if (provider !== "workos") return;
  const verifierBytes = new Uint8Array(48); crypto.getRandomValues(verifierBytes);
  const verifier = b64url(verifierBytes.buffer);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = b64url(crypto.getRandomValues(new Uint8Array(12)).buffer);
  try { window.sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state, returnTo: returnTo ?? window.location.pathname + window.location.search })); } catch { /* storage blocked */ }
  const q = new URLSearchParams({ response_type: "code", client_id: WORKOS, redirect_uri: workosRedirect(), provider: "authkit", code_challenge: challenge, code_challenge_method: "S256", state });
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- external WorkOS address
  window.location.href = `${WORKOS_API}/authorize?${q}`;
}

type WorkosAuth = { access_token: string; refresh_token: string; user: { id: string; email: string; first_name?: string | null; last_name?: string | null } };
function fromWorkos(j: WorkosAuth): Session {
  const exp = Number(jwtClaims(j.access_token).exp ?? 0);
  const name = [j.user.first_name, j.user.last_name].filter(Boolean).join(" ") || undefined;
  return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: exp ? exp * 1000 : Date.now() + 5 * 60 * 1000, user: { id: j.user.id, email: j.user.email, name } };
}
async function workosExchange(body: Record<string, string>): Promise<Session | null> {
  const r = await fetch(`${WORKOS_API}/authenticate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: WORKOS, ...body }) }).catch(() => null);
  if (!r || !r.ok) return null;
  return fromWorkos(await r.json() as WorkosAuth);
}

/* ---------- shared surface ---------- */

/** Supabase only: email a one-time sign-in link that returns to the current page. */
export async function sendMagicLink(email: string): Promise<boolean> {
  if (provider !== "supabase") return false;
  const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
  const r = await fetch(`${URL}/auth/v1/otp?redirect_to=${redirect}`, { method: "POST", headers: headers(), body: JSON.stringify({ email, create_user: true }) });
  return r.ok;
}

/**
 * Complete a sign-in that arrived in the address bar: the WorkOS `?code=` (checked against the PKCE state saved before
 * the redirect) or the Supabase tokens in the fragment. Stores the session, cleans the address bar, and for WorkOS
 * returns the reader to the page they started from.
 */
export async function captureSession(): Promise<Session | null> {
  if (provider === "workos") {
    const p = new URLSearchParams(window.location.search);
    const code = p.get("code"); if (!code) return null;
    let saved: { verifier: string; state: string; returnTo: string } | null = null;
    try { saved = JSON.parse(window.sessionStorage.getItem(PKCE_KEY) ?? "null"); window.sessionStorage.removeItem(PKCE_KEY); } catch { /* storage blocked */ }
    if (!saved || saved.state !== p.get("state")) return null;
    const s = await workosExchange({ grant_type: "authorization_code", code, code_verifier: saved.verifier });
    if (!s) return null;
    saveSession(s);
    const back = saved.returnTo && saved.returnTo !== "/signup/" && !saved.returnTo.startsWith("/signup/?") ? saved.returnTo : "/signup/";
    history.replaceState(null, "", back);
    return s;
  }
  const h = window.location.hash;
  if (!h.includes("access_token=")) return null;
  const p = new URLSearchParams(h.slice(1));
  const access = p.get("access_token"), refresh = p.get("refresh_token"), expiresIn = Number(p.get("expires_in") ?? "3600");
  if (!access || !refresh) return null;
  const u = await fetch(`${URL}/auth/v1/user`, { headers: headers(access) }).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { id?: string; email?: string } | null;
  if (!u?.id) return null;
  const s: Session = { access_token: access, refresh_token: refresh, expires_at: Date.now() + expiresIn * 1000, user: { id: u.id, email: u.email ?? "" } };
  saveSession(s);
  history.replaceState(null, "", window.location.pathname + window.location.search);
  return s;
}

/** A usable session, refreshed when within five minutes of expiry; null when signed out or the refresh fails. */
export async function currentSession(): Promise<Session | null> {
  const s = loadSession();
  if (!s) return null;
  if (s.expires_at - Date.now() > 5 * 60 * 1000) return s;
  if (provider === "workos") {
    const next = await workosExchange({ grant_type: "refresh_token", refresh_token: s.refresh_token });
    if (!next) { saveSession(null); return null; }
    saveSession(next); return next;
  }
  const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: headers(), body: JSON.stringify({ refresh_token: s.refresh_token }) }).catch(() => null);
  if (!r || !r.ok) { saveSession(null); return null; }
  const j = await r.json() as { access_token: string; refresh_token: string; expires_in: number };
  const next: Session = { ...s, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000 };
  saveSession(next);
  return next;
}

export async function signOut(): Promise<void> {
  const s = loadSession();
  if (s && provider === "supabase") await fetch(`${URL}/auth/v1/logout`, { method: "POST", headers: headers(s.access_token) }).catch(() => null);
  saveSession(null);
  if (s && provider === "workos") {
    const sid = jwtClaims(s.access_token).sid;
    if (typeof sid === "string") { const img = new Image(); img.src = `${WORKOS_API}/sessions/logout?session_id=${encodeURIComponent(sid)}`; }
  }
}

type Row = { items: WatchItem[]; updated_at: string };

async function pull(s: Session): Promise<WatchItem[] | null> {
  const r = await fetch(`${URL}/rest/v1/watchlists?select=items,updated_at&user_id=eq.${s.user.id}`, { headers: headers(s.access_token) }).catch(() => null);
  if (!r || !r.ok) return null;
  const rows = await r.json() as Row[];
  return Array.isArray(rows[0]?.items) ? rows[0].items : [];
}

async function push(s: Session, items: WatchItem[]): Promise<boolean> {
  const r = await fetch(`${URL}/rest/v1/watchlists`, { method: "POST", headers: { ...headers(s.access_token), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([{ user_id: s.user.id, items, updated_at: new Date().toISOString() }]) }).catch(() => null);
  return !!r && r.ok;
}

/** Merge the browser's list with the account's (union by id, the browser's copy wins for a shared id), save both ways. Supabase only. */
export async function syncWatchlist(): Promise<{ ok: boolean; count: number }> {
  if (!syncsWatchlist) return { ok: false, count: 0 };
  const s = await currentSession();
  if (!s) return { ok: false, count: 0 };
  const remote = await pull(s);
  if (remote === null) return { ok: false, count: 0 };
  const local = loadWatchlist();
  const seen = new Set(local.map((w) => w.id));
  const merged = [...local, ...remote.filter((w) => w && typeof w.id === "string" && !seen.has(w.id))];
  if (merged.length !== local.length) replaceWatchlist(merged);
  const ok = await push(s, merged);
  return { ok, count: merged.length };
}

/** Push the current browser list to the account; called after every star or unstar while signed in. Supabase only. */
export async function pushWatchlist(): Promise<boolean> {
  if (!syncsWatchlist) return false;
  const s = await currentSession();
  if (!s) return false;
  return push(s, loadWatchlist());
}
