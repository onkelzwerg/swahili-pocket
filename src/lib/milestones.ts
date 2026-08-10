import { get, set } from "idb-keyval";
import type { ExerciseModeId, ReviewLogEntry, UserStats, VocabEntry } from "./types";
import { getVocab, getStats } from "./store";
import { readReviewLog } from "./review-log";
import { getSettings, type AppSettings } from "./settings";
import { getTrainerStats, type TrainerStats } from "./trainer-stats";
import { getStoriesRead, type StoriesRead } from "./stories";
import { getRetentionChecks, type RetentionCheckEntry } from "./retention-check";
import { getDialogueStats, type DialogueStats } from "./dialogue-stats";
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

/** Was gerade abgeschlossen wurde — nur für die Prüfung dieser einen Runde. */
export interface MilestoneEvent {
  session?: SessionSummary;
  /** Eine gerade fertig gelesene Geschichte (W3.3). */
  story?: { unaided: boolean };
  /** Ein gerade beendetes Dialog-Rollenspiel (W3.4). */
  dialogue?: { firstTry: number; total: number };
}

export interface MilestoneContext extends MilestoneEvent {
  vocab: VocabEntry[];
  stats: UserStats;
  log: ReviewLogEntry[];
  settings: AppSettings;
  trainer: TrainerStats;
  stories: StoriesRead;
  retention: RetentionCheckEntry[];
  dialogues: DialogueStats;
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
/** Ab dieser Trefferquote gilt ein Langzeit-Check als bestanden. */
const RETENTION_KEPT_RATIO = 0.8;

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
    check: ({ stories }) => Object.keys(stories).length >= 1,
  },
  {
    id: "story-unaided",
    emoji: "🔍",
    ...T.milestones.storyUnaided,
    // Sessionbezogen: ob die Übersetzung offen war, weiß nur der Reader —
    // aus dem Gelesen-Status ist das nicht zu rekonstruieren.
    check: ({ story }) => story?.unaided === true,
  },
  {
    id: "retention-kept",
    emoji: "🔬",
    ...T.milestones.retentionKept,
    check: ({ retention }) =>
      retention.some((c) => c.total > 0 && c.correct / c.total >= RETENTION_KEPT_RATIO),
  },
  {
    id: "dialogue-played",
    emoji: "🎭",
    ...T.milestones.dialoguePlayed,
    check: ({ dialogues }) =>
      Object.values(dialogues).some((run) => run.total > 0 && run.firstTry === run.total),
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
export async function checkMilestones(event: MilestoneEvent = {}): Promise<Milestone[]> {
  const [vocab, stats, log, settings, trainer, stories, retention, dialogues, achieved] =
    await Promise.all([
      getVocab(),
      getStats(),
      readReviewLog(),
      getSettings(),
      getTrainerStats(),
      getStoriesRead(),
      getRetentionChecks(),
      getDialogueStats(),
      getAchieved(),
    ]);

  const fresh = findNewMilestones(
    { vocab, stats, log, settings, trainer, stories, retention, dialogues, ...event },
    achieved,
  );
  if (fresh.length > 0) {
    const now = Date.now();
    await writeAchieved({ ...achieved, ...Object.fromEntries(fresh.map((m) => [m.id, now])) });
  }
  return fresh;
}
