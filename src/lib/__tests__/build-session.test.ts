import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VocabEntry } from "../types";

// `buildSession()` — die asynchrone Hülle um `assignModes()` (W2.1).
//
// Die Verteilungsregeln sind in session.test.ts abgedeckt; ungetestet blieb
// bisher genau das, was drumherum passiert: fällige Karten holen, entdoppeln,
// mischen, auf das Tagesziel kappen und die Modus-Schalter aus den
// Einstellungen anwenden. Das ist die Stelle, an der eine Runde entsteht —
// wenn hier etwas klemmt, sieht der Nutzer die falschen Karten.

vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

// Die Sprachausgabe holt ihr Manifest per fetch — im Node-Runner gibt es das
// nicht. Ohne Audio ist der Hör-Modus schlicht nicht wählbar; das reicht hier.
vi.mock("../tts", () => ({ loadAudioIndex: async () => new Set<string>() }));

const { resetDb, setKv, seedCards } = await import("./idb-fake");
const { buildSession, SESSION_CAP_FACTOR } = await import("../session");
const { resetSettingsCache, writeSettings, DEFAULT_SETTINGS } = await import("../settings");
const { resetMigrationState, DATA_VERSION } = await import("../migrations");
const { makeCard } = await import("./helpers");

const NOW = Date.parse("2026-03-01T10:00:00Z");
const DAY = 86_400_000;

/** Ein reproduzierbarer Zufallsgenerator — sonst wäre der Test launisch. */
function seededRng(seed = 7): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/** `count` fällige Karten plus optional welche, die noch nicht dran sind. */
function cards(count: number, opts: { due?: boolean; box?: VocabEntry["box"] } = {}) {
  const due = opts.due ?? true;
  return Array.from({ length: count }, (_, i) =>
    makeCard({
      id: `c${i}`,
      swahili: `neno${i}`,
      box: opts.box ?? 1,
      nextReview: due ? NOW - DAY : NOW + DAY,
    }),
  );
}

async function setup(list: VocabEntry[], settings: Partial<typeof DEFAULT_SETTINGS> = {}) {
  resetDb();
  resetSettingsCache();
  resetMigrationState();
  setKv("data:version", DATA_VERSION);
  setKv("vocab:seeded", true);
  seedCards(list);
  await writeSettings({ ...DEFAULT_SETTINGS, ...settings });
}

beforeEach(() => {
  resetDb();
});

describe("buildSession", () => {
  it("nimmt nur fällige Karten", async () => {
    await setup([...cards(3), ...cards(4, { due: false }).map((c, i) => ({ ...c, id: `f${i}` }))]);
    const session = await buildSession({ now: NOW, rng: seededRng() });
    expect(session).toHaveLength(3);
  });

  it("kappt auf Tagesziel × Faktor und lässt den Rest fällig", async () => {
    await setup(cards(50), { dailyGoalCards: 10 });
    const session = await buildSession({ now: NOW, rng: seededRng() });
    expect(session).toHaveLength(10 * SESSION_CAP_FACTOR);
  });

  it("entdoppelt Karten, die zweimal in der Quelle stehen", async () => {
    const list = cards(2);
    await setup(list);
    // Dieselbe Karte doppelt übergeben — darf nur einmal in der Runde landen.
    const session = await buildSession({
      cards: [list[0], list[0], list[1]],
      now: NOW,
      rng: seededRng(),
    });
    expect(session.map((s) => s.card.id).sort()).toEqual(["c0", "c1"]);
  });

  it("gibt jeder Karte genau einen Modus", async () => {
    await setup(cards(8, { box: 3 }));
    const session = await buildSession({ now: NOW, rng: seededRng() });
    for (const item of session) {
      expect(item.mode).toBeTruthy();
      expect(item.card).toBeTruthy();
    }
  });

  it("respektiert abgeschaltete Modi aus den Einstellungen", async () => {
    // Box 3 macht die Karten tippreif; ohne den Schalter käme „typed" vor.
    await setup(cards(20, { box: 3 }), {
      enabledModes: { typed: false, audio: false, cloze: false },
    });
    const session = await buildSession({ now: NOW, rng: seededRng() });
    expect(session.every((s) => s.mode === "flip")).toBe(true);
  });

  it("lässt die Runde die Modi überschreiben (Langzeit-Check)", async () => {
    await setup(cards(20, { box: 3 }), { enabledModes: {} });
    const session = await buildSession({
      now: NOW,
      rng: seededRng(),
      enabledModes: { typed: false, audio: false, cloze: false },
    });
    expect(session.every((s) => s.mode === "flip")).toBe(true);
  });

  it("nimmt vorgegebene Karten statt der fälligen (Comeback-Runde)", async () => {
    const list = cards(5);
    await setup(list);
    const picked = [list[1], list[3]];
    const session = await buildSession({ cards: picked, now: NOW, rng: seededRng() });
    expect(session.map((s) => s.card.id).sort()).toEqual(["c1", "c3"]);
  });

  it("achtet auch bei vorgegebenen Karten auf das Limit", async () => {
    const list = cards(30);
    await setup(list, { dailyGoalCards: 5 });
    const session = await buildSession({ cards: list, now: NOW, rng: seededRng(), limit: 3 });
    expect(session).toHaveLength(3);
  });

  it("liefert eine leere Runde, wenn nichts fällig ist", async () => {
    await setup(cards(4, { due: false }));
    expect(await buildSession({ now: NOW, rng: seededRng() })).toEqual([]);
  });

  it("ist bei gleichem Seed reproduzierbar", async () => {
    await setup(cards(12, { box: 3 }));
    const a = await buildSession({ now: NOW, rng: seededRng(42) });
    const b = await buildSession({ now: NOW, rng: seededRng(42) });
    expect(a.map((s) => `${s.card.id}:${s.mode}`)).toEqual(b.map((s) => `${s.card.id}:${s.mode}`));
  });

  it("mischt tatsächlich, statt die Reihenfolge des Bestands zu übernehmen", async () => {
    await setup(cards(20), { dailyGoalCards: 20 });
    const session = await buildSession({ now: NOW, rng: seededRng(3) });
    const ids = session.map((s) => s.card.id);
    const sortedIds = [...ids].sort();
    expect(ids).not.toEqual(sortedIds);
  });
});
