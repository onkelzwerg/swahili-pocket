import { get, set } from "idb-keyval";
import type { VocabEntry, UserStats } from "./types";

const K_VOCAB = "vocab:list";
const K_VOCAB_AT = "vocab:syncedAt";
const K_STATS = "stats:current";

export async function cacheVocab(list: VocabEntry[]) {
  await set(K_VOCAB, list).catch(() => {});
  await set(K_VOCAB_AT, Date.now()).catch(() => {});
}
export async function readCachedVocab(): Promise<VocabEntry[] | null> {
  return (await get<VocabEntry[]>(K_VOCAB).catch(() => null)) ?? null;
}
export async function patchCachedVocab(id: string, patch: Partial<VocabEntry>) {
  const cur = (await readCachedVocab()) ?? [];
  await cacheVocab(cur.map((v) => (v.id === id ? { ...v, ...patch } : v)));
}

export async function cacheStats(s: UserStats) {
  await set(K_STATS, s).catch(() => {});
}
export async function readCachedStats(): Promise<UserStats | null> {
  return (await get<UserStats>(K_STATS).catch(() => null)) ?? null;
}

/** Stats-Logik für einen Review (Streak, XP, Zähler). */
export function applyReviewToStats(prev: UserStats, correct: boolean): UserStats {
  const today = new Date().toISOString().slice(0, 10);
  let streak = prev.streak;
  const last = prev.lastReviewDate || null;
  if (last !== today) {
    if (last) {
      const diff =
        (new Date(today + "T00:00:00").getTime() - new Date(last + "T00:00:00").getTime()) /
        86400000;
      streak = diff === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
  }
  return {
    streak,
    lastReviewDate: today,
    totalReviewed: prev.totalReviewed + 1,
    xp: prev.xp + (correct ? 10 : 0),
  };
}
