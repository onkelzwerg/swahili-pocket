import { get, set } from "idb-keyval";
import type { ReviewLogEntry } from "./types";
import { isoDay } from "./dates";

// Append-only Log aller Antworten (Entscheidung A).
// Grundlage für Retention-Statistiken, Meilensteine, Tagesziel-Fortschritt
// und später die FSRS-Parameter-Optimierung. Wird nie überschrieben,
// nur ergänzt — deshalb überlebt es auch einen Scheduler-Wechsel.

const K_LOG = "log:reviews";
const K_ARCHIVE = "log:reviews:archive";

/** Ab dieser Größe wandern die ältesten Einträge ins Archiv. */
const MAX_ENTRIES = 20_000;
const ARCHIVE_CHUNK = 5_000;

let cache: ReviewLogEntry[] | null = null;

export async function readReviewLog(): Promise<ReviewLogEntry[]> {
  if (cache) return cache;
  cache = (await get<ReviewLogEntry[]>(K_LOG).catch(() => null)) ?? [];
  return cache;
}

/**
 * Einen Eintrag anhängen. Der Ringpuffer ist bewusst hier gekapselt,
 * damit die Speicherstrategie später austauschbar bleibt.
 */
export async function appendReviewLog(entry: ReviewLogEntry): Promise<void> {
  const log = await readReviewLog();
  log.push(entry);
  if (log.length > MAX_ENTRIES) {
    const moved = log.splice(0, ARCHIVE_CHUNK);
    const archive = (await get<ReviewLogEntry[]>(K_ARCHIVE).catch(() => null)) ?? [];
    await set(K_ARCHIVE, [...archive, ...moved]).catch(() => {});
  }
  cache = log;
  await set(K_LOG, log).catch(() => {});
}

/** Nur für Backup-Import: kompletten Log ersetzen. */
export async function writeReviewLog(entries: ReviewLogEntry[]): Promise<void> {
  cache = entries;
  await set(K_LOG, entries).catch(() => {});
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetReviewLogCache() {
  cache = null;
}

/** Anzahl der Reviews an einem Tag (Default: heute) — Basis für das Tagesziel. */
export function countReviewsOnDay(log: ReviewLogEntry[], day = isoDay(Date.now())): number {
  return log.reduce((n, e) => (isoDay(e.ts) === day ? n + 1 : n), 0);
}
