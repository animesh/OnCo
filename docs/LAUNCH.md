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
- 16 Sept, after midnight UTC: the research fetch used its 900-credit cap and added 99 institution panels (365 live); 45 matches were removed and skipped (parents such as Copenhagen University Hospital for Herlev and Rigshospitalet, Mayo Clinic for its Arizona and Florida sites, Shanghai Jiao Tong for Renji and Ruijin; charities, societies, regulators; empty results). Europe PMC literature snapshots refreshed for all 1,539 records. People without papers: the institution-filtered OpenAlex author search works (three matched before the budget ran out) and is the safe route; see the memory note. 117 institutions remain unattempted for research.
- 16 Sept, small hours: Sponsor batches 11 to 13 took the phase 3 industry list to 469 of 936 (Active Biotech, Advenchen, Merrimack, Threshold, Peregrine/Avid, Sorrento, Dong-A ST, Harbour BioMed, Viatris with Mylan and Upjohn, Organon, CSL, Pharmacosmos, Kissei, Zeria, Rovi, Denovo, Cancer Prevention Pharmaceuticals), every head office verified on Wikidata or the company site; QED sits under BridgeBio. The remaining 467 names are mostly one-trial sponsors, defunct firms with no Wikidata entry, and companies outside oncology whose trials carry a cancer tag. Logos: the favicon service now returns a 16 px placeholder with a 404 for sites it lacks, so the 270-odd organisations still without a logo need files from the owner.
- 16 Sept, morning: NICE published TA1192 (mirdametinib for NF1 plexiform neurofibromas) and it is in the UK coverage file the same day. Sponsor batches 14 to 17 took the phase 3 list to 515 of 936 (photonamic, Oakwood, Daehwa, CellSeed; Arog, Cyclacel, Galera, Idera, Infinity, Halozyme, Bellicum, Can-Fite, Cartesian, Atossa; Argos, Ascletis, Delta-Fly, Diffusion, Galena, HiberCell, Isarna, Medigene, Mundipharma, Abbisko, Acacia; Ionis, Emergent, Grifols, Mabion, IMPACT, Blaze, JW) with acquired names as aliases (Cougar, MedImmune, ILEX, Facet, Molecular Insight, GW, McNeil). The one-trial tier is being worked through by recognisable oncology names; the rest are generics makers, non-oncology firms with a cancer-tagged trial, and defunct biotechs without a Wikidata entry.

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

## 16 Sept 2026: launch day

Shipped today, each behind the full gate: glossary rebuilt (twenty categories, regular grid, per-term pictures); models table overflow fixed and long tokens wrap in every table; initials placeholders for organisations and people without images; journal wordmarks; email signup box wired to `NEXT_PUBLIC_SIGNUP_ACTION`; 61 people given papers via Europe PMC; 17 ChEMBL targets; six NCI supportive-care drugs; six Cancer Statistics key papers; provenance tags hidden from readers; nine dead websites and four Wikipedia links repaired after a full link sweep; repository metadata brought to 1.0.0 (homepage onco.cc, citation date, changelog).

Owner-only, still open:
- Email list: create a Buttondown list (free tier, no card) and set `NEXT_PUBLIC_SIGNUP_ACTION` to `https://buttondown.com/api/emails/embed-subscribe/<username>` in Vercel, then redeploy; or give the agent an address to use as a mailto fallback.
- Google Search Console TXT token and Bing Webmaster import; confirm www.onco.cc is attached in Vercel.
- Supabase keys for accounts (magic-link sign-in) if wanted at launch.
- npm publish of `onco` and the MCP server after the name clash is resolved; Zenodo DOI for the dataset release.
- Review the two bot pull requests and the factcheck patches listed above.

## To do: make OnCo agentically accessible and accessible by AI (owner request, 16 Sept 2026)

The site already ships a static JSON API with CORS, per-entity Markdown context files, `llms.txt` and `llms-full.txt`, an OpenAPI 3.1 document, Atom feeds, RDF triples and an MCP server plus CLI under `packages/`. The owner wants this pushed further so agents and AI systems can use OnCo directly. Concrete items, in priority order:
- Publish the MCP server and CLI to npm (name clash to resolve first) and register the MCP server in the public directories; add a one-line install to README and `/api/`.
- Every page links its own machine forms in `<head>` (`alternate` links to JSON, Markdown and the entity's OpenAPI path) and states them in a visible footer line, so an agent landing on any page can find the data.
- Add `/.well-known/ai-plugin.json`-style and `agents.md` discovery files and an explicit crawl policy for AI agents in `robots.txt` (allow, with the API as the preferred surface).
- Schema.org JSON-LD on every entity page (MedicalEntity, Drug, MedicalCondition, ClinicalTrial, Organization, Person) generated from the graph.
- Bulk downloads: one compressed JSON and one Parquet or CSV per kind at `/api/v1/bulk/`, refreshed at build time, with the dataset licence attached.
- Task-shaped endpoints for agents: "what changed since <date>", "trials recruiting for <cancer> in <country>", "compare <drug A> and <drug B>", each with a documented example in the OpenAPI file.
- A tool-use evaluation set (questions with expected entity ids) so regressions in agent usefulness are caught in CI, building on `src/lib/ask.test.ts`.
- Rate and provenance headers on API responses (`X-OnCo-Provenance`, `Last-Modified`) so agents can cite and cache.

## Roadmap pointer (16 Sept 2026)

The owner's patient-first roadmap (a real-case "For me", persistent cancer choice, trial and cancer subscriptions, per-cancer "what changed", a first-60-days guide, when-to-call red cards, decision pages, outcome-based centre choice, appointment prep with answers) is recorded as batch K, items 101 to 109, in docs/IMPROVEMENTS-100.md.

- [ ] Add Enso Bioscience as a company (owner request, 16 Sept 2026): its site ensobioscience.com shows only "Launching Soon" with an email list, so there is nothing sourced to record yet; ask the owner what it does and where it is based, or revisit when the site publishes.

### Fix list (after the 16 Sept office-network check)

- [ ] Issue 12 (odfalik, 16 Sept): breadcrumb links cannot be clicked because the strip's negative bottom margin lets the page header cover them. Fix: lift the breadcrumb above the header (relative, z-index) and confirm with elementFromPoint on /companies/noetik/.
- [ ] Office network: TLS to onco.cc is reset by a server-name filter on the office side (plain HTTP and other names on the same edge address work; every outside vantage returns 200). Not a site fault and Cloudflare would not change it. Ask the office IT filter to allow onco.cc and www.onco.cc, or use a hotspot. Once the appliance vendor is known, submit the domain for categorisation.

### Roadmap additions (owner, 16 Sept)

- [ ] Parker Institute for Cancer Immunotherapy (parkerici.org): the institute is already a record; pull its useful entities the way the FCCT page was mined: member cancer centres and their leads, PICI investigators, PICI-backed companies and spin-outs, and the trials it sponsors, each linked back to the institute.
- [ ] Do the same for other institutions with public network or portfolio pages (Cancer Research UK institutes, Stand Up To Cancer dream teams, NCI-designated centre consortia, EMBL and Institut Curie partner lists), one institution a tick, so every institution page links out to people, companies and trials rather than standing alone.

### Registry waves 6 and 7 (16 Sept 2026, evening)

- Trials wave 6: 1,616 industry-sponsored phase 1/2 to 3 trials from the ClinicalTrials.gov cache that earlier waves left out (recruiting or active), taking trials from 1,701 to 3,317. Cancers come from the registry's condition terms matched against OnCo's cancer names and a keyword table; 528 basket studies map only to the advanced-solid-tumour page. Trials naming only non-cancer conditions (myasthenia gravis, HPV infection, neurofibromatosis) were left out.
- Products waves 6 and 7: 87 investigational agents that are interventions in recorded trials and were missing as products, each linked to its trials, cancers and sponsor; modality comes from the name stem or the registry's own description, and the record says so. Registry misspellings of recorded drugs (fuzzy match), formulations, combinations and immunology drugs used for side effects were filtered out. Generators live in /tmp/drafts on the owner's machine (gen-trials-wave6.ts, gen-wave6.ts) and should move into scripts/ as fetch-ctgov-waves.ts.
- Still open: 568 code-named agents whose registry text gives no modality (needs sponsor pages), and a weekly refetch so new registrations flow in.

### China deep dive, wave 1 (16 Sept 2026, evening)

- Eleven NMPA-approved cancer medicines that were missing joined china.ts's earlier set: benmelstobart, iruplinalkib, flumatinib, utidelone, inetetamab, linperlisib, surufatinib, Endostar, Oncorine (H101), QL1706 and mecapegfilgrastim, each with its China approval row, developer and cancer links; five developers added (Biostar, 3SBio, Juventas, Shanghai Yingli, Shanghai Sunway). China rows added for befotertinib, fluzoparib, pamiparib and dabrafenib.
- Left out on purpose because the approval facts were not certain enough: unecritinib, ripertamab, becotatug vedotin, satri-cel, vorolanib, socazolimab, plinabulin. Next: confirm those from NMPA notices, then the Chinese sponsors in the registry cache with no company record (Jacobio, ImmVira, Binhui, Beijing Mabworks, Chengdu Zenitar and about twenty more).
- Two Hansoh records exist (hansoh and hansoh-pharma); merge them. Gumarontinib turned out to be the INN of glumetinib (SCC244), so the duplicate was folded into the glumetinib record.

### Office access finding (16 Sept, evening)

- The owner's "You're offline" pages at UCSF are the service worker's fallback after the campus network resets TLS for the onco.cc name; the site loads in Panama and Los Angeles. Not caching. Ask UCSF IT to allow onco.cc and www.onco.cc, or submit the domain for categorisation with the filter vendor.
- The service worker now waits for the network after its short timeout when no cached copy exists, so slow connections no longer see the offline page; the offline page explains the filtered-network case.

### Polycythaemia vera page (16 Sept 2026, owner request)

- New cancer record /cancers/polycythaemia-vera/ with diagnosis, risk-adapted standard of care, state of the art, a history from Vaquez (1892) to rusfertide's approval (2026), open problems and a pipeline; seven pivotal trials (CYTO-PV, RESPONSE, RESPONSE-2, PROUD-PV with CONTINUATION-PV, Low-PV, MAJIC-PV, VERIFY) with primary endpoints; eight plain-English terms (JAK2 V617F, phlebotomy, haematocrit, erythrocytosis, hepcidin, aquagenic pruritus, erythromelalgia, post-PV myelofibrosis); two ideas (clone-directed therapy toward treatment-free remission; hepcidin control as first-line treatment in low-risk disease). The eight PV medicines now link to the page.
- Left for later: aspirin as a drug record (it is referenced in PV care and cancer prevention but has no entity), and an essential thrombocythaemia page built the same way.

### Essential thrombocythaemia page and aspirin record (16 Sept 2026, evening)

- New cancer record /cancers/essential-thrombocythaemia/ built like the polycythaemia vera page (IPSET risk groups, PT-1 and MAJIC-ET trials, CALR and MPL biomarkers, prefibrotic myelofibrosis look-alike), on the bone marrow drawing; hydroxyurea, anagrelide, bomedemstat and the interferons link to it.
- Aspirin now has a drug record covering clot prevention in PV and ET and the prevention evidence (CAPP2 in Lynch syndrome, ASPREE in the healthy elderly, Add-Aspirin ongoing); the PV page references it again.

### Radiation expansion, wave 1 (16 Sept 2026, owner request)

- 23 technologies the radiation section lacked: VMAT, radiosurgery, adaptive radiotherapy, surface guidance, motion management, hypofractionation, SABR for oligometastases, HDR and LDR brachytherapy, pencil-beam proton therapy, total body and total skin electron therapy, superficial X-rays, cobalt-60, the global access gap, radiosensitisers, radioprotectors, the linear-quadratic model, hypoxia modification, dose painting, knowledge-based planning, in vivo dosimetry, radiogenomics; 12 clinic terms (alpha/beta ratio, BED, target volumes, organs at risk, breath-hold, fiducials, hypoxia, oxygen enhancement ratio, dermatitis, pneumonitis, necrosis, second cancers). Each technology is aliased to an existing drawing.
- Next waves: the landmark fractionation and radiosurgery trials (START, FAST-Forward, CHHiP, PACE-B, HYPO-RT-PC, RTOG 0617, CALGB 9343, PRIME II, LUMINA, NRG CC001, N0574, DAHANCA 5, IMPORT LOW, NSABP B-39, CHISEL, CATNON, Stupp, QUARTZ, JCOG0403), radiosensitiser and radioprotector drug records (nimorazole, palifermin, NBTXR3), radiation side-effect management, and the mathematical models group if approved.

### Subtype pages and radiation wave 2 (16 Sept 2026, evening)

- Cancers now carry a `parent` field: pleural and peritoneal mesothelioma have pages of their own under mesothelioma, and 50-odd existing records (lymphoma, sarcoma, skin, brain, childhood, MPN subtypes, uveal melanoma, paediatric gliomas) are wired to their broader type. The parent page lists its subtypes in a strip at the top of the overview; the subtype page shows "Part of". Remaining: breast, lung, leukaemia and biliary subtypes have no parent cancer page (those are sections), and the plain-text `subtypes` lists on other cancers still need branching into pages, one family a tick.
- Radiation wave 2: 19 landmark trials (START-B, FAST-Forward, CHHiP, PACE-B, HYPO-RT-PC, RTOG 0617, CALGB 9343, PRIME II, LUMINA, IMPORT LOW, NSABP B-39, CHISEL, JCOG0403, N0574, NRG CC001, QUARTZ, the Stupp trial, CATNON, DAHANCA 5) with primary endpoints and publications.
- Roadmap row 112: rank startup requests by urgency and commerciality with the scoring dimensions.

### Link report, radiation wave 3 and the Chinese review (17 Sept 2026, early)

- Pull request 15 (benskamps) merged: the link checker now reports gone, unreachable and blocked separately; the audit page leads with links that are actually gone (about 1 percent) and shows refused ones as live to readers. The next weekly links run fills the new fields.
- Radiation wave 3: nimorazole, NBTXR3 (CE mark 2019), pilocarpine (FDA 1994), avasopasem (FDA complete response 2023) and evofosfamide (failed phase 3s), plus Nanobiotix; palifermin already existed.
- Chinese version: 5,404 TL;DRs are translated and read fluently on a 12-record sample; none is left in English. Coverage is the gap: cancers 100 of 110, drugs 823 of 1,013, technologies 411 of 480, targets 99 of 162, companies 764 of 995, trials 694 of 3,345 (registry ingests). One terminology slip fixed (mesothelioma now 胸膜间皮瘤). Next: translate the new cancer, radiation and China records first, then targets; keep drug names in Latin script as the file does now.

### Parent pages for breast, lung, leukaemia and biliary tract cancer (17 Sept 2026)

- Four overview cancer records so the subtype pages (HR-positive, HER2-positive, TNBC, DCIS, male breast; NSCLC, SCLC; ALL, AML, CLL, CML, hairy cell, CMML, BPDCN; cholangiocarcinoma, gallbladder, ampullary) show "Part of" and the parent lists them at the top. Each overview holds screening, staging and shared history and points to the subtype pages for treatment. Remaining text-only subtypes on other cancers still to branch.
- Chinese: 56 new TL;DRs for the polycythaemia vera, essential thrombocythaemia, mesothelioma subtype, China and radiation records.

### Radiation wave 4 and Chinese wave 2 (17 Sept 2026)

- Radiation wave 4: 21 chemoradiation, nodal, de-escalation and prophylactic irradiation trials (CROSS, INT-0116, German rectal CAO/ARO/AIO-94, RAPIDO, PRODIGE 23, ACT II, RTOG 91-11, Bonner cetuximab, RTOG 1016, De-ESCALaTE, RTOG 9601, HORRAD, POP-RT, Slotman and Takahashi PCI, EORTC 22922, MA.20, DBCG 82b/c, RTOG 9402, EORTC 26951, EORTC 22033). The wave 2 Stupp record was a duplicate of the existing EORTC 26981 page and was removed.
- Chinese waves 2 to 8: 537 TL;DRs covering every cancer page, target, technology, term, idea, institution and curated drug and company; what remains is registry-ingested trials and products and about 130 people.

### Subtype pages: thyroid and head and neck (17 Sept 2026)

- Thyroid: papillary, follicular, medullary and anaplastic thyroid cancer as pages under the thyroid record (surveillance of microcarcinomas, no radioactive iodine for low risk after ESTIMABL2 and IoN, selpercatinib for RET-mutant medullary disease, dabrafenib-trametinib for BRAF-mutant anaplastic disease).
- Head and neck: oropharyngeal (HPV), laryngeal and hypopharyngeal, and oral cavity cancer as pages under the head and neck record, linked to RTOG 91-11, RTOG 1016, De-ESCALaTE, the Bonner trial, KEYNOTE-048 and the Tata Memorial trials. All seven carry Chinese TL;DRs.
- Ovarian: high-grade serous, low-grade serous, clear cell, mucinous and adult granulosa cell tumour pages under the ovarian record, with Chinese TL;DRs.
- Kidney (clear cell, papillary, chromophobe), testicular (seminoma, non-seminoma) and oesophageal (squamous cell, adenocarcinoma) subtype pages added under their parents, with Chinese TL;DRs.
- Bladder: non-muscle-invasive and muscle-invasive urothelial cancer pages under the bladder record, with Chinese TL;DRs.
- Next families to branch: the remaining lymphoma and sarcoma text subtypes, and prostate by risk group.
