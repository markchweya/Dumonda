/**
 * Email abstraction. EMAIL_PROVIDER selects the transport:
 *
 * - "console" (default): prints the mail to the server log and reports it as
 *   delivered-for-development. Nothing leaves the machine; the UI labels
 *   reminder delivery as dev-mode when this transport is active.
 * - "resend-compat": any Resend-compatible HTTP email API
 *   (EMAIL_API_URL, EMAIL_API_KEY, EMAIL_FROM). No SDK dependency.
 */

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  readonly name: string;
  /** true when mails actually leave the system (not a dev transport) */
  readonly delivers: boolean;
  send(message: MailMessage): Promise<{ ok: boolean; detail?: string }>;
}

class ConsoleMailer implements Mailer {
  readonly name = "console";
  readonly delivers = false;

  async send(message: MailMessage) {
    console.log(
      `[mail:console] to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
    return { ok: true, detail: "logged to console (dev transport)" };
  }
}

class ResendCompatMailer implements Mailer {
  readonly name = "resend-compat";
  readonly delivers = true;

  constructor(
    private apiUrl: string,
    private apiKey: string,
    private from: string,
  ) {}

  async send(message: MailMessage) {
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
      return { ok: true };
    } catch (err) {
      return { ok: false, detail: err instanceof Error ? err.message : "network error" };
    }
  }
}

let cached: Mailer | null = null;

export function getMailer(): Mailer {
  if (cached) return cached;
  const kind = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();
  if (kind === "resend-compat" && process.env.EMAIL_API_KEY && process.env.EMAIL_FROM) {
    cached = new ResendCompatMailer(
      process.env.EMAIL_API_URL ?? "https://api.resend.com/emails",
      process.env.EMAIL_API_KEY,
      process.env.EMAIL_FROM,
    );
  } else {
    cached = new ConsoleMailer();
  }
  return cached;
}
