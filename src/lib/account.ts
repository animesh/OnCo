/**
 * Optional accounts for syncing the watchlist across devices, built on Supabase's REST endpoints with plain fetch
 * (no client library). Everything is off unless NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
 * at build time; the anon key is public by design and every row is protected by row-level security (see docs/LAUNCH.md).
 * Sign-in is a magic link by email; the session lives in localStorage; only the email address and the watchlist are stored.
 */
import { loadWatchlist, replaceWatchlist, type WatchItem } from "@/lib/watchlist";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const accountEnabled = !!(URL && KEY);

export type Session = { access_token: string; refresh_token: string; expires_at: number; user: { id: string; email: string } };
const SKEY = "onco:session:v1";
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

/** Email a one-time sign-in link that returns to the current page. */
export async function sendMagicLink(email: string): Promise<boolean> {
  const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
  const r = await fetch(`${URL}/auth/v1/otp?redirect_to=${redirect}`, { method: "POST", headers: headers(), body: JSON.stringify({ email, create_user: true }) });
  return r.ok;
}

/** After the link is clicked the tokens arrive in the URL fragment; store them, fetch the user and clean the address bar. */
export async function captureSession(): Promise<Session | null> {
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
  const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: headers(), body: JSON.stringify({ refresh_token: s.refresh_token }) }).catch(() => null);
  if (!r || !r.ok) { saveSession(null); return null; }
  const j = await r.json() as { access_token: string; refresh_token: string; expires_in: number };
  const next: Session = { ...s, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000 };
  saveSession(next);
  return next;
}

export async function signOut(): Promise<void> {
  const s = loadSession();
  if (s) await fetch(`${URL}/auth/v1/logout`, { method: "POST", headers: headers(s.access_token) }).catch(() => null);
  saveSession(null);
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

/** Merge the browser's list with the account's (union by id, the browser's copy wins for a shared id), save both ways. */
export async function syncWatchlist(): Promise<{ ok: boolean; count: number }> {
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

/** Push the current browser list to the account; called after every star or unstar while signed in. */
export async function pushWatchlist(): Promise<boolean> {
  const s = await currentSession();
  if (!s) return false;
  return push(s, loadWatchlist());
}
