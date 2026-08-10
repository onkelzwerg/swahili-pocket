import type { VocabEntry } from "../types";
import type { ExerciseMode } from "./types";

// Produktion statt Rekognition (Roediger & Karpicke 2006): das Wort selbst
// schreiben ist der wirksamste Abruf — aber erst, wenn es überhaupt erkannt
// wird. Neue Karten werden deshalb zuerst erkannt, dann produziert.

/** Ab dieser Leitner-Box gilt eine Karte als erkannt. */
export const TYPED_MIN_BOX = 2;
/** Alternativkriterium für FSRS-Nutzer: Stabilität in Tagen. */
export const TYPED_MIN_STABILITY = 3;
/** Höchstanteil einer Session — Tippen ist anstrengend, es soll würzen. */
export const TYPED_MAX_SHARE = 0.4;

export function isTypedReady(card: VocabEntry): boolean {
  return card.box >= TYPED_MIN_BOX || (card.fsrs?.stability ?? 0) >= TYPED_MIN_STABILITY;
}

export const typedMode: ExerciseMode = {
  id: "typed",
  isEligible: (card) => {
    // Mehrwortkarten ("habari gani") wären reine Tipparbeit, kein Abruf.
    if (/\s/.test(card.swahili.trim())) return false;
    return isTypedReady(card);
  },
  weight: () => 2,
  maxShare: TYPED_MAX_SHARE,
};
