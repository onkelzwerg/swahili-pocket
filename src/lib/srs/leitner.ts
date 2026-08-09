import type { VocabEntry } from "../types";
import { BOX_INTERVALS_DAYS } from "../box-intervals";
import {
  DAY_MS,
  humanizeInterval,
  type Grade,
  type GradePreview,
  type Scheduler,
  type SchedulerResult,
} from "./types";
import { readFsrsState } from "./fsrs";

// Klassisches Leitner-System, erweitert auf vier Antwortstufen.
//
// | Grade      | Box < 5                                  | Box = 5              |
// |------------|------------------------------------------|----------------------|
// | 1 Nochmal  | → Box 1, Intervall der Box 1 (1 T)       | → Box 3, 4 T         |
// | 2 Schwer   | Box bleibt, ceil(Intervall/2), min. 1 T  | bleibt 5, 45 T       |
// | 3 Gut      | Box +1                                   | bleibt 5, 90 T       |
// | 4 Einfach  | Box +2 (max 5)                           | bleibt 5, 90 T       |
//
// "Schwer" setzt bewusst nicht zurück (Bjork: desirable difficulties) —
// es verkürzt nur den Abstand.

/** Rückfall-Box, wenn eine Box-5-Karte nach 90 Tagen vergessen wurde. */
const BOX5_LAPSE_BOX = 3 satisfies VocabEntry["box"];
/** Verkürzter Abstand, wenn eine Box-5-Karte "schwer" war. */
const BOX5_HARD_DAYS = 45;

function clampBox(n: number): VocabEntry["box"] {
  return Math.min(5, Math.max(1, n)) as VocabEntry["box"];
}

/** Neue Box + Intervall (Tage) für einen Grade. Reine Funktion, ohne Zeitbezug. */
export function leitnerTransition(
  box: VocabEntry["box"],
  grade: Grade,
): { box: VocabEntry["box"]; days: number } {
  if (box === 5) {
    switch (grade) {
      case 1:
        return { box: BOX5_LAPSE_BOX, days: BOX_INTERVALS_DAYS[BOX5_LAPSE_BOX] };
      case 2:
        return { box: 5, days: BOX5_HARD_DAYS };
      default:
        return { box: 5, days: BOX_INTERVALS_DAYS[5] };
    }
  }
  switch (grade) {
    case 1:
      return { box: 1, days: BOX_INTERVALS_DAYS[1] };
    case 2:
      return { box, days: Math.max(1, Math.ceil(BOX_INTERVALS_DAYS[box] / 2)) };
    case 3: {
      const next = clampBox(box + 1);
      return { box: next, days: BOX_INTERVALS_DAYS[next] };
    }
    default: {
      const next = clampBox(box + 2);
      return { box: next, days: BOX_INTERVALS_DAYS[next] };
    }
  }
}

export const leitnerScheduler: Scheduler = {
  id: "leitner",

  next(card: VocabEntry, grade: Grade, now: number): SchedulerResult {
    const { box, days } = leitnerTransition(card.box, grade);
    const due = now + days * DAY_MS;
    // Der FSRS-Zustand wird hier nicht fortgeschrieben — applyReview() lässt
    // dafür immer auch den FSRS-Scheduler laufen (Entscheidung B).
    return { box, fsrs: readFsrsState(card, now), leitnerDue: due, due };
  },

  dueFromState(card: VocabEntry, now: number): number {
    if (typeof card.leitnerDue === "number") return card.leitnerDue;
    // Kein Leitner-Datum vorhanden (z. B. v1-Backup ohne Migration):
    // aus letztem Review + Box-Intervall rekonstruieren.
    const base = card.lastReviewAt ?? card.updatedAt ?? card.createdAt ?? now;
    return base + BOX_INTERVALS_DAYS[card.box] * DAY_MS;
  },

  preview(card: VocabEntry, _now: number): GradePreview {
    return [1, 2, 3, 4].map((g) =>
      humanizeInterval(leitnerTransition(card.box, g as Grade).days * DAY_MS),
    ) as GradePreview;
  },
};
