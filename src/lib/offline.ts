import { clear, del, get, set, setMany, values } from "idb-keyval";
import type { VocabEntry, UserStats } from "./types";
import { isoDay, daysBetween, weekStart } from "./dates";
import { cardStore } from "./db";

/** Bis Datenversion 2 lag hier der komplette Bestand als ein Array (siehe db.ts). */
export const K_VOCAB_LEGACY = "vocab:list";
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

/**
 * Alle Lese-Ändern-Schreiben-Folgen laufen nacheinander, nie überlappend.
 *
 * Der Review-Screen speichert bewusst im Hintergrund (`void applyReview(...)`,
 * damit das UI sofort weiterschaltet). Ohne Serialisierung liest die zweite
 * Antwort die Kartenliste, bevor die erste sie zurückgeschrieben hat — die
 * erste Antwort ist dann weg, samt Boxaufstieg, XP und Zähler. Genau das
 * verbietet Leitplanke 2 („keine stillen Datenverluste"), und genau das
 * passiert bei einem großen Review-Log, weil dessen Schreibvorgang das
 * Zeitfenster aufzieht.
 *
 * Bewusst eine einzige Kette statt Sperren je Schlüssel: die Abschnitte sind
 * kurz, alles liegt lokal, und ein Sperr-Zoo wäre mehr Risiko als Nutzen.
 *
 * WICHTIG: Aufrufe dürfen sich nicht verschachteln — eine Funktion innerhalb
 * der Kette darf `serializeWrite` nicht erneut aufrufen, sonst steht sie.
 * Die Bausteine hier (`readCachedVocab`, `cacheVocab`, `readCachedStats`,
 * `cacheStats`) sind deshalb ungesperrt und bleiben es.
 */
let writeChain: Promise<unknown> = Promise.resolve();

export function serializeWrite<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  // Ein Fehler darf die Kette nicht blockieren: der nächste Auftrag läuft.
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Kartenbestand ersetzen. Teuer (löscht und schreibt alles) und deshalb den
 * seltenen Fällen vorbehalten: Seed, Backup-Import, Methodenwechsel.
 * Für die Änderung einer einzelnen Karte gibt es `patchCachedVocab()`.
 */
export async function cacheVocab(list: VocabEntry[]) {
  const store = cardStore();
  await clear(store).catch(() => {});
  await setMany(
    list.map((card) => [card.id, card] as [string, VocabEntry]),
    store,
  ).catch(() => {});
  await set(K_VOCAB_AT, Date.now()).catch(() => {});
}

/**
 * Alle Karten, neueste zuerst.
 *
 * IndexedDB liefert nach Schlüssel sortiert — bei zufälligen UUIDs also in
 * zufälliger Reihenfolge. Bis Datenversion 2 lag der Bestand als ein Array
 * vor, und diese Reihenfolge war sichtbar: neue Karten standen im Wortschatz
 * oben. `createdAt` absteigend stellt genau das wieder her (der Seed vergibt
 * `now - i * 1000`, Neuzugänge `Date.now()`), nur eben ausgesprochen statt
 * zufällig mitgeschleppt.
 */
export async function readCachedVocab(): Promise<VocabEntry[] | null> {
  const list = await values<VocabEntry>(cardStore()).catch(() => null);
  if (!list) return null;
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/** Eine einzelne Karte ändern — ein Schlüssel, ein Schreibvorgang. */
export async function patchCachedVocab(id: string, patch: Partial<VocabEntry>) {
  await serializeWrite(async () => {
    const store = cardStore();
    const current = await get<VocabEntry>(id, store).catch(() => undefined);
    if (!current) return;
    await set(id, { ...current, ...patch }, store).catch(() => {});
  });
}

/** Eine einzelne Karte anlegen oder ersetzen. */
export async function putCard(card: VocabEntry) {
  await serializeWrite(async () => {
    await set(card.id, card, cardStore()).catch(() => {});
  });
}

/** Eine einzelne Karte löschen. */
export async function removeCard(id: string) {
  await serializeWrite(async () => {
    await del(id, cardStore()).catch(() => {});
  });
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
    totalDaysLearned:
      raw.totalDaysLearned ?? (raw.lastReviewDate ? Math.max(1, raw.streak ?? 1) : 0),
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
