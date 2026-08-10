import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserStats, VocabEntry } from "../types";

const db = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => void db.set(k, v),
  clear: async () => db.clear(),
}));

const { importBackup } = await import("../backup");
const { getSettings, resetSettingsCache } = await import("../settings");
const { resetMigrationState, DATA_VERSION } = await import("../migrations");
const { resetReviewLogCache, readReviewLog } = await import("../review-log");
const { makeCard } = await import("./helpers");

/** File-Stub: der Importer braucht nur .text(). */
function fileOf(payload: unknown): File {
  return { text: async () => JSON.stringify(payload) } as File;
}

beforeEach(() => {
  db.clear();
  resetSettingsCache();
  resetMigrationState();
  resetReviewLogCache();
});

describe("importBackup", () => {
  it("nimmt ein v1-Backup an und migriert es auf v2", async () => {
    const card = makeCard({ id: "a", box: 4, nextReview: 555 });
    const stats: Partial<UserStats> = {
      streak: 3,
      lastReviewDate: "2026-03-04",
      totalReviewed: 40,
      xp: 400,
    };
    const { vocabCount } = await importBackup(
      fileOf({ app: "Swahili Pocket", version: 1, vocab: [card], stats }),
    );

    expect(vocabCount).toBe(1);
    expect(db.get("data:version")).toBe(DATA_VERSION);

    const [saved] = db.get("vocab:list") as VocabEntry[];
    expect(saved.leitnerDue).toBe(555);
    expect(saved.fsrs).toBeDefined();
    expect(saved.maturedAt).toBeDefined();

    const savedStats = db.get("stats:current") as UserStats;
    expect(savedStats.streak).toBe(3);
    expect(savedStats.freezes).toBe(1);
    expect(savedStats.weekDays).toEqual([]);
    // Bestandsdaten bleiben bei Leitner.
    expect((await getSettings()).scheduler).toBe("leitner");
  });

  it("stellt aus einem v2-Backup Settings und Log wieder her", async () => {
    const card = makeCard({ id: "a", box: 2, leitnerDue: 777, lastReviewAt: 100 });
    const reviewLog = [
      {
        id: "r1",
        cardId: "a",
        ts: 100,
        grade: 3 as const,
        mode: "flip" as const,
        elapsedDays: 2,
        scheduler: "fsrs" as const,
        newBox: 2,
        newDue: 777,
      },
    ];
    await importBackup(
      fileOf({
        app: "Swahili Pocket",
        version: 2,
        vocab: [card],
        stats: { streak: 1, lastReviewDate: "2026-03-04", totalReviewed: 5, xp: 50 },
        settings: { version: 1, scheduler: "fsrs", dailyGoalCards: 20, weeklyGoalDays: 6 },
        reviewLog,
        milestones: { "first-session": 123 },
        retentionChecks: [{ ts: 1, correct: 8, total: 10 }],
      }),
    );

    const settings = await getSettings();
    expect(settings.scheduler).toBe("fsrs");
    expect(settings.dailyGoalCards).toBe(20);
    expect(settings.weeklyGoalDays).toBe(6);
    expect(await readReviewLog()).toEqual(reviewLog);
    expect(db.get("milestones:achieved")).toEqual({ "first-session": 123 });
    expect(db.get("retention:checks")).toEqual([{ ts: 1, correct: 8, total: 10 }]);
    // v2 ist schon migriert: leitnerDue bleibt unangetastet.
    expect((db.get("vocab:list") as VocabEntry[])[0].leitnerDue).toBe(777);
  });

  it("lehnt eine Datei ohne Vokabelbestand ab", async () => {
    await expect(importBackup(fileOf({ version: 2 }))).rejects.toThrow(/Vokabel-Bestand/);
  });

  it("verwirft unvollständige Einträge", async () => {
    const { vocabCount } = await importBackup(
      fileOf({ version: 1, vocab: [makeCard(), { id: "kaputt" }] }),
    );
    expect(vocabCount).toBe(1);
  });
});
