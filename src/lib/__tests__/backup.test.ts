import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserStats, VocabEntry } from "../types";

vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

const { resetDb, kv, setKv, seedCards, allCards, cardById, allLogEntries } =
  await import("./idb-fake");

const { importBackup, sanitizeVocab } = await import("../backup");
const { getSettings, resetSettingsCache } = await import("../settings");
const { resetMigrationState, DATA_VERSION } = await import("../migrations");
const { resetReviewLogCache, readReviewLog } = await import("../review-log");
const { resetStoriesReadCache } = await import("../stories");
const { resetDialogueStatsCache } = await import("../dialogue-stats");
const { resetRetentionCache } = await import("../retention-check");
const { makeCard } = await import("./helpers");

/** File-Stub: der Importer braucht nur .text(). */
function fileOf(payload: unknown): File {
  return { text: async () => JSON.stringify(payload) } as File;
}

beforeEach(() => {
  resetDb();
  resetSettingsCache();
  resetMigrationState();
  resetReviewLogCache();
  resetStoriesReadCache();
  resetDialogueStatsCache();
  resetRetentionCache();
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
    expect(kv("data:version")).toBe(DATA_VERSION);

    const [saved] = allCards();
    expect(saved.leitnerDue).toBe(555);
    expect(saved.fsrs).toBeDefined();
    expect(saved.maturedAt).toBeDefined();

    const savedStats = kv<UserStats>("stats:current")!;
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
    expect(kv("milestones:achieved")).toEqual({ "first-session": 123 });
    expect(kv("retention:checks")).toEqual([{ ts: 1, correct: 8, total: 10 }]);
    // v2 ist schon migriert: leitnerDue bleibt unangetastet.
    expect(allCards()[0].leitnerDue).toBe(777);
  });

  it("stellt aus einem v4-Backup Geschichten und Dialoge wieder her", async () => {
    await importBackup(
      fileOf({
        app: "Swahili Pocket",
        version: 4,
        vocab: [makeCard({ id: "a" })],
        storiesRead: { "markt-1-01": 4242 },
        dialogueStats: { greet: { ts: 99, firstTry: 3, total: 3 } },
        retentionChecks: [{ ts: 7, correct: 12, total: 15 }],
      }),
    );

    expect(kv("stories:read")).toEqual({ "markt-1-01": 4242 });
    expect(kv("dialogues:played")).toEqual({ greet: { ts: 99, firstTry: 3, total: 3 } });
    expect(kv("retention:checks")).toEqual([{ ts: 7, correct: 12, total: 15 }]);
  });

  it("füllt die Welle-3-Schlüssel bei älteren Backups mit Defaults", async () => {
    // Ein v3-Backup kennt weder Geschichten noch Dialoge — Import darf trotzdem
    // nicht scheitern und muss die Schlüssel leer anlegen (Leitplanke 2).
    await importBackup(fileOf({ app: "Swahili Pocket", version: 3, vocab: [makeCard()] }));

    expect(kv("stories:read")).toEqual({});
    expect(kv("dialogues:played")).toEqual({});
    expect(kv("retention:checks")).toEqual([]);
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

// Eine Backup-Datei kann alt, halb geschrieben oder von Hand bearbeitet sein.
// Was hier durchrutscht, fällt nicht auf — es wird nur still nie wieder fällig.
describe("Eingangsprüfung kaputter Karten", () => {
  it("klemmt eine Box außerhalb von 1..5", () => {
    expect(sanitizeVocab([makeCard({ id: "a", box: 99 as VocabEntry["box"] })])[0].box).toBe(5);
    expect(sanitizeVocab([makeCard({ id: "b", box: 0 as VocabEntry["box"] })])[0].box).toBe(1);
  });

  it("ersetzt eine unbrauchbare Fälligkeit statt NaN zu erzeugen", () => {
    const [card] = sanitizeVocab([
      { ...makeCard({ id: "a" }), nextReview: "morgen" as unknown as number },
    ]);
    expect(Number.isFinite(card.nextReview)).toBe(true);
    expect(card.nextReview).toBe(card.createdAt);
  });

  it("macht aus fehlenden oder falsch getypten Beispielen eine leere Liste", () => {
    const [card] = sanitizeVocab([
      { ...makeCard({ id: "a" }), examples: "kein Array" as unknown as [] },
    ]);
    expect(card.examples).toEqual([]);
  });

  it("wirft einen unbrauchbaren FSRS-Zustand weg, statt ihn zu rechnen", () => {
    const [card] = sanitizeVocab([
      { ...makeCard({ id: "a" }), fsrs: { stability: null } as unknown as VocabEntry["fsrs"] },
    ]);
    expect(card.fsrs).toBeUndefined();
  });

  it("behält bei doppelten Ids nur den ersten Treffer", () => {
    const cards = sanitizeVocab([
      makeCard({ id: "a", german: "Kind" }),
      makeCard({ id: "a", german: "Doppelgänger" }),
    ]);
    expect(cards).toHaveLength(1);
    expect(cards[0].german).toBe("Kind");
  });

  it("lehnt eine Datei ab, in der keine einzige Karte brauchbar ist", async () => {
    await expect(
      importBackup(fileOf({ version: 2, vocab: [{ id: "nur-id" }, null] })),
    ).rejects.toThrow(/brauchbaren Karten/);
  });
});
