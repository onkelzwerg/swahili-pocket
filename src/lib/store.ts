import { get, set } from "idb-keyval";
import type { VocabEntry, UserStats } from "./types";
import { seedVocab } from "./seed";
import { BOX_INTERVALS_DAYS } from "./box-intervals";
import { runMigrations } from "./migrations";
import {
  cacheVocab,
  readCachedVocab,
  patchCachedVocab,
  putCard,
  removeCard,
  cacheStats,
  readCachedStats,
  applyReviewToStats,
  expireStreak,
  serializeWrite,
  EMPTY_STATS,
} from "./offline";

// Rein lokale Datenschicht: IndexedDB ist die Single Source of Truth.
// Kein Backend, kein Sync — die App gehört dem Gerät.

const K_SEEDED = "vocab:seeded";

// Re-Export für Bestandsimporte; die Tabelle lebt seit W1.1 in box-intervals.ts,
// damit Scheduler und Migration sie ohne Import-Zyklus nutzen können.
export { BOX_INTERVALS_DAYS };

/** Beim allerersten Start den kuratierten Seed-Wortschatz einspielen. */
async function ensureSeeded(): Promise<VocabEntry[]> {
  // Erster Datenzugriff der App — hier laufen ausstehende Migrationen,
  // bevor irgendetwas anderes IndexedDB liest.
  await runMigrations();
  const cached = await readCachedVocab();
  if (cached && cached.length > 0) return cached;
  const seeded = (await get<boolean>(K_SEEDED).catch(() => false)) ?? false;
  if (seeded) return cached ?? [];
  const seeds = seedVocab();
  await cacheVocab(seeds);
  await set(K_SEEDED, true).catch(() => {});
  return seeds;
}

export async function getVocab(): Promise<VocabEntry[]> {
  return ensureSeeded();
}

// Lesen-Ändern-Schreiben läuft durch serializeWrite() (siehe offline.ts):
// sonst überholen sich zwei kurz aufeinanderfolgende Antworten und die
// frühere geht verloren. `getVocab()` selbst ist ungesperrt — es liest nur
// (und stößt beim allerersten Mal Seed/Migration an), darf hier also
// innerhalb der Kette aufgerufen werden.

export async function addVocab(entry: VocabEntry) {
  await getVocab(); // stellt Seed und Migration sicher
  await putCard({ ...entry, isPrivate: entry.isPrivate ?? true });
}

export async function deleteVocab(id: string) {
  await removeCard(id);
}

export async function updateVocab(id: string, patch: Partial<VocabEntry>) {
  await patchCachedVocab(id, { ...patch, updatedAt: Date.now() });
}

export async function getStats(): Promise<UserStats> {
  // Wie getVocab(): erst migrieren, dann lesen. Der Home-Screen holt Stats und
  // Karten in einem Promise.all — ohne dieses Tor läse getStats() beim ersten
  // Start nach einem Update an der Migration vorbei.
  await runMigrations();
  return serializeWrite(async () => {
    const raw = (await readCachedStats()) ?? EMPTY_STATS;
    const { stats, changed } = expireStreak(raw);
    if (changed) await cacheStats(stats);
    return stats;
  });
}

export async function recordReview(correct: boolean, now: number = Date.now()): Promise<UserStats> {
  return serializeWrite(async () => {
    const prev = (await readCachedStats()) ?? EMPTY_STATS;
    const next = applyReviewToStats(prev, correct, now);
    await cacheStats(next);
    return next;
  });
}

/**
 * XP gutschreiben, ohne den Review-Zähler oder die Streak zu berühren.
 * Für den Morphologie-Trainer (W2.7): er übt Grammatik, keine Karten —
 * `totalReviewed` und die Lerntage bleiben deshalb den Karten vorbehalten.
 */
export async function awardXp(amount: number): Promise<UserStats> {
  return serializeWrite(async () => {
    const prev = (await readCachedStats()) ?? EMPTY_STATS;
    const next: UserStats = { ...prev, xp: prev.xp + amount };
    await cacheStats(next);
    return next;
  });
}

/**
 * Heute fällige Karten.
 *
 * Kein `box < 5`-Filter mehr: Box-5-Karten kehren nach ihrem 90-Tage-Intervall
 * bewusst zurück. "Gemeistert" heißt lange Abstände, nicht nie wieder —
 * ohne Wiederholung ist auch eine Box-5-Karte irgendwann weg.
 */
export function dueToday(list: VocabEntry[], now: number = Date.now()): VocabEntry[] {
  return list.filter((e) => e.nextReview <= now);
}

export function nextReviewDate(box: number): number {
  const days = BOX_INTERVALS_DAYS[box as VocabEntry["box"]] ?? 1;
  return Date.now() + days * 86400000;
}

export function newId() {
  return crypto.randomUUID();
}
