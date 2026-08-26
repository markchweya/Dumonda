import { FACT_DEFS, type FactKey } from "@/lib/events/taxonomy";
import type { Locale } from "./index";

/**
 * Localised clarification questions. The English text lives in the taxonomy
 * (single source of truth for which facts exist); these catalogues override
 * question, explanation and option labels per language, falling back to
 * English for anything untranslated.
 */

interface FactTranslation {
  question?: string;
  whyWeAsk?: string;
  /** option value → localised label */
  options?: Record<string, string>;
}

const YES_NO: Record<Locale, Record<string, string>> = {
  en: { yes: "Yes", no: "No" },
  de: { yes: "Ja", no: "Nein" },
  fr: { yes: "Oui", no: "Non" },
  it: { yes: "Sì", no: "No" },
};

const de: Partial<Record<FactKey, FactTranslation>> = {
  canton: {
    question: "In welchem Kanton wohnst du (oder wohin ziehst du)?",
    whyWeAsk: "Viele Pflichten und Fristen sind kantonal geregelt.",
  },
  origin_canton: {
    question: "Aus welchem Kanton ziehst du weg?",
    whyWeAsk: "Du musst dich bei deiner bisherigen Gemeinde abmelden.",
  },
  municipality: {
    question: "Welche Gemeinde?",
    whyWeAsk: "Die Anmeldung erfolgt bei der Einwohnerkontrolle deiner Gemeinde.",
  },
  nationality_category: {
    question: "Wie ist deine Staatsangehörigkeit?",
    whyWeAsk: "Bewilligungs- und Meldepflichten unterscheiden sich für Schweizer:innen, EU/EFTA- und Drittstaatsangehörige.",
    options: { swiss: "Schweizer Staatsangehörigkeit", eu_efta: "EU / EFTA", third_country: "Andere Staatsangehörigkeit" },
  },
  residence_permit: {
    question: "Welche Aufenthaltsbewilligung hast du?",
    whyWeAsk: "Die Bewilligungsart bestimmt Behörde und Fristen.",
    options: { none: "Keine", L: "L (Kurzaufenthalt)", B: "B (Aufenthalt)", C: "C (Niederlassung)", other: "Andere" },
  },
  employment_status: {
    question: "Wie ist deine Erwerbssituation?",
    whyWeAsk: "Einige Schritte (z. B. RAV, Familienzulagen) hängen davon ab.",
    options: { employed: "Angestellt", self_employed: "Selbstständig", student: "In Ausbildung", unemployed: "Arbeitslos", retired: "Pensioniert", other: "Anderes" },
  },
  has_vehicle: {
    question: "Besitzt du ein Fahrzeug?",
    whyWeAsk: "Fahrzeuge müssen beim Kantonswechsel umgemeldet werden.",
  },
  has_children: {
    question: "Leben Kinder bei dir?",
    whyWeAsk: "Schuleinschreibung und Familienzulagen gelten nur mit Kindern.",
  },
  children_school_age: {
    question: "Sind Kinder im schulpflichtigen Alter?",
    whyWeAsk: "Die Schulanmeldung läuft über die Gemeinde.",
  },
  has_pets: {
    question: "Hast du einen Hund?",
    whyWeAsk: "Hunde müssen bei der Gemeinde gemeldet werden; die Hundesteuer ist lokal unterschiedlich.",
  },
  event_date: {
    question: "Wann ist das passiert (oder wann wird es passieren)?",
    whyWeAsk: "Mehrere Fristen laufen ab diesem Datum.",
  },
  child_born_in_ch: {
    question: "Wurde das Kind in der Schweiz geboren?",
    whyWeAsk: "Bei Geburten im Ausland läuft die Beurkundung anders.",
  },
  marital_status: {
    question: "Wie ist dein Zivilstand?",
    whyWeAsk: "Einige Schritte hängen vom Zivilstand ab.",
    options: { married: "Verheiratet / eingetragene Partnerschaft", single: "Ledig", other: "Anderes" },
  },
  fine_type: {
    question: "Um welche Art von Busse oder Brief handelt es sich?",
    whyWeAsk: "Zuständige Behörde und Möglichkeiten hängen vom Dokumenttyp ab.",
    options: { parking: "Parkieren", traffic: "Verkehr / Geschwindigkeit", public_transport: "Öffentlicher Verkehr", police: "Polizei", administrative: "Verwaltung", unknown: "Anderes / unsicher" },
  },
  education_next_step: {
    question: "Was möchtest du als Nächstes tun?",
    whyWeAsk: "Wir passen Fristen und Bewerbungsschritte an deinen Weg an.",
    options: { university: "Universität", applied_sciences: "Fachhochschule", apprenticeship: "Lehre", work: "Arbeiten", gap_year: "Zwischenjahr", unsure: "Noch unsicher" },
  },
  business_legal_form: {
    question: "Welche Rechtsform ziehst du in Betracht?",
    whyWeAsk: "Die Registrierungspflichten unterscheiden sich je nach Rechtsform.",
    options: { sole_proprietorship: "Einzelfirma", gmbh: "GmbH", ag: "AG", unsure: "Noch unsicher" },
  },
  permit_type: {
    question: "Welche Bewilligung läuft ab?",
    whyWeAsk: "Die Verlängerung unterscheidet sich je nach Bewilligungsart.",
    options: { L: "L (Kurzaufenthalt)", B: "B (Aufenthalt)", C: "C (Niederlassung)", other: "Andere" },
  },
  moving_abroad_country_known: {
    question: "Kennst du dein Zielland schon?",
    whyWeAsk: "Einige Schritte (z. B. Pensionskasse) hängen vom Zielland ab.",
    options: { yes: "Ja", no: "Noch nicht" },
  },
  travelcard_type: {
    question: "Welches Abo hast du?",
    whyWeAsk: "Die Verlängerungsbedingungen unterscheiden sich je nach Produkt.",
    options: { half_fare: "Halbtax", ga: "GA", other: "Anderes" },
  },
};

const fr: Partial<Record<FactKey, FactTranslation>> = {
  canton: {
    question: "Dans quel canton habitez-vous (ou déménagez-vous) ?",
    whyWeAsk: "Beaucoup d'obligations et de délais sont cantonaux.",
  },
  origin_canton: {
    question: "De quel canton partez-vous ?",
    whyWeAsk: "Vous devez vous annoncer au départ auprès de votre ancienne commune.",
  },
  municipality: {
    question: "Quelle commune ?",
    whyWeAsk: "L'annonce se fait au contrôle des habitants de votre commune.",
  },
  nationality_category: {
    question: "Quelle est votre situation de nationalité ?",
    whyWeAsk: "Les obligations diffèrent pour les Suisses, les ressortissants UE/AELE et les États tiers.",
    options: { swiss: "Nationalité suisse", eu_efta: "UE / AELE", third_country: "Autre nationalité" },
  },
  residence_permit: {
    question: "Quel permis de séjour avez-vous ?",
    whyWeAsk: "Le type de permis détermine l'autorité et les délais.",
    options: { none: "Aucun", L: "L (courte durée)", B: "B (séjour)", C: "C (établissement)", other: "Autre" },
  },
  employment_status: {
    question: "Quelle est votre situation professionnelle ?",
    whyWeAsk: "Certaines démarches (ORP, allocations familiales) en dépendent.",
    options: { employed: "Salarié·e", self_employed: "Indépendant·e", student: "En formation", unemployed: "Sans emploi", retired: "À la retraite", other: "Autre" },
  },
  has_vehicle: {
    question: "Possédez-vous un véhicule ?",
    whyWeAsk: "Les véhicules doivent être réimmatriculés lors d'un changement de canton.",
  },
  has_children: {
    question: "Des enfants vivent-ils avec vous ?",
    whyWeAsk: "Inscription scolaire et allocations ne s'appliquent qu'avec des enfants.",
  },
  children_school_age: {
    question: "Des enfants en âge scolaire ?",
    whyWeAsk: "L'inscription à l'école se fait auprès de la commune.",
  },
  has_pets: {
    question: "Avez-vous un chien ?",
    whyWeAsk: "Les chiens doivent être annoncés à la commune ; l'impôt varie localement.",
  },
  event_date: {
    question: "Quand cela s'est-il passé (ou se passera-t-il) ?",
    whyWeAsk: "Plusieurs délais courent à partir de cette date.",
  },
  child_born_in_ch: {
    question: "L'enfant est-il né en Suisse ?",
    whyWeAsk: "L'enregistrement diffère pour les naissances à l'étranger.",
  },
  marital_status: {
    question: "Quel est votre état civil ?",
    whyWeAsk: "Certaines démarches dépendent de l'état civil.",
    options: { married: "Marié·e / partenariat enregistré", single: "Célibataire", other: "Autre" },
  },
  fine_type: {
    question: "De quel type d'amende ou de courrier s'agit-il ?",
    whyWeAsk: "L'autorité compétente et vos options dépendent du type de document.",
    options: { parking: "Stationnement", traffic: "Circulation / vitesse", public_transport: "Transports publics", police: "Police", administrative: "Administratif", unknown: "Autre / incertain" },
  },
  education_next_step: {
    question: "Que pensez-vous faire ensuite ?",
    whyWeAsk: "Nous adaptons délais et candidatures à votre parcours.",
    options: { university: "Université", applied_sciences: "HES", apprenticeship: "Apprentissage", work: "Travailler", gap_year: "Année sabbatique", unsure: "Pas encore sûr·e" },
  },
  business_legal_form: {
    question: "Quelle forme juridique envisagez-vous ?",
    whyWeAsk: "Les obligations d'enregistrement diffèrent selon la forme.",
    options: { sole_proprietorship: "Raison individuelle", gmbh: "Sàrl", ag: "SA", unsure: "Pas encore sûr·e" },
  },
  permit_type: {
    question: "Quel permis arrive à échéance ?",
    whyWeAsk: "Le renouvellement diffère selon le type de permis.",
    options: { L: "L (courte durée)", B: "B (séjour)", C: "C (établissement)", other: "Autre" },
  },
  moving_abroad_country_known: {
    question: "Connaissez-vous déjà votre pays de destination ?",
    whyWeAsk: "Certaines démarches (caisse de pension) en dépendent.",
    options: { yes: "Oui", no: "Pas encore" },
  },
  travelcard_type: {
    question: "Quel abonnement avez-vous ?",
    whyWeAsk: "Les conditions de renouvellement varient selon le produit.",
    options: { half_fare: "Demi-tarif", ga: "AG", other: "Autre" },
  },
};

const it: Partial<Record<FactKey, FactTranslation>> = {
  canton: {
    question: "In quale cantone vivi (o ti trasferisci)?",
    whyWeAsk: "Molti obblighi e scadenze sono cantonali.",
  },
  origin_canton: {
    question: "Da quale cantone parti?",
    whyWeAsk: "Devi notificare la partenza al tuo vecchio comune.",
  },
  municipality: {
    question: "Quale comune?",
    whyWeAsk: "La notifica avviene presso l'ufficio controllo abitanti del comune.",
  },
  nationality_category: {
    question: "Qual è la tua situazione di nazionalità?",
    whyWeAsk: "Gli obblighi differiscono per svizzeri, cittadini UE/AELS e Stati terzi.",
    options: { swiss: "Nazionalità svizzera", eu_efta: "UE / AELS", third_country: "Altra nazionalità" },
  },
  residence_permit: {
    question: "Quale permesso di soggiorno hai?",
    whyWeAsk: "Il tipo di permesso determina autorità e scadenze.",
    options: { none: "Nessuno", L: "L (breve durata)", B: "B (dimora)", C: "C (domicilio)", other: "Altro" },
  },
  employment_status: {
    question: "Qual è la tua situazione lavorativa?",
    whyWeAsk: "Alcuni passi (URC, assegni familiari) dipendono da questo.",
    options: { employed: "Dipendente", self_employed: "Indipendente", student: "In formazione", unemployed: "Disoccupato/a", retired: "In pensione", other: "Altro" },
  },
  has_vehicle: {
    question: "Possiedi un veicolo?",
    whyWeAsk: "I veicoli vanno reimmatricolati quando si cambia cantone.",
  },
  has_children: {
    question: "Vivono figli con te?",
    whyWeAsk: "Iscrizione scolastica e assegni familiari valgono solo con figli.",
  },
  children_school_age: {
    question: "Ci sono figli in età scolastica?",
    whyWeAsk: "L'iscrizione scolastica avviene tramite il comune.",
  },
  has_pets: {
    question: "Hai un cane?",
    whyWeAsk: "I cani vanno registrati presso il comune; la tassa varia localmente.",
  },
  event_date: {
    question: "Quando è successo (o quando succederà)?",
    whyWeAsk: "Diverse scadenze decorrono da questa data.",
  },
  child_born_in_ch: {
    question: "Il bambino è nato in Svizzera?",
    whyWeAsk: "La registrazione è diversa per le nascite all'estero.",
  },
  marital_status: {
    question: "Qual è il tuo stato civile?",
    whyWeAsk: "Alcuni passi dipendono dallo stato civile.",
    options: { married: "Sposato/a / unione registrata", single: "Celibe/nubile", other: "Altro" },
  },
  fine_type: {
    question: "Di che tipo di multa o lettera si tratta?",
    whyWeAsk: "Autorità competente e opzioni dipendono dal tipo di documento.",
    options: { parking: "Parcheggio", traffic: "Traffico / velocità", public_transport: "Trasporto pubblico", police: "Polizia", administrative: "Amministrativo", unknown: "Altro / non so" },
  },
  education_next_step: {
    question: "Cosa pensi di fare dopo?",
    whyWeAsk: "Adattiamo scadenze e candidature al tuo percorso.",
    options: { university: "Università", applied_sciences: "SUP", apprenticeship: "Apprendistato", work: "Lavorare", gap_year: "Anno sabbatico", unsure: "Non lo so ancora" },
  },
  business_legal_form: {
    question: "Quale forma giuridica stai considerando?",
    whyWeAsk: "Gli obblighi di registrazione variano a seconda della forma.",
    options: { sole_proprietorship: "Ditta individuale", gmbh: "Sagl", ag: "SA", unsure: "Non lo so ancora" },
  },
  permit_type: {
    question: "Quale permesso sta scadendo?",
    whyWeAsk: "Il rinnovo differisce a seconda del tipo di permesso.",
    options: { L: "L (breve durata)", B: "B (dimora)", C: "C (domicilio)", other: "Altro" },
  },
  moving_abroad_country_known: {
    question: "Conosci già il paese di destinazione?",
    whyWeAsk: "Alcuni passi (cassa pensioni) dipendono dalla destinazione.",
    options: { yes: "Sì", no: "Non ancora" },
  },
  travelcard_type: {
    question: "Quale abbonamento hai?",
    whyWeAsk: "Le condizioni di rinnovo variano a seconda del prodotto.",
    options: { half_fare: "Metà-prezzo", ga: "AG", other: "Altro" },
  },
};

const factCatalogues: Record<Locale, Partial<Record<FactKey, FactTranslation>>> = {
  en: {},
  de,
  fr,
  it,
};

export interface LocalisedFactQuestion {
  fact: FactKey;
  question: string;
  whyWeAsk: string;
  options?: { value: string; label: string }[];
  input?: "text" | "date";
}

export function localisedFactQuestion(fact: FactKey, locale: Locale): LocalisedFactQuestion {
  const def = FACT_DEFS[fact];
  const tr = factCatalogues[locale]?.[fact];
  return {
    fact,
    question: tr?.question ?? def.question,
    whyWeAsk: tr?.whyWeAsk ?? def.whyWeAsk,
    input: def.input,
    options: def.options?.map((o) => ({
      value: o.value,
      label: tr?.options?.[o.value] ?? YES_NO[locale]?.[o.value] ?? o.label,
    })),
  };
}
