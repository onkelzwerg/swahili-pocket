import { describe, expect, it } from "vitest";
import { buildDialogueList, choicePointCount, isPlayable, playableSpeakers } from "../dialogues";
import type { DialogueMeta } from "../dialogue-index";
import type { Dialogue, DialogueTurn } from "../types";
import { makeCard } from "./helpers";

function turn(patch: Partial<DialogueTurn> = {}): DialogueTurn {
  return { speaker: "A", sw: "Habari", de: "Hallo", ...patch };
}

function dialogue(patch: Partial<Dialogue> = {}): Dialogue {
  return {
    id: "d1",
    title: "Sokoni",
    titleDe: "Auf dem Markt",
    emoji: "🛒",
    turns: [turn()],
    ...patch,
  };
}

function meta(patch: Partial<DialogueMeta> = {}): DialogueMeta {
  return {
    id: "d1",
    title: "Sokoni",
    titleDe: "Auf dem Markt",
    level: "beginner",
    lemmas: ["soko", "bei"],
    turnCount: 1,
    wordCount: 6,
    choicePoints: 0,
    playableSpeakers: [],
    hasAudio: false,
    ...patch,
  };
}

function metaMap(...entries: DialogueMeta[]): Map<string, DialogueMeta> {
  return new Map(entries.map((e) => [e.id, e]));
}

/** Karten, die `knownLemmas` als gekonnt wertet (Box 3+). */
function known(...words: string[]) {
  return words.map((w, i) => makeCard({ id: `c${i}`, swahili: w, box: 3 }));
}

describe("buildDialogueList", () => {
  it("rechnet die Abdeckung aus den Lemmata des Index aus", () => {
    const list = buildDialogueList(
      [dialogue()],
      metaMap(meta({ lemmas: ["soko", "bei", "ghali", "mkate"] })),
      known("soko", "bei", "ghali"),
    );
    expect(list[0].cov.ratio).toBeCloseTo(0.75);
    expect(list[0].cov.unknown).toEqual(["mkate"]);
    expect(list[0].unlocked).toBe(false);
  });

  it("schaltet ab 95 % frei — dieselbe Schwelle wie bei Geschichten", () => {
    const lemmas = Array.from({ length: 20 }, (_, i) => `neno${i}`);
    const list = buildDialogueList([dialogue()], metaMap(meta({ lemmas })), known(...lemmas));
    expect(list[0].unlocked).toBe(true);

    const fast = buildDialogueList(
      [dialogue()],
      metaMap(meta({ lemmas })),
      known(...lemmas.slice(0, 18)),
    );
    expect(fast[0].cov.ratio).toBeCloseTo(0.9);
    expect(fast[0].unlocked).toBe(false);
  });

  it("lässt einen Dialog ohne Index-Eintrag offen statt ihn zu sperren", () => {
    // Fehlt die Lemma-Liste, ist 0 % eine Aussage über die Daten, nicht über
    // den Nutzer — ein selbst hinzugefügter Dialog bliebe sonst für immer zu.
    const list = buildDialogueList([dialogue({ id: "eigen" })], metaMap(), []);
    expect(list[0].unlocked).toBe(true);
    expect(list[0].cov.unknown).toEqual([]);
  });

  it("blendet Dialoge ohne aktives Themenpaket ganz aus", () => {
    const dialogues = [dialogue({ id: "kern" }), dialogue({ id: "paket" })];
    const metas = metaMap(
      meta({ id: "kern", lemmas: ["soko"] }),
      meta({ id: "paket", lemmas: ["riba"], requiresPacks: ["geld-und-behoerden"] }),
    );

    expect(
      buildDialogueList(dialogues, metas, known("soko", "riba")).map((i) => i.dialogue.id),
    ).toEqual(["kern"]);
    expect(
      buildDialogueList(dialogues, metas, known("soko", "riba"), ["geld-und-behoerden"]).map(
        (i) => i.dialogue.id,
      ),
    ).toEqual(["kern", "paket"]);
  });

  it("sortiert freigeschaltete nach vorn und knapp verpasste direkt danach", () => {
    const list = buildDialogueList(
      [dialogue({ id: "fern" }), dialogue({ id: "offen" }), dialogue({ id: "knapp" })],
      metaMap(
        meta({ id: "fern", lemmas: ["a", "b", "c", "d"] }),
        meta({ id: "offen", lemmas: ["a", "b"] }),
        meta({ id: "knapp", lemmas: ["a", "b", "c"] }),
      ),
      known("a", "b"),
    );
    expect(list.map((i) => i.dialogue.id)).toEqual(["offen", "knapp", "fern"]);
  });

  it("meldet mitspielbar aus dem Dialog selbst, nicht aus dem Index", () => {
    // Der Index kann veraltet sein; die Entscheidungspunkte liegen am Zug.
    const play = dialogue({
      id: "play",
      turns: [
        turn(),
        turn({
          speaker: "B",
          sw: "Bei gani?",
          choices: [
            { sw: "Bei gani?", de: "Welcher Preis?", correct: true },
            { sw: "Asante", de: "Danke", correct: false, feedback: "Keine Frage." },
          ],
        }),
      ],
    });
    const list = buildDialogueList([play], metaMap(meta({ id: "play", lemmas: [] })), []);
    expect(list[0].playable).toBe(true);
    expect(isPlayable(play)).toBe(true);
    expect(choicePointCount(play)).toBe(1);
    expect(playableSpeakers(play)).toEqual(["B"]);
  });
});
