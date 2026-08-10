import type { VocabEntry } from "./types";

// Rückkehr nach einer längeren Pause: statt Streak-Träne eine kleine,
// sicher schaffbare Runde. Bewusst gefestigte Karten — die sitzen noch
// halbwegs, das Wiedersehen fühlt sich nach Können an, nicht nach Schuld.

export const COMEBACK_SESSION_SIZE = 5;

/** Die am längsten nicht gesehenen gefestigten Karten. */
export function pickComebackCards(
  vocab: VocabEntry[],
  limit = COMEBACK_SESSION_SIZE,
): VocabEntry[] {
  const lastSeen = (c: VocabEntry) => c.lastReviewAt ?? c.updatedAt ?? c.createdAt;
  return vocab
    .filter((c) => c.maturedAt)
    .sort((a, b) => lastSeen(a) - lastSeen(b))
    .slice(0, limit);
}
