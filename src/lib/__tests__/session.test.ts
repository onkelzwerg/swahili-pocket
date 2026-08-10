import { describe, expect, it } from "vitest";
import { assignModes } from "../session";
import { EXERCISE_MODES } from "../exercises/registry";
import { TYPED_MAX_SHARE } from "../exercises/typed";
import { makeCard } from "./helpers";
import type { VocabEntry } from "../types";

/** Deterministischer RNG (LCG) — der Session-Builder muss gesät testbar sein. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Karte, die für "typed" reif ist und einen Beispielsatz mit dem Wort hat. */
function richCard(id: string, swahili = "soma"): VocabEntry {
  return makeCard({
    id,
    swahili,
    german: `Bedeutung ${id}`,
    box: 3,
    examples: [{ sw: `Ninapenda ${swahili} sana.`, de: "Ich mag es sehr." }],
  });
}

const NO_AUDIO = () => false;

describe("assignModes", () => {
  it("liefert für jede Karte genau einen Modus", () => {
    const cards = [richCard("a"), richCard("b"), richCard("c")];
    const items = assignModes(cards, { vocab: cards, hasAudio: NO_AUDIO, rng: seededRng(1) });
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.card.id)).toEqual(["a", "b", "c"]);
  });

  it("fällt auf flip zurück, wenn kein anderer Modus greift", () => {
    // Box 1, kein Beispielsatz, kein Audio → nur flip ist zulässig.
    const cards = [makeCard({ id: "neu", box: 1, examples: [] })];
    const items = assignModes(cards, { vocab: cards, hasAudio: NO_AUDIO, rng: seededRng(7) });
    expect(items[0].mode).toBe("flip");
  });

  it("verhält sich wie bisher, wenn nur flip aktiv ist (Regressionsschutz)", () => {
    const cards = [richCard("a"), richCard("b"), richCard("c")];
    const items = assignModes(cards, {
      vocab: cards,
      hasAudio: () => true,
      enabledModes: { typed: false, audio: false, cloze: false },
      rng: seededRng(3),
    });
    expect(items.every((i) => i.mode === "flip")).toBe(true);
  });

  it("übt neue Wörter nie im Tipp-Modus", () => {
    const cards = Array.from({ length: 40 }, (_, i) =>
      makeCard({ id: `n${i}`, box: 1, examples: [] }),
    );
    const items = assignModes(cards, { vocab: cards, hasAudio: NO_AUDIO, rng: seededRng(11) });
    expect(items.some((i) => i.mode === "typed")).toBe(false);
  });

  it("begrenzt den Tipp-Modus hart auf seinen Session-Anteil", () => {
    const cards = Array.from({ length: 20 }, (_, i) => richCard(`c${i}`));
    // Nur typed und flip zulassen — ohne Deckel würde typed (Gewicht 2)
    // klar überwiegen.
    const items = assignModes(cards, {
      vocab: cards,
      hasAudio: NO_AUDIO,
      enabledModes: { cloze: false, audio: false },
      rng: seededRng(42),
    });
    const typed = items.filter((i) => i.mode === "typed").length;
    expect(typed).toBeLessThanOrEqual(Math.floor(20 * TYPED_MAX_SHARE));
    expect(typed).toBeGreaterThan(0);
  });

  it("wählt audio nur mit verfügbarer Sprachausgabe", () => {
    const cards = Array.from({ length: 12 }, (_, i) => richCard(`c${i}`, `neno${i}`));
    const withoutAudio = assignModes(cards, {
      vocab: cards,
      hasAudio: NO_AUDIO,
      rng: seededRng(5),
    });
    expect(withoutAudio.some((i) => i.mode === "audio")).toBe(false);

    const withAudio = assignModes(cards, {
      vocab: cards,
      hasAudio: () => true,
      enabledModes: { typed: false, cloze: false },
      rng: seededRng(5),
    });
    expect(withAudio.some((i) => i.mode === "audio")).toBe(true);
  });

  it("wählt cloze nur bei passendem Beispielsatz", () => {
    const cards = Array.from({ length: 12 }, (_, i) =>
      makeCard({
        id: `c${i}`,
        swahili: "soma",
        box: 3,
        examples: [{ sw: "Hakuna mfano hapa.", de: "Kein Beispiel." }],
      }),
    );
    const items = assignModes(cards, {
      vocab: cards,
      hasAudio: NO_AUDIO,
      enabledModes: { typed: false, audio: false },
      rng: seededRng(9),
    });
    expect(items.every((i) => i.mode === "flip")).toBe(true);
  });

  it("ist bei gleichem Seed reproduzierbar", () => {
    const cards = Array.from({ length: 15 }, (_, i) => richCard(`c${i}`, `neno${i}`));
    const opts = { vocab: cards, hasAudio: () => true };
    const a = assignModes(cards, { ...opts, rng: seededRng(2026) }).map((i) => i.mode);
    const b = assignModes(cards, { ...opts, rng: seededRng(2026) }).map((i) => i.mode);
    expect(a).toEqual(b);
  });

  it("mischt tatsächlich mehrere Modi", () => {
    const cards = Array.from({ length: 30 }, (_, i) => richCard(`c${i}`, `neno${i}`));
    const items = assignModes(cards, {
      vocab: cards,
      hasAudio: () => true,
      rng: seededRng(2027),
    });
    expect(new Set(items.map((i) => i.mode)).size).toBeGreaterThanOrEqual(3);
  });
});

describe("EXERCISE_MODES", () => {
  it("enthält alle vier Modi genau einmal", () => {
    expect(EXERCISE_MODES.map((m) => m.id).sort()).toEqual(["audio", "cloze", "flip", "typed"]);
  });
});
