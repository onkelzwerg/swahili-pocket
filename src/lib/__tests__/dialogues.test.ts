import { describe, expect, it } from "vitest";
import {
  buildDialogueList,
  choicePointCount,
  isPlayable,
  orderedChoices,
  playableSpeakers,
} from "../dialogues";
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

  it("nimmt mitspielbar aus dem Index statt 23 Dateien zu laden", () => {
    // Seit W4.5 stehen die Entscheidungspunkte in der JSON-Datei, nicht am Zug.
    // Für ein Abzeichen in der Liste reicht die Zahl aus dem Index.
    const list = buildDialogueList(
      [dialogue({ id: "still" }), dialogue({ id: "play" })],
      metaMap(
        meta({ id: "still", lemmas: [], choicePoints: 0 }),
        meta({ id: "play", lemmas: [], choicePoints: 3 }),
      ),
      [],
    );
    expect(list.map((i) => [i.dialogue.id, i.playable])).toEqual([
      ["still", false],
      ["play", true],
    ]);
  });
});

describe("Entscheidungspunkte", () => {
  const choices = {
    "0": [
      { sw: "Habari", de: "Hallo", correct: true },
      { sw: "Kwaheri", de: "Tschüss", correct: false, feedback: "Das ist der Abschied." },
      { sw: "Asante", de: "Danke", correct: false, feedback: "Passt nicht auf die Frage." },
    ],
    "2": [
      { sw: "Bei gani?", de: "Wie teuer?", correct: true },
      { sw: "Ni ghali", de: "Es ist teuer", correct: false, feedback: "Keine Frage." },
      { sw: "Nipe", de: "Gib mir", correct: false, feedback: "Zu früh — erst der Preis." },
    ],
  };
  const d = dialogue({
    turns: [turn({ speaker: "A" }), turn({ speaker: "B" }), turn({ speaker: "A" })],
  });

  it("zählt die Punkte und meldet mitspielbar", () => {
    expect(choicePointCount(choices)).toBe(2);
    expect(isPlayable(choices)).toBe(true);
    expect(choicePointCount(undefined)).toBe(0);
    expect(isPlayable({})).toBe(false);
  });

  it("leitet die spielbaren Rollen aus den Zug-Indizes ab", () => {
    expect(playableSpeakers(d, choices)).toEqual(["A"]);
    expect(playableSpeakers(d, { "1": choices["0"] })).toEqual(["B"]);
  });

  it("überspringt einen Index außerhalb des Dialogs", () => {
    // Der Validator schließt das aus, aber eine veraltete Datei im Cache darf
    // die Rollenwahl nicht sprengen.
    expect(playableSpeakers(d, { "99": choices["0"] })).toEqual([]);
  });

  it("mischt die Optionen stabil und ohne Verlust", () => {
    const first = orderedChoices(choices, 0);
    expect(first).toHaveLength(3);
    expect([...first].map((c) => c.sw).sort()).toEqual(["Asante", "Habari", "Kwaheri"]);
    // Zweimal gerendert heißt zweimal dieselbe Reihenfolge — sonst springt die
    // richtige Antwort bei jedem Fehlversuch.
    expect(orderedChoices(choices, 0)).toEqual(first);
    expect(orderedChoices(choices, 1)).toEqual([]);
  });
});
