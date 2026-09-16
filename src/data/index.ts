import { cancers } from "./cancers";
import { canonicalTermCategory } from "./term-categories";
import { sections } from "./sections";
import { technologies } from "./technologies";
import { targets } from "./targets";
import { drugs } from "./drugs";
import { companies } from "./companies";
import { institutions } from "./institutions";
import { pathways } from "./pathways";
import { terms } from "./terms";
import { trials } from "./trials";
import { pairings } from "./pairings";
import { roadmaps } from "./roadmaps";
import { ideas } from "./ideas";
import { collections } from "./collections";
import type { EntityInput } from "@/lib/schema";
import { mergeSpikes, spikeEntities } from "./spikes";
import { failures } from "./failures";
import { pipelineTrials } from "./pipeline-trials";
import { groups } from "./groups";
import { frontier } from "./frontier";
import { people } from "./people";
import { bottlenecks } from "./bottlenecks";
import { sources } from "./sources";
import { mechanisms } from "./mechanisms";
import { frontierRoadmaps } from "./frontier-roadmap";
import { supporting } from "./supporting";
import { gapFill } from "./gap-fill";
import { keyPapers } from "./key-papers";
import { nutrition } from "./nutrition";
import { adcChemistry } from "./adc-chemistry";
import { journals } from "./journals";
import { termsBasics } from "./terms-basics";
import { termsJargon } from "./terms-jargon";
import { institutionsUs } from "./institutions/us";
import { institutionsWorld } from "./institutions/world";
import { institutionsBodies } from "./institutions/bodies";
import { institutionsEurope } from "./institutions/europe";
import { institutionsCentresWave3 } from "./institutions/centres-wave3";
import { institutionsDonorFoundations } from "./institutions/donor-foundations";
import { foundationModels } from "./foundation-models";
import { foundationRoadmaps } from "./foundation-roadmap";
import { ideaWaves } from "./ideas-waves";
import { mechanicsPathways } from "./mechanics-pathways";
import { complementary } from "./complementary";
import { tests } from "./tests";
import { nciCoverage } from "./nci-coverage";
import { institutionsIndia } from "./institutions/india";
import { india } from "./india";
import { china } from "./china";
import { approvedWave1 } from "./drugs-approved-wave1";
import { targetsWave1 } from "./targets-wave1";
import { companiesWave1 } from "./companies-wave1";
import { companiesYc } from "./companies-yc";
import { companiesStartups } from "./companies-startups";
import { investors } from "./investors";
import { roadmapsWave2 } from "./roadmaps-wave2";
import { pathwaysKegg } from "./pathways-kegg";
import { journalsWave2 } from "./journals-wave2";
import { companiesSponsors } from "./companies-sponsors";
import { drugsPipelineWave1 } from "./drugs-pipeline-wave1";
import { pipelineTrialsWave2 } from "./pipeline-trials-wave2";
import { drugsPipelineWave2 } from "./drugs-pipeline-wave2";
import { drugsPipelineWave6 } from "./drugs-pipeline-wave6";
import { drugsPipelineWave7 } from "./drugs-pipeline-wave7";
import { drugsChinaWave1 } from "./drugs-china-wave1";
import { pvCancer, pvTrials, pvTerms, pvIdeas } from "./polycythaemia-vera";
import { pipelineTrialsWave3 } from "./pipeline-trials-wave3";
import { pipelineTrialsWave4 } from "./pipeline-trials-wave4";
import { pipelineTrialsWave5 } from "./pipeline-trials-wave5";
import { pipelineTrialsWave6 } from "./pipeline-trials-wave6";

const RAW_INPUTS: EntityInput[] = [
  ...mergeSpikes(cancers),
  ...spikeEntities,
  ...sections,
  ...technologies,
  ...targets,
  ...drugs,
  ...companies,
  ...institutions,
  ...pathways,
  ...terms,
  ...trials,
  ...pairings,
  ...roadmaps,
  ...ideas,
  ...collections,
  ...failures,
  ...pipelineTrials,
  ...groups,
  ...frontier,
  ...people,
  ...bottlenecks,
  ...ideaWaves,
  ...sources,
  ...mechanisms,
  ...frontierRoadmaps,
  ...supporting,
  ...gapFill,
  ...keyPapers,
  ...nutrition,
  ...adcChemistry,
  ...journals,
  ...termsBasics,
  ...termsJargon,
  ...institutionsUs,
  ...institutionsWorld,
  ...institutionsBodies,
  ...institutionsEurope,
  ...institutionsCentresWave3,
  ...institutionsDonorFoundations,
  ...foundationModels,
  ...foundationRoadmaps,
  ...mechanicsPathways,
  ...complementary,
  ...tests,
  ...nciCoverage,
  ...institutionsIndia,
  ...india,
  ...china,
  ...approvedWave1,
  ...targetsWave1,
  ...companiesWave1,
  ...companiesYc,
  ...companiesStartups,
  ...investors,
  ...roadmapsWave2,
  ...pathwaysKegg,
  ...journalsWave2,
  ...companiesSponsors,
  ...drugsPipelineWave1,
  ...pipelineTrialsWave2,
  ...drugsPipelineWave2, ...drugsPipelineWave6, ...drugsPipelineWave7, ...drugsChinaWave1, pvCancer, ...pvTrials, ...pvTerms, ...pvIdeas,
  ...pipelineTrialsWave3,
  ...pipelineTrialsWave4,
  ...pipelineTrialsWave5, ...pipelineTrialsWave6,
];

/** Every input, with glossary terms mapped to their canonical category (see ./term-categories.ts). */
export const ALL_INPUTS: EntityInput[] = RAW_INPUTS.map((e) => (e.kind === "term" ? { ...e, category: canonicalTermCategory(e.id, e.category) } : e));

