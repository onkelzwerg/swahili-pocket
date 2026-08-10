import type { VocabEntry } from "./types";

// Coverage-Engine (W3.1): Wie viel eines Textes kennt der Nutzer schon?
//
// Bewusst simpel — ein Mengen-Schnitt zweier Lemma-Listen (Entscheidung D).
// Die Lemma-Liste eines Textes entsteht zur Build-Zeit (scripts/generate-stories.mjs
// schreibt sie in die Story-JSON), zur Laufzeit wird nichts morphologisch
// analysiert. Swahili-Formen wie `nilienda` → `kwenda` zuverlässig zu zerlegen
// wäre ein eigenes Projekt; die Pipeline weiß es ohnehin besser, weil sie
// den Text erzeugt hat.

/**
 * Textabdeckung, ab der ein Text ohne ständiges Nachschlagen lesbar ist.
 * Hu & Nation (2000): unter ~95 % bekannter Laufwörter bricht das
 * Verstehen unbetreuter Texte ein, ab ~98 % liest es sich flüssig.
 */
export const UNLOCK_AT = 0.95;
export const COMFORT_AT = 0.98;

/** Ab dieser Box gilt ein Wort als gekonnt, auch ohne `maturedAt`. */
const KNOWN_FROM_BOX = 3;
/** Ab dieser FSRS-Stabilität (Tage) ebenso — für Karten ohne Boxfortschritt. */
const KNOWN_FROM_STABILITY = 7;

/**
 * Die Lemmata, die der Nutzer "kennt" — kleingeschrieben.
 *
 * Dieselbe großzügige Definition wie im Plan: gefestigt **oder** in Box 3+
 * **oder** mit einer Woche Stabilität. Fürs Lesen reicht Wiedererkennen;
 * die strengere `maturedAt`-Definition (Level, Meilensteine) misst Abruf.
 */
export function knownLemmas(vocab: VocabEntry[]): Set<string> {
  const known = new Set<string>();
  for (const card of vocab) {
    const isKnown =
      !!card.maturedAt ||
      card.box >= KNOWN_FROM_BOX ||
      (card.fsrs?.stability ?? 0) >= KNOWN_FROM_STABILITY;
    if (isKnown) known.add(card.swahili.trim().toLowerCase());
  }
  return known;
}

/** Die Lemmata eines Textes — so, wie die Pipeline sie ausgewiesen hat. */
export interface ContentFingerprint {
  lemmas: string[];
}

export interface CoverageResult {
  /** Anteil bekannter Lemmata, 0..1. Leerer Text = 1 (nichts Unbekanntes). */
  ratio: number;
  /** Die unbekannten Lemmata, kleingeschrieben und ohne Dubletten. */
  unknown: string[];
}

/**
 * Abdeckung eines Textes gegen den bekannten Wortschatz.
 * Mehrfach vorkommende Lemmata zählen einmal — gemessen wird der Wortschatz,
 * den der Text verlangt, nicht seine Länge.
 */
export function coverage(fp: ContentFingerprint, known: Set<string>): CoverageResult {
  const lemmas = new Set(fp.lemmas.map((l) => l.trim().toLowerCase()).filter(Boolean));
  if (lemmas.size === 0) return { ratio: 1, unknown: [] };

  const unknown = [...lemmas].filter((l) => !known.has(l));
  return { ratio: (lemmas.size - unknown.length) / lemmas.size, unknown };
}

/** Ist der Text freigeschaltet (≥ 95 % bekannt)? */
export function isUnlocked(result: CoverageResult): boolean {
  return result.ratio >= UNLOCK_AT;
}

/** Liest er sich flüssig (≥ 98 % bekannt)? */
export function isComfortable(result: CoverageResult): boolean {
  return result.ratio >= COMFORT_AT;
}
