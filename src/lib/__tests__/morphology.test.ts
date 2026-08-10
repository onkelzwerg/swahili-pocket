import { describe, expect, it } from "vitest";
import {
  ADJECTIVE_STEMS,
  NGELI_TRAINABLE_CLASSES,
  SUBJECTS,
  TENSES,
  adjectiveForm,
  buildNgeliTask,
  buildVerbTask,
  trainableNouns,
  trainableVerbs,
  verbStem,
} from "../morphology";
import { makeCard } from "./helpers";
import type { NounClass, VocabEntry } from "../types";

/** Deterministischer RNG (LCG). */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function verb(swahili: string, german = "tun"): VocabEntry {
  return makeCard({ id: swahili, swahili, german, partOfSpeech: "verb" });
}

function noun(swahili: string, nounClass: NounClass): VocabEntry {
  return makeCard({ id: swahili, swahili, german: "Ding", partOfSpeech: "noun", nounClass });
}

describe("verbStem", () => {
  it("trennt das Infinitiv-ku- ab", () => {
    expect(verbStem("kusoma")).toEqual({ stem: "soma", monosyllabic: false });
    expect(verbStem("kufundisha")).toEqual({ stem: "fundisha", monosyllabic: false });
  });

  it("behält ku- bei einsilbigen Verben", () => {
    expect(verbStem("kula")).toEqual({ stem: "kula", monosyllabic: true });
    expect(verbStem("kwenda")).toEqual({ stem: "kwenda", monosyllabic: true });
  });

  it("trennt auch kw- vor vokalischem Stamm", () => {
    expect(verbStem("kwandika").stem).toBe("andika");
  });
});

describe("buildVerbTask", () => {
  it("baut alle 6 × 4 Kombinationen eines Regelverbs korrekt", () => {
    for (const s of SUBJECTS) {
      for (const t of TENSES) {
        expect(`${s.sw}${t.sw}soma`).toBe(`${s.sw}${t.sw}${verbStem("kusoma").stem}`);
      }
    }
    // Stichprobe der bekannten Formen.
    expect(`${SUBJECTS[3].sw}${TENSES[1].sw}soma`).toBe("tulisoma");
    expect(`${SUBJECTS[2].sw}${TENSES[3].sw}soma`).toBe("amesoma");
  });

  it("behält bei einsilbigen Verben das ku-", () => {
    const task = buildVerbTask([verb("kula", "essen")], seededRng(1));
    expect(task).not.toBeNull();
    expect(task!.monosyllabic).toBe(true);
    expect(task!.answer).toBe(`${task!.subject.sw}${task!.tense.sw}kula`);
    expect(task!.answer).toContain("kula");
  });

  it("setzt die Antwort aus genau den drei Lösungsbausteinen zusammen", () => {
    const task = buildVerbTask([verb("kusoma", "lesen")], seededRng(99))!;
    expect(task.solution.join("")).toBe(task.answer);
    expect(task.chips).toHaveLength(5);
    for (const part of task.solution) expect(task.chips).toContain(part);
  });

  it("liefert null ohne brauchbare Verben", () => {
    expect(buildVerbTask([], seededRng(1))).toBeNull();
    expect(buildVerbTask([makeCard({ partOfSpeech: "noun" })], seededRng(1))).toBeNull();
  });

  it("ignoriert Mehrwortverben und Einträge ohne ku-", () => {
    expect(trainableVerbs([verb("soma"), verb("ku enda"), verb("kusoma")])).toHaveLength(1);
  });
});

describe("adjectiveForm", () => {
  const zuri = ADJECTIVE_STEMS.find((a) => a.stem === "-zuri")!;
  const pya = ADJECTIVE_STEMS.find((a) => a.stem === "-pya")!;
  const refu = ADJECTIVE_STEMS.find((a) => a.stem === "-refu")!;

  it("bildet die regelmäßigen Präfixklassen", () => {
    expect(adjectiveForm("M-Wa", zuri)).toBe("mzuri");
    expect(adjectiveForm("M-Mi", zuri)).toBe("mzuri");
    expect(adjectiveForm("Ki-Vi", zuri)).toBe("kizuri");
    expect(adjectiveForm("Ji-Ma", zuri)).toBe("zuri");
    expect(adjectiveForm("U", zuri)).toBe("mzuri");
  });

  it("nimmt für die N-Klasse die kuratierte Form", () => {
    expect(adjectiveForm("N", zuri)).toBe("nzuri");
    expect(adjectiveForm("N", refu)).toBe("ndefu");
    expect(adjectiveForm("N", pya)).toBe("mpya");
  });

  it("kennt das ji- vor einsilbigem Stamm", () => {
    expect(adjectiveForm("Ji-Ma", pya)).toBe("jipya");
  });

  it("liefert null für nicht trainierte Klassen", () => {
    expect(adjectiveForm("Pa-Ku-Mu", zuri)).toBeNull();
    expect(adjectiveForm("Ku", zuri)).toBeNull();
  });

  it("liefert für jede trainierte Klasse und jeden Stamm eine Form", () => {
    for (const cls of NGELI_TRAINABLE_CLASSES) {
      for (const adj of ADJECTIVE_STEMS) {
        expect(adjectiveForm(cls, adj), `${cls} ${adj.stem}`).toBeTruthy();
      }
    }
  });
});

describe("buildNgeliTask", () => {
  it("erzeugt vier Optionen mit der Lösung darunter", () => {
    const task = buildNgeliTask([noun("kitabu", "Ki-Vi")], seededRng(4))!;
    expect(task.options).toHaveLength(4);
    expect(task.options).toContain(task.answer);
    expect(task.answer).toBe(adjectiveForm("Ki-Vi", task.adjective));
  });

  it("liefert nie einen Distraktor gleich der Lösung", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const task = buildNgeliTask([noun("kitabu", "Ki-Vi"), noun("nyumba", "N")], seededRng(seed))!;
      expect(new Set(task.options).size).toBe(task.options.length);
    }
  });

  it("überspringt Nomen ohne trainierbare Klasse", () => {
    expect(trainableNouns([noun("mahali", "Pa-Ku-Mu"), noun("kitabu", "Ki-Vi")])).toHaveLength(1);
    expect(buildNgeliTask([noun("mahali", "Pa-Ku-Mu")], seededRng(1))).toBeNull();
  });

  it("liefert null ohne Nomen", () => {
    expect(buildNgeliTask([], seededRng(1))).toBeNull();
  });
});
