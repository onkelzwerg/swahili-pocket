import { get, set } from "idb-keyval";
import type { VocabEntry, UserStats } from "./types";
import { isoDay, daysBetween, weekStart } from "./dates";

const K_VOCAB = "vocab:list";
const K_VOCAB_AT = "vocab:syncedAt";
const K_STATS = "stats:current";

/** Maximal so viele Streak-Joker kann man gleichzeitig halten. */
export const MAX_FREEZES = 2;
/** Alle so vielen Lerntage wird ein Joker verdient. */
export const FREEZE_EARN_EVERY_DAYS = 7;

export const EMPTY_STATS: UserStats = {
  streak: 0,
  lastReviewDate: "",
  totalReviewed: 0,
  xp: 0,
  weekDays: [],
  freezes: 0,
  totalDaysLearned: 0,
};

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

/**
 * Stats aus v1-Beständen (oder einem alten Backup) auffüllen.
 * `comeback` ist transient und wird nie gespeichert.
 */
export function normalizeStats(raw: Partial<UserStats> | null | undefined): UserStats {
  if (!raw) return { ...EMPTY_STATS };
  return {
    streak: raw.streak ?? 0,
    lastReviewDate: raw.lastReviewDate ?? "",
    totalReviewed: raw.totalReviewed ?? 0,
    xp: raw.xp ?? 0,
    weekDays: Array.isArray(raw.weekDays) ? raw.weekDays : [],
    freezes: typeof raw.freezes === "number" ? raw.freezes : 0,
    totalDaysLearned: raw.totalDaysLearned ?? (raw.lastReviewDate ? Math.max(1, raw.streak ?? 1) : 0),
    ...(raw.lastFreezeEarned ? { lastFreezeEarned: raw.lastFreezeEarned } : {}),
  };
}

export async function cacheStats(s: UserStats) {
  const { comeback: _drop, ...persisted } = s;
  await set(K_STATS, persisted).catch(() => {});
}
export async function readCachedStats(): Promise<UserStats | null> {
  const raw = await get<Partial<UserStats>>(K_STATS).catch(() => null);
  return raw ? normalizeStats(raw) : null;
}

/** Lerntage der laufenden Woche, ältere Einträge fallen raus. */
export function pruneWeekDays(days: string[], today: string): string[] {
  const start = weekStart(today);
  return [...new Set(days)].filter((d) => d >= start && d <= today).sort();
}

/** Stats-Logik für einen Review (Streak, Wochenziel, Joker, XP, Zähler). */
export function applyReviewToStats(
  prev: UserStats,
  correct: boolean,
  now: number = Date.now(),
): UserStats {
  const today = isoDay(now);
  const base = normalizeStats(prev);
  const last = base.lastReviewDate || null;
  const isNewDay = last !== today;

  let streak = base.streak;
  let freezes = base.freezes;
  let totalDaysLearned = base.totalDaysLearned;
  let lastFreezeEarned = base.lastFreezeEarned;

  if (isNewDay) {
    streak = last && daysBetween(last, today) === 1 ? streak + 1 : 1;
    totalDaysLearned += 1;
    // Joker verdienen: alle 7 Lerntage einer, gedeckelt bei MAX_FREEZES.
    if (totalDaysLearned % FREEZE_EARN_EVERY_DAYS === 0 && freezes < MAX_FREEZES) {
      freezes += 1;
      lastFreezeEarned = today;
    }
  }

  return {
    streak,
    lastReviewDate: today,
    totalReviewed: base.totalReviewed + 1,
    xp: base.xp + (correct ? 10 : 0),
    weekDays: pruneWeekDays([...base.weekDays, today], today),
    freezes,
    totalDaysLearned,
    ...(lastFreezeEarned ? { lastFreezeEarned } : {}),
  };
}

/** Rückgabe von expireStreak(): geänderte Stats + ob gespeichert werden muss. */
export interface StreakDecay {
  stats: UserStats;
  changed: boolean;
}

/**
 * Streak-Verfall beim Lesen anwenden.
 *
 * - Lücke von genau einem Tag und ein Joker vorhanden → Joker einlösen,
 *   Streak bleibt. `lastReviewDate` rückt auf gestern, damit heute normal
 *   weiterzählt.
 * - Größere Lücke oder kein Joker → Streak auf 0.
 * - Ab einer Woche Pause: `comeback` (transient) für die Home-Karte.
 */
export function expireStreak(raw: UserStats, now: number = Date.now()): StreakDecay {
  const stats = normalizeStats(raw);
  const today = isoDay(now);
  if (!stats.lastReviewDate) return { stats, changed: false };

  const gap = daysBetween(stats.lastReviewDate, today);
  let changed = false;
  let next: UserStats = { ...stats, weekDays: pruneWeekDays(stats.weekDays, today) };
  if (next.weekDays.length !== stats.weekDays.length) changed = true;

  if (stats.streak > 0 && gap === 2 && stats.freezes > 0) {
    next = {
      ...next,
      freezes: stats.freezes - 1,
      // Auf gestern setzen: die Streak läuft damit heute ungebrochen weiter.
      lastReviewDate: isoDay(now - 86_400_000),
    };
    changed = true;
  } else if (stats.streak > 0 && gap > 1) {
    next = { ...next, streak: 0 };
    changed = true;
  }

  // Transient, nie persistiert.
  const comeback = gap >= 7;
  return { stats: comeback ? { ...next, comeback: true } : next, changed };
}
