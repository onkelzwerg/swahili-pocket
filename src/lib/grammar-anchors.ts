// Anker der Grammatikseiten — eine Stelle, damit Verlinker und Ziel nicht
// auseinanderlaufen. Der Trainer verlinkt aus jeder Aufgabe genau auf die
// Erklärung, die zu ihr gehört (siehe `hooks/use-hash-target.ts`).

/** Ziel eines „Warum?"-Links aus dem Trainer. */
export interface GrammarLink {
  to: "/classes" | "/verbs";
  hash: string;
}

/** Nomenklasse: Karte (`ngeli-ki-vi`) oder ein Abschnitt darin. */
export function classAnchor(
  id: string,
  section?: "base" | "demonstrative" | "possessive" | "variable",
): string {
  return `ngeli-${id.toLowerCase()}${section ? `-${section}` : ""}`;
}

/** Zeitform in der Verbgrammatik — `na`, `li`, `ta`, `me`, … */
export function tenseAnchor(tense: string): string {
  return `tense-${tense}`;
}

/** Die Verneinungszeile einer Zeitform. */
export function negationAnchor(tense: string): string {
  return `neg-${tense}`;
}
