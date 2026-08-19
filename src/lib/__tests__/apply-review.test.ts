import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReviewLogEntry, SchedulerId, VocabEntry } from "../types";

vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

const { resetDb, kv, setKv, seedCards, allCards, cardById, allLogEntries } =
  await import("./idb-fake");

// crypto.randomUUID gibt es in Node ≥ 19; für ältere Runner nachrüsten.
if (!globalThis.crypto?.randomUUID) {
  let n = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => `id-${++n}` },
    configurable: true,
  });
}

const { applyReview, recomputeDue, MATURE_AFTER_DAYS } = await import("../srs");
const { DAY_MS } = await import("../srs/types");
const { resetSettingsCache, writeSettings, DEFAULT_SETTINGS } = await import("../settings");
const { resetReviewLogCache } = await import("../review-log");
const { resetMigrationState, DATA_VERSION } = await import("../migrations");
const { makeCard } = await import("./helpers");

const NOW = Date.parse("2026-03-01T10:00:00Z");

async function setup(cards: VocabEntry[], scheduler: SchedulerId) {
  resetDb();
  resetSettingsCache();
  resetReviewLogCache();
  resetMigrationState();
  setKv("data:version", DATA_VERSION);
  seedCards(cards);
  await writeSettings({ ...DEFAULT_SETTINGS, scheduler });
}

function storedCard(id: string): VocabEntry {
  return allCards().find((c) => c.id === id)!;
}

function log(): ReviewLogEntry[] {
  return allLogEntries();
}

beforeEach(() => {
  resetDb();
});

describe("applyReview", () => {
  it("pflegt beide Scheduler-Zustände, egal welcher aktiv ist", async () => {
    const card = makeCard({ id: "a", box: 2, lastReviewAt: NOW - 3 * DAY_MS });
    await setup([card], "leitner");
    await applyReview(card, 3, "flip", NOW);

    const saved = storedCard("a");
    expect(saved.box).toBe(3);
    expect(saved.leitnerDue).toBe(NOW + 4 * DAY_MS);
    expect(saved.fsrs).toBeDefined();
    expect(saved.fsrs!.reps).toBe(1);
    // Aktiv ist Leitner → nextReview spiegelt die Leitner-Fälligkeit.
    expect(saved.nextReview).toBe(saved.leitnerDue);
    expect(saved.lastReviewAt).toBe(NOW);
  });

  it("spiegelt unter FSRS die FSRS-Fälligkeit in nextReview", async () => {
    const card = makeCard({ id: "a", box: 2, lastReviewAt: NOW - 3 * DAY_MS });
    await setup([card], "fsrs");
    await applyReview(card, 3, "flip", NOW);

    const saved = storedCard("a");
    expect(saved.nextReview).toBe(saved.fsrs!.due);
    expect(saved.nextReview).not.toBe(saved.leitnerDue);
    // Der Leitner-Zustand läuft trotzdem mit.
    expect(saved.box).toBe(3);
    expect(saved.leitnerDue).toBe(NOW + 4 * DAY_MS);
  });

  it("markiert eine Karte erst nach ≥7 Tagen Abstand als gefestigt", async () => {
    const almost = makeCard({ id: "a", box: 3, lastReviewAt: NOW - 6.9 * DAY_MS });
    await setup([almost], "leitner");
    expect((await applyReview(almost, 3, "flip", NOW)).matured).toBe(false);
    expect(storedCard("a").maturedAt).toBeUndefined();

    const ripe = makeCard({ id: "b", box: 3, lastReviewAt: NOW - 7.1 * DAY_MS });
    await setup([ripe], "leitner");
    expect((await applyReview(ripe, 3, "flip", NOW)).matured).toBe(true);
    expect(storedCard("b").maturedAt).toBe(NOW);
  });

  it("festigt nicht bei einer falschen Antwort", async () => {
    const card = makeCard({ id: "a", box: 3, lastReviewAt: NOW - 30 * DAY_MS });
    await setup([card], "leitner");
    expect((await applyReview(card, 1, "flip", NOW)).matured).toBe(false);
    expect(storedCard("a").maturedAt).toBeUndefined();
  });

  it("festigt eine bereits gefestigte Karte nicht erneut", async () => {
    const earlier = NOW - 100 * DAY_MS;
    const card = makeCard({
      id: "a",
      box: 4,
      maturedAt: earlier,
      lastReviewAt: NOW - 20 * DAY_MS,
    });
    await setup([card], "leitner");
    expect((await applyReview(card, 3, "flip", NOW)).matured).toBe(false);
    expect(storedCard("a").maturedAt).toBe(earlier);
  });

  it("schreibt einen vollständigen Log-Eintrag", async () => {
    const card = makeCard({ id: "a", box: 2, lastReviewAt: NOW - 5 * DAY_MS });
    await setup([card], "fsrs");
    await applyReview(card, 2, "flip", NOW);

    expect(log()).toHaveLength(1);
    const [entry] = log();
    expect(entry).toMatchObject({
      cardId: "a",
      ts: NOW,
      grade: 2,
      mode: "flip",
      elapsedDays: 5,
      scheduler: "fsrs",
      newBox: 2,
    });
    expect(entry.newStability).toBeGreaterThan(0);
    expect(entry.newDue).toBe(storedCard("a").nextReview);
  });

  it("zählt Stats und XP mit", async () => {
    const card = makeCard({ id: "a", box: 1 });
    await setup([card], "leitner");
    const { stats } = await applyReview(card, 4, "flip", NOW);
    expect(stats.totalReviewed).toBe(1);
    expect(stats.xp).toBe(10);
    expect(stats.streak).toBe(1);
  });

  it("erstreview ohne lastReviewAt hat elapsedDays 0", async () => {
    const card = makeCard({ id: "a", box: 1 });
    await setup([card], "leitner");
    await applyReview(card, 3, "flip", NOW);
    expect(log()[0].elapsedDays).toBe(0);
    expect(MATURE_AFTER_DAYS).toBe(7);
  });
});

describe("recomputeDue", () => {
  it("wechselt verlustfrei hin und her", async () => {
    const cards = [
      makeCard({ id: "a", box: 2, lastReviewAt: NOW - 3 * DAY_MS }),
      makeCard({ id: "b", box: 5, lastReviewAt: NOW - 40 * DAY_MS }),
    ];
    await setup(cards, "leitner");
    await applyReview(storedCard("a"), 3, "flip", NOW);
    await applyReview(storedCard("b"), 2, "flip", NOW);

    const before = allCards().map((c) => ({
      id: c.id,
      box: c.box,
      leitnerDue: c.leitnerDue,
      fsrs: c.fsrs,
    }));

    await recomputeDue("fsrs", NOW);
    for (const c of allCards()) {
      expect(c.nextReview).toBe(c.fsrs!.due);
    }

    await recomputeDue("leitner", NOW);
    for (const c of allCards()) {
      expect(c.nextReview).toBe(c.leitnerDue);
    }

    const after = allCards().map((c) => ({
      id: c.id,
      box: c.box,
      leitnerDue: c.leitnerDue,
      fsrs: c.fsrs,
    }));
    expect(after).toEqual(before);
  });

  it("meldet die Zahl der danach fälligen Karten", async () => {
    const cards = [
      makeCard({ id: "due", box: 1, leitnerDue: NOW - DAY_MS }),
      makeCard({ id: "later", box: 1, leitnerDue: NOW + 5 * DAY_MS }),
    ];
    await setup(cards, "fsrs");
    expect(await recomputeDue("leitner", NOW)).toEqual({ dueCount: 1 });
  });

  it("seedet fehlende FSRS-Zustände beim Wechsel", async () => {
    await setup([makeCard({ id: "a", box: 4, lastReviewAt: NOW - DAY_MS })], "leitner");
    await recomputeDue("fsrs", NOW);
    const saved = storedCard("a");
    expect(saved.fsrs?.stability).toBe(8);
    expect(saved.nextReview).toBe(saved.fsrs!.due);
  });

  it("schreibt eine rekonstruierte Leitner-Fälligkeit einmalig fest", async () => {
    // Karte ohne leitnerDue (z. B. aus einem v1-Backup).
    const lastReviewAt = NOW - 2 * DAY_MS;
    await setup([makeCard({ id: "a", box: 4, lastReviewAt })], "fsrs");
    await recomputeDue("leitner", NOW);
    const first = storedCard("a").leitnerDue;
    expect(first).toBe(lastReviewAt + 7 * DAY_MS);

    // Mehrfaches Umschalten darf die Fälligkeit nicht verschieben.
    await recomputeDue("fsrs", NOW + DAY_MS);
    await recomputeDue("leitner", NOW + 2 * DAY_MS);
    expect(storedCard("a").leitnerDue).toBe(first);
    expect(storedCard("a").nextReview).toBe(first);
  });
});
