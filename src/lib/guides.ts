import type { Facts } from "@/lib/rules/types";

/**
 * Curated public knowledge pages ("/moving-to-basel", …).
 *
 * Each guide renders the SAME checklist the product would generate, by
 * running the rules engine with the guide's preset facts — never hand-written
 * administrative claims. Guides are curated here deliberately: no
 * mass-generation of low-quality pages.
 *
 * Honest indexing: a guide page sets robots noindex until every source it
 * cites is human-verified in the registry.
 */

export interface GuideDef {
  slug: string;
  eventType: string;
  /** preset facts fed to the rules engine (only safely assumable ones) */
  facts: Facts;
  title: string;
  metaDescription: string;
  intro: string;
  /** the query the CTA feeds into /ask */
  askQuery: string;
}

export const GUIDES: GuideDef[] = [
  {
    slug: "moving-to-basel",
    eventType: "move_between_cantons",
    facts: { canton: "BS" },
    title: "Moving to Basel: registration, deadlines and what else applies",
    metaDescription:
      "What to do when you move to Basel-Stadt from another canton: municipal registration within 14 days, vehicle re-registration, health insurance, taxes — with official sources.",
    intro:
      "Moving to the canton of Basel-Stadt from another canton triggers a handful of obligations — registration with the residents' office within 14 days is the central one. This guide shows what applies, who is responsible and where the official services are. Tell Dumonda your exact situation and you get a personalised version with your deadlines.",
    askQuery: "I'm moving to Basel",
  },
  {
    slug: "moving-to-zurich",
    eventType: "move_between_cantons",
    facts: { canton: "ZH" },
    title: "Moving to Zürich: registration, deadlines and what else applies",
    metaDescription:
      "What to do when you move to the canton of Zürich: registration within 14 days (eUmzugZH), vehicle re-registration, health insurance premium region, taxes — with official sources.",
    intro:
      "Moving to the canton of Zürich from another canton means registering with your new municipality within 14 days — often possible online via eUmzugZH — plus a few follow-up duties depending on your situation. Here is the full picture with official sources.",
    askQuery: "I'm moving to Zürich",
  },
  {
    slug: "having-a-baby-switzerland",
    eventType: "child_birth",
    facts: {},
    title: "Having a baby in Switzerland: the official checklist",
    metaDescription:
      "New baby in Switzerland: birth registration, health insurance within 3 months, family allowance, maternity compensation — what applies, who is responsible, with official sources.",
    intro:
      "A birth in Switzerland comes with a short list of official steps — most importantly health insurance for your child within three months, retroactive to birth. Some steps depend on your employment and marital situation; Dumonda asks about exactly those and nothing more.",
    askQuery: "I recently had a baby",
  },
  {
    slug: "lost-job-switzerland",
    eventType: "job_loss",
    facts: {},
    title: "Lost your job in Switzerland: what to do now",
    metaDescription:
      "Losing a job in Switzerland: register with the RAV at the latest on your first day of unemployment, claim benefits, secure accident insurance within 31 days — with official sources.",
    intro:
      "After a termination, timing matters: registering with your regional employment centre late costs benefit days, and your accident cover ends 31 days after your last salary entitlement. This guide lists the steps in order of urgency.",
    askQuery: "I lost my job",
  },
  {
    slug: "start-business-switzerland",
    eventType: "start_business",
    facts: {},
    title: "Starting a business in Switzerland: legal forms and registrations",
    metaDescription:
      "Becoming self-employed or founding a company in Switzerland: legal forms, commercial register, AHV recognition, VAT threshold — with official sources and EasyGov links.",
    intro:
      "Whether you become self-employed or found a GmbH or AG determines which registrations apply — commercial register, AHV recognition, VAT. The Confederation's EasyGov desk bundles most of them. Here is what applies by legal form.",
    askQuery: "I want to start a business",
  },
  {
    slug: "permit-expiring-switzerland",
    eventType: "permit_expiring",
    facts: {},
    title: "Residence permit expiring: how renewal works in Switzerland",
    metaDescription:
      "B, L or C permit approaching expiry: renewal windows, the responsible cantonal migration office and required documents — with official sources.",
    intro:
      "Permit renewals are handled by the migration office of your canton of residence. For B permits, applications are filed at the earliest three months and at the latest 14 days before expiry. This guide covers the general rules; tell Dumonda your canton and permit type for the specific path.",
    askQuery: "My residence permit is expiring",
  },
];

export const GUIDE_BY_SLUG: Record<string, GuideDef> = Object.fromEntries(
  GUIDES.map((g) => [g.slug, g]),
);
