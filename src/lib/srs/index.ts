import type { ExerciseModeId, ReviewLogEntry, UserStats, VocabEntry } from "../types";
import { getSettings } from "../settings";
import { appendReviewLog } from "../review-log";
import { updateVocab, recordReview, getVocab, newId } from "../store";
import { cacheVocab, serializeWrite } from "../offline";
import { leitnerScheduler } from "./leitner";
import { fsrsScheduler, readFsrsState } from "./fsrs";
import { DAY_MS, type Grade, type GradePreview, type Scheduler, type SchedulerId } from "./types";

export { leitnerScheduler, leitnerTransition } from "./leitner";
export { fsrsScheduler, boxToFsrsSeed, readFsrsState } from "./fsrs";
export * from "./types";

/** Ab dieser Abstandsdauer gilt ein erfolgreicher Abruf als "gefestigt". */
export const MATURE_AFTER_DAYS = 7;

const SCHEDULERS: Record<SchedulerId, Scheduler> = {
  leitner: leitnerScheduler,
  fsrs: fsrsScheduler,
};

export function getScheduler(id: SchedulerId): Scheduler {
  return SCHEDULERS[id];
}

export async function getActiveScheduler(): Promise<Scheduler> {
  const { scheduler } = await getSettings();
  return SCHEDULERS[scheduler];
}

/** Vorschau der vier Intervalle für den aktiven Scheduler. */
export async function previewGrades(card: VocabEntry, now = Date.now()): Promise<GradePreview> {
  const scheduler = await getActiveScheduler();
  return scheduler.preview(card, now);
}

export interface ApplyReviewResult {
  card: VocabEntry;
  stats: UserStats;
  /** true, wenn diese Antwort die Karte erstmals als "gefestigt" markiert hat. */
  matured: boolean;
}

/**
 * Die einzige Stelle, die ein Review anwendet.
 *
 * Beide Scheduler-Zustände werden bei jedem Review gepflegt (Entscheidung B) —
 * dadurch ist ein Wechsel der Lernmethode jederzeit verlustfrei möglich.
 * `nextReview` spiegelt immer die Fälligkeit des AKTIVEN Schedulers.
 */
export async function applyReview(
  card: VocabEntry,
  grade: Grade,
  mode: ExerciseModeId = "flip",
  now = Date.now(),
  meta: { override?: boolean } = {},
): Promise<ApplyReviewResult> {
  const settings = await getSettings();
  const leitner = leitnerScheduler.next(card, grade, now);
  const fsrs = fsrsScheduler.next(card, grade, now);
  const active = settings.scheduler === "fsrs" ? fsrs : leitner;

  const patch: Partial<VocabEntry> = {
    box: leitner.box,
    leitnerDue: leitner.due,
    fsrs: fsrs.fsrs,
    nextReview: active.due,
    lastReviewAt: now,
  };

  // "Gefestigt": erfolgreicher Abruf nach mindestens einer Woche Abstand.
  // Das ist der Kern von Level und Meilensteinen — deshalb nur einmal setzen.
  const elapsedDays = card.lastReviewAt ? (now - card.lastReviewAt) / DAY_MS : 0;
  const matured = !card.maturedAt && grade >= 3 && elapsedDays >= MATURE_AFTER_DAYS;
  if (matured) patch.maturedAt = now;

  await updateVocab(card.id, patch);

  const entry: ReviewLogEntry = {
    id: newId(),
    cardId: card.id,
    ts: now,
    grade,
    mode,
    elapsedDays,
    scheduler: settings.scheduler,
    newBox: leitner.box,
    newStability: fsrs.fsrs.stability,
    newDue: active.due,
    ...(meta.override ? { override: true } : {}),
  };
  await appendReviewLog(entry);

  const stats = await recordReview(grade >= 3, now);
  return { card: { ...card, ...patch }, stats, matured };
}

/**
 * Fälligkeiten aller Karten auf den Ziel-Scheduler umstellen.
 * Verlustfrei: `box`/`leitnerDue`/`fsrs` bleiben unangetastet, nur
 * `nextReview` wird neu gesetzt (Invariante aus §2.1 des Plans).
 * Ein einziger Schreibvorgang für den kompletten Bestand.
 */
export async function recomputeDue(
  target: SchedulerId,
  now = Date.now(),
): Promise<{ dueCount: number }> {
  const scheduler = SCHEDULERS[target];
  const vocab = await getVocab();
  return serializeWrite(async () => recompute(scheduler, vocab, now));
}

async function recompute(
  scheduler: Scheduler,
  vocab: VocabEntry[],
  now: number,
): Promise<{ dueCount: number }> {
  const next = vocab.map((card) => {
    // Fehlende Teilzustände werden beim Wechsel einmalig festgeschrieben,
    // statt sie bei jedem Aufruf neu zu schätzen — sonst wandert die
    // Fälligkeit bei jedem Hin- und Herschalten.
    const fsrs = card.fsrs ?? readFsrsState(card, now);
    const leitnerDue = card.leitnerDue ?? leitnerScheduler.dueFromState(card, now);
    const filled = { ...card, fsrs, leitnerDue };
    return { ...filled, nextReview: scheduler.dueFromState(filled, now) };
  });
  await cacheVocab(next);
  return { dueCount: next.filter((c) => c.nextReview <= now).length };
}
