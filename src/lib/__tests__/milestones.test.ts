import { describe, expect, it } from "vitest";
import { MILESTONES, findNewMilestones, NGELI_MASTERY_PER_CLASS } from "../milestones";
import type { MilestoneContext } from "../milestones";
import { NGELI_TRAINABLE_CLASSES } from "../morphology";
import { EMPTY_TRAINER_STATS } from "../trainer-stats";
import { EMPTY_STATS } from "../offline";
import { DEFAULT_SETTINGS } from "../settings";
import { makeCard } from "./helpers";
import type { ReviewLogEntry } from "../types";

const NOW = Date.parse("2026-06-01T10:00:00Z");

function ctx(patch: Partial<MilestoneContext> = {}): MilestoneContext {
  return {
    vocab: [],
    stats: { ...EMPTY_STATS },
    log: [],
    settings: { ...DEFAULT_SETTINGS },
    trainer: { ...EMPTY_TRAINER_STATS, ngeliCorrectByClass: {} },
    ...patch,
  };
}

function logEntry(patch: Partial<ReviewLogEntry> = {}): ReviewLogEntry {
  return {
    id: "l1",
    cardId: "c1",
    ts: NOW,
    grade: 3,
    mode: "flip",
    elapsedDays: 1,
    scheduler: "fsrs",
    newBox: 3,
    newDue: NOW,
    ...patch,
  };
}

function ids(list: { id: string }[]): string[] {
  return list.map((m) => m.id);
}

describe("MILESTONES", () => {
  it("hat eindeutige Ids", () => {
    expect(new Set(ids(MILESTONES)).size).toBe(MILESTONES.length);
  });

  it("meldet für einen leeren Stand nichts", () => {
    expect(findNewMilestones(ctx(), {})).toEqual([]);
  });

  it("meldet bereits Erreichtes nicht erneut", () => {
    const c = ctx({ stats: { ...EMPTY_STATS, totalReviewed: 5 } });
    expect(ids(findNewMilestones(c, {}))).toContain("first-session");
    expect(ids(findNewMilestones(c, { "first-session": NOW }))).not.toContain("first-session");
  });
});

describe("Kompetenz-Meilensteine", () => {
  it("zählt gefestigte Wörter, nicht Karten", () => {
    const vocab = Array.from({ length: 60 }, (_, i) =>
      makeCard({ id: `c${i}`, ...(i < 50 ? { maturedAt: NOW } : {}) }),
    );
    expect(ids(findNewMilestones(ctx({ vocab }), {}))).toContain("matured-50");
    expect(ids(findNewMilestones(ctx({ vocab }), {}))).not.toContain("matured-150");
  });

  it("erkennt das erreichte Wochenziel am gesetzten Ziel", () => {
    const stats = { ...EMPTY_STATS, weekDays: ["a", "b", "c", "d"] };
    expect(ids(findNewMilestones(ctx({ stats }), {}))).toContain("first-week-goal");
    const strict = ctx({ stats, settings: { ...DEFAULT_SETTINGS, weeklyGoalDays: 6 } });
    expect(ids(findNewMilestones(strict, {}))).not.toContain("first-week-goal");
  });

  it("verlangt für die fehlerfreie Tipprunde Umfang UND Fehlerfreiheit", () => {
    const perfect = ctx({
      session: { total: 5, correct: 5, matured: 0, modes: { typed: { total: 5, correct: 5 } } },
    });
    expect(ids(findNewMilestones(perfect, {}))).toContain("typed-perfect");

    const tooShort = ctx({
      session: { total: 3, correct: 3, matured: 0, modes: { typed: { total: 3, correct: 3 } } },
    });
    expect(ids(findNewMilestones(tooShort, {}))).not.toContain("typed-perfect");

    const withMistake = ctx({
      session: { total: 6, correct: 5, matured: 0, modes: { typed: { total: 6, correct: 5 } } },
    });
    expect(ids(findNewMilestones(withMistake, {}))).not.toContain("typed-perfect");
  });

  it("erkennt den Langzeit-Abruf einer Box-5-Karte", () => {
    const hit = ctx({ log: [logEntry({ elapsedDays: 91, newBox: 5, grade: 3 })] });
    expect(ids(findNewMilestones(hit, {}))).toContain("long-recall");

    const tooSoon = ctx({ log: [logEntry({ elapsedDays: 30, newBox: 5 })] });
    expect(ids(findNewMilestones(tooSoon, {}))).not.toContain("long-recall");

    const failed = ctx({ log: [logEntry({ elapsedDays: 91, newBox: 5, grade: 1 })] });
    expect(ids(findNewMilestones(failed, {}))).not.toContain("long-recall");
  });

  it("verlangt für Ngeli alle trainierten Klassen", () => {
    const almost = Object.fromEntries(
      NGELI_TRAINABLE_CLASSES.slice(1).map((c) => [c, NGELI_MASTERY_PER_CLASS]),
    );
    expect(
      ids(
        findNewMilestones(
          ctx({ trainer: { ...EMPTY_TRAINER_STATS, ngeliCorrectByClass: almost } }),
          {},
        ),
      ),
    ).not.toContain("ngeli-master");

    const complete = Object.fromEntries(
      NGELI_TRAINABLE_CLASSES.map((c) => [c, NGELI_MASTERY_PER_CLASS]),
    );
    expect(
      ids(
        findNewMilestones(
          ctx({ trainer: { ...EMPTY_TRAINER_STATS, ngeliCorrectByClass: complete } }),
          {},
        ),
      ),
    ).toContain("ngeli-master");
  });

  it("hält den Geschichten-Meilenstein bis Welle 3 gesperrt", () => {
    const everything = ctx({
      vocab: Array.from({ length: 400 }, (_, i) => makeCard({ id: `c${i}`, maturedAt: NOW })),
      stats: {
        ...EMPTY_STATS,
        totalReviewed: 999,
        totalDaysLearned: 99,
        weekDays: ["a", "b", "c", "d"],
      },
      trainer: {
        verbTasks: 500,
        ngeliTasks: 500,
        bestStreakRun: 50,
        ngeliCorrectByClass: Object.fromEntries(NGELI_TRAINABLE_CLASSES.map((c) => [c, 99])),
      },
    });
    expect(ids(findNewMilestones(everything, {}))).not.toContain("first-story");
  });
});
