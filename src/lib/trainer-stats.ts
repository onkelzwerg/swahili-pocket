import { get, set } from "idb-keyval";
import type { NounClass } from "./types";

// Fortschritt im Morphologie-Trainer (W2.7). Bewusst eine eigene, simple
// Zählung neben dem Review-Log: der Trainer erzeugt Aufgaben, keine Karten —
// er hat keinen Scheduler-Zustand, den man mitschleifen müsste.

const K_TRAINER = "stats:trainer";

export interface TrainerStats {
  /** Gelöste Verbaufgaben (richtig wie falsch). */
  verbTasks: number;
  /** Gelöste Ngeli-Aufgaben. */
  ngeliTasks: number;
  /** Gelöste Satzaufgaben. */
  sentenceTasks: number;
  /** Längste Serie richtiger Antworten am Stück, über alle Sitzungen. */
  bestStreakRun: number;
  /** Richtige Ngeli-Aufgaben je Nomenklasse — Basis für den Meilenstein. */
  ngeliCorrectByClass: Partial<Record<NounClass, number>>;
}

export const EMPTY_TRAINER_STATS: TrainerStats = {
  verbTasks: 0,
  ngeliTasks: 0,
  sentenceTasks: 0,
  bestStreakRun: 0,
  ngeliCorrectByClass: {},
};

let cache: TrainerStats | null = null;

export function normalizeTrainerStats(raw: Partial<TrainerStats> | null | undefined): TrainerStats {
  if (!raw) return { ...EMPTY_TRAINER_STATS, ngeliCorrectByClass: {} };
  return {
    verbTasks: raw.verbTasks ?? 0,
    ngeliTasks: raw.ngeliTasks ?? 0,
    // Fehlt bei Beständen von vor dem Satztrainer — kein Grund zu migrieren,
    // ein fehlender Zähler ist schlicht null.
    sentenceTasks: raw.sentenceTasks ?? 0,
    bestStreakRun: raw.bestStreakRun ?? 0,
    ngeliCorrectByClass: { ...(raw.ngeliCorrectByClass ?? {}) },
  };
}

export async function getTrainerStats(): Promise<TrainerStats> {
  if (cache) return cache;
  cache = normalizeTrainerStats(await get<Partial<TrainerStats>>(K_TRAINER).catch(() => null));
  return cache;
}

export async function writeTrainerStats(stats: TrainerStats): Promise<TrainerStats> {
  cache = normalizeTrainerStats(stats);
  await set(K_TRAINER, cache).catch(() => {});
  return cache;
}

export interface TrainerResult {
  kind: "verb" | "ngeli" | "sentence";
  correct: boolean;
  /** Bei Ngeli- und Satzaufgaben: die geübte Nomenklasse. */
  nounClass?: NounClass;
  /** Aktuelle Serie richtiger Antworten in dieser Sitzung. */
  runLength: number;
}

/** Eine gelöste Trainer-Aufgabe verbuchen. */
export async function recordTrainerTask(result: TrainerResult): Promise<TrainerStats> {
  const prev = await getTrainerStats();
  const next: TrainerStats = {
    verbTasks: prev.verbTasks + (result.kind === "verb" ? 1 : 0),
    ngeliTasks: prev.ngeliTasks + (result.kind === "ngeli" ? 1 : 0),
    sentenceTasks: prev.sentenceTasks + (result.kind === "sentence" ? 1 : 0),
    bestStreakRun: Math.max(prev.bestStreakRun, result.runLength),
    ngeliCorrectByClass: { ...prev.ngeliCorrectByClass },
  };
  // Satzaufgaben zählen auf denselben Meilenstein ein: Wer die Klasse durch
  // Nomen, Adjektiv und Verb durchhält, beherrscht sie mindestens so gut wie
  // in einer einzelnen Ngeli-Lücke. Sie ließe sich sonst nur über die
  // schwächere Übung erreichen.
  if (result.kind !== "verb" && result.correct && result.nounClass) {
    next.ngeliCorrectByClass[result.nounClass] =
      (next.ngeliCorrectByClass[result.nounClass] ?? 0) + 1;
  }
  return writeTrainerStats(next);
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetTrainerStatsCache() {
  cache = null;
}
