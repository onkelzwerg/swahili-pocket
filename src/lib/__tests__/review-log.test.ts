import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReviewLogEntry } from "../types";

// Das Review-Log (Entscheidung A) — Anhängen, Ringpuffer, Tageszählung.
//
// Der Ringpuffer war bis hierher ungetestet, obwohl er das einzige Stück ist,
// das jemals Daten *wegbewegt*. Er greift erst bei 20.000 Einträgen: einmal in
// vielen Jahren, und dann unbeobachtet. Genau deshalb gehört er unter Test.

vi.mock("idb-keyval", async () => (await import("./idb-fake")).fake);

const { resetDb, seedLogEntries, allLogEntries, allArchivedLogEntries } =
  await import("./idb-fake");
const {
  appendReviewLog,
  readReviewLog,
  writeReviewLog,
  resetReviewLogCache,
  countReviewsOnDay,
  appendTrainerResult,
  MAX_ENTRIES,
  ARCHIVE_CHUNK,
} = await import("../review-log");

if (!globalThis.crypto?.randomUUID) {
  let n = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => `uuid-${++n}` },
    configurable: true,
  });
}

const NOW = Date.parse("2026-03-01T10:00:00Z");

function entry(i: number, patch: Partial<ReviewLogEntry> = {}): ReviewLogEntry {
  return {
    id: `e${String(i).padStart(6, "0")}`,
    cardId: `card-${i}`,
    ts: NOW + i,
    grade: 3,
    mode: "flip",
    elapsedDays: 0,
    scheduler: "leitner",
    newBox: 2,
    newDue: NOW + 86_400_000,
    ...patch,
  };
}

beforeEach(() => {
  resetDb();
  resetReviewLogCache();
});

describe("Anhängen und Lesen", () => {
  it("hängt an und liefert chronologisch zurück", async () => {
    await appendReviewLog(entry(2));
    await appendReviewLog(entry(1));
    await appendReviewLog(entry(3));

    resetReviewLogCache();
    const log = await readReviewLog();
    expect(log.map((e) => e.ts)).toEqual([NOW + 1, NOW + 2, NOW + 3]);
  });

  it("liest ein leeres Log als leere Liste, nicht als Fehler", async () => {
    expect(await readReviewLog()).toEqual([]);
  });

  it("ersetzt beim Backup-Import das komplette Log", async () => {
    await appendReviewLog(entry(1));
    await writeReviewLog([entry(9), entry(8)]);

    resetReviewLogCache();
    const log = await readReviewLog();
    expect(log.map((e) => e.id)).toEqual([entry(8).id, entry(9).id]);
  });
});

describe("Ringpuffer", () => {
  it("lässt das Log unterhalb der Grenze unangetastet", async () => {
    seedLogEntries(Array.from({ length: MAX_ENTRIES - 1 }, (_, i) => entry(i)));
    resetReviewLogCache();
    await appendReviewLog(entry(MAX_ENTRIES));

    expect(allLogEntries()).toHaveLength(MAX_ENTRIES);
    expect(allArchivedLogEntries()).toHaveLength(0);
  });

  it("schiebt die ältesten Einträge ins Archiv, sobald die Grenze fällt", async () => {
    seedLogEntries(Array.from({ length: MAX_ENTRIES }, (_, i) => entry(i)));
    resetReviewLogCache();
    await appendReviewLog(entry(MAX_ENTRIES));

    expect(allArchivedLogEntries()).toHaveLength(ARCHIVE_CHUNK);
    expect(allLogEntries()).toHaveLength(MAX_ENTRIES + 1 - ARCHIVE_CHUNK);
  });

  it("archiviert die ältesten, nicht irgendwelche", async () => {
    seedLogEntries(Array.from({ length: MAX_ENTRIES }, (_, i) => entry(i)));
    resetReviewLogCache();
    await appendReviewLog(entry(MAX_ENTRIES));

    const archived = allArchivedLogEntries();
    const remaining = allLogEntries();
    expect(archived[0].ts).toBe(NOW);
    expect(archived.at(-1)!.ts).toBe(NOW + ARCHIVE_CHUNK - 1);
    expect(remaining[0].ts).toBe(NOW + ARCHIVE_CHUNK);
  });

  it("verliert dabei keinen einzigen Eintrag", async () => {
    seedLogEntries(Array.from({ length: MAX_ENTRIES }, (_, i) => entry(i)));
    resetReviewLogCache();
    await appendReviewLog(entry(MAX_ENTRIES));

    const ids = new Set([
      ...allArchivedLogEntries().map((e) => e.id),
      ...allLogEntries().map((e) => e.id),
    ]);
    expect(ids.size).toBe(MAX_ENTRIES + 1);
  });

  it("hält den Cache mit dem Store im Gleichklang", async () => {
    seedLogEntries(Array.from({ length: MAX_ENTRIES }, (_, i) => entry(i)));
    resetReviewLogCache();
    await appendReviewLog(entry(MAX_ENTRIES));

    // Ohne Cache-Reset: was die App gerade in der Hand hält …
    const cached = await readReviewLog();
    resetReviewLogCache();
    // … muss dem entsprechen, was beim nächsten Start gelesen wird.
    const fromStore = await readReviewLog();
    expect(cached.map((e) => e.id)).toEqual(fromStore.map((e) => e.id));
  });
});

describe("countReviewsOnDay", () => {
  it("zählt nur Karten des gefragten Tages", async () => {
    const log = [
      entry(1, { ts: Date.parse("2026-03-01T08:00:00Z") }),
      entry(2, { ts: Date.parse("2026-03-01T20:00:00Z") }),
      entry(3, { ts: Date.parse("2026-02-28T20:00:00Z") }),
    ];
    expect(countReviewsOnDay(log, "2026-03-01")).toBe(2);
  });

  it("zählt Trainer-Aufgaben nicht als geübte Karten", async () => {
    const log = [
      entry(1, { ts: NOW }),
      entry(2, { ts: NOW, mode: "morph-verb" }),
      entry(3, { ts: NOW, mode: "morph-ngeli" }),
    ];
    expect(countReviewsOnDay(log, "2026-03-01")).toBe(1);
  });
});

describe("appendTrainerResult", () => {
  it("schreibt eine Trainer-Aufgabe ins Log, ohne die Fälligkeit zu verändern", async () => {
    await appendTrainerResult({
      cardId: "karte-1",
      mode: "morph-verb",
      correct: true,
      scheduler: "fsrs",
      box: 3,
      nextReview: 4242,
      now: NOW,
    });

    resetReviewLogCache();
    const [logged] = await readReviewLog();
    expect(logged.mode).toBe("morph-verb");
    expect(logged.grade).toBe(3);
    expect(logged.newBox).toBe(3);
    expect(logged.newDue).toBe(4242);
  });

  it("vermerkt eine falsche Antwort als Grade 1", async () => {
    await appendTrainerResult({
      cardId: "karte-1",
      mode: "morph-ngeli",
      correct: false,
      scheduler: "leitner",
      box: 2,
      nextReview: 1,
      now: NOW,
    });

    resetReviewLogCache();
    const [logged] = await readReviewLog();
    expect(logged.grade).toBe(1);
  });
});
