/**
 * Multilingual architecture (EN launch, DE/FR/IT ready).
 *
 * UI strings resolve through `t(locale, key)`. The English catalogue is the
 * source of truth; other catalogues override what they translate and fall back
 * to English for the rest — so translation can land incrementally without
 * blocking releases. Query language is detected per request
 * (see detectLanguage in the AI layer) and answers are generated in the user's
 * language when an LLM provider is configured.
 *
 * Official organisation names are never machine-translated: authority names
 * come from the authority directory verbatim.
 */

export type Locale = "en" | "de" | "fr" | "it";

export const LOCALES: Locale[] = ["en", "de", "fr", "it"];

const en = {
  "app.tagline": "Tell Dumonda what happened. We'll tell you what to do next.",
  "app.trustline": "Built from verified Swiss sources",
  "ask.placeholder": "e.g. I moved to Basel last week…",
  "ask.submit": "Show me what to do",
  "task.required": "Required",
  "task.may_apply": "May apply",
  "task.recommended": "Recommended",
  "task.information": "Good to know",
  "source.verified": "Verified source",
  "source.pending": "Pending verification",
} as const;

export type MessageKey = keyof typeof en;

const de: Partial<Record<MessageKey, string>> = {
  "app.tagline": "Sag Dumonda, was passiert ist. Wir sagen dir, was als Nächstes zu tun ist.",
  "app.trustline": "Auf Basis verifizierter Schweizer Quellen",
  "ask.placeholder": "z. B. Ich bin letzte Woche nach Basel gezogen…",
  "ask.submit": "Zeig mir, was zu tun ist",
  "task.required": "Erforderlich",
  "task.may_apply": "Kann zutreffen",
  "task.recommended": "Empfohlen",
  "task.information": "Gut zu wissen",
  "source.verified": "Verifizierte Quelle",
  "source.pending": "Verifizierung ausstehend",
};

const fr: Partial<Record<MessageKey, string>> = {
  "app.tagline": "Dites à Dumonda ce qui s'est passé. Nous vous dirons quoi faire ensuite.",
  "app.trustline": "Fondé sur des sources suisses vérifiées",
  "ask.placeholder": "p. ex. J'ai déménagé à Bâle la semaine dernière…",
  "ask.submit": "Montrez-moi quoi faire",
  "task.required": "Obligatoire",
  "task.may_apply": "Peut s'appliquer",
  "task.recommended": "Recommandé",
  "task.information": "Bon à savoir",
  "source.verified": "Source vérifiée",
  "source.pending": "Vérification en attente",
};

const it: Partial<Record<MessageKey, string>> = {
  "app.tagline": "Racconta a Dumonda cosa è successo. Ti diremo cosa fare dopo.",
  "app.trustline": "Basato su fonti svizzere verificate",
  "ask.placeholder": "es. Mi sono trasferito a Basilea la settimana scorsa…",
  "ask.submit": "Mostrami cosa fare",
  "task.required": "Obbligatorio",
  "task.may_apply": "Può applicarsi",
  "task.recommended": "Consigliato",
  "task.information": "Utile da sapere",
  "source.verified": "Fonte verificata",
  "source.pending": "Verifica in sospeso",
};

const catalogues: Record<Locale, Partial<Record<MessageKey, string>>> = { en, de, fr, it };

export function t(locale: Locale, key: MessageKey): string {
  return catalogues[locale]?.[key] ?? en[key];
}
