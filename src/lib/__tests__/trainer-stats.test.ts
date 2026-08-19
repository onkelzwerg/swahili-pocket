import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReviewLogEntry } from "../types";

// IndexedDB gibt es im Node-Runner nicht — idb-keyval wird durch eine
// In-Memory-Map ersetzt (gleiches Muster wie migrations.test.ts).
vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

const { resetDb, kv, setKv, seedCards, allCards, cardById, allLogEntries } =
  await import("./idb-fake");

const { getTrainerStats, recordTrainerTask, resetTrainerStatsCache } =
  await import("../trainer-stats");
const { countReviewsOnDay } = await import("../review-log");
const { isoDay } = await import("../dates");

beforeEach(() => {
  resetDb();
  resetTrainerStatsCache();
});

function logEntry(patch: Partial<ReviewLogEntry>): ReviewLogEntry {
  return {
    id: Math.random().toString(),
    cardId: "c1",
    ts: Date.now(),
    grade: 3,
    mode: "flip",
    elapsedDays: 0,
    scheduler: "fsrs",
    newBox: 1,
    newDue: 0,
    ...patch,
  };
}

describe("recordTrainerTask", () => {
  it("zählt Verb- und Ngeli-Aufgaben getrennt", async () => {
    await recordTrainerTask({ kind: "verb", correct: true, runLength: 1 });
    await recordTrainerTask({ kind: "ngeli", correct: true, nounClass: "N", runLength: 2 });
    const stats = await getTrainerStats();
    expect(stats.verbTasks).toBe(1);
    expect(stats.ngeliTasks).toBe(1);
  });

  it("zählt richtige Ngeli-Aufgaben je Klasse", async () => {
    await recordTrainerTask({ kind: "ngeli", correct: true, nounClass: "Ki-Vi", runLength: 1 });
    await recordTrainerTask({ kind: "ngeli", correct: true, nounClass: "Ki-Vi", runLength: 2 });
    await recordTrainerTask({ kind: "ngeli", correct: false, nounClass: "Ki-Vi", runLength: 0 });
    const stats = await getTrainerStats();
    expect(stats.ngeliCorrectByClass["Ki-Vi"]).toBe(2);
  });

  it("merkt sich die beste Serie und senkt sie nie", async () => {
    await recordTrainerTask({ kind: "verb", correct: true, runLength: 7 });
    await recordTrainerTask({ kind: "verb", correct: false, runLength: 0 });
    expect((await getTrainerStats()).bestStreakRun).toBe(7);
  });
});

describe("countReviewsOnDay", () => {
  const today = isoDay();
  const now = Date.now();

  it("zählt geübte Karten", () => {
    const log = [logEntry({ ts: now }), logEntry({ ts: now, mode: "typed" })];
    expect(countReviewsOnDay(log, today)).toBe(2);
  });

  it("zählt Trainer-Aufgaben nicht als Karten", () => {
    const log = [
      logEntry({ ts: now }),
      logEntry({ ts: now, mode: "morph-verb" }),
      logEntry({ ts: now, mode: "morph-ngeli" }),
    ];
    expect(countReviewsOnDay(log, today)).toBe(1);
  });

  it("ignoriert andere Tage", () => {
    const log = [logEntry({ ts: now - 3 * 86_400_000 })];
    expect(countReviewsOnDay(log, today)).toBe(0);
  });
});
