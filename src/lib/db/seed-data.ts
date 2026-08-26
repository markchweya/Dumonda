import type { RuleDef } from "@/lib/rules/types";

/**
 * Seed data for the MVP workflows.
 *
 * IMPORTANT HONESTY NOTE: every source below points at a real official domain,
 * but the stored `extractedText` summaries were written during development and
 * have NOT been verified against the live pages. They are therefore flagged
 * `verification: "seed_demo"` and the UI labels them "Seed data — verify
 * before relying on it". The admin ingestion pipeline (fetch → extract →
 * review → approve) is the path to "verified".
 */

export interface SeedAuthority {
  id: string;
  name: string;
  level: "federal" | "cantonal" | "municipal" | "private_public_service";
  canton?: string;
  municipality?: string;
  officialDomain: string;
  supportedServices: string[];
}

export interface SeedSource {
  id: string;
  title: string;
  authorityId?: string;
  authorityName: string;
  authorityLevel: "federal" | "cantonal" | "municipal" | "private_public_service";
  canton?: string;
  url: string;
  sourceType:
    | "federal_government"
    | "canton"
    | "commune"
    | "federal_law"
    | "ordinance"
    | "official_service_portal"
    | "official_public_institution"
    | "official_open_data";
  language: "en" | "de" | "fr" | "it";
  eventTags: string[];
  extractedText: string;
}

// ─── Jurisdictions ───────────────────────────────────────────────────────────

export const SEED_JURISDICTIONS = [
  { id: "CH", level: "federal" as const, name: "Switzerland", canton: null, municipality: null, parentId: null },
  ...[
    ["ZH", "Zürich"], ["BE", "Bern"], ["BS", "Basel-Stadt"], ["BL", "Basel-Landschaft"],
    ["GE", "Geneva"], ["VD", "Vaud"], ["AG", "Aargau"], ["LU", "Lucerne"],
    ["SG", "St. Gallen"], ["TI", "Ticino"], ["VS", "Valais"], ["FR", "Fribourg"],
    ["ZG", "Zug"], ["SO", "Solothurn"], ["TG", "Thurgau"], ["GR", "Graubünden"],
    ["NE", "Neuchâtel"], ["SZ", "Schwyz"], ["JU", "Jura"], ["SH", "Schaffhausen"],
    ["AR", "Appenzell Ausserrhoden"], ["AI", "Appenzell Innerrhoden"], ["GL", "Glarus"],
    ["NW", "Nidwalden"], ["OW", "Obwalden"], ["UR", "Uri"],
  ].map(([code, name]) => ({
    id: `CH-${code}`,
    level: "cantonal" as const,
    name,
    canton: code,
    municipality: null,
    parentId: "CH",
  })),
];

// ─── Authorities ─────────────────────────────────────────────────────────────

export const SEED_AUTHORITIES: SeedAuthority[] = [
  {
    id: "auth_chch",
    name: "ch.ch — Swiss Confederation, cantons and communes",
    level: "federal",
    officialDomain: "www.ch.ch",
    supportedServices: ["general_information", "moving", "family", "work", "documents"],
  },
  {
    id: "auth_sem",
    name: "State Secretariat for Migration (SEM)",
    level: "federal",
    officialDomain: "www.sem.admin.ch",
    supportedServices: ["residence_permits", "citizenship", "arrival", "departure"],
  },
  {
    id: "auth_seco_arbeit",
    name: "arbeit.swiss — SECO / Public Employment Service",
    level: "federal",
    officialDomain: "www.arbeit.swiss",
    supportedServices: ["unemployment_registration", "unemployment_benefits", "job_search"],
  },
  {
    id: "auth_ahv",
    name: "AHV/IV Information Centre",
    level: "private_public_service",
    officialDomain: "www.ahv-iv.ch",
    supportedServices: ["social_insurance", "family_allowance", "pension"],
  },
  {
    id: "auth_bag",
    name: "Federal Office of Public Health (FOPH)",
    level: "federal",
    officialDomain: "www.bag.admin.ch",
    supportedServices: ["health_insurance"],
  },
  {
    id: "auth_astra",
    name: "Federal Roads Office (FEDRO/ASTRA)",
    level: "federal",
    officialDomain: "www.astra.admin.ch",
    supportedServices: ["vehicle_registration", "driving_licence"],
  },
  {
    id: "auth_estv",
    name: "Federal Tax Administration (FTA)",
    level: "federal",
    officialDomain: "www.estv.admin.ch",
    supportedServices: ["tax", "vat"],
  },
  {
    id: "auth_easygov",
    name: "EasyGov.swiss — SECO online desk for companies",
    level: "federal",
    officialDomain: "www.easygov.swiss",
    supportedServices: ["start_business", "commercial_register", "vat_registration"],
  },
  {
    id: "auth_zefix",
    name: "Central Business Name Index (Zefix)",
    level: "federal",
    officialDomain: "www.zefix.ch",
    supportedServices: ["commercial_register"],
  },
  {
    id: "auth_eda",
    name: "Federal Department of Foreign Affairs (FDFA)",
    level: "federal",
    officialDomain: "www.eda.admin.ch",
    supportedServices: ["swiss_abroad", "departure"],
  },
  {
    id: "auth_seco",
    name: "State Secretariat for Economic Affairs (SECO)",
    level: "federal",
    officialDomain: "www.seco.admin.ch",
    supportedServices: ["labour_law", "employee_protection"],
  },
  {
    id: "auth_fedlex",
    name: "Fedlex — official publication platform for federal law",
    level: "federal",
    officialDomain: "www.fedlex.admin.ch",
    supportedServices: ["federal_law"],
  },
  {
    id: "auth_swisspass",
    name: "SwissPass / Alliance SwissPass",
    level: "private_public_service",
    officialDomain: "www.swisspass.ch",
    supportedServices: ["travelcards", "half_fare", "ga"],
  },
  {
    id: "auth_sbb",
    name: "SBB — Swiss Federal Railways",
    level: "private_public_service",
    officialDomain: "www.sbb.ch",
    supportedServices: ["travelcards", "public_transport"],
  },
  {
    id: "auth_bs_migration",
    name: "Migration Office, Canton Basel-Stadt",
    level: "cantonal",
    canton: "BS",
    officialDomain: "www.bs.ch",
    supportedServices: ["residence_permits", "arrival"],
  },
  {
    id: "auth_bs_einwohner",
    name: "Residents' Office (Einwohneramt), Canton Basel-Stadt",
    level: "cantonal",
    canton: "BS",
    officialDomain: "www.bs.ch",
    supportedServices: ["residence_registration"],
  },
  {
    id: "auth_zh_canton",
    name: "Canton of Zürich",
    level: "cantonal",
    canton: "ZH",
    officialDomain: "www.zh.ch",
    supportedServices: ["residence_registration", "vehicle_registration", "tax"],
  },
  {
    id: "auth_swissuniversities",
    name: "swissuniversities",
    level: "private_public_service",
    officialDomain: "www.swissuniversities.ch",
    supportedServices: ["university_admission"],
  },
  {
    id: "auth_berufsberatung",
    name: "berufsberatung.ch — official careers portal of the cantons",
    level: "private_public_service",
    officialDomain: "www.berufsberatung.ch",
    supportedServices: ["career_guidance", "apprenticeship"],
  },
  {
    id: "auth_priminfo",
    name: "priminfo.admin.ch — official premium comparison (FOPH)",
    level: "federal",
    officialDomain: "www.priminfo.admin.ch",
    supportedServices: ["health_insurance_premiums"],
  },
];

// ─── Sources ─────────────────────────────────────────────────────────────────

export const SEED_SOURCES: SeedSource[] = [
  {
    id: "src_chch_moving",
    title: "Moving within Switzerland — registration with your commune",
    authorityId: "auth_chch",
    authorityName: "ch.ch (Confederation, cantons and communes)",
    authorityLevel: "federal",
    url: "https://www.ch.ch/en/moving-and-living/moving/",
    sourceType: "official_service_portal",
    language: "en",
    eventTags: ["move_between_cantons", "move_between_communes", "move_within_commune"],
    extractedText:
      "When you move to a new commune in Switzerland you must deregister with the residents' registration office of your old commune and register with the residents' registration office of your new commune. Registration in the new commune must generally be done within 14 days of moving in. You will normally need an identity document, your rental contract or landlord confirmation, and for foreign nationals a residence permit. Many communes offer online registration (eUmzug). Fees vary by commune. If you move to another canton, note that health insurance premiums differ by canton and your premium region changes.",
  },
  {
    id: "src_chch_baby",
    title: "Birth of a child — registration and first steps",
    authorityId: "auth_chch",
    authorityName: "ch.ch (Confederation, cantons and communes)",
    authorityLevel: "federal",
    url: "https://www.ch.ch/en/family-and-partnership/birth/",
    sourceType: "official_service_portal",
    language: "en",
    eventTags: ["child_birth"],
    extractedText:
      "Every birth in Switzerland must be reported to the civil register office of the place of birth within three days. If the child is born in hospital, the hospital normally reports the birth. Parents who are not married to each other can have paternity acknowledged at the civil register office before or after the birth. A child must be insured with a Swiss health insurer within three months of birth; cover then applies retroactively from birth. Parents may be entitled to family allowances, which are claimed through the employer or, for the self-employed and non-employed, through the cantonal family compensation fund.",
  },
  {
    id: "src_ahv_family_allowance",
    title: "Family allowances — entitlement and application",
    authorityId: "auth_ahv",
    authorityName: "AHV/IV Information Centre",
    authorityLevel: "private_public_service",
    url: "https://www.ahv-iv.ch/en/",
    sourceType: "official_public_institution",
    language: "en",
    eventTags: ["child_birth"],
    extractedText:
      "Family allowances comprise a child allowance and an education allowance. Employees apply through their employer, who forwards the application to the family compensation fund. Self-employed persons apply to their family compensation fund. Only one allowance is paid per child; where both parents work, statutory priority rules determine who receives it. Amounts vary by canton, with federal minimum amounts per child and per month. Entitlement can be claimed retroactively for up to five years.",
  },
  {
    id: "src_ahv_maternity",
    title: "Maternity compensation (EO) — 14 weeks of paid leave",
    authorityId: "auth_ahv",
    authorityName: "AHV/IV Information Centre",
    authorityLevel: "private_public_service",
    url: "https://www.ahv-iv.ch/en/Social-insurances/Loss-of-earned-income-compensation-EO-maternity-paternity",
    sourceType: "official_public_institution",
    language: "en",
    eventTags: ["child_birth"],
    extractedText:
      "Employed and self-employed mothers are entitled to maternity compensation for 14 weeks (98 days) from the day of the birth, at 80 percent of average earned income up to a statutory maximum daily amount. The entitlement requires insurance under the AHV during the nine months before the birth and a minimum period of employment during pregnancy. The claim is usually submitted through the employer to the competent compensation office. The other parent is entitled to two weeks of paternity leave taken within six months of the birth.",
  },
  {
    id: "src_arbeitswiss_unemployment",
    title: "Registering as unemployed and claiming benefits",
    authorityId: "auth_seco_arbeit",
    authorityName: "arbeit.swiss (SECO)",
    authorityLevel: "federal",
    url: "https://www.arbeit.swiss/secoalv/en/home.html",
    sourceType: "official_service_portal",
    language: "en",
    eventTags: ["job_loss"],
    extractedText:
      "If you become unemployed, register with your regional employment centre (RAV/ORP/URC) as early as possible, at the latest on your first day of unemployment, to avoid losing benefit days. You can register online via the Job-Room portal or in person at the RAV of your place of residence. To claim unemployment insurance benefits you choose an unemployment insurance fund (Arbeitslosenkasse) and submit documents including your employment contract, notice of termination and salary statements. You must make sufficient job applications already during your notice period and record your job-search efforts. Benefits generally amount to 70 to 80 percent of insured earnings depending on your situation.",
  },
  {
    id: "src_bag_accident_cover",
    title: "Health insurance and accident cover after employment ends",
    authorityId: "auth_bag",
    authorityName: "Federal Office of Public Health (FOPH)",
    authorityLevel: "federal",
    url: "https://www.bag.admin.ch/en",
    sourceType: "federal_government",
    language: "en",
    eventTags: ["job_loss", "health_insurance_change"],
    extractedText:
      "Employees working at least eight hours per week for the same employer are insured against accidents by the employer under the UVG. This accident cover ends, in general, 31 days after the end of entitlement to at least half salary. After that you must either take out interim accident insurance (Abredeversicherung) or include accident cover in your compulsory health insurance. Mandatory health insurance itself is individual and continues regardless of employment; premiums are owed by the insured person.",
  },
  {
    id: "src_sem_permits",
    title: "Residence permits — renewal and cantonal competence",
    authorityId: "auth_sem",
    authorityName: "State Secretariat for Migration (SEM)",
    authorityLevel: "federal",
    url: "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
    sourceType: "federal_government",
    language: "en",
    eventTags: ["permit_expiring", "move_between_cantons", "arrive_in_switzerland"],
    extractedText:
      "Residence permits are issued and renewed by the cantonal migration authorities of the canton of residence. An application to renew a B permit can be submitted at the earliest three months and must be submitted at the latest 14 days before expiry, to the competent cantonal migration authority. The C settlement permit is granted for an indefinite period; only the identity card itself must be renewed every five years. Holders of a residence permit who move to another canton must report the move; depending on nationality and permit type a change of canton may require approval by the new canton.",
  },
  {
    id: "src_chch_leaving",
    title: "Leaving Switzerland — deregistration and consequences",
    authorityId: "auth_chch",
    authorityName: "ch.ch (Confederation, cantons and communes)",
    authorityLevel: "federal",
    url: "https://www.ch.ch/en/moving-and-living/leaving-switzerland/",
    sourceType: "official_service_portal",
    language: "en",
    eventTags: ["leave_switzerland"],
    extractedText:
      "Before moving abroad you must deregister with the residents' registration office of your commune, usually shortly before departure; you will receive a departure confirmation. Deregistration ends your compulsory Swiss health insurance in most cases when you take up residence abroad (special rules apply within the EU/EFTA). Notify the tax authorities: your tax liability generally ends on departure and a final assessment is made. Clarify what happens to your AHV and occupational pension assets; depending on the destination country, vested benefits may remain in Switzerland or be paid out under specific conditions. If you export a vehicle, customs formalities apply. Swiss citizens abroad can register with the responsible Swiss representation.",
  },
  {
    id: "src_astra_vehicle",
    title: "Vehicle registration and number plates",
    authorityId: "auth_astra",
    authorityName: "Federal Roads Office (FEDRO/ASTRA)",
    authorityLevel: "federal",
    url: "https://www.astra.admin.ch/en",
    sourceType: "federal_government",
    language: "en",
    eventTags: ["buy_vehicle", "move_between_cantons"],
    extractedText:
      "Vehicles are registered by the road traffic office (Strassenverkehrsamt) of the canton of residence. To register a vehicle you need proof of third-party liability insurance submitted electronically by your insurer, the vehicle registration document, and where applicable a valid inspection. Number plates are cantonal: if you move your place of residence to another canton, you must re-register the vehicle with the road traffic office of the new canton and obtain new plates within 14 days. When buying a used vehicle, the seller's registration must be cancelled or transferred and the vehicle may require a technical inspection.",
  },
  {
    id: "src_easygov_start",
    title: "Founding a company — legal forms and registration",
    authorityId: "auth_easygov",
    authorityName: "EasyGov.swiss (SECO)",
    authorityLevel: "federal",
    url: "https://www.easygov.swiss/easygov/#/en",
    sourceType: "official_service_portal",
    language: "en",
    eventTags: ["start_business"],
    extractedText:
      "EasyGov is the Confederation's online desk for companies. When starting a business you first choose a legal form. A sole proprietorship arises with the start of self-employed activity; entry in the commercial register is mandatory once annual revenue reaches CHF 100,000. A GmbH requires capital of at least CHF 20,000 and an AG at least CHF 100,000 (of which CHF 50,000 paid in); both require a public deed and entry in the commercial register to come into existence. Self-employed persons must have their status recognised by the AHV compensation office. Companies whose worldwide turnover reaches CHF 100,000 are generally liable for VAT and must register with the Federal Tax Administration. Registrations for the commercial register, AHV, VAT and accident insurance can be completed via EasyGov.",
  },
  {
    id: "src_swisspass_halbtax",
    title: "Half Fare Travelcard — renewal and cancellation",
    authorityId: "auth_swisspass",
    authorityName: "SwissPass / Alliance SwissPass",
    authorityLevel: "private_public_service",
    url: "https://www.swisspass.ch/",
    sourceType: "official_public_institution",
    language: "en",
    eventTags: ["half_fare_expiring", "ga_expiring", "swisspass_lost"],
    extractedText:
      "The Half Fare Travelcard is loaded on the SwissPass. Travelcards purchased on a subscription basis renew automatically for a further year unless cancelled; the cancellation deadline and your renewal status are shown in your SwissPass account. If you do not want to continue, cancel before the deadline indicated for your product. Keep your payment and address details up to date in the account. A lost or stolen SwissPass can be blocked and a replacement card ordered through the SwissPass customer service or your account; travelcards remain valid and are transferred to the replacement card.",
  },
  {
    id: "src_sbb_halbtax",
    title: "Half Fare Travelcard — product information",
    authorityId: "auth_sbb",
    authorityName: "SBB — Swiss Federal Railways",
    authorityLevel: "private_public_service",
    url: "https://www.sbb.ch/en/tickets-offers/travelcards/half-fare-travelcard.html",
    sourceType: "official_public_institution",
    language: "en",
    eventTags: ["half_fare_expiring"],
    extractedText:
      "With the Half Fare Travelcard you travel at half price on SBB and most other Swiss railways, and on boats, buses and trams. The travelcard is available as an annual product; with the automatic renewal option it continues year to year and is billed annually. Changes, cancellation and renewal are managed via the SwissPass login. Cancellation must be made before the end of the current period in accordance with the product conditions shown in your account.",
  },
  {
    id: "src_swissuni_admission",
    title: "Admission to Swiss universities",
    authorityId: "auth_swissuniversities",
    authorityName: "swissuniversities",
    authorityLevel: "private_public_service",
    url: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities",
    sourceType: "official_public_institution",
    language: "en",
    eventTags: ["finish_high_school", "start_university"],
    extractedText:
      "Holders of a Swiss gymnasial Matura are generally admitted to Swiss universities. Application is made directly to the chosen university; application periods and deadlines differ by institution and by programme, with the main intake in the autumn semester. Medicine and related fields require registration for the aptitude test by the deadline published by swissuniversities, typically in mid-February for the following autumn. Universities of applied sciences have their own admission requirements, often including work experience for holders of a gymnasial Matura.",
  },
  {
    id: "src_berufsberatung",
    title: "Career guidance, apprenticeships and gap-year options",
    authorityId: "auth_berufsberatung",
    authorityName: "berufsberatung.ch (official cantonal careers portal)",
    authorityLevel: "private_public_service",
    url: "https://www.berufsberatung.ch/",
    sourceType: "official_public_institution",
    language: "de",
    eventTags: ["finish_high_school"],
    extractedText:
      "berufsberatung.ch is the official Swiss portal for careers, studies and career guidance, operated by the cantons. It lists apprenticeship vacancies (LENA), study programmes, bridge-year offers (Brückenangebote), and information on gap years, language stays and intermediate solutions. Free careers counselling is available at cantonal BIZ career information centres. Registration deadlines for bridge-year programmes and apprenticeships vary; many apprenticeships are advertised from August of the preceding year.",
  },
  {
    id: "src_chch_fines",
    title: "Fines and orders — what official information says",
    authorityId: "auth_chch",
    authorityName: "ch.ch (Confederation, cantons and communes)",
    authorityLevel: "federal",
    url: "https://www.ch.ch/en/",
    sourceType: "official_service_portal",
    language: "en",
    eventTags: ["fine_received"],
    extractedText:
      "Fixed-penalty fines (Ordnungsbussen) for minor offences such as parking or minor speeding are issued under the Fixed Penalties Act. The document you receive states the amount, the payment deadline and the payment method. Paying within the deadline normally closes the procedure without an entry in the criminal record. If you do not pay, ordinary criminal proceedings may follow with additional costs. Whether and how you can contest a fine, and within what period, is stated on the document itself; the stated authority is the competent contact. For penalty orders (Strafbefehl) a written objection within the period stated on the order is required.",
  },
  {
    id: "src_seco_care_leave",
    title: "Caring for a sick child — employee rights (labour law)",
    authorityId: "auth_seco",
    authorityName: "State Secretariat for Economic Affairs (SECO)",
    authorityLevel: "federal",
    url: "https://www.seco.admin.ch/",
    sourceType: "federal_government",
    language: "en",
    eventTags: ["child_sick"],
    extractedText:
      "Employees are entitled to paid leave to care for a family member with a health impairment: the time necessary for the care, up to three days per event and, for family members other than their own children, at most ten days per year (Code of Obligations Art. 329h). For their own sick children the three-days-per-event limit applies per illness; the employer may request a medical certificate. Separately, parents of a minor child whose health is seriously impaired by illness or accident are entitled to a paid care leave of up to 14 weeks, compensated through the loss-of-earnings scheme (EO), to be taken within an 18-month framework period (Art. 329i).",
  },
  {
    id: "src_fedlex_or_care",
    title: "Code of Obligations — leave to care for family members (Art. 329h/329i)",
    authorityId: "auth_fedlex",
    authorityName: "Fedlex (official publication platform for federal law)",
    authorityLevel: "federal",
    url: "https://www.fedlex.admin.ch/",
    sourceType: "federal_law",
    language: "en",
    eventTags: ["child_sick"],
    extractedText:
      "The Swiss Code of Obligations governs employees' leave for caring for family members. Art. 329h grants paid leave for the time needed to care for a family member or partner with a health impairment, limited to three days per event and a maximum of ten days per year; the yearly cap does not apply to care for the employee's own children. Art. 329i grants employees whose minor child is seriously impaired in health by illness or accident a care leave of at most 14 weeks, to be drawn within 18 months, with compensation under the loss-of-earnings scheme.",
  },
  {
    id: "src_estv_tax",
    title: "Taxes for individuals — cantonal competence",
    authorityId: "auth_estv",
    authorityName: "Federal Tax Administration (FTA)",
    authorityLevel: "federal",
    url: "https://www.estv.admin.ch/en",
    sourceType: "federal_government",
    language: "en",
    eventTags: ["tax_return", "move_between_cantons", "leave_switzerland"],
    extractedText:
      "Income and wealth taxes for individuals are assessed by the cantons. If you move within Switzerland, you are taxable for the whole tax year in the canton and commune where you are resident on 31 December; you file one tax return in the new canton for that year. Filing deadlines and extension procedures are cantonal. When leaving Switzerland, tax liability generally ends on the date of departure and the departure must be reported to the cantonal tax authority.",
  },
  {
    id: "src_priminfo",
    title: "Comparing and changing health insurance premiums",
    authorityId: "auth_priminfo",
    authorityName: "priminfo.admin.ch (FOPH)",
    authorityLevel: "federal",
    url: "https://www.priminfo.admin.ch/",
    sourceType: "federal_government",
    language: "en",
    eventTags: ["health_insurance_change", "move_between_cantons", "child_birth"],
    extractedText:
      "Priminfo is the official premium comparison of the Federal Office of Public Health. Premiums for compulsory health insurance depend on the premium region of your place of residence, your age group and your chosen model and deductible. You can change insurer for the following calendar year by giving notice to your current insurer by 30 November. When moving to a new premium region, your premium changes; when moving abroad, insurance generally ends. Every insurer must accept every applicant for compulsory insurance regardless of health.",
  },
  {
    id: "src_zh_umzug",
    title: "Canton of Zürich — moving and registration services",
    authorityId: "auth_zh_canton",
    authorityName: "Canton of Zürich",
    authorityLevel: "cantonal",
    canton: "ZH",
    url: "https://www.zh.ch/de/migration-integration.html",
    sourceType: "canton",
    language: "de",
    eventTags: ["move_between_cantons", "move_between_communes"],
    extractedText:
      "In the Canton of Zürich, registration and deregistration are handled by the residents' registration office (Personenmeldeamt/Einwohnerkontrolle) of your municipality. Moves can be reported online via the eUmzugZH service for participating municipalities. Foreign nationals moving into or out of the canton must additionally observe the requirements of the Migration Office of the Canton of Zürich.",
  },
  {
    id: "src_bs_umzug",
    title: "Canton Basel-Stadt — registration at the residents' office",
    authorityId: "auth_bs_einwohner",
    authorityName: "Residents' Office, Canton Basel-Stadt",
    authorityLevel: "cantonal",
    canton: "BS",
    url: "https://www.bs.ch/",
    sourceType: "canton",
    language: "de",
    eventTags: ["move_between_cantons", "move_between_communes", "arrive_in_switzerland"],
    extractedText:
      "Anyone taking up residence in the Canton of Basel-Stadt must register with the Residents' Office (Einwohneramt) within 14 days of arrival. Required documents typically include an identity document, the rental contract or landlord confirmation, and for foreign nationals the residence permit or the documents for its application. Registration can be started online via the eUmzug service. The canton comprises the municipalities of Basel, Riehen and Bettingen; Riehen and Bettingen have their own municipal offices.",
  },
];

// ─── Rules ───────────────────────────────────────────────────────────────────

const always = { all: [] as never[] };

export const SEED_RULES: RuleDef[] = [
  // MOVE BETWEEN CANTONS ─────────────────────────────────────────────────────
  {
    id: "rule_move_deregister",
    eventType: "move_between_cantons",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_chch_moving"],
    actions: [
      {
        title: "Deregister with your previous municipality",
        description:
          "Report your departure to the residents' registration office of the municipality you are leaving. Many municipalities let you do this online via eUmzug.",
        category: "registration",
        priority: "required",
        authorityName: "Residents' registration office (previous municipality)",
        authorityLevel: "municipal",
        sourceIds: ["src_chch_moving"],
        documentsRequired: ["Identity document"],
        deadline: { type: "unknown", label: "When moving, before or shortly after departure" },
      },
      {
        title: "Register with your new municipality within 14 days",
        description:
          "Register at the residents' registration office of your new municipality. Bring your documents; foreign nationals also present their residence permit.",
        category: "registration",
        priority: "required",
        authorityName: "Residents' registration office (new municipality)",
        authorityLevel: "municipal",
        sourceIds: ["src_chch_moving"],
        documentsRequired: ["Identity document", "Rental contract or landlord confirmation", "Residence permit (foreign nationals)"],
        deadline: { type: "relative", amount: 14, unit: "days", anchor: "event_date", label: "Within 14 days of moving in" },
      },
      {
        title: "Health insurance: check your new premium region",
        description:
          "Premiums for compulsory health insurance depend on your place of residence. Update your address with your insurer and compare premiums for your new canton on the official Priminfo comparison.",
        category: "insurance",
        priority: "recommended",
        authorityName: "Your health insurer / Priminfo (FOPH)",
        authorityLevel: "federal",
        officialUrl: "https://www.priminfo.admin.ch/",
        sourceIds: ["src_chch_moving", "src_priminfo"],
        deadline: { type: "unknown", label: "After registering your new address" },
      },
      {
        title: "Taxes: your new canton taxes the whole year",
        description:
          "If you are resident in the new canton on 31 December, you are taxable there for the entire tax year and file your next tax return in the new canton.",
        category: "tax",
        priority: "information",
        authorityName: "Cantonal tax administration",
        authorityLevel: "cantonal",
        sourceIds: ["src_estv_tax"],
      },
      {
        title: "Update your address everywhere else",
        description:
          "Arrange mail forwarding with Swiss Post and update your address with your employer, bank, Serafe (radio/TV fee), phone provider and any subscriptions.",
        category: "admin",
        priority: "recommended",
        sourceIds: ["src_chch_moving"],
      },
    ],
  },
  {
    id: "rule_move_vehicle_yes",
    eventType: "move_between_cantons",
    jurisdiction: "CH",
    conditions: { fact: "has_vehicle", op: "eq", value: "yes" },
    version: 1,
    active: true,
    sourceIds: ["src_astra_vehicle"],
    actions: [
      {
        title: "Re-register your vehicle in the new canton",
        description:
          "Number plates are cantonal. Re-register your vehicle with the road traffic office (Strassenverkehrsamt) of your new canton and obtain new plates.",
        category: "transport",
        priority: "required",
        authorityName: "Road traffic office of the new canton",
        authorityLevel: "cantonal",
        sourceIds: ["src_astra_vehicle"],
        documentsRequired: ["Vehicle registration document", "Proof of insurance (submitted electronically by insurer)"],
        deadline: { type: "relative", amount: 14, unit: "days", anchor: "event_date", label: "Within 14 days of the move" },
      },
    ],
  },
  {
    id: "rule_move_vehicle_unknown",
    eventType: "move_between_cantons",
    jurisdiction: "CH",
    conditions: { fact: "has_vehicle", op: "not_exists" },
    version: 1,
    active: true,
    sourceIds: ["src_astra_vehicle"],
    actions: [
      {
        title: "If you own a vehicle: re-register it in the new canton",
        description:
          "Vehicle owners must re-register with the road traffic office of the new canton and change plates within 14 days of moving.",
        category: "transport",
        priority: "may_apply",
        authorityName: "Road traffic office of the new canton",
        authorityLevel: "cantonal",
        sourceIds: ["src_astra_vehicle"],
        deadline: { type: "relative", amount: 14, unit: "days", anchor: "event_date", label: "Within 14 days of the move" },
      },
    ],
  },
  {
    id: "rule_move_foreign_national",
    eventType: "move_between_cantons",
    jurisdiction: "CH",
    conditions: { fact: "nationality_category", op: "in", value: ["eu_efta", "third_country"] },
    version: 1,
    active: true,
    sourceIds: ["src_sem_permits"],
    actions: [
      {
        title: "Report the move to the migration authority",
        description:
          "As a foreign national you must report your change of canton. Depending on your nationality and permit type, the change of canton may require approval by the new canton's migration authority.",
        category: "immigration",
        priority: "required",
        authorityName: "Cantonal migration office (new canton)",
        authorityLevel: "cantonal",
        sourceIds: ["src_sem_permits"],
        documentsRequired: ["Residence permit", "Identity document"],
        deadline: { type: "relative", amount: 14, unit: "days", anchor: "event_date", label: "Within 14 days of the move" },
      },
    ],
  },
  {
    id: "rule_move_children_school",
    eventType: "move_between_cantons",
    jurisdiction: "CH",
    conditions: { any: [
      { fact: "children_school_age", op: "eq", value: "yes" },
      { all: [{ fact: "has_children", op: "eq", value: "yes" }, { fact: "children_school_age", op: "not_exists" }] },
    ] },
    version: 1,
    active: true,
    sourceIds: ["src_chch_moving"],
    actions: [
      {
        title: "Enrol your children at school in the new municipality",
        description:
          "Contact the school administration of your new municipality to enrol school-age children. Curricula and school holidays differ between cantons.",
        category: "family",
        priority: "may_apply",
        authorityName: "School administration (new municipality)",
        authorityLevel: "municipal",
        sourceIds: ["src_chch_moving"],
        deadline: { type: "unknown", label: "As soon as possible after the move" },
      },
    ],
  },
  {
    id: "rule_move_dog",
    eventType: "move_between_cantons",
    jurisdiction: "CH",
    conditions: { fact: "has_pets", op: "eq", value: "yes" },
    version: 1,
    active: true,
    sourceIds: ["src_chch_moving"],
    actions: [
      {
        title: "Register your dog in the new municipality",
        description:
          "Dogs must be registered with the new municipality and the address updated in the Amicus database. Dog tax varies by canton and municipality.",
        category: "admin",
        priority: "required",
        authorityName: "Municipal administration (new municipality)",
        authorityLevel: "municipal",
        sourceIds: ["src_chch_moving"],
      },
    ],
  },

  // CHILD BIRTH ──────────────────────────────────────────────────────────────
  {
    id: "rule_baby_core",
    eventType: "child_birth",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_chch_baby"],
    actions: [
      {
        title: "Birth registration with the civil register office",
        description:
          "Births must be reported to the civil register office of the place of birth within 3 days. If your child was born in hospital, the hospital normally does this for you — confirm it has been done.",
        category: "civil_status",
        priority: "required",
        authorityName: "Civil register office at the place of birth",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_baby"],
        deadline: { type: "relative", amount: 3, unit: "days", anchor: "event_date", label: "Within 3 days of the birth (usually handled by the hospital)" },
      },
      {
        title: "Take out health insurance for your baby",
        description:
          "Your child must be insured with a Swiss health insurer within 3 months of birth; cover applies retroactively from birth. Insurers must accept every child for compulsory insurance.",
        category: "insurance",
        priority: "required",
        authorityName: "Health insurer of your choice",
        authorityLevel: "private_public_service",
        officialUrl: "https://www.priminfo.admin.ch/",
        sourceIds: ["src_chch_baby", "src_priminfo"],
        deadline: { type: "relative", amount: 3, unit: "months", anchor: "event_date", label: "Within 3 months of the birth" },
      },
    ],
  },
  {
    id: "rule_baby_allowance_employed",
    eventType: "child_birth",
    jurisdiction: "CH",
    conditions: { fact: "employment_status", op: "in", value: ["employed", "self_employed"] },
    version: 1,
    active: true,
    sourceIds: ["src_ahv_family_allowance"],
    actions: [
      {
        title: "Apply for family allowance",
        description:
          "Employees apply through their employer; self-employed persons apply to their family compensation fund. Only one allowance is paid per child. Claims can be made retroactively for up to 5 years.",
        category: "financial",
        priority: "required",
        authorityName: "Employer / family compensation fund",
        authorityLevel: "cantonal",
        sourceIds: ["src_ahv_family_allowance"],
        deadline: { type: "unknown", label: "As soon as convenient — retroactive up to 5 years" },
      },
    ],
  },
  {
    id: "rule_baby_allowance_unknown",
    eventType: "child_birth",
    jurisdiction: "CH",
    conditions: { fact: "employment_status", op: "not_exists" },
    version: 1,
    active: true,
    sourceIds: ["src_ahv_family_allowance"],
    actions: [
      {
        title: "Check your entitlement to family allowance",
        description:
          "Family allowance is claimed through your employer if employed, or through the cantonal family compensation fund if self-employed or not employed.",
        category: "financial",
        priority: "may_apply",
        authorityName: "Employer / family compensation fund",
        authorityLevel: "cantonal",
        sourceIds: ["src_ahv_family_allowance"],
      },
    ],
  },
  {
    id: "rule_baby_maternity",
    eventType: "child_birth",
    jurisdiction: "CH",
    conditions: { fact: "employment_status", op: "in", value: ["employed", "self_employed"] },
    version: 1,
    active: true,
    sourceIds: ["src_ahv_maternity"],
    actions: [
      {
        title: "Maternity compensation and parental leave",
        description:
          "Employed and self-employed mothers are entitled to 14 weeks of maternity compensation at 80% of average income (up to the statutory maximum), usually claimed via the employer. The other parent has 2 weeks of paternity leave within 6 months of the birth.",
        category: "work",
        priority: "may_apply",
        authorityName: "Employer / AHV compensation office",
        authorityLevel: "federal",
        sourceIds: ["src_ahv_maternity"],
      },
    ],
  },
  {
    id: "rule_baby_paternity_unmarried",
    eventType: "child_birth",
    jurisdiction: "CH",
    conditions: { fact: "marital_status", op: "in", value: ["single", "other"] },
    version: 1,
    active: true,
    sourceIds: ["src_chch_baby"],
    actions: [
      {
        title: "Acknowledge paternity at the civil register office",
        description:
          "If the parents are not married to each other, paternity can be acknowledged at the civil register office before or after the birth. This affects the child's parentage, name and support rights.",
        category: "civil_status",
        priority: "may_apply",
        authorityName: "Civil register office",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_baby"],
      },
    ],
  },

  // CHILD SICK ───────────────────────────────────────────────────────────────
  {
    id: "rule_child_sick_core",
    eventType: "child_sick",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
    actions: [
      {
        title: "Get medical help if needed",
        description:
          "Contact your paediatrician or family doctor; outside office hours use your region's medical on-call service (call 144 in an emergency). Treatment for children is covered by their compulsory health insurance.",
        category: "health",
        priority: "information",
        authorityName: "Your paediatrician / medical on-call service",
        authorityLevel: "private_public_service",
        sourceIds: [],
      },
      {
        title: "Inform the school or daycare",
        description:
          "Report the absence to your child's school or daycare following their notification procedure, usually on the first morning of absence.",
        category: "family",
        priority: "recommended",
        authorityName: "School / daycare",
        authorityLevel: "municipal",
        sourceIds: [],
      },
    ],
  },
  {
    id: "rule_child_sick_employed",
    eventType: "child_sick",
    jurisdiction: "CH",
    conditions: { fact: "employment_status", op: "in", value: ["employed"] },
    version: 1,
    active: true,
    sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
    actions: [
      {
        title: "Take paid leave to care for your child",
        description:
          "As an employee you are entitled to paid leave for the time needed to care for your sick child, up to 3 days per illness (Code of Obligations Art. 329h). Inform your employer promptly; a medical certificate may be requested.",
        category: "work",
        priority: "information",
        authorityName: "Your employer",
        authorityLevel: "private_public_service",
        sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
      },
    ],
  },
  {
    id: "rule_child_sick_employment_unknown",
    eventType: "child_sick",
    jurisdiction: "CH",
    conditions: { fact: "employment_status", op: "not_exists" },
    version: 1,
    active: true,
    sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
    actions: [
      {
        title: "If you are employed: paid leave to care for your child",
        description:
          "Employees are entitled to paid leave for the time needed to care for a sick child, up to 3 days per illness (Code of Obligations Art. 329h). Inform your employer promptly; a medical certificate may be requested.",
        category: "work",
        priority: "may_apply",
        authorityName: "Your employer",
        authorityLevel: "private_public_service",
        sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
      },
    ],
  },
  {
    id: "rule_child_sick_serious",
    eventType: "child_sick",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
    actions: [
      {
        title: "Seriously ill child: up to 14 weeks of paid care leave",
        description:
          "If your minor child's health is seriously impaired by illness or accident, working parents are entitled to a care leave of up to 14 weeks within 18 months, compensated through the loss-of-earnings scheme (EO). The claim runs via the AHV compensation office.",
        category: "work",
        priority: "may_apply",
        authorityName: "AHV compensation office / your employer",
        authorityLevel: "federal",
        sourceIds: ["src_seco_care_leave", "src_fedlex_or_care"],
      },
    ],
  },

  // JOB LOSS ─────────────────────────────────────────────────────────────────
  {
    id: "rule_jobloss_core",
    eventType: "job_loss",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_arbeitswiss_unemployment"],
    actions: [
      {
        title: "Register with your regional employment centre (RAV)",
        description:
          "Register as a jobseeker as early as possible — at the latest on your first day of unemployment — online via Job-Room or at the RAV of your place of residence. Late registration costs benefit days.",
        category: "work",
        priority: "required",
        authorityName: "Regional employment centre (RAV/ORP/URC)",
        authorityLevel: "cantonal",
        officialUrl: "https://www.arbeit.swiss/secoalv/en/home.html",
        sourceIds: ["src_arbeitswiss_unemployment"],
        deadline: { type: "unknown", label: "At the latest on your first day of unemployment" },
      },
      {
        title: "Claim unemployment benefits from a fund of your choice",
        description:
          "Choose an unemployment insurance fund and submit your claim with your employment contract, notice of termination and salary statements. Benefits are generally 70–80% of insured earnings.",
        category: "financial",
        priority: "required",
        authorityName: "Unemployment insurance fund (Arbeitslosenkasse)",
        authorityLevel: "cantonal",
        sourceIds: ["src_arbeitswiss_unemployment"],
        documentsRequired: ["Employment contract", "Notice of termination", "Salary statements"],
      },
      {
        title: "Record your job applications",
        description:
          "You must apply for jobs and document your search efforts — already during the notice period. The RAV checks these records monthly.",
        category: "work",
        priority: "required",
        authorityName: "Regional employment centre (RAV)",
        authorityLevel: "cantonal",
        sourceIds: ["src_arbeitswiss_unemployment"],
      },
      {
        title: "Secure your accident insurance cover",
        description:
          "Accident cover through your employer generally ends 31 days after your last day of salary entitlement. Either take out interim accident insurance (Abredeversicherung) or add accident cover to your health insurance.",
        category: "insurance",
        priority: "required",
        authorityName: "Your health insurer / previous accident insurer",
        authorityLevel: "private_public_service",
        sourceIds: ["src_bag_accident_cover"],
        deadline: { type: "relative", amount: 31, unit: "days", anchor: "event_date", label: "Within 31 days of the end of salary entitlement" },
      },
      {
        title: "Pension fund: decide what happens to your assets",
        description:
          "Your occupational pension (2nd pillar) assets move to a vested benefits account if you do not start a new job immediately. Ask your pension fund about the transfer.",
        category: "financial",
        priority: "information",
        authorityName: "Your pension fund",
        authorityLevel: "private_public_service",
        sourceIds: ["src_arbeitswiss_unemployment"],
      },
    ],
  },
  {
    id: "rule_jobloss_foreign",
    eventType: "job_loss",
    jurisdiction: "CH",
    conditions: { fact: "nationality_category", op: "in", value: ["eu_efta", "third_country"] },
    version: 1,
    active: true,
    sourceIds: ["src_sem_permits"],
    actions: [
      {
        title: "Check the effect on your residence permit",
        description:
          "Losing a job can affect residence rights depending on your permit type and nationality. Contact your cantonal migration office early to understand your options.",
        category: "immigration",
        priority: "may_apply",
        authorityName: "Cantonal migration office",
        authorityLevel: "cantonal",
        sourceIds: ["src_sem_permits"],
      },
    ],
  },

  // FINISH HIGH SCHOOL ───────────────────────────────────────────────────────
  {
    id: "rule_school_university",
    eventType: "finish_high_school",
    jurisdiction: "CH",
    conditions: { fact: "education_next_step", op: "in", value: ["university", "applied_sciences"] },
    version: 1,
    active: true,
    sourceIds: ["src_swissuni_admission"],
    actions: [
      {
        title: "Check application deadlines for your chosen programmes",
        description:
          "Application periods differ by university and programme, with the main intake in autumn. Medicine requires registering for the aptitude test by the swissuniversities deadline (typically mid-February).",
        category: "education",
        priority: "required",
        authorityName: "Your chosen university / swissuniversities",
        authorityLevel: "private_public_service",
        officialUrl: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities",
        sourceIds: ["src_swissuni_admission"],
        deadline: { type: "unknown", label: "Varies by university and programme" },
      },
      {
        title: "Clarify admission requirements",
        description:
          "A gymnasial Matura generally grants university admission. Universities of applied sciences often additionally require work experience depending on your background.",
        category: "education",
        priority: "information",
        authorityName: "swissuniversities",
        authorityLevel: "private_public_service",
        sourceIds: ["src_swissuni_admission"],
      },
    ],
  },
  {
    id: "rule_school_apprenticeship",
    eventType: "finish_high_school",
    jurisdiction: "CH",
    conditions: { fact: "education_next_step", op: "eq", value: "apprenticeship" },
    version: 1,
    active: true,
    sourceIds: ["src_berufsberatung"],
    actions: [
      {
        title: "Search apprenticeship vacancies (LENA)",
        description:
          "Open apprenticeship places are listed on the official cantonal careers portal. Many places for next summer are advertised from August of the preceding year.",
        category: "education",
        priority: "required",
        authorityName: "berufsberatung.ch (cantonal careers portal)",
        authorityLevel: "private_public_service",
        officialUrl: "https://www.berufsberatung.ch/",
        sourceIds: ["src_berufsberatung"],
      },
    ],
  },
  {
    id: "rule_school_unsure",
    eventType: "finish_high_school",
    jurisdiction: "CH",
    conditions: { any: [
      { fact: "education_next_step", op: "in", value: ["unsure", "gap_year", "work"] },
      { fact: "education_next_step", op: "not_exists" },
    ] },
    version: 1,
    active: true,
    sourceIds: ["src_berufsberatung"],
    actions: [
      {
        title: "Get free careers counselling at your cantonal BIZ",
        description:
          "Cantonal career information centres (BIZ) offer free guidance on studies, apprenticeships, bridge years, language stays and gap-year options.",
        category: "education",
        priority: "recommended",
        authorityName: "Cantonal career information centre (BIZ)",
        authorityLevel: "cantonal",
        officialUrl: "https://www.berufsberatung.ch/",
        sourceIds: ["src_berufsberatung"],
      },
      {
        title: "Explore bridge-year and intermediate options",
        description:
          "Bridge-year programmes (Brückenangebote), language stays and internships are listed on the official careers portal. Some have registration deadlines in spring.",
        category: "education",
        priority: "information",
        authorityName: "berufsberatung.ch (cantonal careers portal)",
        authorityLevel: "private_public_service",
        sourceIds: ["src_berufsberatung"],
      },
    ],
  },

  // START BUSINESS ───────────────────────────────────────────────────────────
  {
    id: "rule_business_core",
    eventType: "start_business",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_easygov_start"],
    actions: [
      {
        title: "Choose your legal form",
        description:
          "Sole proprietorship (no minimum capital), GmbH (from CHF 20,000) or AG (from CHF 100,000, half paid in). The choice affects liability, taxes and registration duties.",
        category: "business",
        priority: "required",
        authorityName: "EasyGov.swiss (SECO)",
        authorityLevel: "federal",
        officialUrl: "https://www.easygov.swiss/easygov/#/en",
        sourceIds: ["src_easygov_start"],
      },
      {
        title: "Check VAT liability",
        description:
          "Businesses whose worldwide turnover reaches CHF 100,000 are generally liable for VAT and must register with the Federal Tax Administration.",
        category: "tax",
        priority: "may_apply",
        authorityName: "Federal Tax Administration (FTA)",
        authorityLevel: "federal",
        sourceIds: ["src_easygov_start"],
      },
    ],
  },
  {
    id: "rule_business_sole",
    eventType: "start_business",
    jurisdiction: "CH",
    conditions: { fact: "business_legal_form", op: "eq", value: "sole_proprietorship" },
    version: 1,
    active: true,
    sourceIds: ["src_easygov_start"],
    actions: [
      {
        title: "Have your self-employment recognised by the AHV",
        description:
          "Register with your cantonal AHV compensation office to be recognised as self-employed and pay social security contributions on your income.",
        category: "business",
        priority: "required",
        authorityName: "Cantonal AHV compensation office",
        authorityLevel: "cantonal",
        sourceIds: ["src_easygov_start"],
      },
      {
        title: "Commercial register entry from CHF 100,000 revenue",
        description:
          "A sole proprietorship must be entered in the commercial register once annual revenue reaches CHF 100,000. Voluntary earlier registration is possible.",
        category: "business",
        priority: "may_apply",
        authorityName: "Cantonal commercial register office",
        authorityLevel: "cantonal",
        officialUrl: "https://www.zefix.ch/",
        sourceIds: ["src_easygov_start"],
      },
    ],
  },
  {
    id: "rule_business_company",
    eventType: "start_business",
    jurisdiction: "CH",
    conditions: { fact: "business_legal_form", op: "in", value: ["gmbh", "ag"] },
    version: 1,
    active: true,
    sourceIds: ["src_easygov_start"],
    actions: [
      {
        title: "Found the company by public deed and register it",
        description:
          "A GmbH or AG comes into existence with the notarised founding and entry in the commercial register. Capital must be deposited with a bank beforehand.",
        category: "business",
        priority: "required",
        authorityName: "Notary / cantonal commercial register office",
        authorityLevel: "cantonal",
        officialUrl: "https://www.zefix.ch/",
        sourceIds: ["src_easygov_start"],
        documentsRequired: ["Articles of association", "Capital payment confirmation", "Identity documents of founders"],
      },
    ],
  },
  {
    id: "rule_business_form_unknown",
    eventType: "start_business",
    jurisdiction: "CH",
    conditions: { fact: "business_legal_form", op: "in", value: ["unsure"] },
    version: 1,
    active: true,
    sourceIds: ["src_easygov_start"],
    actions: [
      {
        title: "Compare legal forms on EasyGov",
        description:
          "EasyGov, the Confederation's online desk for companies, walks you through choosing a legal form and completing the registrations (commercial register, AHV, VAT, accident insurance) in one place.",
        category: "business",
        priority: "recommended",
        authorityName: "EasyGov.swiss (SECO)",
        authorityLevel: "federal",
        officialUrl: "https://www.easygov.swiss/easygov/#/en",
        sourceIds: ["src_easygov_start"],
      },
    ],
  },

  // PERMIT EXPIRING ──────────────────────────────────────────────────────────
  {
    id: "rule_permit_b",
    eventType: "permit_expiring",
    jurisdiction: "CH",
    conditions: { any: [
      { fact: "permit_type", op: "eq", value: "B" },
      { fact: "permit_type", op: "eq", value: "L" },
    ] },
    version: 1,
    active: true,
    sourceIds: ["src_sem_permits"],
    actions: [
      {
        title: "Apply for renewal at your cantonal migration office",
        description:
          "Renewal applications can be filed at the earliest 3 months and must be filed at the latest 14 days before your permit expires. The competent authority is the migration office of your canton of residence.",
        category: "immigration",
        priority: "required",
        authorityName: "Cantonal migration office",
        authorityLevel: "cantonal",
        officialUrl: "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
        sourceIds: ["src_sem_permits"],
        documentsRequired: ["Current permit", "Passport / identity document", "Renewal form of your canton"],
        deadline: { type: "unknown", label: "At the latest 14 days before expiry" },
      },
    ],
  },
  {
    id: "rule_permit_c",
    eventType: "permit_expiring",
    jurisdiction: "CH",
    conditions: { fact: "permit_type", op: "eq", value: "C" },
    version: 1,
    active: true,
    sourceIds: ["src_sem_permits"],
    actions: [
      {
        title: "Renew your C permit identity card",
        description:
          "The C settlement permit itself is unlimited — only the card must be renewed every 5 years at your cantonal migration office.",
        category: "immigration",
        priority: "required",
        authorityName: "Cantonal migration office",
        authorityLevel: "cantonal",
        sourceIds: ["src_sem_permits"],
      },
    ],
  },
  {
    id: "rule_permit_unknown_type",
    eventType: "permit_expiring",
    jurisdiction: "CH",
    conditions: { fact: "permit_type", op: "not_exists" },
    version: 1,
    active: true,
    sourceIds: ["src_sem_permits"],
    actions: [
      {
        title: "Contact your cantonal migration office about renewal",
        description:
          "Residence permits are renewed by the migration office of your canton of residence. Renewal windows depend on the permit type — for B permits, at the latest 14 days before expiry.",
        category: "immigration",
        priority: "required",
        authorityName: "Cantonal migration office",
        authorityLevel: "cantonal",
        officialUrl: "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
        sourceIds: ["src_sem_permits"],
      },
    ],
  },

  // FINE RECEIVED ────────────────────────────────────────────────────────────
  {
    id: "rule_fine_core",
    eventType: "fine_received",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_chch_fines"],
    actions: [
      {
        title: "Identify the document and the issuing authority",
        description:
          "Check the letterhead: fixed-penalty fine (Ordnungsbusse), penalty order (Strafbefehl) or administrative decision. The issuing authority named on the document is your contact for questions.",
        category: "legal",
        priority: "required",
        authorityName: "The authority named on your document",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_fines"],
      },
      {
        title: "Check the payment deadline stated on the document",
        description:
          "The amount, deadline and payment method are stated on the fine itself. Paying a fixed-penalty fine within the deadline normally closes the case without a criminal record entry. Dumonda cannot know your specific deadline — it is on your document.",
        category: "legal",
        priority: "required",
        authorityName: "The authority named on your document",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_fines"],
        deadline: { type: "unknown", label: "Stated on your document" },
      },
      {
        title: "Contesting: rights and periods are on the document",
        description:
          "Whether and how you can contest, and within what period, is stated on the document (for penalty orders: written objection within the stated period). If you miss the deadline, the decision becomes final and enforcement costs can follow.",
        category: "legal",
        priority: "information",
        authorityName: "The authority named on your document",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_fines"],
      },
      {
        title: "Consider legal advice for larger or unclear cases",
        description:
          "For significant amounts, licence measures or anything unclear, professional legal advice may be appropriate. Many cantons offer free initial legal advice services.",
        category: "legal",
        priority: "recommended",
        sourceIds: ["src_chch_fines"],
      },
    ],
  },

  // HALF FARE EXPIRING ───────────────────────────────────────────────────────
  {
    id: "rule_halffare_core",
    eventType: "half_fare_expiring",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_swisspass_halbtax", "src_sbb_halbtax"],
    actions: [
      {
        title: "Check your renewal status in your SwissPass account",
        description:
          "Travelcards on subscription renew automatically for a further year unless cancelled. Your account shows whether automatic renewal is active and the exact cancellation deadline for your product.",
        category: "transport",
        priority: "required",
        authorityName: "SwissPass / Alliance SwissPass",
        authorityLevel: "private_public_service",
        officialUrl: "https://www.swisspass.ch/",
        sourceIds: ["src_swisspass_halbtax"],
        deadline: { type: "unknown", label: "Before the cancellation deadline shown in your account" },
      },
      {
        title: "Decide: continue or cancel",
        description:
          "If you want to keep the Half Fare Travelcard, confirm your payment details are current. If not, cancel before the deadline indicated for your product — otherwise it renews and is billed for another year.",
        category: "transport",
        priority: "required",
        authorityName: "SwissPass / SBB",
        authorityLevel: "private_public_service",
        officialUrl: "https://www.sbb.ch/en/tickets-offers/travelcards/half-fare-travelcard.html",
        sourceIds: ["src_swisspass_halbtax", "src_sbb_halbtax"],
      },
      {
        title: "Update your payment and address details",
        description: "Make sure the payment method and address in your SwissPass account are current so renewal or billing does not fail.",
        category: "transport",
        priority: "recommended",
        authorityName: "SwissPass",
        authorityLevel: "private_public_service",
        sourceIds: ["src_swisspass_halbtax"],
      },
    ],
  },

  // SWISSPASS LOST ───────────────────────────────────────────────────────────
  {
    id: "rule_swisspass_lost",
    eventType: "swisspass_lost",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_swisspass_halbtax"],
    actions: [
      {
        title: "Block your card and order a replacement",
        description:
          "Block a lost or stolen SwissPass and order a replacement via your SwissPass account or customer service. Your travelcards remain valid and transfer to the new card.",
        category: "transport",
        priority: "required",
        authorityName: "SwissPass customer service",
        authorityLevel: "private_public_service",
        officialUrl: "https://www.swisspass.ch/",
        sourceIds: ["src_swisspass_halbtax"],
      },
    ],
  },

  // LEAVE SWITZERLAND ────────────────────────────────────────────────────────
  {
    id: "rule_leave_core",
    eventType: "leave_switzerland",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_chch_leaving"],
    actions: [
      {
        title: "Deregister with your municipality before departure",
        description:
          "Report your departure to your residents' registration office shortly before you leave and obtain the departure confirmation — you will need it for several follow-up steps.",
        category: "registration",
        priority: "required",
        authorityName: "Residents' registration office",
        authorityLevel: "municipal",
        sourceIds: ["src_chch_leaving"],
        deadline: { type: "unknown", label: "Shortly before departure" },
      },
      {
        title: "Notify the cantonal tax authority",
        description:
          "Your Swiss tax liability generally ends on departure; report the move so a final assessment can be made.",
        category: "tax",
        priority: "required",
        authorityName: "Cantonal tax administration",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_leaving", "src_estv_tax"],
      },
      {
        title: "Clarify your pension assets (AHV and 2nd pillar)",
        description:
          "Depending on your destination country, occupational pension assets stay in a Swiss vested benefits account or can be paid out under specific conditions. EU/EFTA destinations have special rules.",
        category: "financial",
        priority: "required",
        authorityName: "Your pension fund / AHV compensation office",
        authorityLevel: "federal",
        sourceIds: ["src_chch_leaving"],
      },
      {
        title: "Health insurance ends with your departure",
        description:
          "Compulsory Swiss health insurance generally ends when you take up residence abroad (special rules within the EU/EFTA). Arrange cover in your destination country and inform your insurer.",
        category: "insurance",
        priority: "information",
        authorityName: "Your health insurer",
        authorityLevel: "private_public_service",
        sourceIds: ["src_chch_leaving"],
      },
    ],
  },
  {
    id: "rule_leave_vehicle",
    eventType: "leave_switzerland",
    jurisdiction: "CH",
    conditions: { fact: "has_vehicle", op: "eq", value: "yes" },
    version: 1,
    active: true,
    sourceIds: ["src_chch_leaving", "src_astra_vehicle"],
    actions: [
      {
        title: "Handle your vehicle: export or deregister",
        description:
          "If you take your vehicle abroad, customs export formalities apply and the vehicle must be registered in the destination country. If you sell it, cancel the registration with your road traffic office.",
        category: "transport",
        priority: "required",
        authorityName: "Road traffic office / Federal Office for Customs",
        authorityLevel: "cantonal",
        sourceIds: ["src_chch_leaving", "src_astra_vehicle"],
      },
    ],
  },

  // BUY VEHICLE ──────────────────────────────────────────────────────────────
  {
    id: "rule_buy_vehicle_core",
    eventType: "buy_vehicle",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_astra_vehicle"],
    actions: [
      {
        title: "Take out third-party liability insurance",
        description:
          "Liability insurance is mandatory before a vehicle can be registered. Your insurer submits the proof of insurance electronically to the road traffic office.",
        category: "transport",
        priority: "required",
        authorityName: "Insurer of your choice",
        authorityLevel: "private_public_service",
        sourceIds: ["src_astra_vehicle"],
      },
      {
        title: "Register the vehicle with your cantonal road traffic office",
        description:
          "Register with the road traffic office (Strassenverkehrsamt) of your canton of residence, bringing the vehicle registration document; an inspection may be required for used vehicles.",
        category: "transport",
        priority: "required",
        authorityName: "Cantonal road traffic office",
        authorityLevel: "cantonal",
        sourceIds: ["src_astra_vehicle"],
        documentsRequired: ["Vehicle registration document", "Proof of insurance (electronic)"],
      },
      {
        title: "Buying used: settle the previous registration",
        description:
          "The seller's registration must be cancelled or transferred. Agree who handles the paperwork and check when the last technical inspection took place.",
        category: "transport",
        priority: "information",
        authorityName: "Cantonal road traffic office",
        authorityLevel: "cantonal",
        sourceIds: ["src_astra_vehicle"],
      },
    ],
  },

  // HEALTH INSURANCE CHANGE ──────────────────────────────────────────────────
  {
    id: "rule_hi_change",
    eventType: "health_insurance_change",
    jurisdiction: "CH",
    conditions: always,
    version: 1,
    active: true,
    sourceIds: ["src_priminfo"],
    actions: [
      {
        title: "Compare premiums on the official Priminfo comparison",
        description:
          "Premiums depend on your premium region, age group, model and deductible. Priminfo is the official comparison by the Federal Office of Public Health.",
        category: "insurance",
        priority: "recommended",
        authorityName: "priminfo.admin.ch (FOPH)",
        authorityLevel: "federal",
        officialUrl: "https://www.priminfo.admin.ch/",
        sourceIds: ["src_priminfo"],
      },
      {
        title: "Give notice to your current insurer by 30 November",
        description:
          "To change insurer for the next calendar year, your notice must reach your current insurer by 30 November. Every insurer must accept you for compulsory insurance.",
        category: "insurance",
        priority: "required",
        authorityName: "Your current health insurer",
        authorityLevel: "private_public_service",
        sourceIds: ["src_priminfo"],
        deadline: { type: "unknown", label: "Notice must arrive by 30 November" },
      },
    ],
  },
];
