import type { VocabEntry } from "./types";

// Eigenes Modul (statt in store.ts), damit die Scheduler und die Migration
// die Tabelle nutzen können, ohne einen Import-Zyklus über store.ts zu bauen.
// store.ts re-exportiert sie für Bestandsimporte.

/**
 * Leitner-Intervalle in Tagen.
 * Box 5 = 90 Tage statt "nie wieder": "gemeistert" heißt lange Abstände,
 * nicht Aussortieren (siehe dueToday() in store.ts).
 */
export const BOX_INTERVALS_DAYS: Record<VocabEntry["box"], number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 90,
};
