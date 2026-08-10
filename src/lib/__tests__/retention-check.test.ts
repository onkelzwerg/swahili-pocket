import { describe, expect, it } from "vitest";
import {
  RETENTION_COOLDOWN_DAYS,
  RETENTION_MIN_CANDIDATES,
  RETENTION_MIN_DAYS,
  RETENTION_SIZE,
  averagePauseDays,
  isRetentionCheckAvailable,
  pickRetentionCards,
  retentionCandidates,
} from "../retention-check";
import { makeCard } from "./helpers";

const NOW = Date.parse("2026-06-01T10:00:00Z");
const DAY = 86400000;

/** Karte, die vor `days` Tagen zuletzt dran war. */
function aged(id: string, days: number, patch = {}) {
  return makeCard({
    id,
    maturedAt: NOW - days * DAY,
    lastReviewAt: NOW - days * DAY,
    ...patch,
  });
}

describe("retentionCandidates", () => {
  it("nimmt nur gefestigte Karten mit langer Pause", () => {
    const vocab = [
      aged("alt", 90),
      aged("frisch", 10),
      // Gefestigt fehlt: eine lange Pause allein sagt nichts über Können.
      makeCard({ id: "nie-gefestigt", lastReviewAt: NOW - 90 * DAY }),
      // Nie geübt: kein lastReviewAt, also auch keine messbare Pause.
      makeCard({ id: "neu", maturedAt: NOW }),
    ];
    expect(retentionCandidates(vocab, NOW).map((c) => c.id)).toEqual(["alt"]);
  });

  it("nimmt eine Karte genau an der Schwelle mit", () => {
    const vocab = [aged("grenze", RETENTION_MIN_DAYS)];
    expect(retentionCandidates(vocab, NOW)).toHaveLength(1);
  });

  it("sortiert die längste Pause nach vorn", () => {
    const vocab = [aged("b", 70), aged("c", 200), aged("a", 100)];
    expect(retentionCandidates(vocab, NOW).map((c) => c.id)).toEqual(["c", "a", "b"]);
  });
});

describe("pickRetentionCards", () => {
  it("kappt die Runde auf die Rundengröße", () => {
    const vocab = Array.from({ length: 60 }, (_, i) => aged(`c${i}`, 70 + i));
    expect(pickRetentionCards(vocab, NOW)).toHaveLength(RETENTION_SIZE);
  });

  it("liefert bei wenigen Kandidatinnen alle", () => {
    const vocab = Array.from({ length: 4 }, (_, i) => aged(`c${i}`, 70 + i));
    expect(pickRetentionCards(vocab, NOW)).toHaveLength(4);
  });
});

describe("averagePauseDays", () => {
  it("mittelt die Pausen und rundet", () => {
    expect(averagePauseDays([aged("a", 60), aged("b", 90)], NOW)).toBe(75);
  });

  it("liefert ohne Karten 0", () => {
    expect(averagePauseDays([], NOW)).toBe(0);
  });
});

describe("isRetentionCheckAvailable", () => {
  const enough = Array.from({ length: RETENTION_MIN_CANDIDATES }, (_, i) => aged(`c${i}`, 70));

  it("verlangt genug Kandidatinnen", () => {
    expect(isRetentionCheckAvailable(enough.slice(0, 9), [], NOW)).toBe(false);
    expect(isRetentionCheckAvailable(enough, [], NOW)).toBe(true);
  });

  it("hält den Mindestabstand zum letzten Check ein", () => {
    const recent = [{ ts: NOW - 10 * DAY, correct: 8, total: 10 }];
    expect(isRetentionCheckAvailable(enough, recent, NOW)).toBe(false);

    const old = [{ ts: NOW - (RETENTION_COOLDOWN_DAYS + 1) * DAY, correct: 8, total: 10 }];
    expect(isRetentionCheckAvailable(enough, old, NOW)).toBe(true);
  });

  it("wertet nur den letzten Check, nicht den ersten", () => {
    const checks = [
      { ts: NOW - 200 * DAY, correct: 8, total: 10 },
      { ts: NOW - 2 * DAY, correct: 9, total: 10 },
    ];
    expect(isRetentionCheckAvailable(enough, checks, NOW)).toBe(false);
  });
});
