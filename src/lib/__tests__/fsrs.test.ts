import { describe, expect, it } from "vitest";
import { boxToFsrsSeed, fromFsrsCard, fsrsScheduler, toFsrsCard, readFsrsState } from "../srs/fsrs";
import { BOX_INTERVALS_DAYS } from "../box-intervals";
import { DAY_MS } from "../srs/types";
import type { VocabEntry } from "../types";
import { makeCard } from "./helpers";

const NOW = Date.parse("2026-03-01T10:00:00Z");
const BOXES = [1, 2, 3, 4, 5] as const;

describe("boxToFsrsSeed", () => {
  const table: Record<VocabEntry["box"], { stability: number; difficulty: number }> = {
    1: { stability: 0.5, difficulty: 6 },
    2: { stability: 2, difficulty: 5.5 },
    3: { stability: 4, difficulty: 5 },
    4: { stability: 8, difficulty: 4.5 },
    5: { stability: 30, difficulty: 4 },
  };

  for (const box of BOXES) {
    it(`Box ${box} → konservativer Startzustand`, () => {
      const seed = boxToFsrsSeed(box, NOW);
      expect(seed.stability).toBe(table[box].stability);
      expect(seed.difficulty).toBe(table[box].difficulty);
      expect(seed.reps).toBe(0);
      expect(seed.lapses).toBe(0);
      expect(seed.due).toBe(NOW + BOX_INTERVALS_DAYS[box] * DAY_MS);
    });
  }

  it("führt Box 1 als 'learning', alles darüber als 'review'", () => {
    expect(boxToFsrsSeed(1, NOW).state).toBe("learning");
    for (const box of [2, 3, 4, 5] as const) {
      expect(boxToFsrsSeed(box, NOW).state).toBe("review");
    }
  });

  it("rechnet die Fälligkeit ab dem letzten Review", () => {
    const last = NOW - 3 * DAY_MS;
    expect(boxToFsrsSeed(3, NOW, last).due).toBe(last + 4 * DAY_MS);
  });
});

describe("Mapping FsrsState ↔ ts-fsrs-Card", () => {
  it("überlebt einen Roundtrip verlustfrei", () => {
    const state = {
      stability: 12.5,
      difficulty: 5.25,
      reps: 7,
      lapses: 2,
      state: "review" as const,
      due: NOW + 5 * DAY_MS,
    };
    const card = makeCard({ box: 3, fsrs: state, lastReviewAt: NOW - DAY_MS });
    expect(fromFsrsCard(toFsrsCard(card, NOW))).toEqual(state);
  });

  it("leitet elapsed_days aus lastReviewAt ab", () => {
    const card = makeCard({ box: 3, lastReviewAt: NOW - 10 * DAY_MS });
    expect(toFsrsCard(card, NOW).elapsed_days).toBe(10);
  });

  it("seedet Karten ohne FSRS-Zustand aus der Box", () => {
    const card = makeCard({ box: 4 });
    expect(readFsrsState(card, NOW).stability).toBe(8);
  });
});

describe("fsrsScheduler", () => {
  const card = makeCard({
    box: 3,
    fsrs: {
      stability: 4,
      difficulty: 5,
      reps: 3,
      lapses: 0,
      state: "review",
      due: NOW - 6 * DAY_MS,
    },
    lastReviewAt: NOW - 10 * DAY_MS,
  });

  it("erhöht lapses bei 'Nochmal'", () => {
    expect(fsrsScheduler.next(card, 1, NOW).fsrs.lapses).toBe(1);
    expect(fsrsScheduler.next(card, 3, NOW).fsrs.lapses).toBe(0);
  });

  it("vergibt mit steigendem Grade längere Intervalle", () => {
    const dues = ([1, 2, 3, 4] as const).map((g) => fsrsScheduler.next(card, g, NOW).due);
    expect(dues[0]).toBeLessThan(dues[1]);
    expect(dues[1]).toBeLessThan(dues[2]);
    expect(dues[2]).toBeLessThan(dues[3]);
  });

  it("setzt due = FSRS-Fälligkeit und lässt box unverändert", () => {
    const result = fsrsScheduler.next(card, 3, NOW);
    expect(result.box).toBe(3);
    expect(result.due).toBe(result.fsrs.due);
  });

  it("preview passt zu den tatsächlich gesetzten Fälligkeiten", () => {
    const preview = fsrsScheduler.preview(card, NOW);
    expect(preview).toHaveLength(4);
    // "Nochmal" bleibt im Minutenbereich, "Einfach" liegt Wochen entfernt.
    expect(preview[0]).toMatch(/Min$/);
    expect(preview[3]).toMatch(/(T|Mon)$/);
  });

  it("dueFromState liefert die gespeicherte FSRS-Fälligkeit", () => {
    expect(fsrsScheduler.dueFromState(card, NOW)).toBe(NOW - 6 * DAY_MS);
  });
});
