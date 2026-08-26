/**
 * Dumonda life-event taxonomy.
 *
 * This is the scalable registry of everything Dumonda understands. Adding a new
 * life event means adding an entry here plus rules/sources in the database —
 * no page components need to change.
 */

export const EVENT_CATEGORIES = [
  "HOUSING",
  "FAMILY",
  "WORK",
  "EDUCATION",
  "TRANSPORT",
  "IMMIGRATION",
  "BUSINESS",
  "LEGAL_ADMIN",
  "INSURANCE",
  "DOCUMENTS",
  "TAX",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface EventTypeDef {
  /** stable machine id, e.g. "move_between_cantons" */
  id: string;
  category: EventCategory;
  /** human title in English (i18n keys resolve from the id) */
  title: string;
  description: string;
  /**
   * Facts that can change the answer for this event. The clarification engine
   * only asks about facts that are (a) listed here, (b) not already known from
   * profile/entities, and (c) referenced by at least one active rule.
   */
  relevantFacts: FactKey[];
  /** keyword/phrase hints used by the deterministic classifier and hybrid search */
  keywords: string[];
  /** treat with extra care: legal/immigration/tax/benefits consequences */
  highConsequence?: boolean;
}

export type FactKey =
  | "canton" // current/destination canton
  | "origin_canton"
  | "municipality"
  | "nationality_category" // swiss | eu_efta | third_country
  | "residence_permit" // none | L | B | C | other
  | "employment_status" // employed | self_employed | student | unemployed | retired | other
  | "has_vehicle"
  | "has_children"
  | "children_school_age"
  | "has_pets"
  | "event_date"
  | "child_born_in_ch"
  | "marital_status"
  | "fine_type" // parking | traffic | public_transport | police | administrative | unknown
  | "education_next_step" // university | applied_sciences | apprenticeship | work | gap_year | unsure
  | "business_legal_form" // sole_proprietorship | gmbh | ag | unsure
  | "permit_type"
  | "moving_abroad_country_known"
  | "travelcard_type"; // half_fare | ga | other

export interface FactDef {
  key: FactKey;
  question: string;
  /** why we ask — shown to the user (privacy-by-design transparency) */
  whyWeAsk: string;
  options?: { value: string; label: string }[];
  /** free-form input (e.g. municipality, date) */
  input?: "text" | "date";
}

export const FACT_DEFS: Record<FactKey, FactDef> = {
  canton: {
    key: "canton",
    question: "Which canton do you live in (or are you moving to)?",
    whyWeAsk: "Many obligations and deadlines are set at cantonal level.",
    input: "text",
  },
  origin_canton: {
    key: "origin_canton",
    question: "Which canton are you moving from?",
    whyWeAsk: "You must deregister with your previous municipality.",
    input: "text",
  },
  municipality: {
    key: "municipality",
    question: "Which municipality (Gemeinde/commune)?",
    whyWeAsk: "Registration happens at your municipality's residents' office.",
    input: "text",
  },
  nationality_category: {
    key: "nationality_category",
    question: "What is your nationality situation?",
    whyWeAsk: "Permit and registration duties differ for Swiss, EU/EFTA and third-country nationals.",
    options: [
      { value: "swiss", label: "Swiss citizen" },
      { value: "eu_efta", label: "EU / EFTA citizen" },
      { value: "third_country", label: "Other nationality" },
    ],
  },
  residence_permit: {
    key: "residence_permit",
    question: "Which residence permit do you hold?",
    whyWeAsk: "Permit type changes which authority you deal with and which deadlines apply.",
    options: [
      { value: "none", label: "None" },
      { value: "L", label: "L (short-term)" },
      { value: "B", label: "B (residence)" },
      { value: "C", label: "C (settlement)" },
      { value: "other", label: "Other" },
    ],
  },
  employment_status: {
    key: "employment_status",
    question: "What is your employment situation?",
    whyWeAsk: "Some steps (e.g. unemployment registration, family allowance) depend on employment.",
    options: [
      { value: "employed", label: "Employed" },
      { value: "self_employed", label: "Self-employed" },
      { value: "student", label: "Student" },
      { value: "unemployed", label: "Unemployed" },
      { value: "retired", label: "Retired" },
      { value: "other", label: "Other" },
    ],
  },
  has_vehicle: {
    key: "has_vehicle",
    question: "Do you own a vehicle?",
    whyWeAsk: "Vehicles must be re-registered when you move to another canton.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  has_children: {
    key: "has_children",
    question: "Do you have children living with you?",
    whyWeAsk: "School enrolment and family allowance steps only apply with children.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  children_school_age: {
    key: "children_school_age",
    question: "Are any of your children of school age?",
    whyWeAsk: "School registration is handled by the municipality.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  has_pets: {
    key: "has_pets",
    question: "Do you have a dog?",
    whyWeAsk: "Dogs must be registered with the municipality; dog tax varies locally.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  event_date: {
    key: "event_date",
    question: "When did this happen (or when will it)?",
    whyWeAsk: "Several deadlines are counted from this date.",
    input: "date",
  },
  child_born_in_ch: {
    key: "child_born_in_ch",
    question: "Was the child born in Switzerland?",
    whyWeAsk: "Birth registration differs for births abroad.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  marital_status: {
    key: "marital_status",
    question: "What is your marital status?",
    whyWeAsk: "Some family steps depend on marital status.",
    options: [
      { value: "married", label: "Married / registered partnership" },
      { value: "single", label: "Single" },
      { value: "other", label: "Other" },
    ],
  },
  fine_type: {
    key: "fine_type",
    question: "What kind of fine or letter is it?",
    whyWeAsk: "The responsible authority and your options depend on the document type.",
    options: [
      { value: "parking", label: "Parking" },
      { value: "traffic", label: "Traffic / speeding" },
      { value: "public_transport", label: "Public transport" },
      { value: "police", label: "Police" },
      { value: "administrative", label: "Administrative" },
      { value: "unknown", label: "Other / not sure" },
    ],
  },
  education_next_step: {
    key: "education_next_step",
    question: "What are you thinking of doing next?",
    whyWeAsk: "We tailor deadlines and application steps to your chosen path.",
    options: [
      { value: "university", label: "University" },
      { value: "applied_sciences", label: "University of Applied Sciences" },
      { value: "apprenticeship", label: "Apprenticeship" },
      { value: "work", label: "Start working" },
      { value: "gap_year", label: "Gap year" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  business_legal_form: {
    key: "business_legal_form",
    question: "Which legal form are you considering?",
    whyWeAsk: "Registration duties differ between sole proprietorships and companies.",
    options: [
      { value: "sole_proprietorship", label: "Sole proprietorship" },
      { value: "gmbh", label: "GmbH / Sàrl" },
      { value: "ag", label: "AG / SA" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  permit_type: {
    key: "permit_type",
    question: "Which permit is expiring?",
    whyWeAsk: "Renewal processes differ by permit type.",
    options: [
      { value: "L", label: "L (short-term)" },
      { value: "B", label: "B (residence)" },
      { value: "C", label: "C (settlement)" },
      { value: "other", label: "Other" },
    ],
  },
  moving_abroad_country_known: {
    key: "moving_abroad_country_known",
    question: "Do you already know your destination country?",
    whyWeAsk: "Some steps (e.g. pension fund options) depend on where you move.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "Not yet" },
    ],
  },
  travelcard_type: {
    key: "travelcard_type",
    question: "Which travelcard do you have?",
    whyWeAsk: "Renewal conditions differ between products.",
    options: [
      { value: "half_fare", label: "Half Fare Travelcard" },
      { value: "ga", label: "GA Travelcard" },
      { value: "other", label: "Other" },
    ],
  },
};

export const EVENT_TYPES: EventTypeDef[] = [
  // HOUSING ------------------------------------------------------------------
  {
    id: "move_within_commune",
    category: "HOUSING",
    title: "Moving within your municipality",
    description: "You changed address within the same municipality.",
    relevantFacts: ["municipality", "canton", "event_date"],
    keywords: ["moved within", "same city new apartment", "change address same town"],
  },
  {
    id: "move_between_communes",
    category: "HOUSING",
    title: "Moving to another municipality",
    description: "You moved to a different municipality in the same canton.",
    relevantFacts: ["municipality", "canton", "event_date", "has_children", "has_pets"],
    keywords: ["moving to another town", "new gemeinde", "new commune"],
  },
  {
    id: "move_between_cantons",
    category: "HOUSING",
    title: "Moving to another canton",
    description: "You moved (or are moving) between Swiss cantons.",
    relevantFacts: [
      "origin_canton",
      "canton",
      "municipality",
      "event_date",
      "nationality_category",
      "residence_permit",
      "has_vehicle",
      "has_children",
      "children_school_age",
      "has_pets",
    ],
    keywords: [
      "moving to another canton",
      "moved from zurich to basel",
      "intercantonal move",
      "umzug kanton",
      "move to basel",
      "move to geneva",
      "move to zurich",
      "moving house canton",
    ],
  },
  {
    id: "arrive_in_switzerland",
    category: "HOUSING",
    title: "Arriving in Switzerland",
    description: "You are moving to Switzerland from abroad.",
    relevantFacts: ["canton", "municipality", "nationality_category", "employment_status", "event_date"],
    keywords: ["moving to switzerland", "just arrived in switzerland", "relocating to switzerland", "immigrate"],
    highConsequence: true,
  },
  {
    id: "leave_switzerland",
    category: "HOUSING",
    title: "Leaving Switzerland",
    description: "You are moving abroad and deregistering from Switzerland.",
    relevantFacts: ["canton", "municipality", "event_date", "nationality_category", "moving_abroad_country_known", "has_vehicle"],
    keywords: ["leaving switzerland", "moving abroad", "emigrat", "deregister switzerland", "move out of switzerland", "auswandern"],
    highConsequence: true,
  },

  // FAMILY -------------------------------------------------------------------
  {
    id: "child_birth",
    category: "FAMILY",
    title: "New baby",
    description: "You recently had (or are expecting) a child.",
    relevantFacts: ["canton", "municipality", "child_born_in_ch", "employment_status", "nationality_category", "event_date", "marital_status"],
    keywords: ["had a baby", "gave birth", "newborn", "new baby", "was born", "expecting", "just had a child", "avuto un bambino", "bébé", "baby bekommen"],
  },
  {
    id: "marriage",
    category: "FAMILY",
    title: "Getting married",
    description: "You are getting married or registering a partnership.",
    relevantFacts: ["canton", "municipality", "nationality_category", "event_date"],
    keywords: ["getting married", "marriage", "wedding", "registered partnership"],
  },
  {
    id: "death_family_member",
    category: "FAMILY",
    title: "Death of a family member",
    description: "A family member has died.",
    relevantFacts: ["canton", "municipality", "event_date"],
    keywords: ["family member died", "death in the family", "passed away", "bereavement"],
    highConsequence: true,
  },

  // WORK ---------------------------------------------------------------------
  {
    id: "job_loss",
    category: "WORK",
    title: "Losing your job",
    description: "Your employment ended or was terminated.",
    relevantFacts: ["canton", "municipality", "event_date", "nationality_category", "residence_permit"],
    keywords: ["lost my job", "fired", "laid off", "terminated", "unemployment", "job loss", "redundant", "dismissed", "perdu mon travail", "job verloren", "perso il lavoro"],
    highConsequence: true,
  },
  {
    id: "job_change",
    category: "WORK",
    title: "Changing jobs",
    description: "You started or changed a job.",
    relevantFacts: ["canton", "nationality_category", "residence_permit"],
    keywords: ["new job", "changed jobs", "starting a job", "first job"],
  },
  {
    id: "retirement",
    category: "WORK",
    title: "Retirement",
    description: "You are retiring or approaching retirement age.",
    relevantFacts: ["canton", "event_date", "employment_status"],
    keywords: ["retiring", "retirement", "pension", "ahv age"],
    highConsequence: true,
  },

  // EDUCATION ----------------------------------------------------------------
  {
    id: "finish_high_school",
    category: "EDUCATION",
    title: "Finishing high school",
    description: "You completed Gymnasium/Matura or equivalent and are planning what's next.",
    relevantFacts: ["canton", "education_next_step"],
    keywords: ["finished high school", "finished gymnasium", "matura", "graduated school", "finished school what next", "after high school"],
  },
  {
    id: "start_university",
    category: "EDUCATION",
    title: "Starting university",
    description: "You are applying to or starting higher education.",
    relevantFacts: ["canton", "education_next_step"],
    keywords: ["starting university", "apply to university", "eth", "study at university"],
  },

  // TRANSPORT ----------------------------------------------------------------
  {
    id: "buy_vehicle",
    category: "TRANSPORT",
    title: "Buying a vehicle",
    description: "You bought (or are buying) a car or motorcycle.",
    relevantFacts: ["canton", "event_date"],
    keywords: ["bought a car", "buying a car", "new car", "purchased a vehicle", "buy a motorcycle"],
  },
  {
    id: "swisspass_lost",
    category: "TRANSPORT",
    title: "Lost SwissPass",
    description: "Your SwissPass card was lost or stolen.",
    relevantFacts: [],
    keywords: ["lost my swisspass", "swisspass stolen", "lost swiss pass"],
  },
  {
    id: "half_fare_expiring",
    category: "TRANSPORT",
    title: "Half Fare Travelcard expiring",
    description: "Your Half Fare Travelcard (Halbtax) is approaching its expiry or renewal date.",
    relevantFacts: ["travelcard_type"],
    keywords: ["half fare", "halbtax", "half-fare card expiring", "demi-tarif", "travelcard expiring", "half fare card expires"],
  },
  {
    id: "ga_expiring",
    category: "TRANSPORT",
    title: "GA Travelcard expiring",
    description: "Your GA Travelcard is approaching renewal.",
    relevantFacts: ["travelcard_type"],
    keywords: ["ga travelcard", "general abonnement", "ga expiring"],
  },

  // IMMIGRATION --------------------------------------------------------------
  {
    id: "permit_expiring",
    category: "IMMIGRATION",
    title: "Residence permit expiring",
    description: "Your residence permit is approaching its expiry date.",
    relevantFacts: ["canton", "permit_type", "nationality_category", "event_date"],
    keywords: ["permit expires", "b permit expiring", "renew my permit", "residence permit renewal", "l permit expires", "c permit"],
    highConsequence: true,
  },

  // BUSINESS -----------------------------------------------------------------
  {
    id: "start_business",
    category: "BUSINESS",
    title: "Starting a business",
    description: "You want to become self-employed or found a company.",
    relevantFacts: ["canton", "business_legal_form", "nationality_category", "employment_status"],
    keywords: ["start a company", "start a business", "become self-employed", "gmbh", "freelance", "self employment", "self-employed", "startup", "founding a company", "firma gründen"],
  },

  // LEGAL_ADMIN --------------------------------------------------------------
  {
    id: "fine_received",
    category: "LEGAL_ADMIN",
    title: "Fine or official letter received",
    description: "You received a fine or an official letter you don't fully understand.",
    relevantFacts: ["fine_type", "canton"],
    keywords: ["got a fine", "received a fine", "parking fine", "speeding ticket", "penalty notice", "official letter", "bussе", "ordnungsbusse"],
    highConsequence: true,
  },

  // INSURANCE ----------------------------------------------------------------
  {
    id: "health_insurance_change",
    category: "INSURANCE",
    title: "Changing health insurance",
    description: "You want to change your mandatory health insurance or model.",
    relevantFacts: ["canton", "event_date"],
    keywords: ["change health insurance", "krankenkasse", "switch health insurance", "premium increase", "premium went up", "assurance maladie", "cassa malati"],
  },

  // DOCUMENTS ----------------------------------------------------------------
  {
    id: "passport_expiring",
    category: "DOCUMENTS",
    title: "Passport or ID expiring",
    description: "Your Swiss passport or identity card is approaching expiry.",
    relevantFacts: ["canton", "event_date"],
    keywords: ["passport expires", "renew passport", "id card expiring", "identity card renewal"],
  },

  // TAX ----------------------------------------------------------------------
  {
    id: "tax_return",
    category: "TAX",
    title: "Tax return",
    description: "You need to file (or extend) your tax return.",
    relevantFacts: ["canton", "event_date"],
    keywords: ["tax return", "tax declaration", "steuererklärung", "tax letter", "letter from the tax office"],
    highConsequence: true,
  },
];

export const EVENT_TYPE_MAP: Record<string, EventTypeDef> = Object.fromEntries(
  EVENT_TYPES.map((e) => [e.id, e]),
);

export function getEventType(id: string): EventTypeDef | undefined {
  return EVENT_TYPE_MAP[id];
}
