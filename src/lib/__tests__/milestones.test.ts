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
    stories: {},
    retention: [],
    dialogues: {},
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

  it("erkennt die erste gelesene Geschichte", () => {
    expect(ids(findNewMilestones(ctx(), {}))).not.toContain("first-story");
    expect(ids(findNewMilestones(ctx({ stories: { "markt-1-01": NOW } }), {}))).toContain(
      "first-story",
    );
  });

  it("vergibt den Ohne-Hilfe-Meilenstein nur für die gerade gelesene Geschichte", () => {
    // Aus dem Gelesen-Status allein ist das nicht rekonstruierbar — der
    // Meilenstein hängt am Ereignis, nicht am Bestand.
    const read = ctx({ stories: { "markt-1-01": NOW } });
    expect(ids(findNewMilestones(read, {}))).not.toContain("story-unaided");

    const withHelp = ctx({ story: { unaided: false } });
    expect(ids(findNewMilestones(withHelp, {}))).not.toContain("story-unaided");

    const unaided = ctx({ story: { unaided: true } });
    expect(ids(findNewMilestones(unaided, {}))).toContain("story-unaided");
  });

  it("verlangt für den Langzeit-Check eine Trefferquote von 80 %", () => {
    const weak = ctx({ retention: [{ ts: NOW, correct: 7, total: 10 }] });
    expect(ids(findNewMilestones(weak, {}))).not.toContain("retention-kept");

    const strong = ctx({ retention: [{ ts: NOW, correct: 8, total: 10 }] });
    expect(ids(findNewMilestones(strong, {}))).toContain("retention-kept");
  });

  it("vergibt den Dialog-Meilenstein nur für eine fehlerfreie Runde", () => {
    const almost = ctx({ dialogues: { greet: { ts: NOW, firstTry: 3, total: 4 } } });
    expect(ids(findNewMilestones(almost, {}))).not.toContain("dialogue-played");

    const perfect = ctx({ dialogues: { greet: { ts: NOW, firstTry: 4, total: 4 } } });
    expect(ids(findNewMilestones(perfect, {}))).toContain("dialogue-played");
  });

  it("meldet einen komplett gefüllten Stand vollständig", () => {
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
      stories: { "markt-1-01": NOW },
      story: { unaided: true },
      retention: [{ ts: NOW, correct: 10, total: 10 }],
      dialogues: { greet: { ts: NOW, firstTry: 4, total: 4 } },
      log: [logEntry({ elapsedDays: 91, newBox: 5, grade: 3 })],
      session: { total: 6, correct: 6, matured: 0, modes: { typed: { total: 6, correct: 6 } } },
    });
    // "audio-session" verlangt 25 Log-Einträge — hier bewusst nicht erfüllt.
    const reached = ids(findNewMilestones(everything, {}));
    expect(reached).toHaveLength(MILESTONES.length - 1);
    expect(reached).not.toContain("audio-session");
  });
});
