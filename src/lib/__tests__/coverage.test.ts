import { describe, expect, it } from "vitest";
import {
  COMFORT_AT,
  UNLOCK_AT,
  coverage,
  isComfortable,
  isUnlocked,
  knownLemmas,
} from "../coverage";
import { makeCard } from "./helpers";

const NOW = Date.parse("2026-06-01T10:00:00Z");

describe("knownLemmas", () => {
  it("nimmt gefestigte Karten auf, unabhängig von der Box", () => {
    const known = knownLemmas([makeCard({ id: "a", swahili: "soko", box: 1, maturedAt: NOW })]);
    expect(known.has("soko")).toBe(true);
  });

  it("nimmt Karten ab Box 3 auf", () => {
    const known = knownLemmas([
      makeCard({ id: "a", swahili: "soko", box: 2 }),
      makeCard({ id: "b", swahili: "duka", box: 3 }),
    ]);
    expect(known.has("soko")).toBe(false);
    expect(known.has("duka")).toBe(true);
  });

  it("nimmt Karten mit einer Woche Stabilität auf", () => {
    const fsrs = {
      stability: 9,
      difficulty: 5,
      reps: 3,
      lapses: 0,
      state: "review" as const,
      due: NOW,
    };
    const known = knownLemmas([makeCard({ id: "a", swahili: "gari", box: 1, fsrs })]);
    expect(known.has("gari")).toBe(true);
  });

  it("normalisiert auf Kleinschreibung und trimmt", () => {
    const known = knownLemmas([makeCard({ id: "a", swahili: " Tanzania ", box: 4 })]);
    expect(known.has("tanzania")).toBe(true);
  });
});

describe("coverage", () => {
  const known = new Set(["kwenda", "soko", "nunua"]);

  it("rechnet den Anteil bekannter Lemmata", () => {
    const res = coverage({ lemmas: ["kwenda", "soko", "nunua", "bei"] }, known);
    expect(res.ratio).toBeCloseTo(0.75);
    expect(res.unknown).toEqual(["bei"]);
  });

  it("zählt Wiederholungen nur einmal", () => {
    // Ohne Dedupe käme hier 4/5 heraus, obwohl der Text zwei Lemmata verlangt.
    const res = coverage({ lemmas: ["soko", "soko", "soko", "soko", "bei"] }, known);
    expect(res.ratio).toBeCloseTo(0.5);
    expect(res.unknown).toEqual(["bei"]);
  });

  it("ignoriert Groß-/Kleinschreibung auf beiden Seiten", () => {
    const res = coverage({ lemmas: ["Kwenda", "SOKO", " Nunua "] }, known);
    expect(res.ratio).toBe(1);
    expect(res.unknown).toEqual([]);
  });

  it("liefert für einen leeren Text volle Abdeckung", () => {
    expect(coverage({ lemmas: [] }, known)).toEqual({ ratio: 1, unknown: [] });
    expect(coverage({ lemmas: ["", "  "] }, known)).toEqual({ ratio: 1, unknown: [] });
  });

  it("liefert bei leerem Wortschatz alles als unbekannt", () => {
    const res = coverage({ lemmas: ["soko", "bei"] }, new Set());
    expect(res.ratio).toBe(0);
    expect(res.unknown).toEqual(["soko", "bei"]);
  });
});

describe("Schwellen", () => {
  it("schaltet ab 95 % frei und wird ab 98 % als flüssig gewertet", () => {
    const at95 = { ratio: UNLOCK_AT, unknown: [] };
    const at98 = { ratio: COMFORT_AT, unknown: [] };
    const below = { ratio: 0.94, unknown: ["bei"] };

    expect(isUnlocked(at95)).toBe(true);
    expect(isComfortable(at95)).toBe(false);
    expect(isComfortable(at98)).toBe(true);
    expect(isUnlocked(below)).toBe(false);
  });
});
