import { clear, delMany, set, setMany, values } from "idb-keyval";
import type { ExerciseModeId, ReviewLogEntry, SchedulerId, TrainerModeId } from "./types";
import { isoDay } from "./dates";
import { serializeWrite } from "./offline";
import { logArchiveStore, logKey, logStore } from "./db";

// Append-only Log aller Antworten (Entscheidung A).
// Grundlage für Retention-Statistiken, Meilensteine, Tagesziel-Fortschritt
// und später die FSRS-Parameter-Optimierung. Wird nie überschrieben,
// nur ergänzt — deshalb überlebt es auch einen Scheduler-Wechsel.

/** Bis Datenversion 2 lag das Log als ein Array unter diesen Schlüsseln. */
export const K_LOG_LEGACY = "log:reviews";
export const K_ARCHIVE_LEGACY = "log:reviews:archive";

/** Ab dieser Größe wandern die ältesten Einträge ins Archiv. */
export const MAX_ENTRIES = 20_000;
export const ARCHIVE_CHUNK = 5_000;

let cache: ReviewLogEntry[] | null = null;

/**
 * Das ganze Log, chronologisch. Ein Bulk-Read beim ersten Zugriff, danach
 * bedient der Cache — Meilensteine und Tagesziel fragen es mehrfach je Runde.
 * Die Schlüsselform `[ts, id]` sorgt dafür, dass IndexedDB bereits sortiert
 * liefert (siehe db.ts); hier wird nichts nachsortiert.
 */
export async function readReviewLog(): Promise<ReviewLogEntry[]> {
  if (cache) return cache;
  cache = (await values<ReviewLogEntry>(logStore()).catch(() => null)) ?? [];
  return cache;
}

/**
 * Einen Eintrag anhängen. Der Ringpuffer ist bewusst hier gekapselt,
 * damit die Speicherstrategie später austauschbar bleibt.
 */
export async function appendReviewLog(entry: ReviewLogEntry): Promise<void> {
  // Serialisiert wie die Kartenschreibvorgänge: der Umzug ins Archiv ist
  // selbst ein Lesen-Ändern-Schreiben und dürfte sich nicht überlappen.
  await serializeWrite(async () => {
    const log = await readReviewLog();
    log.push(entry);
    // Ein Eintrag, ein Schreibvorgang — nicht mehr das gesamte Log.
    await set(logKey(entry), entry, logStore()).catch(() => {});
    if (log.length > MAX_ENTRIES) {
      const moved = log.splice(0, ARCHIVE_CHUNK);
      await setMany(
        moved.map((e) => [logKey(e), e] as [[number, string], ReviewLogEntry]),
        logArchiveStore(),
      ).catch(() => {});
      await delMany(
        moved.map((e) => logKey(e)),
        logStore(),
      ).catch(() => {});
    }
    cache = log;
  });
}

/** Nur für Backup-Import: kompletten Log ersetzen. */
export async function writeReviewLog(entries: ReviewLogEntry[]): Promise<void> {
  const store = logStore();
  cache = [...entries].sort((a, b) => a.ts - b.ts);
  await clear(store).catch(() => {});
  await setMany(
    cache.map((e) => [logKey(e), e] as [[number, string], ReviewLogEntry]),
    store,
  ).catch(() => {});
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
