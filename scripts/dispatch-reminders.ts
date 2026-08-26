/** Reminder dispatch, CLI form: npm run cron:reminders */
import { dispatchDueReminders } from "@/lib/reminders/dispatch";

async function main() {
  const summary = await dispatchDueReminders();
  console.log(
    `${summary.due} due · ${summary.sent} sent · ${summary.failed} failed · transport: ${summary.transport}` +
      (summary.delivers ? "" : " (dev transport — logged, not delivered)"),
  );
  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
