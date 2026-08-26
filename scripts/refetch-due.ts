/**
 * Scheduled change monitoring, CLI form: npm run cron:refetch
 * Point your OS scheduler (cron / Windows Task Scheduler) at this for
 * self-hosted deployments; hosted deployments can call /api/cron/refetch.
 */
import { refetchDueSources } from "@/lib/sources/refetch";

async function main() {
  const summary = await refetchDueSources();
  console.log(
    `Checked ${summary.checked} sources · ${summary.due} due · ` +
      `${summary.indexed} refreshed · ${summary.queuedForReview} queued for review · ${summary.failed} failed`,
  );
  for (const r of summary.results) console.log(`  ${r.title}: ${r.message}`);
  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
