import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserStats, VocabEntry } from "../types";

// Nebenläufige Reviews (Befund A1).
//
// Der Review-Screen speichert bewusst im Hintergrund: `void applyReview(...)`,
// und schaltet sofort zur nächsten Karte. Zwei Antworten kurz hintereinander
// laufen damit gleichzeitig durch `applyReview()`. Ohne Serialisierung liest
// die zweite die Kartenliste, bevor die erste sie zurückgeschrieben hat —
// die erste Antwort ist dann still weg.
//
// Der Mock hier setzt bewusst eine Latenz: echte IndexedDB-Zugriffe sind
// asynchron, nicht mikrotask-schnell. Mit einem synchron auflösenden Mock
// (wie in apply-review.test.ts) kann sich per Konstruktion nichts überlappen,
// und der Test wäre wertlos.
//
// Seit Datenversion 3 liegt jede Karte unter eigenem Schlüssel (siehe db.ts).
// Damit ist der Kartenpfad schon von sich aus rennsicher — er liest und
// schreibt keine gemeinsame Liste mehr. Ohne `serializeWrite` fallen deshalb
// nur noch die Stats um, die sich weiterhin einen Schlüssel teilen. Die
// Karten- und Log-Prüfungen hier sind trotzdem kein Zierrat: sie halten die
// Zusage fest, damit ein künftiger Umbau zurück auf eine Sammelliste sofort
// auffliegt.

vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

const { resetDb, kv, setKv, seedCards, allCards, allLogEntries, setLatency } =
  await import("./idb-fake");

// Echte IndexedDB-Zugriffe brauchen Zeit — hier künstlich, damit sich zwei
// Antworten überhaupt überlappen können.
setLatency(1);
const tick = () => new Promise((r) => setTimeout(r, 2));

if (!globalThis.crypto?.randomUUID) {
  let n = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => `id-${++n}` },
    configurable: true,
  });
}

const { applyReview } = await import("../srs");
const { resetSettingsCache, writeSettings, DEFAULT_SETTINGS } = await import("../settings");
const { resetReviewLogCache, readReviewLog } = await import("../review-log");
const { resetMigrationState, DATA_VERSION } = await import("../migrations");
const { makeCard } = await import("./helpers");

const NOW = Date.parse("2026-03-01T10:00:00Z");

/** Zwei fällige Karten, Leitner aktiv, Migration bereits erledigt. */
async function setup(): Promise<[VocabEntry, VocabEntry]> {
  resetDb();
  resetSettingsCache();
  resetReviewLogCache();
  resetMigrationState();
  const a = makeCard({ id: "a", box: 1 });
  const b = makeCard({ id: "b", box: 1 });
  setKv("data:version", DATA_VERSION);
  seedCards([a, b]);
  await writeSettings({ ...DEFAULT_SETTINGS, scheduler: "leitner" });
  return [a, b];
}

function storedCards(): VocabEntry[] {
  return allCards() ?? [];
}

function storedStats(): UserStats {
  return kv<UserStats>("stats:current")!;
}

/**
 * Alle angestoßenen Schreibvorgänge abwarten.
 *
 * Bewusst über die Promises statt über eine feste Wartezeit: Die Überlappung
 * entsteht dadurch, dass die Aufrufe *gestartet* werden, ohne dazwischen zu
 * warten — genau wie in review.tsx. Wann sie fertig werden, darf der Test
 * nicht raten, sonst ist er unter Last launisch.
 */
const settle = (pending: Promise<unknown>[]) => Promise.all(pending);

beforeEach(() => {
  resetDb();
});

describe("zwei Antworten überlappen sich (Muster aus review.tsx)", () => {
  it("behält beide Kartenstände", async () => {
    const [a, b] = await setup();

    const first = applyReview(a, 3, "flip", NOW);
    await tick(); // die zweite Antwort trifft ein, während die erste noch schreibt
    const second = applyReview(b, 3, "flip", NOW);
    await settle([first, second]);

    const cards = storedCards();
    expect(cards.find((c) => c.id === "a")?.box, "Karte A stieg auf").toBe(2);
    expect(cards.find((c) => c.id === "b")?.box, "Karte B stieg auf").toBe(2);
  });

  it("zählt beide Antworten in den Stats", async () => {
    const [a, b] = await setup();

    const first = applyReview(a, 3, "flip", NOW);
    await tick(); // die zweite Antwort trifft ein, während die erste noch schreibt
    const second = applyReview(b, 3, "flip", NOW);
    await settle([first, second]);

    expect(storedStats().totalReviewed, "totalReviewed").toBe(2);
    expect(storedStats().xp, "XP für zwei richtige Antworten").toBe(20);
  });

  it("schreibt beide Log-Einträge", async () => {
    const [a, b] = await setup();

    const first = applyReview(a, 3, "flip", NOW);
    await tick(); // die zweite Antwort trifft ein, während die erste noch schreibt
    const second = applyReview(b, 3, "flip", NOW);
    await settle([first, second]);

    resetReviewLogCache();
    const log = await readReviewLog();
    expect(log.map((e) => e.cardId).sort()).toEqual(["a", "b"]);
  });

  it("hält auch bei einer ganzen Runde ohne Wartezeit durch", async () => {
    // Der harte Fall: fünf Karten, alle ohne await hintereinander weg —
    // schneller, als ein Mensch tippen kann, aber genau das Muster.
    resetDb();
    resetSettingsCache();
    resetReviewLogCache();
    resetMigrationState();
    const cards = ["a", "b", "c", "d", "e"].map((id) => makeCard({ id, box: 1 }));
    setKv("data:version", DATA_VERSION);
    seedCards(cards);
    await writeSettings({ ...DEFAULT_SETTINGS, scheduler: "leitner" });

    const pending = cards.map((card) => applyReview(card, 3, "flip", NOW));
    await settle(pending);

    expect(
      storedCards().every((c) => c.box === 2),
      "jede Karte stieg auf",
    ).toBe(true);
    expect(storedStats().totalReviewed, "alle fünf gezählt").toBe(5);
  });
});
