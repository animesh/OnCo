import type { CollectionInput, ExternalLink } from "@/lib/schema";

/**
 * Free in oncology: programmes, services and organisations that give patients, families and researchers
 * something at no charge. Programmes and organisations are `collection` records (they get a page, search and
 * translations); `freeServices` is the typed list /free/ renders, grouped, with who is eligible and where.
 * Plain English, UK spelling, no figures beyond what the linked page states. Nothing here is medical advice.
 */
export type FreeGroup = "testing" | "screening" | "hpv" | "helplines" | "travel" | "second-opinion" | "trials" | "drugs" | "genetics" | "survivorship" | "wigs" | "data";

export const FREE_GROUPS: Array<{ id: FreeGroup; title: string; blurb: string }> = [
  { id: "testing", title: "Free tumour and germline testing", blurb: "Programmes that pay for sequencing of the tumour or of inherited risk genes. Each has an eligibility rule; the programme page states it." },
  { id: "screening", title: "Screening that is free at the point of use", blurb: "National programmes that invite people by age. Nothing to pay when you attend." },
  { id: "hpv", title: "Free HPV vaccination", blurb: "The vaccine that prevents most cervical cancers and several others, free through public programmes." },
  { id: "helplines", title: "Free helplines and nurse lines", blurb: "Trained nurses and information specialists who answer questions by phone, free of charge." },
  { id: "travel", title: "Free rides, flights and places to stay", blurb: "Getting to treatment and sleeping near it, without a bill." },
  { id: "second-opinion", title: "Free second opinions and free treatment", blurb: "Named programmes that review a diagnosis or treatment plan for nothing, and the one hospital that never bills. For expert centres near you, see the second opinion page." },
  { id: "trials", title: "Free trial participation and travel help", blurb: "Trial drugs and trial-related care are supplied by the sponsor; these programmes help with the costs around them." },
  { id: "drugs", title: "Free medicines through assistance programmes", blurb: "Manufacturer programmes, national schemes and charities, product by product, live on the financial help page." },
  { id: "genetics", title: "Free genetic counselling routes", blurb: "Where to talk to someone about inherited cancer risk without paying." },
  { id: "survivorship", title: "Free survivorship, rehabilitation and support", blurb: "Exercise, courses, peer mentors and drop-in centres that cost nothing to use." },
  { id: "wigs", title: "Free wigs and prostheses", blurb: "Hair and breast prostheses supplied free by health services and charities." },
  { id: "data", title: "Free data and tools for researchers", blurb: "The open databases OnCo itself is built on, with licences on the open data page." },
];

const asOf = "2026-09-17";

type Row = Omit<CollectionInput, "kind" | "asOf" | "links"> & { group: FreeGroup; extraLinks?: ExternalLink[] };

const ROWS: Row[] = [
  // Testing
  { group: "testing", id: "pancan-know-your-tumor", name: "PanCAN Know Your Tumor", url: "https://pancan.org/facing-pancreatic-cancer/patient-services/know-your-tumor/", maintainer: "Pancreatic Cancer Action Network",
    holds: "A free molecular profiling service for people with pancreatic cancer in the United States: tumour sequencing arranged through the patient's oncologist, with a report the treating team can use to look for targeted treatments and trials.",
    tldr: "PanCAN pays for tumour sequencing for people with pancreatic cancer in the US, so the results can point to a targeted drug or a trial.",
    summary: "Know Your Tumor is the Pancreatic Cancer Action Network's precision medicine service. Patients or their oncologists apply through PanCAN Patient Services; the charity coordinates collection of tumour tissue and pays for comprehensive genomic profiling, then returns a report to the treating oncologist. PanCAN's published analyses of the programme found that a minority of patients carry an actionable alteration and that those treated on a matched therapy lived longer, which is the argument for testing everyone. The programme is limited to the United States and the programme page states the current eligibility rules.",
    cancers: ["pancreatic"], technologies: ["cgp"], related: ["pancan"], tags: ["patient-programme"] },
  { group: "testing", id: "prostate-cancer-promise", name: "PROMISE registry: free germline testing in prostate cancer", url: "https://www.prostatecancerpromise.org/", maintainer: "PROMISE study team (University of Washington and Fred Hutchinson Cancer Center)",
    holds: "A research registry that offers men with prostate cancer in the United States a free at-home germline test for inherited cancer genes, with genetic counselling for those found to carry a change and follow-up over time.",
    tldr: "Men with prostate cancer in the US can get a free inherited-risk gene test by joining the PROMISE registry, which also offers counselling about the result.",
    summary: "PROMISE (Prostate Cancer Registry of Outcomes and Germline Mutations for Improved Survival and Treatment Effectiveness) is a research registry led by academic prostate cancer groups. Any man with a prostate cancer diagnosis in the United States can enrol online; the study sends a saliva kit, runs a multi-gene germline panel at no charge, and returns the result with access to genetic counselling. Men found to carry a pathogenic variant are followed for outcomes and told about trials that fit. The point of the registry is that guideline-recommended germline testing in prostate cancer is often skipped, and a free direct route removes one reason.",
    cancers: ["prostate"], technologies: ["germline-testing"], related: ["prostate-cancer-foundation"], tags: ["patient-programme"] },
  { group: "testing", id: "nhs-genomic-medicine-service", name: "NHS Genomic Medicine Service", url: "https://www.england.nhs.uk/genomics/nhs-genomic-med-service/", maintainer: "NHS England",
    holds: "The NHS route to tumour and inherited-risk testing in England, free at the point of use for eligible patients: the National Genomic Test Directory lists which tests are funded for which cancers, delivered through regional Genomic Laboratory Hubs.",
    tldr: "In England, tumour and inherited cancer gene testing is free on the NHS when the National Genomic Test Directory lists it for your cancer. Your hospital team orders it.",
    summary: "The NHS Genomic Medicine Service brings cancer genomic testing under one national structure. The National Genomic Test Directory, updated each year, states which tests the NHS funds for which indication, from single-gene companion tests to large panels, whole genome sequencing for some cancers, and germline testing where family history or tumour features meet the criteria. Regional Genomic Laboratory Hubs run the tests; clinical teams order them and there is no charge to the patient. Scotland, Wales and Northern Ireland run their own genomic services with similar principles. For a patient, the practical questions are whether the directory lists a test for their situation and whether the team has requested it.",
    technologies: ["cgp", "wes-wgs", "germline-testing"], extraLinks: [{ label: "National Genomic Test Directory", url: "https://www.england.nhs.uk/publication/national-genomic-test-directories/" }], tags: ["patient-programme", "public"] },
  { group: "testing", id: "nhs-jewish-brca-testing", name: "NHS Jewish BRCA Testing Programme", url: "https://www.jewishbrca.org/", maintainer: "NHS England with Jnetics and Chai Cancer Care",
    holds: "Free BRCA1 and BRCA2 testing by saliva kit for anyone in England aged 18 or over with at least one Jewish grandparent, regardless of family history, with genetic counselling for those who test positive.",
    tldr: "Anyone in England with a Jewish grandparent can order a free NHS saliva test for BRCA gene changes, which raise breast, ovarian, prostate and pancreatic cancer risk.",
    summary: "People of Jewish ancestry carry BRCA1 or BRCA2 founder variants far more often than the general population, and most carriers have no family history that would qualify them for testing. The NHS Jewish BRCA Testing Programme removes the family-history gate: adults in England with one or more Jewish grandparent register online, receive a saliva kit at home, and get their result with genetic counselling if a variant is found. The programme is run by NHS England with the charities Jnetics and Chai Cancer Care, and the website sets out who is eligible and what a positive result leads to (surveillance, risk-reducing options, cascade testing of relatives).",
    cancers: ["breast-cancer", "ovarian", "prostate", "pancreatic"], targets: ["brca"], technologies: ["germline-testing"], related: ["hereditary-cancer-syndromes"], tags: ["patient-programme", "public"] },

  // Screening
  { group: "screening", id: "nhs-cancer-screening-programmes", name: "NHS cancer screening programmes", url: "https://www.nhs.uk/conditions/nhs-screening/", maintainer: "NHS England (and the devolved NHS bodies)",
    holds: "The three national NHS cancer screening programmes, free at the point of use and invitation-based: bowel screening by home FIT kit, breast screening by mammogram, and cervical screening with HPV testing; plus lung screening for people with a smoking history, being rolled out across England.",
    tldr: "In the UK the NHS invites you to bowel, breast and cervical screening by age, free, and is rolling out lung screening for people who smoke or used to.",
    summary: "The NHS runs population screening for bowel cancer (a faecal immunochemical test posted to the home every two years), breast cancer (mammography every three years) and cervical cancer (HPV primary testing), with age ranges that differ slightly between England, Scotland, Wales and Northern Ireland; the NHS page for each programme states the current ages. Lung cancer screening with low-dose CT for people aged 55 to 74 who smoke or used to, begun as the Targeted Lung Health Check, is being extended across England. Screening is free, invitations are automatic through the GP register, and anyone who has missed an invitation can ask their GP practice. Screening looks for cancer or pre-cancer in people without symptoms; anyone with symptoms should see a GP rather than wait for screening.",
    technologies: ["colorectal-screening", "mammography", "nhs-targeted-lung-health-check", "low-dose-ct-screening"], cancers: ["colorectal", "breast-cancer", "cervical", "nsclc"],
    extraLinks: [{ label: "NHS bowel cancer screening", url: "https://www.nhs.uk/conditions/bowel-cancer-screening/" }, { label: "NHS breast screening", url: "https://www.nhs.uk/conditions/breast-screening-mammogram/" }, { label: "NHS cervical screening", url: "https://www.nhs.uk/conditions/cervical-screening/" }], tags: ["public"] },
  { group: "screening", id: "australia-cancer-screening-programs", name: "Australia's national cancer screening programs", url: "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program", maintainer: "Australian Government Department of Health",
    holds: "The National Bowel Cancer Screening Program (free home kit every two years), BreastScreen Australia (free mammograms) and the National Cervical Screening Program (HPV test every five years, with self-collection), plus a national lung cancer screening program that started in 2025.",
    tldr: "Australians are invited to free bowel, breast and cervical screening by age, and since 2025 to lung screening if they have a heavy smoking history.",
    summary: "Australia runs three long-standing population screening programs, each free to eligible residents and each with its own government page stating the age range: the National Bowel Cancer Screening Program posts a home test kit every two years, BreastScreen Australia offers mammography through state services, and the National Cervical Screening Program uses HPV testing every five years with the option to collect the sample yourself. A National Lung Cancer Screening Program using low-dose CT for people with a significant smoking history began in July 2025. Cancer Council Australia's 13 11 20 line answers questions about any of them.",
    technologies: ["colorectal-screening", "mammography", "low-dose-ct-screening"], cancers: ["colorectal", "breast-cancer", "cervical", "nsclc"],
    extraLinks: [{ label: "BreastScreen Australia", url: "https://www.health.gov.au/our-work/breastscreen-australia-program" }, { label: "National Cervical Screening Program", url: "https://www.health.gov.au/our-work/national-cervical-screening-program" }], tags: ["public"] },
  { group: "screening", id: "ireland-national-screening-service", name: "Ireland's National Screening Service", url: "https://www.screeningservice.ie/", maintainer: "Health Service Executive (HSE)",
    holds: "BowelScreen, BreastCheck and CervicalCheck: Ireland's free national cancer screening programmes, with the current age ranges and how to register on each programme's site.",
    tldr: "In Ireland, BowelScreen, BreastCheck and CervicalCheck are free. You register once and get invited by age.",
    summary: "The HSE National Screening Service runs Ireland's population screening: BowelScreen (a home FIT kit), BreastCheck (mammography) and CervicalCheck (HPV primary screening), each free and invitation-based, with eligibility by age set out on the programme websites. People who are not on the register can add themselves online. The Irish Cancer Society Support Line answers questions about screening and results.",
    technologies: ["colorectal-screening", "mammography"], cancers: ["colorectal", "breast-cancer", "cervical"], tags: ["public"] },
  { group: "screening", id: "nz-time-to-screen", name: "Time to Screen (New Zealand national screening)", url: "https://www.timetoscreen.nz/", maintainer: "Health New Zealand, National Screening Unit",
    holds: "New Zealand's national bowel, breast and cervical screening programmes on one site: who is eligible, how to enrol and what happens next, in English and te reo Maori.",
    tldr: "New Zealand's bowel, breast and cervical screening programmes are free for eligible people; Time to Screen is the one site that covers all three.",
    summary: "Time to Screen is the public face of New Zealand's National Screening Unit. It covers the National Bowel Screening Programme (a free home test for the eligible age range), BreastScreen Aotearoa (free mammograms) and the National Cervical Screening Programme (HPV testing, including self-testing, free for eligible groups). Each programme page states the current age range and who is eligible, which has changed in recent years as programmes have been extended.",
    technologies: ["colorectal-screening", "mammography"], cancers: ["colorectal", "breast-cancer", "cervical"], tags: ["public"] },
  { group: "screening", id: "cdc-nbccedp", name: "CDC National Breast and Cervical Cancer Early Detection Program", url: "https://www.cdc.gov/breast-cervical-cancer-screening/", maintainer: "US Centers for Disease Control and Prevention",
    holds: "Free or low-cost mammograms, Pap and HPV tests and diagnostic follow-up for women in the United States with low income and little or no insurance, delivered through state, tribal and territorial programmes.",
    tldr: "In the US, women with low income and no or little insurance can get free or low-cost breast and cervical screening through a CDC-funded programme in every state.",
    summary: "The National Breast and Cervical Cancer Early Detection Program has funded screening for uninsured and underinsured women since 1991. It works through grantees in every state, several tribes and territories, which arrange mammograms, Pap and HPV tests, diagnostic tests when screening is abnormal, and referral to treatment; in most states women diagnosed through the programme can get Medicaid coverage for treatment. Eligibility is by age, income and insurance status and the CDC page links to the local programme, which is where a woman applies.",
    technologies: ["mammography"], cancers: ["breast-cancer", "cervical"], tags: ["public"] },

  // HPV vaccination
  { group: "hpv", id: "nhs-hpv-vaccination", name: "NHS HPV vaccination programme", url: "https://www.nhs.uk/vaccinations/hpv-vaccine/", maintainer: "NHS England",
    holds: "Free HPV vaccination offered in school (Year 8 in England), with free catch-up for anyone who missed it until their 25th birthday and for men who have sex with men up to 45 through sexual health clinics.",
    tldr: "The NHS gives the HPV vaccine free at school around age 12 to 13, and anyone who missed it can still get it free until they turn 25.",
    summary: "The NHS HPV programme began for girls in 2008 and was extended to boys in 2019; since 2023 a single dose is given in Year 8 in England. Anyone eligible who missed the school dose can have it free from their GP until their 25th birthday, and men who have sex with men aged up to 45 can have it at sexual health clinics. The programme has already cut cervical cancer sharply in the first vaccinated cohorts, which is why OnCo lists it among the highest-value free things in oncology.",
    technologies: ["hpv-vaccine"], drugs: ["gardasil-9"], cancers: ["cervical", "head-and-neck"], related: ["paper-hpv-vaccine-england-lancet-2021"], tags: ["public"] },
  { group: "hpv", id: "us-vaccines-for-children", name: "Vaccines for Children program (US)", url: "https://www.cdc.gov/vaccines-for-children/", maintainer: "US Centers for Disease Control and Prevention",
    holds: "Free vaccines, including HPV, for children and teenagers through 18 in the United States who are Medicaid-eligible, uninsured, underinsured or American Indian or Alaska Native, given through enrolled providers.",
    tldr: "In the US, the Vaccines for Children program gives the HPV vaccine free to children through 18 who are on Medicaid, uninsured or underinsured.",
    summary: "Vaccines for Children is the federal programme that buys vaccines for children who might otherwise go without. HPV vaccine is on the schedule, recommended at 11 to 12 and available through 18 under the programme. Eligibility is by insurance status; the vaccine itself is free, though a provider may charge an administration fee that cannot be a barrier to vaccination. For insured families, most plans must cover recommended vaccines without cost sharing.",
    technologies: ["hpv-vaccine"], drugs: ["gardasil-9"], cancers: ["cervical", "head-and-neck"], tags: ["public"] },
  { group: "hpv", id: "gavi-hpv-programme", name: "Gavi HPV vaccine support", url: "https://www.gavi.org/types-support/vaccine-support/human-papillomavirus", maintainer: "Gavi, the Vaccine Alliance",
    holds: "Financing and supply of HPV vaccine for national programmes in lower-income countries, so that girls can be vaccinated free through their health system; the page lists the countries supported and how the programme has grown.",
    tldr: "Gavi pays for HPV vaccine in lower-income countries so national programmes can give it to girls for free, where cervical cancer kills most.",
    summary: "Most cervical cancer deaths happen in low- and middle-income countries with little screening, which makes vaccination the most effective tool available. Gavi co-finances HPV vaccine introduction and supply for eligible countries and, since the shift to a single-dose schedule endorsed by the WHO, has been able to reach far more girls with the same doses. The programme page lists supported countries and progress. For a family in a supported country, the vaccine is free through the national immunisation programme.",
    technologies: ["hpv-vaccine"], cancers: ["cervical"], institutions: ["who"], tags: ["public"] },

  // Helplines
  { group: "helplines", id: "nci-cancer-information-service", name: "NCI Cancer Information Service", url: "https://www.cancer.gov/contact", maintainer: "US National Cancer Institute",
    holds: "Free, confidential answers about cancer from NCI information specialists by phone (1-800-4-CANCER), live chat and email, in English and Spanish, including help finding clinical trials.",
    tldr: "Call 1-800-4-CANCER and a trained NCI specialist answers your questions about any cancer, free, in English or Spanish.",
    summary: "The Cancer Information Service is the National Cancer Institute's public help line. Information specialists answer questions about diagnosis, treatment, side effects, trials and NCI's own PDQ summaries, and can search for trials that match a caller's situation. It is free, confidential and open to anyone anywhere, though the trial search focuses on the US. OnCo's plain-language records draw on the same PDQ source the specialists use.",
    related: ["cancer-gov-pdq"], institutions: ["nci"], tags: ["helpline"] },
  { group: "helplines", id: "macmillan-support-line", name: "Macmillan Support Line", url: "https://www.macmillan.org.uk/", maintainer: "Macmillan Cancer Support",
    holds: "Free UK support line (0808 808 00 00, seven days a week) with cancer nurses, welfare rights and financial guidance advisers, and work support, plus an online community and local information centres.",
    tldr: "Macmillan's free line, 0808 808 00 00, puts you through to a nurse, a benefits adviser or a money adviser, seven days a week.",
    summary: "The Macmillan Support Line is the UK's main charity helpline for anyone affected by cancer. Nurses answer clinical questions, welfare rights advisers help with benefits claims, financial guides help with money and energy costs, and work support advisers cover employment rights. Macmillan also gives one-off grants and runs information and support centres in many hospitals. Calls are free from UK landlines and mobiles.",
    related: ["src-macmillan"], institutions: ["macmillan-cancer-support"], tags: ["helpline"] },
  { group: "helplines", id: "cruk-nurse-helpline", name: "Cancer Research UK nurse helpline", url: "https://www.cancerresearchuk.org/about-cancer", maintainer: "Cancer Research UK",
    holds: "Free confidential nurse helpline (0808 800 4040, Monday to Friday) alongside Cancer Research UK's About Cancer pages and the Cancer Chat online forum.",
    tldr: "Cancer Research UK's nurses answer questions on 0808 800 4040, free, on weekdays; the About Cancer pages and Cancer Chat forum are there the rest of the time.",
    summary: "Cancer Research UK's information nurses take calls from patients, relatives and anyone worried about symptoms, explaining tests, treatments and trial results in plain terms. The same team maintains the About Cancer pages, which are among the clearest patient information in English and which OnCo cites, and moderates Cancer Chat, a free online forum. The line is free from UK phones.",
    related: ["src-cruk-about-cancer"], institutions: ["cruk"], tags: ["helpline"] },
  { group: "helplines", id: "acs-cancer-helpline", name: "American Cancer Society helpline", url: "https://www.cancer.org/support-programs-and-services.html", maintainer: "American Cancer Society",
    holds: "The ACS National Cancer Information Center on 1-800-227-2345, open around the clock, with cancer information specialists, help finding lodging and rides, and a live chat; plus the Cancer Survivors Network online community.",
    tldr: "The American Cancer Society answers 1-800-227-2345 every hour of every day, free, and can connect callers to its free rides and lodging programmes.",
    summary: "The ACS helpline is the largest cancer information service in the US. Specialists answer questions about cancer, treatment and side effects, point callers to local resources, and take requests for Road To Recovery rides and Hope Lodge stays. It is free and available in English and Spanish with interpreters for other languages.",
    related: ["american-cancer-society", "acs-road-to-recovery", "acs-hope-lodge"], tags: ["helpline"] },
  { group: "helplines", id: "cancercare", name: "CancerCare", url: "https://www.cancercare.org/", maintainer: "CancerCare",
    holds: "Free counselling by oncology social workers, support groups, education workshops, publications and limited financial assistance for anyone affected by cancer in the United States, through the Hopeline 800-813-HOPE (4673).",
    tldr: "CancerCare's oncology social workers give free counselling and support groups by phone and online to anyone in the US affected by cancer.",
    summary: "CancerCare has provided free professional support since 1944. Its staff are licensed oncology social workers who offer individual counselling, run support groups by phone and online, and help with practical problems such as transport and child care through small grants. Its Hopeline is free, and its publications and workshops are open to anyone. Financial assistance is limited to specific needs and is means-tested.",
    technologies: ["psycho-oncology"], tags: ["helpline", "patient-org"] },
  { group: "helplines", id: "cancer-support-community", name: "Cancer Support Community", url: "https://www.cancersupportcommunity.org/", maintainer: "Cancer Support Community",
    holds: "The Cancer Support Helpline (888-793-9355), free counselling and navigation, the MyLifeLine online community, and a network of local Cancer Support Community and Gilda's Club centres offering free programmes.",
    tldr: "The Cancer Support Community runs a free helpline and dozens of local centres, including Gilda's Clubs, where anyone with cancer can join free groups and classes.",
    summary: "Formed by the merger of The Wellness Community and Gilda's Club, the Cancer Support Community is the largest professionally led network of free cancer support in the US. Its helpline is staffed by counsellors and navigators who can also help with finances and insurance questions, its centres run free support groups, exercise and nutrition classes, and its research institute studies the psychosocial needs of patients. Everything for patients and families is free.",
    technologies: ["psycho-oncology"], tags: ["helpline", "patient-org"] },
  { group: "helplines", id: "krebsinformationsdienst", name: "Krebsinformationsdienst (KID)", url: "https://www.krebsinformationsdienst.de/", maintainer: "German Cancer Research Center (DKFZ)",
    holds: "Germany's free cancer information service from the DKFZ: a free phone line (0800 420 30 40, every day) and email service staffed by doctors, plus evidence-based information in German on every cancer.",
    tldr: "In Germany, the DKFZ's Krebsinformationsdienst answers questions about cancer free on 0800 420 30 40, every day, staffed by doctors.",
    summary: "The Krebsinformationsdienst is the German Cancer Research Center's public information service, funded by the federal and Baden-Wuerttemberg governments. Doctors answer questions by phone and email in German, and the website carries detailed, referenced information on cancers, treatments, trials and living with cancer. It is free and independent of industry, and it is the German equivalent of the NCI Cancer Information Service.",
    institutions: ["dkfz"], tags: ["helpline"] },
  { group: "helplines", id: "breast-cancer-now-helpline", name: "Breast Cancer Now helpline", url: "https://breastcancernow.org/", maintainer: "Breast Cancer Now",
    holds: "Free UK helpline (0808 800 6000) staffed by breast care nurses, the Someone Like Me peer support service, Moving Forward courses after treatment, and information on free NHS breast prostheses and reconstruction.",
    tldr: "Breast Cancer Now's nurses answer 0808 800 6000 free, and the charity runs free courses and peer support for people finishing breast cancer treatment in the UK.",
    summary: "Breast Cancer Now is the UK's breast cancer research and support charity. Its helpline is answered by specialist nurses, its Someone Like Me service pairs callers with a trained volunteer who has had a similar diagnosis, and its Moving Forward courses help people adjust after treatment. Its information pages explain what the NHS provides free after surgery, including breast prostheses. All services for patients are free.",
    cancers: ["breast-cancer"], tags: ["helpline", "patient-org"] },

  // Rides, flights, lodging
  { group: "travel", id: "acs-road-to-recovery", name: "ACS Road To Recovery", url: "https://www.cancer.org/support-programs-and-services/road-to-recovery.html", maintainer: "American Cancer Society",
    holds: "Free rides to and from cancer treatment in the United States, driven by trained volunteers, booked through the ACS helpline; availability depends on where volunteers are.",
    tldr: "Road To Recovery is the American Cancer Society's free volunteer driving service for getting to treatment appointments.",
    summary: "Many patients miss or delay treatment because they cannot get there. Road To Recovery matches patients who can walk unaided to volunteer drivers who take them to and from appointments at no cost. Rides are requested through the ACS helpline, ideally several days ahead, and coverage varies by area because it depends on local volunteers. Where no driver is available the helpline can suggest other transport help.",
    related: ["american-cancer-society", "acs-cancer-helpline"], tags: ["patient-programme"] },
  { group: "travel", id: "acs-hope-lodge", name: "ACS Hope Lodge", url: "https://www.cancer.org/support-programs-and-services/patient-lodging/hope-lodge.html", maintainer: "American Cancer Society",
    holds: "Free lodging for cancer patients and one caregiver who must travel away from home for treatment, at Hope Lodge communities across the United States, with kitchens, laundry and shared spaces.",
    tldr: "Hope Lodge gives patients and a caregiver a free place to stay near the hospital when treatment is far from home.",
    summary: "Hope Lodge communities are run by the American Cancer Society in cities with major cancer centres. Patients in active outpatient treatment who live a set distance away can stay free with one caregiver, for as long as treatment lasts, with private rooms and shared kitchens and living areas. Referral comes through the treating hospital or the ACS helpline; demand is high and rooms are allocated by availability.",
    related: ["american-cancer-society", "acs-cancer-helpline"], tags: ["patient-programme"] },
  { group: "travel", id: "corporate-angel-network", name: "Corporate Angel Network", url: "https://www.corpangelnetwork.org/", maintainer: "Corporate Angel Network",
    holds: "Free flights for cancer patients, bone marrow donors and recipients travelling to treatment or trials in the United States, using empty seats on corporate aircraft; patients must be able to travel without medical support.",
    tldr: "Corporate Angel Network flies cancer patients to distant treatment for free, in empty seats on company jets.",
    summary: "Since 1981 Corporate Angel Network has arranged free flights for patients who need to reach a treatment centre far from home, using seats that would otherwise be empty on corporate flights. There is no financial eligibility test; patients must be medically stable and able to board unaided, and flights depend on where corporate aircraft are going. It is particularly useful for people travelling to trials at a distant centre.",
    tags: ["patient-programme"] },
  { group: "travel", id: "ronald-mcdonald-house-charities", name: "Ronald McDonald House Charities", url: "https://rmhc.org/", maintainer: "Ronald McDonald House Charities",
    holds: "Free or low-cost accommodation and meals for families of children being treated in hospital, at Ronald McDonald Houses near children's hospitals in many countries, plus Family Rooms inside hospitals.",
    tldr: "Ronald McDonald Houses give families of seriously ill children, including children with cancer, a free or low-cost place to stay next to the hospital.",
    summary: "Ronald McDonald House Charities runs hundreds of Houses and hospital Family Rooms worldwide. Families of children in treatment can stay close to the hospital, often for the whole course of treatment, at no or nominal cost; referral comes from the hospital's social work team. For childhood cancer, where treatment runs for months at a specialist centre, it is one of the largest sources of free lodging.",
    tags: ["patient-programme"] },
  { group: "travel", id: "nhs-healthcare-travel-costs-scheme", name: "NHS Healthcare Travel Costs Scheme", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/healthcare-travel-costs-scheme-htcs/", maintainer: "NHS England",
    holds: "Refund of the cost of travel to NHS hospital appointments for patients on qualifying benefits or with a low income (HC2 or HC3 certificate), claimed at the hospital or by post within three months.",
    tldr: "If you are on certain benefits or a low income in England, the NHS refunds your travel costs to hospital appointments, including cancer treatment.",
    summary: "The Healthcare Travel Costs Scheme repays fares or mileage for NHS-referred hospital appointments to people who receive qualifying benefits or hold an HC2 or HC3 certificate under the NHS Low Income Scheme. Claims are made at the hospital cashier or by post within three months, and the cost of a travelling companion is covered when medically necessary. It is small but it removes one of the commonest reasons for missed appointments. Macmillan advisers can help with the claim.",
    related: ["macmillan-support-line"], tags: ["public"] },
  { group: "travel", id: "young-lives-vs-cancer", name: "Young Lives vs Cancer", url: "https://www.younglivesvscancer.org.uk/", maintainer: "Young Lives vs Cancer (formerly CLIC Sargent)",
    holds: "Free Homes from Home accommodation near specialist children's and young people's cancer hospitals in the UK, social workers based in treatment centres, and grants for families of children and young people up to 25.",
    tldr: "Young Lives vs Cancer gives families of children and young people with cancer a free place to stay near the hospital and a social worker on the ward.",
    summary: "Young Lives vs Cancer, formerly CLIC Sargent, supports children and young people up to 25 with cancer in the UK. Its Homes from Home are free houses next to principal treatment centres where families stay for as long as treatment requires; its social workers, based in the hospitals, help with money, school, work and emotional support; and it gives registration grants and other financial help. All services are free.",
    tags: ["patient-programme", "patient-org"] },

  // Second opinions (Cancer Commons already has a company record, linked from the service list; it links back to this one)
  { group: "second-opinion", id: "thesecondopinion", related: ["cancer-commons"], name: "thesecondopinion", url: "https://thesecondopinion.org/", maintainer: "thesecondopinion",
    holds: "Free multidisciplinary second opinions for adults with cancer in California: a panel of volunteer oncologists, surgeons, radiologists and pathologists reviews the case and meets the patient, with a written summary for the treating doctors.",
    tldr: "In California, thesecondopinion gives adults with cancer a free review of their diagnosis and treatment plan by a panel of volunteer cancer specialists.",
    summary: "thesecondopinion has offered free second opinions in San Francisco since 1969. A patient sends their records; a panel of volunteer specialists from different disciplines reviews the pathology, imaging and plan, then meets the patient and family to explain their view, and sends a written report to the treating team. The service is limited to adults with a cancer diagnosis in California, and it is free because the clinicians volunteer their time.",
    tags: ["patient-programme"] },

  // Trials
  { group: "trials", id: "lazarex-cancer-foundation", name: "Lazarex Cancer Foundation", url: "https://lazarex.org/", maintainer: "Lazarex Cancer Foundation",
    holds: "Reimbursement of travel, lodging and related costs for patients and a companion taking part in FDA clinical trials in the United States, plus help identifying trials, so that cost does not decide who can enrol.",
    tldr: "Lazarex pays the travel and lodging costs that stop people joining cancer trials in the US, and helps them find a trial in the first place.",
    summary: "Clinical trials supply the study drug and trial-related tests free, but travel and time away from work fall on the patient and are the reason many people, especially those on low incomes, never enrol. Lazarex reimburses those out-of-pocket costs for patients and a companion for the duration of the trial, with income-based eligibility, and runs programmes with cancer centres to improve access for under-represented communities. Applications go through the foundation's website.",
    related: ["clinicaltrials-gov"], terms: ["financial-toxicity"], tags: ["patient-programme"] },
  { group: "trials", id: "nihr-be-part-of-research", name: "Be Part of Research (NIHR)", url: "https://bepartofresearch.nihr.ac.uk/", maintainer: "National Institute for Health and Care Research",
    holds: "The UK's public register of health studies looking for volunteers, including cancer trials, searchable by condition and location, with a sign-up service that contacts you when a suitable study opens.",
    tldr: "Be Part of Research is the UK's free service for finding trials near you; taking part in NHS trials costs nothing and expenses are often paid.",
    summary: "Be Part of Research is run by the National Institute for Health and Care Research. Anyone can search studies by condition and postcode, or register to be contacted when a matching study opens. In the UK, taking part in an NHS-hosted trial is free, the study drug is supplied by the sponsor, and most trials reimburse reasonable travel costs, which the study team will state. It complements ClinicalTrials.gov, where every trial on OnCo is linked.",
    related: ["clinicaltrials-gov"], tags: ["public"] },

  // Genetic counselling
  { group: "genetics", id: "force-facing-our-risk", name: "FORCE: Facing Our Risk of Cancer Empowered", url: "https://www.facingourrisk.org/", maintainer: "FORCE",
    holds: "Free helpline, peer navigation, expert-reviewed information and support groups for people with hereditary cancer risk (BRCA, Lynch syndrome and other inherited syndromes), including help understanding test results and options.",
    tldr: "FORCE gives free information, a helpline and peer navigators to anyone facing an inherited cancer risk such as a BRCA or Lynch syndrome gene change.",
    summary: "FORCE is the largest US organisation for people affected by hereditary cancer. Its peer navigation programme matches people with a trained volunteer who has faced the same gene change and decisions; its helpline and expert-reviewed pages explain testing, surveillance, risk-reducing surgery and trials in plain language; and it runs support groups and an annual conference. Services are free and open to anyone, and its content is used internationally.",
    targets: ["brca"], terms: ["hereditary-cancer-syndromes", "lynch-syndrome"], technologies: ["germline-testing"], tags: ["patient-org"] },
  { group: "genetics", id: "sharsheret", name: "Sharsheret", url: "https://sharsheret.org/", maintainer: "Sharsheret",
    holds: "Free support for Jewish women and families facing breast and ovarian cancer or elevated genetic risk, including a genetics programme with genetic counsellors on staff, peer support and clinical social workers.",
    tldr: "Sharsheret offers Jewish women free access to genetic counsellors, peer supporters and social workers for breast and ovarian cancer and inherited risk.",
    summary: "Sharsheret is a US national organisation serving Jewish women and families, a community with a high rate of BRCA founder variants. Its genetics programme lets anyone speak with a certified genetic counsellor about family history, testing and results at no cost; its peer support network pairs callers with a woman who has had a similar experience; and its social workers help with the practical and emotional load. Services are free and open to all, regardless of background.",
    targets: ["brca"], cancers: ["breast-cancer", "ovarian"], terms: ["hereditary-cancer-syndromes"], related: ["nhs-jewish-brca-testing"], tags: ["patient-org"] },

  // Survivorship, rehabilitation, support
  { group: "survivorship", id: "maggies-centres", name: "Maggie's", url: "https://www.maggies.org/", maintainer: "Maggie's",
    holds: "Free practical, emotional and social support for anyone with cancer and their families in purpose-built centres next to NHS cancer hospitals across the UK: cancer support specialists, benefits advice, psychological support, exercise and relaxation groups, without appointment or referral.",
    tldr: "Maggie's centres sit next to NHS cancer hospitals and anyone can walk in, free, for support, benefits advice or a cup of tea.",
    summary: "Maggie's runs centres in the grounds of NHS cancer hospitals throughout the UK, plus a few abroad. Each is staffed by cancer support specialists, benefits advisers and psychologists, and runs courses such as Where Now for people finishing treatment, exercise and nutrition sessions, and groups for families. No referral or appointment is needed and everything is free. It is the model for hospital-adjacent support that other countries have copied.",
    technologies: ["psycho-oncology", "survivorship-care-plan"], tags: ["patient-org"] },
  { group: "survivorship", id: "penny-brohn-uk", name: "Penny Brohn UK", url: "https://www.pennybrohn.org.uk/", maintainer: "Penny Brohn UK",
    holds: "Free Living Well courses and one-to-one services for people with cancer and their supporters, in Bristol and online, covering nutrition, physical activity, sleep, stress and emotional wellbeing.",
    tldr: "Penny Brohn UK runs free courses and sessions on living well with cancer, in person in Bristol and online across the UK.",
    summary: "Penny Brohn UK is a charity that offers a whole-person approach alongside medical treatment. Its Living Well course covers eating, moving, resting and coping, and it provides free individual sessions with nutritional therapists, counsellors and other practitioners. Services are free to people with cancer and their supporters, funded by donations. It does not offer alternative treatment and works alongside the NHS.",
    technologies: ["exercise-oncology", "psycho-oncology"], tags: ["patient-org"] },
  { group: "survivorship", id: "livestrong-at-the-ymca", name: "LIVESTRONG at the YMCA", url: "https://www.livestrong.org/", maintainer: "Livestrong Foundation and YMCA of the USA",
    holds: "A free twelve-week small-group exercise programme for adult cancer survivors at participating YMCAs in the United States, led by trained instructors, with a YMCA membership included for the duration.",
    tldr: "LIVESTRONG at the YMCA is a free twelve-week exercise programme for adults who have had cancer, run at YMCAs across the US.",
    summary: "Exercise after cancer treatment improves fitness, fatigue and quality of life, and structured programmes are now recommended in guidelines. LIVESTRONG at the YMCA delivers one: adult survivors meet twice a week for twelve weeks with instructors trained in cancer exercise, and participants get a Y membership for the programme. It is free at participating YMCAs and the Livestrong site lists locations.",
    technologies: ["structured-exercise-survivorship", "exercise-oncology"], tags: ["patient-programme"] },
  { group: "survivorship", id: "look-good-feel-better", name: "Look Good Feel Better", url: "https://lookgoodfeelbetter.org/", maintainer: "Look Good Feel Better (US) and Look Good Feel Better UK",
    holds: "Free skincare and make-up workshops, in person and online, for people dealing with the visible effects of cancer treatment, with a free kit of donated products; run in the US, the UK and many other countries.",
    tldr: "Look Good Feel Better runs free workshops that teach people having cancer treatment how to manage skin, brow and hair changes, with a free product kit.",
    summary: "Look Good Feel Better began in the US in 1989 and now runs in more than twenty countries, in the UK as a separate charity. Volunteer beauty professionals run free group workshops, in hospitals, centres and online, covering skincare during treatment, drawing brows, managing lashes, and wigs and head coverings, and participants receive a kit of donated products. It is open to anyone with cancer, without referral.",
    technologies: ["wigs-cranial-prosthesis", "scalp-cooling"], extraLinks: [{ label: "Look Good Feel Better UK", url: "https://lookgoodfeelbetter.co.uk/" }], tags: ["patient-programme"] },
  { group: "survivorship", id: "imerman-angels", name: "Imerman Angels", url: "https://imermanangels.org/", maintainer: "Imerman Angels",
    holds: "Free one-to-one peer mentoring: anyone with cancer, a survivor or a carer is matched with a Mentor Angel who has had the same cancer, at a similar age, anywhere in the world.",
    tldr: "Imerman Angels matches you free with someone who has been through the same cancer, so you can talk to a person who understands.",
    summary: "Founded by a young testicular cancer survivor, Imerman Angels matches patients, survivors, previvors and carers with a trained volunteer who has faced the same diagnosis, matching on cancer type, age and situation. Matches are made anywhere in the world and the service is free. Peer support of this kind is one of the interventions people with cancer rate most highly.",
    technologies: ["psycho-oncology"], tags: ["patient-org"] },
  { group: "survivorship", id: "first-descents", name: "First Descents", url: "https://firstdescents.org/", maintainer: "First Descents",
    holds: "Free outdoor adventure programmes (kayaking, climbing, surfing) for young adults aged 18 to 39 with cancer and other serious conditions, including travel scholarships, in the United States.",
    tldr: "First Descents takes young adults with cancer on free week-long outdoor adventures, with the travel paid for too.",
    summary: "First Descents runs week-long kayaking, climbing and surfing programmes for young adults with cancer, and for those living with other serious illnesses, at no cost. Adolescents and young adults are the group most under-served by cancer support, and the programmes are built around peer connection as much as adventure. Travel scholarships cover getting there.",
    tags: ["patient-org"] },
  { group: "survivorship", id: "kesem", name: "Kesem", url: "https://www.kesem.org/", maintainer: "Kesem",
    holds: "Free summer camps and year-round support for children aged 6 to 18 whose parent has, or has had, cancer, run by college student volunteers at chapters across the United States.",
    tldr: "Kesem runs free summer camps for children whose mum or dad has cancer, staffed by college student volunteers across the US.",
    summary: "Children of parents with cancer carry a burden that cancer services rarely address. Kesem, which began as Camp Kesem at Stanford, runs free week-long summer camps and year-round activities for these children through university chapters nationwide, staffed by trained student volunteers. Camps are free to families and funded by donations.",
    tags: ["patient-org"] },

  // Wigs and prostheses
  { group: "wigs", id: "little-princess-trust", name: "The Little Princess Trust", url: "https://www.littleprincesses.org.uk/", maintainer: "The Little Princess Trust",
    holds: "Free real-hair wigs for children and young people up to 24 who have lost their hair through cancer treatment or other conditions, made from donated hair, in the UK and Ireland; the charity also funds childhood cancer research.",
    tldr: "The Little Princess Trust gives free real-hair wigs to children and young people up to 24 who lose their hair to cancer treatment.",
    summary: "The Little Princess Trust was founded by the parents of a girl who died of a Wilms tumour. It supplies free real-hair wigs, made from donated ponytails, to children and young people up to 24 across the UK and Ireland, fitted by approved salons, and has become one of the largest charity funders of childhood cancer research in the UK. Requests come through the charity's website or the hospital team.",
    technologies: ["wigs-cranial-prosthesis"], tags: ["patient-org"] },
  { group: "wigs", id: "knitted-knockers", name: "Knitted Knockers", url: "https://www.knittedknockers.org/", maintainer: "Knitted Knockers Support Foundation",
    holds: "Free handmade, soft knitted breast prostheses for women who have had a mastectomy or lumpectomy, made by volunteers and posted on request, with the pattern published for knitting groups worldwide.",
    tldr: "Knitted Knockers posts free soft knitted breast prostheses to anyone who has had breast surgery, made by volunteer knitters.",
    summary: "Knitted Knockers are soft, light breast prostheses knitted by volunteers to a published pattern. They can be worn soon after surgery when silicone prostheses are too heavy or the scar is tender, and can be adjusted or fitted with a nipple. The foundation posts them free on request in the US and affiliated groups do the same in other countries; the pattern is free for any knitter.",
    cancers: ["breast-cancer"], terms: ["mastectomy"], tags: ["patient-org"] },
  { group: "wigs", id: "wigs-for-kids", name: "Wigs for Kids", url: "https://www.wigsforkids.org/", maintainer: "Wigs for Kids",
    holds: "Free custom hair replacements for children under 18 in the United States who have lost their hair through chemotherapy, radiotherapy, alopecia, burns or other causes, made from donated hair.",
    tldr: "Wigs for Kids gives children in the US who lose their hair to cancer treatment a free custom-made hairpiece.",
    summary: "Wigs for Kids has made hair replacements for children since 1981. Each is custom-fitted from donated hair so that a child can swim and play in it, and it is provided free to families of children under 18 with hair loss from any medical cause, including chemotherapy and radiotherapy. Applications are made through the website with a doctor's note.",
    technologies: ["wigs-cranial-prosthesis"], tags: ["patient-org"] },
];

const uniq = (xs: string[]) => [...new Set(xs)];

/** Collection records for the free programmes and organisations. Same-group records reference each other so every record has an inbound link. */
export const freeCollections: CollectionInput[] = ROWS.map(({ group, extraLinks, ...x }) => ({
  kind: "collection", asOf, links: [{ label: x.name, url: x.url }, ...(extraLinks ?? [])], ...x,
  tags: uniq(["free", ...(x.tags ?? [])]),
  related: uniq([...(x.related ?? []), ...ROWS.filter((r) => r.group === group && r.id !== x.id).map((r) => r.id)]),
}));

/** One free thing a person can get. `collection` is the OnCo record for the programme (a collection above, or an existing company record); `entityIds` are OnCo pages to show as pills. */
export type FreeService = {
  id: string;
  group: FreeGroup;
  name: string;
  /** Who is eligible, in plain words. */
  who: string;
  /** Country or region, short. */
  where: string;
  /** What you get. */
  what: string;
  url: string;
  /** Free phone number, when the service is a helpline. */
  phone?: string;
  collection?: string;
  entityIds?: string[];
  /** An OnCo page that goes deeper. */
  internal?: { href: string; label: string };
};

const s = (x: FreeService): FreeService => x;

export const freeServices: FreeService[] = [
  // Testing
  s({ id: "know-your-tumor", group: "testing", name: "PanCAN Know Your Tumor", who: "People with pancreatic cancer, through their oncologist", where: "US", what: "Free tumour sequencing with a report for the treating team.", url: "https://pancan.org/facing-pancreatic-cancer/patient-services/know-your-tumor/", collection: "pancan-know-your-tumor", entityIds: ["pancreatic", "cgp", "pancan"] }),
  s({ id: "promise-registry", group: "testing", name: "PROMISE registry germline testing", who: "Men with a prostate cancer diagnosis", where: "US", what: "Free at-home saliva test for inherited cancer genes, with genetic counselling for carriers.", url: "https://www.prostatecancerpromise.org/", collection: "prostate-cancer-promise", entityIds: ["prostate", "germline-testing"] }),
  s({ id: "nhs-gms", group: "testing", name: "NHS Genomic Medicine Service", who: "NHS patients whose cancer is listed in the National Genomic Test Directory", where: "England", what: "Tumour panels, whole genome sequencing for some cancers and germline testing, ordered by your hospital team.", url: "https://www.england.nhs.uk/genomics/nhs-genomic-med-service/", collection: "nhs-genomic-medicine-service", entityIds: ["cgp", "wes-wgs", "germline-testing"], internal: { href: "/tumour-testing/", label: "Compare tumour sequencing tests" } }),
  s({ id: "jewish-brca", group: "testing", name: "NHS Jewish BRCA Testing Programme", who: "Adults in England with at least one Jewish grandparent", where: "England", what: "Free BRCA1 and BRCA2 saliva test at home, with counselling if a variant is found.", url: "https://www.jewishbrca.org/", collection: "nhs-jewish-brca-testing", entityIds: ["brca", "hereditary-cancer-syndromes"] }),

  // Screening
  s({ id: "nhs-screening", group: "screening", name: "NHS bowel, breast and cervical screening", who: "Invited by age through your GP registration; lung screening for people 55 to 74 who smoke or used to", where: "UK", what: "Home bowel test kit, mammograms and cervical screening, free; lung CT screening rolling out in England.", url: "https://www.nhs.uk/conditions/nhs-screening/", collection: "nhs-cancer-screening-programmes", entityIds: ["colorectal-screening", "mammography", "nhs-targeted-lung-health-check"] }),
  s({ id: "au-screening", group: "screening", name: "Australia's national screening programs", who: "Residents in the eligible age ranges, invited automatically", where: "Australia", what: "Free bowel kit, mammograms, cervical HPV test with self-collection, and lung CT screening since 2025.", url: "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program", collection: "australia-cancer-screening-programs", entityIds: ["colorectal-screening", "mammography", "low-dose-ct-screening"] }),
  s({ id: "ie-screening", group: "screening", name: "BowelScreen, BreastCheck and CervicalCheck", who: "Residents in the eligible age ranges; register online if you have not been invited", where: "Ireland", what: "Free bowel, breast and cervical screening through the HSE National Screening Service.", url: "https://www.screeningservice.ie/", collection: "ireland-national-screening-service" }),
  s({ id: "nz-screening", group: "screening", name: "Time to Screen", who: "Eligible New Zealanders by age; cervical screening free for eligible groups", where: "New Zealand", what: "National bowel, breast and cervical screening, with enrolment on one site.", url: "https://www.timetoscreen.nz/", collection: "nz-time-to-screen" }),
  s({ id: "nbccedp", group: "screening", name: "CDC breast and cervical screening for uninsured women", who: "Women with low income and no or limited insurance", where: "US", what: "Free or low-cost mammograms, Pap and HPV tests and diagnostic follow-up through your state programme.", url: "https://www.cdc.gov/breast-cervical-cancer-screening/", collection: "cdc-nbccedp", entityIds: ["mammography", "breast-cancer", "cervical"] }),
  s({ id: "aca-preventive", group: "screening", name: "No-cost preventive screening under US health plans", who: "Anyone with a marketplace, employer or Medicare plan, for screening rated A or B by the US Preventive Services Task Force", where: "US", what: "Colorectal, breast, cervical and lung cancer screening without copay or deductible when done in network.", url: "https://www.healthcare.gov/preventive-care-adults/", entityIds: ["colorectal-screening", "mammography", "low-dose-ct-screening"] }),

  // HPV
  s({ id: "nhs-hpv", group: "hpv", name: "NHS HPV vaccine", who: "School Year 8 pupils; anyone who missed it until their 25th birthday; men who have sex with men up to 45", where: "UK", what: "Free HPV vaccination at school, GP or sexual health clinic.", url: "https://www.nhs.uk/vaccinations/hpv-vaccine/", collection: "nhs-hpv-vaccination", entityIds: ["hpv-vaccine", "gardasil-9", "cervical"] }),
  s({ id: "vfc-hpv", group: "hpv", name: "Vaccines for Children program", who: "Children through 18 who are Medicaid-eligible, uninsured, underinsured or American Indian or Alaska Native", where: "US", what: "Free HPV vaccine through enrolled providers; insured children are usually covered without cost sharing.", url: "https://www.cdc.gov/vaccines-for-children/", collection: "us-vaccines-for-children", entityIds: ["hpv-vaccine", "gardasil-9"] }),
  s({ id: "au-nip-hpv", group: "hpv", name: "National Immunisation Program (HPV)", who: "Young people through school programmes, with free catch-up to age 25", where: "Australia", what: "Free HPV vaccination under the National Immunisation Program.", url: "https://www.health.gov.au/our-work/national-immunisation-program", entityIds: ["hpv-vaccine"] }),
  s({ id: "gavi-hpv", group: "hpv", name: "Gavi-supported national HPV programmes", who: "Girls in countries whose HPV programme Gavi supports", where: "Lower-income countries", what: "Free HPV vaccine through the national immunisation programme.", url: "https://www.gavi.org/types-support/vaccine-support/human-papillomavirus", collection: "gavi-hpv-programme", entityIds: ["hpv-vaccine", "cervical"] }),

  // Helplines
  s({ id: "nci-cis", group: "helplines", name: "NCI Cancer Information Service", who: "Anyone", where: "US (calls from anywhere)", what: "Information specialists by phone, chat and email, in English and Spanish, including trial searches.", url: "https://www.cancer.gov/contact", phone: "1-800-4-CANCER (1-800-422-6237)", collection: "nci-cancer-information-service", entityIds: ["cancer-gov-pdq", "nci"] }),
  s({ id: "macmillan-line", group: "helplines", name: "Macmillan Support Line", who: "Anyone affected by cancer", where: "UK", what: "Nurses, welfare rights and money advisers, seven days a week.", url: "https://www.macmillan.org.uk/", phone: "0808 808 00 00", collection: "macmillan-support-line", entityIds: ["macmillan-cancer-support"] }),
  s({ id: "cruk-nurses", group: "helplines", name: "Cancer Research UK nurse helpline", who: "Anyone", where: "UK", what: "Cancer nurses on weekdays; About Cancer pages and the Cancer Chat forum at any time.", url: "https://www.cancerresearchuk.org/about-cancer", phone: "0808 800 4040", collection: "cruk-nurse-helpline", entityIds: ["cruk"] }),
  s({ id: "acs-line", group: "helplines", name: "American Cancer Society helpline", who: "Anyone", where: "US", what: "Around-the-clock information specialists; the same line books free rides and lodging.", url: "https://www.cancer.org/support-programs-and-services.html", phone: "1-800-227-2345", collection: "acs-cancer-helpline", entityIds: ["american-cancer-society"] }),
  s({ id: "cancercare-line", group: "helplines", name: "CancerCare Hopeline", who: "Anyone affected by cancer", where: "US", what: "Free counselling by oncology social workers, support groups and small grants.", url: "https://www.cancercare.org/", phone: "800-813-HOPE (4673)", collection: "cancercare", entityIds: ["psycho-oncology"] }),
  s({ id: "csc-line", group: "helplines", name: "Cancer Support Helpline", who: "Anyone affected by cancer", where: "US", what: "Counsellors and navigators, plus free programmes at local centres and Gilda's Clubs.", url: "https://www.cancersupportcommunity.org/", phone: "888-793-9355", collection: "cancer-support-community" }),
  s({ id: "lls-specialists", group: "helplines", name: "LLS Information Specialists", who: "Anyone affected by a blood cancer", where: "US", what: "Oncology professionals who explain diagnosis and treatment and help find trials.", url: "https://www.lls.org/", phone: "800-955-4572", entityIds: ["leukemia-lymphoma-society"] }),
  s({ id: "kid-line", group: "helplines", name: "Krebsinformationsdienst", who: "Anyone", where: "Germany", what: "Doctors answer questions by phone and email, every day, in German.", url: "https://www.krebsinformationsdienst.de/", phone: "0800 420 30 40", collection: "krebsinformationsdienst", entityIds: ["dkfz"] }),
  s({ id: "cancer-council-line", group: "helplines", name: "Cancer Council 13 11 20", who: "Anyone", where: "Australia", what: "Cancer nurses and information about screening, treatment and support in each state.", url: "https://www.cancer.org.au/", phone: "13 11 20" }),
  s({ id: "ccs-line", group: "helplines", name: "Canadian Cancer Society helpline", who: "Anyone", where: "Canada", what: "Information specialists in English and French, and the Community Services Locator.", url: "https://cancer.ca/en/", phone: "1-888-939-3333" }),
  s({ id: "ics-line", group: "helplines", name: "Irish Cancer Society Support Line", who: "Anyone", where: "Ireland", what: "Cancer nurses by phone and email, and Daffodil Centres in hospitals.", url: "https://www.cancer.ie/", phone: "1800 200 700" }),
  s({ id: "bcn-line", group: "helplines", name: "Breast Cancer Now helpline", who: "Anyone affected by breast cancer", where: "UK", what: "Breast care nurses, Someone Like Me peer support and Moving Forward courses.", url: "https://breastcancernow.org/", phone: "0808 800 6000", collection: "breast-cancer-now-helpline", entityIds: ["breast-cancer"] }),

  // Travel and lodging
  s({ id: "road-to-recovery", group: "travel", name: "ACS Road To Recovery", who: "Patients who can walk unaided, where volunteer drivers exist", where: "US", what: "Free volunteer rides to and from treatment, booked through the ACS helpline.", url: "https://www.cancer.org/support-programs-and-services/road-to-recovery.html", collection: "acs-road-to-recovery", entityIds: ["american-cancer-society"] }),
  s({ id: "hope-lodge", group: "travel", name: "ACS Hope Lodge", who: "Patients in outpatient treatment far from home, plus one caregiver", where: "US", what: "Free lodging near cancer centres for the length of treatment.", url: "https://www.cancer.org/support-programs-and-services/patient-lodging/hope-lodge.html", collection: "acs-hope-lodge", entityIds: ["american-cancer-society"] }),
  s({ id: "can-flights", group: "travel", name: "Corporate Angel Network", who: "Medically stable patients travelling to treatment or a trial", where: "US", what: "Free flights in empty seats on corporate aircraft; no income test.", url: "https://www.corpangelnetwork.org/", collection: "corporate-angel-network" }),
  s({ id: "rmhc", group: "travel", name: "Ronald McDonald House Charities", who: "Families of children in hospital, referred by the hospital", where: "Many countries", what: "Free or low-cost rooms and meals next to children's hospitals.", url: "https://rmhc.org/", collection: "ronald-mcdonald-house-charities" }),
  s({ id: "ylvc-homes", group: "travel", name: "Young Lives vs Cancer Homes from Home", who: "Families of children and young people up to 25 in treatment", where: "UK", what: "Free accommodation next to specialist hospitals, plus social workers and grants.", url: "https://www.younglivesvscancer.org.uk/", collection: "young-lives-vs-cancer" }),
  s({ id: "htcs", group: "travel", name: "NHS Healthcare Travel Costs Scheme", who: "Patients on qualifying benefits or with an HC2 or HC3 certificate", where: "England", what: "Refund of fares or mileage for hospital appointments, claimed within three months.", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/healthcare-travel-costs-scheme-htcs/", collection: "nhs-healthcare-travel-costs-scheme" }),

  // Second opinions and free treatment
  s({ id: "cancer-commons-svc", group: "second-opinion", name: "Cancer Commons", who: "People with advanced or hard-to-treat cancer, anywhere", where: "US-based, open worldwide", what: "A navigator reviews your records and writes up options and trials for your oncologist.", url: "https://cancercommons.org/", collection: "cancer-commons", internal: { href: "/second-opinion/", label: "Expert centres near you" } }),
  s({ id: "thesecondopinion-svc", group: "second-opinion", name: "thesecondopinion", who: "Adults with a cancer diagnosis living in California", where: "US (California)", what: "A volunteer panel of specialists reviews the case, meets you and writes to your doctors.", url: "https://thesecondopinion.org/", collection: "thesecondopinion", internal: { href: "/second-opinion/", label: "Expert centres near you" } }),
  s({ id: "st-jude-svc", group: "second-opinion", name: "St. Jude Children's Research Hospital", who: "Children referred by a physician with a cancer St. Jude is studying", where: "US", what: "Treatment, travel, housing and food with no bill to the family.", url: "https://www.stjude.org/", entityIds: ["st-jude"] }),

  // Trials
  s({ id: "nci-paying-trials", group: "trials", name: "Paying for clinical trials (NCI)", who: "Anyone considering a trial", where: "US", what: "What the sponsor pays, what insurance must cover and what falls on you, explained by the NCI.", url: "https://www.cancer.gov/about-cancer/treatment/clinical-trials/paying", entityIds: ["clinicaltrials-gov", "financial-toxicity"], internal: { href: "/evidence/", label: "Trials on OnCo" } }),
  s({ id: "nih-cc", group: "trials", name: "NIH Clinical Center", who: "People enrolled in an NIH study", where: "US", what: "Care within the study is free and some studies help with travel and lodging.", url: "https://clinicalcenter.nih.gov/", entityIds: ["nci"] }),
  s({ id: "lazarex-svc", group: "trials", name: "Lazarex Cancer Foundation", who: "Patients enrolling in FDA clinical trials, income-based", where: "US", what: "Reimbursement of travel and lodging for you and a companion, and help finding a trial.", url: "https://lazarex.org/", collection: "lazarex-cancer-foundation" }),
  s({ id: "bpor", group: "trials", name: "Be Part of Research", who: "Anyone in the UK", where: "UK", what: "Search NHS studies by condition and postcode; taking part is free and expenses are often reimbursed.", url: "https://bepartofresearch.nihr.ac.uk/", collection: "nihr-be-part-of-research" }),
  s({ id: "expanded-access", group: "trials", name: "FDA expanded access", who: "People with a serious condition and no comparable option, through their doctor", where: "US", what: "Access to an investigational drug outside a trial; the company may only recover its costs, and usually supplies it free.", url: "https://www.fda.gov/news-events/public-health-focus/expanded-access" }),

  // Drugs
  s({ id: "assistance-page", group: "drugs", name: "Financial help: manufacturer programmes, schemes and charities", who: "Depends on the product and country", where: "Worldwide", what: "Free-drug and co-pay programmes, reimbursement decisions and generics, product by product.", url: "https://onco.cc/assistance/", internal: { href: "/assistance/", label: "Open the financial help page" } }),
  s({ id: "coverage-uk-page", group: "drugs", name: "NHS coverage", who: "NHS patients", where: "UK", what: "NICE, Cancer Drugs Fund and SMC decisions for every approved product; NHS cancer drugs are free at the point of use.", url: "https://onco.cc/coverage/uk/", internal: { href: "/coverage/uk/", label: "Open NHS coverage" } }),

  // Genetics
  s({ id: "force-svc", group: "genetics", name: "FORCE peer navigation and helpline", who: "Anyone facing hereditary cancer risk", where: "US-based, open worldwide", what: "Free helpline, peer navigators and expert-reviewed information on testing and options.", url: "https://www.facingourrisk.org/", collection: "force-facing-our-risk", entityIds: ["hereditary-cancer-syndromes", "brca", "lynch-syndrome"] }),
  s({ id: "sharsheret-svc", group: "genetics", name: "Sharsheret genetics programme", who: "Jewish women and families, and anyone who asks", where: "US", what: "Speak with a certified genetic counsellor free, plus peer support and social workers.", url: "https://sharsheret.org/", collection: "sharsheret", entityIds: ["brca", "breast-cancer", "ovarian"] }),
  s({ id: "nhs-genetics-referral", group: "genetics", name: "NHS clinical genetics referral", who: "People whose family or tumour history meets the National Genomic Test Directory criteria, via GP or hospital team", where: "UK", what: "Free genetic counselling and germline testing through regional clinical genetics services.", url: "https://www.england.nhs.uk/genomics/nhs-genomic-med-service/", collection: "nhs-genomic-medicine-service", entityIds: ["germline-testing", "hereditary-cancer-syndromes"] }),

  // Survivorship and support
  s({ id: "maggies-svc", group: "survivorship", name: "Maggie's centres", who: "Anyone with cancer and their family, no referral", where: "UK", what: "Drop-in support, benefits advice, psychological support and courses next to NHS cancer hospitals.", url: "https://www.maggies.org/", collection: "maggies-centres" }),
  s({ id: "penny-brohn-svc", group: "survivorship", name: "Penny Brohn UK", who: "People with cancer and their supporters", where: "UK (Bristol and online)", what: "Free Living Well courses and one-to-one sessions on nutrition, activity, sleep and coping.", url: "https://www.pennybrohn.org.uk/", collection: "penny-brohn-uk", entityIds: ["exercise-oncology"] }),
  s({ id: "livestrong-svc", group: "survivorship", name: "LIVESTRONG at the YMCA", who: "Adult cancer survivors", where: "US", what: "Free twelve-week small-group exercise programme with a Y membership included.", url: "https://www.livestrong.org/", collection: "livestrong-at-the-ymca", entityIds: ["structured-exercise-survivorship"] }),
  s({ id: "lgfb-svc", group: "survivorship", name: "Look Good Feel Better", who: "Anyone having cancer treatment", where: "US, UK and many countries", what: "Free skincare and make-up workshops with a free kit.", url: "https://lookgoodfeelbetter.org/", collection: "look-good-feel-better", entityIds: ["wigs-cranial-prosthesis"] }),
  s({ id: "imerman-svc", group: "survivorship", name: "Imerman Angels", who: "Patients, survivors and carers, anywhere", where: "Worldwide", what: "Free one-to-one match with someone who has had the same cancer.", url: "https://imermanangels.org/", collection: "imerman-angels" }),
  s({ id: "first-descents-svc", group: "survivorship", name: "First Descents", who: "Young adults aged 18 to 39 with cancer", where: "US", what: "Free week-long outdoor adventure programmes with travel scholarships.", url: "https://firstdescents.org/", collection: "first-descents" }),
  s({ id: "kesem-svc", group: "survivorship", name: "Kesem", who: "Children aged 6 to 18 whose parent has or had cancer", where: "US", what: "Free summer camps and year-round support run by college student volunteers.", url: "https://www.kesem.org/", collection: "kesem" }),
  s({ id: "survivorship-page", group: "survivorship", name: "Survivorship planner", who: "Anyone finishing treatment", where: "Worldwide", what: "Late effects to watch for after each treatment, the screening test, how often, and the guideline that says so.", url: "https://onco.cc/survivorship/", entityIds: ["survivorship-care-plan"], internal: { href: "/survivorship/", label: "Open the survivorship planner" } }),

  // Wigs and prostheses
  s({ id: "nhs-wigs", group: "wigs", name: "Wigs and fabric supports on the NHS", who: "Under 16s, 16 to 18 in full-time education, hospital inpatients, war pensioners and people on qualifying benefits or with an HC2 certificate", where: "England", what: "Free wigs and fabric supports on prescription; others pay a set charge.", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/wigs-and-fabric-supports-on-the-nhs/", entityIds: ["wigs-cranial-prosthesis"], internal: { href: "/live/hair/", label: "Hair loss and regrowth" } }),
  s({ id: "nhs-prostheses", group: "wigs", name: "Breast prostheses on the NHS", who: "Anyone who has had breast surgery on the NHS", where: "UK", what: "A free breast prosthesis after mastectomy, fitted through the hospital; Breast Cancer Now explains how.", url: "https://breastcancernow.org/", collection: "breast-cancer-now-helpline", entityIds: ["mastectomy", "breast-cancer"] }),
  s({ id: "lpt-svc", group: "wigs", name: "The Little Princess Trust", who: "Children and young people up to 24 who have lost their hair", where: "UK and Ireland", what: "Free real-hair wigs made from donated hair.", url: "https://www.littleprincesses.org.uk/", collection: "little-princess-trust", entityIds: ["wigs-cranial-prosthesis"] }),
  s({ id: "wfk-svc", group: "wigs", name: "Wigs for Kids", who: "Children under 18 with medical hair loss", where: "US", what: "Free custom hair replacement made from donated hair.", url: "https://www.wigsforkids.org/", collection: "wigs-for-kids", entityIds: ["wigs-cranial-prosthesis"] }),
  s({ id: "knockers-svc", group: "wigs", name: "Knitted Knockers", who: "Anyone who has had a mastectomy or lumpectomy", where: "US (affiliates elsewhere)", what: "Free soft knitted breast prostheses, posted on request.", url: "https://www.knittedknockers.org/", collection: "knitted-knockers", entityIds: ["mastectomy"] }),

  // Data
  s({ id: "open-data-page", group: "data", name: "Open data: every database OnCo pulls from", who: "Researchers, builders and anyone curious", where: "Worldwide", what: "Licences, cadence and access for each open source, and the ones OnCo could add next.", url: "https://onco.cc/data-sources/", internal: { href: "/data-sources/", label: "Open the open data page" }, entityIds: ["clinicaltrials-gov", "pubmed-europepmc", "tcga-gdc", "cbioportal", "depmap", "civic", "oncokb", "cosmic", "globocan", "seer"] }),
  s({ id: "onco-snapshots", group: "data", name: "OnCo's own corpus", who: "Anyone", where: "Worldwide", what: "Every record on this site as JSON under a Creative Commons licence, with an API and machine-readable pages.", url: "https://onco.cc/api/", internal: { href: "/api/", label: "API and snapshots" } }),
];
