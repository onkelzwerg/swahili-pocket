import type { VocabEntry } from "../types";
import { shuffle } from "../utils";
import type { ExerciseMode } from "./types";

// Distraktoren für den Hör-Modus (W2.4).
// Sie kommen bewusst aus dem eigenen Kartenbestand: fremde Wörter wären
// zu leicht auszuschließen, und der Nutzer sieht nur Bedeutungen, die er
// tatsächlich lernt.

/** So viele falsche Optionen braucht eine faire Frage. */
export const DISTRACTOR_COUNT = 3;

/**
 * Falsche Antwortoptionen wählen — bevorzugt aus derselben Wortart, damit die
 * Wortart nicht die Lösung verrät. Nie die richtige Antwort, nie Duplikate
 * (weder Karte noch deutsche Bedeutung).
 */
export function pickDistractors(
  card: VocabEntry,
  vocab: VocabEntry[],
  count: number = DISTRACTOR_COUNT,
  rng: () => number = Math.random,
): VocabEntry[] {
  const takenGerman = new Set([card.german.trim().toLowerCase()]);
  const candidates = vocab.filter((v) => {
    if (v.id === card.id) return false;
    const g = v.german.trim().toLowerCase();
    if (!g || takenGerman.has(g)) return false;
    takenGerman.add(g);
    return true;
  });

  const sameKind = shuffle(
    candidates.filter((v) => v.partOfSpeech === card.partOfSpeech),
    rng,
  );
  const others = shuffle(
    candidates.filter((v) => v.partOfSpeech !== card.partOfSpeech),
    rng,
  );
  // Erst gleiche Wortart, dann auffüllen — lieber eine unpassende Option als
  // eine Frage mit zwei Antwortmöglichkeiten.
  return [...sameKind, ...others].slice(0, count);
}

/** Gibt es genug Bestand für vier unterscheidbare Optionen? */
export function hasEnoughDistractors(card: VocabEntry, vocab: VocabEntry[]): boolean {
  return pickDistractors(card, vocab).length >= DISTRACTOR_COUNT;
}

export const audioMode: ExerciseMode = {
  id: "audio",
  isEligible: (card, ctx) => ctx.hasAudio && hasEnoughDistractors(card, ctx.vocab),
  weight: () => 1,
};
