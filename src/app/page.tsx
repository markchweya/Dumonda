import Link from "next/link";
import {
  Baby,
  Briefcase,
  Car,
  FileWarning,
  GraduationCap,
  Home as HomeIcon,
  Hourglass,
  PlaneTakeoff,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { AskFlow } from "@/components/ask-flow";
import { Card } from "@/components/ui";
import { t, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

interface Situation {
  icon: typeof HomeIcon;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  query: Record<Locale, string>;
}

const SITUATIONS: Situation[] = [
  {
    icon: HomeIcon,
    title: { en: "Moving", de: "Umzug", fr: "Déménagement", it: "Trasloco" },
    description: {
      en: "I've moved or I'm planning to move.",
      de: "Ich bin umgezogen oder plane einen Umzug.",
      fr: "J'ai déménagé ou je prévois de le faire.",
      it: "Mi sono trasferito o sto per farlo.",
    },
    query: {
      en: "I'm moving to another canton",
      de: "Ich ziehe in einen anderen Kanton",
      fr: "Je déménage dans un autre canton",
      it: "Mi trasferisco in un altro cantone",
    },
  },
  {
    icon: Baby,
    title: { en: "New baby", de: "Nachwuchs", fr: "Bébé", it: "Neonato" },
    description: {
      en: "I've recently had a child.",
      de: "Ich habe kürzlich ein Kind bekommen.",
      fr: "Je viens d'avoir un enfant.",
      it: "Ho appena avuto un bambino.",
    },
    query: {
      en: "I recently had a baby",
      de: "Ich habe ein Baby bekommen",
      fr: "Je viens d'avoir un bébé",
      it: "Ho appena avuto un bambino",
    },
  },
  {
    icon: Briefcase,
    title: { en: "Job change", de: "Jobwechsel", fr: "Emploi", it: "Lavoro" },
    description: {
      en: "I lost, started or changed a job.",
      de: "Ich habe einen Job verloren, begonnen oder gewechselt.",
      fr: "J'ai perdu, commencé ou changé d'emploi.",
      it: "Ho perso, iniziato o cambiato lavoro.",
    },
    query: {
      en: "I lost my job",
      de: "Ich habe meinen Job verloren",
      fr: "J'ai perdu mon travail",
      it: "Ho perso il lavoro",
    },
  },
  {
    icon: GraduationCap,
    title: { en: "Education", de: "Ausbildung", fr: "Formation", it: "Formazione" },
    description: {
      en: "I finished school or I'm starting something new.",
      de: "Ich habe die Schule beendet oder beginne etwas Neues.",
      fr: "J'ai terminé l'école ou je commence quelque chose de nouveau.",
      it: "Ho finito la scuola o sto iniziando qualcosa di nuovo.",
    },
    query: {
      en: "I just finished high school",
      de: "Ich habe gerade die Matura gemacht",
      fr: "Je viens de terminer le gymnase",
      it: "Ho appena finito il liceo",
    },
  },
  {
    icon: FileWarning,
    title: { en: "Fine or official letter", de: "Busse oder amtlicher Brief", fr: "Amende ou courrier officiel", it: "Multa o lettera ufficiale" },
    description: {
      en: "I received something I don't understand.",
      de: "Ich habe etwas erhalten, das ich nicht verstehe.",
      fr: "J'ai reçu quelque chose que je ne comprends pas.",
      it: "Ho ricevuto qualcosa che non capisco.",
    },
    query: {
      en: "I received a fine",
      de: "Ich habe eine Busse erhalten",
      fr: "J'ai reçu une amende",
      it: "Ho ricevuto una multa",
    },
  },
  {
    icon: Hourglass,
    title: { en: "Expiring soon", de: "Läuft bald ab", fr: "Expire bientôt", it: "In scadenza" },
    description: {
      en: "A permit, card, subscription or document is expiring.",
      de: "Eine Bewilligung, Karte, ein Abo oder Dokument läuft ab.",
      fr: "Un permis, une carte, un abonnement ou un document expire.",
      it: "Un permesso, una carta, un abbonamento o un documento sta scadendo.",
    },
    query: {
      en: "My residence permit is expiring",
      de: "Meine Aufenthaltsbewilligung läuft ab",
      fr: "Mon permis de séjour expire",
      it: "Il mio permesso di soggiorno sta scadendo",
    },
  },
  {
    icon: Rocket,
    title: { en: "Starting a business", de: "Firma gründen", fr: "Créer une entreprise", it: "Aprire un'attività" },
    description: {
      en: "I want to become self-employed or create a company.",
      de: "Ich möchte mich selbstständig machen oder eine Firma gründen.",
      fr: "Je veux devenir indépendant ou créer une société.",
      it: "Voglio mettermi in proprio o creare una società.",
    },
    query: {
      en: "I want to start a business",
      de: "Ich möchte eine Firma gründen",
      fr: "Je veux créer une entreprise",
      it: "Voglio aprire un'attività",
    },
  },
  {
    icon: PlaneTakeoff,
    title: { en: "Leaving Switzerland", de: "Wegzug ins Ausland", fr: "Quitter la Suisse", it: "Lasciare la Svizzera" },
    description: {
      en: "I'm moving abroad.",
      de: "Ich ziehe ins Ausland.",
      fr: "Je pars à l'étranger.",
      it: "Mi trasferisco all'estero.",
    },
    query: {
      en: "I'm leaving Switzerland",
      de: "Ich wandere aus der Schweiz aus",
      fr: "Je quitte la Suisse",
      it: "Lascio la Svizzera",
    },
  },
  {
    icon: Car,
    title: { en: "Vehicle", de: "Fahrzeug", fr: "Véhicule", it: "Veicolo" },
    description: {
      en: "I bought a car or need to sort out transport.",
      de: "Ich habe ein Auto gekauft oder muss Verkehrsfragen klären.",
      fr: "J'ai acheté une voiture ou dois régler des questions de transport.",
      it: "Ho comprato un'auto o devo sistemare questioni di trasporto.",
    },
    query: {
      en: "I bought a car",
      de: "Ich habe ein Auto gekauft",
      fr: "J'ai acheté une voiture",
      it: "Ho comprato un'auto",
    },
  },
];

const EXAMPLES: Record<Locale, string[]> = {
  en: ["I moved to another canton", "I just had a baby", "I lost my job", "My permit is expiring", "I got a fine"],
  de: ["Ich bin in einen anderen Kanton gezogen", "Ich habe ein Baby bekommen", "Ich habe meinen Job verloren", "Meine Bewilligung läuft ab", "Ich habe eine Busse erhalten"],
  fr: ["J'ai déménagé dans un autre canton", "Je viens d'avoir un bébé", "J'ai perdu mon travail", "Mon permis expire", "J'ai reçu une amende"],
  it: ["Mi sono trasferito in un altro cantone", "Ho appena avuto un bambino", "Ho perso il lavoro", "Il mio permesso sta scadendo", "Ho ricevuto una multa"],
};

export default async function HomePage() {
  const locale = await getLocale();
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {t(locale, "home.heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft sm:text-lg">
          {t(locale, "home.heroSub")}
        </p>
        <div className="mt-10">
          <AskFlow locale={locale} />
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <ShieldCheck className="h-3.5 w-3.5 text-verified" />
          {t(locale, "home.trustline")}
        </p>
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2 text-sm">
          {EXAMPLES[locale].map((example) => (
            <Link
              key={example}
              href={`/ask?q=${encodeURIComponent(example)}`}
              className="rounded-full border border-line bg-card px-3.5 py-1.5 text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
            >
              {example}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular situations */}
      <section className="border-t border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight">{t(locale, "home.popular")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATIONS.map((s) => (
              <Link key={s.title.en} href={`/ask?q=${encodeURIComponent(s.query[locale])}`}>
                <Card className="group h-full p-5 transition-all hover:border-ink/25 hover:shadow-sm">
                  <s.icon className="h-5 w-5 text-ink-soft transition-colors group-hover:text-ink" />
                  <p className="mt-3 font-medium">{s.title[locale]}</p>
                  <p className="mt-1 text-sm text-ink-soft">{s.description[locale]}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight">{t(locale, "home.how")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {([1, 2, 3] as const).map((step) => (
            <Card key={step} className="p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
                {step}
              </span>
              <p className="mt-4 font-medium">{t(locale, `home.how${step}Title` as "home.how1Title")}</p>
              <p className="mt-1 text-sm text-ink-soft">{t(locale, `home.how${step}Text` as "home.how1Text")}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{t(locale, "home.verifyTitle")}</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                {t(locale, "home.verifyText")}
              </p>
              <Link
                href="/sources"
                className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-ink-soft"
              >
                {t(locale, "home.browseSources")}
              </Link>
            </div>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Register with your new municipality</p>
                <span className="rounded-full bg-verified-soft px-2.5 py-0.5 text-xs font-medium text-verified">
                  {t(locale, "source.verified")}
                </span>
              </div>
              <div className="mt-3 border-t border-line pt-3 text-xs text-ink-soft">
                <p>ch.ch — Confederation, cantons and communes</p>
                <p className="mt-1">Within 14 days of moving in</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
