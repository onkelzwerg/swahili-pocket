import { get, set } from "idb-keyval";
import type { VocabEntry, UserStats } from "./types";
import { seedVocab } from "./seed";
import {
  cacheVocab,
  readCachedVocab,
  patchCachedVocab,
  cacheStats,
  readCachedStats,
  applyReviewToStats,
} from "./offline";

// Rein lokale Datenschicht: IndexedDB ist die Single Source of Truth.
// Kein Backend, kein Sync — die App gehört dem Gerät.

const K_SEEDED = "vocab:seeded";

export const BOX_INTERVALS_DAYS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 30,
};

const EMPTY_STATS: UserStats = {
  streak: 0,
  lastReviewDate: "",
  totalReviewed: 0,
  xp: 0,
};

/** Beim allerersten Start den kuratierten Seed-Wortschatz einspielen. */
async function ensureSeeded(): Promise<VocabEntry[]> {
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
  const s = (await readCachedStats()) ?? EMPTY_STATS;
  // Streak ablaufen lassen, wenn der letzte Review-Tag >1 Tag zurückliegt.
  if (s.lastReviewDate && s.streak > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const diff =
      (new Date(today + "T00:00:00").getTime() -
        new Date(s.lastReviewDate + "T00:00:00").getTime()) /
      86400000;
    if (diff > 1) {
      const expired = { ...s, streak: 0 };
      await cacheStats(expired);
      return expired;
    }
  }
  return s;
}

export async function recordReview(
  correct: boolean,
  _ctx?: { vocabId: string; newBox: 1 | 2 | 3 | 4 | 5; nextReview: number },
): Promise<UserStats> {
  const prev = (await readCachedStats()) ?? EMPTY_STATS;
  const next = applyReviewToStats(prev, correct);
  await cacheStats(next);
  return next;
}

export function dueToday(list: VocabEntry[]): VocabEntry[] {
  const now = Date.now();
  return list.filter((e) => e.box < 5 && e.nextReview <= now);
}

export function nextReviewDate(box: number): number {
  const days = BOX_INTERVALS_DAYS[box] ?? 1;
  return Date.now() + days * 86400000;
}

export function newId() {
  return crypto.randomUUID();
}
