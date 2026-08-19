import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserStats, VocabEntry } from "../types";

// IndexedDB gibt es im Node-Runner nicht — idb-keyval wird nachgebildet
// (mit Stores und sortierten Schlüsseln, siehe idb-fake.ts).
vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

const { resetDb, kv, setKv, seedCards, allCards, cardById, allLogEntries } =
  await import("./idb-fake");

const { runMigrations, resetMigrationState, DATA_VERSION } = await import("../migrations");
const { getSettings, resetSettingsCache } = await import("../settings");
const { makeCard } = await import("./helpers");

beforeEach(() => {
  resetDb();
  resetMigrationState();
  resetSettingsCache();
});

/**
 * Ausgangslage einer Datenversion 1: der komplette Bestand als ein Array unter
 * `vocab:list`. Bewusst **nicht** über seedCards() — der Kartenstore ist das
 * Ziel der Migration, nicht ihre Quelle.
 */
function seedV1(vocab: VocabEntry[], stats?: Partial<UserStats>) {
  setKv("vocab:list", vocab);
  if (stats) setKv("stats:current", stats);
}

describe("Migration v1 → v2", () => {
  it("setzt die Datenversion", async () => {
    await runMigrations();
    expect(kv("data:version")).toBe(DATA_VERSION);
  });

  it("läuft nur einmal", async () => {
    seedV1([makeCard({ box: 2, nextReview: 1000 })]);
    await runMigrations();
    const after = allCards();
    // Zweiter Lauf darf nichts mehr anfassen.
    resetMigrationState();
    await runMigrations();
    expect(allCards()).toEqual(after);
  });

  it("übernimmt nextReview als Leitner-Fälligkeit und seedet FSRS", async () => {
    seedV1([makeCard({ id: "a", box: 3, nextReview: 4242 })]);
    await runMigrations();
    const [card] = allCards();
    expect(card.leitnerDue).toBe(4242);
    expect(card.fsrs?.stability).toBe(4);
    expect(card.lastReviewAt).toBe(card.updatedAt ?? card.createdAt);
  });

  it("schützt Bestandskarten ab Box 4 als gefestigt", async () => {
    const updatedAt = Date.parse("2026-02-01T10:00:00Z");
    seedV1([
      makeCard({ id: "b3", box: 3, updatedAt }),
      makeCard({ id: "b4", box: 4, updatedAt }),
      makeCard({ id: "b5", box: 5, updatedAt }),
    ]);
    await runMigrations();
    const list = allCards();
    expect(list.find((c) => c.id === "b3")?.maturedAt).toBeUndefined();
    expect(list.find((c) => c.id === "b4")?.maturedAt).toBe(updatedAt);
    expect(list.find((c) => c.id === "b5")?.maturedAt).toBe(updatedAt);
  });

  it("gibt Bestandsnutzern einen Willkommens-Joker und leere Wochentage", async () => {
    seedV1([makeCard()], { streak: 4, lastReviewDate: "2026-03-04", totalReviewed: 90, xp: 900 });
    await runMigrations();
    const stats = kv<UserStats>("stats:current")!;
    expect(stats.freezes).toBe(1);
    expect(stats.weekDays).toEqual([]);
    expect(stats.streak).toBe(4);
    expect(stats.totalReviewed).toBe(90);
  });

  it("lässt Bestandsnutzer auf Leitner", async () => {
    seedV1([makeCard()], { streak: 1, lastReviewDate: "2026-03-04", totalReviewed: 12, xp: 120 });
    await runMigrations();
    expect((await getSettings()).scheduler).toBe("leitner");
  });

  it("startet Neu-User adaptiv (FSRS)", async () => {
    await runMigrations();
    expect((await getSettings()).scheduler).toBe("fsrs");
  });
});
