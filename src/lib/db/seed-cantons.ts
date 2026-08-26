import type { RuleDef } from "@/lib/rules/types";
import type { SeedAuthority, SeedSource } from "./seed-data";

/**
 * Cantonal coverage for the six most populous cantons (ZH, BE, VD, AG, SG,
 * GE) across moving, residence permits and taxes.
 *
 * Mechanism: cantonal rules use jurisdiction "CH-<code>" and emit tasks with
 * the SAME titles as the federal baseline tasks — the rules engine's
 * specificity override then replaces the generic task with the
 * canton-specific one (authority + official cantonal website) when the
 * user's canton matches.
 *
 * Honesty: descriptions state structural facts (which cantonal authority is
 * responsible, where the official portal lives) and never invent
 * canton-specific deadlines or fees. Sources point at official cantonal
 * domains and ship as seed_demo until fetched and verified.
 */

interface CantonInfo {
  code: string;
  name: string;
  domain: string;
  language: "de" | "fr";
}

const CANTONS_COVERED: CantonInfo[] = [
  { code: "ZH", name: "Zürich", domain: "www.zh.ch", language: "de" },
  { code: "BE", name: "Bern", domain: "www.be.ch", language: "de" },
  { code: "VD", name: "Vaud", domain: "www.vd.ch", language: "fr" },
  { code: "AG", name: "Aargau", domain: "www.ag.ch", language: "de" },
  { code: "SG", name: "St. Gallen", domain: "www.sg.ch", language: "de" },
  { code: "GE", name: "Geneva", domain: "www.ge.ch", language: "fr" },
];

export const CANTONAL_AUTHORITIES: SeedAuthority[] = CANTONS_COVERED.flatMap((c) => [
  {
    id: `auth_${c.code.toLowerCase()}_migration`,
    name: `Migration office of the Canton of ${c.name}`,
    level: "cantonal",
    canton: c.code,
    officialDomain: c.domain,
    supportedServices: ["residence_permits", "arrival", "departure"],
  },
  {
    id: `auth_${c.code.toLowerCase()}_tax`,
    name: `Tax administration of the Canton of ${c.name}`,
    level: "cantonal",
    canton: c.code,
    officialDomain: c.domain,
    supportedServices: ["tax", "tax_return"],
  },
]);

export const CANTONAL_SOURCES: SeedSource[] = CANTONS_COVERED.map((c) => ({
  id: `src_${c.code.toLowerCase()}_canton`,
  title: `Canton of ${c.name} — official cantonal portal`,
  authorityName: `Canton of ${c.name}`,
  authorityLevel: "cantonal",
  canton: c.code,
  url: `https://${c.domain}/`,
  sourceType: "canton",
  language: c.language,
  eventTags: ["move_between_cantons", "permit_expiring", "tax_return"],
  extractedText:
    `The official portal of the Canton of ${c.name} (${c.domain}) is the entry point for cantonal services: ` +
    `registration and deregistration are handled by the residents' registration office of your municipality; ` +
    `residence permits are issued and renewed by the cantonal migration office; income and wealth taxes are ` +
    `assessed by the cantonal tax administration, which publishes the filing deadline and extension procedure ` +
    `for the canton. Exact deadlines, fees and forms are published on the cantonal website.`,
}));

// The ZH source src_zh_umzug already exists in the base seed; these rules use
// the per-canton portal sources above.

function movingRule(c: CantonInfo): RuleDef {
  return {
    id: `rule_move_register_${c.code.toLowerCase()}`,
    eventType: "move_between_cantons",
    jurisdiction: `CH-${c.code}`,
    conditions: { all: [] },
    version: 1,
    active: true,
    sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_chch_moving"],
    actions: [
      {
        // Same title as the federal task → cantonal override by specificity.
        title: "Register with your new municipality within 14 days",
        description:
          `Register at the residents' registration office of your municipality in the Canton of ${c.name}. ` +
          `The cantonal portal (${c.domain}) lists your municipality's office and whether online registration (eMoving/eUmzug/eDéménagement) is available.`,
        category: "registration",
        priority: "required",
        authorityName: `Residents' registration office (municipality, Canton of ${c.name})`,
        authorityLevel: "municipal",
        officialUrl: `https://${c.domain}/`,
        sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_chch_moving"],
        documentsRequired: [
          "Identity document",
          "Rental contract or landlord confirmation",
          "Residence permit (foreign nationals)",
        ],
        deadline: {
          type: "relative",
          amount: 14,
          unit: "days",
          anchor: "event_date",
          label: "Within 14 days of moving in",
        },
      },
    ],
  };
}

/**
 * Two rules mirroring the federal permit rules' conditions exactly, so each
 * cantonal task only ever overrides its federal counterpart — never appears
 * alongside it.
 */
function permitRules(c: CantonInfo): RuleDef[] {
  const base = {
    eventType: "permit_expiring",
    jurisdiction: `CH-${c.code}`,
    version: 1,
    active: true,
    sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_sem_permits"],
  };
  return [
    {
      ...base,
      id: `rule_permit_office_${c.code.toLowerCase()}`,
      conditions: { any: [
        { fact: "permit_type", op: "eq", value: "B" },
        { fact: "permit_type", op: "eq", value: "L" },
      ] },
      actions: [
        {
          title: "Apply for renewal at your cantonal migration office",
          description:
            `For residents of the Canton of ${c.name}, permit renewals are handled by the cantonal migration office; ` +
            `forms and the current procedure are published on ${c.domain}. B-permit renewals can be filed at the earliest 3 months ` +
            `and at the latest 14 days before expiry.`,
          category: "immigration",
          priority: "required",
          authorityName: `Migration office of the Canton of ${c.name}`,
          authorityLevel: "cantonal",
          officialUrl: `https://${c.domain}/`,
          sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_sem_permits"],
          documentsRequired: ["Current permit", "Passport / identity document", "Renewal form of the canton"],
          deadline: { type: "unknown", label: "At the latest 14 days before expiry" },
        },
      ],
    },
    {
      ...base,
      id: `rule_permit_unknown_${c.code.toLowerCase()}`,
      conditions: { fact: "permit_type", op: "not_exists" },
      actions: [
        {
          title: "Contact your cantonal migration office about renewal",
          description:
            `Residence permits in the Canton of ${c.name} are renewed by the cantonal migration office (see ${c.domain}). ` +
            `Renewal windows depend on the permit type — for B permits, at the latest 14 days before expiry.`,
          category: "immigration",
          priority: "required",
          authorityName: `Migration office of the Canton of ${c.name}`,
          authorityLevel: "cantonal",
          officialUrl: `https://${c.domain}/`,
          sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_sem_permits"],
        },
      ],
    },
  ];
}

function taxRule(c: CantonInfo): RuleDef {
  return {
    id: `rule_tax_return_${c.code.toLowerCase()}`,
    eventType: "tax_return",
    jurisdiction: `CH-${c.code}`,
    conditions: { all: [] },
    version: 1,
    active: true,
    sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_estv_tax"],
    actions: [
      {
        title: "File your tax return with your cantonal tax administration",
        description:
          `As a resident of the Canton of ${c.name}, you file with the cantonal tax administration. ` +
          `The filing deadline and the extension procedure are published on ${c.domain} — most cantons allow online filing and online deadline extensions.`,
        category: "tax",
        priority: "required",
        authorityName: `Tax administration of the Canton of ${c.name}`,
        authorityLevel: "cantonal",
        officialUrl: `https://${c.domain}/`,
        sourceIds: [`src_${c.code.toLowerCase()}_canton`, "src_estv_tax"],
        deadline: { type: "unknown", label: "Cantonal filing deadline — published on the cantonal website" },
      },
    ],
  };
}

/** Federal baseline for tax_return so the event works in every canton. */
export const TAX_BASE_RULE: RuleDef = {
  id: "rule_tax_return_ch",
  eventType: "tax_return",
  jurisdiction: "CH",
  conditions: { all: [] },
  version: 1,
  active: true,
  sourceIds: ["src_estv_tax"],
  actions: [
    {
      title: "File your tax return with your cantonal tax administration",
      description:
        "Income and wealth taxes for individuals are assessed by the cantons: you file one return with the tax administration of your canton of residence. Filing deadlines and extensions are cantonal.",
      category: "tax",
      priority: "required",
      authorityName: "Cantonal tax administration",
      authorityLevel: "cantonal",
      sourceIds: ["src_estv_tax"],
      deadline: { type: "unknown", label: "Cantonal filing deadline" },
    },
    {
      title: "Ask for an extension if you can't file in time",
      description:
        "Every canton offers a deadline extension procedure, usually online. Request it before the filing deadline stated on your tax documents.",
      category: "tax",
      priority: "recommended",
      authorityName: "Cantonal tax administration",
      authorityLevel: "cantonal",
      sourceIds: ["src_estv_tax"],
    },
  ],
};

export const CANTONAL_RULES: RuleDef[] = [
  TAX_BASE_RULE,
  ...CANTONS_COVERED.flatMap((c) => [movingRule(c), ...permitRules(c), taxRule(c)]),
];
