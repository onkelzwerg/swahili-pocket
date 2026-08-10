import type { FsrsState, Grade, SchedulerId, VocabEntry } from "../types";

export type { Grade, FsrsState, SchedulerId };

/** Ergebnis einer Scheduler-Berechnung. Beide Zustände werden immer gepflegt. */
export interface SchedulerResult {
  box: VocabEntry["box"];
  fsrs: FsrsState;
  leitnerDue: number;
  /** Fälligkeit des jeweils berechnenden Schedulers. */
  due: number;
}

/** Intervall-Vorschau für die vier Antwort-Buttons, z. B. ["<10 Min", "12 Std", "3 T", "8 T"]. */
export type GradePreview = [string, string, string, string];

export interface Scheduler {
  id: SchedulerId;
  /** Reine Funktion: alter Zustand + Grade + Zeitpunkt → neuer Zustand. */
  next(card: VocabEntry, grade: Grade, now: number): SchedulerResult;
  /** Fälligkeit aus vorhandenem Zustand ableiten (für Scheduler-Wechsel). */
  dueFromState(card: VocabEntry, now: number): number;
  /** Intervall-Vorschau für die vier Buttons. */
  preview(card: VocabEntry, now: number): GradePreview;
}

export const DAY_MS = 86_400_000;

/**
 * Intervall (ms) menschenlesbar machen — bewusst kurz, weil es unter
 * den Buttons steht: "<1 Min" · "10 Min" · "3 Std" · "4 T" · "2 Mon".
 */
export function humanizeInterval(ms: number): string {
  const minutes = ms / 60_000;
  if (minutes < 1) return "<1 Min";
  if (minutes < 60) return `${Math.round(minutes)} Min`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} Std`;
  const days = hours / 24;
  if (days < 30.5) return `${Math.round(days)} T`;
  const months = days / 30.44;
  if (months < 12) return `${Math.round(months)} Mon`;
  return `${(days / 365.25).toFixed(1).replace(".", ",")} J`;
}
