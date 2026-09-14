import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { KIND_META, KINDS } from "@/lib/schema";
import { graph } from "@/lib/graph";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { DatasetJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({ title: "Open API", description: "The OnCo corpus as static JSON, NDJSON and CSV with a JSON Schema, Atom feeds for what changes, and tagged releases for citation.", path: "/api/" });

const FEEDS = [
  { file: "changelog.xml", label: "Changelog", what: "One entry per release of the site." },
  { file: "regulatory.xml", label: "Regulatory events", what: "Designations, filings, approvals, complete response letters, withdrawals and label changes, newest first (100)." },
  { file: "calendar.xml", label: "Readout calendar", what: "Regulatory dates, advisory committees, expected readouts and congresses; expected dates are marked as editorial estimates." },
  { file: "pulse.xml", label: "Research pulse", what: "What the leading journals, regulators and news sources are saying, item by item with links." },
];

export default function ApiDocs() {
  const g = graph();
  const mono = "underline font-mono text-sm";
  return (
    <>
      <DatasetJsonLd />
      <PageHeader kicker={<GroupKicker id="learn" />} title="Open API" lede="The whole corpus is published as static files under /api/v1/ with permissive CORS: JSON per entity and per kind, one-line-per-record NDJSON, CSV for spreadsheets, and a JSON Schema. No key, no rate limit beyond the CDN. Licence CC BY-NC 4.0." />
      <Container className="pb-16 max-w-3xl">
        <div className="card p-4 mb-6 text-sm border-accent/30 bg-accent-soft/40">
          <div className="kicker mb-1">Attribution required</div>
          <p>The data are free for non-commercial, educational and research use under <a className="underline" href="https://creativecommons.org/licenses/by-nc/4.0/" rel="noopener">CC BY-NC 4.0</a>; commercial use needs a <Link className="underline" href="/about/#licence">paid licence</Link>. If you use the API or the files, name OnCo and link to <a className="underline" href="https://onco.cc">onco.cc</a> wherever the data or text derived from it appears, for example: <code className="text-xs">Data from OnCo (onco.cc), CC BY-NC 4.0</code>. Logos remain their owners&apos; trademarks and molecule structures keep their PubChem and RCSB terms. The same notice is in <code className="text-xs">/api/v1/meta.json</code>, as the first line of every CSV and inside every JSON download from the site&apos;s tables.</p>
        </div>

        <h2 className="text-xl font-semibold mt-2 mb-2">Files</h2>
        <div className="card overflow-x-auto">
        <table className="onco">
          <thead><tr><th scope="col">Path</th><th scope="col">Contents</th></tr></thead>
          <tbody>
            <tr><td><a className={mono} href="/api/v1/all.json">/api/v1/all.json</a></td><td>All {g.entities.length.toLocaleString("en-GB")} entities, fully resolved with defaults, plus an <code>incoming</code> map of backlinks per id.</td></tr>
            <tr><td><a className={mono} href="/api/v1/all.ndjson">/api/v1/all.ndjson</a></td><td>The same entities, one JSON object per line with its <code>route</code>, for streaming tools (<code>jq -c</code>, DuckDB, pandas <code>read_json(lines=True)</code>).</td></tr>
            <tr><td><a className={mono} href="/api/v1/schema.json">/api/v1/schema.json</a></td><td>JSON Schema (draft 2020-12) of one entity, generated from the Zod schema that validates the corpus at build time.</td></tr>
            <tr><td><a className={mono} href="/api/v1/openapi.json">/api/v1/openapi.json</a></td><td>OpenAPI 3.1 description of every file here and the feeds, generated at build time from the same layout that writes them.</td></tr>
            <tr><td><a className={mono} href="/api/v1/search.json">/api/v1/search.json</a></td><td>Compact documents (id, kind, name, tldr, route) used by the site search.</td></tr>
            {KINDS.map((k) => <tr key={k}><td><a className={mono} href={`/api/v1/${KIND_META[k].plural}.json`}>/api/v1/{KIND_META[k].plural}.json</a><span className="text-muted"> · </span><a className={mono} href={`/api/v1/${KIND_META[k].plural}.csv`}>.csv</a></td><td>{g.kind(k).length.toLocaleString("en-GB")} {KIND_META[k].plural}. The CSV flattens each record: lists of ids joined with &ldquo;; &rdquo;, nested tables as JSON in the cell.</td></tr>)}
            <tr><td><span className="font-mono text-sm">/api/v1/entities/&lt;id&gt;.json</span></td><td>One entity with its neighbours, e.g. <a className="underline" href="/api/v1/entities/tnbc.json">tnbc.json</a>, <a className="underline" href="/api/v1/entities/trop2.json">trop2.json</a>.</td></tr>
            <tr><td><a className={mono} href="/api/v1/ranking.json">/api/v1/ranking.json</a></td><td>Institution ranking rows with the score components.</td></tr>
            <tr><td><a className={mono} href="/api/v1/meta.json">/api/v1/meta.json</a></td><td>Build date, counts, schema version, the list of files and feeds.</td></tr>
          </tbody>
        </table>
        </div>
        <p className="text-sm text-muted mt-3">Every table on the site also has CSV and JSON buttons that export exactly the rows shown after filtering, and the <Link className="underline" href="/pivot/">landscape grid</Link> exports the grid.</p>

        <h2 id="feeds" className="text-xl font-semibold mt-10 mb-2 scroll-mt-24">Feeds</h2>
        <p className="text-[15px] leading-relaxed mb-3">Atom 1.0 feeds for the parts of OnCo that move. Subscribe in any feed reader; the entries link back to the page and to the primary source.</p>
        <div className="card overflow-x-auto">
        <table className="onco">
          <thead><tr><th scope="col">Feed</th><th scope="col">Contents</th></tr></thead>
          <tbody>
            {FEEDS.map((f) => <tr key={f.file}><td><a className={mono} href={`/feeds/${f.file}`} type="application/atom+xml">/feeds/{f.file}</a><div className="text-xs text-muted">{f.label}</div></td><td>{f.what}</td></tr>)}
          </tbody>
        </table>
        </div>

        <h2 id="bulk" className="text-xl font-semibold mt-10 mb-2 scroll-mt-24">Bulk download and citation</h2>
        <p className="text-[15px] leading-relaxed">Each tagged version of OnCo is published as a <a className="underline" href="https://github.com/judegomila/OnCo/releases" rel="noopener">GitHub release</a> with the whole <code>/api/v1/</code> tree attached as a tarball, the CSVs as a zip, the NDJSON, and SHA-256 checksums, so a paper or a pipeline can pin an exact snapshot. The repository carries a <code>.zenodo.json</code> so that Zenodo can archive each release and mint a DOI once archiving is switched on for the repository; until then, cite the release tag and commit.</p>
        <pre className="card p-4 text-xs overflow-auto mt-3"><code>{`OnCo contributors. OnCo: a public, cited map of oncology. Version <tag>, <date>. https://onco.cc (data CC BY-NC 4.0). https://github.com/judegomila/OnCo/releases/tag/<tag>`}</code></pre>

        <h2 id="mcp-cli" className="text-xl font-semibold mt-10 mb-2 scroll-mt-24">MCP and CLI</h2>
        <p className="text-[15px] leading-relaxed mb-3">The same files, two more ways in. <code>onco</code> is a command-line tool for terminals and shell pipelines; <code>onco-mcp</code> is a Model Context Protocol server that gives Claude, Cursor and other assistants the corpus as tools, with a citation on every fact. Both read <code>/api/v1/</code> directly (no key, no checkout), run on Node 20 or later, and end every output with the attribution line. <code>onco ask</code> and the MCP <code>ask</code> tool run the same pipeline as <Link className="underline" href="/ask/">Ask OnCo</Link>, so the three give the same cited answer.</p>
        <div className="card overflow-x-auto">
        <table className="onco">
          <thead><tr><th scope="col">Command or tool</th><th scope="col">What it does</th></tr></thead>
          <tbody>
            <tr><td><span className="font-mono text-sm">onco search &lt;query&gt; [--kind]</span></td><td>Word plus concept search, fused as the site does it; each hit says why it matched.</td></tr>
            <tr><td><span className="font-mono text-sm">onco get &lt;id|route&gt; [--json]</span></td><td>One record: TL;DR, summary, key fields, connected records, sources.</td></tr>
            <tr><td><span className="font-mono text-sm">onco list &lt;kind&gt; [--filter key=value]</span></td><td>Every record of a kind, filtered on any field.</td></tr>
            <tr><td><span className="font-mono text-sm">onco ask &quot;&lt;question&gt;&quot; [--region UK]</span></td><td>The cited, templated Ask OnCo answer.</td></tr>
            <tr><td><span className="font-mono text-sm">onco context &lt;id&gt;</span> · <span className="font-mono text-sm">onco kinds</span> · <span className="font-mono text-sm">onco export &lt;kind&gt; --csv|--json</span></td><td>Markdown context for a record, the kinds with counts, a kind as CSV or JSON.</td></tr>
            <tr><td><span className="font-mono text-sm">MCP tools</span></td><td><code>search</code>, <code>get_entity</code>, <code>list_kind</code>, <code>ask</code>, <code>context</code>, <code>compare</code>; resources <code>onco://kinds</code> and <code>onco://kinds/&#123;kind&#125;</code>; prompt <code>onco-brief</code> for a patient or clinician summary.</td></tr>
          </tbody>
        </table>
        </div>
        <pre className="card p-4 text-xs overflow-auto mt-3"><code>{`# CLI
npx onco search "HER2-low breast cancer" --kind drug
npx onco get trastuzumab-deruxtecan
npx onco ask "What are the side effects of Enhertu?" --region UK
npx onco export cancer --csv > cancers.csv
ONCO_API=./out/api/v1 npx onco kinds          # any copy of /api/v1, including a local build

# MCP: Claude Code
claude mcp add onco -- npx -y onco-mcp

# MCP: Claude Desktop or Cursor (claude_desktop_config.json, .cursor/mcp.json)
{ "mcpServers": { "onco": { "command": "npx", "args": ["-y", "onco-mcp"] } } }`}</code></pre>
        <p className="text-sm text-muted mt-3">Source and full references: <a className="underline" href="https://github.com/judegomila/OnCo/tree/main/packages/onco-cli" rel="noopener">packages/onco-cli</a> and <a className="underline" href="https://github.com/judegomila/OnCo/tree/main/packages/onco-mcp" rel="noopener">packages/onco-mcp</a> in the repository, and <a className="underline" href="https://github.com/judegomila/OnCo/blob/main/docs/ACCESS.md" rel="noopener">docs/ACCESS.md</a>. A larger MCP server with biomarker matching, calendar and live trial lookup runs from a checkout with <code>npm run mcp</code>.</p>

        <h2 className="text-xl font-semibold mt-10 mb-2">Schema</h2>
        <p className="text-[15px] leading-relaxed">Every entity shares base fields (<code>id, kind, name, aka, tldr, summary, status, asOf, wikipedia, links, tags</code>) and relationship arrays (<code>related, cancers, sections, technologies, targets, drugs, companies, institutions, pathways, terms, trials</code>) holding ids. Kind-specific fields are documented in <code>src/lib/schema.ts</code> in the repository, which is the source of truth and is enforced at build time; <a className="underline" href="/api/v1/schema.json">schema.json</a> is generated from it.</p>

        <h2 className="text-xl font-semibold mt-10 mb-2">Examples</h2>
        <pre className="card p-4 text-xs overflow-auto"><code>{`# one entity and its neighbouring products
curl -s https://onco.cc/api/v1/entities/trop2.json | jq '.entity.name, .neighbours.drug[].name'

# every approved product as CSV, in a spreadsheet or DuckDB
curl -sO https://onco.cc/api/v1/drugs.csv
duckdb -c "select name, modality, status from read_csv('drugs.csv', header=true, skip=1) where status='approved'"

# stream the whole corpus one record at a time
curl -s https://onco.cc/api/v1/all.ndjson | jq -c 'select(.kind=="trial") | {id, name, status}'`}</code></pre>
      </Container>
    </>
  );
}
