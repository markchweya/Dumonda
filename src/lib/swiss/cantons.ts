export interface Canton {
  code: string;
  name: string;
  /** name variants across DE/FR/IT/EN for entity extraction */
  variants: string[];
}

export const CANTONS: Canton[] = [
  { code: "AG", name: "Aargau", variants: ["aargau", "argovie"] },
  { code: "AI", name: "Appenzell Innerrhoden", variants: ["appenzell innerrhoden"] },
  { code: "AR", name: "Appenzell Ausserrhoden", variants: ["appenzell ausserrhoden"] },
  { code: "BE", name: "Bern", variants: ["bern", "berne", "berna"] },
  { code: "BL", name: "Basel-Landschaft", variants: ["basel-landschaft", "baselland", "basel country"] },
  { code: "BS", name: "Basel-Stadt", variants: ["basel-stadt", "basel stadt", "basel"] },
  { code: "FR", name: "Fribourg", variants: ["fribourg", "freiburg"] },
  { code: "GE", name: "Geneva", variants: ["geneva", "genève", "geneve", "genf", "ginevra"] },
  { code: "GL", name: "Glarus", variants: ["glarus"] },
  { code: "GR", name: "Graubünden", variants: ["graubünden", "graubunden", "grisons", "grigioni"] },
  { code: "JU", name: "Jura", variants: ["jura"] },
  { code: "LU", name: "Lucerne", variants: ["lucerne", "luzern", "lucerna"] },
  { code: "NE", name: "Neuchâtel", variants: ["neuchâtel", "neuchatel", "neuenburg"] },
  { code: "NW", name: "Nidwalden", variants: ["nidwalden"] },
  { code: "OW", name: "Obwalden", variants: ["obwalden"] },
  { code: "SG", name: "St. Gallen", variants: ["st. gallen", "st gallen", "saint-gall", "san gallo"] },
  { code: "SH", name: "Schaffhausen", variants: ["schaffhausen", "schaffhouse"] },
  { code: "SO", name: "Solothurn", variants: ["solothurn", "soleure"] },
  { code: "SZ", name: "Schwyz", variants: ["schwyz"] },
  { code: "TG", name: "Thurgau", variants: ["thurgau", "thurgovie"] },
  { code: "TI", name: "Ticino", variants: ["ticino", "tessin"] },
  { code: "UR", name: "Uri", variants: ["uri"] },
  { code: "VD", name: "Vaud", variants: ["vaud", "waadt"] },
  { code: "VS", name: "Valais", variants: ["valais", "wallis", "vallese"] },
  { code: "ZG", name: "Zug", variants: ["zug", "zoug"] },
  { code: "ZH", name: "Zürich", variants: ["zürich", "zurich", "zurigo"] },
];

export const CANTON_BY_CODE: Record<string, Canton> = Object.fromEntries(
  CANTONS.map((c) => [c.code, c]),
);

/** Finds cantons mentioned in free text, in order of appearance. */
export function findCantonsInText(text: string): Canton[] {
  const lower = ` ${text.toLowerCase()} `;
  const hits: { canton: Canton; index: number }[] = [];
  for (const canton of CANTONS) {
    for (const variant of canton.variants) {
      const idx = lower.indexOf(variant);
      if (idx >= 0) {
        hits.push({ canton, index: idx });
        break;
      }
    }
  }
  hits.sort((a, b) => a.index - b.index);
  // "basel" also matches "basel-landschaft" variants; dedupe by code
  const seen = new Set<string>();
  return hits
    .filter((h) => (seen.has(h.canton.code) ? false : (seen.add(h.canton.code), true)))
    .map((h) => h.canton);
}

export function cantonLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  return CANTON_BY_CODE[code.toUpperCase()]?.name ?? code;
}
