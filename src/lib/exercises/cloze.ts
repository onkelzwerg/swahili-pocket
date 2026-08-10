import type { VocabEntry } from "../types";
import type { ExerciseMode } from "./types";

// Lückensatz-Logik (W2.5). Bewusst ohne Morphologie: es zählt nur, ob das
// Stichwort als eigenständiges Token in einem Beispielsatz steht. Alles
// andere (z. B. "kusoma" vs. "ninasoma") lassen wir bewusst liegen —
// falsche Lücken sind schlimmer als gar keine.

export interface ClozeTask {
  /** Satzteil vor der Lücke (inkl. Leerzeichen). */
  before: string;
  /** Satzteil nach der Lücke. */
  after: string;
  /** Erwartete Antwort — die Form, wie sie im Satz steht. */
  answer: string;
  /** Deutsche Übersetzung des Satzes (Kontext für die Lücke). */
  de: string;
  /** Vollständiger Satz, für Audio nach dem Auflösen. */
  sentence: string;
}

/** Wortgrenze für Swahili: Buchstaben und Apostroph gehören zum Wort (ng'ombe). */
const WORD_CHAR = "A-Za-zÀ-ÖØ-öø-ÿ'’";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Ersten Beispielsatz suchen, in dem `card.swahili` als eigenständiges Token
 * vorkommt, und daraus eine Lücke bauen. `null`, wenn kein Satz passt.
 */
export function makeCloze(card: VocabEntry): ClozeTask | null {
  const target = card.swahili.trim();
  if (!target) return null;
  // Mehrwortausdrücke sind als Lücke unfair — sie verraten sich über die Länge
  // nicht, aber der Nutzer müsste die exakte Wortstellung raten.
  if (/\s/.test(target)) return null;

  const pattern = new RegExp(`(^|[^${WORD_CHAR}])(${escapeRegExp(target)})(?![${WORD_CHAR}])`, "i");

  for (const ex of card.examples ?? []) {
    const sentence = ex.sw?.trim();
    if (!sentence) continue;
    const m = pattern.exec(sentence);
    if (!m) continue;
    const start = m.index + m[1].length;
    const matched = m[2];
    return {
      before: sentence.slice(0, start),
      after: sentence.slice(start + matched.length),
      answer: matched,
      de: ex.de ?? "",
      sentence,
    };
  }
  return null;
}

/** Reicht der Kartenbestand für einen Lückensatz? */
export function hasCloze(card: VocabEntry): boolean {
  return makeCloze(card) !== null;
}

export const clozeMode: ExerciseMode = {
  id: "cloze",
  isEligible: (card) => hasCloze(card),
  // Kontext schlägt Isolation (Craik & Lockhart) — deshalb leicht bevorzugt.
  weight: () => 1.5,
};
