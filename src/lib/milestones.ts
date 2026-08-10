import { get, set } from "idb-keyval";
import type { ExerciseModeId, ReviewLogEntry, UserStats, VocabEntry } from "./types";
import { getVocab, getStats } from "./store";
import { readReviewLog } from "./review-log";
import { getSettings, type AppSettings } from "./settings";
import { getTrainerStats, type TrainerStats } from "./trainer-stats";
import { NGELI_TRAINABLE_CLASSES } from "./morphology";
import { T } from "@/config/translations";

// Meilensteine (W2.8).
//
// Bewusst an Kompetenz geknüpft, nicht an Aktivität (SDT: informierendes
// statt kontrollierendes Feedback). "350 Wörter gefestigt" ist eine Aussage
// über Können; "30 Tage am Stück eingeloggt" wäre eine über Gehorsam.
//
// Die Liste ist deklarativ: ein neuer Meilenstein ist ein Objekt, keine
// Codeänderung an der Prüf-Mechanik.

const K_ACHIEVED = "milestones:achieved";

/** Zusammenfassung der gerade beendeten Runde (für sessionbezogene Prüfungen). */
export interface SessionSummary {
  total: number;
  correct: number;
  matured: number;
  /** Antworten je Modus in dieser Runde. */
  modes: Partial<Record<ExerciseModeId, { total: number; correct: number }>>;
}

export interface MilestoneContext {
  vocab: VocabEntry[];
  stats: UserStats;
  log: ReviewLogEntry[];
  settings: AppSettings;
  trainer: TrainerStats;
  session?: SessionSummary;
}

export interface Milestone {
  id: string;
  emoji: string;
  title: string;
  description: string;
  check(ctx: MilestoneContext): boolean;
}

/** Gefestigte Wörter — dieselbe Definition wie beim Level (W1.5). */
function maturedCount(vocab: VocabEntry[]): number {
  return vocab.filter((v) => v.maturedAt).length;
}

/** Ab dieser Pause zählt ein erfolgreicher Abruf als Langzeit-Abruf. */
const LONG_RECALL_DAYS = 80;
/** So viele richtige Ngeli-Aufgaben pro Klasse für den Ngeli-Meilenstein. */
export const NGELI_MASTERY_PER_CLASS = 10;
/** Mindestumfang einer getippten Runde, damit "fehlerfrei" etwas heißt. */
const TYPED_PERFECT_MIN = 5;

export const MILESTONES: Milestone[] = [
  {
    id: "first-session",
    emoji: "🌱",
    ...T.milestones.firstSession,
    check: ({ stats }) => stats.totalReviewed >= 1,
  },
  {
    id: "seven-days",
    emoji: "📅",
    ...T.milestones.sevenDays,
    check: ({ stats }) => stats.totalDaysLearned >= 7,
  },
  {
    id: "first-week-goal",
    emoji: "🎯",
    ...T.milestones.firstWeekGoal,
    check: ({ stats, settings }) => stats.weekDays.length >= settings.weeklyGoalDays,
  },
  {
    id: "matured-50",
    emoji: "🪴",
    ...T.milestones.matured50,
    check: ({ vocab }) => maturedCount(vocab) >= 50,
  },
  {
    id: "matured-150",
    emoji: "🌳",
    ...T.milestones.matured150,
    check: ({ vocab }) => maturedCount(vocab) >= 150,
  },
  {
    id: "matured-350",
    emoji: "🌴",
    ...T.milestones.matured350,
    check: ({ vocab }) => maturedCount(vocab) >= 350,
  },
  {
    id: "typed-perfect",
    emoji: "⌨️",
    ...T.milestones.typedPerfect,
    check: ({ session }) => {
      const typed = session?.modes.typed;
      return !!typed && typed.total >= TYPED_PERFECT_MIN && typed.correct === typed.total;
    },
  },
  {
    id: "audio-session",
    emoji: "👂",
    ...T.milestones.audioSession,
    check: ({ log }) => log.filter((e) => e.mode === "audio" && e.grade >= 3).length >= 25,
  },
  {
    id: "verb-100",
    emoji: "🔧",
    ...T.milestones.verb100,
    check: ({ trainer }) => trainer.verbTasks >= 100,
  },
  {
    id: "ngeli-master",
    emoji: "🧩",
    ...T.milestones.ngeliMaster,
    check: ({ trainer }) =>
      NGELI_TRAINABLE_CLASSES.every(
        (c) => (trainer.ngeliCorrectByClass[c] ?? 0) >= NGELI_MASTERY_PER_CLASS,
      ),
  },
  {
    id: "long-recall",
    emoji: "🧠",
    ...T.milestones.longRecall,
    check: ({ log }) =>
      log.some((e) => e.grade >= 3 && e.elapsedDays >= LONG_RECALL_DAYS && e.newBox >= 5),
  },
  {
    id: "first-story",
    emoji: "📖",
    ...T.milestones.firstStory,
    // Geschichten kommen erst in Welle 3 — bis dahin bleibt der Meilenstein
    // sichtbar gesperrt, statt ihn später nachträglich einzuführen.
    check: () => false,
  },
];

export type AchievedMap = Record<string, number>;

let cache: AchievedMap | null = null;

export async function getAchieved(): Promise<AchievedMap> {
  if (cache) return cache;
  cache = (await get<AchievedMap>(K_ACHIEVED).catch(() => null)) ?? {};
  return cache;
}

export async function writeAchieved(map: AchievedMap): Promise<AchievedMap> {
  cache = { ...map };
  await set(K_ACHIEVED, cache).catch(() => {});
  return cache;
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetMilestoneCache() {
  cache = null;
}

/** Reine Prüfung — welche Meilensteine sind neu erreicht? */
export function findNewMilestones(ctx: MilestoneContext, achieved: AchievedMap): Milestone[] {
  return MILESTONES.filter((m) => !achieved[m.id] && m.check(ctx));
}

/**
 * Nach dem Ende einer Runde aufrufen, **nie** mitten in einer Session —
 * ein Meilenstein-Moment darf den Lernfluss nicht unterbrechen.
 * Gibt die neu erreichten Meilensteine zurück (der Screen zeigt einen davon).
 */
export async function checkMilestones(session?: SessionSummary): Promise<Milestone[]> {
  const [vocab, stats, log, settings, trainer, achieved] = await Promise.all([
    getVocab(),
    getStats(),
    readReviewLog(),
    getSettings(),
    getTrainerStats(),
    getAchieved(),
  ]);

  const fresh = findNewMilestones({ vocab, stats, log, settings, trainer, session }, achieved);
  if (fresh.length > 0) {
    const now = Date.now();
    await writeAchieved({ ...achieved, ...Object.fromEntries(fresh.map((m) => [m.id, now])) });
  }
  return fresh;
}
