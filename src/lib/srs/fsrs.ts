import { fsrs, generatorParameters, Rating, State, type Card as FsrsCard } from "ts-fsrs";
import type { VocabEntry } from "../types";
import { BOX_INTERVALS_DAYS } from "../box-intervals";
import {
  DAY_MS,
  humanizeInterval,
  type FsrsState,
  type Grade,
  type GradePreview,
  type Scheduler,
  type SchedulerResult,
} from "./types";

// Wrapper um ts-fsrs (MIT, reine TS-Lib, läuft offline).
// https://github.com/open-spaced-repetition/ts-fsrs
// Wir speichern nur den schmalen FsrsState aus types.ts, nicht die volle
// ts-fsrs-Card — der Rest ist entweder ableitbar (last_review = lastReviewAt)
// oder für unsere Nutzung ohne Belang.

const params = generatorParameters({ request_retention: 0.9 });
const engine = fsrs(params);

/** Rating.Manual ist kein Antwort-Grade — repeat() liefert dafür kein Ergebnis. */
type AnswerRating = Exclude<Rating, Rating.Manual>;

const GRADE_TO_RATING: Record<Grade, AnswerRating> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy,
};

const STATE_TO_ID = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
} as const satisfies Record<State, FsrsState["state"]>;

const ID_TO_STATE: Record<FsrsState["state"], State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

/**
 * Startzustand aus der Leitner-Box ableiten — für die Migration und für
 * Karten, die noch nie über FSRS gelaufen sind.
 * Bewusst konservativ geschätzt: FSRS korrigiert sich nach wenigen Reviews
 * selbst, eine zu optimistische Stabilität würde dagegen echte Lücken reißen.
 */
export function boxToFsrsSeed(box: VocabEntry["box"], now: number, lastReviewAt?: number): FsrsState {
  const table: Record<VocabEntry["box"], { stability: number; difficulty: number }> = {
    1: { stability: 0.5, difficulty: 6 },
    2: { stability: 2, difficulty: 5.5 },
    3: { stability: 4, difficulty: 5 },
    4: { stability: 8, difficulty: 4.5 },
    5: { stability: 30, difficulty: 4 },
  };
  const { stability, difficulty } = table[box];
  const base = lastReviewAt ?? now;
  return {
    stability,
    difficulty,
    reps: 0,
    lapses: 0,
    // Box 1 heißt: noch nicht sicher abgerufen — als "learning" führen.
    state: box === 1 ? "learning" : "review",
    due: base + BOX_INTERVALS_DAYS[box] * DAY_MS,
  };
}

/** Vorhandenen FsrsState lesen oder aus der Box seeden. */
export function readFsrsState(card: VocabEntry, now: number): FsrsState {
  return card.fsrs ?? boxToFsrsSeed(card.box, now, card.lastReviewAt);
}

/** FsrsState → ts-fsrs-Card. `lastReviewAt` liefert elapsed_days. */
export function toFsrsCard(card: VocabEntry, now: number): FsrsCard {
  const s = readFsrsState(card, now);
  const lastReview = card.lastReviewAt ?? undefined;
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: lastReview ? (now - lastReview) / DAY_MS : 0,
    scheduled_days: 0,
    reps: s.reps,
    lapses: s.lapses,
    learning_steps: 0,
    state: ID_TO_STATE[s.state],
    last_review: lastReview ? new Date(lastReview) : undefined,
  };
}

/** ts-fsrs-Card → FsrsState. */
export function fromFsrsCard(c: FsrsCard): FsrsState {
  return {
    stability: c.stability,
    difficulty: c.difficulty,
    reps: c.reps,
    lapses: c.lapses,
    state: STATE_TO_ID[c.state],
    due: c.due.getTime(),
  };
}

function repeatAll(card: VocabEntry, now: number) {
  return engine.repeat(toFsrsCard(card, now), new Date(now));
}

export const fsrsScheduler: Scheduler = {
  id: "fsrs",

  next(card: VocabEntry, grade: Grade, now: number): SchedulerResult {
    const result = repeatAll(card, now)[GRADE_TO_RATING[grade]];
    const state = fromFsrsCard(result.card);
    // Der Leitner-Zustand wird hier nicht berechnet — applyReview() lässt
    // dafür immer auch den Leitner-Scheduler laufen (Entscheidung B).
    return {
      box: card.box,
      fsrs: state,
      leitnerDue: card.leitnerDue ?? card.nextReview,
      due: state.due,
    };
  },

  dueFromState(card: VocabEntry, now: number): number {
    return readFsrsState(card, now).due;
  },

  preview(card: VocabEntry, now: number): GradePreview {
    const all = repeatAll(card, now);
    return [1, 2, 3, 4].map((g) =>
      humanizeInterval(all[GRADE_TO_RATING[g as Grade]].card.due.getTime() - now),
    ) as GradePreview;
  },
};
