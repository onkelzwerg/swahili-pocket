import { get, set } from "idb-keyval";
import type { VocabEntry, UserStats } from "./types";
import { seedVocab } from "./seed";
import { BOX_INTERVALS_DAYS } from "./box-intervals";
import { runMigrations } from "./migrations";
import {
  cacheVocab,
  readCachedVocab,
  patchCachedVocab,
  cacheStats,
  readCachedStats,
  applyReviewToStats,
  expireStreak,
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

export async function addVocab(entry: VocabEntry) {
  const list = await getVocab();
  await cacheVocab([{ ...entry, isPrivate: entry.isPrivate ?? true }, ...list]);
}

export async function deleteVocab(id: string) {
  const list = await getVocab();
  await cacheVocab(list.filter((e) => e.id !== id));
}

export async function updateVocab(id: string, patch: Partial<VocabEntry>) {
  await patchCachedVocab(id, { ...patch, updatedAt: Date.now() });
}

export async function getStats(): Promise<UserStats> {
  const raw = (await readCachedStats()) ?? EMPTY_STATS;
  const { stats, changed } = expireStreak(raw);
  if (changed) await cacheStats(stats);
  return stats;
}

export async function recordReview(correct: boolean, now: number = Date.now()): Promise<UserStats> {
  const prev = (await readCachedStats()) ?? EMPTY_STATS;
  const next = applyReviewToStats(prev, correct, now);
  await cacheStats(next);
  return next;
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
