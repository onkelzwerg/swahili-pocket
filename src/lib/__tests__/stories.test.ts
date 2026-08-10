import { describe, expect, it } from "vitest";
import {
  buildStoryList,
  groupStorySegments,
  splitStoryText,
  storyTokens,
  type StoryIndex,
  type StoryMeta,
} from "../stories";
import { makeCard } from "./helpers";

const NOW = Date.parse("2026-06-01T10:00:00Z");

describe("splitStoryText", () => {
  it("trennt Wörter von Satzzeichen und behält die Reihenfolge", () => {
    const segments = splitStoryText("Leo, Neema alikwenda!");
    expect(segments.map((s) => s.text).join("")).toBe("Leo, Neema alikwenda!");
    expect(segments.filter((s) => s.word).map((s) => s.word)).toEqual([
      "leo",
      "neema",
      "alikwenda",
    ]);
  });

  it("hält ein inneres Apostroph im Wort", () => {
    // ng'ombe ist ein Wort, nicht zwei — sonst fände der Reader kein Gloss.
    expect(storyTokens("Ng'ombe wanakula.")).toEqual(["ng'ombe", "wanakula"]);
  });

  it("nimmt ein Anführungszeichen am Wortrand nicht mit ins Wort", () => {
    expect(storyTokens("'Habari' ni salamu.")).toEqual(["habari", "ni", "salamu"]);
  });

  it("liefert für Text ohne Buchstaben keine Wörter", () => {
    expect(storyTokens("… — !")).toEqual([]);
  });
});

describe("groupStorySegments", () => {
  it("hält Wort und folgendes Satzzeichen in einer Gruppe", () => {
    // Sonst darf der Browser zwischen „moja" und „." umbrechen.
    const groups = groupStorySegments("saa moja.");
    expect(groups.map((g) => g.map((s) => s.text).join(""))).toEqual(["saa", " ", "moja."]);
  });

  it("trennt an einem Leerzeichen hinter einem Komma", () => {
    const groups = groupStorySegments("samaki, nyanya");
    expect(groups.map((g) => g.map((s) => s.text).join(""))).toEqual(["samaki,", " ", "nyanya"]);
  });

  it("verliert kein Zeichen", () => {
    const text = "Kila jioni familia inakula pamoja. Chakula ni kizuri sana.";
    expect(
      groupStorySegments(text)
        .flat()
        .map((s) => s.text)
        .join(""),
    ).toBe(text);
  });
});

function meta(patch: Partial<StoryMeta> = {}): StoryMeta {
  return {
    id: "s1",
    title: "Hadithi",
    titleDe: "Geschichte",
    band: 1,
    topic: "Markt",
    emoji: "📖",
    lemmas: ["soko", "bei"],
    newLemmas: [],
    wordCount: 40,
    hasAudio: false,
    ...patch,
  };
}

function index(...stories: StoryMeta[]): StoryIndex {
  return { version: 1, stories };
}

/** Karten, die `knownLemmas` als gekonnt wertet (Box 3+). */
function known(...words: string[]) {
  return words.map((w, i) => makeCard({ id: `c${i}`, swahili: w, box: 3 }));
}

describe("buildStoryList", () => {
  it("rechnet die Abdeckung je Geschichte aus", () => {
    const list = buildStoryList(
      index(meta({ id: "a", lemmas: ["soko", "bei", "ghali", "mkate"] })),
      known("soko", "bei", "ghali"),
      {},
    );
    expect(list[0].cov.ratio).toBeCloseTo(0.75);
    expect(list[0].cov.unknown).toEqual(["mkate"]);
    expect(list[0].unlocked).toBe(false);
  });

  it("schaltet ab 95 % frei", () => {
    const lemmas = Array.from({ length: 20 }, (_, i) => `neno${i}`);
    const list = buildStoryList(index(meta({ lemmas })), known(...lemmas.slice(0, 19)), {});
    expect(list[0].cov.ratio).toBeCloseTo(0.95);
    expect(list[0].unlocked).toBe(true);
  });

  it("sortiert freigeschaltete nach vorn und knapp verpasste direkt danach", () => {
    const list = buildStoryList(
      index(
        meta({ id: "fern", lemmas: ["a", "b", "c", "d"] }),
        meta({ id: "offen", lemmas: ["a", "b"] }),
        meta({ id: "knapp", lemmas: ["a", "b", "c"] }),
      ),
      known("a", "b"),
      {},
    );
    expect(list.map((i) => i.meta.id)).toEqual(["offen", "knapp", "fern"]);
  });

  it("schiebt Gelesenes ans Ende, auch wenn es perfekt passt", () => {
    const list = buildStoryList(
      index(
        meta({ id: "gelesen", lemmas: ["a"] }),
        meta({ id: "neu", lemmas: ["a", "b", "c", "d"] }),
      ),
      known("a"),
      { gelesen: NOW },
    );
    expect(list.map((i) => i.meta.id)).toEqual(["neu", "gelesen"]);
    expect(list[1].readAt).toBe(NOW);
  });
});
