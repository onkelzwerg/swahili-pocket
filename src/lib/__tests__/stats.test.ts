import { describe, expect, it } from "vitest";
import {
  applyReviewToStats,
  expireStreak,
  normalizeStats,
  pruneWeekDays,
  EMPTY_STATS,
  MAX_FREEZES,
} from "../offline";
import { weekStart, weekDates, daysBetween, isoDay } from "../dates";
import type { UserStats } from "../types";

/** Lokale Mitternacht eines Datums — die Stats-Logik rechnet in lokaler Zeit. */
function at(iso: string, hour = 12): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, hour).getTime();
}

function stats(patch: Partial<UserStats> = {}): UserStats {
  return { ...EMPTY_STATS, ...patch };
}

describe("dates", () => {
  it("beginnt die Woche am Montag", () => {
    // 2026-03-04 ist ein Mittwoch.
    expect(weekStart("2026-03-04")).toBe("2026-03-02");
    expect(weekStart("2026-03-02")).toBe("2026-03-02");
    // Sonntag gehört noch zur Vorwoche.
    expect(weekStart("2026-03-08")).toBe("2026-03-02");
    expect(weekStart("2026-03-09")).toBe("2026-03-09");
  });

  it("liefert sieben Tage Mo–So", () => {
    expect(weekDates("2026-03-04")).toEqual([
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
    ]);
  });

  it("zählt Tagesabstände über Monatsgrenzen", () => {
    expect(daysBetween("2026-02-27", "2026-03-02")).toBe(3);
  });

  it("nutzt lokale Zeit, nicht UTC", () => {
    // 00:30 lokal muss der heutige Tag sein, nicht der gestrige (UTC-Falle).
    const d = new Date(2026, 2, 4, 0, 30);
    expect(isoDay(d.getTime())).toBe("2026-03-04");
  });
});

describe("pruneWeekDays", () => {
  it("wirft Tage aus der Vorwoche raus", () => {
    const days = ["2026-02-27", "2026-03-01", "2026-03-02", "2026-03-04"];
    expect(pruneWeekDays(days, "2026-03-04")).toEqual(["2026-03-02", "2026-03-04"]);
  });

  it("dedupliziert und sortiert", () => {
    expect(pruneWeekDays(["2026-03-04", "2026-03-02", "2026-03-04"], "2026-03-04")).toEqual([
      "2026-03-02",
      "2026-03-04",
    ]);
  });
});

describe("applyReviewToStats", () => {
  it("startet die Streak beim ersten Review", () => {
    const next = applyReviewToStats(stats(), true, at("2026-03-04"));
    expect(next.streak).toBe(1);
    expect(next.lastReviewDate).toBe("2026-03-04");
    expect(next.weekDays).toEqual(["2026-03-04"]);
    expect(next.totalDaysLearned).toBe(1);
    expect(next.xp).toBe(10);
  });

  it("zählt am Folgetag hoch, bei größerer Lücke neu", () => {
    const base = stats({ streak: 5, lastReviewDate: "2026-03-03", totalDaysLearned: 5 });
    expect(applyReviewToStats(base, true, at("2026-03-04")).streak).toBe(6);
    expect(applyReviewToStats(base, true, at("2026-03-06")).streak).toBe(1);
  });

  it("zählt am selben Tag die Streak nicht doppelt", () => {
    const base = stats({
      streak: 3,
      lastReviewDate: "2026-03-04",
      weekDays: ["2026-03-04"],
      totalDaysLearned: 3,
    });
    const next = applyReviewToStats(base, false, at("2026-03-04", 20));
    expect(next.streak).toBe(3);
    expect(next.totalDaysLearned).toBe(3);
    expect(next.weekDays).toEqual(["2026-03-04"]);
    expect(next.totalReviewed).toBe(1);
    expect(next.xp).toBe(0);
  });

  it("leert die Wochentage beim Wochenwechsel", () => {
    // Montag nach einer Woche mit Do/Fr.
    const base = stats({
      streak: 2,
      lastReviewDate: "2026-03-06",
      weekDays: ["2026-03-05", "2026-03-06"],
      totalDaysLearned: 2,
    });
    const next = applyReviewToStats(base, true, at("2026-03-09"));
    expect(next.weekDays).toEqual(["2026-03-09"]);
  });

  it("verdient alle 7 Lerntage einen Joker", () => {
    const base = stats({ streak: 6, lastReviewDate: "2026-03-03", totalDaysLearned: 6 });
    const next = applyReviewToStats(base, true, at("2026-03-04"));
    expect(next.totalDaysLearned).toBe(7);
    expect(next.freezes).toBe(1);
    expect(next.lastFreezeEarned).toBe("2026-03-04");
  });

  it("deckelt die Joker bei zwei", () => {
    const base = stats({
      streak: 13,
      lastReviewDate: "2026-03-03",
      totalDaysLearned: 20,
      freezes: MAX_FREEZES,
    });
    const next = applyReviewToStats(base, true, at("2026-03-04"));
    expect(next.totalDaysLearned).toBe(21);
    expect(next.freezes).toBe(MAX_FREEZES);
  });
});

describe("expireStreak", () => {
  it("lässt eine heute/gestern gepflegte Streak in Ruhe", () => {
    const base = stats({ streak: 4, lastReviewDate: "2026-03-04", freezes: 1 });
    expect(expireStreak(base, at("2026-03-04")).stats.streak).toBe(4);
    expect(expireStreak(base, at("2026-03-05")).stats.streak).toBe(4);
  });

  it("verbraucht bei einem Tag Lücke einen Joker", () => {
    const base = stats({ streak: 4, lastReviewDate: "2026-03-04", freezes: 1 });
    const { stats: next, changed } = expireStreak(base, at("2026-03-06"));
    expect(changed).toBe(true);
    expect(next.streak).toBe(4);
    expect(next.freezes).toBe(0);
    // Auf gestern gesetzt, damit heute normal weitergezählt wird.
    expect(next.lastReviewDate).toBe("2026-03-05");
    expect(applyReviewToStats(next, true, at("2026-03-06")).streak).toBe(5);
  });

  it("bricht ohne Joker ab", () => {
    const base = stats({ streak: 4, lastReviewDate: "2026-03-04", freezes: 0 });
    expect(expireStreak(base, at("2026-03-06")).stats.streak).toBe(0);
  });

  it("rettet keine Lücke von zwei oder mehr Tagen", () => {
    const base = stats({ streak: 9, lastReviewDate: "2026-03-04", freezes: MAX_FREEZES });
    const { stats: next } = expireStreak(base, at("2026-03-07"));
    expect(next.streak).toBe(0);
    expect(next.freezes).toBe(MAX_FREEZES);
  });

  it("meldet ab einer Woche Pause ein Comeback", () => {
    const base = stats({ streak: 9, lastReviewDate: "2026-02-25", freezes: 1 });
    expect(expireStreak(base, at("2026-03-04")).stats.comeback).toBe(true);
    const recent = stats({ streak: 9, lastReviewDate: "2026-03-02", freezes: 1 });
    expect(expireStreak(recent, at("2026-03-04")).stats.comeback).toBeUndefined();
  });

  it("räumt Wochentage aus der Vorwoche ab", () => {
    const base = stats({
      streak: 1,
      lastReviewDate: "2026-03-06",
      weekDays: ["2026-03-05", "2026-03-06"],
    });
    const { stats: next } = expireStreak(base, at("2026-03-09"));
    expect(next.weekDays).toEqual([]);
  });
});

describe("normalizeStats", () => {
  it("füllt v1-Stats mit Defaults auf", () => {
    const legacy = { streak: 3, lastReviewDate: "2026-03-04", totalReviewed: 40, xp: 400 };
    const next = normalizeStats(legacy);
    expect(next.weekDays).toEqual([]);
    expect(next.freezes).toBe(0);
    expect(next.totalDaysLearned).toBe(3);
  });

  it("verträgt null", () => {
    expect(normalizeStats(null)).toEqual(EMPTY_STATS);
  });
});
