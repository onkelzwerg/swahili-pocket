import { get, set } from "idb-keyval";
import type { ExerciseModeId, ReviewLogEntry, SchedulerId, TrainerModeId } from "./types";
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

/** Modi, die als geübte Karte zählen — Trainer-Aufgaben sind keine Karten. */
const CARD_MODES: ExerciseModeId[] = ["flip", "typed", "audio", "cloze"];

/**
 * Anzahl der geübten Karten an einem Tag (Default: heute) — Basis für das
 * Tagesziel. Trainer-Aufgaben stehen zwar im selben Log (damit Meilensteine
 * sie sehen), zählen hier aber bewusst nicht mit: sonst wäre „7 / 10 Karten
 * heute" nach ein paar Verbformen erreicht, ohne dass eine Karte dran war.
 */
export function countReviewsOnDay(log: ReviewLogEntry[], day = isoDay(Date.now())): number {
  return log.reduce((n, e) => (isoDay(e.ts) === day && CARD_MODES.includes(e.mode) ? n + 1 : n), 0);
}

/**
 * Eine Trainer-Aufgabe im Log vermerken. Kein Scheduling: der Trainer ändert
 * weder Box noch Fälligkeit — die Felder spiegeln nur den unveränderten
 * Zustand der Quellkarte.
 */
export async function appendTrainerResult(opts: {
  /** Karte, aus der die Aufgabe erzeugt wurde. */
  cardId: string;
  mode: TrainerModeId;
  correct: boolean;
  scheduler: SchedulerId;
  box: number;
  nextReview: number;
  now?: number;
}): Promise<void> {
  const now = opts.now ?? Date.now();
  await appendReviewLog({
    id: crypto.randomUUID(),
    cardId: opts.cardId,
    ts: now,
    grade: opts.correct ? 3 : 1,
    mode: opts.mode,
    elapsedDays: 0,
    scheduler: opts.scheduler,
    newBox: opts.box,
    newDue: opts.nextReview,
  });
}
