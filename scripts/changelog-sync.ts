/**
 * Regenerate the "Unreleased" section of CHANGELOG.md from the commit log.
 *
 * The range starts after the commit that shipped the latest version heading
 * (a subject naming that version, for example "launch 1.0.0"), or after the
 * heading's date when no such commit exists. Commits are grouped by day, most
 * recent first, one bullet per commit subject. An optional argument adds the
 * subject of the commit about to be made, so the site that ships with it is
 * already current. Runs as part of `npm run build`; where git is unavailable
 * (the remote build) it leaves the file alone.
 *
 * Version sections below "Unreleased" are written by hand when a release is cut.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(process.cwd(), "CHANGELOG.md");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NOTE = "Regenerated from the commit log each time the site ships (`scripts/changelog-sync.ts`); the version sections below are written by hand when a release is cut.";

function git(args: string[]): string | null {
  try { return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; }
}
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
function clean(subject: string): string {
  return subject.replace(/\s+[—–]\s+/g, ", ").replace(/[—–]/g, "-").replace(/\s+/g, " ").trim();
}

const md = readFileSync(FILE, "utf8");
const unrel = md.match(/^## \[Unreleased\][^\n]*\n/m);
const release = md.match(/^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/m);
if (!unrel || !release) { console.log("changelog-sync: headings not found, skipped"); process.exit(0); }
const [, version, releaseDate] = release;

if (git(["rev-parse", "--is-inside-work-tree"]) !== "true") { console.log("changelog-sync: no git, skipped"); process.exit(0); }

// Find the commit that shipped the current version so the range starts after it.
const versionRe = new RegExp(`(^|[\\s:(])v?${version.replace(/\./g, "\\.")}([\\s:,.)]|$)`);
const candidates = (git(["log", "--format=%H%x09%s", `--since=${releaseDate}T00:00:00`, `--until=${releaseDate}T23:59:59`]) ?? "").split("\n").filter(Boolean);
const releaseCommit = candidates.map((l) => l.split("\t")).find(([, s]) => versionRe.test(s))?.[0];
const rangeArgs = releaseCommit ? [`${releaseCommit}..HEAD`] : [`--since=${releaseDate}T23:59:59`];
const log = git(["log", "--format=%as%x09%s", "--no-merges", ...rangeArgs]) ?? "";

const byDay = new Map<string, string[]>();
const add = (day: string, subject: string) => {
  const s = clean(subject); if (!s) return;
  const list = byDay.get(day) ?? []; if (!list.includes(s)) list.push(s); byDay.set(day, list);
};
for (const line of log.split("\n").filter(Boolean)) { const [day, ...rest] = line.split("\t"); add(day, rest.join("\t")); }
// Keep bullets already listed under today, so a subject passed by the ship
// chain survives the argument-free run inside `npm run build`.
const today = new Date().toISOString().slice(0, 10);
const startIdx = md.indexOf(unrel[0]);
const endIdx = md.indexOf("\n## [", startIdx + unrel[0].length);
const existing = md.slice(startIdx, endIdx);
const todayBlock = existing.split(/^### /m).find((b) => b.startsWith(longDate(today)));
// Newest first: the subject about to be committed, then bullets kept from a
// previous run that are not yet in the log, then the log itself.
const pending = process.argv.slice(2).join(" ").split("\n")[0];
const kept = (todayBlock ?? "").split("\n").filter((l) => l.startsWith("- ")).map((l) => clean(l.slice(2)));
const front = [pending ? clean(pending) : "", ...kept].filter((x) => x && !(byDay.get(today) ?? []).includes(x));
if (front.length) byDay.set(today, [...new Set([...front, ...(byDay.get(today) ?? [])])]);

const days = [...byDay.keys()].sort().reverse();
let body = `## [Unreleased]\n\n${NOTE}\n\n`;
if (!days.length) body += "Nothing yet.\n\n";
for (const day of days) body += `### ${longDate(day)}\n${byDay.get(day)!.map((s) => `- ${s}`).join("\n")}\n\n`;

const next = md.slice(0, startIdx) + body + md.slice(endIdx + 1);
if (next !== md) { writeFileSync(FILE, next); console.log(`changelog-sync: ${[...byDay.values()].reduce((n, l) => n + l.length, 0)} entries across ${days.length} days`); }
else console.log("changelog-sync: up to date");
