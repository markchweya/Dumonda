/**
 * Verification review helper: npm run sources:review
 *
 * Prints, for every source with live-fetched content, the evidence needed to
 * decide verification: fetch state, and whether the fetched text supports the
 * key claims the rules cite it for (expected phrases per source). This is a
 * decision aid — approving remains an explicit action (sources:approve or the
 * admin UI), and only sources whose checks pass should be approved.
 */
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/** Key claims per source, as case-insensitive phrase alternatives. */
const EXPECTED_CLAIMS: Record<string, { claim: string; anyOf: string[] }[]> = {
  src_chch_moving: [
    { claim: "14-day registration window", anyOf: ["14 days", "within 14"] },
    { claim: "register with the commune", anyOf: ["commune", "municipality", "residents"] },
  ],
  src_chch_baby: [
    { claim: "birth reported to civil register", anyOf: ["civil register", "register office", "birth"] },
    { claim: "insurance within 3 months", anyOf: ["three months", "3 months"] },
  ],
  src_ahv_family_allowance: [
    { claim: "family allowances", anyOf: ["family allowance", "child allowance", "familienzulagen"] },
  ],
  src_ahv_maternity: [
    { claim: "14 weeks maternity", anyOf: ["14 weeks", "98 days"] },
    { claim: "80 percent compensation", anyOf: ["80%", "80 percent", "80 per cent"] },
  ],
  src_arbeitswiss_unemployment: [
    { claim: "RAV registration", anyOf: ["rav", "regional employment", "employment centre", "employment center"] },
    { claim: "unemployment benefits", anyOf: ["unemployment"] },
  ],
  src_bag_accident_cover: [
    { claim: "health/accident insurance topic", anyOf: ["insurance"] },
  ],
  src_sem_permits: [
    { claim: "permit renewal window", anyOf: ["14 days", "before expiry", "renewal"] },
    { claim: "cantonal competence", anyOf: ["canton"] },
  ],
  src_chch_leaving: [
    { claim: "deregistration before departure", anyOf: ["deregister", "leaving switzerland", "move abroad", "moving abroad"] },
  ],
  src_astra_vehicle: [
    { claim: "vehicle/roads topic", anyOf: ["road", "vehicle", "traffic"] },
  ],
  src_easygov_start: [
    { claim: "company foundation services", anyOf: ["easygov", "company", "business"] },
  ],
  src_swissuni_admission: [
    { claim: "university admission", anyOf: ["admission", "universities", "matura", "maturity"] },
  ],
  src_berufsberatung: [
    { claim: "careers portal", anyOf: ["beruf", "lehrstellen", "berufsberatung", "studium"] },
  ],
  src_chch_fines: [
    { claim: "official portal (general)", anyOf: ["ch.ch", "confederation", "authorities", "kanton", "canton"] },
  ],
  src_estv_tax: [
    { claim: "federal tax administration", anyOf: ["tax"] },
  ],
  src_priminfo: [
    { claim: "premium comparison", anyOf: ["premium", "prämien", "insurer", "krankenversicherung"] },
  ],
  src_zh_umzug: [
    { claim: "Zürich migration/registration", anyOf: ["migration", "zürich", "zurich"] },
  ],
  src_bs_umzug: [
    { claim: "Basel-Stadt portal", anyOf: ["basel"] },
  ],
  src_seco_care_leave: [
    { claim: "SECO/labour topic", anyOf: ["seco", "arbeit", "labour", "economic affairs", "wirtschaft"] },
  ],
  src_fedlex_or_care: [
    { claim: "federal law platform", anyOf: ["fedlex", "law", "recht", "droit"] },
  ],
  src_zh_canton: [{ claim: "Canton Zürich portal", anyOf: ["zürich", "zurich", "kanton"] }],
  src_be_canton: [{ claim: "Canton Bern portal", anyOf: ["bern", "kanton", "canton"] }],
  src_vd_canton: [{ claim: "Canton Vaud portal", anyOf: ["vaud", "canton", "état"] }],
  src_ag_canton: [{ claim: "Canton Aargau portal", anyOf: ["aargau", "kanton"] }],
  src_sg_canton: [{ claim: "Canton St. Gallen portal", anyOf: ["gallen", "kanton"] }],
  src_ge_canton: [{ claim: "Canton Geneva portal", anyOf: ["genève", "geneve", "canton", "état"] }],
};

async function main() {
  const db = await getDb();
  const sources = await db.select().from(schema.sources).orderBy(asc(schema.sources.id));

  for (const s of sources) {
    const fetched = !!s.fetchedAt;
    console.log(`\n■ ${s.id}  [${s.verification}]  fetched: ${fetched ? s.fetchedAt!.toISOString().slice(0, 10) : "NEVER"}`);
    console.log(`  ${s.title}`);
    console.log(`  ${s.url}`);
    if (!fetched || !s.extractedText) {
      console.log("  → NOT VERIFIABLE (no live content)");
      continue;
    }
    const text = s.extractedText.toLowerCase();
    console.log(`  text: ${s.extractedText.length} chars — "${s.extractedText.slice(0, 160).replace(/\s+/g, " ")}…"`);
    const checks = EXPECTED_CLAIMS[s.id] ?? [];
    let allPass = true;
    for (const check of checks) {
      const pass = check.anyOf.some((phrase) => text.includes(phrase.toLowerCase()));
      if (!pass) allPass = false;
      console.log(`  ${pass ? "PASS" : "MISS"}  ${check.claim}`);
    }
    console.log(`  → ${checks.length === 0 ? "NO CHECKS DEFINED" : allPass ? "SUPPORTS CITED CLAIMS" : "REVIEW MANUALLY"}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
