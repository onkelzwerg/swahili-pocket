import { describe, expect, it } from "vitest";
import { leitnerScheduler, leitnerTransition } from "../srs/leitner";
import { BOX_INTERVALS_DAYS } from "../box-intervals";
import { DAY_MS } from "../srs/types";
import type { Grade } from "../types";
import { makeCard } from "./helpers";

const BOXES = [1, 2, 3, 4, 5] as const;
const GRADES: Grade[] = [1, 2, 3, 4];

describe("leitnerTransition", () => {
  // Vollständige Übergangstabelle aus W1.1.
  const expected: Record<(typeof BOXES)[number], Record<Grade, { box: number; days: number }>> = {
    1: {
      1: { box: 1, days: 1 },
      2: { box: 1, days: 1 },
      3: { box: 2, days: 2 },
      4: { box: 3, days: 4 },
    },
    2: {
      1: { box: 1, days: 1 },
      2: { box: 2, days: 1 },
      3: { box: 3, days: 4 },
      4: { box: 4, days: 7 },
    },
    3: {
      1: { box: 1, days: 1 },
      2: { box: 3, days: 2 },
      3: { box: 4, days: 7 },
      4: { box: 5, days: 90 },
    },
    4: {
      1: { box: 1, days: 1 },
      2: { box: 4, days: 4 },
      3: { box: 5, days: 90 },
      4: { box: 5, days: 90 },
    },
    5: {
      1: { box: 3, days: 4 },
      2: { box: 5, days: 45 },
      3: { box: 5, days: 90 },
      4: { box: 5, days: 90 },
    },
  };

  for (const box of BOXES) {
    for (const grade of GRADES) {
      it(`Box ${box} + Grade ${grade}`, () => {
        expect(leitnerTransition(box, grade)).toEqual(expected[box][grade]);
      });
    }
  }

  it("hält das Intervall bei 'Schwer' immer bei mindestens einem Tag", () => {
    for (const box of BOXES) {
      expect(leitnerTransition(box, 2).days).toBeGreaterThanOrEqual(1);
    }
  });

  it("Box 5 kehrt nach 90 Tagen zurück statt zu verschwinden", () => {
    expect(BOX_INTERVALS_DAYS[5]).toBe(90);
  });
});

describe("leitnerScheduler", () => {
  const now = Date.parse("2026-03-01T10:00:00Z");

  it("setzt die Fälligkeit relativ zum Antwortzeitpunkt", () => {
    const result = leitnerScheduler.next(makeCard({ box: 3 }), 3, now);
    expect(result.box).toBe(4);
    expect(result.due).toBe(now + 7 * DAY_MS);
    expect(result.leitnerDue).toBe(result.due);
  });

  it("dueFromState nutzt leitnerDue, wenn vorhanden", () => {
    const card = makeCard({ box: 2, leitnerDue: 999, nextReview: 111 });
    expect(leitnerScheduler.dueFromState(card, now)).toBe(999);
  });

  it("dueFromState rekonstruiert aus lastReviewAt + Box-Intervall", () => {
    const lastReviewAt = Date.parse("2026-02-20T10:00:00Z");
    const card = makeCard({ box: 4, lastReviewAt });
    expect(leitnerScheduler.dueFromState(card, now)).toBe(lastReviewAt + 7 * DAY_MS);
  });

  it("liefert eine Vorschau für alle vier Buttons", () => {
    expect(leitnerScheduler.preview(makeCard({ box: 3 }), now)).toEqual([
      "1 T",
      "2 T",
      "7 T",
      "3 Mon",
    ]);
  });
});
