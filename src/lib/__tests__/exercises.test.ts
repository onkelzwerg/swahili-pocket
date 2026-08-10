import { describe, expect, it } from "vitest";
import { makeCloze } from "../exercises/cloze";
import { pickDistractors, hasEnoughDistractors } from "../exercises/audio";
import { isTypedReady } from "../exercises/typed";
import { makeCard } from "./helpers";

describe("makeCloze", () => {
  it("baut eine Lücke aus dem ersten passenden Beispielsatz", () => {
    const card = makeCard({
      swahili: "soko",
      examples: [
        { sw: "Hakuna neno hapa.", de: "Nichts hier." },
        { sw: "Ninakwenda soko kesho.", de: "Ich gehe morgen zum Markt." },
      ],
    });
    const cloze = makeCloze(card);
    expect(cloze).not.toBeNull();
    expect(cloze!.before).toBe("Ninakwenda ");
    expect(cloze!.answer).toBe("soko");
    expect(cloze!.after).toBe(" kesho.");
    expect(cloze!.de).toBe("Ich gehe morgen zum Markt.");
  });

  it("verlangt ein eigenständiges Token, keine Teilzeichenkette", () => {
    const card = makeCard({
      swahili: "soko",
      examples: [{ sw: "Sokoni kuna watu wengi.", de: "Auf dem Markt sind viele Leute." }],
    });
    expect(makeCloze(card)).toBeNull();
  });

  it("erkennt das Wort unabhängig von Groß-/Kleinschreibung", () => {
    const card = makeCard({
      swahili: "karibu",
      examples: [{ sw: "Karibu nyumbani!", de: "Willkommen zu Hause!" }],
    });
    expect(makeCloze(card)?.answer).toBe("Karibu");
  });

  it("behandelt Apostrophe als Wortbestandteil", () => {
    const card = makeCard({
      swahili: "ng'ombe",
      examples: [{ sw: "Ninaona ng'ombe shambani.", de: "Ich sehe eine Kuh auf dem Feld." }],
    });
    expect(makeCloze(card)?.answer).toBe("ng'ombe");
  });

  it("lehnt Mehrwortausdrücke ab", () => {
    const card = makeCard({
      swahili: "habari gani",
      examples: [{ sw: "Habari gani leo?", de: "Wie geht es heute?" }],
    });
    expect(makeCloze(card)).toBeNull();
  });

  it("liefert null ohne Beispielsätze", () => {
    expect(makeCloze(makeCard({ examples: [] }))).toBeNull();
  });
});

describe("pickDistractors", () => {
  const target = makeCard({ id: "t", swahili: "mtoto", german: "Kind", partOfSpeech: "noun" });
  const vocab = [
    target,
    makeCard({ id: "n1", german: "Haus", partOfSpeech: "noun" }),
    makeCard({ id: "n2", german: "Buch", partOfSpeech: "noun" }),
    makeCard({ id: "n3", german: "Wasser", partOfSpeech: "noun" }),
    makeCard({ id: "v1", german: "lesen", partOfSpeech: "verb" }),
  ];

  it("liefert nie die richtige Antwort", () => {
    const d = pickDistractors(target, vocab);
    expect(d.some((c) => c.id === target.id)).toBe(false);
  });

  it("liefert keine Duplikate", () => {
    const d = pickDistractors(target, vocab);
    expect(new Set(d.map((c) => c.id)).size).toBe(d.length);
  });

  it("bevorzugt die gleiche Wortart", () => {
    const d = pickDistractors(target, vocab);
    expect(d.every((c) => c.partOfSpeech === "noun")).toBe(true);
  });

  it("schließt gleiche Bedeutungen aus", () => {
    const withDuplicate = [...vocab, makeCard({ id: "dup", german: "Kind", partOfSpeech: "noun" })];
    const d = pickDistractors(target, withDuplicate);
    expect(d.some((c) => c.german === "Kind")).toBe(false);
  });

  it("füllt bei zu wenig gleicher Wortart mit anderen auf", () => {
    const small = [
      target,
      makeCard({ id: "n1", german: "Haus", partOfSpeech: "noun" }),
      makeCard({ id: "v1", german: "lesen", partOfSpeech: "verb" }),
      makeCard({ id: "v2", german: "essen", partOfSpeech: "verb" }),
    ];
    expect(pickDistractors(target, small)).toHaveLength(3);
  });

  it("meldet zu kleinen Bestand", () => {
    expect(hasEnoughDistractors(target, [target, vocab[1]])).toBe(false);
    expect(hasEnoughDistractors(target, vocab)).toBe(true);
  });
});

describe("isTypedReady", () => {
  it("lässt neue Karten nicht zu", () => {
    expect(isTypedReady(makeCard({ box: 1 }))).toBe(false);
  });

  it("lässt ab Box 2 zu", () => {
    expect(isTypedReady(makeCard({ box: 2 }))).toBe(true);
  });

  it("akzeptiert alternativ ausreichende FSRS-Stabilität", () => {
    const card = makeCard({
      box: 1,
      fsrs: { stability: 4, difficulty: 5, reps: 3, lapses: 0, state: "review", due: 0 },
    });
    expect(isTypedReady(card)).toBe(true);
  });
});
