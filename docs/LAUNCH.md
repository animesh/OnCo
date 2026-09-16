# Launch checklist (owner away 10 to 15 September 2026)

The owner returns in five days and expects the site ready to launch and maximised. Every improvement tick
(30-minute cron) should pick the next unchecked item, ship it through the gated chain, and tick it here.

## Ship chain (never skip)
validate → typecheck → lint → test → `rm -rf out && npm run build` (gate on exit code and `out/index.html`,
`out/coverage/us/index.html`) → commit → `git push origin HEAD` → `vercel deploy --prod --yes --archive=tgz`.
Merge finished worktree agents before the chain; never `cd` into a worktree; never `vercel link`.

## Owner asks in flight (agents)
- [x] Accurate 3D molecules (ball and stick) and protein ribbons (Molecule3D): merged 10 Sept, deploying
- [x] Complementary approaches with evidence grades; hair-loss page under Living with cancer: merged 10 Sept
- [x] Whole-site language switch (chrome dictionary, 8 languages, RTL for Arabic): merged 10 Sept; new nav items need entries in src/lib/i18n/nav/*.ts or the i18n test fails
- [x] Graph explorer redesign (SVG, kind icons, side panel): merged 10 Sept
- [x] MCP server and CLI (packages/onco-cli, packages/onco-mcp), /api/ section, docs/ACCESS.md: live 10 Sept; owner publishes to npm (name clash with mcp/package.json "onco-mcp" to resolve)
- [x] Homepage front schematics quality (renderer depth cues, mesh rework): merged 10 Sept
- [x] Completeness denominators per kind (/completeness/, roadmap panel, fetch:universe): merged 10 Sept, 28 denominators, headline 841 of 2,578 listed items
- [x] India deep dive (institutions, companies, CDSCO region, trials, people, /countries/in/): merged 10 Sept
- [x] China deep dive (/countries/cn/, 20 drugs, 20 companies, 18 trials, 17 people): merged 10 Sept
- [ ] Glossary Wikipedia links and aliases; schematics wave 3; KOL people; research leaders batches; summaries chunks; portraits (wired and live 10 Sept, 77 photos)

## Owner asks not yet started
- [ ] Google Search Console verification (needs the owner's TXT token; IndexNow key is live but the host verification was still pending on 10 Sept, retry `api.indexnow.org` each tick)
- [ ] www.onco.cc: confirm the domain is attached in Vercel so the redirect in vercel.json applies (curl returned 200 on 10 Sept, not 308)
- [ ] Complete coverage: NCI-designated centres and 93 global centres (merged 10 Sept); paediatric and rare cancers (merged 10 Sept, NCI list 100%); screening and diagnostic tests (merged 10 Sept, 72 tests); EU and Japan approvals for every approved drug (merged 10 Sept, gauge clears)
- [ ] Time estimate and speed-up plan written for the owner (docs/LAUNCH.md bottom)
- [ ] Repo housekeeping the owner must do: GitHub Discussions "Objects" category; delete stray Vercel project agent-aa17c7ae82bcaf068

## Standing rules (see memory)
Plain English first, UK spelling, no em-dashes in copy, no "as of", no invented numbers, corrections via issue form only,
light theme default, pink accent, no red buttons, never "spike", survival figures behind a click, solution and mechanism first,
every problem paired with what is being done, Global region default, icons everywhere, tooltips on technical terms,
data licence CC BY-NC 4.0 with commercial licences (attribution "Data from OnCo (onco.cc)").

## Time estimate and how to go faster (written 10 September 2026)

What "finished" means here: every owner ask above shipped, and the completeness dashboard showing near 100% on the
defined lists (NCI cancer types, NCI-designated centres, FDA and EMA approved oncology drugs, top journals) with
people, approvals, schematics, summaries and plain-language text on every record.

Rough sizes, at the pace of the last two days (about 8 to 12 agents finishing per day, each landing 50 to 400 records
or one feature):
- Owner feature asks in flight (3D rendering, language, graph, MCP/CLI, complementary care, completeness, India, China): 1 to 2 days.
- Coverage to the defined denominators (cancer types, centres, tests, approvals, people per institution): 2 to 3 days.
- Quality gauges to zero (summaries, simple layer, translations, schematics, term Wikipedia, target prevalence): 2 to 4 days, in parallel.
- Google indexing: hours once the owner pastes the Search Console TXT token; IndexNow is live and retried each tick.

So the five-day window is enough for the asks and for the defined lists, if the machine stays under a load of about
15 and agents are told to commit early and run one test pass at the end.

Speed-ups that work:
1. Fan out by list, not by topic: give each agent a fixed list of ids to fill (for example 40 institutions) so none re-scan the corpus.
2. Merge every 30 minutes and run one build per merge round rather than one per agent; the build is the bottleneck (about 8 minutes).
3. Keep agents off shared files (schema.ts, nav.ts, EntityDetail.tsx); data-only agents almost never conflict.
4. Resume stalled agents with "commit what you have; single test pass at the end" instead of restarting.
5. Let the fetchers do the bulk work (EMA, PMDA, ClinicalTrials.gov, OpenAlex, Wikidata) and use agents for judgement, wording and sourcing.
6. The remaining owner-only items (Search Console token, Vercel stray project, Discussions category) each take under five minutes.

## The plan the owner endorsed on 10 September ("make sure we see this through")

Tier 1, features in flight: flags and icons in filters, submenu icons, breadcrumbs, target thumbnails, CI fix,
licence (done); graph explorer, homepage schematics, ball-and-stick molecules and protein ribbons (today to
tomorrow); whole-site language, MCP and CLI, complementary and hair-loss area, completeness dashboard (tomorrow);
India and China deep dives (1 to 2 days). Then a day of review and polish.

Tier 2, completeness against known lists: 72 NCI centres with directors; every FDA and EMA approved oncology drug
(merged 10 Sept: NCI list fully matched, 91 records added); every institution with at least one person; summaries, plain-language
sentences, glossary Wikipedia links and schematics to 100%; regional approvals for every approved drug across
US, EU, UK, Japan, China, India. Target: every defined list at 90%+ and most at 100% by 15 September.

Tier 3, open-ended: trial outcomes for every trial, portraits for every person, body-text translations, every paper
that matters; continues on weekly workflows and the 30-minute ticks. The completeness page shows where each stands.

Speed levers in use: bulk ingestion from open sources with schema mapping, enriched afterwards by summary agents;
merge rounds every 30 minutes with one build per round; agents kept off shared files. Waiting on the owner: Search
Console token, licensing contact email, stray Vercel project, Discussions category.

Caveats already stated to the owner: a launch review after this much parallel change will find things to fix (plan a
day); earlier CC BY 4.0 releases cannot be relicensed, CC BY-NC applies from this version onward.

## Snapshots refreshed 10 Sept
Logos 882 entries (166 new), trial snapshots for all 530 products (17 changes), paper snapshots for 1,140 entities. Weekly workflows keep these current.

## Graph health after 10 Sept linking pass
Orphans 84 (from 2,185), records without a source 415 (from 2,974), backlink gaps 355 (from 595). Remaining orphans are regional hospitals, news-outlet collections and five journals.

## Gauges after the 10 Sept evening round
- Plain-language sentences 5,519 of 6,303 (88%); translations gauge clear: every record has a TL;DR in all eight languages after seven waves; people with papers 946 of 1,152; institutions with at least one person 552 of 557 (the five left are documented as unsourceable); technology schematics 411 of 411 specific after eight waves; trial outcomes: 5 more filled, 33 left are genuinely unreported; glossary terms 80 without Wikipedia, 61 documented as having no certain source; molecules gauge clear (409 of 530 products have a structure, the rest are explained placeholders: cells, vaccines, tests, devices); roadmaps 29 (every front covered plus paediatric, global access, trial modernisation); MEDLINE oncology journals 223 of 223 and KEGG cancer maps 28 of 28 (completeness scopes at 100%); short summaries down from 1,589 to 475 (institutions, companies, trials and people all clear; terms, pairings, ideas, collections and a few journals remain, agent running); kind-size gauge 17 of 18, the last is fronts at 19, a deliberate taxonomy not to be padded; regional approvals gauge clear; NCI cancer types and NCI drug list 100% matched.
- Still open for the owner's return: reviewed pages 0 (needs named reviewers), Google Search Console token, npm publish of the CLI and MCP packages, deleting the stray Vercel project, Discussions category.

## Gauges at the close of 10 Sept (corpus 6,689 entities)
sources 6,297; backlinks 5,975 of 6,670; orphans 7 of 6,670 after the second linking pass (all seven are news-source collections nothing in the corpus cites); backlink gaps 539, mostly leaders whose only relation is their institution; summary gauge clear: every record has a summary of 300 characters or more; schematics gauge clear: 411 of 411 technologies have a specific animated schematic after eight waves; target prevalence 91 of 99 (the eight left carry notes explaining why no positivity rate exists); trial outcomes 418 of 451 (the 33 left are unreported); people with papers 1,045 of 1,309 (the 264 left are patients, advocates, donors, administrators and regulators, or names too common to match with certainty); term Wikipedia 525 of 605 (rest documented); translations complete (6,651 of 6,651); provenance 6,258 (weekly job); logos 882 of 1,347 (fetch rerunning); reviewed 0 (needs named humans); kind-size 17 of 18 (fronts kept at 19 on purpose).

## Round of 11 Sept (afternoon): research, coverage, quality, distribution
- [x] Glossary: /terms/ titled Glossary, clickable category cards with their animations, category schematic beside each term (chain running)
- [x] Institution research from OpenAlex: fetcher, Research output panel, /universities/ five-year works and citation columns, weekly workflow. Live with 163 institutions (29 on 11 Sept, 27 on 12 Sept, 23 on 13 Sept, 84 on 14 Sept); the free allowance varies by day (about 100 to 500 credits), so one `npm run fetch:research` a day after the UTC reset adds the next batch, or one run finishes the remaining 377 if the owner adds an OPENALEX_API_KEY repo secret
- [x] Structures for the pipeline wave: 74 PubChem and 1 PDB entries, modality strings made explicit on 75 records; molecules gauge 811 of 823, the 12 left have no stated form anywhere. Trial, paper, logo and provenance snapshots refreshed for the wave. Trial-outcomes gauge now counts only trials that have reported.
- [x] Onboarding of the pipeline wave: 1,308 relations (orphans 146 to 3), 624 plain-language sentences, eight-language TL;DRs for every record (translations gauge 100% at 7,275). Merged 11 Sept.
- [x] Coverage: 87 industry sponsors, 293 investigational products (192 phase 3) and 243 phase 3 trials from ClinicalTrials.gov, every fact re-verified against its evidence URL; sponsor completeness scope 208 to 290 of 936 (merged 11 Sept, deploying). Left out: 101 sponsors with no confirmable website or headquarters, 64 products already approved or non-oncology
- [x] Quality pass merged 11 Sept: 469 drugs and 423 trials fact-checked; 67 registry corrections (statuses, phases, enrolments), 3 wrong NCT ids fixed, drug approvals corrected (iberdomide, nintedanib, daraxonrasib, earlier US and EU years), tazemetostat and magrolimab withdrawals reflected, 16 duplicate molecule copies turned into supplements, about 240 link repairs (7 DOIs re-identified, 46 missing Wikipedia titles removed, 33 archived copies, 101 dead links removed where another source exists); audit, factcheck and links reports regenerated for /audit/. CORRECTIONS.md lists every change.
- [ ] Two bot pull requests are open for your review, opened by the weekly workflows: #1 "Bot proposals: record patches drafted from the feeds" (the human gate for feed-drafted changes; read the diff before merging) and #2 "Weekly refresh: automated pulse, congress abstracts, key-paper citations" (snapshot refresh; low risk). The proposals PR's CI run needed maintainer approval and has been approved so its checks run.
- [ ] Owner review from the quality pass (both values in public/factcheck-patches.json): trials recorded positive while the registry still says recruiting (ALKOVE-1, AUGMENT-101, FIREFLY-1, LINKER-MM1, MonumenTAL-1, NICHE-2, SOHO-01, HARMONi-3, HR-NBL1, TOWER); combined trial records where one NCT cannot speak for both (MOUNTAINEER, AlphaBreak/AcTION, CAMBRIA, KEYNOTE-024/189, SOFT/TEXT, HERA/B-31/N9831, PALLAS/PENELOPE-B, RADIANT, ROMANA, SANET, GOG-0218/ICON7, PREOPANC); 69 enrolments more than 10 percent from the registry; five approved products whose pivotal trial is not in the corpus; the dabrafenib plus trametinib EU combination year; eight institution websites unreachable by DNS
- [x] Distribution: docs/DISTRIBUTION.md (eight channels, ten organisations, 30-day calendar, metrics), docs/press-kit.md, docs/launch-copy.md, docs/dataset-card.md, CITATION.cff, .zenodo.json fixed to CC BY-NC, release-dataset.yml, public/api/v1/openapi.json generated in build:api, llms.txt and llms-full.txt, MCP registry manifest. Merged 11 Sept.
- [ ] Owner's first week from the plan: (1) Search Console DNS TXT and sitemap, Bing Webmaster import; (2) resolve the onco-mcp npm name clash then publish onco and onco-mcp and the MCP registry entry; (3) link the repo on Zenodo, tag v0.5.0, paste the DOI into CITATION.cff and README; (4) set the newsletter signup endpoint; (5) Show HN, LinkedIn, press kit to five reporters, first notes to Macmillan and Cancer Research UK
- [x] TL;DR quality: 512 TL;DRs and 239 summary openings rewritten with the concrete fact (live 11 Sept); the only remaining matches are proper nouns and official classifications

## Owner decisions on 11 Sept
- Ask OnCo is hidden from the top bar, command palette and mobile quick actions and its page is noindex; it stays reachable by direct link and behind the API, CLI and MCP `ask` tool until it answers better than a general AI assistant.
- Heroes: ordinary people first. Celebrities (Jolie, Boseman, Radner, Goody, Betty Ford, Couric, Armstrong, Hoy, Jobs, Valvano, Ted Williams, Winchell, Lansing) keep their person pages but are tagged public-figure, not hero. Order: patients and families, pioneers, advocates and builders, donors last. Sid Sijbrandij (GitLab, osteosarcoma) added as the model of the people the section is for.
- Section titles must be functional noun phrases: "Anatomy and lymph node drainage", "Cases by country", "At a glance", "Trials recruiting now", "Lab models that fail to predict what happens in patients". A site-wide title review agent is finishing the rest.
- Homepage no longer links "Whole corpus as JSON"; the API stays under Open data.
- Site-wide title review merged: 175 functional titles across pages, navigation and components; the organ section is "Anatomy and lymph node drainage".
- Licence wording set to the owner's phrasing: "free for individual and educational use with attribution; commercial use must contact us to pay for the data", with © 2026 OnCo and a commercial-licence link in the footer in nine languages, and the same in LICENSE-DATA, About, README, exports and the CLI.
- Footer credit "Made by Jude Gomila" linking to judegomila.com.
- SEO: every page now carries an explicit Open Graph and Twitter image; drug page titles say Treatment, not Product. Still owner-only: Google Search Console verification.
- Portraits: 180 people now have a Commons photo (from 77); 1,123 have no free image on Wikidata.
- Drug coverage: NCI A to Z list fully matched (the 60 dashboard misses are regimen acronyms and co-packs, deliberately not separate records). Startups: complete only for Y Combinator (62 of 105 hits included); the rest is a curated 187 with no public denominator.

## State at hand-back (11 Sept, early)
Corpus 6,651 entities. Health gauges: 16 of 25 met. Every record has a summary of 300+ characters, a TL;DR in eight languages, and (for technologies) its own animated schematic; every product has a structure or an explained placeholder; regional approvals, orphans and the NCI, MEDLINE and KEGG completeness lists are clear.
The nine unmet gauges and why each stops where it does:
- sources 6,275 of 6,651: the 376 left (ideas, pairings, some technologies and terms) have no website, Wikipedia or profile field and no certain primary link.
- backlinks 6,111 of 6,632: 521 weakly linked records, mostly institution leaders whose only relation is their institution; nothing in their own data names a trial or cancer to link.
- target prevalence 91 of 99: the eight left carry a note explaining why no positivity rate exists in the literature.
- trial outcomes 418 of 451: the 33 left are recruiting or unreported, checked against ClinicalTrials.gov and sponsor releases.
- people with papers 1,038 of 1,302: the rest are patients, advocates, donors, administrators, regulators, or names too common to match with certainty.
- term Wikipedia 514 of 594: the 80 left have no English article (checked title by title); 22 carry NCI Dictionary or defining-paper links instead.
- kind-size 17 of 18: fronts stay at 19 by design.
- logos 1,153 of 1,327: 174 have no Wikidata image or favicon.
- reviewed 0: needs named human reviewers.
Waiting on the owner: Google Search Console TXT token, npm publish of the CLI and MCP packages, the stray Vercel project, the Discussions category, reviewers, the `spikes/` directory name and `spike` tag, the corrections page link, the ALSF/St Baldrick's/MRA/PCF/BCRF/Macmillan collection-versus-institution pairs.

## State at hand-back (13 Sept)

Everything below shipped through the gated chain and is live; each item was verified on the live page after deploy.

- Gauges: sources 7,264 of 7,277 (met; the 13 left are concept pairings, two speculative roadmaps and abstract-only ideas), Wikipedia on glossary terms 566 of 594 (met), translations and plain text 100%, backlinks 6,740 of 7,258 (the rest are leaders with only an institution relation), logos 1,202 of 1,413 (honest figure after removing 24 wrong images), target prevalence 91 of 99 (the eight are enzymes and immune-cell antigens with no cancer prevalence to state).
- Corpus audit (`npm run audit`, live at /audit/): 828 findings, down from 977 in the morning. Numeric outcome rows without a source fell from 107 trials to 11 (every trial with a published primary paper now cites it, DOI checked against Crossref; the 11 left have only congress abstracts). EU approval rows mirrored into 48 drug records from the EPAR-checked regional table. Three China-approved drugs (camrelizumab plus rivoceranib, ivonescimab, sacituzumab tirumotecan) now carry status approved like the other 26 China-only approvals. Duplicate Kheiron company records merged with a redirect from the old page.
- New records: NETTER-1, LUMINOSITY and NAVIGATE added as the pivotal trials behind Lutathera, telisotuzumab vedotin and larotrectinib (registry plus primary publication, structured outcomes).
- Sources added by hand, each URL or DOI verified before insertion: 18 fronts (NCI and FDA pages), 11 roadmaps (landmark papers), about 120 technologies, 85 pairings, 96 ideas and 60 glossary terms (guidelines, landmark papers, FDA guidance, NCI dictionary).
- Logo incident: the Wikidata matcher took archived, SEC, Y Combinator and bioRxiv URLs as an organisation's own domain and shipped the wrong logo on 24 pages (Wayback Machine, SEC, YC and bioRxiv images). All removed; `scripts/fetch-logos.ts` now ignores those hosts (`NOT_OWN_HOST`), and every future asset fetch should be checksum-audited before shipping (see memory).
- Website field is optional for companies and institutions. Seven private biotechs no longer show an SEC filings page as their website (listed as a source instead); Wayback snapshots are labelled "Archived website" with the original address; Y Combinator profile pages are labelled as such. All labels in nine languages.
- Institution research: 365 institutions have OpenAlex snapshots. The free key now stops after roughly 100 credits a day, so one `npm run fetch:research` per day after the UTC reset adds about 20; an OPENALEX_API_KEY secret would finish the remaining 472 in one run.
- Vercel: the CLI reported "Not authorized" or a dropped API request on four deploys today after the build passed; each time a redeploy of the same tree aliased, or the first upload had in fact completed. Check the live page before assuming a failed deploy.

Owner decisions still open from today's audit: dordaviprone and sonrotoclax carry status approved with only confirmatory trials running (accelerated approvals; fine if intended); 117 drugs have an EU approval year and EPAR link in the regional table but no EU indication text, so they cannot be mirrored into the approvals panel until someone writes the indication; the glossary has both "Tumour marker" (basics) and "Tumour markers" (specific markers), kept as two pages; combined trial records (RADIANT-3/4, SARAH/SIRveNIB, HERA/B-31/N9831, SANET-ep/p) now cite per row and could be split into one record per trial.

## State at hand-back (14 Sept)

Everything below shipped through the gated chain in half-hourly ticks and was verified on the live page after each deploy.

- Backlinks gauge met: 525 records with fewer than three relations were linked from their own text (drugs and cancers named in company summaries, societies and sibling titles for journals, glossary terms and colleagues for leaders, technology classes for pipeline drugs). Every relation was taken from the record's own summary or an id check against the graph; nothing was inferred from outside knowledge.
- Top-cited papers: the OpenAlex top-100 completeness list went from 9 to 85 of 100 with 76 new key-paper records (GLOBOCAN 2002 to 2022, US Cancer statistics 2012 to 2024, CONCORD-3, GBD 2015, Slamon 1987/1989/2001, Hurwitz 2004, KEYNOTE-001/006/010/024, CheckMate 017/057, ToGA, FOLFIRINOX, MPACT, Burris 1997, RECIST, QLQ-C30, FACT-G, the checkpoint, inflammation, EMT, p53, RTK, JAK-STAT and cancer stem cell reviews, Galon 2006, Thorsson 2018, TIMER and TIMER2.0, organoids, Veber's rules). Each DOI, title, journal, year and author list was checked against Crossref before writing; survival figures sit in the findings lists, never in TL;DRs. The 15 left are book series, a manual whose DOI does not resolve on Crossref, and citation artefacts (a copper chemistry paper, a COVID-19 study).
- UK coverage: the four rows that said "TA number not verified" now carry appraisal numbers and dates read from the NICE guidance pages (tebentafusp TA1027, Pluvicto TA930, belantamab TA1149 and TA1133, vorasidenib TA1147); three old notes had the wrong year. Gliolan is covered by guideline NG99, not an appraisal.
- Copy: no en or em dashes remain in reader-facing prose (nine institutional names on people pages and the annual report list were rewritten); the ones left in data files are Wikipedia slugs, alias lists, comments and verbatim paper titles.
- Targets: sourced prevalence rows for RARA (PML::RARA in APL, de Thé 2010) and SLAMF7 (Hsi 2008). The 33 targets still without a row are enzymes, receptors and drug targets with no positivity rate; the gauge is at its ceiling.
- Logos: a full fetch run resolved one record (Roswell Park favicon). Wikidata holds no logo image for any of the 30 most-linked records still missing one (Tata Memorial, Hengrui, UCSF Helen Diller, NCC Japan, NRG, Innovent, ESTRO, JCOG and others); those need owner-supplied files or a licensed source.
- People with papers: 265 people still lack entries. OpenAlex author search is rate-limited on the free key (HTTP 429 after the daily research fetch) and Crossref author search is too noisy to trust; every author of the new key papers already had entries. This gauge needs an OPENALEX_API_KEY or hand curation.

### Later on 14 Sept (continuous run at the owner's request)

- Interface: colour-coded pills with glyphs on every index table (maturity, who acts, cost, company and institution type, target class, cancer group, paper type, stage); molecule gallery cards link to product pages; "See it in action" on every product with a structure (drug docking into its target from the solved complex, class schematic, numbered steps); chemistry panel on any wireframe click (formula, weight, atoms, rings, source); star badge links to the repository; schematic thumbnails no longer draw the cycling phase caption.
- Accounts: magic-link sign-in that syncs the watchlist across devices via Supabase REST, off until the two keys are set (section above).
- Data: OECI centres 113 to 165 of 193 and representatives 54 to 103 of 186 (names from the OECI list, titles not yet verified); phase 3 industry sponsors 338 to 376 of 936 (26 companies plus acquisition aliases); 15 classic regimens (CHOP, CVP, ICE, DA-EPOCH-R, hyper-CVAD, escalated BEACOPP, MOPP, FEC, CMF, TAC, VIP, VeIP, XELIRI, GEMOX, LV5FU2); targets ADA and PGR with cross-references; pentostatin.
- Tests: the wave 8 schematic test now has a 180 second budget after timing out at 60 seconds under load.
- Later still: umbrella cancer pages for non-Hodgkin lymphoma, skin cancer, brain and spinal cord tumours and childhood cancers (the NCI A to Z gaps; only "Metastatic cancer" and "Extragonadal germ cell tumour" remain), so a reader told only "lymphoma" or "skin cancer" lands on a map of the subtypes; industry sponsors 338 to 418 of 936 across five batches (every company record cites its official site and its ClinicalTrials.gov sponsor search; acquired sponsors became aliases on the acquirer); OECI centres now list their representatives and same-country peers, which restored the backlinks gauge after the new records dipped it.
- Navigation and cross-linking (owner asks, 14 Sept night): the pathway-to-drug matrix links every pathway, count, node, phase and legend chip to its page or to the treatments table filtered by target and status (the table reads ?targets=Name&status=phase-3 style deep links, any-of per key); the header search trigger is icon-only; 106 route glyphs in the shared monoline grammar now give every section an icon on landing cards and menus; a "More in this section" strip at the foot of every navigation page cross-links its siblings, so all 130-odd tool pages reach each other without hand-written lists. Entity pages keep their own related-pages blocks.
- 15 Sept, after midnight UTC: the first full-allowance OpenAlex run added 98 institution research panels (256 live; 30 mis-attributed matches removed and skipped, see the research-attribution memory pattern in the fetcher's SKIP set); eight more classic regimens (ADE, CAF, OFF, VAC, JEB, PAD, Stanford V, ABVE-PC) took the NCI drug list to 363 of 382; Partner Therapeutics and pharma& completed the FDA oncology applicants list (78 of 78); the NCI cancer types list is complete (128 of 128) with four umbrella pages and two explainer pages.
- Worth a look: the OECI representatives carry the role "Representative ... to the Organisation of European Cancer Institutes" taken from the OECI list; their actual titles (director, CEO, head of oncology) were not verified and several are well-known figures (for example the Christie's Rob Bristow) whose records deserve a proper biography.

### 15 Sept (day, 30-minute ticks)

- Regimens and drugs: eight more NCI-listed regimens (AC, BuMel, CEM, OEPA with OPPA, COPDAC with COPP, PCV, VAMP, CEV) each tied to a Crossref-verified primary trial, plus leucovorin, nogapendekin alfa inbakicept (Anktiva), capmatinib and tepotinib; NCI A to Z list 373 of 382, the rest supportive-care drugs and two combinations without a primary dose source.
- Targets: sourced alteration rates for XPO1 (Hodgkin lymphoma), MEK (Langerhans cell histiocytosis), TOP2A (HER2-positive breast), CSF3R (chronic neutrophilic leukaemia) and ERBB4 (melanoma); prevalence gauge 100 of 130, the rest enzymes and hormone receptors where a rate is not meaningful.
- NICE: every cancer technology appraisal from TA800 to TA1191 (2022 to September 2026) is now a row or a dated, verdict-bearing note in src/data/coverage-uk.ts, read from the guidance PDFs (the chapter pages are script-rendered; the PDF link on each overview page plus pdftotext works). Dostarlimab moved from the Cancer Drugs Fund to routine funding (TA1189); tarlatamab, cabozantinib for thyroid cancer, trastuzumab deruxtecan for HER2-low breast cancer and axicabtagene for follicular lymphoma carry their rejections; terminated appraisals are recorded as such. Notes render on the product page, not in the coverage table.
- Institutions: the 19 missing NHS England Cancer Alliances (list 20 of 20, each linked to the corpus hospitals in its footprint and to its neighbours); OECI members 165 to 188 of 193 with Wikidata or own-site sourcing (FICAN, Blokhin, Turkey's institute, the Croatian coalition and the Swedish network still lack a verifiable city); OECI representatives 103 to 165 of 186, every one linked both ways with its centre. The institution ranking no longer counts links from other institutions for networks and government bodies, after the OECI itself briefly outranked Memorial Sloan Kettering.
- Research panels: 266 institutions (ten added today after removing five charity and foundation matches); the free OpenAlex allowance was 100 credits, so about ten a day; 251 not yet attempted.
- Logos: 1315 of 1571 after two fetch rounds; generic NHS lozenges, platform default icons and anything under 24 pixels are rejected and listed in NO_LOGO_IDS, and the favicon path now refuses tiny PNGs.
- Deploy note: the Vercel CLI once printed "deploy_failed: Not authorized" mid-build while the remote build carried on and aliased six minutes later. Inspect the deployment URL from the log before redeploying.
- Evening of 15 Sept: OECI members 190 of 193 (the Croatian coalition KUZ, the Swedish Network Against Cancer and the Türkiye Cancer Institute remain: no source states a seat) and representatives 182 of 186, every one linked both ways; fifteen ChEMBL approved-drug targets with HGNC cross-references (145 of 181); phase 3 sponsors 443 of 936 with head offices verified on Wikidata or company sites; the NHS coverage table shows how many further appraisals each product carries; 38 under-linked sponsors point at the pivotal-trial term so the backlinks gauge holds. Four Madrid hospitals had been counted present through a shared regional web host; they now have real pages. Wikipedia REST summaries (native language) work as a location source where Wikidata search fails.
- Late 15 Sept: the owner asked for technology coverage against Prometheus (prometheus-umber.vercel.app, the owner's skill-tree site). Of its 423 oncology technology nodes, 46 areas were missing and now have records in src/data/technologies.ts (457 technologies): spatial biology platforms, AI pathology and screening, liquid-biopsy subtypes, TIGIT/LAG-3/TIM-3/CD47/CD40, NK engagers, trispecifics, dendritic and bacterial vaccines, gamma-delta and NK cell therapy, virus-specific T cells, Lu-177 and At-211 therapy, dosimetry, twelve targeted-drug classes and four model types. New technologies must be added to SCHEMATIC_ALIAS in src/data/schematics.ts (they borrow the closest animated drawing) or the wave 8 schematic test fails. Drugs: 437 approved products; a check of 72 headline approvals from 2023 to 2026 found only China-only olverembatinib missing.

## Search and agent surface (checked 14 Sept)

What was already in place: canonical URLs, Open Graph and Twitter cards, JSON-LD (Drug, MedicalCondition, MedicalTrial, Organization, Person, Periodical, MedicalScholarlyArticle, BreadcrumbList, WebSite with SearchAction), noindex on /embed/, a dated sitemap of every indexable page, robots.txt, IndexNow, llms.txt and llms-full.txt, per-record Markdown under /api/v1/context/, per-record JSON under /api/v1/entities/, OpenAPI 3.1, JSON Schema, RDF triples, Atom feeds, the CLI and MCP packages.

Added: every entity page now links its Markdown and JSON twins with rel="alternate" so agents and crawlers reach them from the HTML; every JSON-LD node carries dateModified, the CC BY-NC licence and isPartOf the dataset; a schema.org Dataset node on /api/ and /about/ lists every distribution with its licence and citation; indexable pages ask for full snippets and large image previews; robots.txt names the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others) and lets them read the JSON API, while search engines still skip the raw JSON duplicates.

Still yours: Google Search Console verification (TXT token), Bing Webmaster Tools, submitting the Dataset to Google Dataset Search (it reads the JSON-LD once indexed), a Zenodo DOI to put in CITATION.cff and the Dataset node, and a decision on separate-language URLs (hreflang) if the eight interface languages should ever be indexed separately.

## Accounts for watchlist sync (built 14 Sept, needs two keys to switch on)

The site now carries an optional sign-in so readers keep their watched pages across devices. It uses Supabase's REST endpoints with plain fetch (no dependency added) and a magic link by email. Nothing shows on the live site until two public build-time variables exist in Vercel:

1. Create a free Supabase project. In Authentication, turn on the Email provider (magic link), set Site URL to https://onco.cc and add https://onco.cc/** to Redirect URLs.
2. In the SQL editor run:
   `create table public.watchlists (user_id uuid primary key references auth.users(id) on delete cascade, items jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now()); alter table public.watchlists enable row level security; create policy "own row" on public.watchlists for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);`
3. In Vercel project settings add NEXT_PUBLIC_SUPABASE_URL (the project URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (the anon public key), then redeploy. The anon key is meant to be public; the row policy is what protects data.
4. What is stored: the email address (by Supabase Auth) and the watchlist JSON. Add a line to the privacy notice on /about/ when switching it on.

## Review and polish phase (started 10 Sept, late)
- [x] UK coverage: all 56 "NICE position not yet researched" rows resolved from NICE guidance pages and the MHRA register on 10 Sept (29 funded, 2 Cancer Drugs Fund, 5 in appraisal with dates, 13 refused or terminated, 6 not UK-licensed, 1 never appraised); five earlier notes corrected. Not checked: the Scottish Medicines Consortium (client-rendered site); relacorilant and cetuximab sarotalocan confirmed on no UK or EU register.
- [x] Launch review agent: 13,976 pages crawled; 5 broken link targets fixed (new /coverage/ index); dashes, "as of" and "spike" removed from component copy; /hub/ canonical to /roadmap/; newsletter descriptions; 2 heading jumps; 9 tables wrapped for mobile. Merged 10 Sept.
- [x] Duplicate records merged 10 Sept: cstone, hengrui, pancan, 16 journals that also existed as src-* collections, seven reversed-name people, three "-term" twins and nine more the scan found; removed ids kept as aliases; vercel.json path redirects do not fire on this project, so scripts/build-redirect-stubs.ts writes static stub pages for each (live and resolving). Left for a human look: gap-fill collections versus institutions for ALSF, St Baldrick's, MRA and PCF, and bcrf/macmillan versus their src-* sources; dashes, "as of" and "spike" cleared from data text on 10 Sept (185 strings in 41 files) with a house-style test that exempts only companies, journals, people, terms and sources until the duplicate-merge agent lands; still yours: the hub idea titled "As of dates" (a feature name), the `spikes/` directory name and `spike` tag, the corrections page linking the repo root
- [x] Ask OnCo quality pass: 60 new natural questions score 100% (from 74%); new intents for evidence grade, regulator approvals, companies, investors, roadmaps and journals; survival figures kept out of every answer sentence; old floors kept. Merged 10 Sept.
- [ ] Owner's day of review on return: click through the eight-language switch and RTL, the 3D molecules on a phone, the graph explorer, the startups and completeness pages

## Deploy note (10 Sept, late)
One `vercel deploy` failed after upload with "Not authorized" (reason deploy_failed) while the token still worked; the next chain redeployed the same tree. If it recurs, check the Vercel dashboard for the inspect URL in /tmp/vercel-tick.log.

## Merge lessons (10 Sept)
- Agents working in parallel add the same drug or person; run a duplicate-id scan across src/data before validate and fold the poorer copy into the richer one.
- Every new nav item needs label and blurb in the eight nav dictionaries.
- Snapshot files under src/data/universe-lists can collide; keep the completeness envelope names and give other scripts their own file.

## Queued agent briefs (launch when a slot frees; 20-agent cap)
- [x] Plain-language sentences: every term, idea and person covered 10 Sept; gauge 5,519 of 6,303 (88%); remainder is trials and newer records (about 140 technologies, 28 targets, 45 bottlenecks, 146 papers, new tests and complementary records) into src/data/simple/part-e.ts; brief drafted 10 Sept, blocked on the 20-agent cap
- [x] Insurance rankings (/coverage/rankings/) and Getting costs down (/costs/, 29 ideas): merged 10 Sept (/costs/ with ideas wave-costs). Brief drafted 10 Sept; owner ask: "build a section for insurance rankings for oncology, coverage, costs ranges and add another section for getting costs down and ideas around that".
- [x] Startups, YC and VC map with investors: live 10 Sept (/startups/, /investors/; 62 YC, 187 startups, 69 investors)
- [x] Donors in the heroes section: merged 10 Sept (41 donors, 15 foundations)
- [x] Open Medical Registry links per section: merged 10 Sept (133 tools, /open-tools/)
