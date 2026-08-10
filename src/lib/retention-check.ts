import { get, set } from "idb-keyval";
import type { VocabEntry } from "./types";
import { shuffle } from "./utils";

// Langzeit-Check (W3.5).
//
// Eine normale Review-Session mit besonderer Auswahl: nur gefestigte Karten,
// die seit über zwei Monaten nicht dran waren. Die Antworten fließen **regulär**
// ins Scheduling — es sind echte Reviews, keine Simulation. Der Unterschied
// liegt allein in der Auswahl und darin, dass das Ergebnis festgehalten wird:
// „87 % nach durchschnittlich 74 Tagen" ist eine Aussage über das Gedächtnis,
// die eine gewöhnliche Runde nicht liefern kann.

const K_CHECKS = "retention:checks";

const DAY_MS = 86400000;

/** Ab dieser Pause gilt eine Karte als Langzeit-Kandidatin. */
export const RETENTION_MIN_DAYS = 60;
/** So viele Kandidatinnen müssen zusammenkommen, damit der Check etwas aussagt. */
export const RETENTION_MIN_CANDIDATES = 10;
/** Mindestabstand zwischen zwei Checks. */
export const RETENTION_COOLDOWN_DAYS = 30;
/** Umfang einer Check-Runde. */
export const RETENTION_SIZE = 15;

export interface RetentionCheckEntry {
  ts: number;
  correct: number;
  total: number;
}

/** Gefestigte Karten mit langer Pause, längste Pause zuerst. */
export function retentionCandidates(vocab: VocabEntry[], now = Date.now()): VocabEntry[] {
  return vocab
    .filter((card) => {
      if (!card.maturedAt || !card.lastReviewAt) return false;
      return now - card.lastReviewAt >= RETENTION_MIN_DAYS * DAY_MS;
    })
    .sort((a, b) => (a.lastReviewAt ?? 0) - (b.lastReviewAt ?? 0));
}

/**
 * Die Karten einer Check-Runde. Aus den ältesten zwei Dritteln der
 * Kandidatinnen gemischt gezogen: die längsten Pausen sind die interessanten,
 * aber immer dieselbe Reihenfolge wäre langweilig und verzerrt die Quote.
 */
export function pickRetentionCards(vocab: VocabEntry[], now = Date.now()): VocabEntry[] {
  const candidates = retentionCandidates(vocab, now);
  const pool = candidates.slice(0, Math.max(RETENTION_SIZE, Math.ceil(candidates.length * 0.67)));
  return shuffle(pool).slice(0, RETENTION_SIZE);
}

/** Mittlere Pause der geprüften Karten in Tagen (gerundet). */
export function averagePauseDays(cards: VocabEntry[], now = Date.now()): number {
  const withDate = cards.filter((c) => c.lastReviewAt);
  if (withDate.length === 0) return 0;
  const sum = withDate.reduce((n, c) => n + (now - (c.lastReviewAt ?? now)), 0);
  return Math.round(sum / withDate.length / DAY_MS);
}

/**
 * Steht ein Check an? Genug Kandidatinnen **und** genug Abstand zum letzten —
 * sonst wäre es eine Statistik über dieselben Karten alle paar Tage.
 */
export function isRetentionCheckAvailable(
  candidates: VocabEntry[],
  checks: RetentionCheckEntry[],
  now = Date.now(),
): boolean {
  if (candidates.length < RETENTION_MIN_CANDIDATES) return false;
  const last = checks.at(-1);
  if (!last) return true;
  return now - last.ts >= RETENTION_COOLDOWN_DAYS * DAY_MS;
}

let cache: RetentionCheckEntry[] | null = null;

export async function getRetentionChecks(): Promise<RetentionCheckEntry[]> {
  cache ??= (await get<RetentionCheckEntry[]>(K_CHECKS).catch(() => null)) ?? [];
  return cache;
}

export async function writeRetentionChecks(
  entries: RetentionCheckEntry[],
): Promise<RetentionCheckEntry[]> {
  cache = [...entries];
  await set(K_CHECKS, cache).catch(() => {});
  return cache;
}

/** Das Ergebnis einer Check-Runde festhalten. */
export async function recordRetentionCheck(
  result: Omit<RetentionCheckEntry, "ts">,
  now = Date.now(),
): Promise<RetentionCheckEntry[]> {
  const checks = await getRetentionChecks();
  return writeRetentionChecks([...checks, { ts: now, ...result }]);
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetRetentionCache() {
  cache = null;
}
