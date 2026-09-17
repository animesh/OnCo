# OnCo: time to win

**Live:** https://onco.cc

OnCo is a public, cited knowledge graph of oncology, aiming at total information dominance on cancer: every cancer, front, technology, target, treatment and test, company, institution, person, pathway, trial, key paper, journal, pairing, roadmap, bottleneck and idea, one page each, with a plain-English TL;DR before the technical layer and links in every direction. Readers start in a Global view and pick their country, so "approved" means their regulator's verdict. It exists so that a patient, a carer, a clinician, a scientist, an investor or a policymaker can walk from any object to everything connected to it and see the state of the art, the history, what is being done about each problem, and what is coming.

The website is one surface. The same corpus ships as:

- **the site** (https://onco.cc): tables with filters, tooltips on every technical term, molecule and target renderings, animated schematics, a graph explorer, Ask OnCo question answering, a living-with-cancer area (side effects, symptoms, second opinions, hair loss, complementary approaches graded by evidence), coverage of what insurers and the NHS pay for, and a completeness dashboard that states how much of the known world each kind covers;
- **a static JSON API** under https://onco.cc/api/v1/ with CORS, per-entity Markdown context files for language models, Atom feeds and RDF triples;
- **an MCP server and a command-line tool** (`packages/`), so agents and scripts can search, fetch, compare and ask over the corpus;
- **browser WebMCP tools** for read-only record search and lookup in supporting browsers ([implementation and testing](docs/webmcp.md));
- **eight interface languages** with translated TL;DRs where a translation exists.

> **Work in progress. Verify at source.** Every fact is being built and checked in the open and may be incomplete, out of date or wrong. Nothing here is medical advice. Do your own research and check anything that matters at its primary source, which every page links.

Current counts live at https://onco.cc/about/ and print from `npm run validate`. This file deliberately carries no numbers, so it never goes stale.

## How the site is organised

| Area | What it holds |
|---|---|
| **Start here** | Explore (ranked, filterable view of everything for a cancer), For me (pick your cancer type), Navigator, Tumour board, Compare, Landscape grid, Timeline, Query builder, Graph explorer, Body map |
| **Cancers & treatments** | One page per cancer type, front, technology, target, treatment or test, trial, pairing, pathway, roadmap, key paper and glossary term; the Mechanics of cancer atlas; the Resistance atlas |
| **News & evidence** | Evidence ranking, readout calendar, congress digests, research pulse, what the world is publishing, approvals by region, failures, payloads and linkers, toxicity, isotopes, key papers, journals, annual report, changelog, audit and corrections |
| **Who's who** | Institutions, universities, trial leadership, companies, countries and country deep dives, cases by country, funding, people with portraits, heroes and heroines |
| **Living with cancer** | Preparing for appointments, side effects and symptoms, report reader, second opinions, diet and lifestyle, hair loss, complementary and supportive approaches with evidence grades, survivorship |
| **Learn & contribute** | Reading paths, About and methodology, Roadmap (what we are building), Completeness (how much of the known world we cover), Gaps, Bottlenecks of the war on cancer, Ideas, Suggest an edit, Evaluation, Open API, MCP and CLI |

Every treatment with a small-molecule structure shows the exact molecule as a slowly rotating wireframe; antibodies, cells, vaccines, devices and tests show an explained placeholder. Fronts, technologies, cancers, targets and glossary categories carry hand-drawn animated schematics. Readers pick their country in the header, and "approved" then means their regulator's verdict, with other regions shown as flags.

## Repository layout

```
src/data/            The corpus: TypeScript records, one array per kind or theme
  index.ts           ALL_INPUTS: every array that becomes part of the graph
  cancers.ts, drugs.ts, targets.ts, technologies.ts, companies.ts, institutions.ts, ...
  spikes/            Per-cancer deep dives merged into the cancer records at load time
  people/, key-papers/, ideas-waves/, institutions/   Multi-file kinds, each with an index
  regional-approvals.ts, payloads.ts, resistance.ts, biomarkers.ts, ...   Structured side data
src/lib/schema.ts    Zod schemas for every kind, KIND_META (routes, labels), REL_FIELDS
src/lib/graph.ts     Builds the graph: validates ids, resolves references, derives backlinks
src/lib/nav.ts       Navigation groups and every top-level route
src/app/             Next.js App Router pages; src/app/[kind]/ renders every index, src/components/EntityDetail.tsx every object page
src/components/      UI: EntityBrowser (the shared filterable table), Wireframe3D and schematics, Tip (tooltips), icons, maps
scripts/             Fetchers and checks: structures (PubChem/RCSB), logos, OpenAlex, GLOBOCAN, trials, papers, factcheck, audit, provenance, API build
public/              Self-hosted structures, logos, portraits, snapshots, the static JSON API under /api/v1/
packages/            onco (CLI) and onco-mcp (Model Context Protocol server) over the API
docs/                GAPS.md (what is still missing) and design notes
```

### Adding or fixing a record

1. Find the kind's file under `src/data/` (or the right sub-file for multi-file kinds) and add or edit the record. Every record needs an `id`, `name`, `tldr` (plain English, one or two sentences), `summary`, `asOf`, and at least one primary `links` entry.
2. Reference other objects by id in the relationship fields (`cancers`, `drugs`, `targets`, `technologies`, `trials`, `terms`, `people`, `bottlenecks`, `keyPapers`, `related`, and so on). Backlinks are derived, so link in one direction only.
3. Run `npm run validate`. It rejects duplicate ids, dangling references and malformed records, and prints the counts per kind.
4. Run `npm run typecheck && npm run lint && npm test && npm run build`.
5. Open an issue first (the site's forms prefill it); pull requests that change data reference the triaged issue, so every change passes the same safety check.

New kinds need: a schema in `src/lib/schema.ts` (plus `KIND_META`, and the rel field in `Base` and `REL_FIELDS` if objects can point at it), a data file spread into `ALL_INPUTS`, a `case` in `buildBrowser` (`src/app/[kind]/page.tsx`) for the index table, a `case` in `kindTabs` (`src/components/EntityDetail.tsx`) for the page, a colour in `src/lib/text.ts` and `GraphExplorer`, and a nav entry.

### Scripts

| Command | Purpose |
|---|---|
| `npm run validate` | Parse the corpus, check ids and references, print counts |
| `npm run dev` / `npm run build` | Develop / build the static site into `out/` |
| `npm run fetch:structures` | Pull molecule structures from PubChem and RCSB for `src/data/structures.ts` |
| `npm run fetch:logos` | Self-host institution and company logos (Wikidata or favicon) |
| `npm run fetch:openalex`, `fetch:countries`, `fetch:globocan`, `fetch:trials`, `fetch:papers` | Refresh research output, country rankings, incidence, trial registry and literature snapshots |
| `npm run factcheck`, `npm run audit`, `npm run provenance` | Cross-check against openFDA and ClinicalTrials.gov, find stale or contradictory facts, map records to commits |
| `npm run build:api` | Emit the static JSON API |

GitHub Actions run the checks on every push and open weekly pull requests with refreshed snapshots.

## Principles

- **One page per object, links everywhere.** If it can be a page, it is a page.
- **Plain English first.** Every object opens with a TL;DR a newcomer understands; the technical layer follows. Technical terms are glossary objects and get hover explanations wherever they appear.
- **Cited, dated, honest about gaps.** Every record links a primary source, carries the date it was last checked, and says "no data" rather than guessing.
- **Nothing stale by design.** Counts and dates are computed at build time from the corpus, never written into copy.
- **Open for good.** Code is MIT. Data is copyright OnCo, free for individual and educational use under CC BY-NC 4.0 with attribution; commercial use must contact us to pay for the data (see `LICENSE-DATA`). Logos remain their owners' trademarks.

## Changelog

What changed, release by release, is in [CHANGELOG.md](CHANGELOG.md) and rendered live at [onco.cc/changelog](https://onco.cc/changelog/). The Unreleased section is regenerated from the commit log every time the site ships (`npm run changelog`, also run by `npm run build`), so it is never behind the live site. Version sections are written by hand when a release is cut.

## Cite and reuse

- **Cite:** `CITATION.cff` holds the citation for the software and, under `preferred-citation`, for the corpus as a dataset; GitHub's "Cite this repository" button reads it. Each tagged release attaches the corpus (JSON, NDJSON, CSV, JSON Schema, OpenAPI, Markdown context files) at https://github.com/judegomila/OnCo/releases, and Zenodo archives releases with a DOI once the repository is linked there; the DOI goes into `CITATION.cff` when issued.
- **Reuse:** data under CC BY-NC 4.0 (`LICENSE-DATA`): free for individual and educational use with the attribution line "Data from OnCo (onco.cc)" and a link to https://onco.cc; commercial use must contact us to pay for the data (issue labelled "licensing", or the contact on https://onco.cc/about/). Code under MIT (`LICENSE`). Every export, API file and CLI result carries the same attribution line.
- **Machine access:** https://onco.cc/api/ (endpoint list), https://onco.cc/api/v1/openapi.json (OpenAPI 3.1), https://onco.cc/llms.txt and https://onco.cc/llms-full.txt (for language models), `npx onco` and `npx -y onco-mcp` (`docs/ACCESS.md`). Distribution plan and press kit: `docs/DISTRIBUTION.md`, `docs/press-kit.md`.

## Contributing and safety

See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` and `SECURITY.md`. No personal or patient data belongs in this repository; only public knowledge about the science, the products and the organisations.

Data and structures from PubChem, RCSB PDB, Wikimedia Commons and Wikidata, OpenAlex, GLOBOCAN (IARC), ClinicalTrials.gov, Europe PMC, openFDA and the publishers and institutions linked on each page.
